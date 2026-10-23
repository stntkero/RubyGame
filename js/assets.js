// Add an img path to replace an emoji. Classic scripts share plain globals.
const ASSETS = {
  dog: { emoji: '🐶', img: 'assets/game/things/dog.webp' },
  cat: { emoji: '🐱', img: 'assets/game/things/cat.webp' },
  rabbit: { emoji: '🐰', img: 'assets/game/things/rabbit.webp' },
  bear: { emoji: '🐻', img: 'assets/game/things/bear.webp' },
  panda: { emoji: '🐼', img: 'assets/game/things/panda.webp' },
  lion: { emoji: '🦁', img: 'assets/game/things/lion.webp' },
  frog: { emoji: '🐸', img: 'assets/game/things/frog.webp' },
  monkey: { emoji: '🐵', img: 'assets/game/things/monkey.webp' },
  pig: { emoji: '🐷', img: 'assets/game/things/pig.webp' },
  chick: { emoji: '🐥', img: 'assets/game/things/chick.webp' },
  unicorn: { emoji: '🦄', img: 'assets/game/things/unicorn.webp' },
  turtle: { emoji: '🐢', img: 'assets/game/things/turtle.webp' },
  elephant: { emoji: '🐘', img: 'assets/game/things/elephant.webp' },
  giraffe: { emoji: '🦒', img: 'assets/game/things/giraffe.webp' },
  whale: { emoji: '🐳', img: 'assets/game/things/whale.webp' },
  apple: { emoji: '🍎', img: 'assets/game/things/apple.webp' },
  banana: { emoji: '🍌', img: 'assets/game/things/banana.webp' },
  strawberry: { emoji: '🍓', img: 'assets/game/things/strawberry.webp' },
  watermelon: { emoji: '🍉', img: 'assets/game/things/watermelon.webp' },
  car: { emoji: '🚗', img: 'assets/game/things/car.webp' },
  fire_truck: { emoji: '🚒', img: 'assets/game/things/fire_truck.webp' },
  ambulance: { emoji: '🚑', img: 'assets/game/things/ambulance.webp' },
  police_car: { emoji: '🚓', img: 'assets/game/things/police_car.webp' },
  helicopter: { emoji: '🚁', img: 'assets/game/things/helicopter.webp' },
  rocket: { emoji: '🚀', img: 'assets/game/things/rocket.webp' },
  balloon: { emoji: '🎈', img: 'assets/game/things/balloon.webp' },
  star: { emoji: '⭐', img: 'assets/game/things/star.webp' },
  sunflower: { emoji: '🌻', img: 'assets/game/things/sunflower.webp' },
  candy: { emoji: '🍬', img: 'assets/game/ui/candy.webp' },
  cookie: { emoji: '🍪', img: 'assets/game/ui/cookie.webp' },
  donut: { emoji: '🍩', img: 'assets/game/ui/donut.webp' },
  icecream: { emoji: '🍦', img: 'assets/game/ui/icecream.webp' },
  teddy: { emoji: '🧸', img: 'assets/game/ui/teddy.webp' },
  party: { emoji: '🎉', img: 'assets/game/stickers/party.webp' },
  glowingstar: { emoji: '🌟', img: 'assets/game/stickers/glowingstar.webp' },
  partyface: { emoji: '🥳' },
  rainbow: { emoji: '🌈', img: 'assets/game/stickers/rainbow.webp' },
  clap: { emoji: '👏', img: 'assets/game/stickers/clap.webp' },
  heart: { emoji: '💖', img: 'assets/game/stickers/heart.webp' },
  lollipop: { emoji: '🍭', img: 'assets/game/stickers/lollipop.webp' },
  blossom: { emoji: '🌸', img: 'assets/game/stickers/blossom.webp' },
  ladybug: { emoji: '🐞', img: 'assets/game/stickers/ladybug.webp' },
  butterfly: { emoji: '🦋', img: 'assets/game/stickers/butterfly.webp' },
  clover: { emoji: '🍀', img: 'assets/game/stickers/clover.webp' },
  ribbon: { emoji: '🎀', img: 'assets/game/stickers/ribbon.webp' },
  cupcake: { emoji: '🧁', img: 'assets/game/stickers/cupcake.webp' },
  hatchingchick: { emoji: '🐣', img: 'assets/game/stickers/hatchingchick.webp' },
  daisy: { emoji: '🌼', img: 'assets/game/stickers/daisy.webp' },
  cherries: { emoji: '🍒', img: 'assets/game/stickers/cherries.webp' },
  soccer: { emoji: '⚽', img: 'assets/game/stickers/soccer.webp' },
  music: { emoji: '🎵', img: 'assets/game/ui/music.webp' },
  music_off: { emoji: '🔕', img: 'assets/game/ui/music_off.webp' },
  fish: { emoji: '🐟', img: 'assets/game/feed/fish.webp' },
  mushroom: { emoji: '🍄', img: 'assets/game/stickers/mushroom.webp' },
  bee: { emoji: '🐝', img: 'assets/game/stickers/bee.webp' },
  crown: { emoji: '👑', img: 'assets/game/stickers/crown.webp' },
  castle: { emoji: '🏰', img: 'assets/game/stickers/castle.webp' },
  carousel: { emoji: '🎠', img: 'assets/game/stickers/carousel.webp' },
  fairy: { emoji: '🧚', img: 'assets/game/stickers/fairy.webp' },
  dragon: { emoji: '🐉', img: 'assets/game/stickers/dragon.webp' },
  diamond: { emoji: '💎', img: 'assets/game/stickers/diamond.webp' },
  ferriswheel: { emoji: '🎡', img: 'assets/game/stickers/ferriswheel.webp' },
  peacock: { emoji: '🦚', img: 'assets/game/stickers/peacock.webp' },
  hint_paw: { emoji: '??', img: 'assets/game/ui/hint_paw.webp' }, // Future image: assets/game/ui/hint_paw.webp
  home: { emoji: '🏠', img: 'assets/game/ui/home.webp' },
  soundon: { emoji: '🔊', img: 'assets/game/ui/soundon.webp' },
  soundoff: { emoji: '🔇', img: 'assets/game/ui/soundoff.webp' },
  cards: { emoji: '🃏', img: 'assets/game/ui/cards.webp' },
  puzzle: { emoji: '🧩', img: 'assets/game/ui/puzzle.webp' },
  palette: { emoji: '🎨', img: 'assets/game/ui/palette.webp' },
  store: { emoji: '🏪', img: 'assets/game/ui/store.webp' },
  repeat: { emoji: '🔁', img: 'assets/game/ui/repeat.webp' },
  ruler: { emoji: '📏', img: 'assets/game/ui/ruler.webp' },
  cart: { emoji: '🛒', img: 'assets/game/ui/cart.webp' },
  purse: { emoji: '👛', img: 'assets/game/ui/purse.webp' },
  shoppingbag: { emoji: '🛍️', img: 'assets/game/ui/shoppingbag.webp' },
  trophy: { emoji: '🏆', img: 'assets/game/ui/trophy.webp' },
  arrow: { emoji: '➜', img: 'assets/game/ui/arrow.webp' },
  basket: { emoji: '🧺', img: 'assets/game/ui/basket.webp' },
  coin: { emoji: '🪙', img: 'assets/game/ui/coin.webp' },
  ruby: { emoji: '🐱', img: 'assets/game/ruby/ruby-main.webp' },
  ruby_cheer: { emoji: '🐱', img: 'assets/game/ruby/ruby-cheer.webp' },
  ruby_comfort: { emoji: '🐱', img: 'assets/game/ruby/ruby-comfort.webp' },
  ruby_eat: { emoji: '🐱', img: 'assets/game/ruby/ruby-eat.webp' },
  ruby_sleep: { emoji: '🐱', img: 'assets/game/ruby/ruby-sleep.webp' },
  walk_1: { emoji: '🐱', img: 'assets/game/ruby/walk-1.webp' }, walk_2: { emoji: '🐱', img: 'assets/game/ruby/walk-2.webp' }, walk_3: { emoji: '🐱', img: 'assets/game/ruby/walk-3.webp' }, walk_4: { emoji: '🐱', img: 'assets/game/ruby/walk-4.webp' },
  bowl: { emoji: '🥣', img: 'assets/game/feed/bowl.webp' },
  bell: { emoji: '🔔', img: 'assets/game/feed/bell.webp' },
  ruby_house: { emoji: '🏡', img: 'assets/game/ui/ruby_house.webp' }, wardrobe: { emoji: '👗' }, room_tab: { emoji: '🛋️' }, sticker_album: { emoji: '📒' },
  flower_crown: { emoji: '🌸', img: 'assets/game/wear/flower_crown.webp' }, party_hat: { emoji: '🥳', img: 'assets/game/wear/party_hat.webp' }, royal_crown: { emoji: '👑', img: 'assets/game/wear/royal_crown.webp' },
  pink_bow: { emoji: '🎀', img: 'assets/game/wear/pink_bow.webp' }, star_clip: { emoji: '🌟', img: 'assets/game/wear/star_clip.webp' }, cape: { emoji: '🦸', img: 'assets/game/wear/cape.webp' }, glasses: { emoji: '👓', img: 'assets/game/wear/glasses.webp' }, scarf: { emoji: '🧣', img: 'assets/game/wear/scarf.webp' },
  room_bed: { emoji: '🛏️', img: 'assets/game/room/room_bed.webp' }, room_rug: { emoji: '🟠', img: 'assets/game/room/room_rug.webp' }, room_lamp: { emoji: '💡', img: 'assets/game/room/room_lamp.webp' }, room_plant: { emoji: '🪴', img: 'assets/game/room/room_plant.webp' },
  room_ball: { emoji: '🏀', img: 'assets/game/room/room_ball.webp' }, scratching_post: { emoji: '🪵', img: 'assets/game/room/scratching_post.webp' }, bookshelf: { emoji: '📚', img: 'assets/game/room/bookshelf.webp' }, curtains: { emoji: '🪟', img: 'assets/game/room/curtains.webp' },
  fish_tank: { emoji: '🐠', img: 'assets/game/room/fish_tank.webp' }, star_mobile: { emoji: '💫', img: 'assets/game/room/star_mobile.webp' }, close: { emoji: '❌' }, store_tray: { emoji: '📦' },
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
