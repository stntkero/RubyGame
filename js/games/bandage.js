// 救護車貼 OK 繃：小動物身上有幾個傷口，點傷口（或把 OK 繃拖過去）貼好就不痛了
const BANDAGE_PATIENTS=['rabbit','bear','dog','cat','panda','pig','monkey','lion','chick'];
function bandageLevel(L){
  if(L<4)return {cuts:2,drag:false};
  if(L<6)return {cuts:3,drag:false};
  if(L<8)return {cuts:3,drag:true};
  if(L<10)return {cuts:4,drag:true};
  return {cuts:5,drag:true};
}
// 傷口位置（以小動物圖的寬高 % 計，避開臉的正中央）
const BANDAGE_SPOTS=[[30,58],[70,58],[38,78],[62,78],[24,40],[76,40],[50,68],[44,90],[58,46]];
GAMES.bandage = function(stage,L,done){
  const lv=bandageLevel(L),g=gen;
  const root=div('bandage-game'),bed=div('bandage-patient'),tray=div('row bandage-tray');
  const valid=()=>g===gen&&root.isConnected;
  const later=(fn,ms)=>setTimeout(()=>{if(valid())fn()},ms);
  const whoId=pick(BANDAGE_PATIENTS,1)[0],who=THINGS.find(t=>t.id===whoId);
  bed.innerHTML=art(who.id,'bandage-animal');
  let left=lv.cuts,finished=false;
  const cuts=pick(BANDAGE_SPOTS,lv.cuts).map(([x,y])=>{
    const c=document.createElement('button');c.className='bandage-cut wiggle';c.setAttribute('aria-label','傷口');
    c.style.left=x+'%';c.style.top=y+'%';c.innerHTML=art('booboo');
    if(!lv.drag)c.addEventListener('click',()=>heal(c));
    bed.append(c);return c;
  });
  function heal(c){
    if(finished||!valid()||c.classList.contains('healed'))return false;
    c.classList.remove('wiggle');c.classList.add('healed');
    c.innerHTML=art('bandage');c.style.setProperty('--r',(Math.random()*50-25).toFixed(0)+'deg');
    tone(880,.08,'triangle');tone(1320,.12,'triangle',.06);buzz(20);
    left--;const n=lv.cuts-left;say(n===2?'二':NUMS[n-1]);
    if(left===0){
      finished=true;
      later(()=>{
        bed.classList.add('healed-all');const heart=div('bandage-heart');heart.innerHTML=art('happy_heart');bed.append(heart);
        sfx.ok();say('不痛不痛了！謝謝救護車！');later(done,1600);
      },500);
    }
    return true;
  }
  // 拖曳模式：下面放一排 OK 繃，拖到傷口上
  const pads=[];
  if(lv.drag){
    for(let i=0;i<lv.cuts;i++){
      const p=div('piece bandage-pad');p.innerHTML=art('bandage');tray.append(p);pads.push(p);
      makeDraggable(p,(el,x,y)=>{
        const c=hitTarget(cuts.filter(c=>!c.classList.contains('healed')),x,y,18);
        return c?heal(c):false;
      });
    }
  }
  root.append(bed);if(lv.drag)root.append(tray);
  stage.append(root);
  say(who.n+'受傷了，幫牠貼OK繃');
  idleHint(()=>{
    if(finished||!valid())return;
    const c=cuts.find(c=>!c.classList.contains('healed'));if(!c)return;
    if(!lv.drag)return {tap:c};
    const p=pads.find(p=>!p.classList.contains('placed'));return p&&{from:p,to:c};
  });
  return ()=>{
    const W=stage.clientWidth-24,H=stage.clientHeight-24;
    const size=Math.min(W*.9,(lv.drag?H*.66:H*.86),460);
    root.style.setProperty('--pet',size+'px');
    stage.style.setProperty('--s',Math.max(56,Math.min(96,(W-14*(lv.cuts-1))/lv.cuts,H*.2))+'px');
  };
};
