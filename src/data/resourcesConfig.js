// Configuration for resources, storage capacity, market trading, and production chains

import { ADDITIONAL_CROPS } from "./additionalCrops.js";
import {FRUIT_TREES_CONFIG} from "./fruitTreeConfig.js";
export {FRUIT_TREES_CONFIG};

export const RESOURCE_MAX_CAPACITY = 999;
export const INITIAL_STORAGE_CAPACITY = 300; // Sức chứa khởi đầu Kho Tổng Hợp

// Danh mục nông sản chỉ chứa trong Kho Silo
export const SILO_RESOURCE_IDS = [
  "wheat", "carrot", "tomato", "strawberry", "corn",
  "cabbage", "pumpkin", "watermelon", "grapes", "sunflower",
  "apple", "coconut", "tamarind", ...Object.values(FRUIT_TREES_CONFIG).filter(c=>c.sellPrice).map(c=>c.fruitId), ...ADDITIONAL_CROPS.map(crop => crop.id)
];

// Danh mục sản phẩm chăn nuôi & thành phẩm nhà máy chứa trong Kho Barn
export const BARN_RESOURCE_IDS = [
  'ancientWood',
  "egg", "milk", "meat", "roastPork", "wool", "bread", "butter", "fabric", "ironTools", "wine", "wood", "stone", "ironOre", "plank", "buildingStone", "ironIngot"
];

// Kho Tổng Hợp chứa toàn bộ tài nguyên mà Silo và Barn cũ từng tách riêng.
export const WAREHOUSE_RESOURCE_IDS = [...new Set([...SILO_RESOURCE_IDS, ...BARN_RESOURCE_IDS])];

export function isSiloResource(resId) {
  return SILO_RESOURCE_IDS.includes(resId);
}

export function isBarnResource(resId) {
  return BARN_RESOURCE_IDS.includes(resId);
}

export function getSiloUsed(resources) {
  if (!resources) return 0;
  return SILO_RESOURCE_IDS.reduce((sum, id) => sum + (resources[id] || 0), 0);
}

export function getBarnUsed(resources) {
  if (!resources) return 0;
  return BARN_RESOURCE_IDS.reduce((sum, id) => sum + (resources[id] || 0), 0);
}

export function getWarehouseUsed(resources) {
  if (!resources) return 0;
  return WAREHOUSE_RESOURCE_IDS.reduce((sum, id) => sum + (resources[id] || 0), 0);
}

