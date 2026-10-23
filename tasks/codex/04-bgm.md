# Codex Task 04 — Background music box + music toggle

Repo is a no-build static toddler game (zh-Hant UI, player is 3 and cannot read). Read `index.html`, `js/core.js`, `js/main.js`, `css/style.css` first. Classic scripts with globals, no modules, no dependencies.

## Build
1. New file `js/bgm.js` — procedural, gentle **music-box** background music using Web Audio (reuse the shared AudioContext pattern in core.js; expose/share one context, don't create a second if avoidable).
   - Soft bell/celesta timbre (e.g. sine + quiet 2nd/3rd harmonic, fast attack, ~1.2 s exponential decay), light low-pass, gentle stereo-free mix
   - A short lullaby-like original melody in C or F major, ~70–80 BPM, 8–16 bars, simple chord tones underneath, looping seamlessly. A second variation is welcome. Original composition only (no existing songs).
   - Quiet: master gain ≈ 0.05–0.08 so speech and SFX stay clearly on top. While `say()` speech or a future voice mp3 is playing, duck music to ~40% (expose `bgmDuck(on)`; call it from `say()` via utterance onstart/onend).
   - Schedule notes ahead with a lookahead timer (no setInterval drift); stop cleanly.
   - Starts only after the first user gesture (autoplay policy). Pause when `document.hidden`, resume when visible (if enabled).
   - API: `bgmStart()`, `bgmStop()`, `bgmSetEnabled(bool)`, `bgmDuck(bool)`.
2. Music toggle, **separate** from the existing sound toggle (sound button controls SFX + speech as today):
   - Add a second round `.icon-btn` next to the existing sound button on the home header; use `art('music')`/`art('music_off')` (add registry ids with emoji 🎵 and a muted variant, e.g. 🎵 with a CSS strike or 🔕 — pick something a 3-year-old's parent can recognize).
   - Persist in localStorage key `music` (default **on**). If the sound button turns everything off, music also stays silent; turning sound back on restores music according to `music`.
3. Keep everything else identical. Don't touch `original/`.

## Verify
- `node --check` on changed js; run `node scripts/smoke-test.mjs` (extend it if you add ids).
- Commit on the current branch with message "Add procedural music-box BGM and music toggle". Report what you built and anything uncertain.
