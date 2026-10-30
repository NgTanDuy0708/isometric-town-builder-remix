import { isLivestockTile } from './livestockConfig.js';
import { getBaseTerrainTile } from './terrainConfig.js';

const PART_PREFIX = 'livestock_part:';
export const LIVESTOCK_WORLD_WIDTH = 192; // Width of the union of two isometric cells.
export const LIVESTOCK_UI_OFFSET_Y = -32;
export const isLivestockPart = id => typeof id === 'string' && id.startsWith(PART_PREFIX);

// The front fence corner is the anchor. Mirroring switches the long ground axis.
export function getLivestockCells(row, col, flipped = false) {
  return [{row,col}, {row:row-(flipped?1:0),col:col-(flipped?0:1)}];
}

export function getLivestockAnchor(grid, row, col, constructions = {}) {
  const id = grid?.[row]?.[col];
  if (isLivestockTile(id) || isLivestockTile(constructions[`${row}_${col}`]?.targetTileId)) return {row,col};
  if (!isLivestockPart(id)) return null;
  const match = /^livestock_part:(\d+)_(\d+)$/.exec(id);
  if (!match) return null;
  const r=Number(match[1]),c=Number(match[2]);
  return isLivestockTile(grid?.[r]?.[c]) || isLivestockTile(constructions[`${r}_${c}`]?.targetTileId)
    ? {row:r,col:c} : null;
}

export function reserveLivestockCells(grid, row, col, flipped = false) {
  const part=getLivestockCells(row,col,flipped)[1];
  grid[part.row][part.col]=`${PART_PREFIX}${row}_${col}`;
}

export function clearLivestockParts(grid, row, col, terrainMap) {
  const id=`${PART_PREFIX}${row}_${col}`;
  for (const [r,c] of [[row,col-1],[row-1,col]]) {
    if (grid[r]?.[c]===id) grid[r][c]=terrainMap?.[r]?.[c] || getBaseTerrainTile(c);
  }
}

export function getLivestockOutline(row,col,flipped,originX,originY,halfW,quarterW) {
  const cells=getLivestockCells(row,col,flipped);
  const r=Math.min(...cells.map(c=>c.row)),c=Math.min(...cells.map(c=>c.col));
  const rows=flipped?2:1,cols=flipped?1:2;
  const x=originX+(c-r)*halfW+64,y=originY+(r+c)*quarterW+64;
  return [[x,y],[x+cols*halfW,y+cols*quarterW],
    [x+(cols-rows)*halfW,y+(cols+rows)*quarterW],[x-rows*halfW,y+rows*quarterW]];
}
