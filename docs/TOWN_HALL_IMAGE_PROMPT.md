# Nhà chính của game — Tòa Thị Chính

**Một công trình, một hình ảnh duy nhất. Không chia cấp, không tạo biến thể nâng cấp.**

- Vai trò: nhà chính và trung tâm hành chính của vương quốc.
- Mã công trình hiện tại: `b14_town_hall`.
- Footprint: **2×3 ô**, phù hợp khu trung tâm hiện tại của game.
- Tên ảnh đề xuất: `town_hall_main.png`.
- Phong cách: pixel art fantasy trung cổ chi tiết, đồng bộ với Nhà Tranh, Nhà Trọ và Lò Rèn đang dùng.
- Chỉ vẽ tòa nhà. Quảng trường, đường đi và cảnh quan sẽ được ghép riêng trong game.

## Cách dùng

Dán **STYLE CHUNG + PROMPT NHÀ CHÍNH**, rồi thêm **NEGATIVE PROMPT** vào ô negative hoặc cuối yêu cầu tạo ảnh. Nếu dùng ảnh tham chiếu, chọn một công trình hiện có để tham chiếu nét vẽ, màu và ánh sáng; không yêu cầu sao chép chức năng của công trình đó.

---

## STYLE CHUNG

```text
Create one high-quality transparent PNG sprite for a medieval fantasy
isometric town-builder game.

Match a polished, detailed pixel-art game style: warm timber framing,
cream plaster, russet-red roof tiles, muted warm-grey stone,
crisp stepped outlines and clean clustered material details.
Preserve native-resolution detail. Do not reduce the image to a coarse
32px mosaic, artificially enlarge pixel blocks or quantize away its detail.
Use controlled discrete shading, without photographic texture,
painterly brushwork, smooth gradients, blur or glossy 3D plastic.

Use a strict 2:1 dimetric isometric camera, showing two sides of the building.
Ground-aligned edges follow slopes of +0.5 and -0.5.
Keep vertical walls and tower edges upright, with no perspective convergence.
Light comes consistently from the upper-left: light roof planes,
medium-lit left-facing walls and darker right-facing walls.

One logical footprint of 2x3 tiles, expressed through the building's layout,
not through a visible ground slab. All walls, supports and entrance steps
meet one common ground plane. Keep the frontmost stone base or lowest
entrance step near the horizontal centre as a clear placement anchor.

Output exactly 1024x1024 PNG with genuine transparent alpha.
Show the entire building, including tower ornament, roof edges and steps.
Keep the complete silhouette within the central 80 percent of the canvas,
with at least 80 pixels of transparent padding on every side.
Transparent background also remains visible through open arches
and other genuine openings.

No terrain diamond, raised earth platform, broad stone plaza, surrounding
grass, road, garden, cast shadow or background scene.
Structural foundation stones and a short attached entrance staircase
are allowed; a separate decorative ground pedestal is not.
No text, lettering, numbers, labels, watermark, logo or frame.
```

## PROMPT — NHÀ CHÍNH / TÒA THỊ CHÍNH

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
```

## NEGATIVE PROMPT

```text
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

## Kiểm tra ảnh sau khi tạo

- Chỉ có **một nhà chính hoàn thiện**, không có các ảnh cấp 1–3.
- Một tháp trung tâm, một đồng hồ, một chuông; cửa chính và bậc thềm nhìn rõ.
- Hai mặt nhà đúng góc isometric; mái, cửa và chân công trình không bị cắt.
- Có nền trong suốt thật, không kèm quảng trường hay khối đất.
- Chân nhà và bậc thềm cùng mặt phẳng; điểm tiếp đất phía trước dễ xác định.
- Giữ PNG gốc khi tải về. Việc căn điểm neo và kích thước trong game được xử lý khi tích hợp ảnh.

Tài liệu chỉ soạn prompt cho một ảnh nhà chính; không thay đổi số cấp hay cơ chế nâng cấp trong code game.
