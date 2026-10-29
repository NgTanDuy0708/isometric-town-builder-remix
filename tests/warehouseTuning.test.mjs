import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_WAREHOUSE_TUNING,WAREHOUSE_TUNING_KEY,normalizeWarehouseTuning,getWarehouseRenderAdjustment,drawWarehouseSprite} from '../src/engine/warehouseTuning.js';
import {BUILDING_SOURCE_GEOMETRY,getBuildingRenderAdjustment} from '../src/data/buildingSprites.js';
const source=BUILDING_SOURCE_GEOMETRY.b60_combined_warehouse[1];

test('warehouse editor settings load for every gameplay level and bound invalid imports',()=>{
  const previous=globalThis.localStorage;
  const input={...DEFAULT_WAREHOUSE_TUNING,size:1.2,width:.8,height:1.1,x:8,y:-4,rotation:9,shearX:.02,shearY:.05,flipX:true,anchorX:600};
  globalThis.localStorage={getItem:key=>key===WAREHOUSE_TUNING_KEY?JSON.stringify(input):null};
  try{for(const level of [1,2,3,5])assert.deepEqual(getBuildingRenderAdjustment('b60_combined_warehouse',level),getWarehouseRenderAdjustment(source,input));}
  finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
  const bad=normalizeWarehouseTuning({x:Infinity,y:1e9,size:NaN,worldWidth:-4,flipX:'true'});
  assert.equal(bad.x,0);assert.equal(bad.y,1024);assert.equal(bad.size,1);assert.equal(bad.worldWidth,16);assert.equal(bad.flipX,false);
});

test('warehouse pivot remains fixed through stretching, shearing, rotation and both flips',()=>{
  for(const flipX of [false,true])for(const flipped of [false,true]){
    const values={...DEFAULT_WAREHOUSE_TUNING,width:1.3,height:.85,x:9,y:-6,rotation:17,shearX:.1,shearY:-.05,opacity:.6,flipX};
    const adj=getWarehouseRenderAdjustment(source,values);
    let matrix=[1,0,0,1,0,0],saved,foot;
    const transform=([a,b,c,d,e,f])=>{const [A,B,C,D,E,F]=matrix;matrix=[A*a+C*b,B*a+D*b,A*c+C*d,B*c+D*d,A*e+C*f+E,B*e+D*f+F];};
    const ctx={globalAlpha:.5,imageSmoothingEnabled:false,imageSmoothingQuality:'low',
      save(){saved={matrix:matrix.slice(),alpha:this.globalAlpha,smoothing:this.imageSmoothingEnabled,quality:this.imageSmoothingQuality};},
      restore(){matrix=saved.matrix;this.globalAlpha=saved.alpha;this.imageSmoothingEnabled=saved.smoothing;this.imageSmoothingQuality=saved.quality;},
      translate(x,y){transform([1,0,0,1,x,y]);},scale(x,y){transform([x,0,0,y,0,0]);},transform(...m){transform(m);},
      rotate(a){transform([Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0]);},
      drawImage(_img,x,y,w,h){const px=x+w*values.anchorX/source.width,py=y+h*values.anchorY/source.height;foot=[matrix[0]*px+matrix[2]*py+matrix[4],matrix[1]*px+matrix[3]*py+matrix[5]];assert.equal(this.globalAlpha,.3);}
    };
    drawWarehouseSprite(ctx,{},adj,100,200,flipped);
    assert.ok(Math.abs(foot[0]-(100+(flipped!==flipX?128-73:73)))<1e-8);
    assert.ok(Math.abs(foot[1]-(200+values.worldY+values.y))<1e-8);
    assert.deepEqual(matrix,[1,0,0,1,0,0]);assert.equal(ctx.globalAlpha,.5);assert.equal(ctx.imageSmoothingEnabled,false);
  }
});
