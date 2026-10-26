// Configuration for Order Board, NPC Customers, and Order Generation Logic
import { RESOURCES_CONFIG } from "./resourcesConfig.js";

export const ORDER_BOARD_SLOTS_COUNT = 6;
export const ORDER_DISCARD_COOLDOWN_SEC = 180; // 3 phút đếm ngược khi xé đơn bằng thùng rác

/**
 * Danh sách 10 NPC khách hàng vương quốc với tính cách, vai trò và lời thoại độc đáo
 */
export const NPC_CUSTOMERS = [
  {
    id: "npc_marie",
    name: "Bà Marie",
    role: "Bếp trưởng hoàng gia",
    avatar: "👩‍🍳",
    accentColor: "#f59e0b",
    dialogues: [
      "Ta đang chuẩn bị yến tiệc hoàng gia, cần nông sản tươi ngon gấp!",
      "Hôm nay lâu đài đón đoàn quý khách phương xa, hãy giúp ta gom đồ nhé.",
      "Bếp bánh hoàng gia đang đỏ lửa, thiếu vài món này là chưa trọn vẹn đâu."
    ],
    preferred: ["wheat", "egg", "milk", "butter", "bread", "carrot", "apple"]
  },
  {
    id: "npc_angus",
    name: "Bác Angus",
    role: "Thợ rèn thị trấn",
    avatar: "🧔",
    accentColor: "#ef4444",
    dialogues: [
      "Lò rèn đỏ lửa suốt đêm, cần lương thực chắc bụng cho các anh em thợ!",
      "Ta đang rèn mẻ khiên giáp mới, cần tiếp tế thêm chút năng lượng.",
      "Đồ ăn trang trại nuôi dưỡng cánh tay lực lưỡng của người thợ rèn!"
    ],
    preferred: ["corn", "cabbage", "ironTools", "bread", "wheat", "pumpkin"]
  },
  {
    id: "npc_lily",
    name: "Bé Lily",
    role: "Cư dân nhí yêu động vật",
    avatar: "👧",
    accentColor: "#ec4899",
    dialogues: [
      "Em đang gom hoa quả ngọt lành để làm tiệc sinh nhật cho thú cưng!",
      "Trái cây trang trại nhà mình ngọt thơm nhất vùng luôn ạ!",
      "Em muốn chia sẻ các món ngon này với các bạn nhỏ trong làng."
    ],
    preferred: ["strawberry", "apple", "carrot", "watermelon", "egg"]
  },
  {
    id: "npc_marco",
    name: "Thương nhân Marco",
    role: "Đoàn buôn phương xa",
    avatar: "👳",
    accentColor: "#8b5cf6",
    dialogues: [
      "Đoàn xe sắp qua sa mạc, thương hội ta sẵn sàng trả giá cao cho hàng chất lượng!",
      "Hàng hóa vương quốc của bạn nức tiếng bốn phương, ta muốn mua tích trữ.",
      "Chuyến viễn chinh kế tiếp cần những đặc sản thượng hạng này."
    ],
    preferred: ["wool", "fabric", "wine", "grapes", "sunflower", "butter", "coconut"]
  },
  {
    id: "npc_lancelot",
    name: "Hiệp sĩ Lancelot",
    role: "Hộ vệ thành trì",
    avatar: "🛡️",
    accentColor: "#3b82f6",
    dialogues: [
      "Đội kỵ binh chuẩn bị xuất quân tuần tra biên giới, cần tiếp tế lương khô!",
      "Chiến mã và chiến binh cần dòng sữa thơm cùng bánh mì chắc bụng.",
      "Nhờ sự tiếp tế của nông trang, thành trì vương quốc luôn vững như bàn thạch."
    ],
    preferred: ["bread", "milk", "butter", "ironTools", "wheat", "corn"]
  },
  {
    id: "npc_rosalind",
    name: "Tiểu thư Rosalind",
    role: "Quý tộc lâu đài",
    avatar: "💃",
    accentColor: "#a855f7",
    dialogues: [
      "Tiệc trà chiều của các quý cô không thể thiếu những thức quà béo ngậy này.",
      "Vải vóc thượng hạng và bơ vàng thơm ngát, ta sẽ trả giá thật hậu hĩnh!",
      "Một chút thi vị ngọt ngào từ đồng quê cho dinh thự nguy nga."
    ],
    preferred: ["butter", "fabric", "wine", "grapes", "strawberry", "apple"]
  },
  {
    id: "npc_elric",
    name: "Dược sư Elric",
    role: "Dược sư thảo mộc",
    avatar: "🧙",
    accentColor: "#10b981",
    dialogues: [
      "Những quả mọng và hoa thảo mộc này là dược liệu quý cho thần dược chữa lành.",
      "Phòng bào chế thuốc đang rất cần thêm thảo quả tươi mới hái.",
      "Cây trái thuần khiết của thiên nhiên nuôi dưỡng trí tuệ pháp thuật."
    ],
    preferred: ["sunflower", "tomato", "tamarind", "coconut", "pumpkin"]
  },
  {
    id: "npc_giles",
    name: "Lão nông Giles",
    role: "Lão nông cần cù",
    avatar: "👨‍🌾",
    accentColor: "#84cc16",
    dialogues: [
      "Làng bên mất mùa, nông dân chúng ta hãy san sẻ củ quả giúp đỡ bà con.",
      "Được mùa trúng giá, chia sẻ nông sản mang lại phước lành cho đất mẹ.",
      "Hạt giống và rau củ của bạn luôn tươi ngon nhất vùng."
    ],
    preferred: ["wheat", "carrot", "tomato", "cabbage", "corn", "pumpkin"]
  },
  {
    id: "npc_pierre",
    name: "Đầu bếp Pierre",
    role: "Chủ quán trọ Tudor",
    avatar: "👨‍🍳",
    accentColor: "#eab308",
    dialogues: [
      "Thực khách phương xa kéo đến nườm nượp, bếp quán trọ đang cháy hàng!",
      "Món súp hầm gia truyền của quán trọ nhất định phải có các nguyên liệu này.",
      "Giao nhanh giúp ta nhé, bia bơ và rượu vang đang chờ bạn bên quán trọ!"
    ],
    preferred: ["egg", "milk", "bread", "butter", "carrot", "tomato", "wine"]
  },
  {
    id: "npc_jack",
    name: "Thủy thủ Jack",
    role: "Thuyền trưởng viễn chinh",
    avatar: "⚓",
    accentColor: "#06b6d4",
    dialogues: [
      "Gió đã thuận buồm, chỉ chờ đủ lương thảo là thuyền hải hành nhổ neo!",
      "Nước dừa và trái cây chua ngọt là thần dược chống say sóng trên đại dương.",
      "Hải cảng luôn mở rộng cửa đón nông sản hảo hạng từ làng bạn."
    ],
    preferred: ["coconut", "tamarind", "bread", "wine", "watermelon"]
  }
];

