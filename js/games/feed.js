GAMES.feed = function(stage,L,done){
  const showSlots=L<5,min=L<2?1:L<5?2:3;
  const needed=min+Math.floor(Math.random()*((L<2?3:5)-min+1));
  const total=needed+1+Math.floor(Math.random()*3);
  const root=div('feed-game'),top=div('feed-top');
  const ruby=document.createElement('button');
  ruby.className='feed-ruby';ruby.innerHTML=art('ruby');
  ruby.setAttribute('aria-label',showSlots?'露比，再聽一次':'露比，餵好了');
  const request=document.createElement('button');
  request.className='request feed-request';request.innerHTML=art('fish').repeat(needed);
  request.setAttribute('aria-label','再聽一次');
  top.append(ruby,request);
  const bowl=div('feed-bowl'),bowlFish=div('feed-bowl-fish');
  bowl.innerHTML=art('bowl','feed-bowl-art');bowl.append(bowlFish);
  const pile=div('feed-pile');
  const fish=[],fed=[];
  let finished=false,interacted=false;
  // Delayed speech and completion must not escape a round after going home.
  const later=(fn,ms)=>setTimeout(()=>{if(root.isConnected)fn()},ms);
  const ask=()=>say('露比想吃'+NUMS[needed-1]+'條魚');
  const countAloud=()=>say(fed.length===2?'二':NUMS[fed.length-1]||'八');
  const celebrate=()=>{
    if(finished)return;
    finished=true;
    later(()=>{
      ruby.classList.remove('wiggle');ruby.innerHTML=art('ruby_eat');ruby.classList.add('feed-happy');
      sfx.ok();say('好好吃！謝謝你！');
      later(done,1600);
    },500);
  };
  const confirm=()=>{
    if(finished)return;
    interacted=true;
    if(showSlots){ask();return}
    if(fed.length===needed){celebrate();return}
    ruby.innerHTML=art('ruby_comfort');ruby.classList.remove('wiggle');void ruby.offsetWidth;ruby.classList.add('wiggle');
    const missing=needed-fed.length;
    say(missing>0?'還要再'+NUMS[missing-1]+'條':'太多了，拿回去一條');
  };
  ruby.addEventListener('click',confirm);
  request.addEventListener('click',()=>{interacted=true;if(!finished)ask()});
  const renderBowl=newFish=>{
    bowlFish.replaceChildren();
    for(let i=0;i<(showSlots?needed:fed.length);i++){
      const source=fed[i],filled=source!==undefined;
      const item=document.createElement(filled&&!showSlots?'button':'div');
      item.className='feed-fish-slot'+(showSlots?' guided':'')+(filled?' filled':'')+(source===newFish&&filled?' feed-pop':'');
      if(filled){
        item.innerHTML=art('fish');
        if(!showSlots){
          item.setAttribute('aria-label','拿回一條魚');
          item.addEventListener('click',()=>{
            if(finished)return;
            fed.splice(fed.indexOf(source),1);fish[source].classList.remove('placed');
            ruby.classList.remove('wiggle');sfx.pop();renderBowl();
          });
        }
      }
      bowlFish.append(item);
    }
  };
  for(let i=0;i<total;i++){
    const piece=div('piece feed-fish');piece.innerHTML=art('fish');
    piece.setAttribute('aria-label','魚');fish.push(piece);pile.append(piece);
    makeDraggable(piece,(el,x,y)=>{
      if(finished||fed.includes(i)||!root.isConnected||!hitTarget([bowl],x,y,12))return false;
      interacted=true;
      fed.push(i);ruby.classList.remove('wiggle');renderBowl(i);
      tone(1250,.08,'triangle');tone(1650,.12,'triangle',.06);buzz(20);countAloud();
      if(showSlots&&fed.length===needed)celebrate();
      return true;
    });
  }
  root.append(top,bowl,pile);
  if(!showSlots){
    const bell=document.createElement('button');bell.className='icon-btn feed-bell wiggle';
    bell.innerHTML=art('bell');bell.setAttribute('aria-label','餵好了');
    bell.addEventListener('click',()=>{bell.classList.remove('wiggle');confirm()});
    top.append(bell);
  }
  stage.append(root);renderBowl();later(()=>{if(!interacted&&!finished)ask()},1000);
  return ()=>root.style.setProperty('--s',sizeFor(stage,4,6.2)+'px');
};
