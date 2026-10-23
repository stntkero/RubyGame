import {readFileSync, writeFileSync} from 'node:fs';
const path = new URL('../sw.js', import.meta.url);
const source = readFileSync(path, 'utf8');
const version = new Date().toISOString().replace(/[-:.]/g, '');
if(!/const SW_VERSION = '[^']+';/.test(source))throw new Error('SW_VERSION not found');
writeFileSync(path, source.replace(/const SW_VERSION = '[^']+';/, `const SW_VERSION = '${version}';`));
console.log(`Service worker version: ${version}`);
