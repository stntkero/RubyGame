# Codex Task 02 — Split the single-file game into a project + image/emoji fallback

## Context
`original/index.html` is a working toddler game (「寶貝動動腦」, zh-Hant UI) in ONE file: inline CSS + inline JS, all graphics are emoji.
We will later replace emoji with illustrated PNG/WebP images, one at a time. This task prepares the code for that.
**Do not touch `original/`.** It is the reference.

## Goal
Create a new no-build static site at the repo root that behaves **exactly like the original** (same screens, games, difficulty, sounds, speech, storage keys, animations, dark mode). Only the file layout and the asset mechanism change.

## Target layout
```
index.html            # markup only, links CSS + scripts (classic <script defer>, NOT ES modules — must also work when opened via file://)
css/style.css         # all CSS from the original, unchanged except what's needed for images (see below)
js/core.js            # helpers ($, div, shuffle, pick), store, sound (tone/sfx/say/buzz), drag (makeDraggable/hitTarget/wrong/sizeFor), confetti
js/assets.js          # asset registry + art() helper (see below)
js/data.js            # THINGS, COLORS, SHOP, NUMS, PRAISE, CHEERS, SMALL, RARE
js/games/shadow.js    # one file per game, each registers itself: GAMES.shadow = function(stage,L,done){...}
js/games/memory.js
js/games/color.js
js/games/shop.js
js/games/pattern.js
js/games/size.js
js/bank.js            # piggy bank screen
js/main.js            # flow: show/startGame/nextRound/roundDone/cheer/goHome, menu wiring, sound + difficulty buttons, resize
```
Use a single global namespace object `window.RG` OR plain globals — your choice, but be consistent and keep it simple. Keep the original variable/function names where possible so diffs against the original are easy to read. Script load order must make everything defined before `main.js` runs.

## Asset mechanism (js/assets.js)
- Every drawable thing gets a stable **id** (lowercase ascii, e.g. `dog`, `cat`, `apple`, `candy`, `pig`, `trophy`, `basket`, `coin`). Add an `id` field to every entry in THINGS and SHOP; for SMALL / RARE / CHEERS / UI emoji (🏠 🔊 🔇 ⭐ 🐷 🛒 👛 🛍️ 🏆 ➜ etc.) create id entries too.
- Registry shape:
  ```js
  const ASSETS = {
    dog: { emoji: '🐶' /*, img: 'assets/img/dog.webp' */ },
    ...
  };
  ```
  All `img` fields stay **empty/absent** in this task — we have no images yet.
- `art(id, extraClass='')` returns an HTML string:
  - if `ASSETS[id].img` exists → `<img class="art ${extraClass}" src="..." alt="" draggable="false">`
  - else → `<span class="emoji ${extraClass}">${emoji}</span>` (exactly what the original rendered)
- Replace every place that renders an emoji in markup or JS with `art(...)` (or, for static markup in index.html, render it from JS at startup — your choice, as long as the visible result is identical).
- Images, when present later, must behave like the emoji they replace:
  - `.art` sized the same as the `.emoji` it replaces in each context (same `font-size`-based sizes → use `width/height:1em` with the same font-size rules, `object-fit:contain`)
  - the shadow game's silhouette (`filter: var(--shade)`) and the `filled` reveal must work on `.art` too
  - `pointer-events:none`, not draggable, no long-press callout
- On image load error, fall back to the emoji automatically (`onerror` swap).
- Comparisons in game logic must use ids, not emoji characters (e.g. shadow game `dataset.key`, pattern game equality, memory matching).

## Also
- Remove the two broken references in `<head>` to `manifest.json` and `apple-touch-icon.png` (files don't exist; we'll add real ones later). Leave a `<!-- TODO: PWA manifest + icon -->` comment.
- No dependencies, no bundler, no npm packages.
- Keep `localStorage` keys identical (`stars`, `sound`, `diff`, `piggy`, `stickers`) so existing progress on the child's phone survives. Note: old `stickers` entries store `{e:'🍬'}` emoji strings — keep reading those correctly (map emoji → id when rendering, or keep storing emoji; just don't break old saves).

## Verify before finishing
1. `node --check` every js file.
2. Write a tiny Node script in `scripts/smoke-test.mjs` that loads `index.html` text and asserts every referenced css/js file exists, and that every id used in data.js exists in ASSETS. Run it.
3. Grep the new JS/HTML: no game-logic comparison should rely on raw emoji characters.

## Report
Print: list of files created, anything you changed in behavior on purpose (should be none besides the head links), and anything you were unsure about. Do not commit — I'll review and commit.