export const RESOURCES_CONFIG = {
  ancientWood:{id:'ancientWood',name:'Gỗ cổ thụ',category:'material',icon:'🌳',sellPrice:20,maxCapacity:RESOURCE_MAX_CAPACITY,unitName:'khúc',desc:'Trạm kiểm lâm thu hoạch tại Rừng Cổ Thụ. Dùng làm nhiệm vụ và chế tác kỷ vật.'},
  ironOre: { id:'ironOre', name:'Quặng sắt', category:'material', icon:'⛏️', sellPrice:6, maxCapacity:RESOURCE_MAX_CAPACITY, unitName:'cục', desc:'Công nhân Mỏ sắt mang về; luyện tại Lò rèn để lấy thỏi sắt.' },
  plank: { id:'plank', name:'Ván gỗ', category:'material', icon:'🪵', sellPrice:10, maxCapacity:RESOURCE_MAX_CAPACITY, unitName:'tấm', desc:'Chế biến 2 gỗ nguyên liệu tại Xưởng mộc.' },
  buildingStone: { id:'buildingStone', name:'Đá xây dựng', category:'material', icon:'🧱', sellPrice:12, maxCapacity:RESOURCE_MAX_CAPACITY, unitName:'khối', desc:'Gia công 2 đá nguyên liệu tại Xưởng khai thác đá.' },
  ironIngot: { id:'ironIngot', name:'Thỏi sắt', category:'material', icon:'🔩', sellPrice:16, maxCapacity:RESOURCE_MAX_CAPACITY, unitName:'thỏi', desc:'Luyện 2 quặng sắt và 1 gỗ tại Lò rèn; dùng chế tác dụng cụ.' },
  wood: { id:'wood', name:'Gỗ nguyên liệu', category:'material', icon:'🪵', sellPrice:4, maxCapacity:RESOURCE_MAX_CAPACITY, unitName:'khúc', desc:'Công nhân Xưởng mộc mang từ rừng khai thác về kho.' },
  stone: { id:'stone', name:'Đá nguyên liệu', category:'material', icon:'🪨', sellPrice:5, maxCapacity:RESOURCE_MAX_CAPACITY, unitName:'khối', desc:'Công nhân Xưởng khai thác đá mang từ bãi đá về kho.' },
  ...Object.fromEntries(ADDITIONAL_CROPS.map(crop => [crop.id, {
    id: crop.id, name: crop.name, icon: crop.icon, category: "crop",
    sellPrice: crop.sellPrice, unitName: crop.unitName, maxCapacity: RESOURCE_MAX_CAPACITY,
    desc: `Thu hoạch ${crop.name.toLowerCase()} từ luống trồng, cất trong Kho Tổng Hợp hoặc bán tại Chợ.`
  }])),
  // === Nông sản trồng trọt từ luống đất ===
  wheat: {
    id: "wheat",
    name: "Lúa mì",
    category: "crop",
    icon: "🌾",
    sellPrice: 5,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "bó",
    desc: "Thu hoạch từ ruộng lúa hoặc Cối xay gió. Dùng nướng bánh mì hoặc bán cho lái buôn."
  },
  carrot: {
    id: "carrot",
    name: "Cà rốt",
    category: "crop",
    icon: "🥕",
    sellPrice: 9,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "củ",
    desc: "Cà rốt giòn ngọt giàu dinh dưỡng, món ưa thích của các gia đình trong làng."
  },
  tomato: {
    id: "tomato",
    name: "Cà chua bi",
    category: "crop",
    icon: "🍅",
    sellPrice: 15,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "quả",
    desc: "Cà chua chín đỏ mọng nước, dùng chế biến món ăn và bán đắt hàng tại Chợ."
  },
  strawberry: {
    id: "strawberry",
    name: "Dâu tây",
    category: "crop",
    icon: "🍓",
    sellPrice: 22,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "quả",
    desc: "Quả mọng đỏ tươi ngát hương, các thương nhân trả giá rất hậu hĩnh."
  },
  corn: {
    id: "corn",
    name: "Bắp ngô",
    category: "crop",
    icon: "🌽",
    sellPrice: 32,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "bắp",
    desc: "Bắp ngô vàng óng chắc hạt, lương thực giàu năng lượng cho thợ rèn và dân làng."
  },
  cabbage: {
    id: "cabbage",
    name: "Bắp cải",
    category: "crop",
    icon: "🥬",
    sellPrice: 45,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "cây",
    desc: "Rau bắp cải xanh cuộn chắc nịch, nguyên liệu không thể thiếu cho các bữa tiệc làng."
  },
  pumpkin: {
    id: "pumpkin",
    name: "Bí ngô",
    category: "crop",
    icon: "🎃",
    sellPrice: 75,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "quả",
    desc: "Bí ngô khổng lồ mùa lễ hội, bán được khối vàng lớn cho thị trưởng thành phố."
  },
  watermelon: {
    id: "watermelon",
    name: "Dưa hấu",
    category: "crop",
    icon: "🍉",
    sellPrice: 110,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "quả",
    desc: "Dưa hấu giải khát ngọt lịm ruột đỏ vỏ xanh, trái cây cao cấp bán siêu lời."
  },
  grapes: {
    id: "grapes",
    name: "Nho tím",
    category: "crop",
    icon: "🍇",
    sellPrice: 95,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "chùm",
    desc: "Nho tím mọng phủ phấn trắng tinh túy, được mua về ủ các mẻ rượu hoàng gia."
  },
  sunflower: {
    id: "sunflower",
    name: "Hướng dương",
    category: "crop",
    icon: "🌻",
    sellPrice: 140,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "đóa",
    desc: "Hoa hướng dương rực rỡ mang lại hạt giống thơm ngon và chiết xuất dầu hoa quý giá."
  },

  // === Hàng thủ công chế biến từ công trình làng ===
  bread: {
    id: "bread",
    name: "Bánh mì nướng",
    category: "crafted",
    icon: "🍞",
    sellPrice: 25,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "ổ bánh",
    desc: "Nướng từ Lò bánh mì (tiêu hao 1 Lúa mì). Nguồn thực phẩm chính nuôi sống dân làng, bán được giá cao."
  },
  ironTools: {
    id: "ironTools",
    name: "Dụng cụ sắt",
    category: "crafted",
    icon: "⚒️",
    sellPrice: 50,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "bộ dụng cụ",
    desc: "Chế tác tại Lò rèn từ 1 thỏi sắt và 1 ván gỗ. Dùng nâng cấp công trình hoặc bán cho thương nhân."
  },

  // === Chăn nuôi chuồng trại phong cách Hay Day ===
  egg: {
    id: "egg",
    name: "Trứng gà tươi",
    category: "livestock",
    icon: "🥚",
    sellPrice: 18,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "quả",
    desc: "Thu hoạch từ Chuồng gà (tiêu hao 1 Lúa mì). Nông sản đắt giá được dân làng ưa chuộng."
  },
  roastPork: { id: "roastPork", name: "Thịt heo nướng", category: "crafted", icon: "🍖", sellPrice: 110, maxCapacity: RESOURCE_MAX_CAPACITY, unitName: "đĩa", desc: "Chế biến tại Nhà Hàng Thịt Nướng từ 2 thịt heo và 1 cà rốt." },
  meat: { id: "meat", name: "Thịt heo", category: "livestock", icon: "🥩", sellPrice: 35, maxCapacity: RESOURCE_MAX_CAPACITY, unitName: "phần", desc: "Thu hoạch từ Chuồng Heo sau khi cho ăn bắp ngô. Cất trong Kho Tổng Hợp hoặc bán tại Chợ." },
  milk: {
    id: "milk",
    name: "Bình sữa tươi",
    category: "livestock",
    icon: "🥛",
    sellPrice: 35,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "bình",
    desc: "Thu hoạch từ Chuồng bò sữa (tiêu hao 1 Bắp ngô). Dòng sữa nguyên chất béo ngậy giá trị cao."
  },
  wool: {
    id: "wool",
    name: "Lông cừu",
    category: "livestock",
    icon: "🐑",
    sellPrice: 42,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "bó",
    desc: "Thu hoạch từ việc xén lông cừu (tiêu hao 1 Cà rốt 🥕). Bông lông cừu mềm mại, nguyên liệu cho Xưởng dệt vải hoặc bán kiếm vàng."
  },
  fabric: {
    id: "fabric",
    name: "Vải dệt thượng hạng",
    category: "crafted",
    icon: "🧵",
    sellPrice: 85,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "xấp vải",
    desc: "Dệt từ Xưởng dệt vải (tiêu hao 1 Lông cừu 🐑). Vải vóc cao cấp may trang phục quý tộc và xuất khẩu cho thương gia."
  },
  butter: {
    id: "butter",
    name: "Bơ sữa vàng óng",
    category: "crafted",
    icon: "🧈",
    sellPrice: 75,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "khối",
    desc: "Chế biến từ Xưởng Bơ Sữa (tiêu hao 1 Bình sữa tươi 🥛). Hương vị béo ngậy thơm ngon, giá trị kinh tế rất cao tại Chợ."
  },
  wine: {
    id: "wine",
    name: "Rượu vang hoàng gia",
    category: "crafted",
    icon: "🍷",
    sellPrice: 160,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "chai",
    desc: "Ủ từ Hầm rượu vang (tiêu hao 1 Nho tím 🍇). Thức uống danh giá của các bậc công hầu quý tộc, bán siêu lời."
  },

  // === Cây ăn quả thân gỗ lâu năm ngoài đồng cỏ (Fruit Trees) ===
  apple: {
    id: "apple",
    name: "Táo đỏ giòn",
    category: "fruit",
    icon: "🍎",
    sellPrice: 28,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "quả",
    desc: "Hái từ Cây táo đỏ trồng tự do ngoài bãi cỏ. Vị giòn ngọt thanh mát, rất được ưa chuộng tại Chợ làng."
  },
  coconut: {
    id: "coconut",
    name: "Dừa xiêm ngọt",
    category: "fruit",
    icon: "🥥",
    sellPrice: 45,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "trái",
    desc: "Thu hoạch từ Cây dừa xiêm trĩu quả. Dòng nước dừa ngọt lịm giải nhiệt trưa hè vùng đảo."
  },
  tamarind: {
    id: "tamarind",
    name: "Trái me chua ngọt",
    category: "fruit",
    icon: "🍈",
    sellPrice: 38,
    maxCapacity: RESOURCE_MAX_CAPACITY,
    unitName: "chùm",
    desc: "Hái từ Cây me cổ thụ. Hương vị chua ngọt đậm đà dùng làm mứt và thức uống bổ dưỡng."
  }
};

