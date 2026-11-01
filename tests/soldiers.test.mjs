import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefenseManager} from '../src/engine/defenseManager.js';
import {createExtractionManager} from '../src/engine/extractionManager.js';
import {getWorkforce,checkFarmWorkforce,checkHousingRemoval} from '../src/engine/workforce.js';
import {TILES_DATA} from '../src/data/tilesData.js';
import {getDefaultSaveState,saveGameSave,loadGameSave} from '../src/engine/storage.js';
import {createSoldierManager} from '../src/engine/soldierManager.js';
const tiles=Object.fromEntries(TILES_DATA.map(tile=>[tile.id,tile]));
function scene(){
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  grid[16][16]='b08_watchtower';grid[18][18]='b14_town_hall';grid[17][16]='b67_guard_barracks';
  grid[20][20]='b01_cottage_red';grid[22][22]='b60_combined_warehouse';grid[20][24]='b11_carpenter_sawmill';
  let gold=500,level=6;const resources={ironTools:10},levels={},constructions={},locked=new Set();
  let defense,extraction;const snapshots=[];
  const ctx={getCurrentGrid:()=>grid,getConstructions:()=>constructions,getBuildingLevels:()=>levels,getTileMap:()=>tiles,
    getResources:()=>resources,getWarehouseCapacity:()=>300,getGold:()=>gold,spendGold:n=>gold-=n,
    getPlayerLevel:()=>level,isCellUnlocked:(r,c)=>r>=8&&r<24&&c>=8&&c<28&&!locked.has(`${r}_${c}`),
    getExtractionState:()=>extraction?.getState(),getDefenseState:()=>defense?.getState(),
    getFoodSpeed:()=>extraction?.foodSummary().workSpeed??1,getSoldierFoodCount:()=>defense?.soldierFoodCount()||0,
    onChanged:()=>snapshots.push({gold,resources:structuredClone(resources)})};
  extraction=createExtractionManager(ctx);extraction.init(null);defense=createDefenseManager(ctx);defense.init(null);
  const labor=()=>getWorkforce(grid,constructions,tiles,levels,extraction.getState(),defense.getState());
  const tick=seconds=>{for(let i=0;i<Math.ceil(seconds*10);i++){extraction.update(.1);defense.update(.1);}};
  return {grid,resources,levels,constructions,locked,ctx,defense,extraction,labor,tick,snapshots,
    gold:()=>gold,setGold:n=>gold=n,setLevel:n=>level=n};
}

test('training charges once, holds one resident immediately and obeys level, space, materials and farm limits',()=>{
  const s=scene();s.setLevel(5);assert.equal(s.defense.trainSoldier(17,16).ok,false);assert.equal(s.gold(),500);s.setLevel(6);
  s.constructions['17_16']={};assert.equal(s.defense.trainSoldier(17,16).ok,false);delete s.constructions['17_16'];
  s.setGold(0);assert.equal(s.defense.trainSoldier(17,16).ok,false);s.setGold(500);
  s.resources.ironTools=0;assert.equal(s.defense.trainSoldier(17,16).ok,false);s.resources.ironTools=10;
  for(let i=0;i<2;i++)assert.equal(s.defense.trainSoldier(17,16).ok,true);
  assert.equal(s.gold(),400);assert.equal(s.resources.ironTools,8);assert.equal(s.labor().soldiers,2);assert.equal(s.labor().free,2);
  assert.equal(s.defense.trainSoldier(17,16).ok,false);assert.equal(s.gold(),400);
  s.grid[21][20]=s.grid[21][21]='d13_farmland_plot';
  assert.equal(checkFarmWorkforce(s.grid,s.constructions,tiles,s.levels,s.extraction.getState(),s.defense.getState()).allowed,false);
  assert.equal(s.extraction.hire(20,24).allowed,false);
  assert.equal(checkHousingRemoval(s.grid,20,20,s.constructions,tiles,s.levels,s.extraction.getState(),s.defense.getState()).allowed,false);
  assert.match(s.defense.busyMessage(17,16),/toàn bộ lính/);
});

