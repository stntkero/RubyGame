// 自動把 assets/game/**/<id>.webp 登記到 js/assets.js 對應 id 的 img 欄位：node register.mjs
import {readFileSync, writeFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative, basename, dirname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const walk = d => readdirSync(d).flatMap(f => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]);
const files = Object.fromEntries(walk(join(root, 'assets/game')).filter(f => f.endsWith('.webp'))
  .map(f => [basename(f, '.webp').replace(/-/g, '_'), relative(root, f).split(sep).join('/')]));
const path = join(root, 'js/assets.js');
let src = readFileSync(path, 'utf8'), n = 0;
src = src.replace(/\b([a-z][a-z0-9_]*): \{ emoji: ('[^']*')( \})/g, (m, id, emoji, end) =>
  files[id] ? (n++, `${id}: { emoji: ${emoji}, img: '${files[id]}'${end}`) : m);
writeFileSync(path, src);
console.log(`registered ${n} images`);
