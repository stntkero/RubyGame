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
  // 配件不限數量：worn 以 id 記錄（舊存檔的 {slot:id} 在讀取時轉換）
  if(state.worn[id])delete state.worn[id];else state.worn[id]=true;
  return true;
}
function homePlace(state,id,x,y){
  if(!ROOM_ITEMS.some(it=>it.id===id)||!state.owned.includes(id)||!Number.isFinite(x)||!Number.isFinite(y))return false;
  state.room=state.room.filter(it=>it.id!==id);
  state.room.push({id,x:Math.max(0,Math.min(100,x)),y:Math.max(0,Math.min(100,y))});return true;
}
function homeStore(state,id){state.room=state.room.filter(it=>it.id!==id)}
let homeState,houseTab='wardrobe',shopOpener=null,roomWalker=null;
// x is Ruby's horizontal centre; y is her feet, measured from the top.
function roomRubyTarget(x,y,width=26,height=40){
  // Leave room for the rotated waddle and accessories above her head.
  const half=Math.min(49,width*.62+1),top=Math.min(98,Math.max(55,height*1.18+1));
  return {x:Math.max(half,Math.min(100-half,Number.isFinite(x)?x:25)),
    y:Math.max(top,Math.min(98,Number.isFinite(y)?y:92))};
}
function roomRubyDepth(y){return 10+Math.round(y)}
// 預設時鐘要包成箭頭函式：直接傳 setTimeout 當物件方法呼叫，瀏覽器會報 Illegal invocation
function roomIdle(callback,clock={setTimeout:(fn,ms)=>setTimeout(fn,ms),clearTimeout:id=>clearTimeout(id),random:()=>Math.random()}){
  let timer=null,disposed=false;
  const pause=()=>{if(timer!==null)clock.clearTimeout(timer);timer=null};
  const reset=()=>{pause();if(!disposed)timer=clock.setTimeout(()=>{timer=null;if(!disposed)callback()},4000+clock.random()*3000)};
  return {reset,pause,dispose(){pause();disposed=true}};
}
function stopRoomRuby(){if(roomWalker){roomWalker.dispose();roomWalker=null}}
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
  if(!shop){b.setAttribute('aria-pressed',String(!!homeState.worn[it.id]))}
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
  stopRoomRuby();
  $('#houseStars').textContent=stars;
  document.querySelectorAll('[data-house-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.houseTab===houseTab)));
  const content=$('#houseContent');content.replaceChildren();
  if(houseTab==='wardrobe'){
    const preview=div('wardrobe-preview'),ruby=rubyFigure('wardrobe-ruby');ruby.id='wardrobeRuby';
    // 點露比身上的配件就直接拿下來
    ruby.addEventListener('click',e=>{const l=e.target.closest('[data-wear]');if(!l)return;homeWear(homeState,l.dataset.wear);saveHome();sfx.pop();renderHouse();rubyBounce($('#wardrobeRuby'))});preview.append(ruby);content.append(preview);
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
  const ruby=rubyFigure('room-ruby');scene.append(ruby);
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
  roomWalker=walkRoomRuby(scene,ruby,content);
}
function walkRoomRuby(scene,ruby,content){
  // The outer figure moves/faces; the inner figure animates all worn layers together.
  const step=div('ruby-figure room-ruby-step');step.append(...ruby.childNodes);ruby.append(step);
  ruby.setAttribute('role','button');ruby.setAttribute('aria-label','和露比打招呼');ruby.tabIndex=0;
  const events=new AbortController(),on=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal:events.signal});
  const saved=store.get('rubyPos',null);
  let pos={x:Number.isFinite(saved?.x)?saved.x:25,y:Number.isFinite(saved?.y)?saved.y:92},size,frame=0,cheerTimer=0,gesture=null,disposed=false;
  const held=new Set();
  const bounds=()=>roomRubyTarget(pos?.x,pos?.y,size.w,size.h);
  const paint=()=>{ruby.style.left=pos.x+'%';ruby.style.bottom=(100-pos.y)+'%';ruby.style.zIndex=roomRubyDepth(pos.y)};
  const save=()=>store.set('rubyPos',{x:pos.x,y:pos.y});
  // 走路分解圖（walk_1～walk_4）：走路時像 GIF 一樣輪流切換，停下來換回站姿
  const WALK=typeof ASSETS==='undefined'?[]:['walk_1','walk_2','walk_3','walk_4'].map(id=>ASSETS[id]&&ASSETS[id].img).filter(Boolean);
  let walkFrame=-1;
  const showWalkFrame=i=>{const img=step.querySelector('img.ruby-base');if(!img||i===walkFrame)return;walkFrame=i;img.src=i<0?ASSETS.ruby.img:WALK[i]};
  const stop=()=>{cancelAnimationFrame(frame);frame=0;ruby.classList.remove('room-walking');step.style.transform='';if(WALK.length)showWalkFrame(-1);save()};
  const clearCheer=()=>{clearTimeout(cheerTimer);cheerTimer=0;step.querySelector('.ruby-base').replaceWith(htmlRuby('ruby'));ruby.classList.remove('room-happy')};
  function htmlRuby(id){const box=div('');box.innerHTML=art(id,'ruby-base');return box.firstElementChild}
  const happy=(cheer=false)=>{
    clearCheer();
    if(cheer){
      // 先把歡呼圖解碼好再換，避免換圖時閃一下空白
      const next=htmlRuby('ruby_cheer');sfx.pop();
      (next.decode?next.decode():Promise.resolve()).catch(()=>{}).then(()=>{if(!disposed&&cheerTimer)step.querySelector('.ruby-base').replaceWith(next)});
    }
    ruby.classList.add('room-happy');cheerTimer=setTimeout(clearCheer,cheer?800:400);
  };
  const walk=(x,y)=>{
    stop();clearCheer();
    const from={...pos},to=roomRubyTarget(x,y,size.w,size.h);
    ruby.style.setProperty('--room-facing',to.x<from.x?-1:1);
    const duration=Math.max(400,Math.hypot(to.x-from.x,(to.y-from.y)*size.ratio)/22*1000);
    ruby.classList.add('room-walking');let start=null;
    const tick=now=>{
      if(disposed)return;
      if(start===null)start=now;
      const t=Math.min(1,(now-start)/duration);
      pos={x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};paint();
      const s=Math.sin((now-start)/175*Math.PI);
      if(WALK.length){showWalkFrame(Math.floor((now-start)/140)%WALK.length);step.style.transform=`translateY(${(-Math.abs(s)*3).toFixed(2)}%)`}
      else step.style.transform=`rotate(${(s*6).toFixed(2)}deg) translateY(${(-Math.abs(s)*6).toFixed(2)}%)`;
      if(t<1)frame=requestAnimationFrame(tick);
      else {stop();happy()}
    };frame=requestAnimationFrame(tick);
  };
  const idle=roomIdle(()=>{
    if(held.size||document.hidden||!$('#houseShop').hidden){idle.reset();return}
    walk(Math.random()*100,55+Math.random()*43);idle.reset();
  });
  const resize=()=>{
    stop();const w=scene.clientWidth,h=scene.clientHeight;
    size={w:ruby.offsetWidth/w*100,h:ruby.offsetHeight/h*100,ratio:h/w};
    pos=bounds();paint();save();
  };
  // ResizeObserver also covers changes in room height without a window resize.
  const observer=new ResizeObserver(resize);resize();observer.observe(scene);
  on(content,'pointerdown',e=>{held.add(e.pointerId);idle.pause();stop()},{capture:true});
  const release=e=>{if(held.delete(e.pointerId)&&!held.size)idle.reset()};
  on(window,'pointerup',release,{capture:true});on(window,'pointercancel',release,{capture:true});
  on(scene,'pointerdown',e=>{
    if(e.button!==0||e.isPrimary===false||gesture||e.target.closest('.room-object,.room-cart'))return;
    e.preventDefault();gesture={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,ruby:!!e.target.closest('.room-ruby')};
    scene.setPointerCapture(e.pointerId);
  });
  on(scene,'pointermove',e=>{if(gesture?.id===e.pointerId&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>=8)gesture.moved=true});
  on(scene,'pointerup',e=>{
    if(gesture?.id!==e.pointerId)return;
    const tap=gesture;gesture=null;
    if(tap.moved||Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>=8)return;
    if(tap.ruby){stop();happy(true)}
    else {const r=scene.getBoundingClientRect();walk((e.clientX-r.left-scene.clientLeft)/scene.clientWidth*100,(e.clientY-r.top-scene.clientTop)/scene.clientHeight*100)}
  });
  const cancel=()=>{gesture=null};on(scene,'pointercancel',cancel);on(scene,'lostpointercapture',cancel);
  on(ruby,'keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();idle.reset();stop();happy(true)}});
  on(document,'visibilitychange',()=>{
    stop();clearCheer();held.clear();gesture=null;
    if(document.hidden)idle.pause();else idle.reset();
  });
  idle.reset();
  return {dispose(){disposed=true;stop();clearCheer();idle.dispose();observer.disconnect();events.abort()}};
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
    if(e.button!==0)return;e.preventDefault();sfx.pop();
    const rect=b.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,wasInRoom=b.classList.contains('in-room');
    b.classList.add('room-dragging');
    // 拖曳時移到最上層，才不會被下方的收納盒蓋住
    document.body.append(b);try{b.setPointerCapture(e.pointerId)}catch(_){}
    b.style.position='fixed';b.style.left=rect.left+'px';b.style.top=rect.top+'px';b.style.transform='none';
    const move=ev=>{b.style.left=rect.left+ev.clientX-sx+'px';b.style.top=rect.top+ev.clientY-sy+'px'};
    const finish=ev=>{
      b.removeEventListener('pointermove',move);b.removeEventListener('pointerup',finish);b.removeEventListener('pointercancel',finish);b.removeEventListener('lostpointercapture',cancel);
      b.remove();
      const tap=ev.type!=='pointercancel'&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<8;
      if(tap&&wasInRoom){homeStore(homeState,id);saveHome();sfx.pop();renderHouse();return}
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
  WEARABLES.forEach(it=>{if(worn&&(worn[it.id]===true||worn[it.slot]===it.id)&&homeState.owned.includes(it.id))homeState.worn[it.id]=true});
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
