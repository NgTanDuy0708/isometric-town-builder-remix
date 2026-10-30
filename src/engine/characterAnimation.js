import { CHARACTER_SHEETS } from '../data/characterSheetsData.js';
import { VEHICLE_SHEETS } from '../data/vehicleSheetsData.js';

const imageCache = new Map();
const findAsset = (group, id) => group === 'vehicle' ? VEHICLE_SHEETS[id] : CHARACTER_SHEETS[group]?.[id];

export function getCharacterImage(group, id, onLoad) {
  const asset = findAsset(group, id);
  if (!asset) return null;
  let image = imageCache.get(asset.uri);
  if (!image) {
    image = new Image();
    if (onLoad) image.onload = onLoad;
    image.src = asset.uri;
    imageCache.set(asset.uri, image);
  }
  return image;
}

// Rows correspond to movement on the same grid axes used by pathfinding.
export function characterDirection(dr, dc, previous = 'SE') {
  if (Math.abs(dr) + Math.abs(dc) < 0.00001) return previous;
  if (Math.abs(dc) >= Math.abs(dr)) return dc > 0 ? 'SE' : 'NW';
  return dr > 0 ? 'SW' : 'NE';
}

export function selectCharacterFrame(group, id, facing = 'SE', walking = false, phase = 0) {
  const asset = findAsset(group, id);
  if (!asset) return null;
  const frames = asset.directions[facing] || asset.directions.SE;
  const step = Number.isFinite(phase) ? Math.max(0, phase) : 0;
  const index = walking ? 1 + Math.floor(step) % 4 : 0;
  return { asset, frame: frames[index], index };
}

// Crop a native sheet at draw time only. Every frame's measured feet share (x,y).
export function drawAnimatedCharacter(ctx, group, id, x, y, {
  height = 40, width, facing = 'SE', walking = false, phase = 0, onLoad
} = {}) {
  const selected = selectCharacterFrame(group, id, facing, walking, phase);
  const image = getCharacterImage(group, id, onLoad);
  if (!selected || !image?.complete || !(image.naturalWidth > 0)) return false;
  const { asset, frame } = selected;
  const scale = width ? width / (asset.referenceWidth || frame.w) : height / asset.referenceHeight;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(x, y);
  ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h,
    -frame.anchorX * scale, -frame.anchorY * scale, frame.w * scale, frame.h * scale);
  ctx.restore();
  return true;
}
