import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { getLivestockAnchor, getLivestockCells, reserveLivestockCells, clearLivestockParts, isLivestockPart } from '../src/data/livestockFootprint.js';
import { canPlaceLivestock, migrateLivestockFootprints } from '../src/engine/livestockFootprint.js';
import { LIVESTOCK_TILE_IDS, isLivestockTile } from '../src/data/livestockConfig.js';
import { initInputHandler } from '../src/engine/inputHandler.js';
import { createStarterTownMap32, isProtectedTile, isIndestructibleTile } from '../src/data/starterMap.js';
import {isMapLockedCell,isMapRemovableCell} from '../src/data/mapLocks.js';
import { getBaseTerrainTile, getTerrainSprite } from '../src/data/terrainConfig.js';
import { getDefaultSaveState, saveGameSave, loadGameSave, importGameFromJSON } from '../src/engine/storage.js';
import { createTerrainMap } from '../src/engine/terrainEditing.js';
import { TILES_DATA } from '../src/data/tilesData.js';
import { calculateVillageStats, getTileCost } from '../src/data/gameEconomy.js';
import { getRotatedTileIdAndFlip, isRotationVisible, calculateDemolishRefund } from '../src/engine/upgradeManager.js';
import { isCellUnlocked } from '../src/data/landConfig.js';
import { getClearedSurface, canPlaceOnSurface, isPlacementProtected } from '../src/engine/placementSurface.js';
import {FRUIT_TREES_CONFIG} from '../src/data/fruitTreeConfig.js';
import {getFruitTreeVisual,resolveFruitTreeState} from '../src/engine/fruitTreeLifecycle.js';

const noop=()=>{};
const tiles=Object.fromEntries(TILES_DATA.map(t=>[t.id,t]));
function surface(){const listeners={};return {addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn),
  dispatch:(type,e)=>{for(const fn of listeners[type]||[])fn(e)},
  getBoundingClientRect:()=>({left:0,top:0}),classList:{add:noop,remove:noop}};}
function scene(t,mode='sandbox') {
  const container=surface(),win=surface();globalThis.window=win;globalThis.document={getElementById:()=>null};
  const grid=createStarterTownMap32(),terrain=createTerrainMap(grid),constructions={},flipped={},levels={},livestock={},upgrades={},events=[];
  let moving=null,brush=null,brushFlip=false,cell={row:20,col:20},gold=10000;
  const ctx={getCamera:()=>({x:0,y:0,zoom:1}),screenToWorldCoords:(x,y)=>({x,y}),worldToCell:()=>cell,
    getCurrentGrid:()=>grid,getTerrainMap:()=>terrain,getConstructions:()=>constructions,getFlippedGrid:()=>flipped,
    getBuildingLevels:()=>levels,getLivestockState:()=>livestock,getUpgradesInProgress:()=>upgrades,
    getMovingBuilding:()=>moving,setMovingBuilding:v=>moving=v,getActiveBrush:()=>brush,getBrushFlipped:()=>brushFlip,
    getActiveSeedBrush:()=>null,getHoverCell:()=>cell,getGameMode:()=>mode,getLandUnlockedChunks:()=>Array.from({length:64},(_,i)=>i),
    getPlayerGold:()=>gold,deductGold:n=>gold-=n,getFarmlandState:()=>({}),getProductionState:()=>({}),getTileMap:()=>tiles,
    getVillagerManager:()=>null,openLivestockModal:(r,c)=>events.push(['modal',r,c]),harvestProductionBuilding:(r,c)=>events.push(['harvest',r,c]),
    openConstructionSpeedupModal:(r,c)=>events.push(['construction',r,c]),
    updateGoldDisplay:noop,saveGameEconomyState:noop,saveConstructionsState:noop,saveFlippedGrid:noop,
    pushUndo:noop,showToast:noop,requestRender:noop,updateVillageStatsUI:noop,checkQuestsProgress:noop,triggerAutoSave:noop,persistGameState:noop};
  const input=initInputHandler(container,ctx);t.after(()=>input.destroy());
  return {grid,terrain,constructions,flipped,levels,livestock,upgrades,ctx,input,events,
    gold:()=>gold,brush:(id,flip=false)=>{brush=id;brushFlip=flip},move:v=>moving=v,cell:v=>cell=v,
    click:()=>{const e={clientX:200,clientY:200,button:0,isPrimary:true,pointerId:1,pointerType:'mouse'};container.dispatch('pointerdown',e);win.dispatch('pointerup',e)}};
}

