import {RUNTIME_ART} from '../data/runtimeArtData.js';

const cache=new Map();
export function getRuntimeArtImage(kind,id,onLoad) {
  const asset=RUNTIME_ART[kind]?.[id];
  if(!asset)return null;
  let image=cache.get(asset.uri);
  if(!image){
    image=new Image();
    if(onLoad)image.onload=onLoad;
    image.src=asset.uri;cache.set(asset.uri,image);
  }
  return image;
}

// Crop only transparent padding at draw time. Source PNGs stay untouched.
// The bottom-center pivot remains on the actor's fractional world position.
export function drawRuntimeActor(ctx,kind,id,x,y,{height,width,flipped=false,onLoad}={}) {
  const asset=RUNTIME_ART[kind]?.[id],image=getRuntimeArtImage(kind,id,onLoad);
  if(!asset||!image?.complete||!image.naturalWidth)return false;
  const [left,top,right,bottom]=asset.bounds;
  const scale=width?width/(right-left):height/(bottom-top);
  const w=(right-left)*scale,h=(bottom-top)*scale;
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.translate(x,y);if(flipped)ctx.scale(-1,1);
  ctx.drawImage(image,left,top,right-left,bottom-top,-w/2,-h,w,h);
  ctx.restore();return true;
}

export function drawResourceIcon(ctx,id,x,y,size=20,onLoad) {
  if(id==='ancientWood')id='wood';
  const asset=RUNTIME_ART.icon[id],image=getRuntimeArtImage('icon',id,onLoad);
  if(!asset||!image?.complete||!image.naturalWidth)return false;
  const [left,top,right,bottom]=asset.bounds,scale=size/Math.max(right-left,bottom-top);
  const w=(right-left)*scale,h=(bottom-top)*scale;
  ctx.save();ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,left,top,right-left,bottom-top,x-w/2,y-h/2,w,h);ctx.restore();return true;
}
