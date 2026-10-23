// 產生配音試聽樣本：同一句話用不同聲音念，讓家長挑
import {MsEdgeTTS, OUTPUT_FORMAT} from 'msedge-tts';
import {createWriteStream, mkdirSync} from 'node:fs';

const OUT = '../../assets/samples/voice';
const TEXT = '哈囉！我是露比。我們一起出任務吧！好棒喔，你答對了！';
const VOICES = [
  ['A-HsiaoChen', 'zh-TW-HsiaoChenNeural', {}],
  ['B-HsiaoYu', 'zh-TW-HsiaoYuNeural', {}],
  ['C-HsiaoChen-slow-bright', 'zh-TW-HsiaoChenNeural', {rate: '-12%', pitch: '+8%'}],
];
mkdirSync(OUT, {recursive: true});
for (const [name, voice, prosody] of VOICES) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const {audioStream} = tts.toStream(TEXT, prosody);
  await new Promise((ok, fail) => {
    const f = createWriteStream(`${OUT}/${name}.mp3`);
    audioStream.on('data', d => f.write(d));
    audioStream.on('close', () => f.end(ok));
    audioStream.on('error', fail);
  });
  tts.close();
  console.log('wrote', name);
}
