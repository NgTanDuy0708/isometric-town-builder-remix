import test from 'node:test';
import assert from 'node:assert/strict';
import { LIVESTOCK_RULES, isLivestockTile } from '../src/data/livestockConfig.js';
import { RESOURCES_CONFIG, getWarehouseUsed, isBarnResource } from '../src/data/resourcesConfig.js';
import { FARM_BUILDINGS } from '../src/data/farmSprites.js';

test('pig pen follows cow care rules with four pigs producing meat', () => {
  const cow = LIVESTOCK_RULES.b22_cow_pasture;
  const pig = LIVESTOCK_RULES.d33_pig_pen_barn;
  assert.equal(isLivestockTile('d33_pig_pen_barn'), true);
  for (const key of ['feedRes', 'durationSec', 'baseAnimalPrice', 'priceStep', 'goldGain', 'xpGain']) assert.equal(pig[key], cow[key]);
  assert.equal(pig.maxAnimals, 4);
  assert.equal(pig.productRes, 'meat');
  assert.equal(FARM_BUILDINGS.d33_pig_pen_barn.animalSlots.length, 4);
});

test('meat takes warehouse space and has a market sale price', () => {
  assert.equal(isBarnResource('meat'), true);
  assert.equal(getWarehouseUsed({ corn: 4, meat: 4 }), 8);
  assert.equal(RESOURCES_CONFIG.meat.sellPrice, RESOURCES_CONFIG.milk.sellPrice);
});
