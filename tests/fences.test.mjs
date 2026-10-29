import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FENCE_ITEMS, getFenceSegments, isFenceTile, migrateGridFences, canAddFence } from '../src/data/fenceConfig.js';
import { buildFenceNetwork } from '../src/engine/fenceRenderer.js';
import { TILES_DATA } from '../src/data/tilesData.js';
import { AESTHETIC_TILE_URIS } from '../src/data/aestheticTileIcons.js';
import { getTileCost, getTileBuildDuration, getTileRequiredLevel } from '../src/data/gameEconomy.js';
import { getRotatedTileIdAndFlip } from '../src/engine/upgradeManager.js';
import { initInputHandler } from '../src/engine/inputHandler.js';

test('fence catalog sells exactly the three generated images at level 1 with instant placement', () => {
  const tiles = TILES_DATA.filter(t => isFenceTile(t.id));
  assert.equal(tiles.length, 3);
  assert.equal(new Set(TILES_DATA.map(t => t.id)).size, TILES_DATA.length);
  for (const item of FENCE_ITEMS) {
    const tile = tiles.find(t => t.id === item.id);
    assert.equal(tile.category, 'decoration');
    assert.equal(tile.shopCategory, 'fences');
    assert.equal(AESTHETIC_TILE_URIS[item.id], item.uri);
    assert.equal(getTileCost(item.id, tile.category), item.price);
    assert.equal(getTileBuildDuration(item.id, tile.category), 0);
    assert.equal(getTileRequiredLevel(item.id), 1);
    const png = readFileSync(new URL(`../public${item.uri}`, import.meta.url));
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20), png[25]], [1254, 1254, 6]);
  }
});

test('every rail follows a grid edge of exactly 64 by 32 pixels, for both corners and straight orientations', () => {
  const screen = ({ row, col }) => [(col - row) * 64 + 64, (row + col) * 32 + 64];
  for (const { id } of FENCE_ITEMS) for (const flipped of [false, true]) {
    for (const [from, to] of getFenceSegments(id, 20, 20, flipped)) {
      const a = screen(from), b = screen(to);
      assert.equal(Math.abs(b[0] - a[0]), 64);
      assert.equal(Math.abs(b[1] - a[1]), 32);
    }
  }
});

test('upper and lower corners join straight pieces in a closed enclosure without duplicated posts', () => {
  const [straight, upper, lower] = FENCE_ITEMS;
  const cells = [{ tileId: upper.id, row: 0, col: 0 }, { tileId: lower.id, row: 2, col: 2 },
    ...[[1,0,false],[2,0,false],[3,0,true],[3,1,true],[0,1,true],[0,2,true],[0,3,false],[1,3,false]]
      .map(([row,col,flipped]) => ({ tileId: straight.id, row, col, flipped }))];
  const network = buildFenceNetwork(cells);
  const posts = network.filter(p => p.kind === 'post');
  const rails = network.filter(p => p.kind === 'rails');
  assert.equal(posts.length, 12, 'One post per joint, instead of 22 overlapping posts');
  assert.equal(rails.length, 12);
  const degree = new Map(posts.map(p => [p.key, 0]));
  for (const edge of rails) for (const v of [edge.from, edge.to]) {
    const key = `${v.row}_${v.col}`;
    degree.set(key, degree.get(key) + 1);
  }
  assert.ok([...degree.values()].every(n => n === 2), 'No gaps or dangling ends in the enclosure');
});

test('shared rails and posts remain single and opaque when a neighbour or preview is faded', () => {
  const [straight, upper, lower] = FENCE_ITEMS;
  const network = buildFenceNetwork([
    { tileId: upper.id, row: 4, col: 4 },
    { tileId: straight.id, row: 4, col: 4, alpha: 0.35 },
    { tileId: lower.id, row: 3, col: 4, alpha: 0.7 }
  ]);
  assert.equal(network.filter(p => p.kind === 'rails').length, 3);
  assert.equal(network.filter(p => p.kind === 'post').length, 4);
  assert.equal(network.find(p => p.kind === 'post' && p.key === '5_4').alpha, 1);
});

test('rotation flips straight fences and switches the upper/lower corner sprites', () => {
  const [straight, upper, lower] = FENCE_ITEMS;
  assert.deepEqual(getRotatedTileIdAndFlip(straight.id, false), { nextId: straight.id, nextFlip: true });
  assert.deepEqual(getRotatedTileIdAndFlip(upper.id, false), { nextId: lower.id, nextFlip: false });
  assert.deepEqual(getRotatedTileIdAndFlip(lower.id, false), { nextId: upper.id, nextFlip: false });
});

