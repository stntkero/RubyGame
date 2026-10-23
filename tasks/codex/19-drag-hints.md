# Codex Task 19 — Idle "show me how" hints for a 3-year-old

No-build static site, classic scripts + globals, no deps. Read first: `index.html`, `js/core.js`, `js/main.js`, all `js/games/*.js`, `css/style.css`, `scripts/smoke-test.mjs`.

A 3-year-old who doesn't know what to do just stares. Add a gentle demonstration:

## Helper in core.js
`hintDrag(fromEl, toEl)` / `hintTap(el)` — a translucent pointer (`art('hint_paw')`, register id `hint_paw` with emoji 👆 fallback; an image will be added later at `assets/game/ui/hint_paw.webp`) appears on `fromEl`, presses (scale .9), glides to `toEl` over ~1.2 s with an ease-in-out, fades out. Pure CSS transforms on a fixed-position element (pointer-events:none, z above the stage, below the cheer overlay). Uses getBoundingClientRect at start; aborts if either element is gone.
`idleHint(getPair, {first=5000, every=8000})` — starts a per-round idle timer: after `first` ms without any pointerdown on the stage it calls `getPair()` → `{from,to}` (drag) or `{tap}` and plays the hint; repeats every `every` ms of continued idle; any pointerdown resets the timer; returns a `stop()` and is automatically stopped when the round ends / stage is cleared / going home (hook into the existing `gen` round-generation guard so stale timers never fire).
- Only on difficulty 簡單 and 普通 (diff 0 and 1); never on 挑戰. Respect `prefers-reduced-motion` (show the paw blinking on `from` then on `to`, no glide).

## Wire into games (pick the *next correct* move every time getPair is called):
- shadow: an unplaced piece → its matching slot
- color: an unplaced ball → its basket
- size: the unplaced piece whose rank is the smallest unfilled slot → that slot
- feed: a pile fish → the bowl (if the bowl already has enough at a confirm level, tap the bell/Ruby instead)
- puzzle: an unplaced tile → its cell
- shop: if nothing chosen → tap the target item (errand) or an affordable item; else a coin → the tray
- memory, pattern: tap hints — memory: tap a face-down card (if one card is open, tap its matching card); pattern: tap the correct option

## Tests
Add `scripts/hints-test.mjs` (fake timers/DOM like other tests): first hint after 5 s idle, reset on pointerdown, repeat interval, disabled on diff 2, stale-round safety, and that each game's getPair returns a valid correct pair. Import from smoke-test.

Don't commit (sandbox). Report what you built and uncertainties.
