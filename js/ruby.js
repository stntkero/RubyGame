// Public reusable figure; each small transparent item uses the same anchor as its emoji.
function rubyFigure(extraClass=''){
  const figure=div('ruby-figure '+extraClass);
  figure.innerHTML=art('ruby','ruby-base');
  WEARABLES.filter(it=>homeState.worn[it.id]).forEach(it=>{
    const layer=div('ruby-wear ruby-wear-'+it.slot),a=it.anchor;layer.dataset.wear=it.id;
    const fit=typeof WEAR_FIT!=='undefined'&&WEAR_FIT[it.id];
    if(fit){layer.classList.add('ruby-wear-fit');layer.innerHTML=`<img class="art" src="${fit}" alt="" draggable="false">`}
    else{layer.style.cssText=`left:${a.x}%;top:${a.y}%;width:${a.size}%;height:${a.size}%;transform:translate(-50%,-50%) rotate(${a.rot}deg)`;layer.innerHTML=art(it.id)}
    figure.append(layer);
  });
  return figure;
}
function rubyBounce(el){if(reduceMotion)return;el.classList.remove('ruby-bounce');void el.offsetWidth;el.classList.add('ruby-bounce')}
let homeRubySleeping=false,homeRubyIdleTimer=0;
function paintHomeRuby(){
  const b=$('#homeRuby');
  if(homeRubySleeping)b.innerHTML=art('ruby_sleep','home-ruby-sleep');
  else b.replaceChildren(rubyFigure());
}
function resetHomeRubyIdle(){
  clearTimeout(homeRubyIdleTimer);homeRubyIdleTimer=0;
  if(homeRubySleeping){homeRubySleeping=false;paintHomeRuby();rubyBounce($('#homeRuby').firstElementChild)}
  if(!$('#home').hidden){
    homeRubyIdleTimer=setTimeout(()=>{
      homeRubyIdleTimer=0;
      if($('#home').hidden)return;
      homeRubySleeping=true;paintHomeRuby();
    },60000);
  }
}
['pointerdown','pointermove','pointerup'].forEach(type=>document.addEventListener(type,resetHomeRubyIdle,{passive:true,capture:true}));
