// Original generated PNGs are kept as references. World fences are assembled
// from one shared post/rail sample, rather than stretching each whole image.
export const FENCE_ITEMS = [
  {
    id: "d33_wooden_fence_straight",
    label: "Hàng Rào Gỗ Thẳng",
    doc: "Một đoạn rào gỗ hai thanh. Xoay để đổi hướng, ghép với các góc rào.",
    uri: "/assets/decorations/rustic_fence_section_generated_v1.png",
    price: 30,
    shape: "straight"
  },
  {
    id: "d34_wooden_fence_corner_upper",
    label: "Hàng Rào Góc Trên",
    doc: "Góc rào chữ L phía trên (∧), ba cột và hai nhánh rào gỗ.",
    uri: "/assets/decorations/rustic_fence_corner_upper_generated_v1.png",
    price: 60,
    shape: "upper"
  },
  {
    id: "d35_wooden_fence_corner_lower",
    label: "Hàng Rào Góc Dưới",
    doc: "Góc rào chữ L phía dưới (∨), ghép với góc trên để bao quanh khu vườn.",
    uri: "/assets/decorations/rustic_fence_corner_lower_generated_v1.png",
    price: 60,
    shape: "lower"
  }
];

export const FENCE_ITEM_BY_ID = Object.fromEntries(FENCE_ITEMS.map(item => [item.id, item]));
export const FENCE_TILES = FENCE_ITEMS.map(({ id, label, doc }) => ({
  id, label, doc, category: "decoration", shopCategory: "fences"
}));
export const FENCE_PRICE_OVERRIDES = Object.fromEntries(FENCE_ITEMS.map(item => [item.id, item.price]));
export const FENCE_DURATIONS = Object.fromEntries(FENCE_ITEMS.map(item => [item.id, 0]));
export const FENCE_ROTATIONS = {
  d34_wooden_fence_corner_upper: "d35_wooden_fence_corner_lower",
  d35_wooden_fence_corner_lower: "d34_wooden_fence_corner_upper"
};

export function isFenceTile(tileId) {
  return Object.hasOwn(FENCE_ITEM_BY_ID, tileId);
}

// Vertices, not tile centres: neighbouring tiles refer to the SAME joint.
// Their local screen positions are top (64,64), left (0,96), right
// (128,96), bottom (64,128). Every edge is exactly 64px by 32px.
export function getFenceSegments(tileId, row, col, flipped = false) {
  const item = FENCE_ITEM_BY_ID[tileId];
  if (!item) return [];
  const top = { row, col };
  const left = { row: row + 1, col };
  const right = { row, col: col + 1 };
  const bottom = { row: row + 1, col: col + 1 };
  if (item.shape === "straight") return [[flipped ? right : left, top]];
  const corner = item.shape === "upper" ? top : bottom;
  return [[left, corner], [corner, right]];
}

// Fences occupy boundary edges independently of the ground/building grid.
export function fenceEdgeKey([a, b]) {
  return [`${a.row}_${a.col}`, `${b.row}_${b.col}`].sort().join(":");
}
export function canAddFence(fences, tileId, row, col, flipped = false) {
  const occupied = new Set(fences.flatMap(f => getFenceSegments(f.tileId, f.row, f.col, f.flipped).map(fenceEdgeKey)));
  return getFenceSegments(tileId, row, col, flipped).some(edge => !occupied.has(fenceEdgeKey(edge)));
}
export function migrateGridFences(grid, flippedGrid = {}, fences = []) {
  const result = fences.filter(f => isFenceTile(f?.tileId) && Number.isInteger(f.row) && Number.isInteger(f.col)
    && f.row >= 0 && f.col >= 0 && f.row < grid.length && f.col < grid[f.row].length).map(f => ({ ...f }));
  grid.forEach((line, row) => line.forEach((tileId, col) => {
    if (!isFenceTile(tileId)) return;
    if (canAddFence(result, tileId, row, col, !!flippedGrid[`${row}_${col}`]))
      result.push({ tileId, row, col, flipped: !!flippedGrid[`${row}_${col}`] });
    line[col] = "d12_meadow_wildflowers";
    delete flippedGrid[`${row}_${col}`];
  }));
  return result;
}
