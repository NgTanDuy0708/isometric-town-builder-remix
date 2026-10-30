import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createDefenseManager} from '../src/engine/defenseManager.js';
import {createDefensePanel,getDefenseStatus} from '../src/engine/defensePanel.js';
import {drawGoblin,drawDefenseOverlay} from '../src/engine/defenseRenderer.js';
import {getDefaultSaveState,saveGameSave,loadGameSave} from '../src/engine/storage.js';

function scene(){
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  grid[16][16]='b08_watchtower';grid[18][18]='b14_town_hall';
  let level=6,gold=500,xp=0,changes=0;const levels={},constructions={},locked=new Set(),resources={wood:20,stone:20};
  const rewards=[],notifications=[];
  const ctx={getCurrentGrid:()=>grid,getConstructions:()=>constructions,getBuildingLevels:()=>levels,
    getPlayerLevel:()=>level,getGold:()=>gold,getResources:()=>resources,
    spendGold:n=>gold-=n,addGold:n=>{rewards.push({n,claimed:manager.getState().result.claimed});gold+=n;},addXP:n=>xp+=n,
    isCellUnlocked:(r,c)=>r>=8&&r<24&&c>=8&&c<24&&!locked.has(`${r}_${c}`),random:()=>.5,
    onChanged:()=>changes++,notify:(message,type)=>notifications.push({message,type})};
  const manager=createDefenseManager(ctx);manager.init(null);
  const tick=(seconds,target=manager)=>{for(let i=0;i<Math.ceil(seconds*10);i++)target.update(.1);};
  function battle(){assert.equal(manager.startTraining().ok,true);tick(15.2);assert.equal(manager.getState().phase,'battle');return manager.getState();}
  return {grid,ctx,manager,levels,constructions,locked,resources,tick,battle,rewards,notifications,
    gold:()=>gold,xp:()=>xp,changes:()=>changes,setGold:n=>gold=n,setLevel:n=>level=n};
}

test('defense is opt-in with a level, finished tower, hall and reachable land; failed starts do not mutate money or grid',()=>{
  const s=scene(),map=JSON.stringify(s.grid);s.setLevel(5);
  assert.equal(s.manager.startTraining().ok,false);assert.equal(s.manager.setEnabled(true).ok,false);
  s.tick(2000);assert.equal(s.manager.getState().phase,'idle');assert.equal(s.gold(),500);
  s.setLevel(6);s.constructions['16_16']={};assert.equal(s.manager.startTraining().ok,false);delete s.constructions['16_16'];
  s.grid[18][18]='d12_meadow_wildflowers';assert.equal(s.manager.startTraining().ok,false);s.grid[18][18]='b14_town_hall';
  for(let c=0;c<32;c++)s.grid[15][c]=s.grid[17][c]='b01_cottage_red';
  s.grid[16][15]=s.grid[16][17]='b01_cottage_red';
  assert.equal(s.manager.startTraining().ok,false);
  assert.equal(s.manager.getState().raid,null);assert.equal(s.gold(),500);
  const fresh=scene();assert.equal(JSON.stringify(fresh.grid),map);
});

test('training completes warning, actual goblin movement, tower combat and a single claimable reward',()=>{
  const s=scene();assert.equal(s.manager.startTraining().ok,true);const before=s.manager.getState().remaining;
  s.manager.update(1e9);assert.equal(s.manager.getState().remaining,before-.25);
  s.tick(15);assert.equal(s.manager.getState().phase,'battle');
  s.tick(2);assert.ok(s.manager.getState().enemies.some(enemy=>enemy.path.length));
  s.tick(70);const state=s.manager.getState();
  assert.equal(state.phase,'result');assert.equal(state.result.outcome,'victory');assert.equal(state.trainingDone,true);
  assert.equal(s.gold(),500);assert.equal(s.manager.acknowledge().ok,false);
  assert.equal(s.manager.claimReward().ok,true);assert.equal(s.gold(),580);assert.equal(s.xp(),30);
  assert.equal(s.manager.claimReward().ok,false);assert.equal(s.gold(),580);assert.ok(s.rewards[0].claimed);
  s.manager.init(structuredClone(state));assert.equal(s.manager.claimReward().ok,false);
  assert.equal(s.manager.acknowledge().ok,true);assert.equal(s.manager.getState().phase,'idle');
  assert.equal(s.manager.startTraining().ok,false);s.tick(1000);assert.equal(s.manager.getState().phase,'idle');
});

