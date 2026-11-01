import {upgradeSavedTownMap} from '../src/engine/townMapUpgrade.js';
import {BUNDLED_STARTER_MAP_REVISION} from '../src/engine/starterMapSource.js';
import {getStarterMapDocument,saveLocalStarterMap} from '../src/engine/starterMapSource.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {getDefaultSaveState,saveGameSave,loadGameSave,STORAGE_KEY_V3} from '../src/engine/storage.js';
import {TILES_DATA} from '../src/data/tilesData.js';
import {AESTHETIC_TILE_URIS} from '../src/data/aestheticTileIcons.js';
import {TILE_DATA_URIS} from '../src/data/sprites.js';
import {isProtectedTile} from '../src/data/starterMap.js';
import {setActiveMapLocks,setCustomMapLayout,isMapLockedCell,isMapRemovableCell} from '../src/data/mapLocks.js';
import {setHarborSites,isHarborCell,isShipCell,getHarborLayout} from '../src/data/harborLayout.js';
import {MAP_ITEMS,MAP_ITEM_BY_ID,createMapDocument,isValidMapDocument,stampMapItem,eraseMapItem,
  getMapSelection,setMapRemovalRule,paintMapTerrain,applyMapDocumentToSave,readMapDocument,writeMapDocument,STARTER_MAP_KEY} from '../src/engine/mapEditing.js';
import {rotateMapItem} from '../src/engine/mapEditing.js';
import {TERRAIN_IDS} from '../src/engine/terrainEditing.js';
import {STARTER_MAP_KEY as START_KEY,MAP_APPLY_KEY,readMapDocument as readDoc,restartMapGrowth} from '../src/engine/mapEditing.js';
import {createStarterTownMap32,applyTownCenterLayout,migrateLegacyWarehouseLayout} from '../src/data/starterMap.js';
import {expandGrid16to32} from '../src/engine/isoMath.js';
import {normalizeMapLocks} from '../src/data/mapLocks.js';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const fresh=()=>createMapDocument(getDefaultSaveState());

test('editor catalog covers every file-backed tile, crops, all wonders, gate, pier and ship',()=>{
  for(const tile of TILES_DATA)if(AESTHETIC_TILE_URIS[tile.id]||TILE_DATA_URIS[tile.id])assert.ok(MAP_ITEM_BY_ID[tile.id],tile.id);
  for(const id of ['scene:gate','scene:pier','scene:ship','d07_streetlamps_signpost','crop:cabbage','crop:watermelon','wonder:royal_palace','wonder:ocean_library','wonder:poseidon_statue'])assert.ok(MAP_ITEM_BY_ID[id],id);
  assert.equal(new Set(MAP_ITEMS.map(i=>i.id)).size,MAP_ITEMS.length);
  for(const item of MAP_ITEMS)assert.ok(fs.existsSync(new URL('../public'+item.uri,import.meta.url)),item.id+' thumbnail exists');
});

test('building levels, pens, crops, fruit and edge fences can be authored without charging game resources',()=>{
  let doc=fresh();const original=structuredClone(doc);
  doc=stampMapItem(doc,20,20,'b66_iron_mine',{level:3,flipped:true,locked:true}).doc;
  assert.equal(doc.buildingLevels['20_20'],3);assert.equal(doc.flippedGrid['20_20'],true);assert.equal(doc.mapLocks['20_20'],true);
  doc=stampMapItem(doc,20,22,'b22_cow_pasture',{animals:3,locked:true}).doc;
  assert.match(doc.grid[20][21],/^livestock_part:/);assert.equal(doc.mapLocks['20_21'],true);
  doc=eraseMapItem(doc,20,21);assert.equal(doc.grid[20][22],doc.terrainMap[20][22]);assert.equal(doc.mapLocks['20_22'],undefined);
  doc=stampMapItem(doc,21,20,'crop:cabbage').doc;assert.equal(doc.farmlandState['21_20'].seedId,'cabbage');
  doc=stampMapItem(doc,22,20,'d21_apple_tree').doc;assert.ok(doc.fruitTreesState['22_20']);
  doc=stampMapItem(doc,21,20,'d33_wooden_fence_straight',{locked:true}).doc;
  assert.equal(doc.grid[21][20],'d13_farmland_plot');assert.equal(doc.fences[0].locked,true);
  assert.equal(isValidMapDocument(doc),true);assert.deepEqual(fresh(),original);
});

