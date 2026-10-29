// Game economy configuration: gold prices, build durations, and production yields
import { UPGRADES_CONFIG } from "./upgradesConfig.js";
import { FENCE_PRICE_OVERRIDES, FENCE_DURATIONS } from "./fenceConfig.js";

export const INITIAL_GOLD = 500;
export const INITIAL_GEMS = 30; // Ruby khởi đầu cho Lãnh Chúa

/**
 * Tính số lượng Ruby cần để hoàn thành ngay công trình/hồi đơn
 */
export function getGemSpeedupCost(secondsRemaining) {
  if (secondsRemaining <= 0) return 0;
  if (secondsRemaining <= 30) return 1;
  if (secondsRemaining <= 90) return 2;
  return Math.max(1, Math.ceil(secondsRemaining / 60));
}

// Specific price overrides for distinctive buildings and landmarks
export const TILE_PRICE_OVERRIDES = {
  ...FENCE_PRICE_OVERRIDES,
  // Common paths and decors
  "d12_meadow_wildflowers": 0,    // Free base grass
  "d01_plaza_fountain": 60,
  "d02_village_well": 40,
  "d03_market_stalls": 80,
  "d04_oak_tree_park": 20,
  "d05_pine_grove": 20,
  "d06_cherry_garden": 35,
  "d07_streetlamps_signpost": 15,
  "d08_stone_statue_plaza": 75,
  "d09_merchant_cart_camp": 50,
  "d10_flower_orchard_hedge": 25,
  "d11_canal_straight": 15,
  "d13_farmland_plot": 15, // Luống đất trồng cây nông trang
  // Rừng Pixel Art (cửa hàng Phong cảnh)
  "d28_forest_dense_canopy": 40,
  "d29_forest_oak_woodland": 50,
  "d30_forest_oak_thicket": 45,
  "d31_forest_pine_cliff": 55,
  "d32_forest_pine_boulders": 45,

  // Starter residential and workshops
  "b01_cottage_red": 50,
  "b02_tudor_inn": 150,
  "b03_blacksmith_forge": 180,
  "b04_windmill": 120,
  "b05_watermill": 140,
  "b06_bakery": 130,
  "b07_apothecary": 160,
  "b08_watchtower": 110,
  "b09_chapel": 220,
  "b10_wizard_tower": 350,
  "b11_carpenter_sawmill": 140,
  "b14_town_hall": 450,
  "b15_library_scholar": 260,
  "b16_alchemist_workshop": 240,
  "b17_twin_gatehouse": 200,
  "b18_greenhouse_orangery": 210,
  "b19_lighthouse_dock": 250,
  "b20_noble_manor": 400,
  "b21_chicken_coop": 75,
  "b22_cow_pasture": 120,
  "b57_sheep_pasture": 280,
  "b58_textile_mill": 450,
  "b59_dairy_factory": 240,
  "d21_apple_tree": 120,
  "d22_coconut_palm": 180,
  "d23_tamarind_tree": 150
};

