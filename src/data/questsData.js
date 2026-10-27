// Sequential Quests configuration for Deep Gameplay & Kingdom Quest Book
// 6 Progressive Chapters with 28 rich quests rewarding Gold 🪙 and Player XP ⭐

export const QUEST_CHAPTERS = [
  { id: 1, title: "Chương I: Đặt Móng Lập Làng", desc: "Khai hoang đất đai, cày luống đất đầu tiên và xây dựng mái ấm" },
  { id: 2, title: "Chương II: Mùa Màng Bội Thu", desc: "Gieo trồng ngũ cốc, dùng liềm gặt nhanh và xây cối xay gió" },
  { id: 3, title: "Chương III: Ẩm Thực & Thương Nghiệp", desc: "Nướng bánh mì thơm lừng, mở chợ buôn bán và đón dân làng" },
  { id: 4, title: "Chương IV: Kim Khí & Thủ Công", desc: "Đỏ lửa xưởng rèn, chế tác nông cụ sắt và mở rộng bờ cõi" },
  { id: 5, title: "Chương V: Đô Thị Phồn Hoa", desc: "Xây đài phun nước, đèn đường lung linh và phát triển đại nông trang" },
  { id: 6, title: "Chương VI: Đại Đế Quốc Vĩnh Cửu", desc: "Xây tòa thị chính, quy tụ trăm dân và trở thành huyền thoại đại lục" }
];

