export const BARRACKS_TILE='b67_guard_barracks';
export const MAGE_ACADEMY_TILE='b68_mage_academy';
export const SOLDIER_COST={gold:50,resources:{ironTools:1}};
export const SOLDIER_TRAIN_SECONDS=20;
export const SOLDIER_HP=60;
export const SOLDIER_DAMAGE=12;
export const SOLDIER_SPEED=1.1;
export const SOLDIER_RECOVERY_PER_SECOND=2;
export const MILITARY_UNITS={
  guard:{name:'Lính cận chiến',hp:SOLDIER_HP,damage:SOLDIER_DAMAGE,range:1.01,interval:1,splash:0,trainSeconds:SOLDIER_TRAIN_SECONDS,
    cost:SOLDIER_COST,level:6,sprite:COMBAT_SHEETS.guard.uri},
  mage:{name:'Pháp sư',hp:40,damage:14,range:3,interval:2,splash:1,trainSeconds:30,
    cost:{gold:80,resources:{ironTools:1,fabric:2}},level:8,sprite:COMBAT_SHEETS.mage.uri}
};
export const MILITARY_CAMPS={
  [BARRACKS_TILE]:{name:'Trại vệ binh',unitType:'guard'},
  [MAGE_ACADEMY_TILE]:{name:'Học viện pháp sư',unitType:'mage'}
};
export const getMilitaryUnit=soldier=>MILITARY_UNITS[soldier?.unitType]||MILITARY_UNITS.guard;
export const getSoldierSlots=level=>Math.min(6,Math.max(2,Math.floor(Number(level)||1)*2));
export function getAssignedSoldiers(grid,defense){
  return (Array.isArray(defense?.soldiers)?defense.soldiers:[]).filter(soldier=>
    soldier&&MILITARY_CAMPS[grid[soldier.homeRow]?.[soldier.homeCol]]?.unitType===(soldier.unitType||'guard'));
}
import {COMBAT_SHEETS} from './combatArtData.js';
