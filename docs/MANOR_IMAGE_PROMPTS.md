# Noble manor image generation — Levels 1–3

Mode: built-in `image_gen`, transparent PNG output. Subject progression from `UPGRADE_PROMPTS.md`, section `b20 — Dinh Thự Quý Tộc`.

Quality: runtime files are byte-for-byte copies of the generated PNG originals. No offline resizing, palette reduction, coarse pixel mosaic, pixel-block upscale or alpha conversion. Canvas draw geometry controls display dimensions and source-space ground anchors. The compact 2x2 visual footprint described by the prompts is displayed using the existing game's placement anchor; placement/occupancy rules are unchanged.

Level 1: stone ground floor, timber upper floor, slate roofs, arched door and low garden wall. Level 2: attached west wing, bay window, stone porch, banners and chimney. Level 3: compact castle manor with two stone towers, crenellations, grand entrance, banners and a shallow courtyard wall/gate. Display widths progress gently: 176, 192 and 208 world pixels.

Source images: `../assets-source/manor/`. Runtime images: `../public/assets/buildings/manor_lv1.png`, `manor_lv2.png`, `manor_lv3.png`. Registered as `b20_noble_manor` in `src/data/buildingSprites.js`; `generation.json` records original paths, ground anchors, bounds and SHA-256 hashes.

Level 1 uses the existing generated main town hall only as a style reference. Each later level uses the preceding manor level as its family reference. No Forest Pack source asset is uploaded. Reference images and the main town hall remain unchanged.

## Level 1

```text
Use case: stylized-concept.
Asset: ONE original-quality detailed pixel-art building PNG for a medieval isometric town-builder.
Style: match the reference game's warm oak half-timber, cream plaster, warm weathered grey stone, crisp dark contours, fine stepped shading and readable architecture. Manor roofs are dark blue-grey SLATE rather than the reference's red tiles. Upper-left light; darker right faces. Preserve native-resolution detail, clean material edges, and fine timber/stone texture. No coarse pixel mosaic, artificial 4x blocks, palette quantization, blur, photorealism or glossy plastic.
Projection: strict 2:1 dimetric isometric three-quarter view, entrance facing lower-left/front and right facade visible. Compact 2x2 visual footprint, one coherent noble residence. All structural feet, steps and attached wall/gate bases share one ground plane; frontmost ground-contact point near horizontal canvas centre.
Framing/output: square canvas, genuine transparent PNG alpha. One entire complete building including roofs, towers if present, walls, steps and feet uncut, with generous transparent padding on all sides. Central 75–80 percent of canvas. No comparison sheet.
Avoid: terrain tile, ground diamond, grass/dirt slab, garden landscape, road, cast shadow, detached buildings, people, animals, text, numbers, clock faces, bells, crosses, logos, watermark, broad surrounding castle compound.
Input image 1 is ONLY a STYLE REFERENCE for oak, plaster, stone, lighting and rendering. It is not an edit target. Do not copy the town hall, clock, bell tower, red roofs or weather vane.
Subject: LEVEL 1 SMALL NOBLE MANOR. A modest but comfortable TWO-STOREY residence: warm-grey STONE GROUND FLOOR, oak HALF-TIMBER UPPER FLOOR with cream plaster, simple steep dark SLATE GABLED ROOF. One arched heavy oak entrance door with two low stone steps, and two prominent framed upper windows with subdued warm amber glazing. Restrained small stone-framed lower windows if needed, simple regular structure. A SHORT LOW GARDEN WALL attached along one side, masonry only without a lawn or dirt patch; do not turn it into an enclosing fortress. Compact rectangular noble house, slightly richer than village cottages but not a palace. No large west wing, no turret, no defensive crenellations, no grand courtyard gate and no banners yet. No clock, bell or cross: this is a PRIVATE NOBLE RESIDENCE, not a civic hall or chapel. Clear slate shingles, wood joints and individual stone courses in the game's crisp detailed pixel-art style, entire low wall and all feet within transparent margins.
```

## Level 2

