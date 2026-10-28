// 救護車貼 OK 繃：受傷的小動物身上有幾個傷口，點傷口（OK 繃會從醫藥箱飛過去），
// 或把 OK 繃從下面拖到傷口上，全部貼好就不痛了
const BANDAGE_PATIENTS=['rabbit','bear','cat','dog','panda'];
function bandageLevel(L){
  if(L<4)return {cuts:2,drag:false};
  if(L<6)return {cuts:3,drag:false};
  if(L<8)return {cuts:3,drag:true};
  if(L<10)return {cuts:4,drag:true};
  return {cuts:5,drag:true};
}
// 有 Codex 畫的「受傷版」就用它（貼好換成笑臉版），沒有就用一般的小動物圖；
// 傷口位置由 tools/img/spots.mjs 依每張圖的身體範圍算好（BANDAGE_SPOTS_BY）
function bandagePatient(id){
  const hurt='patient_'+id,useHurt=!!(ASSETS[hurt]?.img&&BANDAGE_SPOTS_BY[hurt]);
  const pic=useHurt?hurt:id;
  return {pic,happy:useHurt&&ASSETS[hurt+'_happy']?.img?hurt+'_happy':null,spots:BANDAGE_SPOTS_BY[pic]||[]};
}
GAMES.bandage = function(stage,L,done){
  const lv=bandageLevel(L),g=gen;
  const root=div('bandage-game'),bed=div('bandage-patient'),bay=div('row bandage-bay');
  const valid=()=>g===gen&&root.isConnected;
  const later=(fn,ms)=>setTimeout(()=>{if(valid())fn()},ms);
  const whoId=pick(BANDAGE_PATIENTS.filter(id=>bandagePatient(id).spots.length>=2),1)[0];
  const who=THINGS.find(t=>t.id===whoId),p=bandagePatient(whoId);
  if(p.happy)new Image().src=ASSETS[p.happy].img;
  bed.innerHTML=art(p.pic,'bandage-animal');
  const total=Math.min(lv.cuts,p.spots.length);
  let left=total,finished=false;
  const cuts=pick(p.spots,total).map(([x,y])=>{
    const c=div('bandage-cut');c.style.left=x+'%';c.style.top=y+'%';c.innerHTML=art('booboo');
    bed.append(c);return c;
  });
  const open=()=>cuts.filter(c=>!c.classList.contains('healed')&&!c.classList.contains('healing'));
  // 救護車和醫藥箱（點的模式）或一排 OK 繃（拖的模式）
  const amb=div('bandage-amb');amb.innerHTML=art('ambulance');bay.append(amb);
  const kit=div('bandage-kit');kit.innerHTML=art('first_aid_kit');
  const pads=[];
  if(lv.drag){
    for(let i=0;i<total;i++){
      const pad=div('piece bandage-pad');pad.innerHTML=art('bandage');bay.append(pad);pads.push(pad);
      makeDraggable(pad,(el,x,y)=>{
        const c=hitTarget(open(),x,y,26);
        if(!c){wrong(el);return false}
        stick(c);return true;
      });
    }
  }else{
    bay.append(kit);
    // 點傷口附近就算（小手不容易點準）
    bed.addEventListener('pointerdown',e=>{
      if(finished||!valid())return;
      const c=hitTarget(open(),e.clientX,e.clientY,22);if(!c)return;
      e.preventDefault();fly(c);
    });
  }
  // OK 繃從醫藥箱飛到傷口上
  function fly(c){
    c.classList.add('healing');sfx.pop();
    const a=kit.getBoundingClientRect(),b=c.getBoundingClientRect();
    const w=b.width*1.5,f=div('bandage-fly');f.innerHTML=art('bandage');
    f.style.width=f.style.height=w+'px';f.style.left=a.left+a.width/2-w/2+'px';f.style.top=a.top+a.height/2-w/2+'px';
    document.body.append(f);f.getBoundingClientRect();
    f.style.transform=`translate(${b.left+b.width/2-a.left-a.width/2}px,${b.top+b.height/2-a.top-a.height/2}px)`;
    setTimeout(()=>{f.remove();if(valid())stick(c)},430);
  }
  function stick(c){
    if(finished||!valid())return;
    c.classList.remove('healing');c.classList.add('healed');
    c.innerHTML=art('bandage');c.style.setProperty('--r',(Math.random()*50-25).toFixed(0)+'deg');
    tone(880,.08,'triangle');tone(1320,.12,'triangle',.06);buzz(20);
    left--;const n=total-left;say(n===2?'二':NUMS[n-1]);
    if(left>0)return;
    finished=true;
    later(()=>{
      if(p.happy)bed.querySelector('.bandage-animal').outerHTML=art(p.happy,'bandage-animal');
      bed.classList.add('healed-all');const heart=div('bandage-heart');heart.innerHTML=art('happy_heart');bed.append(heart);
      sfx.ok();say('不痛不痛了！謝謝救護車！');later(done,1800);
    },500);
  }
  root.append(bed,bay);
  stage.append(root);
  say(who.n+'受傷了，幫牠貼OK繃');
  idleHint(()=>{
    if(finished||!valid())return;
    const c=open()[0];if(!c)return;
    if(!lv.drag)return {tap:c};
    const pad=pads.find(x=>!x.classList.contains('placed'));return pad&&{from:pad,to:c};
  });
  return ()=>{
    const W=stage.clientWidth-24,H=stage.clientHeight-24;
    const s=Math.max(56,Math.min(90,(W-60-12*total)/(total+1),H*.16));
    stage.style.setProperty('--s',s+'px');
    root.style.setProperty('--pet',Math.min(W*.96,H-s-30,480)+'px');
  };
};
