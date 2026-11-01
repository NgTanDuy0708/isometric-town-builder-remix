import {COMBAT_SHEETS} from '../data/combatArtData.js';
import {characterDirection} from './characterAnimation.js';

const images=new Map();
export function combatVisualState(saved){
  return {facing:['SE','SW','NW','NE'].includes(saved?.facing)?saved.facing:'SE',
    walkPhase:Number.isFinite(saved?.walkPhase)?Math.max(0,saved.walkPhase)%4:0,attackFor:0,hurtFor:0};
}
export function tickCombatVisual(actor,dt){
  actor.attackFor=Math.max(0,(actor.attackFor||0)-dt);
  actor.hurtFor=Math.max(0,(actor.hurtFor||0)-dt);
}
export function advanceCombatWalk(actor,dr,dc,travel){
  actor.facing=characterDirection(dr,dc,actor.facing||'SE');
  actor.walkPhase=((actor.walkPhase||0)+Math.max(0,travel)*4)%4;
}
export function markCombatAttack(actor,target){
  actor.facing=characterDirection(target.r-actor.r,target.c-actor.c,actor.facing||'SE');
  actor.attackFor=.42;
}
export function markCombatHit(actor){actor.hurtFor=.16;}
export function selectCombatFrame(kind,actor){
  const asset=COMBAT_SHEETS[kind];if(!asset)return null;
  const facing=asset.directions[actor.facing]?actor.facing:'SE';
  const walking=actor.path?.length>0&&!['training','understaffed','fighting'].includes(actor.status);
  const index=actor.hp<=0||actor.hurtFor>0?7:actor.attackFor>0?(actor.attackFor>.21?5:6)
    :walking?asset.walkFrames[facing][Math.floor(actor.walkPhase||0)%4]:0;
  return {asset,index,facing,frame:asset.directions[facing][index]};
}
export function prepareCombatImages(onLoad){
  for(const asset of Object.values(COMBAT_SHEETS)){
    let image=images.get(asset.uri);
    if(!image){image=new Image();if(onLoad)image.onload=onLoad;image.src=asset.uri;images.set(asset.uri,image);}
    else if(onLoad)image.onload=onLoad;
  }
}
export function drawCombatCharacter(ctx,kind,actor,x,y,{height=48,onLoad}={}){
  prepareCombatImages(onLoad);
  const selected=selectCombatFrame(kind,actor);if(!selected)return false;
  const image=images.get(selected.asset.uri);
  if(!image?.complete||!image.naturalWidth)return false;
  const {asset,frame}=selected,scale=height/asset.referenceHeight;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.translate(x,y);
  ctx.drawImage(image,frame.x,frame.y,frame.w,frame.h,-frame.anchorX*scale,-frame.anchorY*scale,frame.w*scale,frame.h*scale);
  ctx.restore();return true;
}
