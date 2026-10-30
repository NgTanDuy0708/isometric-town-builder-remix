/**
 * starterMap.js - Bản đồ khởi đầu Vương Quốc Mới (Town Hall Center & Delivery Road)
 * 
 * Thiết kế theo yêu cầu:
 * - Tòa thị chính (b14_town_hall) nằm ngay trung tâm bản đồ (Row 14, Col 15), hiển thị footprint 2x3 ô.
 * - Đất trước tòa thị chính để trống cho người chơi xây dựng.
 * - Đường chính lát đá cẩm thạch hoàng gia chạy từ quảng trường ra khỏi thị trấn.
 * - Trước cửa Tòa Thị Chính có Sân lát đá với Bảng Đơn Hàng (Order Board) và Ô tô giao hàng (Delivery Truck).
 * - Nông trại, luống đất, nhà dân, đài phun nước và cây cối bố trí hài hòa xung quanh.
 */

import { applyCoastTerrainLayout, getTerrainSprite } from './terrainConfig.js';
import { isHarborCell } from './harborLayout.js';

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

  // Biển cols 0..3, bờ biển col 4, cát cols 5..6, mọi hàng.
  applyCoastTerrainLayout(grid);

  // Bản đồ trống: chỉ giữ tòa thị chính và trục đường đá.
  applyTownCenterLayout(grid);
  return grid;
}

/** Set the royal hall (2x3), remove the old forecourt, and keep the delivery road. */
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

  // Dọn khuôn viên cũ trên save hiện có; giữ nguyên đồ người chơi đặt ở đây.
  for (let r = 15; r <= 17; r++) {
    for (let c = 14; c <= 16; c++) {
      if (grid[r]?.[c] === "d01_plaza_fountain") grid[r][c] = "d12_meadow_wildflowers";
    }
  }

  // Trục đường chính lát đá cẩm thạch hoàng gia chạy từ trước quảng trường ra khỏi thị trấn (Row 18 đến 31, Col 15)
  for (let r = 18; r <= 31; r++) {
    if (grid[r]?.[15] !== undefined) grid[r][15] = "r03_royal_marble_pavement";
  }

  return grid;
}
/**
 * Các vị trí mặc định không thể bị nhấc di chuyển hoặc phá dỡ:
 * - Tòa thị chính 2x3 ô (Rows 12..13, Cols 14..16)
 * - Trục đường đá cẩm thạch hoàng gia ra khỏi thị trấn (Col 15, Row từ 18 đến 31)
 */
export function isProtectedTile(row, col, tid) {
  // Footprint tòa thị chính; khuôn viên cũ đã trả lại cho người chơi.
  if (row >= 12 && row <= 13 && col >= 14 && col <= 16) return true;
  if (tid === "b14_town_hall" || tid === "d01_plaza_fountain") return true;

  // Trục đường đá cẩm thạch lớn của xe tải giao hàng (Row 18..31, Col 15)
  if (col === 15 && row >= 18 && row <= 31) return true;

  // Chỉ giữ vị trí cảng thật và mặt biển; không khóa đồ người chơi theo cả dải bờ.
  if (isHarborCell(row,col)) return true;
  if (col <= 3 && row >= 0 && row <= 31 && getTerrainSprite(tid)) return true;

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