test('scene objects move freely outside the map, replace old fixed scenery, and erase independently of terrain',()=>{
  let doc=fresh();assert.equal(doc.mapScenery['31_14'].tileId,'scene:gate');
  doc=stampMapItem(doc,35,15,'scene:gate',{locked:false}).doc;
  assert.equal(doc.mapScenery['31_14'],null);assert.equal(doc.mapScenery['35_15'].locked,false);
  doc=stampMapItem(doc,-4,2,'scene:ship').doc;assert.equal(doc.mapScenery['15_3'],null);
  doc=stampMapItem(doc,34,12,'d07_streetlamps_signpost',{locked:true}).doc;
  assert.equal(getMapSelection(doc,34,12).locked,true);
  doc=setMapRemovalRule(doc,34,12,false);assert.equal(getMapSelection(doc,34,12).locked,false);
  doc=eraseMapItem(doc,34,12);assert.equal(doc.mapScenery['34_12'],null);
  doc=eraseMapItem(doc,33,13);assert.equal(doc.mapScenery['33_13'],null,'Erase generated outside scenery');
  assert.equal(isValidMapDocument(doc),true);
  assert.equal(stampMapItem(doc,56,12,'scene:gate').changed,false);
});

test('all fence shapes can use the three protected rear hall cells without changing the hall or its protection',()=>{
  for(const id of ['d33_wooden_fence_straight','d34_wooden_fence_corner_upper','d35_wooden_fence_corner_lower'])for(const flipped of [false,true]){
    const original=fresh();let doc=original;
    for(const col of [14,15,16]){
      const result=stampMapItem(doc,12,col,id,{flipped,locked:true});
      assert.equal(result.changed,true,`${id} at [12,${col}], flipped=${flipped}`);
      doc=result.doc;
    }
    assert.equal(doc.fences.length,3);
    assert.deepEqual(doc.grid,original.grid,'Edge fences never overwrite the hall');
    assert.deepEqual(doc.mapLocks,original.mapLocks,'Fence rules stay separate from hall rules');
    assert.ok(isValidMapDocument(doc));
    writeMapDocument(localStorage,'rear-hall-fences',doc);
    assert.deepEqual(readMapDocument(localStorage,'rear-hall-fences').fences,doc.fences);
    assert.equal(stampMapItem(doc,12,16,'b01_cottage_red').changed,false,'Buildings still cannot replace the hall');
    assert.equal(stampMapItem(doc,12,16,'scene:pier').changed,false,'Scenery cannot replace the hall');
    assert.deepEqual(eraseMapItem(doc,12,16).grid,original.grid,'Erasing a fence keeps the hall');
  }
});

test('removal rules are per object; protected objects remain editable in the editor',()=>{
  let doc=fresh();doc=stampMapItem(doc,20,20,'b01_cottage_red',{locked:true}).doc;
  doc=stampMapItem(doc,20,21,'b01_cottage_red',{locked:false}).doc;
  setActiveMapLocks(doc.mapLocks);assert.equal(isProtectedTile(20,20,'b01_cottage_red'),true);assert.equal(isProtectedTile(20,21,'b01_cottage_red'),false);
  doc=setMapRemovalRule(doc,20,20,false);setActiveMapLocks(doc.mapLocks);assert.equal(isProtectedTile(20,20,'b01_cottage_red'),false);
  doc=eraseMapItem(doc,20,20);assert.equal(doc.grid[20][20],doc.terrainMap[20][20]);
  setActiveMapLocks({});setCustomMapLayout(false);
});

test('full documents survive draft, initial-map, save/load and JSON round trips without resurrecting the fixed gate',()=>{
  memory.clear();let doc=fresh();doc=stampMapItem(doc,20,20,'b66_iron_mine',{level:3,locked:true}).doc;
  doc=stampMapItem(doc,22,18,'wonder:ocean_library',{locked:false}).doc;
  doc=stampMapItem(doc,35,15,'scene:gate',{locked:true}).doc;
  doc=paintMapTerrain(doc,{row:9,col:10},{row:9,col:11},TERRAIN_IDS.sea,1,'rectangle');
  writeMapDocument(localStorage,STARTER_MAP_KEY,doc);assert.deepEqual(readMapDocument(localStorage,STARTER_MAP_KEY),doc);
  const base=getDefaultSaveState();base.resources.wood=19;base.economy.playerGold=1234;
  const save=applyMapDocumentToSave(base,doc);saveGameSave(save);const loaded=loadGameSave();
  assert.equal(loaded.resources.wood,19);assert.equal(loaded.economy.playerGold,1234);
  assert.equal(loaded.mapLocks['20_20'],true);assert.equal(loaded.buildingLevels['20_20'],3);
  assert.equal(loaded.mapScenery['35_15'].tileId,'scene:gate');assert.ok(!loaded.grid.flat().includes('b17_twin_gatehouse'));
  assert.equal(loaded.kingdomWonders.ocean_library,4);assert.equal(loaded.wonderSites.ocean_library.row,22);
  assert.equal(loaded.grid[9][10],TERRAIN_IDS.sea);assert.equal(loaded.customMapLayout,true);
  assert.ok(isValidMapDocument(JSON.parse(JSON.stringify(doc))));
  const invalid=structuredClone(doc);invalid.mapScenery['999_999']={tileId:'scene:gate',flipped:false};
  assert.equal(isValidMapDocument(invalid),false);assert.throws(()=>writeMapDocument(localStorage,'bad',invalid));
});