test('each pen reserves two cells, charges once, and cannot overlap either occupied half',t=>{
  for(const id of LIVESTOCK_TILE_IDS)for(const flip of [false,true]) {
    const s=scene(t);s.brush(id,flip);
    assert.equal(s.input.confirmPlacement(),true,id);
    const cells=getLivestockCells(20,20,flip),part=cells[1];
    assert.equal(s.grid[20][20],id);assert.ok(isLivestockPart(s.grid[part.row][part.col]));
    assert.deepEqual(getLivestockAnchor(s.grid,part.row,part.col),{row:20,col:20});
    const stats=calculateVillageStats(s.grid,{},tiles,{});
    clearLivestockParts(s.grid,20,20,s.terrain);
    assert.deepEqual(calculateVillageStats(s.grid,{},tiles,{}),stats,'Second cell adds no population or building');
    reserveLivestockCells(s.grid,20,20,flip);
    s.cell(part);s.brush('b01_cottage_red');assert.equal(s.input.confirmPlacement(),false);
    assert.equal(canPlaceLivestock(s.ctx,id,20,21,false),false);
  }
  const s=scene(t,'game');s.brush('d33_pig_pen_barn',true);const before=s.gold();
  assert.equal(s.input.confirmPlacement(),true);
  assert.equal(before-s.gold(),getTileCost('d33_pig_pen_barn',tiles.d33_pig_pen_barn.category));
  assert.equal(s.input.confirmPlacement(),false);assert.equal(before-s.gold(),getTileCost('d33_pig_pen_barn',tiles.d33_pig_pen_barn.category));
});

test('construction reserves the second cell immediately and both cells open the same construction',t=>{
  const s=scene(t,'game');s.brush('b21_chicken_coop',true);assert.equal(s.input.confirmPlacement(),true);
  assert.ok(s.constructions['20_20']);assert.ok(isLivestockPart(s.grid[19][20]));
  s.brush(null);s.cell({row:19,col:20});s.click();assert.deepEqual(s.events,[['construction',20,20]]);
  const before=structuredClone(s.grid);s.brush('b21_chicken_coop');s.cell({row:19,col:21});
  assert.equal(s.input.confirmPlacement(),false);assert.deepEqual(s.grid,before);
});

test('both occupied cells open and harvest one shared herd, including mirrored pens',t=>{
  for(const id of LIVESTOCK_TILE_IDS)for(const flip of [false,true]) {
    const s=scene(t);s.grid[20][20]=id;reserveLivestockCells(s.grid,20,20,flip);
    for(const cell of getLivestockCells(20,20,flip)) {
      s.cell(cell);s.events.length=0;s.click();assert.deepEqual(s.events,[['modal',20,20]]);
      s.livestock['20_20']={animalCount:2,state:'ready'};s.events.length=0;s.click();
      assert.deepEqual(s.events,[['harvest',20,20]]);delete s.livestock['20_20'];
    }
  }
});

