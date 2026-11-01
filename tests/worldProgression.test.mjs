import test from 'node:test';
import assert from 'node:assert/strict';
import {getDefaultSaveState,saveGameSave,loadGameSave,importGameFromJSON,exportGameToJSON} from '../src/engine/storage.js';
import {createWorldManager,createWorldState} from '../src/engine/worldManager.js';
import {createPremiumManager} from '../src/engine/premiumManager.js';
import {getWorkforce,checkFarmWorkforce,checkHousingRemoval} from '../src/engine/workforce.js';
import {TILES_DATA} from '../src/data/tilesData.js';
import {createForestRegion,FOREST_MISSIONS,paidLandCount} from '../src/data/worldConfig.js';
import {createExtractionManager} from '../src/engine/extractionManager.js';
import {getWarehouseUsed} from '../src/data/resourcesConfig.js';
import {PREMIUM_OFFERS} from '../src/data/premiumConfig.js';
import {readFileSync} from 'node:fs';

const tiles=Object.fromEntries(TILES_DATA.map(t=>[t.id,t]));
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
function scene(){
  let save=getDefaultSaveState(),world,placing=false;
  save.economy.playerGold=2000;save.economy.playerGems=40;save.playerLevel=12;
  save.resources={wood:80,stone:40,plank:30,buildingStone:30,ironIngot:15,bread:20};
  save.defense={trainingDone:true,phase:'idle',soldiers:[]};
  save.land.unlockedChunks.push(2,3,4,5,6,7,10,11);save.grid[20][20]='b01_cottage_red';
  const snapshot=()=>({...save,world:world?.getState()||createWorldState()});
  world=createWorldManager({getSave:snapshot,getTileMap:()=>tiles,getResources:()=>save.resources,getCapacity:()=>4000,
    spendGold:n=>{save.economy.playerGold-=n;},addGold:n=>{save.economy.playerGold+=n;},addGems:n=>{save.economy.playerGems+=n;},
    addXP:n=>{save.playerXP+=n;},applySave:s=>{save=structuredClone(s);},isPlacing:()=>placing,onChanged(){}});
  world.init(save.world);
  return {world,get save(){return save;},snapshot,placing:value=>{placing=value;}};
}

test('forest unlock checks progression and materials, charges once and retains the old village',()=>{
  const s=scene();s.save.playerLevel=9;const before=JSON.stringify(s.snapshot());
  assert.equal(s.world.unlock().ok,false);assert.equal(JSON.stringify(s.snapshot()),before);
  s.save.playerLevel=12;s.save.resources.plank=0;assert.equal(s.world.unlock().ok,false);
  s.save.resources.plank=30;assert.equal(paidLandCount(s.save.land.unlockedChunks),8);
  assert.equal(s.world.unlock().ok,true);assert.equal(s.save.economy.playerGold,1500);assert.equal(s.save.resources.plank,20);
  assert.equal(s.world.unlock().ok,false);assert.equal(s.save.economy.playerGold,1500);
  assert.equal(s.world.getState().regions.forest.grid[16][13],'b11_carpenter_sawmill');
});

test('travel round trips preserve both maps, terrain, queue, construction and money without copying assignments',()=>{
  const s=scene();s.world.unlock();s.save.flippedGrid['20_20']=true;s.save.buildingLevels['20_20']=2;
  s.save.productionState['20_10']={queue:[{recipeId:'plank'}],completedBatches:[]};
  s.save.constructions['22_20']={targetTileId:'b01_cottage_red',row:22,col:20,startTime:Date.now(),durationMs:100000};
  s.save.terrainMap=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));s.save.terrainMap[25][25]='s13_sand_ground';
  const town=structuredClone(s.save);assert.equal(s.world.travel('forest').ok,true);
  assert.equal(s.save.grid[20][20],'d12_meadow_wildflowers');s.save.grid[20][20]='d13_farmland_plot';
  assert.equal(s.world.otherLabor().population,8,'Upgraded home counts once in the other map');
  assert.equal(s.world.travel('town').ok,true);
  assert.equal(s.save.grid[20][20],town.grid[20][20]);assert.deepEqual(s.save.productionState,town.productionState);
  assert.deepEqual(s.save.constructions,town.constructions);assert.deepEqual(s.save.terrainMap,town.terrainMap);
  assert.equal(s.save.flippedGrid['20_20'],true);assert.equal(s.world.otherLabor().assigned,1);
  for(let i=0;i<4;i++){assert.equal(s.world.travel('forest').ok,true);assert.equal(s.save.grid[20][20],'d13_farmland_plot');assert.equal(s.world.travel('town').ok,true);}
  assert.equal(s.save.economy.playerGold,1500);assert.equal(s.world.otherLabor().assigned,1);
});

