# Prompt hạt giống và cây trồng — 3 giai đoạn sinh trưởng

Bộ prompt cho cây trồng trong game pixel art isometric, đồng bộ góc nhìn, ánh sáng và tông màu với bộ công trình hiện tại. Tham khảo màu cây xanh của [ART_STYLE_FOREST_PACK.md](ART_STYLE_FOREST_PACK.md), nhưng dùng style chuyên cho cây trồng bên dưới, không dùng nguyên các ràng buộc về nhà/công trình.

## Số ảnh cần tạo

- **1 ảnh hạt vừa gieo dùng chung**, phủ lên lớp đất riêng: `seed_shared.png`.
- **16 mục cây/biến thể × 3 ảnh**: **mầm → non → chín/thu hoạch**.
- **Tổng cộng: 49 ảnh PNG riêng**, không ghép các giai đoạn vào một ảnh.
- Tên file: `<tên_cây>_sprout.png`, `<tên_cây>_grow.png`, `<tên_cây>_ripe.png`.
- “Dưa leo” và “dưa chuột” thường là hai tên gọi của cùng một cây. Tài liệu giữ cả hai mục theo yêu cầu, phân biệt thành **dưa leo quả dài leo giàn** và **dưa chuột quả ngắn mọc bụi**.
- “Củ cải” được hiểu là **củ cải trắng**. “Lê” là **cây lê lùn**, không phải bụi rau. Với nấm, “mầm” là **nấm kim/primordia**, không phải chồi có lá.
- Ảnh hạt giống dùng cho **giai đoạn vừa gieo trên luống**, chỉ vẽ hạt, nền trong suốt để ghép lên đất có sẵn. Không vẽ túi hạt giống hoặc biểu tượng cửa hàng. Mẫu riêng lúa mì ở phần duyệt bên dưới là ảnh bổ sung ngoài bộ 49 ảnh cơ sở.

## Cách dùng

1. Dán **STYLE CHUNG** vào system/style prompt của model ảnh.
2. Chọn đúng **một** prompt ảnh hạt giống hoặc **một giai đoạn của một cây**.
3. Dán **NEGATIVE PROMPT CHUNG** vào ô negative; nếu không có ô riêng, thêm cuối prompt với nhãn `Avoid:`.
4. Tạo mỗi ảnh riêng, giữ nguyên khung và điểm neo. Nếu dùng một ảnh giai đoạn khác làm tham chiếu, chỉ dùng ảnh của chính cây đó do bạn tạo để khóa góc nhìn, màu và hình dáng.
5. Kiểm tra PNG có alpha thật; nền đen/trắng hoặc ô caro nhìn thấy trong ảnh không được vẽ thành nền.

---

## STYLE CHUNG — dùng cho toàn bộ 49 ảnh

