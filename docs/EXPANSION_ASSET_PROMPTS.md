# Bộ prompt mở rộng — Công trình, cảnh quan và cây ăn trái

Nguồn danh sách: `New Text Document (3).txt`. Bộ này **chỉ soạn prompt**, chưa tạo ảnh và chưa thay đổi code game.

## Số ảnh cần tạo

| Nhóm | Số mục | Ảnh mỗi mục | Tổng ảnh |
|---|---:|---:|---:|
| Công trình có 3 cấp | 9 | 3 | 27 |
| Công trình, đường, cảnh quan và động vật có 1 mẫu | 27 | 1 | 27 |
| Cây ăn trái / bụi berry có 5 giai đoạn | 8 | 5 | 40 |
| **Tổng** | **44** | | **94** |

## Quy ước và cách dùng

1. Mỗi ảnh: ghép **STYLE CHUNG + đúng MODULE NHÓM + đúng một PROMPT ẢNH + NEGATIVE CHUNG**. Không ghép nhiều cấp hoặc nhiều giai đoạn vào cùng một yêu cầu.

2. Tạo mỗi ảnh riêng. Khi đã có ảnh ưng ý của một công trình hoặc cây, dùng chính ảnh đó làm tham chiếu cho cấp/giai đoạn tiếp theo để giữ kiến trúc, thân cây, góc nhìn và màu sắc.

3. Công trình ba cấp: cùng vị trí cửa và điểm tiếp đất; cấp sau phát triển từ cấp trước. Công trình một mẫu: chỉ một thiết kế hoàn thiện, không tự thêm cấp.

4. Cây: **cây con → cây lớn còn non → trổ hoa → kết trái chín → cây héo**. Chọn trổ hoa ở giai đoạn 3 để phân biệt rõ với giai đoạn 4. Ba giai đoạn cuối giữ cùng thân và cành chính.

5. Hiểu “cheri” là **cherry**, “berry” là **việt quất / blueberry**, “rừng thôg xanh” là **rừng thông xanh**. “Nhà đất sét” là nhà ở bằng đất/adobe; “lều” là lều vải; “chùa gỗ” là chùa Phật giáo bằng gỗ.

6. Đường đá gồm đoạn thẳng, ngã tư, ngã ba và góc L cùng một bộ đầu nối. Kênh đào và suối là đoạn thẳng có đầu nối mở; có thể bổ sung góc/ngã rẽ sau nếu cần. Không coi đây là bộ autotile đầy đủ.

7. Công viên, rừng thông, vườn anh đào, vườn hồng và đàn hồng hạc là **một sprite nhóm** theo đúng số lượng trong prompt. Cá voi là một con riêng, không kèm mặt biển.

8. Quy tắc nền theo module: nhà/cây/động vật không kèm nền đất hoặc nước; đường, đồng cỏ, kênh, suối, hồ băng và suối nóng cần có bề mặt đúng chức năng. Ngoài đường viền đối tượng vẫn là alpha thật.

9. 1024×1024 là kích thước yêu cầu trong prompt. Nếu công cụ trả kích thước nguồn khác, giữ PNG gốc; căn điểm neo và tỉ lệ khi tích hợp. Không giảm bảng màu hay ép thành mosaic thô.

10. Footprint công trình chưa được áp đặt số ô mới trong bộ này. Chọn footprint khi ghép game; trong một họ ba cấp phải giữ cùng footprint logic. Tọa độ module ô nền là quy ước tạo ảnh, cần căn về lưới runtime khi tích hợp.

## STYLE CHUNG

```text
Create a polished, detailed pixel-art asset for the SAME medieval fantasy
isometric farming town-builder game as the provided village references.
Reference images, if supplied, establish STYLE ONLY unless a same-family
level or lifecycle image is explicitly supplied for continuity.

Crisp stepped outlines, clean clustered material detail, readable silhouettes
and controlled discrete shading. Preserve fine native-resolution detail.
No coarse 32px mosaic, artificially enlarged pixel blocks or palette reduction.
No photographic textures, painterly strokes, blur or glossy 3D plastic.

Use a strict 2:1 dimetric isometric camera: ground-aligned straight edges
follow slopes of +0.5 and -0.5; vertical architectural posts stay upright.
Plants, animal anatomy and organic curves remain natural.
Consistent upper-left light, with darker right-facing surfaces.
No perspective convergence, tilted camera or fisheye distortion.

Buildings: dark oak, honey-brown timber, cream plaster, muted warm-grey stone
and russet-red roofs unless the subject specifies another coherent material.
Vegetation: muted olive and forest greens, warm-brown wood, cream blossoms;
use species-specific blossom and fruit colours where requested.
Water and ice: controlled turquoise, blue and pale cyan with stepped highlights.
No neon colours, excessive noisy detail or giant glow effects.

Output ONE 1024x1024 PNG with genuine transparent alpha.
Only the selected subject or explicitly specified coherent grouping.
Never draw other levels or lifecycle stages beside the chosen subject.
Follow the selected category module for framing, ground and connectors.
No captions, labels, lettering, numbers, watermark, logo or image frame.
```

## MODULE NHÓM

### B — Công trình và đồ vật

```text
CATEGORY B — BUILDING / STRUCTURE / PROP
Show the entire connected structure and all attached details.
Use the working box x=112..912, y=80..896, with generous clear margins.
Keep the frontmost structural ground-contact point near (512,896).
Other feet recede naturally along the shared isometric ground plane;
do not force every support onto one horizontal screen-space line.
Architectural foundations, short attached stairs and requested structural
plinths are allowed. No surrounding ground tile, grass disk, earth slab,
large plaza, floating pedestal, unrelated scenery or external cast shadow.
True openings through gates, arches, wheel spokes and open frames reveal alpha.
Enclosed rooms and recesses retain their naturally dark interior surfaces.
For three-level families, keep camera, root footprint, entrance direction,
ground anchor and design identity fixed. Generate only the requested level.
Keep the same canvas and world scale: level 1 is visibly simpler/smaller,
level 2 intermediate, level 3 the most developed; never independently zoom
each level to the same visible size. All levels fit the shared working box.
```

### V — Cụm cây và vườn trang trí

```text
CATEGORY V — VEGETATION / GARDEN GROUP
One integrated decorative grouping, not a landscape panorama.
Keep all trunks, supports and requested furniture on one shared virtual
isometric ground plane. Preserve clear gaps and true alpha between them.
Fit the entire grouping within x=112..912, y=80..896; place the frontmost
contact near (512,896). No solid lawn disk, soil slab, visible underground
roots, ground diamond, surrounding path or external cast shadow.
Only the explicitly requested tree/shrub count and attached props.
Individual fallen petals are allowed only when the subject requests them.
```

### T — Ô nền, đường và dòng nước có đầu nối

```text
CATEGORY T — MODULAR GROUND / ROAD / WATER TILE
Use a fixed diamond with vertices TOP=(512,320), RIGHT=(896,512),
BOTTOM=(512,704), LEFT=(128,512) on the 1024x1024 transparent canvas.
No perspective or screen-space rotation. Nothing protrudes beyond the diamond.
The tile edges are:
NE: TOP to RIGHT, midpoint (704,416).
SE: RIGHT to BOTTOM, midpoint (704,608).
SW: BOTTOM to LEFT, midpoint (320,608).
NW: LEFT to TOP, midpoint (320,416).
Connector mouths are centred on these midpoints.
For the stone-road family, each mouth occupies 160 pixels measured ALONG
its corresponding diagonal tile edge. Preserve the same mouth cross-section,
flush edging, paving scale and colours across straight, cross, T and L tiles.
Canal and stream each use a 160-pixel water mouth measured along the edge;
keep each family's own bank profile consistent at opposite ends.
The terrain plane is flat: no extruded terrain thickness or display pedestal.
Requested roads, water, narrow banks and meadow ARE the visible subject.
For partial-coverage road or water tiles, unused diamond regions remain alpha.
For a full meadow tile, fill the entire diamond and keep alpha only outside it.
No drop shadow, decorative border or tile-coordinate markings.
```

### N — Địa hình tự nhiên, hồ và suối nóng

```text
CATEGORY N — NATURAL LANDMARK / POOL
One isolated compact environmental feature within x=112..912, y=80..896.
The footprint is an irregular natural outline, not an obligatory diamond.
Requested rock, snow, ice and pool water are part of the subject and allowed.
No added square earth slab, floating-island base, thick display pedestal,
background scenery, sky, horizon or external cast shadow.
All ground-level parts agree on the shared isometric ground plane.
Keep the lowest shoreline or mountain-base contact near (512,896).
Only the hot spring may include its explicitly requested small steam wisps;
preserve clean partial alpha at their edges.
```

### A — Cá voi và đàn hồng hạc

```text
CATEGORY A — ANIMAL / FLOCK
Use the same above-ground three-quarter camera and upper-left lighting.
Clear natural anatomy and clean readable pixel clusters; no equipment
unless explicitly requested. Keep the whole silhouette and every appendage
inside x=112..912, y=96..896.
For flamingos, place their feet on one shared virtual isometric water plane;
vary depth naturally, without forcing every foot onto one screen-space line.
For the whale, centre the isolated body near (512,512); it has no ground anchor.
No baked water, ripple disk, splash, shore, ground patch, scenery or cast shadow.
The subject controls animal count: ONE whale or EXACTLY FIVE flamingos.
No extra animals or duplicate body parts.
```

### P — Cây ăn trái / bụi berry năm giai đoạn

```text
CATEGORY P — FIVE-STAGE FRUIT TREE / SHRUB
Create only the requested species and lifecycle stage.
Use ONE shared 1024x1024 canvas and root-crown anchor (512,896)
throughout all five images of that species.
Keep all visible content inside x=112..912, y=80..896.
Grow upward from the same root point; never move, recenter or zoom the plant
independently between stages. No visible underground roots, soil, planter,
grass, ground diamond, detached fruit pile or external cast shadow.

Lifecycle:
SEEDLING: approximately 25% of mature height, a genuinely small plant.
YOUNG: approximately 60% of mature height, developing woody structure.
FLOWERING: mature trunk and canopy, recognizable species-specific flowers.
FRUITING: SAME mature trunk scaffold and canopy position, harvestable fruits.
WITHERED: SAME mature trunk and primary branches, sparse dry foliage and
clear decline; do not turn it back into a small seedling or a cut stump.
Flowering and fruiting are NOT different tree sizes.
A withered plant may look visually narrower after leaf loss but retains
its mature woody scaffold. Keep seedling/young images small in the canvas.
Berry is a low blueberry shrub; do not turn it into a tall orchard tree.
Use the previous stage of the SAME species as a continuity reference
where available; one species must not inherit another species' leaves/fruit.
```

