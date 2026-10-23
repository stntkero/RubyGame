// Row-major cells; the square picture is divided into columns and rows.
function puzzleLayout(L){
  const cols=L>=8?3:L<2?2:L<4?3:2,rows=L>=10?4:L>=8?3:L<4?1:L<6?2:3;
  return {cols,rows,count:cols*rows,ghost:L<6};
}
function puzzleCell(layout,rect,x,y,pad=24){
  if(x<rect.left-pad||x>rect.right+pad||y<rect.top-pad||y>rect.bottom+pad)return -1;
  const col=Math.max(0,Math.min(layout.cols-1,Math.floor((x-rect.left)/rect.width*layout.cols)));
  const row=Math.max(0,Math.min(layout.rows-1,Math.floor((y-rect.top)/rect.height*layout.rows)));
  return row*layout.cols+col;
}
function puzzlePicture(id){
  const asset=ASSETS[id];
  if(asset.img)return asset.img;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=600;
  const ctx=canvas.getContext('2d');
  ctx.font='460px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(asset.emoji,300,320);
  return canvas.toDataURL();
}
GAMES.puzzle = function(stage,L,done){
  const layout=puzzleLayout(L),{cols,rows,count,ghost}=layout;
  const root=div('puzzle-game'),frame=div('puzzle-frame'),board=div('puzzle-board');
  const guide=div('puzzle-picture'),complete=div('puzzle-picture puzzle-complete');
  const tray=div('puzzle-tray'),cells=[];
  root.style.setProperty('--cols',cols);root.style.setProperty('--rows',rows);
  // url() inside a CSS variable resolves against css/style.css, so pass an absolute URL
  const src=puzzlePicture(pick(PUZZLES,1)[0]),abs=typeof URL==="function"&&document.baseURI?new URL(src,document.baseURI).href:src;
  root.style.setProperty("--picture",`url("${abs}")`);
  guide.style.opacity=ghost?'.25':'0';
  board.append(guide);
  let left=count,finished=false;
  const hintMoves=[];
  const paintTile=(el,index)=>{
    const col=index%cols,row=Math.floor(index/cols);
    el.style.backgroundSize=`${cols*100}% ${rows*100}%`;
    el.style.backgroundPosition=`${cols===1?0:col/(cols-1)*100}% ${rows===1?0:row/(rows-1)*100}%`;
  };
  for(let i=0;i<count;i++){
    const cell=div('puzzle-cell');paintTile(cell,i);cells.push(cell);board.append(cell);
  }
  board.append(complete);frame.append(board);
  shuffle(Array.from({length:count},(_,i)=>i)).forEach((index,i)=>{
    const piece=div('piece puzzle-tile');paintTile(piece,index);
    if(round===0&&diff===1&&i===0)piece.classList.add('wiggle');
    tray.append(piece);
    hintMoves.push({from:piece,to:cells[index]});
    makeDraggable(piece,(el,x,y)=>{
      if(finished||!root.isConnected||cells[index].classList.contains('filled'))return false;
      const target=puzzleCell(layout,board.getBoundingClientRect(),x,y);
      if(target<0)return false;
      if(target!==index){wrong(cells[target]);return false}
      cells[index].classList.add('filled');sfx.ok();buzz(30);
      if(--left===0){
        finished=true;root.classList.add('puzzle-finished');
        setTimeout(()=>{if(root.isConnected)done()},800);
      }
      return true;
    });
  });
  root.append(frame,tray);stage.append(root);
  idleHint(()=>!finished&&hintMoves.find(m=>!m.to.classList.contains('filled')));
  return ()=>{
    const style=getComputedStyle(stage);
    const width=stage.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);
    const height=stage.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
    const size=Math.min(360,width-24-(cols-1)*10,(height-40-(rows-1)*10)/2);
    root.style.setProperty('--s',Math.max(1,size)+'px');
  };
};
