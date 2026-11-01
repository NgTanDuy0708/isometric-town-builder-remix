import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {inspectPng} from '../scripts/pngMetadata.mjs';
import {CONSTRUCTION_ART as art,getConstructionRenderAdjustment} from '../src/data/constructionArt.js';

test('shared scaffold preserves the native transparent PNG and its measured foot anchor',()=>{
  const bytes=readFileSync(new URL('../public'+art.uri,import.meta.url)),png=inspectPng(bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),art.sha256);
  assert.deepEqual([png.width,png.height],[art.width,art.height]);
  assert.equal(png.alphaMin,0);assert.equal(png.alphaMax,255);
  assert.ok(art.bounds[0]>0&&art.bounds[1]>0&&art.bounds[2]<art.width&&art.bounds[3]<art.height);
  for(const id of ['b01_cottage_red','b03_blacksmith_forge','b60_combined_warehouse','b22_cow_pasture'])for(const flip of [false,true]){
    const rect=getConstructionRenderAdjustment(id,flip),scale=rect.dw/art.width;
    assert.ok(Math.abs(scale-rect.dh/art.height)<1e-12,'Never stretch the common scaffold');
    assert.ok(Math.abs(rect.dx+art.anchorX*scale-rect.worldX)<1e-8);
    assert.ok(Math.abs(rect.dy+art.anchorY*scale-rect.worldY)<1e-8);
  }
});

test('multi-cell sites use one scaffold and stay centred on their occupied cells',()=>{
  const single=getConstructionRenderAdjustment('b01_cottage_red'),warehouse=getConstructionRenderAdjustment('b60_combined_warehouse');
  assert.equal(warehouse.dw,single.dw*2);assert.equal(warehouse.dh,single.dh*2);
  const pen=getConstructionRenderAdjustment('b22_cow_pasture'),flipped=getConstructionRenderAdjustment('b22_cow_pasture',true);
  assert.deepEqual([pen.worldX,pen.worldY],[32,112]);assert.deepEqual([flipped.worldX,flipped.worldY],[96,112]);
  assert.equal(pen.dw,single.dw);assert.equal(flipped.dw,single.dw);
});
