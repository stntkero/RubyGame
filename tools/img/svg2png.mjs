// 把 tools/img/svg/*.svg 轉成 assets/img/mini/<id>.png（1024 透明背景），再交給 build.mjs 轉成 WebP
import sharp from 'sharp';
import {readdirSync, mkdirSync} from 'node:fs';
const src = new URL('./svg/', import.meta.url), out = new URL('../../assets/img/mini/', import.meta.url);
const p = u => u.pathname.replace(/^\/(\w:)/, '$1');
mkdirSync(p(out), {recursive: true});
for (const f of readdirSync(p(src)).filter(f => f.endsWith('.svg'))) {
  await sharp(p(new URL(f, src)), {density: 144}).resize(1024, 1024).png().toFile(p(new URL(f.replace('.svg', '.png'), out)));
  console.log(f);
}