## NEGATIVE CHUNG

```text
multiple alternatives, level comparison, lifecycle comparison, sprite sheet,
collage, unrelated subjects, background landscape, sky, horizon,
floating island, thick display pedestal, external cast shadow,
text, letters, numerals, labels, watermark, logo, border, coordinate marks,
photorealism, glossy plastic 3D, painterly brushwork, photographic textures,
smooth airbrush gradients, blurry edges, coarse mosaic, oversized pixel blocks,
noisy dithering, neon colours, perspective distortion, fisheye,
cropped subject, clipped roof, clipped branches, clipped feet, clipped tail,
disconnected supports, impossible mechanics, extra limbs, fused animal bodies,
extra heads, extra tails, opaque black backdrop, opaque white backdrop,
painted transparency checkerboard
```

Negative chung không cấm mặt nước, nền cỏ, nhóm cây hoặc động vật được yêu cầu cụ thể. Giới hạn những phần đó bằng module và prompt của từng ảnh.

## A. Công trình có 3 cấp — 27 ảnh

| Công trình | Cấp 1 | Cấp 2 | Cấp 3 |
|---|---|---|---|

| Tháp pháp sư cổ đại | `ancient_wizard_tower_lv1.png` | `ancient_wizard_tower_lv2.png` | `ancient_wizard_tower_lv3.png` |

| Xưởng mộc & cưa gỗ | `carpentry_sawmill_lv1.png` | `carpentry_sawmill_lv2.png` | `carpentry_sawmill_lv3.png` |

| Xưởng dệt vải | `weaving_workshop_lv1.png` | `weaving_workshop_lv2.png` | `weaving_workshop_lv3.png` |

| Xưởng bơ sữa | `dairy_workshop_lv1.png` | `dairy_workshop_lv2.png` | `dairy_workshop_lv3.png` |

| Nhà đất sét | `clay_house_lv1.png` | `clay_house_lv2.png` | `clay_house_lv3.png` |

| Lều | `canvas_tent_lv1.png` | `canvas_tent_lv2.png` | `canvas_tent_lv3.png` |

| Nhà dài gỗ Bắc Âu | `nordic_longhouse_lv1.png` | `nordic_longhouse_lv2.png` | `nordic_longhouse_lv3.png` |

| Biệt thự Địa Trung Hải | `mediterranean_villa_lv1.png` | `mediterranean_villa_lv2.png` | `mediterranean_villa_lv3.png` |

| Chùa gỗ | `wooden_buddhist_temple_lv1.png` | `wooden_buddhist_temple_lv2.png` | `wooden_buddhist_temple_lv3.png` |

### A1. Tháp pháp sư cổ đại

Module: **B**. Cả ba ảnh giữ cùng họ kiến trúc và cùng điểm neo.

#### Cấp 1 — `ancient_wizard_tower_lv1.png`

```text
SUBJECT FAMILY: ONE ancient wizard tower with weathered warm-grey stone, dark oak structural details, deep desaturated blue roof tiles, restrained brass ornaments and subtle violet crystal accents. One principal tower, one arched entrance facing lower-left/front, visible right side. Clearly magical but compatible with the warm medieval village; no floating islands or giant glow clouds.

REQUESTED IMAGE: LEVEL 1 ONLY.
A modest squat circular stone tower with a short conical blue-tiled roof, one narrow amber window, a heavy oak door, two low attached stone steps, a tiny brass star ornament and one dim violet crystal mounted above the doorway. Ancient moss patches remain restrained. No balcony or secondary turret.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 2 — `ancient_wizard_tower_lv2.png`

```text
SUBJECT FAMILY: ONE ancient wizard tower with weathered warm-grey stone, dark oak structural details, deep desaturated blue roof tiles, restrained brass ornaments and subtle violet crystal accents. One principal tower, one arched entrance facing lower-left/front, visible right side. Clearly magical but compatible with the warm medieval village; no floating islands or giant glow clouds.

REQUESTED IMAGE: LEVEL 2 ONLY.
A taller circular tower with the SAME door, roof palette and stonework. Add a timber observation balcony on the right, a small attached study bay with two arched windows, a brass armillary instrument fixed to the balcony rail and two inset violet crystals. The central tower remains dominant; no detached structure.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 3 — `ancient_wizard_tower_lv3.png`

```text
SUBJECT FAMILY: ONE ancient wizard tower with weathered warm-grey stone, dark oak structural details, deep desaturated blue roof tiles, restrained brass ornaments and subtle violet crystal accents. One principal tower, one arched entrance facing lower-left/front, visible right side. Clearly magical but compatible with the warm medieval village; no floating islands or giant glow clouds.

REQUESTED IMAGE: LEVEL 3 ONLY.
A grand ancient master wizard's tower, taller and broader but on the SAME logical footprint. Add carved stone buttresses, a stepped upper observatory with an open brass armillary sphere, one small attached roof turret and richer blue roof detailing. Preserve the original entrance and major silhouette. Three small inset violet crystals provide restrained magic accents; no beams obscuring the stonework.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

### A2. Xưởng mộc & cưa gỗ

Module: **B**. Cả ba ảnh giữ cùng họ kiến trúc và cùng điểm neo.

#### Cấp 1 — `carpentry_sawmill_lv1.png`

```text
SUBJECT FAMILY: ONE integrated medieval carpentry and sawmill workshop. Warm oak framing, cream plaster, russet-red tiled roofing, warm-grey stone feet and iron hand tools. Main working bay faces lower-left/front, with visible right side. Show timber processing clearly, without modern powered machinery, workers or a separate logging yard.

REQUESTED IMAGE: LEVEL 1 ONLY.
A small open-front timber workshop under a simple pitched roof. One sturdy workbench, a hand saw hanging safely on the back wall, a small wood plane, two straight timber planks and three neatly stacked logs tucked against the right wall. One coherent compact shelter.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 2 — `carpentry_sawmill_lv2.png`

```text
SUBJECT FAMILY: ONE integrated medieval carpentry and sawmill workshop. Warm oak framing, cream plaster, russet-red tiled roofing, warm-grey stone feet and iron hand tools. Main working bay faces lower-left/front, with visible right side. Show timber processing clearly, without modern powered machinery, workers or a separate logging yard.

REQUESTED IMAGE: LEVEL 2 ONLY.
A larger enclosed timber workshop with an attached open-front cutting bay. Preserve the SAME roof colour, entrance position and workbench. Add a clearly supported large vertical frame saw with a taut straight blade, one log held on a timber cutting carriage, a rack of finished boards and a few chisels on the wall. No circular metal power saw.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 3 — `carpentry_sawmill_lv3.png`

```text
SUBJECT FAMILY: ONE integrated medieval carpentry and sawmill workshop. Warm oak framing, cream plaster, russet-red tiled roofing, warm-grey stone feet and iron hand tools. Main working bay faces lower-left/front, with visible right side. Show timber processing clearly, without modern powered machinery, workers or a separate logging yard.

REQUESTED IMAGE: LEVEL 3 ONLY.
A substantial two-storey master carpentry hall with a storage loft and a wide integrated saw bay. Retain the SAME frame-saw mechanism and facade orientation. Add a roof-mounted timber hoist for planks, reinforced oak braces, orderly board racks and a carefully finished door panel leaning inside the bay. Larger storage volume, not a sprawling industrial compound.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

### A3. Xưởng dệt vải

Module: **B**. Cả ba ảnh giữ cùng họ kiến trúc và cùng điểm neo.

#### Cấp 1 — `weaving_workshop_lv1.png`

```text
SUBJECT FAMILY: ONE medieval textile-weaving workshop in warm oak, cream plaster, russet-red tile and warm-grey stone. Main entrance faces lower-left/front; right side visible. Cream linen and muted indigo textiles distinguish the workshop. All equipment belongs inside the building or under an attached sheltered bay. No workers.

REQUESTED IMAGE: LEVEL 1 ONLY.
A small cottage workshop with one open front work bay containing a simple wooden hand loom. Show a clearly connected rectangular loom frame, parallel cream warp threads, a partially woven linen strip, one thread spool and a small wicker yarn basket. Simple roof and one shuttered window.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 2 — `weaving_workshop_lv2.png`

```text
SUBJECT FAMILY: ONE medieval textile-weaving workshop in warm oak, cream plaster, russet-red tile and warm-grey stone. Main entrance faces lower-left/front; right side visible. Cream linen and muted indigo textiles distinguish the workshop. All equipment belongs inside the building or under an attached sheltered bay. No workers.

REQUESTED IMAGE: LEVEL 2 ONLY.
A larger workshop with the SAME roof, loom orientation and textile colours. Add a wider enclosed weaving bay, one small wooden spinning wheel under an attached side roof, neatly rolled cream and indigo cloth, and two upper windows. Keep the spinning wheel small and mechanically connected, not windmill sails.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 3 — `weaving_workshop_lv3.png`

```text
SUBJECT FAMILY: ONE medieval textile-weaving workshop in warm oak, cream plaster, russet-red tile and warm-grey stone. Main entrance faces lower-left/front; right side visible. Cream linen and muted indigo textiles distinguish the workshop. All equipment belongs inside the building or under an attached sheltered bay. No workers.

REQUESTED IMAGE: LEVEL 3 ONLY.
A prosperous two-storey weaving hall with the SAME main entrance and textile identity. Add a high loft window with a short cloth hoist, two clearly separated hand looms visible beneath one broad open bay, orderly fabric rolls and a restrained indigo cloth panel hanging from a timber rail. Grand craftsmanship, without factory equipment or smokestacks.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

### A4. Xưởng bơ sữa

Module: **B**. Cả ba ảnh giữ cùng họ kiến trúc và cùng điểm neo.

#### Cấp 1 — `dairy_workshop_lv1.png`

```text
SUBJECT FAMILY: ONE clean medieval dairy workshop. Warm oak framing, cream plaster, russet-red tiled roofs, warm-grey stone foundations and restrained muted-blue shutter accents. Main entrance faces lower-left/front; visible right side. Butter, cheese, milk pails and wooden churns communicate the function. No cows, other animals or people.