```text
You are creating transparent pixel-art sprites for a medieval isometric
farming town-builder game.

ART DIRECTION
Match a warm, polished fantasy pixel-art game: crisp stepped edges,
readable silhouettes, clustered details and restrained material shading.
Keep the plants compatible with the game's timber-and-stone buildings
and muted olive-green terrain. Preserve clean native-resolution detail;
do not turn the image into a coarse low-resolution mosaic or enlarge
artificial pixel blocks. No photographic texture, painterly brushwork,
smooth gradients, blur or glossy 3D rendering.

CAMERA AND LIGHT
Use the same strict 2:1 dimetric isometric camera for every sprite.
Show the plant in a three-quarter view, with upright stems remaining vertical.
Visible ground-aligned structures follow the same isometric axes.
Light comes from the upper-left. Use discrete colour steps and a fine,
consistent dark-green or warm dark-brown outline.
Plant anatomy should remain organic, not forced into diamond-shaped leaves.

CANVAS AND GROUND ANCHOR
Output exactly 1024x1024 PNG with genuine transparent alpha.
The virtual ground-contact anchor is always at (512,896).
The stem base, root crown, fungal contact area or lowest attached
harvest-ready plant base meets this anchor.
Draw upward from that point. Leave transparent margins on every side;
keep the whole sprite inside x=128..896 and y=96..896.
The virtual footprint is one tile, but DO NOT draw the footprint itself.
No soil, terrain diamond, planting bed, grass base or cast shadow.
Only the plant and explicitly requested support structure are visible.

THREE-STAGE CONTINUITY
Create only the requested stage: SPROUT, YOUNG or RIPE/HARVEST-READY.
Keep the same species, camera, lighting, root position, leaf language
and colour choices across its three images.
SPROUT is about 25-35% of that species' ripe height.
YOUNG is about 55-70% of that species' ripe height.
RIPE is the complete harvest-ready form.
Naturally low-growing crops become wider and fuller rather than tall.
Different species may have different mature heights.
Do not zoom in on a seedling to make it fill the frame.
Do not resize each stage independently to the same visible height.
If a young plant has a trellis or stake, retain that same structure
in the ripe image. Do not add supports unless the crop prompt asks for them.

PALETTE
Use a controlled, coherent palette with a few discrete shades per material.
Leaf greens: #1e4615 #32571d #4b6c2e #6d8740 #8aa355 #aabd68.
Wood and brown caps: #855c22 #8a3c24 #9e5333 #e0ac6c.
Straw and golden crops: #e6dfa1 #e8cd97 #ccb45c #ba9745.
Cream-white petals, roots and stems: #e6dfa1 #c9c8bd.
Red fruit accents: #b83b32 #d85b42.
Orange crop accents: #d67b2f #efa64a.
Purple grape accents: #624574 #9371a6.
Use fruit accents only when appropriate to that crop and stage.
Keep each accent identical across that species' growth images.

COMPOSITION
One isolated plant or one compact naturally connected crop clump.
No multi-plant field, loose harvested produce pile, presentation board
or growth-stage comparison sheet.
Root vegetables stay planted: show only the specified exposed shoulder
or upper bulb, never a fully uprooted vegetable with dangling roots.
No text, labels, numbers, watermark, logo or border.

SOWN SEED OVERLAY
For seed prompts only, show the visible seeds immediately after sowing,
before germination. Only the grains are visible; they lie flat on the
invisible soil plane. No pouch, sack, seed packet or inventory emblem.
Keep the same pixel-art direction, camera, lighting and transparent canvas.
Arrange the small separate grains in four parallel rows on one virtual
2:1 isometric tile, with transparent gaps between every grain.
The tile's diamond, soil and furrows are NOT drawn.
Unlike plant stages, this overlay uses a ground-plane layout centred in
the canvas; the single-root anchor and growth-height rules do not apply.
Use an elongated kernel with a small crease for wheat; other species may
use their own seed shapes when individual seed overlays are added.
```

## NEGATIVE PROMPT CHUNG — dùng cho toàn bộ 49 ảnh

```text
photorealistic, photographic texture, glossy 3D render, plastic material,
painterly brushwork, smooth gradients, soft blur, anti-aliased fuzzy edges,
coarse mosaic, artificial oversized pixel blocks, noisy dithering,
micro-detail clutter, neon colours, glowing aura, dramatic lighting,
inconsistent camera, perspective distortion, frontal side-view,
flat top-down icon, fisheye,
background scene, sky, soil mound, dirt patch, terrain tile, ground diamond,
raised planter, planting bed, grass base, pot, cast shadow,
fully drawn crop field, orchard scene, unrelated plants, detached harvest pile,
fully uprooted vegetables, dangling exposed roots,
unrequested props, people, animals, buildings, fences,
all growth stages in one image, sprite sheet, collage, split panels,
cropped leaves, cropped fruit, cropped canopy, cut-off supports,
inconsistent root anchor, seedling enlarged to mature size,
text, labels, lettering, numbers, watermark, logo, border,
opaque black background, opaque white background, painted checkerboard
```

> Nụ, hoa, quả, lá và giàn chỉ xuất hiện khi prompt của giai đoạn yêu cầu. Negative chung không cấm toàn bộ hoa/quả vì hướng dương, dâu tây và cây chín cần chúng.

---

## Hạt vừa gieo dùng chung — `seed_shared.png`

