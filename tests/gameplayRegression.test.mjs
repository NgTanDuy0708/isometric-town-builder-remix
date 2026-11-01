import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createProductionManager } from '../src/engine/productionManager.js';
import { initInputHandler } from '../src/engine/inputHandler.js';
import { claimQuestRewards } from '../src/engine/questRewards.js';
import { DailyWheelManager, WHEEL_SLICES } from '../src/engine/dailyWheel.js';
import { getDefaultSaveState, saveGameSave, loadGameSave, STORAGE_KEY, BACKUP_STORAGE_KEY, restoreBackupSave } from '../src/engine/storage.js';
import { createStarterTownMap32, applyTownCenterLayout, migrateLegacyWarehouseLayout } from '../src/data/starterMap.js';
import { calculateVillageStats, getTileRequiredLevel } from '../src/data/gameEconomy.js';
import { getBuildingLevelPopulation } from '../src/data/upgradesConfig.js';
import { TILES_DATA } from '../src/data/tilesData.js';
import { INITIAL_UNLOCKED_CHUNKS, WEST_FREE_CHUNKS, getNextChunkCost } from '../src/data/landConfig.js';
import { getUnlockedResourcesForLevel, getResourceUnlockLevel, RESOURCE_PRODUCERS } from '../src/data/orderBoardConfig.js';
import { CROPS_CONFIG } from '../src/data/cropsConfig.js';
import { expandGrid16to32 } from '../src/engine/isoMath.js';
import { createProductionPanel } from '../src/engine/productionPanel.js';
import { drawWorkshopActivity, getWorkshopSmokePoints } from '../src/engine/workshopEffects.js';
import { createOrderBoardManager } from '../src/engine/orderBoardManager.js';
import {readMapDocument,STARTER_MAP_KEY,MAP_APPLY_KEY,applyMapDocumentToSave,restartMapGrowth} from '../src/engine/mapEditing.js';
import {normalizeMapLocks,setActiveMapLocks,setCustomMapLayout} from '../src/data/mapLocks.js';
import {setHarborSites} from '../src/data/harborLayout.js';

const noop = () => {};
const tiles = Object.fromEntries(TILES_DATA.map(t => [t.id, t]));
function storage() {
  const map = new Map();
  globalThis.localStorage = { getItem: k => map.get(k) ?? null, setItem: (k,v) => map.set(k,String(v)), removeItem: k => map.delete(k) };
  return map;
}
function production(tile = 'b06_bakery', resources = { wheat: 0, bread: 0 }) {
  const grid = createStarterTownMap32(); grid[20][20] = tile;
  let capacity = 300;
  const events = [];
  const ctx = { getCurrentGrid: () => grid, getBuildingLevels: () => ({}), getPlayerResources: () => resources,
    getWarehouseCapacity: () => capacity, getPlayerLevel: () => 50,
    persistGameState: noop, updateResourcesUI: noop, showStorageFullModal: noop,
    addPlayerGold: n => events.push(['gold', n]), addPlayerXP: n => events.push(['xp', n]) };
  const manager = createProductionManager(ctx);
  manager.scanGrid(1000);
  return { manager, resources, events, grid, capacity: n => capacity = n };
}

test('valid save loads without legacy blank-map flag and zero tools remain zero', () => {
  storage();
  const save = getDefaultSaveState(); save.grid[20][20] = 'b01_cottage_red'; save.resources.ironTools = 0;
  saveGameSave(save);
  const source = fs.readFileSync(new URL('../src/studioEngine.js', import.meta.url), 'utf8');
  // Run the actual bootstrap sections, with storage and map helpers used in production.
  const start = source.indexOf('    const starterMapGrid =');
  const end = source.indexOf('    // Đồng bộ bờ', start);
  const resourceStart = source.indexOf('    let playerResources = initialSave.resources');
  const resourceEnd = source.indexOf('    // Building Levels State', resourceStart);
  const context = {readMapDocument,STARTER_MAP_KEY,MAP_APPLY_KEY,applyMapDocumentToSave,restartMapGrowth,normalizeMapLocks,setActiveMapLocks,setCustomMapLayout,setHarborSites, createStarterTownMap32, loadGameSave, getDefaultSaveState, expandGrid16to32, migrateLegacyWarehouseLayout, applyTownCenterLayout, localStorage };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end) + source.slice(resourceStart, resourceEnd) + '\nresult={tile:currentGrid[20][20], tools:playerResources.ironTools};', context);
  assert.equal(context.result.tile, 'b01_cottage_red'); assert.equal(context.result.tools, 0);
});