test('travel blocks active battles and unfinished placement, and unavailable regions do not mutate progress',()=>{
  const s=scene();assert.equal(s.world.travel('forest').ok,false);s.world.unlock();
  s.save.defense.phase='warning';assert.equal(s.world.travel('forest').ok,false);s.save.defense.phase='battle';assert.equal(s.world.travel('forest').ok,false);
  s.save.defense.phase='idle';s.placing(true);assert.equal(s.world.travel('forest').ok,false);s.placing(false);
  assert.equal(s.world.travel('forest').ok,true);assert.equal(s.world.travel('unknown').ok,false);
});

test('residents are shared across maps; remote farms reserve them and removing a remote supporting home is blocked',()=>{
  const s=scene();s.world.unlock();for(let c=18;c<22;c++)s.save.grid[21][c]='d13_farmland_plot';
  s.world.travel('forest');const forest=s.save;
  let labor=getWorkforce(forest.grid,{},tiles,{},null,null,s.world.otherLabor());
  assert.equal(labor.worldTotal,8);assert.equal(labor.free,4);
  for(let c=18;c<22;c++)forest.grid[22][c]='d13_farmland_plot';
  assert.equal(checkFarmWorkforce(forest.grid,{},tiles,{},null,null,s.world.otherLabor()).allowed,false);
  s.world.travel('town');assert.equal(s.world.otherLabor().assigned,4);
  assert.equal(checkHousingRemoval(s.save.grid,20,20,{},tiles,{},null,null,s.world.otherLabor()).allowed,false);
});

test('a forest save without a town hall survives local load, JSON export/import and a return trip',async()=>{
  memory.clear();const s=scene();s.world.unlock();s.world.travel('forest');s.save.grid[22][20]='b69_forester_lodge';
  assert.equal(saveGameSave(s.snapshot()),true);const loaded=loadGameSave();assert.equal(loaded.world.active,'forest');
  assert.equal(loaded.grid[22][20],'b69_forester_lodge');assert.equal(loaded.world.regions.town.grid[20][20],'b01_cottage_red');
  let exported,cleanup;const previousDoc=globalThis.document,previousURL=globalThis.URL,previousTimer=globalThis.setTimeout;
  globalThis.URL={createObjectURL(blob){exported=blob;return'blob:test';},revokeObjectURL(){}};
  globalThis.document={createElement:()=>({click(){},style:{}}),body:{appendChild(){},removeChild(){}}};
  globalThis.setTimeout=fn=>{cleanup=fn;return 0;};
  try{exportGameToJSON(s.snapshot());cleanup?.();}finally{globalThis.document=previousDoc;globalThis.URL=previousURL;globalThis.setTimeout=previousTimer;}
  globalThis.FileReader=class{readAsText(file){this.onload({target:{result:file.text}})}};
  const imported=await importGameFromJSON({text:await exported.text()});assert.equal(imported.world.active,'forest');
  assert.equal(imported.world.regions.town.grid[20][20],'b01_cottage_red');
  s.world.init(imported.world);assert.equal(s.world.travel('town').ok,true);assert.equal(s.save.grid[20][20],'b01_cottage_red');
});

test('forest missions require their order, stock and a real victory, with one reward each',()=>{
  const s=scene();s.world.unlock();s.world.travel('forest');
  assert.equal(s.world.claimMission('ancient').ok,false);assert.equal(s.world.claimMission('restore').ok,true);
  assert.equal(s.world.claimMission('restore').ok,false);assert.equal(s.world.claimMission('ancient').ok,false);
  s.save.resources.ancientWood=10;assert.equal(s.world.claimMission('ancient').ok,true);assert.equal(s.save.resources.ancientWood,0);
  assert.equal(s.world.claimMission('defend').ok,false);s.world.recordVictory();assert.equal(s.world.claimMission('defend').ok,true);
  assert.equal(s.world.claimMission('defend').ok,false);assert.equal(s.save.economy.playerGems,56);
  assert.deepEqual(s.world.getState().completedMissions,FOREST_MISSIONS.map(m=>m.id));
});