test('moving and mirroring keep the herd, level and running upgrade while releasing the old ground',t=>{
  const s=scene(t);const id='d33_pig_pen_barn';s.grid[20][20]=id;reserveLivestockCells(s.grid,20,20);
  s.livestock['20_20']={animalCount:4,state:'producing',feedTime:1234,durationMs:75000};s.levels['20_20']=2;
  s.upgrades['20_20']={row:20,col:20,targetLevel:3,startTime:1000,durationMs:5000};
  const herd=structuredClone(s.livestock['20_20']);
  s.move({tileId:id,fromRow:20,fromCol:20,level:2,flipped:true});s.cell({row:21,col:20});
  assert.equal(s.input.confirmPlacement(),true,'New second cell may overlap the old anchor');
  assert.deepEqual(s.livestock['21_20'],herd);assert.equal(s.livestock['20_20'],undefined);
  assert.equal(s.levels['21_20'],2);assert.equal(s.flipped['21_20'],true);
  assert.deepEqual(s.upgrades['21_20'],{row:21,col:20,targetLevel:3,startTime:1000,durationMs:5000});
  assert.equal(s.grid[20][19],s.terrain[20][19]);assert.deepEqual(getLivestockAnchor(s.grid,20,20),{row:21,col:20});
  s.move({tileId:id,fromRow:21,fromCol:20,level:2,flipped:false});s.cell({row:21,col:20});
  assert.equal(s.input.confirmPlacement(),true,'Mirroring in place must update occupancy');
  assert.deepEqual(s.livestock['21_20'],herd);assert.equal(s.grid[20][20],s.terrain[20][20]);
  assert.deepEqual(getLivestockAnchor(s.grid,21,19),{row:21,col:20});
});

test('placement rejects map edges, locked land, constructions, upgrades, wonders and occupied extension cells',t=>{
  const s=scene(t),id='b22_cow_pasture';
  assert.equal(canPlaceLivestock(s.ctx,id,20,0),false);assert.equal(canPlaceLivestock(s.ctx,id,0,20,true),false);
  for(const setup of [()=>s.grid[20][19]='b01_cottage_red',()=>s.constructions['20_19']={targetTileId:'b06_bakery'},
    ()=>s.upgrades['20_19']={},()=>s.ctx.getKingdomWondersManager=()=>({getWonderAt:(r,c)=>r===20&&c===19?{}:null}),
    ()=>s.ctx.getLandUnlockedChunks=()=>[]]) {
    s.grid[20][19]='d12_meadow_wildflowers';delete s.constructions['20_19'];delete s.upgrades['20_19'];
    delete s.ctx.getKingdomWondersManager;s.ctx.getLandUnlockedChunks=()=>Array.from({length:64},(_,i)=>i);s.ctx.getGameMode=()=> 'game';
    setup();assert.equal(canPlaceLivestock(s.ctx,id,20,20),false);
  }
});

test('legacy save expansion moves to a nearby free pair without losing animals or overwriting neighbouring buildings',()=>{
  const save=getDefaultSaveState(),grid=save.grid,id='d33_pig_pen_barn';
  grid[20][20]=id;grid[20][19]='b01_cottage_red';save.livestockState['20_20']={animalCount:4,state:'producing',feedTime:1234};
  save.buildingLevels['20_20']=3;save.upgradesInProgress['20_20']={row:20,col:20,targetLevel:3};
  const expected=structuredClone(save.livestockState['20_20']);migrateLivestockFootprints(save);
  assert.equal(grid[20][19],'b01_cottage_red');
  const [key]=Object.keys(save.livestockState);assert.deepEqual(save.livestockState[key],expected);assert.equal(save.buildingLevels[key],3);
  const [row,col]=key.split('_').map(Number);assert.equal(grid[row][col],id);assert.ok(isLivestockPart(grid[row][col-1]));
  assert.equal(save.upgradesInProgress[key].row,row);assert.equal(save.upgradesInProgress[key].col,col);
  const snapshot=JSON.stringify(save);migrateLivestockFootprints(save);assert.equal(JSON.stringify(save),snapshot,'Migration runs once');
  const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  assert.equal(saveGameSave(save),true);const loaded=loadGameSave();
  assert.deepEqual(loaded.livestockState,save.livestockState);assert.deepEqual(loaded.grid,save.grid);
});

