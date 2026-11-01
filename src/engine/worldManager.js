import {REGION_FIELDS,FOREST_UNLOCK,FOREST_MISSIONS,paidLandCount,createForestRegion} from '../data/worldConfig.js';
import {getWorkforce} from './workforce.js';
import {createExtractionManager} from './extractionManager.js';
import {createProductionManager} from './productionManager.js';
import {createDefenseManager} from './defenseManager.js';
import {isCellUnlocked} from '../data/landConfig.js';

const clone=value=>structuredClone(value);
export const regionalSnapshot=save=>Object.fromEntries(REGION_FIELDS.filter(k=>save[k]!==undefined).map(k=>[k,clone(save[k])]));
export function createWorldState(raw){
  const forest=raw?.regions?.forest,town=raw?.regions?.town;
  const valid=s=>Array.isArray(s?.grid)&&s.grid.length===32&&s.grid.every(row=>Array.isArray(row)&&row.length===32&&row.every(id=>typeof id==='string'));
  const active=raw?.active==='forest'&&raw?.unlocked?.includes('forest')&&valid(town)?'forest':'town';
  return {version:1,active,unlocked:raw?.unlocked?.includes('forest')?['town','forest']:['town'],
    regions:{...(valid(town)?{town:regionalSnapshot(town)}:{}),...(valid(forest)?{forest:regionalSnapshot(forest)}:{})},
    completedMissions:Array.isArray(raw?.completedMissions)?FOREST_MISSIONS.filter(m=>raw.completedMissions.includes(m.id)).map(m=>m.id):[],
    forestVictories:Math.max(0,Math.floor(Number(raw?.forestVictories)||0))};
}

