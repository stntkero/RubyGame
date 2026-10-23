// 救援大隊出動：把對的救援車拖到需要幫忙的地方
const RESCUE_TYPES={
  fire:{car:'fire_truck',call:'失火了！',hint:'失火了，要找消防車'},
  hurt:{car:'ambulance',call:'有人受傷了！',hint:'受傷了，要找救護車'},
  lost:{car:'police_car',call:'有人迷路了！',hint:'迷路了，要找警車'},
  stranded:{car:'helicopter',call:'有人被困住了！',hint:'被困住了，要找直升機'}
};
const RESCUE_SITUATIONS=[
  {id:'fire_house',type:'fire'},{id:'fire_tree',type:'fire'},
  {id:'hurt_bunny',type:'hurt'},{id:'sick_bear',type:'hurt'},
  {id:'lost_puppy',type:'lost'},{id:'lost_duckling',type:'lost'},
  {id:'cat_on_cliff',type:'stranded'},{id:'sheep_on_island',type:'stranded'}
];
// 關卡：要救幾個（total）、同時出現幾個（show）、車庫有幾台車（cars）
function rescueLevel(L){
  if(L<4)return {total:1,show:1,cars:2};
  if(L<6)return {total:2,show:2,cars:3};
  if(L<8)return {total:3,show:3,cars:4};
  if(L<10)return {total:4,show:3,cars:4};
  return {total:6,show:3,cars:4};
}
// 前四個救援不同種類；超過四個以後才會重複
function rescuePlan(total){
  const types=shuffle(Object.keys(RESCUE_TYPES)),plan=[];
  for(let i=0;i<total;i++){
    const type=types[i%types.length],pool=RESCUE_SITUATIONS.filter(s=>s.type===type&&!plan.includes(s));
    plan.push(pick(pool.length?pool:RESCUE_SITUATIONS.filter(s=>s.type===type),1)[0]);
  }
  return plan;
}
GAMES.rescue = function(stage,L,done){
  const lv=rescueLevel(L),plan=rescuePlan(lv.total),queue=plan.slice(lv.show);
  const neededCars=[...new Set(plan.map(s=>RESCUE_TYPES[s.type].car))];
  const otherCars=shuffle(Object.values(RESCUE_TYPES).map(t=>t.car).filter(c=>!neededCars.includes(c)));
  const cars=shuffle([...neededCars,...otherCars].slice(0,Math.max(lv.cars,neededCars.length)));
  const top=div('row rescue-calls'),bottom=div('row rescue-garage');
  const g=gen;
  const valid=()=>g===gen&&top.isConnected&&bottom.isConnected;
  const later=(fn,ms)=>setTimeout(()=>{if(valid())fn()},ms);
  let solved=0,finished=false,interacted=false;
  const cards=[];
  const fill=(card,sit)=>{
    card.sit=sit;card.classList.remove('rescued','rescuing','shake');card.dataset.type=sit.type;
    card.innerHTML=art(sit.id,'rescue-scene');card.classList.add('wiggle');
  };
  plan.slice(0,lv.show).forEach(sit=>{
    const c=div('rescue-card');fill(c,sit);top.append(c);cards.push(c);
    c.addEventListener('click',()=>{
      if(valid()&&!finished&&!c.classList.contains('rescued')&&!c.classList.contains('rescuing')){
        interacted=true;say(RESCUE_TYPES[c.sit.type].call);
      }
    });
  });
  const open=()=>cards.filter(c=>!c.classList.contains('rescued')&&!c.classList.contains('rescuing'));
  const carEls={};
  cars.forEach(id=>{
    const bay=div('rescue-bay'),p=div('piece rescue-car');
    p.innerHTML=art(id);bay.append(p);bottom.append(bay);carEls[id]=p;
    // 車子救完會開回車庫，可以一直重複使用（拖放永遠回傳 false）
    makeDraggable(p,(el,x,y)=>{
      if(!valid()||finished||p.classList.contains('dispatching'))return false;
      const card=hitTarget(open(),x,y);
      if(!card)return false;
      interacted=true;
      const need=RESCUE_TYPES[card.sit.type];
      if(need.car!==id){wrong(card);say(need.hint);return false}
      card.classList.remove('wiggle');card.classList.add('rescuing');
      p.classList.add('dispatching');
      // The bay stays in the garage while a visual copy drives out and back.
      // makeDraggable resets the real piece's transform after this callback.
      const a=bay.getBoundingClientRect(),b=card.getBoundingClientRect();
      const drive=div('rescue-drive');drive.innerHTML=art(id);
      drive.style.left=a.left+'px';drive.style.top=a.top+'px';
      drive.style.setProperty('--dx',b.left+b.width/2-a.left-a.width/2+'px');
      drive.style.setProperty('--dy',b.top+b.height/2-a.top-a.height/2+'px');
      bay.append(drive);
      later(()=>{
        drive.remove();p.classList.remove('dispatching');
        card.classList.remove('rescuing');card.classList.add('rescued');
        const badge=div('rescue-done');badge.innerHTML=art('done_happy');card.append(badge);
        [784,988,1175,1568].forEach((f,i)=>tone(f,.14,'triangle',i*.08));buzz(30);
        solved++;say('謝謝救援大隊！');
        if(solved===plan.length){finished=true;later(done,900);return}
        if(queue.length){
          const next=queue.shift();
          later(()=>{if(!finished){fill(card,next);say(RESCUE_TYPES[next.type].call)}},1300);
        }
      },800);
      return false;
    });
  });
  stage.append(top,bottom);
  say('救援大隊出動！');
  later(()=>{if(!finished&&!interacted)say(RESCUE_TYPES[cards[0].sit.type].call)},1500);
  idleHint(()=>{
    if(finished||!valid())return;
    const card=open().find(c=>!carEls[RESCUE_TYPES[c.sit.type].car].classList.contains('dispatching'));if(!card)return;
    return {from:carEls[RESCUE_TYPES[card.sit.type].car],to:card};
  });
  return ()=>{
    const W=stage.clientWidth-24,H=stage.clientHeight-24;
    const s=Math.max(44,Math.min(130,(W-14*(lv.show-1))/(lv.show*1.35),
      (W-14*(cars.length-1))/cars.length,(H-32)/2.35));
    stage.style.setProperty('--s',s+'px');
  };
};
