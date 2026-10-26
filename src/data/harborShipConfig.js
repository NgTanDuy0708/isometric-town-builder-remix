/**
 * harborShipConfig.js - Cấu hình Bến Cảng Đường Thủy & Tàu Buôn Giao Thương (Cargo Boat)
 * 
 * - Mở khóa ở Cấp 6 (Lãnh Chúa Khai Hoang).
 * - Bến tàu và Thuyền Buồm Caravel tọa lạc cố định tại Row 14, Col 6 (bờ nước phía Tây).
 * - Mỗi chuyến tàu gồm 3 khoang hàng × 3 thùng = 9 thùng hàng (Crates).
 * - Đóng từng thùng nhận Vàng & XP tức thì.
 * - Đóng đủ 9/9 thùng và nhổ neo nhận Đại Phần Thưởng: 3-5 Ruby 💎, vật tư quý và lượng lớn Vàng & XP!
 */

import { RESOURCES_CONFIG } from "./resourcesConfig.js";
import { getUnlockedResourcesForLevel } from "./orderBoardConfig.js";

export const HARBOR_UNLOCK_LEVEL = 6;
export const SHIP_DOCK_ROW = 14;
export const SHIP_DOCK_COL = 4; // Cầu cảng đá bến biển (Row 14, Col 4) & Thuyền buồm Caravel neo đậu giữa vịnh biển xanh

