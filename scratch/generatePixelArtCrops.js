const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None
    rgbaBuffer.copy(rawData, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

class PixelCanvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.buf = Buffer.alloc(w * h * 4);
  }
  set(x, y, r, g, b, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    const idx = (y * this.w + x) * 4;
    this.buf[idx] = r;
    this.buf[idx + 1] = g;
    this.buf[idx + 2] = b;
    this.buf[idx + 3] = a;
  }
  rect(x, y, w, h, r, g, b, a = 255) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.set(x + dx, y + dy, r, g, b, a);
      }
    }
  }
  circle(cx, cy, radius, r, g, b, a = 255) {
    const r2 = radius * radius;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= r2) {
          this.set(cx + dx, cy + dy, r, g, b, a);
        }
      }
    }
  }
  ellipse(cx, cy, rx, ry, r, g, b, a = 255) {
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0) {
          this.set(cx + dx, cy + dy, r, g, b, a);
        }
      }
    }
  }
  // Isometric ground shadow
  shadow(cx, cy, rx, ry) {
    this.ellipse(cx, cy, rx, ry, 35, 20, 15, 110);
  }
  toDataURI() {
    const png = encodePNG(this.w, this.h, this.buf);
    return 'data:image/png;base64,' + png.toString('base64');
  }
}

// ==========================================
// 1. Sprout (36x36) - Delicate fresh seedling
// ==========================================
function drawSprout() {
  const c = new PixelCanvas(36, 36);
  // Ground shadow & soil mound
  c.shadow(18, 30, 8, 3);
  c.ellipse(18, 30, 6, 2, 78, 48, 28);
  c.ellipse(18, 29, 4, 1.5, 120, 75, 40);

  // Stalk
  c.rect(17, 18, 2, 11, 22, 101, 52); // shadow stem
  c.rect(16, 17, 2, 11, 34, 197, 94);  // light stem
  c.set(16, 17, 134, 239, 172);

  // Left leaf (heart shaped curve)
  c.set(15, 16, 22, 101, 52);
  c.rect(12, 14, 3, 3, 34, 197, 94);
  c.rect(10, 12, 3, 3, 74, 222, 128);
  c.set(11, 11, 134, 239, 172); // tip
  c.set(12, 13, 187, 247, 208); // dew drop highlight

  // Right leaf
  c.set(18, 15, 22, 101, 52);
  c.rect(19, 13, 3, 3, 34, 197, 94);
  c.rect(21, 11, 4, 3, 74, 222, 128);
  c.set(24, 10, 134, 239, 172); // tip
  c.set(22, 12, 230, 255, 240); // dew drop highlight

  // Little brown seed casing fallen near base
  c.set(20, 28, 120, 60, 20);
  c.set(21, 28, 160, 85, 30);
  return c.toDataURI();
}

// ==========================================
// 2. Growing Bush (44x44) - Lush vibrant foliage
// ==========================================
function drawBush() {
  const c = new PixelCanvas(44, 44);
  c.shadow(22, 37, 12, 4);

  // Stems
  c.rect(21, 26, 3, 10, 20, 83, 45);
  c.rect(17, 24, 2, 6, 20, 83, 45);
  c.rect(26, 25, 2, 6, 20, 83, 45);

  // Deep shadow foliage clusters
  c.circle(16, 27, 6, 20, 83, 45);
  c.circle(28, 27, 6, 20, 83, 45);
  c.circle(22, 23, 7, 20, 83, 45);

  // Mid green leaf layer
  c.circle(15, 25, 5, 34, 197, 94);
  c.circle(29, 25, 5, 34, 197, 94);
  c.circle(22, 20, 6, 34, 197, 94);
  c.circle(18, 16, 4, 34, 197, 94);
  c.circle(26, 16, 4, 34, 197, 94);

  // Bright highlight leaf tips
  c.circle(14, 23, 3, 74, 222, 128);
  c.circle(30, 23, 3, 74, 222, 128);
  c.circle(22, 17, 4, 74, 222, 128);
  c.circle(18, 13, 2, 134, 239, 172);
  c.circle(26, 13, 2, 134, 239, 172);
  c.set(22, 14, 220, 252, 231); // top sunlit leaf bud

  return c.toDataURI();
}

