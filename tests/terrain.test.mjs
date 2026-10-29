import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createStarterTownMap32, applyTownCenterLayout, isProtectedTile } from '../src/data/starterMap.js';
import { applyCoastTerrainLayout, getBaseTerrainTile, TERRAIN_SPRITES } from '../src/data/terrainConfig.js';
import { drawTerrainTile } from '../src/engine/terrainRenderer.js';

test('old town hall forecourt becomes buildable grass without removing player buildings', () => {
  const grid = createStarterTownMap32();
  for (let r = 15; r <= 17; r++) for (let c = 14; c <= 16; c++) {
    assert.equal(grid[r][c], 'd12_meadow_wildflowers');
    grid[r][c] = 'd01_plaza_fountain';
  }
  grid[15][14] = 'b01_cottage_red';
  applyTownCenterLayout(grid);
  for (let r = 15; r <= 17; r++) for (let c = 14; c <= 16; c++) {
    assert.equal(grid[r][c], r === 15 && c === 14 ? 'b01_cottage_red' : 'd12_meadow_wildflowers');
    assert.equal(isProtectedTile(r, c, grid[r][c]), false);
  }
  assert.equal(grid[13][15], 'b14_town_hall');
  assert.equal(isProtectedTile(13, 15, grid[13][15]), true);
  const once = structuredClone(grid);
  applyTownCenterLayout(grid);
  assert.deepEqual(grid, once);
});

test('new maps and legacy terrain use sea 0..3, shore 4 and sand 5..6 on every row', () => {
  const fresh = createStarterTownMap32();
  const legacy = Array.from({ length: 32 }, () => Array.from({ length: 32 }, (_, c) =>
    c <= 3 ? 'm30_sea_var2_coral_reef' : c <= 5 ? 's13_sand_ground' : 'd12_meadow_wildflowers'));
  legacy[8][6] = 'b06_bakery';
  legacy[9][5] = 'd13_farmland_plot';
  legacy[10][4] = 'r03_royal_marble_pavement';
  const before = structuredClone(legacy);
  applyCoastTerrainLayout(legacy);
  for (let r = 0; r < 32; r++) for (let c = 0; c <= 6; c++) {
    assert.equal(fresh[r][c], getBaseTerrainTile(c), `[${r},${c}]`);
    if (![[8,6], [9,5], [10,4]].some(([rr,cc]) => r === rr && c === cc)) {
      assert.equal(legacy[r][c], fresh[r][c]);
    } else assert.equal(legacy[r][c], before[r][c], 'Preserve occupied cells');
  }
  assert.equal(legacy[8][7], before[8][7]);
  const once = structuredClone(legacy);
  applyCoastTerrainLayout(legacy);
  assert.deepEqual(legacy, once);
});

test('seam overlap stays one device pixel at fractional zoom and on mirrored shore tiles', () => {
  for (const scale of [0.3, 0.65, 1, 1.7, 3.4]) for (const flipped of [false, true]) {
    const events = [];
    const ctx = new Proxy({}, { get(_, key) {
      if (key === 'getTransform') return () => ({ a: scale, b: 0 });
      return (...args) => { events.push([key, ...args]); };
    } });
    drawTerrainTile(ctx, { complete: true, naturalWidth: 1774, naturalHeight: 887 },
      'm01_sandy_beach_s', 100, 200, flipped);
    const ox = flipped ? 0 : 100, oy = flipped ? 0 : 200;
    const top = events.find(([key]) => key === 'moveTo');
    assert.ok(Math.abs((oy + 64 - top[2]) * scale - 0.5) < 1e-10);
    const right = events.find(([key]) => key === 'lineTo');
    assert.ok(Math.abs((right[1] - ox - 128) * scale - 1) < 1e-10);
    if (flipped) assert.ok(events.some(([key, x, y]) => key === 'scale' && x === -1 && y === 1));
  }
});

test('terrain overscans source fringes and overlaps diamond edges without a sand undercoat', () => {
  for (const [kind, terrain] of Object.entries(TERRAIN_SPRITES)) {
    const png = readFileSync(new URL(`../public${terrain.uri}`, import.meta.url));
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    assert.ok(width >= 1254 && height >= 887, 'Retain native source resolution');
    const [x,y,w,h] = terrain.source;
    assert.ok(x >= 0 && y >= 0 && x+w <= width && y+h <= height);
    const events = [];
    const state = { imageSmoothingEnabled: false, imageSmoothingQuality: 'low', fillStyle: '#000' };
    let saved;
    const context = new Proxy(state, { get(target, key) {
      if (key in target) return target[key];
      if (key === 'save') return () => { saved = { ...target }; };
      if (key === 'restore') return () => Object.assign(target, saved);
      return (...args) => events.push([key, ...args]);
    } });
    const image = { complete: true, naturalWidth: width, naturalHeight: height };
    const id = { grass: 'd12_meadow_wildflowers', sea: 'm30_sea_var2_coral_reef', shore: 'm01_sandy_beach_s', sand: 's13_sand_ground' }[kind];
    drawTerrainTile(context, image, id, 100, 200);
    assert.deepEqual(events.filter(([key]) => ['moveTo','lineTo'].includes(key)),
      [['moveTo',164,263.5], ['lineTo',229,296], ['lineTo',164,328.5], ['lineTo',99,296]]);
    assert.ok(events.findIndex(([key]) => key === 'clip') < events.findIndex(([key]) => key === 'drawImage'));
    assert.deepEqual(events.find(([key]) => key === 'drawImage'), ['drawImage', image, ...terrain.source, 95, 261.5, 138, 69]);
    assert.equal(events.some(([key]) => key === 'fill'), false, 'Loaded images must not expose a solid colour along transparent source edges');
    assert.deepEqual(state, saved);
  }
});
