import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createWorkerFoodState,getWorkerFoodSummary,updateWorkerFood} from '../src/engine/workerFood.js';
import {createExtractionManager} from '../src/engine/extractionManager.js';
import {createExtractionPanel} from '../src/engine/extractionPanel.js';
import {TILES_DATA} from '../src/data/tilesData.js';
import {getDefaultSaveState,saveGameSave,loadGameSave} from '../src/engine/storage.js';
import {createProductionManager} from '../src/engine/productionManager.js';

const tiles=Object.fromEntries(TILES_DATA.map(tile=>[tile.id,tile]));
function scene() {
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  grid[20][20]='b11_carpenter_sawmill';grid[19][20]='n01_logging_grove';
  grid[22][20]='b01_cottage_red';grid[23][22]='b60_combined_warehouse';grid[25][25]='b06_bakery';
  const resources={},constructions={};let changes=0;
  const ctx={getCurrentGrid:()=>grid,getResources:()=>resources,getConstructions:()=>constructions,
    getBuildingLevels:()=>({}),getTileMap:()=>tiles,getWarehouseCapacity:()=>300,getGold:()=>500,spendGold(){},
    isCellUnlocked:()=>true,onChanged(){changes++;}};
  const manager=createExtractionManager(ctx);manager.init(null);
  return {grid,resources,ctx,manager,changes:()=>changes,
    tick(seconds){for(let i=0;i<Math.round(seconds*10);i++)manager.update(.1);}};
}

test('food scales with assigned worker time and bread supplies four meals without rounding loss',()=>{
  const food=createWorkerFoodState(),resources={bread:2,wheat:3};
  for(let i=0;i<599;i++)updateWorkerFood(food,resources,4,.1);
  assert.equal(resources.bread,1);assert.equal(food.reserve,3);
  updateWorkerFood(food,resources,4,.1);
  assert.equal(food.reserve,2);assert.equal(resources.wheat,3);
  assert.ok(Math.abs(food.progress)<1e-7);
  const status=getWorkerFoodSummary(food,resources,4);
  assert.equal(status.portionsPerMinute,2);assert.equal(status.portions,9);
  updateWorkerFood(food,resources,4,60);
  assert.equal(food.reserve,0);assert.equal(resources.bread,1);
  updateWorkerFood(food,resources,4,30);
  assert.equal(resources.bread,0);assert.equal(food.reserve,3);
});

test('shortages cap unpaid demand, preserve residents, and resume immediately after food arrives',()=>{
  const food=createWorkerFoodState(),resources={};
  updateWorkerFood(food,resources,4,1200);
  assert.equal(food.progress,120);assert.equal(getWorkerFoodSummary(food,resources,4).workSpeed,.5);
  updateWorkerFood(food,resources,4,1000);assert.equal(food.progress,120);
  resources.wheat=2;updateWorkerFood(food,resources,4,.1);
  assert.equal(resources.wheat,1);assert.ok(food.progress<1);
  assert.equal(getWorkerFoodSummary(food,resources,4).workSpeed,1);
  const before=structuredClone(food);updateWorkerFood(food,resources,0,10000);
  assert.deepEqual(food,before);assert.equal(getWorkerFoodSummary(food,resources,0).hungry,false);
});

test('food choices protect disabled ingredients and prepared portions survive a preference change',()=>{
  const food=createWorkerFoodState({enabledFoods:['wheat']}),resources={bread:2,wheat:1,corn:2,roastPork:1};
  updateWorkerFood(food,resources,1,120);assert.equal(resources.wheat,0);assert.equal(resources.bread,2);
  updateWorkerFood(food,resources,1,120);assert.equal(getWorkerFoodSummary(food,resources,1).hungry,true);
  food.enabledFoods=['roastPork'];updateWorkerFood(food,resources,1,.1);
  assert.equal(resources.roastPork,0);assert.equal(food.reserve,7);
  food.enabledFoods=[];updateWorkerFood(food,resources,1,120);
  assert.equal(food.reserve,6);assert.equal(resources.bread,2);
  const normalized=createWorkerFoodState({progress:Infinity,reserve:999,enabledFoods:['bread','bread','wood']});
  assert.deepEqual(normalized,{progress:0,reserve:7,enabledFoods:['bread']});
  assert.deepEqual(createWorkerFoodState({enabledFoods:[]}).enabledFoods,[]);
});