test('automatic bakery uses exactly one input before producing, including resume and reload', () => {
  const scene = production(); const m = scene.manager;
  m.update(1000); assert.equal(m.getState()['20_20'].paused, true);
  scene.resources.wheat = 1; m.feedPausedWorkshops(2000);
  assert.equal(scene.resources.wheat, 0);
  const saved = structuredClone(m.getState());
  m.setState(saved); m.update(62000);
  assert.equal(m.getState()['20_20'].ready, true);
  assert.equal(scene.resources.wheat, 0); assert.equal(m.harvest(20,20,true), true);
  assert.equal(scene.resources.bread, 1); assert.equal(m.harvest(20,20,true), false);
});

test('moving rejects a construction and carries upgrade coordinates to the destination', () => {
  globalThis.document = { getElementById: () => null }; globalThis.window = { addEventListener: noop };
  const grid = createStarterTownMap32(); grid[20][20] = 'b06_bakery';
  const constructions = { '21_21': { targetTileId: 'b03_blacksmith_forge' } };
  const upgrades = { '20_20': { row:20, col:20, targetLevel:2, startTime:1000, durationMs:9000 } };
  let moving = { tileId: 'b06_bakery', fromRow:20, fromCol:20, level:1 };
  const cell = { row:21, col:21 };
  const levels = {}, flipped = {}, prod = {}, farmland = {};
  const input = initInputHandler({ addEventListener: noop }, {
    getMovingBuilding: () => moving, setMovingBuilding: v => moving = v,
    getActiveBrush: () => null, getHoverCell: () => cell,
    getCurrentGrid: () => grid, getConstructions: () => constructions, getUpgradesInProgress: () => upgrades,
    getBuildingLevels: () => levels, getFlippedGrid: () => flipped, getProductionState: () => prod,
    getFarmlandState: () => farmland, getTileMap: () => tiles, getGameMode: () => 'game',
    getLandUnlockedChunks: () => Array.from({length:64},(_,i)=>i),
    requestRender: noop, showToast: noop, updateVillageStatsUI: noop, persistGameState: noop
  });
  assert.equal(input.confirmPlacement(), false); assert.equal(grid[20][20], 'b06_bakery');
  delete constructions['21_21'];
  assert.equal(input.confirmPlacement(), true);
  assert.equal(upgrades['20_20'], undefined);
  assert.deepEqual(upgrades['21_21'], { row:21,col:21,targetLevel:2,startTime:1000,durationMs:9000 });
  input.destroy();
});

test('multi-cell hall and warehouse count once, with the level of their anchor', () => {
  const grid = createStarterTownMap32(); migrateLegacyWarehouseLayout(grid);
  const stats = calculateVillageStats(grid, {}, tiles, { '13_15':2 });
  assert.equal(stats.completedBuildings, 3, 'Hall, warehouse and one fixed village gate');
  assert.equal(getBuildingLevelPopulation('b14_town_hall', 2, 16), 0);
  assert.equal(stats.population, 0, 'Hall and warehouse are counted as buildings, not homes');
});

test('free coast never advances paid land pricing, even with duplicate/old chunk lists', () => {
  assert.deepEqual(getNextChunkCost(INITIAL_UNLOCKED_CHUNKS), getNextChunkCost([...INITIAL_UNLOCKED_CHUNKS,...WEST_FREE_CHUNKS,...WEST_FREE_CHUNKS]));
  assert.equal(getNextChunkCost([...INITIAL_UNLOCKED_CHUNKS,...WEST_FREE_CHUNKS]).gold,250);
  assert.equal(getNextChunkCost([...INITIAL_UNLOCKED_CHUNKS,...WEST_FREE_CHUNKS,22]).gold,350);
});

test('orders cannot request products before their producer and ingredient unlocks', () => {
  for(let level=1;level<=30;level++) for(const id of getUnlockedResourcesForLevel(level)) {
    assert.ok(level >= getResourceUnlockLevel(id), `${id} at ${level}`);
    if(RESOURCE_PRODUCERS[id]) assert.ok(level >= getTileRequiredLevel(RESOURCE_PRODUCERS[id]));
    if(CROPS_CONFIG[id]) assert.ok(level >= CROPS_CONFIG[id].requiredLevel);
  }
  assert.ok(!getUnlockedResourcesForLevel(4).includes('butter'));
  assert.ok(getUnlockedResourcesForLevel(5).includes('meat'));
  assert.ok(getUnlockedResourcesForLevel(5).includes('roastPork'));
});

