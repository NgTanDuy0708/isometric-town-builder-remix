# Windmill image generation — Levels 1–3

Mode: built-in `image_gen`, genuine transparent PNG output. Subject progression from `UPGRADE_PROMPTS.md`, section `b04 — Cối Xay Gió`.

User quality preference: keep original generated PNGs, no palette reduction, no low-resolution mosaic or 4x pixel-block upscale. Existing AI-generated bakery art is a style reference, not a Forest Pack reference image.

Level 1: wooden post and lattice sails. Level 2: stone base, balcony and cloth sails. Level 3: tall stone tower, gallery, cloth sails and grain hoist.

Source images: `../assets-source/windmill/`. Runtime images: `../public/assets/buildings/windmill_lv1.png`, `windmill_lv2.png`, `windmill_lv3.png`. Runtime PNGs are byte-for-byte copies; source-space foot anchors and world sizes are in `BUILDING_SOURCE_GEOMETRY` (`src/data/buildingSprites.js`).

## Level 1

```text
Use case: stylized-concept. Asset: one high-resolution transparent PNG sprite for a medieval isometric town-builder game.
Quality and style: match the detailed polished pixel-art style, warm timber, crisp outlines, controlled stepped shading, stone materials and upper-left lighting of the reference. Preserve fine native-resolution details; DO NOT reduce the image to a coarse 32px mosaic or artificially enlarge 4x pixel blocks. No blur, photographic materials, glossy 3D plastic, painterly brushwork, or noise. The user wants the original generated quality retained.
Camera: strict 2:1 dimetric isometric view, fixed three-quarter camera showing two sides, ground edges slope +/-0.5. One logical 1x1 ground footprint; the windmill's sails may naturally overhang that footprint. All feet, stairs and small grain props meet one common ground plane. Frontmost base point near horizontal center.
Composition: ONE isolated windmill, completely visible including ALL FOUR sail tips, supports and base, centered in a square canvas with generous transparent margins. Genuine transparent alpha everywhere outside the structure and through the open lattice. No ground diamond, terrain slab, grass base, surrounding scenery, cast shadow, captions, lettering, numbers, logo, watermark, people or animals.
Palette: warm dark oak and honey-brown wood, russet-brown shingle roof, cream linen, muted warm-grey stone. Use color richness and crisp material details comparable to the reference. No palette reduction.
Input image 1 is ONLY a STYLE REFERENCE for the existing game art. Do not copy its bakery subject, bread display, oven, chimney or awning.
Subject: LEVEL 1 SMALL WOODEN POST WINDMILL. A modest box-shaped timber mill cabin supported on a sturdy central post with four simple cross-braced timber legs. Small pitched dark russet shingle roof, a wooden entrance door reached by a few low timber steps, one grain sack tucked beside the supports. On the front-facing axle hub, exactly FOUR equal-length simple wooden LATTICE SAILS arranged as a clearly readable diagonal X, all in the same vertical plane perpendicular to the axle. The four blade arms attach to one central hub; no fifth arm, no extra rotor, no circular fan. The lattice is open timber grids without cloth at this level. Position the rotor high enough that the lowest sail tip stays above the feet and base. Modest early-village construction; no stone tower, no balcony yet.
```

## Level 2

```text
Use case: stylized-concept. Asset: one high-resolution transparent PNG sprite for a medieval isometric town-builder game.
Quality and style: match the detailed polished pixel-art style, warm timber, crisp outlines, controlled stepped shading, stone materials and upper-left lighting of the reference. Preserve fine native-resolution details; DO NOT reduce the image to a coarse 32px mosaic or artificially enlarge 4x pixel blocks. No blur, photographic materials, glossy 3D plastic, painterly brushwork, or noise. The user wants the original generated quality retained.
Camera: strict 2:1 dimetric isometric view, fixed three-quarter camera showing two sides, ground edges slope +/-0.5. One logical 1x1 ground footprint; the windmill's sails may naturally overhang that footprint. All feet, stairs and small grain props meet one common ground plane. Frontmost base point near horizontal center.
Composition: ONE isolated windmill, completely visible including ALL FOUR sail tips, supports and base, centered in a square canvas with generous transparent margins. Genuine transparent alpha everywhere outside the structure and through the open lattice. No ground diamond, terrain slab, grass base, surrounding scenery, cast shadow, captions, lettering, numbers, logo, watermark, people or animals.
Palette: warm dark oak and honey-brown wood, russet-brown shingle roof, cream linen, muted warm-grey stone. Use color richness and crisp material details comparable to the reference. No palette reduction.
Input image 1 is the LEVEL 1 windmill FAMILY AND STYLE REFERENCE, not an object to place next to the output.
Subject: LEVEL 2 UPGRADED VILLAGE WINDMILL on the same 1x1 base footprint. Upgrade the braced timber support into a warm-grey STONE BASE with a wooden entrance and low steps. Above it, a taller timber-framed mill tower with cream plaster panels and the same russet shingle roof as level 1. Add a SMALL WOODEN BALCONY/gallery around the midsection and one sack of flour by the door. The single rotor has exactly FOUR equally spaced wooden lattice arms, now covered with cream LINEN CLOTH, arranged in a diagonal X on the same front-facing axle as the reference. Keep four blades, one hub and a coherent mechanical attachment. Lowest sail tip stays above the base; no cropped tips. Visibly sturdier and more developed than level 1, but not yet a giant stone tower. Windmill only, no bakery, no chimney. IMPORTANT FRAMING: sprite occupies at most 80 percent of canvas height and width; leave at least 80 pixels of actual transparent padding between every sail tip/roof/base and the canvas border.
```

