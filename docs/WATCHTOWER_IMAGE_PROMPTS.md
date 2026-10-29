# Watchtower image generation — Levels 1–3

Mode: built-in `image_gen`, transparent PNG output. Subject progression from `UPGRADE_PROMPTS.md`, section `b08 — Tháp Canh Bảo An`.

Quality: runtime files are byte-for-byte copies of the generated PNG originals. No offline resizing, palette reduction, coarse pixel mosaic, pixel-block upscale or alpha conversion. Canvas draw geometry controls display size and source-space ground anchors, preserving the user's requested original quality.

Display sizing: Level 3 uses `worldWidth: 128`, reduced 20% from the first integration. Its visible height is about 260 world pixels versus 242 for Level 2 (about 8% taller), following the user's request for only a small size increase. Original PNGs and ground anchors are unchanged.

Level 1: timber watchpost on four posts, ladder, simple shingle roof and pennant. Level 2: round stone tower, wooden hoarding, arrow slits, red pennant and torch bracket. Level 3: tall reinforced stone tower, open crenellated top, beacon brazier, two banners, reinforced door and arrow slits.

Source images: `../assets-source/watchtower/`. Runtime images: `../public/assets/buildings/watchtower_lv1.png`, `watchtower_lv2.png`, `watchtower_lv3.png`. Registered as `b08_watchtower` in `src/data/buildingSprites.js`; `generation.json` records original paths, ground anchors, bounds and SHA-256 hashes.

Level 1 uses the existing generated herbalist Level 1 PNG only as a style reference. Each later level uses the preceding watchtower level as its family reference. No Forest Pack source asset is uploaded. All references remain unchanged.

## Level 1

```text
Use case: stylized-concept.
Asset: ONE original-quality detailed pixel-art PNG watchtower sprite for a medieval isometric town-builder game.
Style: match the reference game's warm oak timber, cream details when needed, muted warm-grey stone, crisp dark outlines, fine stepped material shading and clear compact silhouette. Warm red cloth pennants/banners. Preserve native-resolution detail, readable wood grain and clean stone edges. No coarse pixel mosaic, forced 4x pixel blocks, palette quantization or blur. Upper-left light, darker right faces. No glossy plastic or photorealism.
Projection: strict 2:1 dimetric isometric three-quarter view, front and right side visible, tall structure over a compact 1x1 logical tile. All feet and any entrance step stand on one shared ground plane. Frontmost structural foot/base corner near horizontal canvas centre.
Framing/output: square canvas, genuine transparent PNG alpha. Exactly one COMPLETE tower fully inside the frame including all poles, banners, roof, flame if any, ladder and feet; generous transparent padding on every side and above highest tip. Central 75–80 percent of image height, no comparison sheet.
Avoid: ground tile, grass or dirt patch, terrain slab, hill, castle walls sprawling off screen, cast shadow, scenery, text, letters, numerals, logos, watermark, people, guards or animals. No detached props or neighbouring buildings.
Input image 1 is ONLY a STYLE REFERENCE for the game's detailed pixel-art materials, light and camera, not an edit target. Do not copy its house, herbs, pots or garden.
Subject: LEVEL 1 WOODEN WATCHPOST. A modest village lookout built entirely from sturdy warm oak: an elevated square TIMBER PLATFORM supported by exactly FOUR long vertical WOODEN POSTS, one at each corner, with realistic diagonal cross braces under the deck. The frontmost post is clearly visible and reaches the common ground plane. A narrow wooden LADDER leans from the ground up to an opening in the front platform railing. Low waist-height wooden railing around the small lookout deck. Above the deck, four short upright roof supports hold a simple low pyramidal wooden SHINGLE ROOF in warm brown. One short pole at a roof corner carries a small plain muted RED PENNANT. Tall but simple early-village silhouette, visibly open air between the four load-bearing posts; not a solid cottage on stilts. No stone tower, no masonry body, no battlements and no beacon fire yet. No high foundation or broad platform under the post feet. All four post feet, the ladder foot and whole pennant fit inside the transparent margins.
```

## Level 2

