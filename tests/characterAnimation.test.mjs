import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { CHARACTER_SHEETS } from '../src/data/characterSheetsData.js';
import { characterDirection, selectCharacterFrame, drawAnimatedCharacter } from '../src/engine/characterAnimation.js';
import { VillagerManager } from '../src/engine/villagers.js';
import { TownVisitorManager } from '../src/engine/townVisitors.js';
import { NPC_CUSTOMERS } from '../src/data/orderBoardConfig.js';

globalThis.Image = class { complete=true; naturalWidth=1254; naturalHeight=1254; src=''; };
function canvas() {
  const draws=[],stack=[],translations=[];let current=[0,0];
  const ctx=new Proxy({}, {get(_t,key){
    if(key==='save')return()=>stack.push([...current]);
    if(key==='restore')return()=>{assert.ok(stack.length);current=stack.pop()};
    if(key==='translate')return(x,y)=>{current=[current[0]+x,current[1]+y];translations.push([x,y])};
    if(key==='drawImage')return(image,...args)=>draws.push({uri:image.src,args,pivot:[...current]});
    if(key==='measureText')return()=>({width:30});
    return()=>{};
  },set(){return true}});
  return {ctx,draws,stack,translations};
}

test('six redesigned villagers and ten visitors each have a native 20-frame sheet',()=>{
  assert.equal(Object.keys(CHARACTER_SHEETS.villager).length,6);
  assert.deepEqual(Object.keys(CHARACTER_SHEETS.visitor).sort(),NPC_CUSTOMERS.map(n=>n.id).sort());
  for(const[group,assets]of Object.entries(CHARACTER_SHEETS))for(const[id,asset]of Object.entries(assets)){
    const bytes=fs.readFileSync(new URL('../public'+asset.uri,import.meta.url));
    const original=fs.readFileSync(new URL(`../assets-source/character-sheets-v1/${group}_${id}.png`,import.meta.url));
    assert.deepEqual(bytes,original);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
    assert.equal(bytes[25],6,'True RGBA PNG');
    assert.deepEqual(Object.keys(asset.directions),['SE','SW','NW','NE']);
    for(const frames of Object.values(asset.directions)){
      assert.equal(frames.length,5);
      for(const f of frames){assert.ok(f.x>=0&&f.y>=0&&f.w>0&&f.h>0);assert.ok(f.x+f.w<=asset.width&&f.y+f.h<=asset.height);assert.ok(f.anchorX>=0&&f.anchorX<=f.w&&f.anchorY<=f.h);}
    }
  }
});

test('grid movement chooses real front/back rows and idle never advances',()=>{
  assert.equal(characterDirection(0,1),'SE');assert.equal(characterDirection(1,0),'SW');
  assert.equal(characterDirection(0,-1),'NW');assert.equal(characterDirection(-1,0),'NE');
  assert.equal(characterDirection(0,0,'NW'),'NW');
  for(const direction of ['SE','SW','NW','NE']){
    const idle=selectCharacterFrame('villager','farmer_young',direction,false,100);
    assert.equal(idle.index,0);
    const frames=[0,1,2,3,4].map(phase=>selectCharacterFrame('villager','farmer_young',direction,true,phase));
    assert.deepEqual(frames.map(f=>f.index),[1,2,3,4,1]);
    assert.equal(new Set(frames.slice(0,4).map(f=>`${f.frame.x},${f.frame.y}`)).size,4);
  }
});

test('every animation frame keeps its measured feet on the same fractional world point',()=>{
  for(const direction of ['SE','SW','NW','NE'])for(const phase of [0,1,2,3]){
    const c=canvas();assert.equal(drawAnimatedCharacter(c.ctx,'villager','farmer_young',123.25,456.5,{facing:direction,walking:true,phase}),true);
    const d=c.draws[0],f=selectCharacterFrame('villager','farmer_young',direction,true,phase).frame;
    const [sx,sy,sw,sh,dx,dy,dw,dh]=d.args;
    assert.deepEqual([sx,sy,sw,sh],[f.x,f.y,f.w,f.h]);
    assert.ok(Math.abs(d.pivot[0]+dx+dw*f.anchorX/f.w-123.25)<1e-8);
    assert.ok(Math.abs(d.pivot[1]+dy+dh*f.anchorY/f.h-456.5)<1e-8);
    assert.equal(c.stack.length,0);
  }
});

test('actual villagers use redesigned sheets, walk frames, back views and stationary idle frames',()=>{
  const manager=new VillagerManager();
  for(const id of Object.keys(CHARACTER_SHEETS.villager)){
    const v={...manager.createVillager({r:20.25,c:19.5}),spriteKey:id,facing:'NW',state:'walking',walkPhase:1,bounce:0};
    manager.villagers=[v];const c=canvas();manager.render(c.ctx,100,200,64,32,0,1);
    assert.equal(c.draws.length,1);assert.equal(c.draws[0].uri,CHARACTER_SHEETS.villager[id].uri);
    const first=c.draws[0].args.slice(0,4);v.walkPhase=2;const next=canvas();manager.render(next.ctx,100,200,64,32,0,1);
    assert.notDeepEqual(next.draws[0].args.slice(0,4),first);
    v.state='visiting';const idle=canvas();manager.render(idle.ctx,100,200,64,32,0,1);
    const f=CHARACTER_SHEETS.villager[id].directions.NW[0];assert.deepEqual(idle.draws[0].args.slice(0,4),[f.x,f.y,f.w,f.h]);
    assert.equal(c.stack.length,0);
  }
});

test('all visitor identities animate without losing requested-item bubbles or saved movement',()=>{
  for(const npc of NPC_CUSTOMERS){
    const manager=new TownVisitorManager({requestRender(){}}),c=canvas();
    const v={npc,row:20.25,col:19.5,state:'waiting',heartsAnim:0,requestedItem:{resourceId:'watermelon',amount:2},facing:'NE',walkPhase:10};
    manager.visitors=[v];manager.render(c.ctx,100,200,64,32,0);
    assert.ok(c.draws.some(d=>d.uri===CHARACTER_SHEETS.visitor[npc.id].uri));
    assert.ok(c.draws.some(d=>d.uri.includes('/icon/watermelon')));
    assert.equal(c.stack.length,0);
  }
  const manager=new TownVisitorManager({getPlayerLevel:()=>1});manager.nextSpawnTimer=100;
  const v={npc:NPC_CUSTOMERS[0],row:25,col:15,targetRow:17.6,targetCol:14.5,walkSpeed:1,state:'walking_in'};
  manager.visitors=[v];manager.update(.1);assert.equal(v.facing,'NE');assert.ok(v.walkPhase>0);
  v.state='walking_out';manager.update(.1);assert.equal(v.facing,'SW');
});
