renderStaticArt();

const PROMPTS={shadow:'幫它們找到影子',memory:'找出一樣的兩張',color:'把球放進一樣顏色的籃子',
  puzzle:'把拼圖拼起來',shop:'',feed:'餵露比吃魚',pattern:'下一個是什麼呢？',size:'從小排到大'};
const PROMPT_EVERY_ROUND={pattern:1,size:1};

/* ---------- 流程 ---------- */
const stage=$('#stage');
let current=null,round=0,gen=0,relayout=null;
function show(id){['home','game','bank'].forEach(x=>$('#'+x).hidden=x!==id)}
function renderProgress(){
  const p=$('#progress');p.innerHTML='';
  for(let i=0;i<5;i++){const d=document.createElement('i');if(i<round%5)d.className='on';p.append(d)}
}
function nextRound(){
  renderProgress();stage.innerHTML='';
  const g=gen;
  if(round>0&&PROMPT_EVERY_ROUND[current])say(PROMPTS[current]);
  relayout=GAMES[current](stage,round+diff*2,()=>{if(g===gen)roundDone()});
  relayout();
}
function roundDone(){
  const g=gen;
  stars++;store.set('stars',stars);round++;renderProgress();
  const big=round%5===0;
  setTimeout(()=>{
    if(g!==gen)return;
    sfx.win();say(pick(PRAISE,1)[0]);
    cheer(big?'trophy':pick(CHEERS,1)[0],big);
    setTimeout(()=>{$('#cheer').hidden=true;if(g===gen)nextRound()},big?2600:1800);
  },500);
}
function cheer(id,big){
  const el=$('#cheerEmoji');el.innerHTML=art(id);
  $('#cheer').hidden=false;el.style.animation='none';void el.offsetWidth;el.style.animation='';
  if(!reduceMotion)confetti(big?160:70);
}
function startGame(name){gen++;current=name;round=0;show('game');if(PROMPTS[name])say(PROMPTS[name]);requestAnimationFrame(nextRound)}
function goHome(){gen++;current=null;relayout=null;$('#cheer').hidden=true;stage.innerHTML='';$('#starCount').textContent=stars;show('home')}

document.querySelectorAll('.game-btn[data-game]').forEach(b=>b.addEventListener('click',()=>{sfx.pop();startGame(b.dataset.game)}));
document.querySelectorAll('.home-btn').forEach(b=>b.addEventListener('click',goHome));
const soundBtn=$('#soundBtn');
const musicBtn=$('#musicBtn');
function paintSound(){soundBtn.innerHTML=art(soundOn?'soundon':'soundoff');soundBtn.setAttribute('aria-pressed',String(soundOn))}
function paintMusic(){musicBtn.innerHTML=art(bgmEnabled?'music':'music_off');musicBtn.setAttribute('aria-pressed',String(bgmEnabled))}
soundBtn.addEventListener('click',()=>{
  soundOn=!soundOn;store.set('sound',soundOn);paintSound();
  if(soundOn)bgmStart();else{cancelSpeech();bgmStop()}
  sfx.pop();
});
musicBtn.addEventListener('click',()=>{bgmSetEnabled(!bgmEnabled);paintMusic()});
addEventListener('resize',()=>relayout&&relayout());
$('#starCount').textContent=stars;paintSound();paintMusic();
const diffBtns=document.querySelectorAll('.diff button');
function paintDiff(){diffBtns.forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.diff===diff)))}
diffBtns.forEach(b=>b.addEventListener('click',()=>{diff=+b.dataset.diff;store.set('diff',diff);paintDiff();sfx.pop()}));
paintDiff();
