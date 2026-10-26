// Configuration for Town Hall Achievements & Kingdom Medals

export const ACHIEVEMENTS_CONFIG = [
  {
    id: "ach_harvest_50",
    title: "Bậc Thầy Nông Nghiệp",
    desc: "Thu hoạch tổng cộng 50 lượt nông sản trên các luống đất.",
    icon: "🌾",
    category: "farming",
    target: 50,
    rewardGold: 500,
    rewardXP: 60,
    getProgress: (state) => state.harvestsCount || 0
  },
  {
    id: "ach_harvest_150",
    title: "Đại Nông Gia Vương Quốc",
    desc: "Thu hoạch tổng cộng 150 lượt nông sản trên các luống đất.",
    icon: "🚜",
    category: "farming",
    target: 150,
    rewardGold: 1500,
    rewardXP: 150,
    getProgress: (state) => state.harvestsCount || 0
  },
  {
    id: "ach_town_hall",
    title: "Trái Tim Vương Quốc",
    desc: "Nâng cấp Tòa Thị Chính lên Cấp 2 để mở rộng sảnh hội đồng và khánh thành tháp chuông đồng.",
    icon: "🏛️",
    category: "civic",
    target: 2,
    rewardGold: 600,
    rewardXP: 80,
    getProgress: (state) => (state.townHallLevel || 1)
  },
  {
    id: "ach_gold_2000",
    title: "Thương Gia Thịnh Vượng",
    desc: "Tích lũy đạt mốc 2,000 vàng trong ngân khố vương quốc.",
    icon: "🪙",
    category: "economy",
    target: 2000,
    rewardGold: 600,
    rewardXP: 80,
    getProgress: (state) => state.playerGold || 0
  },
  {
    id: "ach_gold_10000",
    title: "Triệu Phú Hoàng Gia",
    desc: "Tích lũy đạt mốc 10,000 vàng trong ngân khố vương quốc.",
    icon: "💰",
    category: "economy",
    target: 10000,
    rewardGold: 3000,
    rewardXP: 250,
    getProgress: (state) => state.playerGold || 0
  },
  {
    id: "ach_population_25",
    title: "Thị Trấn Phồn Vinh",
    desc: "Xây dựng nhà ở đạt tổng dân số 50 cư dân định cư.",
    icon: "👥",
    category: "civic",
    target: 50,
    rewardGold: 700,
    rewardXP: 90,
    getProgress: (state) => state.population || 0
  },
  {
    id: "ach_population_60",
    title: "Đại Đô Thị Trù Phú",
    desc: "Xây dựng khu dân cư sầm uất đạt mốc 100 cư dân thịnh vượng.",
    icon: "🏙️",
    category: "civic",
    target: 100,
    rewardGold: 2500,
    rewardXP: 220,
    getProgress: (state) => state.population || 0
  },
  {
    id: "ach_bread_stock_10",
    title: "Bếp Trưởng Danh Tiếng",
    desc: "Tích trữ đạt ít nhất 10 ổ Bánh Mì nướng thơm phức trong kho.",
    icon: "🍞",
    category: "farming",
    target: 10,
    rewardGold: 600,
    rewardXP: 75,
    getProgress: (state) => (state.resources?.bread || 0)
  },
  {
    id: "ach_tools_stock_10",
    title: "Lò Rèn Bất Diệt",
    desc: "Tích trữ đạt ít nhất 10 Bộ Dụng Cụ Sắt kiên cố trong kho.",
    icon: "⚒️",
    category: "economy",
    target: 10,
    rewardGold: 800,
    rewardXP: 100,
    getProgress: (state) => (state.resources?.ironTools || 0)
  },
  {
    id: "ach_land_chunks_8",
    title: "Khai Hoang Lãnh Thổ",
    desc: "Mở rộng và mở khóa ít nhất 8 vùng đất mới cho vương quốc.",
    icon: "🗺️",
    category: "civic",
    target: 8,
    rewardGold: 800,
    rewardXP: 100,
    getProgress: (state) => Math.max(0, (state.unlockedChunksCount || 16) - 16)
  },
  {
    id: "ach_level_5",
    title: "Thị Trưởng Tiên Phong",
    desc: "Đạt mốc Cấp Độ 5 của người chơi.",
    icon: "⭐",
    category: "mastery",
    target: 5,
    rewardGold: 1000,
    rewardXP: 120,
    getProgress: (state) => state.playerLevel || 1
  },
  {
    id: "ach_level_10",
    title: "Lãnh Chúa Đại Lục",
    desc: "Đạt mốc Cấp Độ 10 của người chơi.",
    icon: "👑",
    category: "mastery",
    target: 10,
    rewardGold: 3000,
    rewardXP: 300,
    getProgress: (state) => state.playerLevel || 1
  },
  {
    id: "ach_orchard_harvest",
    title: "Vườn Cây Trái Ngọt",
    desc: "Rung cây thu hoạch và tích trữ ít nhất 10 quả Táo Đỏ giòn trong kho.",
    icon: "🍎",
    category: "farming",
    target: 10,
    rewardGold: 750,
    rewardXP: 80,
    getProgress: (state) => (state.resources?.apple || 0)
  },
  {
    id: "ach_textile_master",
    title: "Thợ Dệt Thượng Thừa",
    desc: "Dệt và tích trữ ít nhất 8 xấp Vải Dệt thượng hạng may trang phục quý tộc.",
    icon: "🧵",
    category: "economy",
    target: 8,
    rewardGold: 900,
    rewardXP: 120,
    getProgress: (state) => (state.resources?.fabric || 0)
  },
  {
    id: "ach_butter_artisan",
    title: "Nghệ Nhân Bơ Sữa",
    desc: "Chế biến và tích trữ ít nhất 8 khối Bơ Sữa Vàng Óng 🧈 thơm ngon béo ngậy.",
    icon: "🧈",
    category: "economy",
    target: 8,
    rewardGold: 850,
    rewardXP: 110,
    getProgress: (state) => (state.resources?.butter || 0)
  },
  {
    id: "ach_order_board_deliveries",
    title: "Thương Gia Tận Tụy",
    desc: "Giao thành công ít nhất 10 đơn hàng nông sản & vật phẩm cho dân làng qua Bảng Đơn Hàng.",
    icon: "📋",
    category: "economy",
    target: 10,
    rewardGold: 1000,
    rewardXP: 150,
    getProgress: (state) => (state.orderBoard?.totalOrdersDelivered || 0)
  }
];
