import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ctx=vm.createContext({});
vm.runInContext(read('js/assets.js')+'\n'+read('js/data.js')+'\n'+read('js/home.js'),ctx);
const {WEARABLES,ROOM_ITEMS,ASSETS,homePrice,homeBuy,homeWear,homePlace,homeStore,migrateHome}=vm.runInContext('({WEARABLES,ROOM_ITEMS,ASSETS,homePrice,homeBuy,homeWear,homePlace,homeStore,migrateHome})',ctx);
assert.equal(WEARABLES.length,8);assert.equal(ROOM_ITEMS.length,10);
for(const it of [...WEARABLES,...ROOM_ITEMS]){
  assert.ok(ASSETS[it.id]);assert.equal(homePrice(it.id),{small:1,medium:3,large:5}[it.tier]);
  const poor={stars:homePrice(it.id)-1,owned:[],worn:{},room:[]};
  assert.equal(homeBuy(poor,it.id),false);assert.equal(poor.owned.length,0);
  const state={stars:homePrice(it.id),owned:[],worn:{},room:[]};
  assert.equal(homeBuy(state,it.id),true);assert.equal(state.stars,0);
  state.stars=99;assert.equal(homeBuy(state,it.id),false);assert.equal(state.stars,99);
}
const state={stars:100,owned:[],worn:{},room:[]};
assert.equal(homeWear(state,'glasses'),false);assert.equal(homePlace(state,'room_bed',50,50),false);
for(const it of WEARABLES){
  homeBuy(state,it.id);assert.equal(homeWear(state,it.id),true);assert.equal(state.worn[it.id],true);
  homeWear(state,it.id);assert.equal(state.worn[it.id],undefined);homeWear(state,it.id);
}
assert.equal(Object.keys(state.worn).length,WEARABLES.length,'All accessories can be worn together');
for(const it of ROOM_ITEMS){
  homeBuy(state,it.id);homePlace(state,it.id,20,30);homePlace(state,it.id,75,85);
  assert.equal(state.room.filter(p=>p.id===it.id).length,1);
  assert.equal(state.room.find(p=>p.id===it.id).x,75);
  homeStore(state,it.id);assert.ok(!state.room.some(p=>p.id===it.id));
}
assert.equal(homePlace(state,'glasses',1,1),false);assert.equal(homeBuy(state,'invalid'),false);
homePlace(state,'room_bed',-10,110);assert.equal(state.room[0].x,0);assert.equal(state.room[0].y,100);
assert.equal(homePlace(state,'room_bed',NaN,20),false);
for(let piggy=0;piggy<=4;piggy++){
  const stickers=[{e:'🐱'},{e:'👑',big:true}],data={piggy,stars:7,stickers};
  const store={get:(k,d)=>k in data?data[k]:d,set:(k,v)=>data[k]=v};
  assert.equal(migrateHome(store,7),7+piggy);assert.equal(data.stars,7+piggy);
  assert.equal(data.piggy,0);assert.equal(data.migratedHome,true);
  data.piggy=4;assert.equal(migrateHome(store,data.stars),7+piggy);
  assert.strictEqual(data.stickers,stickers);
}
const {roomRubyTarget,roomRubyDepth,roomIdle}=vm.runInContext('({roomRubyTarget,roomRubyDepth,roomIdle})',ctx);
const target=(...args)=>JSON.parse(JSON.stringify(roomRubyTarget(...args)));
assert.deepEqual(target(50,5,20,40),{x:50,y:74},'Wall taps project straight down onto the floor');
assert.deepEqual(target(-100,200,20,40),{x:13.4,y:98},'Keep the whole figure inside the left and bottom edges');
assert.deepEqual(target(200,80,20,40),{x:86.6,y:80});
assert.deepEqual(target(NaN,Infinity,20,40),{x:25,y:92},'Invalid saved coordinates use safe defaults');
assert.ok(target(50,55,38,80).y>=95,'Short rooms leave room above Ruby and her accessories');
for(const y of [55,64.2,80,98])assert.equal(roomRubyDepth(y),10+Math.round(y));
// A fake clock exercises resets and disposal without DOM or real waiting.
const timers=new Map();let sequence=0,fired=0,random=0;
const clock={setTimeout(fn,delay){const id=++sequence;timers.set(id,{fn,delay});return id},clearTimeout(id){timers.delete(id)},random:()=>random};
let idle;idle=roomIdle(()=>{fired++;idle.reset()},clock);
idle.reset();assert.equal(timers.size,1);assert.equal([...timers.values()][0].delay,4000);
random=1;idle.reset();assert.equal(timers.size,1);assert.equal([...timers.values()][0].delay,7000);
const [timerId,timer]=[...timers][0];timers.delete(timerId);timer.fn();
assert.equal(fired,1);assert.equal(timers.size,1,'Wandering keeps going while idle');
idle.pause();assert.equal(timers.size,0,'Touching/holding the room pauses idle');
idle.reset();idle.dispose();assert.equal(timers.size,0,'Leaving or rerendering clears the pending timer');
idle.reset();assert.equal(timers.size,0,'Disposed controllers cannot restart');
// Exercise the real controller with a small DOM/clock double, including pointer capture paths.
for(const reduced of [false,true]){
  const timers=new Map(),frames=new Map(),nodes=[];let serial=0,pops=0,disconnected=false;
  class Node {
    constructor(cls=''){
      this.classes=new Set(cls.split(' '));this.handlers=new Map();this.childNodes=[];nodes.push(this);
      this.style={setProperty(k,v){this[k]=v}};this.clientWidth=500;this.clientHeight=400;
      this.offsetWidth=this.offsetHeight=100;this.clientLeft=this.clientTop=0;
      this.classList={add:c=>this.classes.add(c),remove:c=>this.classes.delete(c),contains:c=>this.classes.has(c)};
    }
    addEventListener(type,fn,{signal}={}){
      if(!this.handlers.has(type))this.handlers.set(type,new Set());
      const list=this.handlers.get(type);list.add(fn);signal?.addEventListener('abort',()=>list.delete(fn),{once:true});
    }
    emit(type,e={}){for(const fn of this.handlers.get(type)||[])fn(e)}
    setAttribute(){} setPointerCapture(){}
    append(...children){for(const child of children){if(child.parent)child.parent.childNodes=child.parent.childNodes.filter(n=>n!==child);this.childNodes.push(child);child.parent=this}}
    set innerHTML(id){this.childNodes=[];const base=new Node('ruby-base');base.art=id;this.append(base)}
    get firstElementChild(){return this.childNodes[0]}
    querySelector(){return this.childNodes.find(n=>n.classes.has('ruby-base'))}
    replaceWith(other){const a=this.parent.childNodes;a[a.indexOf(this)]=other;other.parent=this.parent}
    closest(selector){return selector.split(',').some(s=>this.classes.has(s.trim().slice(1)))?this:null}
    getBoundingClientRect(){return {left:0,top:0}}
  }
  const scene=new Node(),ruby=new Node('room-ruby'),content=new Node(),win=new Node(),doc=new Node();
  ruby.innerHTML='ruby';const data={rubyPos:null};
  const context=vm.createContext({AbortController,console,WEARABLES:[],ROOM_ITEMS:[],window:win,document:doc,reduceMotion:reduced,
    $:()=>({hidden:true}),div:cls=>new Node(cls),art:id=>id,sfx:{pop(){pops++}},
    store:{get:(k,d)=>k in data?data[k]:d,set:(k,v)=>data[k]=v},
    setTimeout(fn,delay){const id=++serial;timers.set(id,{fn,delay});return id},clearTimeout:id=>timers.delete(id),
    requestAnimationFrame(fn){const id=++serial;frames.set(id,fn);return id},cancelAnimationFrame:id=>frames.delete(id),
    ResizeObserver:class {observe(){} disconnect(){disconnected=true}}
  });
  vm.runInContext(read('js/home.js'),context);
  const walker=context.walkRoomRuby(scene,ruby,content);
  const pointer=(target,x,y)=>({button:0,pointerId:1,target,clientX:x,clientY:y,preventDefault(){}});
  const down=e=>{content.emit('pointerdown',e);scene.emit('pointerdown',e)};
  const up=e=>{win.emit('pointerup',e);scene.emit('pointerup',e)};
  const advanceFrame=t=>{for(const [id,fn] of [...frames]){frames.delete(id);fn(t)}};
  assert.equal(timers.size,1);
  const furniture=new Node('room-object');down(pointer(furniture,400,300));up(pointer(furniture,400,300));
  assert.equal(frames.size,0,'Furniture taps cannot start Ruby walking');
  down(pointer(scene,300,300));scene.emit('pointermove',pointer(scene,320,300));up(pointer(scene,300,300));
  assert.equal(frames.size,0,'A drag that returns to its start is still not a tap');
  down(pointer(scene,400,10));assert.equal(timers.size,0,'A held touch pauses wandering');up(pointer(scene,400,10));
  { // 走路一律有移動動畫（不受減少動態效果影響）
    assert.equal(frames.size,1);advanceFrame(0);advanceFrame(500);
    assert.equal(ruby.style.zIndex,context.roomRubyDepth(100-parseFloat(ruby.style.bottom)));
    assert.ok(ruby.classList.contains('room-walking'));advanceFrame(10000);
  }
  assert.equal(data.rubyPos.x,80);assert.equal(data.rubyPos.y,74);
  assert.equal(ruby.classList.contains('room-walking'),false);
  down(pointer(ruby,400,200));up(pointer(ruby,400,200));
  assert.equal(pops,1);await new Promise(r=>setImmediate(r));assert.equal(ruby.firstElementChild.querySelector().art,'ruby_cheer');
  const cheer=[...timers].find(([,t])=>t.delay===800);assert.ok(cheer);
  timers.delete(cheer[0]);cheer[1].fn();assert.equal(ruby.firstElementChild.querySelector().art,'ruby');
  down(pointer(scene,100,350));up(pointer(scene,100,350));
  doc.hidden=true;doc.emit('visibilitychange');assert.equal(frames.size,0);assert.equal(timers.size,0,'Hidden browser tabs pause all room work');
  doc.hidden=false;doc.emit('visibilitychange');assert.equal(timers.size,1);
  down(pointer(scene,100,350));up(pointer(scene,100,350));walker.dispose();
  assert.equal(frames.size,0);assert.equal(timers.size,0);assert.ok(disconnected);
  assert.ok(nodes.every(n=>[...n.handlers.values()].every(list=>list.size===0)),'Disposal removes every controller listener');
}
console.log('Home tests passed: purchases, wearables, furniture, migration, Ruby floor bounds/depth, and idle reset/cleanup.');
