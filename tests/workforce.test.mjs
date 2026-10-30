import test from 'node:test';
import assert from 'node:assert/strict';
import { getWorkforce, checkFarmWorkforce, checkHousingRemoval } from '../src/engine/workforce.js';
import { getTilePopulation } from '../src/data/gameEconomy.js';
import { getBuildingLevelPopulation } from '../src/data/upgradesConfig.js';
import { TILES_DATA } from '../src/data/tilesData.js';
import { initInputHandler } from '../src/engine/inputHandler.js';
import { createStarterTownMap32 } from '../src/data/starterMap.js';
import { getDefaultSaveState, saveGameSave, loadGameSave } from '../src/engine/storage.js';

const catalog = Object.fromEntries(TILES_DATA.map(t => [t.id, t]));
const emptyGrid = () => Array.from({ length: 32 }, () => Array(32).fill('d12_meadow_wildflowers'));

test('only completed homes create workers; upgrades count after completion', () => {
  const grid = createStarterTownMap32();
  assert.equal(getWorkforce(grid).total, 0, 'town hall grants no workforce');
  grid[20][20] = 'b01_cottage_red';
  grid[21][20] = 'b04_windmill';
  grid[22][20] = 'b60_combined_warehouse';
  assert.equal(getWorkforce(grid, {}, catalog).total, 4);
  assert.equal(getWorkforce(grid, { '20_20': { targetTileId: 'b01_cottage_red' } }, catalog).total, 0);
  assert.equal(getWorkforce(grid, {}, catalog, { '20_20': 2 }).total, 8);
  assert.equal(getTilePopulation('b04_windmill'), 0);
  assert.equal(getBuildingLevelPopulation('b04_windmill', 3), 0);
});

test('empty, growing and harvested plots keep their assignment; old excess plots survive', () => {
  const grid = emptyGrid(); grid[20][20] = 'b01_cottage_red';
  for (let c = 0; c < 5; c++) grid[22][c] = 'd13_farmland_plot';
  const labor = getWorkforce(grid, {}, catalog);
  assert.deepEqual(labor, { total: 4, farmers: 5, workers: 0, soldiers: 0, free: 0, shortage: 1 });
  assert.equal(checkFarmWorkforce(grid, {}, catalog).allowed, false);
  assert.equal(grid[22].filter(id => id === 'd13_farmland_plot').length, 5);
  grid[22][0] = grid[22][1] = 'd12_meadow_wildflowers';
  assert.equal(checkFarmWorkforce(grid, {}, catalog).free, 1);
  assert.equal(checkHousingRemoval(grid, 20, 20, {}, catalog).allowed, false);
  grid[20][21] = 'b01_cottage_red';
  assert.equal(checkHousingRemoval(grid, 20, 20, {}, catalog).allowed, true);
});

