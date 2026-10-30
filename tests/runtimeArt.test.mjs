import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {RUNTIME_ART} from '../src/data/runtimeArtData.js';
import {RESOURCE_ICON_URIS,resourceIconHtml} from '../src/data/resourceIcons.js';
import {RESOURCES_CONFIG} from '../src/data/resourcesConfig.js';
import {NPC_CUSTOMERS} from '../src/data/orderBoardConfig.js';
import {TownVisitorManager} from '../src/engine/townVisitors.js';
import {VehicleManager} from '../src/engine/trafficVehicles.js';
import {SOWN_CROP_SPRITES,getSownCropSpriteId} from '../src/data/cropVisuals.js';
import {CROP_GROWTH_SPRITES} from '../src/data/cropGrowthSprites.js';
import {drawRuntimeActor,drawResourceIcon} from '../src/engine/runtimeArt.js';
import {CHARACTER_SHEETS} from '../src/data/characterSheetsData.js';
import {VEHICLE_SHEETS} from '../src/data/vehicleSheetsData.js';

globalThis.Image=class{complete=true;naturalWidth=1254;naturalHeight=1254;src='';addEventListener(){}};
const {KingdomWondersManager}=await import('../src/engine/kingdomWonders.js');
function canvas(){
 const draws=[],operations=[],stack=[];let state={globalAlpha:1};
 const context=new Proxy({}, {get(_target,key){
  if(key==='save')return ()=>stack.push({...state});
  if(key==='restore')return ()=>{assert.ok(stack.length);state=stack.pop()};
  if(key==='drawImage')return (image,...args)=>draws.push({uri:image.src,args,alpha:state.globalAlpha});
  if(key==='measureText')return ()=>({width:30});
  if(key==='globalAlpha')return state.globalAlpha;
  return (...args)=>operations.push({key,args});
 },set(_target,key,value){state[key]=value;return true}});
 return {context,draws,operations,stack};
}

test('all requested runtime assets are real source-identical PNGs',()=>{
 assert.deepEqual(Object.fromEntries(Object.entries(RUNTIME_ART).map(([kind,data])=>[kind,Object.keys(data).length])),{visitor:10,vehicle:2,wonder:8,watermelon:4,icon:38,cabbage:4});
 for(const [kind,group] of Object.entries(RUNTIME_ART))for(const [id,asset] of Object.entries(group)){
  const publicBytes=fs.readFileSync(new URL('../public'+asset.uri,import.meta.url));
  assert.equal(createHash('sha256').update(publicBytes).digest('hex'),asset.sha256,kind+'/'+id);
  assert.deepEqual(publicBytes,fs.readFileSync(new URL('../assets-source/runtime-art/'+kind+'/'+id+'.png',import.meta.url)));
  const [left,top,right,bottom]=asset.bounds;
  assert.ok(left>0&&top>0&&right<asset.width&&bottom<asset.height,'Complete unclipped subject');
 }
});

test('established resources keep their native icons and the four new materials use explicit temporary symbols',()=>{
 const pendingMaterialArt=['ironOre','plank','buildingStone','ironIngot'];
 assert.deepEqual(Object.keys(RESOURCE_ICON_URIS).sort(),Object.keys(RESOURCES_CONFIG).filter(id=>!pendingMaterialArt.includes(id)).sort());
 for(const id of pendingMaterialArt){
  assert.equal(RESOURCES_CONFIG[id].category,'material');
  assert.equal(resourceIconHtml(id,RESOURCES_CONFIG[id].name,24,RESOURCES_CONFIG[id].icon),RESOURCES_CONFIG[id].icon);
 }
});

