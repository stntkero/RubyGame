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
  homeBuy(state,it.id);assert.equal(homeWear(state,it.id),true);assert.equal(state.worn[it.slot],it.id);
  homeWear(state,it.id);assert.equal(state.worn[it.slot],undefined);homeWear(state,it.id);
}
assert.equal(state.worn.head,'royal_crown');assert.equal(state.worn.hair,'star_clip');assert.equal(state.worn.face,'glasses');
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
console.log('Home tests passed: prices, buying, wearable slots, room placement/moving/storage, and one-time migration.');
