import {RAID_SHEETS} from '../data/raidArtData.js';
const images=new Map();
export function selectRaidFrame(kind,actor){
  const asset=RAID_SHEETS[kind];if(!asset)return null;
  const direction=asset.directions[actor.facing]||asset.directions.SE;
  const index=kind==='dragon'?Math.floor((actor.flightPhase||0)*8)%4:actor.attackFor>0?3:actor.path?.length?1+Math.floor(actor.walkPhase||0)%2:0;
  return {asset,frame:direction[index],index};
}
export function drawRaidCharacter(ctx,actor,x,y){
  const selected=selectRaidFrame(actor.kind,actor);if(!selected)return false;
  const {asset,frame}=selected;let image=images.get(actor.kind);
  if(!image){image=new Image();image.src=asset.uri;images.set(actor.kind,image);}
  if(!image.complete||!image.naturalWidth)return false;
  const scale=(actor.kind==='dragon'?100:62)/asset.referenceHeight;
  ctx.save();ctx.imageSmoothingEnabled=true;
  ctx.drawImage(image,frame.x,frame.y,frame.w,frame.h,x-frame.anchorX*scale,y-frame.anchorY*scale-(actor.flying?28:0),frame.w*scale,frame.h*scale);
  ctx.restore();return true;
}