// ==========================================
// 3. Wheat (48x48) - Golden swaying grain stalks
// ==========================================
function drawWheat() {
  const c = new PixelCanvas(48, 48);
  c.shadow(24, 42, 12, 3);

  // Stalk drawing helper
  function stalk(x1, y1, x2, y2, color) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(x1 + (x2 - x1) * (i / steps));
      const y = Math.round(y1 + (y2 - y1) * (i / steps));
      c.set(x, y, color[0], color[1], color[2]);
    }
  }

  // Draw wheat ear (plump golden head with awns)
  function ear(ex, ey, angleOffset = 0) {
    // Grain seeds
    for (let i = 0; i < 7; i++) {
      const gy = ey + i * 2;
      const gx = ex + (i % 2 === 0 ? -1 : 1) + angleOffset;
      c.set(gx - 1, gy, 180, 83, 9); // shadow amber
      c.set(gx, gy, 234, 179, 8);    // golden body
      c.set(gx + 1, gy, 254, 240, 138); // sun highlight
      // Bristly awn
      c.set(gx + (i % 2 === 0 ? -2 : 2), gy - 1, 245, 158, 11);
    }
    // Crown tip
    c.set(ex + angleOffset, ey - 2, 254, 240, 138);
    c.set(ex + angleOffset, ey - 4, 234, 179, 8);
  }

  // Stems
  stalk(24, 40, 16, 20, [180, 120, 40]);
  stalk(24, 40, 24, 16, [200, 140, 50]);
  stalk(24, 40, 32, 19, [180, 120, 40]);
  stalk(22, 40, 12, 24, [160, 100, 30]);
  stalk(26, 40, 36, 25, [160, 100, 30]);

  // Lower golden leaves
  c.set(20, 33, 180, 130, 40);
  c.set(18, 34, 200, 150, 50);
  c.set(28, 33, 180, 130, 40);
  c.set(30, 34, 200, 150, 50);

  // Ears
  ear(12, 12, -2);
  ear(16, 7, -1);
  ear(24, 4, 0);
  ear(32, 8, 1);
  ear(36, 14, 2);

  return c.toDataURI();
}

// ==========================================
// 4. Strawberry (48x48) - Sweet Smurf Village red berries
// ==========================================
function drawStrawberry() {
  const c = new PixelCanvas(48, 48);
  c.shadow(24, 42, 14, 4);

  // Foliage cluster
  c.circle(24, 26, 14, 20, 83, 45); // dark base
  c.circle(18, 24, 10, 34, 197, 94);
  c.circle(30, 24, 10, 34, 197, 94);
  c.circle(24, 18, 10, 34, 197, 94);
  c.circle(24, 15, 7, 74, 222, 128); // light top

  // White flower blossoms
  function flower(fx, fy) {
    c.circle(fx, fy, 2, 255, 255, 255);
    c.set(fx, fy, 250, 204, 21); // yellow center
  }
  flower(15, 17);
  flower(33, 18);

  // Plump Ruby Strawberries
  function berry(bx, by, size = 1) {
    // Green calyx top
    c.rect(bx - 2, by - 4, 5, 2, 22, 101, 52);
    c.set(bx, by - 5, 74, 222, 128);
    // Heart body
    c.ellipse(bx, by, 4 + size, 5 + size, 185, 28, 28);
    c.ellipse(bx, by - 1, 3 + size, 4 + size, 220, 38, 38);
    c.ellipse(bx - 1, by - 2, 2, 3, 239, 68, 68); // highlight
    c.set(bx - 1, by - 2, 254, 202, 202); // gloss spark
    // Seeds (golden yellow dots)
    c.set(bx - 2, by + 1, 254, 240, 138);
    c.set(bx + 2, by, 254, 240, 138);
    c.set(bx, by + 3, 254, 240, 138);
    c.set(bx + 1, by - 2, 254, 240, 138);
  }

  berry(15, 33, 0);
  berry(24, 35, 1);
  berry(33, 32, 0);
  berry(20, 22, 0);

  return c.toDataURI();
}

