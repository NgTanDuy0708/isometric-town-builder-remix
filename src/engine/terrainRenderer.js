import { getTerrainSprite } from '../data/terrainConfig.js';

export function drawTerrainTile(ctx, image, tileId, ox, oy, flipped = false) {
  const terrain = getTerrainSprite(tileId);
  if (!terrain) return;
  ctx.save();
  // Adjacent antialiased clips otherwise leave a hairline at fractional zoom.
  // Keep the overlap about one device pixel, regardless of camera zoom/DPR.
  const transform = ctx.getTransform?.();
  const scale = Math.hypot(transform?.a ?? 1, transform?.b ?? 0) || 1;
  const overlap = 1 / scale;
  if (flipped) {
    ctx.translate(ox + 128, oy);
    ctx.scale(-1, 1);
    ox = oy = 0;
  }
  ctx.beginPath();
  ctx.moveTo(ox + 64, oy + 64 - overlap / 2);
  ctx.lineTo(ox + 128 + overlap, oy + 96);
  ctx.lineTo(ox + 64, oy + 128 + overlap / 2);
  ctx.lineTo(ox - overlap, oy + 96);
  ctx.closePath();
  ctx.clip();
  if (image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
    // Sample inside the artwork: its outer pixel staircase contains alpha and
    // coloured fringe. Overscan keeps that fringe outside the visible diamond.
    // In particular, never put a sand-coloured undercoat behind shore water.
    const inset = 4 + overlap;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, ...terrain.source,
      ox - inset, oy + 64 - inset / 2, 128 + inset * 2, 64 + inset);
  } else {
    ctx.fillStyle = terrain.color;
    ctx.fill();
  }
  ctx.restore();
}
