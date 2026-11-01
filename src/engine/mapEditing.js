import {TILES_DATA} from '../data/tilesData.js';
import {AESTHETIC_TILE_URIS} from '../data/aestheticTileIcons.js';
import {TILE_DATA_URIS} from '../data/sprites.js';
import {getShopCategory} from '../data/shopCatalog.js';
import {getBuildingSpriteUri} from '../data/buildingSprites.js';
import {UPGRADES_CONFIG} from '../data/upgradesConfig.js';
import {FRUIT_TREES_CONFIG} from '../data/fruitTreeConfig.js';
import {EXPANSION_PLANTS} from '../data/fruitTreeSprites.js';
import {CROPS_CONFIG} from '../data/cropsConfig.js';
import {CROP_GROWTH_SPRITES} from '../data/cropGrowthSprites.js';
import {LIVESTOCK_RULES,isLivestockTile} from '../data/livestockConfig.js';
import {getLivestockCells,getLivestockAnchor,reserveLivestockCells,isLivestockPart} from '../data/livestockFootprint.js';
import {isFenceTile,canAddFence} from '../data/fenceConfig.js';
import {getTerrainSprite} from '../data/terrainConfig.js';
import {isHarborCell} from '../data/harborLayout.js';
import {VILLAGE_GATE_ID,VILLAGE_GATE_PART} from '../data/villageGate.js';
import {normalizeMapLocks} from '../data/mapLocks.js';
import {MAP_SCENE_ITEMS} from '../data/mapSceneCatalog.js';
import {getRotatedTileIdAndFlip} from './upgradeManager.js';
import {getSurroundingForestTile,getSurroundingOceanTile,isSurroundingOcean,isSurroundingBeach} from './canvasRenderer.js';
import {createFruitTreeState} from './fruitTreeLifecycle.js';
import {createTerrainMap,isValidTerrainMap,cloneTerrain,paintTerrainStroke,paintTerrainRectangle,fillTerrainRegion} from './terrainEditing.js';

export const MAP_DRAFT_KEY='isometric_town_builder_map_draft_v2';
export const STARTER_MAP_KEY='isometric_town_builder_starter_map_v2';
export const MAP_APPLY_KEY='isometric_town_builder_map_apply_v2';
export const MAP_CATEGORIES=[['all','Tất cả'],['residential','Nhà ở'],['production','Sản xuất'],['farming','Nông trại'],['crops','Cây trồng'],['roads','Đường & hàng rào'],['decor','Trang trí'],['nature','Tài nguyên & cảnh quan']];
const wonders={royal_palace:'Đại Lâu Đài Hoàng Gia',ocean_library:'Đại Thư Viện Biển',poseidon_statue:'Tượng Poseidon'};
const unique=new Map(TILES_DATA.map(tile=>[tile.id,tile]));
export const MAP_ITEMS=[...unique.values()].filter(tile=>AESTHETIC_TILE_URIS[tile.id]||TILE_DATA_URIS[tile.id]).map(tile=>({
  id:tile.id,label:tile.label,category:isFenceTile(tile.id)?'roads':tile.id.startsWith('n0')?'nature':getShopCategory(tile)==='hidden'?'nature':getShopCategory(tile)||'nature',
  uri:FRUIT_TREES_CONFIG[tile.id]?EXPANSION_PLANTS[tile.id].stages.fruiting:AESTHETIC_TILE_URIS[tile.id]||TILE_DATA_URIS[tile.id],
  maxLevel:UPGRADES_CONFIG[tile.id]?.maxLevel||1
})).concat(Object.entries(CROPS_CONFIG).map(([id,crop])=>({id:'crop:'+id,label:crop.shortName||crop.name,category:'crops',uri:CROP_GROWTH_SPRITES[id].ripe,maxLevel:1})),
  Object.entries(wonders).map(([id,label])=>({id:'wonder:'+id,label,category:'decor',uri:'/assets/wonders/'+id+'.png',maxLevel:1})),MAP_SCENE_ITEMS);