test('mirrored construction survives reload without reserving a third cell',()=>{
  const save=getDefaultSaveState();save.constructions['20_20']={row:20,col:20,targetTileId:'b21_chicken_coop',flipped:true,startTime:100,durationMs:9000};
  migrateLivestockFootprints(save);assert.ok(isLivestockPart(save.grid[19][20]));assert.equal(save.grid[20][19],'d12_meadow_wildflowers');
  const snapshot=JSON.stringify(save);migrateLivestockFootprints(save);assert.equal(JSON.stringify(save),snapshot);
});

import { checkHousingRemoval, getWorkforce, checkFarmWorkforce } from '../src/engine/workforce.js';

function studioScene() {
  const source=fs.readFileSync(new URL('../src/studioEngine.js',import.meta.url),'utf8');
  const save=getDefaultSaveState(),cleared=[];
  const context={isMapLockedCell,isMapRemovableCell,mapScenery:{},currentGrid:save.grid,terrainMap:createTerrainMap(save.grid),constructions:save.constructions,
    flippedGrid:save.flippedGrid,livestockState:save.livestockState,buildingLevels:save.buildingLevels,
    upgradesInProgress:save.upgradesInProgress,farmlandState:save.farmlandState,fruitTreesState:save.fruitTreesState,
    landUnlockedChunks:Array.from({length:64},(_,i)=>i),gameMode:'sandbox',tileMap:tiles,fences:[],ROWS:32,COLS:32,
    kingdomWondersManager:null,getLivestockAnchor,isLivestockTile,canPlaceLivestock,clearLivestockParts,reserveLivestockCells,
    checkHousingRemoval,isCellUnlocked,isProtectedTile,isIndestructibleTile,getTerrainSprite,getClearedSurface,isRotationVisible,
    getRotatedTileIdAndFlip,calculateDemolishRefund,FRUIT_TREES_CONFIG,getFruitTreeVisual,resolveFruitTreeState,playerGold:0,playerResources:{},RESOURCE_MAX_CAPACITY:1000,
    productionManager:{clearCell:key=>cleared.push(key),markBuilt:noop},PRODUCTION_BUILDINGS:{},FRUIT_TREES_CONFIG,
    showToast:noop,playRotateSound:noop,saveFlippedGrid:noop,persistGameState:noop,requestRender:noop,
    rotateFenceAt:noop,removeFenceAt:noop,saveConstructionsState:noop,saveGameEconomyState:noop,saveProductionState:noop,
    updateGoldDisplay:noop,updateResourcesUI:noop,updateVillageStatsUI:noop,checkQuestsProgress:noop};
  vm.createContext(context);
  for(const [start,end] of [['function rotateCellAt(', 'const hudRotateBtn ='],['function eraseCell(', '// Process active constructions tick'],
    ['function updateConstructions(', 'function updateStorageHUD(']]) {
    vm.runInContext(source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start))),context);
  }
  return {save,context,cleared};
}

test('the real studio rotation and demolition route either half to one pen and never leave occupied parts',()=>{
  const {save,context,cleared}=studioScene(),id='b57_sheep_pasture';save.grid[20][20]=id;
  reserveLivestockCells(save.grid,20,20);save.livestockState['20_20']={animalCount:3,state:'ready'};
  save.buildingLevels['20_20']=2;
  save.grid[19][20]='b01_cottage_red';context.rotateCellAt(20,19);
  assert.equal(save.flippedGrid['20_20'],undefined,'Blocked rotation does not change the sprite or occupancy');
  assert.ok(isLivestockPart(save.grid[20][19]));
  save.grid[19][20]='d12_meadow_wildflowers';context.rotateCellAt(20,19);
  assert.equal(save.flippedGrid['20_20'],true);assert.ok(isLivestockPart(save.grid[19][20]));
  assert.equal(save.grid[20][19],'d12_meadow_wildflowers');
  assert.equal(context.eraseCell(19,20),true);assert.deepEqual(cleared,['20_20']);
  assert.equal(save.grid[20][20],'d12_meadow_wildflowers');assert.equal(save.grid[19][20],'d12_meadow_wildflowers');
  assert.equal(save.livestockState['20_20'],undefined);assert.equal(save.buildingLevels['20_20'],undefined);
});

