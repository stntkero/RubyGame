# Codex Task 05 — New game: 餵露比吃魚 (Feed Ruby fish) — counting 1–5

Repo is a no-build static toddler game (zh-Hant UI, player is 3 and cannot read). Read `index.html`, `js/core.js`, `js/assets.js`, `js/data.js`, `js/main.js`, `js/games/shop.js` (closest existing pattern: drag coins into tray, dot slots, spoken counting) and `css/style.css` first. Classic scripts, globals, no deps.

## Game: `js/games/feed.js` → `GAMES.feed`
Ruby the pink kitten mascot is hungry. Use asset ids (emoji fallback until art exists): `ruby` (🐱), `fish` (🐟), `bowl` (🥣). Add them to the registry.

- Top: Ruby big (≈1.6×--s), with a speech-bubble-like request showing N fish icons (visual, no text). Voice: 「露比想吃N條魚」 using the existing `say()` and `NUMS` (use 「兩」 for 2 like shop.js does). Prompt line for the game in PROMPTS: 「餵露比吃魚」.
- Middle: Ruby's bowl (drop target). Bottom: a pile of fish pieces (draggable via `makeDraggable`) — always MORE fish than needed (N + 1..3).
- Each fish dropped in the bowl: pop/coin-like tick sound, count aloud (「一」「二」…), bowl shows the fish (mini icons, `pop` animation).
- Levels (L = round + diff*2, same as other games):
  - L < 2: N ∈ 1..3; dashed **slots** in the bowl show how many are needed (like shop `showSlots`); round completes automatically when bowl has N.
  - 2 ≤ L < 5: N ∈ 2..5; slots still shown; auto-complete.
  - L ≥ 5: N ∈ 3..5; **no slots** (only the fish icons in Ruby's request bubble); the child taps Ruby (or a bell 🔔 id `bell`) to say "done". If count == N → success. If less → Ruby says 「還要再一條」/「還要再X條」 and wiggles; if more → 「太多了，拿回去一條」 and the child can drag a fish out of the bowl back (or tap a fish in the bowl to remove it — pick the simpler, robust one).
- Success: Ruby happy bounce, `sfx.ok()`, say 「好好吃！謝謝你！」, then call `done()` (the shared flow awards the star and confetti).
- No reading required anywhere. Large touch targets. Must fit an iPhone SE (375×667) portrait without scrolling, and iPad landscape. Use the existing `sizeFor`/`--s` layout approach and return a relayout function like other games.

## Wire up
- Home menu: add a game button (color pink-ish, e.g. `--c:#FFB3CF`) with `art('fish')` and label 「餵露比」. Keep the grid tidy: there are now 7 games + the wide piggy-bank button; make it look intentional on 375px wide and in landscape.
- `index.html` script tag for the new file; smoke test still passes (extend it for the new ids).

## Verify & commit
- `node --check`, `node scripts/smoke-test.mjs`.
- Commit on the current branch: "Add 餵露比 counting game". Report what you built, level behavior, and anything uncertain.