test('actual hungry workers mine at half speed, but can still deliver cargo and retire without eating',()=>{
  const hungry=scene(),fed=scene();
  for(const s of [hungry,fed]){
    s.manager.hire(20,20);
    Object.assign(s.manager.getState().jobs[0],{r:19,c:19,phase:'working',status:'working',path:[],nodeKey:'19_20',work:0});
    s.manager.getState().food.progress=120;
  }
  fed.resources.bread=1;
  hungry.tick(6.1);fed.tick(6.1);
  assert.ok(hungry.manager.getState().jobs[0].work<3.1);
  assert.equal(hungry.manager.getState().nodes['19_20'].remaining,30);
  assert.equal(fed.manager.getState().nodes['19_20'].remaining,28);
  assert.equal(hungry.manager.labor().total,4);assert.equal(hungry.manager.labor().workers,1);
  hungry.resources.wheat=1;hungry.tick(3.1);
  assert.equal(hungry.manager.foodSummary().hungry,false);
  assert.equal(hungry.manager.getState().nodes['19_20'].remaining,28);
  const job=hungry.manager.getState().jobs[0];assert.equal(job.load,2);
  hungry.manager.getState().food.progress=120;
  hungry.manager.dismiss(job.id);hungry.tick(30);
  assert.equal(hungry.resources.wood,2);assert.equal(hungry.manager.labor().workers,0);
  assert.equal(hungry.manager.getState().food.progress,120);
});

test('retiring and surplus assignments do not eat; pause and old saves receive no retrospective charge',()=>{
  const s=scene();s.manager.hire(20,20);s.manager.hire(20,20);
  s.resources.bread=2;
  s.grid[21][20]=s.grid[21][21]=s.grid[21][22]='d13_farmland_plot';
  assert.equal(s.manager.foodSummary().workers,1);
  s.manager.dismiss(s.manager.getState().jobs[0].id);
  assert.equal(s.manager.foodSummary().workers,0);
  s.tick(1);assert.equal(s.resources.bread,2);
  const saved=structuredClone(s.manager.getState());
  saved.jobs=[];s.manager.init(saved);s.tick(120);
  assert.equal(s.resources.bread,2);
  s.manager.init({version:1,jobs:[],nodes:{},seeded:true});
  assert.equal(s.manager.getState().food.progress,0);assert.equal(s.manager.foodSummary().portions,8);
});

test('bakery and worker food share the actual inventory and never spend a wheat twice',()=>{
  const s=scene();s.manager.hire(20,20);s.resources.wheat=1;
  const production=createProductionManager({...s.ctx,getPlayerResources:()=>s.resources});production.init({});
  production.update(1000);assert.equal(s.resources.wheat,0);
  s.manager.getState().food.progress=120;s.tick(.1);
  assert.equal(s.manager.foodSummary().hungry,true);assert.equal(s.resources.wheat,0);
  production.update(61000);assert.equal(production.harvest(25,25,true),true);
  assert.equal(s.resources.bread,1);s.tick(.1);
  assert.equal(s.resources.bread,0);assert.equal(s.manager.getState().food.reserve,3);
  assert.equal(s.manager.foodSummary().hungry,false);
});

