import {ORIGIN_X,ORIGIN_Y,HALF_W,QUARTER_W} from './isoMath.js';

export function getDefenseCameraView(summary,viewport){
  if(!summary?.raid?.spawn)return null;
  const spawn=summary.raid.spawn;
  const points=[spawn,...summary.enemies.filter(enemy=>enemy.hp>0)];
  const tower=summary.towerList.filter(tower=>tower.hp>0).sort((a,b)=>
    Math.hypot(a.r-spawn.r,a.c-spawn.c)-Math.hypot(b.r-spawn.r,b.c-spawn.c))[0];
  if(tower)points.push(tower);
  const xs=points.map(point=>ORIGIN_X+(point.c-point.r)*HALF_W+64);
  const ys=points.map(point=>ORIGIN_Y+(point.r+point.c)*QUARTER_W+96);
  const minX=Math.min(...xs)-100,maxX=Math.max(...xs)+100;
  const minY=Math.min(...ys)-160,maxY=Math.max(...ys)+80;
  const width=Math.max(1,viewport.width),height=Math.max(1,viewport.height);
  const left=Math.min(290,width*.22),top=Math.min(130,height*.2),right=32,bottom=48;
  const zoom=Math.max(.15,Math.min(.9,(width-left-right)/(maxX-minX),(height-top-bottom)/(maxY-minY)));
  return {zoom,x:(left+width-right)/2-(minX+maxX)/2*zoom,
    y:(top+height-bottom)/2-(minY+maxY)/2*zoom};
}
