# Three-storey royal warehouse, corrected 2:1 ground footprint


## Final camera correction

The first rendering was refined against the three-storey wireframe, then corrected for the measured ground-edge slopes. Final native PNG: `public/assets/buildings/royal_warehouse_three_storey.png`. Used by `b60_combined_warehouse` and `/warehouse-editor`. Previous PNG and its tuning key remain preserved. A small runtime vertical scale/shear fits both foundation edges to the game's 2:1 ground axes; source pixels are unchanged.

```text
Geometry refinement followed the supplied 2:1 wireframe.
```

```text
Precision correction retained the exact three-storey design and transparent background.
```

Mode: built-in image_gen. One new finished three-storey building, native transparent PNG; no palette conversion or resizing. Replaces the older irregular dock/lean-to design. Ground geometry is the priority.

```text
Use case: stylized-concept
Asset type: ONE finished high-resolution pixel-art sprite for an isometric medieval town-builder game. Transparent RGBA PNG. This replaces an incorrectly aligned warehouse illustration.

PRIMARY REQUEST: ONE GRAND ROYAL GENERAL WAREHOUSE WITH EXACTLY THREE FULL STOREYS. One coherent, broad square building, NOT three upgrade versions. Richly detailed crisp pixel art matching warm oak, cream plaster, warm-grey stone, russet-red tiled roof of the existing fantasy village building family. Upper-left illumination, clean small pixel clusters, sharp outlines, no coarse mosaic or blur.

CRITICAL GEOMETRY — highest priority:
The architectural ground footprint is a SQUARE seen in strict 2:1 DIMETRIC orthographic projection (axis edges run exactly 2 pixels horizontally for 1 pixel vertically). Both visible walls have EQUAL GROUND LENGTH. Their bottom edges form one clean symmetric V, meeting at ONE central front ground corner. No perspective convergence. Every vertical column is exactly vertical.
Imagine a 1254x1254 source canvas: the actual left ground corner is approximately (177,960), frontmost ground corner (627,1185), right ground corner (1077,960), and hidden rear ground corner (627,735). These four ground corners form the 900-wide by 450-high 2:1 diamond of a 2x2-tile square. Use these as architectural layout guides ONLY; do not draw guide lines or a ground tile.
The visible thin stone foundation's contact edge from the left corner to the centre front corner must be a single straight +0.5 slope. From the centre front corner to the right corner a single straight -0.5 slope. All structural wall footings coincide with these edges. The front vertical corner pier lands precisely on that central bottom V tip.
Draw the BUILDING ITSELF on this footprint: no extra diamond slab, no platform or decorative pedestal beneath it. The stone base course belongs to the walls and reaches ground evenly. NO projecting front dock, NO steps, NO protruding lean-to, NO cargo scattered outside these edges. Avoid asymmetrical ground-contact geometry. We must be able to align the real foundation, not a painted ground diamond, with four game tiles without shearing or distorting the image.

ARCHITECTURE:
An imposing, broad, deep three-storey royal general storage warehouse, within a compact square 2x2 footprint. Clearly show THREE full usable floors using TWO strong horizontal timber belt beams separating them. Ground storey is substantial warm-grey dressed stone, not a raised plinth. Second and third storeys are heavy honey-brown oak posts and diagonal timber braces with cream plaster infill. Equal-length visible left/front loading facade and right side wall, with square mass; generous volume, never a narrow tower.
A magnificent high russet-red tiled pitched roof with one strong front-facing gable, neat layered eaves, a modest short louvred roof ventilation cupola and small iron weather vane. Roof overhang is restrained so the broad square body and precise footprint remain readable. Entire roof and vane within transparent margins.
On the left/front facade: one large iron-banded oak double loading door at ground level, one leaf partly open showing a small dark recess with tidy crates and CLOSED sacks INSIDE. Door threshold FLUSH with the bottom edge of the wall, NO steps or exterior loading platform. Two warm lanterns attached to the wall beside the doorway.
On the third storey directly above the entrance: one loft cargo hatch and one short projecting timber hoist beam with one coherent pulley, short taut rope and ONE small wooden crate close to the facade, entirely above ground. This crate must not create an extra ground-contact point.
Few small shuttered ventilation windows. One small carved wooden crate-and-wheat emblem, no text. Goods may be visible ONLY inside the loading-door recess or a shallow storage recess WITHIN the right wall, never projecting beyond the square ground perimeter: closed barrels, tied grain sacks, stacked crates, bundled timber, a little wheat and red apples. Recesses keep walls and roof intact, exterior sprite not a cutaway.
No residential balcony, shop counter, tavern mug sign, chimney, furnace, wheel, cart, people or animals.

COMPOSITION AND OUTPUT:
One isolated complete three-storey building, comfortably framed on a square canvas with true transparent background. Highest original detail retained, clean pixel-art edges. Clear, symmetric, flat 2:1 ground-contact foundation. Main three visual features: grand red roof, broad three-storey stone/timber body, loading door and facade hoist. All elements fully visible and never cropped.
No labels, levels, text, lettering, numbers, watermark, logo, comparison, sprite sheet or multiple buildings.
No ground tile, grass, dirt, landscape, paving, courtyard, cast shadow, thick base slab, floating island, irregular footprint, side annex, external lean-to, projecting steps, external dock, detached props, opaque background, painted checkerboard, fisheye, perspective distortion, sloped verticals, smooth 3D rendering, painterly shading, low-resolution pixel blocks.
```