test('save/load preserves partial demand and paid portions without charging offline time or resetting preferences',()=>{
  const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),store=new Map();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)??null,
    setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i],get length(){return store.size;}}});
  try{
    const s=scene();s.manager.hire(20,20);s.resources.bread=2;
    s.manager.getState().food.progress=119.5;s.tick(1);
    assert.equal(s.resources.bread,1);assert.equal(s.manager.getState().food.reserve,3);
    s.manager.setFoodEnabled('wheat',false);s.manager.setFoodEnabled('corn',false);
    assert.equal(s.manager.setFoodEnabled('wood',true),false);
    const save=getDefaultSaveState(s.grid);save.grid[12][14]='b14_town_hall';
    Object.assign(save,{resources:s.resources,extraction:s.manager.getState()});
    assert.equal(saveGameSave(save),true);const loaded=loadGameSave();
    const restored=createExtractionManager(s.ctx);restored.init(loaded.extraction);
    assert.deepEqual(restored.getState().food,save.extraction.food);assert.equal(s.resources.bread,1);
    for(let i=0;i<1200;i++)restored.update(.1);
    assert.equal(s.resources.bread,1);assert.equal(restored.getState().food.reserve,2);
    restored.init(null);assert.equal(restored.getState().food.progress,0);assert.equal(restored.getState().food.reserve,0);
  }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});

test('real food controls show demand and shortages and preserve a choice through panel refresh',()=>{
  class Element{
    constructor(tag){this.tag=tag;this.children=[];this.style={};this.textContent='';this.attributes={};this.hidden=true;
      this.classList={add:()=>this.hidden=true,remove:()=>this.hidden=false,contains:()=>this.hidden};}
    append(...nodes){this.children.push(...nodes);}
    replaceChildren(){this.children=[];}
    setAttribute(k,v){this.attributes[k]=v;}
    addEventListener(){}
    focus(){document.activeElement=this;}
    all(){return this.children.flatMap(n=>[n,...n.all()]);}
  }
  const previousDoc=globalThis.document,previousWindow=globalThis.window,root=new Element('div'),body=new Element('div');
  globalThis.document={activeElement:null,getElementById:id=>id==='extraction-modal'?root:id==='extraction-modal-body'?body:null,
    createElement:tag=>new Element(tag)};globalThis.window={addEventListener(){}};
  try{
    const s=scene();s.manager.hire(20,20);s.manager.getState().food.progress=120;
    const panel=createExtractionPanel({getManager:()=>s.manager,getCurrentGrid:()=>s.grid,getResources:()=>s.resources,
      getBuildingLevels:()=>({}),getConstructions:()=>({}),getGold:()=>500});panel.open();
    assert.ok(body.all().some(n=>n.textContent.includes('Thiếu ăn:')));
    const bread=body.all().find(n=>n.id==='worker-food-bread');assert.equal(bread.checked,true);
    bread.focus();bread.checked=false;bread.onchange();
    assert.equal(s.manager.getState().food.enabledFoods.includes('bread'),false);
    assert.equal(document.activeElement.id,'worker-food-bread');
    assert.equal(document.activeElement.checked,false);
    panel.update(1000);assert.equal(body.all().find(n=>n.id==='worker-food-bread').checked,false);
  }finally{globalThis.document=previousDoc;globalThis.window=previousWindow;}
});

test('the actual village HUD reflects hiring, permitted stock, starvation and recovery',()=>{
  const source=fs.readFileSync(new URL('../src/studioEngine.js',import.meta.url),'utf8');
  const start=source.indexOf('    function updateWorkerFoodUI() {');
  const end=source.indexOf('    function updateVillageStatsUI()',start);
  assert.ok(start>=0&&end>start);
  const s=scene(),element={textContent:'',style:{}};
  const context={extractionManager:s.manager,document:{getElementById:()=>element}};
  vm.createContext(context);vm.runInContext(source.slice(start,end),context);
  context.updateWorkerFoodUI();assert.match(element.textContent,/Chưa có công nhân/);
  s.manager.hire(20,20);s.resources.wheat=2;
  context.updateWorkerFoodUI();assert.match(element.textContent,/2 khẩu phần/);
  assert.match(element.textContent,/0,5\/phút/);
  s.resources.wheat=0;s.manager.getState().food.progress=120;
  context.updateWorkerFoodUI();assert.match(element.textContent,/Thiếu ăn/);assert.equal(element.style.color,'#9a3412');
  s.resources.bread=1;s.tick(.1);context.updateWorkerFoodUI();
  assert.match(element.textContent,/3 khẩu phần/);assert.equal(element.style.color,'');
});
