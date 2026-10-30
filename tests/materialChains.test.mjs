import test from 'node:test';
import assert from 'node:assert/strict';
import {createExtractionManager} from '../src/engine/extractionManager.js';
import {createProductionManager} from '../src/engine/productionManager.js';
import {getNextUpgrade} from '../src/data/upgradesConfig.js';
import {getWarehouseUsed, WAREHOUSE_RESOURCE_IDS} from '../src/data/resourcesConfig.js';
import {TILES_DATA} from '../src/data/tilesData.js';
import {createExtractionPanel} from '../src/engine/extractionPanel.js';
import {getDefaultSaveState,saveGameSave,loadGameSave} from '../src/engine/storage.js';

const tileMap=Object.fromEntries(TILES_DATA.map(t=>[t.id,t]));
function scene(resources={}) {
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  grid[20][20]='b11_carpenter_sawmill';grid[20][25]='b65_stone_quarry';grid[20][16]='b66_iron_mine';
  grid[19][20]='n01_logging_grove';grid[19][25]='n02_stone_deposit';grid[19][16]='n03_iron_deposit';
  grid[23][22]='b60_combined_warehouse';grid[22][20]='b01_cottage_red';grid[23][25]='b03_blacksmith_forge';
  const levels={},constructions={},rewards=[];let cap=300,playerLevel=4;
  const context={getCurrentGrid:()=>grid,getConstructions:()=>constructions,getBuildingLevels:()=>levels,
    getPlayerResources:()=>resources,getPlayerLevel:()=>playerLevel,getWarehouseCapacity:()=>cap,
    addPlayerGold:n=>rewards.push(n)};
  const manager=createProductionManager(context);manager.init({});manager.scanGrid();
  const extraction=createExtractionManager({...context,getResources:()=>resources,getTileMap:()=>tileMap,
    getGold:()=>500,spendGold:()=>{},isCellUnlocked:()=>true});extraction.init(null);
  function finish(r,c,id) {
    assert.equal(manager.enqueue(r,c,id).ok,true);
    const batch=manager.getState()[`${r}_${c}`].activeBatch;
    manager.update(batch.startedAt+batch.durationMs);
    assert.equal(manager.harvest(r,c,true),true);
  }
  return {grid,resources,levels,constructions,rewards,manager,extraction,finish,
    setCap:n=>cap=n,setLevel:n=>playerLevel=n};
}

test('workers gather ore and the complete raw-material chain supplies a workshop upgrade',()=>{
  const s=scene();
  s.resources.wheat=5;
  for(const c of [20,25,16])assert.equal(s.extraction.hire(20,c).allowed,true);
  assert.equal(s.extraction.labor().free,1);
  for(let i=0;i<900;i++)s.extraction.update(.1);
  for(const id of ['wood','stone','ironOre'])assert.ok(s.resources[id]>=6,id);
  assert.ok(s.extraction.getState().nodes['19_16'].remaining<30);
  // Two planks for the upgrade, plus one to make its tool.
  for(let i=0;i<3;i++)s.finish(20,20,'plank');
  for(let i=0;i<2;i++)s.finish(20,25,'buildingStone');
  s.finish(23,25,'ironIngot');s.finish(23,25,'ironTools');
  const upgrade=getNextUpgrade('b66_iron_mine',1);
  for(const [id,qty] of Object.entries(upgrade.costResources))assert.ok(s.resources[id]>=qty,id);
  assert.equal(s.resources.plank,2);assert.equal(s.resources.buildingStone,2);assert.equal(s.resources.ironTools,1);
  assert.ok(s.rewards.every(n=>n===0),'processing materials does not mint gold');
  assert.equal(s.extraction.labor().workers,3,'processing does not assign another resident');
});

test('manual factories require inputs and level, reserve only once, keep full-warehouse output and refund waiting inputs',()=>{
  const s=scene({ironOre:20,wood:10,plank:1});
  s.manager.update(Date.now()+1e6);
  assert.equal(s.manager.getState()['23_25'].ready,false);
  assert.equal(s.manager.harvest(23,25,true),false);
  assert.equal(s.manager.resumeAutomatic(23,25),false);
  const before=structuredClone(s.resources);
  assert.equal(s.manager.enqueue(23,25,'ironTools').ok,false);
  assert.deepEqual(s.resources,before);
  s.setLevel(3);assert.equal(s.manager.enqueue(23,25,'ironIngot').ok,false);s.setLevel(4);
  s.constructions['23_25']={};assert.equal(s.manager.enqueue(23,25,'ironIngot').ok,false);delete s.constructions['23_25'];
  assert.equal(s.manager.enqueue(20,20,'ironIngot').ok,false);
  for(let i=0;i<5;i++)assert.equal(s.manager.enqueue(23,25,'ironIngot').ok,true);
  const paid=structuredClone(s.resources);
  assert.equal(s.manager.enqueue(23,25,'ironIngot').ok,false);assert.deepEqual(s.resources,paid);
  s.setCap(0);assert.equal(s.manager.cancelQueued(23,25,0),false);
  s.setCap(300);assert.equal(s.manager.cancelQueued(23,25,0),true);
  assert.equal(s.resources.ironOre,paid.ironOre+2);assert.equal(s.resources.wood,paid.wood+1);
  const saved=structuredClone(s.manager.getState());s.manager.setState(saved);
  s.manager.update(saved['23_25'].activeBatch.startedAt+4*30000);
  assert.equal(saved['23_25'].completedBatches.length,4);
  s.setCap(getWarehouseUsed(s.resources));assert.equal(s.manager.harvest(23,25,true),false);
  assert.equal(saved['23_25'].completedBatches.length,4);
  s.setCap(300);for(let i=0;i<4;i++)assert.equal(s.manager.harvest(23,25,true),true);
  assert.equal(s.resources.ironIngot,4);assert.equal(s.manager.harvest(23,25,true),false);
  for(const id of ['ironOre','plank','buildingStone','ironIngot'])assert.equal(WAREHOUSE_RESOURCE_IDS.filter(x=>x===id).length,1);
});