```text
One transparent game overlay of twelve small freshly sown tan seeds,
before germination. Four parallel rows of three seeds on an invisible
1x1 farmland tile. The rows follow a strict 2:1 isometric axis, sloping
one vertical unit per two horizontal units, with wide transparent gaps.
The complete grain arrangement is low and wide, centred in the canvas.
Draw only the seeds, each lying flat on the invisible ground plane.
Warm upper-left light, crisp pixel-art edges, restrained beige/ochre/brown
palette, fine dark-brown outline and simple readable seed silhouettes.
No soil, terrain diamond, furrows, dirt clumps, cast shadow, bag, pouch,
packet, emblem, sprouts, leaves, roots, text or background.
Output 1024x1024 PNG with genuinely transparent alpha between and around
all seeds. The existing soil layer will be composited separately in game.
```

---

## Hạt giống riêng từng loại — mẫu đang duyệt

Bộ 49 ảnh phía trên dùng một lớp hạt vừa gieo chung. Phần này bổ sung mẫu hạt gieo riêng cho lúa mì để duyệt phong cách trước khi tạo các loại còn lại.

### Lúa mì vừa gieo — `wheat_sown_preview_v2.png`

Chỉ có các hạt lúa mì nhỏ, dài, màu vàng be, có rãnh giữa, nằm trên mặt phẳng đất vô hình. Xếp bốn hàng theo góc isometric 2:1, mỗi hàng ba hạt, để ghép lên luống có sẵn. Không có túi, bao, bông lúa, mầm, đất hoặc bóng đổ.

- [Bộ prompt tạo và chỉnh ảnh](generated-assets/wheat_sown_prompt_v2.txt).
- [Ảnh mẫu](../assets-source/crop-seeds/wheat_sown_preview_v2.png), tạo bằng công cụ imagegen tích hợp. Bản gốc nhận được là **1254×1254 RGBA**, giữ nguyên để duyệt, dù prompt yêu cầu 1024×1024.
- Đây là **giai đoạn vừa gieo**, trước `wheat_sprout.png`, `wheat_grow.png` và `wheat_ripe.png`. Ảnh túi hạt cũ không dùng cho giai đoạn này.

---

## Danh sách tên file

| # | Cây / biến thể | Mầm | Non | Chín / thu hoạch |
|---|---|---|---|---|
| 1 | Lúa mì | `wheat_sprout.png` | `wheat_grow.png` | `wheat_ripe.png` |
| 2 | Cà rốt | `carrot_sprout.png` | `carrot_grow.png` | `carrot_ripe.png` |
| 3 | Củ cải trắng | `radish_sprout.png` | `radish_grow.png` | `radish_ripe.png` |
| 4 | Cà chua | `tomato_sprout.png` | `tomato_grow.png` | `tomato_ripe.png` |
| 5 | Nấm | `mushroom_sprout.png` | `mushroom_grow.png` | `mushroom_ripe.png` |
| 6 | Hoa hướng dương | `sunflower_sprout.png` | `sunflower_grow.png` | `sunflower_ripe.png` |
| 7 | Củ hành | `onion_sprout.png` | `onion_grow.png` | `onion_ripe.png` |
| 8 | Ớt | `chili_sprout.png` | `chili_grow.png` | `chili_ripe.png` |
| 9 | Dưa leo — giống quả dài | `cucumber_sprout.png` | `cucumber_grow.png` | `cucumber_ripe.png` |
| 10 | Dưa chuột — giống quả ngắn | `cucumber_pickling_sprout.png` | `cucumber_pickling_grow.png` | `cucumber_pickling_ripe.png` |
| 11 | Bí ngô | `pumpkin_sprout.png` | `pumpkin_grow.png` | `pumpkin_ripe.png` |
| 12 | Nho | `grapes_sprout.png` | `grapes_grow.png` | `grapes_ripe.png` |
| 13 | Bắp / ngô | `corn_sprout.png` | `corn_grow.png` | `corn_ripe.png` |
| 14 | Xà lách | `lettuce_sprout.png` | `lettuce_grow.png` | `lettuce_ripe.png` |
| 15 | Dâu tây | `strawberry_sprout.png` | `strawberry_grow.png` | `strawberry_ripe.png` |
| 16 | Lê — cây ăn quả lùn | `pear_sprout.png` | `pear_grow.png` | `pear_ripe.png` |

