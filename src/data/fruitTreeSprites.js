import {FRUIT_TREE_SPRITE_DATA} from './fruitTreeSpriteData.js';
import {WORLD_OBJECT_SCALE} from './renderScale.js';
export const EXPANSION_PLANTS=FRUIT_TREE_SPRITE_DATA;
export function getFruitTreeRenderAdjustment(id,stage='fruiting') {
  const species=FRUIT_TREE_SPRITE_DATA[id],g=species?.geometry[stage];
  if(!g)return undefined;
  let scale=species.worldWidth*WORLD_OBJECT_SCALE/species.matureWidth;
  if(stage==='seed'){
    const sapling=species.geometry.seedling.bounds;
    scale=Math.min(scale,(id==='d22_coconut_palm'?24:18)/(g.bounds[2]-g.bounds[0]),scale*(sapling[3]-sapling[1])*.35/(g.bounds[3]-g.bounds[1]));
  }
  if(stage==='sprout'){
    const sapling=species.geometry.seedling.bounds;
    scale*=Math.min(1,(sapling[3]-sapling[1])*.6/(g.bounds[3]-g.bounds[1]));
  }
  return {dx:64-g.anchor.x*scale,dy:96-g.anchor.y*scale,dw:g.width*scale,dh:g.height*scale,highQuality:true};
}
export function paintFruitTreeThumbnail(canvas,id,stage='seed') {
  const data=FRUIT_TREE_SPRITE_DATA[id],ctx=canvas?.getContext('2d');if(!data||!ctx)return;
  const img=new Image();img.onload=()=>{
    const g=data.geometry[stage],[x,y,right,bottom]=g.bounds;
    const scale=Math.min((canvas.width-12)/(right-x),(canvas.height-12)/(bottom-y));
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingQuality='high';
    ctx.drawImage(img,x,y,right-x,bottom-y,(canvas.width-(right-x)*scale)/2,(canvas.height-(bottom-y)*scale)/2,(right-x)*scale,(bottom-y)*scale);
  };img.src=data.stages[stage];
}
