# Town hall redraw

Generated with built-in imagegen. The first text-only attempt still used a near-frontal facade, so it was rejected. The final generation uses `scratch/townhall-camera-guide.png` as a geometry-only reference, rendered from the local SVG blockout; it is not the game artwork.

Final: `public/assets/buildings/town_hall_redrawn_v2.png`.
Untouched source: `assets-source/town-hall/town_hall_redrawn_v2_source.png`.
Actual output: 1254×1254 RGBA, alpha range 0..255.
Opaque bounds: (228,9)..(1057,1185); visible width 829 source pixels.
Stair contact: source (430,1103) -> centre of game cell [15,15].
Visible world width 280; uniform scaling, rotation 0, shear 0.
Settings v4 ignores v1/v2/v3 corrections for the old artwork. Earlier art is retained.

## Final prompt (geometry reference)

```text
Generate a finished detailed pixel-art medieval MAIN TOWN HALL for a farming town-builder, using the supplied image ONLY as an architectural CAMERA AND GEOMETRY BLOCKOUT.

MOST IMPORTANT: retain the blockout's exact orthographic dimetric camera and its face orientations. Its front wall foundation and step edges slope DOWN-RIGHT at 1 pixel down for 2 pixels right. Its right-side wall foundation slopes UP-RIGHT at 1 pixel up for 2 pixels right. All vertical wall and tower edges remain perfectly vertical. Use these same directions for timber sill beams, stone courses, facade window sills and eaves. Do not turn the facade towards the camera. Do not flatten the front facade. Both wall faces must keep the geometric directions shown in the blockout. Do not rotate, shear, lean or tilt the building. Maintain a consistent grid for every attached part.

Replace the crude placeholder graphics completely with refined warm medieval pixel art:
ONE welcoming prosperous two-storey council hall in a compact 2x3 tile rectangular footprint. One dominant central clock-and-bell tower; two modest attached architectural wings can be expressed with connected gables/dormers, but remain one coherent civic building. No separate houses.
Warm-grey block-stone ground floor, dark oak half-timber cream-plaster upper floor, rich russet-red tiled roofs with honey-brown ridge beams. Broad arched oak DOUBLE DOOR on the lower-left-facing entrance facade, short attached stone staircase in the blockout's lower-left direction. All tread front edges parallel to the front facade base, exactly 2:1 slope.
A single readable round clock face, ticks and two hands with NO NUMERALS, below one open bell chamber with ONE bronze bell. Modest red-tiled pointed tower roof and small metal weather vane, all fully visible.
Two deep-blue banners flanking the entrance, each with one simple gold crown. Two small warm lanterns by the door. A few tall arched council-chamber windows, warm amber interiors. Balanced memorable silhouette, upright structure.
Crisp detailed pixel art with coherent small pixel clusters, clean hard edges, warm earthy palette, upper-left lighting. No coarse mosaic or oversized pixel blocks. This is a polished playable sprite, not a wireframe or vector diagram: remove the crude thick diagram outlines and replace them with appropriate fine pixel-art contours.

Output ONE complete isolated building with its attached entrance steps, square high-resolution PNG, TRUE TRANSPARENT background and generous empty padding. Remove the reference's light grey background entirely, no ground surface or shadow. Do not include the blockout itself or side-by-side comparison. Only ONE final asset.

NEGATIVE: near-frontal view, low viewpoint, altered camera, flattened facade, asymmetrical vanishing perspective, tilted verticals, leaning backwards, rolled image, three-dimensional perspective convergence, too shallow front ground slopes, surrounding paving, plaza, fountain, garden, grass, people, animals, detached steps, display pedestal, floating island, visible grid, axes, wireframe, vector blockout style, simple flat placeholder building, multiple versions, upgrade stages, clock numbers, lettering, text, watermark, cropped roof, clipped weather vane, opaque background, checkerboard background, glossy 3D render, photorealism, blur, noisy dithering.
```

## Initial text-only prompt (rejected)