---

## 01. Lúa mì

### Mầm — `wheat_sprout.png`

```text
Crop species: wheat.
Requested growth stage: SPROUT.
One tiny wheat seedling clump, just emerged. Two or three narrow fresh-green grass blades rise from one tight root point; the tallest blade is only about one quarter of the ripe wheat height. Small upright V-shaped silhouette. No seed heads, grain, flowers or yellow dry stalks.
```

### Non — `wheat_grow.png`

```text
Requested crop: wheat.
Requested growth stage: YOUNG.
One young wheat clump at the same root anchor. Several slender green tillers with long blade-shaped leaves; a few short immature green ears are beginning to form. Roughly two thirds of the ripe height, visibly fuller than the sprout but still predominantly green. No golden ripe grain or harvested bundles.
```

### Chín / thu hoạch — `wheat_ripe.png`

```text
Requested crop: wheat.
Requested growth stage: RIPE / HARVEST-READY.
One harvest-ready wheat clump with three prominent golden grain ears on upright straw-coloured stalks, a few shorter side stalks and narrow remaining leaves. The heavy ears bend slightly outward, with chunky readable grain segments. Use warm pale gold and ochre highlights. Keep every stalk connected to the same root area; no tied sheaf or cut wheat.
```

---

## 02. Cà rốt

### Mầm — `carrot_sprout.png`

```text
Crop species: carrot.
Requested growth stage: SPROUT.
One tiny carrot seedling at the shared ground anchor. Two small smooth cotyledons and the first delicate divided green true leaf. Keep the silhouette low, sparse and recognizably young. No visible orange carrot, mature foliage or exposed roots.
```

### Non — `carrot_grow.png`

```text
Requested crop: carrot.
Requested growth stage: YOUNG.
One growing carrot plant with a fuller fan of finely divided, feathery green leaves. Short central stems converge at the same root point. The root remains visually hidden; at most a tiny muted orange neck at the leaf base. About two thirds of the ripe foliage size. No harvested carrot or detached vegetables.
```

### Chín / thu hoạch — `carrot_ripe.png`

```text
Requested crop: carrot.
Requested growth stage: RIPE / HARVEST-READY.
One harvest-ready carrot plant with a lush fan of feathery green foliage. Show the broad orange shoulder and a short upper portion of a single thick carrot directly beneath the leaves, as it would protrude slightly above the invisible soil line. Orange accents #d67b2f and #efa64a. Do not display a fully pulled-out carrot or dangling root.
```

---

## 03. Củ cải trắng

### Mầm — `radish_sprout.png`

```text
Crop species: white radish.
Requested growth stage: SPROUT.
One tiny white-radish seedling. Two rounded green cotyledons on very short stems, with the first slightly toothed true leaf appearing between them. Compact low silhouette at the ground anchor. No enlarged root, flowers or mature leaf crown.
```

### Non — `radish_grow.png`

```text
Requested crop: white radish.
Requested growth stage: YOUNG.
One young white-radish plant with an open rosette of broad green leaves, lightly lobed and toothed at the edges. Leaves lean outward from one central root neck. Larger than the sprout but not a dense lettuce head. No prominent white root yet and no harvested vegetables.
```

### Chín / thu hoạch — `radish_ripe.png`

```text
Requested crop: white radish.
Requested growth stage: RIPE / HARVEST-READY.
One harvest-ready white radish plant with a vigorous crown of broad lobed green leaves. A creamy-white upper root shoulder with a faint green neck protrudes above the invisible ground plane. Show only the upper third of the root, attached to the foliage; the lower root is not exposed. Make it clearly different from an orange carrot or a golden onion.
```

---

## 04. Cà chua

### Mầm — `tomato_sprout.png`

```text
Crop species: tomato.
Requested growth stage: SPROUT.
One tiny tomato seedling with two small oval cotyledons and one emerging serrated true leaf. Thin short green stem rooted at the common anchor. A compact upright silhouette, with no flowers, fruits, wooden stake or mature branching.
```

### Non — `tomato_grow.png`

