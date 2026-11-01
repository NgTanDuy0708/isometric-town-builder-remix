import { EXTRACTION_WORKSHOPS as SHOPS, EXTRACTION_NODES as NODES,
  WORKER_HIRE_GOLD, WORK_SECONDS, WORKER_LOAD, getWorkerSlots } from '../data/extractionConfig.js';
import { getWorkforce } from './workforce.js';
import { getWarehouseUsed, RESOURCE_MAX_CAPACITY } from '../data/resourcesConfig.js';
import { findPathAStar } from './pathfinding.js';
import { WORKER_FOODS } from '../data/workerFoodConfig.js';
import { createWorkerFoodState, getWorkerFoodSummary, updateWorkerFood } from './workerFood.js';
import {characterDirection} from './characterAnimation.js';

export const WORKER_STATUS = {
  idle: 'Chờ phân công chuyến', outbound: 'Đang tới điểm khai thác', working: 'Đang khai thác',
  delivery: 'Đang mang hàng về kho', home: 'Đang về xưởng', full: 'Kho đầy — giữ hàng chờ',
  no_path: 'Không có đường đi', no_node: 'Chờ tài nguyên hồi phục', no_warehouse: 'Cần kho có lối vào',
  understaffed: 'Thiếu dân — xây thêm nhà hoặc cho nghỉ'
};
const key = (r,c) => `${r}_${c}`;
const adjacent = (r,c) => [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
const finite = (n, fallback=0) => Number.isFinite(n) ? n : fallback;

export function createExtractionManager(ctx) {
  let state = { version: 2, seeded: false, nextId: 1, jobs: [], nodes: {}, food:createWorkerFoodState() };
  let checkpoint = 0, retry = 0;
  const grid = () => ctx.getCurrentGrid();
  const constructions = () => ctx.getConstructions?.() || {};
  const validCell = (r,c) => Number.isInteger(r) && Number.isInteger(c) && grid()[r]?.[c] !== undefined;
  function walkable(r,c) {
    const tid = grid()[r]?.[c];
    return !!tid && !constructions()[key(r,c)] && ctx.isCellUnlocked(r,c) &&
      !ctx.isObstacleCell?.(r,c) &&
      (tid.startsWith('r') || ['d12_meadow_wildflowers','g01_grass_flat','s13_sand_ground'].includes(tid));
  }
  function route(job, destinations) {
    const start = {r: Math.round(job.r), c: Math.round(job.c)};
    if (!validCell(start.r,start.c)) return null;
    const unique=[...new Map(destinations.map(([r,c])=>[key(r,c),[r,c]])).values()];
    const paths = unique.filter(([r,c]) => walkable(r,c)).map(([r,c]) =>
      findPathAStar(grid(),start,{r,c},walkable)).filter(Boolean);
    return paths.sort((a,b) => a.length-b.length)[0] || null;
  }
  function warehouseRoute(job) {
    const goals = [];
    for (let r=0;r<grid().length;r++) for(let c=0;c<grid()[r].length;c++) {
      if (grid()[r][c] === 'b60_combined_warehouse' && !constructions()[key(r,c)]) goals.push(...adjacent(r,c));
    }
    return route(job,goals);
  }
  function startRoute(job,path,phase) {
    if (!path) { job.status = phase === 'delivery' ? 'no_warehouse' : 'no_path'; return false; }
    job.path = path.slice(1); job.phase = phase; job.status = phase;
    return true;
  }
  function syncNodes() {
    const currentNodes={};
    for(let r=0;r<grid().length;r++) for(let c=0;c<grid()[r].length;c++) {
      const config = NODES[grid()[r][c]], k = key(r,c);
      if (!config) continue;
      const saved = state.nodes[k];
      currentNodes[k] = { remaining: Math.min(config.capacity, Math.max(0, Math.floor(finite(saved?.remaining,config.capacity)))),
        recovery: Math.min(config.recoverySeconds,Math.max(0,finite(saved?.recovery))) };
    }
    state.nodes=currentNodes;
  }
  function init(saved) {
    state = { version: 2, seeded: !!saved?.seeded, nextId: Math.min(1000000000,Math.max(1,Math.floor(finite(saved?.nextId,1)))), jobs: [], nodes: {}, food:createWorkerFoodState(saved?.food) };
    if (saved?.nodes && typeof saved.nodes==='object') state.nodes = structuredClone(saved.nodes);
    const perHome = {};
    for (const raw of (Array.isArray(saved?.jobs) ? saved.jobs.slice(0,256) : [])) {
      if(!raw || typeof raw !== 'object') continue;
      if (!validCell(raw.homeRow,raw.homeCol) || !SHOPS[raw.tileId] || grid()[raw.homeRow][raw.homeCol] !== raw.tileId) continue;
      const home = key(raw.homeRow,raw.homeCol);
      if ((perHome[home] || 0) >= getWorkerSlots(ctx.getBuildingLevels?.()[home] || 1)) continue;
      perHome[home] = (perHome[home] || 0)+1;
      const load = Math.min(WORKER_LOAD,Math.max(0,Math.floor(finite(raw.load))));
      const r = Math.min(grid().length-1,Math.max(0,finite(raw.r,raw.homeRow)));
      const c = Math.min(grid()[0].length-1,Math.max(0,finite(raw.c,raw.homeCol)));
      state.jobs.push({ id:state.nextId++, homeRow:raw.homeRow,homeCol:raw.homeCol,tileId:raw.tileId,
        r:Math.round(r),c:Math.round(c),load,retiring:!!raw.retiring,phase:load?'delivery':'home',
        status:load?'delivery':'home',path:[],work:0,nodeKey:null,facing:raw.facing||'SE',walkPhase:Math.max(0,finite(raw.walkPhase))%4 });
    }
    ensureNodes();
    syncNodes(); checkpoint=0; retry=0;
  }
  // Retry on old, fully occupied maps after the player makes room.
  function ensureNodes() {
      let added=false;
      const origins = [[9,10,'n01_logging_grove'],[22,22,'n01_logging_grove'],[10,21,'n02_stone_deposit'],[22,9,'n02_stone_deposit'],[9,19,'n03_iron_deposit'],[21,10,'n03_iron_deposit']];
      for (const [rr,cc,tid] of origins) {
        if(grid().flat().filter(id=>id===tid).length>=2)continue;
        const candidates=[];
        for(let r=8;r<24;r++)for(let c=8;c<24;c++)if(grid()[r]?.[c]==='d12_meadow_wildflowers' &&
          !constructions()[key(r,c)] && !ctx.isReservedCell?.(r,c) && ctx.isCellUnlocked(r,c) && adjacent(r,c).some(([rr,cc])=>walkable(rr,cc))) candidates.push([r,c]);
        candidates.sort((a,b)=>(Math.abs(a[0]-rr)+Math.abs(a[1]-cc))-(Math.abs(b[0]-rr)+Math.abs(b[1]-cc)));
        const point=candidates[0]; if(point){grid()[point[0]][point[1]]=tid;added=true;}
      }
      state.seeded=true;
      if(added)syncNodes();
      return added;
  }
  function getState() { return state; }
  function labor() { return getWorkforce(grid(),constructions(),ctx.getTileMap?.() || {},ctx.getBuildingLevels?.() || {},state,ctx.getDefenseState?.(),ctx.getOtherLabor?.()); }
  function foodWorkerCount(workforce=labor()) {
    return state.jobs.filter(job=>SHOPS[job.tileId]&&grid()[job.homeRow]?.[job.homeCol]===job.tileId)
      .slice(0,Math.max(0,workforce.total-workforce.farmers)).filter(job=>!job.retiring).length;
  }
  function foodSummary() {
    const workers=foodWorkerCount(),soldiers=ctx.getSoldierFoodCount?.()||0;
    return {...getWorkerFoodSummary(state.food,ctx.getResources(),workers+soldiers),extractionWorkers:workers,soldiers};
  }
  function setFoodEnabled(id,enabled) {
    if(!WORKER_FOODS.some(food=>food.id===id)||typeof enabled!=='boolean')return false;
    const chosen=new Set(state.food.enabledFoods);
    if(enabled)chosen.add(id);else chosen.delete(id);
    state.food.enabledFoods=WORKER_FOODS.filter(food=>chosen.has(food.id)).map(food=>food.id);
    ctx.onChanged?.();return true;
  }
  function hire(r,c) {
    const tid=grid()[r]?.[c], k=key(r,c), cfg=SHOPS[tid];
    if(!cfg || constructions()[k]) return {allowed:false,message:'Xưởng chưa xây xong.'};
    if(state.jobs.filter(j=>j.homeRow===r&&j.homeCol===c).length>=getWorkerSlots(ctx.getBuildingLevels?.()[k] || 1))return {allowed:false,message:'Xưởng đã đủ công nhân.'};
    if(labor().free<1)return {allowed:false,message:'Hết dân rảnh! Hãy xây/nâng cấp nhà hoặc giải phóng một luống đất.'};
    if(ctx.getGold()<WORKER_HIRE_GOLD)return {allowed:false,message:`Cần ${WORKER_HIRE_GOLD} vàng để thuê công nhân.`};
    const job={id:state.nextId++,homeRow:r,homeCol:c,tileId:tid,r,c,phase:'idle',status:'idle',path:[],load:0,work:0,nodeKey:null,retiring:false};
    if(!warehouseRoute(job))return {allowed:false,message:'Cần xây Kho Tổng Hợp và chừa lối đi từ xưởng tới kho trước khi thuê.'};
    ctx.spendGold(WORKER_HIRE_GOLD); state.jobs.push(job); ctx.onChanged?.();
    return {allowed:true,message:'Đã thuê công nhân. Người này sẽ mang hàng về Kho Tổng Hợp.'};
  }
  function dismiss(id) {
    const job=state.jobs.find(j=>j.id===id);if(!job)return false;
    job.retiring=true;
    if(job.load===0){job.phase='home';job.path=[];job.status='home';}
    ctx.onChanged?.();return true;
  }
  function busyMessage(r,c) {
    if(NODES[grid()[r]?.[c]])return 'Đây là điểm tài nguyên tự nhiên, không thể di chuyển hoặc phá dỡ.';
    if(state.jobs.some(j=>j.homeRow===r&&j.homeCol===c))return 'Hãy cho công nhân nghỉ và chờ họ về xưởng trước khi di chuyển/gỡ xưởng.';
    if(grid()[r]?.[c]==='b60_combined_warehouse'&&state.jobs.length)return 'Hãy cho công nhân nghỉ trước khi di chuyển kho để giữ tuyến giao hàng.';
    return null;
  }
  function dispatch(job) {
    if(job.load>0){startRoute(job,warehouseRoute(job),'delivery');return;}
    if(job.phase==='home'||job.retiring){
      if(Math.round(job.r)===job.homeRow&&Math.round(job.c)===job.homeCol){job.r=job.homeRow;job.c=job.homeCol;job.phase='idle';job.status='idle';return;}
      const path=route(job,adjacent(job.homeRow,job.homeCol));
      if(path)path.push({r:job.homeRow,c:job.homeCol});
      startRoute(job,path,'home');return;
    }
    const cfg=SHOPS[job.tileId];let best=null, hasStock=false;
    for(const [k,node] of Object.entries(state.nodes)) {
      const [r,c]=k.split('_').map(Number);
      if(grid()[r]?.[c]!==cfg.node||node.remaining<1)continue;
      hasStock=true;const path=route(job,adjacent(r,c));
      if(path&&(!best||path.length<best.path.length))best={k,path};
    }
    if(best){job.nodeKey=best.k;startRoute(job,best.path,'outbound');}
    else job.status=hasStock?'no_path':'no_node';
  }
  function update(dt) {
    dt=Math.min(.25,Math.max(0,finite(dt))); if(!dt)return;
    checkpoint+=dt;retry+=dt;const canRetry=retry>=1;if(canRetry)retry=0;
    let changed=canRetry && ensureNodes();
    for(const [k,node] of Object.entries(state.nodes)) {
      const [r,c]=k.split('_').map(Number),config=NODES[grid()[r]?.[c]];if(!config)continue;
      if(node.remaining===0){node.recovery+=dt;if(node.recovery>=config.recoverySeconds){node.remaining=config.capacity;node.recovery=0;changed=true;}}
    }
    const workforce=labor();let allowedWorkers=Math.max(0,workforce.total-workforce.farmers);
    const foodWorkers=foodWorkerCount(workforce);
    const diners=foodWorkers+(ctx.getSoldierFoodCount?.()||0);
    changed=updateWorkerFood(state.food,ctx.getResources(),diners,dt)||changed;
    const workSpeed=getWorkerFoodSummary(state.food,ctx.getResources(),diners).workSpeed;
    for(const job of [...state.jobs]) {
      if(!SHOPS[job.tileId] || grid()[job.homeRow]?.[job.homeCol]!==job.tileId)continue;
      const canWork=allowedWorkers-->0;
      if(!canWork&&!job.load&&!job.retiring){job.status='understaffed';continue;}
      if(job.retiring&&!job.load&&job.phase==='idle') {state.jobs.splice(state.jobs.indexOf(job),1);changed=true;continue;}
      if(job.path.length) {
        const next=job.path[0];
        const enteringHome=job.phase==='home'&&next.r===job.homeRow&&next.c===job.homeCol;
        if(!enteringHome&&!walkable(next.r,next.c)){job.r=Math.round(job.r);job.c=Math.round(job.c);job.path=[];job.phase=job.load?'delivery':job.retiring?'home':'idle';job.status='no_path';continue;}
        const dr=next.r-job.r,dc=next.c-job.c,dist=Math.hypot(dr,dc),step=dt*1.3;
        job.facing=characterDirection(dr,dc,job.facing||'SE');job.walkPhase=((job.walkPhase||0)+Math.min(dist,step)*4)%4;
        if(dist<=step){job.r=next.r;job.c=next.c;job.path.shift();}
        else{job.r+=dr/dist*step;job.c+=dc/dist*step;}
        continue;
      }
      if(job.phase==='outbound') {job.phase='working';job.status='working';job.work=0;}
      if(job.phase==='working') {
        job.work+=dt*workSpeed; if(job.work<WORK_SECONDS)continue;
        const node=state.nodes[job.nodeKey],coords=String(job.nodeKey).split('_').map(Number);
        if(node&&grid()[coords[0]]?.[coords[1]]===SHOPS[job.tileId].node&&node.remaining>0){
          job.load=Math.min(WORKER_LOAD,node.remaining);node.remaining-=job.load;job.phase='delivery';job.path=[];changed=true;
        } else {job.phase='idle';job.status='no_node';}
      }
      if(job.phase==='delivery'&&job.load) {
        if(!canRetry && ['full','no_warehouse','no_path'].includes(job.status))continue;
        const path=warehouseRoute(job);
        if(!path){job.status='no_warehouse';continue;}
        if(path.length>1){if(canRetry||job.status==='delivery')startRoute(job,path,'delivery');continue;}
        const resources=ctx.getResources(),res=SHOPS[job.tileId].resource;
        if(getWarehouseUsed(resources)+job.load>ctx.getWarehouseCapacity()||(resources[res]||0)+job.load>RESOURCE_MAX_CAPACITY){job.status='full';continue;}
        resources[res]=(resources[res]||0)+job.load;job.load=0;job.phase='home';job.status='home';changed=true;
      }
      if(job.phase==='home') {
        if(job.r===job.homeRow&&job.c===job.homeCol){job.phase='idle';job.status='idle';}
        else if(canRetry)dispatch(job);
      } else if(job.phase==='idle'&&canRetry)dispatch(job);
    }
    if(changed||((state.jobs.length||diners) && checkpoint>=10)){checkpoint=0;ctx.onChanged?.();}
  }
  return {init,getState,hire,dismiss,update,busyMessage,labor,foodSummary,setFoodEnabled};
}
