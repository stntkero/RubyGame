const coinDots=(n,cls='coin sm')=>`<i class="${cls}"></i>`.repeat(n);
GAMES.shop = function(stage,L,done){
  const maxP=L<2?3:L<4?4:5;
  const pool=SHOP.filter(x=>x.p<=maxP);
  const errand=L<4;                            // 低難度：幫忙跑腿買指定的東西；高難度：自己用有限的錢挑
  const showSlots=L<3;
  let shelfItems=pick(pool,L<3?3:4),target=null,money;
  if(errand){target=pick(shelfItems,1)[0];money=target.p+(L<2?1:2)}
  else{
    money=3+Math.floor(Math.random()*3);
    if(!shelfItems.some(i=>i.p<=money))shelfItems[0]=SHOP[0];
  }
  const req=div('request');
  req.innerHTML=errand
    ?`${art('cart')}<span>買</span>${art(target.id)}`
    :`${art('purse')}<span>${coinDots(money)}</span>`;
  const shelf=div('shelf');
  const tray=div('tray');tray.innerHTML=art('cart', 'placeholder');
  const wallet=div('row');
  let chosen=null,paid=0;
  const hintItems=[],coins=[];
  shelfItems.forEach(it=>{
    const b=document.createElement('button');b.className='shelf-item';
    b.innerHTML=`${art(it.id)}<span class="ptag">${coinDots(it.p)}<b>${it.p}</b></span>`;
    if(round===0&&diff===1&&it.id===target?.id)b.classList.add('wiggle');
    b.addEventListener('click',()=>{
      if(chosen)return;
      b.classList.remove('wiggle');
      if(errand&&it.id!==target.id){wrong(b);say('要買'+target.n+'喔');return}
      if(!errand&&it.p>money){wrong(b);say(it.n+'要'+NUMS[it.p-1]+'個金幣，錢不夠喔');return}
      chosen=it;sfx.pop();b.style.visibility='hidden';
      tray.innerHTML=`${art(it.id, 'goods')}`+(showSlots?'<div class="coin-slot"></div>'.repeat(it.p):'');
      say(it.n+'要'+NUMS[it.p-1]+'個金幣');
    });
    shelf.append(b);hintItems.push({el:b,it});
  });
  for(let i=0;i<money;i++){
    const c=div('piece coin');wallet.append(c);coins.push(c);
    makeDraggable(c,(el,x,y)=>{
      if(!hitTarget([tray],x,y))return false;
      if(!chosen){wrong(shelf);say('先選要買的東西');return false}
      if(paid>=chosen.p){wrong(tray);return false}
      paid++;
      if(showSlots)tray.querySelectorAll('.coin-slot')[paid-1].classList.add('coin');else tray.append(div('coin mini'));
      tone(1250,.08,'triangle');tone(1650,.12,'triangle',.06);buzz(20);say(paid===2?'二':NUMS[paid-1]);
      if(paid===chosen.p){
        setTimeout(()=>{
          tray.innerHTML=`${art('shoppingbag', 'goods bought')}${art(chosen.id, 'goods bought')}`;
          sfx.ok();say('謝謝光臨！');
        },500);
        setTimeout(done,1800);
      }
      return true;
    });
  }
  stage.append(req,shelf,tray,wallet);
  setTimeout(()=>say(errand?'幫我買'+target.n:'你有'+NUMS[money-1]+'個金幣，想買什麼呢？'),250);
  idleHint(()=>{
    if(!chosen)return {tap:hintItems.find(({it})=>errand?it.id===target.id:it.p<=money)?.el};
    if(paid<chosen.p)return {from:coins.find(c=>!c.classList.contains('placed')),to:tray};
  });
  return ()=>stage.style.setProperty('--s',sizeFor(stage,4,4.4+Math.ceil(money/4)*.9)+'px');
};
