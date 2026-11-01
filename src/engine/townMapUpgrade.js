import {BUNDLED_STARTER_MAP_REVISION,createBundledStarterMap} from './starterMapSource.js';
import {MAP_APPLY_KEY,restartMapGrowth} from './mapEditing.js';
import {createPremiumState,isPremiumTile} from '../data/premiumConfig.js';

export const PREVIOUS_TOWN_MAP_KEY='isometric_town_builder_before_map_'+BUNDLED_STARTER_MAP_REVISION;

// Replace only the town layout once per bundled-map release. The active forest
// and account progress are independent of the town's tile coordinates.
export function upgradeSavedTownMap(save,storage){
  if(!save||save.townMapRevision===BUNDLED_STARTER_MAP_REVISION)return save;
  const next=structuredClone(save),forestActive=next.world?.active==='forest';
  const oldTown=forestActive?next.world?.regions?.town:next;
  const doc=restartMapGrowth(createBundledStarterMap());
  const town={...doc,constructions:{},upgradesInProgress:{},productionState:{},extraction:null,defense:null};
  // Purchased land is player progress; the replacement also unlocks its own start area.
  town.land={unlockedChunks:[...new Set([...(oldTown?.land?.unlockedChunks||[]),...doc.land.unlockedChunks])].filter(n=>Number.isInteger(n)&&n>=0&&n<64)};
  if(oldTown?.defense)town.defense={version:1,trainingDone:!!oldTown.defense.trainingDone,enabled:false,phase:oldTown.defense.phase==='result'?'result':'idle',
    result:oldTown.defense.phase==='result'?oldTown.defense.result:null,wave:oldTown.defense.wave,nextRaidId:oldTown.defense.nextRaidId,
    villageHp:oldTown.defense.villageHp,towers:{},enemies:[],soldiers:[],raid:null};
  // Return purchased decorations from the removed layout to the shared bag once.
  next.premium=createPremiumState(next.premium);
  for(const row of oldTown?.grid||[])for(const id of row)if(isPremiumTile(id))next.premium.inventory[id]=Math.min(999,next.premium.inventory[id]+1);
  if(forestActive){
    next.world.regions={...next.world.regions,town};
  }else{
    const wonders=next.kingdomWonders;
    Object.assign(next,town);
    if(wonders)next.kingdomWonders=wonders;
    // The active map is top-level; do not retain a second stale copy of the town.
    if(next.world?.regions)delete next.world.regions.town;
  }
  next.townMapRevision=BUNDLED_STARTER_MAP_REVISION;
  try{
    if(storage&&!storage.getItem(PREVIOUS_TOWN_MAP_KEY))storage.setItem(PREVIOUS_TOWN_MAP_KEY,JSON.stringify(save));
    // A pending application from the previous release cannot undo this migration.
    storage?.removeItem(MAP_APPLY_KEY);
  }catch{/* The requested migration still works if a separate backup cannot fit. */}
  return next;
}
