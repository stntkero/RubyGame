const PUZZLES=['ruby','ruby_cheer','ruby_eat','panda','lion','unicorn','elephant','fire_truck','helicopter','whale','turtle','strawberry'];
const THINGS=[
  {id:'fire_truck',e:'🚒',n:'消防車'},{id:'ambulance',e:'🚑',n:'救護車'},
  {id:'police_car',e:'🚓',n:'警車'},{id:'helicopter',e:'🚁',n:'直升機'},
  {id:'dog',e:'🐶',n:'小狗'},{id:'cat',e:'🐱',n:'小貓'},{id:'rabbit',e:'🐰',n:'兔子'},{id:'bear',e:'🐻',n:'小熊'},{id:'panda',e:'🐼',n:'熊貓'},{id:'lion',e:'🦁',n:'獅子'},
  {id:'frog',e:'🐸',n:'青蛙'},{id:'monkey',e:'🐵',n:'猴子'},{id:'pig',e:'🐷',n:'小豬'},{id:'chick',e:'🐥',n:'小雞'},{id:'unicorn',e:'🦄',n:'獨角獸'},{id:'turtle',e:'🐢',n:'烏龜'},
  {id:'elephant',e:'🐘',n:'大象'},{id:'giraffe',e:'🦒',n:'長頸鹿'},{id:'whale',e:'🐳',n:'鯨魚'},{id:'apple',e:'🍎',n:'蘋果'},{id:'banana',e:'🍌',n:'香蕉'},{id:'strawberry',e:'🍓',n:'草莓'},
  {id:'watermelon',e:'🍉',n:'西瓜'},{id:'car',e:'🚗',n:'汽車'},{id:'rocket',e:'🚀',n:'火箭'},{id:'balloon',e:'🎈',n:'氣球'},{id:'star',e:'⭐',n:'星星'},{id:'sunflower',e:'🌻',n:'向日葵'}
];
const COLORS=[
  {k:'red',c:'#FF5A5F',n:'紅色'},{k:'yellow',c:'#FFC93C',n:'黃色'},{k:'blue',c:'#3FA7F5',n:'藍色'},
  {k:'green',c:'#4CC38A',n:'綠色'},{k:'purple',c:'#9B6BFF',n:'紫色'},{k:'orange',c:'#FF8C42',n:'橘色'}
];
const PRAISE=['好棒！','你好厲害！','答對了！','太棒了！','好聰明喔！'];
const CHEERS=['party','glowingstar','partyface','rainbow','clap','heart'];
const SHOP=[{id:'candy',e:'🍬',n:'糖果',p:1},{id:'banana',e:'🍌',n:'香蕉',p:2},{id:'apple',e:'🍎',n:'蘋果',p:2},{id:'cookie',e:'🍪',n:'餅乾',p:3},{id:'donut',e:'🍩',n:'甜甜圈',p:3},
  {id:'icecream',e:'🍦',n:'冰淇淋',p:4},{id:'balloon',e:'🎈',n:'氣球',p:4},{id:'teddy',e:'🧸',n:'玩具熊',p:5},{id:'car',e:'🚗',n:'玩具車',p:5}];
const NUMS=['一','兩','三','四','五','六','七'];
const SMALL=['candy','lollipop','blossom','ladybug','butterfly','clover','ribbon','cupcake','hatchingchick','daisy','cherries','soccer','music','fish','mushroom','bee'];
const RARE=['unicorn','crown','castle','rainbow','carousel','fairy','dragon','diamond','ferriswheel','peacock'];
// Anchors are centers; size is a percentage of Ruby's width, including future item images.
const WEARABLES=[
  {id:'flower_crown',n:'花冠',slot:'head',tier:'small',anchor:{x:50,y:14,size:46,rot:15}},
  {id:'party_hat',n:'派對帽',slot:'head',tier:'medium',anchor:{x:53,y:5,size:30,rot:15}},
  {id:'royal_crown',n:'皇冠',slot:'head',tier:'large',anchor:{x:50,y:10,size:33,rot:15}},
  {id:'pink_bow',n:'粉紅蝴蝶結',slot:'hair',tier:'small',anchor:{x:25,y:14,size:19,rot:-20}},
  {id:'star_clip',n:'星星髮夾',slot:'hair',tier:'small',anchor:{x:62,y:25,size:14,rot:20}},
  {id:'cape',n:'披風',slot:'back',tier:'medium',anchor:{x:50,y:64,size:66,rot:0}},
  {id:'glasses',n:'眼鏡',slot:'face',tier:'medium',anchor:{x:44,y:37.5,size:42,rot:18}},
  {id:'scarf',n:'圍巾',slot:'neck',tier:'small',anchor:{x:43,y:69,size:33,rot:8}}
];
// k：放進房間時的大小（以露比的高度為 1）
const ROOM_ITEMS=[
  {id:'room_bed',n:'床',tier:'large',k:1.45},{id:'room_rug',n:'地毯',tier:'medium',k:1.6},
  {id:'room_lamp',n:'燈',tier:'small',k:0.75},{id:'room_plant',n:'盆栽',tier:'small',k:0.7},
  {id:'room_ball',n:'球',tier:'small',k:0.42},{id:'scratching_post',n:'貓抓柱',tier:'medium',k:1.05},
  {id:'bookshelf',n:'書櫃',tier:'large',k:1.3},{id:'curtains',n:'窗簾',tier:'medium',k:1.2},
  {id:'fish_tank',n:'魚缸',tier:'large',k:0.8},{id:'star_mobile',n:'星星吊飾',tier:'small',k:0.7}
];
