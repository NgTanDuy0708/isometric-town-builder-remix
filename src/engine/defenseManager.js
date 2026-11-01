import {DEFENSE_UNLOCK_LEVEL,VILLAGE_MAX_HP,TOWER_TILE,TRAINING_WARNING_SECONDS,RAID_WARNING_SECONDS,
  FIRST_RAID_PREPARATION_SECONDS,RAID_INTERVAL_SECONDS,RAID_DURATION_SECONDS,GOBLIN_SPAWN_SECONDS,
  TOWER_REPAIR,VILLAGE_REPAIR,getTowerDefense,getGoblinWave,getRaidReward,ENEMY_KINDS,getEncounterKind,getEnemyWave} from '../data/defenseConfig.js';
import {findPathAStar} from './pathfinding.js';
import {createSoldierManager} from './soldierManager.js';
import {MILITARY_CAMPS} from '../data/militaryConfig.js';
import {combatVisualState,tickCombatVisual,advanceCombatWalk,markCombatAttack,markCombatHit} from './combatAnimation.js';

const key=(r,c)=>`${r}_${c}`;
const neighbors=(r,c)=>[[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
const bounded=(value,min,max,fallback=min)=>Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback;
const distance=(a,b)=>Math.hypot(a.r-b.r,a.c-b.c);

export function createDefenseManager(ctx){
  let state,checkpoint=0,scan=0;
  const grid=()=>ctx.getCurrentGrid();
  const constructions=()=>ctx.getConstructions?.()||{};
  const changed=()=>ctx.onChanged?.();
  const active=()=>['warning','battle'].includes(state.phase);
  const soldiers=createSoldierManager({...ctx,getState:()=>state,shortestPath,pathToRange,walkable,isBattleActive:active});
  function walkable(r,c){
    const id=grid()[r]?.[c];
    return !!id&&ctx.isCellUnlocked(r,c)&&!constructions()[key(r,c)]&&!ctx.isObstacleCell?.(r,c)&&
      (id.startsWith('r')||['d12_meadow_wildflowers','g01_grass_flat','s13_sand_ground'].includes(id));
  }
  function hallCells(){
    const cells=[];
    for(let r=0;r<grid().length;r++)for(let c=0;c<grid()[r].length;c++)
      if((grid()[r][c]==='b14_town_hall'||(ctx.getRegionId?.()==='forest'&&grid()[r][c]==='b11_carpenter_sawmill'))&&!constructions()[key(r,c)])cells.push({r,c});
    return cells;
  }
  function syncTowers(){
    const next={};
    for(let r=0;r<grid().length;r++)for(let c=0;c<grid()[r].length;c++){
      const k=key(r,c);if(grid()[r][c]!==TOWER_TILE||constructions()[k])continue;
      const previous=state.towers[k];
      next[k]={hp:bounded(previous?.hp,0,100,100),cooldown:bounded(previous?.cooldown,0,1,0),
        flash:bounded(previous?.flash,0,.2,0),aim:previous?.aim||null};
    }
    state.towers=next;
  }
  function towers(){
    return Object.entries(state.towers).filter(([k])=>{
      const [r,c]=k.split('_').map(Number);return grid()[r]?.[c]===TOWER_TILE&&!constructions()[k]&&ctx.isCellUnlocked(r,c);
    }).map(([k,tower])=>{
      const [r,c]=k.split('_').map(Number);
      return {k,r,c,...tower,...getTowerDefense(ctx.getBuildingLevels?.()[k]||1),hp:tower.hp};
    });
  }
  function shortestPath(start,cells){
    const goals=[...new Map(cells.flatMap(cell=>neighbors(cell.r,cell.c)).map(([r,c])=>[key(r,c),{r,c}])).values()];
    const from={r:Math.round(start.r),c:Math.round(start.c)};
    return goals.filter(cell=>walkable(cell.r,cell.c)).map(goal=>findPathAStar(grid(),from,goal,walkable))
      .filter(Boolean).sort((a,b)=>a.length-b.length)[0]||null;
  }
  function chooseEntry(){
    const targets=towers().filter(tower=>tower.hp>0);
    if(!targets.length)return null;
    const candidates=[];
    for(let r=0;r<grid().length;r++)for(let c=0;c<grid()[r].length;c++){
      if(!walkable(r,c)||!neighbors(r,c).some(([rr,cc])=>grid()[rr]?.[cc]===undefined||!ctx.isCellUnlocked(rr,cc)))continue;
      const entry={r,c},nearest=Math.min(...targets.map(tower=>distance(entry,tower)));
      if(nearest>=4)candidates.push({...entry,nearest});
    }
    candidates.sort((a,b)=>a.nearest-b.nearest);
    return candidates.find(entry=>shortestPath(entry,targets))||null;
  }
  function pathToRange(start,target,range){
    const from={r:Math.round(start.r),c:Math.round(start.c)},goals=[];
    const radius=Math.ceil(range);
    for(let r=Math.floor(target.r)-radius;r<=Math.ceil(target.r)+radius;r++)
      for(let c=Math.floor(target.c)-radius;c<=Math.ceil(target.c)+radius;c++)
        if(walkable(r,c)&&distance({r,c},target)<=range)goals.push({r,c});
    goals.sort((a,b)=>distance(from,a)-distance(from,b));
    let best=null;
    for(const goal of goals){
      if(best&&Math.abs(from.r-goal.r)+Math.abs(from.c-goal.c)>=best.length)continue;
      const path=findPathAStar(grid(),from,goal,walkable);if(path&&(!best||path.length<best.length))best=path;
    }
    return best;
  }
  function init(saved){
    state={version:1,enabled:!!saved?.enabled,trainingDone:!!saved?.trainingDone,
      phase:['idle','preparing','warning','battle','result'].includes(saved?.phase)?saved.phase:'idle',
      remaining:bounded(saved?.remaining,0,RAID_INTERVAL_SECONDS[1],0),wave:Math.floor(bounded(saved?.wave,0,999,0)),
      nextRaidId:Math.floor(bounded(saved?.nextRaidId,1,1e9,1)),villageHp:bounded(saved?.villageHp,0,VILLAGE_MAX_HP,VILLAGE_MAX_HP),
      towers:{},enemies:[],raid:null,result:null};
    if(saved?.towers&&typeof saved.towers==='object'){
      for(const [k,value] of Object.entries(saved.towers))if(/^\d+_\d+$/.test(k))state.towers[k]={hp:value?.hp,cooldown:value?.cooldown};
    }
    syncTowers();
    if(active()){
      const raw=saved?.raid,spawn=raw?.spawn;
      if(raw&&Number.isFinite(raw.id)&&Number.isInteger(spawn?.r)&&Number.isInteger(spawn?.c)&&grid()[spawn.r]?.[spawn.c]!==undefined){
        state.raid={id:Math.floor(bounded(raw.id,1,1e9,1)),training:!!raw.training,practice:!!raw.practice,
          kind:ENEMY_KINDS[raw.kind]?raw.kind:'goblin',spawn:{r:spawn.r,c:spawn.c},total:Math.floor(bounded(raw.total,1,6,3)),
          spawned:Math.floor(bounded(raw.spawned,0,6,0)),spawnLeft:bounded(raw.spawnLeft,0,GOBLIN_SPAWN_SECONDS,0),
          timeLeft:bounded(raw.timeLeft,0,RAID_DURATION_SECONDS,RAID_DURATION_SECONDS)};
        state.raid.spawned=Math.min(state.raid.total,state.raid.spawned);
        const config=getEnemyWave(state.raid.kind,state.wave,state.raid.training);
        for(const rawEnemy of (Array.isArray(saved.enemies)?saved.enemies:[]).slice(0,6)){
          if(!rawEnemy||!Number.isFinite(rawEnemy.r)||!Number.isFinite(rawEnemy.c))continue;
          state.enemies.push({...combatVisualState(rawEnemy),id:state.enemies.length+1,r:bounded(rawEnemy.r,0,grid().length-1),
            kind:state.raid.kind,flying:!!config.flying,c:bounded(rawEnemy.c,0,grid()[0].length-1),hp:bounded(rawEnemy.hp,0,config.hp,config.hp),
            maxHp:config.hp,path:[],target:null,retry:0,attack:bounded(rawEnemy.attack,0,1,0)});
        }
        state.raid.spawned=Math.max(state.raid.spawned,state.enemies.length);
        state.nextRaidId=Math.max(state.nextRaidId,state.raid.id+1);
      }else{state.phase='idle';state.enabled=false;}
    }
    if(state.phase==='result'&&saved?.result&&['victory','defeat','retreat'].includes(saved.result.outcome)){
      const result=saved.result;
      state.result={id:Math.floor(bounded(result.id,1,1e9,1)),kind:ENEMY_KINDS[result.kind]?result.kind:'goblin',training:!!result.training,practice:!!result.practice,
        outcome:result.outcome,claimed:!!result.claimed,wave:Math.floor(bounded(result.wave,0,999,0))};
      state.nextRaidId=Math.max(state.nextRaidId,state.result.id+1);
    }else if(state.phase==='result'){state.phase='idle';state.enabled=false;}
    if(!state.trainingDone)state.enabled=false;
    soldiers.init(saved);
    checkpoint=0;scan=0;
  }
  function eligibility(){
    if((ctx.getPlayerLevel?.()||1)<DEFENSE_UNLOCK_LEVEL)return `Phòng thủ mở từ cấp ${DEFENSE_UNLOCK_LEVEL}.`;
    if(!hallCells().length)return 'Cần Tòa thị chính đã hoàn tất.';
    if(state.villageHp<=0)return 'Sửa phòng thủ làng trước khi bắt đầu đợt mới.';
    if(!towers().some(tower=>tower.hp>0))return 'Xây hoặc sửa ít nhất 1 Tháp canh trước.';
    return null;
  }
  function beginWarning(training,requestedKind='goblin'){
    syncTowers();const error=eligibility();if(error)return {ok:false,error};
    const level=ctx.getPlayerLevel?.()||1;
    if(training&&(!ENEMY_KINDS[requestedKind]||level<ENEMY_KINDS[requestedKind].level||requestedKind!=='goblin'&&!state.trainingDone))return {ok:false,error:'Thắng diễn tập goblin và đạt cấp mở khóa quái trước.'};
    const spawn=chooseEntry();if(!spawn)return {ok:false,error:'Cần lối đất trống/đường từ rìa đất đã mở tới tháp canh.'};
    if(!training)state.wave++;
    const kind=training?requestedKind:getEncounterKind(state.wave,level,ctx.getRegionId?.());
    const config=getEnemyWave(kind,state.wave,training);
    state.raid={id:state.nextRaidId++,training,practice:training&&state.trainingDone,spawn:{r:spawn.r,c:spawn.c},total:config.count,spawned:0,
      kind,spawnLeft:0,timeLeft:RAID_DURATION_SECONDS};
    state.enemies=[];state.result=null;state.phase='warning';
    state.remaining=training?TRAINING_WARNING_SECONDS:RAID_WARNING_SECONDS;
    changed();ctx.notify?.(`${ENEMY_KINDS[kind].name} sẽ tới sau ${state.remaining} giây!`, 'warning');return {ok:true};
  }
  function startTraining(kind='goblin'){
    if(state.phase!=='idle')return {ok:false,error:'Đang có đợt phòng thủ. Xem kết quả hoặc dừng lịch đợt sau trước khi diễn tập.'};
    return beginWarning(true,kind);
  }
  function setEnabled(enabled){
    if(typeof enabled!=='boolean')return {ok:false,error:'Lựa chọn không hợp lệ.'};
    if(enabled){
      syncTowers();const error=eligibility();if(error)return {ok:false,error};
      if(!state.trainingDone)return {ok:false,error:'Thắng đợt diễn tập trước khi bật tấn công ngẫu nhiên.'};
      if(state.phase==='result')return {ok:false,error:'Xem kết quả đợt trước rồi tiếp tục.'};
      if(state.phase==='idle'){
        state.phase='preparing';
        state.remaining=state.wave===0?FIRST_RAID_PREPARATION_SECONDS:Math.max(1,state.remaining||FIRST_RAID_PREPARATION_SECONDS);
      }
    }
    state.enabled=enabled;changed();return {ok:true};
  }
  function finish(outcome){
    state.result={id:state.raid.id,kind:state.raid.kind||'goblin',training:state.raid.training,practice:state.raid.practice,wave:state.wave,outcome,claimed:false};
    if(outcome==='victory'&&state.raid.training)state.trainingDone=true;
    state.phase='result';state.raid=null;state.enemies=[];
    for(const tower of Object.values(state.towers)){tower.flash=0;tower.aim=null;}
    changed();ctx.notify?.(outcome==='victory'?'🛡️ Đã đánh bại goblin! Mở Phòng thủ để nhận thưởng.':
      outcome==='defeat'?'🛠️ Phòng thủ làng bị hư. Mở Phòng thủ để sửa.':'👺 Goblin đã rút lui, không có thưởng diệt địch.',outcome==='victory'?'success':'warning');
  }
  function claimReward(){
    const result=state.result;
    if(state.phase!=='result'||!result||result.outcome!=='victory'||result.claimed||result.practice)return {ok:false,error:'Không có thưởng chờ nhận.'};
    // Mark before account callbacks; onChanged persists reward and battle state
    // in the same full save used by the rest of the game.
    result.claimed=true;const reward=getRaidReward(result.training,result.wave,result.kind);
    ctx.addGold?.(reward.gold);ctx.addXP?.(reward.xp);if(reward.gems)ctx.addGems?.(reward.gems);
    if(!result.training)ctx.onVictory?.(result);changed();return {ok:true};
  }
  function acknowledge(){
    if(state.phase!=='result')return {ok:false,error:'Chưa có kết quả.'};
    if(state.result.outcome==='victory'&&!state.result.claimed&&!state.result.practice)return {ok:false,error:'Nhận thưởng trước khi tiếp tục.'};
    state.result=null;state.phase=state.enabled?'preparing':'idle';
    const random=bounded(ctx.random?.()??Math.random(),0,1,0);
    state.remaining=RAID_INTERVAL_SECONDS[0]+random*(RAID_INTERVAL_SECONDS[1]-RAID_INTERVAL_SECONDS[0]);
    changed();return {ok:true};
  }
  function repair(k='village'){
    syncTowers();if(active())return {ok:false,error:'Chờ hết đợt tấn công mới sửa được.'};
    if(k!=='village'&&!Object.hasOwn(state.towers,k))return {ok:false,error:'Không tìm thấy tháp cần sửa.'};
    const target=k==='village'?state:state.towers[k],field=k==='village'?'villageHp':'hp';
    if(!target||target[field]>=100)return {ok:false,error:'Công trình không cần sửa.'};
    const cost=k==='village'?VILLAGE_REPAIR:TOWER_REPAIR,resources=ctx.getResources();
    if(ctx.getGold()<cost.gold||Object.entries(cost.resources).some(([id,n])=>(resources[id]||0)<n))
      return {ok:false,error:'Chưa đủ vàng, gỗ và đá để sửa.'};
    ctx.spendGold(cost.gold);for(const [id,n] of Object.entries(cost.resources))resources[id]-=n;
    target[field]=100;changed();return {ok:true};
  }
  function busyMessage(r,c){
    if(ctx.getRegionId?.()==='forest'&&r===16&&c===13)return 'Xưởng mộc trung tâm là tiền đồn cố định của khu rừng.';
    if(MILITARY_CAMPS[grid()[r]?.[c]]&&state.soldiers.some(soldier=>soldier.homeRow===r&&soldier.homeCol===c))
      return 'Cho toàn bộ lính nghỉ và chờ họ về trại trước khi di chuyển/gỡ trại.';
    if(grid()[r]?.[c]!==TOWER_TILE)return null;
    if(active())return 'Chờ hết cảnh báo/trận goblin trước khi di chuyển hoặc gỡ tháp.';
    if((state.towers[key(r,c)]?.hp??100)<100)return 'Sửa tháp trước khi di chuyển hoặc gỡ tháp.';
    return null;
  }
  function removeTower(r,c){delete state.towers[key(r,c)];}
  function update(dt){
    dt=bounded(dt,0,.25,0);if(!dt)return;
    checkpoint+=dt;scan+=dt;if(scan>=1){scan=0;syncTowers();}
    for(const tower of Object.values(state.towers)){
      tower.flash=Math.max(0,tower.flash-dt);
      if(!tower.flash)tower.aim=null;
    }
    if(state.phase!=='battle'&&soldiers.update(dt,false,[]))changed();
    if(state.phase==='preparing'&&state.enabled&&!eligibility()){
      state.remaining=Math.max(0,state.remaining-dt);
      if(state.remaining<=0){const result=beginWarning(false);if(!result.ok){state.remaining=30;ctx.notify?.(result.error,'warning');}}
    }else if(state.phase==='warning'){
      state.remaining=Math.max(0,state.remaining-dt);
      if(state.remaining<=0){state.phase='battle';changed();}
    }else if(state.phase==='battle'){
      const raid=state.raid,config=getEnemyWave(raid.kind,state.wave,raid.training),hall=hallCells();
      if(!hall.length)return; // Imported maps without a hall pause instead of losing it.
      raid.timeLeft=Math.max(0,raid.timeLeft-dt);raid.spawnLeft-=dt;
      if(raid.spawned<raid.total&&raid.spawnLeft<=0){
        const spawn=raid.spawn;
        if(walkable(spawn.r,spawn.c)){
          state.enemies.push({...combatVisualState(),kind:raid.kind||'goblin',flying:!!config.flying,id:++raid.spawned,r:spawn.r,c:spawn.c,hp:config.hp,maxHp:config.hp,path:[],target:null,retry:0,attack:0});
          raid.spawnLeft=GOBLIN_SPAWN_SECONDS;
        }
      }
      const defenses=towers();
      if(soldiers.update(dt,true,state.enemies))changed();
      for(const tower of defenses){
        const live=state.towers[tower.k];live.cooldown=Math.max(0,live.cooldown-dt);
        if(tower.hp<=0||live.cooldown>0)continue;
        const enemy=state.enemies.filter(enemy=>enemy.hp>0&&distance(enemy,tower)<=tower.range).sort((a,b)=>distance(a,tower)-distance(b,tower))[0];
        if(enemy){enemy.hp=Math.max(0,enemy.hp-tower.damage);markCombatHit(enemy);live.cooldown=tower.interval;live.flash=.18;live.aim={r:enemy.r,c:enemy.c};}
      }
      const guards=soldiers.combatants();
      for(const enemy of state.enemies){
        tickCombatVisual(enemy,dt);
        enemy.flightPhase=((enemy.flightPhase||0)+dt)%4;
        enemy.fireFor=Math.max(0,(enemy.fireFor||0)-dt);
        if(enemy.hp<=0)continue;
        enemy.retry=Math.max(0,enemy.retry-dt);enemy.attack=Math.max(0,enemy.attack-dt);
        const guard=!enemy.flying&&guards.filter(soldier=>soldier.hp>0&&distance(enemy,soldier)<=1.01).sort((a,b)=>distance(enemy,a)-distance(enemy,b))[0];
        if(guard){
          enemy.path=[];
          if(enemy.attack<=0){guard.hp=Math.max(0,guard.hp-config.damage);markCombatHit(guard);markCombatAttack(enemy,guard);enemy.attack=1;}
          continue;
        }
        const target=defenses.filter(tower=>state.towers[tower.k].hp>0).sort((a,b)=>distance(enemy,a)-distance(enemy,b))[0];
        const cells=target?[target]:hall,targetKey=target?.k||'village';
        if(cells.some(cell=>distance(enemy,cell)<=(config.range||1.01))){
          enemy.path=[];
          if(enemy.attack<=0){
            if(target)state.towers[target.k].hp=Math.max(0,state.towers[target.k].hp-config.damage);
            else state.villageHp=Math.max(0,state.villageHp-config.damage);
            markCombatAttack(enemy,target||cells[0]);
            if(enemy.flying){enemy.fireAim={...(target||cells[0])};enemy.fireFor=.35;
              for(const soldier of guards)if(distance(soldier,target||cells[0])<=1.2){soldier.hp=Math.max(0,soldier.hp-6);markCombatHit(soldier);}}
            enemy.attack=1;
          }
          continue;
        }
        if(enemy.flying){
          const goal=target||cells[0],dr=goal.r-enemy.r,dc=goal.c-enemy.c,d=Math.hypot(dr,dc),step=Math.min(d,config.speed*dt);
          advanceCombatWalk(enemy,dr,dc,step);enemy.r+=dr/d*step;enemy.c+=dc/d*step;continue;
        }
        if(enemy.target!==targetKey){enemy.target=targetKey;enemy.path=[];enemy.retry=0;}
        if(!enemy.path.length&&enemy.retry<=0){enemy.path=shortestPath(enemy,cells)?.slice(1)||[];enemy.retry=1;}
        if(!enemy.path.length)continue;
        const next=enemy.path[0];
        if(!walkable(next.r,next.c)){enemy.r=Math.round(enemy.r);enemy.c=Math.round(enemy.c);enemy.path=[];continue;}
        const dr=next.r-enemy.r,dc=next.c-enemy.c,d=Math.hypot(dr,dc),step=config.speed*dt;
        advanceCombatWalk(enemy,dr,dc,Math.min(d,step));
        if(d<=step){enemy.r=next.r;enemy.c=next.c;enemy.path.shift();}
        else{enemy.r+=dr/d*step;enemy.c+=dc/d*step;}
      }
      if(state.villageHp<=0)finish('defeat');
      else if(raid.spawned===raid.total&&state.enemies.every(enemy=>enemy.hp<=0))finish('victory');
      else if(raid.timeLeft<=0)finish('retreat');
    }
    if(checkpoint>=1&&(active()||(state.phase==='preparing'&&state.enabled))){checkpoint=0;changed();}
    else if(checkpoint>=10&&state.soldiers.length){checkpoint=0;changed();}
  }
  function summary(){return {...state,playerLevel:ctx.getPlayerLevel?.()||1,towerList:towers(),unlockError:eligibility(),active:active()};}
  return {init,getState:()=>state,summary,update,startTraining,setEnabled,claimReward,acknowledge,repair,busyMessage,removeTower,
    trainSoldier:soldiers.train,dismissSoldier:soldiers.dismiss,labor:soldiers.labor,soldierFoodCount:soldiers.diners};
}
