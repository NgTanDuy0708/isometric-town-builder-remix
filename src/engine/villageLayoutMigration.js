import {TILES_DATA} from '../data/tilesData.js';
import {getBaseTerrainTile,getTerrainSprite} from '../data/terrainConfig.js';
import {isLivestockPart} from '../data/livestockFootprint.js';
import {VILLAGE_GATE_ID,VILLAGE_GATE_PART,isVillageGateCell,applyVillageGateLayout} from '../data/villageGate.js';

const knownIds=new Set(TILES_DATA.map(tile=>tile.id));
const aliases={
  s21_forest_var1_hollow_oak:'d28_forest_dense_canopy',
  s22_forest_var2_silver_birch:'d29_forest_oak_woodland',
  s23_forest_var3_pine_cedar:'d05_pine_grove',
  s24_forest_var4_cherry_willow:'d06_cherry_garden'
};
const stateMaps=['flippedGrid','constructions','productionState','buildingLevels',
  'upgradesInProgress','farmlandState','fruitTreesState','livestockState'];

// Remove retired, invisible props; retain live buildings, forest and player progress.
// Return a detached snapshot so the bundled dev fixture is never mutated on import.
export function normalizeVillageSave(save) {
  if (!Array.isArray(save?.grid)) return save;
  const next={...save,grid:save.grid.map(row=>row.slice())};
  for (const field of stateMaps) if (save[field]) next[field]={...save[field]};
  const clearCellState=(r,c)=>{
    for (const field of stateMaps) if (next[field]) delete next[field][`${r}_${c}`];
  };
  for (let r=0;r<next.grid.length;r++) for (let c=0;c<next.grid[r].length;c++) {
    let id=next.grid[r][c];
    if (aliases[id]) id=next.grid[r][c]=aliases[id];
    const obsolete=!knownIds.has(id)&&!getTerrainSprite(id)&&!isLivestockPart(id)&&id!==VILLAGE_GATE_PART;
    if (obsolete || !save.customMapLayout&&(id===VILLAGE_GATE_ID || id===VILLAGE_GATE_PART || isVillageGateCell(r,c))) {
      if (obsolete || (id===VILLAGE_GATE_ID&&!isVillageGateCell(r,c))) {
        next.grid[r][c]=next.terrainMap?.[r]?.[c] || getBaseTerrainTile(c);
      }
      clearCellState(r,c);
    }
  }
  if(!save.customMapLayout)applyVillageGateLayout(next.grid,next.terrainMap);
  return next;
}
