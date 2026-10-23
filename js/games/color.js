GAMES.color = function(stage,L,done){
  const nc=[2,2,3,3,3,4,4,4,5,5,6,6][Math.min(L,11)],per=L>=4?3:2; // 超級挑戰最多 6 種顏色
  const cols=pick(COLORS,nc);
  const top=div('row'),bottom=div('row');
  const baskets=cols.map(c=>{
    const b=div('basket');b.dataset.key=c.k;b.style.setProperty('--bc',c.c);top.append(b);return b;
  });
  let left=nc*per;
  const hintMoves=[];
  const balls=shuffle(cols.flatMap(c=>Array(per).fill(c)));
  balls.forEach((c,i)=>{
    const p=div('piece ball');p.style.setProperty('--bc',c.c);p.setAttribute('aria-label',c.n);
    if(round===0&&diff===0&&i===0)p.classList.add('wiggle');
    bottom.append(p);
    hintMoves.push({from:p,to:baskets.find(b=>b.dataset.key===c.k)});
    makeDraggable(p,(el,x,y)=>{
      const b=hitTarget(baskets,x,y);
      if(!b)return false;
      if(b.dataset.key!==c.k){wrong(b);return false}
      const m=div('mini ball');m.style.setProperty('--bc',c.c);b.append(m);
      sfx.ok();buzz(30);say(c.n);
      if(--left===0)done();
      return true;
    });
  });
  stage.append(top,bottom);
  idleHint(()=>hintMoves.find(m=>!m.from.classList.contains('placed')));
  // 球多（超級挑戰最多 18 顆）時一排放 6 顆；籃子寬 1.3 倍，一排最多 3～4 個
  return ()=>{
    const balls=nc*per,perRow=balls>8?6:Math.min(balls,4),basketRows=Math.ceil(nc/(nc>4?3:4));
    stage.style.setProperty('--s',sizeFor(stage,Math.max(perRow,nc>4?3*1.3:Math.min(nc,4)*1.3),basketRows*1.3+Math.ceil(balls/perRow)+1.2)+'px');
  };
};
