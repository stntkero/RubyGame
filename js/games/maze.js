// 警車走迷宮：用手指拖著迷路的小狗，沿著路走回狗屋（也可以點旁邊的格子一步一步走）
function mazeLevel(L){
  if(L<4)return {n:3,bones:0};
  if(L<6)return {n:4,bones:0};
  if(L<8)return {n:5,bones:1};
  if(L<10)return {n:6,bones:2};
  return {n:7,bones:3};
}
// 用「深度優先」挖出一個每格都走得到、只有一條正確路線的迷宮
// walls[i] = {t,r,b,l}：true 代表那一邊有樹叢擋住
function makeMaze(n,rand=Math.random){
  const walls=Array.from({length:n*n},()=>({t:true,r:true,b:true,l:true})),seen=new Set([0]),stack=[0];
  const dirs=[['t',-n,'b'],['r',1,'l'],['b',n,'t'],['l',-1,'r']];
  while(stack.length){
    const c=stack[stack.length-1],x=c%n,y=Math.floor(c/n);
    const options=dirs.filter(([d,o])=>{
      const nx=x+(d==='r')-(d==='l'),ny=y+(d==='b')-(d==='t');
      return nx>=0&&ny>=0&&nx<n&&ny<n&&!seen.has(c+o);
    });
    if(!options.length){stack.pop();continue}
    const [d,o,back]=options[Math.floor(rand()*options.length)];
    walls[c][d]=false;walls[c+o][back]=false;seen.add(c+o);stack.push(c+o);
  }
  return walls;
}
// 兩格相鄰而且中間沒有牆，才能走過去
function mazeCanMove(walls,n,a,b){
  if(b===a+1&&a%n!==n-1)return !walls[a].r;
  if(b===a-1&&a%n!==0)return !walls[a].l;
  if(b===a+n)return !walls[a].b;
  if(b===a-n)return !walls[a].t;
  return false;
}
// 從 a 到 b 的路線（提示用）
function mazePath(walls,n,a,b){
  const prev=new Map([[a,-1]]),q=[a];
  while(q.length){const c=q.shift();if(c===b)break;for(const d of [1,-1,n,-n]){const x=c+d;if(x>=0&&x<n*n&&!prev.has(x)&&mazeCanMove(walls,n,c,x)){prev.set(x,c);q.push(x)}}}
  const path=[];for(let c=b;c!==-1&&c!==undefined;c=prev.get(c))path.unshift(c);return path;
}
GAMES.maze = function(stage,L,done){
  const lv=mazeLevel(L),n=lv.n,g=gen,walls=makeMaze(n),goal=n*n-1;
  const root=div('maze-game'),board=div('maze-board');
  const valid=()=>g===gen&&root.isConnected;
  const later=(fn,ms)=>setTimeout(()=>{if(valid())fn()},ms);
  board.style.setProperty('--n',n);
  const cells=walls.map((w,i)=>{
    const c=div('maze-cell');['t','r','b','l'].forEach(d=>{if(w[d])c.classList.add('w'+d)});
    c.dataset.i=i;board.append(c);return c;
  });
  cells[goal].innerHTML=art('dog_house','maze-home');
  // 骨頭放在離起點最遠的幾個死路裡（撿到有獎勵音效，不撿也能過關）
  const deadEnds=cells.map((c,i)=>i).filter(i=>i!==0&&i!==goal&&['t','r','b','l'].filter(d=>walls[i][d]).length===3);
  const bones=new Set(pick(deadEnds,lv.bones));
  bones.forEach(i=>cells[i].insertAdjacentHTML('beforeend',art('bone','maze-bone')));
  const pup=div('maze-pup');pup.innerHTML=art('dog');board.append(pup);
  const car=div('maze-car');car.innerHTML=art('police_car');
  let at=0,finished=false;
  const place=()=>{pup.style.setProperty('--x',at%n);pup.style.setProperty('--y',Math.floor(at/n))};
  place();
  const step=to=>{
    if(finished||!valid()||!mazeCanMove(walls,n,at,to))return false;
    cells[at].classList.add('visited');at=to;place();tone(660+((at*37)%5)*60,.06,'triangle',0,.1);
    if(bones.has(at)){bones.delete(at);cells[at].querySelector('.maze-bone')?.remove();tone(1320,.1,'triangle');tone(1760,.14,'triangle',.08);say('骨頭！')}
    if(at===goal){
      finished=true;pup.classList.add('home');sfx.ok();buzz(40);
      later(()=>{say('回到家了！謝謝警車！');later(done,1500)},300);
    }
    return true;
  };
  // 拖曳：手指經過的格子如果和小狗相鄰又沒有牆擋，小狗就走過去
  let dragging=false;
  const cellAt=(x,y)=>{const r=board.getBoundingClientRect();const cx=Math.floor((x-r.left)/r.width*n),cy=Math.floor((y-r.top)/r.height*n);return cx<0||cy<0||cx>=n||cy>=n?-1:cy*n+cx};
  board.addEventListener('pointerdown',e=>{
    if(finished)return;e.preventDefault();
    const c=cellAt(e.clientX,e.clientY);
    if(c===at){dragging=true;try{board.setPointerCapture(e.pointerId)}catch(_){}sfx.pop();return}
    // 點旁邊的格子：走一步；走不過去就晃一下
    if(c>=0&&!step(c)&&c!==at)wrong(cells[c]);
  });
  board.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const c=cellAt(e.clientX,e.clientY);if(c<0||c===at)return;
    // 手指移動很快時，沿著直線一格一格補上
    const path=mazePath(walls,n,at,c);
    if(path.length===2)step(c);
  });
  const stop=()=>{dragging=false};
  board.addEventListener('pointerup',stop);board.addEventListener('pointercancel',stop);
  root.append(car,board);stage.append(root);
  say('小狗迷路了，帶牠回家吧！');
  idleHint(()=>{
    if(finished||!valid())return;
    const path=mazePath(walls,n,at,goal);return path[1]!==undefined?{from:pup,to:cells[path[1]]}:undefined;
  });
  return ()=>{
    const W=stage.clientWidth-24,H=stage.clientHeight-24;
    root.style.setProperty('--board',Math.floor(Math.min(W,H-80,560)/n)*n+'px');
  };
};