test('all ten actual visitors use unique full-body sprites and keep order bubbles and fractional positions',()=>{
 for(const npc of NPC_CUSTOMERS){
  const manager=new TownVisitorManager({requestRender(){}}),c=canvas();
  const visitor={npc,row:20.25,col:19.5,state:'waiting',heartsAnim:0,requestedItem:{resourceId:'watermelon',amount:2}};
  manager.visitors=[visitor];manager.render(c.context,100,200,64,32,0);
  assert.ok(c.draws.some(d=>d.uri===CHARACTER_SHEETS.visitor[npc.id].uri));
  assert.ok(c.draws.some(d=>d.uri===RUNTIME_ART.icon.watermelon.uri),'Actual order bubble uses the requested item icon');
  assert.equal(c.stack.length,0);
  assert.ok(c.operations.some(op=>op.key==='translate'&&op.args[0]===116&&op.args[1]===1568));
 }
});

test('both real traffic vehicles use PNGs with their people and never paint primitive bodies',()=>{
 for(const type of ['wheat_cart','horse_carriage'])for(const facing of ['SE','SW','NE','NW']){
  const manager=new VehicleManager(),c=canvas();
  manager.vehicles=[{id:'v',type,facing,r:20.4,c:19.3}];
  manager.render(c.context,0,0,64,32,{zoom:1});
  assert.equal(c.draws.filter(d=>d.uri===VEHICLE_SHEETS[type].uri).length,1);
  assert.ok(!c.operations.some(op=>op.key==='fillRect'),'No primitive horse / farmer / cart body');
  assert.equal(c.stack.length,0);
 }
});

test('library and Poseidon render every construction phase at full opacity with no fake scaffolding',()=>{
 const manager=new KingdomWondersManager({requestRender(){}});
 for(const id of ['ocean_library','poseidon_statue'])for(let stage=0;stage<=4;stage++){
  const c=canvas();manager.wondersState[id]=stage;
  manager.renderSite(c.context,{id,row:20,col:20,placed:true},0,0,64,32,0);
  const uri=stage<4?RUNTIME_ART.wonder[id+'_stage'+stage].uri:'/assets/wonders/'+id+'.png';
  assert.ok(c.draws.some(d=>d.uri===uri&&d.alpha===1),id+' phase '+stage);
  assert.ok(!c.operations.some(op=>op.key==='strokeRect'),'No procedural scaffold over the real construction art');
  assert.equal(c.stack.length,0);
 }
});

test('watermelon has four distinct dedicated stages, and no pumpkin / wheat / generic soil image',()=>{
 const uris=[SOWN_CROP_SPRITES.watermelon,...Object.values(CROP_GROWTH_SPRITES.watermelon)];
 assert.equal(new Set(uris).size,4);assert.equal(getSownCropSpriteId('watermelon'),'watermelon');
 assert.ok(uris.every(uri=>uri.includes('watermelon_')&&!/pumpkin|wheat|farmland/.test(uri)));
});

test('cabbage uses four dedicated stages instead of lettuce or the generic wheat growth art',()=>{
 const uris=[SOWN_CROP_SPRITES.cabbage,...Object.values(CROP_GROWTH_SPRITES.cabbage)];
 assert.equal(new Set(uris).size,4);assert.equal(getSownCropSpriteId('cabbage'),'cabbage');
 assert.ok(uris.every(uri=>uri.includes('cabbage_')&&!/lettuce|wheat|farmland/.test(uri)));
});

test('actor feet stay at the same anchor and inventory icons use their PNG with safe accessible labels',()=>{
 const c=canvas();drawRuntimeActor(c.context,'visitor','npc_marie',123,456,{height:40,flipped:true});
 const d=c.draws[0];assert.equal(d.args[5]+d.args[7],0,'Bottom of sprite is exactly the local ground anchor');
 drawResourceIcon(c.context,'watermelon',32,32,24);assert.equal(c.stack.length,0);
 assert.match(resourceIconHtml('watermelon','Dưa <hấu>',32),/watermelon\.png/);
 assert.match(resourceIconHtml('watermelon','Dưa <hấu>',32),/Dưa &lt;hấu&gt;/);
 assert.equal(resourceIconHtml('unknown','',24,'📦'),'📦');
});