REQUESTED IMAGE: LEVEL 1 ONLY.
A small neat dairy cottage with a sheltered front work niche. Include one lidded milk pail, one upright wooden butter churn with a correctly attached plunger, one pale-gold butter block on a small clean board and two modest cheese rounds on a shelf. No open food scattered on the ground.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 2 — `dairy_workshop_lv2.png`

```text
SUBJECT FAMILY: ONE clean medieval dairy workshop. Warm oak framing, cream plaster, russet-red tiled roofs, warm-grey stone foundations and restrained muted-blue shutter accents. Main entrance faces lower-left/front; visible right side. Butter, cheese, milk pails and wooden churns communicate the function. No cows, other animals or people.

REQUESTED IMAGE: LEVEL 2 ONLY.
A broader dairy workshop preserving the SAME door, roof colours and blue shutters. Add a sheltered side processing bay with two wooden churns, a compact cheese press with one screw and pressing board, three cheese rounds on slatted shelves and two closed milk pails. All equipment stays tucked into the building.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 3 — `dairy_workshop_lv3.png`

```text
SUBJECT FAMILY: ONE clean medieval dairy workshop. Warm oak framing, cream plaster, russet-red tiled roofs, warm-grey stone foundations and restrained muted-blue shutter accents. Main entrance faces lower-left/front; visible right side. Butter, cheese, milk pails and wooden churns communicate the function. No cows, other animals or people.

REQUESTED IMAGE: LEVEL 3 ONLY.
A substantial two-storey master dairy with an upper ventilated cheese-aging loft, small shuttered windows and a broad sheltered processing bay. Retain the SAME architectural family. Show one well-built cheese press, neatly aligned butter moulds, several readable cheese wheels on interior racks and three milk pails. Rich, tidy craftsmanship; no modern steel factory tanks.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

### A5. Nhà đất sét

Module: **B**. Cả ba ảnh giữ cùng họ kiến trúc và cùng điểm neo.

#### Cấp 1 — `clay_house_lv1.png`

```text
SUBJECT FAMILY: ONE inhabited medieval fantasy earthen house, not a clay factory or pottery workshop. Warm ochre adobe walls, rounded plastered corners, exposed oak lintels, small dark-timber details, a simple clay-tile roof and a low stone footing. Main door faces lower-left/front, visible right side. Preserve handmade earthen character across levels.

REQUESTED IMAGE: LEVEL 1 ONLY.
A small single-room adobe home with a low warm terracotta gable roof, one arched wooden door, one tiny shuttered window, a short attached stone threshold and one plain clay water jar tucked beside the wall. Humble, cosy proportions.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 2 — `clay_house_lv2.png`

```text
SUBJECT FAMILY: ONE inhabited medieval fantasy earthen house, not a clay factory or pottery workshop. Warm ochre adobe walls, rounded plastered corners, exposed oak lintels, small dark-timber details, a simple clay-tile roof and a low stone footing. Main door faces lower-left/front, visible right side. Preserve handmade earthen character across levels.

REQUESTED IMAGE: LEVEL 2 ONLY.
A larger adobe home with the SAME ochre walls, door position and terracotta roofing. Add one connected side room, two shuttered windows, a small timber entrance canopy and a narrow built-in flower box. Thicker adobe wall openings remain readable; no detached shed.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 3 — `clay_house_lv3.png`

```text
SUBJECT FAMILY: ONE inhabited medieval fantasy earthen house, not a clay factory or pottery workshop. Warm ochre adobe walls, rounded plastered corners, exposed oak lintels, small dark-timber details, a simple clay-tile roof and a low stone footing. Main door faces lower-left/front, visible right side. Preserve handmade earthen character across levels.

REQUESTED IMAGE: LEVEL 3 ONLY.
A handsome two-storey earthen residence with the SAME adobe palette and entrance. Add a timber-supported upper gallery recessed under the roof, rounded corner buttresses, a projecting upper bay and carefully layered terracotta tiles. Prosperous handcrafted clay architecture, not a stone castle or modern villa.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

### A6. Lều

Module: **B**. Cả ba ảnh giữ cùng họ kiến trúc và cùng điểm neo.

#### Cấp 1 — `canvas_tent_lv1.png`

```text
SUBJECT FAMILY: ONE medieval fantasy canvas tent with cream linen, warm honey-brown timber poles, dark rope ties, small wooden pegs and muted russet fabric edging. Entrance faces lower-left/front, right side visible. The tent itself is the subject: no campsite terrain, campfire, people or animals. No modern nylon, zippers or metal camping frames.

REQUESTED IMAGE: LEVEL 1 ONLY.
A small wedge-shaped A-frame tent with two supporting end poles, a taut ridge line and one triangular entrance flap tied back. A short rolled blanket is just visible inside. Two restrained guy ropes and their pegs attach plausibly near the canvas corners. Clearly a complete functional shelter.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 2 — `canvas_tent_lv2.png`

```text
SUBJECT FAMILY: ONE medieval fantasy canvas tent with cream linen, warm honey-brown timber poles, dark rope ties, small wooden pegs and muted russet fabric edging. Entrance faces lower-left/front, right side visible. The tent itself is the subject: no campsite terrain, campfire, people or animals. No modern nylon, zippers or metal camping frames.

REQUESTED IMAGE: LEVEL 2 ONLY.
A medium ridge tent with the SAME cream canvas and russet trim. Increase usable volume, add one compact attached entrance awning on two timber poles, neatly tied-back door flaps and a small closed wooden chest inside. Maintain a clean tent silhouette and coherent guy ropes.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 3 — `canvas_tent_lv3.png`

```text
SUBJECT FAMILY: ONE medieval fantasy canvas tent with cream linen, warm honey-brown timber poles, dark rope ties, small wooden pegs and muted russet fabric edging. Entrance faces lower-left/front, right side visible. The tent itself is the subject: no campsite terrain, campfire, people or animals. No modern nylon, zippers or metal camping frames.

REQUESTED IMAGE: LEVEL 3 ONLY.
A grand medieval pavilion with the SAME cream linen, russet trim and entrance orientation. A tall central timber mast supports a peaked roof over a broad rectangular tent body. Add reinforced seams, two short unmarked cloth pennants and an integrated entrance canopy. Remain one tent, not a cluster of tents or a circus marquee.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

### A7. Nhà dài gỗ Bắc Âu

Module: **B**. Cả ba ảnh giữ cùng họ kiến trúc và cùng điểm neo.

#### Cấp 1 — `nordic_longhouse_lv1.png`

```text
SUBJECT FAMILY: ONE Nordic timber longhouse adapted to the game's detailed medieval fantasy pixel style. Long rectangular oak walls, warm-grey stone footings, deep brown timber shingles, a steep continuous roof and restrained carved wooden gable ends. Door faces lower-left/front, long right wall visible. No snow base, Vikings, weapons or separate buildings.

REQUESTED IMAGE: LEVEL 1 ONLY.
A modest low timber longhouse with one strong shingled gable roof, heavy plank walls, one oak entrance, two tiny shuttered windows and a short stone threshold. Simple curved carved gable tips, no elaborate dragon sculpture.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 2 — `nordic_longhouse_lv2.png`

```text
SUBJECT FAMILY: ONE Nordic timber longhouse adapted to the game's detailed medieval fantasy pixel style. Long rectangular oak walls, warm-grey stone footings, deep brown timber shingles, a steep continuous roof and restrained carved wooden gable ends. Door faces lower-left/front, long right wall visible. No snow base, Vikings, weapons or separate buildings.

REQUESTED IMAGE: LEVEL 2 ONLY.
A longer and sturdier longhouse preserving the SAME roof tone, entrance orientation and timber wall language. Add a sheltered entrance porch, reinforced diagonal braces, three modest side windows and one small roof smoke vent. Keep the single elongated main roof dominant.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 3 — `nordic_longhouse_lv3.png`

```text
SUBJECT FAMILY: ONE Nordic timber longhouse adapted to the game's detailed medieval fantasy pixel style. Long rectangular oak walls, warm-grey stone footings, deep brown timber shingles, a steep continuous roof and restrained carved wooden gable ends. Door faces lower-left/front, long right wall visible. No snow base, Vikings, weapons or separate buildings.

REQUESTED IMAGE: LEVEL 3 ONLY.
A grand chieftain's timber longhouse with the SAME architectural identity. A taller central hall roof, a connected lower service bay at the rear, massive carved entrance posts, a compact covered front porch and richer interlaced gable carving. A restrained muted-blue woven cloth hangs beside the door without symbols or text. No fortress towers or weapons.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

### A8. Biệt thự Địa Trung Hải

Module: **B**. Cả ba ảnh giữ cùng họ kiến trúc và cùng điểm neo.

#### Cấp 1 — `mediterranean_villa_lv1.png`

```text
SUBJECT FAMILY: ONE medieval Mediterranean villa rendered in the SAME polished pixel-art style as the village. Warm ivory stucco, terracotta roof tiles, honey-brown timber shutters, pale warm-grey stone and muted olive-green accents. Entrance faces lower-left/front, right facade visible. Connected architecture only; no swimming pool, landscaped grounds or modern features.

REQUESTED IMAGE: LEVEL 1 ONLY.
A compact single-storey villa with an asymmetric terracotta gable roof, an arched oak entrance, two small shuttered windows and a narrow attached shaded porch supported by two pale stone columns. One terracotta planter with a small olive shrub stays close to the doorway.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 2 — `mediterranean_villa_lv2.png`

```text
SUBJECT FAMILY: ONE medieval Mediterranean villa rendered in the SAME polished pixel-art style as the village. Warm ivory stucco, terracotta roof tiles, honey-brown timber shutters, pale warm-grey stone and muted olive-green accents. Entrance faces lower-left/front, right facade visible. Connected architecture only; no swimming pool, landscaped grounds or modern features.

REQUESTED IMAGE: LEVEL 2 ONLY.
A refined two-storey villa with the SAME stucco, roof colour and entrance position. Add a small recessed upper loggia with two arches, a short iron balcony rail and one connected side room under a lower tiled roof. Restrained flowering window boxes, no courtyard ground slab.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 3 — `mediterranean_villa_lv3.png`

```text
SUBJECT FAMILY: ONE medieval Mediterranean villa rendered in the SAME polished pixel-art style as the village. Warm ivory stucco, terracotta roof tiles, honey-brown timber shutters, pale warm-grey stone and muted olive-green accents. Entrance faces lower-left/front, right facade visible. Connected architecture only; no swimming pool, landscaped grounds or modern features.

