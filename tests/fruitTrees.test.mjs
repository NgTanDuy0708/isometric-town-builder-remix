import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {FRUIT_TREES_CONFIG,RESOURCES_CONFIG,WAREHOUSE_RESOURCE_IDS,getWarehouseUsed,RESOURCE_MAX_CAPACITY} from '../src/data/resourcesConfig.js';
import {PRODUCTION_BUILDINGS,getBuildingYield,getTileCost,getTileBuildDuration} from '../src/data/gameEconomy.js';
import {TILES_DATA} from '../src/data/tilesData.js';
import {EXPANSION_PLANTS,getFruitTreeRenderAdjustment} from '../src/data/fruitTreeSprites.js';
import {AESTHETIC_TILE_URIS} from '../src/data/aestheticTileIcons.js';
import {TILE_DATA_URIS} from '../src/data/sprites.js';
import {createFruitTreeState,getFruitTreeVisual,harvestFruitTreeProduce,resolveFruitTreeState,forceFruitTreeReady} from '../src/engine/fruitTreeLifecycle.js';
import {createProductionManager} from '../src/engine/productionManager.js';
import {RESOURCE_PRODUCERS} from '../src/data/orderBoardConfig.js';
import {findHitBubble,initInputHandler} from '../src/engine/inputHandler.js';
import {ORIGIN_X,ORIGIN_Y,QUARTER_W} from '../src/engine/isoMath.js';
import {getLivestockAnchor,isLivestockPart,clearLivestockParts} from '../src/data/livestockFootprint.js';
import {isLivestockTile} from '../src/data/livestockConfig.js';
import {getTerrainSprite} from '../src/data/terrainConfig.js';
import {isCellUnlocked} from '../src/data/landConfig.js';
import {isProtectedTile,isIndestructibleTile} from '../src/data/starterMap.js';
import {isMapLockedCell,isMapRemovableCell} from '../src/data/mapLocks.js';
import {getClearedSurface} from '../src/engine/placementSurface.js';
import {calculateDemolishRefund} from '../src/engine/upgradeManager.js';

