import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
class Element{
  constructor(cls=''){
    this.className=cls;this.children=[];this.events={};this.dataset={};this.connected=true;
    this.style={setProperty:(k,v)=>{this.style[k]=v}};
    this.classList={contains:n=>this.className.split(' ').includes(n),
      add:n=>{if(!this.classList.contains(n))this.className+=' '+n},
      remove:n=>{this.className=this.className.split(' ').filter(c=>c!==n).join(' ')}};
  }
  get isConnected(){return this.connected&&(!this.parent||this.parent.isConnected)}
  get firstElementChild(){return this.children[0]}
  set innerHTML(s){this.markup=s;for(const c of this.children)c.connected=false;this.children=[]}
  get innerHTML(){return this.markup||''}
  append(...cs){for(const c of cs){c.parent=this;this.children.push(c)}}
  replaceChildren(...cs){this.innerHTML='';this.append(...cs)}
  remove(){this.connected=false;if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this)}
  setAttribute(){}
  addEventListener(n,f){(this.events[n]??=new Set()).add(f)}
  removeEventListener(n,f){this.events[n]?.delete(f)}
  fire(n){for(const f of this.events[n]||[])f()}
  click(){this.fire('click')}
  getBoundingClientRect(){return {left:20,top:40,width:200,height:200,right:220,bottom:240}}
  querySelectorAll(){return Array.from({length:10},()=>new Element())}
}
function clock(){
  let now=0,id=0;const timers=new Map();
  return {timers,setTimeout(fn,ms){timers.set(++id,{fn,at:now+ms});return id},clearTimeout(i){timers.delete(i)},
    advance(ms){const end=now+ms;while(true){const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;timers.delete(next[0]);now=next[1].at;next[1].fn()}now=end}};
}
const core=read('js/core.js'),hintCode=core.slice(core.indexOf('// Hints demonstrate'),core.indexOf('let comfortPeek='));
function setup(diff=0,reduceMotion=false){
  const time=clock(),stage=new Element(),body=new Element(),observers=[];
  stage.append(new Element());
  const ctx=vm.createContext({...time,stage,diff,reduceMotion,gen:1,document:{body},
    div:cls=>new Element(cls),art:id=>id,
    requestAnimationFrame:fn=>time.setTimeout(fn,16),cancelAnimationFrame:time.clearTimeout,
    MutationObserver:class{constructor(fn){this.fn=fn;observers.push(this)}observe(){}disconnect(){this.disconnected=true}}
  });
  vm.runInContext(hintCode,ctx);
  return {ctx,stage,body,observers,...time};
}
for(const diff of [0,1]){
  const t=setup(diff);let calls=0;
  const from=t.stage.firstElementChild,to=new Element();
  const stop=t.ctx.idleHint(()=>{calls++;return {from,to}});
  t.advance(4999);assert.equal(calls,0);t.advance(1);assert.equal(calls,1);
  assert.equal(t.body.children.length,1);assert.equal(t.body.children[0].innerHTML,'hint_paw');
  assert.equal(t.body.children[0].style['--hx'],'120px');
  t.advance(7999);assert.equal(calls,1);t.advance(1);assert.equal(calls,2);
  t.stage.fire('pointerdown');assert.equal(t.body.children.length,0,'Input cancels a live demonstration');
  t.advance(3000);t.stage.fire('pointerdown');t.advance(4999);assert.equal(calls,2);
  t.advance(1);assert.equal(calls,3);stop();stop();t.advance(30000);assert.equal(calls,3);
  assert.equal(t.timers.size,0);assert.equal(t.stage.events.pointerdown.size,0);
}
{
  const t=setup(2);t.ctx.idleHint(()=>assert.fail('Challenge must not hint'));t.advance(30000);assert.equal(t.timers.size,0);
}
for(const stale of ['generation','clear','stop']){
  const t=setup();let calls=0;t.ctx.idleHint(()=>{calls++;return {tap:t.stage.firstElementChild}});
  if(stale==='generation')t.ctx.gen++;
  if(stale==='clear'){t.stage.innerHTML='';t.observers[0].fn();assert.ok(t.observers[0].disconnected)}
  if(stale==='stop')t.ctx.stopHints();
  t.advance(30000);assert.equal(calls,0);assert.equal(t.timers.size,0);
}
for(const reduced of [false,true]){
  const t=setup(0,reduced),from=new Element(),to=new Element();
  t.ctx.hintDrag(from,to);assert.equal(t.body.children[0].classList.contains('hint-still'),reduced);
  to.connected=false;t.advance(16);assert.equal(t.body.children.length,0);assert.equal(t.timers.size,0);
  t.ctx.hintDrag(from,to);assert.equal(t.body.children.length,0,'Detached destination aborts before rendering');
  t.ctx.hintTap(from);assert.equal(t.body.children[0].style['--hx'],t.body.children[0].style['--tx']);
  t.advance(2200);assert.equal(t.body.children.length,0);assert.equal(t.timers.size,0);
}
// Use the actual lifecycle functions with the actual helper, including delayed round changes.
{
  const t=setup(),screens=Object.fromEntries(['home','game','house','progress','cheer','cheerEmoji','starCount'].map(k=>['#'+k,new Element()]));
  Object.assign(t.ctx,{$:s=>s==='#stage'?t.stage:screens[s],resetHomeRubyIdle(){},paintHomeRuby(){},
    renderStaticArt(){},stars:0,store:{set(){}},say(){},hushVoice(){},sfx:{win(){}},pick:a=>a.slice(0,1),PRAISE:['yay'],
    PROMPTS:{},PROMPT_EVERY_ROUND:{},document:{body:t.body,createElement:()=>new Element()},
    requestAnimationFrame:fn=>t.setTimeout(fn,16),art:()=>'',confetti(){}});
  const main=read('js/main.js');
  vm.runInContext(main.slice(main.indexOf('/* ---------- 流程'),main.indexOf("document.querySelectorAll('.game-btn")),t.ctx);
  vm.runInContext(`GAMES={test(stage,L,done){stage.append(new Element());idleHint(()=>{hintCalls++;return {tap:stage.firstElementChild}});return ()=>{}}}`,Object.assign(t.ctx,{Element,hintCalls:0}));
  t.ctx.startGame('test');t.advance(16);t.ctx.roundDone();t.advance(3000);assert.equal(t.ctx.hintCalls,0);
  t.advance(5000);assert.equal(t.ctx.hintCalls,1,'Next round gets a fresh timer');
  t.ctx.goHome();t.advance(30000);assert.equal(t.ctx.hintCalls,1);assert.equal(t.body.children.length,0);
  t.ctx.startGame('test');t.ctx.goHome();t.advance(30000);assert.equal(t.ctx.hintCalls,1,'Leaving before the first animation frame must cancel round creation');
}
function game(name,L,random=.4){
  const stage=new Element(),time=clock();let getPair,finished=0,wrong=0;
  const ctx=vm.createContext({...time,GAMES:{},round:0,diff:0,
    Math:Object.assign(Object.create(Math),{random:()=>random}),
    document:{createElement:()=>new Element()},div:c=>new Element(c),
    idleHint:fn=>{getPair=fn},art:id=>`[${id}]`,pick:(a,n)=>a.slice(0,n),shuffle:a=>a.slice().reverse(),
    sfx:{ok(){},pop(){}},say(){},tone(){},buzz(){},wrong(){wrong++},sizeFor:()=>80,
    makeDraggable:(el,drop)=>{el.drop=to=>{ctx.destination=to;const r=to.getBoundingClientRect();const ok=drop(el,r.left+r.width/2,r.top+r.height/2);if(ok)el.classList.add('placed');return ok}},
    hitTarget:targets=>targets.find(t=>t===ctx.destination)
  });
  vm.runInContext(read('js/assets.js')+'\n'+read('js/data.js')+'\n'+read('js/games/'+name+'.js'),ctx);
  // Stub art only after data registration, so markup exposes the selected ids.
  vm.runInContext('art=id=>`[${id}]`',ctx);
  ctx.GAMES[name](stage,L,()=>finished++);
  return {ctx,stage,pair:()=>getPair(),...time,finished:()=>finished,wrong:()=>wrong};
}
for(const L of [0,2,4,6])for(const name of ['shadow','color','size','puzzle']){
  const t=game(name,L);let moves=0,prevRank=-1;
  while(t.pair()){
    const {from,to}=t.pair();assert.ok(from?.isConnected&&to?.isConnected,name);
    assert.ok(!from.classList.contains('placed'));
    if(name==='size'){assert.ok(+to.dataset.rank>prevRank);prevRank=+to.dataset.rank;assert.equal(from.style['--k'],to.style['--k'])}
    if(name==='puzzle'){
      assert.equal(from.style.backgroundPosition,to.style.backgroundPosition);
      const layout=t.ctx.puzzleLayout(L),index=to.parent.children.indexOf(to)-1;
      const r=to.parent.getBoundingClientRect();
      // Each cell has its own browser rect; simulate the matching board coordinates.
      to.getBoundingClientRect=()=>({left:r.left+(index%layout.cols)*r.width/layout.cols,top:r.top+Math.floor(index/layout.cols)*r.height/layout.rows,width:r.width/layout.cols,height:r.height/layout.rows});
    }
    assert.equal(from.drop(to),true,`${name}: demonstrated drop must succeed`);
    assert.ok(++moves<=12);
  }
  t.advance(2500);assert.equal(t.finished(),1,name);assert.equal(t.wrong(),0,name);
}
for(const L of [0,2,5,9]){
  const t=game('feed',L),root=t.stage.firstElementChild,[top,mid,pile]=root.children,bowl=mid.children[0];
  const needed=(top.children[1].innerHTML.match(/\[fish\]/g)||[]).length;
  for(let i=0;i<needed;i++){const pair=t.pair();assert.ok(pile.children.includes(pair.from));assert.equal(pair.to,bowl);assert.equal(pair.from.drop(pair.to),true)}
  if(L>=5){assert.equal(t.pair().tap,mid.children[1]);t.pair().tap.click()}
  assert.ok(!t.pair());t.advance(2500);assert.equal(t.finished(),1);
}
{
  const t=game('feed',5),root=t.stage.firstElementChild,[top,mid,pile]=root.children,bowl=mid.children[0];
  const needed=(top.children[1].innerHTML.match(/\[fish\]/g)||[]).length;
  for(let i=0;i<=needed;i++)pile.children[i].drop(bowl);
  t.pair().tap.click();assert.equal(t.pair().tap,mid.children[1],'Surplus hint removes one fish');
}
for(const L of [0,3,4,8]){
  const t=game('shop',L),[req,shelf,tray]=t.stage.children;
  const first=t.pair();assert.ok(shelf.children.includes(first.tap));first.tap.click();
  if(L<4)assert.ok(req.innerHTML.includes(first.tap.innerHTML.match(/^\[[^\]]+\]/)[0]));
  let coins=0;while(t.pair()){const p=t.pair();assert.equal(p.to,tray);assert.equal(p.from.drop(p.to),true);assert.ok(++coins<=5)}
  t.advance(2500);assert.equal(t.finished(),1);assert.equal(t.wrong(),0);
}
for(const L of [0,3,6]){
  const t=game('memory',L);let pairs=0;
  while(t.pair()){
    const a=t.pair().tap;assert.ok(!a.classList.contains('up'));a.click();
    const b=t.pair().tap;assert.notEqual(a,b);assert.equal(a.innerHTML,b.innerHTML,'Open-card hint must match');
    b.click();t.advance(350);assert.ok(++pairs<=6);
  }
  t.advance(1000);assert.equal(t.finished(),1);
  const p=game('pattern',L);assert.ok(p.stage.children[1].children.includes(p.pair().tap));p.pair().tap.click();
  assert.ok(p.stage.children[0].children.at(-1).classList.contains('filled'));assert.ok(!p.pair());p.advance(700);assert.equal(p.finished(),1);assert.equal(p.wrong(),0);
}
const css=read('css/style.css');assert.match(css,/z-index:90/);assert.match(css,/animation-timing-function:ease-in-out/);
assert.match(css,/\.hint-paw\.hint-still\{animation:hint-blink 2\.2s steps\(1,end\) forwards!important\}/);
console.log('Hint tests passed: idle/reset/repeat, difficulty, lifecycle, reduced motion, and correct moves in all eight games.');



