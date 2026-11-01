export const VILLAGE_GATE_ID = 'b17_twin_gatehouse';
export const VILLAGE_GATE_PART = 'village_gate_part';
export const VILLAGE_GATE_ROW = 31;
export const VILLAGE_GATE_COL = 14;
export const isVillageGateCell = (row,col) => row === VILLAGE_GATE_ROW && col >= 14 && col <= 16;

// One sprite at the left end, a passable road in the middle, a reserved right end.
export function applyVillageGateLayout(grid, terrainMap) {
  if (!grid?.[31] || grid[31].length < 17) return grid;
  for (let r=0;r<grid.length;r++) for (let c=0;c<grid[r].length;c++) {
    if ([VILLAGE_GATE_ID,VILLAGE_GATE_PART].includes(grid[r][c])) {
      grid[r][c]=terrainMap?.[r]?.[c] || 'd12_meadow_wildflowers';
    }
  }
  grid[31][14]=VILLAGE_GATE_ID;
  grid[31][15]='r03_royal_marble_pavement';
  grid[31][16]=VILLAGE_GATE_PART;
  return grid;
}

export function getVillageGateOutline(originX,originY,halfW,quarterW) {
  const x=originX+(14-31)*halfW,y=originY+(31+14)*quarterW;
  return [[x+halfW,y+2*quarterW],[x+4*halfW,y+5*quarterW],
    [x+3*halfW,y+6*quarterW],[x,y+3*quarterW]];
}

export const VILLAGE_GATE_URI='/assets/buildings/village_gate_v2.png';
// The road passes through the middle cell [31,15]. Its centre is (128,128)
// relative to the sprite cell [31,14]; anchor the opening, not a tower's toe.
export const VILLAGE_GATE_PASSAGE={sourceX:790,sourceY:800,worldX:128,worldY:128};
export const VILLAGE_GATE_GEOMETRY={1:{width:1536,height:1024,visibleWidth:960,
  anchorX:VILLAGE_GATE_PASSAGE.sourceX,anchorY:VILLAGE_GATE_PASSAGE.sourceY,worldWidth:196,
  worldAnchorX:VILLAGE_GATE_PASSAGE.worldX,worldAnchorY:VILLAGE_GATE_PASSAGE.worldY}};
