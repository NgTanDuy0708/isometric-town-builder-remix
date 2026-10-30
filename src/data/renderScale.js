// World sprites shrink around their measured contact point. Terrain, road
// connectors and multi-cell civic footprints keep their logical dimensions.
export const WORLD_OBJECT_SCALE = 0.8;
export function scaleObjectRect(rect, anchorX = 64, anchorY = 128, scale = WORLD_OBJECT_SCALE) {
  return { ...rect, dx:anchorX+(rect.dx-anchorX)*scale, dy:anchorY+(rect.dy-anchorY)*scale,
    dw:rect.dw*scale, dh:rect.dh*scale };
}
