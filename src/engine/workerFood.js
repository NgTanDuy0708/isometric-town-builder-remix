import {WORKER_FOODS, WORKER_MEAL_SECONDS, HUNGRY_WORK_SPEED} from '../data/workerFoodConfig.js';

const finite = value => Number.isFinite(value) ? value : 0;
const owned = (resources,id) => Math.max(0,Math.floor(finite(resources?.[id])));
const maxReserve = Math.max(...WORKER_FOODS.map(food=>food.portions))-1;

export function createWorkerFoodState(saved) {
  return {
    // Aggregate worker-seconds. Unpaid demand stops at one portion, so a
    // shortage never creates an unbounded debt or charges time spent offline.
    progress:Math.min(WORKER_MEAL_SECONDS,Math.max(0,finite(saved?.progress))),
    reserve:Math.min(maxReserve,Math.max(0,Math.floor(finite(saved?.reserve)))),
    enabledFoods:WORKER_FOODS.filter(food=>Array.isArray(saved?.enabledFoods)
      ? saved.enabledFoods.includes(food.id) : food.enabled).map(food=>food.id)
  };
}

export function getWorkerFoodSummary(food,resources,workers) {
  const eligible=WORKER_FOODS.filter(item=>food.enabledFoods.includes(item.id));
  const portions=food.reserve+eligible.reduce((sum,item)=>sum+owned(resources,item.id)*item.portions,0);
  const hungry=workers>0 && food.progress>=WORKER_MEAL_SECONDS && portions<1;
  return {workers,portions,reserve:food.reserve,enabledFoods:[...food.enabledFoods],hungry,
    portionsPerMinute:workers*60/WORKER_MEAL_SECONDS,
    secondsUntilMeal:workers ? Math.ceil(Math.max(0,WORKER_MEAL_SECONDS-food.progress)/workers) : null,
    workSpeed:hungry ? HUNGRY_WORK_SPEED : 1};
}

export function updateWorkerFood(food,resources,workers,dt) {
  if(workers<1 || dt<=0 || !Number.isFinite(dt))return false;
  const wasOverdue=food.progress>=WORKER_MEAL_SECONDS;
  food.progress+=workers*dt;
  let consumed=false;
  while(food.progress+1e-9>=WORKER_MEAL_SECONDS){
    if(food.reserve<1){
      const item=WORKER_FOODS.find(item=>food.enabledFoods.includes(item.id)&&owned(resources,item.id)>0);
      if(item){resources[item.id]-=1;food.reserve+=item.portions;consumed=true;}
    }
    if(food.reserve>=1){food.reserve--;food.progress=Math.max(0,food.progress-WORKER_MEAL_SECONDS);consumed=true;}
    else{food.progress=WORKER_MEAL_SECONDS;break;}
  }
  return consumed || wasOverdue!==(food.progress>=WORKER_MEAL_SECONDS);
}
