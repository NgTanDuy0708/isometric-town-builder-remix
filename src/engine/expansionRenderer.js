import { EXPANSION_GROUND_IDS, EXPANSION_TILE_URIS, EXPANSION_VARIANT_URIS,
  getExpansionGroundAdjustment } from '../data/expansionCatalog.js';
import { ROAD_SHAPES, getRoadGeometry } from './roadGeometry.js';
import { getRoadMaterials } from './roadMaterial.js';
export { getExpansionRoadConnections } from './roadGeometry.js';

const groundIds = new Set([...EXPANSION_GROUND_IDS, ...Object.keys(EXPANSION_VARIANT_URIS)]);
export const isExpansionGround = id => groundIds.has(id);

export function paintExpansionGroundThumbnail(canvas, id, flipped = false) {
  const ctx = canvas?.getContext('2d');
  if (!ctx || !isExpansionGround(id)) return;
  const image = new Image();
  image.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / 128, canvas.height / 64);
    ctx.save();
    ctx.translate((canvas.width - 128 * scale) / 2, (canvas.height - 64 * scale) / 2);
    ctx.scale(scale, scale);
    drawExpansionGround(ctx, image, id, 0, -64, flipped);
    ctx.restore();
  };
  image.src = EXPANSION_VARIANT_URIS[id] || EXPANSION_TILE_URIS[id];
}

function drawRoad(ctx, image, id, ox, oy, flipped) {
  const geometry = getRoadGeometry(id, flipped);
  const worldX=(ox+64)/2+oy+96,worldY=oy+96-(ox+64)/2;
  ctx.translate(ox + 64, oy + 96);
  ctx.transform(1, 0.5, -1, 0.5, 0, 0);
  ctx.beginPath();
  geometry.polygon.forEach(([x,y],i)=>i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.closePath();ctx.clip();
  const materials = getRoadMaterials(image);
  if (!materials) {
    ctx.drawImage(image,435,590,370,240,-32,-32,64,64);
    return;
  }
  materials.pavingPattern ||= ctx.createPattern(materials.paving,'repeat');
  materials.curbPattern ||= ctx.createPattern(materials.curb,'repeat');
  ctx.save();
  ctx.translate(-worldX,-worldY);
  ctx.scale(1/materials.pixels,1/materials.pixels);
  ctx.fillStyle=materials.pavingPattern;
  ctx.fillRect((worldX-32)*materials.pixels,(worldY-32)*materials.pixels,64*materials.pixels,64*materials.pixels);
  ctx.restore();
  for(const {start,end} of geometry.borders) {
    const dx=end[0]-start[0],dy=end[1]-start[1],length=Math.hypot(dx,dy);
    const tx=dx/length,ty=dy/length,b=materials.curbWidth;
    ctx.save();
    ctx.transform(tx,ty,-ty,tx,start[0],start[1]);
    const phase=tx*(worldX+start[0])+ty*(worldY+start[1]);
    ctx.translate(-phase,0);
    ctx.scale(1/materials.pixels,1/materials.pixels);
    ctx.fillStyle=materials.curbPattern;
    ctx.fillRect((phase-b)*materials.pixels,0,(length+2*b)*materials.pixels,b*materials.pixels);
    ctx.restore();
  }
}

// The same projected ground geometry serves map, brush, move ghost and shop.
export function drawExpansionGround(ctx, image, id, ox, oy, flipped = false) {
  const a = getExpansionGroundAdjustment(id);
  if (!a || !image?.complete || !image.naturalWidth) return;
  ctx.save();
  const isRoad=Object.hasOwn(ROAD_SHAPES,id);
  if (flipped && !isRoad) { ctx.translate(ox + 128, oy); ctx.scale(-1, 1); ox = oy = 0; }
  ctx.beginPath();
  ctx.moveTo(ox + 64, oy + 64); ctx.lineTo(ox + 128, oy + 96);
  ctx.lineTo(ox + 64, oy + 128); ctx.lineTo(ox, oy + 96);
  ctx.closePath(); ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (isRoad) drawRoad(ctx, image, id, ox, oy, flipped);
  else ctx.drawImage(image, ...a.source, ox, oy + 64, 128, 64);
  ctx.restore();
}
