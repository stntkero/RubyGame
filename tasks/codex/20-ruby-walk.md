# Codex Task 20 — Ruby walks around her room

No-build static site, classic scripts + globals, no deps, player is 3. Read first: `js/home.js`, `js/ruby.js`, `css/style.css`, `js/data.js`, `scripts/home-test.mjs`. Ruby in the room tab is `rubyFigure('room-ruby')` (absolutely positioned, `bottom:8%;left:12%`, z-index 88). Room items are absolutely positioned with z-index `10 + y%` (rug = 2).

## Behaviour
1. **Tap the floor → Ruby walks there.** A tap (pointer moved < 8px) on empty room area (not on an item, not on the cart button) sets a target. Ruby walks to it at ~22% of room width per second (min 0.4 s), then stops with a small happy bounce. Clamp target so Ruby stays fully inside the room and her feet stay on the floor area (bottom ~45% of the room; if the tap is on the wall, walk to the floor point straight below it).
2. **Idle wandering:** if nobody touches the room for 8–14 s (random), Ruby walks to a random floor spot; keep going while idle. Stops when leaving the tab/screen.
3. **Tap Ruby →** she does a happy jump (`ruby_cheer` image briefly, ~0.8 s, then back) and `sfx.pop()`.
4. Ruby's worn accessories must move with her (she is the `rubyFigure` element, so just move that element).

## Walking animation (CSS only — no new images)
- Face the walking direction: flip horizontally with `scaleX(-1)` when walking left (the base art faces/waves toward the viewer's left-ish; pick whichever reads naturally — accessories flip with her, which is fine).
- "Waddle": while moving, a looping keyframe on an inner wrapper: rotate −6°↔6° and translateY 0↔−6% at ~0.35 s per step. Stop the loop when she arrives.
- Move with `left`/`bottom` in % (so it survives resize) using a CSS transition whose duration matches the distance; or requestAnimationFrame — your choice, but no layout thrash.
- Depth: while walking, update Ruby's z-index to `10 + her feet y%` so she passes in front of/behind furniture correctly (same rule as items).
- Persist her last position in localStorage key `rubyPos` ({x,y} in %), restore on render.
- `prefers-reduced-motion`: no waddle, just move (or jump directly).

## Constraints
- Must not break dragging furniture (dragging an item must not trigger a walk) or tap-to-store on items.
- Keep hit testing robust on touch devices. Clean up timers when re-rendering / leaving the room tab / going home (no stacked intervals).
- Extend `scripts/home-test.mjs` (pure logic: target clamping to floor, z-index from y, idle timer reset/cleanup) .

Don't commit (sandbox). Report what you built and uncertainties.
