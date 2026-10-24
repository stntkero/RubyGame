// 消防車滅火：點火焰，消防車就噴水；每團火要噴幾下才會熄
function fireLevel(L){
  if(L<4)return {flames:2,hits:2,relight:0};
  if(L<6)return {flames:3,hits:3,relight:0};
  if(L<8)return {flames:4,hits:3,relight:0};
  if(L<10)return {flames:5,hits:4,relight:1};
  return {flames:6,hits:4,relight:2};
}
// 火焰可能出現的位置（以房子圖的寬高 % 計）
const FIRE_SPOTS=[[30,30],[70,30],[50,14],[24,62],[76,62],[50,50],[38,82],[64,82],[14,40],[86,40]];
GAMES.fire = function(stage,L,done){
  const lv=fireLevel(L),g=gen;
  const valid=()=>g===gen&&root.isConnected;
  const later=(fn,ms)=>setTimeout(()=>{if(valid())fn()},ms);
  const root=div('fire-game'),scene=div('fire-scene'),house=div('fire-house'),truck=div('fire-truck');
  house.innerHTML=art('ruby_house');truck.innerHTML=art('fire_truck');
  scene.append(house,truck);root.append(scene);
  let relights=lv.relight,finished=false;
  const flames=pick(FIRE_SPOTS,lv.flames).map(([x,y])=>{
    const f=document.createElement('button');f.className='fire-flame';f.setAttribute('aria-label','火');
    f.style.left=x+'%';f.style.top=y+'%';f.innerHTML=art('flame');f.hp=lv.hits;
    f.addEventListener('pointerdown',e=>{e.preventDefault();spray(f)});
    house.append(f);return f;
  });
  const burning=()=>flames.filter(f=>f.hp>0);
  const paint=f=>f.style.setProperty('--k',f.hp>0?(.45+.55*f.hp/lv.hits).toFixed(2):'0');
  flames.forEach(paint);
  // 水柱：從消防車的水管畫一條線到火焰，再在火焰上濺出水花
  function spray(f){
    if(finished||!valid()||f.hp<=0)return;
    const a=truck.getBoundingClientRect(),b=f.getBoundingClientRect(),s=scene.getBoundingClientRect();
    const x0=a.left+a.width*.78-s.left,y0=a.top+a.height*.3-s.top,x1=b.left+b.width/2-s.left,y1=b.top+b.height*.6-s.top;
    const jet=div('fire-jet');jet.style.left=x0+'px';jet.style.top=y0+'px';
    jet.style.width=Math.hypot(x1-x0,y1-y0)+'px';jet.style.transform=`rotate(${Math.atan2(y1-y0,x1-x0)}rad)`;
    const splash=div('fire-splash');splash.innerHTML=art('water_splash');splash.style.left=x1+'px';splash.style.top=y1+'px';
    scene.append(jet,splash);later(()=>{jet.remove();splash.remove()},380);
    [900,700,520].forEach((fr,i)=>tone(fr,.09,'sine',i*.04,.12));buzz(15);
    f.hp--;paint(f);
    if(f.hp>0)return;
    // 熄了：冒一朵煙
    f.classList.add('out');const puff=div('fire-puff');puff.innerHTML=art('smoke_puff');f.append(puff);
    sfx.ok();
    const left=burning().length;
    if(left===0&&relights>0){
      // 超級挑戰：有一團火又燒起來了
      relights--;
      later(()=>{if(finished)return;const r=pick(flames,1)[0];r.hp=lv.hits;r.classList.remove('out');r.querySelector('.fire-puff')?.remove();paint(r);say('又燒起來了！快噴水！')},900);
      return;
    }
    if(left===0){finished=true;later(()=>{say('火都滅了！謝謝消防車！');later(done,1400)},400);return}
    say('還有'+NUMS[left-1]+'個');
  }
  stage.append(root);
  say('房子失火了！快噴水！');
  idleHint(()=>{if(finished||!valid())return;const f=burning()[0];return f&&{tap:f}});
  return ()=>{
    const W=stage.clientWidth-24,H=stage.clientHeight-24;
    root.style.setProperty('--house',Math.min(W*.86,H*.62,520)+'px');
  };
};