```text
Requested crop: tomato.
Requested growth stage: YOUNG.
One young tomato bush with several branching green stems and distinct serrated compound leaves. Add one simple short wooden support stake, a few small yellow star-shaped flowers and one tiny unripe green tomato. Keep the bush about two thirds of its ripe size. No red fruit.
```

### Chín / thu hoạch — `tomato_ripe.png`

```text
Requested crop: tomato.
Requested growth stage: RIPE / HARVEST-READY.
One compact ripe tomato bush, retaining the young plant's wooden stake and branching structure. Three or four clearly visible round red tomatoes hang in front of dark green serrated leaves. Red accents #b83b32 and #d85b42, with small hard-edged highlights. Fruits remain attached to the stems. No basket, detached tomatoes or sprawling garden scene.
```

---

## 05. Nấm

### Mầm — `mushroom_sprout.png`

```text
Crop species: edible brown mushrooms.
Requested growth stage: SPROUT.
One tiny cluster of three mushroom pins emerging from the same small contact area. Short creamy stalks with minute rounded brown cap tips. These are fungal primordia, NOT a leafy seedling: absolutely no leaves, grass blades or flower buds. No soil mound, cultivation log or container.
```

### Non — `mushroom_grow.png`

```text
Requested crop: edible brown mushrooms.
Requested growth stage: YOUNG.
One young cluster of three edible brown mushrooms. Their short pale stalks support small tightly closed button-shaped caps; the largest cap is still rounded and not fully expanded. Keep the same cluster arrangement and contact points as the pin stage. No leaves, roots, red caps or white polka dots.
```

### Chín / thu hoạch — `mushroom_ripe.png`

```text
Requested crop: edible brown mushrooms.
Requested growth stage: RIPE / HARVEST-READY.
One harvest-ready cluster of three edible brown mushrooms with clearly expanded rounded caps and sturdy creamy stems. One large cap with two smaller companion caps, all attached at their original contact area. Warm muted brown shading and pale cap edges. No leaves, red toadstools, poison symbols, logs or surrounding ground.
```

---

## 06. Hoa hướng dương

### Mầm — `sunflower_sprout.png`

```text
Crop species: sunflower.
Requested growth stage: SPROUT.
One small sunflower seedling. Two broad oval cotyledons and the first pair of slightly heart-shaped green true leaves on a short sturdy stem. Keep the ground anchor fixed and the plant much shorter than its final height. No flower head, yellow petals or large central seed disk.
```

### Non — `sunflower_grow.png`

```text
Requested crop: sunflower.
Requested growth stage: YOUNG.
One young sunflower plant with a taller upright green stem, several broad heart-shaped leaves and one closed green flower bud at the top. About two thirds of the ripe height. The bud is clearly present but the yellow petals have not opened. No additional side flowers or mature seed head.
```

### Chín / thu hoạch — `sunflower_ripe.png`

```text
Requested crop: sunflower.
Requested growth stage: RIPE / HARVEST-READY.
One ripe sunflower plant with one large fully opened flower head facing slightly toward the viewer. Golden yellow petals surround a dark warm-brown seed disk, with a few broad green leaves on the upright stem. Use chunky seed-disk texture, not hundreds of tiny noisy dots. Keep the head attached to the stem; no cut bouquet or scattered seeds.
```

---

## 07. Củ hành

### Mầm — `onion_sprout.png`

```text
Crop species: onion.
Requested growth stage: SPROUT.
One tiny onion seedling with two slender tubular green shoots, one slightly bent at its tip. A small pale neck meets the common ground anchor. Sparse upright silhouette. No enlarged onion bulb, broad leaves, flowers or harvested produce.
```

### Non — `onion_grow.png`

```text
Requested crop: onion.
Requested growth stage: YOUNG.
One young onion plant with a small fan of upright hollow green leaves. A narrow pale bulb neck is just starting to swell at the base, but the plant is still mainly foliage. About two thirds of the final leaf height. No large golden bulb or dry papery skins.
```

### Chín / thu hoạch — `onion_ripe.png`

