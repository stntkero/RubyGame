import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import './hints-test.mjs';
import './feed-test.mjs';
import './puzzle-test.mjs';
import './home-test.mjs';
import './reactions-test.mjs';
import './sw-test.mjs';

const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const html=read('index.html');
const refs=[...html.matchAll(/<(?:link|script)\b[^>]*\b(?:href|src)="([^"]+)"/g)]
  .map(m=>m[1]).filter(p=>!/^https?:/.test(p));
function checkRef(ref){
  const exists=existsSync(fileURLToPath(new URL(ref,root)));
  if(!exists&&/^icons\/[^/]+\.png$/.test(ref)){console.warn(`Warning: pending PWA icon ${ref}`);return}
  assert.ok(exists,`Missing ${ref}`);
}
for(const ref of refs)checkRef(ref);
const scripts=refs.filter(p=>p.endsWith('.js'));
assert.equal(scripts.at(-1),'js/main.js');
assert.equal([...html.matchAll(/<script\b/g)].length,scripts.length);
assert.ok(!/<script\b(?![^>]*\bdefer\b)/.test(html),'Scripts must use defer');
assert.ok(!/type="module"/.test(html));
assert.match(html,/<link rel="manifest" href="manifest.webmanifest">/);
assert.match(html,/<link rel="apple-touch-icon" href="icons\/apple-touch-icon.png">/);
for(const name of ['capable','title','status-bar-style'])assert.ok(html.includes(`name="apple-mobile-web-app-${name}"`));
assert.ok(!html.includes('TODO: PWA'));
const manifest=JSON.parse(read('manifest.webmanifest'));
for(const [key,value] of Object.entries({name:'寶貝動動腦',short_name:'動動腦',start_url:'./',scope:'./',display:'standalone',orientation:'any',background_color:'#CDEBFF',theme_color:'#CDEBFF'}))assert.equal(manifest[key],value);
assert.deepEqual(manifest.icons,[
  {src:'icons/icon-192.png',sizes:'192x192',type:'image/png'},
  {src:'icons/icon-512.png',sizes:'512x512',type:'image/png'},
  {src:'icons/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}
]);
manifest.icons.forEach(icon=>checkRef(icon.src));
const main=read('js/main.js');
assert.match(main,/location\.protocol\.startsWith\('http'\)/);
assert.match(main,/addEventListener\('load'/);
assert.match(main,/serviceWorker\.register\('\.\/sw.js'\)/);
assert.ok(!/location\.reload|controllerchange/.test(main));

const context=vm.createContext({});
vm.runInContext(read('js/assets.js')+'\n'+read('js/data.js'),context);
const result=vm.runInContext('({ASSETS,THINGS,SHOP,CHEERS,SMALL,RARE,PUZZLES,EMOJI_IDS,art})',context);
const {ASSETS,THINGS,SHOP,CHEERS,SMALL,RARE,PUZZLES,EMOJI_IDS,art}=result;
for(const [id,emoji,name] of [['fire_truck','🚒','消防車'],['ambulance','🚑','救護車'],['police_car','🚓','警車'],['helicopter','🚁','直升機']]){
  assert.equal(ASSETS[id].emoji,emoji);
  assert.ok(THINGS.some(it=>it.id===id&&it.e===emoji&&it.n===name));
}
const ids=[...THINGS,...SHOP].map(it=>it.id).concat([...CHEERS,...SMALL,...RARE,...PUZZLES]);
for(const id of ids)assert.ok(ASSETS[id],`Unregistered data id: ${id}`);
for(const it of [...THINGS,...SHOP])assert.equal(ASSETS[it.id].emoji,it.e);
for(const [id,asset] of Object.entries(ASSETS)){
  assert.match(id,/^[a-z][a-z0-9_]*$/);
  if(asset.img)assert.ok(existsSync(new URL('../'+asset.img,import.meta.url)),`Missing image file for ${id}: ${asset.img}`);
  assert.equal(ASSETS[EMOJI_IDS[asset.emoji]].emoji,asset.emoji,'Legacy emoji must map to a matching id');
  if(!asset.img)assert.equal(art(id),`<span class="emoji">${asset.emoji}</span>`);
}
for(const [id,emoji] of Object.entries({ruby:'🐱',fish:'🐟',bowl:'🥣',bell:'🔔'}))
  assert.equal(ASSETS[id].emoji,emoji);
assert.equal(EMOJI_IDS['🐱'],'cat','Ruby fallback must preserve legacy cat stickers');
assert.ok(scripts.includes('js/games/feed.js'));
assert.equal([...html.matchAll(/data-game="/g)].length,8);
assert.match(html,/data-game="feed"/);
assert.ok(scripts.includes('js/games/puzzle.js'));
assert.match(html,/data-game="puzzle"/);
assert.equal(ASSETS.puzzle.emoji,'🧩');
assert.deepEqual(Array.from(PUZZLES),['ruby']);
assert.match(read('js/main.js'),/puzzle:'把拼圖拼起來'/);
const gamesContext=vm.createContext({GAMES:{}});
for(const script of scripts.filter(p=>p.startsWith('js/games/')))vm.runInContext(read(script),gamesContext);
for(const [,game] of html.matchAll(/data-game="([a-z]+)"/g))
  assert.equal(typeof gamesContext.GAMES[game],'function',`Unregistered game: ${game}`);
for(const file of ['index.html',...scripts]){
  for(const m of read(file).matchAll(/(?:data-art="|\bart\(')([a-z0-9_]+)(?:"|')/g))
    assert.ok(ASSETS[m[1]],`Unknown asset ${m[1]} in ${file}`);
}
ASSETS.dog.img='assets/img/dog.webp';
assert.match(art('dog','goods'),/^<img class="art goods".*alt="" draggable="false".*onerror="artFallback\(this\)">$/);
delete ASSETS.dog.img;
console.log(`Smoke test passed: ${refs.length} local references, ${Object.keys(ASSETS).length} assets, ${ids.length} data ids.`);
