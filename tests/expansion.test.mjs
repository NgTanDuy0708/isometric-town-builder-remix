import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TILES_DATA } from '../src/data/tilesData.js';
import { EXPANSION_TILES, EXPANSION_TILE_URIS, EXPANSION_BUILDING_LEVELS, EXPANSION_BUILDING_GEOMETRY, EXPANSION_RENDER_GEOMETRY } from '../src/data/expansionCatalog.js';
import { getShopCategory } from '../src/data/shopCatalog.js';
import { getBuildingSpriteUri, getBuildingRenderAdjustment } from '../src/data/buildingSprites.js';
import { getNextUpgrade } from '../src/data/upgradesConfig.js';
import { getTileCost } from '../src/data/gameEconomy.js';
import { isFlatGroundTile } from '../src/engine/renderOrder.js';
import { canPlaceOnSurface, getClearedSurface, isPlacementProtected } from '../src/engine/placementSurface.js';
import { isProtectedTile } from '../src/data/starterMap.js';
import { createTerrainMap } from '../src/engine/terrainEditing.js';
import { getRotatedTileIdAndFlip } from '../src/engine/upgradeManager.js';
import { initInputHandler } from '../src/engine/inputHandler.js';
import { getExpansionRoadConnections, isExpansionGround } from '../src/engine/expansionRenderer.js';

test('all expansion subjects have exactly one purchasable item in the intended shop tab', () => {
  assert.equal(EXPANSION_TILES.length, 41);
  assert.equal(Object.keys(EXPANSION_TILE_URIS).length, 44);
  assert.equal(new Set(TILES_DATA.map(t=>t.id)).size, TILES_DATA.length);
  for (const [id, uri] of Object.entries(EXPANSION_TILE_URIS)) {
    const t = TILES_DATA.find(t=>t.id===id);
    assert.ok(t, id);
    assert.ok(['residential','production','farming','roads','decor','wonders'].includes(getShopCategory(t)), id);
    assert.ok(getTileCost(id,t.category)>0, id);
    assert.equal(readFileSync(new URL('../public'+uri,import.meta.url)).toString('ascii',1,4), 'PNG');
  }
  for (const id of ['b58_textile_mill','b59_dairy_factory']) assert.equal(getShopCategory(TILES_DATA.find(t=>t.id===id)), 'production');
  for (const id of ['d35_cacao_tree','d36_cherry_tree','d37_blueberry_bush','d38_durian_tree','d39_orange_tree']) assert.equal(getShopCategory(TILES_DATA.find(t=>t.id===id)), 'farming');
});

test('all nine building families upgrade through three levels and share their measured contact point', () => {
  for (const id of Object.keys(EXPANSION_BUILDING_LEVELS)) for (let level=1;level<=3;level++) {
    assert.ok(getBuildingSpriteUri(id,level));
    if (level<3) assert.equal(getNextUpgrade(id,level).nextLevel,level+1);
    else assert.equal(getNextUpgrade(id,level),null);
    const g=EXPANSION_BUILDING_GEOMETRY[id][level], a=getBuildingRenderAdjustment(id,level);
    assert.ok(Math.abs(a.dx+g.anchorX*a.dw/g.width-g.worldAnchorX)<1e-6, id);
    assert.ok(Math.abs(a.dy+g.anchorY*a.dh/g.height-g.worldAnchorY)<1e-6, id);
  }
  assert.equal(getBuildingSpriteUri('b21_japanese_pagoda_sw',3),getBuildingSpriteUri('b21_japanese_pagoda_sw',2),'Do not display the clipped temple image');
});

test('flat modules paint below objects; bridges, trees and landmarks remain in world depth order',()=>{
  for(const id of ['r01_road_straight_ns','r03_road_cross','r04_road_tee_nes','r08_road_corner_ne','d11_canal_straight','d34_expansion_meadow','c17_stream_straight']) assert.equal(isFlatGroundTile(id),true,id);
  for(const id of ['r12_road_bridge_stone','d04_oak_tree_park','l30_glacier_mountain','a01_whale']) assert.equal(isFlatGroundTile(id),false,id);
  for(const id of ['d11_canal_straight','c17_stream_straight']) assert.equal(TILES_DATA.find(t=>t.id===id).category,'terrain','Water channels must not become walkable roads');
  assert.ok(Object.keys(EXPANSION_RENDER_GEOMETRY).length>15);
});

test('rotation never changes an expansion purchase into a missing catalog entry',()=>{
  const ids=new Set(TILES_DATA.map(t=>t.id));
  for(const id of Object.keys(EXPANSION_TILE_URIS)) for(const flipped of [true,false]) assert.ok(ids.has(getRotatedTileIdAndFlip(id,flipped).nextId),id);
});

test('T-junctions and L-corners rotate through four unique consistent connector orientations without extra shop items',()=>{
  for(const [start,count] of [['r04_road_tee_nes',3],['r08_road_corner_ne',2]]) {
    let id=start;
    const exits=[];
    for(let turn=0;turn<4;turn++) {
      assert.ok(isExpansionGround(id));
      const connections=getExpansionRoadConnections(id);
      assert.equal(connections.length,count);
      assert.equal(new Set(connections).size,count);
      exits.push(connections.slice().sort().join(''));
      if(turn>0) assert.equal(getShopCategory(TILES_DATA.find(t=>t.id===id)),'hidden');
      id=getRotatedTileIdAndFlip(id,false).nextId;
    }
    assert.equal(id,start);assert.equal(new Set(exits).size,4);
  }
});