test('all fifty-six tree sprites are native generated PNGs with common scale and grounded feet',()=>{
  assert.equal(Object.keys(EXPANSION_PLANTS).length,8);
  for(const [id,data] of Object.entries(EXPANSION_PLANTS)){
    assert.equal(Object.keys(data.stages).length,7,id);
    assert.equal(AESTHETIC_TILE_URIS[id],data.stages.fruiting);
    assert.equal(TILE_DATA_URIS[id],data.stages.fruiting);
    const scale=getFruitTreeRenderAdjustment(id,"fruiting").dw/data.geometry.fruiting.width;
    for(const [stage,uri] of Object.entries(data.stages)){
      const bytes=readFileSync(new URL('../public'+uri,import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'),data.geometry[stage].sha256);
      const a=getFruitTreeRenderAdjustment(id,stage),g=data.geometry[stage];
      const stageScale=a.dw/g.width;
      if(stage==="seed"||stage==="sprout")assert.ok(stageScale<=scale);
      else assert.equal(stageScale,scale,"Retain the mature scale");
      assert.ok(Math.abs(a.dx+g.anchor.x*stageScale-64)<1e-8);
      assert.ok(Math.abs(a.dy+g.anchor.y*stageScale-96)<1e-8);
    }
    const height=s=>{const g=data.geometry[s];return (g.bounds[3]-g.bounds[1])*getFruitTreeRenderAdjustment(id,s).dh/g.height};
    assert.ok(height('seed')<height('sprout')&&height('sprout')<height('seedling'),id+' has distinct early stages');
    assert.ok(height('seedling')<height('young')&&height('young')<height('fruiting'),id+' grows in place');
  }
});

test('all eight species germinate, grow, give exactly three harvests and remain dead forever',()=>{
  const plantedAt=1800000000000;
  for(const [id,cfg] of Object.entries(FRUIT_TREES_CONFIG)){
    let state=createFruitTreeState(plantedAt);const duration=cfg.intervalSec*1000,resources={};
    for(const [progress,stage] of [[0,'seed'],[.18,'sprout'],[.33,'seedling'],[.55,'young'],[.8,'flowering'],[1,'fruiting']])
      assert.equal(getFruitTreeVisual(id,state,plantedAt+duration*progress).stage,stage,id);
    assert.equal(harvestFruitTreeProduce(id,state,resources,300,plantedAt+duration-1).ok,false);
    for(let n=1;n<=3;n++){
      const time=plantedAt+duration*n,result=harvestFruitTreeProduce(id,state,resources,300,time);
      assert.equal(result.ok,true,id+' harvest '+n);state=result.nextState;
      assert.equal(state.harvestCount,n);assert.equal(resources[cfg.fruitId],cfg.yieldQty*n);
      assert.equal(getFruitTreeVisual(id,state,time).stage,n===3?'withered':'flowering');
      assert.equal(harvestFruitTreeProduce(id,state,resources,300,time).ok,false,'No double harvest');
    }
    for(const time of [plantedAt+duration*4,plantedAt+86400000,plantedAt+365*86400000]){
      const visual=getFruitTreeVisual(id,state,time);
      assert.equal(visual.stage,'withered');assert.equal(visual.ready,false);assert.equal(visual.remainingHarvests,0);
      assert.equal(harvestFruitTreeProduce(id,state,resources,300,time).reason,'exhausted');
      assert.equal(getFruitTreeVisual(id,forceFruitTreeReady(id,state,time),time).stage,'withered','Speed tools never revive exhausted trees');
    }
    assert.equal(getWarehouseUsed(resources),cfg.yieldQty*3);
    assert.equal(PRODUCTION_BUILDINGS[id].yieldResource,cfg.fruitId);assert.equal(getBuildingYield(id),cfg.yieldQty);
    assert.equal(RESOURCE_PRODUCERS[cfg.fruitId],id);assert.ok(WAREHOUSE_RESOURCE_IDS.includes(cfg.fruitId));
    assert.ok(RESOURCES_CONFIG[cfg.fruitId].sellPrice>0);
  }
});

test('full warehouse or per-fruit limit retains ripe art, timer, rewards and produce',()=>{
  for(const [id,cfg] of Object.entries(FRUIT_TREES_CONFIG)){
    for(const resources of [{wheat:300},{[cfg.fruitId]:RESOURCE_MAX_CAPACITY-1}]){
      const state={lastHarvest:0,ready:true},original=structuredClone(resources);
      const result=harvestFruitTreeProduce(id,state,resources,resources.wheat?300:9999);
      assert.equal(result.reason,'storageFull');assert.deepEqual(resources,original);
      assert.deepEqual(state,{lastHarvest:0,ready:true});
      assert.equal(getFruitTreeVisual(id,state).stage,'fruiting');
    }
  }
});

test('production manager and harvest hit targets handle all species with one consistent timer',()=>{
  const now=1800000000000,grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  const fruit={},resources={},levels={},harvests=[];
  let manager;
  const ctx={getCurrentGrid:()=>grid,getBuildingLevels:()=>levels,getPlayerResources:()=>resources,getFruitTreesState:()=>fruit,
    harvestFruitTreeCell(row,col){const key=row+'_'+col,id=grid[row][col];const r=harvestFruitTreeProduce(id,resolveFruitTreeState(manager.getState()[key],fruit[key]),resources,300,now+90000);if(!r.ok)return false;fruit[key]={...r.nextState};manager.setEntry(key,{...r.nextState});harvests.push(id);return true}};
  manager=createProductionManager(ctx);manager.init({});
  Object.keys(FRUIT_TREES_CONFIG).forEach((id,i)=>{grid[20][10+i]=id;levels['20_'+(10+i)]=3;manager.markBuilt('20_'+(10+i),id,now)});
  manager.update(now+10000);
  for(const [i,id] of Object.keys(FRUIT_TREES_CONFIG).entries()){
    const key='20_'+(10+i);assert.equal(manager.getState()[key].ready,false);
    assert.equal(manager.getState()[key].plantedAt,now);
    const duration=FRUIT_TREES_CONFIG[id].intervalSec*1000;
    const state=manager.getState()[key];
    assert.equal(getFruitTreeVisual(id,state,now+duration-1).ready,false,'Levels cannot accelerate only the bubble timer');
  }
  manager.update(now+90000);
  for(let i=0;i<8;i++){assert.equal(manager.getState()['20_'+(10+i)].ready,true);assert.equal(manager.harvest(20,10+i),true);assert.equal(manager.harvest(20,10+i),false)}
  assert.equal(harvests.length,8);assert.ok(getWarehouseUsed(resources)>0);
  // A stale ready production entry must not override a newer harvest store.
  const id='d21_apple_tree',key='20_10',recent={lastHarvest:Date.now(),hasHarvested:true,ready:false};
  fruit[key]=recent;manager.setEntry(key,{lastHarvest:0,ready:true});
  assert.equal(getFruitTreeVisual(id,resolveFruitTreeState(manager.getState()[key],fruit[key])).stage,'flowering');
  const x=ORIGIN_X+(10-20)*64+64,y=ORIGIN_Y+30*QUARTER_W+6;
  assert.equal(findHitBubble(x,y,{},manager.getState(),grid,fruit,null,false)?.row===20&&findHitBubble(x,y,{},manager.getState(),grid,fruit,null,false)?.col===10,false,'No stale harvest bubble after picking fruit');
});

test('legacy tree cooldowns survive migration without planting them again',()=>{
  const now=1800000000000;
  for(const id of Object.keys(FRUIT_TREES_CONFIG)){
    const state={lastHarvest:now-2000,ready:false};
    const merged=resolveFruitTreeState(state,{lastHarvest:0,ready:true});
    assert.equal(merged.lastHarvest,state.lastHarvest);assert.equal(getFruitTreeVisual(id,merged,now).stage,'flowering');
    assert.equal(getFruitTreeVisual(id,{lastHarvest:0},now).stage,'fruiting');
  }
});

test('the real studio harvest awards exactly three yields and never a fourth',()=>{
  const source=readFileSync(new URL('../src/studioEngine.js',import.meta.url),'utf8');
  const start=source.indexOf('    function harvestFruitTree(row, col, silent = false) {');
  const end=source.indexOf('\n    // Khởi tạo Quản Gia',start);
  assert.ok(start>0&&end>start);
  for(const [id,cfg] of Object.entries(FRUIT_TREES_CONFIG)){
    const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));grid[20][20]=id;
    let clock=1800000000000;
    const fruit={'20_20':{lastHarvest:0}},prod={'20_20':{lastHarvest:0,ready:true}},resources={},events=[];
    const context={Date:{now:()=>clock},ROWS:32,COLS:32,currentGrid:grid,FRUIT_TREES_CONFIG,fruitTreesState:fruit,playerResources:resources,
      playerGold:500,totalHarvestsCount:0,warehouseCapacity:300,townEventsManager:null,
      productionManager:{getState:()=>prod,setEntry:(key,state)=>{prod[key]=state}},
      resolveFruitTreeState,harvestFruitTreeProduce,
      addPlayerXP:qty=>events.push(['xp',qty]),updateGoldDisplay(){},updateResourcesUI(){},checkQuestsProgress(){},
      requestRender(){},persistGameState:()=>events.push(['save']),spawnFlyingProduce(){},showToast(){},showStorageFullModal:()=>events.push(['full'])};
    vm.createContext(context);vm.runInContext(source.slice(start,end),context);
    assert.equal(context.harvestFruitTree(20,20,true),true,id);
    assert.equal(resources[cfg.fruitId],cfg.yieldQty);assert.equal(context.playerGold,500+cfg.rewardGold);
    assert.equal(context.totalHarvestsCount,1);assert.deepEqual(events[0],['xp',cfg.rewardXP]);
    assert.equal(getFruitTreeVisual(id,fruit['20_20']).stage,'flowering');
    assert.equal(prod['20_20'].lastHarvest,fruit['20_20'].lastHarvest);
    assert.equal(context.harvestFruitTree(20,20,true),false);assert.equal(context.playerGold,500+cfg.rewardGold);
    assert.equal(context.totalHarvestsCount,1);assert.equal(resources[cfg.fruitId],cfg.yieldQty);
    for(let n=2;n<=3;n++){clock+=cfg.intervalSec*1000;assert.equal(context.harvestFruitTree(20,20,true),true);assert.equal(fruit['20_20'].harvestCount,n)}
    clock+=86400000;
    assert.equal(context.harvestFruitTree(20,20,true),false);assert.equal(fruit['20_20'].exhausted,true);
    assert.equal(context.totalHarvestsCount,3);assert.equal(resources[cfg.fruitId],cfg.yieldQty*3);
    assert.equal(context.playerGold,500+cfg.rewardGold*3);
    // Refusing a full warehouse never changes the ripe state or gives rewards.
    resources.wheat=300;fruit['20_20']={lastHarvest:0,ready:true};prod['20_20']={lastHarvest:0,ready:true};
    assert.equal(context.harvestFruitTree(20,20,true),false);assert.equal(fruit['20_20'].lastHarvest,0);
    assert.equal(context.playerGold,500+cfg.rewardGold*3);
  }
});

