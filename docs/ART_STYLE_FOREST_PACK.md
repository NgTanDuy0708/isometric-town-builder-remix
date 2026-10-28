# System Instruction — Pixel Art đồng bộ Forest Pack (Kipperfalcon)

Dùng cho mọi lần generate nhà/công trình. Copy nguyên khối **SYSTEM INSTRUCTION** vào system prompt / style prompt của model ảnh (Gemini Nano Banana, Flux, Midjourney, …).

> Không upload asset của pack làm dữ liệu train AI (license CC0 cấm dùng làm database huấn luyện).
> Chỉ dùng mô tả style + bảng màu bên dưới.

---

## SYSTEM INSTRUCTION (copy-paste)

```text
You are a pixel-art asset generator for an isometric medieval town-builder game.
Your output must match the "Forest Isometric Pack" art style: small, readable
32px pixel art, flat colours, hard edges, no anti-aliasing, no gradients.

GLOBAL SPEC
- Output: exactly 1024x1024 PNG, transparent background.
- Projection: strict 2:1 isometric (dimetric). One tile = 32x32 art pixels:
  top diamond 32x16, side depth 16. At 1024 output that is a 4x nearest upscale:
  diamond 128x64, art pixel = 4x4 screen pixels.
- The building footprint is ONE tile unless stated otherwise. Place the tile's
  bottom diamond vertex at (512, 960) and its left/right vertices at
  (384, 896) and (640, 896). The building's lowest wall/step must sit on that
  diamond. Build upward from there.
- Draw at 32px readability first: silhouette must read at 32x32. Details are
  clusters of 1-3 art pixels, never thin 1-screen-pixel lines.
- No anti-aliasing. No smooth gradients. No soft shadows. No blur.
- 1 art-pixel outline (4 screen px at 1024) around the whole silhouette:
  dark green #1e4615 for plants/roof moss, dark brown #2a1b14 for wood,
  dark grey #2f3436 for stone.
- Light source: top-left. Top faces lightest, left faces mid, right/front
  faces darkest. Add 1 art-pixel highlight on top edges only.
- Restricted palette (use ONLY these, plus at most 2 neutrals for windows):
  #1e4615 #1a3b11 #32571d #4b6c2e #6d8740 #8aa355 #aabd68
  #e6dfa1 #e8cd97 #ccb45c #ba9745 #9e7a36 #855c22
  #67231b #8a3c24 #9e5333 #e0ac6c #581c23
  #709fcf #5782ba #add6e0
  #2f3436 #4b4f53 #7b7f7a #c9c8bd
- Transparent background only. No ground tile, no grass base, no dirt patch,
  no cast shadow, no background scenery, no text, no watermark, no border.
- One single building, fully visible, centred, nothing cropped.
- Pixel edges must be hard and blocky; if the model cannot produce true pixels,
  render at 256x256 then upscale 4x nearest neighbour.
```

---

## Prompt template cho từng công trình

```text
Pixel art isometric building: <TÊN CÔNG TRÌNH>.
Footprint: <1x1 | 2x2 | 2x3> tile.
Function: <chức năng>.
Materials: <gỗ sồi / đá / gạch / tranh>.
Roof: <mái tranh vàng / ngói đỏ / ngói xám>.
Details: <cửa, cửa sổ, ống khói, biển hiệu, thùng gỗ, bao tải, cối xay...>.
Match the global pixel-art spec: 2:1 isometric, 4x pixel grid, hard edges,
1-pixel dark outline, top-left light, palette only, transparent background,
no ground, no shadow, no text.
```

### Ví dụ — Nhà Tranh Lv.1
```text
Pixel art isometric building: small thatched cottage, level 1.
Footprint: 1x1 tile.
Function: poor farmer's home.
Materials: rough timber frame, wattle-and-daub walls, straw roof.
Roof: thick golden thatch with uneven edges.
Details: one wooden door, one small shutter window, water barrel, firewood pile.
Match the global pixel-art spec: 2:1 isometric, 4x pixel grid, hard edges,
1-pixel dark outline, top-left light, palette only, transparent background,
no ground, no shadow, no text.
```

### Ví dụ — Kho Tổng Hợp
```text
Pixel art isometric building: royal storage warehouse, 2x2 footprint.
Timber-framed walls, red shingle roof, open loading bay with burlap sacks,
barrels and crates, small wooden loading platform, weather vane on ridge.
Match the global pixel-art spec: 2:1 isometric, 4x pixel grid, hard edges,
1-pixel dark outline, top-left light, palette only, transparent background,
no ground, no shadow, no text.
```

---

## Negative prompt

```text
photorealistic, 3D render, smooth shading, soft gradients, anti-aliased edges,
blurry, glow, depth of field, ground tile, grass base, dirt patch, cast shadow,
multiple buildings, people, animals, text, watermark, logo, border, frame,
perspective distortion, fisheye, noisy dithering
```

---

## Hậu kỳ bắt buộc (mình xử lý trong repo)

1. Cắt alpha, bỏ nền.
2. Scale về **128×128** (nearest), đáy công trình đặt tại đỉnh dưới diamond `(64,128)`.
3. Lượng tử palette về đúng bảng màu trên (nếu model lệch).
4. Nới mép 2px để không hở viền khi đặt cạnh tile khác.
5. Kiểm tra chiều cao: nhà 1 tầng ~96–128px, 2 tầng ~160–220px trong world 128.

---

## Ghi chú license

- Forest Pack: CC0, dùng thương mại OK, **cấm dùng làm database train AI**, cấm bán lại asset.
- Ảnh AI tạo ra từ prompt text (không dùng asset pack làm train/reference file) là asset riêng của bạn.

---

## Gemini / Nano Banana addendum (bắt buộc)

Gemini vẽ ở 1024 và **bỏ qua pixel grid**, nên thêm các dòng sau vào prompt:

```text
Draw as if on a 256x256 pixel canvas, then upscale 4x with nearest neighbour.
Use 4x4 pixel blocks only. Maximum 20 colours. Outline exactly 1 pixel at 256
scale (4 px at 1024). The building base is a FLAT 2:1 diamond footprint,
bottom vertex at the centre bottom; NO stone basement, NO plinth, NO ground,
NO shadow. Keep the silhouette simple and readable at 32 px. No moss patches,
no cyan/blue windows, no extra props outside the footprint.
```

Sau khi tải ảnh về, chạy:

```bash
python tools/pixelize_asset.py input.png output.png --height 128 --pixel 4
```
