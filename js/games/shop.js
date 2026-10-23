const coinDots=(n,cls='coin sm')=>`<i class="${cls}"></i>`.repeat(n);
// 小小商店
// L<4：跑腿，買指定的一樣東西。
// L≥4：自己用錢包裡的錢（最多 10 個金幣）買，錢夠就可以一樣一樣繼續買；剩下的錢買不起任何東西時自動結帳，也可以按購物袋提早結帳。
GAMES.shop = function(stage,L,done){
  const errand=L<4,showSlots=L<6;
  const maxP=L<2?3:L<4?4:5;
  const pool=SHOP.filter(x=>x.p<=maxP);
  let shelfItems=pick(pool,L<3?3:L<8?4:5),target=null,money;
  if(errand){target=pick(shelfItems,1)[0];money=target.p+(L<2?1:2)}
  else{
    money=(L<6?4:L<8?6:8)+Math.floor(Math.random()*3);
    // 至少要買得起兩樣，才有「錢夠就可以多買」的感覺
    shelfItems.sort((a,b)=>a.p-b.p);
    if(shelfItems[0].p+shelfItems[1].p>money)shelfItems[0]=SHOP[0];
    shelfItems=shuffle(shelfItems);
  }
  const req=div('request');
  req.innerHTML=errand
    ?`${art('cart')}<span>買</span>${art(target.id)}`
    :`${art('purse')}<span>${coinDots(money)}</span>`;
  const shelf=div('shelf');
  const tray=div('tray');tray.innerHTML=art('cart', 'placeholder');
  const bag=div('row shop-bag');
  const wallet=div('row');
  let chosen=null,paid=0,left=money,finished=false;
  const bought=[],hintItems=[],coins=[];
  const remaining=()=>hintItems.filter(({it})=>!bought.includes(it)&&it!==chosen);
  const canBuyMore=()=>remaining().some(({it})=>it.p<=left);
  const finish=()=>{
    if(finished)return;finished=true;checkout.hidden=true;
    tray.innerHTML=art('shoppingbag', 'goods bought')+bought.map(it=>art(it.id, 'goods bought')).join('');
    sfx.ok();say('謝謝光臨！');setTimeout(done,1800);
  };
  // 自由購物模式：買到至少一樣後，可以按購物袋提早結帳
  const checkout=document.createElement('button');checkout.className='shelf-item shop-checkout';checkout.hidden=true;
  checkout.innerHTML=art('shoppingbag');checkout.setAttribute('aria-label','結帳');
  checkout.addEventListener('click',()=>{if(!chosen&&bought.length)finish()});
  shelfItems.forEach(it=>{
    const b=document.createElement('button');b.className='shelf-item';
    b.innerHTML=`${art(it.id)}<span class="ptag">${coinDots(it.p)}<b>${it.p}</b></span>`;
    b.addEventListener('click',()=>{
      if(chosen||finished||bought.includes(it))return;
      b.classList.remove('wiggle');
      if(errand&&it.id!==target.id){wrong(b);say('要買'+target.n+'喔');return}
      if(!errand&&it.p>left){wrong(b);say(it.n+'要'+NUMS[it.p-1]+'個金幣，錢不夠喔');return}
      chosen=it;paid=0;sfx.pop();b.style.visibility='hidden';checkout.hidden=true;
      tray.innerHTML=`${art(it.id, 'goods')}`+(showSlots?'<div class="coin-slot"></div>'.repeat(it.p):'');
      say(it.n+'要'+NUMS[it.p-1]+'個金幣');
    });
    shelf.append(b);hintItems.push({el:b,it});
  });
  if(!errand)shelf.append(checkout);
  for(let i=0;i<money;i++){
    const c=div('piece coin');wallet.append(c);coins.push(c);
    makeDraggable(c,(el,x,y)=>{
      if(finished||!hitTarget([tray],x,y))return false;
      if(!chosen){wrong(shelf);say('先選要買的東西');return false}
      if(paid>=chosen.p){wrong(tray);return false}
      paid++;left--;
      if(showSlots)tray.querySelectorAll('.coin-slot')[paid-1].classList.add('coin');else tray.append(div('coin mini'));
      tone(1250,.08,'triangle');tone(1650,.12,'triangle',.06);buzz(20);say(paid===2?'二':NUMS[paid-1]);
      if(paid===chosen.p){
        const it=chosen;bought.push(it);chosen=null;
        bag.innerHTML+=art(it.id, 'goods bought');
        if(errand||!canBuyMore()){setTimeout(finish,500);return true}
        setTimeout(()=>{
          if(finished||chosen)return;
          tray.innerHTML=art('cart', 'placeholder');checkout.hidden=false;
          sfx.ok();say('還剩'+NUMS[left-1]+'個金幣，還想買什麼呢？');
        },500);
      }
      return true;
    });
  }
  stage.append(req,shelf,tray,bag,wallet);
  setTimeout(()=>say(errand?'幫我買'+target.n:'你有'+NUMS[money-1]+'個金幣，想買什麼呢？'),250);
  idleHint(()=>{
    if(finished)return;
    if(!chosen){const next=hintItems.find(({it})=>!bought.includes(it)&&(errand?it.id===target.id:it.p<=left));return next&&{tap:next.el}}
    if(paid<chosen.p)return {from:coins.find(c=>!c.classList.contains('placed')),to:tray};
  });
  return ()=>stage.style.setProperty('--s',sizeFor(stage,5,5+Math.ceil(money/5)*.9)+'px');
};
