import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { TILES_DATA } from '../src/data/tilesData.js';
import { getShopCategory } from '../src/data/shopCatalog.js';
import { BUILDING_SOURCE_GEOMETRY, getBuildingRenderAdjustment, getBuildingSpriteUri } from '../src/data/buildingSprites.js';
import { getRecipesForBuilding } from '../src/data/productionRecipes.js';
import { getNextUpgrade } from '../src/data/upgradesConfig.js';
import { createProductionManager } from '../src/engine/productionManager.js';
import { createStarterTownMap32 } from '../src/data/starterMap.js';
import { getResourceUnlockLevel, RESOURCE_PRODUCERS } from '../src/data/orderBoardConfig.js';

const id = 'b64_bbq_restaurant';
test('barbecue restaurant is one shop building with three native transparent assets and a common ground pivot', () => {
  const entries=TILES_DATA.filter(t=>t.id===id);
  assert.equal(entries.length,1);assert.equal(getShopCategory(entries[0]),'production');
  const manifest=JSON.parse(fs.readFileSync(new URL('../docs/generated-assets/restaurant/manifest.json',import.meta.url)));
  for(const level of [1,2,3]) {
    const uri=getBuildingSpriteUri(id,level),native=fs.readFileSync(new URL(`../public${uri}`,import.meta.url));
    assert.equal(native[25],6);assert.equal(native.readUInt32BE(16),1254);assert.equal(native.readUInt32BE(20),1254);
    assert.equal(crypto.createHash('sha256').update(native).digest('hex'),manifest[level-1].sha256);
    const source=fs.readFileSync(new URL(`../assets-source/restaurant/bbq_restaurant_lv${level}.png`,import.meta.url));
    assert.deepEqual(native,source);assert.ok(manifest[level-1].transparentFraction>.4);
    const g=BUILDING_SOURCE_GEOMETRY[id][level],a=getBuildingRenderAdjustment(id,level);
    assert.ok(Math.abs(a.dx+g.anchorX*a.dw/g.width-64)<1e-8);
    assert.ok(Math.abs(a.dy+g.anchorY*a.dh/g.height-128)<1e-8);
    if(level<3) assert.equal(getNextUpgrade(id,level).nextLevel,level+1);
  }
  assert.equal(getNextUpgrade(id,3),null);
});

function scene(tile=id,resources={meat:2,carrot:1,roastPork:0}) {
  const grid=createStarterTownMap32();grid[20][20]=tile;
  const manager=createProductionManager({getCurrentGrid:()=>grid,getBuildingLevels:()=>({}),getPlayerResources:()=>resources,
    getPlayerLevel:()=>5,getWarehouseCapacity:()=>300,persistGameState(){}});
  manager.scanGrid();return {manager,resources};
}

test('roast pork is exclusive to the restaurant; an idle restaurant never generates free products or gold', () => {
  assert.deepEqual(getRecipesForBuilding('b02_tudor_inn'),[]);
  assert.equal(getRecipesForBuilding(id)[0].id,'roastPork');
  assert.equal(RESOURCE_PRODUCERS.roastPork,id);assert.equal(getResourceUnlockLevel('roastPork'),5);
  const s=scene();s.manager.update(Date.now()+86400000);
  assert.equal(s.manager.getState()['20_20'].ready,false);assert.equal(s.manager.harvest(20,20,true),false);
  assert.equal(s.resources.meat,2);
  assert.equal(s.manager.enqueue(20,20,'roastPork').ok,true);assert.equal(s.resources.meat,0);
  assert.equal(s.manager.resumeAutomatic(20,20),false);
  const inn=scene('b02_tudor_inn');assert.equal(inn.manager.enqueue(20,20,'roastPork').ok,false);
});

test('old inn cooking stops immediately and reserved ingredients remain claimable without being lost', () => {
  const s=scene('b02_tudor_inn',{meat:0,carrot:0,roastPork:0});
  s.manager.setState({'20_20':{queueMode:true,ready:false,lastHarvest:Date.now(),
    activeBatch:{recipeId:'roastPork',inputs:{meat:2,carrot:1},startedAt:Date.now(),durationMs:90000},
    queue:[{recipeId:'roastPork',inputs:{meat:2,carrot:1}}],completedBatches:[]}});
  s.manager.update();
  const p=s.manager.getState()['20_20'];assert.equal(p.activeBatch,null);assert.equal(p.queue.length,0);
  assert.equal(p.completedBatches.length,2);
  assert.equal(s.manager.harvest(20,20,true),true);assert.equal(s.manager.harvest(20,20,true),true);
  assert.equal(s.resources.meat,4);assert.equal(s.resources.carrot,2);assert.equal(s.resources.roastPork,0);
  assert.equal(p.queueMode,undefined);assert.equal(p.ready,false);
});