test('edited port and ship footprints and their trading coordinates follow the authored positions',()=>{
  setHarborSites({'9_4':{tileId:'scene:pier'},'10_3':{tileId:'scene:ship'}},true);
  assert.equal(isHarborCell(9,4),true);assert.equal(isShipCell(10,3),true);assert.equal(isHarborCell(14,4),false);
  assert.deepEqual(getHarborLayout(0,0,64,32).dockFoot,{x:(4-9)*64+64,y:(9+4)*32+128});
  setHarborSites();assert.equal(isHarborCell(14,4),true);
});

test('R rotation cycles road connectors and preserves locked state, level, livestock and exterior positions',()=>{
  let doc=fresh();doc=stampMapItem(doc,20,20,'r08_road_corner_ne',{locked:true}).doc;
  const seen=new Set();for(let i=0;i<4;i++){seen.add(doc.grid[20][20]);doc=rotateMapItem(doc,20,20).doc;}
  assert.equal(seen.size,4);assert.equal(doc.grid[20][20],'r08_road_corner_ne');assert.equal(doc.mapLocks['20_20'],true);
  doc=stampMapItem(doc,23,22,'b22_cow_pasture',{animals:3,level:2,locked:true}).doc;
  doc=rotateMapItem(doc,23,22).doc;
  assert.equal(doc.flippedGrid['23_22'],true);assert.equal(doc.livestockState['23_22'].animalCount,3);assert.match(doc.grid[22][22],/^livestock_part:/);
  doc=stampMapItem(doc,35,15,'scene:gate',{locked:false}).doc;
  doc=rotateMapItem(doc,35,15).doc;assert.equal(doc.mapScenery['35_15'].flipped,true);assert.equal(doc.mapScenery['35_15'].locked,false);
});

test('the actual game bootstrap consumes the saved initial map and pending apply while retaining authored scenery',()=>{
  const source=fs.readFileSync(new URL('../src/studioEngine.js',import.meta.url),'utf8');
  const start=source.indexOf('    const starterMapGrid ='),end=source.indexOf('    // Đồng bộ bờ',start);
  for(const mode of ['starter','pending','reload']){
    const pending=mode==='pending';
    memory.clear();let doc=fresh();doc=stampMapItem(doc,20,20,'b66_iron_mine',{level:3,locked:true}).doc;
    doc=stampMapItem(doc,35,15,'scene:gate',{locked:true}).doc;
    if(pending)writeMapDocument(localStorage,MAP_APPLY_KEY,doc);else saveLocalStarterMap(localStorage,doc);
    if(pending){const save=getDefaultSaveState();save.townMapRevision=BUNDLED_STARTER_MAP_REVISION;save.economy.playerGold=4321;save.resources.wood=9;saveGameSave(save);}
    if(mode==='reload'){
      const save=applyMapDocumentToSave(getDefaultSaveState(),doc);
      save.presetName='custom';save.townMapRevision=BUNDLED_STARTER_MAP_REVISION;saveGameSave(save);
    }
    const context={upgradeSavedTownMap,getStarterMapDocument,localStorage,readMapDocument:readDoc,STARTER_MAP_KEY:START_KEY,MAP_APPLY_KEY,applyMapDocumentToSave,restartMapGrowth,
      createStarterTownMap32,loadGameSave,getDefaultSaveState,expandGrid16to32,migrateLegacyWarehouseLayout,applyTownCenterLayout,
      normalizeMapLocks,setActiveMapLocks,setCustomMapLayout,setHarborSites};
    vm.createContext(context);vm.runInContext(source.slice(start,end)+'\nresult={grid:currentGrid,save:initialSave};',context);
    assert.equal(context.result.grid[20][20],'b66_iron_mine');assert.equal(context.result.save.mapLocks['20_20'],true);
    assert.equal(context.result.save.mapScenery['35_15'].tileId,'scene:gate');
    assert.ok(!context.result.grid.flat().includes('b17_twin_gatehouse'));
    if(pending){assert.equal(context.result.save.economy.playerGold,4321);assert.equal(context.result.save.resources.wood,9);assert.equal(localStorage.getItem(MAP_APPLY_KEY),null);}
    setActiveMapLocks({});setCustomMapLayout(false);setHarborSites();
  }
});
