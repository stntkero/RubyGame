GAMES.size = function(stage,L,done){
  const n=L<2?3:L<5?4:5,hint=L<4;
  const it=pick(THINGS,1)[0];
  const k=i=>(.4+.6*i/(n-1)).toFixed(2);
  const bar=div('scale-hint');
  bar.innerHTML=`${art(it.id, 'small-hint')}${art('arrow', 'arrow')}${art(it.id)}`;
  const top=div('row'),bottom=div('row');
  const slots=[];
  for(let i=0;i<n;i++){
    const sl=div('slot'+(hint?' shadow':''));sl.dataset.rank=i;
    sl.style.setProperty('--k',k(i));
    if(hint)sl.innerHTML=art(it.id);
    top.append(sl);slots.push(sl);
  }
  let left=n;
  const hintMoves=[];
  shuffle([...Array(n).keys()]).forEach((r,j)=>{
    const p=div('piece');p.style.setProperty('--k',k(r));p.innerHTML=art(it.id);
    if(round===0&&diff===1&&j===0)p.classList.add('wiggle');
    bottom.append(p);
    hintMoves.push({from:p,to:slots[r]});
    makeDraggable(p,(el,x,y)=>{
      const sl=hitTarget(slots.filter(s=>!s.classList.contains('filled')),x,y);
      if(!sl)return false;
      if(+sl.dataset.rank!==r){wrong(sl);return false}
      sl.innerHTML=art(it.id);sl.classList.add('filled');
      sfx.ok();buzz(30);
      if(--left===0)done();
      return true;
    });
  });
  stage.append(bar,top,bottom);
  idleHint(()=>hintMoves.find(m=>!m.from.classList.contains('placed')&&m.to===slots.find(s=>!s.classList.contains('filled'))));
  return ()=>stage.style.setProperty('--s',sizeFor(stage,Math.min(n,5),3.6)+'px');
};
