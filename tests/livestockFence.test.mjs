import test from 'node:test';
import assert from 'node:assert/strict';
import {getLivestockFenceParts} from '../src/engine/livestockFenceRenderer.js';

test('livestock fences follow the exact 2x1 tile perimeter in both directions, without an interior divider',()=>{
  for(const flip of [false,true]) {
    const parts=getLivestockFenceParts(flip),rails=parts.filter(p=>p.kind==='rails'),posts=parts.filter(p=>p.kind==='post');
    assert.equal(rails.length,6);assert.equal(posts.length,6);
    const xy=v=>[(v.col-v.row)*64+64,(v.row+v.col)*32+64];
    for(const rail of rails) {
      const [ax,ay]=xy(rail.from),[bx,by]=xy(rail.to);
      assert.equal(Math.abs(ax-bx),64);assert.equal(Math.abs(ay-by),32);
      assert.equal(Math.abs((by-ay)/(bx-ax)),.5);
      assert.ok(rail.from.row===rail.to.row||rail.from.col===rail.to.col);
    }
    assert.equal(rails.filter(p=>p.front).length,3);assert.equal(rails.filter(p=>!p.front).length,3);
    const vertices=posts.map(p=>xy(p.vertex));
    assert.equal(Math.max(...vertices.map(p=>p[0]))-Math.min(...vertices.map(p=>p[0])),192);
    assert.equal(Math.max(...vertices.map(p=>p[1]))-Math.min(...vertices.map(p=>p[1])),96);
  }
});
