import {CROPS_CONFIG} from './cropsConfig.js';
import {SINGLE_SEED_ART} from './singleSeedSpriteData.js';
export const SOWN_CROP_IDS = Object.keys(CROPS_CONFIG);
export const SOWN_CROP_SPRITES = Object.fromEntries(SOWN_CROP_IDS.map(id =>
  [id, SINGLE_SEED_ART[id].uri]));

// Each crop uses its own planting sprite.
export function getSownCropSpriteId(id) {
  return id;
}

// Size the visible seed rather than its transparent canvas. The soil contact
// shares the (64,96) root position used by every later growth stage.
export function getSownCropRenderAdjustment(id) {
  const frame = SINGLE_SEED_ART[id];
  if (!frame) return undefined;
  const [left, top, right, bottom] = frame.bounds;
  const scale = Math.min(18 / (right - left), 12 / (bottom - top));
  return {dx:64-frame.anchor.x*scale,dy:96-frame.anchor.y*scale,
    dw:frame.width*scale,dh:frame.height*scale};
}

export function isCropJustSown(elapsedMs, durationMs) {
  return elapsedMs < Math.min(8000, durationMs * 0.2);
}