REQUESTED IMAGE: LEVEL 3 ONLY.
A spacious elegant two-storey villa with the SAME facade and roof family. Add a broad recessed arched loggia, a graceful corner bay, layered connected terracotta roof volumes, carved pale-stone door trim and a small attached entrance stair. Rich proportions and craftsmanship, without palace towers or sprawling gardens.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

### A9. Chùa gỗ

Module: **B**. Cả ba ảnh giữ cùng họ kiến trúc và cùng điểm neo.

#### Cấp 1 — `wooden_buddhist_temple_lv1.png`

```text
SUBJECT FAMILY: ONE serene East Asian wooden Buddhist temple, rendered with the SAME warm detailed pixel-art materials and upper-left lighting as the village. Dark oak columns, honey-brown joinery, cream wall panels, muted russet-brown ceramic roof tiles and warm-grey stone foundations. Roof ridges and horizontal beams follow the isometric axes; gently upturned eaves are allowed. Entrance faces lower-left/front. No people, writing or unrelated religious symbols.

REQUESTED IMAGE: LEVEL 1 ONLY.
A small single-hall timber temple with one gently upturned tiled roof, four sturdy front columns, a central wooden double door, two simple lattice windows and three short attached stone steps. Restrained carved timber brackets and two small warm lanterns beside the entrance. One roof tier only.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 2 — `wooden_buddhist_temple_lv2.png`

```text
SUBJECT FAMILY: ONE serene East Asian wooden Buddhist temple, rendered with the SAME warm detailed pixel-art materials and upper-left lighting as the village. Dark oak columns, honey-brown joinery, cream wall panels, muted russet-brown ceramic roof tiles and warm-grey stone foundations. Roof ridges and horizontal beams follow the isometric axes; gently upturned eaves are allowed. Entrance faces lower-left/front. No people, writing or unrelated religious symbols.

REQUESTED IMAGE: LEVEL 2 ONLY.
A larger timber worship hall preserving the SAME entrance, roof colour and joinery. Add a second offset roof tier directly above the central hall, deeper overhanging eaves, richer interlocking wooden brackets and a narrow attached veranda. Two lanterns remain near the original door. No separate pagoda.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

#### Cấp 3 — `wooden_buddhist_temple_lv3.png`

```text
SUBJECT FAMILY: ONE serene East Asian wooden Buddhist temple, rendered with the SAME warm detailed pixel-art materials and upper-left lighting as the village. Dark oak columns, honey-brown joinery, cream wall panels, muted russet-brown ceramic roof tiles and warm-grey stone foundations. Roof ridges and horizontal beams follow the isometric axes; gently upturned eaves are allowed. Entrance faces lower-left/front. No people, writing or unrelated religious symbols.

REQUESTED IMAGE: LEVEL 3 ONLY.
A majestic wooden temple hall with the SAME foundation and orientation. Three clearly separated diminishing roof tiers rise above one coherent central timber hall, supported by elegant bracket clusters. Add a broad attached veranda, carved oak entrance panels and short central stone stairs. Balanced, dignified architecture; no giant statue, detached gate or surrounding grounds.

One isolated connected building/shelter, not a comparison sheet.
Follow category B framing and ground rules. No people or animals.
```

## B. Một mẫu duy nhất cho mỗi mục — 27 ảnh

| Mục | File ảnh | Module |
|---|---|---|

| Phòng thí nghiệm giả kim | `alchemy_laboratory.png` | B |

| Thư viện hoàng gia | `royal_library.png` | B |

| Cổng thành tháp đôi | `twin_tower_gate.png` | B |

| Nhà kính hoàng gia | `royal_greenhouse.png` | B |

| Hải đăng cảng biển | `harbor_lighthouse.png` | B |

| Đường đá — đoạn thẳng | `stone_road_straight.png` | T |

| Ngã tư đường đá | `stone_road_crossroads.png` | T |

| Ngã ba đường đá | `stone_road_t_junction.png` | T |

| Góc chữ L đường đá | `stone_road_l_corner.png` | T |

| Cầu đá vòm | `arched_stone_bridge.png` | B |

| Giếng nước | `village_well.png` | B |

| Quầy hàng chợ | `market_stall.png` | B |

| Công viên cây cổ thụ | `ancient_tree_park.png` | V |

| Rừng thông xanh | `green_pine_grove.png` | V |

| Vườn hoa anh đào | `cherry_blossom_garden.png` | V |

| Cột đèn | `village_lamppost.png` | B |

| Tượng đài anh hùng | `hero_monument.png` | B |

| Xe hàng | `goods_cart.png` | B |

| Vườn hoa hồng | `rose_garden.png` | V |

| Kênh đào | `canal_straight.png` | T |

| Đồng cỏ hoa dại | `wildflower_meadow.png` | T |

| Suối | `stream_straight.png` | T |

| Núi băng hà | `glacier_mountain.png` | N |

| Hồ băng | `frozen_lake.png` | N |

| Cá voi | `whale.png` | A |

| Suối khoáng nóng | `hot_spring.png` | N |

| Đàn hồng hạc | `flamingo_flock.png` | A |

### B1. Phòng thí nghiệm giả kim — `alchemy_laboratory.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE distinctive medieval alchemy laboratory. A compact two-storey oak-and-cream building with a warm-grey stone ground floor, a steep desaturated teal tiled roof, a copper-capped chimney and one small glazed roof observatory. A sheltered front niche contains one coherent copper alembic: a vessel connected by a curved cooling tube to a receiving flask. Three small violet, amber and green glass bottles sit on an interior shelf, not floating outside. Arched oak door faces lower-left/front; visible right facade. A subtle warm window glow, restrained brass trim and a tiny hanging flask emblem without writing. No smoke cloud, explosions, wizard figures or detached equipment.

Follow category B, the shared style and true-alpha output rules.
```

### B2. Thư viện hoàng gia — `royal_library.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE grand royal library. A broad two-storey hall with warm-grey stone foundations, dark oak half-timbering, cream plaster, rich russet-red tiled roofs and one restrained central clerestory roof volume. The arched double entrance faces lower-left/front, with short attached stone steps; visible right facade. Tall narrow windows reveal hints of orderly bookcases and warm amber interiors. A small carved open-book emblem sits above the door, with two muted-blue banners carrying simple gold geometric trim and no writing. Emphasize dignified scholarly architecture and generous enclosed book storage. No outdoor book piles, exposed cutaway, clock tower or courtyard.

Follow category B, the shared style and true-alpha output rules.
```

### B3. Cổng thành tháp đôi — `twin_tower_gate.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE connected medieval town gate with EXACTLY TWO matching warm-grey stone towers, one on each side of a broad central arched passage. Russet-red conical tiled roofs, restrained crenellated stone shoulders beneath the roofs, dark oak doors hinged open against the passage and one raised iron portcullis held plausibly above the opening. A short stone wall section connects the towers over the arch; one simple muted-blue banner on each tower. Passage axis runs from lower-left/front toward upper-right/back. Keep actual alpha transparency through the empty passage. Towers meet one ground plane. No third tower, castle behind it, long city walls, road slab or people.

Follow category B, the shared style and true-alpha output rules.
```

### B4. Nhà kính hoàng gia — `royal_greenhouse.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE elegant royal greenhouse with a warm-grey stone knee wall, honey-brown timber framing, restrained dark iron ribs and a tall pitched glass roof with a modest central ventilation lantern. Wide glazed entrance faces lower-left/front; visible right side. Use clean pale blue-green glass panes, subtle discrete highlights and visible structural mullions rather than opaque glowing glass. A few orderly leafy plants and two citrus saplings in terracotta pots are visible inside, without overwhelming the architecture. The greenhouse is enclosed and intact, not a cutaway. Preserve true background alpha outside the structure; glazing may use controlled partial transparency. No surrounding garden, floating plants or giant tropical jungle.

Follow category B, the shared style and true-alpha output rules.
```

### B5. Hải đăng cảng biển — `harbor_lighthouse.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE tall handsome medieval coastal lighthouse. A slightly tapered warm-grey stone tower on a compact reinforced stone footing, with an oak arched door and three short attached steps facing lower-left/front. A small connected timber keeper's room sits against the visible right side beneath a russet-red tiled roof. At the top, one enclosed octagonal lantern chamber with brass framing, pale glass and a warm amber lamp, surrounded by a narrow dark iron gallery. A small red-tiled conical cap and weather vane finish the silhouette. Restrained dark-stone horizontal bands. No cliff, sea, island, dock, ships or giant projected light beam.

Follow category B, the shared style and true-alpha output rules.
```

### B6. Đường đá — đoạn thẳng — `stone_road_straight.png`

Module: **T**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE flat modular cobblestone road segment running between the NORTH-EAST and SOUTH-WEST tile edges. Use the exact shared TILE grid and road connector width. Irregular but neatly fitted warm-grey stone pavers with subtle warm sand-coloured joints; narrow flush edge stones, no raised curb or thick slab. The road reaches both connector edges without caps or barriers. The two unused tile corners remain fully transparent. Match the junction family's paver scale, colour and connector cross-section. No grass, dirt background, road markings, props or shadows.

Follow category T, the shared style and true-alpha output rules.
```

### B7. Ngã tư đường đá — `stone_road_crossroads.png`

Module: **T**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE flat FOUR-WAY cobblestone junction connecting NORTH-EAST, SOUTH-WEST, NORTH-WEST and SOUTH-EAST tile edges. Use the exact shared TILE grid and identical road connector width. One continuous paved central intersection, with four clean arms reaching the midpoint of their corresponding edges. Warm-grey cobbles, subtle warm sand joints and flush edge stones match the straight road. Unpaved corner regions remain transparent. No dead-end caps, centre island, painted lines, curb walls, grass or props.

Follow category T, the shared style and true-alpha output rules.
```

### B8. Ngã ba đường đá — `stone_road_t_junction.png`

Module: **T**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE flat THREE-WAY T-junction connecting NORTH-EAST, SOUTH-WEST and SOUTH-EAST tile edges. The NORTH-WEST connector is CLOSED, with a clean flush paved boundary instead of a fourth arm. Use the exact shared TILE grid and connector width. The road forms one continuous warm-grey cobblestone surface, matching the straight road and crossroads in paver scale, joint colour and flush edging. Unpaved areas are transparent. No fourth exit, road markings, barriers, grass or props.

Follow category T, the shared style and true-alpha output rules.
```

