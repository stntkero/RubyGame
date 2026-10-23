// Add an img path to replace an emoji. Classic scripts share plain globals.
const ASSETS = {
  dog: { emoji: '🐶' },
  cat: { emoji: '🐱' },
  rabbit: { emoji: '🐰' },
  bear: { emoji: '🐻' },
  panda: { emoji: '🐼' },
  lion: { emoji: '🦁' },
  frog: { emoji: '🐸' },
  monkey: { emoji: '🐵' },
  pig: { emoji: '🐷' },
  chick: { emoji: '🐥' },
  unicorn: { emoji: '🦄' },
  turtle: { emoji: '🐢' },
  elephant: { emoji: '🐘' },
  giraffe: { emoji: '🦒' },
  whale: { emoji: '🐳' },
  apple: { emoji: '🍎' },
  banana: { emoji: '🍌' },
  strawberry: { emoji: '🍓' },
  watermelon: { emoji: '🍉' },
  car: { emoji: '🚗' },
  rocket: { emoji: '🚀' },
  balloon: { emoji: '🎈' },
  star: { emoji: '⭐' },
  sunflower: { emoji: '🌻' },
  candy: { emoji: '🍬' },
  cookie: { emoji: '🍪' },
  donut: { emoji: '🍩' },
  icecream: { emoji: '🍦' },
  teddy: { emoji: '🧸' },
  party: { emoji: '🎉' },
  glowingstar: { emoji: '🌟' },
  partyface: { emoji: '🥳' },
  rainbow: { emoji: '🌈' },
  clap: { emoji: '👏' },
  heart: { emoji: '💖' },
  lollipop: { emoji: '🍭' },
  blossom: { emoji: '🌸' },
  ladybug: { emoji: '🐞' },
  butterfly: { emoji: '🦋' },
  clover: { emoji: '🍀' },
  ribbon: { emoji: '🎀' },
  cupcake: { emoji: '🧁' },
  hatchingchick: { emoji: '🐣' },
  daisy: { emoji: '🌼' },
  cherries: { emoji: '🍒' },
  soccer: { emoji: '⚽' },
  music: { emoji: '🎵' },
  music_off: { emoji: '🔕' },
  fish: { emoji: '🐟', img: 'assets/game/feed/fish.webp' },
  mushroom: { emoji: '🍄' },
  bee: { emoji: '🐝' },
  crown: { emoji: '👑' },
  castle: { emoji: '🏰' },
  carousel: { emoji: '🎠' },
  fairy: { emoji: '🧚' },
  dragon: { emoji: '🐉' },
  diamond: { emoji: '💎' },
  ferriswheel: { emoji: '🎡' },
  peacock: { emoji: '🦚' },
  home: { emoji: '🏠' },
  soundon: { emoji: '🔊' },
  soundoff: { emoji: '🔇' },
  cards: { emoji: '🃏' },
  puzzle: { emoji: '🧩' },
  palette: { emoji: '🎨' },
  store: { emoji: '🏪' },
  repeat: { emoji: '🔁' },
  ruler: { emoji: '📏' },
  cart: { emoji: '🛒' },
  purse: { emoji: '👛' },
  shoppingbag: { emoji: '🛍️' },
  trophy: { emoji: '🏆' },
  arrow: { emoji: '➜' },
  basket: { emoji: '🧺' },
  coin: { emoji: '🪙' },
  ruby: { emoji: '🐱', img: 'assets/game/ruby/ruby-main.webp' },
  ruby_cheer: { emoji: '🐱', img: 'assets/game/ruby/ruby-cheer.webp' },
  ruby_comfort: { emoji: '🐱', img: 'assets/game/ruby/ruby-comfort.webp' },
  ruby_eat: { emoji: '🐱', img: 'assets/game/ruby/ruby-eat.webp' },
  ruby_sleep: { emoji: '🐱', img: 'assets/game/ruby/ruby-sleep.webp' },
  bowl: { emoji: '🥣', img: 'assets/game/feed/bowl.webp' },
  bell: { emoji: '🔔', img: 'assets/game/feed/bell.webp' },
  ruby_house: { emoji: '🏡' }, wardrobe: { emoji: '👗' }, room_tab: { emoji: '🛋️' }, sticker_album: { emoji: '📒' },
  flower_crown: { emoji: '🌸' }, party_hat: { emoji: '🥳' }, royal_crown: { emoji: '👑' },
  pink_bow: { emoji: '🎀' }, star_clip: { emoji: '🌟' }, cape: { emoji: '🦸' }, glasses: { emoji: '👓' }, scarf: { emoji: '🧣' },
  room_bed: { emoji: '🛏️' }, room_rug: { emoji: '🟠' }, room_lamp: { emoji: '💡' }, room_plant: { emoji: '🪴' },
  room_ball: { emoji: '🏀' }, scratching_post: { emoji: '🪵' }, bookshelf: { emoji: '📚' }, curtains: { emoji: '🪟' },
  fish_tank: { emoji: '🐠' }, star_mobile: { emoji: '💫' }, close: { emoji: '❌' }, store_tray: { emoji: '📦' },
};
// Legacy sticker saves contain emoji strings. Keep their storage format intact.
// Aliases (Ruby shares cat's fallback) keep the original sticker id.
const EMOJI_IDS = Object.entries(ASSETS).reduce((ids,[id,asset])=>{
  if(!ids[asset.emoji])ids[asset.emoji]=id;
  return ids;
},{});
function escapeArt(value){
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function art(id, extraClass=''){
  const asset=ASSETS[id];
  const cls=extraClass?' '+escapeArt(extraClass):'';
  if(asset.img)return `<img class="art${cls}" src="${escapeArt(asset.img)}" alt="" draggable="false" data-art-id="${escapeArt(id)}" onerror="artFallback(this)">`;
  return `<span class="emoji${cls}">${escapeArt(asset.emoji)}</span>`;
}
function artFallback(img){
  const span=document.createElement('span');
  // Preserve context sizing, animation classes, ids, and inline styles on failure.
  for(const attr of img.attributes){
    if(!['src','alt','draggable','data-art-id','onerror','class'].includes(attr.name))span.setAttribute(attr.name,attr.value);
  }
  span.className=img.className.replace(/\bart\b/,'emoji');
  span.textContent=ASSETS[img.dataset.artId].emoji;
  img.replaceWith(span);
}
function renderStaticArt(){
  document.querySelectorAll('[data-art]').forEach(el=>{
    const template=document.createElement('template');
    template.innerHTML=art(el.dataset.art,el.className);
    const replacement=template.content.firstElementChild;
    for(const attr of el.attributes){
      if(!['class','data-art'].includes(attr.name))replacement.setAttribute(attr.name,attr.value);
    }
    el.replaceWith(replacement);
  });
}
