# Chapel image generation — Levels 1–3

Mode: built-in `image_gen`, transparent PNG output. Subject progression from `UPGRADE_PROMPTS.md`, section `b09 — Nhà Nguyện Đá`.

Quality: runtime files are byte-for-byte copies of the generated PNG originals. No offline resizing, palette reduction, coarse pixel mosaic, pixel-block upscale or alpha conversion. Canvas draw geometry controls display dimensions and source-space ground anchors, preserving the user's requested original quality.

Level 1: small weathered stone chapel, slate roof, arched oak door, small windows and stone cross. Level 2: stone nave, small bell tower, stained-glass windows, buttresses and ivy. Level 3: larger royal abbey chapel, tall bell tower, rose window, short side cloister, two banners and carved entrance.

Source images: `../assets-source/chapel/`. Runtime images: `../public/assets/buildings/chapel_lv1.png`, `chapel_lv2.png`, `chapel_lv3.png`. Registered as `b09_chapel` in `src/data/buildingSprites.js`; `generation.json` records original paths, ground anchors, bounds and SHA-256 hashes.

Level 1 uses existing generated watchtower Level 2 art only as a style reference for stone, timber, lighting and camera. Each later level uses the preceding chapel level as its family reference. No Forest Pack source asset is uploaded; reference files remain unchanged.

## Level 1

```text
Use case: stylized-concept.
Asset: ONE original-quality detailed pixel-art building PNG for a medieval isometric town-builder.
Style: match the reference game's warm weathered grey stone, oak timber/doors, clear dark contours, fine stepped material shading and compact readable architecture. Chapel roofs use dark blue-grey SLATE, replacing the reference's wooden shingles. Upper-left lighting, darker right faces. Preserve native-resolution detail and clean edges; no coarse pixel mosaic, artificial 4x pixel blocks, palette quantization or blur. No photorealism or glossy plastic.
Projection: strict 2:1 dimetric isometric three-quarter view, front and right side visible. Compact 1x1 logical footprint; all buttresses, walls and low entrance steps meet one shared ground plane, frontmost base/step near horizontal canvas centre.
Framing/output: square canvas, genuine transparent PNG alpha. Exactly one whole building, including cross, any tower, roof and all feet fully inside ample transparent margins. Central 75–80 percent of canvas, no comparison sheet.
Avoid: ground diamond, grass/dirt patch, terrain slab, churchyard, landscape, cast shadow, scenery, text, letters, numbers, logos, watermark, people or animals, disconnected props or neighbouring buildings.
Input image 1 is ONLY a STYLE REFERENCE for masonry, oak, lighting and rendering, not an edit target. Do not copy its watchtower, flag, torch or cylindrical structure.
Subject: LEVEL 1 SMALL VILLAGE STONE CHAPEL. One modest rectangular single-room chapel, low weathered GREY STONE walls with visible masonry courses. A STEEP DARK SLATE GABLED ROOF, a simple arched OAK WOODEN ENTRANCE DOOR with dark iron hinges and one or two LOW STONE STEPS. A SMALL NARROW ARCHED WINDOW above the door or on the side wall, understated amber/neutral glass. One small plain STONE CROSS on the front roof ridge/gable. Minimal rustic early-village detail, compact squat nave and clear architectural silhouette; no tall bell tower, no big stained glass, no rose window, no flags and no cloister at this first level. Weathered stone and neatly layered slate shingles match the game's detailed pixel-art finish. No broad plinth: visible walls and entry step sit directly on the shared ground plane. Whole cross, roof eaves and base uncut, with transparent padding.
```

## Level 2

