# Codex Task 22 — Ruby walk-cycle frames (images only)

Use `assets/img/ruby/ruby-main.png` as the base image (edit it / use it as the reference input — do NOT redraw Ruby from scratch). Read `tasks/codex/STYLE.md` for style rules.

We need a short walk cycle that will be flipped through like a GIF while Ruby walks in her room. Accessories (hats, glasses, scarf) are overlaid by code at fixed positions on her head/face/neck, so:

**Critical — between frames, ONLY the legs, feet, the non-waving arm and the tail may change. Head, face, ears, collar, gem, backpack and torso must stay pixel-identical in position, size and drawing.** Same 1024×1024 canvas, same placement as ruby-main.png, transparent background.

Frames (Ruby walking toward the viewer's right, but keeping her body facing the viewer like the master pose — a cute "marching in place while moving" look; both arms can swing instead of waving):
1. `assets/img/ruby/walk-1.png` — left foot forward/lifted, right foot planted, arms swing opposite
2. `assets/img/ruby/walk-2.png` — both feet under body (passing pose), body same height
3. `assets/img/ruby/walk-3.png` — right foot forward/lifted, left foot planted, arms swing opposite
4. `assets/img/ruby/walk-4.png` — passing pose again (may equal frame 2 but with tail swung to the other side)

Also save a contact sheet `assets/img/ruby/walk-sheet-preview.png` (4 frames side by side on #808080) so alignment can be checked. Verify alignment yourself: overlay each frame on ruby-main and confirm the head region (top 55% of the character) is unchanged; if a generated frame drifts, fix it by compositing ruby-main's head/torso region back on top of the new legs.

Print the saved paths and the alignment check result. Do not touch code.
