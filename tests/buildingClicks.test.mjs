import test from 'node:test';
import assert from 'node:assert/strict';
import { initInputHandler } from '../src/engine/inputHandler.js';
import { TILES_DATA } from '../src/data/tilesData.js';

function makeSurface() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(listener);
    },
    dispatch(type, event) {
      for (const listener of listeners.get(type) || []) listener(event);
    },
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    classList: { add() {}, remove() {} }
  };
}

function makeClickScene(t) {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const container = makeSurface();
  const windowSurface = makeSurface();
  globalThis.window = windowSurface;
  globalThis.document = { getElementById: () => null };
  t.after(() => {
    for (const [key, original] of [['window', originalWindow], ['document', originalDocument]]) {
      if (original) Object.defineProperty(globalThis, key, original);
      else delete globalThis[key];
    }
  });

  const grid = Array.from({ length: 32 }, () => Array(32).fill('d12_meadow_wildflowers'));
  const levels = {}, constructions = {}, events = [];
  const cell = { row: 20, col: 20 };
  const input = initInputHandler(container, {
    getCamera: () => ({ x: 0, y: 0, zoom: 1 }),
    screenToWorldCoords: (x, y) => ({ x, y }),
    worldToCell: () => cell,
    getActiveSeedBrush: () => null,
    getActiveBrush: () => null,
    getMovingBuilding: () => null,
    getCurrentGrid: () => grid,
    getGameMode: () => 'game',
    getLandUnlockedChunks: () => Array.from({ length: 64 }, (_, i) => i),
    getFarmlandState: () => ({}),
    getProductionState: () => ({}),
    getTileMap: () => Object.fromEntries(TILES_DATA.map(tile => [tile.id, tile])),
    getConstructions: () => constructions,
    getBuildingLevels: () => levels,
    getFlippedGrid: () => ({}),
    getVillagerManager: () => null,
    openFishingModal: () => events.push(['fishing']),
    openUpgradeModal: (row, col) => events.push(['upgrade', row, col]),
    openDefenseModal: (row,col) => events.push(['defense',row,col]),
    openConstructionSpeedupModal: (row, col) => events.push(['construction', row, col]),
    requestRender() {}
  });
  t.after(() => input.destroy());

  return {
    constructions,
    click(tileId, level = 1, pointerType = 'mouse') {
      grid[cell.row][cell.col] = tileId;
      levels['20_20'] = level;
      events.length = 0;
      const event = { clientX: 200, clientY: 200, button: 0, isPrimary: true, pointerId: 1, pointerType };
      container.dispatch('pointerdown', event);
      windowSurface.dispatch('pointerup', event);
      return [...events];
    }
  };
}

test('clicking the watermill opens upgrades instead of fishing at each upgradeable level', t => {
  const scene = makeClickScene(t);
  for (const pointerType of ['mouse', 'touch']) {
    for (const level of [1, 2]) {
      assert.deepEqual(scene.click('b05_watermill', level, pointerType), [['upgrade', 20, 20]]);
    }
  }
  scene.constructions['20_20'] = { tileId: 'b05_watermill' };
  assert.deepEqual(scene.click('b05_watermill'), [['construction', 20, 20]]);
});

test('water and pier scenery still opens fishing, while waterworks remain selectable buildings', t => {
  const scene = makeClickScene(t);
  for (const tileId of ['m04_stone_harbor_pier', 'l06_savanna_acacia_waterhole']) {
    assert.deepEqual(scene.click(tileId), [['fishing']]);
  }
  for (const tileId of ['b51_waterworks_pump_house_sw', 'b52_waterworks_pump_house_se']) {
    assert.deepEqual(scene.click(tileId), [['upgrade', 20, 20]]);
  }
});

test('a mouse or touch click on a finished watchtower opens defense, while construction keeps its existing action',t=>{
  const scene=makeClickScene(t);
  for(const pointerType of ['mouse','touch'])for(const level of [1,2,3])for(const tileId of ['b08_watchtower','b67_guard_barracks','b68_mage_academy'])
    assert.deepEqual(scene.click(tileId,level,pointerType),[['defense',20,20]]);
  scene.constructions['20_20']={tileId:'b08_watchtower'};
  assert.deepEqual(scene.click('b08_watchtower'),[['construction',20,20]]);
});