### B9. Góc chữ L đường đá — `stone_road_l_corner.png`

Module: **T**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE flat RIGHT-ANGLE cobblestone corner connecting NORTH-EAST and SOUTH-EAST tile edges only. In world-grid space this is a 90-degree turn; render it with the shared isometric axes, not as a screen-space square corner. Use the exact shared TILE grid and matching connector width. Warm-grey cobbles form one clean continuous bend with readable inside and outside boundaries. NORTH-WEST and SOUTH-WEST have no exits. Unpaved regions remain transparent. No extra road arms, grass, raised curb or props.

Follow category T, the shared style and true-alpha output rules.
```

### B10. Cầu đá vòm — `arched_stone_bridge.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE elegant single-span medieval stone bridge aligned along the NORTH-EAST to SOUTH-WEST isometric axis. A gently arched warm-grey cobblestone deck, two low stone parapets and one clearly readable open arch below, with restrained darker stone voussoirs. Both deck ends have matching width and reach one shared road elevation so separate road tiles can connect. The support feet descend coherently to one lower plane. Show the bridge as an isolated structure over transparent space: no baked water, riverbanks, earth platform or surrounding road. Keep the true arch opening transparent, not painted black. No people, carts or decorative towers.

Follow category B, the shared style and true-alpha output rules.
```

### B11. Giếng nước — `village_well.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE charming village water well. A low circular warm-grey stone wellhead with a small dark recessed water opening, two heavy oak uprights, one correctly connected horizontal winding spindle with rope and bucket, and a small russet-red tiled gable roof. A single wooden water pail rests close to the outer stone rim. Readable robust construction, warm clean stone and timber details. The bottom stone ring meets one ground plane near the horizontal centre. No giant paving disk, grass base, scattered buckets, people or surrounding landscape.

Follow category B, the shared style and true-alpha output rules.
```

### B12. Quầy hàng chợ — `market_stall.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE medieval produce market stall. A sturdy oak counter with four connected posts and a compact cream-and-muted-russet striped canvas awning. Three neat produce groups: red apples in a wooden crate, golden bread loaves in a basket and a few leafy vegetables on the counter. Two closed storage crates fit underneath. Counter faces lower-left/front with the right side visible. Keep all supports coherent, awning corners tied to the frame and merchandise readable at game scale. No vendor, shoppers, signs, prices, carts, road or ground tile.

Follow category B, the shared style and true-alpha output rules.
```

### B13. Công viên cây cổ thụ — `ancient_tree_park.png`

Module: **V**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE compact park decoration centred on a magnificent ancient oak tree. Thick warm-brown trunk, visible root flare and a broad layered olive-green canopy with strong readable foliage clusters. Add one simple curved timber bench and a small warm-grey stone birdbath tucked around the trunk, leaving the front trunk contact easy to identify. All contacts share one ground plane. One coherent park grouping, not a full landscape scene. No people, birds, enclosing fence, grass disk, paved plaza or soil slab; the game's own terrain will show between the objects.

Follow category V, the shared style and true-alpha output rules.
```

### B14. Rừng thông xanh — `green_pine_grove.png`

Module: **V**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE compact decorative grove of EXACTLY FIVE evergreen pine trees. One tall central pine, two medium pines and two smaller edge pines form a balanced staggered cluster. Layered triangular needle boughs in muted deep-green and olive-green, warm-brown upright trunks visible near their bases. Consistent isometric ground placement and upper-left lighting, with enough gaps to read individual trees. All trunk feet lie on one shared virtual ground plane. Keep the entire grove inside the transparent margins. No snowy trees, forest floor, grass base, rocks, wildlife or background forest.

Follow category V, the shared style and true-alpha output rules.
```

### B15. Vườn hoa anh đào — `cherry_blossom_garden.png`

Module: **V**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE compact cherry-blossom garden grouping with EXACTLY THREE ornamental cherry trees: one taller central tree and two smaller side trees. Graceful dark-brown branches, abundant soft pink and cream blossom clusters, sparse fresh green leaves. Add one modest timber bench beneath the open side of the canopy and a few individually readable fallen petals close to the trunks. This is a blossom decoration, not the harvestable fruit-cherry plant family. No fruit, people, pagoda, grass disk, paved garden or terrain slab. Preserve transparent space between branches, trunks and bench.

Follow category V, the shared style and true-alpha output rules.
```

### B16. Cột đèn — `village_lamppost.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE elegant medieval village lamppost. A slender dark wrought-iron upright on a compact warm-grey stone foot, one gently curved bracket and ONE hanging four-sided lantern with brass trim, pale amber glass and a warm contained light. A small decorative iron scroll below the bracket adds character without clutter. Entire post is upright, lantern coherently attached and fully visible. No second lamp head, modern electric cable, giant glow halo, ground lighting disk, paving, plants or scenery.

Follow category B, the shared style and true-alpha output rules.
```

### B17. Tượng đài anh hùng — `hero_monument.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE dignified medieval hero monument: a clearly inanimate carved warm-grey stone statue on a compact rectangular stone plinth. The heroic figure wears a simple cloak and rests both hands on the pommel of a downward-pointing sheathed sword, with coherent arms and proportions. Subtle weathering, strong readable silhouette and restrained carved trim. A small bronze laurel relief without writing decorates the plinth. Treat the statue and plinth as one integrated object. No living person, horse, other figures, oversized square plaza, text plaque or surrounding landscape.

Follow category B, the shared style and true-alpha output rules.
```

### B18. Xe hàng — `goods_cart.png`

Module: **B**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE stationary medieval two-wheeled goods handcart. Honey-brown oak bed, two equal wooden spoked wheels on one correctly connected axle, dark iron wheel rims and two long forward shafts. Cart axis points toward lower-left/front; visible right side. Load it neatly with two closed crates, one barrel and two tied burlap sacks, secured inside the cart bed. Warm timber detail and clean readable mechanics. Wheels share one ground plane; shafts do not intersect cargo. No horse, donkey, driver, modern parts, detached wheels or road.

Follow category B, the shared style and true-alpha output rules.
```

### B19. Vườn hoa hồng — `rose_garden.png`

Module: **V**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE compact ornamental rose-garden decoration. Three lush rounded rose shrubs arranged as a balanced isometric grouping: two rich crimson-red flowering shrubs and one soft cream-pink flowering shrub, with dark and olive-green leaf clusters. A small curved oak trellis supports a few attached climbing stems behind the centre shrub. Keep individual rose heads readable rather than noisy dots. Stems meet the common ground plane; no visible roots underground. No gardener, insects, broad soil bed, lawn disk, path, enclosing fence or terrain platform.

Follow category V, the shared style and true-alpha output rules.
```

### B20. Kênh đào — `canal_straight.png`

Module: **T**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE straight engineered medieval canal module running between NORTH-EAST and SOUTH-WEST tile edges. Use the exact shared TILE grid, water-channel width and connector alignment. Clear blue-green water with a few crisp pale-blue ripple clusters, contained by two narrow warm-grey stone retaining edges. Both water ends remain open at their connector edges with no cross-wall, dam or end cap. Matching water level and bank width at both ends. Unused tile corners stay transparent. No bridge, boat, reeds, scenery, thick terrain slab or cast shadow.

Follow category T, the shared style and true-alpha output rules.
```

### B21. Đồng cỏ hoa dại — `wildflower_meadow.png`

Module: **T**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE flat full-diamond meadow ground tile using the exact shared TILE grid. Cover the diamond with soft muted yellow-olive grass, slightly more golden than pure green. Add sparse readable small clusters of cream daisies, soft yellow wildflowers and a few muted lavender flowers, with short grass blades. Ground remains the dominant colour, not a dense flower carpet. Match opposite edges in base colour and grass density so repetitions blend without an obvious border. Flat ground only, no exposed soil thickness, rock, tree, fence, raised platform, hard outline or external shadow. Alpha outside the diamond.

Follow category T, the shared style and true-alpha output rules.
```

### B22. Suối — `stream_straight.png`

Module: **T**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE natural stream module connecting NORTH-EAST and SOUTH-WEST tile edges on the exact shared TILE grid. A gently meandering clear blue stream with the SAME centred connector positions and water width as its endpoints. Small rounded warm-grey bank stones and a few short olive-green reeds stay close to the irregular banks. Endpoints remain open, with matching water level and no rock blocking the flow. Use discrete turquoise and pale-blue ripple clusters, not photorealistic reflections. Unused ground around the narrow banks is transparent. No waterfall, bridge, fish, forest scene or thick soil slab.

Follow category T, the shared style and true-alpha output rules.
```

### B23. Núi băng hà — `glacier_mountain.png`

Module: **N**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE compact glacier-covered mountain landmark, shown from the shared isometric camera. A dominant rugged cool-grey rocky peak and one smaller attached shoulder, thick pale-blue glacial ice descending through a cleft, white snow shelves and readable stepped blue ice faces. Balance cool colours with the game's crisp warm outlined pixel language; use discrete shading without glossy transparent crystal rendering. Keep one connected mountain mass with a coherent irregular foot. The lowest natural rock and ice form its base, not a floating island pedestal. No surrounding landscape, sky, clouds, lake, animals or huge snow ground disk.

Follow category N, the shared style and true-alpha output rules.
```

### B24. Hồ băng — `frozen_lake.png`

Module: **N**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE shallow frozen-lake environmental patch with a clean irregular oval outline projected onto the shared isometric ground plane. Pale blue ice, a few restrained darker blue branching cracks and subtle white frost clusters. A narrow natural rim of low snow and several small grey stones hugs the shoreline; no thick pedestal underneath. One small darker translucent ice area near the far edge, without an open deep hole. Alpha outside the lake and narrow rim. No surrounding winter landscape, trees, skating figures, animals, mountain backdrop or external shadow.

Follow category N, the shared style and true-alpha output rules.
```

### B25. Cá voi — `whale.png`

Module: **A**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE friendly blue-grey whale at the ocean surface, isolated for placement over a separate sea layer. One coherent full animal with a broad rounded head, pale cream throat and underside, two correctly attached pectoral flippers, a tapered body and horizontal tail flukes. A humpback-inspired form with restrained throat grooves and a low dorsal hump. Body axis points toward lower-left/front, right side visible. Show enough of the full silhouette to read head, flippers and tail; keep all parts in frame. Mouth closed, calm dark eye. No water patch, splash, spout, bubbles, ocean horizon, sea platform, rider or other animals.

