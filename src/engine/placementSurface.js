import { getTerrainSprite, getBaseTerrainTile } from '../data/terrainConfig.js';
import { isProtectedTile } from '../data/starterMap.js';
import { isHarborCell } from '../data/harborLayout.js';

export function isPlacementProtected(tileId, row, col, currentId) {
  if (isHarborCell(row,col)) return true;
  if (!isProtectedTile(row, col, currentId)) return false;
  // Only the open coast admits aquatic objects. Keep the hall, delivery road
  // and harbor protected, and never allow replacing an occupied coast cell.
  return !(col <= 3 && row >= 0 && row <= 31 &&
    ['a01_whale', 'a02_flamingo_flock', 'r12_road_bridge_stone'].includes(tileId) &&
    canPlaceOnSurface(tileId, currentId));
}

export function getClearedSurface(tileId, row, col, terrainMap) {
  // Đồ vật/đường là lớp phủ. Khi nhấc lên luôn trả lại đúng nền bên dưới.
  return terrainMap?.[row]?.[col] || getBaseTerrainTile(col);
}

export function canPlaceOnSurface(tileId, currentId) {
  const terrain = getTerrainSprite(currentId);
  const isLand = ['d12_meadow_wildflowers', 'g01_grass_flat', 's13_sand_ground'].includes(currentId);
  const isSea = !!terrain && terrain.color === '#3f74bc';
  const isShore = currentId === 'm01_sandy_beach_s';
  if (tileId === 'a01_whale') return isSea;
  if (tileId === 'a02_flamingo_flock') return isSea || isShore || currentId === 's13_sand_ground';
  if (tileId === 'r12_road_bridge_stone') return isLand || isSea || isShore;
  return isLand;
}
