import {EXPANSION_PLANTS,getFruitTreeRenderAdjustment} from "./fruitTreeSprites.js";
export {EXPANSION_PLANTS};
// Static catalog derived from assets-source/expansion/manifest.json (74 PNGs, 44 items).
// No runtime prompt manifest or game-data imports: consumers may safely spread
// these defaults first, then retain their historical overrides.
// Shop assets use one cell; the fixed village gate reserves its own 3x1 strip.

import { WORLD_OBJECT_SCALE } from './renderScale.js';
import {VILLAGE_GATE_URI,VILLAGE_GATE_GEOMETRY} from './villageGate.js';

export const EXPANSION_TILES = [
  {"id":"b10_wizard_tower","label":"Tháp pháp sư cổ đại","category":"building","shopCategory":"wonders","doc":"Tháp đá cổ với mái xanh và điểm nhấn pha lê, có ba cấp nâng cấp."},
  {"id":"b11_carpenter_sawmill","label":"Xưởng mộc & cưa gỗ","category":"building","shopCategory":"production","doc":"Xưởng mộc và cưa gỗ với mái che, bàn thợ và vật liệu gỗ, có ba cấp nâng cấp."},
  {"id":"b58_textile_mill","label":"Xưởng dệt vải","category":"building","shopCategory":"production","doc":"Xưởng dệt vải từ lông cừu, sử dụng cơ chế sản xuất và nâng cấp hiện có."},
  {"id":"b59_dairy_factory","label":"Xưởng bơ sữa","category":"building","shopCategory":"production","doc":"Xưởng chế biến sữa thành bơ, sử dụng cơ chế sản xuất và nâng cấp hiện có."},
  {"id":"b61_clay_house","label":"Nhà đất sét","category":"building","shopCategory":"residential","doc":"Nhà đất sét ấm cúng; nâng cấp để tăng sức chứa cư dân."},
  {"id":"b62_canvas_tent","label":"Lều","category":"building","shopCategory":"residential","doc":"Lều vải cho cư dân; nâng cấp để tăng sức chứa."},
  {"id":"b63_nordic_longhouse","label":"Nhà dài gỗ Bắc Âu","category":"building","shopCategory":"residential","doc":"Nhà dài gỗ Bắc Âu; nâng cấp để đón thêm cư dân."},
  {"id":"b23_mediterranean_villa_sw","label":"Biệt thự Địa Trung Hải","category":"building","shopCategory":"residential","doc":"Biệt thự Địa Trung Hải; nâng cấp để tăng sức chứa cư dân."},
  {"id":"b21_japanese_pagoda_sw","label":"Chùa gỗ","category":"building","shopCategory":"wonders","doc":"Chùa gỗ thanh tịnh với mái nhiều tầng; nâng cấp để tăng dân số."},
  {"id":"b16_alchemist_workshop","label":"Phòng thí nghiệm giả kim","category":"building","shopCategory":"production","doc":"Phòng thí nghiệm giả kim với dụng cụ và bình điều chế."},
  {"id":"b15_library_scholar","label":"Thư viện hoàng gia","category":"building","shopCategory":"wonders","doc":"Thư viện hoàng gia lưu giữ sách và tri thức của thị trấn."},
  {"id":"b17_twin_gatehouse","label":"Cổng làng","category":"building","shopCategory":"hidden","doc":"Cổng làng cố định 3×1 ô, đặt tại hàng 31, cột 14–16. Ô giữa thông đường."},
  {"id":"b18_greenhouse_orangery","label":"Nhà kính hoàng gia","category":"building","shopCategory":"production","doc":"Nhà kính hoàng gia với khung kính và cây xanh bên trong."},
  {"id":"b19_lighthouse_dock","label":"Hải đăng cảng biển","category":"building","shopCategory":"wonders","doc":"Hải đăng cao bên cảng, điểm nhấn kiến trúc cho thị trấn."},
  {"id":"r01_road_straight_ns","label":"Đường đá — đoạn thẳng","category":"road","shopCategory":"roads","doc":"Đoạn đường đá thẳng để ghép mạng lưới đường làng."},
  {"id":"r03_road_cross","label":"Ngã tư đường đá","category":"road","shopCategory":"roads","doc":"Ngã tư đường đá nối bốn nhánh đường."},
  {"id":"r04_road_tee_nes","label":"Ngã ba đường đá","category":"road","shopCategory":"roads","doc":"Ngã ba đường đá nối ba nhánh đường."},
  {"id":"r08_road_corner_ne","label":"Góc L — trái/phải","category":"road","shopCategory":"roads","doc":"Góc đường đá chữ L hướng trái/phải; xoay để đổi hướng."},
  {"id":"r12_road_bridge_stone","label":"Cầu đá vòm","category":"road","shopCategory":"roads","doc":"Cầu đá vòm trang trí tuyến đường qua dòng nước."},
  {"id":"d02_village_well","label":"Giếng nước","category":"decoration","shopCategory":"decor","doc":"Giếng nước làng với mái che và kết cấu đá, gỗ."},
  {"id":"d03_market_stalls","label":"Quầy hàng chợ","category":"decoration","shopCategory":"decor","doc":"Quầy hàng chợ với mái che và hàng hóa trưng bày."},
  {"id":"d04_oak_tree_park","label":"Công viên cây cổ thụ","category":"decoration","shopCategory":"decor","doc":"Công viên cây cổ thụ trang trí cảnh quan thị trấn."},
  {"id":"d05_pine_grove","label":"Rừng thông xanh","category":"decoration","shopCategory":"decor","doc":"Cụm thông xanh trang trí khuôn viên và rìa làng."},
  {"id":"d06_cherry_garden","label":"Vườn hoa anh đào","category":"decoration","shopCategory":"decor","doc":"Vườn hoa anh đào trang trí với sắc hoa dịu nhẹ."},
  {"id":"d07_streetlamps_signpost","label":"Cột đèn","category":"decoration","shopCategory":"decor","doc":"Cột đèn trang trí lối đi trong làng."},
  {"id":"d08_stone_statue_plaza","label":"Tượng đài anh hùng","category":"decoration","shopCategory":"decor","doc":"Tượng đài anh hùng đặt trên bệ đá trang trí."},
  {"id":"d09_merchant_cart_camp","label":"Xe hàng","category":"decoration","shopCategory":"decor","doc":"Xe hàng gỗ trang trí khu chợ và lối đi."},
  {"id":"d10_flower_orchard_hedge","label":"Vườn hoa hồng","category":"decoration","shopCategory":"decor","doc":"Vườn hoa hồng trang trí với các bụi hoa rực rỡ."},
  {"id":"d11_canal_straight","label":"Kênh đào","category":"terrain","shopCategory":"roads","doc":"Đoạn kênh đào thẳng để ghép tuyến đường thủy."},
  {"id":"d34_expansion_meadow","label":"Đồng cỏ hoa dại","category":"decoration","shopCategory":"decor","doc":"Thảm cỏ hoa dại trang trí riêng của bộ mở rộng."},
  {"id":"c17_stream_straight","label":"Suối","category":"terrain","shopCategory":"roads","doc":"Đoạn suối thẳng để ghép dòng nước trong thị trấn."},
  {"id":"l30_glacier_mountain","label":"Núi băng hà","category":"decoration","shopCategory":"decor","doc":"Núi băng hà trang trí cảnh quan vùng lạnh."},
  {"id":"l31_frozen_lake","label":"Hồ băng","category":"decoration","shopCategory":"decor","doc":"Hồ băng trang trí với mặt băng xanh nhạt."},
  {"id":"a01_whale","label":"Cá voi","category":"decoration","shopCategory":"decor","doc":"Cá voi trang trí cảnh quan đại dương."},
  {"id":"l12_geothermal_hotspring_onsen","label":"Suối khoáng nóng","category":"decoration","shopCategory":"decor","doc":"Suối khoáng nóng trang trí với hồ nước và đá bao quanh."},
  {"id":"a02_flamingo_flock","label":"Đàn hồng hạc","category":"decoration","shopCategory":"decor","doc":"Đàn hồng hạc trang trí cảnh quan ven nước."},
  {"id":"d35_cacao_tree","label":"Ca cao","category":"decoration","shopCategory":"farming","doc":"Cây ca cao cho thu hoạch ca cao định kỳ."},
  {"id":"d36_cherry_tree","label":"Cherry / cheri","category":"decoration","shopCategory":"farming","doc":"Cây cherry non cho thu hoạch định kỳ."},
  {"id":"d37_blueberry_bush","label":"Berry — việt quất","category":"decoration","shopCategory":"farming","doc":"Bụi việt quất non cho thu hoạch định kỳ."},
  {"id":"d38_durian_tree","label":"Sầu riêng","category":"decoration","shopCategory":"farming","doc":"Cây sầu riêng non cho thu hoạch định kỳ."},
  {"id":"d39_orange_tree","label":"Cam","category":"decoration","shopCategory":"farming","doc":"Cây cam non cho thu hoạch định kỳ."},
];