```text
Requested crop: onion.
Requested growth stage: RIPE / HARVEST-READY.
One mature golden onion, rooted in place, with a rounded swollen bulb partly exposed above the invisible ground line. Its upper leaves bend naturally outward, with a few slightly ochre drying tips to indicate harvest readiness. Use #ba9745 and #e8cd97 for papery golden layers. No detached onion, cut rings or long exposed root hairs.
```

---

## 08. Ớt

### Mầm — `chili_sprout.png`

```text
Crop species: chili pepper.
Requested growth stage: SPROUT.
One tiny chili pepper seedling with two narrow oval cotyledons and one small pointed true leaf. Short upright green stem and a small, open silhouette. No pepper fruits, flowers, support cage or mature bush.
```

### Non — `chili_grow.png`

```text
Requested crop: chili pepper.
Requested growth stage: YOUNG.
One young chili pepper bush with several slim branching stems and pointed smooth green leaves. Include two tiny pale flowers and one short immature green chili. The bush is about two thirds of its ripe size. Do not use tomato-like serrated leaves or round red fruit.
```

### Chín / thu hoạch — `chili_ripe.png`

```text
Requested crop: chili pepper.
Requested growth stage: RIPE / HARVEST-READY.
One compact mature chili bush carrying three or four slender red chilies, gently curved with pointed tips. Retain narrow green leaves and the same branching habit as the young plant. Use #b83b32 and #d85b42 for the ripe fruits. Every chili stays attached; no detached peppers, bowls or tomato-shaped fruits.
```

---

## 09. Dưa leo — giống quả dài

### Mầm — `cucumber_sprout.png`

```text
Crop species: long climbing cucumber.
Requested growth stage: SPROUT.
One long-cucumber seedling with two broad rounded cotyledons and the first coarse, slightly lobed true leaf. A short green stem rises from the shared ground anchor. No trellis, mature fruit or extended creeping vines.
```

### Non — `cucumber_grow.png`

```text
Requested crop: long climbing cucumber.
Requested growth stage: YOUNG.
One growing long-cucumber vine beginning to climb a small simple wooden trellis made of two posts and one upper crossbar. Broad coarse green leaves and two small yellow flowers. Keep all vine growth within one virtual tile. The trellis remains identical in the ripe stage. No large cucumbers yet.
```

### Chín / thu hoạch — `cucumber_ripe.png`

```text
Requested crop: long climbing cucumber.
Requested growth stage: RIPE / HARVEST-READY.
One compact trellised long-cucumber vine with broad lobed green leaves and two or three long slender dark-green cucumbers hanging visibly in front. Fruits have a few restrained lighter green pixel marks, not dense photorealistic bumps. Keep the same small trellis as the young stage. No short stocky pickling cucumbers, detached vegetables or large garden rows.
```

---

## 10. Dưa chuột — giống quả ngắn

### Mầm — `cucumber_pickling_sprout.png`

```text
Crop species: short bush cucumber.
Requested growth stage: SPROUT.
One compact bush-cucumber seedling with two broad cotyledons and one small rough-edged true leaf. Keep the stem shorter and the growth habit lower than the long-cucumber variant. One shared root point, no trellis, flowers or fruit.
```

### Non — `cucumber_pickling_grow.png`

```text
Requested crop: short bush cucumber.
Requested growth stage: YOUNG.
One young low-growing bush-cucumber plant with a compact cluster of coarse lobed green leaves, short vines tucked close to its root area and two small yellow flowers. No trellis. Keep the footprint narrow and contained, clearly different from the climbing long-cucumber variant. No ripe fruits.
```

### Chín / thu hoạch — `cucumber_pickling_ripe.png`

```text
Requested crop: short bush cucumber.
Requested growth stage: RIPE / HARVEST-READY.
One low compact bush-cucumber plant with three short thick green cucumbers nestled visibly among its leaves. Rounded blunt fruit ends and a few bold lighter green pixel bumps distinguish this pickling-type variant from the long slender cucumber. Fruits remain connected to short vines, with no trellis, basket or detached produce.
```

---

## 11. Bí ngô

### Mầm — `pumpkin_sprout.png`

