import { CROP_GROWTH_GEOMETRY } from './cropGrowthGeometry.js';
import {RUNTIME_ART} from './runtimeArtData.js';

export const CROP_GROWTH_SPRITES = Object.fromEntries(Object.keys(CROP_GROWTH_GEOMETRY).map(id =>
  [id, Object.fromEntries(['sprout', 'grow', 'ripe'].map(stage =>
    [stage, `/assets/crops/growth-v1/${CROP_GROWTH_GEOMETRY[id][stage].file}`]))]));

const stages=['sprout','grow','ripe'];
for(const id of ['watermelon','cabbage']){
  if(stages.every(stage=>RUNTIME_ART[id]?.[id+'_'+stage]))
    CROP_GROWTH_SPRITES[id]=Object.fromEntries(stages.map(stage=>[stage,RUNTIME_ART[id][id+'_'+stage].uri]));
}

export function getCropGrowthRenderAdjustment(id, stage) {
  const frame = CROP_GROWTH_GEOMETRY[id]?.[stage];
  if (!frame) return { dx: -8, dy: -8, dw: 144, dh: 144 };
  const { scale, anchor, width, height } = frame;
  return { dx: 64 - anchor.x * scale, dy: 96 - anchor.y * scale,
    dw: width * scale, dh: height * scale };
}
