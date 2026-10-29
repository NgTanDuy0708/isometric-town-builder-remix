/**
 * aestheticTileIcons.js - Icons & Image Assets for Aesthetic Tiles
 * Standard 128x128 dimetric isometric projection matching the town builder grid.
 */

import { getBuildingSpriteUri } from "./buildingSprites.js";
import { FENCE_ITEMS } from "./fenceConfig.js";
import { EXPANSION_TILE_URIS, EXPANSION_VARIANT_URIS } from "./expansionCatalog.js";

export const AESTHETIC_TILE_URIS = {
  ...EXPANSION_TILE_URIS,
  ...EXPANSION_VARIANT_URIS,
  ...Object.fromEntries(FENCE_ITEMS.map(item => [item.id, item.uri])),
  b01_cottage_red: getBuildingSpriteUri("b01_cottage_red"),
  b02_tudor_inn: getBuildingSpriteUri("b02_tudor_inn"),
  b03_blacksmith_forge: getBuildingSpriteUri("b03_blacksmith_forge"),
  b04_windmill: getBuildingSpriteUri("b04_windmill"),
  b05_watermill: getBuildingSpriteUri("b05_watermill"),
  b06_bakery: getBuildingSpriteUri("b06_bakery"),
  b07_apothecary: getBuildingSpriteUri("b07_apothecary"),
  b08_watchtower: getBuildingSpriteUri("b08_watchtower"),
  b09_chapel: getBuildingSpriteUri("b09_chapel"),
  b20_noble_manor: getBuildingSpriteUri("b20_noble_manor"),
  // Sprite toàn cảnh: ảnh được căn giữa tại ô neo và phủ theo footprint 3x3.
  d01_plaza_fountain: "/assets/buildings/royal_plaza.png",
  // Sprite toàn cảnh tòa thị chính, căn giữa tại ô neo với footprint 2x3.
  b14_town_hall: getBuildingSpriteUri("b14_town_hall"),

  // Kho Tổng Hợp: sprite duy nhất phủ footprint 2x2.
  b60_combined_warehouse: getBuildingSpriteUri("b60_combined_warehouse"),

  // 1. Lối đi lát đá xám (thay đá cẩm thạch trắng cũ)
  r03_royal_marble_pavement: "/assets/decorations/stone_pavement_128.png",

  // 2. Hàng rào gỗ nông trang
  d24_rustic_wooden_fence: "/assets/aistudio/h_ng_r_o_g__th_ng_124399b0.png",

  // 3. Luống hoa tulip nở rộ
  d25_tulip_flowerbed: "/assets/aistudio/hoa-tulip_ad11613b.png",

  // 4. Tượng hiệp sĩ cưỡi ngựa bằng đá hoa cương
  d26_marble_lion_statue: "/assets/decorations/knight_statue.png",

  // 5. Cột cờ hiệu hoàng triều
  d27_royal_banner_flag: "/assets/aistudio/C_t_c__hi_u_ho_ng_tri_u_78f7b9bb.png",

  // 6. Cây Táo Đỏ 3 Giai Đoạn Pixel Art
  d21_apple_tree: "/assets/trees/apple_tree_ripe.png",

  // 7. Cây Dừa Xiêm 3 Giai Đoạn Pixel Art
  d22_coconut_palm: "/assets/trees/coconut_palm_ripe.png",

  // 8. Cây Me Chua Ngọt 3 Giai Đoạn Pixel Art
  d23_tamarind_tree: "/assets/trees/tamarind_tree_ripe.png",

  // 9. Chuồng Gà Đẻ Trứng
  b21_chicken_coop: getBuildingSpriteUri("b21_chicken_coop"),

  // 10. Chuồng Bò Sữa
  b22_cow_pasture: getBuildingSpriteUri("b22_cow_pasture"),

  // 11. Chuồng Cừu Lấy Lông
  b57_sheep_pasture: getBuildingSpriteUri("b57_sheep_pasture"),

  d33_pig_pen_barn: getBuildingSpriteUri("d33_pig_pen_barn"),

  // Farmland plot
  d13_farmland_plot: "/assets/decorations/farmland_plot.png",

  // Rừng Pixel Art (5 mẫu) - dùng cho cửa hàng Phong cảnh & rừng ngoại vi
  d28_forest_dense_canopy: "/assets/decorations/forest_1.png",
  d29_forest_oak_woodland: "/assets/decorations/forest_2.png",
  d30_forest_oak_thicket: "/assets/decorations/forest_3.png",
  d31_forest_pine_cliff: "/assets/decorations/forest_4.png",
  d32_forest_pine_boulders: "/assets/decorations/forest_5.png"
};
