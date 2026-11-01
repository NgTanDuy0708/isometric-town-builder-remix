# Raid art v2

Generated 2026-10-31 using the built-in image_gen tool with `transparent_background: true`. Two native RGBA PNGs, 1254×1254, copied byte-for-byte into `public/assets/combat/v2/`. Each has four directions and four poses. Source paths, SHA-256 digests, measured source rectangles and foot anchors are in `manifest.json` and `src/data/raidArtData.js`; reproduced by `scripts/recordRaidAssets.py`. Frames are selected and cropped only at draw time; PNGs are not resized or edited. The first troll atlas was rejected because its raised club touched the canvas top. The final redraw adds transparent padding.

## Dragon prompt

```text
Game production sprite atlas on TRUE transparent background. EXACTLY 4 columns by 4 rows of evenly spaced 256x256 cells in a SQUARE 1024x1024 canvas, 16 complete isolated sprites, no labels, no grid, no text. One identical emerald green young dragon with gold horns and cream belly, medieval isometric town game painterly pixel art, beautiful readable at 80 pixels tall. Each cell contains entire dragon including wide bat wings, tail and feet, with generous empty transparent margins. Row 1 all four sprites face southeast (screen down right); row 2 southwest (screen down left); row 3 northeast (screen up right); row 4 northwest (screen up left). Columns 1,2,3,4 are four continuous wingbeat phases of hovering flight: wings raised, wings half down, wings down, wings rising. Keep body size, camera angle, body centre, ground shadow-free foot reference consistent in every cell. Entire dragon contained within its cell, no elements crossing boundaries. All sprites use isometric projection, no terrain or shadows, no halos. Friendly fantasy art but an enemy dragon, fierce expressive eyes and red mouth. No flames extending outside sprite.
```

## Troll initial prompt

```text
Sprite atlas for an isometric medieval village game. TRUE TRANSPARENT alpha background, no shadows, no halo, NO text or grid. EXACTLY 4 columns x 4 rows evenly spaced in a square image, sixteen complete sprites. One identical mossy forest troll, stocky olive green skin, brown fur shoulder cape, wooden club, mushrooms on back, no blood. Painterly detailed pixel art, readable small character. Every complete sprite fully inside its cell with transparent margin. Row1 faces southeast down-right, row2 southwest down-left, row3 northeast up-right, row4 northwest up-left. Each row four poses: idle feet together; walking left foot forward; walking right foot forward; club attack raised above shoulder. Same character scale and same foot baseline per row. No chopped club, no touching adjacent sprites. Natural clear silhouette and expressive fierce face. Sixteen sprites only, no decorative objects.
```

## Troll final edit prompt

Reference: `exec-7ab84637-dfed-4ea9-a63f-787c3de07531.png`.

```text
Edit this troll sprite atlas to fix clipping ONLY and provide larger transparent padding. Maintain the EXACT four columns by four rows and identical row facing directions (row1 SE, row2 SW, row3 NE, row4 NW), the same moss-green stocky troll, wooden club, fur cape and mushroom details. Each row contains idle, walk left, walk right, club attack raised poses. Repaint every figure SMALLER, approximately 65 percent of its current size relative to its cell, centred within each cell with at least 40 pixels transparent empty space above every raised club, at least 30 pixels on left/right and below each foot. Every club must be ENTIRE and rounded at its tip. Absolutely NO clipped weapon or body at ANY canvas or cell boundary. Equal cell spacing, no guide lines, labels, numbers, terrain or shadow. True transparent alpha background. Keep painterly pixel-art rendering. Square canvas with a 4x4 grid of sixteen separate complete sprites. Important: do not cut the club at top right! Lots of empty transparent margin is desired for game animation.
```

