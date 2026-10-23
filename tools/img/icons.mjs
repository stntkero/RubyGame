// 用露比主圖產生 App 圖示：node icons.mjs
import sharp from 'sharp';
import {mkdirSync} from 'node:fs';
const root = new URL('../../', import.meta.url);
const src = new URL('assets/img/ruby/ruby-main.png', root).pathname.replace(/^\/(\w:)/, '$1');
const out = p => new URL('icons/' + p, root).pathname.replace(/^\/(\w:)/, '$1');
mkdirSync(out(''), {recursive: true});
const BG = '#FFD6E7';
async function icon(size, file, scale) {
  const inner = Math.round(size * scale);
  const ruby = await sharp(src).trim({threshold: 1}).resize(inner, inner, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}}).toBuffer();
  await sharp({create: {width: size, height: size, channels: 4, background: BG}})
    .composite([{input: ruby, gravity: 'center'}]).png().toFile(out(file));
  console.log(file);
}
await icon(192, 'icon-192.png', .86);
await icon(512, 'icon-512.png', .86);
await icon(512, 'icon-maskable-512.png', .68); // 留在 maskable 安全區內
await icon(180, 'apple-touch-icon.png', .82);