test('actual background workers deliver while the player is in the other map; finite dt and shared capacity apply',()=>{
  const s=scene();s.world.unlock();s.world.travel('forest');
  s.save.grid[16][12]='b69_forester_lodge';
  const manager=createExtractionManager({getCurrentGrid:()=>s.save.grid,getConstructions:()=>({}),getTileMap:()=>tiles,
    getBuildingLevels:()=>({}),getOtherLabor:()=>s.world.otherLabor(),getResources:()=>s.save.resources,getWarehouseCapacity:()=>4000,
    getGold:()=>s.save.economy.playerGold,spendGold:n=>{s.save.economy.playerGold-=n;},isCellUnlocked:()=>true});
  manager.init(null);assert.equal(manager.hire(16,12).allowed,true);s.save.extraction=manager.getState();
  s.world.travel('town');const before=s.save.resources.ancientWood||0;
  for(let i=0;i<400;i++)s.world.update(.2);
  assert.ok(s.save.resources.ancientWood>before,'Inactive forester actually delivered to the shared warehouse');
  const stock=s.save.resources.ancientWood;s.world.update(100000);assert.ok(s.save.resources.ancientWood-stock<=2,'No offline catch-up');
  assert.ok(getWarehouseUsed(s.save.resources)<4000);
});

function premiumScene(){
  const grid=createForestRegion().grid,flips={},resources={ancientWood:5};let gems=30,gold=100,fail=false,snapshot;
  const manager=createPremiumManager({getGems:()=>gems,setGems:n=>{gems=n;},getGold:()=>gold,setGold:n=>{gold=n;},getResources:()=>resources,
    getGrid:()=>grid,getConstructions:()=>({}),getFlips:()=>flips,isUnlocked:(r,c)=>r!==0,
    persist:()=>{if(fail)return false;snapshot=structuredClone(manager.getState());return true;},onChanged(){}});
  manager.init(null);return {manager,grid,flips,resources,gems:()=>gems,gold:()=>gold,snapshot:()=>snapshot,fail:value=>{fail=value;}};
}
test('premium exchange checks funds, commits a receipt with the reward and rejects repeated or stale clicks',()=>{
  const s=premiumScene();assert.equal(s.manager.buy('gold_large','gold_large:1').ok,true);
  assert.equal(s.gems(),10);assert.equal(s.gold(),2300);assert.equal(s.manager.buy('gold_large','gold_large:1').ok,false);
  assert.equal(s.manager.buy('gold_large','gold_large:2').ok,false);assert.equal(s.gold(),2300);
  assert.equal(s.manager.buy('gold_small','gold_small:1').ok,false,'Stale button cannot buy twice');
  const reloaded=premiumScene();reloaded.manager.init(s.snapshot());assert.equal(reloaded.manager.buy('gold_large','gold_large:1').ok,false);
});
test('collectibles stay in the bag until valid placement, cannot be placed twice, and craft stock is consumed once',()=>{
  const s=premiumScene();assert.equal(s.manager.buy('royal_banner','royal_banner:1').ok,true);assert.equal(s.gems(),22);
  assert.equal(s.manager.place('p02_royal_banner',31,15).ok,false);assert.equal(s.manager.place('p02_royal_banner',0,10).ok,false);
  assert.equal(s.manager.getState().inventory.p02_royal_banner,1);
  assert.equal(s.manager.place('p02_royal_banner',20,20,true).ok,true);assert.equal(s.grid[20][20],'p02_royal_banner');assert.equal(s.flips['20_20'],true);
  assert.equal(s.manager.place('p02_royal_banner',20,21).ok,false);assert.equal(s.manager.buy('forest_trophy','forest_trophy:2').ok,true);
  assert.equal(s.resources.ancientWood,0);assert.equal(s.manager.buy('forest_trophy','forest_trophy:3').ok,false);
});
test('failed persistence rolls back both premium currency and placement atomically',()=>{
  const s=premiumScene();s.fail(true);assert.equal(s.manager.buy('royal_banner','royal_banner:1').ok,false);
  assert.equal(s.gems(),30);assert.equal(s.manager.getState().inventory.p02_royal_banner,0);
  s.fail(false);s.manager.buy('royal_banner','royal_banner:1');s.fail(true);
  assert.equal(s.manager.place('p02_royal_banner',20,20,true).ok,false);
  assert.equal(s.grid[20][20],'d12_meadow_wildflowers');assert.equal(s.flips['20_20'],undefined);assert.equal(s.manager.getState().inventory.p02_royal_banner,1);
});
test('all region and premium offers use real local PNG art',()=>{
  for(const offer of PREMIUM_OFFERS){assert.equal(readFileSync(new URL('../public'+offer.image,import.meta.url)).toString('ascii',1,4),'PNG');}
});

