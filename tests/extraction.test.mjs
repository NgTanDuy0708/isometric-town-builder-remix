import test from 'node:test';
import assert from 'node:assert/strict';
import { createExtractionManager } from '../src/engine/extractionManager.js';
import { getWorkforce, checkFarmWorkforce, checkHousingRemoval } from '../src/engine/workforce.js';
import { TILES_DATA } from '../src/data/tilesData.js';
import { getWarehouseUsed } from '../src/data/resourcesConfig.js';
import { getDefaultSaveState, saveGameSave, loadGameSave } from '../src/engine/storage.js';

const tileMap=Object.fromEntries(TILES_DATA.map(t=>[t.id,t]));
function scene() {
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  grid[20][20]='b11_carpenter_sawmill';grid[20][25]='b65_stone_quarry';
  grid[19][20]='n01_logging_grove';grid[19][25]='n02_stone_deposit';
  grid[23][22]='b60_combined_warehouse';grid[22][20]='b01_cottage_red';
  let gold=500,cap=300,locked=new Set(),reserved=new Set();
  const resources={},levels={},constructions={};let changes=0;
  const ctx={getCurrentGrid:()=>grid,getConstructions:()=>constructions,getBuildingLevels:()=>levels,getTileMap:()=>tileMap,
    getResources:()=>resources,getWarehouseCapacity:()=>cap,getGold:()=>gold,spendGold:n=>{gold-=n;},
    isCellUnlocked:(r,c)=>!locked.has(`${r}_${c}`),isReservedCell:(r,c)=>reserved.has(`${r}_${c}`),onChanged:()=>{changes++;}};
  const manager=createExtractionManager(ctx);manager.init({seeded:true});
  return {grid,levels,constructions,resources,ctx,manager,locked,reserved,gold:()=>gold,changes:()=>changes,setCap:n=>{cap=n;},
    tick(seconds){for(let i=0;i<seconds*10;i++)manager.update(.1);}};
}
test('hiring consumes one shared worker, charges once, enforces slots, housing and warehouse access',()=>{
  const s=scene();
  assert.equal(s.manager.hire(20,20).allowed,true);assert.equal(s.gold(),470);
  assert.equal(s.manager.hire(20,20).allowed,true);assert.equal(s.gold(),440);
  assert.equal(s.manager.hire(20,20).allowed,false);assert.equal(s.gold(),440);
  assert.equal(s.manager.labor().workers,2);assert.equal(s.manager.labor().free,2);
  s.grid[21][20]=s.grid[21][21]='d13_farmland_plot';
  assert.equal(s.manager.hire(20,25).allowed,false);
  assert.equal(checkFarmWorkforce(s.grid,{},tileMap,{},s.manager.getState()).allowed,false);
  assert.equal(checkHousingRemoval(s.grid,22,20,{},tileMap,{},s.manager.getState()).allowed,false);
  const t=scene();t.grid[23][22]='d12_meadow_wildflowers';
  assert.equal(t.manager.hire(20,20).allowed,false);assert.equal(t.gold(),500);
});
test('wood and stone arrive only after work and travel to the real warehouse; stocks deplete atomically',()=>{
  const s=scene();s.manager.hire(20,20);s.manager.hire(20,25);
  s.tick(5);assert.equal(getWarehouseUsed(s.resources),0);
  assert.ok(s.manager.getState().jobs.some(j=>j.phase==='working'));
  s.tick(20);assert.ok(s.resources.wood>=2);assert.ok(s.resources.stone>=2);
  assert.equal(getWarehouseUsed(s.resources),s.resources.wood+s.resources.stone);
  assert.ok(s.manager.getState().nodes['19_20'].remaining<30);
  assert.ok(s.changes()>1);
});

