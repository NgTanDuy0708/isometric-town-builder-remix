import {TILES_DATA} from './tilesData.js';
import {getTileRequiredLevel,getMaxPenCount,PLAYER_LEVEL_CONFIG,getTileCost,getTilePopulation,PRODUCTION_BUILDINGS} from './gameEconomy.js';
import {getShopCategory,EXCLUDED_SHOP_TILES,SHOP_CATEGORY_LABELS} from './shopCatalog.js';
import {CROPS_CONFIG} from './cropsConfig.js';
import {getRecipesForBuilding} from './productionRecipes.js';
import {LIVESTOCK_RULES} from './livestockConfig.js';
import {FRUIT_TREES_CONFIG} from './fruitTreeConfig.js';
import {TOWN_EVENTS_CONFIG} from '../engine/townEvents.js';

export const PANEL_TARGETS={shop:'#btn-open-shop',market:'#btn-open-market',quests:'#quest-book-btn',warehouse:'#hud-quick-storage-btn',
  production:'#btn-production-overview',workers:'#btn-open-extraction',defense:'#btn-open-defense',world:'#btn-world-map',premium:'#btn-premium-shop',
  caretaker:'#btn-open-caretaker',shipping:'#btn-open-harbor-ship',wheel:'#btn-open-wheel',achievements:'.coach-navigate',event:'#hud-town-event-card'};
export const PANEL_SELECTORS={shop:'#shop-modal.open',seed:'#seed-modal.open',market:'#market-modal.open',quests:'#quest-modal.open',warehouse:'#storage-modal:not(.hidden)',
  production:'.production-panel-backdrop:not([hidden])',workers:'#extraction-modal:not(.hidden)',defense:'.defense-backdrop:not([hidden])',
  world:'.adventure-backdrop[data-tutorial-tab="world"]:not([hidden])',premium:'.adventure-backdrop[data-tutorial-tab="premium"]:not([hidden])' ,caretaker:'#town-caretaker-modal.open',
  shipping:'#cargo-ship-modal.open',wheel:'#wheel-modal.open',achievements:'#achievements-modal.open',event:'#town-event-detail-modal:not(.hidden)'};
