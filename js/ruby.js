// Public reusable figure; each small transparent item uses the same anchor as its emoji.
function rubyFigure(extraClass=''){
  const figure=div('ruby-figure '+extraClass);
  figure.innerHTML=art('ruby','ruby-base');
  WEARABLES.filter(it=>homeState.worn[it.slot]===it.id).forEach(it=>{
    const layer=div('ruby-wear ruby-wear-'+it.slot),a=it.anchor;
    layer.style.cssText=`left:${a.x}%;top:${a.y}%;width:${a.size}%;height:${a.size}%;transform:translate(-50%,-50%) rotate(${a.rot}deg)`;
    layer.innerHTML=art(it.id);figure.append(layer);
  });
  return figure;
}
function rubyBounce(el){el.classList.remove('ruby-bounce');void el.offsetWidth;el.classList.add('ruby-bounce')}
function paintHomeRuby(){const b=$('#homeRuby');b.replaceChildren(rubyFigure())}
