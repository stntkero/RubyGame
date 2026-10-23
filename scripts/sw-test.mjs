import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const source=readFileSync(new URL('sw.js',root),'utf8');
const handlers={},stores=new Map();let offline=false,fetches=0,failWrites=false;
const base='https://example.test/play/';
const key=request=>new URL(typeof request==='string'?request:request.url,base).href;
const caches={
  async open(name){
    if(!stores.has(name))stores.set(name,new Map());
    const entries=stores.get(name);
    return {
      async match(request){return entries.get(key(request))?.clone()},
      async put(request,response){if(failWrites)throw Error('Quota');entries.set(key(request),response)},
      async addAll(paths){for(const path of paths){assert.ok(existsSync(new URL(path,root)),`Missing shell ${path}`);entries.set(key(path),new Response(path))}}
    };
  },
  async keys(){return [...stores.keys()]},
  async delete(name){return stores.delete(name)}
};
const ctx=vm.createContext({URL,Response,caches,self:{location:{origin:'https://example.test',href:base+'sw.js'},addEventListener(type,fn){handlers[type]=fn}},
  async fetch(request){fetches++;if(offline)throw Error('Offline');return new Response('network:'+key(request))}
});
vm.runInContext(source,ctx);
async function lifecycle(type){let work;handlers[type]({waitUntil(p){work=p}});await work}
await lifecycle('install');
const shell=vm.runInContext('APP_SHELL',ctx);
const html=readFileSync(new URL('index.html',root),'utf8');
for(const [,path] of html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)){
  if(!path.startsWith('http'))assert.ok(shell.includes('./'+path),`Not precached: ${path}`);
}
async function request(path,{method='GET',mode='cors'}={}){
  let response;const pending=[];
  handlers.fetch({request:{url:new URL(path,base).href,method,mode},respondWith(p){response=p},waitUntil(p){pending.push(p)}});
  return {response:response&&await response,pending};
}
offline=true;
assert.equal(await (await request('./',{mode:'navigate'})).response.text(),'./index.html');
assert.equal(await (await request('index.html')).response.text(),'./index.html');
assert.equal(await (await request('js/voice-map.js')).response.text(),'./js/voice-map.js');
offline=false;
for(const path of ['assets/game/ruby/ruby-cheer.webp','assets/voice/test.mp3','icons/icon-192.png']){
  const first=await request(path);assert.match(await first.response.text(),/^network:/);
  const before=fetches;offline=true;assert.match(await (await request(path)).response.text(),/^network:/);assert.equal(fetches,before);offline=false;
}
assert.equal((await request('index.html',{method:'POST'})).response,undefined);
assert.equal((await request('https://other.test/test.js')).response,undefined);
assert.equal((await request('notes.txt')).response,undefined);
failWrites=true;assert.equal((await request('assets/new.webp')).response.status,200);failWrites=false;
const font='https://fonts.googleapis.com/css2?family=Huninn&display=swap';
await Promise.all((await request(font)).pending);
offline=true;
const cachedFont=await request(font);assert.equal(cachedFont.response.status,200);await Promise.all(cachedFont.pending);
assert.equal((await request('https://fonts.gstatic.com/uncached.woff2')).response.type,'error');
const name=vm.runInContext('CACHE_NAME',ctx);
stores.set('ruby-pwa-old',new Map());stores.set('another-app',new Map());
await lifecycle('activate');assert.ok(stores.has(name));assert.ok(!stores.has('ruby-pwa-old'));assert.ok(stores.has('another-app'));
assert.ok(!/skipWaiting|clients\.claim/.test(source),'Updates must wait until old clients close');
console.log('SW tests passed: shell offline launch, runtime caching, fonts, storage failure, and old-cache cleanup.');
