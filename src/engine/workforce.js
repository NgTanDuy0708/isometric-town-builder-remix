import { calculateVillageStats } from '../data/gameEconomy.js';
import { countExtractionWorkers } from '../data/extractionConfig.js';
import { getAssignedSoldiers } from '../data/militaryConfig.js';

// Assignments derive from occupied cells, so harvesting, moving, and save/load
// cannot grant duplicate workers. Old farms above capacity remain intact.
export function getWorkforce(grid, constructions = {}, tileMap = {}, levels = {}, extraction = {}, defense = {}, remote = {}) {
  const worldTotal = calculateVillageStats(grid, constructions, tileMap, levels).population+(remote?.population||0);
  const total=Math.max(0,worldTotal-(remote?.assigned||0));
  let farmers = 0;
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < (grid[r]?.length || 0); c++) {
    if ((constructions[`${r}_${c}`]?.targetTileId || grid[r][c]) === 'd13_farmland_plot') farmers++;
  }
  const workers = countExtractionWorkers(grid, extraction);
  const soldiers=getAssignedSoldiers(grid,defense).length;
  return { total, worldTotal, farmers, workers, soldiers,
    free: Math.max(0, total - farmers - workers - soldiers), shortage: Math.max(0, farmers + workers + soldiers+(remote?.assigned||0)-worldTotal) };
}

export function checkFarmWorkforce(grid, constructions = {}, tileMap = {}, levels = {}, extraction = {}, defense = {}, remote = {}) {
  const workforce = getWorkforce(grid, constructions, tileMap, levels, extraction,defense,remote);
  return { ...workforce, allowed: workforce.free > 0,
    message: workforce.shortage > 0
      ? `Thiếu ${workforce.shortage} dân cho công việc hiện có. Hãy xây hoặc nâng cấp nhà ở trước khi mua thêm luống.`
      : 'Hết dân rảnh! Mỗi luống cần 1 người. Hãy xây hoặc nâng cấp nhà ở.' };
}

export function checkHousingRemoval(grid, row, col, constructions = {}, tileMap = {}, levels = {}, extraction = {}, defense = {}, remote = {}) {
  const before = getWorkforce(grid, constructions, tileMap, levels, extraction,defense,remote);
  const next = grid.map(line => [...line]);
  next[row][col] = 'd12_meadow_wildflowers';
  const after = getWorkforce(next, constructions, tileMap, levels, extraction,defense,remote);
  const required = before.farmers + before.workers + before.soldiers;
  const allowed = after.worldTotal >= before.worldTotal || after.worldTotal >= required+(remote?.assigned||0);
  return { allowed, message: `Không thể gỡ nhà: sẽ thiếu ${Math.max(0, required - after.total)} dân làm việc. Hãy gỡ bớt luống, cho công nhân/lính nghỉ hoặc xây thêm nhà trước.` };
}
