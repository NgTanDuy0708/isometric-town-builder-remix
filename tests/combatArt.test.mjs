import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {COMBAT_SHEETS,COMBAT_BUILDING_ART} from '../src/data/combatArtData.js';
import {COMBAT_BUILDING_LEVELS} from '../src/data/combatArt.js';
import {combatVisualState,tickCombatVisual,advanceCombatWalk,markCombatAttack,markCombatHit,selectCombatFrame,drawCombatCharacter} from '../src/engine/combatAnimation.js';
import {createCombatPreviewScene} from '../src/engine/combatPreviewScene.js';
import {inspectPng} from '../scripts/pngMetadata.mjs';

test('all nine runtime assets are native transparent PNGs with recorded hashes and all 96 character poses are bounded',()=>{
  const records=[...Object.entries(COMBAT_SHEETS),...Object.entries(COMBAT_BUILDING_ART)];
  assert.equal(records.length,9);
  for(const [id,asset] of records){
    const bytes=fs.readFileSync(new URL('../public'+asset.uri,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,id);
    const png=inspectPng(bytes);assert.equal(png.alphaMin,0);assert.equal(png.alphaMax,255);
    assert.equal(png.width,asset.width);assert.equal(png.height,asset.height);
    if(!asset.directions)continue;
    assert.deepEqual(Object.keys(asset.directions),['SE','SW','NW','NE']);
    for(const frames of Object.values(asset.directions)){
      assert.equal(frames.length,8);
      for(const frame of frames){
        assert.ok(frame.x>=0&&frame.y>=0&&frame.x+frame.w<=asset.width&&frame.y+frame.h<=asset.height);
        assert.ok(frame.anchorX>0&&frame.anchorX<frame.w);assert.ok(frame.anchorY>0&&frame.anchorY<=frame.h);
      }
    }
  }
  for(const levels of Object.values(COMBAT_BUILDING_LEVELS))assert.equal(new Set(Object.values(levels)).size,3,'Every upgrade level has a distinct PNG');
});

test('actual distance drives walking frames and direction, standing stays idle and attacks/hits use dedicated poses',()=>{
  const actor={...combatVisualState(),r:10,c:10,hp:60,path:[{r:11,c:10}],status:'marching'};
  assert.equal(selectCombatFrame('guard',actor).index,1);
  advanceCombatWalk(actor,1,0,.3);assert.equal(actor.facing,'SW');assert.equal(selectCombatFrame('guard',actor).index,2);
  advanceCombatWalk(actor,-1,0,.3);assert.equal(actor.facing,'NE');
  actor.path=[];actor.status='idle';assert.equal(selectCombatFrame('guard',actor).index,0);
  tickCombatVisual(actor,100);assert.equal(selectCombatFrame('guard',actor).index,0);
  markCombatAttack(actor,{r:10,c:9});assert.equal(actor.facing,'NW');assert.equal(selectCombatFrame('guard',actor).index,5);
  tickCombatVisual(actor,.22);assert.equal(selectCombatFrame('guard',actor).index,6);
  markCombatHit(actor);assert.equal(selectCombatFrame('guard',actor).index,7);
  tickCombatVisual(actor,.3);assert.equal(selectCombatFrame('guard',actor).index,0);
  actor.hp=0;assert.equal(selectCombatFrame('guard',actor).index,7);
});

test('each real frame draws only its source cell and locks measured feet to the same local ground point',()=>{
  const previous=globalThis.Image;globalThis.Image=class{complete=true;naturalWidth=1774;src='';};
  let depth=0;const draws=[],translations=[];
  const ctx=new Proxy({}, {get(_target,key){
    if(key==='save')return()=>depth++;if(key==='restore')return()=>depth--;
    if(key==='translate')return(x,y)=>translations.push([x,y]);if(key==='drawImage')return(image,...args)=>draws.push({uri:image.src,args});
    return()=>{};},set(){return true;}});
  try{
    for(const kind of Object.keys(COMBAT_SHEETS))for(const facing of ['SE','SW','NW','NE'])for(const pose of ['idle','walking','attack','hurt']){
      const actor={...combatVisualState(),hp:60,r:0,c:0,facing,path:pose==='walking'?[{}]:[],status:pose,walkPhase:2.2,
        attackFor:pose==='attack'?.1:0,hurtFor:pose==='hurt'?.1:0};
      const selected=selectCombatFrame(kind,actor);assert.equal(drawCombatCharacter(ctx,kind,actor,123,456,{height:54}),true);
      const draw=draws.at(-1);assert.equal(draw.uri,COMBAT_SHEETS[kind].uri);assert.equal(draw.args.length,8);
      assert.deepEqual(draw.args.slice(0,4),[selected.frame.x,selected.frame.y,selected.frame.w,selected.frame.h]);
      const scale=54/selected.asset.referenceHeight;
      assert.ok(Math.abs(draw.args[4]+selected.frame.anchorX*scale)<1e-8);
      assert.ok(Math.abs(draw.args[5]+selected.frame.anchorY*scale)<1e-8);
      assert.deepEqual(translations.at(-1),[123,456]);assert.equal(depth,0);
    }
  }finally{globalThis.Image=previous;}
});

test('isolated visual preview runs real combat with loaded troops, movement and attack poses without touching saves',()=>{
  const scene=createCombatPreviewScene();let walking=false,attacking=false,hurt=false;
  assert.equal(scene.manager.getState().soldiers.length,3);
  for(let i=0;i<600;i++){
    scene.manager.update(.1);const state=scene.manager.getState();
    for(const actor of [...state.enemies,...state.soldiers]){
      walking ||= actor.walkPhase>0;attacking ||= actor.attackFor>0;hurt ||= actor.hurtFor>0;
    }
  }
  assert.ok(walking);assert.ok(attacking);assert.ok(hurt);
  scene.reset();assert.equal(scene.manager.getState().phase,'battle');assert.equal(scene.manager.getState().enemies.length,0);
  assert.equal(scene.manager.getState().soldiers.length,3);
});
