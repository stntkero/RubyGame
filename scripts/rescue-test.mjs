import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
// 救援大隊三個小遊戲的純邏輯：關卡表、迷宮生成（每格都走得到、只有一條路）、路線搜尋
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const ctx=vm.createContext({GAMES:{},Math});
for(const f of ['js/games/fire.js','js/games/bandage-spots.js','js/games/bandage.js','js/games/maze.js'])vm.runInContext(read(f),ctx);
const {fireLevel,bandageLevel,mazeLevel,makeMaze,mazeCanMove,mazePath,mazeBones,mazeWallPath,GAMES}=ctx;
// 每隻小病人（一般圖和受傷版）都至少有兩個傷口位置，而且在圖裡面
const SPOTS=vm.runInContext('BANDAGE_SPOTS_BY',ctx),PATIENTS=vm.runInContext('BANDAGE_PATIENTS',ctx);
for(const id of PATIENTS)assert.ok(SPOTS[id]?.length>=2,id+' needs boo-boo spots');
for(const [id,list] of Object.entries(SPOTS))for(const [x,y] of list)assert.ok(x>=5&&x<=95&&y>=5&&y<=95,id+' spot inside picture');
for(const g of ['fire','bandage','maze'])assert.equal(typeof GAMES[g],'function',g);
// 關卡越後面越難（不會變簡單）
let prev={flames:0,hits:0,cuts:0,n:0};
for(let L=2;L<=14;L++){
  const f=fireLevel(L),b=bandageLevel(L),m=mazeLevel(L);
  assert.ok(f.flames>=prev.flames&&f.hits>=prev.hits&&b.cuts>=prev.cuts&&m.n>=prev.n,`L${L} must not get easier`);
  assert.ok(f.flames<=10&&b.cuts<=9&&m.n<=7);
  prev={flames:f.flames,hits:f.hits,cuts:b.cuts,n:m.n};
}
assert.equal(bandageLevel(2).drag,false);assert.equal(bandageLevel(8).drag,true);
// 骨頭：都在往狗屋的路上、不在起點和狗屋、不重複；每一關要幾根就有幾根
for(let L=6;L<=14;L++)for(let k=0;k<50;k++){
  const {n,bones}=mazeLevel(L),w=makeMaze(n),route=mazePath(w,n,0,n*n-1),got=mazeBones(w,n,bones);
  assert.equal(got.length,bones,'L'+L+' bone count');assert.equal(new Set(got).size,bones);
  for(const c of got){assert.ok(route.includes(c),'Bone must be on the way home');assert.ok(c!==0&&c!==n*n-1)}
}
// 牆：只畫內牆，不跟外框重複
for(const n of [3,5,7])for(let k=0;k<20;k++){
  const w=makeMaze(n),d=mazeWallPath(w,n);
  for(const [,x,y,dir,end] of d.matchAll(/M(d+) (d+)([HV])(d+)/g)){
    if(dir==='V'){assert.ok(+x>0&&+x<n,'Vertical wall must be interior');assert.equal(+end,+y+1)}
    else{assert.ok(+y>0&&+y<n,'Horizontal wall must be interior');assert.equal(+end,+x+1)}
  }
  const interior=2*n*(n-1),open=n*n-1;
  assert.equal((d.match(/M/g)||[]).length,interior-open,'One line per closed interior edge');
}
// 迷宮：每一格都連得到起點；牆兩側一致；邊數 = 格數-1（樹狀，只有一條路）
for(const n of [3,4,5,6,7])for(let seed=1;seed<=20;seed++){
  let s=seed;const rand=()=>((s=s*16807%2147483647)/2147483647);
  const w=makeMaze(n,rand);let edges=0;
  for(let i=0;i<n*n;i++){
    if(i%n<n-1){assert.equal(w[i].r,w[i+1].l);if(!w[i].r)edges++}
    if(i<n*n-n){assert.equal(w[i].b,w[i+n].t);if(!w[i].b)edges++}
    if(i%n===0)assert.ok(w[i].l);if(i%n===n-1)assert.ok(w[i].r);if(i<n)assert.ok(w[i].t);if(i>=n*n-n)assert.ok(w[i].b);
  }
  assert.equal(edges,n*n-1,'perfect maze');
  const p=mazePath(w,n,0,n*n-1);assert.equal(p[0],0);assert.equal(p.at(-1),n*n-1);
  for(let i=1;i<p.length;i++)assert.ok(mazeCanMove(w,n,p[i-1],p[i]));
}
console.log('Rescue mini-game tests passed: level tables, perfect mazes, paths.');
