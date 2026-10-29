import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TERRAIN_IDS, createTerrainMap, readTerrainMap, writeTerrainMap, isValidTerrainMap,
  paintTerrainStroke, fillTerrainRegion, paintTerrainRectangle, syncTerrainToGrid
} from '../src/engine/terrainEditing.js';

test('brush strokes fill skipped pointer cells and clip large brushes at map edges', () => {
  const original=createTerrainMap();
  const painted=paintTerrainStroke(original,{row:8,col:8},{row:8,col:15},TERRAIN_IDS.sand);
  for(let c=8;c<=15;c++)assert.equal(painted[8][c],TERRAIN_IDS.sand);
  assert.equal(original[8][8],TERRAIN_IDS.grass,'Undo source remains immutable');
  const edge=paintTerrainStroke(original,{row:0,col:0},{row:0,col:0},TERRAIN_IDS.grass,5);
  assert.equal(edge.length,32);assert.ok(edge.every(row=>row.length===32));
  assert.equal(edge[2][2],TERRAIN_IDS.grass);assert.equal(edge[3][3],TERRAIN_IDS.sea);
});

test('region fill stops at the shoreline and rectangle painting works in either direction', () => {
  const original=createTerrainMap();
  const filled=fillTerrainRegion(original,{row:0,col:0},TERRAIN_IDS.grass);
  assert.equal(filled[31][3],TERRAIN_IDS.grass);assert.equal(filled[31][4],TERRAIN_IDS.shore);
  assert.equal(filled[0][5],TERRAIN_IDS.sand);
  const rect=paintTerrainRectangle(original,{row:10,col:12},{row:8,col:9},TERRAIN_IDS.sea);
  for(let r=8;r<=10;r++)for(let c=9;c<=12;c++)assert.equal(rect[r][c],TERRAIN_IDS.sea);
  assert.equal(rect[7][9],TERRAIN_IDS.grass);
});

test('applied terrain survives reload, rejects malformed files, and does not overwrite buildings', () => {
  const data=new Map();const storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
  const terrain=paintTerrainRectangle(createTerrainMap(),{row:8,col:8},{row:10,col:10},TERRAIN_IDS.sea);
  writeTerrainMap(storage,terrain);assert.deepEqual(readTerrainMap(storage),terrain);
  assert.equal(isValidTerrainMap([['oops']]),false);
  assert.throws(()=>writeTerrainMap(storage,[['oops']]));
  data.set('bad','not json');assert.equal(readTerrainMap(storage,'bad'),null);
  const game=createTerrainMap();game[9][9]='b06_bakery';game[10][10]='d13_farmland_plot';
  syncTerrainToGrid(game,terrain);
  assert.equal(game[8][8],TERRAIN_IDS.sea);
  assert.equal(game[9][9],'b06_bakery');assert.equal(game[10][10],'d13_farmland_plot');
});