test('returning a collectible restores bag inventory once and failed storage keeps the world item',()=>{
  const s=premiumScene();s.manager.buy('royal_banner','royal_banner:1');s.manager.place('p02_royal_banner',20,20,true);
  s.fail(true);assert.equal(s.manager.reclaim(20,20).ok,false);assert.equal(s.grid[20][20],'p02_royal_banner');assert.equal(s.flips['20_20'],true);
  s.fail(false);assert.equal(s.manager.reclaim(20,20).ok,true);assert.equal(s.grid[20][20],'d12_meadow_wildflowers');
  assert.equal(s.manager.getState().inventory.p02_royal_banner,1);assert.equal(s.manager.reclaim(20,20).ok,false);
  assert.equal(s.manager.getState().inventory.p02_royal_banner,1);
});

test('inactive constructions, upgrades and livestock complete once and feed the shared population',()=>{
  const s=scene();s.world.unlock();s.world.travel('forest');
  const end=Date.now()-2000;
  s.save.constructions['22_20']={row:22,col:20,targetTileId:'b01_cottage_red',startTime:end,durationMs:1};
  s.save.upgradesInProgress['20_18']={row:20,col:18,targetLevel:2,startTime:end,durationMs:1};
  s.save.livestockState['22_22']={state:'producing',feedTime:end,durationMs:1};
  s.world.travel('town');s.world.update(.2);
  const forest=s.world.getState().regions.forest;
  assert.equal(forest.grid[22][20],'b01_cottage_red');assert.equal(forest.constructions['22_20'],undefined);
  assert.equal(forest.buildingLevels['20_18'],2);assert.equal(forest.upgradesInProgress['20_18'],undefined);
  assert.equal(forest.livestockState['22_22'].state,'ready');assert.equal(s.world.otherLabor().population,12);
  s.world.update(.2);assert.equal(s.world.otherLabor().population,12);
});

test('premium ownership, wallet and completed world missions persist together in a full save',()=>{
  const s=scene();s.world.unlock();s.world.travel('forest');s.world.claimMission('restore');
  const collectible=premiumScene();collectible.manager.buy('royal_banner','royal_banner:1');
  const snapshot={...s.snapshot(),premium:collectible.manager.getState()};
  assert.equal(saveGameSave(snapshot),true);const loaded=loadGameSave();
  assert.equal(loaded.premium.inventory.p02_royal_banner,1);assert.deepEqual(loaded.world.completedMissions,['restore']);
  assert.equal(loaded.economy.playerGold,s.save.economy.playerGold);assert.equal(loaded.economy.playerGems,s.save.economy.playerGems);
});

test('an explicit region wonder snapshot cannot resurrect legacy sites from the other region',async()=>{
  const previousImage=globalThis.Image;globalThis.Image=class{src='';complete=true;naturalWidth=100;};
  const {KingdomWondersManager}=await import('../src/engine/kingdomWonders.js');
  globalThis.Image=previousImage;
  memory.set('town_builder_kingdom_wonder_sites',JSON.stringify({royal_palace:{row:20,col:20,placed:true}}));
  memory.set('town_builder_kingdom_wonders',JSON.stringify({royal_palace:3}));
  const instance={wondersState:{},wonderSites:{},saveSites(){},bindEvents(){}};
  KingdomWondersManager.prototype.init.call(instance,{royal_palace:0,ocean_library:0,poseidon_statue:0},{});
  assert.deepEqual(instance.wonderSites,{});assert.equal(instance.wondersState.royal_palace,0);
});