test('buying and placing each tree sows a seed immediately, charges once, and does not construct a grown tree',()=>{
  const noop=()=>{};
  globalThis.window={addEventListener:noop};globalThis.document={getElementById:()=>null};
  for(const id of Object.keys(FRUIT_TREES_CONFIG)){
    const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
    const fruit={},prod={},constructions={},tileMap=Object.fromEntries(TILES_DATA.map(t=>[t.id,t]));
    let gold=10000;
    const ctx={getActiveBrush:()=>id,getMovingBuilding:()=>null,getHoverCell:()=>({row:20,col:20}),
      getConstructions:()=>constructions,getCurrentGrid:()=>grid,getFlippedGrid:()=>({}),getTileMap:()=>tileMap,
      getGameMode:()=> 'game',getProductionState:()=>prod,getFruitTreesState:()=>fruit,
      getLandUnlockedChunks:()=>Array.from({length:64},(_,i)=>i),getPlayerGold:()=>gold,deductGold:n=>{gold-=n},
      getBrushFlipped:()=>false,updateGoldDisplay:noop,saveGameEconomyState:noop,pushUndo:noop,
      saveFlippedGrid:noop,saveConstructionsState:noop,updateVillageStatsUI:noop,checkQuestsProgress:noop,
      requestRender:noop,showToast:noop,triggerAutoSave:noop};
    const input=initInputHandler({addEventListener:noop},ctx);
    assert.equal(getTileBuildDuration(id),0,id+' sow instantly');
    assert.equal(input.confirmPlacement(),true);assert.equal(grid[20][20],id);
    assert.equal(gold,10000-getTileCost(id,tileMap[id].category));assert.equal(Object.keys(constructions).length,0);
    assert.equal(getFruitTreeVisual(id,prod['20_20']).stage,'seed');assert.equal(prod['20_20'].harvestCount,0);
    assert.deepEqual(prod['20_20'],fruit['20_20']);
    assert.equal(input.confirmPlacement(),false);assert.equal(gold,10000-getTileCost(id,tileMap[id].category));
    input.destroy();
  }
});

