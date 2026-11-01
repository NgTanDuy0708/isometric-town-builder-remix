import {upgradeSavedTownMap} from '../src/engine/townMapUpgrade.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createBundledStarterMap,getStarterMapDocument,saveLocalStarterMap,STARTER_MAP_REVISION_KEY,BUNDLED_STARTER_MAP_REVISION} from '../src/engine/starterMapSource.js';
import {createMapDocument,isValidMapDocument,STARTER_MAP_KEY,MAP_APPLY_KEY,writeMapDocument,readMapDocument,applyMapDocumentToSave,restartMapGrowth} from '../src/engine/mapEditing.js';
import {getDefaultSaveState,loadGameSave,saveGameSave} from '../src/engine/storage.js';
import {createStarterTownMap32,migrateLegacyWarehouseLayout,applyTownCenterLayout} from '../src/data/starterMap.js';
import {expandGrid16to32} from '../src/engine/isoMath.js';
import {normalizeMapLocks,setActiveMapLocks,setCustomMapLayout} from '../src/data/mapLocks.js';
import {setHarborSites} from '../src/data/harborLayout.js';
function store(){const entries=new Map();return {getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,String(v)),removeItem:k=>entries.delete(k)};}
const supplied=()=>JSON.parse(fs.readFileSync(new URL('../src/data/village-initial-map-32x32.json',import.meta.url),'utf8'));

test('the supplied map is a valid bundled layout with its exact road, scenery, land and removal rules',()=>{
  const doc=createBundledStarterMap();assert.equal(isValidMapDocument(doc),true);assert.deepEqual(doc,supplied());
  assert.equal(doc.mapScenery['31_14'].tileId,'scene:gate');assert.equal(Object.keys(doc.mapScenery).length,149);assert.equal(doc.fences.length,17);
  const copy=createBundledStarterMap();copy.grid[20][20]='b01_cottage_red';copy.mapScenery['31_14'].locked=false;
  assert.deepEqual(createBundledStarterMap(),supplied(),'editing a draft does not mutate the shipped layout');
});
test('fresh origins and obsolete browser-only defaults resolve to the same shipped map without deleting drafts',()=>{
  const localhost=store(),ip=store(),old=createMapDocument(getDefaultSaveState());old.grid[20][20]='b01_cottage_red';
  writeMapDocument(ip,STARTER_MAP_KEY,old);ip.setItem(STARTER_MAP_REVISION_KEY,'old-release');
  assert.deepEqual(getStarterMapDocument(localhost),supplied());assert.deepEqual(getStarterMapDocument(ip),supplied());
  assert.deepEqual(readMapDocument(ip,STARTER_MAP_KEY),old,'old local work remains recoverable');
  const blocked={getItem(){throw Error('blocked storage');}};assert.deepEqual(getStarterMapDocument(blocked),supplied());
});
test('a newly saved local override is deliberate, validated and limited to its own origin',()=>{
  const localhost=store(),ip=store(),local=createBundledStarterMap();local.grid[20][20]='b01_cottage_red';
  saveLocalStarterMap(localhost,local);assert.equal(localhost.getItem(STARTER_MAP_REVISION_KEY),BUNDLED_STARTER_MAP_REVISION);
  assert.deepEqual(getStarterMapDocument(localhost),local);assert.deepEqual(getStarterMapDocument(ip),supplied());
  localhost.setItem(STARTER_MAP_KEY,'broken');assert.deepEqual(getStarterMapDocument(localhost),supplied());
});
function bootstrap(storage){
  globalThis.localStorage=storage;
  const source=fs.readFileSync(new URL('../src/studioEngine.js',import.meta.url),'utf8');
  const start=source.indexOf('    const starterMapGrid ='),end=source.indexOf('    // Đồng bộ bờ',start);
  const context={upgradeSavedTownMap,localStorage:storage,getStarterMapDocument,readMapDocument,MAP_APPLY_KEY,applyMapDocumentToSave,restartMapGrowth,
    createStarterTownMap32,loadGameSave,getDefaultSaveState,expandGrid16to32,migrateLegacyWarehouseLayout,applyTownCenterLayout,
    normalizeMapLocks,setActiveMapLocks,setCustomMapLayout,setHarborSites};
  vm.createContext(context);vm.runInContext(source.slice(start,end)+'\nresult={save:initialSave,grid:currentGrid,pending:pendingMapDocument,starter:starterDocument};',context);
  setActiveMapLocks({});setCustomMapLayout(false);setHarborSites();return context.result;
}
test('actual game bootstrap loads the bundled map on two origins and upgrades an older player layout',()=>{
  for(const storage of [store(),store()]){
    const result=bootstrap(storage);assert.deepEqual(structuredClone(result.grid),supplied().grid);assert.deepEqual(result.save.mapScenery,supplied().mapScenery);
    assert.equal(result.save.customMapLayout,true);assert.equal(result.save.economy.playerGold,500);assert.equal(result.save.playerLevel,1);
  }
  const storage=store();globalThis.localStorage=storage;const played=getDefaultSaveState();played.grid[20][20]='b01_cottage_red';played.economy.playerGold=1234;
  assert.equal(saveGameSave(played),true);const result=bootstrap(storage);assert.equal(result.grid[20][20],supplied().grid[20][20]);assert.equal(result.save.economy.playerGold,1234);assert.equal(result.save.townMapRevision,BUNDLED_STARTER_MAP_REVISION);
});
test('pending Apply beats the default in the actual bootstrap even on first launch',()=>{
  const storage=store(),pending=createBundledStarterMap();pending.grid[20][20]='b01_cottage_red';writeMapDocument(storage,MAP_APPLY_KEY,pending);
  const result=bootstrap(storage);assert.equal(result.grid[20][20],'b01_cottage_red');assert.equal(result.pending.grid[20][20],'b01_cottage_red');assert.equal(storage.getItem(MAP_APPLY_KEY),null);
});