// ==========================================
// 5. Carrot (48x48) - Crisp orange carrots poking out
// ==========================================
function drawCarrot() {
  const c = new PixelCanvas(48, 48);
  c.shadow(24, 42, 14, 4);

  // Soil mounds
  c.ellipse(17, 36, 6, 2, 85, 45, 25);
  c.ellipse(25, 35, 7, 2, 85, 45, 25);
  c.ellipse(33, 37, 5, 2, 85, 45, 25);

  // Feathery carrot fronds
  function fern(fx, fy) {
    c.rect(fx, fy, 2, 16, 21, 128, 61);
    for (let i = 0; i < 4; i++) {
      const ly = fy + i * 3;
      c.set(fx - 2, ly, 34, 197, 94);
      c.set(fx - 4, ly - 1, 74, 222, 128);
      c.set(fx + 2, ly + 1, 34, 197, 94);
      c.set(fx + 4, ly, 74, 222, 128);
    }
    c.set(fx, fy - 1, 134, 239, 172);
  }

  fern(16, 12);
  fern(24, 8);
  fern(32, 11);

  // Plump orange carrot shoulders
  function carrotBody(cx, cy, scale = 1) {
    // Orange root shoulder
    c.ellipse(cx, cy, 4 + scale, 5 + scale, 194, 65, 12); // shadow
    c.ellipse(cx, cy, 3 + scale, 4 + scale, 234, 88, 12); // main orange
    c.ellipse(cx - 1, cy - 1, 2, 3, 251, 146, 60); // bright orange
    c.set(cx - 1, cy - 1, 254, 215, 170); // sun highlight
    // Root lines
    c.set(cx, cy + 3, 150, 50, 10);
    c.set(cx + 2, cy + 1, 150, 50, 10);
  }

  carrotBody(16, 33, 0);
  carrotBody(25, 31, 1);
  carrotBody(33, 34, 0);

  return c.toDataURI();
}

// ==========================================
// 6. Corn (48x48) - Tall stalks with golden cobs & silk
// ==========================================
function drawCorn() {
  const c = new PixelCanvas(48, 48);
  c.shadow(24, 43, 11, 3);

  // Stalk
  c.rect(23, 8, 3, 34, 21, 128, 61);
  c.rect(22, 8, 2, 34, 34, 197, 94);

  // Arching leaves
  function leaf(lx, ly, dir, len) {
    for (let i = 0; i < len; i++) {
      const x = lx + i * dir;
      const y = ly + Math.floor(Math.sin((i / len) * Math.PI) * 5) - Math.floor(i * 0.4);
      c.set(x, y, 34, 197, 94);
      c.set(x, y + 1, 21, 128, 61);
      c.set(x, y - 1, 74, 222, 128);
    }
  }

  leaf(22, 28, -1, 12);
  leaf(25, 27, 1, 13);
  leaf(22, 18, -1, 10);
  leaf(25, 17, 1, 11);

  // Golden corn cobs
  function cob(cx, cy, flip) {
    const dir = flip ? -1 : 1;
    // Husk leaves
    c.ellipse(cx, cy, 4, 7, 22, 101, 52);
    // Yellow kernel body
    c.ellipse(cx + 2 * dir, cy - 2, 3, 6, 202, 138, 4);
    c.ellipse(cx + 2 * dir, cy - 2, 2, 5, 234, 179, 8);
    // Kernels texture
    for (let dy = -4; dy <= 2; dy += 2) {
      c.set(cx + 2 * dir, cy + dy, 254, 240, 138);
      c.set(cx + 1 * dir, cy + dy + 1, 254, 240, 138);
    }
    // Brown silk tassels
    c.set(cx + 2 * dir, cy - 8, 180, 83, 9);
    c.set(cx + 3 * dir, cy - 9, 217, 119, 6);
    c.set(cx + 1 * dir, cy - 7, 180, 83, 9);
  }

  cob(28, 24, false);
  cob(20, 20, true);

  return c.toDataURI();
}

// ==========================================
// 7. Pumpkin (48x48) - Huge ribbed Halloween orange pumpkin
// ==========================================
function drawPumpkin() {
  const c = new PixelCanvas(48, 48);
  c.shadow(24, 40, 16, 5);

  // Green vines & curled tendrils
  c.rect(10, 32, 28, 3, 22, 101, 52);
  c.circle(12, 28, 6, 34, 197, 94);
  c.circle(36, 29, 6, 34, 197, 94);
  c.set(9, 25, 74, 222, 128);
  c.set(38, 26, 74, 222, 128);

  // Main Giant Pumpkin Body (24, 30)
  const px = 24, py = 30;

  // Dark outline/shadow
  c.ellipse(px, py, 14, 10, 154, 52, 18);

  // Left & right outer lobes
  c.ellipse(px - 9, py, 6, 9, 234, 88, 12);
  c.ellipse(px + 9, py, 6, 9, 234, 88, 12);

  // Inner ribs
  c.ellipse(px - 4, py, 6, 10, 249, 115, 22);
  c.ellipse(px + 4, py, 6, 10, 249, 115, 22);

  // Center rib
  c.ellipse(px, py, 5, 10, 251, 146, 60);

  // Highlights on ribs
  c.ellipse(px - 4, py - 3, 2, 5, 253, 186, 116);
  c.ellipse(px + 4, py - 3, 2, 5, 253, 186, 116);
  c.ellipse(px, py - 3, 2, 6, 254, 215, 170);

  // Brown / green curved stem
  c.rect(px - 1, py - 12, 3, 4, 120, 75, 40);
  c.rect(px + 1, py - 14, 2, 3, 22, 101, 52);
  c.set(px + 2, py - 15, 74, 222, 128);

  return c.toDataURI();
}

