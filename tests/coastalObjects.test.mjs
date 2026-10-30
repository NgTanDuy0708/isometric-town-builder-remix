import test from 'node:test';
import assert from 'node:assert/strict';
import { initInputHandler } from '../src/engine/inputHandler.js';
import { createStarterTownMap32, isProtectedTile } from '../src/data/starterMap.js';
import { createTerrainMap } from '../src/engine/terrainEditing.js';
import { TILES_DATA } from '../src/data/tilesData.js';
import { getHarborLayout, HARBOR_SPRITES, SHIP_DOCK_ROW, SHIP_DOCK_COL, isHarborCell, isShipCell, getHarborDepth, getHarborFootprint, getHarborOutline, HARBOR_FOOTPRINTS } from '../src/data/harborLayout.js';
import { isPlacementProtected } from '../src/engine/placementSurface.js';
import { HarborShipManager, STONE_PIER_IMAGE_SRC, ROYAL_SHIP_IMAGE_SRC } from '../src/engine/harborShipManager.js';
import { getDefaultSaveState, saveGameSave, loadGameSave } from '../src/engine/storage.js';

const noop=()=>{};
function movement(tid,from,to) {
  globalThis.document={getElementById:()=>null};globalThis.window={addEventListener:noop};
  const grid=createStarterTownMap32(),terrain=createTerrainMap(grid);
  grid[from.row][from.col]=tid;
  let moving={tileId:tid,fromRow:from.row,fromCol:from.col,level:1,flipped:false};
  const input=initInputHandler({addEventListener:noop},{getMovingBuilding:()=>moving,setMovingBuilding:v=>moving=v,
    getActiveBrush:()=>null,getHoverCell:()=>to,getCurrentGrid:()=>grid,getTerrainMap:()=>terrain,
    getConstructions:()=>({}),getBuildingLevels:()=>({}),getProductionState:()=>({}),getFarmlandState:()=>({}),
    getFlippedGrid:()=>({}),getTileMap:()=>Object.fromEntries(TILES_DATA.map(t=>[t.id,t])),
    getLandUnlockedChunks:()=>Array.from({length:64},(_,i)=>i),getGameMode:()=> 'game',
    showToast:noop,requestRender:noop,updateVillageStatsUI:noop,persistGameState:noop});
  return {input,grid,terrain};
}

test('player roads on the former harbor sand strip move and preserve the original sand through save/load',()=>{
  const s=movement('r01_road_straight_ns',{row:13,col:5},{row:20,col:6});
  try {
    assert.equal(isProtectedTile(13,5,'r01_road_straight_ns'),false);
    assert.equal(s.input.confirmPlacement(),true);
    assert.equal(s.grid[13][5],'s13_sand_ground');
    assert.equal(s.grid[20][6],'r01_road_straight_ns');
    assert.equal(s.terrain[13][5],'s13_sand_ground');assert.equal(s.terrain[20][6],'s13_sand_ground');
    const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
    const save=getDefaultSaveState(s.grid);save.terrainMap=s.terrain;saveGameSave(save);
    const loaded=loadGameSave();assert.equal(loaded.grid[13][5],'s13_sand_ground');assert.equal(loaded.grid[20][6],'r01_road_straight_ns');
  } finally {s.input.destroy();}
});

test('bare sand/sea stay fixed and actual dock cells remain protected',()=>{
  for(const [id,row,col] of [['s13_sand_ground',13,5],['m30_sea_var2_coral_reef',20,2]]) {
    const s=movement(id,{row,col},{row:21,col:6});const before=structuredClone(s.grid);
    try {assert.equal(s.input.confirmPlacement(),false);assert.deepEqual(s.grid,before);}finally{s.input.destroy();}
  }
  assert.equal(isHarborCell(14,3),true);assert.equal(isHarborCell(15,3),true);
  assert.equal(isProtectedTile(14,3,'r01_road_straight_ns'),true);
  assert.equal(isProtectedTile(20,15,'r03_royal_marble_pavement'),true);
});

