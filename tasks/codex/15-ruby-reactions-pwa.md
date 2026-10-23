# Codex Task 15 — Ruby reactions everywhere + offline PWA + rescue vehicles data

No-build static site, classic scripts + globals, no deps, zh-Hant, player is 3 and cannot read. Read first: `index.html`, `js/core.js`, `js/assets.js`, `js/data.js`, `js/main.js`, `js/ruby.js`, `js/home.js`, `css/style.css`, `scripts/smoke-test.mjs`. Ruby expression ids already exist: `ruby`, `ruby_cheer`, `ruby_comfort`, `ruby_eat`, `ruby_sleep` (WebP images in `assets/game/ruby/`).

## A. Ruby reactions
1. Round-complete celebration (`cheer()` in main.js): instead of a random emoji, show Ruby jumping (`art('ruby_cheer')`, big, boing animation) with the confetti. Every 5th round (big win) show Ruby cheer plus a trophy (`art('trophy')` or existing big-win id) next to her. Keep timing identical.
2. Wrong answers: the shared `wrong(t)` currently only shakes the target. Add a small Ruby "comfort" peek: `ruby_comfort` slides up from the bottom-left corner (≈ 90px, pointer-events none), stays ~1.2 s, slides back. Throttle so rapid wrong drops don't stack (one peek at a time). No voice.
3. Idle: if no pointer interaction for 60 s on the home screen, show Ruby sleeping (`ruby_sleep`) in place of the small home Ruby; any touch wakes her (swap back with a bounce). Keep it cheap (one timer).
4. Respect `prefers-reduced-motion` (no slide/bounce, just show/hide).

## B. Rescue vehicles (data only)
Add to `THINGS` in data.js (so they appear in shadow / memory / pattern / size games): `fire_truck` 🚒 消防車, `ambulance` 🚑 救護車, `police_car` 🚓 警車, `helicopter` 🚁 直升機. Register ids in ASSETS. Do NOT edit `js/voice-map.js` or `tools/voice/` — list the new spoken names in your report.

## C. Offline PWA
- `manifest.webmanifest`: name 寶貝動動腦, short_name 動動腦, start_url `./`, scope `./`, display `standalone`, orientation `any`, background/theme `#CDEBFF`, icons `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png` (purpose maskable). **Don't create the icon PNGs** (Claude will generate them); just reference them, and add `<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">` + manifest link + `apple-mobile-web-app-*` metas in index.html. Remove the old TODO comment. Update the smoke test (it currently asserts no manifest/apple-touch-icon — change that to assert they're present, and skip the existence check for `icons/*.png` only if missing, printing a warning).
- `sw.js` service worker at repo root (must be at root for scope). Cache-first for same-origin GET of html/css/js/webp/png/mp3/webmanifest, network fallback; precache the app shell (index.html, css, all js listed in index.html, voice-map) on install; runtime-cache everything else (images, mp3) on first use. Cache name includes a version constant `SW_VERSION`; on activate delete old caches. Google Fonts: stale-while-revalidate, never block.
- Add `scripts/bump-sw.mjs` that sets `SW_VERSION` to a timestamp (to run before each deploy) and document it in a comment at the top of sw.js.
- Register the SW from main.js only when served over http(s) (`location.protocol.startsWith('http')`), after `load`. When a new SW takes over, do NOT force reload mid-game; just let the next launch use it.

## Verify
`node --check` all js; `node scripts/smoke-test.mjs` (extend for the new pieces; add `scripts/sw-test.mjs` if useful). Don't commit (sandbox can't write git metadata). Report what you built, the new say() strings / names, and uncertainties.