function placement(t) {
  const originals = Object.fromEntries(['window', 'document'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  globalThis.window = { addEventListener() {} };
  globalThis.document = { getElementById: () => null };
  const grid = emptyGrid(); grid[10][10] = 'b01_cottage_red';
  const levels = {}, constructions = {}, farmland = {}, flipped = {}, messages = [];
  let gold = 500, cell = { row: 20, col: 20 }, moving = null, saves = 0;
  const noop = () => {};
  const ctx = {
    getActiveBrush: () => moving ? null : 'd13_farmland_plot', getMovingBuilding: () => moving,
    setMovingBuilding: value => { moving = value; },
    getHoverCell: () => cell, getConstructions: () => constructions,
    getCurrentGrid: () => grid, getFlippedGrid: () => flipped, getBuildingLevels: () => levels,
    getFarmlandState: () => farmland, getTileMap: () => catalog,
    getGameMode: () => 'game', getProductionState: () => ({}),
    getLandUnlockedChunks: () => Array.from({ length: 64 }, (_, i) => i),
    getPlayerGold: () => gold, deductGold: amount => { gold -= amount; },
    getBrushFlipped: () => false, updateGoldDisplay: noop, saveGameEconomyState: noop,
    pushUndo: noop, saveFlippedGrid: noop, updateVillageStatsUI: noop,
    checkQuestsProgress: noop, requestRender: noop, persistGameState: noop,
    showToast: message => messages.push(message), triggerAutoSave: () => { saves++; }
  };
  const input = initInputHandler({ addEventListener() {} }, ctx);
  t.after(() => { input.destroy(); for (const [key, descriptor] of Object.entries(originals)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  } });
  return { grid, levels, farmland, constructions, input, messages, gold: () => gold, saves: () => saves,
    at: col => { cell = { row: 20, col }; }, move: value => { moving = value; } };
}

test('real placement buys four plots, rejects the fifth without charging, and upgraded homes unlock more', t => {
  const s = placement(t);
  for (let c = 20; c < 24; c++) { s.at(c); assert.equal(s.input.confirmPlacement(), true); }
  assert.equal(s.gold(), 440);
  s.at(24); assert.equal(s.input.confirmPlacement(), false);
  assert.equal(s.gold(), 440); assert.equal(s.saves(), 4);
  assert.match(s.messages.at(-1), /Hết dân rảnh/);
  s.grid[20][20] = 'd12_meadow_wildflowers';
  assert.equal(s.input.confirmPlacement(), true, 'Removing one plot releases exactly one worker');
  s.at(25); assert.equal(s.input.confirmPlacement(), false);
  s.levels['10_10'] = 2;
  assert.equal(s.input.confirmPlacement(), true);
  assert.equal(getWorkforce(s.grid, {}, catalog, s.levels).free, 3);
});

test('invalid placement never reserves a worker and moving a growing plot keeps one assignment', t => {
  const s = placement(t);
  s.grid[20][20] = 'b01_cottage_red';
  assert.equal(s.input.confirmPlacement(), false);
  assert.equal(s.gold(), 500); assert.equal(getWorkforce(s.grid).farmers, 0);
  s.at(21); assert.equal(s.input.confirmPlacement(), true);
  s.farmland['20_21'] = { seedId: 'wheat', plantTime: 1234 };
  const before = getWorkforce(s.grid, {}, catalog);
  s.move({ fromRow: 20, fromCol: 21, tileId: 'd13_farmland_plot', level: 1 });
  s.at(22); assert.equal(s.input.confirmPlacement(), true);
  assert.deepEqual(getWorkforce(s.grid, {}, catalog), before);
  assert.equal(s.farmland['20_22'].plantTime, 1234);
  assert.equal(s.farmland['20_21'], undefined);
});

test('save/load derives the same assignments without new persisted counters', t => {
  const prior = Object.getOwnPropertyDescriptor(globalThis, 'localStorage'); const store = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => store.get(key) ?? null, setItem: (key,value) => store.set(key, String(value)),
    removeItem: key => store.delete(key), key: i => [...store.keys()][i], get length() { return store.size; }
  } });
  t.after(() => { if (prior) Object.defineProperty(globalThis, 'localStorage', prior); else delete globalThis.localStorage; });
  const state = getDefaultSaveState(); state.grid[20][20] = 'b01_cottage_red';
  for (let c = 10; c < 16; c++) state.grid[22][c] = 'd13_farmland_plot';
  state.farmlandState['22_10'] = { seedId: 'wheat', plantTime: 100, growDurationMs: 25000 };
  const before = getWorkforce(state.grid, state.constructions, catalog, state.buildingLevels);
  assert.equal(before.shortage, 2); assert.equal(saveGameSave(state), true);
  const loaded = loadGameSave();
  assert.deepEqual(getWorkforce(loaded.grid, loaded.constructions, catalog, loaded.buildingLevels), before);
  assert.deepEqual(loaded.farmlandState, state.farmlandState);
});
