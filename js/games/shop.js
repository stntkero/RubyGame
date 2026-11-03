const coinDots=(n,cls='coin sm')=>`<i class="${cls}"></i>`.repeat(n);
// 小小商店：像真的商店一樣——先把東西放進購物車、算出一共多少錢，再一次付清
// L<4：跑腿，買指定的東西（L<2 一樣、L2～3 兩樣），放好就自動結帳
// L≥4：自己用錢包的錢（最多 10 個金幣）挑，加起來不能超過錢包；按收銀台結帳（買不起其他東西時也會自動結帳）
// 投幣時 L<6 有格子提示要投幾個
GAMES.shop = function(stage,L,done){
  const errand=L<4,showSlots=L<6;
  const maxP=L<2?3:L<4?4:5;
  const pool=SHOP.filter(x=>x.p<=maxP);
  let shelfItems=pick(pool,L<3?3:L<8?4:5),targets=[],money;
  if(errand){
    targets=pick(shelfItems,L<2?1:2);
    money=targets.reduce((s,it)=>s+it.p,0)+(L<2?1:2);
  }else{
    money=(L<6?4:L<8?6:8)+Math.floor(Math.random()*3);
    shelfItems.sort((a,b)=>a.p-b.p);
    if(shelfItems[0].p+shelfItems[1].p>money)shelfItems[0]=SHOP[0];
    shelfItems=shuffle(shelfItems);
  }
  // 版面：（跑腿才有的購物清單）→ 貨架 → 購物車＋總價 → 錢包（錢包圖示＋金幣，金幣只在這裡出現一次）
  const req=errand?div('request'):null;
  if(req)req.innerHTML=`${art('cart')}<span>買</span>${targets.map(it=>art(it.id)).join('')}`;
  const shelf=div('shelf');
  const tray=div('tray');
  const total=div('shop-total');
  const wallet=div('row shop-wallet waiting');wallet.innerHTML=art('purse','wallet-purse');
  const counter=div('shop-counter');
  const cart=[],hintItems=[],coins=[];
  let phase='pick',paid=0,finished=false;
  const sum=()=>cart.reduce((s,it)=>s+it.p,0);
  const canAddMore=()=>hintItems.some(({it})=>!cart.includes(it)&&sum()+it.p<=money);
  // 櫃台上的鈴鐺：自由購物時放好東西按一下結帳（和餵露比的「好了」鈴鐺一樣）
  const checkout=document.createElement('button');checkout.className='feed-bell shop-checkout wiggle';checkout.hidden=true;
  checkout.innerHTML=art('bell');checkout.setAttribute('aria-label','結帳');
  const paintTray=()=>{
    if(phase!=='pick')return;
    tray.innerHTML=cart.length?cart.map(it=>art(it.id,'goods')).join(''):art('cart','placeholder');
    total.innerHTML=cart.length?`${coinDots(sum())}<b>${sum()}</b>`:'';
    checkout.hidden=errand||!cart.length;
  };
  const startPay=()=>{
    if(phase!=='pick'||!cart.length||finished)return;
    phase='pay';checkout.hidden=true;shelf.classList.add('shop-closed');wallet.classList.remove('waiting');
    tray.innerHTML=cart.map(it=>art(it.id,'goods')).join('')+(showSlots?'<div class="coin-slot"></div>'.repeat(sum()):'');
    say('一共'+NUMS[sum()-1]+'個金幣');
  };
  checkout.addEventListener('click',startPay);
  shelfItems.forEach(it=>{
    const b=document.createElement('button');b.className='shelf-item';
    b.innerHTML=`${art(it.id)}<span class="ptag">${coinDots(it.p)}<b>${it.p}</b></span>`;
    b.addEventListener('click',()=>{
      if(phase!=='pick'||finished)return;
      // 再點一次已放進購物車的東西＝拿出來
      if(cart.includes(it)){cart.splice(cart.indexOf(it),1);b.classList.remove('in-cart');sfx.pop();paintTray();return}
      if(errand&&!targets.includes(it)){wrong(b);say('要買'+targets.map(t=>t.n).join('和')+'喔');return}
      if(!errand&&sum()+it.p>money){wrong(b);say('錢不夠喔');return}
      cart.push(it);b.classList.add('in-cart');sfx.pop();paintTray();
      say(it.n+'要'+NUMS[it.p-1]+'個金幣');
      const ready=()=>cart.length&&(errand?targets.every(t=>cart.includes(t)):!canAddMore());
      if(ready())setTimeout(()=>{if(ready())startPay()},1200);
    });
    shelf.append(b);hintItems.push({el:b,it});
  });
  counter.append(tray);if(!errand)counter.append(checkout);
  for(let i=0;i<money;i++){
    const c=div('piece coin');wallet.append(c);coins.push(c);
    const pay=()=>{
      if(finished)return false;
      // 還沒到付錢的時候金幣是暗的，碰到只提醒下一步，不算做錯
      if(phase!=='pay'){say(cart.length?'先結帳喔':'先選要買的東西');return false}
      if(paid>=sum()){wrong(tray);return false}
      paid++;
      if(showSlots)tray.querySelectorAll('.coin-slot')[paid-1].classList.add('coin');else tray.innerHTML+='<i class="coin mini"></i>';
      tone(1250,.08,'triangle');tone(1650,.12,'triangle',.06);buzz(20);say(paid===2?'二':NUMS[paid-1]);
      if(paid===sum()){
        finished=true;
        setTimeout(()=>{
          tray.innerHTML=art('shoppingbag','goods bought')+cart.map(it=>art(it.id,'goods bought')).join('');
          total.innerHTML='';sfx.ok();say('謝謝光臨！');
        },500);
        setTimeout(done,1800);
      }
      return true;
    };
    // 金幣都一樣，重點是數數，所以點一下也能付
    makeDraggable(c,(el,x,y)=>hitTarget([tray],x,y)?pay():false,{over:(x,y)=>phase==='pay'?hitTarget([tray],x,y):null,tap:pay});
  }
  paintTray();
  stage.append(...(req?[req]:[]),shelf,counter,total,wallet);
  setTimeout(()=>say(errand?'幫我買'+targets.map(t=>t.n).join('和'):'你有'+NUMS[money-1]+'個金幣，想買什麼呢？'),250);
  idleHint(()=>{
    if(finished)return;
    if(phase==='pick'){
      const next=hintItems.find(({it})=>!cart.includes(it)&&(errand?targets.includes(it):sum()+it.p<=money));
      if(next)return {tap:next.el};
      if(!errand&&cart.length)return {tap:checkout};
      return;
    }
    if(paid<sum())return {from:coins.find(c=>!c.classList.contains('placed')),to:tray};
  });
  // 貨架和錢包用掉最多高度：跑腿多一排清單；金幣一排 5 個
  return ()=>stage.style.setProperty('--s',sizeFor(stage,Math.min(shelfItems.length,4),(req?.9:0)+Math.ceil(shelfItems.length/4)*1.45+1.55+Math.ceil(money/5)*.85)+'px');
};