// Tile unlock requirement by player level
export const TILE_REQUIRED_LEVELS = {
  // Cấp 1 (Khởi điểm)
  "d12_meadow_wildflowers": 1,
  "d13_farmland_plot": 1,
  "b01_cottage_red": 1,
  "d04_oak_tree_park": 1,
  "d05_pine_grove": 1,
  "d28_forest_dense_canopy": 1,
  "d29_forest_oak_woodland": 2,
  "d30_forest_oak_thicket": 1,
  "d31_forest_pine_cliff": 2,
  "d32_forest_pine_boulders": 1,

  // Cấp 2 (Mở khóa Chuồng Gà Đẻ Trứng)
  "b21_chicken_coop": 2,
  "b04_windmill": 2,
  "b02_tudor_inn": 2,
  "d02_village_well": 2,
  "d06_cherry_garden": 2,
  "d07_streetlamps_signpost": 2,

  // Cấp 3 (Mở khóa Tòa Thị Chính theo yêu cầu)
  "b14_town_hall": 3,
  "b06_bakery": 3,
  "d01_plaza_fountain": 3,
  "b05_watermill": 3,
  "d03_market_stalls": 3,
  "d10_flower_orchard_hedge": 3,

  // Cấp 4
  "b03_blacksmith_forge": 4,
  "b08_watchtower": 4,
  "b11_carpenter_sawmill": 4,
  "b59_dairy_factory": 4,
  "d08_stone_statue_plaza": 4,
  "d09_merchant_cart_camp": 4,
  "d21_apple_tree": 4,

  // Cấp 5 (Mở khóa Chuồng Bò Sữa)
  "b22_cow_pasture": 5,
  "b07_apothecary": 5,
  "b09_chapel": 5,
  "b18_greenhouse_orangery": 5,
  "b17_twin_gatehouse": 5,
  "d11_canal_straight": 5,

  // Cấp 6
  "b15_library_scholar": 6,
  "d23_tamarind_tree": 6,
  "r12_road_bridge_stone": 6,
  "c09_timber_footbridge_ns": 6,
  "c10_timber_footbridge_ew": 6,

  // Cấp 7 (Mở khóa Chuồng Cừu Lấy Lông)
  "b57_sheep_pasture": 7,
  "b16_alchemist_workshop": 7,
  "b19_lighthouse_dock": 7,
  "d22_coconut_palm": 7,
  "m04_stone_harbor_pier": 7,

  // Cấp 8
  "b20_noble_manor": 8,
  "b58_textile_mill": 8,
  "r25_plaza_var1_marble_fountain": 8,
  "c01_river_bend_ne": 8,
  "c02_river_bend_nw": 8,

  // Cấp 9
  "b10_wizard_tower": 9,
  "b45_clocktower_guildhall_sw": 9,
  "b46_clocktower_guildhall_se": 9,
  "r26_plaza_var2_armillary_sundial": 9,

  // Cấp 10
  "b21_japanese_pagoda_sw": 10,
  "b22_japanese_pagoda_se": 10,
  "l12_geothermal_hotspring_onsen": 10,
  "l04_bamboo_torii_sanctuary": 10,

  // Cấp 11
  "b23_mediterranean_villa_sw": 11,
  "b24_mediterranean_villa_se": 11,
  "r32_road_var2_triumphal_boulevard": 11,
  "s30_slope_var2_olive_cypress": 11,

  // Cấp 12
  "b25_bayou_boathouse_sw": 12,
  "b26_bayou_boathouse_se": 12,
  "l20_coastal_wharf_boathouse": 12,
  "c08_river_quay_dock": 12,

  // Cấp 13
  "b27_artisan_forge_sw": 13,
  "b28_artisan_forge_se": 13,
  "l22_crystal_cavern_mine": 13,
  "r29_plaza_var5_sculptor_courtyard": 13,

  // Cấp 14
  "b29_botanical_conservatory_sw": 14,
  "b30_botanical_conservatory_se": 14,
  "s27_sloped_grand_balustrade_stairs": 14,

  // Cấp 15
  "b31_highland_keep_sw": 15,
  "b32_highland_keep_se": 15,
  "s28_sloped_alpine_suspension_bridge": 15,
  "l25_highland_cattle_pasture": 15,

  // Cấp 16
  "b33_lumber_sawmill_sw": 16,
  "b34_lumber_sawmill_se": 16,
  "b51_waterworks_pump_house_sw": 16,
  "b52_waterworks_pump_house_se": 16,
  "l28_log_boom_millpond": 16,

  // Cấp 17
  "b35_apothecary_tower_sw": 17,
  "b36_apothecary_tower_se": 17,
  "l40_underground_river_grotto": 17,
  "m42_wetland_var2_wisp_bog": 17,

  // Cấp 18
  "b37_shipyard_drydock_sw": 18,
  "b38_shipyard_drydock_se": 18,
  "l01_harbor_estuary_seagate": 18,
  "m47_coast_var1_breakwater_mole": 18,

  // Cấp 19
  "b39_desert_caravanserai_sw": 19,
  "b40_desert_caravanserai_se": 19,
  "l32_desert_qanat_garden": 19,
  "m09_desert_oasis": 19,

  // Cấp 20
  "b41_pottery_kiln_sw": 20,
  "b42_pottery_kiln_se": 20,
  "b53_glassblower_studio_sw": 20,
  "b54_glassblower_studio_se": 20,
  "l50_glass_merchant_carts": 20,

  // Cấp 21
  "b43_nomad_yurt_sw": 21,
  "b44_nomad_yurt_se": 21,
  "l49_tibetan_yak_tuareg_camel": 21,

  // Cấp 22
  "b47_winery_press_barn_sw": 22,
  "b48_winery_press_barn_se": 22,
  "b49_amphitheater_stage_sw": 22,
  "b50_amphitheater_stage_se": 22,
  "l41_wine_barrel_dray_falconer": 22,

  // Cấp 23
  "l43_glacial_ice_shrine": 23,
  "l35_arctic_aurora_station": 23,
  "m15_nordic_timber_hall": 23,

  // Cấp 24
  "b55_desert_kasbah_sw": 24,
  "b56_desert_kasbah_se": 24,
  "l47_nabataean_treasury_canyon": 24,
  "l06_savanna_acacia_waterhole": 24,

  // Cấp 25
  "l05_desert_pyramid_ruin": 25,
  "l27_ancient_ruined_aqueduct": 25,
  "l23_royal_coach_procession": 25,
  "l10_wildlife_pelagic_pod": 25
};

