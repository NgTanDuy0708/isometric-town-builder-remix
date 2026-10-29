# Nhà Kho Tổng Hợp Hoàng Gia — Một kiểu duy nhất

**Một nhà kho hoàn thiện, một hình ảnh duy nhất. Không chia cấp độ hay tạo các phiên bản nâng cấp.**

- Mã công trình: `b60_combined_warehouse`.
- Footprint: **2×2 ô**, theo nhà kho hiện tại của game.
- Tên ảnh đề xuất: `warehouse_main.png`.
- Định hướng: kho lớn của thị trấn, đồ sộ, đẹp và giàu có; khối nhà rộng, mái cao, kết cấu gỗ chắc khỏe và chân tường đá.
- Đồng bộ nét pixel art chi tiết với Nhà Tranh, Nhà Trọ, Lò Rèn và Nhà Chính; phân biệt chức năng bằng cửa nhập hàng, tời nâng và hàng hóa.

## Cách dùng

Dán **STYLE CHUNG + PROMPT NHÀ KHO**, rồi thêm **NEGATIVE PROMPT** vào ô negative hoặc cuối yêu cầu tạo ảnh. Có thể kèm một ảnh công trình hiện tại làm tham chiếu phong cách, ánh sáng và chất liệu.

## STYLE CHUNG

```text
Create ONE high-quality transparent PNG building sprite for a medieval
fantasy isometric town-builder game.

Match the detailed, polished pixel-art style of the existing village
buildings: warm dark-oak framing, honey-brown timber, cream plaster,
russet-red roof tiles and muted warm-grey foundation stones.
Use crisp stepped outlines, carefully clustered material details and
controlled discrete shading. Preserve fine native-resolution detail.
Do not reduce the artwork to a coarse 32px mosaic, artificially enlarge
pixel blocks or apply palette reduction. No photographic textures,
painterly brushwork, smooth gradients, blur or glossy plastic rendering.

Use a strict 2:1 dimetric isometric camera showing two sides.
Ground-aligned edges follow slopes of +0.5 and -0.5;
vertical beams and walls stay upright without perspective convergence.
Light comes from the upper-left. Keep consistent roof highlights,
medium-lit left-facing walls and darker right-facing walls.

The building occupies ONE logical 2x2-tile footprint.
Express that footprint through the architecture, not a visible ground tile.
Keep its structural feet on one common ground plane, with the frontmost
foundation contact near the horizontal centre as a clear placement anchor.

Output exactly 1024x1024 PNG with genuine transparent alpha.
Show the complete building, roof ornaments, hoist, attached stairs
and all cargo. Keep the entire silhouette within the central 80 percent
of the canvas, leaving at least 80 pixels of transparent margin on all sides.

No terrain diamond, earth platform, floating island, surrounding paving,
road, grass, scenery or external cast shadow. Structural foundation stones
and a compact attached loading dock are part of the building and allowed.
No text, lettering, numbers, labels, watermark, logo or border.
```

## PROMPT — NHÀ KHO TỔNG HỢP ĐỒ SỘ

