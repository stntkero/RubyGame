# Codex Task 23 — Fitted wearable overlays aligned to Ruby (images only)

Problem: accessories are separate stickers pasted on top of Ruby, so the crown sits wrong and the scarf looks like a flat sticker. We need each accessory drawn **as worn by Ruby**, on a transparent layer that lines up exactly with `assets/img/ruby/ruby-main.png`.

Read `tasks/codex/STYLE.md`. Use `assets/img/ruby/ruby-main.png` as the reference/base for every image (same 1024×1024 canvas, same character placement). For each item:
1. Produce an image of Ruby wearing the item (edit ruby-main; keep Ruby herself unchanged).
2. Extract ONLY the accessory into a transparent 1024×1024 PNG at exactly the position it occupies on Ruby (e.g. diff against ruby-main and keep the accessory pixels, then clean edges; or draw the overlay directly and verify by compositing). The overlay must contain no cat pixels.
3. Composite overlay onto ruby-main and check it looks natural (it must sit ON her: crown resting on the top of her head between the ears, tilted with her head; scarf wrapped around the neck covering the collar, with a knot/ends hanging in front of the chest, partly occluding the body naturally; glasses on the eyes; bow at the base of her left ear; star clip on the fur above her right eye; flower crown ringing the head between the ears; party hat on top of head tilted; cape behind her shoulders — for the cape, the overlay should only show the parts visible around her body/legs, i.e. it sits *behind* Ruby).

Items (match the existing icon designs in `assets/img/wear/<id>.png` — same colors/details):
royal_crown, flower_crown, party_hat, pink_bow, star_clip, glasses, scarf, cape

Save overlays to `assets/img/wear-fit/<id>.png` and a preview of each composited on ruby-main over #808080 to `assets/img/wear-fit/<id>-preview.png`. Also one combined preview `assets/img/wear-fit/all-preview.png` with crown+glasses+scarf+bow worn together.

Important: Ruby's walk frames (`assets/img/ruby/walk-*.png`, may still be in progress) keep the head/torso identical, so overlays aligned to ruby-main will also fit them — don't use the walk frames as the base.

Print saved paths. Do not touch code.
