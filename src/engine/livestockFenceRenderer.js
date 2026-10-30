import {buildFenceNetwork,drawFencePart} from './fenceRenderer.js';

// A two-cell perimeter with no interior divider. Every rail follows a real
// 64x32 grid edge; no ground pixels or AI-generated platform are involved.
export function getLivestockFenceParts(flipped=false) {
  const parts=buildFenceNetwork([
    {tileId:'d34_wooden_fence_corner_upper',row:0,col:-1},
    {tileId:'d33_wooden_fence_straight',row:0,col:0,flipped:true},
    {tileId:'d35_wooden_fence_corner_lower',row:0,col:0},
    {tileId:'d33_wooden_fence_straight',row:1,col:-1,flipped:true}
  ]);
  return parts.map(part=>{
    const front=part.kind==='post' ? part.vertex.row===1||part.vertex.col===1
      : part.from.row===1&&part.to.row===1 || part.from.col===1&&part.to.col===1;
    if(!flipped)return {...part,front};
    const swap=v=>({row:v.col,col:v.row});
    return {...part,front,...(part.kind==='post'?{vertex:swap(part.vertex)}:{from:swap(part.from),to:swap(part.to)})};
  });
}

export function drawLivestockFence(ctx,texture,ox,oy,flipped=false,only='front') {
  for(const part of getLivestockFenceParts(flipped)) {
    if(part.front!==(only==='front'))continue;
    drawFencePart(ctx,texture,part,ox,oy,{postWidth:9,postHeight:23});
  }
}