export const QUESTS_CONFIG = [
  // --- CHƯƠNG I: ĐẶT MÓNG LẬP LÀNG ---
  {
    id: "q1_farmland",
    chapter: 1,
    title: "Mở rộng đất canh tác",
    desc: "Mở Cửa Hàng và xây dựng đạt ít nhất 6 luống đất nông trại để mở rộng quy mô gieo trồng.",
    icon: "🌱",
    target: 6,
    rewardGold: 80,
    rewardXP: 30,
    checkType: "farmland_count"
  },
  {
    id: "q2_shelter",
    chapter: 1,
    requires: "q1_farmland",
    title: "Dựng thêm mái nhà tranh",
    desc: "Xây dựng đạt ít nhất 2 ngôi nhà ở dân cư để đón thêm người dân đến định cư.",
    icon: "🏡",
    target: 2,
    rewardGold: 120,
    rewardXP: 45,
    rewardResources: { wheat: 2 },
    checkType: "residential_count"
  },
  {
    id: "q3_roads",
    chapter: 1,
    requires: "q2_shelter",
    title: "Mở rộng mạng lưới đường sá",
    desc: "Lát đường sá đạt mốc 30 ô để kết nối thông suốt các khu vực trong vương quốc.",
    icon: "🛤️",
    target: 30,
    rewardGold: 100,
    rewardXP: 40,
    checkType: "road_count"
  },
  {
    id: "q4_first_harvest",
    chapter: 1,
    requires: "q3_roads",
    title: "Mùa gặt đầu tiên",
    desc: "Gieo hạt giống Lúa mì hoặc Cà rốt và thu hoạch thành công ít nhất 3 lần.",
    icon: "🌾",
    target: 3,
    rewardGold: 140,
    rewardXP: 60,
    rewardResources: { wheat: 3 },
    checkType: "harvest_count"
  },
  {
    id: "q5_level2",
    chapter: 1,
    requires: "q4_first_harvest",
    title: "Thăng cấp Nông Dân",
    desc: "Tích lũy kinh nghiệm từ trồng trọt và xây dựng để đạt Cấp 2.",
    icon: "⭐",
    target: 2,
    rewardGold: 160,
    rewardXP: 80,
    checkType: "player_level"
  },

  // --- CHƯƠNG II: MÙA MÀNG BỘI THU ---
  {
    id: "q6_expand_farm",
    chapter: 2,
    requires: "q5_level2",
    title: "Mở rộng nông trang",
    desc: "Quy hoạch và đặt ít nhất 6 ô đất trồng trọt để tăng sản lượng lương thực.",
    icon: "🪴",
    target: 6,
    rewardGold: 150,
    rewardXP: 65,
    checkType: "farmland_count"
  },
  {
    id: "q7_windmill",
    chapter: 2,
    requires: "q6_expand_farm",
    title: "Cánh quạt đón gió",
    desc: "Xây 1 Cối xay gió để tự động thu hoạch bao lúa mì và tích trữ nguyên liệu.",
    icon: "💨",
    target: 1,
    rewardGold: 180,
    rewardXP: 75,
    rewardResources: { wheat: 5 },
    checkType: "specific_tile",
    tileId: "b04_windmill"
  },
  {
    id: "q8_sickle_harvest",
    chapter: 2,
    requires: "q7_windmill",
    title: "Đôi tay thoăn thoắt",
    desc: "Giữ vào cây chín rồi trượt qua các luống để thu hoạch hàng loạt, hoàn thành tổng cộng 10 lượt thu hoạch.",
    icon: "🌾",
    target: 10,
    rewardGold: 200,
    rewardXP: 90,
    checkType: "harvest_count"
  },
  {
    id: "q8b_chicken_coop",
    chapter: 2,
    requires: "q8_sickle_harvest",
    title: "Chăn nuôi đàn gà",
    desc: "Mở Cửa Hàng Nông Trại và xây 1 Chuồng Gà Đẻ Trứng để nuôi gà lấy trứng tươi.",
    icon: "🐔",
    target: 1,
    rewardGold: 180,
    rewardXP: 85,
    rewardResources: { egg: 2 },
    checkType: "specific_tile",
    tileId: "b21_chicken_coop"
  },
  {
    id: "q8c_fresh_eggs",
    chapter: 2,
    requires: "q8b_chicken_coop",
    title: "Trứng gà tươi ngon",
    desc: "Cho gà ăn lúa mì và tích trữ ít nhất 4 quả Trứng gà tươi 🥚 trong kho.",
    icon: "🥚",
    target: 4,
    rewardGold: 200,
    rewardXP: 90,
    checkType: "resource_total",
    resourceId: "egg"
  },
  {
    id: "q9_nature_decor",
    chapter: 2,
    requires: "q8c_fresh_eggs",
    title: "Cảnh quan thanh bình",
    desc: "Đặt ít nhất 4 cây sồi, vườn thông hoặc thảm hoa rực rỡ làm đẹp cảnh thôn dã.",
    icon: "🌸",
    target: 4,
    rewardGold: 120,
    rewardXP: 50,
    checkType: "decor_count"
  },
  {
    id: "q10_tudor_inn",
    chapter: 2,
    requires: "q9_nature_decor",
    title: "Quán trọ đón khách",
    desc: "Xây Quán trọ Tudor để đón các thương nhân phương xa ghé thăm.",
    icon: "🍺",
    target: 1,
    rewardGold: 220,
    rewardXP: 100,
    checkType: "specific_tile",
    tileId: "b02_tudor_inn"
  },

  // --- CHƯƠNG III: ẨM THỰC & THƯƠNG NGHIỆP ---
  {
    id: "q11_level3",
    chapter: 3,
    requires: "q10_tudor_inn",
    title: "Thăng cấp Chủ Trang Trại",
    desc: "Tích lũy kinh nghiệm để vươn lên Cấp 3 và mở khóa Lò bánh mì nóng hổi.",
    icon: "⭐",
    target: 3,
    rewardGold: 250,
    rewardXP: 120,
    checkType: "player_level"
  },
  {
    id: "q11b_town_hall",
    chapter: 3,
    requires: "q11_level3",
    title: "Trái tim vương quốc: Tòa Thị Chính",
    desc: "Xây 1 Tòa Thị Chính tại trung tâm làng để quản lý sự vụ và mở khóa Bảng Thành Tựu đại lục.",
    icon: "🏛️",
    target: 1,
    rewardGold: 450,
    rewardXP: 180,
    checkType: "specific_tile",
    tileId: "b14_town_hall"
  },
  {
    id: "q12_bakery",
    chapter: 3,
    requires: "q11_level3",
    title: "Hương vị bánh mì nóng",
    desc: "Xây 1 Tiệm bánh mì để nướng lúa mì từ cối xay thành những ổ bánh thơm phức.",
    icon: "🍞",
    target: 1,
    rewardGold: 240,
    rewardXP: 110,
    rewardResources: { bread: 4 },
    checkType: "specific_tile",
    tileId: "b06_bakery"
  },
  {
    id: "q12b_cow_pasture",
    chapter: 3,
    requires: "q12_bakery",
    title: "Chuồng trại bò sữa",
    desc: "Xây 1 Chuồng Bò Sữa phong cách Hay Day để chăn thả đàn bò sữa béo tốt.",
    icon: "🐄",
    target: 1,
    rewardGold: 250,
    rewardXP: 115,
    rewardResources: { milk: 2 },
    checkType: "specific_tile",
    tileId: "b22_cow_pasture"
  },
  {
    id: "q12c_fresh_milk",
    chapter: 3,
    requires: "q12b_cow_pasture",
    title: "Dòng sữa béo ngậy",
    desc: "Cho bò ăn bắp ngô và thu hoạch tích trữ ít nhất 4 bình Sữa tươi 🥛 thơm ngon.",
    icon: "🥛",
    target: 4,
    rewardGold: 260,
    rewardXP: 120,
    checkType: "resource_total",
    resourceId: "milk"
  },
  {
    id: "q13_bread_stock",
    chapter: 3,
    requires: "q12c_fresh_milk",
    title: "Lương thực dồi dào",
    desc: "Tích trữ đạt ít nhất 6 ổ Bánh mì 🍞 trong kho hàng vương quốc.",
    icon: "🍞",
    target: 6,
    rewardGold: 260,
    rewardXP: 130,
    checkType: "resource_total",
    resourceId: "bread"
  },
  {
    id: "q14_population15",
    chapter: 3,
    requires: "q13_bread_stock",
    title: "Làng quê đông đúc",
    desc: "Quy hoạch và xây dựng thêm nhà ở để đạt mốc 15 cư dân sinh sống.",
    icon: "👥",
    target: 15,
    rewardGold: 280,
    rewardXP: 140,
    checkType: "population"
  },
  {
    id: "q15_fountain",
    chapter: 3,
    requires: "q14_population15",
    title: "Quảng trường nước mát",
    desc: "Xây 1 Đài phun nước đá làm trung tâm sinh hoạt của dân làng.",
    icon: "⛲",
    target: 1,
    rewardGold: 200,
    rewardXP: 90,
    checkType: "specific_tile",
    tileId: "d01_plaza_fountain"
  },
  {
    id: "q15b_plant_apple_tree",
    chapter: 3,
    requires: "q15_fountain",
    title: "Vườn Táo Đầu Mùa",
    desc: "Trồng 1 Cây Táo Đỏ lâu năm ngoài bãi cỏ để chuẩn bị thu hoạch những quả táo giòn ngọt.",
    icon: "🍎",
    target: 1,
    rewardGold: 220,
    rewardXP: 100,
    checkType: "specific_tile",
    tileId: "d21_apple_tree"
  },

  // --- CHƯƠNG IV: KIM KHÍ & THỦ CÔNG ---
  {
    id: "q16_level4",
    chapter: 4,
    requires: "q15b_plant_apple_tree",
    title: "Thương Gia Trù Phú",
    desc: "Đạt mốc Cấp 4 để mở khóa Xưởng rèn kim khí và các giống cây cao cấp.",
    icon: "⭐",
    target: 4,
    rewardGold: 320,
    rewardXP: 160,
    checkType: "player_level"
  },
  {
    id: "q17_blacksmith",
    chapter: 4,
    requires: "q16_level4",
    title: "Bếp lửa rực hồng",
    desc: "Xây 1 Lò rèn để sản xuất Dụng cụ sắt ⚒️ phục vụ xây dựng hiện đại.",
    icon: "⚒️",
    target: 1,
    rewardGold: 300,
    rewardXP: 150,
    rewardResources: { ironTools: 3 },
    checkType: "specific_tile",
    tileId: "b03_blacksmith_forge"
  },
  {
    id: "q18_iron_stock",
    chapter: 4,
    requires: "q17_blacksmith",
    title: "Kho nông cụ sắc bén",
    desc: "Chế tác và tích trữ đạt ít nhất 5 bộ Dụng cụ sắt ⚒️ trong kho hàng.",
    icon: "⚒️",
    target: 5,
    rewardGold: 320,
    rewardXP: 160,
    checkType: "resource_total",
    resourceId: "ironTools"
  },
  {
    id: "q19_expand_land",
    chapter: 4,
    requires: "q18_iron_stock",
    title: "Mở mang bờ cõi",
    desc: "Mua và mở khóa đạt ít nhất 20 mảnh đất trên đại lục vương quốc.",
    icon: "🗺️",
    target: 20,
    rewardGold: 350,
    rewardXP: 180,
    checkType: "land_unlocked"
  },
  {
    id: "q20_watermill",
    chapter: 4,
    requires: "q19_expand_land",
    title: "Thủy xa bên sông",
    desc: "Xây 1 Cối xay nước bên kênh hỗ trợ vận chuyển bột và nông sản.",
    icon: "🌊",
    target: 1,
    rewardGold: 300,
    rewardXP: 150,
    checkType: "specific_tile",
    tileId: "b05_watermill"
  },
  {
    id: "q20b_sheep_pasture",
    chapter: 4,
    requires: "q20_watermill",
    title: "Đàn cừu bông trắng",
    desc: "Xây 1 Chuồng Cừu Lấy Lông để nuôi dưỡng đàn cừu xén lông mềm mại.",
    icon: "🐑",
    target: 1,
    rewardGold: 340,
    rewardXP: 170,
    checkType: "specific_tile",
    tileId: "b57_sheep_pasture"
  },
  {
    id: "q20c_harvest_wool",
    chapter: 4,
    requires: "q20b_sheep_pasture",
    title: "Xén lông cừu tươi",
    desc: "Cho cừu ăn cà rốt và thu hoạch tích trữ ít nhất 4 Bó lông cừu 🐑 trong kho.",
    icon: "🐑",
    target: 4,
    rewardGold: 350,
    rewardXP: 180,
    checkType: "resource_total",
    resourceId: "wool"
  },
  {
    id: "q20c2_dairy_factory",
    chapter: 4,
    requires: "q20c_harvest_wool",
    title: "Xưởng Bơ Sữa",
    desc: "Xây 1 Xưởng Chế Biến Bơ Sữa để chế biến dòng sữa bò tươi thành bơ vàng béo ngậy.",
    icon: "🧈",
    target: 1,
    rewardGold: 340,
    rewardXP: 170,
    checkType: "specific_tile",
    tileId: "b59_dairy_factory"
  },
  {
    id: "q20c3_churn_butter",
    chapter: 4,
    requires: "q20c2_dairy_factory",
    title: "Bơ vàng óng thơm ngon",
    desc: "Khuấy bơ từ sữa bò và tích trữ đạt ít nhất 3 Khối Bơ sữa 🧈 trong kho hàng.",
    icon: "🧈",
    target: 3,
    rewardGold: 380,
    rewardXP: 190,
    checkType: "resource_total",
    resourceId: "butter"
  },
  {
    id: "q20d_coconut_grove",
    chapter: 4,
    requires: "q20c3_churn_butter",
    title: "Rặng Dừa Ven Biển",
    desc: "Trồng 1 Cây Dừa Xiêm soi bóng mát bên bờ kênh hoặc thảm cỏ để thu hoạch dừa ngọt mát lành.",
    icon: "🥥",
    target: 1,
    rewardGold: 280,
    rewardXP: 140,
    checkType: "specific_tile",
    tileId: "d22_coconut_palm"
  },

  // --- CHƯƠNG V: ĐÔ THỊ PHỒN HOA ---
  {
    id: "q21_level5",
    chapter: 5,
    requires: "q20d_coconut_grove",
    title: "Thị Trưởng Năng Động",
    desc: "Nâng cao uy thế và phát triển kinh tế vương quốc đạt mốc Cấp 5.",
    icon: "⭐",
    target: 5,
    rewardGold: 450,
    rewardXP: 220,
    checkType: "player_level"
  },
  {
    id: "q22_streetlamps",
    chapter: 5,
    requires: "q21_level5",
    title: "Phố đêm rực rỡ",
    desc: "Đặt ít nhất 4 cột đèn đường tỏa sáng vàng ấm áp khi hoàng hôn và đêm buông xuống.",
    icon: "🏮",
    target: 4,
    rewardGold: 250,
    rewardXP: 120,
    checkType: "specific_tile",
    tileId: "d07_streetlamps_signpost"
  },
  {
    id: "q23_super_harvest",
    chapter: 5,
    requires: "q22_streetlamps",
    title: "Đại nông gia",
    desc: "Tích cực trồng trọt bí ngô, dưa hấu, đạt tổng cộng 25 lượt thu hoạch mùa màng.",
    icon: "🍉",
    target: 25,
    rewardGold: 400,
    rewardXP: 200,
    checkType: "harvest_count"
  },
  {
    id: "q23b_textile_mill",
    chapter: 5,
    requires: "q23_super_harvest",
    title: "Xưởng dệt vương quốc",
    desc: "Xây 1 Xưởng Dệt Vải Vóc để lấy lông cừu dệt thành lụa là cao cấp.",
    icon: "🧵",
    target: 1,
    rewardGold: 420,
    rewardXP: 210,
    checkType: "specific_tile",
    tileId: "b58_textile_mill"
  },
  {
    id: "q23c_weave_fabric",
    chapter: 5,
    requires: "q23b_textile_mill",
    title: "Gấm vóc hoàng gia",
    desc: "Dệt vải từ lông cừu và tích trữ đạt ít nhất 3 xấp Vải dệt thượng hạng 🧵 trong kho hàng.",
    icon: "🧵",
    target: 3,
    rewardGold: 450,
    rewardXP: 230,
    checkType: "resource_total",
    resourceId: "fabric"
  },
  {
    id: "q24_population25",
    chapter: 5,
    requires: "q23c_weave_fabric",
    title: "Kinh đô đông đúc",
    desc: "Phát triển làng quê đạt mốc 25 cư dân sinh sống và làm việc rộn ràng.",
    icon: "👥",
    target: 25,
    rewardGold: 500,
    rewardXP: 250,
    checkType: "population"
  },

  // --- CHƯƠNG VI: ĐẠI ĐẾ QUỐC VĨNH CỬU ---
  {
    id: "q25_level6",
    chapter: 6,
    requires: "q24_population25",
    title: "Lãnh Chúa Phồn Vinh",
    desc: "Đạt mốc Cấp 6 – danh hiệu lãnh chúa vương giả được thần dân ca tụng muôn nơi.",
    icon: "👑",
    target: 6,
    rewardGold: 600,
    rewardXP: 300,
    checkType: "player_level"
  },
  {
    id: "q26_noble_manor",
    chapter: 6,
    requires: "q25_level6",
    title: "Dinh thự quý tộc nguy nga",
    desc: "Xây 1 Dinh thự quý tộc tráng lệ để chào đón các công tước hoàng gia.",
    icon: "🏰",
    target: 1,
    rewardGold: 900,
    rewardXP: 450,
    checkType: "specific_tile",
    tileId: "b20_noble_manor"
  },
  {
    id: "q27_wizard_sanctum",
    chapter: 6,
    requires: "q26_noble_manor",
    title: "Tháp pháp sư huyền bí",
    desc: "Xây 1 Tháp pháp sư thạch anh tím để bảo hộ vương quốc bình an muôn đời.",
    icon: "🔮",
    target: 1,
    rewardGold: 800,
    rewardXP: 400,
    checkType: "specific_tile",
    tileId: "b10_wizard_tower"
  },
  {
    id: "q28_legendary_empire",
    chapter: 6,
    requires: "q27_wizard_sanctum",
    title: "Đại Đế Quốc Bất Tử",
    desc: "Đạt đỉnh cao thịnh vượng: mở rộng ít nhất 24 mảnh đất và đạt 40 cư dân cư trú.",
    icon: "🏆",
    target: 40,
    rewardGold: 1200,
    rewardXP: 600,
    checkType: "population"
  }
];

export function isQuestUnlocked(quest, claimedQuests = {}) {
  if (!quest.requires) return true;
  return !!claimedQuests[quest.requires];
}

export function getQuestById(id) {
  return QUESTS_CONFIG.find(q => q.id === id);
}
