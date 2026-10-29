export const TOWN_HALL_TUNING_KEY = 'isometric_town_builder_town_hall_tuning_v4';
export const TOWN_HALL_ENTRANCE = Object.freeze({ anchorX: 430, anchorY: 1103, worldX: -64, worldY: 160, edgeX: 2, edgeY: 1 });
export function alignTownHallEntrance(input) {
  // The redrawn sprite supplies the camera. Alignment only restores its
  // original aspect ratio and snaps the staircase contact onto [15,15].
  return { ...input, width: 1, height: 1, x: 0, y: 0, rotation: 0, groundShear: 0 };
}
export const DEFAULT_TOWN_HALL_TUNING = Object.freeze({ size: 1, width: 1, height: 1, x: 0, y: 0, rotation: 0, groundShear: 0 });

export function normalizeTownHallTuning(input) {
  const result = { ...DEFAULT_TOWN_HALL_TUNING };
  for (const key of Object.keys(result)) {
    const value = input?.[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    const [min, max] = key === 'groundShear' ? [-1, 1] : key === 'rotation' ? [-180, 180] : key === 'x' || key === 'y' ? [-128, 128] : [0.5, 1.8];
    result[key] = Math.max(min, Math.min(max, value));
  }
  return result;
}

export function readTownHallTuning() {
  try {
    const saved = localStorage.getItem(TOWN_HALL_TUNING_KEY);
    if (saved) return normalizeTownHallTuning(JSON.parse(saved));
    // Legacy corrections belong to the previous artwork and must not distort
    // the replacement, even in browsers that still have v1/v2/v3 settings.
    return { ...DEFAULT_TOWN_HALL_TUNING };
  }
  catch { return { ...DEFAULT_TOWN_HALL_TUNING }; }
}

export function applyTownHallTuning(base, source, input) {
  const tuning = normalizeTownHallTuning(input);
  const fx = source.anchorX / source.width, fy = source.anchorY / source.height;
  const dw = base.dw * tuning.size * tuning.width;
  const dh = base.dh * tuning.size * tuning.height;
  return { ...base, dw, dh, rotation: tuning.rotation, groundShear: tuning.groundShear,
    pivotX: base.dx + base.dw * fx + tuning.x,
    pivotY: base.dy + base.dh * fy + tuning.y,
    dx: base.dx + base.dw * fx + tuning.x - dw * fx,
    dy: base.dy + base.dh * fy + tuning.y - dh * fy };
}

// The editor and world renderer share the same rotation and ground pivot.
export function drawTownHallSprite(ctx, image, adjustment, ox = 0, oy = 0) {
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (adjustment.rotation || adjustment.groundShear) {
    const px = ox + adjustment.pivotX, py = oy + adjustment.pivotY;
    ctx.translate(px, py);
    if (adjustment.rotation) ctx.rotate(adjustment.rotation * Math.PI / 180);
    // y += k*x changes ground-edge slope while vertical columns remain vertical.
    if (adjustment.groundShear) ctx.transform(1, adjustment.groundShear, 0, 1, 0, 0);
    ctx.translate(-px, -py);
  }
  ctx.drawImage(image, ox + adjustment.dx, oy + adjustment.dy, adjustment.dw, adjustment.dh);
  ctx.restore();
}
