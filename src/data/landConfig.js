// Configuration and helper utilities for 4x4 land chunk expansion system on 32x32 Great Kingdom
// 8x8 = 64 chunks total

export const CHUNK_SIZE = 4; // Each chunk is 4x4 tiles
export const CHUNKS_PER_AXIS = 8; // 8x8 = 64 chunks on 32x32 grid
export const TOTAL_CHUNKS = 64;

// The central 4x4 chunks (rows 8..23, cols 8..23 = 16x16 starter kingdom area)
// Chunk rows 2..5, Chunk cols 2..5
export const INITIAL_UNLOCKED_CHUNKS = [
  18, 19, 20, 21,
  26, 27, 28, 29,
  34, 35, 36, 37,
  42, 43, 44, 45
];

// Price ladder per additional chunk unlocked (Gồm cả Vàng và Nguyên liệu)
export function getNextChunkCost(unlockedChunksCount) {
  const additional = Math.max(0, unlockedChunksCount - INITIAL_UNLOCKED_CHUNKS.length);
  let gold = 250;
  const resources = {};

  if (additional < 4) {
    // Giai đoạn 1 (Chunk 17..20): Nông sản cơ bản ruộng đồng
    gold = 250 + additional * 100; // 250, 350, 450, 550
    resources.wheat = 10 + additional * 2; // 10, 12, 14, 16 lúa mì
    resources.carrot = 5 + additional;     // 5, 6, 7, 8 cà rốt
  } else if (additional < 10) {
    // Giai đoạn 2 (Chunk 21..26): Bánh mì lò nướng & Nông sản, chăn nuôi
    gold = 650 + (additional - 4) * 150; // 650, 800, 950...
    resources.wheat = 12;
    resources.bread = 2 + Math.floor((additional - 4) / 2); // 2..4 bánh mì
    resources.egg = 3 + (additional - 4);                   // 3..8 trứng gà
  } else if (additional < 20) {
    // Giai đoạn 3 (Chunk 27..36): Dụng cụ sắt thợ rèn, lương thảo & sữa bò
    gold = 1600 + (additional - 10) * 200; // 1600..3400
    resources.ironTools = 2 + Math.floor((additional - 10) / 4); // 2..4 dụng cụ sắt
    resources.bread = 4 + Math.floor((additional - 10) / 3);     // 4..7 bánh mì
    resources.milk = 3 + Math.floor((additional - 10) / 3);      // 3..6 bình sữa
  } else {
    // Giai đoạn 4 (Chunk 37..64): Đại công trình khai hoang vương quốc
    gold = Math.min(8000, 3600 + (additional - 20) * 200);
    resources.ironTools = Math.min(8, 4 + Math.floor((additional - 20) / 6)); // 4..8 dụng cụ sắt
    resources.butter = Math.min(5, 2 + Math.floor((additional - 20) / 8));    // 2..5 bơ sữa
    resources.bread = Math.min(8, 5 + Math.floor((additional - 20) / 8));     // 5..8 bánh mì
  }

  return {
    gold,
    resources
  };
}

export function getNextChunkPrice(unlockedChunksCount) {
  return getNextChunkCost(unlockedChunksCount).gold;
}

/**
 * Get chunk index (0..63) for a given grid cell
 */
export function getChunkId(row, col) {
  if (row < 0 || row >= 32 || col < 0 || col >= 32) return -1;
  const chunkRow = Math.floor(row / CHUNK_SIZE);
  const chunkCol = Math.floor(col / CHUNK_SIZE);
  return chunkRow * CHUNKS_PER_AXIS + chunkCol;
}

/**
 * Get bounding row and column indices for a given chunk ID
 */
export function getChunkBounds(chunkId) {
  if (chunkId < 0 || chunkId >= TOTAL_CHUNKS) return null;
  const chunkRow = Math.floor(chunkId / CHUNKS_PER_AXIS);
  const chunkCol = chunkId % CHUNKS_PER_AXIS;
  return {
    chunkRow,
    chunkCol,
    startRow: chunkRow * CHUNK_SIZE,
    endRow: (chunkRow + 1) * CHUNK_SIZE - 1,
    startCol: chunkCol * CHUNK_SIZE,
    endCol: (chunkCol + 1) * CHUNK_SIZE - 1
  };
}

/**
 * Check if a cell belongs to an unlocked chunk
 */
export function isCellUnlocked(row, col, unlockedChunks, gameMode) {
  if (gameMode === "sandbox") return true;
  if (!unlockedChunks || !Array.isArray(unlockedChunks)) return true;
  const chunkId = getChunkId(row, col);
  return chunkId !== -1 && unlockedChunks.includes(chunkId);
}

/**
 * Check if a chunk is adjacent (orthogonally N/S/E/W) to any already-unlocked chunk
 */
export function isChunkAdjacentToUnlocked(chunkId, unlockedChunks) {
  if (!unlockedChunks || unlockedChunks.includes(chunkId)) return false;
  const chunkRow = Math.floor(chunkId / CHUNKS_PER_AXIS);
  const chunkCol = chunkId % CHUNKS_PER_AXIS;

  const neighbors = [
    { r: chunkRow - 1, c: chunkCol },
    { r: chunkRow + 1, c: chunkCol },
    { r: chunkRow, c: chunkCol - 1 },
    { r: chunkRow, c: chunkCol + 1 }
  ];

  for (const n of neighbors) {
    if (n.r >= 0 && n.r < CHUNKS_PER_AXIS && n.c >= 0 && n.c < CHUNKS_PER_AXIS) {
      const neighborId = n.r * CHUNKS_PER_AXIS + n.c;
      if (unlockedChunks.includes(neighborId)) {
        return true;
      }
    }
  }
  return false;
}
