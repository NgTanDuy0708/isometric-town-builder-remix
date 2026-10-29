import { EXPANSION_GROUND_IDS, EXPANSION_TILE_URIS, EXPANSION_VARIANT_URIS,
  getExpansionGroundAdjustment } from '../data/expansionCatalog.js';

const groundIds = new Set([...EXPANSION_GROUND_IDS, ...Object.keys(EXPANSION_VARIANT_URIS)]);
export const isExpansionGround = id => groundIds.has(id);

// N/E/S/W are clockwise world-grid directions. Projected edge midpoints:
// N=(96,80), E=(96,112), S=(32,112), W=(32,80), relative to the tile origin.
const ROAD_SHAPES = {
  r01_road_straight_ns: { exits: ['N', 'S'], turns: 0 },
  r02_road_straight_ew: { exits: ['N', 'S'], turns: 1 },
  r03_road_cross: { exits: ['N', 'E', 'S', 'W'], turns: 0 },
  r04_road_tee_nes: { exits: ['N', 'E', 'S'], turns: 0 },
  r07_road_tee_ews: { exits: ['N', 'E', 'S'], turns: 1 },
  r05_road_tee_nsw: { exits: ['N', 'E', 'S'], turns: 2 },
  r06_road_tee_ewn: { exits: ['N', 'E', 'S'], turns: 3 },
  r08_road_corner_ne: { exits: ['N', 'E'], turns: 0 },
  r09_road_corner_es: { exits: ['N', 'E'], turns: 1 },
  r10_road_corner_sw: { exits: ['N', 'E'], turns: 2 },
  r11_road_corner_wn: { exits: ['N', 'E'], turns: 3 }
};
const directions = ['N', 'E', 'S', 'W'];
const quarterTurns = [[1, 0, 0, 1], [0, 1, -1, 0], [-1, 0, 0, -1], [0, -1, 1, 0]];
const CROSS_ID = 'r03_road_cross';
let pavingImage;

/** Logical exits after rotation, including an optional screen-horizontal flip. */
export function getExpansionRoadConnections(id, flipped = false) {
  const shape = Object.hasOwn(ROAD_SHAPES, id) ? ROAD_SHAPES[id] : undefined;
  if (!shape) return undefined;
  const mirror = { N: 'W', E: 'S', S: 'E', W: 'N' };
  return shape.exits.map(exit => {
    const direction = directions[(directions.indexOf(exit) + shape.turns) % 4];
    return flipped ? mirror[direction] : direction;
  });
}

function getPavingImage(image, id) {
  if (id === CROSS_ID) { pavingImage = image; return image; }
  if (!pavingImage && typeof Image !== 'undefined') {
    pavingImage = new Image();
    pavingImage.src = EXPANSION_TILE_URIS[CROSS_ID];
  }
  return pavingImage?.complete && pavingImage.naturalWidth ? pavingImage : undefined;
}

export function paintExpansionGroundThumbnail(canvas, id, flipped = false) {
  const ctx = canvas?.getContext('2d');
  if (!ctx || !isExpansionGround(id)) return;
  const image = new Image();
  image.onload = () => {
    if (Object.hasOwn(ROAD_SHAPES, id)) pavingImage = image;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / 128, canvas.height / 64);
    ctx.save();
    ctx.translate((canvas.width - 128 * scale) / 2, (canvas.height - 64 * scale) / 2);
    ctx.scale(scale, scale);
    drawExpansionGround(ctx, image, id, 0, -64, flipped);
    ctx.restore();
  };
  image.src = Object.hasOwn(ROAD_SHAPES, id) ? EXPANSION_TILE_URIS[CROSS_ID]
    : (EXPANSION_VARIANT_URIS[id] || EXPANSION_TILE_URIS[id]);
}

function drawRoad(ctx, image, id, ox, oy) {
  const shape = ROAD_SHAPES[id];
  ctx.translate(ox + 64, oy + 96);
  // Rotate in the square world plane about the tile centre, then project it.
  // This preserves the 2:1 ground slopes, widths and shared edge connectors.
  ctx.transform(1, 0.5, -1, 0.5, 0, 0);
  ctx.transform(...quarterTurns[shape.turns], 0, 0);
  const half = 8;
  ctx.beginPath();
  ctx.rect(-half, -half, half * 2, half * 2);
  for (const exit of shape.exits) {
    if (exit === 'N') ctx.rect(-half, -32, half * 2, 32);
    if (exit === 'E') ctx.rect(0, -half, 32, half * 2);
    if (exit === 'S') ctx.rect(-half, 0, half * 2, 32);
    if (exit === 'W') ctx.rect(-32, -half, 32, half * 2);
  }
  ctx.clip();
  // The opaque backing preserves connector geometry during first texture load.
  ctx.fillStyle = '#a39c89';
  ctx.fillRect(-32, -32, 64, 64);
  // Keep each native full-bounds sample as the underlying paving layer. The
  // local x scale maps its 128x64 draw rectangle into the square world plane.
  // Both layers are clipped by the same corridor, including at cell edges.
  const native = getExpansionGroundAdjustment(id).source;
  ctx.save();
  if (id !== CROSS_ID) ctx.scale(0.5, 1);
  ctx.drawImage(image, ...native, id === CROSS_ID ? -32 : -64, -32,
    id === CROSS_ID ? 64 : 128, 64);
  ctx.restore();
  const texture = getPavingImage(image, id);
  if (!texture) return;
  const source = getExpansionGroundAdjustment(CROSS_ID).source;
  // Sample native paving at the intersection, away from transparent arm ends.
  // The standardized mask supplies shape; L/T bounding boxes cannot add exits.
  const [x, y, width, height] = source;
  const side = Math.min(width, height) * 0.42;
  ctx.drawImage(texture, x + (width - side) / 2, y + (height - side) / 2,
    side, side, -32, -32, 64, 64);
}

// All native transparent modules stay on the terrain plane beneath houses.
export function drawExpansionGround(ctx, image, id, ox, oy, flipped = false) {
  const a = getExpansionGroundAdjustment(id);
  if (!a || !image?.complete || !image.naturalWidth) return;
  ctx.save();
  if (flipped) { ctx.translate(ox + 128, oy); ctx.scale(-1, 1); ox = oy = 0; }
  ctx.beginPath();
  ctx.moveTo(ox + 64, oy + 64); ctx.lineTo(ox + 128, oy + 96);
  ctx.lineTo(ox + 64, oy + 128); ctx.lineTo(ox, oy + 96);
  ctx.closePath(); ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (Object.hasOwn(ROAD_SHAPES, id)) drawRoad(ctx, image, id, ox, oy);
  else ctx.drawImage(image, ...a.source, ox, oy + 64, 128, 64);
  ctx.restore();
}
