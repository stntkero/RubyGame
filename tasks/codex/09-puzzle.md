# Codex Task 09 — New game: 拼圖 (simple puzzle) for a 3-year-old

No-build static site, classic scripts + globals, no deps, zh-Hant, player cannot read. Read first: `index.html`, `js/core.js`, `js/assets.js`, `js/data.js`, `js/main.js`, `js/games/feed.js` and `js/games/shadow.js` (drag/drop + slot pattern), `css/style.css`, `scripts/smoke-test.mjs`.

## Game `js/games/puzzle.js` → `GAMES.puzzle`
- Picture source: asset ids that have an `img` (currently `ruby` → `assets/game/ruby/ruby-main.webp`). Keep `PUZZLES=['ruby']` in data.js so more pictures can be added later. If an id has no image, fall back to drawing its emoji large on an offscreen canvas and use that dataURL.
- Board: a square frame with a light pink card background (the image is transparent). Pieces are rectangular tiles cut via CSS `background-image` + `background-position`/`background-size` (no canvas cutting), each tile with navy outline and rounded corners like `.piece`.
- Levels (L = round + diff*2):
  - L < 2: 2 pieces (left/right halves); board shows a faint ghost (opacity ~.25) of the full picture
  - 2 ≤ L < 4: 3 pieces (three vertical strips) with ghost
  - 4 ≤ L < 6: 4 pieces (2×2) with ghost
  - L ≥ 6: 6 pieces (2×3) **without** ghost (only dashed cell outlines)
- Drag a piece onto the board: snaps only into its correct cell (generous hit area like `hitTarget`); wrong cell → `wrong()` shake. Correct → `sfx.ok()`, `buzz(30)`, cell filled with `pop` animation.
- When complete: the full picture does a happy bounce, then `done()`.
- Tray below the board, shuffled; same wiggle hint on the first piece at round 0 & easy difficulty as other games.
- Fit iPhone SE 375×667 portrait without scrolling and iPad landscape; return a relayout function using the `--s` approach.

## Wire up
- Menu button: label 「拼圖」, icon `art('puzzle')` (register id `puzzle`, emoji 🧩), color e.g. `--c:#B5E3FF`. Keep the home grid tidy with 8 games + the wide button (two columns on phone).
- `PROMPTS.puzzle='把拼圖拼起來'`.
- Script tag; extend smoke test; add `scripts/puzzle-test.mjs` (pure logic: level → piece count/ghost, cell mapping) imported from smoke-test like feed-test.
- Do NOT edit `js/voice-map.js` or `tools/voice/`. In the final report list every new string passed to `say()`.

## Verify
`node --check` changed js; `node scripts/smoke-test.mjs`. Don't commit (sandbox can't write git metadata) — leave changes in the working tree. Report what you built and any uncertainty.