```text
Subject: ONE GRAND ROYAL GENERAL WAREHOUSE, the central storehouse
of a prosperous medieval fantasy farming town.
Create one definitive finished design, with no levels, upgrade stages,
alternative versions or comparison sheet.

Make it imposing through a BROAD, DEEP BUILDING MASS, a tall sweeping
roof and strong construction. It should look clearly larger and more
substantial than a village cottage, with generous storage capacity.
Keep it compact within a square 2x2-tile footprint.

Design one coherent two-storey warehouse hall with a high storage loft.
Use a substantial warm-grey stone lower storey, thick oak corner posts,
large diagonal timber braces and cream plaster panels above.
Give it a magnificent russet-red tiled pitched roof, a strong central
gable, honey-brown ridge beams and neatly layered eaves.
Add one short roof ventilation cupola and a small iron weather vane.
The cupola is modest: the broad main roof dominates the silhouette.

The main loading facade faces the lower-left/front of the isometric view;
the right-hand side wall remains clearly visible.
Place a large iron-banded oak double loading door on the front facade,
with one leaf partly open, revealing a small dark storage recess
containing neatly stacked wooden crates and closed burlap sacks.
Keep the roof and walls intact; this is an exterior sprite, not a cutaway.

Directly above the entrance, add one loft cargo hatch beneath a projecting
timber hoist beam. Show one coherent pulley mechanism, a short taut rope
and ONE small wooden crate suspended beside the hatch, close to the wall.
The hoist belongs to the facade and stays within the compact silhouette.

Attach a low, narrow timber loading dock to the entrance, supported by
stout posts, with three short wooden steps at one end.
Keep it subordinate to the building, not a broad platform beneath it.
Show the dock supports and stone foundation reaching the same ground plane.

Along the visible right wall, integrate a shallow lean-to storage bay
under a small matching red-tiled roof. Tuck a restrained, tidy assortment
of goods under it: three wooden crates, two closed barrels, three tied
grain sacks and a small stack of bundled timber. Include one small open
produce crate with a few golden wheat heads and red apples.
These goods communicate mixed agricultural produce, building materials
and finished supplies. Keep each group readable and attached visually
to the warehouse, without spilling into a yard or separate market stall.

Make the architecture handsome and prosperous through balanced proportions,
well-crafted timber brackets, clean stone corner blocks, small upper
ventilation windows with wooden shutters and two warm entrance lanterns.
Add a small carved wooden emblem showing a simple crate and wheat motif,
without text. Limit decoration so the grand roof, loading doors and hoist
remain the three clearest visual features at game scale.

This is a working GENERAL WAREHOUSE. Use few small windows, no residential
balconies, no tavern mug sign, no shop counter, no clock tower and no bell.
No castle battlements, defensive towers, chimney, furnace or mill machinery.
No people, animals, wagons, detached outbuildings or surrounding landscape.

Keep the complete isolated building and all attached details visible.
Retain the shared pixel-art style, strict 2:1 camera, upper-left lighting,
true transparent background and clear frontmost ground-contact anchor.
```

## NEGATIVE PROMPT

```text
level 1, level 2, level 3, upgrade progression, multiple versions,
comparison sheet, sprite sheet, collage, multiple separate buildings,
tiny shed, small cottage, narrow tower, residential mansion,
castle, fortress, battlements, defensive towers, church, cathedral,
clock tower, bell tower, tavern mug sign, market stall, shop counter,
forge furnace, windmill sails, water wheel, factory smokestack,
exposed interior cutaway, removed roof, impossible floating cargo,
disconnected hoist, tangled ropes, excessive clutter, scattered cargo yard,
large courtyard, surrounding paving, ground diamond, grass base,
earth slab, thick decorative pedestal, floating island, road, cast shadow,
people, animals, cart, wagon, text, lettering, numbers, watermark, logo,
photorealistic, glossy 3D render, plastic, painterly texture,
smooth gradients, blurry edges, coarse mosaic, oversized pixel blocks,
noisy dithering, neon colours, fisheye, perspective distortion,
cropped roof, cropped hoist, clipped steps, clipped cargo,
opaque black background, opaque white background, painted checkerboard
```

## Kiểm tra ảnh sau khi tạo

- Chỉ **một mẫu nhà kho hoàn thiện**, không chia cấp độ.
- Dáng rộng và sâu, mái lớn, chân đá chắc; đọc rõ là kho hàng ở kích thước nhỏ.
- Cửa nhập hàng, tời nâng và các nhóm thùng, bao, vật tư dễ nhận diện.
- Hàng hóa nằm gọn sát công trình; không có sân hàng hay công trình phụ tách rời.
- Đúng góc isometric, không cắt mái hoặc tời; chân nhà có điểm tiếp đất rõ.
- Nền trong suốt thật; giữ PNG gốc để căn kích thước và điểm neo khi tích hợp.

Tài liệu chỉ soạn prompt cho một kiểu ảnh nhà kho; không sửa ảnh đang dùng hay cơ chế nâng cấp trong code.
