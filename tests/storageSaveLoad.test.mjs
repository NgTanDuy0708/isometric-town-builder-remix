import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  key: (i) => [...store.keys()][i],
  get length() { return store.size; }
};

const { getDefaultSaveState, saveGameSave, loadGameSave } = await import('../src/engine/storage.js');
const { migrateLegacyWarehouseLayout } = await import('../src/data/starterMap.js');
const {FRUIT_TREES_CONFIG} = await import('../src/data/fruitTreeConfig.js');
const {createFruitTreeState,getFruitTreeVisual} = await import('../src/engine/fruitTreeLifecycle.js');

test('all fruit resources and seven-stage lifecycle metadata survive save/load',()=>{
  store.clear();const state=getDefaultSaveState(),now=Date.now();
  Object.entries(FRUIT_TREES_CONFIG).forEach(([id,cfg],i)=>{
    const key='20_'+(10+i);state.grid[20][10+i]=id;state.resources[cfg.fruitId]=i+1;
    const tree=i%2?{lastHarvest:now,hasHarvested:true,harvestCount:3,exhausted:true,ready:false}:createFruitTreeState(now);
    state.fruitTreesState[key]={...tree};state.productionState[key]={...tree};
  });
  assert.equal(saveGameSave(state),true);const loaded=loadGameSave();
  Object.entries(FRUIT_TREES_CONFIG).forEach(([id,cfg],i)=>{
    const key='20_'+(10+i);assert.equal(loaded.grid[20][10+i],id);
    assert.equal(loaded.resources[cfg.fruitId],i+1);
    assert.deepEqual(loaded.fruitTreesState[key],state.fruitTreesState[key]);
    assert.deepEqual(loaded.productionState[key],state.productionState[key]);
    assert.equal(getFruitTreeVisual(id,loaded.productionState[key],now).stage,i%2?'withered':'seed');
  });
});

test('sức chứa Kho Tổng Hợp sống sót qua save/load', () => {
  store.clear();
  const state = getDefaultSaveState();
  state.storage = { warehouseCapacity: 825 };
  assert.equal(saveGameSave(state), true);

  const loaded = loadGameSave();
  assert.equal(loaded.storage.warehouseCapacity, 825);
});

test('aquatic decorations preserve their inland sea underlay through save/load', () => {
  store.clear();
  const state=getDefaultSaveState();
  state.terrainMap=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  state.terrainMap[20][20]='m30_sea_var2_coral_reef';
  state.grid[20][20]='a01_whale';
  assert.equal(saveGameSave(state),true);
  const loaded=loadGameSave();
  assert.equal(loaded.grid[20][20],'a01_whale');
  assert.equal(loaded.terrainMap[20][20],'m30_sea_var2_coral_reef');
});

test('pig ownership, feed cycle and meat survive save/load', () => {
  store.clear();
  const state = getDefaultSaveState();
  state.grid[20][20] = 'd33_pig_pen_barn';
  state.livestockState = { '20_20': { animalCount: 4, fedCount: 4, state: 'producing', feedTime: Date.now(), durationMs: 75000 } };
  state.resources.meat = 4;
  assert.equal(saveGameSave(state), true);
  const loaded = loadGameSave();
  assert.deepEqual(loaded.livestockState['20_20'], state.livestockState['20_20']);
  assert.equal(loaded.resources.meat, 4);
});

test('thành tựu đã nhận được lưu cùng save', () => {
  store.clear();
  const state = getDefaultSaveState();
  state.achievements = { ach_harvest_50: true };
  assert.equal(saveGameSave(state), true);

  const loaded = loadGameSave();
  assert.deepEqual(loaded.achievements, { ach_harvest_50: true });
});

test('migration thay Barn/Silo bằng Kho Tổng Hợp 2x2, không đụng Hầm rượu', () => {
  const grid = Array.from({ length: 32 }, () => Array(32).fill('d12_meadow_wildflowers'));
  grid[12][12] = 'b13_barn_silo';
  grid[12][18] = 'b12_general_store';
  grid[20][20] = 'b47_winery_press_barn_sw';

  migrateLegacyWarehouseLayout(grid);

  assert.equal(grid[12][12], 'b60_combined_warehouse');
  assert.equal(grid[12][18], 'd12_meadow_wildflowers');
  assert.equal(grid[20][20], 'b47_winery_press_barn_sw');
  assert.equal(grid[11][11], 'b60_combined_warehouse');
  assert.equal(grid[12][12], 'b60_combined_warehouse');
});

test('edge fences survive save/load independently of farmland in the same cell', () => {
  store.clear();
  const state = getDefaultSaveState();
  state.grid[20][20] = 'd13_farmland_plot';
  state.fences = [{ tileId: 'd34_wooden_fence_corner_upper', row: 20, col: 20, flipped: false }];
  assert.equal(saveGameSave(state), true);
  const loaded = loadGameSave();
  assert.deepEqual(loaded.fences, state.fences);
  assert.equal(loaded.grid[20][20], 'd13_farmland_plot');
});
