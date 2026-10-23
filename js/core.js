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
function tone(freq,dur=.15,type='sine',delay=0,vol=.2){
  if(!soundOn)return;
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();
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
function say(text){
  if(!soundOn||!('speechSynthesis' in window))return;
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-TW';u.rate=.9;u.pitch=1.3;speechSynthesis.speak(u)}catch(e){}
}
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
function wrong(t){sfx.no();t.classList.remove('shake');void t.offsetWidth;t.classList.add('shake')}
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
