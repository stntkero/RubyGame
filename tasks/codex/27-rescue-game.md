# Codex Task 27 — Finish 「救援大隊出動」 and replace 顏色分類

No-build static site, classic scripts + globals, player is 3–4 and cannot read. Read: `index.html`, `js/main.js`, `js/core.js` (makeDraggable, hitTarget, wrong, idleHint), `js/assets.js`, `js/data.js`, `css/style.css`, `scripts/*-test.mjs`, and **`js/games/rescue.js` (already drafted by Claude — keep its design, finish and polish it)**. Difficulty is 普通/挑戰/超級挑戰 = diff 1/2/3, L = round + diff*2 (L from 2 to ~14).

## Finish the game
- Register asset ids with emoji fallbacks (images will arrive later at `assets/game/rescue/<id>.webp`): fire_house 🔥, fire_tree 🌳, hurt_bunny 🐰, sick_bear 🐻, lost_puppy 🐶, lost_duckling 🐥, cat_on_cliff 🐱, sheep_on_island 🐑, done_happy 👍. (Vehicles fire_truck/ambulance/police_car/helicopter already exist with images.)
- CSS for `.rescue-card` (big rounded paper card ≈ 1.35×--s, gentle wiggle, `.rescued` state with the 👍 `.rescue-done` badge overlaid in a corner), `.rescue-calls` row, `.rescue-garage` row (vehicle pieces like `.piece`).
- On a correct rescue, animate the vehicle "driving" onto the card (a quick translate from its garage spot to the card, then it returns home) before the card turns rescued. Keep vehicles reusable (drop handler returns false).
- Make sure the round never gets stuck: after the last situation, done() exactly once; timers guarded so leaving to home mid-round is safe (use the `gen` pattern / isConnected).
- Fit iPhone SE 375×667 portrait and iPad landscape.

## Replace 顏色分類
- Remove the 顏色分類 menu button, its script tag, `js/games/color.js`, its PROMPTS entry, and color references in tests. Put 「救援大隊」 (icon `art('fire_truck')`, `--c:#FFB3A7`) in that menu slot; add the rescue.js script tag. PROMPTS.rescue=''.
- Tests: `scripts/rescue-test.mjs` (level → counts, plan types distinct for first 4, correct/wrong mapping & hint text, vehicles reusable, completes once), imported by smoke-test; update hints-test so the hint loop covers rescue instead of color.
- Spoken lines already used: 救援大隊出動！ / 失火了！ / 有人受傷了！ / 有人迷路了！ / 有人被困住了！ / 謝謝救援大隊！ / 失火了，要找消防車 / 受傷了，要找救護車 / 迷路了，要找警車 / 被困住了，要找直升機. List any new ones. Don't edit voice files.

Verify `node scripts/smoke-test.mjs`. Don't commit (sandbox). Report.
