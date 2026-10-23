import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('js/games/hide.js');
const ctx=vm.createContext({GAMES:{}});vm.runInContext(source,ctx);
for(let L=2;L<=30;L++){
  const kittens=L<4?2:L<6?3:L<8?4:L<10?5:6;
  assert.equal(ctx.hideLevel(L).kittens,kittens);assert.equal(ctx.hideLevel(L).spots,kittens*2);
  for(const landscape of [false,true]){
    const boxes=ctx.hideLayout(L,landscape);assert.equal(boxes.length,kittens*2);
    for(const a of boxes){
      assert.ok(a.x>=0&&a.y>=0&&a.x+a.w<=100&&a.y+a.h<=100);
      for(const b of boxes)if(a!==b)assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,`Overlap at L=${L}`);
    }
    // Actual SE portrait and iPad landscape scene budgets, including header/counter.
    const [w,h]=landscape?[994,620]:[345,511];
    assert.ok(boxes[0].w*w/100>=44&&boxes[0].h*h/100>=44);
  }
}
class Element{
  constructor(cls=''){
    this.className=cls;this.children=[];this.events={};this.attrs={};this.connected=true;
    this.clientWidth=345;this.clientHeight=511;
    this.style={setProperty:(k,v)=>{this.style[k]=v}};
    this.classList={contains:n=>this.className.split(' ').includes(n),add:n=>{this.className+=' '+n},remove:n=>{this.className=this.className.split(' ').filter(c=>c!==n).join(' ')}};
  }
  get isConnected(){return this.connected&&(!this.parent||this.parent.isConnected)}
  append(...children){for(const child of children){child.parent=this;this.children.push(child)}}
  setAttribute(k,v){this.attrs[k]=v}
  addEventListener(n,fn){this.events[n]=fn}
  click(){this.events.click?.()}
}
function setup(L){
  const stage=new Element(),timers=[],speech=[];let hint,completed=0,stops=0,oks=0,soft=0;
  const ctx=vm.createContext({GAMES:{},gen:5,NUMS:['一','兩','三','四','五','六'],
    document:{createElement:()=>new Element()},div:c=>new Element(c),art:id=>`[${id}]`,
    shuffle:a=>a.slice(),pick:(a,n)=>a.slice(0,n),say:s=>speech.push(s),tone:()=>soft++,sfx:{ok:()=>oks++},
    idleHint:fn=>{hint=fn;return ()=>stops++},setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length}
  });
  vm.runInContext(source,ctx);const resize=ctx.GAMES.hide(stage,L,()=>completed++);resize();
  const [counter,scene]=stage.children[0].children;
  const flush=()=>{while(timers.length)timers.shift().fn()};
  return {ctx,stage,counter,scene,speech,timers,flush,resize,hint:()=>hint(),completed:()=>completed,stops:()=>stops,oks:()=>oks,soft:()=>soft};
}
for(const L of [2,3,4,5,6,7,8,9,10,14]){
  const t=setup(L),k=ctx.hideLevel(L).kittens;
  assert.equal(t.speech[0],`找出${k===2?'兩':['','','','三','四','五','六'][k]}隻小貓`);
  assert.equal(t.counter.children.length,k);assert.equal(t.scene.children.length,k*2);
  const empty=t.scene.children[k];empty.click();empty.click();assert.equal(t.soft(),2);assert.equal(t.oks(),0);
  assert.equal(t.hint().tap,t.scene.children[0]);
  for(let i=0;i<k;i++){
    const button=t.hint().tap;
    assert.ok(button.children[0].className.includes('hide-peek'));
    button.click();button.click();assert.equal(t.oks(),i+1);
    assert.equal(button.children.at(-1).hidden,false);
    assert.ok(t.counter.children[i].classList.contains('filled'));
    // Flush just the count; final celebration stays pending.
    t.timers.shift().fn();assert.equal(t.speech.at(-1),i===1?'二':['一','兩','三','四','五','六'][i]);
  }
  assert.ok(!t.hint());assert.equal(t.stops(),1);assert.equal(t.completed(),0);
  t.scene.children.forEach(b=>b.click());assert.equal(t.oks(),k);
  const final=t.timers[0];t.flush();assert.equal(t.completed(),1);final.fn();t.flush();assert.equal(t.completed(),1);
  assert.ok(t.speech.includes('全部找到了！'));
  t.scene.clientWidth=994;t.scene.clientHeight=620;t.resize();
  assert.equal(t.scene.children[0].style.width,ctx.hideLayout(L,true)[0].w+'%');
}
for(const stale of ['generation','detached']){
  const t=setup(2);t.hint().tap.click();t.hint().tap.click();
  if(stale==='generation')t.ctx.gen++;else t.stage.connected=false;
  const n=t.speech.length;t.flush();assert.equal(t.completed(),0);assert.equal(t.speech.length,n);assert.ok(!t.hint());
  t.scene.children.at(-1).click();assert.equal(t.soft(),0);
}
{
  const t=setup(4);t.hint().tap.click();t.hint().tap.click();t.hint().tap.click();t.flush();
  assert.equal(t.speech.filter(s=>s==='一'||s==='二').length,0,'Rapid taps cannot emit stale counts');
  assert.equal(t.completed(),1);
}
vm.runInContext(read('js/assets.js'),ctx);
const assets=vm.runInContext('ASSETS',ctx);
for(const id of ['bush','flower_pot','box','basket','tree_trunk','curtain','slide','sofa','barrel','umbrella',
  ...['white','gray','black','calico','orange'].flatMap(c=>['kitten_peek_head_'+c,'kitten_full_'+c]),
  ...['gray','black','orange'].map(c=>'kitten_tail_'+c)]){
  assert.equal(assets[id].img,`assets/game/hide/${id}.webp`);assert.ok(assets[id].emoji);
}
console.log('Hide tests passed: all level counts, bounded nonoverlapping layouts, resize, hints, empty/repeated taps, speech, completion once, and stale callbacks.');
