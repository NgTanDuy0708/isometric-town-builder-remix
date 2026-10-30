import {DELIVERY_ART} from '../data/deliveryArt.js';

const images=new Map();
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const DELIVERY_FPS=10;
export function getDeliveryPose(state,now=Date.now()) {
  const homeRow=state.homeRow??18.5,homeCol=state.homeCol??15.3;
  const base={row:homeRow,col:homeCol,isVisible:true,isReturning:false,isMoving:false,phase:'idle',phaseProgress:0,frame:0,progress:0};
  if(!state.isDelivering)return base;
  const duration=state.tripDurationMs>0?state.tripDurationMs:28000;
  const elapsed=Math.max(0,now-state.startedAt),p=clamp(elapsed/duration);
  let phase,phaseProgress,row=homeRow,col=homeCol,isReturning=false,isMoving=false,isVisible=true;
  if(p<.035){phase='loading';phaseProgress=p/.035;}
  else if(p<.44){
    phase='outbound';phaseProgress=(p-.035)/.405;isMoving=true;
    row=homeRow+(40-homeRow)*phaseProgress;
    col=phaseProgress<.1?homeCol+(15-homeCol)*phaseProgress/.1:15;
  }else if(p<.56){phase='delivering';phaseProgress=(p-.44)/.12;row=40;col=15;isVisible=false;}
  else if(p<.965){
    phase='returning';phaseProgress=(p-.56)/.405;isReturning=true;isMoving=true;
    row=40-(40-homeRow)*phaseProgress;
    col=phaseProgress>.9?15+(homeCol-15)*(phaseProgress-.9)/.1:15;
  }else{phase='arriving';phaseProgress=(p-.965)/.035;isReturning=true;}
  return {row,col,isVisible,isReturning,isMoving,phase,phaseProgress:clamp(phaseProgress),progress:p,
    frame:isMoving?Math.floor(elapsed/1000*DELIVERY_FPS)%4:0};
}

function getImage(key,onLoad) {
  const asset=DELIVERY_ART[key];
  if(!images.has(key)){
    const image=new Image();image.onload=()=>onLoad?.();image.src=asset.uri;images.set(key,image);
  }
  return images.get(key);
}
export function preloadDeliveryArt(onLoad){if(typeof Image==='undefined')return;for(const key of Object.keys(DELIVERY_ART))getImage(key,onLoad);}

// Native sheet pixels remain untouched. Per-frame origins align to the same
// road contact point; transparent gutters never become visible shaking.
export function drawDeliveryAsset(ctx,key,frame,x,y,onLoad) {
  const asset=DELIVERY_ART[key],image=getImage(key,onLoad);
  if(!image?.complete||!image.naturalWidth)return false;
  const part=asset.frames[clamp(frame,0,asset.frames.length-1)];
  const [left,top,right,bottom]=part.bounds;
  const maxWidth=Math.max(...asset.frames.map(f=>f.bounds[2]-f.bounds[0]));
  const scale=asset.worldWidth/maxWidth;
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(image,left,top,right-left,bottom-top,x+(left-part.anchor[0])*scale,y+(top-part.anchor[1])*scale,
    (right-left)*scale,(bottom-top)*scale);
  ctx.restore();return true;
}

export function drawDeliveryTruck(ctx,x,y,pose,time=0,onLoad) {
  if(!pose.isVisible)return;
  ctx.save();
  ctx.fillStyle='rgba(15,23,32,.18)';ctx.beginPath();ctx.ellipse(x,y+2,23,7,0,0,Math.PI*2);ctx.fill();
  if(pose.isMoving){
    // Steam is generated in the world, independently of the wheel frames.
    for(let i=0;i<3;i++){
      const age=(time*1.8+i/3)%1,dx=pose.isReturning?20:-19;
      ctx.save();ctx.globalAlpha=(1-age)*.42;ctx.fillStyle='#e6e8dc';
      ctx.beginPath();ctx.arc(x+dx+(pose.isReturning?-1:1)*age*9,y-(pose.isReturning?47:37)-age*15,1.5+age*3,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }
  const bounce=pose.isMoving?Math.sin(time*23)*.55:pose.phase==='loading'?Math.sin(pose.phaseProgress*Math.PI)*.65:
    pose.phase==='arriving'?Math.sin(pose.phaseProgress*Math.PI*4)*(1-pose.phaseProgress)*.8:0;
  const key=pose.isReturning?'returning':pose.phase==='idle'?'idle':'outgoing';
  const drawn=drawDeliveryAsset(ctx,key,pose.frame,x,y+bounce,onLoad);
  if(!drawn)drawDeliveryAsset(ctx,'idle',0,x,y,onLoad);
  if(pose.phase==='loading'){
    ctx.save();ctx.globalAlpha=Math.sin(pose.phaseProgress*Math.PI)*.8;ctx.fillStyle='#f6df91';
    for(let i=0;i<3;i++){const xx=x+10+i*5,yy=y-38-pose.phaseProgress*7-i*2;ctx.fillRect(xx,yy,2,2);}
    ctx.restore();
  }
  ctx.restore();
}

export function drawDeliveryBoard(ctx,x,y,time=0,onLoad) {
  drawDeliveryAsset(ctx,'board',0,x,y,onLoad);
  // Lantern glimmer is subtle and never moves the feet of the board.
  ctx.save();ctx.globalAlpha=.16+.07*Math.sin(time*4.5);ctx.fillStyle='#ffe6a0';
  ctx.beginPath();ctx.arc(x+26,y-25,3,0,Math.PI*2);ctx.fill();ctx.restore();
}
