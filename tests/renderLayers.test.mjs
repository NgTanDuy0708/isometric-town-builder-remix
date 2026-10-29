import { FARM_BUILDINGS, FARM_ANIMALS } from "../src/data/farmSprites.js";
import { PetManager } from "../src/engine/pets.js";
import test from 'node:test';
import assert from 'node:assert/strict';
import { compareWorldDepth, isFlatGroundTile } from '../src/engine/renderOrder.js';
import { createCanvasRenderer } from '../src/engine/canvasRenderer.js';
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
import { SOWN_CROP_IDS, SOWN_CROP_SPRITES, SOWN_CROP_DRAW, isCropJustSown } from '../src/data/cropVisuals.js';
import { RESOURCES_CONFIG, WAREHOUSE_RESOURCE_IDS, getWarehouseUsed } from '../src/data/resourcesConfig.js';
import { EXPANSION_BUILDING_LEVELS, EXPANSION_GROUND_IDS, getExpansionRenderAdjustment } from '../src/data/expansionCatalog.js';

// Digests were captured from the original PNGs after byte-for-byte comparison.
// The original source archive is local-only; CI needs only the public assets.
const originalAssetHashes = JSON.parse(readFileSync(new URL('./fixtures/original-asset-sha256.json', import.meta.url), 'utf8'));
function assertOriginalAsset(uri, bytes) {
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
  const sum = (event.y + 128 - ORIGIN_Y) / QUARTER_W;
  const difference = (event.x + 64 - ORIGIN_X) / HALF_W;
  return [(sum - difference) / 2, (sum + difference) / 2];
}

test('expansion building levels and props use the same measured rectangle in the map and preview', () => {
  for (const [id, levels] of Object.entries(EXPANSION_BUILDING_LEVELS)) for (const level of [1,2,3]) {
    const events=renderScene({traceAssets:true,setup({grid,ctx}){
      grid[20][20]=id;ctx.getBuildingLevels=()=>({'20_20':level});
    }});
    const a=getBuildingRenderAdjustment(id,level);
    assert.ok(events.some(e=>e.src===levels[level]&&Math.abs(e.args[0]-ORIGIN_X-a.dx)<1e-6&&Math.abs(e.args[1]-ORIGIN_Y-40*QUARTER_W-a.dy)<1e-6),id+' level '+level);
  }
  for(const id of ['d02_village_well','d35_cacao_tree','a01_whale']) {
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
  for(const id of EXPANSION_GROUND_IDS) {
    const events=renderScene({traceAssets:true,setup({grid}){grid[20][20]=id;grid[21][20]='b01_cottage_red'}});
    const index=events.findIndex(e=>e.src===AESTHETIC_TILE_URIS[id]&&e.args.length===8);
    const house=events.findIndex(e=>e.kind==='house');
    assert.ok(index>=0&&index<house,id);
    const draw=events[index];
    assert.ok(draw.args[2]>300&&draw.args[3]>300,'Crop native source before scaling');
    assert.deepEqual(draw.args.slice(-2),id==='r03_road_cross'?[64,64]:[128,64]);
  }
});

test('all 16 sowing assets are registered, playable, stored and sellable', () => {
  assert.equal(SOWN_CROP_IDS.length, 16);
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
    const seed = events[seedIndex], a = SOWN_CROP_DRAW;
    assert.deepEqual(seed.args, [ORIGIN_X + a.dx, ORIGIN_Y + 40 * QUARTER_W + a.dy, a.dw, a.dh]);
    assert.equal(seed.smoothing, false);
    assert.ok(!events.some(e => e.src?.endsWith('/farmland_sprout.png')), 'No sprout on freshly sown soil');
  }
});

test('all 48 growth sprites keep their root on the same ground point and increase in size', () => {
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
    assert.ok(events.some(e => e.src?.endsWith(expected)), expected);
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
  const families = [['b01_cottage_red', 'cottage'], ['b02_tudor_inn', 'inn'], ['b03_blacksmith_forge', 'forge'], ['b04_windmill', 'windmill'], ['b05_watermill', 'watermill'], ['b06_bakery', 'bakery'], ['b07_apothecary', 'herbalist'], ['b08_watchtower', 'watchtower'], ['b09_chapel', 'chapel'], ['b20_noble_manor', 'manor']];
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
  for (const source of [...Object.values(FARM_BUILDINGS), ...Object.values(FARM_ANIMALS)]) {
    const png = readFileSync(new URL(`../public${source.uri}`, import.meta.url));
    assertOriginalAsset(source.uri, png);
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
      const scale = source.worldWidth / source.visibleWidth;
      const [sourceX, sourceY] = source.animalSlots[0];
      const runX = adjustment.dx + sourceX * scale;
      assert.ok(Math.abs(footX - (ORIGIN_X + (flipped ? 128 - runX : runX))) < 1e-6);
      assert.ok(Math.abs(footY - (ORIGIN_Y + 40 * QUARTER_W + adjustment.dy + sourceY * scale)) < 1e-6);
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
    assert.equal(events.filter(e=>e.src===FARM_BUILDINGS.d33_pig_pen_barn.uri).length, visible ? 2 : 1);
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
