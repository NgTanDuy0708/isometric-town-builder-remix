import test from 'node:test';
import assert from 'node:assert/strict';
import {createTutorialManager} from '../src/engine/tutorialManager.js';
import {createTutorialState} from '../src/engine/tutorialProgress.js';
import {BASIC_STEPS,getGuide,getLevelGuide,getLevelUnlocks} from '../src/data/tutorialGuides.js';
import {chooseCoachPlacement} from '../src/engine/tutorialView.js';
import {getDefaultSaveState,saveGameSave,loadGameSave,exportGameToJSON,importGameFromJSON} from '../src/engine/storage.js';
import {CROPS_CONFIG} from '../src/data/cropsConfig.js';
import {TILES_DATA} from '../src/data/tilesData.js';
import {getTileRequiredLevel} from '../src/data/gameEconomy.js';
import {getShopCategory,EXCLUDED_SHOP_TILES} from '../src/data/shopCatalog.js';

function fixture(raw){
  const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  const pending={},farms={},resources={wheat:0},ui={panels:{},shopCategory:null},paid={gold:0,xp:0};let brush=null,seed=null,level=1,blocked=false,model;
  const ctx={autoTick:false,getCurrentGrid:()=>grid,getConstructions:()=>pending,getFarmlandState:()=>farms,getPlayerResources:()=>resources,
    getActiveBrush:()=>brush,getActiveSeedBrush:()=>seed,getPlayerLevel:()=>level,getTutorialUi:()=>ui,isTutorialBlocked:()=>blocked,
    finishTutorialPlacement:()=>{brush=null;seed=null;},
    addPlayerGold:n=>paid.gold+=n,addPlayerXP:n=>paid.xp+=n,onChanged:()=>{},closeTutorialPanels:()=>{ui.panels={};ui.shopCategory=null;},
    view:{render:m=>model=m,hide:()=>{},destroy:()=>{}},getControlMode:()=> 'desktop'};
  const manager=createTutorialManager(ctx);manager.init(raw,{fresh:true});manager.start();
  return {manager,grid,pending,farms,resources,ui,paid,ctx,data,model:()=>model,
    brush:v=>brush=v,seed:v=>seed=v,level:v=>level=v,block:v=>blocked=v,step:()=>manager.getCurrentStepInfo()?.step.id,
    check:()=>manager.checkProgress()};
}
function reachFirstHarvest(f){
  const {manager:m}=f;m.next();assert.equal(f.step(),'house-shop');
  f.ui.panels.shop=true;f.check();assert.equal(f.step(),'house-category');
  f.ui.shopCategory='residential';f.check();assert.equal(f.step(),'choose-house');
  f.brush('b01_cottage_red');f.ui.panels.shop=false;f.ui.shopCategory=null;f.check();assert.equal(f.step(),'place-house');
  f.pending['16_16']={row:16,col:16,targetTileId:'b01_cottage_red',startTime:Date.now(),durationMs:25000};
  f.check();assert.equal(f.step(),'leave-house-tool');f.brush(null);f.check();assert.equal(f.step(),'camera');
  m.next();assert.equal(f.step(),'wait-house');f.check();assert.equal(f.step(),'wait-house','pending construction cannot supply farmers');
  f.grid[16][16]='b01_cottage_red';delete f.pending['16_16'];f.check();assert.equal(f.step(),'population');m.next();assert.equal(f.step(),'farm-shop');
  f.ui.panels.shop=true;f.check();f.ui.shopCategory='farming';f.check();f.brush('d13_farmland_plot');f.ui.panels.shop=false;f.ui.shopCategory=null;f.check();
  assert.equal(f.step(),'place-farm');f.grid[17][16]='d13_farmland_plot';f.check();assert.equal(f.step(),'leave-farm-tool');f.brush(null);f.check();
  assert.equal(f.step(),'open-seed');f.ui.panels.seed=true;f.check();assert.equal(f.step(),'plant-wheat');
  f.farms['17_16']={seedId:'wheat',plantTime:Date.now()};f.seed('wheat');f.ui.panels.seed=false;m.onAction('plant_seed',{seedId:'wheat'});
  assert.equal(f.step(),'leave-seed-tool');f.seed(null);f.check();assert.equal(f.step(),'wait-wheat');
  f.farms['17_16'].plantTime=Date.now()-26000;f.check();assert.equal(f.step(),'harvest-wheat');
}
test('novice must finish a home before farming, exit both tools, wait for wheat, and sell the right item',()=>{
  const f=fixture();reachFirstHarvest(f);f.resources.wheat=3;delete f.farms['17_16'];f.manager.onAction('harvest_crop',{seedId:'wheat'});
  assert.equal(f.step(),'market-open');f.ui.panels.market=true;f.check();assert.equal(f.step(),'sell-wheat');
  f.manager.onAction('market_sell',{resourceId:'carrot'});assert.equal(f.step(),'sell-wheat');
  f.resources.wheat=2;f.manager.onAction('market_sell',{resourceId:'wheat'});assert.equal(f.step(),'market-close');
  f.ui.panels.market=false;f.check();assert.equal(f.step(),'quests-open');f.ui.panels.quests=true;f.check();assert.equal(f.step(),'quests-help');
  f.manager.next();assert.equal(f.step(),'warehouse-open');f.ui.panels.warehouse=true;f.check();assert.equal(f.step(),'warehouse');
  f.manager.next();assert.equal(f.step(),'controls');f.manager.next();assert.equal(f.step(),'complete');f.manager.next();
  assert.deepEqual(f.paid,{gold:200,xp:20});assert.equal(f.manager.getState().basic.status,'complete');
  f.manager.start(true);f.manager.getState().basic.stepId='complete';f.manager.next();assert.deepEqual(f.paid,{gold:200,xp:20},'replay never pays again');f.manager.destroy();
});
test('reload preserves a pending house and lost crops recover instead of blocking onboarding',()=>{
  const f=fixture({basic:{status:'active',stepId:'wait-house'}});
  f.pending['16_16']={row:16,col:16,targetTileId:'b01_cottage_red',startTime:Date.now(),durationMs:25000};
  f.manager.init({basic:{status:'active',stepId:'wait-house'}},{fresh:true});f.manager.start();assert.equal(f.step(),'wait-house');
  delete f.pending['16_16'];f.check();assert.equal(f.step(),'house-shop','cancelled construction reopens the purchase steps');
  // No home remains after a cancellation: the tutorial points back to a home purchase.
  f.manager.getState().basic.stepId='farm-shop';f.check();assert.equal(f.step(),'house-shop');
  f.grid[16][16]='b01_cottage_red';f.grid[17][16]='d13_farmland_plot';f.manager.getState().basic.stepId='wait-wheat';f.check();assert.equal(f.step(),'open-seed');
  f.farms['17_16']={seedId:'wheat',plantTime:Date.now()};f.manager.getState().basic.stepId='wait-wheat';
  f.seed('wheat');f.check();assert.equal(f.step(),'leave-seed-tool','a late seed brush cannot trap the harvest step');f.seed(null);f.check();
  const snapshot=JSON.parse(JSON.stringify(f.manager.getState()));f.manager.init(snapshot,{fresh:true});f.manager.start();assert.equal(f.step(),'wait-wheat');f.manager.destroy();
});
test('several levels and a first town event queue once, defer across reload and complete only after acknowledgement',()=>{
  const f=fixture({basic:{status:'skipped'},lastLevel:1});f.block(true);f.level(4);f.manager.checkAndTriggerLevelTutorial(4);
  f.manager.onTownEvent('village_fair');f.manager.onTownEvent('village_fair');
  assert.deepEqual(f.manager.getState().queue,['level-2','level-3','level-4','event-village_fair']);assert.deepEqual(f.manager.getState().completedGuides,[]);
  f.block(false);f.check();assert.equal(f.manager.getState().activeGuide,'level-2');assert.deepEqual(f.manager.getState().completedGuides,[]);
  f.manager.defer();const snapshot=JSON.parse(JSON.stringify(f.manager.getState()));f.manager.init(snapshot,{fresh:true});f.manager.start();assert.equal(f.manager.getState().deferred,true);
  f.manager.resume();assert.equal(f.manager.getState().activeGuide,'level-2');f.manager.skipTutorial();assert.ok(f.manager.getState().completedGuides.includes('level-2'));
  assert.equal(f.manager.getState().activeGuide,'level-3');f.manager.checkAndTriggerLevelTutorial(4);assert.deepEqual(f.manager.getState().queue,['level-4','event-village_fair']);
  f.manager.skipTutorial();f.manager.skipTutorial();assert.equal(f.manager.getState().activeGuide,'event-village_fair');f.manager.next();
  f.manager.onTownEvent('village_fair');assert.equal(f.manager.getState().activeGuide,null);assert.deepEqual(f.manager.getState().queue,[]);f.manager.destroy();
});
test('feature tours wait for the right panel/category and keep touch instructions distinct',()=>{
  const f=fixture({basic:{status:'skipped'},lastLevel:1});f.level(4);f.manager.checkAndTriggerLevelTutorial(4);
  f.manager.next();assert.equal(f.step(),'chickens-open');f.ui.panels.shop=true;f.ui.shopCategory='residential';f.check();assert.equal(f.step(),'chickens-category');
  f.ui.shopCategory='farming';f.check();assert.equal(f.step(),'chickens-explain');f.manager.next();assert.ok(!f.manager.getState().completedGuides.includes('level-2'));
  const basic=fixture();basic.manager.toggleDevice();assert.equal(basic.model().device,'touch');assert.match(basic.model().step.touch,/Chạm/);
  assert.match(BASIC_STEPS.find(s=>s.id==='place-house').touch,/✓/);assert.match(BASIC_STEPS.find(s=>s.id==='place-house').desktop,/nhấp/);f.manager.destroy();basic.manager.destroy();
});
test('skip gives no reward; new game resets guidance/rewards and legacy flags cannot skip an empty village',()=>{
  const f=fixture();f.manager.skipTutorial();assert.deepEqual(f.paid,{gold:0,xp:0});
  f.data.set('town_builder_tutorial_completed','true');f.manager.init(null);f.manager.start();assert.equal(f.step(),'welcome');
  f.manager.getState().rewarded=true;f.manager.resetForNewGame();f.manager.start();assert.equal(f.manager.getState().rewarded,false);assert.equal(f.step(),'welcome');f.manager.destroy();
});
test('all 25 levels use actual catalog/crop unlocks; military and forest guides are included at their unlock',()=>{
  for(let level=1;level<=25;level++){
    const guide=getLevelGuide(level);assert.ok(guide.steps.length);assert.equal(new Set(guide.steps.map(s=>s.id)).size,guide.steps.length);
    assert.deepEqual(getLevelUnlocks(level).crops.map(c=>c.id),Object.values(CROPS_CONFIG).filter(c=>(c.requiredLevel||1)===level).map(c=>c.id));
    const expected=TILES_DATA.filter(t=>getTileRequiredLevel(t.id)===level&&getShopCategory(t)&&getShopCategory(t)!=='hidden'&&!EXCLUDED_SHOP_TILES.has(t.id)&&!['b14_town_hall','b60_combined_warehouse'].includes(t.id));
    for(const tile of expected)assert.ok(guide.steps.some(s=>s.body?.includes(tile.label)),tile.id);
  }
  for(const [level,id]of [[4,'workers'],[6,'defense'],[8,'mages'],[10,'forest'],[12,'dragons']])assert.ok(getLevelGuide(level).steps.some(s=>s.id===id+'-explain'));
  assert.equal(getGuide('level-26'),null);assert.equal(getGuide('event-made-up'),null);
});
test('full save/load and JSON export/import preserve active tutorial and deferred guides',async()=>{
  fixture();const save=getDefaultSaveState();save.tutorial=createTutorialState({basic:{status:'active',stepId:'wait-house'},rewarded:true,lastLevel:6,
    activeGuide:'level-4',guideStepId:'workers-open',queue:['level-5','level-6'],completedGuides:['level-2','level-3'],deferred:true});
  assert.ok(saveGameSave(save));assert.deepEqual(loadGameSave().tutorial,save.tutorial);
  let blob;const oldURL=globalThis.URL,oldDoc=globalThis.document;
  globalThis.URL={createObjectURL:b=>(blob=b,'blob:test'),revokeObjectURL:()=>{}};
  globalThis.document={createElement:()=>({click(){},remove(){}}),body:{appendChild(){},removeChild(){}}};
  const oldTimer=globalThis.setTimeout,cleanup=[];globalThis.setTimeout=fn=>cleanup.push(fn);
  exportGameToJSON(save);cleanup.forEach(fn=>fn());globalThis.setTimeout=oldTimer;const payload=JSON.parse(await blob.text());assert.deepEqual(payload.tutorial,save.tutorial);
  globalThis.FileReader=class{readAsText(file){this.result=file.content;this.onload({target:{result:this.result}});}};
  const imported=await importGameFromJSON({content:JSON.stringify(payload)},save.grid);assert.deepEqual(imported.tutorial,save.tutorial);
  globalThis.URL=oldURL;globalThis.document=oldDoc;delete globalThis.FileReader;
});
test('coach placement avoids the highlighted button and stays inside desktop and phone viewports',()=>{
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
    const target={x:12,y:viewport.height-100,width:100,height:60};const card={width:Math.min(370,viewport.width-24),height:280};
    const p=chooseCoachPlacement(viewport,card,target);assert.ok(p.x>=0&&p.y>=0&&p.x+p.width<=viewport.width&&p.y+p.height<=viewport.height);
    assert.ok(p.y+p.height<target.y||p.x>target.x+target.width);
  }
});