test('upgraded barracks add two slots per level without creating residents or allowing a blocked entrance',()=>{
  const s=scene();for(const [r,c] of [[16,16],[18,16],[17,15],[17,17]])s.grid[r][c]='b01_cottage_red';
  assert.equal(s.defense.trainSoldier(17,16).ok,false);assert.equal(s.gold(),500);
  s.grid[17][15]='d12_meadow_wildflowers';s.grid[21][21]='b01_cottage_red';s.levels['17_16']=3;
  for(let i=0;i<6;i++)assert.equal(s.defense.trainSoldier(17,16).ok,true);
  assert.equal(s.defense.trainSoldier(17,16).ok,false);assert.equal(s.labor().soldiers,6);
});

test('training takes online time, soldiers and workers share meals once and hunger slows training',()=>{
  const s=scene();s.defense.trainSoldier(17,16);s.extraction.hire(20,24);
  assert.equal(s.extraction.foodSummary().workers,2);assert.equal(s.extraction.foodSummary().soldiers,1);
  assert.equal(s.extraction.foodSummary().portionsPerMinute,1);
  s.tick(10);const soldier=s.defense.getState().soldiers[0];assert.ok(soldier.trainLeft>9.9&&soldier.trainLeft<10.1);
  s.extraction.getState().food.progress=120;s.tick(10);assert.ok(soldier.trainLeft>4.9&&soldier.trainLeft<5.1);
  s.resources.bread=1;s.tick(.1);assert.equal(s.resources.bread,0);assert.equal(s.extraction.getState().food.reserve,3);
  assert.equal(s.extraction.foodSummary().hungry,false);s.tick(5);assert.equal(soldier.trainLeft,0);
  assert.equal(s.labor().soldiers,1);
});

test('trained soldiers actually travel and hit goblins, who hit guards before damaging nearby towers',()=>{
  const s=scene();s.resources.bread=5;s.defense.trainSoldier(17,16);s.tick(21);
  assert.equal(s.defense.startTraining().ok,true);s.tick(15.2);
  const state=s.defense.getState(),soldier=state.soldiers[0];
  state.enemies=[{id:1,r:20,c:16,hp:100,maxHp:100,path:[],target:null,retry:0,attack:0}];
  state.raid.spawned=state.raid.total=1;state.towers['16_16'].hp=0;
  s.tick(1);assert.ok(soldier.r>17);s.tick(3);
  assert.ok(state.enemies[0].hp<100);assert.ok(soldier.hp<60);assert.equal(state.villageHp,100);
  assert.equal(s.defense.dismissSoldier(soldier.id).ok,false);
});

test('fallen soldiers return and heal rather than disappearing, and retirement returns the resident only at camp',()=>{
  const s=scene();s.resources.bread=5;s.defense.trainSoldier(17,16);s.tick(21);
  const soldier=s.defense.getState().soldiers[0];soldier.hp=0;soldier.r=20;soldier.c=16;
  s.tick(1);assert.equal(s.labor().soldiers,1);assert.equal(soldier.hp,0);assert.ok(soldier.r<20);
  s.tick(40);assert.equal(soldier.hp,60);assert.equal(s.labor().soldiers,1);
  soldier.r=20;soldier.c=16;soldier.path=[];
  assert.equal(s.defense.dismissSoldier(soldier.id).ok,true);assert.equal(s.defense.soldierFoodCount(),0);
  s.tick(1);assert.equal(s.labor().soldiers,1);s.tick(10);assert.equal(s.labor().soldiers,0);assert.equal(s.labor().free,4);
  assert.equal(s.defense.busyMessage(17,16),null);assert.equal(s.gold(),450,'no refund on dismissal');
});

test('soldiers stop at blocked or locked passages and surplus assignments pause without eating',()=>{
  const s=scene();s.defense.trainSoldier(17,16);s.tick(21);const soldier=s.defense.getState().soldiers[0];
  soldier.r=20;soldier.c=16;soldier.path=[];
  for(let c=0;c<32;c++)s.grid[19][c]='b01_cottage_red';
  s.tick(2);assert.equal(soldier.r,20);assert.equal(soldier.status,'no_path');
  s.grid[19][16]='d12_meadow_wildflowers';s.locked.add('19_16');s.tick(2);assert.equal(soldier.r,20);
  s.locked.clear();s.tick(10);assert.equal(soldier.r,17);
  for(const row of s.grid)for(let c=0;c<row.length;c++)if(row[c]==='b01_cottage_red')row[c]='d12_meadow_wildflowers';
  s.tick(.1);assert.equal(soldier.status,'understaffed');assert.equal(s.defense.soldierFoodCount(),0);assert.equal(s.labor().shortage,1);
});

