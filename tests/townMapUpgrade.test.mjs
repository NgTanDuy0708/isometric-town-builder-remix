import test from 'node:test';
import assert from 'node:assert/strict';
import {upgradeSavedTownMap,PREVIOUS_TOWN_MAP_KEY} from '../src/engine/townMapUpgrade.js';
import {BUNDLED_STARTER_MAP_REVISION,createBundledStarterMap} from '../src/engine/starterMapSource.js';
import {getDefaultSaveState,saveGameSave,loadGameSave,exportGameToJSON,importGameFromJSON} from '../src/engine/storage.js';
import {createForestRegion} from '../src/data/worldConfig.js';
import {MAP_APPLY_KEY} from '../src/engine/mapEditing.js';
const store=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};};
function oldSave(){
  const save=getDefaultSaveState();save.grid[20][20]='b01_cottage_red';save.grid[20][21]='p01_royal_lion';
  save.playerLevel=12;save.playerXP=52000;save.economy={gameMode:'game',playerGold:4321,playerGems:50};save.resources={wood:41,bread:13};
  save.quests={harvestsCount:37,claimedQuests:{firstBuild:true}};save.tutorial.basic.status='complete';save.tutorial.rewarded=true;
  save.land.unlockedChunks=Array.from({length:64},(_,i)=>i);save.storage.warehouseCapacity=450;
  save.constructions={'20_22':{targetTileId:'b08_watchtower'}};save.productionState={'20_23':{queue:[{id:1}]}};
  save.extraction={jobs:[{homeRow:20,homeCol:20}]};save.defense={phase:'battle',trainingDone:true,wave:4,nextRaidId:9,soldiers:[{homeRow:20,homeCol:20}],enemies:[{id:1}]};
  return save;
}
test('old town is replaced once, clears stale coordinate jobs and keeps account, land and unlock progress',()=>{
  const old=oldSave(),original=structuredClone(old),next=upgradeSavedTownMap(old),map=createBundledStarterMap();
  for(const field of ['grid','terrainMap','mapScenery','fences','mapLocks','flippedGrid','farmlandState','buildingLevels'])assert.deepEqual(next[field],map[field],field);
  for(const field of ['economy','resources','playerLevel','playerXP','quests','tutorial','storage','land'])assert.deepEqual(next[field],old[field],field);
  assert.deepEqual(next.constructions,{});assert.deepEqual(next.productionState,{});assert.equal(next.extraction,null);
  assert.equal(next.defense.trainingDone,true);assert.equal(next.defense.enabled,false);assert.equal(next.defense.phase,'idle');assert.deepEqual(next.defense.soldiers,[]);
  assert.equal(next.premium.inventory.p01_royal_lion,1);assert.equal(next.townMapRevision,BUNDLED_STARTER_MAP_REVISION);assert.deepEqual(old,original);
  next.grid[20][20]='b01_cottage_red';assert.equal(upgradeSavedTownMap(next),next);assert.equal(next.grid[20][20],'b01_cottage_red');assert.equal(next.premium.inventory.p01_royal_lion,1);
});
test('a player inside the forest keeps that map and migrates only the stored town',()=>{
  const town=oldSave(),forest=createForestRegion(),save={...town,...forest,world:{version:1,active:'forest',unlocked:['town','forest'],regions:{town},completedMissions:['restore'],forestVictories:2}};
  const next=upgradeSavedTownMap(save);assert.deepEqual(next.grid,forest.grid);assert.deepEqual(next.defense,forest.defense);
  assert.equal(next.world.active,'forest');assert.deepEqual(next.world.regions.town.grid,createBundledStarterMap().grid);
  assert.deepEqual(next.world.completedMissions,['restore']);assert.equal(next.world.forestVictories,2);assert.deepEqual(next.economy,town.economy);
  assert.equal(next.premium.inventory.p01_royal_lion,1);assert.equal(upgradeSavedTownMap(next),next);
});
test('migration records a separate backup and discards a pending map from the old release',()=>{
  const storage=store(),old=oldSave();storage.setItem(MAP_APPLY_KEY,'old pending');upgradeSavedTownMap(old,storage);
  assert.deepEqual(JSON.parse(storage.getItem(PREVIOUS_TOWN_MAP_KEY)),old);assert.equal(storage.getItem(MAP_APPLY_KEY),null);
  const original=storage.getItem(PREVIOUS_TOWN_MAP_KEY);upgradeSavedTownMap(oldSave(),storage);assert.equal(storage.getItem(PREVIOUS_TOWN_MAP_KEY),original);
});
test('revision survives save/load and JSON round trips so later buildings and inventory are never reset',async()=>{
  globalThis.localStorage=store();const next=upgradeSavedTownMap(oldSave());next.grid[20][20]='b01_cottage_red';assert.ok(saveGameSave(next));
  const loaded=loadGameSave();assert.equal(loaded.townMapRevision,BUNDLED_STARTER_MAP_REVISION);assert.equal(upgradeSavedTownMap(loaded),loaded);assert.equal(loaded.grid[20][20],'b01_cottage_red');
  let blob;const before={URL:globalThis.URL,document:globalThis.document,setTimeout:globalThis.setTimeout,FileReader:globalThis.FileReader};
  try{
    globalThis.URL={createObjectURL:b=>(blob=b,'blob:test'),revokeObjectURL(){}};
    globalThis.document={createElement:()=>({click(){}}),body:{appendChild(){},removeChild(){}}};globalThis.setTimeout=fn=>{fn();return 0;};
    exportGameToJSON(loaded);const text=await blob.text();assert.equal(JSON.parse(text).townMapRevision,BUNDLED_STARTER_MAP_REVISION);
    globalThis.FileReader=class{readAsText(file){this.onload({target:{result:file.text}});}};
    const imported=await importGameFromJSON({text},loaded.grid);assert.equal(upgradeSavedTownMap(imported),imported);assert.equal(imported.grid[20][20],'b01_cottage_red');
  }finally{Object.assign(globalThis,before);}
});