export function createWorldManager(ctx){
  let state=createWorldState(),background=null,changing=false;
  function init(saved){state=createWorldState(saved);background=null;}
  function getState(){
    // Only inactive snapshots are stored; active map is already the top-level save.
    const regions={...state.regions};delete regions[state.active];
    return {...state,regions};
  }
  function otherLabor(region=state.active){
    const maps={...state.regions,[state.active]:ctx.getSave()};let population=0,assigned=0;
    for(const [id,map] of Object.entries(maps))if(id!==region&&map?.grid){
      const labor=getWorkforce(map.grid,map.constructions,ctx.getTileMap(),map.buildingLevels,map.extraction,map.defense);
      population+=labor.total;assigned+=labor.farmers+labor.workers+labor.soldiers;
    }
    return {population,assigned};
  }
  function requirements(){
    const save=ctx.getSave(),town=state.active==='town'?save:state.regions.town;
    return {level:(save.playerLevel||1)>=FOREST_UNLOCK.level,
      land:paidLandCount(town?.land?.unlockedChunks)>=FOREST_UNLOCK.chunks,
      training:!!town?.defense?.trainingDone};
  }
  function unlock(){
    if(state.unlocked.includes('forest'))return {ok:false,error:'Rừng đã được mở.'};
    if(Object.values(requirements()).some(v=>!v))return {ok:false,error:'Cần cấp 10, thắng diễn tập và khai phá 8 khu đất trả phí ở làng.'};
    const save=ctx.getSave(),resources=ctx.getResources();
    if(save.economy.playerGold<FOREST_UNLOCK.gold||Object.entries(FOREST_UNLOCK.resources).some(([id,n])=>(resources[id]||0)<n))return {ok:false,error:'Cần 500 vàng, 10 ván và 8 đá xây dựng để mở đường.'};
    ctx.spendGold(FOREST_UNLOCK.gold);for(const [id,n]of Object.entries(FOREST_UNLOCK.resources))resources[id]-=n;
    for(const chunk of [51,52,59,60])if(!save.land.unlockedChunks.includes(chunk))save.land.unlockedChunks.push(chunk);
    state.unlocked.push('forest');state.regions.forest=createForestRegion();ctx.onChanged();return {ok:true};
  }
  function travel(id){
    if(changing)return {ok:false,error:'Đang chuyển vùng.'};
    if(!state.unlocked.includes(id)||!['town','forest'].includes(id))return {ok:false,error:'Vùng đất chưa mở.'};
    if(id===state.active)return {ok:false,error:'Bạn đang ở vùng này.'};
    const save=ctx.getSave();
    if(['warning','battle'].includes(save.defense?.phase))return {ok:false,error:'Hoàn thành trận phòng thủ trước khi rời vùng.'};
    if(ctx.isPlacing?.())return {ok:false,error:'Hoàn tất hoặc hủy thao tác đang đặt/di chuyển trước khi đi.'};
    const previous=clone(state),old=save;
    changing=true;
    try{
      state.regions[state.active]=regionalSnapshot(save);
      const target=state.regions[id];if(!target)throw new Error('Không tìm thấy dữ liệu vùng.');
      state.active=id;background=null;
      ctx.applySave({...save,...clone(target),world:getState()},true);
      if(ctx.persist?.()===false)throw new Error('Không lưu được vùng mới; đã giữ lại vùng trước.');
      ctx.onChanged();return {ok:true};
    }catch(error){
      state=previous;background=null;ctx.applySave({...old,world:getState()},true);
      return {ok:false,error:`Không thể chuyển vùng: ${error.message}`};
    }finally{changing=false;}
  }
  function claimMission(id){
    const index=FOREST_MISSIONS.findIndex(m=>m.id===id),mission=FOREST_MISSIONS[index];
    if(state.active!=='forest'||!mission||state.completedMissions.includes(id)||FOREST_MISSIONS.slice(0,index).some(m=>!state.completedMissions.includes(m.id)))return {ok:false,error:'Nhiệm vụ chưa sẵn sàng hoặc đã nhận thưởng.'};
    if(id==='defend'&&state.forestVictories<1)return {ok:false,error:'Thắng và nhận thưởng một đợt thật trong rừng trước.'};
    const resources=ctx.getResources();
    if(Object.entries(mission.inputs).some(([key,n])=>(resources[key]||0)<n))return {ok:false,error:'Chưa đủ tài nguyên giao nhiệm vụ.'};
    for(const[key,n]of Object.entries(mission.inputs))resources[key]-=n;
    state.completedMissions.push(id);ctx.addGold(mission.gold);ctx.addGems(mission.gems);ctx.onChanged();return {ok:true};
  }
  function recordVictory(){state.forestVictories++;ctx.onChanged();}
  function makeBackground(){
    const id=state.active==='town'?'forest':'town',map=state.regions[id];if(!map?.grid)return null;
    const shared={getCurrentGrid:()=>map.grid,getConstructions:()=>map.constructions||{},getBuildingLevels:()=>map.buildingLevels||{},
      getTileMap:ctx.getTileMap,getOtherLabor:()=>otherLabor(id),getResources:ctx.getResources,getWarehouseCapacity:ctx.getCapacity,
      isObstacleCell:(r,c)=>Object.values(map.wonderSites||{}).some(site=>site.placed&&site.row===r&&site.col===c),
      isCellUnlocked:(r,c)=>isCellUnlocked(r,c,map.land?.unlockedChunks||[],'game'),
      isReservedCell:(r,c)=>r===31&&c>=14&&c<=16,
      getDefenseState:()=>defense?.getState()||map.defense,getSoldierFoodCount:()=>defense?.soldierFoodCount()||0,
      getGold:()=>ctx.getSave().economy.playerGold,spendGold:ctx.spendGold,onChanged:()=>ctx.onChanged()};
    let defense=null;
    const extraction=createExtractionManager(shared);extraction.init(map.extraction);map.extraction=extraction.getState();
    defense=createDefenseManager({...shared,getRegionId:()=>id,getExtractionState:()=>extraction.getState(),getFoodSpeed:()=>extraction.foodSummary().workSpeed,
      getPlayerLevel:()=>ctx.getSave().playerLevel,addGold:ctx.addGold,addXP:ctx.addXP,addGems:ctx.addGems,
      notify:(message,type)=>ctx.notify?.(`[${id==='town'?'Làng':'Rừng'}] ${message}`,type)});
    defense.init(map.defense);map.defense=defense.getState();
    const production=createProductionManager({...shared,getPlayerResources:ctx.getResources,getFruitTreesState:()=>map.fruitTreesState||{},
      getPlayerLevel:()=>ctx.getSave().playerLevel,getGoldMultiplier:()=>1,getXpMultiplier:()=>1,persistGameState:ctx.onChanged});
    production.setState(map.productionState||{});map.productionState=production.getState();
    return {update(dt){
      const now=Date.now();let finished=false;
      for(const[key,build]of Object.entries(map.constructions||{})){
        if(now-build.startTime<build.durationMs||!map.grid[build.row]?.[build.col])continue;
        map.grid[build.row][build.col]=build.targetTileId;
        map.flippedGrid||={};map.flippedGrid[key]=!!build.flipped;
        production.markBuilt(key,build.targetTileId,build.startTime+build.durationMs);
        delete map.constructions[key];finished=true;
      }
      for(const[key,upgrade]of Object.entries(map.upgradesInProgress||{})){
        if(now-upgrade.startTime<upgrade.durationMs)continue;
        map.buildingLevels||={};map.buildingLevels[key]=upgrade.targetLevel;
        delete map.upgradesInProgress[key];finished=true;
      }
      for(const animal of Object.values(map.livestockState||{}))if(animal?.state==='producing'&&now-animal.feedTime>=(animal.durationMs||45000)){animal.state='ready';finished=true;}
      extraction.update(dt);defense.update(dt);map.defense=defense.getState();production.update();
      if(finished)ctx.onChanged();
    }};
  }
  let elapsed=0;
  function update(dt){
    // Match the active simulation: no offline catch-up or duplicate worker loop.
    if(!state.unlocked.includes('forest')||changing)return;
    if(!background)background=makeBackground();
    elapsed+=Math.min(.25,Math.max(0,dt));if(elapsed<.2)return;
    background?.update(elapsed);elapsed=0;
  }
  return {init,getState,requirements,unlock,travel,claimMission,recordVictory,otherLabor,update};
}