export function getTileRequiredLevel(tileId) {
  if (TILE_REQUIRED_LEVELS[tileId]) return TILE_REQUIRED_LEVELS[tileId];
  if (tileId.startsWith("b")) {
    const num = parseInt(tileId.slice(1, 3)) || 1;
    if (num <= 2) return 1;
    if (num <= 5) return 2;
    if (num <= 8) return 3;
    if (num <= 12) return 4;
    if (num <= 20) return 6;
    if (num <= 30) return 11;
    if (num <= 40) return 15;
    if (num <= 50) return 19;
    return 22;
  }
  if (tileId.startsWith("l")) {
    const num = parseInt(tileId.slice(1, 3)) || 1;
    if (num <= 10) return 10;
    if (num <= 20) return 14;
    if (num <= 30) return 18;
    if (num <= 40) return 22;
    return 25;
  }
  return 1;
}

/**
 * Lấy giới hạn số lượng chuồng tối đa theo cấp độ người chơi:
 * - Chuồng gà: Lv 2 (max 2, Lv 10 -> 3, Lv 17 -> 4)
 * - Chuồng bò: Lv 5 (max 2, Lv 12 -> 3, Lv 20 -> 4)
 * - Chuồng cừu/heo: Lv 7 (max 2, Lv 14 -> 3, Lv 21 -> 4)
 */
export function getMaxPenCount(tileId, playerLevel) {
  if (tileId === "b21_chicken_coop") {
    if (playerLevel < 2) return 0;
    if (playerLevel < 10) return 2;
    if (playerLevel < 17) return 3;
    return 4;
  }
  if (tileId === "b22_cow_pasture") {
    if (playerLevel < 5) return 0;
    if (playerLevel < 12) return 2;
    if (playerLevel < 20) return 3;
    return 4;
  }
  if (tileId === "b57_sheep_pasture") {
    if (playerLevel < 7) return 0;
    if (playerLevel < 14) return 2;
    if (playerLevel < 21) return 3;
    return 4;
  }
  return Infinity;
}

