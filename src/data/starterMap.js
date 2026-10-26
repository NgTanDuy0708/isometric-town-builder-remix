/**
 * starterMap.js - Bản đồ khởi đầu Vương Quốc Mới (Town Hall Center & Delivery Road)
 * 
 * Thiết kế theo yêu cầu:
 * - Tòa thị chính (b14_town_hall) nằm ngay trung tâm bản đồ (Row 14, Col 15).
 * - Trước cửa Tòa Thị Chính là một con đường đá thẳng tắp dẫn ra khỏi thị trấn (Row 16 đến 31, Col 15).
 * - Trước cửa Tòa Thị Chính có Sân lát đá với Bảng Đơn Hàng (Order Board) và Ô tô giao hàng (Delivery Truck).
 * - Nông trại, luống đất, nhà dân, đài phun nước và cây cối bố trí hài hòa xung quanh.
 */

import { OCEAN_BAY_TILES } from "./harborShipConfig.js";

export function createStarterTownMap32() {
  const ROWS = 32;
  const COLS = 32;
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push("d12_meadow_wildflowers");
    }
    grid.push(row);
  }

  // 1. Tòa Thị Chính ngay trung tâm vương quốc (Row 14, Col 15)
  grid[14][15] = "b14_town_hall";

  // 2. Khuôn viên quảng trường trước cửa Tòa Thị Chính
  grid[15][15] = "d01_plaza_fountain"; // Đài phun nước quảng trường trung tâm ngay trước cửa Tòa Thị Chính

  // 3. Con đường đá thẳng tắp chạy từ trước đài phun nước ra khỏi thị trấn (Row 16 đến 31, Col 15)
  for (let r = 16; r <= 31; r++) {
    grid[r][15] = "r01_road_straight_ns";
  }

  // 4. Các công trình và tiện ích khởi đầu làng quê
  grid[14][12] = "b01_cottage_red";          // Nhà ngói đỏ ấm áp
  grid[16][12] = "d02_village_well";          // Giếng nước đầu làng
  grid[14][18] = "b21_chicken_coop";         // Chuồng gà đẻ trứng
  grid[16][17] = "d06_cherry_garden";        // Vườn hoa anh đào quảng trường

  // 4b. Hệ thống 2 Kho bãi khởi đầu (Silo nông sản & Barn thành phẩm)
  grid[12][12] = "b13_barn_silo";             // Tháp Silo: Kho chứa Nông sản ruộng đồng (100 sức chứa)
  grid[12][18] = "b12_general_store";         // Nhà Kho Barn: Kho chứa Vật tư, Sản phẩm chăn nuôi & Nhà máy (100 sức chứa)

  // 5. Luống đất nông trại cày sẵn bên trái trục đường
  grid[17][12] = "d13_farmland_plot";
  grid[17][13] = "d13_farmland_plot";
  grid[18][12] = "d13_farmland_plot";
  grid[18][13] = "d13_farmland_plot";

  // 6. Cây xanh, hoa cỏ và cột đèn đường dọc tuyến phố
  grid[14][10] = "d04_oak_tree_park";
  grid[14][20] = "d05_pine_grove";
  grid[17][17] = "d06_cherry_garden";
  grid[18][17] = "d10_flower_orchard_hedge";
  grid[17][16] = "d07_streetlamps_signpost";
  grid[21][16] = "d07_streetlamps_signpost";
  grid[25][16] = "d07_streetlamps_signpost";

  // 7. Vịnh Biển & Bến Cảng Hoàng Gia (Royal Ocean Bay & Coast)
  for (const item of OCEAN_BAY_TILES) {
    if (grid[item.r] && grid[item.r][item.c] !== undefined) {
      grid[item.r][item.c] = item.tid;
    }
  }

  return grid;
}

/**
 * Kiểm tra xem một ô gạch có phải là công trình/đường mặc định của vương quốc không.
 * Các vị trí mặc định không thể bị nhấc di chuyển hoặc phá dỡ:
 * - Tòa thị chính (Row 14, Col 15 hoặc tid === 'b14_town_hall')
 * - Đài phun nước quảng trường (Row 15, Col 15)
 * - Trục đường chính ra khỏi thị trấn (Col 15, Row từ 16 đến 31)
 */
export function isProtectedTile(row, col, tid) {
  // 1. Tòa thị chính và đài phun nước quảng trường trung tâm
  if (tid === "b14_town_hall" || (row === 14 && col === 15)) return true;
  if (row === 15 && col === 15) return true;

  // 2. Trục đường đá lớn của xe tải giao hàng (Row 16..31, Col 15)
  if (col === 15 && row >= 16 && row <= 31) return true;

  // 3. Vùng Biển Đại Dương & Bến Cảng Hoàng Gia trải dài hết sườn Tây (không cho phép phá dỡ hay di dời)
  if (col <= 3 && row >= 0 && row <= 31) return true;
  if (col === 4 && row >= 0 && row <= 31) return true;
  if (col === 5 && row >= 11 && row <= 17) return true;

  return false;
}

/**
 * Kiểm tra xem một công trình có phải là Nhà kho vương quốc thiết yếu không:
 * - Không cho phép phá dỡ / gỡ bỏ (để bảo vệ an toàn cho tài nguyên dự trữ).
 * - Cho phép di chuyển tự do đến vị trí khác.
 */
export function isIndestructibleTile(tid) {
  return tid === "b13_barn_silo" || tid === "b12_general_store" || tid === "b48_winery_press_barn_se";
}

/**
 * Trạng thái luống đất khởi đầu (Đất cày sẵn sàng để người chơi nhấp vào gieo hạt)
 */
export function getStarterFarmlandState() {
  return {};
}