test('a save round trip keeps assigned troops, partial training, wounds, meals and inventory together',()=>{
  const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),store=new Map();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)??null,
    setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i],get length(){return store.size;}}});
  try{
    const s=scene();s.defense.trainSoldier(17,16);s.tick(7);
    s.defense.getState().soldiers[0].hp=33;s.extraction.getState().food.reserve=2;
    const save=getDefaultSaveState(s.grid);Object.assign(save,{resources:s.resources,extraction:s.extraction.getState(),defense:s.defense.getState()});
    save.economy.playerGold=s.gold();assert.equal(saveGameSave(save),true);const loaded=loadGameSave();
    assert.deepEqual(loaded.defense,save.defense);assert.equal(loaded.economy.playerGold,450);
    s.defense.init(loaded.defense);s.extraction.init(loaded.extraction);
    assert.equal(s.labor().soldiers,1);assert.equal(s.defense.getState().soldiers[0].hp,33);
    assert.ok(s.defense.getState().soldiers[0].trainLeft>12.9);assert.equal(s.extraction.getState().food.reserve,2);
    s.tick(14);assert.equal(s.defense.getState().soldiers[0].trainLeft,0);assert.equal(s.resources.ironTools,9);
    s.defense.init(null);assert.equal(s.labor().soldiers,0);
  }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});

function mageScene(){
  const s=scene();s.grid[17][18]='b68_mage_academy';s.resources.fabric=20;s.setLevel(8);
  return s;
}
test('mage recruitment requires its academy, level and full material cost, sharing the same resident and food limits',()=>{
  const s=mageScene();s.setLevel(7);assert.equal(s.defense.trainSoldier(17,18).ok,false);assert.equal(s.gold(),500);s.setLevel(8);
  s.resources.fabric=1;assert.equal(s.defense.trainSoldier(17,18).ok,false);assert.equal(s.resources.ironTools,10);
  s.resources.fabric=20;assert.equal(s.defense.trainSoldier(17,18).ok,true);
  const mage=s.defense.getState().soldiers[0];assert.equal(mage.unitType,'mage');assert.equal(mage.hp,40);assert.equal(mage.trainLeft,30);
  assert.equal(s.gold(),420);assert.equal(s.resources.ironTools,9);assert.equal(s.resources.fabric,18);
  assert.equal(s.labor().soldiers,1);assert.equal(s.extraction.foodSummary().soldiers,1);
  s.defense.trainSoldier(17,16);s.defense.trainSoldier(17,16);s.defense.trainSoldier(17,18);
  assert.equal(s.labor().free,0);const before=structuredClone(s.resources),gold=s.gold();
  assert.equal(s.defense.trainSoldier(17,18).ok,false);assert.deepEqual(s.resources,before);assert.equal(s.gold(),gold);
  assert.match(s.defense.busyMessage(17,18),/toàn bộ lính/);
});

test('an actual mage casts at three tiles, damages enemies near the target and never damages friendly troops',()=>{
  const s=mageScene();s.resources.bread=5;s.defense.trainSoldier(17,18);s.tick(31);
  s.defense.trainSoldier(17,16);const state=s.defense.getState(),ally=state.soldiers[1];ally.r=20;ally.c=18;ally.hp=20;
  assert.equal(s.defense.startTraining().ok,true);s.tick(15.2);
  // Keep this ally in training for the single combat tick so only the mage attacks.
  ally.trainLeft=10;state.towers['16_16'].hp=0;
  Object.assign(state.soldiers[0],{r:17,c:18,cooldown:0,path:[],target:null});
  state.enemies=[{id:1,r:20,c:18,hp:100,maxHp:100,path:[],target:null,retry:0,attack:0},
    {id:2,r:20,c:18.8,hp:100,maxHp:100,path:[],target:null,retry:0,attack:0},
    {id:3,r:22,c:22,hp:100,maxHp:100,path:[],target:null,retry:0,attack:0}];
  state.raid.spawned=state.raid.total=3;s.tick(.1);
  assert.equal(state.enemies[0].hp,86);assert.equal(state.enemies[1].hp,86);assert.equal(state.enemies[2].hp,100);
  assert.equal(ally.hp,20);const mage=state.soldiers[0];assert.equal(mage.r,17);assert.equal(mage.c,18);
  assert.equal(mage.status,'fighting');assert.equal(mage.cooldown,2);assert.ok(mage.spellFlash>0);
});

