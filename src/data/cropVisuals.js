export const SOWN_CROP_IDS = [
  "wheat", "carrot", "radish", "tomato", "mushroom", "sunflower",
  "onion", "chili", "cucumber", "cucumber_pickling", "pumpkin", "grapes",
  "corn", "lettuce", "strawberry", "pear"
];
export const SOWN_CROP_SPRITES = Object.fromEntries(SOWN_CROP_IDS.map(id =>
  [id, `/assets/crops/sown/${id}_sown.png`]));

// Legacy crops use the closest existing planting shape until their own art exists.
export function getSownCropSpriteId(id) {
  return ({ cabbage: "lettuce", watermelon: "pumpkin" })[id] || id;
}

// Uniform transform for the approved 1254px canvas: the seed pattern sits on
// the ground diamond, centred at (64,96), rather than on the upper sprite area.
export const SOWN_CROP_DRAW = { dx: -32, dy: -4, dw: 192, dh: 192 };

export function isCropJustSown(elapsedMs, durationMs) {
  return elapsedMs < Math.min(8000, durationMs * 0.2);
}