test('loading old orders replaces locked products without touching discard cooldowns or cargo in transit', () => {
  globalThis.document={getElementById:()=>null};globalThis.window={addEventListener:noop};
  const manager=createOrderBoardManager({getPlayerLevel:()=>3,getPlayerResources:()=>({})});
  const cargo={id:'in-transit',items:[{resourceId:'milk',amount:2}]};
  manager.init({orders:[{id:'locked',items:[{resourceId:'milk',amount:2}]},{cooldownUntil:Date.now()+180000}],
    truckState:{isDelivering:true,order:cargo,startedAt:Date.now(),returnsAt:Date.now()+28000}});
  const saved=manager.getSaveState();
  assert.notEqual(saved.orders[0].id,'locked');
  assert.ok(saved.orders[1].cooldownUntil);
  assert.equal(saved.truckState.order.id,'in-transit');
  assert.ok(saved.orders.filter(o=>o?.items).every(o=>o.items.every(it=>getUnlockedResourcesForLevel(3).includes(it.resourceId))));
});

test('quest materials are delivered once; a full warehouse keeps the claim available', () => {
  const claimed = {}, resources = { wheat:0 }; let gold=0, xp=0, capacity=1;
  const ctx = {getPlayerResources:()=>resources,getWarehouseCapacity:()=>capacity,addPlayerGold:n=>gold+=n,addPlayerXP:n=>xp+=n,persistGameState:noop};
  const q = { id:'quest',rewardGold:10,rewardXP:0,rewardResources:{wheat:2} };
  assert.equal(claimQuestRewards(ctx,q,claimed),false); assert.equal(claimed.quest,undefined);
  capacity=300;
  assert.equal(claimQuestRewards(ctx,q,claimed),true); assert.equal(resources.wheat,2); assert.equal(gold,10); assert.equal(xp,0);
  assert.equal(claimQuestRewards(ctx,q,claimed),false); assert.equal(resources.wheat,2);
});

test('paid wheel commits cost, prize and cooldown before animation; reload never awards twice', () => {
  const map=storage(); globalThis.document={getElementById:()=>null};
  map.set('town_builder_wheel_last_free_spin',String(Date.now()));
  let gems=10,gold=0,save;
  const w = new DailyWheelManager({getPlayerGems:()=>gems,commitSpin:(slice,cost)=>{
    gems-=cost; if(slice.type==='gold')gold+=slice.amount;else gems+=slice.amount;
    save={gems,gold,dailyWheel:w.getSaveState()}; return true;
  }});
  w.init(null); w.spin(); w.destroy();
  assert.ok(save); assert.ok(save.gold>0 || save.gems>=7);
  assert.ok(WHEEL_SLICES.some(slice=>slice.type==='gold' ? save.gold===slice.amount && save.gems===5 : save.gems===5+slice.amount && save.gold===0));
  const restored = new DailyWheelManager({}); restored.init(save.dailyWheel);
  assert.equal(restored.isFreeSpinAvailable(),false); assert.equal(gems,save.gems); assert.equal(gold,save.gold); restored.destroy();
});

test('corrupt main save falls back to a valid backup and can restore it explicitly', () => {
  const map=storage(); const save=getDefaultSaveState(); save.grid[20][20]='b01_cottage_red';
  saveGameSave(save); save.resources.wheat=8; saveGameSave(save);
  assert.ok(map.get(BACKUP_STORAGE_KEY)); map.set(STORAGE_KEY,'{broken');
  assert.equal(loadGameSave().grid[20][20],'b01_cottage_red');
  assert.equal(restoreBackupSave(),true); assert.ok(JSON.parse(map.get(STORAGE_KEY)).grid);
});

test('queue reserves inputs once, finishes multiple batches offline, and survives save/load', () => {
  storage(); const s=production('b64_bbq_restaurant',{meat:10,carrot:5,roastPork:0});
  for(let i=0;i<5;i++) assert.equal(s.manager.enqueue(20,20,'roastPork').ok,true);
  assert.equal(s.resources.meat,0); assert.equal(s.manager.enqueue(20,20,'roastPork').ok,false);
  const save=getDefaultSaveState(s.grid);save.productionState=s.manager.getState();save.resources=s.resources;
  saveGameSave(save); const loaded=loadGameSave();s.manager.setState(loaded.productionState);
  const p=s.manager.getState()['20_20'];s.manager.update(p.activeBatch.startedAt+5*90000);
  assert.equal(p.completedBatches.length,5);assert.equal(p.activeBatch,null);
  s.capacity(0);assert.equal(s.manager.harvest(20,20,true),false);assert.equal(p.completedBatches.length,5);
  s.capacity(300);for(let i=0;i<5;i++) assert.equal(s.manager.harvest(20,20,true),true);
  assert.equal(s.resources.roastPork,5);assert.equal(s.resources.meat,0);assert.equal(s.manager.harvest(20,20,true),false);
});

