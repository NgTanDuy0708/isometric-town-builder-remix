import {BASIC_STEPS,getGuide} from '../data/tutorialGuides.js';
import {isHousingTile} from '../data/housingConfig.js';
import {CROPS_CONFIG,getCropGrowDurationMs} from '../data/cropsConfig.js';

export function createTutorialState(raw){
  const ids=new Set(BASIC_STEPS.map(s=>s.id)),valid=id=>typeof id==='string'&&!!getGuide(id);
  return {version:2,basic:{status:['new','active','complete','skipped'].includes(raw?.basic?.status)?raw.basic.status:'new',
    stepId:ids.has(raw?.basic?.stepId)?raw.basic.stepId:'welcome'},
    milestones:{plantedWheat:!!raw?.milestones?.plantedWheat,harvestedWheat:!!raw?.milestones?.harvestedWheat,soldWheat:!!raw?.milestones?.soldWheat},
    rewarded:!!raw?.rewarded,lastLevel:Math.max(1,Math.min(25,Math.floor(Number(raw?.lastLevel)||1))),
    completedGuides:[...new Set((Array.isArray(raw?.completedGuides)?raw.completedGuides:[]).filter(valid))],
    queue:[...new Set((Array.isArray(raw?.queue)?raw.queue:[]).filter(valid))],
    activeGuide:valid(raw?.activeGuide)?raw.activeGuide:null,
    guideStepId:typeof raw?.guideStepId==='string'?raw.guideStepId:'summary',deferred:!!raw?.deferred};
}
export function getTutorialFacts(ctx,state,now=Date.now()){
  const grid=ctx.getCurrentGrid?.()||[],pending=ctx.getConstructions?.()||{},farms=ctx.getFarmlandState?.()||{},resources=ctx.getPlayerResources?.()||{};
  const houses=[],fields=[],wheat=[];
  for(let row=0;row<grid.length;row++)for(let col=0;col<grid[row].length;col++){
    const key=`${row}_${col}`,id=grid[row][col];
    if(isHousingTile(id)&&!pending[key])houses.push({row,col});
    if(id==='d13_farmland_plot'&&!pending[key]){
      fields.push({row,col});const farm=farms[key];
      if(farm?.seedId==='wheat')wheat.push({row,col,remaining:Math.max(0,Math.ceil((farm.plantTime+getCropGrowDurationMs(farm)-now)/1000))});
    }
  }
  return {houses,fields,wheat,houseReady:houses.length>0,housePending:Object.values(pending).some(c=>isHousingTile(c?.targetTileId)),
    planted:wheat.length>0||(resources.wheat||0)>0||state.milestones.harvestedWheat||state.milestones.soldWheat,
    wheatReady:wheat.some(f=>f.remaining===0),harvested:(resources.wheat||0)>0||state.milestones.harvestedWheat||state.milestones.soldWheat,
    sold:state.milestones.soldWheat,brush:ctx.getActiveBrush?.(),seedBrush:ctx.getActiveSeedBrush?.(),
    wheatSeconds:wheat.length?Math.min(...wheat.map(f=>f.remaining)):CROPS_CONFIG.wheat.growTimeSec};
}
export function basicStepDone(id,f,ui){
  switch(id){
    case 'house-shop':return f.housePending||f.houseReady||ui.panels?.shop;
    case 'house-category':return f.housePending||f.houseReady||ui.shopCategory==='residential';
    case 'choose-house':return f.housePending||f.houseReady||f.brush==='b01_cottage_red';
    case 'place-house':return f.housePending||f.houseReady;
    case 'leave-house-tool':return !f.brush;
    case 'wait-house':return f.houseReady;
    case 'farm-shop':return f.fields.length>0||ui.panels?.shop;
    case 'farm-category':return f.fields.length>0||ui.shopCategory==='farming';
    case 'choose-farm':return f.fields.length>0||f.brush==='d13_farmland_plot';
    case 'place-farm':return f.fields.length>0;
    case 'leave-farm-tool':return !f.brush;
    case 'open-seed':return f.planted||ui.panels?.seed;
    case 'plant-wheat':return f.planted;
    case 'leave-seed-tool':return !f.seedBrush;
    case 'wait-wheat':return f.wheatReady||f.harvested;
    case 'harvest-wheat':return f.harvested;
    case 'market-open':return f.sold||ui.panels?.market;
    case 'sell-wheat':return f.sold;
    case 'market-close':return !ui.panels?.market;
    case 'quests-open':return !!ui.panels?.quests;
    case 'warehouse-open':return !!ui.panels?.warehouse;
    default:return false;
  }
}
