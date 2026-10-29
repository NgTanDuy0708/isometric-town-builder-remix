# Watermill image generation — Levels 1–3

Mode: built-in `image_gen`, transparent PNG output. Subject progression from `UPGRADE_PROMPTS.md`, section `b05 — Cối Xay Nước`.

Quality: runtime files are byte-for-byte copies of the original generated PNGs. No palette reduction, low-resolution pixel mosaic, 4x block upscale, alpha conversion or offline resizing. Only Canvas draw dimensions/foot anchors are adjusted.

Level 1: timber mill and one water wheel. Level 2: stone base, two wheels and a millrace gate. Level 3: two-storey stone-and-timber mill, two overshot wheels, control gates, grain hoist and loading dock.

Source images: `../assets-source/watermill/`. Runtime images: `../public/assets/buildings/watermill_lv1.png`, `watermill_lv2.png`, `watermill_lv3.png`. Geometry is registered in `BUILDING_SOURCE_GEOMETRY` (`src/data/buildingSprites.js`). The generation manifest records geometry and SHA-256 hashes.

The first image uses existing generated bakery art only as a style reference. Each later level uses the preceding watermill level as a family reference. No Forest Pack asset image is uploaded.

## Level 1

```text
Use case: stylized-concept.
Asset: ONE original-quality, detailed pixel-art PNG sprite for a medieval isometric town-builder game.
Style: match the reference game's warm oak timber, russet-red/brown shingle roofs, cream plaster panels, muted grey stone, crisp dark contours and fine stepped shading. Preserve native-resolution detail, fine wood grain and clean material edges. Do NOT reduce to a coarse pixel mosaic, artificially enlarge 4x pixel blocks, quantize the palette or blur the image. Upper-left lighting; no glossy plastic or photorealism.
Projection: strict 2:1 dimetric isometric three-quarter view showing the front and right side. The logical ground footprint is a compact 1x1 tile; side water wheels and a narrow attached flume may overhang slightly. All feet, steps, sacks and wheel supports meet one shared ground plane, frontmost base corner near horizontal canvas center.
Framing/output: square canvas, genuine transparent PNG alpha, entire structure including wheel rims, roof, chute and all feet FULLY VISIBLE. Artwork should occupy the central 75-80 percent of the canvas with ample transparent padding on every side. Exactly one building, no comparison sheet.
Avoid: ground diamond or terrain slab, grass/dirt base, big river or landscape, cast shadow, background scenery, captions, labels, letters, numerals, watermark, people or animals. Water is allowed ONLY as short streams attached directly to the mill flume/wheel; not a large river tile. No windmill sails, no propeller, no forge, no chimney or fire.
Input image 1 is ONLY a STYLE REFERENCE, not an edit target. Do not copy its bakery, bread counter or oven.
Subject: LEVEL 1 SMALL TIMBER WATERMILL. A modest one-storey timber-and-cream-plaster mill house with a simple russet shingle roof, small wooden front door, two low entrance steps and one burlap grain sack. A SINGLE clearly circular wooden WATER WHEEL mounted vertically on the visible right-side wall, with a central axle hub, radial wooden spokes and paddle buckets around the circumference; visibly a water wheel, not four windmill blades. The small mill house stands on low sturdy timber supports/stone feet over a narrow watercourse that is represented only by a short blue stream touching the wheel bottom. One short wooden feeder trough guides a trickle onto the wheel. Readable compact silhouette and coherent mechanical attachment, early-village simplicity. No upper storey, no second wheel and no long loading dock at level 1.
```

## Level 2

