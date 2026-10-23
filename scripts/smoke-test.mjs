import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const html=read('index.html');
const refs=[...html.matchAll(/<(?:link|script)\b[^>]*\b(?:href|src)="([^"]+)"/g)]
  .map(m=>m[1]).filter(p=>!/^https?:/.test(p));
for(const ref of refs)assert.ok(existsSync(fileURLToPath(new URL(ref,root))),`Missing ${ref}`);
const scripts=refs.filter(p=>p.endsWith('.js'));
assert.equal(scripts.at(-1),'js/main.js');
assert.equal([...html.matchAll(/<script\b/g)].length,scripts.length);
assert.ok(!/<script\b(?![^>]*\bdefer\b)/.test(html),'Scripts must use defer');
assert.ok(!/type="module"|manifest\.json|apple-touch-icon\.png/.test(html));

const context=vm.createContext({});
vm.runInContext(read('js/assets.js')+'\n'+read('js/data.js'),context);
const result=vm.runInContext('({ASSETS,THINGS,SHOP,CHEERS,SMALL,RARE,EMOJI_IDS,art})',context);
const {ASSETS,THINGS,SHOP,CHEERS,SMALL,RARE,EMOJI_IDS,art}=result;
const ids=[...THINGS,...SHOP].map(it=>it.id).concat([...CHEERS,...SMALL,...RARE]);
for(const id of ids)assert.ok(ASSETS[id],`Unregistered data id: ${id}`);
for(const it of [...THINGS,...SHOP])assert.equal(ASSETS[it.id].emoji,it.e);
for(const [id,asset] of Object.entries(ASSETS)){
  assert.match(id,/^[a-z][a-z0-9]*$/);
  assert.ok(!asset.img,`Unexpected initial image: ${id}`);
  assert.equal(EMOJI_IDS[asset.emoji],id,'Legacy emoji must map to an id');
  assert.equal(art(id),`<span class="emoji">${asset.emoji}</span>`);
}
for(const file of ['index.html',...scripts]){
  for(const m of read(file).matchAll(/(?:data-art="|\bart\(')([a-z0-9]+)(?:"|')/g))
    assert.ok(ASSETS[m[1]],`Unknown asset ${m[1]} in ${file}`);
}
ASSETS.dog.img='assets/img/dog.webp';
assert.match(art('dog','goods'),/^<img class="art goods".*alt="" draggable="false".*onerror="artFallback\(this\)">$/);
delete ASSETS.dog.img;
console.log(`Smoke test passed: ${refs.length} local references, ${Object.keys(ASSETS).length} assets, ${ids.length} data ids.`);