test('cancelling a waiting batch refunds only that batch and respects warehouse capacity', () => {
  const s=production('b64_bbq_restaurant',{meat:4,carrot:2});
  s.manager.enqueue(20,20,'roastPork');s.manager.enqueue(20,20,'roastPork');
  s.capacity(0);assert.equal(s.manager.cancelQueued(20,20,0),false);
  s.capacity(300);assert.equal(s.manager.cancelQueued(20,20,0),true);
  assert.equal(s.resources.meat,2);assert.equal(s.resources.carrot,1);
  assert.equal(s.manager.cancelQueued(20,20,0),false);
});

test('switching to the queue preserves the paid automatic batch without charging it again', () => {
  const s = production('b06_bakery', {wheat:2,bread:0});
  const now=Date.now();s.manager.update(now);
  assert.equal(s.resources.wheat,1);
  assert.equal(s.manager.enqueue(20,20,'bread').ok,true);assert.equal(s.resources.wheat,0);
  s.manager.update(now+121000);
  assert.equal(s.manager.getState()['20_20'].completedBatches.length,2);
  s.manager.harvest(20,20,true);s.manager.harvest(20,20,true);
  assert.equal(s.resources.bread,2);
});

test('recipe panel adds batches through the real manager and overview lists their status', () => {
  class Element {
    constructor(tag) { this.tag=tag;this.children=[];this.textContent='';this.listeners={};this.hidden=false; }
    appendChild(node) {this.children.push(node);return node;}
    replaceChildren(){this.children=[];}
    setAttribute(){}
    addEventListener(name,fn){this.listeners[name]=fn;}
    querySelector(tag){return this.children.flatMap(n=>[n,...n.all()]).find(n=>n.tag===tag);}
    all(){return this.children.flatMap(n=>[n,...n.all()]);}
    focus(){}
    remove(){this.removed=true;}
  }
  globalThis.document={body:new Element('body'),createElement:tag=>new Element(tag)};
  globalThis.window={addEventListener:noop};
  const s=production('b64_bbq_restaurant',{meat:4,carrot:2});
  const panel=createProductionPanel({manager:s.manager,getCurrentGrid:()=>s.grid,getConstructions:()=>({}),getTileMap:()=>tiles,
    getPlayerResources:()=>s.resources,getPlayerLevel:()=>5,getWarehouseCapacity:()=>300,
    getFarmlandState:()=>({}),getLivestockState:()=>({}),showToast:noop,focusCell:noop});
  try {
    panel.open(20,20);
    const root=document.body.children[0];
    const add=root.all().find(n=>n.textContent==='＋ Thêm mẻ');
    assert.ok(add);assert.equal(add.disabled,false);add.listeners.click();
    assert.equal(s.manager.getState()['20_20'].activeBatch.resource,'roastPork');assert.equal(s.resources.meat,2);
    panel.open();assert.ok(root.all().some(n=>n.textContent.includes('Đang sản xuất')));
  } finally {panel.destroy();}
});

test('workshop smoke follows each level and mirror, animates, and stops when idle', () => {
  for(const tid of ['b03_blacksmith_forge','b02_tudor_inn','b06_bakery']) for(const level of [1,2,3]) {
    const normal=getWorkshopSmokePoints(tid,level,0,0,false), mirror=getWorkshopSmokePoints(tid,level,0,0,true);
    assert.ok(normal.length);
    normal.forEach((p,i)=>{assert.ok(Math.abs(p.x+mirror[i].x-128)<1e-8);assert.equal(p.y,mirror[i].y);});
  }
  const draws=[];let depth=0;
  const canvas={save(){depth++},restore(){depth--},fillRect(...r){draws.push(r)}};
  drawWorkshopActivity(canvas,'b06_bakery',1,0,0,false,{paused:true},0);assert.equal(draws.length,0);
  drawWorkshopActivity(canvas,'b06_bakery',1,0,0,false,{ready:true},0);assert.equal(draws.length,0);
  drawWorkshopActivity(canvas,'b06_bakery',1,0,0,false,{queueMode:true,activeBatch:{}},0);
  const first=JSON.stringify(draws);draws.length=0;
  drawWorkshopActivity(canvas,'b06_bakery',1,0,0,false,{queueMode:true,activeBatch:{}},1);
  assert.notEqual(JSON.stringify(draws),first);assert.equal(depth,0);
});
