import test from 'node:test';
import assert from 'node:assert/strict';
import { createProductionManager } from '../src/engine/productionManager.js';

function makeCtx() {
  const grid = Array.from({ length: 32 }, () => Array(32).fill('d12_meadow_wildflowers'));
  grid[5][5] = 'b06_bakery';
  grid[6][6] = 'b02_tudor_inn';
  grid[7][7] = 'd21_apple_tree';
  grid[8][8] = 'b21_chicken_coop';
  grid[9][9] = 'd33_pig_pen_barn';

  const resources = { wheat: 0, bread: 0 };
  const levels = {};
  const events = [];
  const state = {};

  const ctx = {
    getCurrentGrid: () => grid,
    getBuildingLevels: () => levels,
    getPlayerResources: () => resources,
    getFruitTreesState: () => ({}),
    getWarehouseCapacity: () => 300,
    getGoldMultiplier: () => 1,
    getXpMultiplier: () => 1,
    updateResourcesUI: () => {},
    persistGameState: () => {},
    requestRender: () => {},
    addPlayerGold: (amt) => events.push({ type: 'gold', amt }),
    addPlayerXP: (amt) => events.push({ type: 'xp', amt }),
    incrementHarvestCount: () => {},
    checkQuestsProgress: () => {},
    showStorageFullModal: () => events.push({ type: 'storageFull' }),
    showToast: () => {},
    addFloatingText: () => {},
    spawnFlyingProduce: () => {},
    spawnFlyingCoin: () => {},
    spawnFlyingXP: () => {},
    playCoinSound: () => {},
    playLoomWeaveSound: () => {},
    harvestLivestockCell: () => { events.push({ type: 'livestock' }); return true; },
    harvestFruitTreeCell: () => { events.push({ type: 'fruit' }); return true; }
  };

  return { ctx, grid, resources, levels, events, state };
}

test('scanGrid tạo entry cho công trình sản xuất, bỏ qua chuồng trại', () => {
  const { ctx, state } = makeCtx();
  const mgr = createProductionManager(ctx);
  mgr.init(state);
  mgr.scanGrid(1000);
  const s = mgr.getState();
  assert.ok(s['5_5']);
  assert.ok(s['6_6']);
  assert.ok(s['7_7']);
  assert.equal(s['8_8'], undefined);
  assert.equal(s['9_9'], undefined);
});

test('pig harvest uses the livestock path rather than automatic factory output', () => {
  const { ctx, state, events } = makeCtx();
  const manager = createProductionManager(ctx);
  manager.init(state);
  assert.equal(manager.harvest(9, 9), true);
  assert.deepEqual(events, [{ type: 'livestock' }]);
});

test('thiếu nguyên liệu -> paused, có nguyên liệu -> tự chạy lại', () => {
  const { ctx, resources, state } = makeCtx();
  const mgr = createProductionManager(ctx);
  mgr.init(state);
  mgr.scanGrid(1000);

  mgr.update(61000);
  assert.equal(state['5_5'].paused, true);
  assert.equal(state['5_5'].pauseReason, 'missing_wheat');
  assert.equal(state['5_5'].ready, false);

  resources.wheat = 5;
  const fed = mgr.feedPausedWorkshops(120000);
  assert.equal(fed, 1);
  assert.equal(state['5_5'].paused, false);
  assert.equal(resources.wheat, 4);

  mgr.update(120000 + 60000);
  assert.equal(state['5_5'].ready, true);
  assert.equal(resources.wheat, 3);
});

test('thu hoạch áp dụng vàng theo cấp nâng cấp', () => {
  const { ctx, resources, levels, events, state } = makeCtx();
  const mgr = createProductionManager(ctx);
  mgr.init(state);
  mgr.scanGrid(1000);
  resources.wheat = 10;
  state['5_5'] = { lastHarvest: 0, ready: true };

  assert.equal(mgr.harvest(5, 5), true);
  assert.equal(resources.bread, 1);
  assert.equal(events.filter(e => e.type === 'gold').at(-1).amt, 45);

  levels['5_5'] = 2;
  state['5_5'] = { lastHarvest: 0, ready: true };
  assert.equal(mgr.harvest(5, 5), true);
  assert.equal(events.filter(e => e.type === 'gold').at(-1).amt, 65);
});

test('kho đầy vẫn thu được công trình chỉ sinh vàng', () => {
  const { ctx, resources, state } = makeCtx();
  const mgr = createProductionManager(ctx);
  mgr.init(state);
  mgr.scanGrid(1000);
  resources.bread = 300;
  state['6_6'] = { lastHarvest: 0, ready: true };
  assert.equal(mgr.harvest(6, 6), true);
});

test('cây ăn quả và chuồng trại được chuyển đúng manager', () => {
  const { ctx, state } = makeCtx();
  const mgr = createProductionManager(ctx);
  mgr.init(state);
  mgr.scanGrid(1000);
  assert.equal(mgr.harvest(7, 7), true);
  assert.equal(mgr.harvest(8, 8), true);
});

test('update() mặc định dùng Date.now, khớp với lastHarvest', () => {
  const { ctx, resources, state } = makeCtx();
  const mgr = createProductionManager(ctx);
  mgr.init(state);
  mgr.scanGrid();
  state['5_5'] = { lastHarvest: Date.now() - 61000, ready: false };

  mgr.update(); // không truyền tham số -> phải dùng Date.now()
  assert.equal(state['5_5'].paused, true);
  assert.equal(state['5_5'].pauseReason, 'missing_wheat');

  resources.wheat = 5;
  mgr.feedPausedWorkshops();
  assert.equal(state['5_5'].paused, false);
  assert.equal(resources.wheat, 4);

  state['5_5'].lastHarvest = Date.now() - 61000;
  mgr.update();
  assert.equal(state['5_5'].ready, true);
  assert.equal(resources.wheat, 3);
});