// The three established fruit trees keep their productive legacy ripe sprites.
export const EXPANSION_TILE_URIS = {
  b10_wizard_tower: "/assets/expansion/buildings/ancient_wizard_tower_lv1.png",
  b11_carpenter_sawmill: "/assets/expansion/buildings/carpentry_sawmill_lv1.png",
  b58_textile_mill: "/assets/expansion/buildings/weaving_workshop_lv1.png",
  b59_dairy_factory: "/assets/expansion/buildings/dairy_workshop_lv1.png",
  b61_clay_house: "/assets/expansion/buildings/clay_house_lv1.png",
  b62_canvas_tent: "/assets/expansion/buildings/canvas_tent_lv1.png",
  b63_nordic_longhouse: "/assets/expansion/buildings/nordic_longhouse_lv1.png",
  b23_mediterranean_villa_sw: "/assets/expansion/buildings/mediterranean_villa_lv1.png",
  b21_japanese_pagoda_sw: "/assets/expansion/buildings/wooden_buddhist_temple_lv1.png",
  b16_alchemist_workshop: "/assets/expansion/props/alchemy_laboratory.png",
  b15_library_scholar: "/assets/expansion/props/royal_library.png",
  b17_twin_gatehouse: VILLAGE_GATE_URI,
  b18_greenhouse_orangery: "/assets/expansion/props/royal_greenhouse.png",
  b19_lighthouse_dock: "/assets/expansion/props/harbor_lighthouse.png",
  r01_road_straight_ns: "/assets/expansion/terrain/stone_road_straight.png",
  r03_road_cross: "/assets/expansion/terrain/stone_road_crossroads.png?v=open-ends-20261030",
  r04_road_tee_nes: "/assets/expansion/terrain/stone_road_t_junction.png",
  r08_road_corner_ne: "/assets/expansion/terrain/stone_road_l_corner.png",
  r12_road_bridge_stone: "/assets/expansion/props/arched_stone_bridge.png",
  d02_village_well: "/assets/expansion/props/village_well.png",
  d03_market_stalls: "/assets/expansion/props/market_stall.png",
  d04_oak_tree_park: "/assets/expansion/gardens/ancient_tree_park.png",
  d05_pine_grove: "/assets/expansion/gardens/green_pine_grove.png",
  d06_cherry_garden: "/assets/expansion/gardens/cherry_blossom_garden.png",
  d07_streetlamps_signpost: "/assets/expansion/props/village_lamppost.png",
  d08_stone_statue_plaza: "/assets/expansion/props/hero_monument.png",
  d09_merchant_cart_camp: "/assets/expansion/props/goods_cart.png",
  d10_flower_orchard_hedge: "/assets/expansion/gardens/rose_garden.png",
  d11_canal_straight: "/assets/expansion/terrain/canal_straight.png",
  d34_expansion_meadow: "/assets/expansion/terrain/wildflower_meadow.png",
  c17_stream_straight: "/assets/expansion/terrain/stream_straight.png",
  l30_glacier_mountain: "/assets/expansion/landmarks/glacier_mountain.png",
  l31_frozen_lake: "/assets/expansion/landmarks/frozen_lake.png",
  a01_whale: "/assets/expansion/animals/whale.png",
  l12_geothermal_hotspring_onsen: "/assets/expansion/landmarks/hot_spring.png",
  a02_flamingo_flock: "/assets/expansion/animals/flamingo_flock.png",
  d21_apple_tree: "/assets/trees/apple_tree_ripe.png",
  d22_coconut_palm: "/assets/trees/coconut_palm_ripe.png",
  d23_tamarind_tree: "/assets/trees/tamarind_tree_ripe.png",
  d35_cacao_tree: "/assets/expansion/plants/cacao_tree_flowering.png",
  d36_cherry_tree: "/assets/expansion/plants/cherry_tree_young.png",
  d37_blueberry_bush: "/assets/expansion/plants/blueberry_bush_young.png",
  d38_durian_tree: "/assets/expansion/plants/durian_tree_young.png",
  d39_orange_tree: "/assets/expansion/plants/orange_tree_young.png",
};

