# Fixed village gate

Generated 2026-10-31 with built-in image_gen, transparent background enabled.
Reference: `public/assets/expansion/props/twin_tower_gate.png` (retired).
Native output: `C:/Users/ntduy/.codex/generated_images/01a17baa-0a4e-7470-8df2-a436b2f8749f/exec-79d25697-6aea-42fd-ab13-8cf9ffae7a8b.png`.
Runtime: `public/assets/buildings/village_gate_v2.png`, copied byte-for-byte; RGBA 1536×1024.
SHA-256: `1adb19c9002d4d823679a6d0497be17437cbe51d8700aa7e04199371f809d8d4`.

Logical footprint: row 31, columns 14–16. One visible anchor at [31,14], a passable marble road at [31,15], reserved occupancy at [31,16]. Uniform render scaling and native ground anchor are recorded in `src/data/villageGate.js`. No rotation, shear or stretched bitmap.

Alignment correction: the measured passage point (790,800) on the native image now lands at the middle road cell centre, local (128,128). The previous anchor used the right tower's lowest toe (1100,1004), putting the opening about 22 world pixels below the road. Sprite scale and the protected three-cell layout are preserved. Both building and expansion renderers consume the same corrected geometry.

Exact final prompt:

```text
Use case: precise-object-edit. Create a new replacement asset for the referenced village twin-tower gate, keeping its medieval pale stone masonry, two round towers with terracotta conical roofs, blue-and-gold royal banners and open dark wooden doors with a raised portcullis. Reference is the existing gate to redraw, NOT a scene. Fix the isometric ground orientation and proportions: it must occupy ONE ROW of THREE adjacent isometric square tiles, a 3x1 thin strip; the tower on the LEFT stands on the northwest/upper-left end tile, the open arch passage occupies the centre tile, and the tower on the RIGHT stands on the southeast/lower-right end tile. The line joining the two tower base centres MUST slope exactly DOWN RIGHT at 1 vertical for 2 horizontal (26.565 degrees). The right tower base centre is substantially lower than the left, matching a diagonal row of isometric tiles. All walls and battlement joints follow that SAME 2:1 ground axis; all vertical tower axes stay truly vertical. Uniform camera, NO stretching, NO skew/shear, NO tilted verticals. Full isolated gateway, genuine transparent alpha background. No ground plane, terrain, grass, shadow disk or square foundation tile. Only a very shallow stone footing under each tower. Two similar-height towers, realistic compact gate arch, broad enough for the centre tile roadway. Entire building fully contained with generous transparent padding on all sides, no clipped spires or door edges. Polished painterly pixel-art finish matching the reference game. Render a single building, not a sprite sheet. No text, labels, guides or grid. Landscape 1536x1024 or square image as needed.
CRITICAL CORRECTIONS: True 2:1 isometric projection, not a shallow front view. Left tower centre ground contact around x=350,y=500; right tower centre ground contact around x=1150,y=900, exactly 400 pixels lower for 800 pixels to the right. Both towers identical physical height. Raise the LEFT tower and lower RIGHT tower until this precise baseline is achieved. No glow, no soft shadow, no blurred translucent halo. Alpha=0 outside clean building edges. Bright textured pixel art, not photorealistic 3D. Keep left/right towers slender enough to fit each one end tile, central passage spans middle tile. Show empty transparent space under the arch.
```

