import {MILITARY_CAMPS,MILITARY_UNITS,getMilitaryUnit,SOLDIER_SPEED,
  SOLDIER_RECOVERY_PER_SECOND,getSoldierSlots,getAssignedSoldiers} from '../data/militaryConfig.js';
import {getWorkforce} from './workforce.js';
import {combatVisualState,tickCombatVisual,advanceCombatWalk,markCombatAttack,markCombatHit} from './combatAnimation.js';

const cellKey=(r,c)=>`${r}_${c}`;
const distance=(a,b)=>Math.hypot(a.r-b.r,a.c-b.c);
const bounded=(value,min,max,fallback=min)=>Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;
export function createSoldierManager(ctx){
  const state=()=>ctx.getState(),grid=()=>ctx.getCurrentGrid();
  function labor(){return getWorkforce(grid(),ctx.getConstructions?.()||{},ctx.getTileMap?.()||{},
    ctx.getBuildingLevels?.()||{},ctx.getExtractionState?.(),state(),ctx.getOtherLabor?.());}
  function assigned(){return getAssignedSoldiers(grid(),state());}
  function supported(){const roster=assigned();if(!roster.length)return [];const stats=labor();return roster.slice(0,Math.max(0,stats.total-stats.farmers-stats.workers));}
  function diners(){return supported().filter(soldier=>!soldier.retiring).length;}
  function init(saved){
    state().soldiers=[];state().nextSoldierId=1;
    const homes={};
    for(const raw of (Array.isArray(saved?.soldiers)?saved.soldiers:[]).slice(0,256)){
      if(!raw||!Number.isInteger(raw.homeRow)||!Number.isInteger(raw.homeCol))continue;
      const camp=MILITARY_CAMPS[grid()[raw.homeRow]?.[raw.homeCol]];
      if(!camp||camp.unitType!==(raw.unitType||'guard'))continue;
      const config=MILITARY_UNITS[camp.unitType];
      const key=cellKey(raw.homeRow,raw.homeCol),slots=getSoldierSlots(ctx.getBuildingLevels?.()[key]||1);
      if((homes[key]||0)>=slots)continue;homes[key]=(homes[key]||0)+1;
      const trainLeft=bounded(raw.trainLeft,0,config.trainSeconds,0);
      state().soldiers.push({...combatVisualState(raw),id:state().nextSoldierId++,unitType:camp.unitType,homeRow:raw.homeRow,homeCol:raw.homeCol,
        r:Math.round(bounded(raw.r,0,grid().length-1,raw.homeRow)),c:Math.round(bounded(raw.c,0,grid()[0].length-1,raw.homeCol)),
        hp:bounded(raw.hp,0,config.hp,config.hp),trainLeft,retiring:!!raw.retiring,
        status:trainLeft?'training':'returning',path:[],cooldown:bounded(raw.cooldown,0,config.interval,0),retry:0,target:null,spellFlash:0,aim:null});
    }
  }
  function train(r,c){
    const camp=MILITARY_CAMPS[grid()[r]?.[c]];
    if(!camp||ctx.getConstructions?.()[cellKey(r,c)])return {ok:false,error:'Trại/học viện chưa xây xong.'};
    const config=MILITARY_UNITS[camp.unitType];
    if((ctx.getPlayerLevel?.()||1)<config.level)return {ok:false,error:`${config.name} mở từ cấp ${config.level}.`};
    if(assigned().filter(soldier=>soldier.homeRow===r&&soldier.homeCol===c).length>=getSoldierSlots(ctx.getBuildingLevels?.()[cellKey(r,c)]||1))
      return {ok:false,error:'Trại đã đủ chỗ. Nâng cấp hoặc xây trại mới.'};
    if(labor().free<1)return {ok:false,error:'Cần 1 dân rảnh để huấn luyện lính.'};
    if(!ctx.shortestPath({r,c},[{r,c}]))return {ok:false,error:'Chừa lối đi cạnh trại trước khi huấn luyện.'};
    const resources=ctx.getResources();
    if(ctx.getGold()<config.cost.gold||Object.entries(config.cost.resources).some(([id,n])=>(resources[id]||0)<n))
      return {ok:false,error:camp.unitType==='mage'?'Cần 80 vàng, 1 dụng cụ sắt và 2 vải để huấn luyện pháp sư.':'Cần 50 vàng và 1 dụng cụ sắt để huấn luyện.'};
    ctx.spendGold(config.cost.gold);for(const [id,n] of Object.entries(config.cost.resources))resources[id]-=n;
    state().soldiers.push({...combatVisualState(),id:state().nextSoldierId++,unitType:camp.unitType,homeRow:r,homeCol:c,r,c,hp:config.hp,trainLeft:config.trainSeconds,
      retiring:false,status:'training',path:[],cooldown:0,retry:0,target:null,spellFlash:0,aim:null});
    ctx.onChanged?.();return {ok:true};
  }
  function dismiss(id){
    if(ctx.isBattleActive())return {ok:false,error:'Chờ hết cảnh báo/trận rồi cho lính nghỉ.'};
    const soldier=assigned().find(soldier=>soldier.id===id);if(!soldier)return {ok:false,error:'Không tìm thấy lính.'};
    soldier.retiring=true;soldier.trainLeft=0;soldier.path=[];soldier.target=null;soldier.retry=0;
    soldier.status='returning';ctx.onChanged?.();return {ok:true};
  }
  function combatants(){return supported().filter(soldier=>!soldier.retiring&&soldier.trainLeft<=0&&soldier.hp>0);}
  function update(dt,battle,enemies){
    if(!state().soldiers.length)return false;
    const available=new Set(supported()),speed=ctx.getFoodSpeed?.()??1;
    let changed=false;
    for(const soldier of assigned()){
      tickCombatVisual(soldier,dt);
      const config=getMilitaryUnit(soldier);
      soldier.spellFlash=Math.max(0,(soldier.spellFlash||0)-dt);
      soldier.cooldown=Math.max(0,soldier.cooldown-dt*speed);soldier.retry=Math.max(0,soldier.retry-dt);
      if(!available.has(soldier)&&!soldier.retiring){soldier.status='understaffed';soldier.path=[];continue;}
      if(soldier.trainLeft>0&&!soldier.retiring){soldier.trainLeft=Math.max(0,soldier.trainLeft-dt*speed);soldier.status='training';continue;}
      const home={r:soldier.homeRow,c:soldier.homeCol};
      const target=battle&&!soldier.retiring&&soldier.hp>0
        ? enemies.filter(enemy=>enemy.hp>0&&(!enemy.flying||soldier.unitType==='mage')).sort((a,b)=>distance(soldier,a)-distance(soldier,b))[0]:null;
      if(target&&distance(soldier,target)<=config.range){
        soldier.path=[];soldier.status='fighting';
        if(soldier.cooldown<=0){
          const victims=config.splash?enemies.filter(enemy=>enemy.hp>0&&distance(enemy,target)<=config.splash):[target];
          for(const enemy of victims){enemy.hp=Math.max(0,enemy.hp-config.damage);markCombatHit(enemy);}
          markCombatAttack(soldier,target);
          soldier.cooldown=config.interval;
          if(config.splash){soldier.spellFlash=.3;soldier.aim={r:target.r,c:target.c};}
          changed=true;
        }
        continue;
      }
      if(!target&&soldier.r===home.r&&soldier.c===home.c){
        soldier.path=[];soldier.target=null;
        if(soldier.retiring){state().soldiers.splice(state().soldiers.indexOf(soldier),1);changed=true;continue;}
        soldier.status=soldier.hp<config.hp?'recovering':'idle';
        if(!battle&&soldier.hp<config.hp)soldier.hp=Math.min(config.hp,soldier.hp+dt*SOLDIER_RECOVERY_PER_SECOND);
        continue;
      }
      const targetKey=target?`enemy_${target.id}_${Math.round(target.r)}_${Math.round(target.c)}`:'home';
      if(soldier.target!==targetKey){soldier.target=targetKey;soldier.path=[];soldier.retry=0;}
      if(!soldier.path.length&&soldier.retry<=0){
        const path=target&&config.range>1.01?ctx.pathToRange(soldier,target,config.range)
          :ctx.shortestPath(soldier,[target?{r:Math.round(target.r),c:Math.round(target.c)}:home]);
        soldier.path=path?.slice(1)||[];
        // A fractional position can be just outside attack range while its
        // rounded cell is already a valid firing position. Finish that step.
        if(target&&path?.length===1&&distance(soldier,path[0])>.001)soldier.path=[path[0]];
        if(!target&&path)soldier.path.push(home);
        soldier.retry=1;
      }
      soldier.status=target?'marching':'returning';
      if(!soldier.path.length){soldier.status='no_path';continue;}
      const next=soldier.path[0],enteringHome=!target&&next.r===home.r&&next.c===home.c;
      if(!enteringHome&&!ctx.walkable(next.r,next.c)){
        soldier.r=Math.round(soldier.r);soldier.c=Math.round(soldier.c);soldier.path=[];soldier.status='no_path';continue;
      }
      const dr=next.r-soldier.r,dc=next.c-soldier.c,d=Math.hypot(dr,dc),step=dt*SOLDIER_SPEED;
      advanceCombatWalk(soldier,dr,dc,Math.min(d,step));
      if(d<=step){soldier.r=next.r;soldier.c=next.c;soldier.path.shift();}
      else{soldier.r+=dr/d*step;soldier.c+=dc/d*step;}
    }
    return changed;
  }
  return {init,train,dismiss,update,labor,diners,combatants};
}
