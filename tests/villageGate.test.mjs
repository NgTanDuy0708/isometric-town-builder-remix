import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeVillageSave} from '../src/engine/villageLayoutMigration.js';
import {DEV_FULL_VILLAGE_SAVE} from '../src/data/devSaveData.js';
import {TILES_DATA} from '../src/data/tilesData.js';
import {createStarterTownMap32,isProtectedTile} from '../src/data/starterMap.js';
import {VILLAGE_GATE_ID,VILLAGE_GATE_PART,VILLAGE_GATE_URI,VILLAGE_GATE_GEOMETRY,VILLAGE_GATE_PASSAGE,getVillageGateOutline} from '../src/data/villageGate.js';
import {getShopCategory} from '../src/data/shopCatalog.js';
import {getBuildingRenderAdjustment,getBuildingSpriteUri} from '../src/data/buildingSprites.js';
import {getExpansionRenderAdjustment} from '../src/data/expansionCatalog.js';
import {canPlaceOnSurface,isPlacementProtected} from '../src/engine/placementSurface.js';
import {getDefaultSaveState,saveGameSave,loadGameSave,importGameFromJSON} from '../src/engine/storage.js';

function assertGate(grid) {
  assert.equal(grid.flat().filter(id=>id===VILLAGE_GATE_ID).length,1);
  assert.deepEqual(grid[31].slice(14,17),[VILLAGE_GATE_ID,'r03_royal_marble_pavement',VILLAGE_GATE_PART]);
  assert.equal(grid.flat().filter(id=>id===VILLAGE_GATE_PART).length,1);
}

test('new maps and cleaned dev maps contain one fixed 3x1 gateway and keep the forest',()=>{
  assertGate(createStarterTownMap32());
  const original=JSON.stringify(DEV_FULL_VILLAGE_SAVE),clean=normalizeVillageSave(DEV_FULL_VILLAGE_SAVE);
  assertGate(clean.grid);
  assert.equal(JSON.stringify(DEV_FULL_VILLAGE_SAVE),original,'Import must not mutate the bundled fixture');
  for(const old of ['r31_road_var1_tollgate_guardhouse','s12_meadow_stepping_stones_v3','r25_plaza_var1_marble_fountain']) {
    assert.ok(!clean.grid.flat().includes(old),old);
  }
  for(let r=0;r<32;r++)for(let c=0;c<32;c++) {
    if(DEV_FULL_VILLAGE_SAVE.grid[r][c]==='s23_forest_var3_pine_cedar')assert.equal(clean.grid[r][c],'d05_pine_grove');
  }
  assert.deepEqual(normalizeVillageSave(clean),clean,'Repeated imports cannot spawn more gates');
  assert.deepEqual(clean.resources,DEV_FULL_VILLAGE_SAVE.resources);
  assert.deepEqual(clean.economy,DEV_FULL_VILLAGE_SAVE.economy);
});

test('retired props lose stale cell state, while live construction and custom terrain survive',()=>{
  const save=getDefaultSaveState();
  save.terrainMap=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  save.terrainMap[20][20]='s13_sand_ground';save.grid[20][20]='r31_road_var1_tollgate_guardhouse';
  save.flippedGrid['20_20']=true;save.productionState['20_20']={ready:true};save.buildingLevels['20_20']=3;
  save.grid[21][21]='b01_cottage_red';save.buildingLevels['21_21']=2;
  save.constructions['22_22']={row:22,col:22,targetTileId:'b08_watchtower'};
  const clean=normalizeVillageSave(save);
  assert.equal(clean.grid[20][20],'s13_sand_ground');
  assert.equal(clean.flippedGrid['20_20'],undefined);assert.equal(clean.productionState['20_20'],undefined);
  assert.equal(clean.buildingLevels['20_20'],undefined);assert.equal(clean.buildingLevels['21_21'],2);
  assert.deepEqual(clean.constructions,save.constructions);
});

test('gate cannot be purchased, placed elsewhere, moved, erased or overwritten; middle stays a road',()=>{
  assert.equal(getShopCategory(TILES_DATA.find(tile=>tile.id===VILLAGE_GATE_ID)),'hidden');
  assert.equal(canPlaceOnSurface(VILLAGE_GATE_ID,'d12_meadow_wildflowers'),false);
  for(let c=14;c<=16;c++) {
    assert.ok(isProtectedTile(31,c,createStarterTownMap32()[31][c]));
    assert.ok(isPlacementProtected('b01_cottage_red',31,c,createStarterTownMap32()[31][c]));
  }
  assert.equal(isProtectedTile(30,14,'d12_meadow_wildflowers'),false);
  assert.deepEqual(getVillageGateOutline(0,0,64,32),[[-1024,1504],[-832,1600],[-896,1632],[-1088,1536]]);
});

test('native gate passage aligns with the middle road cell without stretching the towers',()=>{
  const bytes=readFileSync(new URL('../public'+VILLAGE_GATE_URI,import.meta.url));
  const source=VILLAGE_GATE_GEOMETRY[1],rect=getBuildingRenderAdjustment(VILLAGE_GATE_ID);
  assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[source.width,source.height]);
  assert.equal(bytes[25],6,'True RGBA PNG');
  assert.equal(getBuildingSpriteUri(VILLAGE_GATE_ID),VILLAGE_GATE_URI);
  assert.deepEqual(getExpansionRenderAdjustment(VILLAGE_GATE_ID),rect);
  assert.ok(Math.abs(rect.dw/source.width-rect.dh/source.height)<1e-12,'Uniform scale');
  // Measured opening on the PNG must meet the road, independently of the
  // configured anchor. Anchoring the old right-tower toe displaced it 22px.
  assert.ok(Math.abs(rect.dx+790*rect.dw/source.width-128)<1e-8);
  assert.ok(Math.abs(rect.dy+800*rect.dh/source.height-128)<1e-8);
  assert.deepEqual(VILLAGE_GATE_PASSAGE,{sourceX:790,sourceY:800,worldX:128,worldY:128});
  for(const [point,cell] of [[[470,685],[64,96]],[[1100,950],[192,160]]]){
    assert.ok(Math.abs(rect.dx+point[0]*rect.dw/source.width-cell[0])<10,'Tower sits on its own end cell');
    assert.ok(Math.abs(rect.dy+point[1]*rect.dh/source.height-cell[1])<10,'Tower ground contact stays inside its tile');
  }
});

test('old local saves and imported JSON receive the same clean layout without resetting progress',async()=>{
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
  const save=getDefaultSaveState();save.grid[20][20]='r31_road_var1_tollgate_guardhouse';
  save.grid[22][20]=VILLAGE_GATE_ID;save.economy.playerGold=12345;save.resources.wood=89;
  saveGameSave(save);const loaded=loadGameSave();assertGate(loaded.grid);
  assert.equal(loaded.grid[20][20],'d12_meadow_wildflowers');assert.equal(loaded.economy.playerGold,12345);
  assert.equal(loaded.resources.wood,89);
  globalThis.FileReader=class{readAsText(file){this.onload({target:{result:file.text}})}};
  const imported=await importGameFromJSON({text:JSON.stringify(save)});assertGate(imported.grid);
  assert.equal(imported.grid[22][20],'d12_meadow_wildflowers');assert.equal(imported.economy.playerGold,12345);
});
