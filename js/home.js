// Pure state operations are also exercised by scripts/home-test.mjs.
const HOME_PRICES={small:1,medium:3,large:5};
const HOME_ITEMS=[...WEARABLES,...ROOM_ITEMS];
const homeItem=id=>HOME_ITEMS.find(it=>it.id===id);
function homePrice(id){return HOME_PRICES[homeItem(id)?.tier]}
function migrateHome(storage,balance){
  if(storage.get('migratedHome',false))return balance;
  const refund=Number(storage.get('piggy',0));
  balance+=Number.isFinite(refund)?Math.max(0,Math.min(4,Math.floor(refund))):0;
  storage.set('stars',balance);storage.set('piggy',0);storage.set('migratedHome',true);
  return balance;
}
function homeBuy(state,id){
  const price=homePrice(id);
  if(!price||state.owned.includes(id)||state.stars<price)return false;
  state.stars-=price;state.owned.push(id);return true;
}
function homeWear(state,id){
  const it=WEARABLES.find(it=>it.id===id);
  if(!it||!state.owned.includes(id))return false;
  if(state.worn[it.slot]===id)delete state.worn[it.slot];else state.worn[it.slot]=id;
  return true;
}
function homePlace(state,id,x,y){
  if(!ROOM_ITEMS.some(it=>it.id===id)||!state.owned.includes(id)||!Number.isFinite(x)||!Number.isFinite(y))return false;
  state.room=state.room.filter(it=>it.id!==id);
  state.room.push({id,x:Math.max(0,Math.min(100,x)),y:Math.max(0,Math.min(100,y))});return true;
}
function homeStore(state,id){state.room=state.room.filter(it=>it.id!==id)}
let homeState,houseTab='wardrobe',shopOpener=null;
function saveHome(){
  stars=homeState.stars;
  for(const key of ['stars','owned','worn','room'])store.set(key,homeState[key]);
  $('#houseStars').textContent=stars;$('#starCount').textContent=stars;
}
function homePriceTag(id){return `<span class="home-price" aria-hidden="true">${art('star').repeat(homePrice(id))}</span>`}
function homePurchase(id,button){
  if(!homeBuy(homeState,id)){wrong(button);say('星星不夠，再去玩遊戲吧');return false}
  saveHome();tone(1250,.08,'triangle');tone(1650,.12,'triangle',.06);
  if(!reduceMotion)confetti(24);say('買到了！');return true;
}
function homeItemButton(it,shop=false){
  const b=document.createElement('button'),owned=homeState.owned.includes(it.id);
  b.className='home-item';b.dataset.item=it.id;
  b.setAttribute('aria-label',it.n+(owned?'，已擁有':`，${homePrice(it.id)}顆星星`));
  b.innerHTML=art(it.id)+(owned?'<span class="owned-mark" aria-hidden="true">✓</span>':homePriceTag(it.id));
  if(!shop){b.setAttribute('aria-pressed',String(homeState.worn[it.slot]===it.id))}
  b.addEventListener('click',()=>{
    if(shop){
      if(owned){sfx.pop();return}
      if(homePurchase(it.id,b)){renderHouse();closeHomeShop();const target=$(`[data-tray-item="${it.id}"]`);if(target)rubyBounce(target)}
    }else{
      if(!owned&&!homePurchase(it.id,b))return;
      homeWear(homeState,it.id);saveHome();sfx.pop();renderHouse();rubyBounce($('#wardrobeRuby'));
    }
  });return b;
}
function renderHouse(){
  $('#houseStars').textContent=stars;
  document.querySelectorAll('[data-house-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.houseTab===houseTab)));
  const content=$('#houseContent');content.replaceChildren();
  if(houseTab==='wardrobe'){
    const preview=div('wardrobe-preview'),ruby=rubyFigure('wardrobe-ruby');ruby.id='wardrobeRuby';preview.append(ruby);content.append(preview);
    const grid=div('wardrobe-grid');WEARABLES.forEach(it=>grid.append(homeItemButton(it)));content.append(grid);
  }else if(houseTab==='room')renderRoom(content);
  else{
    const album=div('album');album.setAttribute('aria-label','貼紙簿');
    const stickers=store.get('stickers',[]);
    if(!stickers.length)album.innerHTML=art('sticker_album','empty-album');
    stickers.slice().reverse().forEach(st=>{
      const id=EMOJI_IDS[st.e];
      if(id)album.insertAdjacentHTML('beforeend',art(id,st.big?'big':''));
      else {const e=document.createElement('span');e.className='emoji'+(st.big?' big':'');e.textContent=st.e;album.append(e)}
    });content.append(album);
  }
}
function renderRoom(content){
  const scene=div('room-scene');scene.id='roomScene';scene.setAttribute('aria-label','露比的房間');
  scene.append(rubyFigure('room-ruby'));
  const cart=document.createElement('button');cart.className='icon-btn room-cart';cart.setAttribute('aria-label','商店');cart.innerHTML=art('cart');cart.onclick=openHomeShop;scene.append(cart);
  const tray=div('room-tray');tray.id='roomTray';tray.setAttribute('aria-label','收納盒，把家具拖進房間');
  tray.innerHTML=art('store_tray','tray-hint');
  ROOM_ITEMS.filter(it=>homeState.owned.includes(it.id)).forEach(it=>{
    const placement=homeState.room.find(p=>p.id===it.id),b=document.createElement('button');
    b.className='room-object tier-'+it.tier;b.dataset.id=it.id;b.setAttribute('aria-label',it.n+'，拖曳移動');b.innerHTML=art(it.id);
    if(placement){positionRoomObject(b,placement);scene.append(b)}
    else {b.dataset.trayItem=it.id;tray.append(b)}
    roomDraggable(b,it.id,scene,tray);
  });content.append(scene,tray);
}
// Coordinates are percentages of the scene. Visual clamps keep whole targets reachable after resize.
function positionRoomObject(b,p){
  b.classList.add('in-room');b.style.left=`clamp(var(--half), ${p.x}%, calc(100% - var(--half)))`;
  b.style.top=`clamp(var(--half), ${p.y}%, calc(100% - var(--half)))`;
  // 越下面的東西越靠前（露比站在 y≈80）；地毯永遠貼地在最底層
  b.style.zIndex=b.dataset.id==="room_rug"?2:10+Math.round(p.y);
}
function roomDraggable(b,id,scene,tray){
  b.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;e.preventDefault();b.setPointerCapture(e.pointerId);sfx.pop();
    const rect=b.getBoundingClientRect(),sx=e.clientX,sy=e.clientY;
    b.classList.add('room-dragging');
    b.style.position='fixed';b.style.left=rect.left+'px';b.style.top=rect.top+'px';b.style.transform='none';
    const move=ev=>{b.style.left=rect.left+ev.clientX-sx+'px';b.style.top=rect.top+ev.clientY-sy+'px'};
    const finish=ev=>{
      b.removeEventListener('pointermove',move);b.removeEventListener('pointerup',finish);b.removeEventListener('pointercancel',finish);b.removeEventListener('lostpointercapture',cancel);
      if(ev.type!=='pointercancel'){
        const r=scene.getBoundingClientRect(),t=tray.getBoundingClientRect();
        if(ev.clientX>=t.left&&ev.clientX<=t.right&&ev.clientY>=t.top&&ev.clientY<=t.bottom)homeStore(homeState,id);
        else if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom){
          const x=rect.left+ev.clientX-sx+rect.width/2,y=rect.top+ev.clientY-sy+rect.height/2;
          homePlace(homeState,id,(x-r.left)/r.width*100,(y-r.top)/r.height*100);
        }
        saveHome();sfx.pop();
      }
      renderHouse();
    };
    const cancel=()=>finish({type:'pointercancel'});
    b.addEventListener('pointermove',move);b.addEventListener('pointerup',finish);b.addEventListener('pointercancel',finish);b.addEventListener('lostpointercapture',cancel);
  });
}
function openHomeShop(){
  sfx.pop();shopOpener=$('.room-cart');
  const sheet=$('#houseShop');sheet.replaceChildren();sheet.hidden=false;
  const header=div('shop-header'),close=document.createElement('button');close.className='icon-btn';close.setAttribute('aria-label','關閉商店');close.innerHTML=art('close');close.onclick=closeHomeShop;
  header.innerHTML=`<span>${art('cart')} 商店</span>`;header.append(close);sheet.append(header);
  const grid=div('house-shop-grid');ROOM_ITEMS.forEach(it=>grid.append(homeItemButton(it,true)));sheet.append(grid);
  $('#houseContent').inert=true;$('.house-tabs').inert=true;$('#house .bar').inert=true;close.focus();
}
function closeHomeShop(){
  $('#houseShop').hidden=true;$('#houseContent').inert=false;$('.house-tabs').inert=false;$('#house .bar').inert=false;
  if(!shopOpener?.isConnected)shopOpener=$('.room-cart');shopOpener?.focus();
}
function initRubyHome(){
  stars=migrateHome(store,stars);
  const owned=store.get('owned',[]),worn=store.get('worn',{}),room=store.get('room',[]);
  homeState={stars,owned:Array.isArray(owned)?[...new Set(owned.filter(id=>homeItem(id)))]:[],worn:{},room:[]};
  WEARABLES.forEach(it=>{if(worn&&worn[it.slot]===it.id&&homeState.owned.includes(it.id))homeState.worn[it.slot]=it.id});
  if(Array.isArray(room))room.forEach(p=>{if(p)homePlace(homeState,p.id,p.x,p.y)});
  const icons={wardrobe:'wardrobe',room:'room_tab',stickers:'sticker_album'},labels={wardrobe:'衣櫃',room:'房間',stickers:'貼紙'};
  document.querySelectorAll('[data-house-tab]').forEach(b=>{
    b.innerHTML=art(icons[b.dataset.houseTab]);b.onclick=()=>{
      sfx.pop();houseTab=b.dataset.houseTab;renderHouse();
      if(houseTab==='room')say('把家具拖進房間');
    };
  });
  const open=()=>{homeState.stars=stars;sfx.pop();show('house');renderHouse()};
  $('#houseBtn').onclick=open;$('#starsBtn').onclick=open;
  $('#homeRuby').onclick=()=>{sfx.pop();rubyBounce($('#homeRuby').firstElementChild)};
  $('#houseShop').addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeHomeShop();return}
    if(e.key==='Tab'){
      const buttons=[...$('#houseShop').querySelectorAll('button')],first=buttons[0],last=buttons.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  paintHomeRuby();$('#starCount').textContent=stars;
}