Follow category A, the shared style and true-alpha output rules.
```

### B26. Suối khoáng nóng — `hot_spring.png`

Module: **N**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE compact natural hot-spring pool. An irregular oval turquoise pool projected onto the shared isometric plane, enclosed by a low closely fitted ring of warm-grey rocks with subtle cream mineral deposits. Discrete pale-cyan ripples indicate warm clear water. EXACTLY TWO small restrained pale steam wisps rise above the back edge, with partial alpha fading cleanly into transparency. Pool, stones and steam form one isolated decoration. Keep the low shoreline grounded, without a thick earth block. No people, bathhouse, towels, trees, mountain scenery, broad ground slab or giant fog cloud.

Follow category N, the shared style and true-alpha output rules.
```

### B27. Đàn hồng hạc — `flamingo_flock.png`

Module: **A**.

```text
REQUESTED IMAGE: ONE FINISHED DESIGN ONLY. No upgrade variants.

ONE coordinated flock sprite containing EXACTLY FIVE adult flamingos on a common virtual shallow-water plane. Warm coral-pink bodies, slightly darker folded wing tips, pale pink necks, curved black-tipped bills and slender darker pink legs. Three birds stand on two legs and two rest on one leg with the other leg correctly folded; necks form varied gentle S-curves. Stagger them in a compact isometric grouping with gaps between silhouettes, most facing lower-left/front. Correctly attached wings and legs, no merged birds. No water, ripples, shore, reeds, nests, chicks, sky or other animals. True alpha between every bird and leg.

Follow category A, the shared style and true-alpha output rules.
```

## C. Cây ăn trái — 8 loại × 5 giai đoạn = 40 ảnh

| Cây | Cây con | Cây lớn còn non | Trổ hoa | Kết trái chín | Cây héo |
|---|---|---|---|---|---|

| Cây táo | `apple_tree_seedling.png` | `apple_tree_young.png` | `apple_tree_flowering.png` | `apple_tree_fruiting.png` | `apple_tree_withered.png` |

| Dừa | `coconut_palm_seedling.png` | `coconut_palm_young.png` | `coconut_palm_flowering.png` | `coconut_palm_fruiting.png` | `coconut_palm_withered.png` |

| Me | `tamarind_tree_seedling.png` | `tamarind_tree_young.png` | `tamarind_tree_flowering.png` | `tamarind_tree_fruiting.png` | `tamarind_tree_withered.png` |

| Ca cao | `cacao_tree_seedling.png` | `cacao_tree_young.png` | `cacao_tree_flowering.png` | `cacao_tree_fruiting.png` | `cacao_tree_withered.png` |

| Cherry / cheri | `cherry_tree_seedling.png` | `cherry_tree_young.png` | `cherry_tree_flowering.png` | `cherry_tree_fruiting.png` | `cherry_tree_withered.png` |

| Berry — việt quất | `blueberry_bush_seedling.png` | `blueberry_bush_young.png` | `blueberry_bush_flowering.png` | `blueberry_bush_fruiting.png` | `blueberry_bush_withered.png` |

| Sầu riêng | `durian_tree_seedling.png` | `durian_tree_young.png` | `durian_tree_flowering.png` | `durian_tree_fruiting.png` | `durian_tree_withered.png` |

| Cam | `orange_tree_seedling.png` | `orange_tree_young.png` | `orange_tree_flowering.png` | `orange_tree_fruiting.png` | `orange_tree_withered.png` |

### C1. Cây táo

Module: **P**. Giữ chung gốc cây tại **(512,896)**; không phóng cây con bằng cây trưởng thành.

#### 1. Cây con — `apple_tree_seedling.png`

```text
SPECIES IDENTITY: ONE orchard apple tree with a short warm-brown branching trunk, a rounded spreading crown and oval serrated leaves in muted olive and fresh green. A recognizable trunk fork leans slightly to the right. Preserve that same fork and rounded canopy identity across the five stages.

REQUESTED IMAGE: SEEDLING STAGE ONLY.
A small rooted apple seedling, about 25 percent of the mature tree height, with one thin upright stem and six small oval serrated green leaves. No woody crown, flowers or fruit. Do not enlarge it to fill the canvas.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 2. Cây lớn còn non — `apple_tree_young.png`

```text
SPECIES IDENTITY: ONE orchard apple tree with a short warm-brown branching trunk, a rounded spreading crown and oval serrated leaves in muted olive and fresh green. A recognizable trunk fork leans slightly to the right. Preserve that same fork and rounded canopy identity across the five stages.

REQUESTED IMAGE: YOUNG STAGE ONLY.
A young apple sapling, about 60 percent of mature height, with a slim woody trunk, the first right-leaning fork and three sparse leafy branches. No flowers or fruit.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 3. Trổ hoa — `apple_tree_flowering.png`

```text
SPECIES IDENTITY: ONE orchard apple tree with a short warm-brown branching trunk, a rounded spreading crown and oval serrated leaves in muted olive and fresh green. A recognizable trunk fork leans slightly to the right. Preserve that same fork and rounded canopy identity across the five stages.

REQUESTED IMAGE: FLOWERING STAGE ONLY.
A full-sized healthy apple tree with the established right-leaning trunk fork and rounded green canopy. Several readable clusters of small white blossoms with soft pink centres sit among the leaves. No ripe apples; flowering is the only reproductive cue.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 4. Kết trái chín — `apple_tree_fruiting.png`

```text
SPECIES IDENTITY: ONE orchard apple tree with a short warm-brown branching trunk, a rounded spreading crown and oval serrated leaves in muted olive and fresh green. A recognizable trunk fork leans slightly to the right. Preserve that same fork and rounded canopy identity across the five stages.

REQUESTED IMAGE: FRUITING STAGE ONLY.
The SAME mature apple tree and branch structure, now carrying a moderate number of clearly attached round red apples with tiny stem dimples. Foliage remains healthy and green. Remove the prominent blossom clusters; fruit should be visible between leaf masses, not scattered on the ground.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 5. Cây héo — `apple_tree_withered.png`

```text
SPECIES IDENTITY: ONE orchard apple tree with a short warm-brown branching trunk, a rounded spreading crown and oval serrated leaves in muted olive and fresh green. A recognizable trunk fork leans slightly to the right. Preserve that same fork and rounded canopy identity across the five stages.

REQUESTED IMAGE: WITHERED STAGE ONLY.
The SAME mature apple tree in a visibly withered state. Preserve trunk height and main fork; reveal more of its bare branch structure. Sparse curled ochre-brown leaves remain attached, with two small shrivelled dark-brown apples. No healthy green foliage, fresh blossoms, loose fruit piles or chopped stump.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

### C2. Dừa

Module: **P**. Giữ chung gốc cây tại **(512,896)**; không phóng cây con bằng cây trưởng thành.

#### 1. Cây con — `coconut_palm_seedling.png`

```text
SPECIES IDENTITY: ONE coconut palm with a slender gently curved ringed tan trunk, long arching feather-like green fronds and a single crown at the top. Preserve the same slight leftward trunk curve and crown orientation throughout the lifecycle. Coconuts grow attached in clusters immediately beneath the crown, never along the lower trunk.

REQUESTED IMAGE: SEEDLING STAGE ONLY.
A newly sprouted coconut palm, about 25 percent of mature height, with a small partially visible attached brown seed husk at the stem base and three narrow young green strap-like leaves. No tall trunk, fruit clusters or flowers.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 2. Cây lớn còn non — `coconut_palm_young.png`

```text
SPECIES IDENTITY: ONE coconut palm with a slender gently curved ringed tan trunk, long arching feather-like green fronds and a single crown at the top. Preserve the same slight leftward trunk curve and crown orientation throughout the lifecycle. Coconuts grow attached in clusters immediately beneath the crown, never along the lower trunk.

REQUESTED IMAGE: YOUNG STAGE ONLY.
A young coconut palm, about 60 percent of mature height, with a short ringed tan trunk, the developing leftward curve and five arching feather-like fronds. No coconut clusters or flowers.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 3. Trổ hoa — `coconut_palm_flowering.png`

```text
SPECIES IDENTITY: ONE coconut palm with a slender gently curved ringed tan trunk, long arching feather-like green fronds and a single crown at the top. Preserve the same slight leftward trunk curve and crown orientation throughout the lifecycle. Coconuts grow attached in clusters immediately beneath the crown, never along the lower trunk.

REQUESTED IMAGE: FLOWERING STAGE ONLY.
A mature tall coconut palm with the established curved trunk and full frond crown. One modest cream-yellow branching flower spadix emerges just below the crown from a split green sheath. No large coconuts yet; keep the flower structure small and readable.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 4. Kết trái chín — `coconut_palm_fruiting.png`

```text
SPECIES IDENTITY: ONE coconut palm with a slender gently curved ringed tan trunk, long arching feather-like green fronds and a single crown at the top. Preserve the same slight leftward trunk curve and crown orientation throughout the lifecycle. Coconuts grow attached in clusters immediately beneath the crown, never along the lower trunk.

REQUESTED IMAGE: FRUITING STAGE ONLY.
The SAME mature coconut palm, with two compact clusters of full-sized yellow-green mature coconuts attached directly beneath the crown. Show their smooth fibrous outer husks; these are on-tree coconuts, not dehusked brown supermarket shells. Healthy arching fronds; no prominent flowers.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 5. Cây héo — `coconut_palm_withered.png`

```text
SPECIES IDENTITY: ONE coconut palm with a slender gently curved ringed tan trunk, long arching feather-like green fronds and a single crown at the top. Preserve the same slight leftward trunk curve and crown orientation throughout the lifecycle. Coconuts grow attached in clusters immediately beneath the crown, never along the lower trunk.

REQUESTED IMAGE: WITHERED STAGE ONLY.
The SAME mature coconut palm, visibly withered, retaining its curved ringed trunk and single crown position. Most fronds are dry ochre-brown, collapsed and hanging downward; a few dry frond bases remain near the top. No healthy green crown, large coconut clusters, fallen-frond carpet or broken trunk.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

### C3. Me

Module: **P**. Giữ chung gốc cây tại **(512,896)**; không phóng cây con bằng cây trưởng thành.

#### 1. Cây con — `tamarind_tree_seedling.png`

