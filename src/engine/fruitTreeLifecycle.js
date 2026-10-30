import {FRUIT_TREES_CONFIG,FRUIT_TREE_MAX_HARVESTS} from '../data/fruitTreeConfig.js';
import {RESOURCE_MAX_CAPACITY,getWarehouseUsed} from '../data/resourcesConfig.js';

export function createFruitTreeState(now=Date.now()) {
  return {lastHarvest:now,plantedAt:now,harvestCount:0,hasHarvested:false,exhausted:false,ready:false};
}

export function normalizeFruitTreeState(state) {
  const saved=state||{lastHarvest:0};
  const recorded=Number.isFinite(saved.harvestCount)?Math.max(0,Math.floor(saved.harvestCount)):(saved.hasHarvested?1:0);
  const harvestCount=saved.exhausted?FRUIT_TREE_MAX_HARVESTS:Math.min(FRUIT_TREE_MAX_HARVESTS,recorded);
  const exhausted=harvestCount>=FRUIT_TREE_MAX_HARVESTS;
  return {...saved,harvestCount,hasHarvested:harvestCount>0,exhausted,ready:exhausted?false:!!saved.ready};
}

// Counts are monotonic for the same planted tree. A stale ready flag can
// neither revive an exhausted tree nor skip a newer harvest cooldown.
export function resolveFruitTreeState(production,fruit) {
  if(!production)return normalizeFruitTreeState(fruit);
  if(!fruit)return normalizeFruitTreeState(production);
  const p=Number(production.lastHarvest)||0,f=Number(fruit.lastHarvest)||0;
  const latest=p>=f?production:fruit,older=p>=f?fruit:production;
  if(Number.isFinite(latest.plantedAt)&&Number.isFinite(older.plantedAt)&&latest.plantedAt>older.plantedAt)
    return normalizeFruitTreeState(latest);
  const a=normalizeFruitTreeState(production),b=normalizeFruitTreeState(fruit);
  return normalizeFruitTreeState({...older,...latest,
    harvestCount:Math.max(a.harvestCount,b.harvestCount),exhausted:a.exhausted||b.exhausted,
    ready:p===f?(!!production.ready||!!fruit.ready):!!latest.ready});
}

export function getFruitTreeVisual(tileId,state,now=Date.now()) {
  const cfg=FRUIT_TREES_CONFIG[tileId];
  if(!cfg)return undefined;
  const tree=normalizeFruitTreeState(state);
  const remainingHarvests=FRUIT_TREE_MAX_HARVESTS-tree.harvestCount;
  if(tree.exhausted)return {stage:'withered',ready:false,progress:1,exhausted:true,remainingHarvests:0,harvestCount:tree.harvestCount};
  const intervalMs=cfg.intervalSec*1000;
  const elapsed=Math.max(0,now-(tree.lastHarvest||0));
  const progress=Math.min(1,elapsed/intervalMs);
  const ready=tree.ready||progress>=1;
  const firstGrowth=Number.isFinite(tree.plantedAt)&&tree.harvestCount===0;
  const stage=ready?'fruiting':!firstGrowth?'flowering':
    progress<.12?'seed':progress<.25?'sprout':progress<.43?'seedling':progress<.68?'young':'flowering';
  return {stage,ready,progress,exhausted:false,remainingHarvests,harvestCount:tree.harvestCount};
}

export function forceFruitTreeReady(tileId,state,now=Date.now()) {
  const cfg=FRUIT_TREES_CONFIG[tileId],tree=normalizeFruitTreeState(state);
  if(!cfg||tree.exhausted)return tree;
  return {...tree,lastHarvest:now-cfg.intervalSec*1000,ready:true};
}

// No mutation on rejection, and each successful harvest consumes one of the
// three lifetime harvests. The third one leaves a permanent, fruitless tree.
export function harvestFruitTreeProduce(tileId,state,resources,capacity,now=Date.now(),yieldMultiplier=1) {
  const cfg=FRUIT_TREES_CONFIG[tileId];
  if(!cfg)return {ok:false,reason:'unknown'};
  const tree=normalizeFruitTreeState(state),visual=getFruitTreeVisual(tileId,tree,now);
  if(visual.exhausted)return {ok:false,reason:'exhausted'};
  if(!visual.ready)return {ok:false,reason:'growing',waitSec:Math.ceil(cfg.intervalSec*(1-visual.progress))};
  const qty=Math.max(1,Math.floor(cfg.yieldQty*yieldMultiplier));
  if(getWarehouseUsed(resources)+qty>capacity||(resources[cfg.fruitId]||0)+qty>RESOURCE_MAX_CAPACITY)return {ok:false,reason:'storageFull'};
  resources[cfg.fruitId]=(resources[cfg.fruitId]||0)+qty;
  return {ok:true,qty,nextState:normalizeFruitTreeState({...tree,lastHarvest:now,ready:false,harvestCount:tree.harvestCount+1})};
}