// ==========================================
// 8. Tomato (48x48) - Trellised red cluster tomatoes
// ==========================================
function drawTomato() {
  const c = new PixelCanvas(48, 48);
  c.shadow(24, 42, 13, 4);

  // Wooden stake trellis
  c.rect(23, 10, 3, 32, 133, 77, 14);
  c.rect(24, 10, 1, 32, 161, 98, 7);

  // Foliage
  c.circle(24, 22, 10, 21, 128, 61);
  c.circle(18, 20, 7, 34, 197, 94);
  c.circle(30, 21, 7, 34, 197, 94);
  c.circle(24, 14, 7, 74, 222, 128);

  // Glossy Red Round Tomatoes
  function tomato(tx, ty, size = 0) {
    // Star leaf top
    c.set(tx, ty - 4 - size, 22, 101, 52);
    c.set(tx - 2, ty - 3 - size, 74, 222, 128);
    c.set(tx + 2, ty - 3 - size, 74, 222, 128);
    // Red sphere
    c.circle(tx, ty, 4 + size, 185, 28, 28);
    c.circle(tx, ty - 1, 3 + size, 220, 38, 38);
    c.circle(tx - 1, ty - 2, 2, 239, 68, 68);
    c.set(tx - 1, ty - 2, 255, 255, 255); // high gloss shine
  }

  tomato(16, 28, 0);
  tomato(25, 32, 1);
  tomato(33, 27, 0);
  tomato(22, 19, 0);

  return c.toDataURI();
}

// ==========================================
// 9. Watermelon (48x48) - Big striped green watermelon
// ==========================================
function drawWatermelon() {
  const c = new PixelCanvas(48, 48);
  c.shadow(24, 40, 16, 5);

  // Vine tendrils
  c.rect(10, 34, 28, 2, 22, 101, 52);
  c.circle(13, 28, 5, 34, 197, 94);
  c.circle(35, 29, 5, 34, 197, 94);

  // Big Oval Melon (24, 30)
  const mx = 24, my = 30;
  // Dark green skin
  c.ellipse(mx, my, 14, 10, 20, 83, 45);
  c.ellipse(mx, my, 13, 9, 22, 101, 52);

  // Light green wavy zig-zag stripes
  for (let dy = -7; dy <= 7; dy++) {
    for (let sx of [-8, -4, 0, 4, 8]) {
      const wiggle = (dy % 2 === 0 ? 1 : -1);
      c.set(mx + sx + wiggle, my + dy, 74, 222, 128);
      c.set(mx + sx + wiggle + 1, my + dy, 134, 239, 172);
    }
  }

  // Pale yellow belly spot (bottom right)
  c.ellipse(mx + 6, my + 5, 4, 2, 254, 240, 138);

  // Curly stem
  c.set(mx - 1, my - 10, 34, 197, 94);
  c.set(mx - 2, my - 11, 74, 222, 128);
  c.set(mx - 3, my - 10, 21, 128, 61);

  return c.toDataURI();
}

