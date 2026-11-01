import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getEncounterKind,getEnemyWave,getRaidReward} from '../src/data/defenseConfig.js';
import {createDefenseManager} from '../src/engine/defenseManager.js';
import {RAID_SHEETS} from '../src/data/raidArtData.js';
import {selectRaidFrame,drawRaidCharacter} from '../src/engine/raidAnimation.js';
import {inspectPng} from '../scripts/pngMetadata.mjs';
import {TILES_DATA} from '../src/data/tilesData.js';

const tiles=Object.fromEntries(TILES_DATA.map(t=>[t.id,t]));
function scene(kind='dragon'){
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  grid[16][16]='b08_watchtower';grid[18][18]='b14_town_hall';grid[20][20]='b01_cottage_red';grid[20][21]='b67_guard_barracks';grid[21][21]='b68_mage_academy';
  let level=12,gold=0,gems=0,victories=0;
  const manager=createDefenseManager({getCurrentGrid:()=>grid,getTileMap:()=>tiles,getConstructions:()=>({}),getBuildingLevels:()=>({}),
    getPlayerLevel:()=>level,getResources:()=>({bread:20}),getGold:()=>500,isCellUnlocked:()=>true,getFoodSpeed:()=>1,
    addGold:n=>{gold+=n;},addGems:n=>{gems+=n;},onVictory:()=>victories++});
  const reset=()=>manager.init({phase:'battle',trainingDone:true,wave:3,villageHp:100,
    raid:{id:4,kind,training:false,spawn:{r:12,c:16},total:1,spawned:0,spawnLeft:0,timeLeft:120}});
  reset();return {grid,manager,reset,setLevel:n=>{level=n;},gold:()=>gold,gems:()=>gems,victories:()=>victories};
}
test('high-level encounters respect unlocks, forest identity, and the three-wave dragon cadence',()=>{
  assert.equal(getEncounterKind(3,6),'goblin');assert.equal(getEncounterKind(2,10),'troll');
  assert.equal(getEncounterKind(1,10,'forest'),'troll');assert.equal(getEncounterKind(3,12),'dragon');
  assert.equal(getEnemyWave('dragon',3).flying,true);assert.equal(getEnemyWave('dragon',3).count,1);
  assert.equal(getRaidReward(false,3,'dragon').gems,1);assert.equal(getRaidReward(true,3,'dragon').gems,undefined);
});
test('dragon spawn, flight over blocked terrain and ranged fire use the actual manager',()=>{
  const s=scene();s.manager.update(.1);const state=s.manager.getState(),dragon=state.enemies[0];
  assert.equal(dragon.kind,'dragon');assert.equal(dragon.flying,true);
  const start=dragon.r;s.grid[13][16]='d28_forest_dense_canopy';
  for(let i=0;i<40;i++)s.manager.update(.1);
  assert.ok(dragon.r>start);assert.ok(state.towers['16_16'].hp<100,'Dragon fires before reaching adjacent cells');
  assert.ok(dragon.flightPhase>0);assert.ok(dragon.fireAim);
});
test('melee guards cannot hit flying dragons while a mage can, and dragon reward is claimed once',()=>{
  const s=scene();const state=s.manager.getState();s.manager.update(.1);
  const dragon=state.enemies[0];dragon.r=20;dragon.c=20;
  state.soldiers=[{id:1,unitType:'guard',homeRow:20,homeCol:21,r:20,c:20,hp:60,trainLeft:0,path:[],cooldown:0,retry:0},
    {id:2,unitType:'mage',homeRow:21,homeCol:21,r:20,c:19,hp:40,trainLeft:0,path:[],cooldown:0,retry:0}];
  const hp=dragon.hp;s.manager.update(.1);assert.equal(dragon.hp,hp-14,'Only the mage deals damage');
  dragon.hp=0;s.manager.update(.1);assert.equal(state.phase,'result');
  assert.equal(s.manager.claimReward().ok,true);assert.equal(s.gems(),1);assert.equal(s.victories(),1);
  assert.equal(s.manager.claimReward().ok,false);assert.equal(s.gems(),1);assert.equal(s.victories(),1);
});
test('advanced training is level gated, repeat practice grants no rewards and enemy type survives reload',()=>{
  const s=scene('troll');const saved=structuredClone(s.manager.getState());
  s.manager.init(saved);s.manager.update(.1);assert.equal(s.manager.getState().enemies[0].kind,'troll');
  s.manager.init({trainingDone:true});s.setLevel(10);assert.equal(s.manager.startTraining('dragon').ok,false);
  assert.equal(s.manager.startTraining('troll').ok,true);assert.equal(s.manager.getState().raid.kind,'troll');assert.equal(s.manager.getState().raid.practice,true);
  for(let i=0;i<160;i++)s.manager.update(.1);
  const state=s.manager.getState();state.raid.spawned=state.raid.total;state.enemies.forEach(e=>{e.hp=0;});
  s.manager.update(.1);assert.equal(state.result.practice,true);assert.equal(s.manager.claimReward().ok,false);
});
test('native four-direction raid sheets have sixteen bounded poses, transparent edges and stable ground contacts',()=>{
  for(const[kind,asset]of Object.entries(RAID_SHEETS)){
    const bytes=readFileSync(new URL('../public'+asset.uri,import.meta.url)),png=inspectPng(bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);assert.equal(png.alphaMin,0);
    assert.equal(png.width,asset.width);assert.equal(png.height,asset.height);
    for(const frames of Object.values(asset.directions)){assert.equal(frames.length,4);for(const f of frames){
      assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=asset.width&&f.y+f.h<=asset.height);assert.ok(f.anchorY<=f.h&&f.anchorX>=0&&f.anchorX<=f.w);
    }}
    assert.notEqual(selectRaidFrame(kind,{facing:'SE',path:[{}],walkPhase:0,flightPhase:0}).index,
      selectRaidFrame(kind,{facing:'SE',path:[{}],walkPhase:1,flightPhase:.2}).index);
  }
  const old=globalThis.Image,draws=[];globalThis.Image=class{complete=true;naturalWidth=1254;src='';};
  const ctx=new Proxy({}, {get(_target,k){if(k==='drawImage')return(image,...args)=>draws.push([image.src,...args]);return()=>{};},set(){return true;}});
  try{for(const kind of ['dragon','troll'])assert.ok(drawRaidCharacter(ctx,{kind,facing:'SE'},100,100));assert.equal(draws.length,2);assert.ok(draws.every(d=>d.length===9));}finally{globalThis.Image=old;}
});