```text
Create ONE new, finished MAIN TOWN HALL sprite for a medieval fantasy farming town-builder game. This is a replacement for an earlier asset whose camera was wrong. Build the geometry correctly from scratch.

CRITICAL GEOMETRY, highest priority:
Use strict ORTHOGRAPHIC 2:1 DIMETRIC GAME PROJECTION. The two horizontal ground axes have screen direction vectors (2,1) and (-2,1). Each 100 pixels of horizontal travel along an architectural ground edge changes its screen y by exactly 50 pixels. Front foundation courses, bottom step edges, side foundation courses, upper-floor sill beams and horizontal roof eaves must each follow one of those SAME two axis directions. Parallel edges remain parallel at all depths. All structural verticals (tower posts, wall corners, door jambs) are EXACTLY vertical in the image, constant x from bottom to top. The building stands upright. Camera roll is zero. NO perspective vanishing point, NO wide-angle distortion, NO leaning tower, NO facade bowing, NO uneven camera angle between wings, NO pseudo-isometric illustration. Roof slopes are pitched, but roof eaves and ridges obey the horizontal isometric axes.
The entrance facade faces lower-left/front; the right side facade is visible. The building occupies a compact rectangular 2x3 tile footprint, with the entrance facade extending along the (2,1) axis and the right side along (2,-1). A short staircase projects toward lower-left along (-2,1), perpendicular in world space to the entrance facade. Every step is rectangular in world space; front edges follow (2,1). The stairs are integral with the entrance. Have one clearly readable centre point on the ground-contact edge of the LOWEST step for anchoring onto a game tile.
Use a high enough viewpoint to see the roofs with the proper dimetric ground slopes, not a low near-front-on illustration.

ARCHITECTURE:
A welcoming prosperous central civic landmark, more prominent than cottages, with ONE dominant central clock-and-bell tower and one substantial TWO-STOREY council hall. Two modest attached wings, all one coherent structure, compact balanced silhouette.
Ground floor: warm-grey stone blocks, broad arched oak DOUBLE entrance doors, short attached stone staircase.
Upper floor: dark oak half-timber beams, cream plaster panels, a few tall arched council windows with warm amber interiors.
Roofs: rich russet-red tiled pitched roofs with honey-brown ridge beams and restrained timber brackets.
Single tower: one readable round clock below an open bell chamber containing ONE bronze bell, a small red-tiled pointed roof, modest metal weather vane. Clock has only ticks and two hands, NO NUMERALS.
Two deep-blue hanging banners flank the door, each with one simple gold crown emblem. Two modest warm lanterns by the entrance.
Unmistakably civic town hall: no tavern sign, church cross, fortress features or industrial equipment.

STYLE AND OUTPUT:
Crisp detailed pixel art matching a warm medieval isometric farming game: earthy stone and wood, russet roofs, restrained amber windows. Clean hard pixel edges, coherent small pixel clusters, readable architecture, no coarse mosaic or huge pixel blocks. Upper-left lighting. Consistent camera and material scale throughout the entire building.
Output a single square high-resolution PNG (1254x1254 if available) with TRUE ALPHA TRANSPARENCY, transparent empty padding on every side. Fully include weather vane, roof and attached bottom steps. Only this isolated building and its attached steps. No terrain, plaza, base diamond, courtyard, garden, people, animals, separate cast shadow, labels or watermark.
Do NOT draw the construction grid or coordinate axes: they are geometry constraints only.

NEGATIVE:
slanted vertical columns, leaning backward, leaning sideways, rotated image, skewed facade, low-angle camera, perspective convergence, fisheye, inconsistent roof angles, shallow ground-edge slopes, distorted staircase, detached steps, cropped steps, cropped tower, multiple clock towers, giant spires, fortress, cathedral, tavern, mug sign, market stalls, machinery, crop beds, grass, trees, surrounding paving, fountain, plaza, pedestal, raised display block, floating island, ground tile, visible grid, multiple versions, upgrade sheet, collage, labels, text, clock numerals, watermark, logo, opaque background, painted checkerboard, glossy 3D render, photorealism, painterly brushwork, blur, smooth gradients, noisy dithering, coarse mosaic.
```
