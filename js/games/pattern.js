GAMES.pattern = function(stage,L,done){
  const tpls=L<2?['AB']:L<4?['AB','AAB','ABB']:L<6?['AAB','ABB','ABC','AABB']:L<8?['ABC','AABB','AABC','ABBC']:['ABCD','AABC','ABAC','AABBC','ABCC'];
  const tpl=pick(tpls,1)[0],len=tpl.length;
  const letters=[...new Set(tpl)];
  const items=pick(THINGS,letters.length+1);
  const map={};letters.forEach((l,i)=>map[l]=items[i]);
  const t=2*len+Math.floor(Math.random()*len);
  const answer=map[tpl[t%len]];
  const seq=div('seq');
  for(let i=0;i<t;i++){const c=div('cell');c.innerHTML=`${art(map[tpl[i%len]].id)}`;seq.append(c)}
  const q=div('cell q');q.textContent='?';seq.append(q);
  const opts=div('row');let finished=false,correct,draggedAt=-1e9;
  const choices=shuffle([...letters.map(l=>map[l]),items[letters.length]]);
  // 選項長得和其他遊戲可以拖的方塊一樣，所以點一下或拖到問號上都算
  const choose=(it,b)=>{
    if(finished)return false;
    if(it.id!==answer.id){wrong(b);return false}
    finished=true;q.textContent='';q.innerHTML=`${art(it.id)}`;q.classList.add('filled');
    b.style.visibility='hidden';sfx.ok();buzz(30);say(it.n);setTimeout(done,700);
    return true;
  };
  choices.forEach(it=>{
    const b=document.createElement('button');b.className='piece';b.innerHTML=`${art(it.id)}`;
    // 放開手指時瀏覽器也會送 click：剛拖完的不算點
    b.addEventListener('click',()=>{if(Date.now()-draggedAt>400)choose(it,b)});
    makeDraggable(b,(el,x,y)=>{draggedAt=Date.now();return hitTarget([q],x,y)?choose(it,b):false},{over:(x,y)=>hitTarget([q],x,y),tap:()=>false});
    opts.append(b);if(it.id===answer.id)correct=b;
  });
  stage.append(seq,opts);
  idleHint(()=>!finished&&{tap:correct});
  return ()=>{
    const N=t+1,W=stage.clientWidth-24,H=stage.clientHeight-24;
    // 每一排剛好是重複單位的倍數，換行後上下對齊，規律一眼就看得出來
    const per=Math.min(N,len*Math.max(1,Math.floor(6/len))),rows=Math.ceil(N/per);
    const c=Math.max(40,Math.min(90,(W-8*(per-1))/per,H/(rows*1.25+1.9)));
    stage.style.setProperty('--c',c+'px');
    seq.style.width=per*c+(per-1)*8+'px';
    stage.style.setProperty('--s',Math.min(120,(W-14*(choices.length-1))/choices.length)+'px');
  };
};