test('permanent death beats stale ready data through reload and production ticks',()=>{
  const now=Date.now();
  for(const id of Object.keys(FRUIT_TREES_CONFIG)){
    const dead={...createFruitTreeState(now-999999),lastHarvest:now-50000,harvestCount:3,exhausted:true,ready:false};
    const stale={...dead,harvestCount:1,exhausted:false,ready:true};
    const merged=resolveFruitTreeState(stale,JSON.parse(JSON.stringify(dead)));
    assert.equal(merged.harvestCount,3);assert.equal(getFruitTreeVisual(id,merged,now+999999999).ready,false);
    const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));grid[20][20]=id;
    const fruit={'20_20':dead};
    const m=createProductionManager({getCurrentGrid:()=>grid,getBuildingLevels:()=>({}),getPlayerResources:()=>({}),getFruitTreesState:()=>fruit});
    m.init({'20_20':stale});m.update(now+999999999);
    assert.equal(m.getState()['20_20'].ready,false);assert.equal(m.getState()['20_20'].harvestCount,3);
    assert.equal(getFruitTreeVisual(id,fruit['20_20'],now+999999999).stage,'withered');
    assert.equal(getFruitTreeVisual(id,createFruitTreeState(now),now).stage,'seed','Only planting a new tree resets its lifetime');
  }
});

