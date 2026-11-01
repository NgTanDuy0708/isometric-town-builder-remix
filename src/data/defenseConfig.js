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
export const ENEMY_KINDS={goblin:{name:'Goblin',level:6},troll:{name:'Quái rừng',level:10},dragon:{name:'Rồng non',level:12}};
export function getEncounterKind(wave,level,region='town'){
  return level>=12&&wave%3===0?'dragon':level>=10&&(region==='forest'||wave%2===0)?'troll':'goblin';
}
export function getEnemyWave(kind,wave,training=false){
  const base=getGoblinWave(wave,training);
  if(kind==='dragon')return {...base,count:1,hp:180+Math.min(10,wave)*8,speed:.55,damage:12,range:2.5,flying:true};
  if(kind==='troll')return {...base,count:training?2:Math.min(4,2+Math.floor(wave/3)),hp:70+Math.min(10,wave)*5,speed:.45,damage:11,range:1.01};
  return {...base,range:1.01};
}
export function getRaidReward(training,wave,kind='goblin'){
  return {gold:training?80:80+Math.min(10,wave)*10+(kind==='dragon'?100:kind==='troll'?40:0),xp:training?30:kind==='dragon'?80:kind==='troll'?55:40,
    ...(kind==='dragon'&&!training?{gems:1}:{})};
}
