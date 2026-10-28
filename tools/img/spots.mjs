// 幫「救護車貼 OK 繃」找傷口位置：只放在小動物身上不透明、離邊緣夠遠的地方，避開頭部
//   node spots.mjs            → 寫入 js/games/bandage-spots.js
//   node spots.mjs --preview  → 另外輸出 scratch 預覽圖（紅圈＝傷口位置）
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const N = 128, R = 0.08 * N, GAP = 0.17 * N, MAX = 6;
// 頭部範圍：[在不透明範圍上面多少比例內, 左右離中線多寬, 再上面整排都不要]（傷口不要貼在臉和耳朵上；病人圖的手在臉兩旁可以貼）
const HEAD = {default: [0.6, 1, 0], rabbit: [0.72, 1, 0], patient: [0.62, 0.3, 0.5]};
const ids = ['rabbit', 'bear', 'cat', 'dog', 'panda'];
const files = ids.flatMap(id => [[id, `assets/game/things/${id}.webp`], ['patient_' + id, `assets/game/mini/patient_${id}.webp`]])
  .filter(([, f]) => fs.existsSync(path.join(root, f)));

async function spots(file, [head, half, cap]) {
  const a = await sharp(path.join(root, file)).ensureAlpha().extractChannel(3).resize(N, N, {fit: 'fill'}).raw().toBuffer();
  const solid = i => a[i] > 160;
  // 每個不透明點到最近透明點的距離（多源 BFS，八方向近似）
  const dist = new Float32Array(N * N).fill(Infinity), q = [];
  for (let i = 0; i < N * N; i++) if (!solid(i)) {dist[i] = 0; q.push(i)}
  for (let h = 0; h < q.length; h++) {
    const c = q[h], x = c % N, y = (c / N) | 0;
    for (const [dx, dy, w] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.41], [1, -1, 1.41], [-1, 1, 1.41], [-1, -1, 1.41]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      const n = ny * N + nx;
      if (dist[c] + w < dist[n]) {dist[n] = dist[c] + w; q.push(n)}
    }
  }
  let top = N, bot = 0;
  for (let i = 0; i < N * N; i++) if (solid(i)) {const y = (i / N) | 0; top = Math.min(top, y); bot = Math.max(bot, y)}
  const line = top + head * (bot - top), ceil = top + cap * (bot - top);
  const cand = [];
  for (let i = 0; i < N * N; i++) {const y = (i / N) | 0; if (dist[i] >= R && y >= ceil && (y >= line || Math.abs(i % N - N / 2) > half * N)) cand.push(i)}
  // 先取最「肉」的一點，之後每次取離已選點最遠的，彼此至少隔 GAP
  const out = [];
  if (cand.length) out.push(cand.reduce((b, i) => dist[i] > dist[b] ? i : b));
  while (out.length < MAX) {
    let best = -1, bd = 0;
    for (const i of cand) {
      const d = Math.min(...out.map(o => Math.hypot(o % N - i % N, ((o / N) | 0) - ((i / N) | 0))));
      if (d > bd) {bd = d; best = i}
    }
    if (best < 0 || bd < GAP) break;
    out.push(best);
  }
  return out.map(i => [Math.round((i % N + .5) / N * 100), Math.round((((i / N) | 0) + .5) / N * 100)]);
}

const map = {};
for (const [id, f] of files) {
  map[id] = await spots(f, HEAD[id] ?? (id.startsWith('patient_') ? HEAD.patient : HEAD.default));
  console.log(id, map[id].length, JSON.stringify(map[id]));
}
fs.writeFileSync(path.join(root, 'js/games/bandage-spots.js'),
  '// 由 tools/img/spots.mjs 產生：每張小動物圖上可以放傷口的位置（圖寬高的 %）\nconst BANDAGE_SPOTS_BY=' + JSON.stringify(map) + ';\n');

if (process.argv.includes('--preview')) {
  const T = 320, list = Object.keys(map), cols = Math.min(list.length, 4), rows = Math.ceil(list.length / cols);
  const tiles = await Promise.all(list.map(async id => {
    const f = files.find(([i]) => i === id)[1];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="${T}">${map[id].map(([x, y]) =>
      `<circle cx="${x / 100 * T}" cy="${y / 100 * T}" r="${R / N * T}" fill="none" stroke="red" stroke-width="4"/>`).join('')}</svg>`;
    return sharp(path.join(root, f)).resize(T, T).composite([{input: Buffer.from(svg)}]).png().toBuffer();
  }));
  const out = process.argv[process.argv.indexOf('--preview') + 1];
  await sharp({create: {width: cols * T, height: rows * T, channels: 4, background: '#808080'}})
    .composite(tiles.map((b, i) => ({input: b, left: (i % cols) * T, top: Math.floor(i / cols) * T}))).png().toFile(out);
}