// ==========================================
// 10. Grapes (48x48) - Purple cluster vines on wooden post
// ==========================================
function drawGrapes() {
  const c = new PixelCanvas(48, 48);
  c.shadow(24, 42, 12, 4);

  // Wooden vineyard post & arm
  c.rect(22, 12, 4, 30, 120, 75, 40);
  c.rect(12, 12, 24, 3, 146, 94, 52);

  // Broad grape vine leaves
  c.circle(16, 14, 6, 34, 197, 94);
  c.circle(32, 14, 6, 34, 197, 94);
  c.circle(24, 11, 5, 74, 222, 128);

  // Hanging Purple Grape Cluster (tapering triangle)
  function grape(gx, gy) {
    c.circle(gx, gy, 2.5, 76, 29, 149); // deep violet
    c.circle(gx, gy, 2, 109, 40, 217);   // purple
    c.set(gx - 1, gy - 1, 192, 132, 252); // frosted bloom shine
  }

  // Row 1
  grape(21, 21); grape(25, 21); grape(29, 21);
  // Row 2
  grape(19, 25); grape(23, 25); grape(27, 25); grape(31, 25);
  // Row 3
  grape(21, 29); grape(25, 29); grape(29, 29);
  // Row 4
  grape(23, 33); grape(27, 33);
  // Row 5 (tip)
  grape(25, 37);

  return c.toDataURI();
}

// ==========================================
// 11. Sunflower (48x48) - Giant radiant yellow flower
// ==========================================
function drawSunflower() {
  const c = new PixelCanvas(48, 48);
  c.shadow(24, 43, 10, 3);

  // Thick stalk
  c.rect(23, 16, 3, 26, 21, 128, 61);
  c.rect(22, 16, 1, 26, 34, 197, 94);

  // Big heart-shaped leaves
  c.ellipse(15, 30, 6, 4, 34, 197, 94);
  c.ellipse(33, 28, 6, 4, 34, 197, 94);

  // Giant Sunflower Head (24, 16)
  const fx = 24, fy = 16;

  // Golden Yellow Petals (radiating circle)
  c.circle(fx, fy, 12, 234, 179, 8); // outer gold
  c.circle(fx, fy, 10, 250, 204, 21); // bright yellow

  // Deep brown textured seed center
  c.circle(fx, fy, 6, 69, 26, 3); // dark rim
  c.circle(fx, fy, 5, 120, 53, 15); // rich brown
  for (let dy = -3; dy <= 3; dy += 2) {
    for (let dx = -3; dx <= 3; dx += 2) {
      if (dx * dx + dy * dy <= 16) {
        c.set(fx + dx, fy + dy, 180, 83, 9); // golden seeds
      }
    }
  }

  // Sunlit petal tips
  c.set(fx, fy - 13, 254, 240, 138);
  c.set(fx, fy + 13, 254, 240, 138);
  c.set(fx - 13, fy, 254, 240, 138);
  c.set(fx + 13, fy, 254, 240, 138);

  return c.toDataURI();
}

// ==========================================
// 12. Cabbage (48x48) - Crisp green rosette head
// ==========================================
function drawCabbage() {
  const c = new PixelCanvas(48, 48);
  c.shadow(24, 40, 14, 4);

  const cx = 24, cy = 30;

  // Outer dark ruffled leaves
  c.circle(cx - 7, cy + 2, 7, 20, 83, 45);
  c.circle(cx + 7, cy + 2, 7, 20, 83, 45);
  c.circle(cx, cy + 5, 7, 20, 83, 45);
  c.circle(cx - 6, cy - 4, 7, 20, 83, 45);
  c.circle(cx + 6, cy - 4, 7, 20, 83, 45);

  // Mid green leaf cup
  c.circle(cx - 5, cy, 6, 34, 197, 94);
  c.circle(cx + 5, cy, 6, 34, 197, 94);
  c.circle(cx, cy - 3, 6, 74, 222, 128);

  // Crisp dense center ball
  c.circle(cx, cy, 6, 110, 231, 183);
  c.circle(cx, cy - 1, 4, 167, 243, 208);
  c.set(cx - 1, cy - 2, 240, 253, 244); // heart highlight

  return c.toDataURI();
}

