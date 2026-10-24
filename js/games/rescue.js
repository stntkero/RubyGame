// 救援大隊：先選一台車，再進入那台車的小遊戲
//   消防車 → fire（點火焰噴水滅火）
//   救護車 → bandage（幫受傷的小動物貼 OK 繃）
//   警車　 → maze（走迷宮帶迷路的小狗回家）
const RESCUE_MISSIONS=[
  {game:'fire',car:'fire_truck',label:'滅火',c:'#FFB3A7'},
  {game:'bandage',car:'ambulance',label:'貼OK繃',c:'#FFD6E7'},
  {game:'maze',car:'police_car',label:'走迷宮',c:'#B5E3FF'}
];
GAMES.rescue = function(stage){
  const root=div('rescue-hub');
  RESCUE_MISSIONS.forEach(m=>{
    const b=document.createElement('button');b.className='game-btn rescue-pick';b.style.setProperty('--c',m.c);
    b.innerHTML=`${art(m.car)}<span>${m.label}</span>`;b.setAttribute('aria-label',m.label);
    b.addEventListener('click',()=>{sfx.pop();startGame(m.game)});
    root.append(b);
  });
  stage.append(root);
  say('要開哪一台車去救援呢？');
  return ()=>{};
};