test('studio demolition blocks an occupied home before changing money or upgrade state, and removes farms to release workers', () => {
  const { save, context } = studioScene();
  save.grid[20][20] = 'b01_cottage_red'; save.grid[21][20] = 'd13_farmland_plot';
  save.upgradesInProgress['20_20'] = { targetLevel: 2, costGold: 60 };
  const before = JSON.stringify(save);
  assert.equal(context.eraseCell(20,20), false);
  assert.equal(JSON.stringify(save), before); assert.equal(context.playerGold, 0);
  assert.equal(context.eraseCell(21,20), true);
  assert.equal(getWorkforce(save.grid, save.constructions, tiles, save.buildingLevels).farmers, 0);
  assert.equal(context.eraseCell(20,20), true);
});

test('real continuous farmland brush enforces the same four-worker limit as individual purchases', () => {
  const { save, context } = studioScene();
  save.grid[20][19] = 'b01_cottage_red';
  Object.assign(context, { activeBrush: 'd13_farmland_plot', brushFlipped: false, playerGold: 500,
    gameMode: 'game', checkFarmWorkforce, canPlaceOnSurface, isPlacementProtected,
    isFenceTile: () => false, getTileCost, playBuildSound: noop,
    tutorialManager: { onAction: noop }, triggerAutoSave: noop });
  const source = fs.readFileSync(new URL('../src/studioEngine.js', import.meta.url), 'utf8');
  const start = source.indexOf('    function tryPlaceContinuousBrush(');
  const end = source.indexOf('    // Helper: Thu hoạch công trình sản xuất', start);
  vm.runInContext(source.slice(start,end), context);
  for (let c = 20; c < 24; c++) assert.equal(context.tryPlaceContinuousBrush(20,c), true);
  assert.equal(context.playerGold, 440);
  assert.equal(context.tryPlaceContinuousBrush(20,24), false);
  assert.equal(context.playerGold, 440);
  assert.equal(context.eraseCell(20,20), true);
  assert.equal(context.tryPlaceContinuousBrush(20,24), true);
});

test('real construction completion and cancellation preserve or release both cells together',()=>{
  for(const finish of [false,true]) {
    const {save,context}=studioScene();save.constructions['20_20']={row:20,col:20,targetTileId:'b21_chicken_coop',flipped:true,startTime:1,durationMs:1};
    reserveLivestockCells(save.grid,20,20,true);
    if(finish) {
      context.updateConstructions();assert.equal(save.grid[20][20],'b21_chicken_coop');
      assert.ok(isLivestockPart(save.grid[19][20]));assert.equal(save.flippedGrid['20_20'],true);
    } else {
      context.eraseCell(19,20);assert.equal(save.grid[19][20],'d12_meadow_wildflowers');assert.equal(save.grid[20][20],'d12_meadow_wildflowers');
    }
    assert.deepEqual(save.constructions,{});
  }
});

test('importing an old progress JSON expands both built pens and construction footprints',async()=>{
  const save=getDefaultSaveState();save.grid[20][20]='b22_cow_pasture';save.livestockState['20_20']={animalCount:3,state:'hungry'};
  save.constructions['21_20']={row:21,col:20,targetTileId:'b21_chicken_coop',flipped:false,startTime:1,durationMs:60000};
  globalThis.FileReader=class{readAsText(file){this.onload({target:{result:file.text}})}};
  const imported=await importGameFromJSON({text:JSON.stringify(save)});
  assert.deepEqual(imported.livestockState,save.livestockState);
  assert.deepEqual(getLivestockAnchor(imported.grid,20,19,imported.constructions),{row:20,col:20});
  assert.deepEqual(getLivestockAnchor(imported.grid,21,19,imported.constructions),{row:21,col:20});
});
