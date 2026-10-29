import { FENCE_ITEMS, getFenceSegments } from "../data/fenceConfig.js";
import { compareWorldDepth } from "./renderOrder.js";

export const FENCE_TEXTURE_URI = FENCE_ITEMS[0].uri;
const vertexKey = ({ row, col }) => `${row}_${col}`;

// One post per grid vertex and one pair of rails per edge, even when two
// neighbouring fence tiles contain that edge. Opacity belongs to the joint:
// a solid neighbour keeps it solid while another piece is being moved.
export function buildFenceNetwork(cells) {
  const posts = new Map();
  const rails = new Map();
  for (const { tileId, row, col, flipped = false, alpha = 1 } of cells) {
    for (const [from, to] of getFenceSegments(tileId, row, col, flipped)) {
      for (const vertex of [from, to]) {
        const key = vertexKey(vertex);
        const existing = posts.get(key);
        if (existing) existing.alpha = Math.max(existing.alpha, alpha);
        else posts.set(key, { kind: "post", key, vertex, alpha,
          row: vertex.row - 0.5, col: vertex.col - 0.5, priority: 1 });
      }
      const key = [vertexKey(from), vertexKey(to)].sort().join(":");
      const existing = rails.get(key);
      if (existing) existing.alpha = Math.max(existing.alpha, alpha);
      else rails.set(key, { kind: "rails", key, from, to, alpha,
        row: (from.row + to.row) / 2 - 0.5,
        col: (from.col + to.col) / 2 - 0.5, priority: 0 });
    }
  }
  return [...rails.values(), ...posts.values()].sort(compareWorldDepth);
}

function screenVertex({ row, col }, originX, originY) {
  return { x: originX + (col - row) * 64 + 64,
    y: originY + (row + col) * 32 + 64 };
}

// Both corner shapes reuse the exact same pixels and dimensions. The image
// remains untouched; Canvas samples its left post and the rail interiors.
export function drawFencePart(c2d, texture, part, originX, originY) {
  if (!texture?.complete || !texture.naturalWidth) return;
  c2d.save();
  c2d.imageSmoothingEnabled = false;
  c2d.globalAlpha *= part.alpha;
  if (part.kind === "post") {
    const p = screenVertex(part.vertex, originX, originY);
    // Shared 15px-wide, 40px-high post, anchored at the bottom tip.
    c2d.translate(p.x - 7.5, p.y - 40);
    c2d.scale(15 / 194, 40 / 518);
    c2d.beginPath();
    c2d.moveTo(2, 46);
    c2d.lineTo(100, 2);
    c2d.lineTo(191, 38);
    c2d.lineTo(191, 476);
    c2d.lineTo(101, 518);
    c2d.lineTo(2, 475);
    c2d.closePath();
    c2d.clip();
    c2d.drawImage(texture, 98, 600, 194, 518, 0, 0, 194, 518);
  } else {
    const a = screenVertex(part.from, originX, originY);
    const b = screenVertex(part.to, originX, originY);
    // Sample the two rails between the source posts. Mirror just the rails
    // for the other slope; the common post keeps its top-left lighting.
    const start = a.y > b.y ? a : b;
    const end = start === a ? b : a;
    const sy = 0.074;
    c2d.transform((end.x - start.x) / 695,
      ((end.y - start.y) + 333 * sy) / 695, 0, sy,
      start.x, start.y - 34 - 650 * sy);
    c2d.drawImage(texture, 300, 0, 695, 1254, 0, 0, 695, 1254);
  }
  c2d.restore();
}

let thumbnailTexture;

// Shop cards show the same assembled fence as the map, at a shared scale.
// Separate AI corner images remain available as original references only.
export function paintFenceThumbnail(canvas, tileId) {
  if (!canvas) return;
  if (!thumbnailTexture) {
    thumbnailTexture = new Image();
    thumbnailTexture.src = FENCE_TEXTURE_URI;
  }
  const draw = () => {
    const c2d = canvas.getContext("2d");
    if (!c2d) return;
    const network = buildFenceNetwork([{ tileId, row: 0, col: 0 }]);
    const feet = network.filter(p => p.kind === "post").map(p => screenVertex(p.vertex, 0, 0));
    if (!feet.length) return;
    const minX = Math.min(...feet.map(p => p.x)) - 7.5;
    const maxX = Math.max(...feet.map(p => p.x)) + 7.5;
    const minY = Math.min(...feet.map(p => p.y)) - 40;
    const maxY = Math.max(...feet.map(p => p.y));
    c2d.clearRect(0, 0, canvas.width, canvas.height);
    c2d.save();
    c2d.translate((canvas.width - minX - maxX) / 2, (canvas.height - minY - maxY) / 2);
    for (const part of network) drawFencePart(c2d, thumbnailTexture, part, 0, 0);
    c2d.restore();
  };
  if (thumbnailTexture.complete && thumbnailTexture.naturalWidth) draw();
  else thumbnailTexture.addEventListener("load", draw, { once: true });
}
