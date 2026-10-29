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
  const families = [['b01_cottage_red', 'cottage'], ['b02_tudor_inn', 'inn'], ['b03_blacksmith_forge', 'forge'], ['b04_windmill', 'windmill'], ['b05_watermill', 'watermill'], ['b06_bakery', 'bakery'], ['b07_apothecary', 'herbalist'], ['b08_watchtower', 'watchtower'], ['b09_chapel', 'chapel']];
  for (const [tileId, stem] of families) {
    for (const level of [1, 2, 3]) {
      const uri = getBuildingSpriteUri(tileId, level);
      assert.equal(uri, `/assets/buildings/${stem}_lv${level}.png`);
      const png = readFileSync(new URL(`../public${uri}`, import.meta.url));
      const source = BUILDING_SOURCE_GEOMETRY[tileId]?.[level];
      assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], source ? [source.width, source.height] : [256, 256]);
      if (source) {
        const original = readFileSync(new URL(`../assets-source/${stem}/${stem}_lv${level}_source.png`, import.meta.url));
        assert.deepEqual(png, original, 'Game uses the untouched generated PNG, not a pixelized derivative');
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

test('main town hall draws once across its 2x3 cells, with one native asset at every level', () => {
  const id = 'b14_town_hall';
  const uri = getBuildingSpriteUri(id);
  const png = readFileSync(new URL(`../public${uri}`, import.meta.url));
  assert.deepEqual(png, readFileSync(new URL('../assets-source/town-hall/town_hall_main_source.png', import.meta.url)));
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
    assert.ok(Math.abs(sprite.args[0] + sprite.args[2] * source.anchorX / source.width - (x + 128)) < 1e-6);
    assert.ok(Math.abs(sprite.args[1] + sprite.args[3] * source.anchorY / source.height - (y + 160)) < 1e-6);
    assert.equal(sprite.smoothingQuality, 'high');
    assert.ok(!events.some(e => e.src === '/assets/buildings/town_hall_royal.png'));
  }
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