// Temple level 3 uses level 2 art AND geometry until its clipped base is redrawn.
export const EXPANSION_BUILDING_LEVELS = {
  b10_wizard_tower: {"1":"/assets/expansion/buildings/ancient_wizard_tower_lv1.png","2":"/assets/expansion/buildings/ancient_wizard_tower_lv2.png","3":"/assets/expansion/buildings/ancient_wizard_tower_lv3.png"},
  b11_carpenter_sawmill: {"1":"/assets/expansion/buildings/carpentry_sawmill_lv1.png","2":"/assets/expansion/buildings/carpentry_sawmill_lv2.png","3":"/assets/expansion/buildings/carpentry_sawmill_lv3.png"},
  b58_textile_mill: {"1":"/assets/expansion/buildings/weaving_workshop_lv1.png","2":"/assets/expansion/buildings/weaving_workshop_lv2.png","3":"/assets/expansion/buildings/weaving_workshop_lv3.png"},
  b59_dairy_factory: {"1":"/assets/expansion/buildings/dairy_workshop_lv1.png","2":"/assets/expansion/buildings/dairy_workshop_lv2.png","3":"/assets/expansion/buildings/dairy_workshop_lv3.png"},
  b61_clay_house: {"1":"/assets/expansion/buildings/clay_house_lv1.png","2":"/assets/expansion/buildings/clay_house_lv2.png","3":"/assets/expansion/buildings/clay_house_lv3.png"},
  b62_canvas_tent: {"1":"/assets/expansion/buildings/canvas_tent_lv1.png","2":"/assets/expansion/buildings/canvas_tent_lv2.png","3":"/assets/expansion/buildings/canvas_tent_lv3.png"},
  b63_nordic_longhouse: {"1":"/assets/expansion/buildings/nordic_longhouse_lv1.png","2":"/assets/expansion/buildings/nordic_longhouse_lv2.png","3":"/assets/expansion/buildings/nordic_longhouse_lv3.png"},
  b23_mediterranean_villa_sw: {"1":"/assets/expansion/buildings/mediterranean_villa_lv1.png","2":"/assets/expansion/buildings/mediterranean_villa_lv2.png","3":"/assets/expansion/buildings/mediterranean_villa_lv3.png"},
  b21_japanese_pagoda_sw: {"1":"/assets/expansion/buildings/wooden_buddhist_temple_lv1.png","2":"/assets/expansion/buildings/wooden_buddhist_temple_lv2.png","3":"/assets/expansion/buildings/wooden_buddhist_temple_lv2.png"},
};

