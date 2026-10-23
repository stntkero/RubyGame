// Before every deploy run: node scripts/bump-sw.mjs
const SW_VERSION = '20261023T061448550Z';
const CACHE_PREFIX = 'ruby-pwa-';
const CACHE_NAME = CACHE_PREFIX + SW_VERSION;
const APP_SHELL = [
  './index.html', './css/style.css', './manifest.webmanifest',
  './js/voice-map.js', './js/core.js', './js/bgm.js', './js/assets.js', './js/data.js',
  './js/games/shadow.js', './js/games/memory.js', './js/games/color.js',
  './js/games/shop.js', './js/games/feed.js', './js/games/puzzle.js',
  './js/games/pattern.js', './js/games/size.js', './js/ruby.js', './js/home.js', './js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL.map(url => new Request(new URL(url, self.location.href).href, {cache: 'reload'})))));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
    .map(key => caches.delete(key)))).then(() => self.clients && self.clients.claim()));
});

// 頁面在首頁時會請新版本立即接手
self.addEventListener('message', event => { if(event.data === 'skipWaiting') self.skipWaiting(); });

async function fetchAndCache(request, cache) {
  // 同網域檔案略過瀏覽器的 HTTP 快取（GitHub Pages 會快取 10 分鐘），確保拿到這一版的檔案
  const sameOrigin = new URL(request.url).origin === self.location.origin;
  const response = await fetch(sameOrigin ? new Request(request.url, {cache: 'no-cache'}) : request);
  if(response.ok || response.type === 'opaque') {
    // Storage limits must not stop a successful network response.
    try { await cache.put(request, response.clone()); } catch (_) {}
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET')return;
  const url = new URL(request.url);
  if(['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) {
    // Cached fonts return immediately; a failed refresh never blocks the app.
    const refresh = caches.open(CACHE_NAME).then(cache => fetchAndCache(request, cache));
    event.waitUntil(refresh.catch(() => {}));
    event.respondWith(caches.open(CACHE_NAME).then(async cache =>
      await cache.match(request) || await refresh).catch(() => Response.error()));
    return;
  }
  if(url.origin !== self.location.origin ||
    !(request.mode === 'navigate' || /\.(?:html|css|js|webp|png|mp3|webmanifest)$/i.test(url.pathname)))return;
  event.respondWith(caches.open(CACHE_NAME).then(async cache => {
    const cached = await cache.match(request);
    if(cached)return cached;
    // The scope's ./ start URL uses the precached index even on its first offline launch.
    if(request.mode === 'navigate' && url.pathname === new URL('./', self.location.href).pathname) {
      const index = await cache.match('./index.html');
      if(index)return index;
    }
    try { return await fetchAndCache(request, cache); }
    catch(error) {
      if(request.mode === 'navigate') {
        const index = await cache.match('./index.html');
        if(index)return index;
      }
      throw error;
    }
  }));
});
