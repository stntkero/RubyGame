import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('js/games/rescue.js');
const mappings={
  fire:['fire_truck','失火了！','失火了，要找消防車'],
  hurt:['ambulance','有人受傷了！','受傷了，要找救護車'],
  lost:['police_car','有人迷路了！','迷路了，要找警車'],
  stranded:['helicopter','有人被困住了！','被困住了，要找直升機']
};
class Element{
  constructor(cls=''){
    this.className=cls;this.children=[];this.dataset={};this.events={};this.connected=true;
    this.style={setProperty:(k,v)=>{this.style[k]=v}};
    this.classList={contains:n=>this.className.split(' ').includes(n),
      add:(...ns)=>{this.className=[...new Set([...this.className.split(' '),...ns])].join(' ')},
      remove:(...ns)=>{this.className=this.className.split(' ').filter(n=>!ns.includes(n)).join(' ')}};
  }
  get isConnected(){return this.connected&&(!this.parent||this.parent.isConnected)}
  set innerHTML(s){this.markup=s;for(const c of this.children)c.connected=false;this.children=[]}
  get innerHTML(){return this.markup||''}
  append(...cs){for(const c of cs){c.parent=this;this.children.push(c)}}
  remove(){this.connected=false;this.parent.children=this.parent.children.filter(c=>c!==this)}
  addEventListener(n,fn){this.events[n]=fn}
  click(){this.events.click?.()}
  getBoundingClientRect(){return {left:20,top:this.classList.contains('rescue-card')?60:350,width:80,height:80}}
}
function setup(L,width=375,height=591){
  const stage=new Element(),timers=new Map(),spoken=[],errors=[];let now=0,id=0,completed=0,hint;
  const ctx=vm.createContext({GAMES:{},gen:1,div:c=>new Element(c),shuffle:a=>a.slice().reverse(),pick:(a,n)=>a.slice(0,n),
    art:(id,cls='')=>`[${id}:${cls}]`,say:s=>spoken.push(s),wrong:c=>errors.push(c),tone(){},buzz(){},
    idleHint:fn=>{hint=fn},makeDraggable:(p,fn)=>{p.drop=card=>{ctx.target=card;return fn(p,0,0)}},
    hitTarget:cards=>cards.find(c=>c===ctx.target),setTimeout(fn,ms){timers.set(++id,{fn,at:now+ms});return id}});
  vm.runInContext(source,ctx);stage.clientWidth=width;stage.clientHeight=height;
  ctx.GAMES.rescue(stage,L,()=>completed++)();
  const [calls,garage]=stage.children,cars=garage.children.map(b=>b.children[0]);
  return {ctx,stage,calls,garage,cars,spoken,errors,pair:()=>hint(),completed:()=>completed,
    advance(ms){const end=now+ms;while(true){const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;timers.delete(next[0]);now=next[1].at;next[1].fn()}now=end}};
}
const ctx=vm.createContext({GAMES:{},shuffle:a=>a.slice().reverse(),pick:(a,n)=>a.slice(0,n)});
vm.runInContext(source,ctx);
for(const [L,total,show,cars] of [[2,1,1,2],[3,1,1,2],[4,2,2,3],[5,2,2,3],[6,3,3,4],[7,3,3,4],[8,4,3,4],[9,4,3,4],[10,6,3,4],[14,6,3,4]]){
  assert.deepEqual({...ctx.rescueLevel(L)},{total,show,cars});
  const plan=ctx.rescuePlan(total);
  assert.equal(plan.length,total);assert.equal(new Set(plan.slice(0,4).map(s=>s.type)).size,Math.min(4,total));
  assert.equal(new Set(plan.map(s=>s.id)).size,total);
  const t=setup(L);assert.equal(t.calls.children.length,show);assert.equal(t.cars.length,cars);
  t.advance(1500);assert.equal(t.spoken.at(-1),mappings[t.calls.children[0].sit.type][1]);
  let rescued=0;
  while(t.pair()){
    const {from,to}=t.pair(),[id,call,hint]=mappings[to.sit.type];
    assert.ok(from.innerHTML.includes(id));to.click();assert.equal(t.spoken.at(-1),call);
    assert.equal(from.drop(null),false,'Outside drop is harmless');
    const wrong=t.cars.find(c=>c!==from);
    assert.equal(wrong.drop(to),false);assert.equal(t.errors.at(-1),to);assert.equal(t.spoken.at(-1),hint);
    assert.equal(from.drop(to),false,'Vehicles always return home');
    assert.ok(to.classList.contains('rescuing'));assert.ok(!to.classList.contains('rescued'));
    assert.equal(from.drop(to),false,'Dispatch cannot be counted twice');
    assert.equal(wrong.drop(to),false,'Reserved card cannot accept another vehicle');
    assert.ok(!from.classList.contains('placed'));assert.equal(from.parent.children.length,2,'Driving copy starts in the garage');
    const drive=from.parent.children[1];assert.equal(drive.style['--dy'],'-290px');
    t.advance(799);assert.ok(!to.classList.contains('rescued'));
    t.advance(1);assert.ok(to.classList.contains('rescued'));assert.equal(from.parent.children.length,1);
    assert.ok(to.children[0].innerHTML.includes('done_happy'));assert.ok(!from.classList.contains('dispatching'));
    t.advance(1300);assert.ok(++rescued<=total);
  }
  assert.equal(rescued,total);t.advance(10000);assert.equal(t.completed(),1);
  for(const car of t.cars)for(const card of t.calls.children)assert.equal(car.drop(card),false);
  t.advance(10000);assert.equal(t.completed(),1,'Completion happens exactly once');
}
// Dispatch different vehicles at once, then keep serving any queued situations.
{
  const t=setup(14);
  for(const card of t.calls.children){const car=t.cars.find(c=>c.innerHTML.includes(mappings[card.sit.type][0]));car.drop(card)}
  assert.equal(t.pair(),undefined);t.advance(2100);
  while(t.pair()){const {from,to}=t.pair();from.drop(to);t.advance(2100)}
  t.advance(5000);assert.equal(t.completed(),1);
}
for(const stale of ['generation','detached'])for(const phase of ['intro','drive','refill','complete']){
  const t=setup(phase==='refill'?14:2);
  if(phase!=='intro'){const {from,to}=t.pair();from.drop(to);if(phase!=='drive')t.advance(800)}
  const before=t.spoken.length;
  if(stale==='generation')t.ctx.gen++;else t.stage.innerHTML='';
  t.advance(10000);assert.equal(t.spoken.length,before,`${stale}/${phase}: stale timers stay silent`);
  assert.equal(t.completed(),0,`${stale}/${phase}: stale completion is cancelled`);
}
for(const [w,h] of [[375,591],[1024,692]])for(let L=2;L<=14;L++){
  const t=setup(L,w,h),s=parseFloat(t.stage.style['--s']),{show,cars}=ctx.rescueLevel(L);
  assert.ok(show*1.35*s+(show-1)*14<=w-24,'Cards fit the stage width');
  assert.ok(cars*s+(cars-1)*14<=w-24,'Vehicles fit the stage width');
  assert.ok(2.35*s+32<=h-24,'Rows fit the stage height');
}
const assets=vm.createContext({});vm.runInContext(read('js/assets.js'),assets);
const expected={fire_house:'🔥',fire_tree:'🌳',hurt_bunny:'🐰',sick_bear:'🐻',lost_puppy:'🐶',lost_duckling:'🐥',cat_on_cliff:'🐱',sheep_on_island:'🐑',done_happy:'👍'};
for(const [id,emoji] of Object.entries(expected)){
  const asset=vm.runInContext(`ASSETS.${id}`,assets);assert.equal(asset.emoji,emoji);assert.equal(asset.img,`assets/game/rescue/${id}.webp`);
}
assert.match(read('index.html'),/data-game="rescue" style="--c:#FFB3A7"><span data-art="fire_truck"><\/span><span>救援大隊/);
assert.match(read('js/main.js'),/rescue:''/);
console.log('Rescue tests passed: levels, plans, mappings, hints, reusable vehicles, animation, concurrent dispatch, completion, stale timers, and SE/iPad sizing.');