export const BASIC_STEPS=[
  {id:'welcome',title:'Bắt đầu từ một ngôi nhà',ack:true,body:'Làng mới chưa có dân. Xây xong Nhà Tranh sẽ có 4 người; sau đó mới mua luống đất. Mỗi luống cần 1 người phụ trách.',desktop:'Dùng chuột trái để chọn nút. Mình sẽ chỉ từng thao tác bằng bàn tay nhỏ.',touch:'Chạm vào nút được chỉ. Mình sẽ hướng dẫn bằng các nút trên màn hình, không cần bàn phím.'},
  {id:'house-shop',title:'Mở Cửa hàng xây dựng',panel:'shop',target:'#btn-open-shop',body:'Đầu tiên hãy mở Cửa hàng để tìm nhà ở. Chưa mua luống đất ở bước này.'},
  {id:'house-category',panel:'shop',category:'residential',title:'Chọn danh mục Nhà',target:'[data-shop-cat="residential"]',body:'Nhà ở tạo dân. Chọn danh mục Nhà để xem Nhà Tranh và số người mà nhà cung cấp.'},
  {id:'choose-house',panel:'shop',category:'residential',title:'Chọn Nhà Tranh',target:'[data-tile-id="b01_cottage_red"]',body:'Chọn Nhà Tranh 50 vàng, cung cấp 4 dân khi xây xong. Chọn mẫu chỉ là cầm công trình; tiền được trừ khi đặt thành công.'},
  {id:'place-house',title:'Đặt ngôi nhà đầu tiên',world:'empty',body:'Đặt nhà vào ô cỏ sáng hoặc một ô cỏ trống đã mở khác. Không đặt lên đường hay công trình.',desktop:'Di chuột tới ô muốn xây rồi nhấp trái để đặt. R/E xoay; Esc hủy. Có thể dùng nút ✓ trên thanh đặt.',touch:'Chạm một ô cỏ để dời bóng xem trước, rồi chạm ✓ Tích ở thanh dưới để xác nhận. Nút Xoay đổi hướng, Hủy thoát đặt.'},
  {id:'leave-house-tool',title:'Thoát chế độ đặt nhà',target:'#floating-brush-cancel',body:'Chỉ cần một nhà đầu tiên. Thoát công cụ đặt để tránh xây thêm ngoài ý muốn.',desktop:'Nhấn Esc hoặc bấm Hủy trên thanh đặt.',touch:'Chạm Hủy ở thanh đặt phía dưới. Nhà đang xây vẫn được giữ lại.'},
  {id:'camera',title:'Di chuyển và phóng to góc nhìn',ack:true,target:'#builder-zoom-in',body:'Trong lúc thợ xây làm việc, làm quen với góc nhìn. Bạn có thể thử rồi bấm Tiếp tục.',desktop:'Giữ Space và kéo chuột để xem vùng khác; lăn con lăn để zoom. +/Z phóng to, −/X thu nhỏ; Home hoặc 0 về giữa làng.',touch:'Vuốt một ngón để kéo bản đồ; chụm hoặc tách hai ngón để zoom. Bạn cũng có thể dùng nút +, − và nút căn giữa ở góc dưới.'},
  {id:'wait-house',title:'Chờ nhà xây xong mới có dân',world:'house',body:'Giàn giáo phủ bạt cho biết nhà đang xây. Khi đếm ngược kết thúc, nhà thật xuất hiện và mới cộng 4 dân. Không bắt buộc dùng kim cương tăng tốc.'},
  {id:'population',title:'Đã có người dân đầu tiên',ack:true,target:'#builder-stat-free-workers',body:'Dân rảnh = dân từ nhà đã hoàn tất − nông dân − công nhân − lính. Một Nhà Tranh có 4 dân, giữ tối đa 4 luống nếu chưa giao việc khác; nhà khác cho số dân theo thẻ. Để luống trống vẫn giữ 1 dân.'},
  {id:'farm-shop',title:'Mua luống sau khi đã có dân',panel:'shop',target:'#btn-open-shop',body:'Bây giờ mới mở Cửa hàng để mua một luống đầu tiên. Luống cần cả vàng và 1 dân rảnh.'},
  {id:'farm-category',panel:'shop',category:'farming',title:'Chọn Nông trại',target:'[data-shop-cat="farming"]',body:'Vào Nông trại để tìm Luống Đất Trồng. Chưa cần mua chuồng hoặc cây ăn quả.'},
  {id:'choose-farm',panel:'shop',category:'farming',title:'Chọn Luống Đất Trồng',target:'[data-tile-id="d13_farmland_plot"]',body:'Chọn một luống. Số dân rảnh hiển thị ngay trên thẻ; hết dân thì cần xây/nâng cấp nhà hoặc giải phóng công việc.'},
  {id:'place-farm',title:'Đặt một luống trên cỏ trống',world:'empty',body:'Đặt một luống ở gần nhà. Đặt thành công mới tính 1 dân làm nông.',desktop:'Nhấp trái lên ô cỏ trống. Chỉ đặt một luống để học vụ đầu.',touch:'Chạm ô cỏ rồi chạm ✓ Tích. Chỉ đặt một luống ở bước này.'},
  {id:'leave-farm-tool',title:'Dừng đặt thêm luống',target:'#floating-brush-cancel',body:'Thoát công cụ đặt trước khi bấm vào luống để gieo hạt.',desktop:'Nhấn Esc hoặc bấm Hủy.',touch:'Chạm Hủy trên thanh đặt ở dưới màn hình.'},
  {id:'open-seed',title:'Mở chọn hạt trên luống trống',world:'empty-farm',panel:'seed',body:'Chọn luống vừa đặt để mở danh sách hạt giống.',desktop:'Nhấp trái vào giữa luống đất trống.',touch:'Chạm nhanh vào giữa luống, không nhấn giữ.'},
  {id:'plant-wheat',panel:'seed',title:'Gieo Lúa Mì đầu tiên',target:'[data-seed-id="wheat"] .seed-btn-sow',body:'Chọn Gieo ở dòng Lúa Mì. Mỗi lần gieo mất 4 vàng, lớn trong 25 giây và thu được 3 lúa mì.'},
  {id:'leave-seed-tool',title:'Hoàn tất công cụ gieo',target:'#farm-tool-finish-btn',body:'Sau khi gieo, công cụ vẫn cho phép gieo tiếp. Thoát công cụ để có thể bấm bong bóng thu hoạch.',desktop:'Nhấn Esc hoặc bấm Hoàn thành ở thanh gieo hạt.',touch:'Chạm ✕ Hoàn thành trên thanh gieo hạt.'},
  {id:'wait-wheat',title:'Chờ lúa mì chín',world:'wheat',body:'Cây đi qua các giai đoạn lớn lên. Chờ đến khi có bong bóng lúa mì; không cần mua tăng tốc.'},
  {id:'harvest-wheat',title:'Thu hoạch vụ đầu',world:'harvest',body:'Bấm bong bóng lúa mì chín để thu 3 lúa vào kho và nhận kinh nghiệm.',desktop:'Nhấp trái vào bong bóng phía trên cây.',touch:'Chạm bong bóng lúa mì phía trên cây.'},
  {id:'market-open',title:'Mở Chợ để bán hàng',panel:'market',target:'#btn-open-market',body:'Mở Chợ Vương Quốc để đổi lúa vừa thu thành vàng. Hàng vẫn được giữ nếu bạn chưa bấm bán.'},
  {id:'sell-wheat',title:'Bán thử một lúa mì',target:'[data-resource-id="wheat"] .market-sell-btn',body:'Bấm Bán 1 ở dòng Lúa Mì để hiểu giao dịch. Chỉ bán một ít, giữ phần còn lại cho gieo trồng, đơn hàng và thức ăn về sau.'},
  {id:'market-close',title:'Đóng Chợ để quay lại làng',target:'#market-modal-close',body:'Dùng nút × của Chợ để quay lại bản đồ. Những cửa sổ khác cũng có nút đóng riêng.'},
  {id:'quests-open',title:'Xem nhiệm vụ phát triển làng',panel:'quests',target:'#quest-book-btn',body:'Mở Sổ Nhiệm Vụ để xem mục tiêu tiếp theo và phần thưởng.'},
  {id:'quests-help',title:'Nhiệm vụ giúp lên cấp',ack:true,panel:'quests',target:'#quest-modal-title',closeAfter:true,body:'Đọc điều kiện từng nhiệm vụ; nút Nhận thưởng chỉ dùng được khi đạt đủ. Vàng và XP giúp mở chức năng mới. Bạn không cần hoàn thành mọi nhiệm vụ ngay trong tutorial.'},
  {id:'warehouse-open',title:'Mở Kho tổng hợp',panel:'warehouse',target:'#hud-quick-storage-btn',body:'Mở Kho tổng hợp để xem lượng hàng đang giữ và sức chứa còn lại.'},
  {id:'warehouse',title:'Hiểu kho và vật tư',ack:true,panel:'warehouse',target:'#storage-cap-title',closeAfter:true,body:'Nhà kho chứa chung nông sản và nguyên liệu. Kho đầy thì thu hoạch/giao hàng sẽ chờ; bán bớt hoặc nâng cấp kho để tiếp tục. Gỡ nhà bị chặn nếu làm thiếu người cho các công việc đang giữ.'},
  {id:'controls',title:'Các thao tác xây dựng cần nhớ',ack:true,target:'#btn-open-settings',body:'Bạn có thể xem lại hướng dẫn trong Cài đặt. Mở phần Phím & thao tác ở thẻ này để tra bất kỳ lúc nào.',desktop:'R/E xoay khi đang cầm vật phẩm; Esc hủy/thoát công cụ. Giữ vào công trình để mở Di chuyển/Xoay/Gỡ. Ctrl+Z/Ctrl+Y hoàn tác/làm lại các thao tác được hỗ trợ; D bật gỡ, Delete gỡ ô đang trỏ nên hãy dùng cẩn thận.',touch:'Chạm chọn ô, ✓ Tích xác nhận, Xoay đổi hướng, Hủy để thoát. Nhấn giữ công trình để mở Di chuyển/Xoay/Gỡ. Khi đang kéo bản đồ đừng giữ ngón trên công trình quá lâu.'},
  {id:'complete',title:'Làng đã sẵn sàng phát triển',ack:true,body:'Bạn đã học xây nhà → có dân → mua luống → gieo → thu hoạch → bán hàng. Tiếp tục làm nhiệm vụ và tăng dân hợp lý. Khi lên cấp, hướng dẫn mới sẽ lần lượt chỉ các tính năng vừa mở.'}
];

