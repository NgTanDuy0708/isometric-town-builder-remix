import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {IRON_MINE_ART} from '../src/data/ironMineArtData.js';
import {getBuildingSpriteUri,getBuildingRenderAdjustment,BUILDING_SOURCE_GEOMETRY} from '../src/data/buildingSprites.js';
import {AESTHETIC_TILE_URIS} from '../src/data/aestheticTileIcons.js';
import {TILES_DATA} from '../src/data/tilesData.js';
import {getShopCategory} from '../src/data/shopCatalog.js';
import {EXTRACTION_WORKSHOPS,EXTRACTION_NODES,getWorkerSlots} from '../src/data/extractionConfig.js';
import {getNextUpgrade} from '../src/data/upgradesConfig.js';
import {inspectPng} from '../scripts/pngMetadata.mjs';

test('iron mine levels and its ore node use four native unclipped transparent PNGs',()=>{
  assert.equal(Object.keys(IRON_MINE_ART).length,4);
  for(const [id,asset] of Object.entries(IRON_MINE_ART)){
    const bytes=fs.readFileSync(new URL('../public'+asset.uri,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,id);
    assert.deepEqual(bytes,fs.readFileSync(new URL('../assets-source/iron-mine/'+id+'.png',import.meta.url)));
    const metadata=inspectPng(bytes,{measureFoot:true});
    assert.deepEqual(metadata,((({uri,sha256,...value})=>value)(asset)));
    assert.deepEqual([metadata.alphaMin,metadata.alphaMax],[0,255]);
    const [left,top,right,bottom]=metadata.opaqueBounds;
    assert.ok(left>0&&top>0&&right<metadata.width&&bottom<metadata.height,id+' is not clipped');
  }
});

test('three mine upgrades share a grounded pivot and remain one production shop item',()=>{
  const id='b66_iron_mine',entries=TILES_DATA.filter(tile=>tile.id===id);
  assert.equal(entries.length,1);assert.equal(getShopCategory(entries[0]),'production');
  assert.equal(AESTHETIC_TILE_URIS[id],getBuildingSpriteUri(id,1));
  assert.equal(new Set([1,2,3].map(level=>getBuildingSpriteUri(id,level))).size,3);
  for(const level of [1,2,3]){
    const uri=getBuildingSpriteUri(id,level);
    assert.equal(uri,IRON_MINE_ART['iron_mine_lv'+level].uri);
    const frame=BUILDING_SOURCE_GEOMETRY[id][level],rect=getBuildingRenderAdjustment(id,level);
    const scale=rect.dw/frame.width;
    assert.ok(Math.abs(rect.dx+frame.anchorX*scale-64)<1e-8);
    assert.ok(Math.abs(rect.dy+frame.anchorY*scale-128)<1e-8);
    assert.ok(Math.abs(rect.dw/rect.dh-frame.width/frame.height)<1e-8,'No stretching');
    assert.equal(getWorkerSlots(level),level+1);
    if(level<3)assert.equal(getNextUpgrade(id,level).nextLevel,level+1);
  }
  assert.equal(getNextUpgrade(id,3),null);
  assert.equal(EXTRACTION_WORKSHOPS[id].node,'n03_iron_deposit');
  assert.equal(EXTRACTION_NODES.n03_iron_deposit.resource,'ironOre');
  assert.equal(AESTHETIC_TILE_URIS.n03_iron_deposit,IRON_MINE_ART.iron_deposit.uri);
  const frame=BUILDING_SOURCE_GEOMETRY.n03_iron_deposit[1],rect=getBuildingRenderAdjustment('n03_iron_deposit');
  assert.ok(Math.abs(rect.dx+frame.anchorX*rect.dw/frame.width-64)<1e-8);
  assert.ok(Math.abs(rect.dy+frame.anchorY*rect.dh/frame.height-128)<1e-8);
});
