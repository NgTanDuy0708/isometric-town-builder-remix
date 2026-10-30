import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {SINGLE_SEED_ART} from '../src/data/singleSeedSpriteData.js';
import {SOWN_CROP_IDS,SOWN_CROP_SPRITES,getSownCropRenderAdjustment} from '../src/data/cropVisuals.js';
import {getCropGrowthRenderAdjustment} from '../src/data/cropGrowthSprites.js';
import {CROP_GROWTH_GEOMETRY} from '../src/data/cropGrowthGeometry.js';
import {EXPANSION_PLANTS} from '../src/data/fruitTreeSprites.js';
import {inspectPng} from '../scripts/pngMetadata.mjs';

test('all 19 replacement seeds preserve the native PNG and genuine transparent padding',()=>{
  assert.equal(Object.keys(SINGLE_SEED_ART).length,19);
  for(const [id,asset] of Object.entries(SINGLE_SEED_ART)){
    const bytes=fs.readFileSync(new URL('../public'+asset.uri,import.meta.url));
    const filename=asset.uri.split('/').at(-1).split('?')[0];
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,id);
    assert.deepEqual(bytes,fs.readFileSync(new URL('../assets-source/seeds/single-v1/'+filename,import.meta.url)));
    const meta=inspectPng(bytes);
    assert.deepEqual([meta.alphaMin,meta.alphaMax],[0,255]);
    assert.deepEqual(meta.opaqueBounds,asset.bounds);
    const [left,top,right,bottom]=asset.bounds;
    assert.ok(left>0&&top>0&&right<meta.width&&bottom<meta.height,id+' is unclipped');
  }
});

test('every crop uses one small seed at the same root anchor as its later sprout',()=>{
  for(const id of SOWN_CROP_IDS){
    assert.equal(SOWN_CROP_SPRITES[id],SINGLE_SEED_ART[id].uri);
    const a=getSownCropRenderAdjustment(id),g=SINGLE_SEED_ART[id],scale=a.dw/g.width;
    assert.ok(Math.abs(a.dx+g.anchor.x*scale-64)<1e-8);
    assert.ok(Math.abs(a.dy+g.anchor.y*scale-96)<1e-8);
    assert.ok((g.bounds[2]-g.bounds[0])*scale<=18.000001,id+' seed fits within centre of one tile');
    assert.ok((g.bounds[3]-g.bounds[1])*scale<=12.000001);
    const sprout=CROP_GROWTH_GEOMETRY[id].sprout,rect=getCropGrowthRenderAdjustment(id,'sprout');
    assert.ok(Math.abs(rect.dx+sprout.anchor.x*rect.dw/sprout.width-64)<1e-8);
    assert.ok(Math.abs(rect.dy+sprout.anchor.y*rect.dh/sprout.height-96)<1e-8);
  }
  assert.equal(EXPANSION_PLANTS.d37_blueberry_bush.stages.seed,SINGLE_SEED_ART.blueberry_bush.uri);
  assert.equal(getSownCropRenderAdjustment('unknown'),undefined);
});
