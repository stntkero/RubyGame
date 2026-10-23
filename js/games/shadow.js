GAMES.shadow = function(stage,L,done){
  const n=[2,3,3,4,4,5,5,6,7,7,8,8,8][Math.min(L,12)];
  const decoys=L>=8?3:L>=6?2:L>=4?1:0;              // 多出來、沒有對應圖案的影子
  // A single category makes advanced decoys plausible.
  const candidates=L>=9?THINGS.filter(it=>['dog','cat','rabbit','bear','panda','lion','frog','monkey','pig','chick','unicorn','turtle','elephant','giraffe','whale'].includes(it.id)):THINGS;
  const pool=pick(candidates,n+decoys);
  const items=pool.slice(0,n);
  const top=div('row'),bottom=div('row');
  const targets=shuffle(pool).map(it=>{
    const t=div('slot shadow');t.dataset.key=it.id;t.innerHTML=`${art(it.id)}`;top.append(t);return t;
  });
  let left=n;
  const hintMoves=[];
  shuffle(items).forEach((it,i)=>{
    const p=div('piece');p.innerHTML=`${art(it.id)}`;
    if(round===0&&diff===1&&i===0)p.classList.add('wiggle');
    bottom.append(p);
    hintMoves.push({from:p,to:targets.find(t=>t.dataset.key===it.id)});
    makeDraggable(p,(el,x,y)=>{
      const t=hitTarget(targets.filter(t=>!t.classList.contains('filled')),x,y);
      if(!t)return false;
      if(t.dataset.key!==it.id){wrong(t);return false}
      t.classList.add('filled');sfx.ok();buzz(30);say(it.n);
      if(--left===0)done();
      return true;
    });
  });
  stage.append(top,bottom);
  if(L>=8){top.classList.add('compact-grid');bottom.classList.add('compact-grid')}
  idleHint(()=>hintMoves.find(m=>!m.from.classList.contains('placed')));
  return ()=>{const T=n+decoys,c=Math.min(Math.max(T,n),4);
    stage.style.setProperty('--s',Math.min(L>=10?68:130,sizeFor(stage,c,Math.ceil(T/4)+Math.ceil(n/4)+1.2))+'px')};
};