export function getNextPenUnlockInfo(tileId, playerLevel) {
  if (tileId === "b21_chicken_coop") {
    if (playerLevel < 2) return { nextLevel: 2, nextMax: 2 };
    if (playerLevel < 10) return { nextLevel: 10, nextMax: 3 };
    if (playerLevel < 17) return { nextLevel: 17, nextMax: 4 };
    return null;
  }
  if (tileId === "b22_cow_pasture") {
    if (playerLevel < 5) return { nextLevel: 5, nextMax: 2 };
    if (playerLevel < 12) return { nextLevel: 12, nextMax: 3 };
    if (playerLevel < 20) return { nextLevel: 20, nextMax: 4 };
    return null;
  }
  if (tileId === "b57_sheep_pasture") {
    if (playerLevel < 7) return { nextLevel: 7, nextMax: 2 };
    if (playerLevel < 14) return { nextLevel: 14, nextMax: 3 };
    if (playerLevel < 21) return { nextLevel: 21, nextMax: 4 };
    return null;
  }
  return null;
}

export const MAX_PLAYER_LEVEL = 25;

// Player Level Thresholds & Titles (Cấp 1 - 25) - Tái cân bằng độ khó & nhịp độ tiến trình chuẩn game nông trại
export const PLAYER_LEVEL_CONFIG = [
  { level: 1, xpReq: 0, title: "Tân Lập Làng", rewardGold: 0 },
  { level: 2, xpReq: 300, title: "Nông Dân Chăm Chỉ", rewardGold: 150, unlockNote: "🐔 Chuồng gà (Tối đa 2 chuồng), Cối xay gió 🌾, Quán trọ 🍺, Cà chua 🍅, Dâu tây 🍓" },
  { level: 3, xpReq: 850, title: "Chủ Trang Trại", rewardGold: 300, unlockNote: "Tòa Thị Chính 🏛️ (Mở khóa Bảng Thành Tựu), Lò bánh mì 🍞, Bắp ngô 🌽, Bắp cải 🥬" },
  { level: 4, xpReq: 1800, title: "Thương Gia Trù Phú", rewardGold: 450, unlockNote: "Xưởng Bơ Sữa 🧈, Lò rèn ⚒️, Xưởng cưa 🪓, Cửa hàng tạp hóa 🏪, Bí ngô 🎃, Dưa hấu 🍉" },
  { level: 5, xpReq: 3400, title: "Thị Trưởng Năng Động", rewardGold: 650, unlockNote: "🐮 Chuồng bò sữa (Tối đa 2 chuồng), 👨‍🌾 Tổng Quản Gia, Nhà nguyện đá ⛪, Cổng thành đôi 🏰, Kênh nước 💧, Nho tím 🍇" },
  { level: 6, xpReq: 5800, title: "Lãnh Chúa Khai Hoang", rewardGold: 900, unlockNote: "🚢 Bến Cảng Hoàng Gia & Thuyền Buôn Caravel (Đóng 9 thùng hàng, thưởng 3-5 Ruby 💎), Thư viện hoàng gia 📚, Tháp canh 🗼, Cầu đá 🌉" },
  { level: 7, xpReq: 9200, title: "Đại Bá Tước", rewardGold: 1200, unlockNote: "🐑 Chuồng cừu (Tối đa 2 chuồng), Xưởng giả kim 🧪, Ngọn hải đăng 🗼, Cầu cảng đá bến biển ⚓" },
  { level: 8, xpReq: 14000, title: "Quốc Vương Đại Lục", rewardGold: 1600, unlockNote: "Dinh thự quý tộc 🏰, Đài phun cẩm thạch ⛲, Khúc quanh kênh đào 🌊" },
  { level: 9, xpReq: 20500, title: "Hoàng Đế Vĩ Đại", rewardGold: 2200, unlockNote: "Tháp pháp sư cổ đại 🔮, Tòa thị sảnh đồng hồ thiên văn 🕰️" },
  { level: 10, xpReq: 29000, title: "Thống Soái Đất Hứa", rewardGold: 3000, unlockNote: "🐔 Mở thêm 1 Chuồng gà (Tối đa 3 chuồng), Chùa gỗ 3 tầng ⛩️, Suối Onsen ♨️" },
  { level: 11, xpReq: 39500, title: "Bá Chủ Thương Trường", rewardGold: 4000, unlockNote: "Biệt thự Địa Trung Hải 🏛️, Đại lộ cột cẩm thạch 🏛️, Đồi cây oliu 🫒" },
  { level: 12, xpReq: 52000, title: "Chúa Đảo Hải Cảng", rewardGold: 5200, unlockNote: "🐮 Mở thêm 1 Chuồng bò (Tối đa 3 chuồng), Nhà thuyền đầm lầy 🛶, Bến tàu cầu cảng 🐟" },
  { level: 13, xpReq: 67000, title: "Bậc Thầy Luyện Kim", rewardGold: 6500, unlockNote: "Lò rèn nghệ nhân ⚒️, Mỏ hang tinh thể pha lê 💎, Sân điêu khắc làng 🎨" },
  { level: 14, xpReq: 85000, title: "Kiến Trúc Sư Hoàng Gia", rewardGold: 8000, unlockNote: "🐑 Mở thêm 1 Chuồng cừu (Tối đa 3 chuồng), Nhà kính thực vật 🌿, Đại cầu thang đá 🏛️" },
  { level: 15, xpReq: 106000, title: "Đại Tướng Cao Nguyên", rewardGold: 10000, unlockNote: "Pháo đài tháp canh 🏰, Cầu treo dây cáp 🌉, Bãi bò lông dài 🐂" },
  { level: 16, xpReq: 130000, title: "Thống Đốc Công Nghiệp", rewardGold: 12500, unlockNote: "Xưởng cưa thủy lực 🪵, Trạm bơm nước dầm gang ⚙️" },
  { level: 17, xpReq: 158000, title: "Dược Sư Huyền Bí", rewardGold: 15500, unlockNote: "🐔 Mở thêm 1 Chuồng gà (Tối đa 4 chuồng), Tháp dược sư 🧪, Hang động ngầm 🌌" },
  { level: 18, xpReq: 190000, title: "Đô Đốc Hàng Hải", rewardGold: 19000, unlockNote: "Xưởng đóng tàu Caravel ⛵, Cổng biển cảng 🌊, Tuyến đê chắn sóng ⚓" },
  { level: 19, xpReq: 226000, title: "Lãnh Chúa Con Đường Tơ Lụa", rewardGold: 23000, unlockNote: "Trạm nghỉ sa mạc 🐫, Vườn thiên đường 🌴, Ốc đảo 💧" },
  { level: 20, xpReq: 267000, title: "Đại Sư Gốm Sứ & Thủy Tinh", rewardGold: 28000, unlockNote: "🐮 Mở thêm 1 Chuồng bò (Tối đa 4 chuồng), Lò gốm rồng 🏺, Xưởng thủy tinh 🔮" },
  { level: 21, xpReq: 313000, title: "Chúa Tể Thảo Nguyên", rewardGold: 34000, unlockNote: "🐑 Mở thêm 1 Chuồng cừu (Tối đa 4 chuồng), Đại lều du mục ⛺, Đoàn bò Tây Tạng 🐎" },
  { level: 22, xpReq: 365000, title: "Bậc Thầy Kịch Nghệ & Rượu Vang", rewardGold: 41000, unlockNote: "Hầm rượu vang đồi nho 🍷, Nhà hát đá bậc thang ngoài trời 🎭, Cỗ xe chở rượu & Chim ưng 🦅" },
  { level: 23, xpReq: 423000, title: "Đại Pháp Sư Băng Giá", rewardGold: 49000, unlockNote: "Điện thờ tháp băng pha lê ❄️, Đài quan sát cực quang bắc cực 🌌, Nhà dài Viking 🛡️" },
  { level: 24, xpReq: 488000, title: "Hộ Vệ Sa Mạc Huyền Bí", rewardGold: 58000, unlockNote: "Pháo đài đất nén Kasbah 🏜️, Hẻm núi kho tàng chạm khắc đá 🏛️, Cây baobab cổ thụ 🌳" },
  { level: 25, xpReq: 560000, title: "Huyền Thoại Bất Tử Đại Lục", rewardGold: 75000, unlockNote: "Kim tự tháp Ziggurat cổ đại 👑, Cầu máng La Mã vĩ đại 🏛️, Cỗ xe hoàng gia tứ mã 🎠, Kỳ quan muôn đời!" }
];

