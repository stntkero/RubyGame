import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Deterministic Web Audio / browser doubles exercise timing and lifecycle.
const listeners={},timers=new Map(),saved=new Map(),contexts=[],utterances=[];
let timerId=0;
class Param{
  value=1;
  setValueAtTime(value){this.value=value}
  exponentialRampToValueAtTime(value){this.value=value}
  cancelScheduledValues(){}
  setTargetAtTime(value){this.value=value}
}
class AudioNode{
  gain=new Param();frequency=new Param();Q=new Param();
  connect(node){return node}
  disconnect(){}
  start(time){this.startTime=time}
  stop(time){this.stopTime=time}
}
class AudioContext{
  currentTime=0;state='running';destination={};oscillators=[];
  constructor(){contexts.push(this)}
  createGain(){return new AudioNode()}
  createBiquadFilter(){return new AudioNode()}
  createOscillator(){const node=new AudioNode();this.oscillators.push(node);return node}
  resume(){this.state='running';return Promise.resolve()}
}
const document={hidden:false,querySelector(){},addEventListener(name,fn){listeners[name]=fn}};
const speechSynthesis={cancel(){},speak(u){utterances.push(u)}};
const context=vm.createContext({
  document,window:{AudioContext,speechSynthesis},speechSynthesis,
  SpeechSynthesisUtterance:class{constructor(text){this.text=text}},
  localStorage:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)},
  matchMedia:()=>({matches:false}),
  setTimeout(fn){const id=++timerId;timers.set(id,fn);return id},
  clearTimeout(id){timers.delete(id)}
});
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
vm.runInContext(read('js/core.js').split('const buzz=')[0],context);
vm.runInContext(read('js/bgm.js'),context);
const run=code=>vm.runInContext(code,context);
run('bgmStart()');assert.equal(contexts.length,0,'No context before a gesture');
listeners.pointerdown({isTrusted:false});assert.equal(contexts.length,0);
listeners.pointerdown({isTrusted:true});
assert.equal(contexts.length,1);assert.equal(timers.size,1);
const audio=contexts[0];
assert.equal(audio.oscillators.length,9,'Melody and two quiet chord tones');
run('tone(660)');assert.equal(contexts.length,1,'SFX share the music context');
assert.equal(run('bgmMaster.gain.value'),.065);
run("say('你好')");utterances[0].onstart();
assert.equal(run('bgmMaster.gain.value'),.065*.4);
run("say('再試一次')");utterances[1].onstart();utterances[0].onend();
assert.equal(run('bgmDucked'),true,'Old cancelled speech cannot release a new duck');
utterances[1].onerror();assert.equal(run('bgmDucked'),false);
run('bgmDuck(true);cancelSpeech()');assert.equal(run('bgmDucked'),false);

// Step through more than a complete loop, checking one scheduler and no drift.
for(let i=0;i<70;i++){
  audio.currentTime=i*60/76;
  const [id,fn]=timers.entries().next().value;timers.delete(id);fn();
  assert.equal(timers.size,1);
}
assert.ok(Math.abs(run('bgmNextTime')-(.04+70*60/76))<1e-10);
audio.currentTime+=10; // A throttled timer must skip the missed notes.
let [id,fn]=timers.entries().next().value;timers.delete(id);
const before=audio.oscillators.length;fn();
assert.ok(audio.oscillators.length-before<=9);
document.hidden=true;listeners.visibilitychange();assert.equal(timers.size,0);
assert.ok([...run('bgmVoices')].every(v=>v.oscillators.every(o=>o.stopTime<=audio.currentTime+.03)));
document.hidden=false;listeners.visibilitychange();assert.equal(timers.size,1);
run('bgmSetEnabled(false)');assert.equal(saved.get('music'),'false');assert.equal(timers.size,0);
listeners.visibilitychange();assert.equal(timers.size,0,'Disabled music stays stopped');
run('bgmSetEnabled(true);soundOn=false;bgmStop()');
assert.equal(saved.get('music'),'true');assert.equal(timers.size,0);
run('bgmStart()');assert.equal(timers.size,0,'Sound mute overrides music preference');
run('soundOn=true;bgmStart()');assert.equal(timers.size,1);
run('bgmStop()');listeners.visibilitychange();assert.equal(timers.size,0);
for(const voice of [...run('bgmVoices')])for(const oscillator of [...voice.oscillators])oscillator.onended();
assert.equal(run('bgmVoices.size'),0,'Ended voices release their nodes');

// Persisted off preference survives loading the script in a fresh page.
saved.set('music','false');
const fresh=vm.createContext({store:{get:()=>false},document:{addEventListener(){}}});
vm.runInContext(read('js/bgm.js'),fresh);
assert.equal(vm.runInContext('bgmEnabled',fresh),false);
console.log('BGM tests passed: gesture gating, shared context, ducking, loop timing, pause, mute, persistence and cleanup.');
