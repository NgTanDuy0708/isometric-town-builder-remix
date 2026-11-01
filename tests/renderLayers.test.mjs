import { FARM_BUILDINGS, FARM_ANIMALS } from "../src/data/farmSprites.js";
import { PetManager } from "../src/engine/pets.js";
import test from 'node:test';
import assert from 'node:assert/strict';
import { compareWorldDepth, isFlatGroundTile } from '../src/engine/renderOrder.js';
import { createCanvasRenderer } from '../src/engine/canvasRenderer.js';
import {COMBAT_SHEETS,COMBAT_BUILDING_ART} from '../src/data/combatArtData.js';
import { ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W } from '../src/engine/isoMath.js';
import { getBuildingSpriteUri, getBuildingRenderAdjustment, BUILDING_SOURCE_GEOMETRY } from '../src/data/buildingSprites.js';
import { AESTHETIC_TILE_URIS } from '../src/data/aestheticTileIcons.js';
import { FENCE_ITEMS } from '../src/data/fenceConfig.js';
import { FENCE_TEXTURE_URI } from '../src/engine/fenceRenderer.js';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { CROPS_CONFIG } from '../src/data/cropsConfig.js';
import { CROP_GROWTH_SPRITES, getCropGrowthRenderAdjustment } from '../src/data/cropGrowthSprites.js';
import { CROP_GROWTH_GEOMETRY } from '../src/data/cropGrowthGeometry.js';
import { SOWN_CROP_IDS, SOWN_CROP_SPRITES, getSownCropRenderAdjustment, isCropJustSown } from '../src/data/cropVisuals.js';
import { SINGLE_SEED_ART } from '../src/data/singleSeedSpriteData.js';
import { RESOURCES_CONFIG, WAREHOUSE_RESOURCE_IDS, getWarehouseUsed } from '../src/data/resourcesConfig.js';
import { EXPANSION_BUILDING_LEVELS, EXPANSION_GROUND_IDS, getExpansionRenderAdjustment } from '../src/data/expansionCatalog.js';
import { WORLD_OBJECT_SCALE } from '../src/data/renderScale.js';
import { VehicleManager } from '../src/engine/trafficVehicles.js';
import {EXPANSION_PLANTS,getFruitTreeRenderAdjustment} from '../src/data/fruitTreeSprites.js';
import {FRUIT_TREES_CONFIG} from '../src/data/fruitTreeConfig.js';
import {createFruitTreeState} from '../src/engine/fruitTreeLifecycle.js';
import { HarborShipManager, ROYAL_SHIP_IMAGE_SRC, STONE_PIER_IMAGE_SRC } from '../src/engine/harborShipManager.js';
import { HARBOR_FOOTPRINTS, getHarborOutline } from '../src/data/harborLayout.js';
import { getLivestockCells, getLivestockOutline, reserveLivestockCells, LIVESTOCK_WORLD_WIDTH } from '../src/data/livestockFootprint.js';
import {RUNTIME_ART} from '../src/data/runtimeArtData.js';
import {IRON_MINE_ART} from '../src/data/ironMineArtData.js';
import {STONE_DEPOSIT_ART} from '../src/data/stoneDepositArtData.js';
import {applyVillageGateLayout,VILLAGE_GATE_ID,VILLAGE_GATE_URI,getVillageGateOutline} from '../src/data/villageGate.js';
import {RAID_SHEETS} from '../src/data/raidArtData.js';
import {CHARACTER_SHEETS} from '../src/data/characterSheetsData.js';
import {createForestRegion} from '../src/data/worldConfig.js';
import {CONSTRUCTION_ART,getConstructionRenderAdjustment} from '../src/data/constructionArt.js';
import {TILES_DATA} from '../src/data/tilesData.js';

