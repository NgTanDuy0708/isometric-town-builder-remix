// Isometric projection constants, coordinate conversions, and viewport culling math
// Expanded 32x32 Great Kingdom dimensions

export const ROWS = 32;
export const COLS = 32;
export const HALF_W = 64;
export const QUARTER_W = 32;
export const PAD = 64;

export const ORIGIN_X = PAD + (ROWS - 1) * HALF_W; // 2048
export const ORIGIN_Y = PAD; // 64

export const WORLD_CENTER_X = ORIGIN_X + HALF_W; // 2112
export const WORLD_CENTER_Y = ORIGIN_Y + (ROWS + COLS) * QUARTER_W / 2; // 1088

export function screenToWorld(sx, sy, camera) {
  return {
    x: (sx - camera.x) / camera.zoom,
    y: (sy - camera.y) / camera.zoom
  };
}

export function worldToCell(wx, wy) {
  const dx = wx - (ORIGIN_X + HALF_W);
  const dy = wy - (ORIGIN_Y + 3 * QUARTER_W);
  const col = Math.round((dy / 64.0) + (dx / 128.0));
  const row = Math.round((dy / 64.0) - (dx / 128.0));
  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    return { row, col };
  }
  return null;
}

export function cellToWorld(row, col) {
  return {
    ox: ORIGIN_X + (col - row) * HALF_W,
    oy: ORIGIN_Y + (row + col) * QUARTER_W
  };
}

/**
 * Fast viewport culling: check if a 128x128 tile at (row, col) is visible on screen
 */
export function isTileInViewport(ox, oy, camera, viewWidth, viewHeight, extraPadding = 160) {
  const screenX = ox * camera.zoom + camera.x;
  const screenY = oy * camera.zoom + camera.y;
  const size = 128 * camera.zoom;

  return (
    screenX + size >= -extraPadding &&
    screenX <= viewWidth + extraPadding &&
    screenY + size >= -extraPadding &&
    screenY <= viewHeight + extraPadding
  );
}

/**
 * Embed a 16x16 grid into the center (rows 8..23, cols 8..23) of a 32x32 world
 */
export function expandGrid16to32(grid16, defaultTile = "d12_meadow_wildflowers") {
  const grid32 = [];
  const offset = 8; // (32 - 16) / 2

  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      if (
        r >= offset &&
        r < offset + 16 &&
        c >= offset &&
        c < offset + 16 &&
        grid16 &&
        grid16[r - offset] &&
        grid16[r - offset][c - offset]
      ) {
        row.push(grid16[r - offset][c - offset]);
      } else {
        row.push(defaultTile);
      }
    }
    grid32.push(row);
  }
  return grid32;
}

/**
 * Create a fresh empty 32x32 meadow grid
 */
export function createEmptyGrid32(defaultTile = "d12_meadow_wildflowers") {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(defaultTile);
    }
    grid.push(row);
  }
  return grid;
}
