const PIG_GOAL=5;
let piggy=store.get('piggy',0),stickers=store.get('stickers',[]),bankBusy=false;
function saveBank(){store.set('stars',stars);store.set('piggy',piggy);store.set('stickers',stickers)}
function renderBank(newest){
  $('#bankStars').textContent=stars;
  const jar=$('#jar');jar.innerHTML='';
  for(let i=0;i<PIG_GOAL;i++){const d=document.createElement('i');if(i<piggy){d.className='on';d.innerHTML=art('star')}jar.append(d)}
  const al=$('#album');al.innerHTML='';
  if(!stickers.length){al.innerHTML='<span class="album-empty">貼紙簿還是空的</span>';return}
  stickers.slice(-80).reverse().forEach((st,i)=>{
    al.insertAdjacentHTML('beforeend',art(EMOJI_IDS[st.e],(st.big?'big ':'')+(newest&&i===0?'new':'')));
  });
}
function openBank(){sfx.pop();renderBank();show('bank')}
function noMoney(){sfx.no();const el=$('#bankStars').parentElement;el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');say('星星不夠了，去玩遊戲賺星星吧')}
$('#bankBtn').addEventListener('click',openBank);
$('#starsBtn').addEventListener('click',openBank);
$('#spendBtn').addEventListener('click',()=>{
  if(bankBusy)return;
  if(stars<1){noMoney();return}
  stars--;stickers.push({e:ASSETS[pick(SMALL,1)[0]].emoji});saveBank();
  sfx.ok();say('換到一張貼紙');renderBank(true);
});
$('#saveBtn').addEventListener('click',()=>{
  if(bankBusy)return;
  if(stars<1){noMoney();return}
  stars--;piggy++;
  tone(1250,.08,'triangle');tone(1650,.12,'triangle',.06);buzz(20);
  const pig=$('#pig');pig.classList.remove('bounce');void pig.offsetWidth;pig.classList.add('bounce');
  if(piggy>=PIG_GOAL){
    const prize=pick(RARE,1)[0];
    renderBank();bankBusy=true;
    setTimeout(()=>{
      piggy=0;stickers.push({e:ASSETS[prize].emoji,big:true});saveBank();
      sfx.win();say('存滿了！得到超級大獎！');cheer(prize,true);renderBank(true);
      setTimeout(()=>{$('#cheer').hidden=true;bankBusy=false},2600);
    },500);
  }else{say(NUMS[piggy-1]);renderBank()}
  saveBank();
});