```text
SPECIES IDENTITY: ONE tamarind tree with a sturdy textured brown trunk, a low spreading branch structure and an airy rounded crown made of small paired pinnate leaflets. Preserve the same broad left branch and finer right branch in all mature stages. Avoid large apple-like leaves or green bean-vine anatomy.

REQUESTED IMAGE: SEEDLING STAGE ONLY.
A tamarind seedling, about 25 percent of mature height, with a thin stem and three delicate compound leaf sprays containing tiny paired green leaflets. No pods, flowers or mature trunk.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 2. Cây lớn còn non — `tamarind_tree_young.png`

```text
SPECIES IDENTITY: ONE tamarind tree with a sturdy textured brown trunk, a low spreading branch structure and an airy rounded crown made of small paired pinnate leaflets. Preserve the same broad left branch and finer right branch in all mature stages. Avoid large apple-like leaves or green bean-vine anatomy.

REQUESTED IMAGE: YOUNG STAGE ONLY.
A young tamarind sapling, about 60 percent of mature height, with a slim woody trunk, an emerging broad left branch and several airy compound leaf sprays. No flowers or pods.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 3. Trổ hoa — `tamarind_tree_flowering.png`

```text
SPECIES IDENTITY: ONE tamarind tree with a sturdy textured brown trunk, a low spreading branch structure and an airy rounded crown made of small paired pinnate leaflets. Preserve the same broad left branch and finer right branch in all mature stages. Avoid large apple-like leaves or green bean-vine anatomy.

REQUESTED IMAGE: FLOWERING STAGE ONLY.
A mature spreading tamarind tree with the established branches and fine paired green leaflets. Add a few readable clusters of small pale-yellow flowers with subtle warm-red centres among the foliage. No mature brown pods.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 4. Kết trái chín — `tamarind_tree_fruiting.png`

```text
SPECIES IDENTITY: ONE tamarind tree with a sturdy textured brown trunk, a low spreading branch structure and an airy rounded crown made of small paired pinnate leaflets. Preserve the same broad left branch and finer right branch in all mature stages. Avoid large apple-like leaves or green bean-vine anatomy.

REQUESTED IMAGE: FRUITING STAGE ONLY.
The SAME mature tamarind tree with a moderate number of curved, slightly irregular tan-brown ripe pods hanging beneath outer branches. Pods have softly segmented bulges and short attached stalks; they are not long green beans. Healthy fine green foliage, no prominent flowers or detached pods.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 5. Cây héo — `tamarind_tree_withered.png`

```text
SPECIES IDENTITY: ONE tamarind tree with a sturdy textured brown trunk, a low spreading branch structure and an airy rounded crown made of small paired pinnate leaflets. Preserve the same broad left branch and finer right branch in all mature stages. Avoid large apple-like leaves or green bean-vine anatomy.

REQUESTED IMAGE: WITHERED STAGE ONLY.
The SAME mature tamarind tree with bare branching increasingly visible, sparse dry ochre compound leaf sprays and two shrivelled dark-brown pods still attached. Preserve the mature trunk and broad branch spread. No lush green foliage, fresh flowers or fruit piles.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

### C4. Ca cao

Module: **P**. Giữ chung gốc cây tại **(512,896)**; không phóng cây con bằng cây trưởng thành.

#### 1. Cây con — `cacao_tree_seedling.png`

```text
SPECIES IDENTITY: ONE cacao tree with a relatively short warm-brown trunk, several low upright branches and a layered crown of large elongated pointed dark-green leaves. Flowers and pods attach directly to the main trunk and thicker branches, not to the outer leaf tips. Preserve the same low branching scaffold across mature stages.

REQUESTED IMAGE: SEEDLING STAGE ONLY.
A cacao seedling, about 25 percent of mature height, with a thin stem and four elongated pointed leaves. The newest leaf is muted copper-green; older leaves are deeper green. No pods, flowers or thick trunk.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 2. Cây lớn còn non — `cacao_tree_young.png`

```text
SPECIES IDENTITY: ONE cacao tree with a relatively short warm-brown trunk, several low upright branches and a layered crown of large elongated pointed dark-green leaves. Flowers and pods attach directly to the main trunk and thicker branches, not to the outer leaf tips. Preserve the same low branching scaffold across mature stages.

REQUESTED IMAGE: YOUNG STAGE ONLY.
A young cacao sapling, about 60 percent of mature height, with a slim woody stem, two low branches and a small layered canopy of large elongated leaves. One copper-toned young leaf is allowed. No flowers or pods.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 3. Trổ hoa — `cacao_tree_flowering.png`

```text
SPECIES IDENTITY: ONE cacao tree with a relatively short warm-brown trunk, several low upright branches and a layered crown of large elongated pointed dark-green leaves. Flowers and pods attach directly to the main trunk and thicker branches, not to the outer leaf tips. Preserve the same low branching scaffold across mature stages.

REQUESTED IMAGE: FLOWERING STAGE ONLY.
A mature cacao tree with the established low branches and full elongated-leaf canopy. Small restrained clusters of pale cream-pink flowers emerge directly from the exposed main trunk and thick branches. Keep the trunk visible enough to read this attachment. No mature pods.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 4. Kết trái chín — `cacao_tree_fruiting.png`

```text
SPECIES IDENTITY: ONE cacao tree with a relatively short warm-brown trunk, several low upright branches and a layered crown of large elongated pointed dark-green leaves. Flowers and pods attach directly to the main trunk and thicker branches, not to the outer leaf tips. Preserve the same low branching scaffold across mature stages.

REQUESTED IMAGE: FRUITING STAGE ONLY.
The SAME mature cacao tree with several clearly attached ripe orange-gold cacao pods directly on the trunk and thicker branches. Each pod is elongated, oval and visibly longitudinally ridged. Dark-green foliage stays healthy. No pods at leaf tips, opened chocolate bars, prominent flowers or loose pods.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 5. Cây héo — `cacao_tree_withered.png`

```text
SPECIES IDENTITY: ONE cacao tree with a relatively short warm-brown trunk, several low upright branches and a layered crown of large elongated pointed dark-green leaves. Flowers and pods attach directly to the main trunk and thicker branches, not to the outer leaf tips. Preserve the same low branching scaffold across mature stages.

REQUESTED IMAGE: WITHERED STAGE ONLY.
The SAME mature cacao tree with the trunk and low branch scaffold preserved, many leaves missing and the remaining elongated leaves curled ochre-brown. Two dark shrivelled ridged pods remain attached to thick wood. No healthy green canopy, fresh flowers or produce on the ground.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

### C5. Cherry / cheri

Module: **P**. Giữ chung gốc cây tại **(512,896)**; không phóng cây con bằng cây trưởng thành.

#### 1. Cây con — `cherry_tree_seedling.png`

```text
SPECIES IDENTITY: ONE fruit-producing sweet cherry orchard tree, with a slender warm-brown trunk, a light spreading crown and oval finely serrated green leaves. Preserve one distinctive Y-shaped main fork. This is a harvestable fruit tree, separate from the ornamental cherry-blossom garden decoration.

REQUESTED IMAGE: SEEDLING STAGE ONLY.
A cherry seedling, about 25 percent of mature height, with a thin upright stem and five small oval serrated leaves. No flowers, cherries or full crown.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 2. Cây lớn còn non — `cherry_tree_young.png`

```text
SPECIES IDENTITY: ONE fruit-producing sweet cherry orchard tree, with a slender warm-brown trunk, a light spreading crown and oval finely serrated green leaves. Preserve one distinctive Y-shaped main fork. This is a harvestable fruit tree, separate from the ornamental cherry-blossom garden decoration.

REQUESTED IMAGE: YOUNG STAGE ONLY.
A young cherry sapling, about 60 percent of mature height, with a slender woody trunk, the first Y-shaped fork and a sparse green canopy. No blossoms or fruit.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 3. Trổ hoa — `cherry_tree_flowering.png`

```text
SPECIES IDENTITY: ONE fruit-producing sweet cherry orchard tree, with a slender warm-brown trunk, a light spreading crown and oval finely serrated green leaves. Preserve one distinctive Y-shaped main fork. This is a harvestable fruit tree, separate from the ornamental cherry-blossom garden decoration.

REQUESTED IMAGE: FLOWERING STAGE ONLY.
A mature cherry tree with the established Y-shaped fork and spreading leafy crown, covered in several clear white blossoms with faint pink centres. Retain substantial green foliage instead of a purely pink ornamental cloud. No ripe cherries.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 4. Kết trái chín — `cherry_tree_fruiting.png`

```text
SPECIES IDENTITY: ONE fruit-producing sweet cherry orchard tree, with a slender warm-brown trunk, a light spreading crown and oval finely serrated green leaves. Preserve one distinctive Y-shaped main fork. This is a harvestable fruit tree, separate from the ornamental cherry-blossom garden decoration.

REQUESTED IMAGE: FRUITING STAGE ONLY.
The SAME mature fruit cherry tree carrying readable pairs and small groups of glossy-looking but discretely shaded deep-red cherries, each attached by slender stems beneath leaf clusters. Keep green foliage and the same branch spread. No prominent blossom masses or detached fruit.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 5. Cây héo — `cherry_tree_withered.png`

```text
SPECIES IDENTITY: ONE fruit-producing sweet cherry orchard tree, with a slender warm-brown trunk, a light spreading crown and oval finely serrated green leaves. Preserve one distinctive Y-shaped main fork. This is a harvestable fruit tree, separate from the ornamental cherry-blossom garden decoration.

REQUESTED IMAGE: WITHERED STAGE ONLY.
The SAME mature cherry tree with the Y-shaped fork exposed, sparse curled ochre-brown leaves and two small shrivelled dark cherries on attached stems. Preserve the mature size and branch positions. No healthy green crown or fresh flowers.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

### C6. Berry — việt quất

Module: **P**. Giữ chung gốc cây tại **(512,896)**; không phóng cây con bằng cây trưởng thành.

#### 1. Cây con — `blueberry_bush_seedling.png`

```text
SPECIES IDENTITY: ONE cultivated blueberry bush, not a tall tree and not a strawberry plant. Multiple slender woody brown stems rise from one root crown into a compact rounded shrub with small oval green leaves. Preserve the same multi-stem base and rounded branching silhouette throughout the mature stages.

REQUESTED IMAGE: SEEDLING STAGE ONLY.
A small blueberry seedling, about 25 percent of mature shrub height, with two delicate short shoots and six tiny oval green leaves. No berries, flowers or large woody branches.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 2. Cây lớn còn non — `blueberry_bush_young.png`