test('hungry mages train and cast at half speed without a separate meal debit',()=>{
  const s=mageScene();s.defense.trainSoldier(17,18);s.tick(10);
  const state=s.defense.getState(),mage=state.soldiers[0];s.extraction.getState().food.progress=120;s.tick(10);
  assert.ok(mage.trainLeft>14.9&&mage.trainLeft<15.1);
  s.resources.bread=1;s.tick(.1);assert.equal(s.resources.bread,0);assert.equal(s.extraction.getState().food.reserve,3);
  mage.trainLeft=0;mage.cooldown=2;
  const controller=createSoldierManager({...s.ctx,getState:()=>state,isBattleActive:()=>false});
  const enemy={id:1,r:20,c:18,hp:100};
  s.extraction.getState().food.reserve=0;s.extraction.getState().food.progress=120;
  controller.update(2,true,[enemy]);assert.equal(enemy.hp,100);assert.equal(mage.cooldown,1);
  controller.update(2,true,[enemy]);assert.equal(enemy.hp,86);assert.equal(mage.cooldown,2);
});

test('mage pathfinding stops at a firing position instead of marching into melee, and blocked land stops movement',()=>{
  const s=mageScene();s.defense.trainSoldier(17,18);s.tick(31);s.defense.startTraining();s.tick(15.2);
  const state=s.defense.getState(),mage=state.soldiers[0];state.towers['16_16'].hp=0;
  state.enemies=[{id:1,r:22,c:18,hp:100,maxHp:100,path:[],target:null,retry:0,attack:0}];state.raid.spawned=state.raid.total=1;
  s.tick(.1);const goal=mage.path.at(-1);
  assert.ok(goal);assert.ok(Math.hypot(goal.r-22,goal.c-18)<=3);assert.ok(Math.hypot(goal.r-22,goal.c-18)>1.01);
  mage.r=17;mage.c=18;mage.path=[];mage.retry=0;mage.target=null;
  for(let c=0;c<32;c++)s.grid[18][c]='b01_cottage_red';s.grid[18][18]='b14_town_hall';
  s.tick(.1);assert.equal(mage.r,17);assert.equal(mage.status,'no_path');
});

test('mage reload keeps its type, wounds and two-second cooldown while legacy guards still load as guards',()=>{
  const s=mageScene();s.defense.trainSoldier(17,18);s.defense.trainSoldier(17,16);s.tick(5);
  const saved=structuredClone(s.defense.getState());saved.soldiers[0].hp=17;saved.soldiers[0].cooldown=1.8;
  delete saved.soldiers[1].unitType;
  s.defense.init(saved);const roster=s.defense.getState().soldiers;
  assert.equal(roster[0].unitType,'mage');assert.equal(roster[0].hp,17);assert.equal(roster[0].cooldown,1.8);
  assert.ok(roster[0].trainLeft>24.9);assert.equal(roster[1].unitType,'guard');assert.equal(s.labor().soldiers,2);
  roster[0].trainLeft=0;roster[0].hp=0;s.resources.bread=3;s.tick(21);
  assert.equal(roster[0].hp,40);assert.equal(s.labor().soldiers,2);
  s.defense.dismissSoldier(roster[0].id);s.tick(.1);assert.equal(s.labor().soldiers,1);
  assert.equal(s.resources.fabric,18);assert.equal(s.gold(),370);
});

test('a mage just outside firing range finishes its partial grid step instead of getting stuck with an empty path',()=>{
  const s=mageScene();s.defense.trainSoldier(17,18);s.tick(31);s.defense.startTraining();s.tick(15.2);
  const state=s.defense.getState(),mage=state.soldiers[0];state.towers['16_16'].hp=0;
  Object.assign(mage,{r:17.6,c:19,path:[],target:null,retry:0,cooldown:0});
  state.enemies=[{id:1,r:20.65,c:19,hp:100,maxHp:100,path:[],target:null,retry:0,attack:0}];state.raid.spawned=state.raid.total=1;
  s.tick(.1);assert.ok(mage.r>17.6);assert.equal(mage.status,'marching');
});
