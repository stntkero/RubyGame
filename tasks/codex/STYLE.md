# Shared art style for all image tasks

- Reference images (look at them first): `assets/img/ruby/ruby-main.png`, `assets/img/feed/fish.png`, `assets/img/feed/bowl.png`.
- Smooth solid dark-navy outline (#2F3A68), consistent thickness (~2.5% of canvas width at 1024 px), flat bright pastel fills + one soft shade tone, small white highlight, sticker look. Must read clearly at 64×64 px.
- Cute and friendly for a 3-year-old. No text, letters, numbers, logos, brands, badges. Nothing resembling existing franchises (PAW Patrol, Robocar POLI, Hello Kitty, Pusheen, Disney, Sanrio…). **Vehicles have NO faces.**
- 1024×1024 PNG, **transparent background**, subject centered with ~8% margin, no ground shadow, no scenery. If the generator can't do transparency: generate on pure white (#FFFFFF), remove background by flood fill from the corners (keep interior whites), no white halo.
- For each image also save `<name>-preview.png` composited on #808080.
- Images only: never create or modify code files. When finished, print the list of saved paths, nothing else.
- Work through the list one image at a time and save each as soon as it is done, so partial progress survives.