// Cấu hình cây ăn quả độc lập trồng trên bãi cỏ
for(const cfg of Object.values(FRUIT_TREES_CONFIG).filter(c=>c.sellPrice)){
  RESOURCES_CONFIG[cfg.fruitId]={id:cfg.fruitId,name:cfg.fruitName,category:"fruit",icon:cfg.icon,sellPrice:cfg.sellPrice,maxCapacity:RESOURCE_MAX_CAPACITY,unitName:"quả",desc:"Thu hoạch từ "+cfg.name+"."};
}

// Production rules for specific buildings
export const RESOURCE_CHAINS = {
  // Cối xay gió: sản xuất lúa mì độc lập
  "b04_windmill": {
    type: "producer",
    consumes: null,
    produces: {
      resourceId: "wheat",
      amount: 1,
      goldBonus: 5
    },
    intervalSec: 45,
    icon: "🌾",
    productName: "Lúa mì"
  },
  // Lò bánh mì: chuỗi chế biến tiêu thụ lúa mì
  "b06_bakery": {
    type: "processor",
    consumes: {
      resourceId: "wheat",
      amount: 1
    },
    produces: {
      resourceId: "bread",
      amount: 1,
      goldBonus: 10
    },
    intervalSec: 60,
    icon: "🍞",
    productName: "Bánh mì",
    warningIcon: "⚠️🌾",
    warningText: "Thiếu Lúa mì"
  },
  // Multi-recipe processors use PRODUCTION_RECIPES instead of an automatic input.
  "b03_blacksmith_forge": {
    type: "processor",
    manualQueue: true,
    recipes: ["ironIngot", "ironTools"],
    consumes: null,
    produces: {
      resourceId: "ironTools",
      amount: 1,
      goldBonus: 0
    },
    intervalSec: 90,
    icon: "⚒️",
    productName: "Dụng cụ sắt"
  },
  // Quán trọ Tudor: phát sinh doanh thu vàng trực tiếp
  "b02_tudor_inn": {
    type: "revenue",
    consumes: null,
    produces: {
      resourceId: null,
      rewardGold: 75
    },
    intervalSec: 90,
    icon: "🍺",
    productName: "Thuế quán trọ"
  },
  // Cối xay nước: phát sinh doanh thu vàng trực tiếp
  "b05_watermill": {
    type: "revenue",
    consumes: null,
    produces: {
      resourceId: null,
      rewardGold: 35
    },
    intervalSec: 45,
    icon: "💧",
    productName: "Nước sạch"
  },
  // Chuồng Cừu: sản xuất lông cừu từ cà rốt
  "b57_sheep_pasture": {
    type: "processor",
    consumes: {
      resourceId: "carrot",
      amount: 1
    },
    produces: {
      resourceId: "wool",
      amount: 2,
      goldBonus: 35
    },
    intervalSec: 60,
    icon: "🐑",
    productName: "Lông cừu",
    warningIcon: "⚠️🥕",
    warningText: "Cần Cà rốt"
  },
  // Xưởng Dệt Vải: chế biến lông cừu thành vải dệt
  "b58_textile_mill": {
    type: "processor",
    consumes: {
      resourceId: "wool",
      amount: 1
    },
    produces: {
      resourceId: "fabric",
      amount: 1,
      goldBonus: 65
    },
    intervalSec: 75,
    icon: "🧵",
    productName: "Vải dệt",
    warningIcon: "⚠️🐑",
    warningText: "Cần Lông cừu"
  },
  // Xưởng Bơ Sữa: chế biến sữa bò tươi thành bơ vàng óng
  "b59_dairy_factory": {
    type: "processor",
    consumes: {
      resourceId: "milk",
      amount: 1
    },
    produces: {
      resourceId: "butter",
      amount: 1,
      goldBonus: 45
    },
    intervalSec: 60,
    icon: "🧈",
    productName: "Bơ sữa",
    warningIcon: "⚠️🥛",
    warningText: "Cần Sữa tươi"
  },
  // Hầm Rượu Vang: ủ nho thành rượu vang hảo hạng
  "b47_winery_press_barn_sw": {
    type: "processor",
    consumes: {
      resourceId: "grapes",
      amount: 1
    },
    produces: {
      resourceId: "wine",
      amount: 1,
      goldBonus: 85
    },
    intervalSec: 90,
    icon: "🍷",
    productName: "Rượu vang",
    warningIcon: "⚠️🍇",
    warningText: "Cần Nho tím"
  },
  "b48_winery_press_barn_se": {
    type: "processor",
    consumes: {
      resourceId: "grapes",
      amount: 1
    },
    produces: {
      resourceId: "wine",
      amount: 1,
      goldBonus: 85
    },
    intervalSec: 90,
    icon: "🍷",
    productName: "Rượu vang",
    warningIcon: "⚠️🍇",
    warningText: "Cần Nho tím"
  },
  // Cây Ăn Quả Độc Lập Trồng Trên Cỏ
  "d21_apple_tree": {
    type: "producer",
    consumes: null,
    produces: {
      resourceId: "apple",
      amount: 3,
      goldBonus: 20
    },
    intervalSec: 45,
    icon: "🍎",
    productName: "Táo đỏ giòn"
  },
  "d22_coconut_palm": {
    type: "producer",
    consumes: null,
    produces: {
      resourceId: "coconut",
      amount: 2,
      goldBonus: 32
    },
    intervalSec: 60,
    icon: "🥥",
    productName: "Dừa xiêm ngọt"
  },
  "d23_tamarind_tree": {
    type: "producer",
    consumes: null,
    produces: {
      resourceId: "tamarind",
      amount: 3,
      goldBonus: 25
    },
    intervalSec: 50,
    icon: "🍈",
    productName: "Trái me chua ngọt"
  }
};

// Shared fruit-tree producer rules for all eight species.
for(const [id,cfg] of Object.entries(FRUIT_TREES_CONFIG)){
 RESOURCE_CHAINS[id]={type:"producer",consumes:null,produces:{resourceId:cfg.fruitId,amount:cfg.yieldQty,goldBonus:cfg.rewardGold},intervalSec:cfg.intervalSec,icon:cfg.icon,productName:cfg.fruitName};
}
