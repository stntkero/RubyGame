const $=s=>document.querySelector(s);
const div=(cls)=>{const d=document.createElement('div');d.className=cls;return d};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,n)=>shuffle(a).slice(0,n);
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
             set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

let stars=store.get('stars',0),soundOn=store.get('sound',true),diff=store.get('diff',1);

/* ---------- 聲音 ---------- */
let ac;
function getAudioContext(){
  return ac||(ac=new (window.AudioContext||window.webkitAudioContext)());
}
function tone(freq,dur=.15,type='sine',delay=0,vol=.2){
  if(!soundOn)return;
  try{
    ac=getAudioContext();
    if(ac.state==='suspended')ac.resume();
    const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.05);
  }catch(e){}
}
const sfx={
  pop(){tone(660,.1,'triangle')},
  ok(){tone(784,.12,'triangle');tone(1047,.2,'triangle',.09)},
  no(){tone(320,.18,'sine',0,.1)},
  win(){[523,659,784,1047].forEach((f,i)=>tone(f,.28,'triangle',i*.12))}
};
/* 配音：有預先產生的 mp3（js/voice-map.js）就用 Web Audio 播，沒有或失敗才用手機語音；說話時背景音樂自動變小聲 */
const getAC=getAudioContext;
const voiceBuf={};let voiceSrc=null,sayId=0;
const duck=on=>{if(typeof bgmDuck==='function')bgmDuck(on)};
function loadVoice(f){
  return voiceBuf[f]=voiceBuf[f]||fetch('assets/voice/'+f+'.mp3').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()})
    .then(b=>new Promise((ok,no)=>getAC().decodeAudioData(b,ok,no))).catch(e=>{delete voiceBuf[f];throw e});
}
function stopVoice(){
  sayId++;
  if(voiceSrc){try{voiceSrc.onended=null;voiceSrc.stop()}catch(e){}voiceSrc=null}
  try{'speechSynthesis' in window&&speechSynthesis.cancel()}catch(e){}
  duck(false);
}
const cancelSpeech=stopVoice;
function speak(text,id){
  if(!('speechSynthesis' in window))return;
  try{
    const u=new SpeechSynthesisUtterance(text);u.lang='zh-TW';u.rate=.9;u.pitch=1.3;
    u.onstart=()=>{if(id===sayId)duck(true)};u.onend=u.onerror=()=>{if(id===sayId)duck(false)};
    speechSynthesis.speak(u);
  }catch(e){duck(false)}
}
// 回首頁後短時間內，遊戲裡排程中的語音不要再冒出來
let sayMutedUntil=0;
function hushVoice(ms=1500){sayMutedUntil=Date.now()+ms;stopVoice()}
function say(text){
  if(!soundOn||Date.now()<sayMutedUntil)return;
  stopVoice();
  const id=sayId,f=typeof VOICE_FILES!=='undefined'&&VOICE_FILES[text];
  if(!f){speak(text,id);return}
  try{if(getAC().state==='suspended')ac.resume()}catch(e){speak(text,id);return}
  loadVoice(f).then(buf=>{
    if(id!==sayId||!soundOn)return;
    const s=ac.createBufferSource();s.buffer=buf;s.connect(ac.destination);s.start();voiceSrc=s;duck(true);
    s.onended=()=>{if(voiceSrc===s){voiceSrc=null;duck(false)}};
  }).catch(()=>{if(id===sayId)speak(text,id)});
}
// 第一次觸碰時解鎖音訊（iOS 需要），並在背景預先載入所有配音
document.addEventListener('pointerdown',()=>{
  try{if(getAC().state==='suspended')ac.resume()}catch(e){return}
  if(typeof VOICE_FILES==='undefined')return;
  Object.values(VOICE_FILES).reduce((p,f)=>p.then(()=>loadVoice(f)).catch(()=>{}),Promise.resolve());
},{once:true,capture:true});
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};
function makeDraggable(el,onDrop){
  el.addEventListener('pointerdown',e=>{
    if(el.classList.contains('placed'))return;
    e.preventDefault();
    try{el.setPointerCapture(e.pointerId)}catch(_){}
    el.classList.remove('wiggle');
    const sx=e.clientX,sy=e.clientY;
    el.classList.add('dragging');sfx.pop();
    const move=ev=>{el.style.transform=`translate(${ev.clientX-sx}px,${ev.clientY-sy}px) scale(1.15)`};
    const up=()=>{
      el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);
      el.classList.remove('dragging');
      const r=el.getBoundingClientRect();
      const ok=onDrop(el,r.left+r.width/2,r.top+r.height/2);
      el.style.transform='';
      if(ok)el.classList.add('placed');
    };
    el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  });
}
function hitTarget(targets,x,y,pad=24){
  return targets.find(t=>{const r=t.getBoundingClientRect();return x>r.left-pad&&x<r.right+pad&&y>r.top-pad&&y<r.bottom+pad});
}
// Hints demonstrate a move without changing game state.
const hintStops=new Set();
function stopHints(){for(const stop of [...hintStops])stop()}
function hintDrag(fromEl,toEl){
  if(!fromEl?.isConnected||!toEl?.isConnected)return ()=>{};
  const a=fromEl.getBoundingClientRect(),b=toEl.getBoundingClientRect();
  const paw=div('hint-paw'+(reduceMotion?' hint-still':''));
  paw.setAttribute('aria-hidden','true');paw.innerHTML=art('hint_paw');
  paw.style.setProperty('--hx',a.left+a.width/2+'px');
  paw.style.setProperty('--hy',a.top+a.height/2+'px');
  paw.style.setProperty('--tx',b.left+b.width/2+'px');
  paw.style.setProperty('--ty',b.top+b.height/2+'px');
  document.body.append(paw);
  let frame=0,timer=0,stopped=false;
  const stop=()=>{
    if(stopped)return;stopped=true;
    clearTimeout(timer);cancelAnimationFrame(frame);paw.remove();hintStops.delete(stop);
  };
  const check=()=>{
    if(!fromEl.isConnected||!toEl.isConnected){stop();return}
    frame=requestAnimationFrame(check);
  };
  hintStops.add(stop);frame=requestAnimationFrame(check);timer=setTimeout(stop,2200);
  return stop;
}
function hintTap(el){return hintDrag(el,el)}
function idleHint(getPair,{first=5000,every=8000}={}){
  if(diff!==0&&diff!==1)return ()=>{};
  const g=gen,anchor=stage.firstElementChild;
  let timer=0,animation=()=>{},stopped=false;
  const valid=()=>g===gen&&stage.isConnected&&anchor?.isConnected;
  const stop=()=>{
    if(stopped)return;stopped=true;clearTimeout(timer);animation();
    stage.removeEventListener('pointerdown',reset,true);observer.disconnect();hintStops.delete(stop);
  };
  const play=()=>{
    if(!valid()||(diff!==0&&diff!==1)){stop();return}
    const pair=getPair();animation();
    if(pair)animation=pair.tap?hintTap(pair.tap):hintDrag(pair.from,pair.to);
    timer=setTimeout(play,every);
  };
  const reset=()=>{clearTimeout(timer);animation();if(valid())timer=setTimeout(play,first);else stop()};
  const observer=new MutationObserver(()=>{if(!valid())stop()});
  observer.observe(stage,{childList:true});
  stage.addEventListener('pointerdown',reset,true);hintStops.add(stop);reset();
  return stop;
}
let comfortPeek=null,comfortTimer=0;
function peekRubyComfort(){
  if(comfortTimer)return;
  if(!comfortPeek){
    comfortPeek=div('ruby-comfort-peek');comfortPeek.setAttribute('aria-hidden','true');
    comfortPeek.innerHTML=art('ruby_comfort');document.body.append(comfortPeek);
  }
  comfortPeek.hidden=false;
  comfortTimer=setTimeout(()=>{comfortPeek.hidden=true;comfortTimer=0},reduceMotion?1200:1600);
}
function wrong(t){sfx.no();t.classList.remove('shake');void t.offsetWidth;t.classList.add('shake');peekRubyComfort()}
function sizeFor(stage,cols,rowsTotal){
  const W=stage.clientWidth-24,H=stage.clientHeight-24;
  return Math.max(56,Math.min(130,(W-14*(cols-1))/cols,H/rowsTotal));
}
const cv=$('#confetti'),cx=cv.getContext('2d');let parts=[],raf=0;
function confetti(n){
  const dpr=devicePixelRatio||1;cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
  const cs=['#FF5A5F','#FFC93C','#3FA7F5','#4CC38A','#9B6BFF','#FF7AA8'];
  for(let i=0;i<n;i++)parts.push({x:innerWidth/2,y:innerHeight*.45,vx:(Math.random()-.5)*15,vy:-Math.random()*15-4,
    r:Math.random()*7+6,c:cs[i%6],a:Math.random()*6,life:0});
  if(!raf)tick();
}
function tick(){
  cx.clearRect(0,0,innerWidth,innerHeight);
  parts.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.a+=.2;p.life++;
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.a);cx.fillStyle=p.c;cx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);cx.restore()});
  parts=parts.filter(p=>p.y<innerHeight+40&&p.life<240);
  raf=parts.length?requestAnimationFrame(tick):0;
  if(!raf)cx.clearRect(0,0,innerWidth,innerHeight);
}

const GAMES={};
