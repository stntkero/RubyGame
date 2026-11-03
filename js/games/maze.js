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
// 骨頭平均放在通往狗屋的路上（不含起點和狗屋）：一定會經過，邊走邊吃，也順便引導方向
function mazeBones(walls,n,count){
  const route=mazePath(walls,n,0,n*n-1),middle=route.slice(1,-1);
  const out=[];
  for(let k=1;k<=count&&middle.length;k++){
    const c=middle[Math.min(middle.length-1,Math.round(k*(middle.length+1)/(count+1))-1)];
    if(!out.includes(c))out.push(c);
  }
  return out;
}
// 只畫格子之間的牆（最外圈由棋盤邊框負責）；同一條線畫一次、圓頭，轉角才接得整齊
function mazeWallPath(walls,n){
  let d='';
  walls.forEach((w,i)=>{
    const x=i%n,y=Math.floor(i/n);
    if(w.r&&x<n-1)d+=`M${x+1} ${y}V${y+1}`;
    if(w.b&&y<n-1)d+=`M${x} ${y+1}H${x+1}`;
  });
  return d;
}
GAMES.maze = function(stage,L,done){
  const lv=mazeLevel(L),n=lv.n,g=gen,walls=makeMaze(n),goal=n*n-1;
  const root=div('maze-game'),board=div('maze-board');
  const valid=()=>g===gen&&root.isConnected;
  const later=(fn,ms)=>setTimeout(()=>{if(valid())fn()},ms);
  board.style.setProperty('--n',n);
  const cells=walls.map((w,i)=>{
    const c=div('maze-cell');c.dataset.i=i;board.append(c);return c;
  });
  const wallLayer=div('maze-walls');
  wallLayer.innerHTML=`<svg viewBox="0 0 ${n} ${n}" preserveAspectRatio="none" aria-hidden="true"><path d="${mazeWallPath(walls,n)}"/></svg>`;
  board.append(wallLayer);
  cells[goal].innerHTML=art('dog_house','maze-home');
  const bones=new Set(mazeBones(walls,n,lv.bones));
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
  // 手指到的格子如果沿著路走兩步以內就到得了，小狗就走過去：手指滑太快不會把小狗丟下，
  // 而且被牆隔開的格子至少要繞三步，所以不會穿牆
  const walkTo=c=>{
    const path=mazePath(walls,n,at,c);
    if(path.length<2||path.length>3)return false;
    path.slice(1).forEach(step);
    return true;
  };
  let dragging=false,blocked=-1;
  // 格子在邊框裡面，所以用內側寬高換算；手指壓在邊框上算最靠邊的那一格
  const cellAt=(x,y)=>{
    const r=board.getBoundingClientRect();
    if(x<r.left||x>r.right||y<r.top||y>r.bottom)return -1;
    const index=(p,size)=>Math.max(0,Math.min(n-1,Math.floor(p/size*n)));
    return index(y-r.top-board.clientTop,board.clientHeight)*n+index(x-r.left-board.clientLeft,board.clientWidth);
  };
  board.addEventListener('pointerdown',e=>{
    if(finished)return;e.preventDefault();
    const c=cellAt(e.clientX,e.clientY);
    // 手指放在哪裡都可以開始拖，不一定要剛好按在小狗身上
    dragging=true;blocked=-1;try{board.setPointerCapture(e.pointerId)}catch(_){}
    if(c===at){sfx.pop();return}
    if(c>=0&&!walkTo(c))blocked=c;
  });
  board.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const c=cellAt(e.clientX,e.clientY);if(c<0||c===at)return;
    if(c!==blocked)blocked=-1;
    walkTo(c);
  });
  // 只點一下而且走不過去，才晃一下那一格
  board.addEventListener('pointerup',()=>{dragging=false;if(blocked>=0&&!finished)wrong(cells[blocked]);blocked=-1});
  board.addEventListener('pointercancel',()=>{dragging=false;blocked=-1});
  root.append(car,board);stage.append(root);
  say('小狗迷路了，帶牠回家吧！');
  idleHint(()=>{
    if(finished||!valid())return;
    const path=mazePath(walls,n,at,goal);return path[1]!==undefined?{from:pup,to:cells[path[1]]}:undefined;
  });
  return ()=>{
    const W=stage.clientWidth-24,H=stage.clientHeight-24;
    root.style.setProperty('--board',Math.floor(Math.min(W,H-96,560)/n)*n+'px');
  };
};