test('digging a spent tree clears its lifetime state and releases the tile for a new seed',async()=>{
  const { checkHousingRemoval } = await import('../src/engine/workforce.js');
  const source=readFileSync(new URL('../src/studioEngine.js',import.meta.url),'utf8');
  const start=source.indexOf('    function eraseCell(row, col) {'),end=source.indexOf('    // Process active constructions tick',start);
  const noop=()=>{};
  for(const id of Object.keys(FRUIT_TREES_CONFIG)){
    const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));grid[20][20]=id;
    const key='20_20',dead={lastHarvest:1,harvestCount:3,exhausted:true,ready:false},fruit={[key]:{...dead}},prod={[key]:{...dead}};
    const ctx={isMapLockedCell,isMapRemovableCell,mapScenery:{},checkHousingRemoval,ROWS:32,COLS:32,currentGrid:grid,constructions:{},fences:[],fruitTreesState:fruit,
      productionManager:{getState:()=>prod,clearCell:key=>{delete prod[key]}},tileMap:Object.fromEntries(TILES_DATA.map(t=>[t.id,t])),
      gameMode:'game',landUnlockedChunks:Array.from({length:64},(_,i)=>i),terrainMap:null,flippedGrid:{},farmlandState:{},
      buildingLevels:{},upgradesInProgress:{},livestockState:{},playerGold:100,playerResources:{},RESOURCE_MAX_CAPACITY,
      getLivestockAnchor,clearLivestockParts,isLivestockTile,isLivestockPart,getTerrainSprite,isProtectedTile,isIndestructibleTile,
      isCellUnlocked,getClearedSurface,calculateDemolishRefund,FRUIT_TREES_CONFIG,getFruitTreeVisual,resolveFruitTreeState,
      showToast:noop,removeFenceAt:noop,saveFlippedGrid:noop,saveConstructionsState:noop,updateGoldDisplay:noop,
      saveGameEconomyState:noop,updateResourcesUI:noop,saveProductionState:noop,updateVillageStatsUI:noop,checkQuestsProgress:noop,persistGameState:noop,requestRender:noop};
    vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
    assert.equal(ctx.eraseCell(20,20),true);assert.equal(grid[20][20],'d12_meadow_wildflowers');
    assert.equal(fruit[key],undefined);assert.equal(prod[key],undefined);assert.equal(ctx.playerGold,100,'Spent trees do not refund seed gold');
    const newTree=createFruitTreeState();assert.equal(newTree.harvestCount,0);assert.equal(getFruitTreeVisual(id,newTree).stage,'seed');
  }
});

