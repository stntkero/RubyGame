GAMES.memory = function(stage,L,done){
  const pairs=[2,3,3,4,4,5,6,6][Math.min(L,7)];
  const faces=pick(THINGS,pairs);
  const deck=shuffle([...faces,...faces]);
  const grid=div('grid');
  let open=[],lock=false,matched=0;
  const cards=[];
  deck.forEach(it=>{
    const c=document.createElement('button');c.className='card';c.setAttribute('aria-label','卡片');
    c.innerHTML=`<div class="in"><div class="face back"></div><div class="face front">${art(it.id)}</div></div>`;
    c.addEventListener('click',()=>{
      if(lock||c.classList.contains('up'))return;
      c.classList.add('up');sfx.pop();open.push({c,it});
      if(open.length<2)return;
      const [a,b]=open;open=[];
      if(a.it.id===b.it.id){
        setTimeout(()=>{a.c.classList.add('matched');b.c.classList.add('matched');sfx.ok();buzz(30);say(a.it.n)},350);
        matched++;if(matched===pairs)setTimeout(done,500);
      }else{
        lock=true;
        setTimeout(()=>{a.c.classList.remove('up');b.c.classList.remove('up');lock=false},1000);
      }
    });
    grid.append(c);cards.push({c,it});
  });
  stage.append(grid);
  idleHint(()=>{
    if(lock)return;
    const next=cards.find(({c,it})=>!c.classList.contains('up')&&(!open.length||it.id===open[0].it.id));
    if(next)return {tap:next.c};
  });
  return ()=>{
    const N=deck.length,W=stage.clientWidth-24,H=stage.clientHeight-24,g=12;
    let best=60,bestCols=2;
    [2,3,4,5].filter(c=>N%c===0).forEach(cols=>{
      const rows=N/cols,s=Math.min((W-g*(cols-1))/cols,(H-g*(rows-1))/rows,170);
      if(s>best){best=s;bestCols=cols}
    });
    grid.style.gridTemplateColumns=`repeat(${bestCols},auto)`;
    stage.style.setProperty('--s',Math.floor(best)+'px');
  };
};
