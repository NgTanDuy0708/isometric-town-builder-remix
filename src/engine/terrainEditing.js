import { getBaseTerrainTile, getTerrainSprite, TERRAIN_TILE_KINDS } from '../data/terrainConfig.js';

export const TERRAIN_MAP_KEY = 'isometric_town_builder_terrain_v1';
export const TERRAIN_DRAFT_KEY = `${TERRAIN_MAP_KEY}_draft`;
export const TERRAIN_IDS = {
  grass: 'd12_meadow_wildflowers', sea: 'm30_sea_var2_coral_reef',
  shore: 'm01_sandy_beach_s', sand: 's13_sand_ground'
};
const validIds = new Set(Object.values(TERRAIN_IDS));
export const cloneTerrain = grid => grid.map(row => row.slice());

export function isValidTerrainMap(grid) {
  return Array.isArray(grid) && grid.length === 32 &&
    grid.every(row => Array.isArray(row) && row.length === 32 && row.every(id => validIds.has(id)));
}

export function createTerrainMap(grid) {
  return Array.from({ length: 32 }, (_, row) => Array.from({ length: 32 }, (_, col) => {
    const kind = TERRAIN_TILE_KINDS[grid?.[row]?.[col]];
    return TERRAIN_IDS[kind] || getBaseTerrainTile(col);
  }));
}

export function readTerrainMap(storage, key = TERRAIN_MAP_KEY) {
  try {
    const payload = JSON.parse(storage.getItem(key));
    return isValidTerrainMap(payload?.terrain) ? payload.terrain : null;
  } catch { return null; }
}

export function writeTerrainMap(storage, terrain, key = TERRAIN_MAP_KEY) {
  if (!isValidTerrainMap(terrain)) throw new Error('Bản đồ nền phải có 32 × 32 ô hợp lệ.');
  storage.setItem(key, JSON.stringify({ version: 1, savedAt: Date.now(), terrain }));
}

export function syncTerrainToGrid(grid, terrain) {
  if (!isValidTerrainMap(terrain)) return;
  for (let r = 0; r < 32; r++) for (let c = 0; c < 32; c++) {
    if (getTerrainSprite(grid?.[r]?.[c])) grid[r][c] = terrain[r][c];
  }
}

export function paintTerrainStroke(grid, from, to, id, size = 1) {
  const next = cloneTerrain(grid);
  const distance = Math.max(Math.abs(to.row-from.row), Math.abs(to.col-from.col), 1);
  const start = -Math.floor((size-1)/2), end = Math.ceil((size-1)/2);
  for (let step = 0; step <= distance; step++) {
    const r = Math.round(from.row+(to.row-from.row)*step/distance);
    const c = Math.round(from.col+(to.col-from.col)*step/distance);
    for (let dr = start; dr <= end; dr++) for (let dc = start; dc <= end; dc++) {
      if (r+dr >= 0 && r+dr < 32 && c+dc >= 0 && c+dc < 32) next[r+dr][c+dc] = id;
    }
  }
  return next;
}

export function fillTerrainRegion(grid, cell, id) {
  const next = cloneTerrain(grid), original = grid[cell.row][cell.col];
  if (original === id) return next;
  const queue = [cell];
  next[cell.row][cell.col] = id;
  for (let i = 0; i < queue.length; i++) {
    const { row, col } = queue[i];
    for (const [r,c] of [[row-1,col],[row+1,col],[row,col-1],[row,col+1]]) {
      if (r >= 0 && r < 32 && c >= 0 && c < 32 && next[r][c] === original) {
        next[r][c] = id; queue.push({row:r,col:c});
      }
    }
  }
  return next;
}

export function paintTerrainRectangle(grid, from, to, id) {
  const next = cloneTerrain(grid);
  for (let r = Math.min(from.row,to.row); r <= Math.max(from.row,to.row); r++) {
    for (let c = Math.min(from.col,to.col); c <= Math.max(from.col,to.col); c++) next[r][c] = id;
  }
  return next;
}