```text
SPECIES IDENTITY: ONE cultivated blueberry bush, not a tall tree and not a strawberry plant. Multiple slender woody brown stems rise from one root crown into a compact rounded shrub with small oval green leaves. Preserve the same multi-stem base and rounded branching silhouette throughout the mature stages.

REQUESTED IMAGE: YOUNG STAGE ONLY.
A young blueberry bush, about 60 percent of mature shrub height, with three slender woody stems and a sparse rounded leafy shape. No fruit or flowers; keep the same shared root crown.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 3. Trổ hoa — `blueberry_bush_flowering.png`

```text
SPECIES IDENTITY: ONE cultivated blueberry bush, not a tall tree and not a strawberry plant. Multiple slender woody brown stems rise from one root crown into a compact rounded shrub with small oval green leaves. Preserve the same multi-stem base and rounded branching silhouette throughout the mature stages.

REQUESTED IMAGE: FLOWERING STAGE ONLY.
A mature compact blueberry bush with the established multiple stems and rounded green foliage. Several small clusters of cream-white bell-shaped flowers hang beneath twig tips. No ripe blue berries; keep the bell-like blossoms readable.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 4. Kết trái chín — `blueberry_bush_fruiting.png`

```text
SPECIES IDENTITY: ONE cultivated blueberry bush, not a tall tree and not a strawberry plant. Multiple slender woody brown stems rise from one root crown into a compact rounded shrub with small oval green leaves. Preserve the same multi-stem base and rounded branching silhouette throughout the mature stages.

REQUESTED IMAGE: FRUITING STAGE ONLY.
The SAME mature blueberry bush bearing attached clusters of plump dusty deep-blue berries with a tiny star-shaped calyx visible on a few near-facing fruits. Healthy green oval leaves, same stem layout and canopy size. No prominent blossoms, strawberry fruit or detached berries.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 5. Cây héo — `blueberry_bush_withered.png`

```text
SPECIES IDENTITY: ONE cultivated blueberry bush, not a tall tree and not a strawberry plant. Multiple slender woody brown stems rise from one root crown into a compact rounded shrub with small oval green leaves. Preserve the same multi-stem base and rounded branching silhouette throughout the mature stages.

REQUESTED IMAGE: WITHERED STAGE ONLY.
The SAME mature blueberry bush with exposed fine woody stems, sparse curled rust-brown leaves and a few shrivelled dark berries still attached. Retain the rounded branching outline and common root crown. No lush green foliage, fresh flowers or berry piles.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

### C7. Sầu riêng

Module: **P**. Giữ chung gốc cây tại **(512,896)**; không phóng cây con bằng cây trưởng thành.

#### 1. Cây con — `durian_tree_seedling.png`

```text
SPECIES IDENTITY: ONE compact orchard durian tree with a straight sturdy brown trunk, tiered spreading branches and elongated pointed green leaves with muted warm-gold undersides. Preserve a clearly visible lower trunk and two strong lateral branches. Flowers and heavy fruits attach to substantial branches, not fragile leaf tips.

REQUESTED IMAGE: SEEDLING STAGE ONLY.
A durian seedling, about 25 percent of mature height, with a slender stem and four elongated pointed leaves; show a restrained golden underside on one tilted leaf. No fruit, flowers or exposed seed.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 2. Cây lớn còn non — `durian_tree_young.png`

```text
SPECIES IDENTITY: ONE compact orchard durian tree with a straight sturdy brown trunk, tiered spreading branches and elongated pointed green leaves with muted warm-gold undersides. Preserve a clearly visible lower trunk and two strong lateral branches. Flowers and heavy fruits attach to substantial branches, not fragile leaf tips.

REQUESTED IMAGE: YOUNG STAGE ONLY.
A young durian sapling, about 60 percent of mature height, with a slim straight woody trunk, two emerging lateral branches and an airy canopy of elongated green leaves. No flowers or fruit.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 3. Trổ hoa — `durian_tree_flowering.png`

```text
SPECIES IDENTITY: ONE compact orchard durian tree with a straight sturdy brown trunk, tiered spreading branches and elongated pointed green leaves with muted warm-gold undersides. Preserve a clearly visible lower trunk and two strong lateral branches. Flowers and heavy fruits attach to substantial branches, not fragile leaf tips.

REQUESTED IMAGE: FLOWERING STAGE ONLY.
A mature compact durian tree with the established tiered branches. Several small clusters of cream pendant flower buds and a few open pale blossoms hang from thicker inner branches. Keep their attachments visible between leaves. No large spiky fruits.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 4. Kết trái chín — `durian_tree_fruiting.png`

```text
SPECIES IDENTITY: ONE compact orchard durian tree with a straight sturdy brown trunk, tiered spreading branches and elongated pointed green leaves with muted warm-gold undersides. Preserve a clearly visible lower trunk and two strong lateral branches. Flowers and heavy fruits attach to substantial branches, not fragile leaf tips.

REQUESTED IMAGE: FRUITING STAGE ONLY.
The SAME mature durian tree with three to five full-sized olive-green ripe durians, each an oval fruit covered in readable blunt triangular spikes, hanging on short stout stalks from strong branches. Fruits stay green to muted yellow-green, not bright orange. Healthy elongated leaves, no prominent flower clusters, split fruit or detached durians.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 5. Cây héo — `durian_tree_withered.png`

```text
SPECIES IDENTITY: ONE compact orchard durian tree with a straight sturdy brown trunk, tiered spreading branches and elongated pointed green leaves with muted warm-gold undersides. Preserve a clearly visible lower trunk and two strong lateral branches. Flowers and heavy fruits attach to substantial branches, not fragile leaf tips.

REQUESTED IMAGE: WITHERED STAGE ONLY.
The SAME mature durian tree with trunk and strong lateral branches preserved, sparse drooping ochre-brown elongated leaves and one small shrivelled dark spiky fruit still attached. No healthy green crown, fresh flowers, ripe-fruit pile or broken branches.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

### C8. Cam

Module: **P**. Giữ chung gốc cây tại **(512,896)**; không phóng cây con bằng cây trưởng thành.

#### 1. Cây con — `orange_tree_seedling.png`

```text
SPECIES IDENTITY: ONE compact orchard orange tree with a short brown branching trunk, a dense rounded crown and small oval dark-green leaves. Preserve the same slightly right-leaning trunk and low fork throughout mature stages. Fruit is round orange citrus attached individually to woody twigs.

REQUESTED IMAGE: SEEDLING STAGE ONLY.
An orange seedling, about 25 percent of mature height, with one short stem and five small fresh-green oval leaves. No oranges, blossoms or mature trunk.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 2. Cây lớn còn non — `orange_tree_young.png`

```text
SPECIES IDENTITY: ONE compact orchard orange tree with a short brown branching trunk, a dense rounded crown and small oval dark-green leaves. Preserve the same slightly right-leaning trunk and low fork throughout mature stages. Fruit is round orange citrus attached individually to woody twigs.

REQUESTED IMAGE: YOUNG STAGE ONLY.
A young orange sapling, about 60 percent of mature height, with a slim woody trunk, a low developing fork and a sparse rounded leafy crown. No flowers or fruit.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 3. Trổ hoa — `orange_tree_flowering.png`

```text
SPECIES IDENTITY: ONE compact orchard orange tree with a short brown branching trunk, a dense rounded crown and small oval dark-green leaves. Preserve the same slightly right-leaning trunk and low fork throughout mature stages. Fruit is round orange citrus attached individually to woody twigs.

REQUESTED IMAGE: FLOWERING STAGE ONLY.
A mature rounded orange tree with the established trunk and branch layout. Several distinct clusters of small white five-petalled citrus flowers with tiny warm-yellow centres appear among the dark-green leaves. No ripe oranges; flowering is the defining cue.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 4. Kết trái chín — `orange_tree_fruiting.png`

```text
SPECIES IDENTITY: ONE compact orchard orange tree with a short brown branching trunk, a dense rounded crown and small oval dark-green leaves. Preserve the same slightly right-leaning trunk and low fork throughout mature stages. Fruit is round orange citrus attached individually to woody twigs.

REQUESTED IMAGE: FRUITING STAGE ONLY.
The SAME mature orange tree bearing a moderate number of full-sized rich golden-orange fruits attached between dark-green leaf clusters. A few fruits show small stem-end dimples. Preserve crown size and branch layout. No prominent blossoms, peeled segments, lemons or fallen fruit.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

#### 5. Cây héo — `orange_tree_withered.png`

```text
SPECIES IDENTITY: ONE compact orchard orange tree with a short brown branching trunk, a dense rounded crown and small oval dark-green leaves. Preserve the same slightly right-leaning trunk and low fork throughout mature stages. Fruit is round orange citrus attached individually to woody twigs.

REQUESTED IMAGE: WITHERED STAGE ONLY.
The SAME mature orange tree with the low fork visible, sparse curled ochre-brown leaves and two dark shrivelled citrus fruits still attached. Preserve mature trunk size and broad crown scaffold. No lush green foliage, fresh flowers or ripe oranges on the ground.

One isolated plant. Keep the shared root anchor and canvas scale.
Follow category P; no other lifecycle stages in this image.
```

## Kiểm tra trước khi tích hợp

- Đủ **94 PNG riêng** đúng tên; không tạo ảnh tổng hợp nhiều cấp/giai đoạn.

- Cả bộ giữ cùng góc nhìn, hướng sáng và mức chi tiết; PNG có alpha thật.

- Ba cấp cùng công trình có chung điểm tiếp đất và kiến trúc; tăng độ phát triển có chủ ý.

- Cây con nhỏ thật; cây ra hoa, ra trái và héo giữ thân/cành chính, không đổi vị trí gốc. Berry luôn là bụi thấp; dừa luôn là cây thân đơn với tán ở ngọn.

- Đường thẳng/ngã tư/ngã ba/góc L khớp đầu nối; thử ghép lặp kiểm tra khe và mép. Kênh/suối mở hai đầu, không có tường chắn ngang.

- Nền cỏ có sắc xanh hơi ngả vàng, không viền khối đất. Mặt nước/ice chỉ có ở đúng các mục cần nó.

- Cá voi không có nền biển; hồng hạc đúng năm con, tách chân rõ, không gộp hình. Tượng anh hùng là tượng đá, không phải người sống.

- Giữ PNG nguồn. Điểm neo và kích thước yêu cầu trong prompt là mục tiêu; kiểm tra ảnh thực tế và căn geometry khi đưa vào game.