test('random raids give preparation, preserve a paused timer and cannot be cancelled by toggling during warning',()=>{
  const s=scene();s.manager.getState().trainingDone=true;assert.equal(s.manager.setEnabled(true).ok,true);
  assert.equal(s.manager.getState().remaining,300);s.tick(10);
  assert.equal(s.manager.setEnabled(false).ok,true);const paused=s.manager.getState().remaining;
  s.tick(20);assert.equal(s.manager.getState().remaining,paused);
  s.manager.setEnabled(true);assert.equal(s.manager.getState().remaining,paused);s.tick(291);
  const state=s.manager.getState();assert.equal(state.phase,'warning');assert.equal(state.wave,1);
  s.manager.setEnabled(false);const left=state.remaining;s.tick(1);assert.ok(state.remaining<left);
  s.tick(60);assert.equal(state.phase,'battle');s.tick(100);
  assert.equal(state.phase,'result');assert.equal(state.result.outcome,'victory');
  s.manager.claimReward();s.manager.setEnabled(false);s.manager.acknowledge();assert.equal(state.phase,'idle');
  assert.equal(state.remaining,600);s.manager.setEnabled(true);assert.equal(state.remaining,600);
});

test('tower levels increase real range and damage; a broken tower never fires',()=>{
  for(const [level,expected] of [[1,12],[2,6],[3,0]]){
    const s=scene(),state=s.battle();s.levels['16_16']=level;
    const enemy={id:1,r:12,c:16,hp:30,maxHp:30,path:[],target:null,retry:0,attack:0};
    state.enemies=[enemy];state.raid.spawned=1;state.raid.spawnLeft=3;
    s.tick(.1);assert.equal(enemy.hp,expected);
  }
  const s=scene(),state=s.battle();state.towers['16_16'].hp=0;
  const enemy={id:1,r:15,c:16,hp:30,maxHp:30,path:[],target:null,retry:0,attack:0};
  state.enemies=[enemy];state.raid.spawned=1;state.raid.spawnLeft=3;s.tick(.1);
  assert.equal(enemy.hp,30);assert.ok(s.manager.busyMessage(16,16));
});

test('a lost raid preserves buildings and inventory; repair charges once and allows recovery',()=>{
  const s=scene(),state=s.battle(),map=JSON.stringify(s.grid);state.towers['16_16'].hp=0;
  state.raid.total=state.raid.spawned=1;
  state.enemies=[{id:1,r:18,c:19,hp:30,maxHp:30,path:[],target:null,retry:0,attack:0}];
  assert.equal(s.manager.repair().ok,false);s.tick(16);
  assert.equal(state.phase,'result');assert.equal(state.result.outcome,'defeat');assert.equal(state.villageHp,0);
  assert.equal(JSON.stringify(s.grid),map);assert.deepEqual(s.resources,{wood:20,stone:20});assert.equal(s.gold(),500);
  assert.equal(s.manager.claimReward().ok,false);
  s.setGold(0);assert.equal(s.manager.repair().ok,false);assert.equal(state.villageHp,0);
  s.setGold(500);assert.equal(s.manager.repair().ok,true);assert.equal(s.gold(),450);
  assert.equal(s.manager.repair().ok,false);assert.equal(s.gold(),450);
  assert.equal(s.manager.repair('16_16').ok,true);assert.equal(s.gold(),430);
  assert.deepEqual(s.resources,{wood:17,stone:17});assert.equal(s.manager.busyMessage(16,16),null);
  s.manager.acknowledge();assert.equal(s.manager.startTraining().ok,true);
});

test('blocked or locked paths are retried without crossing buildings, while a timed-out raid retreats without free rewards',()=>{
  const s=scene(),state=s.battle();state.raid.total=state.raid.spawned=1;
  for(let c=0;c<32;c++)s.grid[14][c]='b01_cottage_red';
  const enemy={id:1,r:10,c:16,hp:30,maxHp:30,path:[],target:null,retry:0,attack:0};state.enemies=[enemy];
  s.tick(3);assert.equal(enemy.r,10);assert.equal(enemy.c,16);
  s.grid[14][16]='d12_meadow_wildflowers';s.locked.add('14_16');s.tick(3);assert.equal(enemy.r,10);
  s.locked.clear();s.tick(2);assert.ok(enemy.r>10);
  state.raid.timeLeft=.1;enemy.hp=30;state.towers['16_16'].hp=0;s.tick(.2);
  assert.equal(state.result.outcome,'retreat');assert.equal(s.manager.claimReward().ok,false);assert.equal(s.gold(),500);
});

test('resuming warning or battle preserves wave id, timing, HP and reward flags; old saves remain disabled',()=>{
  const s=scene();s.manager.startTraining();s.tick(5);
  const warning=structuredClone(s.manager.getState()),restored=createDefenseManager(s.ctx);restored.init(warning);
  assert.equal(restored.getState().remaining,warning.remaining);assert.equal(restored.getState().raid.id,warning.raid.id);
  s.tick(11,restored);s.tick(5,restored);const battle=structuredClone(restored.getState());
  assert.equal(battle.phase,'battle');assert.ok(battle.enemies.length);
  restored.init(battle);assert.equal(restored.getState().raid.spawned,battle.raid.spawned);
  assert.equal(restored.getState().enemies[0].hp,battle.enemies[0].hp);
  assert.equal(restored.getState().enemies[0].r,battle.enemies[0].r);
  s.tick(90,restored);assert.equal(restored.getState().result.outcome,'victory');
  const result=structuredClone(restored.getState());restored.init(result);
  assert.equal(restored.getState().result.claimed,false);
  // Use this manager's callback rather than the fixture manager for the claim.
  s.ctx.addGold=n=>s.rewards.push({n});assert.equal(restored.claimReward().ok,true);
  restored.init(structuredClone(restored.getState()));assert.equal(restored.claimReward().ok,false);
  restored.init(null);assert.equal(restored.getState().enabled,false);assert.equal(restored.getState().phase,'idle');
});