test('old ready or running forge batches survive migration and reload exactly once, then need materials',()=>{
  for(const ready of [false,true]) {
    const s=scene();const now=Date.now();
    s.manager.setState({'23_25':{ready,lastHarvest:now-1000}});
    s.manager.update(now);
    const state=s.manager.getState()['23_25'];assert.equal(state.queueMode,true);
    if(!ready)assert.ok(state.activeBatch);
    s.manager.setState(structuredClone(s.manager.getState()));s.manager.update(now+90000);
    assert.equal(s.manager.harvest(23,25,true),true);assert.equal(s.resources.ironTools,1);
    s.manager.update(now+900000);
    assert.equal(s.manager.harvest(23,25,true),false);assert.equal(s.resources.ironTools,1);
    assert.equal(s.manager.enqueue(23,25,'ironTools').ok,false);
  }
});

test('directly collecting a legacy forge before its first tick does not grant a second free batch',()=>{
  const s=scene();s.manager.setState({'23_25':{ready:true,lastHarvest:Date.now()-90000}});
  assert.equal(s.manager.harvest(23,25,true),true);
  s.manager.update(Date.now()+900000);
  assert.equal(s.manager.harvest(23,25,true),false);assert.equal(s.resources.ironTools,1);
});

test('extraction panels expose processing for wood and stone with the correct workshop coordinates',()=>{
  class Element {
    constructor(){this.children=[];this.style={};this.hidden=true;this.textContent='';
      this.classList={add:()=>this.hidden=true,remove:()=>this.hidden=false,contains:()=>this.hidden};}
    append(...nodes){this.children.push(...nodes);}
    replaceChildren(){this.children=[];}
    addEventListener(){}
    setAttribute(){}
    all(){return this.children.flatMap(n=>[n,...n.all()]);}
  }
  const previousDocument=globalThis.document,previousWindow=globalThis.window;
  const root=new Element(),body=new Element();
  globalThis.document={getElementById:id=>id==='extraction-modal'?root:id==='extraction-modal-body'?body:null,
    createElement:()=>new Element()};globalThis.window={addEventListener(){}};
  try {
    const s=scene();let opened=null;
    const panel=createExtractionPanel({getManager:()=>s.extraction,getCurrentGrid:()=>s.grid,getResources:()=>s.resources,
      getBuildingLevels:()=>s.levels,getConstructions:()=>s.constructions,getGold:()=>500,
      openProductionModal:(r,c)=>opened=[r,c]});
    for(const c of [20,25]){
      panel.open(20,c);const button=body.all().find(n=>n.textContent==='Chế biến nguyên liệu');
      assert.ok(button);assert.equal(button.disabled,false);button.onclick();
      assert.deepEqual(opened,[20,c]);assert.equal(root.hidden,true);
    }
    panel.open(20,16);assert.equal(body.all().some(n=>n.textContent==='Chế biến nguyên liệu'),false);
    s.constructions['20_20']={};panel.open(20,20);
    assert.equal(body.all().find(n=>n.textContent==='Chế biến nguyên liệu').disabled,true);
  } finally {globalThis.document=previousDocument;globalThis.window=previousWindow;}
});

test('the save service round-trips ore workers, new inventory and queued material inputs together',()=>{
  const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),store=new Map();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)??null,
    setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i],get length(){return store.size;}}});
  try {
    const s=scene({ironOre:8,wood:4,buildingStone:2,plank:3,ironIngot:1});
    assert.equal(s.extraction.hire(20,16).allowed,true);
    assert.equal(s.manager.enqueue(23,25,'ironIngot').ok,true);
    assert.equal(s.manager.enqueue(23,25,'ironTools').ok,true);
    const save=getDefaultSaveState(s.grid);save.grid[12][14]='b14_town_hall';
    Object.assign(save,{resources:s.resources,extraction:s.extraction.getState(),productionState:s.manager.getState()});
    assert.equal(saveGameSave(save),true);const loaded=loadGameSave();
    assert.equal(loaded.extraction.jobs[0].tileId,'b66_iron_mine');
    assert.deepEqual(loaded.resources,save.resources);
    assert.deepEqual(loaded.productionState,save.productionState);
    s.manager.setState(loaded.productionState);s.extraction.init(loaded.extraction);
    const p=s.manager.getState()['23_25'];s.manager.update(p.activeBatch.startedAt+75000);
    assert.equal(s.manager.harvest(23,25,true),true);assert.equal(s.manager.harvest(23,25,true),true);
    assert.equal(s.manager.harvest(23,25,true),false);
    assert.equal(s.extraction.labor().workers,1);
  } finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});
