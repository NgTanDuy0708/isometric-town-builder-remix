// Building upgrades configuration (Levels 1 to 3)
import { EXPANSION_UPGRADES } from './expansionCatalog.js';

export const MAX_BUILDING_LEVEL = 3;

export const UPGRADES_CONFIG = {
  ...EXPANSION_UPGRADES,
  // Nhà tranh ấm cúng
  "b01_cottage_red": {
    maxLevel: 3,
    2: {
      costGold: 60,
      costResources: { ironTools: 1 },
      durationSec: 8,
      population: 8, // +4 dân
      desc: "Gia cố mái ngói và thêm gác xép: Sức chứa tăng lên 8 cư dân (thêm +4 👥)."
    },
    3: {
      costGold: 120,
      costResources: { ironTools: 2, bread: 2 },
      durationSec: 15,
      population: 14, // +6 dân
      desc: "Nâng cấp biệt phủ 2 tầng: Sức chứa tăng lên 14 cư dân (thêm +6 👥)."
    }
  },

  // Quán trọ Tudor
  "b02_tudor_inn": {
    maxLevel: 3,
    2: {
      costGold: 160,
      costResources: { ironTools: 2 },
      durationSec: 12,
      population: 14, // +6 dân
      revenueGold: 80, // Thuế quán trọ tăng từ 50 -> 80
      desc: "Mở rộng sảnh tiệc và thêm phòng nghỉ: Thu nhập tăng lên 80 🪙/30s, dân số 14 👥."
    },
    3: {
      costGold: 300,
      costResources: { ironTools: 4, bread: 5 },
      durationSec: 22,
      population: 22, // +8 dân
      revenueGold: 130, // Thuế quán trọ tăng lên 130
      desc: "Khu phức hợp lữ quán hoàng gia: Thu nhập đạt 130 🪙/30s, dân số 22 👥."
    }
  },

  // Cối xay gió
  "b04_windmill": {
    maxLevel: 3,
    2: {
      costGold: 110,
      costResources: { ironTools: 1 },
      durationSec: 10,
      resourceYield: 2, // 2 Lúa mì mỗi 15s
      goldBonus: 10,
      desc: "Lắp cánh quạt bọc vải buồm mới: Sản lượng tăng gấp đôi (2 bao Lúa mì 🌾 + 10 🪙 / 15s)."
    },
    3: {
      costGold: 220,
      costResources: { ironTools: 3, bread: 3 },
      durationSec: 18,
      resourceYield: 3, // 3 Lúa mì mỗi 15s
      goldBonus: 20,
      desc: "Trục quay cơ khí cao cấp: Đạt năng suất tối đa (3 bao Lúa mì 🌾 + 20 🪙 / 15s)."
    }
  },

  // Lò bánh mì
  "b06_bakery": {
    maxLevel: 3,
    2: {
      costGold: 130,
      costResources: { ironTools: 2 },
      durationSec: 12,
      resourceYield: 2, // 2 Bánh mì mỗi 20s
      consumeAmount: 2, // tiêu 2 lúa mì
      goldBonus: 20,
      desc: "Lắp đặt lò nướng vòm đá kép: Nướng được 2 ổ Bánh mì 🍞 (tiêu 2 lúa) + 20 🪙 / 20s."
    },
    3: {
      costGold: 260,
      costResources: { ironTools: 4 },
      durationSec: 20,
      resourceYield: 3, // 3 Bánh mì mỗi 20s
      consumeAmount: 3, // tiêu 3 lúa mì
      goldBonus: 35,
      desc: "Lò bánh hoàng gia cỡ lớn: Nướng được 3 ổ Bánh mì 🍞 (tiêu 3 lúa) + 35 🪙 / 20s."
    }
  },

  // Lò rèn
  "b03_blacksmith_forge": {
    maxLevel: 3,
    2: {
      costGold: 160,
      costResources: { bread: 6 }, // Cung cấp bánh mì cho thợ rèn
      durationSec: 14,
      resourceYield: 2, // 2 Dụng cụ mỗi 30s
      goldBonus: 30,
      desc: "Trang bị bễ thổi lửa thủy lực: Chế tác 2 bộ Dụng cụ sắt ⚒️ + 30 🪙 / 30s."
    },
    3: {
      costGold: 320,
      costResources: { bread: 12, ironTools: 2 },
      durationSec: 24,
      resourceYield: 3, // 3 Dụng cụ mỗi 30s
      goldBonus: 50,
      desc: "Xưởng rèn thép vũ khí vương triều: Sản xuất 3 bộ Dụng cụ sắt ⚒️ + 50 🪙 / 30s."
    }
  },

  // Cối xay nước
  "b05_watermill": {
    maxLevel: 3,
    2: {
      costGold: 120,
      costResources: { ironTools: 1 },
      durationSec: 10,
      revenueGold: 55, // Nước sạch tăng lên 55
      desc: "Guồng nước đôi trợ lực: Tăng doanh thu nước sạch lên 55 🪙 / 18s."
    },
    3: {
      costGold: 240,
      costResources: { ironTools: 3 },
      durationSec: 18,
      revenueGold: 90, // Tăng lên 90
      desc: "Hệ thống kênh dẫn dòng tự động: Doanh thu tối đa đạt 90 🪙 / 18s."
    }
  },

  // Vườn ươm thảo dược & Nhà kính
  "b07_apothecary": {
    maxLevel: 3,
    2: {
      costGold: 140,
      costResources: { ironTools: 1 },
      durationSec: 10,
      population: 6,
      desc: "Mở rộng vườn kính & ươm thảo dược: Sức chứa tăng lên 6 cư dân (thêm +3 👥), nâng cao y tế làng."
    },
    3: {
      costGold: 260,
      costResources: { ironTools: 2, bread: 3 },
      durationSec: 18,
      population: 10,
      desc: "Viện điều chế thảo dược hoàng gia: Sức chứa tăng lên 10 cư dân (thêm +4 👥) thảo dược sư tinh hoa."
    }
  },

  // Tòa thị chính & Tháp chuông
  "b14_town_hall": {
    maxLevel: 3,
    2: {
      costGold: 200,
      costResources: { ironTools: 2, bread: 4 },
      durationSec: 15,
      population: 24,
      desc: "Khánh thành tháp chuông đồng & sảnh hội đồng: Sức chứa quan chức tăng lên 24 👥 cư dân (+8 quan chức)."
    },
    3: {
      costGold: 400,
      costResources: { ironTools: 5, bread: 8 },
      durationSec: 25,
      population: 36,
      desc: "Dinh thống đốc nguy nga: Sức chứa triều đình lên tới 36 👥 cư dân (+12 quan chức)."
    }
  },

  // Dinh thự quý tộc
  "b20_noble_manor": {
    maxLevel: 3,
    2: {
      costGold: 250,
      costResources: { ironTools: 3, bread: 5 },
      durationSec: 16,
      population: 16,
      desc: "Mở rộng cánh biệt phủ phía Tây: Sức chứa 16 👥 gia nhân và quý tộc."
    },
    3: {
      costGold: 450,
      costResources: { ironTools: 6, bread: 10 },
      durationSec: 28,
      population: 26,
      desc: "Lâu đài quý tộc tráng lệ: Sức chứa lên tới 26 👥 cư dân danh giá."
    }
  },

  // Tháp canh bảo an
  "b08_watchtower": {
    maxLevel: 3,
    2: {
      costGold: 90,
      costResources: { ironTools: 1 },
      durationSec: 8,
      population: 4,
      desc: "Gia cố chòi canh & cung tên: Đồn trú 4 👥 vệ binh giữ gìn an ninh."
    },
    3: {
      costGold: 180,
      costResources: { ironTools: 2 },
      durationSec: 14,
      population: 8,
      desc: "Pháo đài tiền tiêu kiên cố: Đồn trú 8 👥 hiệp sĩ hoàng gia bảo vệ vương quốc."
    }
  },

  // Nhà nguyện đá
  "b09_chapel": {
    maxLevel: 3,
    2: {
      costGold: 130,
      costResources: { ironTools: 1 },
      durationSec: 10,
      population: 5,
      desc: "Lắp đặt chuông đồng & tranh kính màu: Nơi tịnh tâm của 5 👥 tu sĩ."
    },
    3: {
      costGold: 260,
      costResources: { ironTools: 3, bread: 4 },
      durationSec: 18,
      population: 10,
      desc: "Thánh đường nguy nga: Đón tiếp 10 👥 giáo dân hành hương phụng sự vương quốc."
    }
  },

  // Chuồng gà đẻ trứng
  "b21_chicken_coop": {
    maxLevel: 3,
    2: {
      costGold: 70,
      costResources: { ironTools: 1 },
      durationSec: 8,
      resourceYield: 3,
      goldBonus: 10,
      desc: "Gia cố chuồng ổ rơm & thêm máng ăn tự động: Đẻ 3 Trứng gà 🥚 + 30 🪙 / 15s."
    },
    3: {
      costGold: 140,
      costResources: { ironTools: 2, wheat: 5 },
      durationSec: 14,
      resourceYield: 4,
      goldBonus: 25,
      desc: "Khu chuồng trại gia cầm sinh thái tiện nghi: Đẻ 4 Trứng gà 🥚 + 45 🪙 / 15s."
    }
  },

  // Chuồng bò sữa
  "b22_cow_pasture": {
    maxLevel: 3,
    2: {
      costGold: 110,
      costResources: { ironTools: 1 },
      durationSec: 10,
      resourceYield: 3,
      goldBonus: 25,
      desc: "Máng cỏ sạch & thiết bị vắt sữa cải tiến: Vắt được 3 Bình sữa tươi 🥛 + 70 🪙 / 22s."
    },
    3: {
      costGold: 220,
      costResources: { ironTools: 3, corn: 5 },
      durationSec: 18,
      resourceYield: 4,
      goldBonus: 55,
      desc: "Đồng cỏ tươi hữu cơ & dây chuyền thanh trùng: Vắt được 4 Bình sữa tươi 🥛 + 100 🪙 / 22s."
    }
  },

  // Chuồng cừu lấy lông
  "b57_sheep_pasture": {
    maxLevel: 3,
    2: {
      costGold: 140,
      costResources: { ironTools: 2 },
      durationSec: 12,
      resourceYield: 3,
      goldBonus: 30,
      desc: "Máng ăn tự động & kéo xén lông bén ngót: Thu hoạch 3 Bó lông cừu 🐑 + 60 🪙."
    },
    3: {
      costGold: 280,
      costResources: { ironTools: 3, carrot: 6 },
      durationSec: 20,
      resourceYield: 4,
      goldBonus: 65,
      desc: "Đồng cỏ cừu sinh thái thảo nguyên: Thu hoạch 4 Bó lông cừu 🐑 hảo hạng + 95 🪙."
    }
  },

  // Xưởng dệt vải vóc
  "b58_textile_mill": {
    maxLevel: 3,
    2: {
      costGold: 220,
      costResources: { ironTools: 2, wool: 2 },
      durationSec: 15,
      resourceYield: 2,
      goldBonus: 45,
      desc: "Khung dệt thoi bay cải tiến: Lấy lông cừu dệt 2 Xấp vải 🧵 + 100 🪙 mỗi mẻ."
    },
    3: {
      costGold: 450,
      costResources: { ironTools: 4, wool: 5 },
      durationSec: 25,
      resourceYield: 3,
      goldBonus: 100,
      desc: "Xưởng dệt gấm vóc hoàng gia: Lấy lông cừu dệt 3 Xấp vải 🧵 thượng hạng + 155 🪙."
    }
  },

  // Xưởng chế biến bơ sữa
  "b59_dairy_factory": {
    maxLevel: 3,
    2: {
      costGold: 200,
      costResources: { ironTools: 2, milk: 2 },
      durationSec: 15,
      resourceYield: 2,
      goldBonus: 35,
      desc: "Thùng khuấy bơ cơ giới: Tiêu thụ 1 Sữa tươi làm ra 2 Khối bơ vàng 🧈 + 80 🪙 mỗi mẻ."
    },
    3: {
      costGold: 400,
      costResources: { ironTools: 4, milk: 4 },
      durationSec: 25,
      resourceYield: 3,
      goldBonus: 75,
      desc: "Dây chuyền ép bơ sữa hoàng gia: Tiêu thụ 1 Sữa tươi làm ra 3 Khối bơ vàng 🧈 béo ngậy + 120 🪙."
    }
  }
};