```text
Crop species: pumpkin.
Requested growth stage: SPROUT.
One pumpkin seedling with two large oval cotyledons and one tiny emerging lobed true leaf on a short thick green stem. Low compact silhouette at the common anchor. No pumpkin fruit, sprawling vine, flowers or giant mature leaves.
```

### Non — `pumpkin_grow.png`

```text
Requested crop: pumpkin.
Requested growth stage: YOUNG.
One growing pumpkin vine with several broad lobed green leaves, a short curling tendril and one small yellow flower. The vine bends around its root area while staying within one virtual tile. A tiny green developing fruit may sit beneath a leaf. No orange ripe pumpkin.
```

### Chín / thu hoạch — `pumpkin_ripe.png`

```text
Requested crop: pumpkin.
Requested growth stage: RIPE / HARVEST-READY.
One harvest-ready pumpkin vine with one large round orange pumpkin resting at the ground anchor, visibly attached to a short thick vine. Give the pumpkin broad readable ribs, a stout curved stem and two or three supporting lobed leaves. Orange accents #d67b2f and #efa64a. No carved face, detached pumpkin pile or long vines outside the tile.
```

---

## 12. Nho

### Mầm — `grapes_sprout.png`

```text
Crop species: grapevine.
Requested growth stage: SPROUT.
One tiny grapevine seedling with a short green-to-brown stem and two small broadly lobed green leaves. A single root anchor and an upright, sparse silhouette. No trellis, grape clusters, mature woody trunk or vineyard scenery.
```

### Non — `grapes_grow.png`

```text
Requested crop: grapevine.
Requested growth stage: YOUNG.
One young grapevine trained onto a small simple wooden support with two posts and one crossbar. A slim woody stem branches into broad lobed green leaves and short curling tendrils. Keep the support frame unchanged for the ripe stage. No ripe purple grape clusters.
```

### Chín / thu hoạch — `grapes_ripe.png`

```text
Requested crop: grapevine.
Requested growth stage: RIPE / HARVEST-READY.
One compact mature grapevine on the same small wooden support, bearing two or three clearly visible hanging purple grape clusters. Use a few large readable berry clusters rather than many tiny realistic spheres. Broad lobed green leaves frame the fruit without hiding it. Purple accents #624574 and #9371a6. No detached grapes, wine bottles, baskets or vineyard rows.
```

---

## 13. Bắp / ngô

### Mầm — `corn_sprout.png`

```text
Crop species: corn.
Requested growth stage: SPROUT.
One tiny corn seedling with two or three narrow pointed spear-like leaves growing from a short central stem. Fresh green colour and a compact upright silhouette. No corn ears, tassels, yellow kernels or mature broad foliage.
```

### Non — `corn_grow.png`

```text
Requested crop: corn.
Requested growth stage: YOUNG.
One young corn plant with a visible upright stem and several long arching blade-shaped leaves. About two thirds of its ripe height, with healthy green foliage and a developing central shoot. No exposed yellow kernels or full mature ears.
```

### Chín / thu hoạch — `corn_ripe.png`

```text
Requested crop: corn.
Requested growth stage: RIPE / HARVEST-READY.
One mature corn plant with a tall upright stalk, long arching green leaves, a small golden tassel and two corn ears attached at the sides. Partly opened green husks reveal short readable rows of golden kernels; use only a few chunky kernel marks. Keep the ears attached and the base fixed. No harvested cob pile or detached ears.
```

---

## 14. Xà lách

### Mầm — `lettuce_sprout.png`

```text
Crop species: butterhead lettuce.
Requested growth stage: SPROUT.
One tiny lettuce seedling with two rounded cotyledons and one small soft ruffled true leaf. A very low open silhouette at the ground anchor. No mature lettuce head, long stem, flowers or fruit.
```

### Non — `lettuce_grow.png`

```text
Requested crop: butterhead lettuce.
Requested growth stage: YOUNG.
One young lettuce plant forming an open low rosette of several soft wavy-edged green leaves. Leaves radiate from one central crown, with visible gaps and a light yellow-green centre. Larger than the sprout but not yet a full harvest-size head. No tight cabbage ball.
```

### Chín / thu hoạch — `lettuce_ripe.png`

