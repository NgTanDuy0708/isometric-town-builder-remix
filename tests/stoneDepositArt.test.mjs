import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {STONE_DEPOSIT_ART} from '../src/data/stoneDepositArtData.js';
import {AESTHETIC_TILE_URIS} from '../src/data/aestheticTileIcons.js';
import {EXTRACTION_WORKSHOPS,EXTRACTION_NODES} from '../src/data/extractionConfig.js';
import {inspectPng} from '../scripts/pngMetadata.mjs';

test('stone resource has its own native transparent rock PNG and stays connected to the stone workshop',()=>{
  const asset=STONE_DEPOSIT_ART,bytes=fs.readFileSync(new URL('../public'+asset.uri,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  assert.deepEqual(bytes,fs.readFileSync(new URL('../assets-source/stone-deposit/stone_deposit.png',import.meta.url)));
  const meta=inspectPng(bytes,{measureFoot:true});
  assert.deepEqual([meta.alphaMin,meta.alphaMax],[0,255]);
  assert.deepEqual(meta.opaqueBounds,asset.opaqueBounds);
  const [left,top,right,bottom]=meta.opaqueBounds;
  assert.ok(left>0&&top>0&&right<meta.width&&bottom<meta.height);
  assert.equal(AESTHETIC_TILE_URIS.n02_stone_deposit,asset.uri);
  assert.ok(!/glacier|iron_deposit/.test(asset.uri));
  assert.equal(EXTRACTION_WORKSHOPS.b65_stone_quarry.node,'n02_stone_deposit');
  assert.equal(EXTRACTION_NODES.n02_stone_deposit.resource,'stone');
});