## Level 3

```text
Use case: stylized-concept. Asset: one high-resolution transparent PNG sprite for a medieval isometric town-builder game.
Quality and style: match the detailed polished pixel-art style, warm timber, crisp outlines, controlled stepped shading, stone materials and upper-left lighting of the reference. Preserve fine native-resolution details; DO NOT reduce the image to a coarse 32px mosaic or artificially enlarge 4x pixel blocks. No blur, photographic materials, glossy 3D plastic, painterly brushwork, or noise. The user wants the original generated quality retained.
Camera: strict 2:1 dimetric isometric view, fixed three-quarter camera showing two sides, ground edges slope +/-0.5. One logical 1x1 ground footprint; the windmill's sails may naturally overhang that footprint. All feet, stairs and small grain props meet one common ground plane. Frontmost base point near horizontal center.
Composition: ONE isolated windmill, completely visible including ALL FOUR sail tips, supports and base, centered in a square canvas with generous transparent margins. Genuine transparent alpha everywhere outside the structure and through the open lattice. No ground diamond, terrain slab, grass base, surrounding scenery, cast shadow, captions, lettering, numbers, logo, watermark, people or animals.
Palette: warm dark oak and honey-brown wood, russet-brown shingle roof, cream linen, muted warm-grey stone. Use color richness and crisp material details comparable to the reference. No palette reduction.
Input image 1 is the LEVEL 2 WINDMILL FAMILY AND STYLE REFERENCE only. Create a NEW separate LEVEL 3 sprite, not a side-by-side comparison.
Subject: LEVEL 3 TALL ROYAL TOWER WINDMILL. Keep the same architectural family and single front-facing diagonal-X rotor. Upgrade into a taller tapered warm-grey STONE TOWER with dark timber braces and a russet shingle cap roof. A wraparound wooden GALLERY is now near the upper mill house, below the axle. Exactly FOUR LARGE CREAM LINEN SAILS attached to one clearly defined wooden-and-iron central hub. Show the mechanical axle housing behind the hub, but no extra rotors or gears floating outside. Add one small timber grain-hoist beam with a sack under it, plus two flour sacks and one barrel tucked next to the wooden entrance and low steps at the base. Clearly grander and taller than level 2 without sprawling into a multi-building compound. Base still one logical 1x1 footprint. Camera, lighting, materials, cloth color, roof color, outline quality and fine image detail match the reference. The four blade tips must be fully visible; do not shorten or cut a blade to fit the frame. FRAMING: entire tall sprite including all blades and stone feet uses no more than 80 percent of canvas height and width, leaving generous real transparent margins on all four sides. No ground platform or scenery.
```

## Level 1 framing correction

The initial level 1 variant touched the top border. A targeted framing edit produced the final, fully visible level 1 sprite. Level 2 used the initial level 1 variant as its family/style reference; level 3 used level 2.

```text
Edit target: the provided LEVEL 1 wooden post windmill sprite. Change ONLY the framing: zoom the exact same whole windmill OUT by about 18 percent on the same square transparent canvas. Keep the identical architecture, palette, pixel-art rendering, detailed wood, one four-sail X rotor, sack, steps and braced wooden supports. Ensure ALL four sail tips are completely visible, especially the upper-left sail, with at least 70 pixels of genuine transparent padding on all sides. Do not add any background, ground tile, shadow, text, objects or a second rotor. Preserve original detail and transparent holes within the lattice, no pixelization or palette reduction.
```
