import test from 'node:test';
import assert from 'node:assert/strict';
import {ROAD_SHAPES,ROAD_WIDTH,getRoadGeometry,getExpansionRoadConnections} from '../src/engine/roadGeometry.js';
import {EXPANSION_TILE_URIS,EXPANSION_VARIANT_URIS} from '../src/data/expansionCatalog.js';

const cases=Object.keys(ROAD_SHAPES).flatMap(id=>[false,true].map(flipped=>({id,flipped,g:getRoadGeometry(id,flipped)})));
const point=p=>p.map(v=>Number(v.toFixed(6))).join(',');
const endpoints=segment=>[point(segment.start),point(segment.end)].sort();

test('every road orientation uses 60% open connectors and strict 2:1 edges',()=>{
  for(const {id,flipped,g} of cases){
    assert.deepEqual(g.connectors.map(c=>c.direction).sort(),getExpansionRoadConnections(id,flipped).sort());
    for(const c of g.connectors){
      assert.ok(Math.abs(Math.hypot(c.end[0]-c.start[0],c.end[1]-c.start[1])-64*.6)<1e-8,id);
      const middle=c.start.map((v,i)=>(v+c.end[i])/2);
      assert.equal(Math.max(...middle.map(Math.abs)),32);
      assert.equal(Math.min(...middle.map(Math.abs)),0);
    }
    g.polygon.forEach((p,i)=>{
      const q=g.polygon[(i+1)%g.polygon.length];
      assert.ok(p.every(v=>Math.abs(v)<=32),'Keep the road inside one tile');
      const dx=(q[0]-q[1])-(p[0]-p[1]);
      const dy=((q[0]+q[1])-(p[0]+p[1]))/2;
      assert.ok(Math.abs(Math.abs(dy/dx)-.5)<1e-8,'No curved bulges or skewed ground edges');
    });
  }
});

test('all matching ends meet exactly across neighbouring tiles, including mirrored roads',()=>{
  const opposite={N:'S',E:'W',S:'N',W:'E'},offset={N:[0,-64],E:[64,0],S:[0,64],W:[-64,0]};
  for(const a of cases)for(const c of a.g.connectors)for(const b of cases){
    const other=b.g.connectors.find(e=>e.direction===opposite[c.direction]);
    if(!other)continue;
    const shift=offset[c.direction];
    const translated={start:other.start.map((v,i)=>v+shift[i]),end:other.end.map((v,i)=>v+shift[i])};
    assert.deepEqual(endpoints(c),endpoints(translated),a.id+' -> '+b.id);
    assert.ok(!a.g.borders.some(e=>JSON.stringify(endpoints(e))===JSON.stringify(endpoints(c))),'No curb caps across an exit');
  }
});

test('the four L corners are rigid rotations with equal area and border length',()=>{
  const ids=['r08_road_corner_ne','r09_road_corner_es','r10_road_corner_sw','r11_road_corner_wn'];
  let expected=getRoadGeometry(ids[0]).polygon;
  for(const id of ids){
    const g=getRoadGeometry(id);
    assert.deepEqual(g.polygon.map(point).sort(),expected.map(point).sort(),id);
    const area=Math.abs(g.polygon.reduce((sum,p,i)=>{const q=g.polygon[(i+1)%g.polygon.length];return sum+p[0]*q[1]-p[1]*q[0]},0))/2;
    assert.ok(Math.abs(area-64*ROAD_WIDTH)<1e-8,'L corners must not inflate compared to straight roads');
    assert.ok(Math.abs(g.borders.reduce((sum,e)=>sum+Math.hypot(e.end[0]-e.start[0],e.end[1]-e.start[1]),0)-128)<1e-8,'All L borders have equal length');
    expected=expected.map(([x,y])=>[-y,x]);
  }
});

test('the entire kit shares one paving source to keep stone size and palette consistent',()=>{
  for(const id of Object.keys(ROAD_SHAPES))assert.equal(EXPANSION_VARIANT_URIS[id]||EXPANSION_TILE_URIS[id],EXPANSION_TILE_URIS.r01_road_straight_ns);
});
