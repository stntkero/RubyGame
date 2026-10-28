# Codex Task 30 — Patient animals for the bandage game (images only)

Read and follow tasks/codex/STYLE.md. For a 3-year-old: gentle, cute, never scary, no blood, no wounds drawn (the game draws the boo-boos on top).

The game: a little animal got hurt; the child taps the boo-boos to put bandages on. The animal must have BIG, clear, flat body areas (arms, legs, tummy) where boo-boo stickers can sit.

For each animal id in: rabbit, bear, cat, dog, panda
- `patient_<id>` — the same character as `assets/img/things/<id>.png` (same colors and design), full body, sitting and facing the viewer, symmetric pose: arms held slightly out from the body, both legs stretched forward with the soles showing, round tummy visible. Sad, teary face (one small tear, pouty mouth) — mild, still cute. Nothing else in the picture (no bandages, no props, no ground shadow).
- `patient_<id>_happy` — EXACTLY the same image, same pose, size and position, only the face changed to a big happy smile with closed happy eyes. Best made by editing `patient_<id>` rather than drawing from scratch, so the body lines up when the game swaps the two images.

Square canvas, character centered and filling ~90% of the height, transparent background.

Save to `assets/img/mini/<name>.png` plus a `<name>-preview.png` on #808080. Do not touch any other file. Print the saved paths only. No code.
