import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { VEHICLE_SHEETS } from '../src/data/vehicleSheetsData.js';
import { selectCharacterFrame, drawAnimatedCharacter } from '../src/engine/characterAnimation.js';
import { VehicleManager } from '../src/engine/trafficVehicles.js';

globalThis.Image=class{complete=true;naturalWidth=1254;naturalHeight=1254;src=''};
function canvas(){
  const draws=[],stack=[],operations=[];let pivot=[0,0];
  const ctx=new Proxy({}, {get(_t,key){
    if(key==='save')return()=>stack.push([...pivot]);
    if(key==='restore')return()=>{assert.ok(stack.length);pivot=stack.pop()};
    if(key==='translate')return(x,y)=>{pivot=[pivot[0]+x,pivot[1]+y]};
    if(key==='drawImage')return(img,...args)=>draws.push({uri:img.src,args,pivot:[...pivot]});
    if(key==='measureText')return()=>({width:20});
    return(...args)=>operations.push({key,args});
  },set(){return true}});
  return {ctx,draws,stack,operations};
}

test('both complete vehicle assemblies have twenty native source-identical transparent frames',()=>{
  assert.deepEqual(Object.keys(VEHICLE_SHEETS).sort(),['horse_carriage','wheat_cart']);
  for(const[id,asset]of Object.entries(VEHICLE_SHEETS)){
    const png=fs.readFileSync(new URL('../public'+asset.uri,import.meta.url));
    assert.deepEqual(png,fs.readFileSync(new URL(`../assets-source/vehicle-sheets-v1/${id}.png`,import.meta.url)));
    assert.equal(createHash('sha256').update(png).digest('hex'),asset.sha256);assert.equal(png[25],6);
    assert.ok(asset.referenceWidth>0);assert.deepEqual(Object.keys(asset.directions),['SE','SW','NW','NE']);
    for(const frames of Object.values(asset.directions)){
      assert.equal(frames.length,5);
      assert.equal(new Set(frames.map(f=>`${f.x},${f.y}`)).size,5);
      assert.equal(new Set(frames.map(f=>f.y+f.anchorY)).size,1,'Rigid chassis shares a baseline within a direction');
      for(const f of frames)assert.ok(f.x>=0&&f.y>=0&&f.x+f.w<=asset.width&&f.y+f.h<=asset.height);
    }
  }
});

test('vehicle animation uses real direction rows and a fixed width/pivot across every frame',()=>{
  for(const type of Object.keys(VEHICLE_SHEETS))for(const facing of ['SE','SW','NW','NE'])for(const phase of [0,1,2,3]){
    const c=canvas(),width=type==='wheat_cart'?54:78;
    assert.equal(drawAnimatedCharacter(c.ctx,'vehicle',type,123.25,456.5,{width,facing,walking:true,phase}),true);
    const d=c.draws[0],f=selectCharacterFrame('vehicle',type,facing,true,phase).frame;
    const [sx,sy,sw,sh,dx,dy,dw,dh]=d.args;
    assert.deepEqual([sx,sy,sw,sh],[f.x,f.y,f.w,f.h]);
    assert.ok(Math.abs(dw/f.w-width/VEHICLE_SHEETS[type].referenceWidth)<1e-8);
    assert.ok(Math.abs(d.pivot[0]+dx+dw*f.anchorX/f.w-123.25)<1e-8);
    assert.ok(Math.abs(d.pivot[1]+dy+dh*f.anchorY/f.h-456.5)<1e-8);
    assert.equal(c.stack.length,0);assert.ok(!c.operations.some(op=>op.key==='scale'),'Back views are real frames, not flipped fronts');
  }
});

test('actual traffic rendering advances motion frames and parks on the idle frame',()=>{
  for(const type of Object.keys(VEHICLE_SHEETS))for(const facing of ['SE','SW','NW','NE']){
    const manager=new VehicleManager();
    const v={...manager.createVehicle({r:20.25,c:19.5},type),facing,path:[{r:21,c:20}],state:'walking',animationPhase:0};
    manager.vehicles=[v];const c=canvas();manager.render(c.ctx,100,200,64,32,{zoom:1});
    const d=c.draws.find(d=>d.uri===VEHICLE_SHEETS[type].uri);assert.ok(d);assert.deepEqual(d.pivot,[116,1566]);
    v.animationPhase=1;const next=canvas();manager.render(next.ctx,100,200,64,32,{zoom:1});
    assert.notDeepEqual(next.draws[0].args.slice(0,4),d.args.slice(0,4));
    v.state='idle';const idle=canvas();manager.render(idle.ctx,100,200,64,32,{zoom:1});
    const f=VEHICLE_SHEETS[type].directions[facing][0];assert.deepEqual(idle.draws[0].args.slice(0,4),[f.x,f.y,f.w,f.h]);
    assert.equal(c.stack.length,0);assert.ok(!c.operations.some(op=>op.key==='fillRect'));
  }
});

test('road travel advances gait by actual distance and follows the same grid axes as villagers',()=>{
  const grid=Array.from({length:4},()=>Array(4).fill('r01_road'));
  const tileMap={r01_road:{category:'road'}};
  for(const[dr,dc,facing]of [[0,1,'SE'],[0,-1,'NW'],[1,0,'SW'],[-1,0,'NE']]){
    const manager=new VehicleManager(),v=manager.createVehicle({r:2,c:2});
    v.path=[{r:2+dr,c:2+dc}];v.speed=1;
    const parked={...manager.createVehicle({r:0,c:0}),state:'idle',stateTimer:100};
    manager.vehicles=[v,parked];manager.update(.25,grid,tileMap,()=>true,{});
    assert.equal(v.facing,facing);assert.equal(v.animationPhase,2);
    assert.equal(v.r,2+dr*.25);assert.equal(v.c,2+dc*.25);
    manager.update(1,grid,tileMap,()=>true,{});
    assert.equal(v.r,2+dr);assert.equal(v.c,2+dc);assert.equal(v.state,'idle');assert.equal(v.animationPhase,8);
    manager.update(.1,grid,tileMap,()=>true,{});assert.equal(v.animationPhase,8,'Stopped wheels and legs do not keep cycling');
  }
});
