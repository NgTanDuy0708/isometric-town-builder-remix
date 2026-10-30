import { getBuildingRenderAdjustment } from '../data/buildingSprites.js';

// Điểm miệng ống khói đo trên chính sprite nguồn, theo từng cấp.
const CHIMNEYS = {
  b64_bbq_restaurant: { 1:[[854/1254,300/1254]],2:[[963/1254,263/1254]],3:[[717/1254,130/1254],[991/1254,303/1254]] },
  b03_blacksmith_forge: { 1:[[147/256,137/256]], 2:[[141/256,108/256]], 3:[[117/256,92/256],[180/256,105/256]] },
  b02_tudor_inn: { 1:[[147/256,137/256]], 2:[[130/256,105/256]], 3:[[118/256,79/256]] },
  b06_bakery: { 1:[[970/1254,211/1254]], 2:[[998/1254,170/1254]], 3:[[481/1254,58/1254],[999/1254,173/1254]] }
};

export function getWorkshopSmokePoints(tid, level, ox, oy, flipped) {
  const points = CHIMNEYS[tid]?.[level] || [];
  const a = getBuildingRenderAdjustment(tid, level) || { dx:-64,dy:-128,dw:256,dh:256 };
  return points.map(([u,v]) => ({ x: flipped ? ox+128-a.dx-a.dw*u : ox+a.dx+a.dw*u, y:oy+a.dy+a.dh*v }));
}

export function drawWorkshopActivity(c2d, tid, level, ox, oy, flipped, state, time) {
  if (!state || state.paused || (state.queueMode ? !state.activeBatch : state.ready)) return;
  const points = getWorkshopSmokePoints(tid, level, ox, oy, flipped);
  if (!points.length) return;
  c2d.save();
  for (const [index, point] of points.entries()) for (let i=0;i<4;i++) {
    const phase = (time * .38 + i/4 + index*.17) % 1;
    const size = 2 + Math.floor(phase*4);
    c2d.fillStyle = `rgba(184,177,157,${(.32*(1-phase)).toFixed(3)})`;
    c2d.fillRect(Math.round(point.x + phase*10 + Math.sin(time+index)*2), Math.round(point.y-phase*26), size, size);
  }
  c2d.restore();
}
