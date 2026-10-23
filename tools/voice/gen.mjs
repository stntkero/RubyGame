// 產生配音 mp3 + js/voice-map.js。已存在的檔案會跳過，只產新的台詞。
// 用法：node gen.mjs        （加 --force 全部重產）
import {MsEdgeTTS, OUTPUT_FORMAT} from 'msedge-tts';
import {createHash} from 'node:crypto';
import {createWriteStream, existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync} from 'node:fs';
import {allLines, PRONOUNCE} from './lines.mjs';

const VOICE = 'zh-TW-HsiaoYuNeural';
const PROSODY = {rate: '-15%'};
const OUT = new URL('../../assets/voice/', import.meta.url);
const MAP = new URL('../../js/voice-map.js', import.meta.url);
const force = process.argv.includes('--force');

const id = t => createHash('sha1').update(VOICE + JSON.stringify(PROSODY) + t).digest('hex').slice(0, 10);
const spoken = t => PRONOUNCE.reduce((s, [a, b]) => s.split(a).join(b), t);

mkdirSync(OUT, {recursive: true});
const lines = allLines();
const map = {};
let tts = null, made = 0;
for (const text of lines) {
  const f = id(text);
  map[text] = f;
  const path = new URL(f + '.mp3', OUT);
  if (existsSync(path) && !force) continue;
  if (!tts) { tts = new MsEdgeTTS(); await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3); }
  const {audioStream} = tts.toStream(spoken(text), PROSODY);
  await new Promise((ok, fail) => {
    const w = createWriteStream(path);
    audioStream.on('data', d => w.write(d));
    audioStream.on('close', () => w.end(ok));
    audioStream.on('error', fail);
  });
  made++;
  process.stdout.write('.');
}
tts && tts.close();
// 清掉不再使用的舊檔
const keep = new Set(Object.values(map).map(f => f + '.mp3'));
let removed = 0;
for (const f of readdirSync(OUT)) if (f.endsWith('.mp3') && !keep.has(f)) { unlinkSync(new URL(f, OUT)); removed++; }
writeFileSync(MAP, '// 由 tools/voice/gen.mjs 產生，請勿手改\nconst VOICE_FILES=' + JSON.stringify(map, null, 0) + ';\n');
console.log(`\n${lines.length} lines, ${made} generated, ${removed} removed`);
