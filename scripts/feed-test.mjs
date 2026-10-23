import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Exercise round state and callbacks without adding a browser dependency.
class Element {
  constructor(){
    this.children=[];this.events={};this.className='';this.innerHTML='';this.isConnected=true;
    this.style={setProperty(){}};
    this.classList={
      add:name=>{if(!this.classList.contains(name))this.className+=' '+name},
      remove:name=>{this.className=this.className.split(' ').filter(c=>c!==name).join(' ')},
      contains:name=>this.className.split(' ').includes(name)
    };
  }
  append(...children){this.children.push(...children)}
  replaceChildren(...children){this.children=children}
  setAttribute(){}
  addEventListener(name,fn){this.events[name]=fn}
  click(){this.events.click()}
}
function setup(L,random){
  let now=0,completed=0;
  const timers=[],spoken=[],stage=new Element();
  const context=vm.createContext({
    Math:Object.assign(Object.create(Math),{random:()=>random}),
    GAMES:{},idleHint(){},document:{createElement:()=>new Element()},
    div:cls=>Object.assign(new Element(),{className:cls}),
    art:id=>`<span>${id}</span>`,
    NUMS:['一','兩','三','四','五','六','七'],say:text=>spoken.push(text),
    sfx:{ok(){},pop(){}},tone(){},buzz(){},sizeFor:()=>77,
    hitTarget:(_targets,x)=>x===1,
    makeDraggable:(el,drop)=>{el.drop=(hit=true)=>{
      const accepted=drop(el,hit?1:0,0);
      if(accepted)el.classList.add('placed');
      return accepted;
    }},
    setTimeout:(fn,ms)=>timers.push({fn,at:now+ms})
  });
  vm.runInContext(readFileSync(new URL('../js/games/feed.js',import.meta.url),'utf8'),context);
  context.GAMES.feed(stage,L,()=>completed++)();
  const root=stage.children[0],[top,bowl,pile]=root.children;
  const [ruby,request,bell]=top.children,bowlFish=bowl.children[0];
  const needed=(request.innerHTML.match(/<span>/g)||[]).length;
  const advance=ms=>{
    const end=now+ms;
    while(true){
      timers.sort((a,b)=>a.at-b.at);
      if(!timers.length||timers[0].at>end)break;
      const timer=timers.shift();now=timer.at;timer.fn();
    }
    now=end;
  };
  return {root,ruby,bell,bowlFish,pile,needed,spoken,advance,completed:()=>completed};
}
for(const L of [0,1,2,4,5,9])for(const random of [0,.25,.5,.999999]){
  const t=setup(L,random),guided=L<5;
  assert.ok(t.needed>=(L<2?1:L<5?2:3)&&t.needed<=(L<2?3:5));
  assert.ok(t.pile.children.length>t.needed&&t.pile.children.length<=t.needed+3);
  assert.equal(t.bowlFish.children.length,L<2?t.needed:0);
  t.advance(1000);
  assert.match(t.spoken.at(-1),/^露比想吃[一兩三四五]條魚/);
  assert.equal(t.pile.children[0].drop(false),false,'Missed bowl must not consume fish');
  if(!guided){
    t.ruby.click();assert.match(t.spoken.at(-1),/^還要再/);
  }
  for(let i=0;i<t.needed;i++)assert.equal(t.pile.children[i].drop(),true);
  assert.equal(t.pile.children[0].drop(),false,'One piece cannot be counted twice');
  assert.equal(t.spoken.at(-1),['一','二','三','四','五'][t.needed-1]);
  if(guided){
    assert.equal(t.pile.children[t.needed].drop(),false,'Auto-complete must lock immediately');
  }else{
    t.advance(2500);assert.equal(t.completed(),0,'Advanced rounds require confirmation');
    assert.equal(t.pile.children[t.needed].drop(),true);
    t.bell.click();assert.equal(t.spoken.at(-1),'太多了，拿回去一條');
    t.bowlFish.children[0].click();
    assert.equal(t.pile.children[0].classList.contains('placed'),false);
    t.bowlFish.children[0].click();
    t.ruby.click();assert.equal(t.spoken.at(-1),'還要再一條');
    assert.equal(t.pile.children[0].drop(),true,'Removed fish can be fed again');
    t.bell.click();t.ruby.click();
  }
  t.advance(2500);
  assert.ok(t.spoken.includes('好好吃！謝謝你！'));
  assert.equal(t.completed(),1,'A round awards exactly once');
}
const eight=setup(5,.999999);
eight.pile.children.forEach(fish=>fish.drop());
assert.equal(eight.spoken.at(-1),'八','All eight surplus fish can be counted');
assert.equal(eight.bowlFish.children.length,8);
const stale=setup(0,0);
stale.pile.children[0].drop();stale.root.isConnected=false;stale.advance(5000);
assert.equal(stale.completed(),0,'Leaving the game cancels pending completion');
assert.deepEqual(stale.spoken,['一'],'Leaving the game cancels pending speech');
console.log('Feed tests passed: level ranges, surplus, counting, corrections, completion, and stale timers.');
