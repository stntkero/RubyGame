const PUZZLES=['ruby'];
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
  {id:'flower_crown',n:'花冠',slot:'head',tier:'small',anchor:{x:46,y:18,size:34,rot:14}},
  {id:'party_hat',n:'派對帽',slot:'head',tier:'medium',anchor:{x:47,y:14,size:35,rot:14}},
  {id:'royal_crown',n:'皇冠',slot:'head',tier:'large',anchor:{x:47,y:16,size:36,rot:14}},
  {id:'pink_bow',n:'粉紅蝴蝶結',slot:'hair',tier:'small',anchor:{x:31,y:24,size:24,rot:-22}},
  {id:'star_clip',n:'星星髮夾',slot:'hair',tier:'small',anchor:{x:65,y:27,size:20,rot:18}},
  {id:'cape',n:'披風',slot:'back',tier:'medium',anchor:{x:62,y:60,size:44,rot:-12}},
  {id:'glasses',n:'眼鏡',slot:'face',tier:'medium',anchor:{x:46,y:39,size:42,rot:18}},
  {id:'scarf',n:'圍巾',slot:'neck',tier:'small',anchor:{x:45,y:55,size:32,rot:12}}
];
const ROOM_ITEMS=[
  {id:'room_bed',n:'床',tier:'large'},{id:'room_rug',n:'地毯',tier:'medium'},
  {id:'room_lamp',n:'燈',tier:'small'},{id:'room_plant',n:'盆栽',tier:'small'},
  {id:'room_ball',n:'球',tier:'small'},{id:'scratching_post',n:'貓抓柱',tier:'medium'},
  {id:'bookshelf',n:'書櫃',tier:'large'},{id:'curtains',n:'窗簾',tier:'medium'},
  {id:'fish_tank',n:'魚缸',tier:'large'},{id:'star_mobile',n:'星星吊飾',tier:'small'}
];