test('smaller pier stairs meet the shore and the enlarged ship keeps its hull on the waterline',()=>{
  for(const time of [0,1,3]) {
    const a=getHarborLayout(100,50,64,32,time);
    assert.equal(a.pier.w,200);assert.equal(a.ship.w,230);
    assert.equal(a.pier.x+a.pier.w*HARBOR_SPRITES.pier.anchorX,a.dockFoot.x);
    assert.equal(a.pier.y+a.pier.h*HARBOR_SPRITES.pier.anchorY,a.dockFoot.y);
    assert.equal(a.dockFoot.y,a.shore.y+32,'Foot meets the bottom vertex, not the centre of the highlighted tile');
    assert.ok(Math.abs(a.ship.y+a.ship.h*HARBOR_SPRITES.ship.anchorY-(a.shipFoot.y+a.wave-2))<1e-8);
    assert.ok(a.ship.w>a.pier.w);
  }
  assert.deepEqual([SHIP_DOCK_ROW,SHIP_DOCK_COL],[14,4]);
});

test('the ship has exactly two adjacent water cells, shared by interaction and placement protection',()=>{
  const cells=[];
  for(let r=0;r<32;r++)for(let c=0;c<32;c++)if(isShipCell(r,c))cells.push([r,c]);
  assert.deepEqual(cells,[[15,2],[15,3]]);
  const manager=new HarborShipManager({getPlayerLevel:()=>10});let opened=0;
  manager.openModal=()=>opened++;manager.ship={status:'docked'};
  for(const [row,col] of cells) {
    assert.equal(manager.checkWorldClick(0,0,{row,col},0,0,64,32),true);
    assert.equal(isPlacementProtected('a01_whale',row,col,'m30_sea_var2_coral_reef'),true);
  }
  assert.equal(opened,2);
  assert.equal(manager.checkWorldClick(0,0,{row:15,col:1},0,0,64,32),false);
  assert.equal(isPlacementProtected('a01_whale',15,1,'m30_sea_var2_coral_reef'),false);
  assert.equal(getHarborFootprint(15,2),getHarborFootprint(15,3));
  const poly=getHarborOutline(HARBOR_FOOTPRINTS.ship,0,0,64,32);
  const area=Math.abs(poly.reduce((a,p,i)=>{const q=poly[(i+1)%poly.length];return a+p[0]*q[1]-q[0]*p[1]},0))/2;
  assert.equal(area,2*128*64/2);
  assert.deepEqual(getHarborDepth('ship'),{row:15.5,col:3.5});
});

test('harbor renderer uses the new rectangles and draws no artificial ellipses or semicircle wakes, including loading fallback',()=>{
  const images=[];globalThis.Image=class{constructor(){this.complete=true;this.naturalWidth=768;images.push(this);}src='';};
  const ship=new HarborShipManager({getPlayerLevel:()=>10});ship.ship={status:'docked',cargoHolds:[]};
  const draws=[];let circles=0,depth=0;
  const canvas=new Proxy({}, {get:(_,key)=>key==='drawImage'?(img,...args)=>draws.push([img.src,...args]):
    key==='ellipse'||key==='arc'?()=>circles++:key==='save'?()=>depth++:key==='restore'?()=>depth--:noop});
  ship.renderWorldShipAndDock(canvas,0,0,64,32,0);
  const layout=getHarborLayout(0,0,64,32,0);
  assert.deepEqual(draws.find(d=>d[0]===STONE_PIER_IMAGE_SRC).slice(1),[layout.pier.x,layout.pier.y,200,200]);
  assert.deepEqual(draws.find(d=>d[0]===ROYAL_SHIP_IMAGE_SRC).slice(1),[layout.ship.x,layout.ship.y,230,230]);
  assert.equal(circles,0);assert.equal(depth,0);
  images.forEach(img=>img.complete=false);
  ship.renderWorldShipAndDock(canvas,0,0,64,32,0);
  assert.equal(circles,0);assert.equal(depth,0);
});
