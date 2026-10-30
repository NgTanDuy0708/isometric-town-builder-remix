// All pieces use the approved straight-road PNG at one material scale. The
// existing stone artwork is preserved; only the connected outline changes.
const cache = new Map();
const PIXELS = 6;
const SCALE = 38.4 / 13.6;
const basis = {x:627,y:713,ux:246/13.6,uy:152/13.6,vx:-686/64,vy:446/64};

function canvas(width,height) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width,height);
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return undefined;
  const c=document.createElement('canvas');c.width=width;c.height=height;return c;
}

function extract(image,u0,u1,v0,v1,along=false) {
  const width=(u1-u0)*SCALE, height=(v1-v0)*SCALE;
  const c=canvas(Math.ceil((along?height:width)*PIXELS),Math.ceil((along?width:height)*PIXELS));
  const ctx=c?.getContext('2d');if(!ctx)return undefined;
  ctx.scale(PIXELS,PIXELS);
  if(along){ctx.transform(0,1,1,0,0,0)}
  ctx.translate(-u0*SCALE,-v0*SCALE);
  const {x,y,ux,uy,vx,vy}=basis,det=ux*vy-uy*vx;
  const a=vy/det*SCALE,b=-uy/det*SCALE,cx=-vx/det*SCALE,d=ux/det*SCALE;
  ctx.transform(a,b,cx,d,-a*x-cx*y,-b*x-d*y);
  ctx.drawImage(image,0,0);
  return c;
}

export function getRoadMaterials(image) {
  const key=image.currentSrc||image.src;
  if(cache.has(key))return cache.get(key);
  const sample=extract(image,-4.8,4.8,-26,26);
  const curb=extract(image,-6.5,-5.25,-26,26,true);
  if(!sample||!curb)return undefined;
  // Mirrored repeat keeps the original pavers continuous at texture seams.
  const paving=canvas(sample.width*2,sample.height*2),ctx=paving.getContext('2d');
  for(let x=0;x<2;x++)for(let y=0;y<2;y++){
    ctx.save();ctx.translate(x?sample.width*2:0,y?sample.height*2:0);
    ctx.scale(x?-1:1,y?-1:1);ctx.drawImage(sample,0,0);ctx.restore();
  }
  const result={paving,curb,pixels:PIXELS,curbWidth:curb.height/PIXELS};
  cache.set(key,result);return result;
}
