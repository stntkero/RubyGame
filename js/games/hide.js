// Each spot owns a disjoint percentage cell, including its peek and reveal.
function hideLevel(L){
  const kittens=L<4?2:L<6?3:L<8?4:L<10?5:6;
  return {spots:kittens*2,kittens,ears:L>=8,tails:L>=6};
}
function hideLayout(L,landscape=false){
  const {spots}=hideLevel(L);
  const cols=landscape?(spots===6?3:spots===10?5:4):(spots<=8?2:3);
  const rows=Math.ceil(spots/cols);
  return Array.from({length:spots},(_,i)=>({
    x:(i%cols+.08)*100/cols,y:(Math.floor(i/cols)+.06)*100/rows,
    w:84/cols,h:88/rows
  }));
}
GAMES.hide=function(stage,L,done){
  const level=hideLevel(L),g=gen;
  const root=div('hide-game'),counter=div('hide-counter'),scene=div('hide-scene');
  counter.setAttribute('role','img');
  const colors=['white','gray','black','calico','orange'];
  const types=shuffle(['bush','flower_pot','box','basket','tree_trunk','curtain','slide','sofa','barrel','umbrella']);
  const occupied=new Set(pick(Array.from({length:level.spots},(_,i)=>i),level.kittens));
  const slots=[],spots=[];
  let found=0,finished=false,completed=false,voice=0,kittenIndex=0;
  const valid=()=>g===gen&&root.isConnected;
  const later=(fn,ms)=>setTimeout(()=>{if(valid())fn()},ms);
  const paintCounter=()=>counter.setAttribute('aria-label',`找到${found}隻，共${level.kittens}隻小貓`);
  for(let i=0;i<level.kittens;i++){
    const slot=div('hide-count');slot.innerHTML=art(`kitten_full_${colors[i%colors.length]}`);
    slots.push(slot);counter.append(slot);
  }
  for(let i=0;i<level.spots;i++){
    const hasKitten=occupied.has(i),tail=hasKitten&&level.tails&&kittenIndex%2===0;
    if(hasKitten)kittenIndex++;
    const color=pick(tail?['gray','black','orange']:colors,1)[0];
    const button=document.createElement('button');button.type='button';button.className='hide-spot';
    button.setAttribute('aria-label','找找看');
    button.style.setProperty('--mirror',L>=10&&i%2?-1:1);
    button.style.setProperty('--size',L>=10?(i%2?.87:1):1);
    const cover=div('hide-cover');cover.innerHTML=art(types[i%types.length]);
    const full=div('hide-full');full.innerHTML=art(`kitten_full_${color}`);full.hidden=true;
    if(hasKitten){
      const peek=div('hide-peek'+(tail?' hide-tail':level.ears?' hide-ears':' hide-head'));
      peek.innerHTML=art((tail?'kitten_tail_':'kitten_peek_head_')+color);button.append(peek);
    }
    button.append(cover,full);scene.append(button);
    const spot={button,hasKitten,found:false};spots.push(spot);
    button.addEventListener('click',()=>{
      if(!valid()||finished||spot.found)return;
      if(!hasKitten){
        cover.classList.remove('hide-wiggle');void cover.offsetWidth;cover.classList.add('hide-wiggle');
        tone(400,.12,'sine',0,.06);return;
      }
      spot.found=true;found++;const v=++voice;
      button.classList.add('hide-found');button.setAttribute('aria-label','找到了！');
      full.hidden=false;slots[found-1].innerHTML=art(`kitten_full_${color}`);
      slots[found-1].classList.add('filled');paintCounter();sfx.ok();say('找到了！');
      later(()=>{if(v===voice)say(found===2?'二':NUMS[found-1])},850);
      if(found===level.kittens){
        finished=true;stopHint();
        later(()=>{
          say('全部找到了！');
          later(()=>{if(!completed){completed=true;done()}},1500);
        },1800);
      }
    });
  }
  root.append(counter,scene);stage.append(root);paintCounter();
  say('找出'+NUMS[level.kittens-1]+'隻小貓');
  const stopHint=idleHint(()=>{
    if(!valid()||finished)return;
    const next=spots.find(s=>s.hasKitten&&!s.found);
    if(next)return {tap:next.button};
  });
  return ()=>{
    if(!valid())return;
    const layout=hideLayout(L,scene.clientWidth>scene.clientHeight);
    layout.forEach((box,i)=>{
      const style=spots[i].button.style;
      style.left=box.x+'%';style.top=box.y+'%';style.width=box.w+'%';style.height=box.h+'%';
    });
    root.style.setProperty('--hide-s',Math.min(scene.clientWidth*layout[0].w/100,scene.clientHeight*layout[0].h/100)+'px');
  };
};
