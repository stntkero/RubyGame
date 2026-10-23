// 遊戲裡所有會念出來的台詞。新增遊戲或台詞時加在這裡，然後跑 `node gen.mjs`
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// 直接讀 js/data.js 拿到 THINGS / COLORS / SHOP / NUMS / PRAISE，資料改了台詞自動跟著變
const ctx = {};
vm.runInNewContext(readFileSync(new URL('../../js/data.js', import.meta.url), 'utf8') +
  ';Object.assign(this,{THINGS,COLORS,SHOP,NUMS,PRAISE})', ctx);
const {THINGS, COLORS, SHOP, NUMS, PRAISE} = ctx;
const N = i => NUMS[i - 1];

export function allLines() {
  const L = new Set();
  const add = s => L.add(s);
  // 每個遊戲開場提示
  ['幫它們找到影子', '找出一樣的兩張', '把球放進一樣顏色的籃子', '下一個是什麼呢？', '從小排到大', '把拼圖拼起來'].forEach(add);
  // 物品、顏色名稱（找影子、翻翻樂、規律、顏色分類）
  THINGS.forEach(t => add(t.n));
  COLORS.forEach(c => add(c.n));
  PRAISE.forEach(add);
  // 數數（商店付錢念「二」，存錢豬念「兩」以外的 NUMS）
  NUMS.forEach(add); add('二');
  // 商店
  for (const it of SHOP) {
    add('要買' + it.n + '喔');
    add('幫我買' + it.n);
    add(it.n + '要' + N(it.p) + '個金幣');
    add(it.n + '要' + N(it.p) + '個金幣，錢不夠喔');
  }
  for (let m = 1; m <= 7; m++) add('你有' + N(m) + '個金幣，想買什麼呢？');
  ['先選要買的東西', '謝謝光臨！'].forEach(add);
  // 存錢豬
  ['星星不夠了，去玩遊戲賺星星吧', '換到一張貼紙', '存滿了！得到超級大獎！'].forEach(add);
  // 餵露比吃魚（任務 05）
  for (let n = 1; n <= 5; n++) add('露比想吃' + N(n) + '條魚');
  for (let n = 1; n <= 5; n++) add('還要再' + N(n) + '條');
  for (let n = 1; n <= 5; n++) add('太多了，拿回去' + N(n) + '條');
  add('好好吃！謝謝你！');
  // THINGS 會自動包含救援車輛（任務 15）
  // 露比的家（任務 10）
  ['買到了！', '星星不夠，再去玩遊戲吧', '把家具拖進房間'].forEach(add);
  return [...L];
}

// 破音字修正：只改送去合成的文字，遊戲裡顯示/比對用的字不變
export const PRONOUNCE = [
  ['露比', '路比'],
];
