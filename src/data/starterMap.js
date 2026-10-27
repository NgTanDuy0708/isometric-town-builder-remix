/**
 * starterMap.js - Bản đồ khởi đầu Vương Quốc Mới (Town Hall Center & Delivery Road)
 * 
 * Thiết kế theo yêu cầu:
 * - Tòa thị chính (b14_town_hall) nằm ngay trung tâm bản đồ (Row 14, Col 15), hiển thị footprint 2x3 ô.
 * - Quảng trường hoàng gia 3x3 ô nằm ngay trước tòa thị chính.
 * - Đường chính lát đá cẩm thạch hoàng gia chạy từ quảng trường ra khỏi thị trấn.
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

  applyTownCenterLayout(grid);

  // 4. Các công trình và tiện ích khởi đầu làng quê
  grid[14][12] = "b01_cottage_red";          // Nhà ngói đỏ ấm áp
  grid[16][12] = "d02_village_well";          // Giếng nước đầu làng
  grid[14][18] = "b21_chicken_coop";         // Chuồng gà đẻ trứng
  grid[19][18] = "d06_cherry_garden";        // Vườn hoa cạnh quảng trường

  // 4b. Kho Tổng Hợp Hoàng Gia chiếm 2×2 ô, neo tại ô dưới-phải (12, 12).
  for (let r = 11; r <= 12; r++) {
    for (let c = 11; c <= 12; c++) {
      grid[r][c] = "b60_combined_warehouse";
    }
  }

  // 5. Luống đất nông trại cày sẵn bên trái trục đường
  grid[17][12] = "d13_farmland_plot";
  grid[17][13] = "d13_farmland_plot";
  grid[18][12] = "d13_farmland_plot";
  grid[18][13] = "d13_farmland_plot";

  // 6. Cây xanh, hoa cỏ và cột đèn đường dọc tuyến phố
  grid[14][10] = "d04_oak_tree_park";
  grid[14][20] = "d05_pine_grove";
  grid[19][17] = "d10_flower_orchard_hedge";
  grid[20][16] = "d07_streetlamps_signpost";
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

/** Set the royal hall (2x3), 3x3 plaza forecourt, and royal marble delivery road */
export function applyTownCenterLayout(grid) {
  if (!grid) return grid;

  // Bỏ 3 ô đá trước cửa tòa thị chính (hàng 14) — chỉ dọn đúng sân đá cũ,
  // không xoá đồ người chơi đã đặt ở hàng này.
  const forecourt = [14, 15, 16].map((c) => grid[14]?.[c]);
  if (forecourt.every((t) => t === "r03_royal_marble_pavement" || t === "b14_town_hall")) {
    for (let c = 14; c <= 16; c++) {
      if (grid[14]?.[c] !== undefined) grid[14][c] = "d12_meadow_wildflowers";
    }
  }

  // Tòa thị chính chiếm 2 hàng x 3 cột (Rows 12..13, Cols 14..16); ảnh chính neo ở ô (13, 15).
  // Đã lùi lại 1 hàng để cây liễu của khuôn viên không che mặt tiền.
  for (let r = 12; r <= 13; r++) {
    for (let c = 14; c <= 16; c++) {
      if (grid[r]?.[c] !== undefined) grid[r][c] = "b14_town_hall";
    }
  }

  // Quảng trường chiếm footprint 3x3 đối xứng (Rows 15..17, Cols 14..16); sprite neo ở tâm (16, 15).
  for (let r = 15; r <= 17; r++) {
    for (let c = 14; c <= 16; c++) {
      if (grid[r]?.[c] !== undefined) grid[r][c] = "d01_plaza_fountain";
    }
  }

  // Trục đường chính lát đá cẩm thạch hoàng gia chạy từ trước quảng trường ra khỏi thị trấn (Row 18 đến 31, Col 15)
  for (let r = 18; r <= 31; r++) {
    if (grid[r]?.[15] !== undefined) grid[r][15] = "r03_royal_marble_pavement";
  }
  // Dãy [x,4]: thay các ô bờ biển chuyển tiếp bằng cát mịn (giữ nguyên bến cảng/cầu/kênh).
  for (let r = 0; r < grid.length; r++) {
    if (grid[r]?.[4] === "m01_sandy_beach_s") {
      grid[r][4] = "s13_sand_ground";
    }
  }

  return grid;
}
/**
 * Các vị trí mặc định không thể bị nhấc di chuyển hoặc phá dỡ:
 * - Tòa thị chính 2x3 ô (Rows 12..13, Cols 14..16)
 * - Quảng trường 3x3 ô (Rows 15..17, Cols 14..16; neo ở 16, 15)
 * - Trục đường đá cẩm thạch hoàng gia ra khỏi thị trấn (Col 15, Row từ 18 đến 31)
 */
export function isProtectedTile(row, col, tid) {
  // Các ô footprint và neo của tòa thị chính/quảng trường.
  if ((row >= 12 && row <= 13 && col >= 14 && col <= 16) ||
      (row >= 15 && row <= 17 && col >= 14 && col <= 16)) return true;
  if (tid === "b14_town_hall" || tid === "d01_plaza_fountain") return true;

  // Trục đường đá cẩm thạch lớn của xe tải giao hàng (Row 18..31, Col 15)
  if (col === 15 && row >= 18 && row <= 31) return true;

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
  return tid === "b60_combined_warehouse" || tid === "b48_winery_press_barn_se";
}

/**
 * Di trú save/bản đồ cũ: Kho Barn (b12) & Kho Silo (b13) đã bị loại bỏ,
 * gộp hẳn vào Kho Tổng Hợp 2×2 (b60). Hầm Rượu Vang (b47/b48) KHÔNG bị đụng tới.
 * Dùng chung cho cả lúc load save game và lúc import JSON/dev map.
 */
export function migrateLegacyWarehouseLayout(grid) {
  if (!Array.isArray(grid)) return grid;
  let hasCombinedWarehouse = false;
  for (let r = 0; r < grid.length; r++) {
    if (!Array.isArray(grid[r])) continue;
    for (let c = 0; c < grid[r].length; c++) {
      const tid = grid[r][c];
      if (tid === "b60_combined_warehouse") hasCombinedWarehouse = true;
      else if (tid === "b13_barn_silo" || tid === "b12_general_store") {
        grid[r][c] = "d12_meadow_wildflowers";
      }
    }
  }
  if (!hasCombinedWarehouse) {
    for (let r = 11; r <= 12; r++) {
      for (let c = 11; c <= 12; c++) {
        if (grid[r] && grid[r][c] !== undefined) grid[r][c] = "b60_combined_warehouse";
      }
    }
  }
  return grid;
}

/**
 * Trạng thái luống đất khởi đầu (Đất cày sẵn sàng để người chơi nhấp vào gieo hạt)
 */
export function getStarterFarmlandState() {
  return {};
}