function makePlacement(item, initialGold = 100) {
  globalThis.window = { addEventListener() {} };
  globalThis.document = { getElementById: () => null };
  if (!globalThis.navigator) globalThis.navigator = {};
  const grid = Array.from({ length: 32 }, () => Array(32).fill('d12_meadow_wildflowers'));
  const flipped = {}, constructions = {}, fences = [];
  let gold = initialGold, saves = 0, cell = { row: 20, col: 20 };
  const noop = () => {};
  const ctx = {
    getActiveBrush: () => item.id, getMovingBuilding: () => null,
    getHoverCell: () => cell, getConstructions: () => constructions,
    getFences: () => fences, getCurrentGrid: () => grid, getFlippedGrid: () => flipped,
    getTileMap: () => Object.fromEntries(TILES_DATA.map(t => [t.id, t])),
    getGameMode: () => 'game', getProductionState: () => ({}),
    getLandUnlockedChunks: () => Array.from({ length: 64 }, (_, i) => i),
    getPlayerGold: () => gold, deductGold: amount => { gold -= amount; },
    getBrushFlipped: () => false, updateGoldDisplay: noop,
    saveGameEconomyState: noop, pushUndo: noop, saveFlippedGrid: noop,
    updateVillageStatsUI: noop, checkQuestsProgress: noop, requestRender: noop,
    showToast: noop, triggerAutoSave: () => { saves++; }
  };
  const input = initInputHandler({ addEventListener() {} }, ctx);
  return { input, grid, constructions, fences, gold: () => gold, saves: () => saves,
    setCell: next => { cell = next; } };
}

test('buying/placing each fence charges its displayed price once and keeps the brush for another placement', () => {
  for (const item of FENCE_ITEMS) {
    const s = makePlacement(item, 200);
    assert.equal(s.input.confirmPlacement(), true);
    assert.equal(s.grid[20][20], 'd12_meadow_wildflowers');
    assert.equal(s.fences[0].tileId, item.id);
    assert.equal(s.gold(), 200 - item.price);
    assert.equal(s.saves(), 1);
    assert.deepEqual(s.constructions, {});
    assert.equal(s.input.confirmPlacement(), false, 'Cannot buy twice onto an occupied cell');
    assert.equal(s.gold(), 200 - item.price);
    s.setCell({ row: 20, col: 21 });
    assert.equal(s.input.confirmPlacement(), true);
    assert.equal(s.grid[20][21], 'd12_meadow_wildflowers');
    assert.equal(s.fences.length, 2);
    assert.equal(s.gold(), 200 - 2 * item.price);
    s.input.destroy();
  }
});

test('not enough gold leaves the fence cell and wallet unchanged', () => {
  const item = FENCE_ITEMS[1];
  const s = makePlacement(item, item.price - 1);
  assert.equal(s.input.confirmPlacement(), false);
  assert.equal(s.grid[20][20], 'd12_meadow_wildflowers');
  assert.equal(s.gold(), item.price - 1);
  assert.equal(s.saves(), 0);
  s.input.destroy();
});

test('legacy fences move off the grid, preserve orientation, and migrate only once', () => {
  const grid = Array.from({ length: 32 }, () => Array(32).fill('d12_meadow_wildflowers'));
  grid[20][20] = FENCE_ITEMS[0].id;
  const flipped = { '20_20': true };
  const fences = migrateGridFences(grid, flipped);
  assert.equal(fences.length, 1);
  assert.equal(fences[0].flipped, true);
  assert.equal(grid[20][20], 'd12_meadow_wildflowers');
  assert.deepEqual(flipped, {});
  assert.deepEqual(migrateGridFences(grid, flipped, fences), fences);
  grid[20][20] = 'd13_farmland_plot';
  assert.equal(fences.length, 1);
  assert.equal(canAddFence(fences, FENCE_ITEMS[0].id, 20, 20, true), false);
});
test('fences can be placed around an occupied crop tile without replacing it', () => {
  const s = makePlacement(FENCE_ITEMS[1], 200);
  s.grid[20][20] = 'd13_farmland_plot';
  assert.equal(s.input.confirmPlacement(), true);
  assert.equal(s.grid[20][20], 'd13_farmland_plot');
  assert.equal(s.fences.length, 1);
  s.input.destroy();
});
