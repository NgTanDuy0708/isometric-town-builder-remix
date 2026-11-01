import {COMBAT_BUILDING_ART} from './combatArtData.js';
export const COMBAT_BUILDING_LEVELS=Object.fromEntries([
  ['b67_guard_barracks','barracks'],['b68_mage_academy','academy']
].map(([id,kind])=>[id,Object.fromEntries([1,2,3].map(level=>[level,COMBAT_BUILDING_ART[`${kind}_lv${level}`].uri]))]));
export const COMBAT_BUILDING_GEOMETRY=Object.fromEntries([
  ['b67_guard_barracks','barracks'],['b68_mage_academy','academy']
].map(([id,kind])=>[id,Object.fromEntries([1,2,3].map(level=>[level,COMBAT_BUILDING_ART[`${kind}_lv${level}`].geometry]))]));