test('unlock hand follows shop, category, exact item and recovers when a player navigates away',()=>{
  const f=fixture({basic:{status:'skipped'},lastLevel:1});f.level(2);f.manager.checkAndTriggerLevelTutorial(2);f.manager.next();
  assert.equal(f.model().step.target,'#btn-open-shop');assert.equal(f.model().step.ack,false);
  f.ui.panels.shop=true;f.check();assert.equal(f.step(),'chickens-category');assert.equal(f.model().step.target,'[data-shop-cat="farming"]');
  f.ui.shopCategory='production';f.check();assert.equal(f.model().step.target,'#shop-modal-back-btn');assert.match(f.model().step.body,/mũi tên/);
  f.ui.shopCategory=null;f.check();assert.equal(f.model().step.target,'[data-shop-cat="farming"]');
  f.ui.shopCategory='farming';f.check();assert.equal(f.step(),'chickens-explain');assert.equal(f.model().step.target,'[data-tile-id="b21_chicken_coop"]');assert.equal(f.model().step.ack,true);
  f.ui.panels.shop=false;f.check();assert.equal(f.model().step.target,'#btn-open-shop');assert.equal(f.model().step.ack,false);
  f.manager.next();assert.equal(f.step(),'chickens-explain','cannot acknowledge an item that has disappeared with its panel');
  f.ui.panels.shop=true;f.ui.shopCategory=null;f.check();assert.equal(f.model().step.target,'[data-shop-cat="farming"]');
  f.ui.shopCategory='farming';f.check();assert.equal(f.model().step.target,'[data-tile-id="b21_chicken_coop"]');
  f.manager.next();assert.notEqual(f.step(),'chickens-place','reading only never opens placement');assert.deepEqual(f.paid,{gold:0,xp:0});f.manager.destroy();
});
test('selecting a newly unlocked card teaches placement, then puts the brush away after build or cancellation',()=>{
  const make=()=>fixture({basic:{status:'skipped'},activeGuide:'level-2',guideStepId:'chickens-explain',lastLevel:2});
  for(const cancel of [false,true]){
    const f=make();f.brush('b21_chicken_coop');f.ui.panels.shop=false;f.check();assert.equal(f.step(),'chickens-place');
    assert.equal(f.model().step.world,'empty');assert.match(f.model().step.touch,/✓/);
    if(cancel){f.brush(null);f.check();}else{f.pending['17_16']={targetTileId:'b21_chicken_coop'};f.manager.onAction('build_tile',{tileId:'b21_chicken_coop'});}
    assert.notEqual(f.step(),'chickens-place');assert.equal(f.ctx.getActiveBrush(),null);assert.deepEqual(f.paid,{gold:0,xp:0});f.manager.destroy();
  }
});
test('every shop unlock has its own exact card and explicit category, including multiple items and pen limits',()=>{
  for(let level=1;level<=25;level++){
    const guide=getLevelGuide(level);
    for(const tile of getLevelUnlocks(level).tiles){
      if(tile.id==='b69_forester_lodge')continue;
      const step=guide.steps.find(s=>s.inspectTileId===tile.id);assert.ok(step,`${level}: ${tile.id}`);
      assert.equal(step.target,`[data-tile-id="${tile.id}"]`);assert.equal(step.category,getShopCategory(tile));assert.ok(step.body.includes(tile.label)||step.title===tile.label);
      assert.equal(guide.steps[guide.steps.indexOf(step)-1].shopStage,'category');
    }
    for(const tile of getLevelUnlocks(level).pens)assert.ok(guide.steps.some(s=>s.inspectTileId===tile.id&&s.body.includes('tối đa')));
    for(const id of EXCLUDED_SHOP_TILES)assert.ok(!guide.steps.some(s=>s.inspectTileId===id));
  }
});
test('new seeds point to their own seed row and closing the picker returns to an empty plot',()=>{
  const f=fixture({basic:{status:'skipped'},lastLevel:2,activeGuide:'level-2',guideStepId:'crops-explain'});
  assert.equal(f.model().step.world,'empty-farm');assert.equal(f.model().step.ack,false);
  f.ui.panels.seed=true;f.check();assert.equal(f.model().step.target,'[data-seed-id="tomato"]');assert.equal(f.model().step.ack,true);
  f.manager.onAction('plant_seed',{seedId:'tomato'});assert.notEqual(f.step(),'crops-explain');assert.equal(f.ctx.getActiveSeedBrush(),null);f.manager.destroy();
});
test('replaying current level restarts its tour without clearing other unseen guides or paying rewards',()=>{
  const f=fixture({basic:{status:'skipped'},lastLevel:4,activeGuide:'level-3',guideStepId:'bread-explain',queue:['level-4'],completedGuides:['level-2'],deferred:true});
  f.level(2);f.manager.replayLevelTutorial();assert.equal(f.manager.getState().activeGuide,'level-2');assert.equal(f.step(),'summary');
  assert.equal(f.manager.getState().deferred,false);assert.deepEqual(f.manager.getState().queue,['level-3','level-4']);assert.ok(!f.manager.getState().completedGuides.includes('level-2'));
  f.manager.replayLevelTutorial();assert.equal(f.step(),'summary');assert.deepEqual(f.paid,{gold:0,xp:0});f.manager.destroy();
});

test('reading consecutive cards keeps their shop or seed picker open and points to the next item',()=>{
  const shop=fixture({basic:{status:'skipped'},activeGuide:'level-2',lastLevel:2,guideStepId:'catalog-decor-explain'});
  shop.ui.panels.shop=true;shop.ui.shopCategory='decor';shop.check();shop.manager.next();
  assert.equal(shop.ui.panels.shop,true);assert.equal(shop.model().step.target,'[data-tile-id="d31_forest_pine_cliff"]');shop.manager.destroy();
  const seeds=fixture({basic:{status:'skipped'},activeGuide:'level-2',lastLevel:2,guideStepId:'crops-explain'});
  seeds.ui.panels.seed=true;seeds.check();seeds.manager.next();assert.equal(seeds.ui.panels.seed,true);
  assert.equal(seeds.model().step.target,'[data-seed-id="strawberry"]');seeds.manager.destroy();
});
