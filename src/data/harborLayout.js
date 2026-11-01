// Shared logical cells and source-space contact points; artwork stays intact.
export let SHIP_DOCK_ROW = 14;
export let SHIP_DOCK_COL = 4;
export let SHIP_WATER_ROW = 15;
export let SHIP_WATER_COL = 3;

// Both long sprites occupy 1 row × 2 columns, along their hull/platform axis.
// The named cell is the front/end cell, not the centre of a one-cell sprite.
export const HARBOR_FOOTPRINTS = {
  dock: { row:SHIP_DOCK_ROW, col:SHIP_DOCK_COL-1, rows:1, cols:2 },
  ship: { row:SHIP_WATER_ROW, col:SHIP_WATER_COL-1, rows:1, cols:2 }
};
export function setHarborSites(scenery={},custom=false){
  const find=id=>Object.entries(scenery).find(([,item])=>item?.tileId===id)?.[0]?.split('_').map(Number);
  [SHIP_DOCK_ROW,SHIP_DOCK_COL]=custom?(find('scene:pier')||[-100,-100]):[14,4];
  [SHIP_WATER_ROW,SHIP_WATER_COL]=custom?(find('scene:ship')||[-100,-100]):[15,3];
  Object.assign(HARBOR_FOOTPRINTS.dock,{row:SHIP_DOCK_ROW,col:SHIP_DOCK_COL-1});
  Object.assign(HARBOR_FOOTPRINTS.ship,{row:SHIP_WATER_ROW,col:SHIP_WATER_COL-1});
}

export function getHarborFootprint(row, col) {
  return Object.entries(HARBOR_FOOTPRINTS).find(([,f]) =>
    row>=f.row && row<f.row+f.rows && col>=f.col && col<f.col+f.cols)?.[1];
}

export function isShipCell(row, col) {
  return getHarborFootprint(row,col) === HARBOR_FOOTPRINTS.ship;
}

export function isHarborCell(row, col) {
  return !!getHarborFootprint(row,col);
}

export function getHarborDepth(kind) {
  const f=HARBOR_FOOTPRINTS[kind];
  // Contact is the bottom vertex of the front cell (half a row/col past its centre).
  return {row:f.row+f.rows-.5,col:f.col+f.cols-.5};
}

export function getHarborOutline(footprint, originX, originY, halfW, quarterW) {
  const x=originX+(footprint.col-footprint.row)*halfW+64;
  const y=originY+(footprint.row+footprint.col)*quarterW+64;
  return [[x,y],[x+footprint.cols*halfW,y+footprint.cols*quarterW],
    [x+(footprint.cols-footprint.rows)*halfW,y+(footprint.cols+footprint.rows)*quarterW],
    [x-footprint.rows*halfW,y+footprint.rows*quarterW]];
}

export const HARBOR_SPRITES = {
  // Foot of the shore-side stairs, measured in the original 768×768 PNG.
  pier: { width:200, height:200, anchorX:540/768, anchorY:690/768 },
  // Lowest hull contact, in the original ship image.
  ship: { width:230, height:230, anchorX:.595, anchorY:.827 }
};

export function getHarborLayout(originX, originY, halfW, quarterW, time = 0) {
  const cell = (row,col) => ({x:originX+(col-row)*halfW+64,y:originY+(row+col)*quarterW+96});
  const dock = cell(SHIP_DOCK_ROW,SHIP_DOCK_COL);
  const shore = dock;
  const water = cell(SHIP_WATER_ROW,SHIP_WATER_COL);
  const dockFoot={x:shore.x,y:shore.y+quarterW};
  const shipFoot={x:water.x,y:water.y+quarterW};
  const wave = Math.sin(time*2.2)*2.5;
  const rect = (sprite,point) => ({x:point.x-sprite.width*sprite.anchorX,
    y:point.y-sprite.height*sprite.anchorY,w:sprite.width,h:sprite.height});
  return {dock,shore,water,dockFoot,shipFoot,wave,pier:rect(HARBOR_SPRITES.pier,dockFoot),
    ship:rect(HARBOR_SPRITES.ship,{x:shipFoot.x,y:shipFoot.y+wave-2})};
}
