import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

for(const reduceMotion of [false,true]){
  const timers=new Map(),listeners={},home={hidden:false};let sequence=0,bounces=0,appends=0;
  const button={replaceChildren(child){this.firstElementChild=child},set innerHTML(value){this.markup=value;this.firstElementChild=element()}};
  function element(){return {style:{},classList:{remove(){},add(){bounces++}},setAttribute(){},append(){},offsetWidth:10}}
  const cheer=element(),overlay={hidden:true};
  const ctx=vm.createContext({reduceMotion,WEARABLES:[],homeState:{worn:{}},
    $:s=>({'#home':home,'#homeRuby':button,'#cheerEmoji':cheer,'#cheer':overlay}[s]),
    div:element,art:(id,cls='')=>`[${id}:${cls}]`,
    document:{addEventListener(type,fn){listeners[type]=fn},body:{append(){appends++}}},
    setTimeout(fn,delay){const id=++sequence;timers.set(id,{fn,delay});return id},
    clearTimeout(id){timers.delete(id)},sfx:{no(){}},confetti(n){ctx.confettiCount=n}
  });
  const run=source=>vm.runInContext(source,ctx);
  function fire(delay){const entry=[...timers].find(([,t])=>t.delay===delay);assert.ok(entry,`Missing ${delay}ms timer`);timers.delete(entry[0]);entry[1].fn()}
  run(read('js/ruby.js'));
  run('resetHomeRubyIdle()');assert.equal(timers.size,1);
  listeners.pointermove();assert.equal(timers.size,1);
  fire(60000);assert.match(button.markup,/ruby_sleep/);
  const before=bounces;listeners.pointerdown();
  assert.equal(run('homeRubySleeping'),false);assert.equal(bounces-before,reduceMotion?0:1);assert.equal(timers.size,1);
  home.hidden=true;run('resetHomeRubyIdle()');assert.equal(timers.size,0);
  home.hidden=false;run('resetHomeRubyIdle()');assert.equal(timers.size,1);
  // A timer that fires after leaving home must not change Ruby.
  home.hidden=true;fire(60000);assert.equal(run('homeRubySleeping'),false);

  const core=read('js/core.js');run(core.slice(core.indexOf('let comfortPeek='),core.indexOf('function sizeFor')));
  ctx.target=element();run('wrong(target);wrong(target);wrong(target)');
  assert.equal(appends,1);assert.equal(timers.size,1);assert.equal(run('comfortPeek.hidden'),false);
  fire(reduceMotion?1200:1600);assert.equal(run('comfortPeek.hidden'),true);
  run('wrong(target)');assert.equal(appends,1);assert.equal(timers.size,1);

  const main=read('js/main.js');run(main.slice(main.indexOf('function cheer('),main.indexOf('function startGame(')));
  run('cheer(false)');assert.match(cheer.innerHTML,/ruby_cheer/);assert.ok(!cheer.innerHTML.includes('trophy'));assert.equal(overlay.hidden,false);
  run('cheer(true)');assert.match(cheer.innerHTML,/ruby_cheer.*trophy/);assert.equal(ctx.confettiCount,reduceMotion?undefined:160);
}
const css=read('css/style.css');
assert.match(css,/prefers-reduced-motion:reduce\)\{\.ruby-comfort-peek,\.cheer-emoji,\.ruby-bounce\{animation:none!important\}/);
console.log('Reaction tests passed: celebration, trophy, throttled comfort, home idle/wake, and reduced motion.');
