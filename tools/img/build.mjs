// 把 assets/img 下的原始 PNG（1024px）轉成遊戲用的 WebP（512px，透明背景保留）到 assets/game/
// 用法：node build.mjs
import sharp from 'sharp';
import {readdirSync, mkdirSync, statSync} from 'node:fs';
import {join, relative, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = join(root, 'assets/img'), OUT = join(root, 'assets/game');
const walk = d => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]);
// 走路分解圖（ruby/walk-N.png）用露比主圖的同一個裁切框，頭的位置才會跟主圖、配件完全對齊
const mainInfo = (await sharp(join(SRC, 'ruby/ruby-main.png')).trim({threshold: 1}).toBuffer({resolveWithObject: true})).info;
const FIT_PAD = 100; // 原圖像素
const mainBox = {left: -mainInfo.trimOffsetLeft, top: -mainInfo.trimOffsetTop, width: mainInfo.width, height: mainInfo.height};
// 背景圖（bg/）保持原尺寸比例，另外處理
for (const f of walk(SRC).filter(f => f.endsWith('.png') && !f.includes('-preview') && !f.includes(join('img', 'bg')))) {
  const out = join(OUT, relative(SRC, f)).replace(/\.png$/, '.webp');
  mkdirSync(dirname(out), {recursive: true});
  // 走路分解圖和「穿在身上」的配件圖層（wear-fit/）都要跟主圖同一個裁切框
  if (/wear-fit/.test(f)) {
    // 配件圖層（例如披風）可能超出露比的外框：四周多留 FIT_PAD，縮放比例維持跟主圖一樣，
    // CSS 用 .ruby-wear-fit{inset:-FIT_INSET%} 把多出來的邊放回外面
    const s = 512 / mainBox.height, C = Math.round(512 + 2 * FIT_PAD * s);
    // sharp 會把 extract 排在 extend 前面，所以分兩步做
    const padded = await sharp(f).extend({top: FIT_PAD, bottom: FIT_PAD, left: FIT_PAD, right: FIT_PAD, background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toBuffer();
    await sharp(padded)
      .extract({left: mainBox.left, top: mainBox.top, width: mainBox.width + 2 * FIT_PAD, height: mainBox.height + 2 * FIT_PAD})
      .resize(C, C, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}}).webp({quality: 82, alphaQuality: 90}).toFile(out);
    console.log(relative(root, out), 'inset %', (FIT_PAD * s / 512 * 100).toFixed(2));
    continue;
  }
  const isWalk = /walk-\d\.png$/.test(f);
  await (isWalk ? sharp(f).extract(mainBox) : sharp(f).trim({threshold: 1})).resize(512, 512, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
    .webp({quality: 82, alphaQuality: 90}).toFile(out);
  console.log(relative(root, out), Math.round(statSync(out).size / 1024) + 'KB');
}
for (const f of walk(join(SRC, 'bg')).filter(f => f.endsWith('.png'))) {
  const out = join(OUT, relative(SRC, f)).replace(/\.png$/, '.webp');
  mkdirSync(dirname(out), {recursive: true});
  await sharp(f).resize(f.includes('portrait') ? {width: 1080} : {width: 1920}).webp({quality: 72}).toFile(out);
  console.log(relative(root, out), Math.round(statSync(out).size / 1024) + 'KB');
}