// Dải Biển & Vịnh Cảng Đại Dương (Royal Ocean Bay & Coast)
export const OCEAN_BAY_TILES = [
  {"r":0,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":0,"c":1,"tid":"m29_sea_var1_kelp_forest"},
  {"r":0,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":0,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":0,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":1,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":1,"c":1,"tid":"m29_sea_var1_kelp_forest"},
  {"r":1,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":1,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":1,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":2,"c":0,"tid":"m33_sea_var5_flying_fish"},
  {"r":2,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":2,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":2,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":2,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":3,"c":0,"tid":"m33_sea_var5_flying_fish"},
  {"r":3,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":3,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":3,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":3,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":4,"c":0,"tid":"m05_lighthouse_island"},
  {"r":4,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":4,"c":2,"tid":"m31_sea_var3_bell_buoy"},
  {"r":4,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":4,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":5,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":5,"c":1,"tid":"m34_sea_var6_bioluminescence"},
  {"r":5,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":5,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":5,"c":4,"tid":"c01_river_bend_ne"},
  {"r":6,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":6,"c":1,"tid":"m29_sea_var1_kelp_forest"},
  {"r":6,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":6,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":6,"c":4,"tid":"d11_canal_straight"},
  {"r":7,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":7,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":7,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":7,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":7,"c":4,"tid":"d11_canal_straight"},
  {"r":8,"c":0,"tid":"m57_sea_var5_sargasso_kelp_manta_ray"},
  {"r":8,"c":1,"tid":"m29_sea_var1_kelp_forest"},
  {"r":8,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":8,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":8,"c":4,"tid":"d11_canal_straight"},
  {"r":9,"c":0,"tid":"m33_sea_var5_flying_fish"},
  {"r":9,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":9,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":9,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":9,"c":4,"tid":"d11_canal_straight"},
  {"r":10,"c":0,"tid":"m05_lighthouse_island"},
  {"r":10,"c":1,"tid":"m29_sea_var1_kelp_forest"},
  {"r":10,"c":2,"tid":"m31_sea_var3_bell_buoy"},
  {"r":10,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":10,"c":4,"tid":"d11_canal_straight"},
  {"r":11,"c":0,"tid":"m47_coast_var1_breakwater_mole"},
  {"r":11,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":11,"c":2,"tid":"m34_sea_var6_bioluminescence"},
  {"r":11,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":11,"c":4,"tid":"d11_canal_straight"},
  {"r":12,"c":0,"tid":"m47_coast_var1_breakwater_mole"},
  {"r":12,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":12,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":12,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":12,"c":4,"tid":"c08_river_quay_dock"},
  {"r":13,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":13,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":13,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":13,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":13,"c":4,"tid":"m04_stone_harbor_pier"},
  {"r":14,"c":0,"tid":"m34_sea_var6_bioluminescence"},
  {"r":14,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":14,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":14,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":14,"c":4,"tid":"m04_stone_harbor_pier"},
  {"r":15,"c":0,"tid":"m33_sea_var5_flying_fish"},
  {"r":15,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":15,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":15,"c":3,"tid":"m30_sea_var2_coral_reef"},
  {"r":15,"c":4,"tid":"m04_stone_harbor_pier"},
  {"r":16,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":16,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":16,"c":2,"tid":"m31_sea_var3_bell_buoy"},
  {"r":16,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":16,"c":4,"tid":"r12_road_bridge_stone"},
  {"r":17,"c":0,"tid":"m07_sea_stacks_reef"},
  {"r":17,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":17,"c":2,"tid":"m01_sandy_beach_s"},
  {"r":17,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":17,"c":4,"tid":"c08_river_quay_dock"},
  {"r":18,"c":0,"tid":"m06_tropical_palm_island"},
  {"r":18,"c":1,"tid":"m01_sandy_beach_s"},
  {"r":18,"c":2,"tid":"m23_beach_var1_driftwood"},
  {"r":18,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":18,"c":4,"tid":"d11_canal_straight"},
  {"r":19,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":19,"c":1,"tid":"m01_sandy_beach_s"},
  {"r":19,"c":2,"tid":"m27_beach_var5_dune_boardwalk"},
  {"r":19,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":19,"c":4,"tid":"d11_canal_straight"},
  {"r":20,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":20,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":20,"c":2,"tid":"m01_sandy_beach_s"},
  {"r":20,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":20,"c":4,"tid":"c08_river_quay_dock"},
  {"r":21,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":21,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":21,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":21,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":21,"c":4,"tid":"d11_canal_straight"},
  {"r":22,"c":0,"tid":"m56_sea_var4_floating_lantern_festival"},
  {"r":22,"c":1,"tid":"m29_sea_var1_kelp_forest"},
  {"r":22,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":22,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":22,"c":4,"tid":"d11_canal_straight"},
  {"r":23,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":23,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":23,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":23,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":23,"c":4,"tid":"d11_canal_straight"},
  {"r":24,"c":0,"tid":"m07_sea_stacks_reef"},
  {"r":24,"c":1,"tid":"m30_sea_var2_coral_reef"},
  {"r":24,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":24,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":24,"c":4,"tid":"c04_river_bend_sw"},
  {"r":25,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":25,"c":1,"tid":"m33_sea_var5_flying_fish"},
  {"r":25,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":25,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":25,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":26,"c":0,"tid":"m06_tropical_palm_island"},
  {"r":26,"c":1,"tid":"m34_sea_var6_bioluminescence"},
  {"r":26,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":26,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":26,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":27,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":27,"c":1,"tid":"m33_sea_var5_flying_fish"},
  {"r":27,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":27,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":27,"c":4,"tid":"m23_beach_var1_driftwood"},
  {"r":28,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":28,"c":1,"tid":"m34_sea_var6_bioluminescence"},
  {"r":28,"c":2,"tid":"m30_sea_var2_coral_reef"},
  {"r":28,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":28,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":29,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":29,"c":1,"tid":"m29_sea_var1_kelp_forest"},
  {"r":29,"c":2,"tid":"m31_sea_var3_bell_buoy"},
  {"r":29,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":29,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":30,"c":0,"tid":"m05_lighthouse_island"},
  {"r":30,"c":1,"tid":"m29_sea_var1_kelp_forest"},
  {"r":30,"c":2,"tid":"m31_sea_var3_bell_buoy"},
  {"r":30,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":30,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":31,"c":0,"tid":"m30_sea_var2_coral_reef"},
  {"r":31,"c":1,"tid":"m29_sea_var1_kelp_forest"},
  {"r":31,"c":2,"tid":"m31_sea_var3_bell_buoy"},
  {"r":31,"c":3,"tid":"m01_sandy_beach_s"},
  {"r":31,"c":4,"tid":"m01_sandy_beach_s"},
  {"r":11,"c":5,"tid":"r36_road_var6_canal_willow_quay"},
  {"r":12,"c":5,"tid":"r01_road_straight_ns"},
  {"r":13,"c":5,"tid":"r01_road_straight_ns"},
  {"r":14,"c":5,"tid":"d07_streetlamps_signpost"},
  {"r":15,"c":5,"tid":"r01_road_straight_ns"},
  {"r":16,"c":5,"tid":"r02_road_straight_ew"},
  {"r":17,"c":5,"tid":"r01_road_straight_ns"}
];

export const SHIP_STAY_DURATION_MS = 15 * 60 * 1000; // 15 phút tàu đỗ tại bến
export const SHIP_COOLDOWN_MS = 10 * 60 * 1000;      // 10 phút giữa 2 chuyến tàu
export const SHIP_CALL_EARLY_GEMS = 2;               // 2 Ruby để gọi tàu tới ngay lập tức

// Danh mục tài nguyên theo từng khoang hàng
export const SHIP_HOLD_CATEGORIES = [
  {
    index: 0,
    name: "Khoang Nông Sản & Cây Quả",
    icon: "🌾",
    candidatePool: ["wheat", "corn", "carrot", "tomato", "strawberry", "cabbage", "pumpkin", "apple"],
    qtyRange: {
      wheat: [15, 25],
      corn: [8, 14],
      carrot: [10, 16],
      tomato: [8, 12],
      strawberry: [6, 10],
      cabbage: [6, 10],
      pumpkin: [4, 8],
      apple: [4, 6]
    }
  },
  {
    index: 1,
    name: "Khoang Chuồng Trại Bơ Sữa",
    icon: "🥛",
    candidatePool: ["egg", "milk", "wool", "butter"],
    qtyRange: {
      egg: [4, 7],
      milk: [3, 5],
      wool: [2, 4],
      butter: [2, 3]
    }
  },
  {
    index: 2,
    name: "Khoang Thủ Công & Kim Khí",
    icon: "🍞",
    candidatePool: ["bread", "ironTools", "fabric", "wine"],
    qtyRange: {
      bread: [3, 5],
      ironTools: [2, 3],
      fabric: [2, 3],
      wine: [2, 3]
    }
  }
];

/**
 * Tự động sinh một chuyến tàu buôn ngẫu nhiên với 3 khoang × 3 thùng = 9 thùng hàng
 * @param {number} playerLevel - Cấp độ người chơi (>= 6)
 */
export function generateCargoShip(playerLevel = 6) {
  const unlocked = getUnlockedResourcesForLevel(playerLevel);
  const cargoHolds = [];
  const previewGoods = [];

  SHIP_HOLD_CATEGORIES.forEach(holdCfg => {
    // Lọc các món đã mở khóa trong khoang này
    const available = holdCfg.candidatePool.filter(id => unlocked.includes(id));
    const selectedResId = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : holdCfg.candidatePool[0];

    previewGoods.push(selectedResId);

    const range = holdCfg.qtyRange[selectedResId] || [3, 6];
    const qtyPerCrate = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    const resCfg = RESOURCES_CONFIG[selectedResId] || { sellPrice: 10, name: selectedResId, icon: "📦" };

    // Thưởng cho mỗi thùng (thêm +35% vàng so với bán chợ)
    const goldPerCrate = Math.round(qtyPerCrate * (resCfg.sellPrice || 10) * 1.35);
    const xpPerCrate = Math.round(goldPerCrate * 0.6);

    const crates = [0, 1, 2].map(cIdx => ({
      id: `crate_${holdCfg.index}_${cIdx}`,
      holdIndex: holdCfg.index,
      crateIndex: cIdx,
      resId: selectedResId,
      resName: resCfg.name,
      resIcon: resCfg.icon,
      qty: qtyPerCrate,
      packed: false,
      rewardGold: goldPerCrate,
      rewardXP: xpPerCrate
    }));

    cargoHolds.push({
      holdIndex: holdCfg.index,
      holdName: holdCfg.name,
      holdIcon: holdCfg.icon,
      resId: selectedResId,
      crates
    });
  });

  // Đại phần thưởng khi đóng đủ 9/9 thùng
  const gemReward = Math.floor(Math.random() * 3) + 3; // 3 đến 5 Ruby 💎
  const bonusGold = Math.floor(Math.random() * 300) + 700; // 700 - 1000 🪙
  const bonusXP = Math.floor(Math.random() * 200) + 400;   // 400 - 600 ⭐

  // Vật tư giá trị cao ngẫu nhiên
  const rareSupplies = ["ironTools", "butter", "fabric", "bread"];
  const bonusSupplyId = rareSupplies[Math.floor(Math.random() * rareSupplies.length)];
  const bonusSupplyQty = 2;

  const now = Date.now();

  return {
    status: "docked",
    dockedAt: now,
    departsAt: now + SHIP_STAY_DURATION_MS,
    nextArrivalAt: 0,
    cargoHolds,
    grandReward: {
      gems: gemReward,
      gold: bonusGold,
      xp: bonusXP,
      supplyId: bonusSupplyId,
      supplyQty: bonusSupplyQty
    },
    nextPreviewGoods: previewGoods
  };
}