export const MAP_ITEM_BY_ID=Object.fromEntries(MAP_ITEMS.map(item=>[item.id,item]));
const fields=['flippedGrid','buildingLevels','farmlandState','fruitTreesState','livestockState','mapLocks'];
const clone=value=>structuredClone(value);
const inside=(r,c)=>Number.isInteger(r)&&Number.isInteger(c)&&r>=0&&r<32&&c>=0&&c<32;
export const insideMapEditor=(r,c)=>Number.isInteger(r)&&Number.isInteger(c)&&r>=-24&&r<56&&c>=-24&&c<56;
const core=(r,c,id)=>id==='b14_town_hall'||r>=12&&r<=13&&c>=14&&c<=16;
export function mapItemUri(id,level=1){return getBuildingSpriteUri(id,level)||MAP_ITEM_BY_ID[id]?.uri;}

export function createMapDocument(save={}){
  const terrain=isValidTerrainMap(save.terrainMap)?clone(save.terrainMap):createTerrainMap(save.grid);
  const doc={version:2,customMapLayout:true,grid:save.grid?clone(save.grid):cloneTerrain(terrain),terrainMap:terrain,
    mapScenery:clone(save.mapScenery||{}),
    fences:Array.isArray(save.fences)?clone(save.fences).map(f=>({...f,flipped:!!f.flipped})):[],
    wonderSites:clone(save.wonderSites||{}),kingdomWonders:clone(save.kingdomWonders||{}),
    land:clone(save.land||{unlockedChunks:[]}),
    flippedGrid:clone(save.flippedGrid||{}),buildingLevels:clone(save.buildingLevels||{}),
    farmlandState:clone(save.farmlandState||{}),fruitTreesState:clone(save.fruitTreesState||{}),
    livestockState:clone(save.livestockState||{}),mapLocks:normalizeMapLocks(save.mapLocks)};
  // The former fixed gate becomes a selectable editor object. Its road stays.
  for(let r=0;r<32;r++)for(let c=0;c<32;c++){
    if(doc.grid[r][c]===VILLAGE_GATE_ID){doc.mapScenery[`${r}_${c}`]={tileId:'scene:gate',level:1,flipped:false,locked:true};doc.grid[r][c]=terrain[r][c];}
    if(doc.grid[r][c]===VILLAGE_GATE_PART)doc.grid[r][c]=terrain[r][c];
  }
  if(!save.customMapLayout){
    doc.mapScenery['14_4']={tileId:'scene:pier',level:1,flipped:false,locked:true};
    doc.mapScenery['15_3']={tileId:'scene:ship',level:1,flipped:false,locked:true};
  }
  return doc;
}
export function isValidMapDocument(doc){
  const known=new Set([...MAP_ITEMS.map(i=>i.id),VILLAGE_GATE_PART]);
  if(doc?.version!==2||!isValidTerrainMap(doc.terrainMap)||!Array.isArray(doc.grid)||doc.grid.length!==32||
    !doc.grid.every(row=>Array.isArray(row)&&row.length===32&&row.every(id=>typeof id==='string'&&(known.has(id)||getTerrainSprite(id)||isLivestockPart(id)))))return false;
  if(fields.some(field=>!doc[field]||typeof doc[field]!=='object'||Array.isArray(doc[field])))return false;
  if(!Array.isArray(doc.fences)||doc.fences.some(f=>!isFenceTile(f?.tileId)||!insideMapEditor(f.row,f.col)||typeof f.flipped!=='boolean'))return false;
  if(!doc.mapScenery||typeof doc.mapScenery!=='object'||Array.isArray(doc.mapScenery))return false;
  for(const [key,item] of Object.entries(doc.mapScenery)){
    if(!/^-?\d+_-?\d+$/.test(key))return false;
    const [r,c]=key.split('_').map(Number);
    if(!insideMapEditor(r,c)||item!==null&&(!item||!MAP_ITEM_BY_ID[item.tileId]||typeof item.flipped!=='boolean'))return false;
  }
  if(!doc.wonderSites||typeof doc.wonderSites!=='object'||Array.isArray(doc.wonderSites)||!doc.kingdomWonders||typeof doc.kingdomWonders!=='object')return false;
  if(Object.entries(doc.wonderSites).some(([id,s])=>!wonders[id]||!s||!inside(s.row,s.col)))return false;
  for(let r=0;r<32;r++)for(let c=0;c<32;c++){
    if(isLivestockPart(doc.grid[r][c])&&!getLivestockAnchor(doc.grid,r,c))return false;
  }
  return true;
}
export function readMapDocument(storage,key){
  try{let doc=JSON.parse(storage.getItem(key)||'null');if(doc?.version===2&&!doc.mapScenery)doc=createMapDocument(doc);return isValidMapDocument(doc)?doc:null;}catch{return null;}
}
export function writeMapDocument(storage,key,doc){
  if(!isValidMapDocument(doc))throw Error('Bản đồ không hợp lệ.');
  storage.setItem(key,JSON.stringify(doc));
}
function cellsFor(doc,row,col){
  const livestock=getLivestockAnchor(doc.grid,row,col);
  if(livestock)return getLivestockCells(livestock.row,livestock.col,!!doc.flippedGrid[`${livestock.row}_${livestock.col}`]);
  const id=doc.grid[row][col];
  if(id==='b60_combined_warehouse'){
    let r=row,c=col;while(doc.grid[r+1]?.[c]===id)r++;while(doc.grid[r]?.[c+1]===id)c++;
    return [{row:r,col:c},{row:r-1,col:c},{row:r,col:c-1},{row:r-1,col:c-1}];
  }
  return [{row,col}];
}
function clearObject(doc,row,col){
  const cells=cellsFor(doc,row,col);
  if(cells.some(p=>core(p.row,p.col,doc.grid[p.row]?.[p.col])))return false;
  for(const [id,site] of Object.entries(doc.wonderSites))if(site.row===row&&site.col===col){delete doc.wonderSites[id];delete doc.kingdomWonders[id];}
  for(const p of cells){const key=`${p.row}_${p.col}`;doc.grid[p.row][p.col]=doc.terrainMap[p.row][p.col];for(const field of fields)delete doc[field][key];}
  return true;
}
export function getMapSelection(doc,row,col){
  if(!insideMapEditor(row,col))return null;
  const fenceAt=doc.fences.find(f=>f.row===row&&f.col===col);
  if(!inside(row,col)&&fenceAt)return {row,col,id:fenceAt.tileId,level:1,flipped:!!fenceAt.flipped,locked:!!fenceAt.locked,fenceOnly:true};
  const scenery=doc.mapScenery[`${row}_${col}`];
  if(scenery)return {row,col,id:scenery.tileId,level:scenery.level||1,flipped:!!scenery.flipped,locked:!!scenery.locked,scenery:true};
  if(!inside(row,col)){
    if(Object.hasOwn(doc.mapScenery,`${row}_${col}`))return {row,col,id:null,level:1,flipped:false,locked:false,scenery:true};
    const generated=isSurroundingOcean(row,col)?getSurroundingOceanTile(row,col):isSurroundingBeach(row,col)?null:getSurroundingForestTile(row,col);
    return {row,col,id:generated?.tid||null,level:1,flipped:!!generated?.flipped,locked:true,scenery:true};
  }
  let anchor=getLivestockAnchor(doc.grid,row,col)||{row,col};
  if(doc.grid[row][col]==='b60_combined_warehouse')anchor=cellsFor(doc,row,col)[0];
  const key=`${anchor.row}_${anchor.col}`;
  const id=doc.grid[anchor.row][anchor.col];
  const fence=doc.fences.find(f=>f.row===row&&f.col===col);
  if(fence&&getTerrainSprite(id))return {row,col,id:fence.tileId,level:1,flipped:!!fence.flipped,locked:!!fence.locked,fenceOnly:true};
  const wonder=Object.entries(doc.wonderSites).find(([,s])=>s.row===row&&s.col===col);
  if(wonder)return {row,col,id:'wonder:'+wonder[0],level:1,flipped:!!wonder[1].flipped,locked:!!doc.mapLocks[key]};
  return {...anchor,id:doc.farmlandState[key]?.seedId?'crop:'+doc.farmlandState[key].seedId:id,level:doc.buildingLevels[key]||1,flipped:!!doc.flippedGrid[key],locked:core(row,col,id)||!!doc.mapLocks[key],fence};
}
export function setMapRemovalRule(doc,row,col,locked,fenceOnly=false){
  const next=clone(doc);if(!insideMapEditor(row,col))return next;
  if(fenceOnly){for(const f of next.fences)if(f.row===row&&f.col===col)f.locked=!!locked;return next;}
  if(next.mapScenery[`${row}_${col}`]){next.mapScenery[`${row}_${col}`].locked=!!locked;return next;}
  if(!inside(row,col)){
    const selected=getMapSelection(next,row,col);
    if(selected?.id&&MAP_ITEM_BY_ID[selected.id])next.mapScenery[`${row}_${col}`]={tileId:selected.id,level:1,flipped:selected.flipped,locked:!!locked};
    return next;
  }
  if(core(row,col,next.grid[row][col]))return next;
  for(const cell of cellsFor(next,row,col)){
    const key=`${cell.row}_${cell.col}`;next.mapLocks[key]=!!locked;
  }
  return next;
}
export function stampMapItem(doc,row,col,id,{level=1,flipped=false,locked=false,animals=1}={}){
  if(!insideMapEditor(row,col)||!MAP_ITEM_BY_ID[id])return {doc,changed:false,error:'Chọn một vật phẩm trong danh mục.'};
  if(id==='b14_town_hall')return {doc,changed:false,error:'Tòa thị chính giữ vị trí cố định.'};
  if(id===VILLAGE_GATE_ID)id='scene:gate';
  const next=clone(doc),key=`${row}_${col}`;
  // Fences live on boundary edges, independently of the protected hall cells.
  if(!isFenceTile(id)&&inside(row,col)&&core(row,col,next.grid[row][col]))return {doc,changed:false,error:'Tòa thị chính giữ vị trí trung tâm.'};
  if(id.startsWith('scene:')||!inside(row,col)&&!isFenceTile(id)){
    if(id.startsWith('crop:')||id.startsWith('wonder:'))return {doc,changed:false,error:'Cây trồng và kỳ quan cần đặt trong vùng chơi 32 × 32.'};
    if(id==='scene:gate'||id==='scene:pier'||id==='scene:ship')for(const [oldKey,entry] of Object.entries(next.mapScenery))if(entry?.tileId===id)next.mapScenery[oldKey]=null;
    next.mapScenery[key]={tileId:id,level,flipped:!!flipped,locked:!!locked};
    return {doc:next,changed:true};
  }
  if(isFenceTile(id)){
    if(isHarborCell(row,col)||!canAddFence(next.fences,id,row,col,flipped))return {doc,changed:false};
    next.fences.push({tileId:id,row,col,flipped:!!flipped,locked:!!locked});return {doc:next,changed:true};
  }
  if(id.startsWith('wonder:')){
    if(!clearObject(next,row,col))return {doc,changed:false,error:'Vị trí thuộc công trình cố định.'};
    const wid=id.slice(7),old=next.wonderSites[wid];
    if(old)delete next.mapLocks[`${old.row}_${old.col}`];
    next.wonderSites[wid]={id:wid,name:wonders[wid],row,col,flipped:!!flipped,placed:true};next.kingdomWonders[wid]=4;
    next.mapLocks[key]=!!locked;
    return {doc:next,changed:true};
  }
  const crop=id.startsWith('crop:')?id.slice(5):null,tileId=crop?'d13_farmland_plot':id;
  const cells=isLivestockTile(tileId)?getLivestockCells(row,col,flipped):tileId==='b60_combined_warehouse'?
    [{row,col},{row:row-1,col},{row,col:col-1},{row:row-1,col:col-1}]:[{row,col}];
  if(cells.some(p=>!inside(p.row,p.col)||core(p.row,p.col,next.grid[p.row]?.[p.col])))return {doc,changed:false,error:'Vị trí thuộc công trình cố định hoặc ngoài bản đồ.'};
  if(tileId==='b60_combined_warehouse')for(let r=0;r<32;r++)for(let c=0;c<32;c++)if(next.grid[r][c]===tileId)clearObject(next,r,c);
  for(const cell of cells)if(!clearObject(next,cell.row,cell.col))return {doc,changed:false};
  next.grid[row][col]=tileId;next.flippedGrid[key]=!!flipped;
  next.buildingLevels[key]=Math.min(Math.max(1,Number(level)||1),MAP_ITEM_BY_ID[id].maxLevel);
  if(isLivestockTile(tileId)){
    reserveLivestockCells(next.grid,row,col,flipped);
    next.livestockState[key]={state:'hungry',animalCount:Math.max(0,Math.min(LIVESTOCK_RULES[tileId].maxAnimals,animals))};
  }else if(tileId==='b60_combined_warehouse')for(const p of cells)next.grid[p.row][p.col]=tileId;
  if(crop)next.farmlandState[key]={seedId:crop,plantTime:0,growDurationMs:CROPS_CONFIG[crop].growTimeSec*1000};
  if(FRUIT_TREES_CONFIG[tileId])next.fruitTreesState[key]={...createFruitTreeState(1),ready:true};
  for(const p of cells)next.mapLocks[`${p.row}_${p.col}`]=!!locked;
  return {doc:next,changed:true};
}
export function eraseMapItem(doc,row,col,fenceOnly=false){
  if(!insideMapEditor(row,col))return doc;
  if(!inside(row,col)&&doc.fences.some(f=>f.row===row&&f.col===col))return {...clone(doc),fences:doc.fences.filter(f=>f.row!==row||f.col!==col)};
  const key=`${row}_${col}`;
  if(doc.mapScenery[key]||!inside(row,col)){const next=clone(doc);next.mapScenery[key]=null;return next;}
  const next=clone(doc),fences=next.fences.filter(f=>f.row!==row||f.col!==col);
  if(fenceOnly||fences.length!==next.fences.length){next.fences=fences;return next;}
  clearObject(next,row,col);return next;
}
export function rotateMapItem(doc,row,col){
  const selected=getMapSelection(doc,row,col);if(!selected?.id||!MAP_ITEM_BY_ID[selected.id])return {doc,changed:false};
  const rotated=getRotatedTileIdAndFlip(selected.id,selected.flipped);
  const base=selected.fenceOnly?eraseMapItem(doc,row,col,true):doc;
  return stampMapItem(base,selected.row,selected.col,rotated.nextId,{level:selected.level,flipped:rotated.nextFlip,locked:selected.locked,
    animals:doc.livestockState[`${selected.row}_${selected.col}`]?.animalCount||0});
}
export function paintMapTerrain(doc,from,to,id,size=1,tool='brush'){
  const next=clone(doc);
  const terrain=tool==='fill'?fillTerrainRegion(next.terrainMap,from,id):tool==='rectangle'?paintTerrainRectangle(next.terrainMap,from,to,id):paintTerrainStroke(next.terrainMap,from,to,id,size);
  for(let r=0;r<32;r++)for(let c=0;c<32;c++)if(terrain[r][c]!==next.terrainMap[r][c]&&getTerrainSprite(next.grid[r][c]))next.grid[r][c]=terrain[r][c];
  next.terrainMap=terrain;return next;
}
export function applyMapDocumentToSave(save,doc){
  if(!isValidMapDocument(doc))throw Error('Bản đồ không hợp lệ.');
  const result={...clone(save),...clone(doc),version:3,presetName:'editor',savedAt:Date.now(),
    constructions:{},upgradesInProgress:{},productionState:{},extraction:null,defense:null};
  // Fruit trees and crops in an initial map start ready; no stale building jobs,
  // workers or combat targets are copied to the newly arranged cells.
  if(result.world?.active==='forest'){
    const {world,premium,...region}=save;
    result.world={...result.world,active:'town',regions:{...result.world.regions,forest:clone(region)}};
  }
  return result;
}
export function restartMapGrowth(doc,now=Date.now()){
  const next=clone(doc);
  for(const farm of Object.values(next.farmlandState))if(CROPS_CONFIG[farm.seedId])farm.plantTime=now-farm.growDurationMs;
  for(const [key,tree] of Object.entries(next.fruitTreesState)){
    const [r,c]=key.split('_').map(Number);if(FRUIT_TREES_CONFIG[next.grid[r]?.[c]])next.fruitTreesState[key]={...tree,plantedAt:now-FRUIT_TREES_CONFIG[next.grid[r][c]].intervalSec*1000,ready:true};
  }
  return next;
}
