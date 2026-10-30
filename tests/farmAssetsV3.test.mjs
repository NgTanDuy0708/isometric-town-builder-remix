import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { inspectPng } from '../scripts/inspectFarmAssets.mjs';
import { FARM_BUILDINGS } from '../src/data/farmSprites.js';
import { getBuildingRenderAdjustment, getBuildingAnimalSlots } from '../src/data/buildingSprites.js';
import { LIVESTOCK_RULES } from '../src/data/livestockConfig.js';

const manifest=JSON.parse(fs.readFileSync(new URL('../docs/generated-assets/farm-buildings-v4/manifest.json',import.meta.url)));
test('four new native transparent barn assets use uniform 2x1 scaling and measured front ground anchors',()=>{
  assert.equal(manifest.length,4);
  for(const entry of manifest) {
    const s=FARM_BUILDINGS[entry.id],a=getBuildingRenderAdjustment(entry.id);
    assert.match(s.uri,/_v4\.png$/);assert.equal(s.uri,entry.uri);
    const png=inspectPng(new URL(`../public${s.uri}`,import.meta.url));
    assert.equal(png.sha256,entry.sha256);assert.ok(png.transparentFraction>.5);
    assert.ok(png.bounds.minX>1&&png.bounds.minY>1&&png.bounds.maxX<png.width-2&&png.bounds.maxY<png.height-2,'No clipped silhouette');
    assert.deepEqual({x:s.anchorX,y:s.anchorY},entry.anchor);
    if(s.animalType!=='chicken')assert.deepEqual(entry.anchor,png.foot);
    assert.equal(a.dw/s.width,a.dh/s.height,'Uniform scaling preserves native shape');
    assert.ok(Math.abs(a.dw/s.width*s.visibleWidth-128)<1e-8);
    assert.ok(Math.abs(a.dx+s.anchorX*a.dw/s.width)<1e-8);
    assert.ok(Math.abs(a.dy+s.anchorY*a.dh/s.height-96)<1e-8);
    assert.equal(a.shearY,undefined);assert.equal(a.rotation,undefined);
    const slots=getBuildingAnimalSlots(entry.id);
    assert.equal(slots.length,LIVESTOCK_RULES[entry.id].maxAnimals);
    for(const [x,y] of s.animalSlots)assert.ok(Math.abs(x-64)/64+Math.abs(y-96)/32<1,'Animals remain in the front tile');
    assert.equal(s.gridFence,true,'The enclosure uses the exact tile perimeter');
  }
});

test('previous barn artwork is preserved while the game selects the newly generated versions',()=>{
  const original=JSON.parse(fs.readFileSync(new URL('./fixtures/original-asset-sha256.json',import.meta.url)));
  for(const s of Object.values(FARM_BUILDINGS)) {
    const uri=s.uri.replace('_v4.png','_v2.png');
    const png=fs.readFileSync(new URL(`../public${uri}`,import.meta.url));
    assert.equal(crypto.createHash('sha256').update(png).digest('hex'),original[uri]);
  }
});