```text
Use case: stylized-concept.
Asset: ONE original-quality detailed pixel-art building PNG for a medieval isometric town-builder.
Style: match the reference game's warm weathered grey stone, oak timber/doors, clear dark contours, fine stepped material shading and compact readable architecture. Chapel roofs use dark blue-grey SLATE, replacing the reference's wooden shingles. Upper-left lighting, darker right faces. Preserve native-resolution detail and clean edges; no coarse pixel mosaic, artificial 4x pixel blocks, palette quantization or blur. No photorealism or glossy plastic.
Projection: strict 2:1 dimetric isometric three-quarter view, front and right side visible. Compact 1x1 logical footprint; all buttresses, walls and low entrance steps meet one shared ground plane, frontmost base/step near horizontal canvas centre.
Framing/output: square canvas, genuine transparent PNG alpha. Exactly one whole building, including cross, any tower, roof and all feet fully inside ample transparent margins. Central 75–80 percent of canvas, no comparison sheet.
Avoid: ground diamond, grass/dirt patch, terrain slab, churchyard, landscape, cast shadow, scenery, text, letters, numbers, logos, watermark, people or animals, disconnected props or neighbouring buildings.
Input image 1 is the LEVEL 1 CHAPEL family/style reference. Generate a separate NEW LEVEL 2 upgrade of this same chapel, not an image sheet.
Subject: LEVEL 2 STONE CHAPEL WITH SMALL BELL TOWER. Keep the same weathered warm-grey masonry, steep dark SLATE GABLED NAVE ROOF, oak arched front door, low entrance steps and plain stone cross. The nave is a little larger and taller, strengthened by clearly defined short STONE BUTTRESSES along the visible right wall. Add ONE SMALL ATTACHED SQUARE STONE BELL TOWER at the front end of the nave, only moderately taller than the roof ridge; its upper belfry has open arches showing a single brass BELL and a simple slate pyramidal cap with a small stone cross. One distinct STAINED-GLASS ARCHED WINDOW above or beside the entrance, with restrained ruby-red, muted blue and amber panes; additional slim arched windows on the side, no text or pictorial figures. Small IVY vines climb one or two lower buttresses without covering the masonry. Coherent roof/tower junction and compact single building, modest parish-chapel scale, clear upgrade from level 1 without becoming a cathedral. No large rose window, no royal banners, no long cloister and no second bell tower at this level. Same camera, original detailed pixel-art quality, clean stone and slate edges, all feet at the same ground plane and whole bell tower/cross/base well inside transparent padding.
```

## Level 3

```text
Use case: stylized-concept.
Asset: ONE original-quality detailed pixel-art building PNG for a medieval isometric town-builder.
Style: match the reference game's warm weathered grey stone, oak timber/doors, clear dark contours, fine stepped material shading and compact readable architecture. Chapel roofs use dark blue-grey SLATE, replacing the reference's wooden shingles. Upper-left lighting, darker right faces. Preserve native-resolution detail and clean edges; no coarse pixel mosaic, artificial 4x pixel blocks, palette quantization or blur. No photorealism or glossy plastic.
Projection: strict 2:1 dimetric isometric three-quarter view, front and right side visible. Compact 1x1 logical footprint; all buttresses, walls and low entrance steps meet one shared ground plane, frontmost base/step near horizontal canvas centre.
Framing/output: square canvas, genuine transparent PNG alpha. Exactly one whole building, including cross, any tower, roof and all feet fully inside ample transparent margins. Central 75–80 percent of canvas, no comparison sheet.
Avoid: ground diamond, grass/dirt patch, terrain slab, churchyard, landscape, cast shadow, scenery, text, letters, numbers, logos, watermark, people or animals, disconnected props or neighbouring buildings.
Input image 1 is the LEVEL 2 CHAPEL family/style reference. Generate a separate NEW LEVEL 3 upgrade of this same church; no side-by-side reference.
Subject: LEVEL 3 ROYAL ABBEY CHAPEL. A larger, visibly taller prestigious STONE CHURCH with the same warm weathered grey masonry, dark SLATE GABLED NAVE ROOF, oak door and refined buttresses. One TALL SQUARE BELL TOWER rises from the front part of the nave, with a double-height shaft, paired arched belfry openings revealing one brass bell, and a steep dark-slate cap with a plain stone cross. A clearly circular ROSE WINDOW in the upper front facade below the belfry, with simple radial stone tracery and restrained ruby-red, blue and amber stained glass; not just another narrow arched window. A richly CARVED STONE ENTRANCE ARCH around the heavy oak double door and low stone steps. On the visible right side attach a SHORT COMPACT CLOISTER: two or three open stone arcade arches under a low slate lean-to roof, structurally joined to the nave, not a detached second building or a broad monastery courtyard. Two narrow muted burgundy RED BANNERS with subtle gold hems hang near the entrance/tower, no letters or emblems. A little ivy at the lower buttresses. Keep the complete abbey compact and vertical within one logical building footprint; grander than level 2 but no surrounding village, no long landscape or oversized cathedral complex. Same front/right camera, original detailed pixel-art finish, coherent tower/roof/cloister connections, all structural feet and low steps at one ground plane. Cross, tall tower tip, entire cloister and lowest feet fully visible inside transparent margins.
```