```text
Requested crop: butterhead lettuce.
Requested growth stage: RIPE / HARVEST-READY.
One full harvest-ready butterhead lettuce rosette with broad softly curled green leaves surrounding a pale yellow-green centre. The head remains low and naturally rooted, with visible layered leaf folds. Keep an open lettuce character, not a hard spherical cabbage. No flowering stalk, detached salad leaves, basket or soil patch.
```

---

## 15. Dâu tây

### Mầm — `strawberry_sprout.png`

```text
Crop species: strawberry.
Requested growth stage: SPROUT.
One tiny strawberry plant with its first small trifoliate leaf: three rounded toothed leaflets on a short delicate stem. Keep the growth low and sparse, anchored at one root crown. No white flowers, berries, runners or mature dense foliage.
```

### Non — `strawberry_grow.png`

```text
Requested crop: strawberry.
Requested growth stage: YOUNG.
One young strawberry plant with two or three trifoliate leaves and two small cream-white flowers with golden centres. Include one tiny pale green developing berry if visible. Keep the same low root crown and compact footprint. No ripe red fruit or long runners outside the tile.
```

### Chín / thu hoạch — `strawberry_ripe.png`

```text
Requested crop: strawberry.
Requested growth stage: RIPE / HARVEST-READY.
One compact ripe strawberry plant with three bright red heart-shaped berries hanging beneath its trifoliate leaves. Add only a few cream-coloured seed pixels on each berry, keeping the texture clean. One small pale flower may remain. Red accents #b83b32 and #d85b42. All berries remain attached; no detached fruit pile, basket or surrounding ground.
```

---

## 16. Lê — cây ăn quả lùn

### Mầm — `pear_sprout.png`

```text
Crop species: dwarf pear tree.
Requested growth stage: SPROUT.
One very young pear-tree seedling with a thin short stem and two or three simple oval green leaves. A single exposed stem-to-ground contact point, without a soil root ball. Keep the silhouette upright and sparse. No pears, blossoms, mature trunk or pot.
```

### Non — `pear_grow.png`

```text
Requested crop: dwarf pear tree.
Requested growth stage: YOUNG.
One young dwarf pear sapling with a slim light-brown trunk, two or three small branches and a loose crown of oval green leaves. About two thirds of the ripe dwarf-tree height; the trunk remains clearly visible below the leaves. No pear fruits, pot, stakes or surrounding orchard.
```

### Chín / thu hoạch — `pear_ripe.png`

```text
Requested crop: dwarf pear tree.
Requested growth stage: RIPE / HARVEST-READY.
One compact mature dwarf pear tree on the same root anchor, with a short sturdy trunk, a rounded but readable green canopy and three or four clearly visible yellow-green pears. Each pear has a narrow neck and a wider rounded base, clearly different from an apple. Keep the complete trunk and canopy visible within one virtual tile. No full-size giant tree, ladder, fallen pears or ground scenery.
```

---

## Kiểm tra sau khi tạo ảnh

- Có đủ **1 seed chung + 48 ảnh giai đoạn**, đúng tên file.
- Mầm nhỏ, cây non lớn hơn, cây chín đầy đủ; không bị phóng ba giai đoạn thành cùng kích thước.
- Ba ảnh của mỗi cây giữ nguyên góc nhìn, ánh sáng và điểm tiếp đất.
- Không có ô đất hoặc luống đất đi kèm: nền luống sẽ được ghép riêng trong game.
- Cà rốt, củ cải và hành giữ gốc tại vị trí trồng; không thành icon nông sản đã nhổ.
- Nấm không mọc lá; xà lách không biến thành bắp cải; quả lê không tròn như táo.
- Hai biến thể dưa có dáng quả và tập tính mọc khác nhau như đã quy định.
- Không crop sát từng giai đoạn rồi tự kéo tất cả về cùng chiều cao. Nếu cần hậu kỳ, giữ một khung chung và biến đổi đồng bộ theo điểm neo; ưu tiên giữ chất lượng PNG gốc.

Tài liệu này chỉ soạn prompt và tên ảnh. Các cây mới ngoài danh sách hiện có cần được cấu hình riêng khi tích hợp vào game.