// ==========================================
// UI ICONS (28x28) - Cute, crisp items for nursery & market
// ==========================================
function drawIcon(type) {
  const c = new PixelCanvas(28, 28);
  const cx = 14, cy = 14;

  if (type === 'wheat') {
    c.rect(13, 8, 2, 16, 180, 120, 40);
    c.ellipse(14, 10, 4, 6, 234, 179, 8);
    c.ellipse(14, 9, 2, 4, 254, 240, 138);
    c.set(11, 6, 245, 158, 11); c.set(17, 6, 245, 158, 11);
  } else if (type === 'strawberry') {
    c.rect(12, 6, 5, 2, 22, 101, 52);
    c.ellipse(cx, cy + 2, 6, 7, 220, 38, 38);
    c.ellipse(cx - 1, cy, 3, 4, 239, 68, 68);
    c.set(cx - 2, cy - 1, 255, 255, 255);
    c.set(cx + 2, cy + 3, 254, 240, 138); c.set(cx - 2, cy + 4, 254, 240, 138);
  } else if (type === 'carrot') {
    c.rect(13, 4, 3, 5, 34, 197, 94);
    c.ellipse(cx, cy + 4, 4, 7, 234, 88, 12);
    c.ellipse(cx - 1, cy + 2, 2, 5, 251, 146, 60);
    c.set(cx - 1, cy + 1, 254, 215, 170);
  } else if (type === 'corn') {
    c.rect(10, 12, 3, 10, 22, 101, 52);
    c.rect(15, 12, 3, 10, 22, 101, 52);
    c.ellipse(cx, cy, 4, 8, 234, 179, 8);
    c.ellipse(cx, cy - 1, 2, 6, 254, 240, 138);
    c.set(cx, cy - 8, 180, 83, 9);
  } else if (type === 'pumpkin') {
    c.rect(13, 5, 3, 4, 120, 75, 40);
    c.ellipse(cx, cy + 2, 8, 7, 234, 88, 12);
    c.ellipse(cx, cy + 2, 4, 7, 249, 115, 22);
    c.set(cx, cy - 1, 254, 215, 170);
  } else if (type === 'tomato') {
    c.set(cx, 6, 22, 101, 52); c.set(cx - 2, 7, 74, 222, 128); c.set(cx + 2, 7, 74, 222, 128);
    c.circle(cx, cy + 2, 6, 220, 38, 38);
    c.circle(cx - 1, cy, 3, 239, 68, 68);
    c.set(cx - 2, cy - 1, 255, 255, 255);
  } else if (type === 'watermelon') {
    c.ellipse(cx, cy, 8, 6, 22, 101, 52);
    c.rect(10, 11, 2, 6, 74, 222, 128);
    c.rect(14, 10, 2, 8, 74, 222, 128);
    c.rect(18, 11, 2, 6, 74, 222, 128);
  } else if (type === 'grapes') {
    c.rect(13, 5, 4, 2, 120, 75, 40);
    c.set(11, 6, 34, 197, 94);
    c.circle(12, 11, 2.5, 109, 40, 217);
    c.circle(16, 11, 2.5, 109, 40, 217);
    c.circle(14, 15, 2.5, 109, 40, 217);
    c.circle(14, 19, 2, 76, 29, 149);
    c.set(11, 10, 192, 132, 252);
  } else if (type === 'sunflower') {
    c.circle(cx, cy, 8, 234, 179, 8);
    c.circle(cx, cy, 4, 120, 53, 15);
    c.set(cx, cy, 180, 83, 9);
  } else if (type === 'cabbage') {
    c.circle(cx, cy, 7, 34, 197, 94);
    c.circle(cx, cy, 4, 110, 231, 183);
    c.set(cx, cy, 240, 253, 244);
  }

  return c.toDataURI();
}

console.log('Generating Enhanced 16-Bit Pixel Art Crop Sprites...');
const CROP_SPRITES = {
  sprout: drawSprout(),
  bush: drawBush(),
  wheat: drawWheat(),
  strawberry: drawStrawberry(),
  carrot: drawCarrot(),
  corn: drawCorn(),
  pumpkin: drawPumpkin(),
  tomato: drawTomato(),
  watermelon: drawWatermelon(),
  grapes: drawGrapes(),
  sunflower: drawSunflower(),
  cabbage: drawCabbage(),
  icon_wheat: drawIcon('wheat'),
  icon_strawberry: drawIcon('strawberry'),
  icon_carrot: drawIcon('carrot'),
  icon_corn: drawIcon('corn'),
  icon_pumpkin: drawIcon('pumpkin'),
  icon_tomato: drawIcon('tomato'),
  icon_watermelon: drawIcon('watermelon'),
  icon_grapes: drawIcon('grapes'),
  icon_sunflower: drawIcon('sunflower'),
  icon_cabbage: drawIcon('cabbage')
};

const outputJS = `// Generated High-Detail 16-Bit Pixel Art Crop Sprites and UI Icons
export const CROP_PIXEL_SPRITES = ${JSON.stringify(CROP_SPRITES, null, 2)};
`;

fs.writeFileSync(
  path.join(__dirname, '../src/data/cropSprites.js'),
  outputJS
);
console.log('Successfully wrote enhanced src/data/cropSprites.js!');
