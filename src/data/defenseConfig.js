export const DEFENSE_UNLOCK_LEVEL=6;
export const VILLAGE_MAX_HP=100;
export const TOWER_TILE='b08_watchtower';
export const TRAINING_WARNING_SECONDS=15;
export const RAID_WARNING_SECONDS=60;
export const FIRST_RAID_PREPARATION_SECONDS=300;
export const RAID_INTERVAL_SECONDS=[480,720];
export const RAID_DURATION_SECONDS=120;
export const GOBLIN_SPAWN_SECONDS=3;
export const TOWER_REPAIR={gold:20,resources:{wood:1,stone:1}};
export const VILLAGE_REPAIR={gold:50,resources:{wood:2,stone:2}};
export function getTowerDefense(level=1){
  level=Math.min(3,Math.max(1,Math.floor(Number(level)||1)));
  return {hp:100,range:4+(level-1)*.5,damage:18+(level-1)*6,interval:1};
}
export function getGoblinWave(wave=0,training=false){
  return {count:training?3:Math.min(6,3+Math.floor(wave/2)),
    hp:training?30:30+Math.min(10,wave)*4,speed:.65,damage:training?7:8+Math.min(5,wave)};
}
export function getRaidReward(training,wave){
  return {gold:training?80:80+Math.min(10,wave)*10,xp:training?30:40};
}