```text
Use case: stylized-concept.
Asset: ONE original-quality detailed pixel-art PNG watchtower sprite for a medieval isometric town-builder game.
Style: match the reference game's warm oak timber, cream details when needed, muted warm-grey stone, crisp dark outlines, fine stepped material shading and clear compact silhouette. Warm red cloth pennants/banners. Preserve native-resolution detail, readable wood grain and clean stone edges. No coarse pixel mosaic, forced 4x pixel blocks, palette quantization or blur. Upper-left light, darker right faces. No glossy plastic or photorealism.
Projection: strict 2:1 dimetric isometric three-quarter view, front and right side visible, tall structure over a compact 1x1 logical tile. All feet and any entrance step stand on one shared ground plane. Frontmost structural foot/base corner near horizontal canvas centre.
Framing/output: square canvas, genuine transparent PNG alpha. Exactly one COMPLETE tower fully inside the frame including all poles, banners, roof, flame if any, ladder and feet; generous transparent padding on every side and above highest tip. Central 75–80 percent of image height, no comparison sheet.
Avoid: ground tile, grass or dirt patch, terrain slab, hill, castle walls sprawling off screen, cast shadow, scenery, text, letters, numerals, logos, watermark, people, guards or animals. No detached props or neighbouring buildings.
Input image 1 is the LEVEL 1 WATCHPOST style/family reference. Generate a separate NEW LEVEL 2 upgrade; do not display the reference alongside it.
Subject: LEVEL 2 STONE WATCHTOWER. This same village lookout is now a ROUND WARM-GREY STONE TOWER with a thick solid cylindrical masonry body, visibly replacing level 1's open four-post lower frame. Stacked individual stone courses, narrow vertical ARROW SLITS and a small sturdy wooden door at ground level with one low stone step. Around the top, a projecting WOODEN HOARDING / covered lookout gallery on short diagonal timber brackets, with compact waist-high oak parapets and vertical defensive openings. Above the gallery a simple modest warm-brown conical/polygonal SHINGLE ROOF recalls level 1. A short roof pole carries one plain muted RED PENNANT; one iron TORCH BRACKET on the front stone wall with a small contained amber flame. Keep the curved stone wall unmistakably cylindrical, coherent gallery supports and one compact ground footprint, not a castle or a square house. More substantial than level 1, sturdy medium-height lookout with warm oak trim, detailed grey masonry and the same pixel-art finish. No large beacon brazier, no broad crenellated bastion yet, no open post legs and no external ladder reaching the top. Tower base and low step on one plane, whole roof/pennant/torch/base visible inside transparent margins.
```

## Level 3

```text
Use case: stylized-concept.
Asset: ONE original-quality detailed pixel-art PNG watchtower sprite for a medieval isometric town-builder game.
Style: match the reference game's warm oak timber, cream details when needed, muted warm-grey stone, crisp dark outlines, fine stepped material shading and clear compact silhouette. Warm red cloth pennants/banners. Preserve native-resolution detail, readable wood grain and clean stone edges. No coarse pixel mosaic, forced 4x pixel blocks, palette quantization or blur. Upper-left light, darker right faces. No glossy plastic or photorealism.
Projection: strict 2:1 dimetric isometric three-quarter view, front and right side visible, tall structure over a compact 1x1 logical tile. All feet and any entrance step stand on one shared ground plane. Frontmost structural foot/base corner near horizontal canvas centre.
Framing/output: square canvas, genuine transparent PNG alpha. Exactly one COMPLETE tower fully inside the frame including all poles, banners, roof, flame if any, ladder and feet; generous transparent padding on every side and above highest tip. Central 75–80 percent of image height, no comparison sheet.
Avoid: ground tile, grass or dirt patch, terrain slab, hill, castle walls sprawling off screen, cast shadow, scenery, text, letters, numerals, logos, watermark, people, guards or animals. No detached props or neighbouring buildings.
Input image 1 is the LEVEL 2 STONE WATCHTOWER family/style reference. Generate a separate NEW LEVEL 3 royal upgrade; no comparison sheet.
Subject: LEVEL 3 ROYAL ARTILLERY BASTION / BEACON WATCHTOWER. A substantially taller, thicker WARM-GREY STONE TOWER on the same compact one-tile footprint, with a solid round or subtly polygonal masonry body and a reinforced buttressed lower wall. The top is an OPEN STONE CRENELLATED PARAPET: clearly alternating raised merlons and open gaps around a readable elevated fighting deck. Remove the wooden shingle roof so the crenellations and a prominent raised iron BEACON BRAZIER in the deck centre are clearly visible. The brazier holds one contained amber/orange signal FIRE, fully visible above the parapet, without a huge smoke plume or soft light cloud. Two distinct long plain dark-RED BANNERS hang down from separate upper stone brackets, one on the front-left side and one on the visible right side, with simple warm-gold hems but NO letters, crest or writing. A sturdy arched REINFORCED OAK DOOR with dark iron bands at the foot, low stone entrance steps, multiple narrow ARROW SLITS at two heights. Restrained warm oak and iron details recall previous levels, but the silhouette is dominated by thick defensive stone and the battlement crown. One coherent tower, imposing vertical proportions and compact stout base, no surrounding walls, no outlying towers and no oversized ground slab. The document's 'artillery bastion' is expressed through stronger masonry; do not add cannon, firearms or extra weapons absent from the design. Same isometric camera and original detailed pixel-art materials, fully visible flame tips, battlements, both banners and lowest step inside transparent padding.
```