function placement(id, ground='d12_meadow_wildflowers', gold=1000, cell={row:20,col:20}) {
  globalThis.window={addEventListener(){}};
  globalThis.document={getElementById:()=>null};
  if(!globalThis.navigator) globalThis.navigator={};
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  grid[cell.row][cell.col]=ground;
  const constructions={},noop=()=>{};
  const ctx={getActiveBrush:()=>id,getMovingBuilding:()=>null,getHoverCell:()=>cell,getConstructions:()=>constructions,getCurrentGrid:()=>grid,getFlippedGrid:()=>({}),getTileMap:()=>Object.fromEntries(TILES_DATA.map(t=>[t.id,t])),getGameMode:()=> 'game',getProductionState:()=>({}),getLandUnlockedChunks:()=>Array.from({length:64},(_,i)=>i),getPlayerGold:()=>gold,deductGold:n=>{gold-=n},getBrushFlipped:()=>false,updateGoldDisplay:noop,saveGameEconomyState:noop,pushUndo:noop,saveFlippedGrid:noop,saveConstructionsState:noop,updateVillageStatsUI:noop,checkQuestsProgress:noop,requestRender:noop,showToast:noop,triggerAutoSave:noop};
  return {input:initInputHandler({addEventListener(){}},ctx),grid,constructions,gold:()=>gold};
}

test('buying expansion roads and decorations charges once and rejects occupied tiles',()=>{
  for(const [id,ground] of [['r03_road_cross','d12_meadow_wildflowers'],['d02_village_well','d12_meadow_wildflowers'],['a01_whale','m30_sea_var2_coral_reef'],['a02_flamingo_flock','s13_sand_ground']]) {
    const s=placement(id,ground),t=TILES_DATA.find(t=>t.id===id);
    assert.equal(s.input.confirmPlacement(),true,id);
    assert.equal(s.gold(),1000-getTileCost(id,t.category));
    assert.ok(s.grid[20][20]===id||s.constructions['20_20']?.targetTileId===id);
    assert.equal(s.input.confirmPlacement(),false);
    assert.equal(s.gold(),1000-getTileCost(id,t.category));
    s.input.destroy();
  }
  const poor=placement('r03_road_cross','d12_meadow_wildflowers',1);
  assert.equal(poor.input.confirmPlacement(),false);
  assert.equal(poor.gold(),1); poor.input.destroy();
});

test('aquatic decorations require a compatible empty surface and restore water after moving',()=>{
  assert.equal(canPlaceOnSurface('a01_whale','d12_meadow_wildflowers'),false);
  assert.equal(canPlaceOnSurface('a01_whale','m30_sea_var2_coral_reef'),true);
  assert.equal(canPlaceOnSurface('a02_flamingo_flock','s13_sand_ground'),true);
  assert.equal(canPlaceOnSurface('a01_whale','b01_cottage_red'),false);
  const s=placement('a01_whale');
  assert.equal(s.input.confirmPlacement(),false);assert.equal(s.gold(),1000);s.input.destroy();
  const terrain=Array.from({length:32},()=>Array(32).fill('m30_sea_var2_coral_reef'));
  assert.equal(getClearedSurface('a01_whale',20,20,terrain),'m30_sea_var2_coral_reef');
});

test('coastal animals remain placeable and removable without allowing the hall, delivery road or harbor to be overwritten',()=>{
  for(const id of ['a01_whale','a02_flamingo_flock','r12_road_bridge_stone']) {
    assert.equal(isPlacementProtected(id,20,2,'m30_sea_var2_coral_reef'),false);
    assert.equal(isProtectedTile(20,2,id),false,'Player water objects remain removable');
    assert.equal(isPlacementProtected(id,13,15,'b14_town_hall'),true);
    assert.equal(isPlacementProtected(id,20,15,'r03_royal_marble_pavement'),true);
    assert.equal(isPlacementProtected(id,13,5,'s13_sand_ground'),true);
    assert.equal(isPlacementProtected(id,14,3,'m30_sea_var2_coral_reef'),true,'Keep the actual dock clear');
    assert.equal(isPlacementProtected(id,15,3,'m30_sea_var2_coral_reef'),true,'Keep the ship berth clear');
    const s=placement(id,'m30_sea_var2_coral_reef',1000,{row:20,col:2});
    assert.equal(s.input.confirmPlacement(),true,id);
    assert.ok(s.grid[20][2]===id||s.constructions['20_2']?.targetTileId===id);
    s.input.destroy();
  }
  const blocked=placement('r12_road_bridge_stone','r03_royal_marble_pavement',1000,{row:20,col:15});
  assert.equal(blocked.input.confirmPlacement(),false);assert.equal(blocked.gold(),1000);blocked.input.destroy();
});

test('capture an imported inland sea before placing animals so clearing restores the original surface',()=>{
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  grid[20][20]='m30_sea_var2_coral_reef';
  const terrain=createTerrainMap(grid);
  grid[20][20]='a01_whale';
  assert.equal(getClearedSurface(grid[20][20],20,20,terrain),'m30_sea_var2_coral_reef');
});
