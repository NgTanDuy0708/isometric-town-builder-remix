// Tile catalog metadata - Cleaned: only items with real images
import { FENCE_TILES } from "./fenceConfig.js";
import {PREMIUM_TILES} from './premiumConfig.js';
import { EXPANSION_TILES, EXPANSION_VARIANT_TILES } from "./expansionCatalog.js";

export const TILES_DATA = [
  ...PREMIUM_TILES,
  {id:'b69_forester_lodge',label:'Trạm kiểm lâm',category:'building',shopCategory:'production',doc:'Thuê công nhân khai thác gỗ cổ thụ riêng tại Rừng Cổ Thụ.'},
  {id:'n04_ancient_grove',label:'Cây cổ thụ',category:'decoration',shopCategory:'hidden',doc:'Nguồn gỗ cổ thụ tại vùng rừng; khai thác bằng Trạm kiểm lâm.'},
  {id:'b68_mage_academy',label:'Học viện pháp sư',category:'building',shopCategory:'production',doc:'Huấn luyện pháp sư tầm xa, phép gây sát thương quanh mục tiêu. Mỗi người giữ 1 dân và dùng lương thực chung. Mở cấp 8, học viện cấp 1 có 2 chỗ.'},
  {id:'b67_guard_barracks',label:'Trại huấn luyện vệ binh',category:'building',shopCategory:'production',doc:'Huấn luyện lính cận chiến bằng dân rảnh, vàng và dụng cụ sắt. Lính tự chặn goblin, dùng chung lương thực với công nhân. Cấp 1 có 2 chỗ.'},
  { id:'b66_iron_mine', label:'Mỏ sắt', category:'building', shopCategory:'production', doc:'Thuê dân rảnh khai thác quặng sắt về Kho Tổng Hợp; dùng Lò rèn để luyện thỏi và chế tác dụng cụ.' },
  { id:'n03_iron_deposit', label:'Mạch quặng sắt tự nhiên', category:'decoration', doc:'Điểm quặng cho công nhân Mỏ sắt; hồi phục sau khi cạn.' },
  { id:'b65_stone_quarry', label:'Xưởng khai thác đá', category:'building', shopCategory:'production', doc:'Thuê dân rảnh khai thác đá rồi mang về Kho Tổng Hợp. Ban đầu có 2 chỗ làm việc.' },
  { id:'n01_logging_grove', label:'Rừng khai thác tự nhiên', category:'decoration', doc:'Điểm gỗ tự nhiên cho công nhân Xưởng mộc; hồi phục sau khi cạn.' },
  { id:'n02_stone_deposit', label:'Bãi đá tự nhiên', category:'decoration', doc:'Điểm đá tự nhiên cho công nhân khai thác; hồi phục sau khi cạn.' },
  {
    id: 'b64_bbq_restaurant', label: 'Nhà Hàng Thịt Nướng', category: 'building', shopCategory: 'production',
    doc: 'Nhà hàng thịt nướng có 3 cấp độ. Chế biến 2 thịt heo và 1 cà rốt thành 1 đĩa thịt heo nướng; nâng cấp để nấu nhanh hơn.'
  },
  {
    "id": "d33_pig_pen_barn",
    "label": "Chuồng Heo",
    "category": "building",
    "doc": "Nuôi tối đa 4 con heo. Cho ăn bắp ngô, thu hoạch thịt heo sau 75 giây."
  },
  {
    "id": "b01_cottage_red",
    "label": "Nhà Tranh Ấm Cúng",
    "category": "building",
    "doc": "Nhà tranh gỗ ấm cúng với mái tranh vàng, thùng hứng nước mưa và đống củi sưởi (Tăng +4 dân số)."
  },
  {
    "id": "b02_tudor_inn",
    "label": "Quán Trọ Tudor",
    "category": "building",
    "doc": "Quán trọ và lữ quán Tudor 2 tầng sầm uất với mái ngói đá phiến và các thùng rượu bia hảo hạng (Thu nhập 50🪙/30s)."
  },
  {
    "id": "b03_blacksmith_forge",
    "label": "Lò Rèn Kim Loại",
    "category": "building",
    "doc": "Luyện 2 quặng sắt và 1 gỗ thành thỏi sắt; dùng 1 thỏi sắt và 1 ván gỗ chế tác dụng cụ. Chọn công thức và thêm mẻ vào hàng đợi."
  },
  {
    "id": "b04_windmill",
    "label": "Cối Xay Gió",
    "category": "building",
    "doc": "Cối xay gió trên đồi đá với tháp hình chóp và cánh quạt đón gió (Sản xuất Lúa mì 🌾)."
  },
  {
    "id": "b05_watermill",
    "label": "Cối Xay Nước",
    "category": "building",
    "doc": "Cối xay nước ven kênh với guồng quay thủy lực và cầu gỗ bắc ngang (Sản xuất Nước sạch 💧)."
  },
  {
    "id": "b06_bakery",
    "label": "Lò Bánh Mì Làng",
    "category": "building",
    "doc": "Tiệm bánh ngọt thơm phức với mái hiên sọc, quầy bánh mì nướng và ống khói cao (Nướng Bánh mì 🍞)."
  },
  {
    "id": "b07_apothecary",
    "label": "Vườn Ươm Thảo Dược",
    "category": "building",
    "doc": "Nhà thảo dược sư với tường gỗ ngải thơm, mái xanh lá rừng và nhà kính ươm mầm giống quý."
  },
  {
    "id": "b08_watchtower",
    "label": "Tháp Canh Bảo An",
    "category": "building",
    "doc": "Tháp tự bắn goblin trong tầm 4 ô; nâng cấp tăng sát thương và tầm bắn. Mở Phòng thủ làng để diễn tập từ cấp 6 và sửa tháp bị hư."
  },
  {
    "id": "b09_chapel",
    "label": "Nhà Nguyện Đá",
    "category": "building",
    "doc": "Nhà nguyện đá cổ kính trang nghiêm với tháp chuông đồng, cửa sổ kính màu và sân thánh giá thanh tịnh."
  },
  {
    "id": "b60_combined_warehouse",
    "label": "Kho Tổng Hợp Hoàng Gia",
    "category": "building",
    "doc": "Kho vương quốc thống nhất 2x2 ô tích hợp dự trữ toàn bộ nông sản Silo và vật phẩm Barn, mái ngói xanh viền vàng."
  },
  {
    "id": "b14_town_hall",
    "label": "Tòa Thị Chính & Tháp Chuông",
    "category": "building",
    "doc": "Trung tâm hành chính vương quốc với tháp chuông đồng hồ, bậc thang đá cẩm thạch và sảnh nghị sự uy nghi."
  },
  {
    "id": "b20_noble_manor",
    "label": "Dinh Thự Quý Tộc",
    "category": "building",
    "doc": "Dinh thự quý tộc nguy nga 2 tầng với tường gạch đỏ, mái ngói xanh vương giả và ống khói đôi sang trọng."
  },
  {
    "id": "b21_chicken_coop",
    "label": "Chuồng Gà Đẻ Trứng",
    "category": "building",
    "doc": "Chuồng nuôi gà lấy trứng với mái che ấm cúng, máng ăn và ổ rơm cho đàn gà mái mơ ríu rít."
  },
  {
    "id": "b22_cow_pasture",
    "label": "Chuồng Bò Sữa",
    "category": "building",
    "doc": "Đồng cỏ và chuồng trại nuôi bò sữa với rào chắn kiên cố, thùng nước sạch và đàn bò sữa béo tròn."
  },
  {
    "id": "b57_sheep_pasture",
    "label": "Chuồng Cừu Lấy Lông",
    "category": "building",
    "doc": "Trang trại đồng cỏ nuôi cừu lấy lông với rào gỗ ấm cúng, máng cỏ khô và đàn cừu trắng muốt như mây."
  },
  {
    "id": "d01_plaza_fountain",
    "label": "Khuôn Viên Cổ Thụ",
    "category": "decoration",
    "doc": "Khuôn viên công viên hoàng gia với đài phun nước đá cẩm thạch, bồn hoa rực rỡ và cây liễu cổ thụ rủ bóng mát."
  },
  {
    "id": "d13_farmland_plot",
    "label": "Luống Đất Trồng Cây",
    "category": "decoration",
    "doc": "Luống đất màu mỡ đã được xới tơi xốp, sẵn sàng để gieo các loại hạt giống lúa mì, bắp ngô, rau củ quả."
  },
  {
    "id": "d21_apple_tree",
    "label": "Cây Táo Đỏ",
    "category": "decoration",
    "doc": "Cây táo đỏ trĩu quả xum xuê, cho thu hoạch những quả táo giòn ngọt thơm ngon định kỳ."
  },
  {
    "id": "d22_coconut_palm",
    "label": "Cây Dừa Xiêm",
    "category": "decoration",
    "doc": "Cây dừa xiêm nhiệt đới cao vút soi bóng bên bờ nước, cho những trái dừa ngọt lịm mát lành."
  },
  {
    "id": "d23_tamarind_tree",
    "label": "Cây Me Chua Ngọt",
    "category": "decoration",
    "doc": "Cây me cổ thụ tán rộng mát rượi, đơm từng chùm quả me chua ngọt đậm đà hương vị đồng quê."
  },
  {
    "id": "r03_royal_marble_pavement",
    "label": "Đường Lát Đá",
    "category": "road",
    "doc": "Đại lộ lát đá cẩm thạch trắng viền vàng hoa văn sang trọng, nâng tầm uy nghi cho trung tâm đô thị."
  },
  {
    "id": "d24_rustic_wooden_fence",
    "label": "Hàng Rào Gỗ Nông Trang",
    "category": "decoration",
    "doc": "Hàng rào cọc gỗ mộc mạc bao quanh luống hoa, ruộng đồng và chuồng trại tạo vẻ bình dị thôn quê."
  },
  {
    "id": "d25_tulip_flowerbed",
    "label": "Luống Hoa Tulip Đỏ Rực",
    "category": "decoration",
    "doc": "Luống hoa Tulip đỏ và vàng rực rỡ mang hương sắc mùa xuân ngạt ngào cho công viên và vỉa hè."
  },
  {
    "id": "d26_marble_lion_statue",
    "label": "Tượng Hiệp Sĩ Cưỡi Ngựa",
    "category": "decoration",
    "doc": "Bức tượng kỵ sĩ hoàng gia bằng đá hoa cương uy nghi, tôn vinh lòng dũng cảm bảo vệ bờ cõi vương quốc."
  },
  {
    "id": "d27_royal_banner_flag",
    "label": "Cột Cờ Hiệu Hoàng Triều",
    "category": "decoration",
    "doc": "Cột cờ đồng cao vút với dải cờ đỏ viền vàng phất phới theo ngọn gió đại ngàn."
  },
  {
    "id": "d28_forest_dense_canopy",
    "label": "Tán Rừng Sồi Dày Đặc",
    "category": "decoration",
    "doc": "Mảng rừng sồi rậm rạp với tán lá chồng chất che kín bầu trời, mát lạnh quanh năm."
  },
  {
    "id": "d29_forest_oak_woodland",
    "label": "Rừng Sồi Đại Ngàn",
    "category": "decoration",
    "doc": "Cánh rừng sồi cổ thụ thân gỗ vững chãi xen những bụi cây thấp, nơi chim muông trú ngụ."
  },
  {
    "id": "d30_forest_oak_thicket",
    "label": "Rừng Sồi Bụi Xanh",
    "category": "decoration",
    "doc": "Rừng sồi tán tròn xanh tươi quây quần bên các bụi cây thấp mọc sát chân."
  },
  {
    "id": "d31_forest_pine_cliff",
    "label": "Rừng Thông Vách Đá Rêu",
    "category": "decoration",
    "doc": "Rừng thông kim sừng sững bên vách đá phủ rêu xanh ẩm mát."
  },
  {
    "id": "d32_forest_pine_boulders",
    "label": "Rừng Thông Đá Tảng",
    "category": "decoration",
    "doc": "Rừng thông trầm mặc điểm xuyết những tảng đá lớn phủ rêu phong cổ kính."
  },
  {
    "id": "d12_meadow_wildflowers",
    "label": "Đồng Cỏ Hoa Dại",
    "category": "terrain",
    "doc": "Thảm cỏ xanh tự nhiên êm ái điểm xuyết những đóa hoa dại trắng li ti, làm nền sinh động cho cảnh quan."
  },
  {
    "id": "s13_sand_ground",
    "label": "Bãi Cát Mịn",
    "category": "terrain",
    "doc": "Mặt đất cát vàng hạt mịn trải dài ven biển hoặc bờ đụn cát hoang vu."
  },
  {
    "id": "m01_sandy_beach_s",
    "label": "Bãi Biển Cát Vàng (Nam)",
    "category": "terrain",
    "doc": "Dải bờ biển cát vàng thoai thoải rì rào sóng vỗ ở sườn Nam hòn đảo."
  },
  {
    "id": "m30_sea_var2_coral_reef",
    "label": "Rạn San Hô Ngầm Ngũ Sắc",
    "category": "terrain",
    "doc": "Vùng nước biển đại dương xanh biếc bao la phía Tây vương quốc."
  },
  {
    "id": "b51_waterworks_pump_house_sw",
    "label": "Trạm Bơm Nước Dầm Gang (Tây Nam)",
    "category": "building",
    "doc": "Trạm bơm nước dầm gang kiến trúc công nghiệp cổ điển ven sông."
  },
  {
    "id": "b52_waterworks_pump_house_se",
    "label": "Trạm Bơm Nước Dầm Gang (Đông Nam)",
    "category": "building",
    "doc": "Trạm bơm nước dầm gang kiến trúc công nghiệp cổ điển ven sông."
  },
  {
    "id": "m04_stone_harbor_pier",
    "label": "Bến Tàu Cầu Cảng Đá",
    "category": "biome",
    "doc": "Cầu cảng đá cổ vươn ra biển khơi, bến đỗ thuyền đánh cá."
  },
  {
    "id": "l06_savanna_acacia_waterhole",
    "label": "Hồ Nước Đồng Cỏ Xavan",
    "category": "landmark",
    "doc": "Vũng nước tự nhiên giữa đồng cỏ xavan hoang dã."
  },
  ...FENCE_TILES,
  ...EXPANSION_TILES,
  ...EXPANSION_VARIANT_TILES
];

export const PRESETS = {"village": [["b08_watchtower", "d12_meadow_wildflowers"]]};