export function getLevelXpRequirement(level) {
  const item = PLAYER_LEVEL_CONFIG.find(c => c.level === level + 1);
  if (item) return item.xpReq;
  return PLAYER_LEVEL_CONFIG[PLAYER_LEVEL_CONFIG.length - 1].xpReq;
}

export function getPlayerLevelTitle(level) {
  const item = PLAYER_LEVEL_CONFIG.find(c => c.level === level);
  if (item) return item.title;
  return "Huyền Thoại Đại Lục";
}

// Default prices by category when not explicitly overridden
export const CATEGORY_DEFAULT_PRICES = {
  "road": 10,
  "decoration": 30,
  "building": 100,
  "terrain": 15,
  "biome": 25,
  "landmark": 300
};

// Build duration in seconds (balanced for meaningful casual pacing)
export const TILE_BUILD_DURATIONS = {
  "road": 0,        // Roads build immediately
  "terrain": 0,     // Landscaping is instant
  "biome": 0,       // Nature is instant
  "decoration": 10, // Small props take 10 seconds
  "building": 90,   // Typical buildings take 90 seconds (1.5 mins)
  "landmark": 300   // Grand monuments take 300 seconds (5 mins)
};

// Specific build duration overrides (in seconds)
export const DURATION_OVERRIDES = {
  ...FENCE_DURATIONS,
  "d12_meadow_wildflowers": 0,
  "d13_farmland_plot": 0, // Cày đất tức thì
  // Starter residential & livestock
  "b01_cottage_red": 25,
  "b21_chicken_coop": 40,
  "b22_cow_pasture": 75,
  "b57_sheep_pasture": 75,
  "b58_textile_mill": 105,
  "b59_dairy_factory": 80,
  // Crafting & processing workshops
  "b04_windmill": 75,
  "b06_bakery": 90,
  "b05_watermill": 75,
  "b03_blacksmith_forge": 120,
  "b11_carpenter_sawmill": 120,
  "b07_apothecary": 120,
  // Advanced civic, villas & culture
  "b02_tudor_inn": 150,
  "b08_watchtower": 120,
  "b09_chapel": 180,
  "b15_library_scholar": 180,
  "b16_alchemist_workshop": 210,
  "b17_twin_gatehouse": 210,
  "b18_greenhouse_orangery": 240,
  "b19_lighthouse_dock": 270,
  "b20_noble_manor": 300,
  // Grand Monuments & Landmarks
  "b14_town_hall": 180, // Tòa thị chính (3 phút)
  "b10_wizard_tower": 360 // Tháp pháp sư cổ đại (6 phút)
};

