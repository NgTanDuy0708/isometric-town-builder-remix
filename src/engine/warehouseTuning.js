// Separate calibration for the new PNG; the previous image's saved edits stay intact.
export const WAREHOUSE_TUNING_KEY = 'isometric_town_builder_warehouse_three_storey_tuning_v2';
export const DEFAULT_WAREHOUSE_TUNING = Object.freeze({
  size:1, width:1, height:1.0581079634826311, worldWidth:256, x:0, y:0,
  anchorX:638.0688270368859, anchorY:1238.1570163324172, worldX:64, worldY:128,
  rotation:0, shearX:0, shearY:-0.022608376497149196, opacity:1, flipX:false
});
export const WAREHOUSE_LIMITS = {
  size:[.1,4,.01],width:[.1,4,.01],height:[.1,4,.01],worldWidth:[16,2048,.1],
  x:[-1024,1024,.1],y:[-1024,1024,.1],anchorX:[-1254,2508,.1],anchorY:[-1254,2508,.1],
  worldX:[-1024,1024,.1],worldY:[-1024,1024,.1],rotation:[-180,180,.1],
  shearX:[-2,2,.001],shearY:[-2,2,.001],opacity:[0,1,.01]
};
export function normalizeWarehouseTuning(input) {
  const result={...DEFAULT_WAREHOUSE_TUNING};
  for(const [key,[min,max]] of Object.entries(WAREHOUSE_LIMITS)) {
    if(typeof input?.[key]==='number'&&Number.isFinite(input[key]))result[key]=Math.max(min,Math.min(max,input[key]));
  }
  if(typeof input?.flipX==='boolean')result.flipX=input.flipX;
  return result;
}
export function readWarehouseTuning() {
  try{return normalizeWarehouseTuning(JSON.parse(localStorage.getItem(WAREHOUSE_TUNING_KEY)||'null'));}
  catch{return {...DEFAULT_WAREHOUSE_TUNING};}
}
export function getWarehouseRenderAdjustment(source,input) {
  const t=normalizeWarehouseTuning(input),scale=t.worldWidth/source.visibleWidth*t.size;
  const dw=source.width*scale*t.width,dh=source.height*scale*t.height;
  const pivotX=t.worldX+t.x,pivotY=t.worldY+t.y;
  return {dx:pivotX-t.anchorX*dw/source.width,dy:pivotY-t.anchorY*dh/source.height,dw,dh,
    pivotX,pivotY,rotation:t.rotation,shearX:t.shearX,shearY:t.shearY,opacity:t.opacity,flipX:t.flipX,highQuality:true};
}
export function drawWarehouseSprite(ctx,image,adj,ox=0,oy=0,flipped=false) {
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.globalAlpha=(typeof ctx.globalAlpha==='number'?ctx.globalAlpha:1)*adj.opacity;
  if(!!flipped!==!!adj.flipX){ctx.translate(ox+128,oy);ctx.scale(-1,1);ox=oy=0;}
  if(adj.rotation||adj.shearX||adj.shearY){
    const px=ox+adj.pivotX,py=oy+adj.pivotY;
    ctx.translate(px,py);
    if(adj.rotation)ctx.rotate(adj.rotation*Math.PI/180);
    if(adj.shearX||adj.shearY)ctx.transform(1,adj.shearY,adj.shearX,1,0,0);
    ctx.translate(-px,-py);
  }
  ctx.drawImage(image,ox+adj.dx,oy+adj.dy,adj.dw,adj.dh);ctx.restore();
}
