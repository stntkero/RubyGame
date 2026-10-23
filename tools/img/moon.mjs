// 把夜晚背景左上角的月亮搬到不會被按鈕擋住的位置：node moon.mjs
// box = 月亮所在的方框（原圖像素），patchX = 同高度一塊空白夜空，用來蓋掉原本的月亮
import sharp from 'sharp';
const P = f => new URL((f.startsWith('night-home')||f.startsWith('night-game') ? '../../assets/img/bg/' : './src/') + f, import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
async function fix(file, box, patchX, to, outFile = file) {
  const [L, T, w, h] = box, src = await sharp(P(file)).toBuffer(), {width: W, height: H} = await sharp(src).metadata();
  const moon = await sharp(src).extract({left: L, top: T, width: w, height: h}).toBuffer();
  const sky = await sharp(src).extract({left: patchX, top: T, width: w, height: h}).toBuffer();
  const mask = Buffer.from(`<svg width="${w}" height="${h}"><defs><radialGradient id="g"><stop offset="72%" stop-color="#fff"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><ellipse cx="${w/2}" cy="${h/2}" rx="${w/2}" ry="${h/2}" fill="url(#g)"/></svg>`);
  const moonSoft = await sharp(moon).resize(Math.round(w * 1.15)).ensureAlpha()
    .composite([{input: await sharp(mask).resize(Math.round(w * 1.15), Math.round(h * 1.15)).toBuffer(), blend: 'dest-in'}]).png().toBuffer();
  const out = await sharp(src).composite([
    {input: sky, left: L, top: T},
    {input: moonSoft, left: Math.round(W * to[0] - w * .575), top: Math.round(H * to[1] - h * .575)},
  ]).png().toBuffer();
  await sharp(out).toFile(P(outFile));
  console.log(outFile, 'moon at', to);
}
// 首頁：月亮在星星計數和音樂按鈕中間；遊戲畫面：右上角（左上是回首頁、中間是進度點點）
await fix('night-portrait.png', [40, 340, 180, 180], 420, [.5, .07], 'night-home-portrait.png');
await fix('night-landscape.png', [50, 200, 150, 150], 760, [.5, .08], 'night-home-landscape.png');
await fix('night-portrait.png', [40, 340, 180, 180], 420, [.86, .075], 'night-game-portrait.png');
await fix('night-landscape.png', [50, 200, 150, 150], 760, [.9, .09], 'night-game-landscape.png');