// Source bounds use alpha > 128, matching the manifest's opaqueBounds.
// anchorX is the alpha-weighted x of the bottom 5% of visible pixels;
// anchorY is the last opaque row. This follows the actual lower contour,
// rather than centering an asymmetric building's bounding box.
// Nine three-level families plus five single-sprite buildings (level 1).
export const EXPANSION_BUILDING_GEOMETRY = {
  b10_wizard_tower: {"1":{"width":1254,"height":1254,"visibleWidth":748,"anchorX":555.956,"anchorY":1210,"worldWidth":112,"worldAnchorX":64,"worldAnchorY":128},"2":{"width":1254,"height":1254,"visibleWidth":821,"anchorX":601.661,"anchorY":1224,"worldWidth":136,"worldAnchorX":64,"worldAnchorY":128},"3":{"width":1254,"height":1254,"visibleWidth":906,"anchorX":660.164,"anchorY":1222,"worldWidth":152,"worldAnchorX":64,"worldAnchorY":128}},
  b11_carpenter_sawmill: {"1":{"width":1254,"height":1254,"visibleWidth":1147,"anchorX":791.242,"anchorY":1091,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":128},"2":{"width":1254,"height":1254,"visibleWidth":1217,"anchorX":562.167,"anchorY":1154,"worldWidth":144,"worldAnchorX":64,"worldAnchorY":128},"3":{"width":1254,"height":1254,"visibleWidth":1199,"anchorX":543.457,"anchorY":1210,"worldWidth":160,"worldAnchorX":64,"worldAnchorY":128}},
  b58_textile_mill: {"1":{"width":1254,"height":1254,"visibleWidth":1138,"anchorX":706.33,"anchorY":1122,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":128},"2":{"width":1254,"height":1254,"visibleWidth":1154,"anchorX":744.96,"anchorY":1129,"worldWidth":144,"worldAnchorX":64,"worldAnchorY":128},"3":{"width":1254,"height":1254,"visibleWidth":1184,"anchorX":756.49,"anchorY":1205,"worldWidth":160,"worldAnchorX":64,"worldAnchorY":128}},
  b59_dairy_factory: {"1":{"width":1254,"height":1254,"visibleWidth":1178,"anchorX":656.897,"anchorY":1147,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":128},"2":{"width":1254,"height":1254,"visibleWidth":1178,"anchorX":864.514,"anchorY":1129,"worldWidth":144,"worldAnchorX":64,"worldAnchorY":128},"3":{"width":1254,"height":1254,"visibleWidth":1207,"anchorX":834.793,"anchorY":1188,"worldWidth":160,"worldAnchorX":64,"worldAnchorY":128}},
  b61_clay_house: {"1":{"width":1254,"height":1254,"visibleWidth":1030,"anchorX":647.077,"anchorY":1113,"worldWidth":112,"worldAnchorX":64,"worldAnchorY":128},"2":{"width":1254,"height":1254,"visibleWidth":1185,"anchorX":520.657,"anchorY":1154,"worldWidth":136,"worldAnchorX":64,"worldAnchorY":128},"3":{"width":1254,"height":1254,"visibleWidth":1191,"anchorX":556.931,"anchorY":1185,"worldWidth":152,"worldAnchorX":64,"worldAnchorY":128}},
  b62_canvas_tent: {"1":{"width":1254,"height":1254,"visibleWidth":1108,"anchorX":799.212,"anchorY":1094,"worldWidth":112,"worldAnchorX":64,"worldAnchorY":128},"2":{"width":1254,"height":1254,"visibleWidth":1190,"anchorX":837.598,"anchorY":1105,"worldWidth":136,"worldAnchorX":64,"worldAnchorY":128},"3":{"width":1254,"height":1254,"visibleWidth":1213,"anchorX":814.137,"anchorY":1158,"worldWidth":152,"worldAnchorX":64,"worldAnchorY":128}},
  b63_nordic_longhouse: {"1":{"width":1254,"height":1254,"visibleWidth":1131,"anchorX":529.6,"anchorY":1121,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":128},"2":{"width":1254,"height":1254,"visibleWidth":1179,"anchorX":469.204,"anchorY":1114,"worldWidth":144,"worldAnchorX":64,"worldAnchorY":128},"3":{"width":1254,"height":1254,"visibleWidth":1221,"anchorX":439.861,"anchorY":1111,"worldWidth":160,"worldAnchorX":64,"worldAnchorY":128}},
  b23_mediterranean_villa_sw: {"1":{"width":1254,"height":1254,"visibleWidth":1059,"anchorX":712.055,"anchorY":1091,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":128},"2":{"width":1254,"height":1254,"visibleWidth":1063,"anchorX":756.069,"anchorY":1195,"worldWidth":144,"worldAnchorX":64,"worldAnchorY":128},"3":{"width":1254,"height":1254,"visibleWidth":1116,"anchorX":816.388,"anchorY":1194,"worldWidth":160,"worldAnchorX":64,"worldAnchorY":128}},
  b21_japanese_pagoda_sw: {"1":{"width":1254,"height":1254,"visibleWidth":1176,"anchorX":773.203,"anchorY":1168,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":128},"2":{"width":1254,"height":1254,"visibleWidth":1211,"anchorX":762.295,"anchorY":1242,"worldWidth":144,"worldAnchorX":64,"worldAnchorY":128},"3":{"width":1254,"height":1254,"visibleWidth":1211,"anchorX":762.295,"anchorY":1242,"worldWidth":144,"worldAnchorX":64,"worldAnchorY":128}},
  b16_alchemist_workshop: {"1":{"width":1254,"height":1254,"visibleWidth":988,"anchorX":652.442,"anchorY":1202,"worldWidth":112,"worldAnchorX":64,"worldAnchorY":128}},
  b15_library_scholar: {"1":{"width":1254,"height":1254,"visibleWidth":1206,"anchorX":542.518,"anchorY":1178,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":128}},
  b17_twin_gatehouse: VILLAGE_GATE_GEOMETRY,
  b18_greenhouse_orangery: {"1":{"width":1254,"height":1254,"visibleWidth":1103,"anchorX":556.31,"anchorY":1176,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":128}},
  b19_lighthouse_dock: {"1":{"width":1254,"height":1254,"visibleWidth":729,"anchorX":566.088,"anchorY":1208,"worldWidth":112,"worldAnchorX":64,"worldAnchorY":128}},
};

// Props anchor at (64,112), new decorative trees at (64,96).
// Legacy fruit trees retain their own renderer and are deliberately absent.
export const EXPANSION_RENDER_GEOMETRY = {
  r12_road_bridge_stone: {"width":1254,"height":1254,"visibleWidth":1193,"anchorX":335.874,"anchorY":1095,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":112},
  d02_village_well: {"width":1254,"height":1254,"visibleWidth":911,"anchorX":679.437,"anchorY":1175,"worldWidth":96,"worldAnchorX":64,"worldAnchorY":112},
  d03_market_stalls: {"width":1254,"height":1254,"visibleWidth":1051,"anchorX":847.153,"anchorY":1191,"worldWidth":112,"worldAnchorX":64,"worldAnchorY":112},
  d04_oak_tree_park: {"width":1254,"height":1254,"visibleWidth":1219,"anchorX":710.031,"anchorY":1186,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":112},
  d05_pine_grove: {"width":1254,"height":1254,"visibleWidth":1075,"anchorX":719.292,"anchorY":1138,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":112},
  d06_cherry_garden: {"width":1254,"height":1254,"visibleWidth":1201,"anchorX":608.912,"anchorY":1113,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":112},
  d07_streetlamps_signpost: {"width":1254,"height":1254,"visibleWidth":471,"anchorX":580.343,"anchorY":1207,"worldWidth":44,"worldAnchorX":64,"worldAnchorY":112},
  d08_stone_statue_plaza: {"width":1254,"height":1254,"visibleWidth":535,"anchorX":684.53,"anchorY":1223,"worldWidth":56,"worldAnchorX":64,"worldAnchorY":112},
  d09_merchant_cart_camp: {"width":1254,"height":1254,"visibleWidth":1174,"anchorX":317.204,"anchorY":1091,"worldWidth":112,"worldAnchorX":64,"worldAnchorY":112},
  d10_flower_orchard_hedge: {"width":1254,"height":1254,"visibleWidth":1210,"anchorX":985.345,"anchorY":1127,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":112},
  l30_glacier_mountain: {"width":1254,"height":1254,"visibleWidth":1163,"anchorX":641.702,"anchorY":1164,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":112},
  l31_frozen_lake: {"width":1254,"height":1254,"visibleWidth":1198,"anchorX":674.729,"anchorY":1057,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":112},
  a01_whale: {"width":1254,"height":1254,"visibleWidth":1153,"anchorX":859.168,"anchorY":1102,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":112},
  l12_geothermal_hotspring_onsen: {"width":1254,"height":1254,"visibleWidth":1184,"anchorX":666.169,"anchorY":1089,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":112},
  a02_flamingo_flock: {"width":1254,"height":1254,"visibleWidth":1140,"anchorX":749.534,"anchorY":1173,"worldWidth":128,"worldAnchorX":64,"worldAnchorY":112},
  d35_cacao_tree: {"width":1254,"height":1254,"visibleWidth":906,"anchorX":640.023,"anchorY":1127,"worldWidth":112,"worldAnchorX":64,"worldAnchorY":96},
  d36_cherry_tree: {"width":1254,"height":1254,"visibleWidth":441,"anchorX":637.134,"anchorY":1131,"worldWidth":96,"worldAnchorX":64,"worldAnchorY":96},
  d37_blueberry_bush: {"width":1254,"height":1254,"visibleWidth":325,"anchorX":629.415,"anchorY":1122,"worldWidth":96,"worldAnchorX":64,"worldAnchorY":96},
  d38_durian_tree: {"width":1254,"height":1254,"visibleWidth":677,"anchorX":633.184,"anchorY":1131,"worldWidth":112,"worldAnchorX":64,"worldAnchorY":96},
  d39_orange_tree: {"width":1254,"height":1254,"visibleWidth":427,"anchorX":650.333,"anchorY":1124,"worldWidth":96,"worldAnchorX":64,"worldAnchorY":96},
};

// Only manifest module T tiles are flattened to the runtime ground diamond.
// The elevated stone bridge remains a prop, and meadow never replaces base grass.
export const EXPANSION_GROUND_IDS = [
  "r01_road_straight_ns",
  "r03_road_cross",
  "r04_road_tee_nes",
  "r08_road_corner_ne",
  "d11_canal_straight",
  "d34_expansion_meadow",
  "c17_stream_straight"
];

// Source rectangles are [x, y, width, height], derived from opaqueBounds.
const GROUND_SOURCE_BOUNDS = {
  r01_road_straight_ns: [161,412,932,603],
  r03_road_cross: [91,288,1074,739],
  r04_road_tee_nes: [159,403,965,616],
  r08_road_corner_ne: [468,378,616,601],
  d11_canal_straight: [32,298,1206,758],
  d34_expansion_meadow: [27,325,1202,729],
  c17_stream_straight: [88,333,1083,698],
};

// Default shop art: ripe fruit, with the full five-stage art registered separately.
for(const [id,data] of Object.entries(EXPANSION_PLANTS))EXPANSION_TILE_URIS[id]=data.stages.fruiting;

export const EXPANSION_PRICE_OVERRIDES = {
  b10_wizard_tower: 350,
  b11_carpenter_sawmill: 140,
  b58_textile_mill: 450,
  b59_dairy_factory: 240,
  b61_clay_house: 80,
  b62_canvas_tent: 40,
  b63_nordic_longhouse: 180,
  b23_mediterranean_villa_sw: 400,
  b21_japanese_pagoda_sw: 450,
  b16_alchemist_workshop: 240,
  b15_library_scholar: 260,
  b17_twin_gatehouse: 200,
  b18_greenhouse_orangery: 210,
  b19_lighthouse_dock: 250,
  r01_road_straight_ns: 10,
  r03_road_cross: 10,
  r04_road_tee_nes: 10,
  r08_road_corner_ne: 10,
  r12_road_bridge_stone: 10,
  d02_village_well: 40,
  d03_market_stalls: 80,
  d04_oak_tree_park: 20,
  d05_pine_grove: 20,
  d06_cherry_garden: 35,
  d07_streetlamps_signpost: 15,
  d08_stone_statue_plaza: 75,
  d09_merchant_cart_camp: 50,
  d10_flower_orchard_hedge: 25,
  d11_canal_straight: 15,
  d34_expansion_meadow: 15,
  c17_stream_straight: 15,
  l30_glacier_mountain: 300,
  l31_frozen_lake: 300,
  a01_whale: 220,
  l12_geothermal_hotspring_onsen: 300,
  a02_flamingo_flock: 180,
  d21_apple_tree: 120,
  d22_coconut_palm: 180,
  d23_tamarind_tree: 150,
  d35_cacao_tree: 200,
  d36_cherry_tree: 160,
  d37_blueberry_bush: 90,
  d38_durian_tree: 260,
  d39_orange_tree: 140,
};

export const EXPANSION_REQUIRED_LEVELS = {
  b10_wizard_tower: 9,
  b11_carpenter_sawmill: 4,
  b58_textile_mill: 8,
  b59_dairy_factory: 4,
  b61_clay_house: 1,
  b62_canvas_tent: 1,
  b63_nordic_longhouse: 3,
  b23_mediterranean_villa_sw: 11,
  b21_japanese_pagoda_sw: 10,
  b16_alchemist_workshop: 7,
  b15_library_scholar: 6,
  b17_twin_gatehouse: 5,
  b18_greenhouse_orangery: 5,
  b19_lighthouse_dock: 7,
  r01_road_straight_ns: 1,
  r03_road_cross: 1,
  r04_road_tee_nes: 1,
  r08_road_corner_ne: 1,
  r12_road_bridge_stone: 6,
  d02_village_well: 2,
  d03_market_stalls: 3,
  d04_oak_tree_park: 1,
  d05_pine_grove: 1,
  d06_cherry_garden: 2,
  d07_streetlamps_signpost: 2,
  d08_stone_statue_plaza: 4,
  d09_merchant_cart_camp: 4,
  d10_flower_orchard_hedge: 3,
  d11_canal_straight: 5,
  d34_expansion_meadow: 1,
  c17_stream_straight: 3,
  l30_glacier_mountain: 18,
  l31_frozen_lake: 18,
  a01_whale: 15,
  l12_geothermal_hotspring_onsen: 10,
  a02_flamingo_flock: 8,
  d21_apple_tree: 4,
  d22_coconut_palm: 7,
  d23_tamarind_tree: 6,
  d35_cacao_tree: 8,
  d36_cherry_tree: 6,
  d37_blueberry_bush: 4,
  d38_durian_tree: 10,
  d39_orange_tree: 5,
};

export const EXPANSION_POPULATION = {
  b10_wizard_tower: 2,
  b11_carpenter_sawmill: 2,
  b58_textile_mill: 2,
  b59_dairy_factory: 2,
  b61_clay_house: 4,
  b62_canvas_tent: 2,
  b63_nordic_longhouse: 8,
  b23_mediterranean_villa_sw: 8,
  b21_japanese_pagoda_sw: 4,
  b16_alchemist_workshop: 2,
  b15_library_scholar: 2,
  b17_twin_gatehouse: 2,
  b18_greenhouse_orangery: 2,
  b19_lighthouse_dock: 2,
  r01_road_straight_ns: 0,
  r03_road_cross: 0,
  r04_road_tee_nes: 0,
  r08_road_corner_ne: 0,
  r12_road_bridge_stone: 0,
  d02_village_well: 0,
  d03_market_stalls: 0,
  d04_oak_tree_park: 0,
  d05_pine_grove: 0,
  d06_cherry_garden: 0,
  d07_streetlamps_signpost: 0,
  d08_stone_statue_plaza: 0,
  d09_merchant_cart_camp: 0,
  d10_flower_orchard_hedge: 0,
  d11_canal_straight: 0,
  d34_expansion_meadow: 0,
  c17_stream_straight: 0,
  l30_glacier_mountain: 0,
  l31_frozen_lake: 0,
  a01_whale: 0,
  l12_geothermal_hotspring_onsen: 0,
  a02_flamingo_flock: 0,
  d21_apple_tree: 0,
  d22_coconut_palm: 0,
  d23_tamarind_tree: 0,
  d35_cacao_tree: 0,
  d36_cherry_tree: 0,
  d37_blueberry_bush: 0,
  d38_durian_tree: 0,
  d39_orange_tree: 0,
};

// Construction times are seconds; all ground modules and roads are instant.
export const EXPANSION_DURATIONS = {
  b10_wizard_tower: 360,
  b11_carpenter_sawmill: 120,
  b58_textile_mill: 105,
  b59_dairy_factory: 80,
  b61_clay_house: 40,
  b62_canvas_tent: 20,
  b63_nordic_longhouse: 90,
  b23_mediterranean_villa_sw: 150,
  b21_japanese_pagoda_sw: 180,
  b16_alchemist_workshop: 210,
  b15_library_scholar: 180,
  b17_twin_gatehouse: 210,
  b18_greenhouse_orangery: 240,
  b19_lighthouse_dock: 270,
  r01_road_straight_ns: 0,
  r03_road_cross: 0,
  r04_road_tee_nes: 0,
  r08_road_corner_ne: 0,
  r12_road_bridge_stone: 0,
  d02_village_well: 10,
  d03_market_stalls: 10,
  d04_oak_tree_park: 10,
  d05_pine_grove: 10,
  d06_cherry_garden: 10,
  d07_streetlamps_signpost: 10,
  d08_stone_statue_plaza: 10,
  d09_merchant_cart_camp: 10,
  d10_flower_orchard_hedge: 10,
  d11_canal_straight: 0,
  d34_expansion_meadow: 0,
  c17_stream_straight: 0,
  l30_glacier_mountain: 10,
  l31_frozen_lake: 10,
  a01_whale: 10,
  l12_geothermal_hotspring_onsen: 10,
  a02_flamingo_flock: 10,
  d21_apple_tree: 10,
  d22_coconut_palm: 10,
  d23_tamarind_tree: 10,
  d35_cacao_tree: 10,
  d36_cherry_tree: 10,
  d37_blueberry_bush: 10,
  d38_durian_tree: 10,
  d39_orange_tree: 10,
};

// Nine families; b58/b59 mirror historical fallbacks. Their existing entries
// in upgradesConfig.js remain authoritative when these defaults are spread first.
export const EXPANSION_UPGRADES = {
  b10_wizard_tower: {"2":{"costGold":280,"costResources":{"ironTools":1},"durationSec":180,"population":4,"desc":"Nâng cấp tháp pháp sư cổ đại lên cấp 2: sức chứa tăng lên 4 cư dân."},"3":{"costGold":560,"costResources":{"ironTools":2,"bread":2},"durationSec":300,"population":6,"desc":"Nâng cấp tháp pháp sư cổ đại lên cấp 3: sức chứa tăng lên 6 cư dân."},"maxLevel":3},
  b11_carpenter_sawmill: {"2":{"costGold":120,"costResources":{"ironTools":1},"durationSec":90,"population":4,"desc":"Nâng cấp xưởng mộc & cưa gỗ lên cấp 2: sức chứa tăng lên 4 cư dân."},"3":{"costGold":240,"costResources":{"ironTools":2,"bread":2},"durationSec":150,"population":6,"desc":"Nâng cấp xưởng mộc & cưa gỗ lên cấp 3: sức chứa tăng lên 6 cư dân."},"maxLevel":3},
  b58_textile_mill: {"2":{"costGold":220,"costResources":{"ironTools":2,"wool":2},"durationSec":15,"resourceYield":2,"goldBonus":45,"desc":"Khung dệt thoi bay cải tiến: Lấy lông cừu dệt 2 Xấp vải 🧵 + 100 🪙 mỗi mẻ."},"3":{"costGold":450,"costResources":{"ironTools":4,"wool":5},"durationSec":25,"resourceYield":3,"goldBonus":100,"desc":"Xưởng dệt gấm vóc hoàng gia: Lấy lông cừu dệt 3 Xấp vải 🧵 thượng hạng + 155 🪙."},"maxLevel":3},
  b59_dairy_factory: {"2":{"costGold":200,"costResources":{"ironTools":2,"milk":2},"durationSec":15,"resourceYield":2,"goldBonus":35,"desc":"Thùng khuấy bơ cơ giới: Tiêu thụ 1 Sữa tươi làm ra 2 Khối bơ vàng 🧈 + 80 🪙 mỗi mẻ."},"3":{"costGold":400,"costResources":{"ironTools":4,"milk":4},"durationSec":25,"resourceYield":3,"goldBonus":75,"desc":"Dây chuyền ép bơ sữa hoàng gia: Tiêu thụ 1 Sữa tươi làm ra 3 Khối bơ vàng 🧈 béo ngậy + 120 🪙."},"maxLevel":3},
  b61_clay_house: {"2":{"costGold":70,"costResources":{"ironTools":1},"durationSec":45,"population":8,"desc":"Nâng cấp nhà đất sét lên cấp 2: sức chứa tăng lên 8 cư dân."},"3":{"costGold":140,"costResources":{"ironTools":2,"bread":2},"durationSec":75,"population":12,"desc":"Nâng cấp nhà đất sét lên cấp 3: sức chứa tăng lên 12 cư dân."},"maxLevel":3},
  b62_canvas_tent: {"2":{"costGold":35,"costResources":{"ironTools":1},"durationSec":25,"population":4,"desc":"Nâng cấp lều lên cấp 2: sức chứa tăng lên 4 cư dân."},"3":{"costGold":70,"costResources":{"ironTools":2,"bread":2},"durationSec":45,"population":6,"desc":"Nâng cấp lều lên cấp 3: sức chứa tăng lên 6 cư dân."},"maxLevel":3},
  b63_nordic_longhouse: {"2":{"costGold":160,"costResources":{"ironTools":1},"durationSec":90,"population":12,"desc":"Nâng cấp nhà dài gỗ bắc âu lên cấp 2: sức chứa tăng lên 12 cư dân."},"3":{"costGold":320,"costResources":{"ironTools":2,"bread":2},"durationSec":150,"population":18,"desc":"Nâng cấp nhà dài gỗ bắc âu lên cấp 3: sức chứa tăng lên 18 cư dân."},"maxLevel":3},
  b23_mediterranean_villa_sw: {"2":{"costGold":320,"costResources":{"ironTools":1},"durationSec":150,"population":14,"desc":"Nâng cấp biệt thự địa trung hải lên cấp 2: sức chứa tăng lên 14 cư dân."},"3":{"costGold":640,"costResources":{"ironTools":2,"bread":2},"durationSec":240,"population":20,"desc":"Nâng cấp biệt thự địa trung hải lên cấp 3: sức chứa tăng lên 20 cư dân."},"maxLevel":3},
  b21_japanese_pagoda_sw: {"2":{"costGold":360,"costResources":{"ironTools":1},"durationSec":180,"population":6,"desc":"Nâng cấp chùa gỗ lên cấp 2: sức chứa tăng lên 6 cư dân."},"3":{"costGold":720,"costResources":{"ironTools":2,"bread":2},"durationSec":300,"population":10,"desc":"Nâng cấp chùa gỗ lên cấp 3: sức chứa tăng lên 10 cư dân."},"maxLevel":3},
};

/** Source-anchored draw rectangle, computed solely from geometry properties. */
export function getExpansionRenderAdjustment(id, level = 1) {
  const tree=getFruitTreeRenderAdjustment(id);if(tree)return tree;
  if (typeof id !== 'string') return undefined;
  const levels = Object.hasOwn(EXPANSION_BUILDING_GEOMETRY, id)
    ? EXPANSION_BUILDING_GEOMETRY[id] : undefined;
  const source = levels
    ? (levels[Number.isInteger(level) && level >= 1 && level <= 3 ? level : 1] || levels[1])
    : (Object.hasOwn(EXPANSION_RENDER_GEOMETRY, id) ? EXPANSION_RENDER_GEOMETRY[id] : undefined);
  if (!source) return undefined;
  const scale = source.worldWidth / source.visibleWidth * (['r12_road_bridge_stone','b17_twin_gatehouse'].includes(id) ? 1 : WORLD_OBJECT_SCALE);
  return {
    dx: source.worldAnchorX - source.anchorX * scale,
    dy: source.worldAnchorY - source.anchorY * scale,
    dw: source.width * scale,
    dh: source.height * scale,
    highQuality: true
  };
}

// All modular pieces share approved stone artwork and use roadGeometry's
// common width, border and open connectors instead of independently scaled PNGs.
for (const id of ['r03_road_cross','r04_road_tee_nes','r08_road_corner_ne']) {
  EXPANSION_TILE_URIS[id] = EXPANSION_TILE_URIS.r01_road_straight_ns;
}

// The second L family has its own shop card; remaining rotations stay hidden.
const ROAD_VARIANTS = {
  r02_road_straight_ew: 'r01_road_straight_ns',
  r09_road_corner_es: 'r08_road_corner_ne',
  r10_road_corner_sw: 'r08_road_corner_ne',
  r11_road_corner_wn: 'r08_road_corner_ne',
  r07_road_tee_ews: 'r04_road_tee_nes',
  r05_road_tee_nsw: 'r04_road_tee_nes',
  r06_road_tee_ewn: 'r04_road_tee_nes'
};

export const EXPANSION_VARIANT_TILES = Object.entries(ROAD_VARIANTS).map(([id, baseId]) => ({
  ...EXPANSION_TILES.find(tile => tile.id === baseId), id,
  ...(id === 'r09_road_corner_es'
    ? {shopCategory:'roads',label:'Góc L — trên/dưới',doc:'Góc đường đá chữ L hướng trên/dưới; xoay để đổi hướng.'}
    : {shopCategory:'hidden'})
}));

export const EXPANSION_VARIANT_URIS = Object.fromEntries(
  Object.entries(ROAD_VARIANTS).map(([id, baseId]) => [id, EXPANSION_TILE_URIS[baseId]])
);

for (const [id, baseId] of Object.entries(ROAD_VARIANTS)) {
  for (const map of [EXPANSION_PRICE_OVERRIDES, EXPANSION_REQUIRED_LEVELS,
    EXPANSION_POPULATION, EXPANSION_DURATIONS]) map[id] = map[baseId];
}

/** Visible source bounds stretched to [0,64,128,64] at draw time. */
export function getExpansionGroundAdjustment(id) {
  if (typeof id !== 'string') return undefined;
  if (Object.hasOwn(ROAD_VARIANTS, id)) id = ROAD_VARIANTS[id];
  if (!Object.hasOwn(GROUND_SOURCE_BOUNDS, id)) return undefined;
  return {
    source: [...GROUND_SOURCE_BOUNDS[id]],
    dx: 0, dy: 64, dw: 128, dh: 64,
    highQuality: true
  };
}