/**
 * Get upgrade data for next level of building
 */
UPGRADES_CONFIG.d33_pig_pen_barn = {
  ...UPGRADES_CONFIG.b22_cow_pasture,
  2: { ...UPGRADES_CONFIG.b22_cow_pasture[2], desc: "Cải tiến chuồng và máng ăn. Nuôi tối đa 4 heo, mỗi heo được cho ăn tạo 1 phần thịt sau 75 giây." },
  3: { ...UPGRADES_CONFIG.b22_cow_pasture[3], desc: "Chuồng heo hoàn thiện. Nuôi tối đa 4 heo, mỗi heo được cho ăn tạo 1 phần thịt sau 75 giây." }
};

export function getNextUpgrade(tileId, currentLevel = 1) {
  const cfg = UPGRADES_CONFIG[tileId];
  if (!cfg) return null;
  const nextLevel = currentLevel + 1;
  if (nextLevel > cfg.maxLevel) return null;
  const levelData = cfg[nextLevel];
  if (!levelData) return null;
  return {
    nextLevel,
    icon: levelData.icon || (nextLevel === 3 ? "🌟" : "⭐"),
    desc: levelData.desc || levelData.benefitText || "Nâng cấp gia tăng hiệu quả công trình.",
    benefitText: levelData.benefitText || levelData.desc || "Nâng cấp gia tăng hiệu quả công trình.",
    ...levelData
  };
}

/**
 * Get population provided by building taking level into account
 */
export function getBuildingLevelPopulation(tileId, level = 1, basePop = 2) {
  const cfg = UPGRADES_CONFIG[tileId];
  if (level > 1 && cfg && cfg[level] && typeof cfg[level].population === "number") {
    return cfg[level].population;
  }
  return basePop;
}