/**
 * Phân bố tài nguyên mở khóa theo từng cấp độ người chơi
 */
export const LEVEL_UNLOCKED_RESOURCES = {
  1: ["wheat", "carrot", "egg"],
  2: ["tomato", "strawberry", "bread"],
  3: ["corn", "cabbage", "milk"],
  4: ["pumpkin", "watermelon", "apple", "ironTools", "butter"],
  5: ["grapes"],
  6: ["sunflower", "wool", "tamarind"],
  7: ["coconut"],
  8: ["fabric"],
  22: ["wine"]
};

/**
 * Lấy danh sách tài nguyên người chơi đã có khả năng sản xuất theo cấp độ
 */
export function getUnlockedResourcesForLevel(playerLevel = 1) {
  const lvl = Math.max(1, playerLevel || 1);
  const res = [];
  for (const [reqLvlStr, items] of Object.entries(LEVEL_UNLOCKED_RESOURCES)) {
    const reqLvl = parseInt(reqLvlStr, 10);
    if (lvl >= reqLvl) {
      res.push(...items);
    }
  }
  return res.length > 0 ? res : ["wheat", "carrot", "egg"];
}

/**
 * Tự động tạo một đơn hàng ngẫu nhiên do hệ thống sinh cho NPC
 * @param {number} playerLevel - Cấp độ hiện tại của người chơi
 * @param {Array} existingOrders - Các đơn hàng đang có trên bảng (để tránh trùng lặp)
 */