```text
Use case: stylized-concept.
Asset: ONE original-quality detailed pixel-art building PNG for a medieval isometric town-builder.
Style: match the reference game's warm oak half-timber, cream plaster, warm weathered grey stone, crisp dark contours, fine stepped shading and readable architecture. Manor roofs are dark blue-grey SLATE rather than the reference's red tiles. Upper-left light; darker right faces. Preserve native-resolution detail, clean material edges, and fine timber/stone texture. No coarse pixel mosaic, artificial 4x blocks, palette quantization, blur, photorealism or glossy plastic.
Projection: strict 2:1 dimetric isometric three-quarter view, entrance facing lower-left/front and right facade visible. Compact 2x2 visual footprint, one coherent noble residence. All structural feet, steps and attached wall/gate bases share one ground plane; frontmost ground-contact point near horizontal canvas centre.
Framing/output: square canvas, genuine transparent PNG alpha. One entire complete building including roofs, towers if present, walls, steps and feet uncut, with generous transparent padding on all sides. Central 75–80 percent of canvas. No comparison sheet.
Avoid: terrain tile, ground diamond, grass/dirt slab, garden landscape, road, cast shadow, detached buildings, people, animals, text, numbers, clock faces, bells, crosses, logos, watermark, broad surrounding castle compound.
Input image 1 is the LEVEL 1 MANOR family/style reference. Generate a separate NEW LEVEL 2 upgrade, no comparison sheet.
Subject: LEVEL 2 UPGRADED NOBLE MANOR WITH WEST WING. Keep the same stone ground floor, oak-and-cream upper floor, dark SLATE ROOFS, arched entrance, short stone steps and warm windows. Add a clearly attached WEST WING on the visible front-left, making a compact shallow L-shaped residence with an extra steep slate gable; the wing and main hall share one continuous structure. More substantial stone masonry and refined timber trim than level 1. A prominent projecting BAY WINDOW on the visible right side, a short STONE ENTRANCE PORCH with two stout stone posts, one proper stone CHIMNEY, and two narrow muted BURGUNDY BANNERS with plain gold hems and no text. Retain a short low side garden wall, no detached garden landscape. Clean coherent roof intersections, all windows and doors in sensible positions. Clearly upgraded private manor, moderately larger and richer, not yet a defensive castle. No pair of stone defensive towers, no battlements, no clock or bell and no large fortified gate. Same front/right isometric view, detailed pixel-art textures and restrained material palette as the reference. Entire wing, chimney, bay window and all feet visible inside transparent margins.
```

## Level 3

```text
Use case: stylized-concept.
Asset: ONE original-quality detailed pixel-art building PNG for a medieval isometric town-builder.
Style: match the reference game's warm oak half-timber, cream plaster, warm weathered grey stone, crisp dark contours, fine stepped shading and readable architecture. Manor roofs are dark blue-grey SLATE rather than the reference's red tiles. Upper-left light; darker right faces. Preserve native-resolution detail, clean material edges, and fine timber/stone texture. No coarse pixel mosaic, artificial 4x blocks, palette quantization, blur, photorealism or glossy plastic.
Projection: strict 2:1 dimetric isometric three-quarter view, entrance facing lower-left/front and right facade visible. Compact 2x2 visual footprint, one coherent noble residence. All structural feet, steps and attached wall/gate bases share one ground plane; frontmost ground-contact point near horizontal canvas centre.
Framing/output: square canvas, genuine transparent PNG alpha. One entire complete building including roofs, towers if present, walls, steps and feet uncut, with generous transparent padding on all sides. Central 75–80 percent of canvas. No comparison sheet.
Avoid: terrain tile, ground diamond, grass/dirt slab, garden landscape, road, cast shadow, detached buildings, people, animals, text, numbers, clock faces, bells, crosses, logos, watermark, broad surrounding castle compound.
Input image 1 is the LEVEL 2 MANOR family/style reference. Generate a separate NEW LEVEL 3 upgrade, no comparison sheet.
Subject: LEVEL 3 NOBLE CASTLE MANOR. The same compact private noble residence is now reinforced into a small prestigious CASTLE MANOR. Keep a coherent central oak-and-cream residential hall with a steep dark SLATE ROOF and rich warm-grey STONE LOWER STOREY, but add exactly TWO attached STONE TOWERS, one at each front corner. Towers are sturdy, moderately tall, only a little higher than the central hall roof, with clearly readable CRENELLATED OPEN STONE CROWNS and narrow tall arched windows. Both belong to the same residence, not separate castles. A GRAND ARCHED OAK ENTRANCE with carved stone surround sits between the towers, warm tall council-like residential windows, three restrained muted BURGUNDY BANNERS with plain gold hems and no text. At the base a SHORT LOW COURTYARD WALL joins the front tower feet and contains one SMALL ARCHED GATE aligned with the entrance; make it shallow and compact, not a wide yard or landscape. No large paved ground slab: only the building, gate/wall and attached low steps, with transparent empty space where necessary. Retain the level-2 manor's slate, timber, stone, bay-window hints and warm window colour. Refined but compact silhouette, clear noble-manor upgrade without a giant sprawling fortress, very tall military towers or extra outbuildings. No clock, bell or cross. Same isometric camera and original detailed pixel-art finish, coherent connected architecture and ground plane, entire crowns, roofs, wall and gate feet inside transparent margins.
```
