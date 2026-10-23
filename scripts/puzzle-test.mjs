import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Test the production layout and hit mapping without a browser or dependencies.
const context=vm.createContext({GAMES:{}});
vm.runInContext(readFileSync(new URL('../js/games/puzzle.js',import.meta.url),'utf8'),context);
const {puzzleLayout,puzzleCell}=context;
const rect={left:40,top:80,right:340,bottom:380,width:300,height:300};
for(const [level,cols,rows,ghost] of [
  [0,2,1,true],[1,2,1,true],[2,3,1,true],[3,3,1,true],
  [4,2,2,true],[5,2,2,true],[6,2,3,false],[7,2,3,false],[50,2,3,false]
]){
  const layout=puzzleLayout(level);
  assert.deepEqual({...layout},{cols,rows,count:cols*rows,ghost});
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const x=rect.left+(col+.5)*rect.width/cols,y=rect.top+(row+.5)*rect.height/rows;
    assert.equal(puzzleCell(layout,rect,x,y),row*cols+col);
  }
  assert.equal(puzzleCell(layout,rect,rect.left-23,rect.top-23),0,'Generous top-left target');
  assert.equal(puzzleCell(layout,rect,rect.right+23,rect.bottom+23),layout.count-1);
  for(const [x,y] of [[15,100],[365,100],[100,55],[100,405]])
    assert.equal(puzzleCell(layout,rect,x,y),-1,'Outside board must not consume a piece');
  assert.equal(puzzleCell(layout,rect,rect.left+rect.width/cols-1,100),0);
  assert.equal(puzzleCell(layout,rect,rect.left+rect.width/cols+1,100),1,'Adjacent cells stay distinct');
}
console.log('Puzzle tests passed: level boundaries, ghost, row-major cells, and padded hit mapping.');

// Exercise acceptance and delayed completion with lightweight DOM stand-ins.
class Element{
  constructor(cls=''){
    this.className=cls;this.children=[];this.isConnected=true;
    this.style={setProperty:(key,value)=>{this.style[key]=value}};
    this.classList={contains:name=>this.className.split(' ').includes(name),
      add:name=>{this.className+=' '+name}};
  }
  append(...children){this.children.push(...children)}
  getBoundingClientRect(){return rect}
}
function setup(L){
  const stage=new Element(),timers=[],errors=[];
  let completed=0,oks=0,buzzes=0;
  const ctx=vm.createContext({
    GAMES:{},ASSETS:{ruby:{img:'ruby.webp'},cat:{emoji:'🐱'}},PUZZLES:['ruby'],
    pick:a=>a.slice(0,1),shuffle:a=>a.slice().reverse(),div:cls=>new Element(cls),
    round:0,diff:0,makeDraggable:(el,drop)=>{el.drop=(x,y)=>drop(el,x,y)},
    wrong:el=>errors.push(el),sfx:{ok:()=>oks++},buzz:ms=>{assert.equal(ms,30);buzzes++},
    setTimeout:fn=>timers.push(fn),getComputedStyle:()=>({paddingLeft:'12',paddingRight:'12',paddingTop:'6',paddingBottom:'16'})
  });
  vm.runInContext(readFileSync(new URL('../js/games/puzzle.js',import.meta.url),'utf8'),ctx);
  stage.clientWidth=375;stage.clientHeight=591;
  ctx.GAMES.puzzle(stage,L,()=>completed++)();
  const root=stage.children[0],[frame,tray]=root.children,board=frame.children[0];
  return {root,board,tray,timers,errors,completed:()=>completed,oks:()=>oks,buzzes:()=>buzzes};
}
for(const L of [0,2,4,6]){
  const t=setup(L),layout=puzzleLayout(L),pieces=t.tray.children;
  assert.equal(t.board.children[0].style.opacity,layout.ghost?'.25':'0');
  assert.ok(pieces[0].classList.contains('wiggle'));
  assert.equal(pieces[0].drop(0,0),false);
  assert.equal(pieces[0].drop(50,90),false,'Wrong cell rejects piece');
  assert.equal(t.errors.length,1);
  pieces.forEach((piece,i)=>{
    const index=layout.count-1-i;
    const x=rect.left+(index%layout.cols+.5)*rect.width/layout.cols;
    const y=rect.top+(Math.floor(index/layout.cols)+.5)*rect.height/layout.rows;
    assert.equal(piece.drop(x,y),true);
    assert.equal(piece.drop(x,y),false,'Repeated drop cannot count twice');
  });
  assert.equal(t.oks(),layout.count);assert.equal(t.buzzes(),layout.count);
  assert.ok(t.root.classList.contains('puzzle-finished'));
  assert.equal(t.completed(),0,'Wait for happy bounce');
  assert.equal(t.timers.length,1);t.timers[0]();assert.equal(t.completed(),1);
  const size=parseFloat(t.root.style['--s']);
  assert.ok(size*2+(layout.rows-1)*10+30<=569,'Board and tray fit SE stage');
}
const stale=setup(0);
stale.tray.children[0].drop(265,230);stale.tray.children[1].drop(115,230);
stale.root.isConnected=false;stale.timers[0]();
assert.equal(stale.completed(),0,'Leaving cancels delayed completion');
console.log('Puzzle round tests passed: wrong/repeated drops, feedback, completion, stale timer, and SE sizing.');