// Digests were captured from the original PNGs after byte-for-byte comparison.
// The original source archive is local-only; CI needs only the public assets.
const originalAssetHashes = JSON.parse(readFileSync(new URL('./fixtures/original-asset-sha256.json', import.meta.url), 'utf8'));
function assertOriginalAsset(uri, bytes) {
  const seed=Object.values(SINGLE_SEED_ART).find(asset=>asset.uri===uri);
  if(seed){assert.equal(createHash('sha256').update(bytes).digest('hex'),seed.sha256,'Preserve native single seed: '+uri);return;}
  const runtimeAsset=Object.values(RUNTIME_ART).flatMap(group=>Object.values(group)).find(asset=>asset.uri===uri);
  if(runtimeAsset){assert.equal(createHash('sha256').update(bytes).digest('hex'),runtimeAsset.sha256,'Preserve generated PNG: '+uri);return;}
  assert.ok(originalAssetHashes[uri], `Missing original asset digest: ${uri}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), originalAssetHashes[uri], `Preserve original PNG: ${uri}`);
}

globalThis.Image = class {
  complete = true;
  naturalWidth = 176;
  naturalHeight = 208;
  src = '';
};
globalThis.window = { devicePixelRatio: 1 };
globalThis.document = { getElementById: () => null };

function renderScene(overrides = {}) {
  const events = [];
  let path = [];
  const grid = Array.from({ length: 32 }, () => Array(32).fill('d12_meadow_wildflowers'));
  const canvas = { width: 8192, height: 8192, style: {} };
  const stack = [];
  const state = { globalAlpha: 1, matrix: [1, 0, 0, 1, 0, 0] };
  const transform = ([a,b,c,d,e,f]) => {
    const [A,B,C,D,E,F] = state.matrix;
    state.matrix = [A*a+C*b, B*a+D*b, A*c+C*d, B*c+D*d, A*e+C*f+E, B*e+D*f+F];
  };
  const context = new Proxy(state, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'save') return () => stack.push({ ...state });
      if (key === 'restore') return () => {
        assert.ok(stack.length > 0, 'Canvas restore must have a matching save');
        Object.assign(state, stack.pop());
      };
      if (key === 'transform') return (...m) => transform(m);
      if (key === 'translate') return (x,y) => transform([1,0,0,1,x,y]);
      if (key === 'scale') return (x,y) => transform([x,0,0,y,0,0]);
      if (key === 'setTransform') return (...m) => { state.matrix = m; };
      if (overrides.tracePaths && key === 'beginPath') return () => { path=[]; };
      if (overrides.tracePaths && (key === 'moveTo' || key === 'lineTo')) return (x,y) => path.push([x,y]);
      if (overrides.tracePaths && key === 'stroke') return () => events.push({kind:'outline',points:path.slice()});
      if (key === 'drawImage') return (img, ...args) => {
        if (img.src.includes('/cottage_lv')) {
          events.push({ kind: 'house', x: args[0], y: args[1], args, src: img.src });
        } else if (img.src.includes('stone_pavement_128')) events.push({ kind: 'ground' });
        else if (overrides.traceAssets) events.push({ kind: 'asset', src: img.src, args,
          smoothing: state.imageSmoothingEnabled, smoothingQuality: state.imageSmoothingQuality,
          matrix: state.matrix.slice(), alpha: state.globalAlpha });
      };
      if (key === 'fillText' && overrides.traceText) return text => events.push({ kind: 'text', text });
      if (key === 'fill' && overrides.traceFills) return () => events.push({ kind: 'fill', color: state.fillStyle });
      if (key === 'measureText') return () => ({ width: 32 });
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
      return () => {};
    }
  });
  const empty = () => ({});
  const none = () => null;
  const ctx = {
    ensureCanvasRef() {}, getCanvas: () => canvas, getContainer: () => canvas,
    getContext2D: () => context, getViewportSize: () => ({ width: 8192, height: 8192 }),
    getRenderDpr: () => 1, getCamera: () => ({ x: 0, y: 0, zoom: 1 }),
    getCurrentGrid: () => grid, getDayNightWeather: none, getConstructions: empty,
    getFarmlandState: empty, getProductionState: empty, getBuildingLevels: empty,
    getLandUnlockedChunks: () => [], getFlippedGrid: empty, getUpgradesInProgress: empty,
    getGameMode: () => 'sandbox', getVillagerManager: none, getHoverCell: none,
    getActiveBrush: none, getBrushFlipped: () => false, getActiveSeedBrush: none,
    getMovingBuilding: none, getAnimTime: () => 0
  };
  overrides.setup?.({ grid, ctx, events });
  createCanvasRenderer(ctx).renderCanvas();
  assert.equal(stack.length, 0, 'Every render pass restores its Canvas state');
  return events;
}

function cellFromHouse(event) {
  const rect = getBuildingRenderAdjustment('b01_cottage_red');
  const sum = (event.y - rect.dy - ORIGIN_Y) / QUARTER_W;
  const difference = (event.x - rect.dx - ORIGIN_X) / HALF_W;
  return [Math.round((sum-difference)/2), Math.round((sum+difference)/2)];
}

test('every building under construction uses the same opaque scaffold instead of its faded finished art',()=>{
  const ids=TILES_DATA.filter(tile=>tile.category==='building').map(tile=>tile.id);
  const pending=Object.fromEntries(ids.map((id,index)=>{
    const row=8+Math.floor(index/8)*3,col=8+(index%8)*2;
    return [`${row}_${col}`,{row,col,targetTileId:id,startTime:Date.now()-1000,durationMs:60000}];
  }));
  const events=renderScene({traceAssets:true,setup({ctx}){ctx.getConstructions=()=>pending;}});
  const sites=events.filter(e=>e.src===CONSTRUCTION_ART.uri);
  assert.equal(sites.length,ids.length);assert.ok(sites.every(e=>e.alpha===1));
  const completedUris=new Set(ids.map(id=>getBuildingSpriteUri(id)).filter(Boolean));
  assert.ok(!events.some(e=>completedUris.has(e.src)),'Finished building art stays hidden while constructing');
});

test('scaffolds share world depth with buildings, keep progress UI above, and disappear on completion',()=>{
  const pending={'20_20':{row:20,col:20,targetTileId:'b03_blacksmith_forge',startTime:Date.now()-2000,durationMs:60000}};
  const events=renderScene({traceAssets:true,traceText:true,setup({grid,ctx}){
    grid[19][20]='b01_cottage_red';grid[21][20]='b01_cottage_red';ctx.getConstructions=()=>pending;
  }});
  const site=events.findIndex(e=>e.src===CONSTRUCTION_ART.uri),houses=events.map((e,i)=>e.kind==='house'?i:-1).filter(i=>i>=0);
  assert.ok(houses[0]<site&&site<houses[1]);
  assert.ok(events.findIndex(e=>e.kind==='text'&&e.text==='🏗️')>houses[1]);
  const completed=renderScene({traceAssets:true,setup({grid}){grid[20][20]='b03_blacksmith_forge';}});
  assert.ok(!completed.some(e=>e.src===CONSTRUCTION_ART.uri));
  assert.ok(completed.some(e=>e.src===getBuildingSpriteUri('b03_blacksmith_forge')));
});

test('warehouse and both pen orientations draw one uniformly scaled construction site at the ground contact',()=>{
  for(const[id,flipped]of [['b60_combined_warehouse',false],['b22_cow_pasture',false],['b22_cow_pasture',true]]){
    const events=renderScene({traceAssets:true,setup({ctx}){
      ctx.getConstructions=()=>({'20_20':{row:20,col:20,targetTileId:id,flipped,startTime:Date.now()-1000,durationMs:60000}});
    }});
    const sites=events.filter(e=>e.src===CONSTRUCTION_ART.uri);assert.equal(sites.length,1);
    const rect=getConstructionRenderAdjustment(id,flipped);
    assert.deepEqual(sites[0].args,[ORIGIN_X+rect.dx,ORIGIN_Y+40*32+rect.dy,rect.dw,rect.dh]);
    assert.equal(sites[0].alpha,1);
  }
});

test('authored gates, ports, ships and outside props use native world depth and hide overwritten generated scenery',()=>{
  const scene={'35_15':{tileId:'scene:gate',flipped:false,level:1},'9_4':{tileId:'scene:pier',flipped:false,level:1},'10_3':{tileId:'scene:ship',flipped:true,level:1},'34_14':null};
  const events=renderScene({traceAssets:true,setup({ctx}){ctx.getMapScenery=()=>scene;ctx.getCustomMapLayout=()=>true;}});
  for(const uri of ['/assets/buildings/village_gate_v2.png','/assets/aistudio/cang_67fa4e39.png','/assets/aistudio/TauHoangGia_v1_a5f7fe14.png'])assert.ok(events.some(e=>e.src===uri),uri);
});

test('the real forest renderer draws new workshops, ancient trees, wingbeat and troll poses without mutation',()=>{
  const enemies=[Object.freeze({kind:'dragon',flying:true,r:19,c:20,hp:100,maxHp:200,facing:'SE',flightPhase:.2,path:[],fireFor:.2,fireAim:{r:20,c:21}}),
    Object.freeze({kind:'troll',r:20,c:20,hp:70,maxHp:80,facing:'SW',walkPhase:1,path:[{}]})];
  const job=Object.freeze({tileId:'b69_forester_lodge',r:18,c:14,facing:'NE',walkPhase:1,path:[{}],phase:'delivery',load:2});
  const events=renderScene({traceAssets:true,traceFills:true,setup({grid,ctx}){
    const forest=createForestRegion();grid.splice(0,32,...forest.grid);grid[16][12]='b69_forester_lodge';
    ctx.getDefenseState=()=>({phase:'battle',villageHp:100,towers:{},soldiers:[],enemies});
    ctx.getExtractionState=()=>({jobs:[job],nodes:{}});
  }});
  for(const uri of [RAID_SHEETS.dragon.uri,RAID_SHEETS.troll.uri,getBuildingSpriteUri('b69_forester_lodge'),CHARACTER_SHEETS.villager.farmer_old.uri]) {
    assert.ok(events.some(e=>e.src===uri),uri);
  }
  assert.ok(events.some(e=>e.kind==='fill'&&e.color==='#f97316'),'Dragon has a visible fire projectile');
  assert.ok(!events.some(e=>e.src===getBuildingSpriteUri('b14_town_hall')),'Loading a forest must not create a town hall');
  assert.ok(events.filter(e=>[RAID_SHEETS.dragon.uri,RAID_SHEETS.troll.uri].includes(e.src)).every(e=>e.args.length===8));
  for(const[r,c]of [[12,14],[12,16],[13,14],[13,16]]){
    const rect={dx:12.8,dy:25.6};
    const x=ORIGIN_X+(c-r)*64+rect.dx,y=ORIGIN_Y+(r+c)*32+rect.dy;
    assert.ok(events.some(e=>e.src==='/assets/decorations/forest_3.png'&&Math.abs(e.args[0]-x)<1e-6&&Math.abs(e.args[1]-y)<1e-6),'Ancient grove is visible even inside the old town-hall coordinates');
  }
});

test('real renderer draws one village gate above its road and behind objects outside the entrance',()=>{
  const events=renderScene({traceAssets:true,tracePaths:true,setup({grid,ctx}){
    applyVillageGateLayout(grid);grid[30][15]='b01_cottage_red';grid[31][17]='b01_cottage_red';
    ctx.getHoverCell=()=>({row:31,col:15});
  }});
  const gates=events.filter(e=>e.src===VILLAGE_GATE_URI);assert.equal(gates.length,1);
  const gateIndex=events.indexOf(gates[0]),houses=events.map((e,i)=>e.kind==='house'?i:-1).filter(i=>i>=0);
  assert.ok(houses[0]<gateIndex&&gateIndex<houses[1]);
  const rect=getBuildingRenderAdjustment(VILLAGE_GATE_ID);
  assert.deepEqual(gates[0].args,[ORIGIN_X+(14-31)*64+rect.dx,ORIGIN_Y+(31+14)*32+rect.dy,rect.dw,rect.dh]);
  const [x,y,w,h]=gates[0].args;
  assert.ok(Math.abs(x+790*w/1536-(ORIGIN_X+(15-31)*64+64))<1e-8,'Opening sits on road centre X');
  assert.ok(Math.abs(y+800*h/1024-(ORIGIN_Y+(31+15)*32+96))<1e-8,'Opening sits on road centre Y');
  assert.ok(events.some(e=>e.kind==='outline'&&JSON.stringify(e.points)===JSON.stringify(getVillageGateOutline(ORIGIN_X,ORIGIN_Y,HALF_W,QUARTER_W))));
});

test('actual map renderer draws the goblin image between world objects and shows the warning entry marker',()=>{
  const events=renderScene({traceAssets:true,traceText:true,setup({grid,ctx}){
    grid[19][20]='b01_cottage_red';grid[21][20]='b01_cottage_red';
    ctx.getDefenseState=()=>({phase:'warning',remaining:12,villageHp:100,towers:{},
      raid:{spawn:{r:18,c:20}},enemies:[{r:20,c:20,hp:30,maxHp:30,path:[]}]});
  }});
  const goblin=events.findIndex(event=>event.src===COMBAT_SHEETS.goblin.uri);
  const houses=events.map((event,index)=>event.kind==='house'?index:-1).filter(index=>index>=0);
  assert.ok(goblin>=0,'The real map renderer paints the asset, not only a standalone render helper');
  assert.ok(houses[0]<goblin&&goblin<houses[1],'Goblin uses the same depth order as the buildings');
  const draw=events[goblin];assert.equal(draw.args.length,8);assert.ok(draw.args[2]<COMBAT_SHEETS.goblin.width/4);
  assert.equal(draw.alpha,1);
  assert.ok(events.some(event=>event.text==='GOBLIN TỚI SAU 12s'));
});

test('real map draws barracks at their measured ground point and soldiers between rear and front buildings',()=>{
  const events=renderScene({traceAssets:true,setup({grid,ctx}){
    grid[19][20]='b01_cottage_red';grid[21][20]='b01_cottage_red';grid[20][22]='b67_guard_barracks';
    ctx.getDefenseState=()=>({phase:'idle',villageHp:100,towers:{},enemies:[],soldiers:[{r:20,c:20,hp:60,path:[],trainLeft:0}]});
  }});
  const soldier=events.findIndex(event=>event.src===COMBAT_SHEETS.guard.uri);
  const houses=events.map((event,index)=>event.kind==='house'?index:-1).filter(index=>index>=0);
  assert.ok(houses[0]<soldier&&soldier<houses[1]);assert.equal(events[soldier].args.length,8);
  assert.ok(events.some(event=>event.src===COMBAT_BUILDING_ART.barracks_lv1.uri));
  for(const level of [1,2,3]){
    const rect=getBuildingRenderAdjustment('b67_guard_barracks',level);
    const geometry=COMBAT_BUILDING_ART[`barracks_lv${level}`].geometry;
    assert.ok(Math.abs(rect.dx+geometry.anchorX*rect.dw/geometry.width-64)<1e-6);
    assert.ok(Math.abs(rect.dy+geometry.anchorY*rect.dh/geometry.height-128)<1e-6);
  }
});

test('the real renderer draws mage and academy artwork, a full mage health bar and its area spell',()=>{
  const events=renderScene({traceAssets:true,tracePaths:true,traceFills:true,setup({grid,ctx}){
    grid[20][22]='b68_mage_academy';
    ctx.getDefenseState=()=>({phase:'battle',villageHp:100,towers:{},enemies:[],soldiers:[
      {unitType:'mage',r:20,c:20,hp:40,path:[],trainLeft:0,spellFlash:.2,aim:{r:22,c:20}}]});
  }});
  assert.ok(events.some(event=>event.src===COMBAT_SHEETS.mage.uri&&event.alpha===1));
  assert.ok(events.some(event=>event.src===COMBAT_BUILDING_ART.academy_lv1.uri));
  assert.ok(events.some(event=>event.kind==='fill'&&event.color==='#a78bfa44'));
  for(const level of [1,2,3]){
    const rect=getBuildingRenderAdjustment('b68_mage_academy',level);
    const geometry=COMBAT_BUILDING_ART[`academy_lv${level}`].geometry;
    assert.ok(Math.abs(rect.dx+geometry.anchorX*rect.dw/geometry.width-64)<1e-6);
    assert.ok(Math.abs(rect.dy+geometry.anchorY*rect.dh/geometry.height-128)<1e-6);
  }
});

test('expansion building levels and props use the same measured rectangle in the map and preview', () => {
  for (const [id, levels] of Object.entries(EXPANSION_BUILDING_LEVELS)) for (const level of [1,2,3]) {
    const events=renderScene({traceAssets:true,setup({grid,ctx}){
      grid[20][20]=id;ctx.getBuildingLevels=()=>({'20_20':level});
    }});
    const a=getBuildingRenderAdjustment(id,level);
    assert.ok(events.some(e=>e.src===levels[level]&&Math.abs(e.args[0]-ORIGIN_X-a.dx)<1e-6&&Math.abs(e.args[1]-ORIGIN_Y-40*QUARTER_W-a.dy)<1e-6),id+' level '+level);
  }
  for(const id of ['d02_village_well','a01_whale']) {
    const a=getExpansionRenderAdjustment(id);
    const events=renderScene({traceAssets:true,setup({grid,ctx}){
      grid[20][20]=id;ctx.getHoverCell=()=>({row:21,col:20});ctx.getActiveBrush=()=>id;
    }});
    const body=events.find(e=>e.src===AESTHETIC_TILE_URIS[id]&&e.alpha===1);
    const ghost=events.find(e=>e.src===AESTHETIC_TILE_URIS[id]&&e.alpha<1);
    assert.ok(body&&ghost,id);assert.equal(body.args[2],a.dw);assert.equal(ghost.args[2],a.dw);
  }
});

test('expansion ground modules sample native source bounds and paint before raised objects',()=>{
  const isRoadDraw=e=>e.kind==='asset'&&e.src?.includes('/expansion/terrain/stone_road_');
  const surroundingRoads=renderScene({traceAssets:true,setup({grid}){grid[21][20]='b01_cottage_red'}}).filter(isRoadDraw).length;
  for(const id of EXPANSION_GROUND_IDS) {
    const events=renderScene({traceAssets:true,setup({grid}){grid[20][20]=id;grid[21][20]='b01_cottage_red'}});
    const index=events.findIndex(e=>e.src===AESTHETIC_TILE_URIS[id]&&e.args.length===8);
    const house=events.findIndex(e=>e.kind==='house');
    assert.ok(index>=0&&index<house,id);
    const draw=events[index];
    if (id.startsWith('r')) {
      assert.equal(draw.src,AESTHETIC_TILE_URIS.r01_road_straight_ns,'Every road uses the same approved paving artwork');
      const roadDraws=events.filter(isRoadDraw);
      assert.equal(roadDraws.length-surroundingRoads,1,'Do not cover the native road with another road texture');
    } else {
      assert.ok(draw.args[2]>300&&draw.args[3]>300,'Crop native source before scaling');
      assert.deepEqual(draw.args.slice(-2),[128,64]);
    }
  }
});

test('all mine levels and both resource deposits draw their PNG with the same measured ground pivot, including mirrored moves', () => {
  for(const [id,level] of [['b66_iron_mine',1],['b66_iron_mine',2],['b66_iron_mine',3],['n03_iron_deposit',1],['n02_stone_deposit',1]])for(const flipped of [false,true]){
    const uri=id==='b66_iron_mine'?getBuildingSpriteUri(id,level):id==='n02_stone_deposit'?STONE_DEPOSIT_ART.uri:IRON_MINE_ART.iron_deposit.uri;
    const frame=BUILDING_SOURCE_GEOMETRY[id][level];
    const events=renderScene({traceAssets:true,setup({grid,ctx}){
      grid[20][20]=id;ctx.getBuildingLevels=()=>({'20_20':level});
      ctx.getFlippedGrid=()=>({'20_20':flipped});
      ctx.getHoverCell=()=>({row:21,col:20});
      ctx.getMovingBuilding=()=>({tileId:id,fromRow:20,fromCol:20,level,flipped});
    }});
    const draws=events.filter(e=>e.src===uri);
    assert.equal(draws.length,2,id+' has a placed and moving sprite');
    for(const [index,sprite] of draws.entries()){
      const [x,y,w,h]=sprite.args,[a,b,c,d,tx,ty]=sprite.matrix;
      const px=x+w*frame.anchorX/frame.width,py=y+h*frame.anchorY/frame.height;
      const row=index===0?20:21;
      assert.ok(Math.abs(a*px+c*py+tx-(ORIGIN_X+(20-row)*HALF_W+64))<1e-6,id+' horizontal contact');
      assert.ok(Math.abs(b*px+d*py+ty-(ORIGIN_Y+(row+20)*QUARTER_W+128))<1e-6,id+' vertical contact');
    }
    assert.ok(!events.some(e=>e.src?.endsWith('/iron_mine.svg')||e.src?.endsWith('/iron_deposit.svg')));
    if(id==='n02_stone_deposit')assert.ok(!events.some(e=>e.src?.includes('/glacier_mountain.png')),'Stone resource never draws glacier art');
  }
});

test('all 18 crops, including watermelon and cabbage, have dedicated playable sowing assets', () => {
  assert.equal(SOWN_CROP_IDS.length, 18);
  assert.deepEqual(SOWN_CROP_IDS.slice().sort(),Object.keys(CROPS_CONFIG).sort(),'Every purchasable crop needs its own planting art');
  assert.ok(SOWN_CROP_IDS.includes('watermelon'));
  assert.ok(SOWN_CROP_IDS.includes('cabbage'));
  for (const id of SOWN_CROP_IDS) {
    assert.ok(CROPS_CONFIG[id]);
    assert.ok(RESOURCES_CONFIG[id]?.sellPrice > 0);
    assert.ok(WAREHOUSE_RESOURCE_IDS.includes(id));
    assert.equal(getWarehouseUsed({ [id]: 3 }), 3);
    const publicBytes = readFileSync(new URL(`../public${SOWN_CROP_SPRITES[id]}`, import.meta.url));
    assertOriginalAsset(SOWN_CROP_SPRITES[id], publicBytes);
    const events = renderScene({ traceAssets: true, setup({ grid, ctx }) {
      grid[20][20] = 'd13_farmland_plot';
      ctx.getFarmlandState = () => ({ '20_20': { seedId: id, plantTime: Date.now(), growDurationMs: 25000 } });
    } });
    const seedIndex = events.findIndex(e => e.src === SOWN_CROP_SPRITES[id]);
    const groundIndex = events.findIndex(e => e.src?.endsWith('/farmland_plot.png'));
    assert.ok(groundIndex >= 0 && seedIndex > groundIndex, 'Soil paints first, seeds overlay it');
    const seed = events[seedIndex], a = getSownCropRenderAdjustment(id);
    assert.deepEqual(seed.args, [ORIGIN_X + a.dx, ORIGIN_Y + 40 * QUARTER_W + a.dy, a.dw, a.dh]);
    assert.equal(seed.smoothing, false);
    assert.ok(!events.some(e => e.src?.endsWith('/farmland_sprout.png')), 'No sprout on freshly sown soil');
  }
});

test('seed placement previews use the exact same PNG and ground rectangle as planting', () => {
  for (const id of SOWN_CROP_IDS) {
    const events=renderScene({traceAssets:true,setup({grid,ctx}){
      grid[20][20]='d13_farmland_plot';
      ctx.getHoverCell=()=>({row:20,col:20});
      ctx.getActiveSeedBrush=()=>id;
    }});
    const seed=events.find(e=>e.src===SOWN_CROP_SPRITES[id]);
    assert.ok(seed,id+' has a seed placement preview');
    const a=getSownCropRenderAdjustment(id);
    assert.deepEqual(seed.args,[ORIGIN_X+a.dx,ORIGIN_Y+40*QUARTER_W+a.dy,a.dw,a.dh]);
    assert.equal(seed.smoothing,false);
  }
});

test('all 54 growth sprites keep their root on the same ground point and increase in size', () => {
  assert.deepEqual(Object.keys(CROP_GROWTH_SPRITES).sort(), SOWN_CROP_IDS.slice().sort());
  for (const id of SOWN_CROP_IDS) {
    const heights = [];
    for (const stage of ['sprout', 'grow', 'ripe']) {
      const frame = CROP_GROWTH_GEOMETRY[id][stage];
      const a = getCropGrowthRenderAdjustment(id, stage);
      assert.ok(Math.abs(a.dx + frame.anchor.x * frame.scale - 64) < 1e-6);
      assert.ok(Math.abs(a.dy + frame.anchor.y * frame.scale - 96) < 1e-6);
      heights.push((frame.bounds[3] - frame.bounds[1]) * frame.scale);
      const bytes = readFileSync(new URL(`../public${CROP_GROWTH_SPRITES[id][stage]}`, import.meta.url));
      assertOriginalAsset(CROP_GROWTH_SPRITES[id][stage], bytes);
      assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20), bytes[25]], [1254, 1254, 6]);
    }
    assert.ok(heights[0] < heights[1] && heights[1] < heights[2], `${id}: sprout < young < ripe`);
  }
});

test('actual renderer draws the crop-specific sprout, young and ripe sprite on the soil', () => {
  for (const id of SOWN_CROP_IDS) for (const [elapsed, stage] of [[6000, 'sprout'], [15000, 'grow'], [25000, 'ripe']]) {
    const events = renderScene({ traceAssets: true, setup({ grid, ctx }) {
      grid[20][20] = 'd13_farmland_plot';
      ctx.getFarmlandState = () => ({ '20_20': { seedId: id, plantTime: Date.now() - elapsed, growDurationMs: 25000 } });
    } });
    const uri = CROP_GROWTH_SPRITES[id][stage];
    const cropIndex = events.findIndex(e => e.src === uri);
    assert.ok(cropIndex > events.findIndex(e => e.src?.endsWith('/farmland_plot.png')));
    const a = getCropGrowthRenderAdjustment(id, stage);
    assert.deepEqual(events[cropIndex].args, [ORIGIN_X + a.dx, ORIGIN_Y + 40 * QUARTER_W + a.dy, a.dw, a.dh]);
    assert.equal(events[cropIndex].smoothing, false);
    assert.ok(!events.some(e => /\/farmland_(sprout|grow|ripe)\.png$/.test(e.src || '')));
  }
});

test('new sowing phase transitions to existing sprouts, young crops and harvest without resetting growth time', () => {
  assert.equal(isCropJustSown(4999, 25000), true);
  assert.equal(isCropJustSown(5000, 25000), false);
  assert.equal(isCropJustSown(7999, 600000), true);
  assert.equal(isCropJustSown(8000, 600000), false);
  for (const [elapsed, expected] of [[1000, '/wheat_sown.png'], [6000, '/wheat_sprout.png'],
    [15000, '/wheat_grow.png'], [25000, '/wheat_ripe.png']]) {
    const farmData = { seedId: 'wheat', plantTime: Date.now() - elapsed, growDurationMs: 25000 };
    const events = renderScene({ traceAssets: true, setup({ grid, ctx }) {
      grid[20][20] = 'd13_farmland_plot';
      ctx.getFarmlandState = () => ({ '20_20': farmData });
    } });
    assert.ok(events.some(e => e.src?.split('?')[0].endsWith(expected)), expected);
    assert.equal(farmData.growDurationMs, 25000);
    if (elapsed >= 5000) assert.ok(!events.some(e => e.src === SOWN_CROP_SPRITES.wheat));
  }
});

test('[31,31] is the visual front: paint it last so it covers the back [0,0]', () => {
  const cells = [];
  for (let row = 0; row < 32; row++) for (let col = 0; col < 32; col++) cells.push({ row, col });
  cells.sort(compareWorldDepth);
  assert.deepEqual(cells[0], { row: 0, col: 0 });
  assert.deepEqual(cells.at(-1), { row: 31, col: 31 });
  assert.deepEqual(cells.slice(1, 3), [{ row: 0, col: 1 }, { row: 1, col: 0 }]);
  assert.equal(new Set(cells.map(c => `${c.row}_${c.col}`)).size, 1024);
});

test('flat roads/water are ground, but bridges and tall road decorations are world objects', () => {
  assert.equal(isFlatGroundTile('r03_royal_marble_pavement'), true);
  assert.equal(isFlatGroundTile('m30_sea_var2_coral_reef', '/assets/decorations/pack_water_128.png'), true);
  assert.equal(isFlatGroundTile('r12_road_bridge_stone'), false);
  assert.equal(isFlatGroundTile('r31_road_var1_tollgate_guardhouse'), false);
  assert.equal(isFlatGroundTile('b01_cottage_red'), false);
});

test('actual renderer paints ground first, back houses next, front houses last', () => {
  const events = renderScene({ setup({ grid }) {
    for (const [r, c] of [[0, 0], [31, 31], [30, 31], [31, 30]]) grid[r][c] = 'b01_cottage_red';
    grid[0][1] = 'r03_royal_marble_pavement';
  } });
  assert.deepEqual(events.filter(e => e.kind === 'house').map(cellFromHouse), [[0, 0], [30, 31], [31, 30], [31, 31]]);
  assert.equal(events[0].kind, 'ground');
});

test('all sea and shore tiles, inside and outside the grid, paint before moving fishing boats and docked ships', () => {
  for (const [r,c,direction] of [[8,-2.2,1],[8.25,-2.2,1],[21,-3.8,-1],[-.2,3.1,1],[31.2,3.1,-1]]) {
    const events = renderScene({traceAssets:true,setup({ctx}) {
      const vehicles=new VehicleManager();
      vehicles.boats=[{r,c,direction,bobTimer:0}];
      ctx.getVehicleManager=()=>vehicles;
      const harbor=new HarborShipManager({getPlayerLevel:()=>10});
      harbor.ship={status:'docked',cargoHolds:[]};
      ctx.getHarborShipManager=()=>harbor;
    }});
    const boat=events.findIndex(e=>e.src?.includes('/vehicles/fishing_boat'));
    const ship=events.findIndex(e=>e.src===ROYAL_SHIP_IMAGE_SRC);
    const pier=events.findIndex(e=>e.src===STONE_PIER_IMAGE_SRC);
    assert.ok(boat>=0&&ship>=0&&pier>=0);
    const terrain=events.map((e,i)=>e.src?.startsWith('/assets/terrain/')?i:-1).filter(i=>i>=0);
    assert.ok(terrain.length>32*32,'Includes the surrounding ocean');
    assert.ok(Math.max(...terrain)<Math.min(boat,ship,pier),`No foreground sea clips a hull at ${r},${c}`);
  }
});

test('water construction and a terrain brush ghost also stay below boats', () => {
  const events=renderScene({traceAssets:true,setup({ctx}) {
    const vehicles=new VehicleManager();vehicles.boats=[{r:8,c:-2.2,direction:1,bobTimer:0}];ctx.getVehicleManager=()=>vehicles;
    ctx.getHoverCell=()=>({row:8,col:0});ctx.getActiveBrush=()=> 'm30_sea_var2_coral_reef';
    ctx.getConstructions=()=>({'8_1':{row:8,col:1,targetTileId:'m30_sea_var2_coral_reef',startTime:Date.now(),durationMs:10000}});
  }});
  const boat=events.findIndex(e=>e.src?.includes('/vehicles/fishing_boat'));
  assert.ok(boat>=0);
  assert.ok(events.some(e=>e.src==='/assets/terrain/sea.png'&&e.alpha<1),'Includes translucent construction/ghost water');
  assert.ok(events.every((e,i)=>!e.src?.startsWith('/assets/terrain/')||i<boat));
});

test('hovering either half of a harbor footprint outlines both cells below its sprite', () => {
  for (const [kind, footprint] of Object.entries(HARBOR_FOOTPRINTS)) {
    const expected=getHarborOutline(footprint,ORIGIN_X,ORIGIN_Y,HALF_W,QUARTER_W);
    for (let col=footprint.col;col<footprint.col+footprint.cols;col++) {
      const events=renderScene({tracePaths:true,traceAssets:true,setup({ctx}) {
        ctx.getHoverCell=()=>({row:footprint.row,col});
        const harbor=new HarborShipManager({getPlayerLevel:()=>10});
        harbor.ship={status:'docked',cargoHolds:[]};ctx.getHarborShipManager=()=>harbor;
      }});
      const outline=events.findIndex(e=>e.kind==='outline'&&JSON.stringify(e.points)===JSON.stringify(expected));
      const sprite=events.findIndex(e=>e.src===(kind==='ship'?ROYAL_SHIP_IMAGE_SRC:STONE_PIER_IMAGE_SRC));
      assert.ok(outline>=0&&outline<sprite,`${kind}: full footprint under the sprite from col ${col}`);
    }
  }
});

test('harbor depth uses the new foot contact, behind front objects and in front of back objects', () => {
  const events=renderScene({traceAssets:true,setup({grid,ctx}) {
    grid[14][2]='b01_cottage_red';grid[16][4]='b01_cottage_red';
    const harbor=new HarborShipManager({getPlayerLevel:()=>10});
    harbor.ship={status:'docked',cargoHolds:[]};ctx.getHarborShipManager=()=>harbor;
  }});
  const back=events.findIndex(e=>e.kind==='house'),front=events.findLastIndex(e=>e.kind==='house');
  const pier=events.findIndex(e=>e.src===STONE_PIER_IMAGE_SRC),ship=events.findIndex(e=>e.src===ROYAL_SHIP_IMAGE_SRC);
  assert.ok(back>=0&&back<pier&&pier<ship&&ship<front);
});

test('soil is ground and crop harvest UI is above buildings in front', () => {
  const events=renderScene({traceAssets:true,traceText:true,setup({grid,ctx}) {
    grid[20][20]='d13_farmland_plot';grid[19][20]='b01_cottage_red';grid[21][20]='b01_cottage_red';
    ctx.getFarmlandState=()=>({'20_20':Object.freeze({seedId:'wheat',plantTime:Date.now()-30000,growDurationMs:25000})});
  }});
  const soil=events.findIndex(e=>e.src?.endsWith('/farmland_plot.png'));
  const back=events.findIndex(e=>e.kind==='house'),front=events.findLastIndex(e=>e.kind==='house');
  const badge=events.findIndex(e=>e.kind==='text'&&e.text.includes('Chín!'));
  assert.ok(soil>=0&&soil<back&&badge>front);
  assert.equal(events.filter(e=>e.src?.endsWith('/farmland_plot.png')).length,1);
});

test('livestock drawing never mutates simulation state and harvest badges stay above front buildings', () => {
  for(const tid of ['b21_chicken_coop','b22_cow_pasture','b57_sheep_pasture','d33_pig_pen_barn']) {
    const ls=Object.freeze({animalCount:1,fedCount:1,state:'producing',feedTime:Date.now()-80000,durationMs:45000});
    const states=Object.freeze({'20_20':ls});
    const events=renderScene({traceAssets:true,traceText:true,setup({grid,ctx}) {
      grid[20][20]=tid;grid[21][20]='b01_cottage_red';ctx.getLivestockState=()=>states;
    }});
    assert.equal(ls.state,'producing');
    const frontHouse=events.findLastIndex(e=>e.kind==='house');
    const label=events.findIndex(e=>e.kind==='text'&&e.text.startsWith('+1'));
    assert.ok(label>frontHouse,'UI paints after every foreground house');
  }
});

test('single-cell assets shrink 20 percent about their feet while terrain and connected fences retain their dimensions', () => {
  for(const id of ['b64_bbq_restaurant','b06_bakery','b58_textile_mill']) for(const level of [1,2,3]) {
    const source=BUILDING_SOURCE_GEOMETRY[id][level]||BUILDING_SOURCE_GEOMETRY[id][1];
    const a=getBuildingRenderAdjustment(id,level);
    assert.ok(Math.abs(a.dw/source.width*source.visibleWidth-source.worldWidth*WORLD_OBJECT_SCALE)<1e-6);
    assert.ok(Math.abs(a.dx+source.anchorX*a.dw/source.width-64)<1e-6);
    assert.ok(Math.abs(a.dy+source.anchorY*a.dh/source.height-128)<1e-6);
  }
  assert.equal(getBuildingRenderAdjustment('b01_cottage_red').dw,256*WORLD_OBJECT_SCALE);
});

test('livestock pens span two cells at every level and mirror, with one herd and one ground outline',()=>{
  for(const id of Object.keys(FARM_BUILDINGS))for(const level of [1,2,3])for(const flip of [false,true]) {
    const source=BUILDING_SOURCE_GEOMETRY[id][level],a=getBuildingRenderAdjustment(id,level);
    assert.ok(Math.abs(a.dw/source.width*source.visibleWidth-source.worldWidth)<1e-6);
    const part=getLivestockCells(20,20,flip)[1];
    const expected=getLivestockOutline(20,20,flip,ORIGIN_X,ORIGIN_Y,HALF_W,QUARTER_W);
    const events=renderScene({traceAssets:true,tracePaths:true,setup({grid,ctx}){
      grid[20][20]=id;reserveLivestockCells(grid,20,20,flip);
      ctx.getBuildingLevels=()=>({'20_20':level});ctx.getFlippedGrid=()=>({'20_20':flip});
      ctx.getHoverCell=()=>part;
      ctx.getLivestockState=()=>({'20_20':{animalCount:2,state:'hungry'}});
    }});
    assert.equal(events.filter(e=>e.src===FARM_ANIMALS[source.animalType].uri).length,2,'No duplicate herd on the second cell');
    const outline=events.findIndex(e=>e.kind==='outline'&&JSON.stringify(e.points)===JSON.stringify(expected));
    const body=events.findIndex(e=>e.src===source.uri);
    assert.ok(outline>=0&&outline<body);
    assert.equal(events.filter(e=>e.src===source.uri).length,1,'Only the isolated building image is drawn');
    const animalEnd=events.findLastIndex(e=>e.src===FARM_ANIMALS[source.animalType].uri);
    assert.ok(events.findLastIndex(e=>e.src===FENCE_TEXTURE_URI)>animalEnd,'Grid-aligned front rails paint after the herd');
  }
});

test('larger pens and their moving previews stay behind buildings on both front edges',()=>{
  for(const flip of [false,true])for(const moving of [false,true]) {
    const id='b22_cow_pasture',uri=FARM_BUILDINGS[id].uri;
    const events=renderScene({traceAssets:true,setup({grid,ctx}) {
      grid[19][19]='b01_cottage_red';grid[20][21]='b01_cottage_red';grid[21][20]='b01_cottage_red';
      if(moving) {
        ctx.getHoverCell=()=>({row:20,col:20});
        ctx.getMovingBuilding=()=>({tileId:id,fromRow:25,fromCol:25,level:1,flipped:flip});
      } else {grid[20][20]=id;reserveLivestockCells(grid,20,20,flip);ctx.getFlippedGrid=()=>({'20_20':flip});}
    }});
    const pen=events.findIndex(e=>e.src===uri);
    const houses=events.map((e,i)=>e.kind==='house'?i:-1).filter(i=>i>=0);
    assert.ok(houses[0]<pen&&pen<houses[1]&&pen<houses[2]);
  }
});

test('missing object sprites never cover the terrain with green fallback diamonds', () => {
  const events = renderScene({ traceAssets: true, traceFills: true, setup({ grid, ctx }) {
    grid[20][20] = 'missing_legacy_sprite';
    ctx.getTerrainMap = () => Array.from({ length: 32 }, () => Array(32).fill('s13_sand_ground'));
  } });
  assert.ok(events.some(e => e.src === '/assets/terrain/sand.png'));
  assert.equal(events.filter(e => e.kind === 'fill' && ['#5cb85c', '#4cae4c'].includes(e.color)).length, 0);
  const x = ORIGIN_X, y = ORIGIN_Y + 40 * QUARTER_W + 64;
  assert.ok(events.some(e => e.src === '/assets/terrain/sand.png' &&
    e.args[4] + e.args[6] / 2 === x + 64 && e.args[5] + e.args[7] / 2 === y + 32),
    'Custom ground is drawn even under an object whose old asset is missing');
});

test('moving actors with fractional coordinates interleave with buildings; UI waits until last', () => {
  const events = renderScene({ setup({ grid, ctx, events }) {
    grid[21][21] = grid[20][20] = 'b01_cottage_red';
    const v = { r: 20.5, c: 20.5 };
    ctx.getVillagerManager = () => ({ villagers: [v], render(...args) {
      const opts = args.at(-1);
      assert.equal(opts.only, v);
      events.push({ kind: 'villager' });
      opts.deferOverlay(() => events.push({ kind: 'speech' }));
    } });
    const pet = { r: 20.25, c: 20.25 };
    ctx.getPetManager = () => ({ pets: [pet], render(...args) {
      assert.equal(args.at(-1), pet);
      events.push({ kind: 'pet' });
    }, renderOverlays() { events.push({ kind: 'heart' }); } });
  } });
  assert.deepEqual(events.map(e => e.kind), ['house', 'pet', 'villager', 'house', 'speech', 'heart']);
});

test('ghost preview joins its target depth instead of being pasted above the whole town', () => {
  const events = renderScene({ setup({ grid, ctx }) {
    grid[21][21] = grid[0][0] = 'b01_cottage_red';
    ctx.getHoverCell = () => ({ row: 20, col: 20 });
    ctx.getMovingBuilding = () => ({ tileId: 'b01_cottage_red', fromRow: 21, fromCol: 21, level: 3 });
  } });
  assert.deepEqual(events.filter(e => e.kind === 'house').map(cellFromHouse), [[0, 0], [20, 20], [21, 21]]);
  assert.ok(events[1].src.endsWith('cottage_lv3.png'));
});

test('building levels keep distinct assets and the same ground anchor', () => {
  const families = [['b65_stone_quarry', 'stone_quarry'], ['b01_cottage_red', 'cottage'], ['b02_tudor_inn', 'inn'], ['b03_blacksmith_forge', 'forge'], ['b04_windmill', 'windmill'], ['b05_watermill', 'watermill'], ['b06_bakery', 'bakery'], ['b07_apothecary', 'herbalist'], ['b08_watchtower', 'watchtower'], ['b09_chapel', 'chapel'], ['b20_noble_manor', 'manor']];
  for (const [tileId, stem] of families) {
    for (const level of [1, 2, 3]) {
      const uri = getBuildingSpriteUri(tileId, level);
      assert.equal(uri, `/assets/buildings/${stem}_lv${level}.png`);
      const png = readFileSync(new URL(`../public${uri}`, import.meta.url));
      const source = BUILDING_SOURCE_GEOMETRY[tileId]?.[level];
      assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], source ? [source.width, source.height] : [256, 256]);
      if (source) {
        assertOriginalAsset(uri, png);
      }
      const events = renderScene({ traceAssets: true, setup({ grid, ctx }) {
        grid[20][20] = tileId;
        ctx.getBuildingLevels = () => ({ '20_20': level });
      } });
      const sprite = events.find(e => e.src === uri);
      assert.ok(sprite, `${stem} level ${level} is drawn`);
      const anchorX = source ? source.anchorX / source.width : 0.5;
      const anchorY = source ? source.anchorY / source.height : 1;
      assert.ok(Math.abs(sprite.args[0] + sprite.args[2] * anchorX - (ORIGIN_X + 64)) < 1e-6);
      assert.ok(Math.abs(sprite.args[1] + sprite.args[3] * anchorY - (ORIGIN_Y + 40 * QUARTER_W + 128)) < 1e-6);
      if (source) {
        assert.equal(sprite.smoothing, true);
        assert.equal(sprite.smoothingQuality, 'high');
      }
    }
    assert.equal(AESTHETIC_TILE_URIS[tileId], `/assets/buildings/${stem}_lv1.png`);
  }
});

test('all farm buildings and animals preserve the original generated PNGs', () => {
  const farmManifest=JSON.parse(readFileSync(new URL('../docs/generated-assets/farm-buildings-v4/manifest.json',import.meta.url)));
  for (const source of [...Object.values(FARM_BUILDINGS), ...Object.values(FARM_ANIMALS)]) {
    const png = readFileSync(new URL(`../public${source.uri}`, import.meta.url));
    const native=farmManifest.find(entry=>entry.uri===source.uri);
    if(native) assert.equal(createHash('sha256').update(png).digest('hex'),native.sha256);
    else assertOriginalAsset(source.uri, png);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20), png[25]], [1254, 1254, 6]);
  }
  for (const [id, source] of Object.entries(FARM_BUILDINGS)) {
    assert.equal(AESTHETIC_TILE_URIS[id], source.uri);
    for (const level of [1, 2, 3]) assert.equal(getBuildingSpriteUri(id, level), source.uri);
  }
});

test('separate livestock follow the new pens when upgraded, mirrored and moved', () => {
  for (const tileId of ['b21_chicken_coop', 'b22_cow_pasture', 'b57_sheep_pasture']) {
    const definition = FARM_BUILDINGS[tileId];
    const animal = FARM_ANIMALS[definition.animalType];
    const count = definition.animalSlots.length;
    for (const level of [1, 2, 3]) for (const flipped of [false, true]) for (const moving of [false, true]) {
      const events = renderScene({ traceAssets: true, setup({ grid, ctx }) {
        ctx.getLivestockState = () => ({ [moving ? '21_21' : '20_20']: { animalCount: count, state: 'hungry' } });
        ctx.getBuildingLevels = () => ({ '20_20': level });
        if (moving) {
          ctx.getHoverCell = () => ({ row: 20, col: 20 });
          ctx.getMovingBuilding = () => ({ tileId, fromRow: 21, fromCol: 21, level, flipped });
        } else {
          grid[20][20] = tileId;
          ctx.getFlippedGrid = () => ({ '20_20': flipped });
        }
      } });
      assert.equal(events.filter(e => e.src === definition.uri).length, definition.foreground ? 2 : 1);
      if (definition.foreground) assert.ok(events.findLastIndex(e => e.src === definition.uri) > events.findLastIndex(e => e.src === animal.uri), 'Foreground fence hides animal feet after animals are drawn');
      const animals = events.filter(e => e.src === animal.uri);
      assert.equal(animals.length, count, `${tileId}: render owned animals only`);
      const first = animals[0];
      const [x, y, w, h] = first.args;
      const [a, b, c, d, tx, ty] = first.matrix;
      const footX = a * (x + w * animal.anchorX / animal.width) + c * (y + h * animal.anchorY / animal.height) + tx;
      const footY = b * (x + w * animal.anchorX / animal.width) + d * (y + h * animal.anchorY / animal.height) + ty;
      const source = BUILDING_SOURCE_GEOMETRY[tileId][level];
      const adjustment = getBuildingRenderAdjustment(tileId, level);
      const scale = adjustment.dw / source.width;
      const [sourceX, sourceY] = source.animalSlots[0];
      const runX = source.animalSlotsAreWorld ? sourceX : adjustment.dx + sourceX * scale;
      assert.ok(Math.abs(footX - (ORIGIN_X + (flipped ? 128 - runX : runX))) < 1e-6);
      assert.ok(Math.abs(footY - (ORIGIN_Y + 40 * QUARTER_W + (source.animalSlotsAreWorld ? sourceY : adjustment.dy + sourceY * scale))) < 1e-6);
      assert.equal(first.smoothingQuality, 'high');
    }
    const empty = renderScene({traceAssets: true, setup({grid}) { grid[20][20] = tileId; }});
    assert.equal(empty.filter(e => e.src === animal.uri).length, 0, 'Empty barns have no baked-in livestock');
  }
});

test('pig pen displays owned animals up to four, including mirrored and moving previews', () => {
  for (const flipped of [false, true]) for (const mode of ['placed', 'brush', 'moving']) for (const count of [0, 1, 4]) {
    const events = renderScene({traceAssets: true, setup({grid,ctx}) {
      const tileId = 'd33_pig_pen_barn';
      ctx.getLivestockState = () => ({ [mode === 'moving' ? '21_21' : '20_20']: { animalCount: count, state: count ? 'hungry' : 'empty' } });
      if (mode === 'placed') { grid[20][20]=tileId; ctx.getFlippedGrid=()=>({'20_20':flipped}); }
      else {
        ctx.getHoverCell=()=>({row:20,col:20});
        if(mode === 'brush') { ctx.getActiveBrush=()=>tileId;ctx.getBrushFlipped=()=>flipped; }
        else ctx.getMovingBuilding=()=>({tileId,fromRow:21,fromCol:21,level:1,flipped});
      }
    }});
    const visible = mode === 'brush' ? 0 : count;
    assert.equal(events.filter(e=>e.src===FARM_BUILDINGS.d33_pig_pen_barn.uri).length,1);
    assert.equal(events.filter(e=>e.src===FARM_ANIMALS.pig.uri).length, visible);
  }
});

test('new pet sprites keep native foot anchors, mirrored facing and walking simulation', () => {
  for (const type of ['dog','cat','horse','rabbit']) for(const facing of ['left','right']) {
    const manager = new PetManager();
    const pet = {id:'test',type,name:type,r:20,c:20,targetR:21,targetC:20,state:'idle',facing,bounce:0,walkPhase:0,stateTimer:10};
    manager.pets=[pet];
    const events = renderScene({traceAssets:true,setup({ctx}) {ctx.getPetManager=()=>manager;}});
    const animal=FARM_ANIMALS[type], sprite=events.find(e=>e.src===animal.uri);
    assert.ok(sprite);
    const [x,y,w,h]=sprite.args,[a,b,c,d,tx,ty]=sprite.matrix;
    const px=x+w*animal.anchorX/animal.width,py=y+h*animal.anchorY/animal.height;
    assert.ok(Math.abs(a*px+c*py+tx-(ORIGIN_X+64))<1e-6);
    assert.ok(Math.abs(b*px+d*py+ty-(ORIGIN_Y+40*QUARTER_W+96))<1e-6);
    assert.equal(Math.sign(a),facing==='left'?1:-1);
    pet.state='walking';manager.update(0.1,Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers')),()=>true);
    assert.ok(pet.r>20,'Sprite replacement does not disable movement');
  }
});

test('main town hall draws once across its 2x3 cells, with one native asset at every level', () => {
  const id = 'b14_town_hall';
  const uri = getBuildingSpriteUri(id);
  const png = readFileSync(new URL(`../public${uri}`, import.meta.url));
  assertOriginalAsset(uri, png);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20), png[25]], [1254, 1254, 6]);
  assert.equal(AESTHETIC_TILE_URIS[id], uri);
  for (const level of [1, 2, 3]) {
    assert.equal(getBuildingSpriteUri(id, level), uri, 'No visual upgrade progression');
    const source = BUILDING_SOURCE_GEOMETRY[id][1];
    const adj = getBuildingRenderAdjustment(id, level);
    assert.ok(Math.abs(adj.dw / adj.dh - source.width / source.height) < 1e-10);
    const events = renderScene({ traceAssets: true, setup({ grid, ctx }) {
      for (let row = 12; row <= 13; row++) for (let col = 14; col <= 16; col++) grid[row][col] = id;
      ctx.getBuildingLevels = () => ({ '13_15': level });
    } });
    const sprites = events.filter(e => e.src === uri);
    assert.equal(sprites.length, 1, 'Six occupied cells render one building');
    const sprite = sprites[0];
    const x = ORIGIN_X + 2 * HALF_W, y = ORIGIN_Y + 28 * QUARTER_W;
    assert.ok(Math.abs(sprite.args[0] + sprite.args[2] * source.anchorX / source.width - (x - 64)) < 1e-6);
    assert.ok(Math.abs(sprite.args[1] + sprite.args[3] * source.anchorY / source.height - (y + 160)) < 1e-6);
    assert.equal(sprite.smoothingQuality, 'high');
    assert.ok(!events.some(e => e.src === '/assets/buildings/town_hall_royal.png'));
  }
});

test('royal warehouse draws once on its 2x2 footprint and shares native art with the move preview', () => {
  const id = 'b60_combined_warehouse', uri = getBuildingSpriteUri(id);
  const source = BUILDING_SOURCE_GEOMETRY[id][1];
  assert.equal(AESTHETIC_TILE_URIS[id], uri);
  assertOriginalAsset(uri, readFileSync(new URL(`../public${uri}`, import.meta.url)));
  let placed;
  for (const level of [1, 2, 3, 5]) {
    assert.equal(getBuildingSpriteUri(id, level), uri, 'One finished design at every gameplay level');
    const events = renderScene({ traceAssets: true, setup({ grid, ctx }) {
      for (let r=19;r<=20;r++) for (let c=19;c<=20;c++) grid[r][c]=id;
      ctx.getBuildingLevels = () => ({ '20_20': level });
    } });
    const sprites = events.filter(e => e.src === uri);
    assert.equal(sprites.length, 1, 'Four occupied cells draw only one warehouse');
    placed = sprites[0];
    assert.ok(Math.abs(placed.args[0]+placed.args[2]*source.anchorX/source.width-(ORIGIN_X+64)) < 1e-6);
    assert.ok(Math.abs(placed.args[1]+placed.args[3]*source.anchorY/source.height-(ORIGIN_Y+40*QUARTER_W+source.worldAnchorY)) < 1e-6);
    assert.equal(placed.smoothingQuality, 'high');
    assert.ok(!events.some(e=>e.src === '/assets/buildings/combined_warehouse.png'));
  }
  const moving = renderScene({ traceAssets: true, setup({ ctx }) {
    ctx.getHoverCell=()=>({row:20,col:20});
    ctx.getMovingBuilding=()=>({tileId:id,fromRow:10,fromCol:10,footprint:2,level:1});
  } }).find(e=>e.src===uri);
  assert.ok(moving);
  assert.deepEqual(moving.args, placed.args, 'Preview and placed building have the same size and ground contact');
  // Rectified foundation edges meet the front vertex and both side vertices.
  const adj = getBuildingRenderAdjustment(id);
  const leftX=source.anchorX-520, rightX=source.anchorX+520;
  const floor = [
    [leftX,.49390836713585307*leftX+923.00948385034],
    [source.anchorX,source.anchorY],
    [rightX,-.45117477608955453*rightX+1526.037576500509]
  ].map(([sx,sy])=>{
    const x=adj.dx+sx*adj.dw/source.width;
    const y=adj.dy+sy*adj.dh/source.height+adj.shearY*(x-adj.pivotX);
    return {x,y};
  });
  for (const {x,y} of floor) assert.ok(Math.abs(x-64)/128+Math.abs(y-64)/64<=1.0001);
  assert.ok(Math.abs((floor[1].y-floor[0].y)/(floor[1].x-floor[0].x)-.5)<1e-8);
  assert.ok(Math.abs((floor[2].y-floor[1].y)/(floor[2].x-floor[1].x)+.5)<1e-8);
});
test('hovering any warehouse cell and moving it outline the complete 2x2 diamond', () => {
  const x=ORIGIN_X,y=ORIGIN_Y+40*QUARTER_W;
  const expected=[[x+64,y],[x+192,y+64],[x+64,y+128],[x-64,y+64]];
  for(const [r,c] of [[19,19],[19,20],[20,19],[20,20]]) {
    const events=renderScene({tracePaths:true,setup({grid,ctx}){
      for(let rr=19;rr<=20;rr++)for(let cc=19;cc<=20;cc++)grid[rr][cc]='b60_combined_warehouse';
      ctx.getHoverCell=()=>({row:r,col:c});
    }});
    assert.ok(events.some(e=>e.kind==='outline'&&JSON.stringify(e.points)===JSON.stringify(expected)));
  }
  const events=renderScene({tracePaths:true,setup({ctx}){
    ctx.getHoverCell=()=>({row:20,col:20});
    ctx.getMovingBuilding=()=>({tileId:'b60_combined_warehouse',fromRow:10,fromCol:10,footprint:2});
  }});
  assert.ok(events.some(e=>e.kind==='outline'&&JSON.stringify(e.points)===JSON.stringify(expected)));
});

test('buildings on the removed town hall forecourt are visible', () => {
  const events = renderScene({ traceAssets: true, setup({ grid }) {
    grid[16][15] = 'b01_cottage_red';
  } });
  assert.equal(events.filter(e => e.src === getBuildingSpriteUri('b01_cottage_red')).length, 1);
  assert.ok(!events.some(e => e.src === '/assets/buildings/royal_plaza.png'));
});

test('the town hall layers at its stair contact cell [15,15]', () => {
  const events = renderScene({ traceAssets: true, setup({ grid }) {
    for (let r=12;r<=13;r++) for(let c=14;c<=16;c++) grid[r][c]='b14_town_hall';
    grid[14][15]='b01_cottage_red';
    grid[16][15]='b02_tudor_inn';
  } });
  const back=events.findIndex(e=>e.src===getBuildingSpriteUri('b01_cottage_red'));
  const hall=events.findIndex(e=>e.src===getBuildingSpriteUri('b14_town_hall'));
  const front=events.findIndex(e=>e.src===getBuildingSpriteUri('b02_tudor_inn'));
  assert.ok(back>=0 && back<hall && hall<front);
});

test('all fence shapes use the same geometry for placed sprites, shop brushes and moving previews', () => {
  for (const item of FENCE_ITEMS) for (const flipped of [false, true]) {
    let placed;
    for (const mode of ['placed', 'brush', 'moving']) {
    const events = renderScene({ traceAssets: true, setup({ grid, ctx }) {
      if (mode === 'placed') {
        grid[20][20] = item.id;
        ctx.getFlippedGrid = () => ({ '20_20': flipped });
      }
      else {
        ctx.getHoverCell = () => ({ row: 20, col: 20 });
        if (mode === 'brush') {
          ctx.getActiveBrush = () => item.id;
          ctx.getBrushFlipped = () => flipped;
        }
        else ctx.getMovingBuilding = () => ({ tileId: item.id, fromRow: 21, fromCol: 21, level: 1, flipped });
      }
    } });
    const parts = events.filter(e => e.src === FENCE_TEXTURE_URI);
    assert.equal(parts.length, item.shape === 'straight' ? 3 : 5);
    assert.ok(parts.every(e => e.smoothing === false));
    const posts = parts.filter(e => e.args[0] === 98);
    for (const post of posts) {
      assert.equal(post.matrix[0] * 194, 15, 'All posts have the same width');
      assert.equal(post.matrix[3] * 518, 40, 'All posts have the same height');
    }
    const geometry = parts.map(({ args, matrix }) => ({ args, matrix }));
    if (mode === 'placed') placed = geometry;
    else assert.deepEqual(geometry, placed, `${item.label}: ${mode} matches placed geometry`);
    }
  }
});

test('actual renderer merges corner joints with neighbouring straight fences and the placement ghost', () => {
  const [straight, upper] = FENCE_ITEMS;
  const events = renderScene({ traceAssets: true, setup({ grid, ctx }) {
    grid[20][20] = upper.id;
    grid[21][20] = straight.id;
    ctx.getHoverCell = () => ({ row: 20, col: 21 });
    ctx.getActiveBrush = () => straight.id;
    ctx.getBrushFlipped = () => true;
  } });
  const parts = events.filter(e => e.src === FENCE_TEXTURE_URI);
  assert.equal(parts.filter(e => e.args[0] === 98).length, 5, 'Five joints for four connected edges');
  assert.equal(parts.filter(e => e.args[0] === 300).length, 4);
  assert.equal(parts.filter(e => e.alpha < 1).length, 2, 'Ghost shares its existing solid end post');
  assert.ok(!events.some(e => e.src === FENCE_ITEMS[1].uri), 'No stretched whole-corner bitmap');
});

test('real actor, harbor, order board and wonder renderers preserve Canvas state across deferred UI', async () => {
  const [{ VillagerManager }, { PetManager }, { TownVisitorManager }, { VehicleManager },
    { HarborShipManager }, { KingdomWondersManager }, { createOrderBoardManager }] = await Promise.all([
    import('../src/engine/villagers.js'), import('../src/engine/pets.js'),
    import('../src/engine/townVisitors.js'), import('../src/engine/trafficVehicles.js'),
    import('../src/engine/harborShipManager.js'), import('../src/engine/kingdomWonders.js'),
    import('../src/engine/orderBoardManager.js')
  ]);
  const events = renderScene({ traceAssets: true, traceText: true, setup({ ctx }) {
    const villagers = new VillagerManager();
    villagers.villagers = [{ id: 1, r: 20.5, c: 20.5, state: 'idle', walkPhase: 0, bounce: 0 }];
    villagers.speechBubble = { villagerId: 1, text: 'villager-ui' };
    ctx.getVillagerManager = () => villagers;
    const pets = new PetManager();
    pets.pets = [{ type: 'dog', r: 20.25, c: 20.25, state: 'idle', walkPhase: 0, bounce: 0 }];
    ctx.getPetManager = () => pets;
    const visitors = new TownVisitorManager({});
    visitors.visitors = [{ row: 19.5, col: 20, state: 'waiting', npc: {}, requestedItem: { icon: 'UI', amount: 2 } }];
    ctx.getTownVisitorManager = () => visitors;
    const vehicles = new VehicleManager();
    vehicles.vehicles = [{ id: 'cart', type: 'wheat_cart', r: 18, c: 20 }];
    vehicles.speechBubble = { vehicleId: 'cart', text: 'vehicle-ui' };
    vehicles.boats = [{ r: 18, c: -2.2, bobTimer: 0, direction: 1 }];
    ctx.getVehicleManager = () => vehicles;
    const harbor = new HarborShipManager({ getPlayerLevel: () => 10 });
    harbor.ship = { status: 'docked', cargoHolds: [] };
    ctx.getHarborShipManager = () => harbor;
    const wonders = new KingdomWondersManager({});
    wonders.wonderSites = { royal_palace: { id: 'royal_palace', row: 8, col: 16, placed: true } };
    wonders.wondersState.royal_palace = 4;
    ctx.getKingdomWondersManager = () => wonders;
    ctx.getOrderBoardManager = () => createOrderBoardManager({});
  } });
  for (const text of ['villager-ui', 'vehicle-ui', 'UI×2', '0/9 📦']) {
    assert.ok(events.some(e => e.text === text), `Deferred UI preserved: ${text}`);
  }
  for (const suffix of ['cang_67fa4e39.png', 'TauHoangGia_v1_a5f7fe14.png', 'royal_palace.png', 'order_board.png']) {
    assert.equal(events.filter(e => e.kind === 'asset' && e.src.endsWith(suffix)).length, 1, `Exactly one world body: ${suffix}`);
  }
  const lastBody = events.findLastIndex(e => e.kind === 'asset');
  assert.ok(events.findIndex(e => e.text === 'villager-ui') > lastBody);
  assert.ok(events.findIndex(e => e.text === 'vehicle-ui') > lastBody);
});

test('all eight fruit trees draw all seven native stages with fixed ground contact',()=>{
  const now=Date.now(),originalNow=Date.now;
  Date.now=()=>now;
  try{
    for(const [id,data] of Object.entries(EXPANSION_PLANTS)){
      const duration=FRUIT_TREES_CONFIG[id].intervalSec*1000;
      for(const stage of ['seed','sprout','seedling','young','flowering','fruiting','withered']){
        const progress={seed:0,sprout:.18,seedling:.33,young:.55,flowering:.8,fruiting:1,withered:0}[stage];
        const state={...createFruitTreeState(now-duration*progress),...(stage==='withered'?{hasHarvested:true,harvestCount:3,exhausted:true}:{})};
        const events=renderScene({traceAssets:true,setup({grid,ctx}){
          grid[20][20]=id;ctx.getProductionState=()=>({'20_20':state});ctx.getFruitTreesState=()=>({'20_20':{...state}});
        }});
        const draw=events.find(e=>e.src===data.stages[stage]);
        assert.ok(draw,id+' '+stage);
        const a=getFruitTreeRenderAdjustment(id,stage),g=data.geometry[stage];
        assert.deepEqual(draw.args,[ORIGIN_X+a.dx,ORIGIN_Y+40*QUARTER_W+a.dy,a.dw,a.dh]);
        assert.ok(Math.abs(a.dx+g.anchor.x*a.dw/g.width-64)<1e-6);
        assert.ok(Math.abs(a.dy+g.anchor.y*a.dh/g.height-96)<1e-6);
        assert.ok(!events.some(e=>e.src?.includes('/assets/trees/')),'No old tree artwork');
      }
    }
  }finally{Date.now=originalNow}
});

test('planting previews use seeds and a harvested moving tree keeps its withered stage',()=>{
  const now=Date.now();
  for(const [id,data] of Object.entries(EXPANSION_PLANTS)){
    const events=renderScene({traceAssets:true,setup({grid,ctx}){
      grid[20][20]=id;ctx.getHoverCell=()=>({row:21,col:20});ctx.getActiveBrush=()=>id;
    }});
    const ghost=events.find(e=>e.src===data.stages.seed&&e.alpha<1);
    assert.ok(ghost,id+' planting preview');
    assert.equal(ghost.args[2],getFruitTreeRenderAdjustment(id,'seed').dw);
    const state={lastHarvest:now,hasHarvested:true,harvestCount:3,exhausted:true,ready:false};
    const moved=renderScene({traceAssets:true,setup({grid,ctx}){
      grid[20][20]=id;ctx.getHoverCell=()=>({row:21,col:20});
      ctx.getMovingBuilding=()=>({tileId:id,fromRow:20,fromCol:20});ctx.getProductionState=()=>({'20_20':state});
    }});
    assert.ok(moved.some(e=>e.src===data.stages.withered&&e.alpha===.7),id+' moving preview');
  }
});