// Productive buildings that generate gold/resources periodically
export const PRODUCTION_BUILDINGS = {
  "b04_windmill": {
    name: "Cối xay gió",
    productName: "Bao lúa mì",
    icon: "🌾",
    intervalSec: 45,
    rewardGold: 30
  },
  "b06_bakery": {
    name: "Lò bánh mì",
    productName: "Bánh mì nóng",
    icon: "🍞",
    intervalSec: 60,
    rewardGold: 45
  },
  "b02_tudor_inn": {
    name: "Quán trọ Tudor",
    productName: "Thuế quán trọ",
    icon: "🍺",
    intervalSec: 90,
    rewardGold: 75
  },
  "b03_blacksmith_forge": {
    name: "Lò rèn",
    productName: "Dụng cụ sắt",
    icon: "⚒️",
    intervalSec: 90,
    rewardGold: 80
  },
  "b05_watermill": {
    name: "Cối xay nước",
    productName: "Nước sạch",
    icon: "💧",
    intervalSec: 45,
    rewardGold: 35
  },
  "b21_chicken_coop": {
    name: "Chuồng gà đẻ trứng",
    productName: "Trứng gà tươi",
    icon: "🥚",
    intervalSec: 45,
    rewardGold: 25,
    requiredResource: "wheat",
    requiredQty: 1,
    yieldResource: "egg",
    yieldQty: 2
  },
  "b22_cow_pasture": {
    name: "Chuồng bò sữa",
    productName: "Bình sữa tươi",
    icon: "🥛",
    intervalSec: 75,
    rewardGold: 50,
    requiredResource: "corn",
    requiredQty: 1,
    yieldResource: "milk",
    yieldQty: 2
  },
  "b57_sheep_pasture": {
    name: "Chuồng cừu lấy lông",
    productName: "Lông cừu",
    icon: "🐑",
    intervalSec: 60,
    rewardGold: 35,
    requiredResource: "carrot",
    requiredQty: 1,
    yieldResource: "wool",
    yieldQty: 2
  },
  "b58_textile_mill": {
    name: "Xưởng dệt vải vóc",
    productName: "Vải dệt thượng hạng",
    icon: "🧵",
    intervalSec: 75,
    rewardGold: 65,
    requiredResource: "wool",
    requiredQty: 1,
    yieldResource: "fabric",
    yieldQty: 1
  },
  "b59_dairy_factory": {
    name: "Xưởng Chế Biến Bơ Sữa",
    productName: "Bơ sữa vàng óng",
    icon: "🧈",
    intervalSec: 60,
    rewardGold: 45,
    rewardXP: 30,
    requiredResource: "milk",
    requiredQty: 1,
    yieldResource: "butter",
    yieldQty: 1
  },
  "b47_winery_press_barn_sw": {
    name: "Hầm rượu vang",
    productName: "Rượu vang hoàng gia",
    icon: "🍷",
    intervalSec: 90,
    rewardGold: 85,
    requiredResource: "grapes",
    requiredQty: 1,
    yieldResource: "wine",
    yieldQty: 1
  },
  "d21_apple_tree": {
    name: "Cây Táo Đỏ",
    productName: "Táo đỏ giòn",
    icon: "🍎",
    intervalSec: 45,
    rewardGold: 20,
    rewardXP: 15,
    yieldResource: "apple",
    yieldQty: 3
  },
  "d22_coconut_palm": {
    name: "Cây Dừa Xiêm",
    productName: "Dừa xiêm ngọt",
    icon: "🥥",
    intervalSec: 60,
    rewardGold: 32,
    rewardXP: 22,
    yieldResource: "coconut",
    yieldQty: 2
  },
  "d23_tamarind_tree": {
    name: "Cây Me Chua Ngọt",
    productName: "Trái me chua ngọt",
    icon: "🍈",
    intervalSec: 50,
    rewardGold: 25,
    rewardXP: 18,
    yieldResource: "tamarind",
    yieldQty: 3
  }
};

