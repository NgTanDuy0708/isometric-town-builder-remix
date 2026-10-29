import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_TOWN_HALL_TUNING, TOWN_HALL_TUNING_KEY, normalizeTownHallTuning, drawTownHallSprite, readTownHallTuning, alignTownHallEntrance, TOWN_HALL_ENTRANCE } from '../src/engine/townHallTuning.js';
import { BUILDING_SOURCE_GEOMETRY, getBuildingRenderAdjustment } from '../src/data/buildingSprites.js';

test('town hall stretch preserves the foot anchor and offsets move it deliberately', () => {
  const base = getBuildingRenderAdjustment('b14_town_hall', 1, {size:1,width:1,height:1,x:0,y:0,rotation:0});
  const tuned = getBuildingRenderAdjustment('b14_town_hall', 1, { size: .9, width: .8, height: 1.15, x: 12, y: -8 });
  const src = BUILDING_SOURCE_GEOMETRY.b14_town_hall[1];
  assert.ok(Math.abs(tuned.dw/base.dw-.72)<1e-10);
  assert.ok(Math.abs(tuned.dh/base.dh-1.035)<1e-10);
  assert.ok(Math.abs(tuned.dx + tuned.dw*src.anchorX/src.width - (-52))<1e-10);
  assert.ok(Math.abs(tuned.dy + tuned.dh*src.anchorY/src.height - 152)<1e-10);
});
test('saved editor settings reach all town hall gameplay levels; invalid settings stay bounded', () => {
  const previous = globalThis.localStorage;
  const values = { size: .8, width: 1, height: 1, x: 3, y: 4 };
  globalThis.localStorage = { getItem: key => key === TOWN_HALL_TUNING_KEY ? JSON.stringify(values) : null };
  try {
    for (const level of [1,2,3]) assert.deepEqual(getBuildingRenderAdjustment('b14_town_hall',level),getBuildingRenderAdjustment('b14_town_hall',level,values));
    assert.deepEqual(normalizeTownHallTuning({size:NaN,width:0,height:99,x:10000,y:'bad'}),{...DEFAULT_TOWN_HALL_TUNING,width:.5,height:1.8,x:128,y:0});
  } finally { if (previous === undefined) delete globalThis.localStorage; else globalThis.localStorage = previous; }
});

test('rotation uses the same ground pivot at every angle without leaking canvas state', () => {
  const src = BUILDING_SOURCE_GEOMETRY.b14_town_hall[1];
  for (const angle of [-12.5, 0, 8.2, 180]) {
    const adj = getBuildingRenderAdjustment('b14_town_hall', 1, { rotation: angle, x: 7, y: -4 });
    let matrix = [1,0,0,1,0,0], saved, point, rotated = 0;
    const transform = ([a,b,c,d,e,f]) => {
      const [A,B,C,D,E,F]=matrix;
      matrix=[A*a+C*b,B*a+D*b,A*c+C*d,B*c+D*d,A*e+C*f+E,B*e+D*f+F];
    };
    const ctx = {
      save() { saved=matrix.slice(); }, restore() { matrix=saved; },
      translate(x,y) { transform([1,0,0,1,x,y]); },
      transform(...m) { transform(m); },
      rotate(a) { rotated=a;transform([Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0]); },
      drawImage(_img,x,y,w,h) {
        const px=x+w*src.anchorX/src.width, py=y+h*src.anchorY/src.height;
        point=[matrix[0]*px+matrix[2]*py+matrix[4],matrix[1]*px+matrix[3]*py+matrix[5]];
      }
    };
    drawTownHallSprite(ctx,{},adj,100,200);
    assert.ok(Math.abs(point[0]-43)<1e-8);
    assert.ok(Math.abs(point[1]-356)<1e-8);
    assert.equal(rotated,angle*Math.PI/180);
    assert.deepEqual(matrix,[1,0,0,1,0,0]);
  }
  assert.equal(normalizeTownHallTuning({rotation:999}).rotation,180);
  assert.equal(normalizeTownHallTuning({rotation:'bad'}).rotation,DEFAULT_TOWN_HALL_TUNING.rotation);
});

test('stair edge follows the 2:1 grid and its midpoint lands at the centre of [15,15]', () => {
  const previous=globalThis.localStorage;
  globalThis.localStorage={getItem:()=>null};
  try {
    for (const values of [DEFAULT_TOWN_HALL_TUNING,alignTownHallEntrance({size:.8,width:1.2,height:.9})]) {
      const adj=getBuildingRenderAdjustment('b14_town_hall',1,values);
      const src=BUILDING_SOURCE_GEOMETRY.b14_town_hall[1];
      const a=adj.rotation*Math.PI/180;
      const dx=TOWN_HALL_ENTRANCE.edgeX*adj.dw/src.width,dy=TOWN_HALL_ENTRANCE.edgeY*adj.dh/src.height;
      assert.ok(Math.abs((dx*Math.sin(a)+dy*Math.cos(a))/(dx*Math.cos(a)-dy*Math.sin(a))-.5)<1e-10);
      const originX=2048+(15-13)*64,originY=64+(13+15)*32;
      assert.equal(originX+adj.pivotX,2048+64);
      assert.equal(originY+adj.pivotY,64+(15+15)*32+96);
    }
    globalThis.localStorage={getItem:key=>key.endsWith('_v1')?JSON.stringify({size:1.09,width:1.08,height:1,x:25,y:-32,rotation:5}):null};
    assert.deepEqual(readTownHallTuning(),DEFAULT_TOWN_HALL_TUNING);
  } finally { if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous; }
});

test('redrawn art uses uniform scaling, no corrective rotation/shear, and ignores old sprite settings', () => {
  const adj=getBuildingRenderAdjustment('b14_town_hall',1,DEFAULT_TOWN_HALL_TUNING);
  assert.equal(adj.rotation,0);assert.equal(adj.groundShear,0);
  const source=BUILDING_SOURCE_GEOMETRY.b14_town_hall[1];
  assert.equal(adj.dw/source.width,adj.dh/source.height);
  let draws=0;
  drawTownHallSprite({save(){},restore(){},translate(){assert.fail('No corrective transform');},
    rotate(){assert.fail('No corrective transform');}, transform(){assert.fail('No corrective transform');},
    drawImage(){draws++;}},{},adj);
  assert.equal(draws,1);
  const previous=globalThis.localStorage;
  for(const version of [1,2,3]){
    globalThis.localStorage={getItem:key=>key.endsWith('_v'+version)?JSON.stringify({size:1.09,width:1.08,height:1,x:25,y:-32,rotation:9.4,groundShear:.19}):null};
    try{assert.deepEqual(readTownHallTuning(),DEFAULT_TOWN_HALL_TUNING);}
    finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
  }
});
