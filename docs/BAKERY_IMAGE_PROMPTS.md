# Bakery image generation — Levels 1–3

Mode: built-in `image_gen`, transparent output. Text style specification from `ART_STYLE_FOREST_PACK.md`, bakery designs from `BUILDING_PROMPTS.md` and `UPGRADE_PROMPTS.md`.

Level 1 is a fresh generation. Level 2 uses level 1 as a family/style reference; level 3 uses level 2. No Forest Pack image was uploaded as a reference.

Original generated PNGs: `../assets-source/bakery/`. In-game PNGs: `../public/assets/buildings/bakery_lv1.png`, `bakery_lv2.png`, `bakery_lv3.png`.

## Level 1

```text
Use case: stylized-concept.
Asset type: transparent PNG game sprite for a medieval isometric town-builder, matching the text-only Forest Isometric Pack art specification supplied by the user.
Output: one 1024x1024 square PNG with genuine transparent alpha. Exactly ONE building, fully visible with generous transparent margin, no sheet or collage. No lettering, captions, numbers, labels, logo, or watermark.
Art: TRUE chunky pixel art. Imagine drawing on a 256x256 pixel canvas and enlarging 4x with NEAREST NEIGHBOR: clearly visible square pixel clusters, hard blocky edges, no antialiasing, no blur, no smooth painted shading, no tiny high-resolution strokes. Simple readable silhouette at 32px. Strict 2:1 dimetric isometric view, fixed camera, visible left and right façades, all ground edges slope +0.5 or -0.5. Light from upper left. Flat stepped color clusters only, one art-pixel dark outline.
Palette: use at most 20 colors selected from #1e4615 #1a3b11 #32571d #4b6c2e #6d8740 #8aa355 #aabd68 #e6dfa1 #e8cd97 #ccb45c #ba9745 #9e7a36 #855c22 #67231b #8a3c24 #9e5333 #e0ac6c #581c23 #709fcf #5782ba #add6e0 #2f3436 #4b4f53 #7b7f7a #c9c8bd. Warm amber window and oven highlights as solid color clusters, no bloom or glow effects.
The logical footprint is ONE 1x1 tile. All walls, steps and small props meet one common ground plane, with the frontmost base corner at horizontal canvas center. Build upward from that point. NO ground diamond, NO grass, dirt, pavement tile, terrain slab, stone basement or plinth, cast shadow or backdrop. A thin stone wall footing and one low doorway step are allowed as integral parts of the building. No people or animals.
Subject: LEVEL 1 VILLAGE BAKERY, a small single-storey timber shop. Cream plaster wall panels, dark brown timber beams, a simple steep warm russet-brown shingle roof. One short brick oven chimney at the back-right. A plain wooden door at the front-left, one large recessed bread display window showing three simple golden bread loaf silhouettes, a small linen awning above the display, one flour sack beside a low wooden bread crate. A modest brick bread oven integrated into the side wall; its opening is a small flat amber cluster, not a detailed forge. Compact, friendly, legible, modest building suitable for an early village. Do not add upper floors or a second chimney.
```

## Level 2

```text
Use case: stylized-concept.
Asset type: transparent PNG game sprite for a medieval isometric town-builder, matching the text-only Forest Isometric Pack art specification supplied by the user.
Output: one 1024x1024 square PNG with genuine transparent alpha. Exactly ONE building, fully visible with generous transparent margin, no sheet or collage. No lettering, captions, numbers, labels, logo, or watermark.
Art: TRUE chunky pixel art. Imagine drawing on a 256x256 pixel canvas and enlarging 4x with NEAREST NEIGHBOR: clearly visible square pixel clusters, hard blocky edges, no antialiasing, no blur, no smooth painted shading, no tiny high-resolution strokes. Simple readable silhouette at 32px. Strict 2:1 dimetric isometric view, fixed camera, visible left and right façades, all ground edges slope +0.5 or -0.5. Light from upper left. Flat stepped color clusters only, one art-pixel dark outline.
Palette: use at most 20 colors selected from #1e4615 #1a3b11 #32571d #4b6c2e #6d8740 #8aa355 #aabd68 #e6dfa1 #e8cd97 #ccb45c #ba9745 #9e7a36 #855c22 #67231b #8a3c24 #9e5333 #e0ac6c #581c23 #709fcf #5782ba #add6e0 #2f3436 #4b4f53 #7b7f7a #c9c8bd. Warm amber window and oven highlights as solid color clusters, no bloom or glow effects.
The logical footprint is ONE 1x1 tile. All walls, steps and small props meet one common ground plane, with the frontmost base corner at horizontal canvas center. Build upward from that point. NO ground diamond, NO grass, dirt, pavement tile, terrain slab, stone basement or plinth, cast shadow or backdrop. A thin stone wall footing and one low doorway step are allowed as integral parts of the building. No people or animals.
Input image 1 is a STYLE AND BUILDING-FAMILY REFERENCE only. Generate a NEW upgraded LEVEL 2 bakery sprite, not a duplicate, and do not include the reference alongside it. Match the reference's camera, warm russet-brown shingle roof, cream plaster, dark timber beams, bread display, linen awning, solid amber oven highlights, chunky square pixel clusters and outline weight.
Subject: LEVEL 2 VILLAGE BAKERY. A larger single-storey timber-and-cream-plaster shop on the same 1x1 logical footprint. Keep the wooden entrance front-left and bread display beside it; enlarge the bread window and awning. The right-side brick baking section now has TWO clearly distinct vaulted stone oven openings side-by-side under one larger tall brick chimney, a wider bread counter, two low bread crates and two flour sacks tucked against the walls. Add a modest raised attic/dormer, but NO full second storey and NO second chimney yet. Make this visibly upgraded from the small level 1 building, while keeping the same architectural family and a compact base. Frontmost base corner at horizontal canvas center. Entire structure and chimney fully visible with transparent margin. No text or numerals.
```

