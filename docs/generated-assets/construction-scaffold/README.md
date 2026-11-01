# Shared construction scaffold

Generated 2026-10-31 with built-in image_gen, `transparent_background: true`.

- Runtime file: `public/assets/buildings/construction_scaffold_v1.png`.
- Native source: `C:/Users/ntduy/.codex/generated_images/01a17baa-0a4e-7470-8df2-a436b2f8749f/exec-9ea0d298-a1c6-458e-bdbd-bc113d1f61d1.png`.
- Native RGBA: 1254 × 1254; alpha range 0–255; opaque bounds [160,51,1122,1187]. Copied byte-for-byte.
- SHA-256: `49cbe736e28fc1ac94f97926a4830244b0fd3a6f74c347aea3fdd30a5f579e9b`.
- Source foot anchor: (631.8731025273452,1187), measured from alpha >100 in the bottom ten visible rows.

All pending non-flat buildings/decorations use this one full-opacity sprite. Finished art appears after construction completes. Original progress timers and gem acceleration remain. Placement previews and ground/road construction keep their existing behavior. A 2×2 warehouse scales the same PNG uniformly by two; a two-cell pen centres a single scaffold between its cells without stretching it. State, save data, cost and build duration do not change.

Validation: 262 tests passed, TypeScript lint and production build succeeded. A synthetic save with six construction sites was rendered using the built core in an isolated offline headless browser profile; the native canvas PNG was exported and visually inspected. Both pen orientations and a large warehouse use the shared sprite with no faded finished building underneath.

Exact prompt:

```text
Use case: stylized-concept. Production-ready isolated game sprite for an isometric medieval town builder, a GENERIC BUILDING UNDER CONSTRUCTION. One compact square-footprint timber scaffold frame, two levels of sturdy wooden upright poles and cross braces, rough wooden planks/platforms and a short ladder. Large neutral cream-beige canvas tarpaulins drape over the upper frame and most sides, tied with rope; leave some wooden framing clearly visible. The building underneath is completely concealed: no finished architecture. Fits any type of building as a shared construction placeholder. Match detailed hand-painted pixel-art medieval village game art with crisp readable wood and canvas folds, natural warm colors. True 2:1 isometric ground projection: the two base axes slope down-left and down-right at 1 vertical to 2 horizontal; all vertical poles remain vertical. All four feet rest on the same ground plane; frontmost foot at bottom centre. Square logical footprint, view from above at isometric angle. NO terrain, grass, floor diamond, ground tile or drop shadow. No people, signs, text, icon, border, grid or labels. Genuine transparent alpha background, entire object contained, generous 10 percent transparent padding on all sides, no cropped poles or ladder. Single object only, not an atlas. Square image.
```