/**
 * Lấy số lượng nông sản / vật phẩm thu hoạch theo cấp độ công trình (Cấp 1-3)
 */
export function getBuildingYield(tileId, level = 1) {
  const bLvl = Math.max(1, Math.min(3, level || 1));
  if (tileId === "d21_apple_tree" || tileId === "d23_tamarind_tree") {
    return 3;
  }
  if (tileId === "d22_coconut_palm") {
    return 2;
  }
  if (tileId === "b04_windmill" || tileId === "b06_bakery" || tileId === "b03_blacksmith_forge") {
    return bLvl === 3 ? 3 : (bLvl === 2 ? 2 : 1);
  }
  if (tileId === "b21_chicken_coop" || tileId === "b22_cow_pasture" || tileId === "b57_sheep_pasture") {
    return bLvl === 3 ? 4 : (bLvl === 2 ? 3 : 2);
  }
  if (tileId === "b58_textile_mill" || tileId === "b59_dairy_factory" || tileId === "b47_winery_press_barn_sw") {
    return bLvl === 3 ? 3 : (bLvl === 2 ? 2 : 1);
  }
  return 1;
}

/**
 * Lấy lượng nguyên liệu đầu vào cần tiêu hao theo cấp độ công trình
 */
export function getBuildingInputReq(tileId, level = 1) {
  const bLvl = Math.max(1, Math.min(3, level || 1));
  if (tileId === "b06_bakery") {
    return bLvl === 3 ? 3 : (bLvl === 2 ? 2 : 1);
  }
  if (tileId === "b21_chicken_coop" || tileId === "b22_cow_pasture" || tileId === "b57_sheep_pasture" || tileId === "b58_textile_mill" || tileId === "b59_dairy_factory" || tileId === "b47_winery_press_barn_sw") {
    return 1;
  }
  return 0;
}

