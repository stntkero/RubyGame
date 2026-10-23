# Codex Task 03 — 露比 (Ruby) master character image

**Images only. Do not create or modify code files.**

Reference: `assets/samples/01-mascot-B-flat.png` (look at it first with your image viewer). The parent chose this style. Keep the SAME character design (pink kitten, cream belly/muzzle/inner ears, big dark eyes with highlights, red collar with one faceted ruby-red heart gem, mint/teal rounded backpack with a small white heart on the flap, short curled tail, chibi proportions), same waving pose.

Improve:
- Cleaner, more "flat sticker" look: smooth **solid** dark-navy outline (#2F3A68, consistent thickness ~ 2.5% of image width), **no fuzzy/furry jagged outline** (a few simple fur tufts on cheeks/head are fine), flat fills + one soft shade tone, minimal texture
- Must read well when shrunk to 64×64 px
- Original character: no logos, text, badges, uniforms, helmets; must not resemble PAW Patrol / Robocar POLI / Hello Kitty / Pusheen

Background: **transparent** PNG. If the generator cannot output transparency, generate on solid pure white (#FFFFFF) and then remove the background yourself with a script (Node is available; no Python). Keep anti-aliased edges clean (no white halo). Use a flood fill from the corners so the white belly/eye highlights are NOT removed.

Output:
- `assets/img/ruby/ruby-main.png` — 1024×1024, transparent, character centered with ~8% margin
- `assets/img/ruby/ruby-main-preview.png` — same image composited onto a mid-gray (#808080) background, so the parent can check the edges
- Print both paths and one line about how transparency was achieved. Nothing else.
