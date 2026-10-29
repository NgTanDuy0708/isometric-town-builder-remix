import test from 'node:test';
import assert from 'node:assert/strict';
import { createFarmToolsManager } from '../src/engine/farmTools.js';
import { CROPS_CONFIG } from '../src/data/cropsConfig.js';
import { SOWN_CROP_IDS } from '../src/data/cropVisuals.js';
import { getWarehouseUsed } from '../src/data/resourcesConfig.js';

test('each sowing sprite crop can be planted, saved and harvested into warehouse inventory', () => {
  globalThis.document = { getElementById: () => null };
  globalThis.window = {};
  const noop = () => {};
  for (const id of SOWN_CROP_IDS) {
    const crop = CROPS_CONFIG[id];
    const grid = Array.from({ length: 32 }, () => Array(32).fill('d12_meadow_wildflowers'));
    grid[20][20] = 'd13_farmland_plot';
    const farms = {}, resources = {};
    let gold = 1000, saves = 0;
    const tools = createFarmToolsManager({
      getCurrentGrid: () => grid, getGameMode: () => 'sandbox', getFarmlandState: () => farms,
      getPlayerGold: () => gold, deductGold: amount => { gold -= amount; },
      getPlayerResources: () => resources, getWarehouseCapacity: () => 300,
      persistGameState: () => saves++, showToast: noop, addPlayerXP: noop,
      updateGoldDisplay: noop, addFloatingText: noop, requestRender: noop,
      incrementHarvestCount: noop, updateResourcesUI: noop, saveGameEconomyState: noop,
      checkQuestsProgress: noop
    });
    tools.activateBulkSeedBrush(crop);
    tools.tryApplySeedBrush(20, 20);
    assert.equal(gold, 1000 - crop.seedCost);
    assert.equal(farms['20_20'].seedId, id);
    assert.equal(farms['20_20'].growDurationMs, crop.growTimeSec * 1000);
    assert.equal(saves, 1);
    tools.tryApplySeedBrush(20, 20);
    assert.equal(gold, 1000 - crop.seedCost, 'No second charge on occupied farmland');
    assert.equal(tools.harvestCropCell(20, 20, true), false, 'Seeds cannot be harvested early');
    farms['20_20'].plantTime -= crop.growTimeSec * 1000 + 1;
    assert.equal(tools.harvestCropCell(20, 20, true), true);
    assert.equal(resources[id], crop.harvestYield);
    assert.equal(getWarehouseUsed(resources), crop.harvestYield);
    assert.equal(farms['20_20'], undefined);
    assert.equal(saves, 2);
    tools.destroy();
  }
});
