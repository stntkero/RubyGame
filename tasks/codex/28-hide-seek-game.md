# Codex Task 28 — New game 「找找看」 (hide and seek: find the kittens)

No-build static site, classic scripts + globals, player is 3–4 and cannot read. Read: `index.html`, `js/main.js`, `js/core.js` (idleHint/hintTap, the `gen` round guard), `js/assets.js`, `js/data.js`, `css/style.css`, `scripts/*-test.mjs`. Difficulty: diff 1/2/3, L = round + diff*2 (L 2..~14).

## Game `js/games/hide.js` → `GAMES.hide`
A scene card fills the stage (rounded panel, soft sky-to-grass CSS gradient). Code places N hiding spots without overlapping (positions in % so it survives resize). Spot ids: bush, flower_pot, box, basket, tree_trunk, curtain, slide, sofa, barrel, umbrella — register with emoji fallbacks 🌳 🌷 📦 🧺 🪵 🪟 🛝 🛋️ 🛢️ ⛱️ (images will arrive at `assets/game/hide/<id>.webp`).
K of the spots hide a kitten: a kitten piece drawn partly *behind* the spot (lower z-index): `kitten_peek_head_<color>` peeking over the top edge, or `kitten_tail_<color>` sticking out of a side. Colors: white, gray, black, calico, orange (tails only gray/black/orange). Register `kitten_peek_head_*`, `kitten_tail_*`, `kitten_full_*` ids with emoji fallback 🐱 (images later at `assets/game/hide/<id>.webp`).
- Tap a spot (or the visible kitten part) that hides a kitten → the spot tilts/slides aside, `kitten_full_<color>` pops out with a boing, sfx, say 「找到了！」 then the count so far (一、二、三… using NUMS, 「二」 for 2). A found-counter row at the top shows K kitten silhouettes that fill in.
- Tap an empty spot → it wiggles with a soft sound; no penalty.
- Round start: say 「找出X隻小貓」 (X from NUMS, 兩 for 2). When all found: say 「全部找到了！」 then done() exactly once.
Levels (more spots, more kittens, smaller peeks):
- L 2–3: 4 spots, 2 kittens, heads clearly peeking
- L 4–5: 6 spots, 3 kittens
- L 6–7: 8 spots, 4 kittens, some tails
- L 8–9: 10 spots, 5 kittens, smaller peeks (only ears)
- L ≥ 10: 12 spots (repeat types, vary size and mirror), 6 kittens, tails and ears only
Idle hint (`idleHint`): tap the spot of an unfound kitten.
Fit iPhone SE 375×667 portrait and iPad landscape. Guard timers so leaving mid-round is safe.

## Wiring
Menu button 「找找看」 (icon `art('kitten_peek_head_orange')`, `--c:#D7C4FF`) at the end of the game list; keep the 2-column grid tidy (there will be 9 game buttons + the wide 露比的家 button — make the last odd one span nicely or make 露比的家 share the row). Script tag; PROMPTS.hide=''.
Tests `scripts/hide-test.mjs` (no-overlap layout for every level, level → counts, found logic, completes once), imported by smoke-test.
List new say() strings. Don't edit voice files. Don't commit (sandbox). Report.
