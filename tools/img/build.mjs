// 把 assets/img 下的原始 PNG（1024px）轉成遊戲用的 WebP（512px，透明背景保留）到 assets/game/
// 用法：node build.mjs
import sharp from 'sharp';
import {readdirSync, mkdirSync, statSync} from 'node:fs';
import {join, relative, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = join(root, 'assets/img'), OUT = join(root, 'assets/game');
const walk = d => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]);
// 背景圖（bg/）保持原尺寸比例，另外處理
for (const f of walk(SRC).filter(f => f.endsWith('.png') && !f.includes('-preview') && !f.includes(join('img', 'bg')))) {
  const out = join(OUT, relative(SRC, f)).replace(/\.png$/, '.webp');
  mkdirSync(dirname(out), {recursive: true});
  await sharp(f).trim({threshold: 1}).resize(512, 512, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
    .webp({quality: 82, alphaQuality: 90}).toFile(out);
  console.log(relative(root, out), Math.round(statSync(out).size / 1024) + 'KB');
}
for (const f of walk(join(SRC, 'bg')).filter(f => f.endsWith('.png'))) {
  const out = join(OUT, relative(SRC, f)).replace(/\.png$/, '.webp');
  mkdirSync(dirname(out), {recursive: true});
  await sharp(f).resize(f.includes('portrait') ? {width: 1080} : {width: 1920}).webp({quality: 72}).toFile(out);
  console.log(relative(root, out), Math.round(statSync(out).size / 1024) + 'KB');
}
