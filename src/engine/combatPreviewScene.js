import {TILES_DATA} from '../data/tilesData.js';
import {createDefenseManager} from './defenseManager.js';
import {combatVisualState} from './combatAnimation.js';

// This scene is isolated from storage; it uses the real battle manager and map
// renderer, so visual QA cannot change a player's village or rewards.
export function createCombatPreviewScene(kind='goblin'){
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  const levels={};
  for(let level=1;level<=3;level++){
    grid[12][11+level*3]='b67_guard_barracks';levels[`12_${11+level*3}`]=level;
    grid[15][11+level*3]='b68_mage_academy';levels[`15_${11+level*3}`]=level;
  }
  grid[20][16]='b08_watchtower';grid[21][19]='b14_town_hall';
  for(const c of [14,15,16])grid[24][c]='b01_cottage_red';
  const tiles=Object.fromEntries(TILES_DATA.map(tile=>[tile.id,tile]));
  const manager=createDefenseManager({getCurrentGrid:()=>grid,getBuildingLevels:()=>levels,getConstructions:()=>({}),
    getTileMap:()=>tiles,getExtractionState:()=>({jobs:[]}),getPlayerLevel:()=>12,getResources:()=>({}),getGold:()=>500,
    spendGold(){},getFoodSpeed:()=>1,isCellUnlocked:()=>true});
  function reset(){
    manager.init({phase:'battle',villageHp:100,raid:{id:1,kind,training:false,spawn:{r:20,c:23},total:kind==='dragon'?1:kind==='troll'?3:6,spawned:0,spawnLeft:0,timeLeft:120},
      soldiers:[{...combatVisualState(),homeRow:12,homeCol:17,unitType:'guard',r:20,c:20,hp:60,trainLeft:0},
        {...combatVisualState(),homeRow:12,homeCol:17,unitType:'guard',r:21,c:20,hp:60,trainLeft:0},
        {...combatVisualState(),homeRow:15,homeCol:17,unitType:'mage',r:20,c:18,hp:40,trainLeft:0}]});
  }
  reset();return {grid,levels,manager,reset};
}