export function generateRandomOrder(playerLevel = 1, existingOrders = []) {
  const unlocked = getUnlockedResourcesForLevel(playerLevel);

  // Chọn NPC ngẫu nhiên (ưu tiên NPC chưa xuất hiện trên các ô còn lại)
  const existingNpcIds = existingOrders.map(o => o?.npc?.id).filter(Boolean);
  let availableNpcs = NPC_CUSTOMERS.filter(npc => !existingNpcIds.includes(npc.id));
  if (availableNpcs.length === 0) availableNpcs = NPC_CUSTOMERS;
  const npc = availableNpcs[Math.floor(Math.random() * availableNpcs.length)];

  // Số lượng loại mặt hàng yêu cầu (1 - 3 món)
  let itemCount = 1;
  if (playerLevel >= 4) {
    itemCount = Math.random() < 0.35 ? 3 : 2;
  } else if (playerLevel >= 2) {
    itemCount = Math.random() < 0.6 ? 2 : 1;
  }

  // Ưu tiên các món mà NPC này thích, nếu đã mở khóa
  const preferredAvailable = unlocked.filter(r => npc.preferred.includes(r));
  const pool = preferredAvailable.length >= itemCount ? preferredAvailable : unlocked;

  // Lấy ngẫu nhiên các món không trùng nhau
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selectedResourceIds = shuffled.slice(0, itemCount);

  const items = [];
  let baseGoldValue = 0;

  selectedResourceIds.forEach(resId => {
    const cfg = RESOURCES_CONFIG[resId] || { sellPrice: 10, name: resId, icon: "📦" };
    // Số lượng tùy theo độ hiếm / giá trị món hàng
    let qty = 1;
    if (cfg.sellPrice <= 10) {
      qty = Math.floor(Math.random() * 3) + 2; // 2 - 4
    } else if (cfg.sellPrice <= 35) {
      qty = Math.floor(Math.random() * 2) + 2; // 2 - 3
    } else if (cfg.sellPrice <= 75) {
      qty = Math.floor(Math.random() * 2) + 1; // 1 - 2
    } else {
      qty = 1; // 1
    }

    items.push({
      resourceId: resId,
      name: cfg.name,
      icon: cfg.icon,
      amount: qty,
      unitPrice: cfg.sellPrice
    });

    baseGoldValue += cfg.sellPrice * qty;
  });

  // Thưởng vàng: Tăng 25% - 40% so với bán Chợ thông thường + Thưởng cố định
  const bonusMultiplier = 1.25 + Math.random() * 0.15;
  const rewardGold = Math.round(baseGoldValue * bonusMultiplier) + 12;

  // Thưởng XP: Khuyến khích làm đơn hàng nhưng giữ nhịp độ lên cấp hợp lý
  const totalItemCount = items.reduce((sum, it) => sum + it.amount, 0);
  const rewardXP = 12 + totalItemCount * 5 + Math.floor((playerLevel || 1) * 2);

  const dialogue = npc.dialogues[Math.floor(Math.random() * npc.dialogues.length)];

  return {
    id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    npc: {
      id: npc.id,
      name: npc.name,
      role: npc.role,
      avatar: npc.avatar,
      accentColor: npc.accentColor
    },
    dialogue,
    items,
    rewardGold,
    rewardXP,
    createdAt: Date.now()
  };
}
