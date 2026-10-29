# Main town hall

Generated with the built-in imagegen tool. One final building; the same art is used at every game level. Transparent PNG, mapped to the existing 2×3 town hall footprint. Original pixels are preserved; scaling and foot alignment are handled by the renderer.

Actual output: 1254×1254 RGBA, alpha 0–255 (requested 1024×1024).
Game asset: `public/assets/buildings/town_hall_main.png`.
Untouched source: `assets-source/town-hall/town_hall_main_source.png`.
Opaque bounds (alpha >128): x=143..1161, y=22..1214.
Front foundation contact: source (816,1214) -> (128,160) relative to cell (13,15).
Visible width: 300 world pixels; aspect ratio is preserved. The old `town_hall_royal.png` is retained.

## Final generation prompt

```text
Subject: THE MAIN TOWN HALL of a medieval fantasy farming kingdom.
Create ONE definitive finished building, not a level progression,
not an upgrade comparison and not a sheet of alternatives.

This is the player's central civic landmark: welcoming, prosperous,
recognizable and more important than the surrounding cottages and shops.
Give it a balanced, memorable silhouette with ONE dominant central
clock-and-bell tower rising above a substantial two-storey council hall.
Keep the architecture compact within a 2x3-tile footprint.

The main entrance faces the lower-left/front side of the isometric view;
the right-hand side facade remains clearly visible.
Build the ground floor from warm-grey stone blocks, with a broad arched
oak double door and a short attached stone staircase.
The upper floor uses dark oak half-timber beams, cream plaster panels
and a few tall arched council-chamber windows with warm amber interiors.

Use rich russet-red tiled pitched roofs, honey-brown ridge beams,
two modest side wings and restrained decorative timber brackets.
Both wings connect directly to the central hall: one coherent building,
not several separate houses or a walled compound.

The single central tower has a readable round clock face below
an open bell chamber containing ONE bronze bell.
Use simple clock ticks and two hands, without numerals or lettering.
A small red-tiled pointed roof and a modest metal weather vane
finish the top of the tower. No additional clock towers or giant spires.

Place two deep-blue hanging banners beside the entrance, each with
one simple gold crown emblem and no text. Add two small warm lanterns
near the door. Keep these civic details restrained and readable.

Make it unmistakably a TOWN HALL, not a tavern, chapel, royal fortress,
warehouse or production workshop. No mug sign, shop counter, market awning,
bread display, furnace, anvils, water wheel, windmill sails or crop beds.
No defensive walls, moat, drawbridge, military towers or large courtyard.

Only the isolated main building and its attached entrance steps are visible.
Do not draw a fountain, public square, paving surrounding the building,
roads, vegetation, villagers or animals.
Retain the shared style, 2:1 camera, upper-left lighting, transparent
padding and clear frontmost ground-contact anchor.

Shared visual style: crisp detailed pixel art for the existing medieval
isometric village game, warm earthy wood, stone and russet roof colours.
Hard pixel edges and coherent small pixel clusters, clear silhouette,
no smooth gradients, no coarse mosaic or oversized pixel blocks.
Strict orthographic 2:1 dimetric isometric camera, no perspective convergence.
Output one high-resolution square PNG with real alpha transparency.
Centre the entire building, including weather vane and steps, with transparent
padding on all sides; the frontmost contact point is the bottom step.
Requested canvas 1024x1024.

NEGATIVE PROMPT:
multiple versions, level 1, level 2, level 3, upgrade stages,
comparison sheet, sprite sheet, collage, multiple separate buildings,
village scene, city block, surrounding plaza, fountain, garden,
grass base, terrain tile, ground diamond, thick display pedestal,
floating island, road, detached staircase, cast shadow,
castle, fortress, church, cathedral, cross, tavern mug sign,
market stalls, bakery oven, forge furnace, anvils, windmill sails,
water wheel, crop beds, defensive walls, moat, drawbridge,
multiple clock towers, oversized spires, excessive ornament,
people, animals, text, clock numerals, lettering, watermark, logo, frame,
photorealistic, glossy 3D render, plastic materials, painterly brushwork,
smooth gradients, blurry edges, coarse mosaic, oversized pixel blocks,
noisy dithering, neon colours, perspective distortion, fisheye,
cropped tower, cropped roof, cropped steps, clipped weather vane,
opaque black background, opaque white background, painted checkerboard
```