```text
Use case: stylized-concept.
Asset: ONE original-quality, detailed pixel-art PNG sprite for a medieval isometric town-builder game.
Style: match the reference game's warm oak timber, russet-red/brown shingle roofs, cream plaster panels, muted grey stone, crisp dark contours and fine stepped shading. Preserve native-resolution detail, fine wood grain and clean material edges. Do NOT reduce to a coarse pixel mosaic, artificially enlarge 4x pixel blocks, quantize the palette or blur the image. Upper-left lighting; no glossy plastic or photorealism.
Projection: strict 2:1 dimetric isometric three-quarter view showing the front and right side. The logical ground footprint is a compact 1x1 tile; side water wheels and a narrow attached flume may overhang slightly. All feet, steps, sacks and wheel supports meet one shared ground plane, frontmost base corner near horizontal canvas center.
Framing/output: square canvas, genuine transparent PNG alpha, entire structure including wheel rims, roof, chute and all feet FULLY VISIBLE. Artwork should occupy the central 75-80 percent of the canvas with ample transparent padding on every side. Exactly one building, no comparison sheet.
Avoid: ground diamond or terrain slab, grass/dirt base, big river or landscape, cast shadow, background scenery, captions, labels, letters, numerals, watermark, people or animals. Water is allowed ONLY as short streams attached directly to the mill flume/wheel; not a large river tile. No windmill sails, no propeller, no forge, no chimney or fire.
Input image 1 is the LEVEL 1 WATERMILL family/style reference. Generate a separate NEW LEVEL 2 upgrade of this same building. Do not include the reference next to the output.
Subject: LEVEL 2 WATERMILL. Keep the same russet shingle roof, cream-and-oak timber framing, wooden front entrance and right-side millrace orientation. The mill house is now longer and sturdier on a proper warm-grey STONE GROUND FLOOR/base, with a small extended timber workroom. On its visible right-side wall there are exactly TWO DISTINCT wooden WATER WHEELS, one nearer and one farther along the wall, each with its own visible circular rim, axle hub, radial spokes and paddle buckets; NOT one wheel with concentric rims. Stagger them slightly in depth so both hubs and both wheel silhouettes can be read. A narrow raised wooden MILLRACE trough feeds short water streams onto the wheels; add one small millrace gate with a simple lever. Only a small amount of water under/attached to the wheels, no broad river tile or stone landscape slab. Add two flour sacks and one small barrel beside the entrance/workroom. Still a compact medium-sized watermill, not a tall royal tower yet. Preserve the exact family, camera and crisp detailed pixel-art quality. Entire wheels, flume and all feet visible, with generous transparent padding, no text.
```

## Level 3

```text
Use case: stylized-concept.
Asset: ONE original-quality, detailed pixel-art PNG sprite for a medieval isometric town-builder game.
Style: match the reference game's warm oak timber, russet-red/brown shingle roofs, cream plaster panels, muted grey stone, crisp dark contours and fine stepped shading. Preserve native-resolution detail, fine wood grain and clean material edges. Do NOT reduce to a coarse pixel mosaic, artificially enlarge 4x pixel blocks, quantize the palette or blur the image. Upper-left lighting; no glossy plastic or photorealism.
Projection: strict 2:1 dimetric isometric three-quarter view showing the front and right side. The logical ground footprint is a compact 1x1 tile; side water wheels and a narrow attached flume may overhang slightly. All feet, steps, sacks and wheel supports meet one shared ground plane, frontmost base corner near horizontal canvas center.
Framing/output: square canvas, genuine transparent PNG alpha, entire structure including wheel rims, roof, chute and all feet FULLY VISIBLE. Artwork should occupy the central 75-80 percent of the canvas with ample transparent padding on every side. Exactly one building, no comparison sheet.
Avoid: ground diamond or terrain slab, grass/dirt base, big river or landscape, cast shadow, background scenery, captions, labels, letters, numerals, watermark, people or animals. Water is allowed ONLY as short streams attached directly to the mill flume/wheel; not a large river tile. No windmill sails, no propeller, no forge, no chimney or fire.
Input image 1 is the LEVEL 2 WATERMILL FAMILY AND STYLE REFERENCE. Create a NEW LEVEL 3 upgrade, not a duplicate and not a side-by-side sheet.
Subject: LEVEL 3 ROYAL WATERMILL. A visibly TALLER TWO-STOREY stone-and-timber mill: sturdy warm-grey stone lower storey, dark oak and cream plaster upper storey, tall russet shingle gabled roof with one small dormer, keeping the same front entrance and right-side water-wheel layout. Exactly TWO LARGE OVERSHOT WOODEN WATER WHEELS along the right-hand wall, each with its own readable circular rim, hub, radial spokes, paddle buckets and stone support, staggered in depth so both wheels remain clearly distinct and visible. A more substantial raised timber millrace with TWO small canal-control gates feeds short blue water streams onto their upper buckets. Add a modest GRAIN HOIST BEAM near the upper-storey loading door with one suspended burlap sack, a small wooden LOADING DOCK integrated into the front entrance, and neatly stacked flour sacks with one barrel at the base. The building grows vertically instead of sprawling into a compound; retain compact 1x1 logical base. No giant river landscape or floating stone platform. Keep every roof tip, wheel rim, flume end, rope and base completely visible, with a generous transparent margin. Preserve the reference's detailed crisp native-resolution pixel-art rendering and warm cohesive materials; no palette reduction or coarse resampling.
```