## Level 3

```text
Use case: stylized-concept.
Asset type: transparent PNG game sprite for a medieval isometric town-builder, matching the text-only Forest Isometric Pack art specification supplied by the user.
Output: one 1024x1024 square PNG with genuine transparent alpha. Exactly ONE building, fully visible with generous transparent margin, no sheet or collage. No lettering, captions, numbers, labels, logo, or watermark.
Art: TRUE chunky pixel art. Imagine drawing on a 256x256 pixel canvas and enlarging 4x with NEAREST NEIGHBOR: clearly visible square pixel clusters, hard blocky edges, no antialiasing, no blur, no smooth painted shading, no tiny high-resolution strokes. Simple readable silhouette at 32px. Strict 2:1 dimetric isometric view, fixed camera, visible left and right façades, all ground edges slope +0.5 or -0.5. Light from upper left. Flat stepped color clusters only, one art-pixel dark outline.
Palette: use at most 20 colors selected from #1e4615 #1a3b11 #32571d #4b6c2e #6d8740 #8aa355 #aabd68 #e6dfa1 #e8cd97 #ccb45c #ba9745 #9e7a36 #855c22 #67231b #8a3c24 #9e5333 #e0ac6c #581c23 #709fcf #5782ba #add6e0 #2f3436 #4b4f53 #7b7f7a #c9c8bd. Warm amber window and oven highlights as solid color clusters, no bloom or glow effects.
The logical footprint is ONE 1x1 tile. All walls, steps and small props meet one common ground plane, with the frontmost base corner at horizontal canvas center. Build upward from that point. NO ground diamond, NO grass, dirt, pavement tile, terrain slab, stone basement or plinth, cast shadow or backdrop. A thin stone wall footing and one low doorway step are allowed as integral parts of the building. No people or animals.
Input image 1 is a STYLE AND BUILDING-FAMILY REFERENCE only. Create a NEW LEVEL 3 upgrade of this same bakery, one single separate building sprite, not a comparison sheet. Keep exactly the same camera, russet-brown shingles, cream plaster, dark timber beams, brickwork, golden bread, cream linen awning, hard chunky pixel clusters and warm upper-left lighting.
Subject: LEVEL 3 ROYAL VILLAGE BAKERY. A full TWO-STOREY timber-and-plaster shop, vertically upgraded while staying on the SAME compact 1x1 logical footprint. Two upper-storey amber windows with visible timber framing. A tall pitched warm brown shingle roof and TWO distinct brick oven chimneys, one on each side of the ridge. Keep the wooden entrance front-left and the bread display immediately beside it under a cream awning. A large arched double bread oven integrated into the right side wall, baking openings shown with flat solid amber pixels. Several neat low crates of bread and one flour barrel tucked immediately against the building. Visibly grander and taller than the reference level 2, coherent silhouette, not a palace or separate annex. No tall grass, ground slab, surrounding courtyard, oversized base, captions, figures, animals, or flour-cloud effects. Keep all roof tips, chimneys and base completely visible with transparent margins.
```

## In-game preparation

The user requested preserving the quality of the generated images. Each in-game PNG is now an exact byte-for-byte copy of the corresponding original in `assets-source/bakery/`: 1254x1254, with all original colors, detail and alpha retained.

No palette quantization, no 32/38/44-pixel reduction, no 4x block upscale, and no offline resizing is applied. Runtime drawing scales directly from the original image, using high-quality Canvas sampling and per-level source-space foot anchors in `BUILDING_SOURCE_GEOMETRY` (`src/data/buildingSprites.js`). Building footprints and world sizes remain the same.

`assets-source/bakery/generation.json` records the original dimensions and SHA-256 hashes. The old pixel-4 outputs are not used by the game.