test('upgrading opens extra slots, unaffordable hiring is atomic, and missing source maps can recover',()=>{
  const s=scene();
  s.manager.hire(20,20);s.manager.hire(20,20);
  assert.equal(s.manager.hire(20,20).allowed,false);
  s.levels['20_20']=2;assert.equal(s.manager.hire(20,20).allowed,true);
  s.grid[20][24]='b01_cottage_red';s.levels['20_20']=3;assert.equal(s.manager.hire(20,20).allowed,true);
  const low=scene();low.ctx.getGold=()=>0;
  assert.equal(low.manager.hire(20,20).allowed,false);assert.equal(low.manager.getState().jobs.length,0);
  const full=scene();for(const row of full.grid)row.fill('b01_cottage_red');
  full.manager.init(null);assert.equal(Object.keys(full.manager.getState().nodes).length,0);
  full.grid[9][10]=full.grid[9][11]='d12_meadow_wildflowers';full.tick(2);
  assert.equal(full.grid[9][10],'n01_logging_grove');
});
test('a full warehouse preserves cargo and retirement waits for delivery and the trip home',()=>{
  const s=scene();s.setCap(2);s.resources.wheat=2;s.manager.hire(20,20);s.tick(25);
  const job=s.manager.getState().jobs[0];assert.equal(job.status,'full');assert.equal(job.load,2);
  assert.equal(s.resources.wood,undefined);s.manager.dismiss(job.id);s.tick(5);
  assert.equal(s.manager.labor().workers,1);assert.equal(job.load,2);
  s.resources.wheat=0;s.tick(30);
  assert.equal(s.resources.wood,2);assert.equal(s.manager.getState().jobs.length,0);assert.equal(s.manager.labor().free,4);
});
test('workers never cross blocked buildings or locked cells and recover when a route is cleared',()=>{
  const s=scene();s.manager.hire(20,20);
  s.grid[19][20]='d12_meadow_wildflowers';s.grid[16][20]='n01_logging_grove';
  s.manager.init({...s.manager.getState(),seeded:true});
  for(let c=0;c<32;c++)s.grid[18][c]='b01_cottage_red';
  s.tick(15);assert.equal(s.resources.wood,undefined);
  assert.equal(s.manager.getState().jobs[0].status,'no_path');
  s.grid[18][20]='d12_meadow_wildflowers';s.locked.add('18_20');
  s.tick(10);assert.equal(s.resources.wood,undefined);
  s.locked.clear();s.tick(45);assert.ok(s.resources.wood>=2);
});
test('natural resources regenerate and a checkpoint with cargo reloads without duplicate extraction',()=>{
  const s=scene();s.manager.getState().nodes['19_20'].remaining=2;s.manager.hire(20,20);
  for(let i=0;i<200 && !s.manager.getState().jobs[0].load;i++)s.manager.update(.1);
  const saved=structuredClone(s.manager.getState());assert.equal(saved.jobs[0].load,2);
  assert.equal(saved.nodes['19_20'].remaining,0);
  const restored=createExtractionManager(s.ctx);restored.init(saved);
  for(let i=0;i<200;i++)restored.update(.1);
  assert.equal(s.resources.wood,2);assert.equal(restored.getState().nodes['19_20'].remaining,0);
  for(let i=0;i<500;i++)restored.update(.1);
  assert.ok(restored.getState().nodes['19_20'].remaining>0);
});
test('old maps receive six natural deposits only in empty unlocked unreserved land; init is repeatable',()=>{
  const s=scene();s.grid[19][20]='d12_meadow_wildflowers';s.grid[19][25]='d12_meadow_wildflowers';
  s.grid[9][10]='b01_cottage_red';s.reserved.add('22_22');
  s.manager.init(null);const before=JSON.stringify(s.grid);
  assert.equal(s.grid[9][10],'b01_cottage_red');assert.equal(s.grid[22][22],'d12_meadow_wildflowers');
  assert.equal(Object.keys(s.manager.getState().nodes).length,6);
  s.manager.init(structuredClone(s.manager.getState()));assert.equal(JSON.stringify(s.grid),before);
});
test('save service preserves assigned workers, carried cargo, resource stocks and wood/stone inventory',()=>{
  const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),store=new Map();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i],get length(){return store.size;}}});
  try {
    const s=scene();s.manager.hire(20,20);s.tick(8);
    const save=getDefaultSaveState();save.grid=s.grid;save.grid[12][14]='b14_town_hall';
    save.extraction=structuredClone(s.manager.getState());save.resources={wood:7,stone:9};
    assert.equal(saveGameSave(save),true);const loaded=loadGameSave();
    assert.deepEqual(loaded.extraction,save.extraction);assert.equal(loaded.resources.stone,9);
    assert.equal(getWorkforce(loaded.grid,loaded.constructions,tileMap,loaded.buildingLevels,loaded.extraction).workers,1);
  } finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});