test('save service keeps active defense in the same snapshot as money, inventory and map',()=>{
  const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),store=new Map();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)??null,
    setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),key:i=>[...store.keys()][i],get length(){return store.size;}}});
  try{
    const s=scene();s.battle();s.tick(5);const save=getDefaultSaveState(s.grid);
    save.defense=s.manager.getState();save.economy.playerGold=s.gold();save.resources=s.resources;
    assert.equal(saveGameSave(save),true);const loaded=loadGameSave();assert.deepEqual(loaded.defense,save.defense);
    assert.equal(loaded.economy.playerGold,500);assert.deepEqual(loaded.resources,s.resources);
  }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});

test('goblin rendering uses fractional depth and every combat overlay preserves canvas state',()=>{
  const previous=globalThis.Image;globalThis.Image=class{complete=true;naturalWidth=48;src='';};
  let depth=0;const draws=[];
  const canvas=new Proxy({}, {get(_target,k){if(k==='save')return()=>depth++;if(k==='restore')return()=>depth--;
    if(k==='drawImage')return (image,...args)=>draws.push({uri:image.src,args});return()=>{};},set(){return true;}});
  try{
    const s=scene(),state=s.battle();state.enemies=[{r:12.4,c:16.2,hp:15,maxHp:30,path:[{}]}];
    state.towers['16_16'].hp=50;state.towers['16_16'].flash=.1;state.towers['16_16'].aim={r:12.4,c:16.2};
    drawGoblin(canvas,state.enemies[0],1);drawDefenseOverlay(canvas,state,s.grid);
    assert.equal(depth,0);assert.equal(draws.length,1);assert.match(draws[0].uri,/combat\/goblin.svg/);
    const source=fs.readFileSync(new URL('../src/engine/canvasRenderer.js',import.meta.url),'utf8');
    assert.match(source,/queueWorld\(enemy\.r,enemy\.c,/);
  }finally{globalThis.Image=previous;}
});

test('the defense panel routes training, reward, continuation and opt-in through the real manager',()=>{
  class Element{
    constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.hidden=false;this.textContent='';}
    appendChild(node){this.children.push(node);return node;}
    replaceChildren(){this.children=[];}
    addEventListener(name,fn){this.listeners[name]=fn;}
    setAttribute(){}
    all(){return this.children.flatMap(node=>[node,...node.all()]);}
    querySelector(tag){return this.all().find(node=>node.tag===tag);}
    focus(){}
    remove(){this.removed=true;}
  }
  const previousDoc=globalThis.document,previousWindow=globalThis.window,body=new Element('body'),hud=new Element('div');
  globalThis.document={body,createElement:tag=>new Element(tag),getElementById:id=>id==='builder-defense-status'?hud:null};
  globalThis.window={addEventListener(){}};
  const s=scene(),panel=createDefensePanel({manager:s.manager,showToast(){},openUpgradeModal(){}});
  const button=text=>body.all().find(node=>node.tag==='button'&&node.textContent===text);
  try{
    s.setLevel(5);panel.open();assert.equal(button('Bắt đầu diễn tập goblin').disabled,true);
    s.setLevel(6);panel.render();button('Bắt đầu diễn tập goblin').listeners.click();
    assert.equal(s.manager.getState().phase,'warning');assert.match(hud.textContent,/Goblin tới sau/);
    s.tick(90);panel.render();assert.equal(s.manager.getState().result.outcome,'victory');
    button('Nhận 80 vàng + 30 XP').listeners.click();assert.equal(s.gold(),580);
    assert.equal(button('Đã nhận thưởng').disabled,true);button('Tiếp tục').listeners.click();
    assert.equal(s.manager.getState().phase,'idle');button('Bật tấn công ngẫu nhiên').listeners.click();
    assert.equal(s.manager.getState().enabled,true);assert.match(hud.textContent,/Đợt tới sau/);
    button('Dừng các đợt kế tiếp').listeners.click();assert.equal(s.manager.getState().enabled,false);
    assert.match(getDefenseStatus(s.manager.summary()),/đang tắt/);
  }finally{panel.destroy();globalThis.document=previousDoc;globalThis.window=previousWindow;}
});
