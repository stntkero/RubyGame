GAMES.pattern = function(stage,L,done){
  const tpls=L<2?['AB']:L<4?['AB','AAB','ABB']:L<6?['AAB','ABB','ABC','AABB']:['ABC','AABB','AABC','ABBC'];
  const tpl=pick(tpls,1)[0],len=tpl.length;
  const letters=[...new Set(tpl)];
  const items=pick(THINGS,letters.length+1);
  const map={};letters.forEach((l,i)=>map[l]=items[i]);
  const t=2*len+Math.floor(Math.random()*len);
  const answer=map[tpl[t%len]];
  const seq=div('seq');
  for(let i=0;i<t;i++){const c=div('cell');c.innerHTML=`${art(map[tpl[i%len]].id)}`;seq.append(c)}
  const q=div('cell q');q.textContent='?';seq.append(q);
  const opts=div('row');let finished=false,correct;
  shuffle([...letters.map(l=>map[l]),items[letters.length]]).forEach(it=>{
    const b=document.createElement('button');b.className='piece';b.innerHTML=`${art(it.id)}`;
    b.addEventListener('click',()=>{
      if(finished)return;
      if(it.id!==answer.id){wrong(b);return}
      finished=true;q.textContent='';q.innerHTML=`${art(it.id)}`;q.classList.add('filled');
      b.style.visibility='hidden';sfx.ok();buzz(30);say(it.n);setTimeout(done,700);
    });
    opts.append(b);if(it.id===answer.id)correct=b;
  });
  stage.append(seq,opts);
  idleHint(()=>!finished&&{tap:correct});
  return ()=>{
    const N=t+1,W=stage.clientWidth-24,H=stage.clientHeight-24;
    const per=Math.min(N,6),rows=Math.ceil(N/per);
    const c=Math.max(40,Math.min(90,(W-8*(per-1))/per,H/(rows*1.6+2.2)));
    stage.style.setProperty('--c',c+'px');
    stage.style.setProperty('--s',Math.min(120,c*1.35,(W-28)/4)+'px');
  };
};