test('real mouse and touch gestures sow once, touch panning never sows, and spent trees expose the dig action',t=>{
  const noop=()=>{},oldWindow=globalThis.window,oldDocument=globalThis.document;
  t.after(()=>{globalThis.window=oldWindow;globalThis.document=oldDocument});
  function surface(){const listeners={};return {addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn),
    dispatch:(type,e)=>{for(const fn of listeners[type]||[])fn(e)},getBoundingClientRect:()=>({left:0,top:0}),
    style:{},classList:{add:noop,remove:noop,toggle:noop}}}
  for(const pointerType of ['mouse','touch']){
    const container=surface(),win=surface(),overlay=surface(),dig=surface(),title={},label={};
    dig.querySelector=()=>label;
    globalThis.window=win;globalThis.document={getElementById:id=>({'object-action-overlay':overlay,'obj-action-demolish-btn':dig,'obj-action-title':title}[id]||null)};
    const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
    const fruit={},prod={},constructions={},tileMap=Object.fromEntries(TILES_DATA.map(tile=>[tile.id,tile]));
    let brush='d21_apple_tree',gold=10000,ghost=null;const dug=[];
    const ctx={getCamera:()=>({x:0,y:0,zoom:1}),screenToWorldCoords:(x,y)=>({x,y}),worldToCell:()=>({row:20,col:20}),
      getActiveBrush:()=>brush,setActiveBrush:value=>{brush=value},getActiveSeedBrush:()=>null,getMovingBuilding:()=>null,
      getCurrentGrid:()=>grid,getProductionState:()=>prod,getFruitTreesState:()=>fruit,getFarmlandState:()=>({}),getBuildingLevels:()=>({}),
      getConstructions:()=>constructions,getFlippedGrid:()=>({}),getTileMap:()=>tileMap,getGameMode:()=> 'game',getVillagerManager:()=>null,
      getLandUnlockedChunks:()=>Array.from({length:64},(_,i)=>i),getPlayerGold:()=>gold,deductGold:n=>{gold-=n},getBrushFlipped:()=>false,
      getHoverCell:()=>ghost,setHoverCell:cell=>{ghost=cell},updateFloatingBrushHUD:noop,
      updateGoldDisplay:noop,saveGameEconomyState:noop,pushUndo:noop,saveFlippedGrid:noop,saveConstructionsState:noop,
      updateVillageStatsUI:noop,checkQuestsProgress:noop,requestRender:noop,showToast:noop,triggerAutoSave:noop,clampCamera:noop,
      eraseCell:(row,col)=>{dug.push([row,col]);return true}};
    const input=initInputHandler(container,ctx);
    const event={clientX:200,clientY:200,button:0,isPrimary:true,pointerId:1,pointerType,preventDefault:noop,stopPropagation:noop};
    if(pointerType==='touch'){
      container.dispatch('pointerdown',event);
      win.dispatch('pointermove',{...event,clientX:240});win.dispatch('pointerup',{...event,clientX:240});
      assert.equal(grid[20][20],'d12_meadow_wildflowers');assert.equal(gold,10000,'Panning does not buy seeds');
    }
    container.dispatch('pointerdown',event);win.dispatch('pointerup',event);
    assert.equal(grid[20][20],'d21_apple_tree',pointerType+' plants without a separate confirmation');
    assert.equal(gold,10000-getTileCost('d21_apple_tree',tileMap.d21_apple_tree.category));
    assert.equal(getFruitTreeVisual('d21_apple_tree',fruit['20_20']).stage,'seed');
    brush=null;Object.assign(fruit['20_20'],{harvestCount:3,exhausted:true,ready:false});prod['20_20']={...fruit['20_20']};
    container.dispatch('pointerdown',event);win.dispatch('pointerup',event);
    assert.equal(overlay.style.display,'flex');assert.equal(label.textContent,'Đào cây');assert.match(title.textContent,/3\/3/);
    dig.dispatch('click',event);assert.deepEqual(dug,[[20,20]],pointerType+' dig button reaches the actual erase route');
    input.destroy();
  }
});
