// Crop Seeds and Agricultural Farming Configuration
// 10 diverse agricultural crops with detailed pixel art and market economy

export const CROPS_CONFIG = {
  wheat: {
    id: "wheat",
    name: "Lúa Mì Hoàng Kim",
    icon: "🌾",
    seedCost: 4,
    growTimeSec: 25,
    harvestYield: 3,
    harvestXP: 3,
    requiredLevel: 1,
    harvestResources: { wheat: 3 },
    desc: "Cấp 1 • Lúa mì hoàng kim (25s), cho 3 bó lúa mì để bán Chợ hoặc nướng bánh mì."
  },
  carrot: {
    id: "carrot",
    name: "Cà Rốt Nông Trang",
    icon: "🥕",
    seedCost: 8,
    growTimeSec: 45,
    harvestYield: 3,
    harvestXP: 5,
    requiredLevel: 1,
    harvestResources: { carrot: 3 },
    desc: "Cấp 1 • Củ cà rốt cam giòn ngọt (45s), thu hoạch 3 củ bán Chợ kiếm lời nhanh."
  },
  tomato: {
    id: "tomato",
    name: "Cà Chua Bi Đỏ",
    icon: "🍅",
    seedCost: 14,
    growTimeSec: 75,
    harvestYield: 3,
    harvestXP: 8,
    requiredLevel: 2,
    harvestResources: { tomato: 3 },
    desc: "Cấp 2 • Giàn cà chua mọng nước (1p15s), thu 3 quả mọng rất được dân làng ưa chuộng."
  },
  strawberry: {
    id: "strawberry",
    name: "Dâu Tây Đỏ Mọng",
    icon: "🍓",
    seedCost: 20,
    growTimeSec: 120,
    harvestYield: 3,
    harvestXP: 12,
    requiredLevel: 2,
    harvestResources: { strawberry: 3 },
    desc: "Cấp 2 • Bụi dâu tây đỏ rực (2p), thu 3 quả dâu thơm ngọt bán giá cao tại Chợ."
  },
  corn: {
    id: "corn",
    name: "Bắp Ngô Mật Ong",
    icon: "🌽",
    seedCost: 30,
    growTimeSec: 180,
    harvestYield: 3,
    harvestXP: 16,
    requiredLevel: 3,
    harvestResources: { corn: 3 },
    desc: "Cấp 3 • Thân cây ngô trĩu bắp (3p), thu 3 bắp ngô vàng óng bổ dưỡng làm thức ăn gia súc."
  },
  cabbage: {
    id: "cabbage",
    name: "Bắp Cải Xanh Giòn",
    icon: "🥬",
    seedCost: 42,
    growTimeSec: 240,
    harvestYield: 3,
    harvestXP: 20,
    requiredLevel: 3,
    harvestResources: { cabbage: 3 },
    desc: "Cấp 3 • Búp bắp cải cuộn chặt xanh mướt (4p), thu 3 cây bắp cải tươi ngon."
  },
  pumpkin: {
    id: "pumpkin",
    name: "Bí Ngô Khổng Lồ",
    icon: "🎃",
    seedCost: 55,
    growTimeSec: 300,
    harvestYield: 2,
    harvestXP: 28,
    requiredLevel: 4,
    harvestResources: { pumpkin: 2 },
    desc: "Cấp 4 • Quả bí ngô to tròn nhiều khía (5p), thu 2 quả bí ngô lễ hội bán lời lớn."
  },
  watermelon: {
    id: "watermelon",
    name: "Dưa Hấu Sọc Ngọt",
    icon: "🍉",
    seedCost: 75,
    growTimeSec: 420,
    harvestYield: 2,
    harvestXP: 35,
    requiredLevel: 4,
    harvestResources: { watermelon: 2 },
    desc: "Cấp 4 • Quả dưa hấu giải khát vỏ sọc xanh (7p), thu 2 quả dưa hấu thượng hạng."
  },
  grapes: {
    id: "grapes",
    name: "Nho Tím Hoàng Gia",
    icon: "🍇",
    seedCost: 100,
    growTimeSec: 540,
    harvestYield: 3,
    harvestXP: 45,
    requiredLevel: 5,
    harvestResources: { grapes: 3 },
    desc: "Cấp 5 • Giàn nho tím trĩu quả phủ phấn sương (9p), nguyên liệu quý bán cực chạy."
  },
  sunflower: {
    id: "sunflower",
    name: "Hoa Hướng Dương Vàng",
    icon: "🌻",
    seedCost: 140,
    growTimeSec: 600,
    harvestYield: 3,
    harvestXP: 55,
    requiredLevel: 6,
    harvestResources: { sunflower: 3 },
    desc: "Cấp 6 • Đóa hướng dương khổng lồ đón nắng (10p), thu 3 đóa hoa rực rỡ siêu giá trị."
  }
};