const tour=(id,title,body,panel,category,tileId)=>({id,title,body,panel,category,tileId});
const SPECIAL_TOURS={
  1:[tour('premium','Kim cương và túi vật phẩm','Cửa hàng kim cương cho đổi vàng, mua trang trí vào túi rồi chọn vị trí đặt. Đặt sai không mất món, gỡ trả về túi; không bắt buộc dùng kim cương để phát triển.','premium'),tour('wheel','Phần thưởng hằng ngày','Vòng quay có lượt miễn phí theo lịch hiển thị. Kiểm tra lượt còn lại trước khi quay; mở cửa sổ không tiêu kim cương.','wheel')],
  2:[tour('chickens','Chăn nuôi đầu tiên','Chuồng gà giữ 2 ô đất. Xây xong còn cần mua con vật và cho ăn lúa mì; chờ đủ thời gian rồi thu trứng. Giới hạn số chuồng hiển thị trên thẻ.','shop','farming','b21_chicken_coop')],
  3:[tour('bread','Hàng đợi chế biến','Lò bánh dùng lúa mì. Mở Sản xuất để chọn công thức và xếp mẻ; nguyên liệu được giữ khi đặt mẻ, thành phẩm chờ bạn thu vào kho.','production'),tour('achievements','Thành tựu của vương quốc','Thành tựu có điều kiện và thưởng riêng. Chỉ bấm nhận khi mục đã hoàn tất; các lần nhận được lưu cùng game.','achievements')],
  4:[tour('workers','Thuê công nhân khai thác','Xây Xưởng mộc, Xưởng đá hoặc Mỏ sắt và chừa đường tới điểm tài nguyên/kho. Mỗi người thuê giữ 1 dân rảnh, trả 30 vàng một lần. Hàng chỉ vào kho khi công nhân mang về.','workers'),tour('materials','Chế biến và lương thực','Gỗ → ván, đá → đá xây dựng, quặng + gỗ → thỏi → dụng cụ. Xếp tối đa 5 mẻ. Công nhân dùng khẩu phần từ thức ăn được cho phép; thiếu ăn giảm hiệu suất, không làm mất người.','production')],
  5:[tour('caretaker','Tổng quản gia','Xem điều kiện, giá và thời hạn trong bảng trước khi thuê/kích hoạt. Quản gia thu giúp, nhưng vẫn tuân thủ kho và điều kiện sản xuất.','caretaker')],
  6:[tour('defense','Diễn tập phòng thủ','Xây Tháp canh, chừa lối vào, rồi bắt đầu diễn tập. Có cảnh báo trước trận; tháp tự bắn. Thắng mới nhận thưởng và được bật lịch tấn công ngẫu nhiên.','defense'),tour('guards','Huấn luyện vệ binh','Trại vệ binh giữ dân ngay khi huấn luyện. Cần vàng và dụng cụ sắt, dùng chung thức ăn với công nhân. Quân bị hạ về trại hồi phục; cho nghỉ đợi về trại mới trả suất dân.','defense'),tour('shipping','Tàu giao thương','Đọc các thùng hàng và thời hạn của chuyến. Chỉ nộp hàng khi đủ; hoàn thành chuyến nhận thưởng như bảng hiển thị.','shipping')],
  8:[tour('mages','Pháp sư bảo vệ làng','Xây Học viện pháp sư; tuyển bằng dân rảnh, vàng, dụng cụ và vải. Pháp sư đánh xa và gây sát thương quanh mục tiêu, dùng chung khẩu phần với lính.','defense')],
  10:[tour('forest','Mở Rừng Cổ Thụ','Cần cấp 10, thắng diễn tập và 8 khu đất trả phí ở làng; mở đường mất 500 vàng, 10 ván, 8 đá xây dựng. Hai map lưu riêng và dùng chung kho/dân. Trạm kiểm lâm và nhiệm vụ gỗ cổ thụ nằm ở vùng rừng.','world'),tour('trolls','Đợt quái rừng','Quái rừng mạnh hơn goblin. Chuẩn bị tháp, quân và thức ăn trước khi bật lịch; có diễn tập quái rừng không thưởng để xem cách chiến đấu.','defense')],
  12:[tour('dragons','Rồng bay tấn công','Từ cấp 12, mỗi đợt thật thứ 3 có rồng bay và phun lửa. Vệ binh không đánh được mục tiêu bay: dùng tháp/pháp sư. Có diễn tập không thưởng; thắng rồng thật nhận thêm kim cương.','defense')]
};
export function getLevelUnlocks(level){
  const tiles=TILES_DATA.filter(t=>getTileRequiredLevel(t.id)===level&&getShopCategory(t)&&getShopCategory(t)!=='hidden'&&!EXCLUDED_SHOP_TILES.has(t.id)&&!['b14_town_hall','b60_combined_warehouse'].includes(t.id));
  const crops=Object.values(CROPS_CONFIG).filter(c=>(c.requiredLevel||1)===level);
  const pens=TILES_DATA.filter(t=>['b21_chicken_coop','b22_cow_pasture','d33_pig_pen_barn','b57_sheep_pasture'].includes(t.id)&&level>2&&getMaxPenCount(t.id,level)>getMaxPenCount(t.id,level-1));
  return {tiles,crops,pens};
}
function tileInstructions(tile){
  const rule=LIVESTOCK_RULES[tile.id],recipes=getRecipesForBuilding(tile.id),pop=getTilePopulation(tile.id,tile.category);
  if(rule)return `Xây xong, chọn chuồng → mua ${rule.animalName.toLowerCase()} → cho ăn ${rule.feedName.toLowerCase()} → chờ ${rule.durationSec}s → thu ${rule.productName.toLowerCase()}.`;
  if(tile.id==='b69_forester_lodge')return 'Chỉ xây tại Rừng Cổ Thụ. Sang vùng rừng trước, rồi mở Cửa hàng → Cửa hàng sản xuất → Trạm kiểm lâm; xây xong thuê công nhân để lấy gỗ cổ thụ.';
  if(tile.id==='b65_stone_quarry'||tile.id==='b66_iron_mine'||tile.id==='b11_carpenter_sawmill')return 'Xây xong, mở Quản lý công nhân → chọn xưởng → thuê dân rảnh. Chừa lối tới tài nguyên và kho; chọn Chế biến để làm nguyên liệu nâng cấp.';
  if(tile.id==='b67_guard_barracks'||tile.id==='b68_mage_academy')return 'Xây xong, mở Phòng thủ làng → chọn trại → Huấn luyện. Cần dân rảnh, vàng và nguyên liệu; chuẩn bị thức ăn trước trận.';
  if(tile.id==='b08_watchtower')return 'Xây xong, mở Phòng thủ làng để diễn tập. Tháp tự bắn khi có quái trong tầm; bạn không cần điều khiển phát bắn.';
  if(FRUIT_TREES_CONFIG[tile.id])return 'Chọn thẻ rồi đặt lên cỏ để gieo hạt. Chờ cây lớn và bấm bong bóng trái chín để thu; cây héo sau 3 lần thu hoạch.';
  if(recipes.length)return `Xây xong, chọn công trình → chọn công thức (${recipes.map(r=>r.name).join(', ')}) → Thêm mẻ. Cần đủ nguyên liệu; chờ xong rồi Thu 1 mẻ.`;
  if(PRODUCTION_BUILDINGS[tile.id])return `Xây xong công trình tạo ${PRODUCTION_BUILDINGS[tile.id].productName.toLowerCase()}. Bấm bong bóng khi sản phẩm sẵn sàng để thu; mở Sản xuất để xem trạng thái.`;
  if(pop>0)return `Xây hoàn tất mới cộng ${pop} dân. Dùng dân rảnh cho luống đất, công nhân hoặc lính; xem số còn rảnh trên bảng bên phải.`;
  if(tile.id==='d13_farmland_plot')return 'Đặt luống giữ 1 dân rảnh. Thoát công cụ đặt, chọn luống → chọn hạt → Gieo; chờ chín rồi thu hoạch.';
  return tile.category==='road'?'Đặt trên ô trống để nối lối đi trong làng. Có thể xoay hướng trước khi đặt.':'Đây là vật trang trí. Đặt trên ô trống để sắp xếp cảnh quan; xem trước hướng rồi mới xác nhận.';
}
function shopTourSteps(id,tile,body){
  const category=getShopCategory(tile),label=SHOP_CATEGORY_LABELS[category]||category;
  const shared={panel:'shop',category,tileId:tile.id,itemName:tile.label};
  const price=getTileCost(tile.id,tile.category);
  return [
    {...shared,id:id+'-open',shopStage:'open',title:`Tìm ${tile.label}`,target:PANEL_TARGETS.shop,openTour:true,
      body:`Mở Cửa hàng. ${tile.label} nằm trong danh mục ${label}; mình sẽ chỉ tiếp đúng thẻ bên trong.`},
    {...shared,id:id+'-category',shopStage:'category',title:`Chọn danh mục ${label}`,target:`[data-shop-cat="${category}"]`,openTour:true,
      body:`Chọn ${label} để tìm ${tile.label}. Bước tiếp theo sẽ chỉ thẻ của món này.`},
    {...shared,id:id+'-explain',title:tile.label,ack:true,inspectTileId:tile.id,closeAfter:true,nextLabel:'Chỉ xem, tiếp tục',
      target:`[data-tile-id="${tile.id}"]`,body:`${price?`Giá đặt: ${price} vàng.`:'Đặt miễn phí.'} ${body||tileInstructions(tile)} Chọn thẻ đang sáng nếu muốn thử đặt; hoặc bấm Chỉ xem, tiếp tục.`},
    {id:id+'-place',title:`Đặt ${tile.label}`,ack:true,optionalPlacement:tile.id,world:'empty',nextLabel:'Chưa xây, xem tiếp',
      body:`Bạn đang cầm ${tile.label}. Chọn ô trống hợp lệ để đặt; vàng chỉ trừ khi đặt thành công. Có thể dùng Hủy hoặc Chưa xây, xem tiếp để cất món và tiếp tục hướng dẫn.`,
      desktop:'Nhấp trái một ô trống để đặt. R/E xoay; Esc hủy.',touch:'Chạm ô muốn đặt rồi chạm ✓ Tích. Dùng Xoay đổi hướng hoặc Hủy để cất món.'}
  ];
}
export function getLevelGuide(level){
  const config=PLAYER_LEVEL_CONFIG.find(c=>c.level===level);if(!config)return null;
  const unlocks=getLevelUnlocks(level),steps=[{id:'summary',title:`Cấp ${level}: ${config.title}`,ack:true,target:'#hud-player-level-badge',
    body:level===1?'Khám phá các tiện ích sau vụ mùa đầu.':`Cấp này thưởng ${config.rewardGold||0} vàng. Mình sẽ chỉ từng mục vừa mở, từ danh mục đến đúng món. Bạn có thể chỉ xem, không cần mua tất cả.`}];
  const covered=new Set();
  for(const item of SPECIAL_TOURS[level]||[]){
    if(item.panel==='shop'){
      const tile=TILES_DATA.find(t=>t.id===item.tileId);if(!tile)continue;covered.add(tile.id);
      steps.push(...shopTourSteps(item.id,tile,item.body));continue;
    }
    steps.push({id:item.id+'-open',title:'Mở: '+item.title,panel:item.panel,target:PANEL_TARGETS[item.panel],world:item.panel==='achievements'?'hall':undefined,
      body:item.panel==='achievements'?'Chọn Tòa thị chính để xem Thành tựu, hoặc bấm Mở mục này.':`Chọn nút được chỉ để mở ${item.title}.`,openTour:true});
    steps.push({id:item.id+'-explain',title:item.title,body:item.body,panel:item.panel,ack:true,closeAfter:true});
  }
  const firstInCategory=new Set();
  for(const tile of unlocks.tiles){
    if(covered.has(tile.id))continue;
    const category=getShopCategory(tile),id=firstInCategory.has(category)?'catalog-'+tile.id:'catalog-'+category;
    firstInCategory.add(category);
    if(tile.id==='b69_forester_lodge'){
      steps.push({id:id+'-explain',title:tile.label,body:tileInstructions(tile),panel:'world',target:PANEL_TARGETS.world,ack:true,closeAfter:true});
    }else steps.push(...shopTourSteps(id,tile));
  }
  // Show each new seed in the actual seed picker, rather than an unrelated production overview.
  for(const [index,crop] of unlocks.crops.entries()){
    const id=index===0?'crops':'crop-'+crop.id,name=crop.shortName||crop.name;
    steps.push({id:id+'-open',title:`Xem hạt ${name}`,panel:'seed',world:'empty-farm',openTour:true,
      body:`Chọn một luống đất trống để mở danh sách hạt giống. Mình sẽ chỉ dòng ${name} bên trong.`,desktop:'Nhấp một luống trống.',touch:'Chạm nhanh vào một luống trống.'});
    steps.push({id:id+'-explain',title:`Hạt mới: ${name}`,panel:'seed',target:`[data-seed-id="${crop.id}"]`,seedId:crop.id,ack:true,closeAfter:true,nextLabel:'Chỉ xem, tiếp tục',
      body:`${name}: ${crop.seedCost} vàng/lần gieo, lớn trong ${crop.growTimeSec}s. Bấm Gieo trên dòng đang sáng nếu muốn trồng (sẽ trừ vàng); hoặc bấm Chỉ xem, tiếp tục để giữ nguyên luống.`});
  }
  for(const [index,tile]of unlocks.pens.entries())steps.push(...shopTourSteps(index===0?'pen-limit':'pen-limit-'+tile.id,tile,
    `${tile.label} nay xây tối đa ${getMaxPenCount(tile.id,level)} chuồng. ${tileInstructions(tile)}`));
  return {id:`level-${level}`,level,title:`Hướng dẫn cấp ${level}`,steps};
}
export function getGuide(id){
  if(/^level-\d+$/.test(id||''))return getLevelGuide(Number(id.slice(6)));
  if(id?.startsWith('event-')){
    const event=TOWN_EVENTS_CONFIG[id.slice(6)];if(!event)return null;
    return {id,title:event.name,steps:[{id:'event',title:'Lần đầu gặp: '+event.name,ack:true,target:'#hud-town-event-card',body:`${event.description} Hiệu ứng chỉ áp dụng khi đồng hồ sự kiện còn chạy; hết giờ sẽ trở về bình thường. Nếu thẻ còn trên màn hình, bấm vào để xem chi tiết. Nếu đã hết giờ, chờ lần xuất hiện sau; không cần chi tiền để xác nhận.`}]};
  }
  return null;
}