/**
 * Get gold cost of any tile by ID and category
 */
export function getTileCost(tileId, category = "building") {
  if (TILE_PRICE_OVERRIDES[tileId] !== undefined) {
    return TILE_PRICE_OVERRIDES[tileId];
  }
  return CATEGORY_DEFAULT_PRICES[category] || 50;
}

/**
 * Get construction duration in seconds
 */
export function getTileBuildDuration(tileId, category = "building") {
  if (DURATION_OVERRIDES[tileId] !== undefined) {
    return DURATION_OVERRIDES[tileId];
  }
  return TILE_BUILD_DURATIONS[category] !== undefined ? TILE_BUILD_DURATIONS[category] : 6;
}

// Residential population provided by buildings
export const BUILDING_POPULATION = {
  "b01_cottage_red": 4,
  "b02_tudor_inn": 8,
  "b07_apothecary": 3,
  "b08_watchtower": 2,
  "b14_town_hall": 16,
  "b20_noble_manor": 12,
  "b23_mediterranean_villa_sw": 8,
  "b24_mediterranean_villa_se": 8,
  "b43_nomad_yurt_sw": 5,
  "b44_nomad_yurt_se": 5,
  "b09_chapel": 4,
  "b10_wizard_tower": 2,
  "b06_bakery": 3,
  "b04_windmill": 2,
  "b03_blacksmith_forge": 3,
  "b05_watermill": 2,
  "b59_dairy_factory": 2
};

export function getTilePopulation(tileId, category = "building") {
  if (BUILDING_POPULATION[tileId] !== undefined) {
    return BUILDING_POPULATION[tileId];
  }
  if (category === "building") {
    return 2;
  }
  return 0;
}

/**
 * Calculate full village statistics from grid and active constructions
 */
export function calculateVillageStats(grid, constructions = {}, tileMap = {}, buildingLevels = {}) {
  let population = 0;
  let completedBuildings = 0;
  let roadsCount = 0;
  let decorCount = 0;
  let productionPerMin = 0;
  let underConstructionCount = Object.keys(constructions).length;

  const rows = grid.length;
  const cols = grid[0] ? grid[0].length : 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tileId = grid[r][c];
      const key = `${r}_${c}`;
      const isUnderConstruction = !!constructions[key];
      const tile = tileMap[tileId];
      const category = tile ? tile.category : "building";
      const level = buildingLevels[key] || 1;

      // Finished structures only count toward stats & economy
      if (!isUnderConstruction) {
        if (category === "building") {
          completedBuildings++;
          const basePop = getTilePopulation(tileId, category);
          const cfg = UPGRADES_CONFIG[tileId];
          const levelPop = (level > 1 && cfg && cfg[level] && typeof cfg[level].population === "number")
            ? cfg[level].population
            : basePop;
          population += levelPop;
        } else if (category === "road") {
          roadsCount++;
        } else if (category === "decoration") {
          decorCount++;
        }

        if (PRODUCTION_BUILDINGS[tileId]) {
          const pb = PRODUCTION_BUILDINGS[tileId];
          const levelMultiplier = level === 3 ? 2.5 : (level === 2 ? 1.6 : 1.0);
          productionPerMin += Math.round(pb.rewardGold * (60 / pb.intervalSec) * levelMultiplier);
        }
      }
    }
  }

  return {
    population,
    completedBuildings,
    roadsCount,
    decorCount,
    productionPerMin,
    underConstructionCount
  };
}


TILE_PRICE_OVERRIDES["s13_sand_ground"] = 1;

