GAMES.color = function(stage,L,done){
  const nc=[2,2,3,3,3,4,4,4][Math.min(L,7)],per=L>=4?3:2;
  const cols=pick(COLORS,nc);
  const top=div('row'),bottom=div('row');
  const baskets=cols.map(c=>{
    const b=div('basket');b.dataset.key=c.k;b.style.setProperty('--bc',c.c);top.append(b);return b;
  });
  let left=nc*per;
  const balls=shuffle(cols.flatMap(c=>Array(per).fill(c)));
  balls.forEach((c,i)=>{
    const p=div('piece ball');p.style.setProperty('--bc',c.c);p.setAttribute('aria-label',c.n);
    if(round===0&&diff===0&&i===0)p.classList.add('wiggle');
    bottom.append(p);
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
  return ()=>stage.style.setProperty('--s',sizeFor(stage,Math.min(nc*per,4),1.3+Math.ceil(nc*per/4)+1.2)+'px');
};
