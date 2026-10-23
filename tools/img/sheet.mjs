// 把多張圖拼成一張對照表：node sheet.mjs out.png a.png b.png ...
import sharp from 'sharp';
const [out, ...files] = process.argv.slice(2);
const T = 320, cols = Math.min(files.length, 4), rows = Math.ceil(files.length / cols);
const tiles = await Promise.all(files.map(f => sharp(f).resize(T, T).toBuffer()));
await sharp({create: {width: cols * T, height: rows * T, channels: 4, background: '#808080'}})
  .composite(tiles.map((b, i) => ({input: b, left: (i % cols) * T, top: Math.floor(i / cols) * T}))).png().toFile(out);
