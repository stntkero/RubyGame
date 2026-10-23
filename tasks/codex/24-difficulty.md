# Codex Task 24 — Remove 簡單, add 超級挑戰 (harder tier)

No-build static site, classic scripts + globals. Read `index.html`, `js/main.js`, `js/core.js` (hints: `idleHint` is disabled on diff 2), every `js/games/*.js`, `css/style.css`, and the tests in `scripts/`.

The parent says the game is too easy for their child. Today: difficulty buttons 簡單/普通/挑戰 = `diff` 0/1/2, and each game gets `L = round + diff*2` (round 0..∞, 5 rounds per star cycle). Most games cap their parameters around L 6–7, so 挑戰 quickly stops getting harder.

## Changes
1. Difficulty buttons become **普通 / 挑戰 / 超級挑戰** with internal values **1 / 2 / 3** (keep `L = round + diff*2`). Remove 簡單. Migration: a stored `diff` of 0 becomes 1; default for new players 1. Keep the three-button layout tidy on 375px width.
2. Idle "show me how" hints: only on 普通 (diff 1) now.
3. Every game must keep getting harder up to about **L = 12** (超級挑戰 starts at L 6). Extend each game's tables so L 8–12 are clearly harder than today's maximum, while still doable for a bright 3–4-year-old (no reading, no timers, no penalties):
   - **shadow**: up to 8 pieces with 3 decoy shadows; at L ≥ 10 the slots are shuffled after each correct drop? — no, keep slots fixed, but make pieces smaller to fit; use look-alike decoys (same category, e.g. animals among animals) at L ≥ 9.
   - **memory**: up to 8 pairs (16 cards) at L ≥ 10; 7 pairs at L 8–9; choose a grid that fits 375×667.
   - **shop**: L ≥ 8 free-choice mode with prices up to 5 and **two items to buy** (request bubble shows two goods; pay each in turn); L ≥ 10 the wallet has exactly enough coins for the two items (no spare).
   - **pattern**: templates ABCD, AABC, ABAC, AABBC; L ≥ 8 the missing cell can be in the middle of the sequence (not only last); 5 answer options at L ≥ 10.
   - **size**: up to 7 items; L ≥ 8 no shadow hint (already) and sizes closer together (smaller steps); L ≥ 10 order from **big to small** sometimes — say 「從大排到小」 (add the line) and show the scale hint arrow reversed.
   - **feed**: L ≥ 8 needs 4–8 fish, no slots, bell confirm; L ≥ 10 the pile has **two kinds of fish** (blue fish and an orange decoy fish id `fish_orange`, emoji fallback 🐠) and Ruby only eats blue: request bubble shows blue fish; dropping an orange one → Ruby shakes head 「露比只吃藍色的魚」 and it bounces back.
   - **puzzle**: L 8–9: 9 pieces (3×3) with no ghost; L ≥ 10: 12 pieces (3×4) no ghost.
   - **color** (still present for now, may be replaced later): L ≥ 8: 5 colors × 3 balls; L ≥ 10: 6 colors.
4. Any new spoken lines: list them in your report (don't edit `js/voice-map.js` / `tools/voice/`).
5. Update/extend the tests in `scripts/` for the new level tables and migration.

Verify `node scripts/smoke-test.mjs`. Don't commit (sandbox). Report the level tables per game.
