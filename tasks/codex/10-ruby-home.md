# Codex Task 10 — 「露比的家」: replace the piggy bank with dress-up + room decorating

No-build static site, classic scripts + globals, no deps, zh-Hant, player is 3 and **cannot read**: everything must work through pictures, voice (`say()`), sounds and animation. Read first: `index.html`, `js/core.js`, `js/assets.js`, `js/data.js`, `js/bank.js`, `js/main.js`, `css/style.css`, `scripts/smoke-test.mjs`.

## Concept
The wide home-screen button 「存錢豬」 becomes 「露比的家」 (register id `ruby_house`, emoji 🏡 — 🏠 is already the back button). The bank screen becomes Ruby's home with three big icon tabs (no text needed; Chinese aria-labels):
1. **衣櫃 wardrobe** — dress Ruby
2. **房間 room** — decorate the room
3. **貼紙 stickers** — the existing album, read-only; old saved stickers must still render (localStorage `stickers`, entries `{e}` / `{e,big}` via `EMOJI_IDS`)

Star counter stays at the top. Stars are earned by games as today (`stars` key).

## Items & prices (stars)
Small = 1, medium = 3, large = 5. Price shown as N small star icons on the tag (like shop.js coin dots), never text only.
Put data in `js/data.js`, register every id in ASSETS with a clear, distinct emoji fallback:
- WEARABLES (8), each with a `slot`; one item per slot worn at a time; tapping the worn item takes it off:
  - 3 hats, slot `head` (e.g. flower crown small, party hat medium, crown 👑 large)
  - 2 hair accessories, slot `hair` (e.g. pink bow 🎀 small, star clip small)
  - cape, slot `back` (medium)
  - glasses 👓, slot `face` (medium)
  - scarf 🧣, slot `neck` (small)
- ROOM_ITEMS (10): bed (large), rug (medium), lamp (small), plant 🪴 (small), ball (small), scratching post (medium), bookshelf 📚 (large), curtains (medium), fish tank (large), star mobile (small).

## Ruby figure (reusable) — `js/ruby.js`
`rubyFigure(extraClass)` returns an element: Ruby base `art('ruby')` (image `assets/game/ruby/ruby-main.webp`) plus worn items layered on top. Each wearable has an anchor in % of Ruby's box: `{x, y, size, rot}` (center + size relative to Ruby's width). Look at `assets/img/ruby/ruby-main-preview.png` to pick anchors (head top ≈ y 12–18%, eyes ≈ y 35–40%, collar ≈ y 55%, back ≈ x 62% y 60%). With emoji fallbacks the item is the emoji at the anchor; when an item later gets `img`, render it at the same anchor (future art = small transparent item images, not full-canvas overlays).
- Show the dressed Ruby on the **home screen** (small, near the title; tap → `sfx.pop()` + bounce) and large in the wardrobe tab.
- Keep `rubyFigure` global so games can use it later (don't change existing games now).

## Wardrobe tab
Large Ruby + item grid. Not-owned item shows its price tag; tap → if enough stars: buy (stars decrease with a coin sound, sparkle, say 「買到了！」) and wear it immediately; else gentle `wrong()` + say 「星星不夠，再去玩遊戲吧」. Owned: tap to wear/take off (sounds + bounce only).

## Room tab
- Room scene filling the area: CSS-drawn soft pink wall + wooden floor; Ruby figure standing in it.
- Owned room items not yet placed sit in a bottom tray. **Drag** from tray into the room to place anywhere; drag placed items to move; drag back onto the tray to store. Save positions as % of room size so they survive rotation/resize.
- Buying: a big cart icon button opens a 「商店」 sheet (grid with price tags); buying puts the item into the tray with an animation.
- Size by tier: large ≈ 2×, medium ≈ 1.5×, small ≈ 1× base size.

## Persistence & migration (a child already has progress!)
- New keys: `owned` (ids), `worn` ({slot:id}), `room` ([{id,x,y}]).
- Old `piggy` (0–4 stars deposited in the old piggy bank): on first run refund into `stars`, set `piggy` 0; once only (flag `migratedHome`).
- Keep `stickers` untouched. Remove the old 換貼紙/存起來 buttons (no more sticker buying). Replace `js/bank.js` with `js/home.js` (remove dead code).

## Constraints
- Fit iPhone SE 375×667, iPhone 14 390×844, iPad portrait/landscape; no page scroll except inside the shop sheet / album.
- Touch targets ≥ 56px. Existing visual language (navy outlines, paper backgrounds, box-shadow buttons, pop/boing animations).
- Do NOT edit `js/voice-map.js` or `tools/voice/`. In the final report list every new string passed to `say()`.
- Add `scripts/home-test.mjs` (pure logic: price check, buy, wear/unwear per slot, room place/move/store, piggy migration runs once) imported from smoke-test.

## Verify
`node --check` all js; `node scripts/smoke-test.mjs`. Don't commit (sandbox can't write git metadata). Report what you built, the anchors chosen, and uncertainties.
