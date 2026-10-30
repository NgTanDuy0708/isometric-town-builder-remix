import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {getDeliveryPose,drawDeliveryTruck,drawDeliveryBoard,DELIVERY_FPS} from '../src/engine/deliveryAnimation.js';
import {DELIVERY_ART} from '../src/data/deliveryArt.js';
import {createOrderBoardManager} from '../src/engine/orderBoardManager.js';

const trip={isDelivering:true,startedAt:1000,tripDurationMs:28000,homeRow:18.5,homeCol:15.3};
test('delivery animation follows the full route with stopped wheels when loading, unloading or parked',()=>{
  assert.equal(getDeliveryPose({...trip,isDelivering:false},5000).frame,0);
  for(const [p,phase,visible,moving] of [[.01,'loading',true,false],[.2,'outbound',true,true],[.5,'delivering',false,false],[.8,'returning',true,true],[.99,'arriving',true,false]]){
    const pose=getDeliveryPose(trip,1000+p*28000);
    assert.equal(pose.phase,phase);assert.equal(pose.isVisible,visible);assert.equal(pose.isMoving,moving);
    if(!moving)assert.equal(pose.frame,0);
  }
  for(const fraction of [.035,.44,.56,.965]){
    const a=getDeliveryPose(trip,1000+fraction*28000-.01),b=getDeliveryPose(trip,1000+fraction*28000+.01);
    assert.ok(Math.abs(a.row-b.row)<.001);assert.ok(Math.abs(a.col-b.col)<.001);
  }
  const frames=new Set(Array.from({length:4},(_,i)=>getDeliveryPose(trip,5000+i*1000/DELIVERY_FPS).frame));
  assert.equal(frames.size,4);
  assert.equal(getDeliveryPose(trip,-5000).row,18.5);
});

test('all four delivered PNGs preserve native alpha and all eight sheet frames have transparent gutters',()=>{
  for(const [key,asset] of Object.entries(DELIVERY_ART)){
    const bytes=readFileSync(new URL('../public'+asset.uri,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
    assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20),bytes[25]],[1254,1254,6]);
    assert.equal(asset.frames.length,['outgoing','returning'].includes(key)?4:1);
    for(const [i,frame] of asset.frames.entries()){
      const cells=asset.frames.length===4?2:1,cell=1254/cells;
      const x=i%cells*cell,y=Math.floor(i/cells)*cell,[l,t,r,b]=frame.bounds;
      assert.ok(l>x&&t>y&&r<x+cell&&b<y+cell,'Complete vehicle fits inside its frame');
      assert.equal(frame.anchor[1],b);
    }
  }
});

test('actual delivery renderer selects native outgoing/return sheets and preserves Canvas state',()=>{
  globalThis.Image=class{complete=true;naturalWidth=1254;naturalHeight=1254;src='';};
  const calls=[],stack=[];
  const state={globalAlpha:.7,imageSmoothingEnabled:false,imageSmoothingQuality:'low'};
  const ctx=new Proxy(state,{get(target,key){
    if(key in target)return target[key];
    if(key==='save')return()=>stack.push({...state});
    if(key==='restore')return()=>Object.assign(state,stack.pop());
    if(key==='drawImage')return(image,...args)=>calls.push({src:image.src,args});
    return()=>{};
  }});
  for(const p of [.2,.8]){
    const pose=getDeliveryPose(trip,1000+p*28000);drawDeliveryTruck(ctx,100,200,pose,2);
    assert.equal(calls.at(-1).src,DELIVERY_ART[p<.5?'outgoing':'returning'].uri);
    const asset=DELIVERY_ART[p<.5?'outgoing':'returning'],frame=asset.frames[pose.frame];
    assert.deepEqual(calls.at(-1).args.slice(0,4),[frame.bounds[0],frame.bounds[1],frame.bounds[2]-frame.bounds[0],frame.bounds[3]-frame.bounds[1]]);
    assert.equal(stack.length,0);assert.equal(state.globalAlpha,.7);assert.equal(state.imageSmoothingEnabled,false);
  }
  const before=calls.length;drawDeliveryTruck(ctx,0,0,getDeliveryPose(trip,15000),2);assert.equal(calls.length,before);
  drawDeliveryBoard(ctx,10,20,3);assert.equal(calls.at(-1).src,DELIVERY_ART.board.uri);assert.equal(stack.length,0);
});

test('animated delivery still awards once at the real trip completion, including a restored trip',()=>{
  const originalNow=Date.now;let now=100000,gold=0,xp=0;
  Date.now=()=>now;
  globalThis.document={getElementById:()=>null};globalThis.window={addEventListener(){}};
  const noop=()=>{};
  try{
    const manager=createOrderBoardManager({getPlayerLevel:()=>1,getPlayerResources:()=>({}),addPlayerGold:n=>gold+=n,addPlayerXP:n=>xp+=n,
      updateGoldDisplay:noop,updateResourcesUI:noop,persistGameState:noop,showToast:noop,requestRender:noop});
    const cargo={id:'animated-trip',items:[{resourceId:'wheat',amount:2}],rewardGold:17,rewardXP:9,npc:{name:'Customer'}};
    manager.init({orders:Array.from({length:6},()=>({cooldownUntil:now+900000})),truckState:{isDelivering:true,order:cargo,startedAt:now,returnsAt:now+28000}});
    now+=27999;manager.update();assert.equal(gold,0);assert.equal(xp,0);assert.equal(manager.getTruckCell().phase,'arriving');
    now++;manager.update();manager.update();assert.equal(gold,17);assert.equal(xp,9);assert.equal(manager.isTruckDelivering(),false);
    assert.equal(manager.getTruckCell().phase,'idle');
  }finally{Date.now=originalNow;}
});
