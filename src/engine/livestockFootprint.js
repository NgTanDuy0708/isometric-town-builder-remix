import { isLivestockTile } from '../data/livestockConfig.js';
import { getLivestockCells, getLivestockAnchor, reserveLivestockCells, clearLivestockParts } from '../data/livestockFootprint.js';
import { isCellUnlocked } from '../data/landConfig.js';
import { canPlaceOnSurface, isPlacementProtected, getClearedSurface } from './placementSurface.js';

export function canPlaceLivestock(ctx, tileId, row, col, flipped=false, oldAnchor=null) {
  const grid=ctx.getCurrentGrid(),constructions=ctx.getConstructions?.() || {};
  return getLivestockCells(row,col,flipped).every(cell=> {
    const {row:r,col:c}=cell,key=`${r}_${c}`,id=grid[r]?.[c];
    if (r<0||c<0||r>=32||c>=32 ||
        !isCellUnlocked(r,c,ctx.getLandUnlockedChunks?.() || [],ctx.getGameMode?.() || 'sandbox') ||
        isPlacementProtected(tileId,r,c,id) || ctx.getKingdomWondersManager?.()?.getWonderAt(r,c)) return false;
    const owner=getLivestockAnchor(grid,r,c,constructions);
    const own=oldAnchor && owner?.row===oldAnchor.row && owner?.col===oldAnchor.col;
    if (constructions[key] && !own) return false;
    if (ctx.getUpgradesInProgress?.()?.[key] && !own) return false;
    if (!own && ctx.getFences?.()?.some(f=>f.row===r&&f.col===c)) return false;
    return own || canPlaceOnSurface(tileId,id);
  });
}

// Keep a single economic/simulation anchor; the second cell is only occupancy.
// Existing saves expand in place first, or move to the closest free unlocked pair.
export function migrateLivestockFootprints(save) {
  const grid=save.grid;
  if (!grid) return save;
  const pens=[];
  for(let row=0;row<32;row++)for(let col=0;col<32;col++) {
    const key=`${row}_${col}`,build=save.constructions?.[key];
    const tid=isLivestockTile(grid[row]?.[col])?grid[row][col]:build?.targetTileId;
    if(isLivestockTile(tid))pens.push({row,col,tid,build});
  }
  const ctx={getCurrentGrid:()=>grid,getConstructions:()=>save.constructions || {},
    getUpgradesInProgress:()=>save.upgradesInProgress || {},getFences:()=>save.fences || [],
    getGameMode:()=>save.economy?.gameMode || 'game',getLandUnlockedChunks:()=>save.land?.unlockedChunks || [],
    getKingdomWondersManager:()=>({getWonderAt:(r,c)=>Object.values(save.wonderSites || {}).find(w=>w.placed&&w.row===r&&w.col===c)})};
  for(const pen of pens) {
    const oldKey=`${pen.row}_${pen.col}`,flip=!!(pen.build?.flipped ?? save.flippedGrid?.[oldKey]);
    if(canPlaceLivestock(ctx,pen.tid,pen.row,pen.col,flip,pen)) {
      clearLivestockParts(grid,pen.row,pen.col,save.terrainMap);
      reserveLivestockCells(grid,pen.row,pen.col,flip);continue;
    }
    let target=null;
    for(let distance=1;distance<64&&!target;distance++)for(let dr=-distance;dr<=distance&&!target;dr++) {
      const dc=distance-Math.abs(dr);
      for(const offset of dc===0?[0]:[-dc,dc]) {
        const row=pen.row+dr,col=pen.col+offset;
        if(canPlaceLivestock(ctx,pen.tid,row,col,flip,pen)) {target={row,col};break;}
      }
    }
    // A completely packed map cannot expand without destroying another object.
    // Preserve its original pen and state so it can still be moved manually.
    if(!target)continue;
    clearLivestockParts(grid,pen.row,pen.col,save.terrainMap);
    if(!pen.build)grid[pen.row][pen.col]=getClearedSurface(pen.tid,pen.row,pen.col,save.terrainMap);
    const newKey=`${target.row}_${target.col}`;
    for(const name of ['flippedGrid','buildingLevels','livestockState','productionState','upgradesInProgress','constructions']) {
      const table=save[name];
      if(table && Object.hasOwn(table,oldKey)) {
        table[newKey]=table[oldKey];delete table[oldKey];
        if(name==='upgradesInProgress'||name==='constructions')Object.assign(table[newKey],target);
      }
    }
    if(!pen.build)grid[target.row][target.col]=pen.tid;
    reserveLivestockCells(grid,target.row,target.col,flip);
  }
  return save;
}
