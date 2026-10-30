# Chuồng trại không nền — v4

Tạo bằng imagegen tích hợp từ bốn ảnh v3, mỗi ảnh là một lượt edit riêng.
PNG kết quả được giữ nguyên. Game vẽ nền địa hình hiện có, hàng rào theo đúng
chu vi hai ô bằng texture rào đã có, nhà ở ô sau và đàn vật nuôi ở ô trước.
Các góc/cạnh hàng rào không lấy theo hình do AI tạo.

```text
Use case: background-extraction / precise-object-edit.
Edit target: the supplied medieval pixel art barn sprite.
Remove the ENTIRE freestanding fenced enclosure and ALL ground artwork: every grass pixel, dirt patch, turf platform, mud, stones scattered on ground, ground shadow, fences, rails, fence posts and detached yard equipment must become genuinely TRANSPARENT alpha, including open door floor and underneath the building. The output must contain ONLY the roof, walls, door, windows, integral stone foundation blocks and the structural parts of the barn (for chicken coop keep its attached nesting boxes, legs and ramp). Remove milk churns, hay feeders, troughs and all detached props outside the building.
Keep the barn's original wood, cream plaster, red terracotta roof, pixel-art texture, lighting, camera and proportions. Preserve a complete small clean isolated BUILDING cutout, with no flat plane or colored polygon under it. Behind and THROUGH the open doorway is transparency except for the door/wall structure itself. No interior ground floor. No animals or people.
The game will add its own existing grass terrain and exact grid-aligned fences, so absolutely NO floor, lawn, land tile, platform, baseboard, skirt, foundation slab, grass tufts, scenery, opaque color, checker pattern or cast ground shadow anywhere. Stone footings under vertical structural posts can remain, nothing connecting them into a solid ground slab.
One isolated whole barn sprite, centered with transparent margin; preserve native undistorted proportions. Actual transparent RGBA background.
```
