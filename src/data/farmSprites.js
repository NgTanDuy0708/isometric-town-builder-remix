// Native generated PNGs; source-space feet ignore faint transparent edge pixels.
const sprite = (file, visibleWidth, anchorX, anchorY) => ({
  uri: `/assets/farm/${file}.png`, width: 1254, height: 1254,
  visibleWidth, anchorX, anchorY
});

const barnSprite = (file, visibleWidth, anchorX, anchorY) => ({
  ...sprite(file, visibleWidth, anchorX, anchorY),
  worldWidth:128,worldAnchorX:0,worldAnchorY:96,
  gridFence:true,animalSlotsAreWorld:true,
  sourceFile: `public/assets/farm/${file}.png`
});

export const FARM_ANIMALS = {
  chicken: sprite('chicken', 700, 649, 1103),
  cow: sprite('cow', 1081, 593, 1069),
  sheep: sprite('sheep', 952, 589, 1083),
  pig: sprite('pig', 774, 589, 1002),
  dog: sprite('pet_dog', 939, 537, 1136),
  cat: sprite('pet_cat', 797, 563, 1102),
  horse: sprite('pet_horse', 949, 529, 1140),
  rabbit: sprite('pet_rabbit', 711, 554, 1055)
};

export const FARM_BUILDINGS = {
  b21_chicken_coop: {
    ...barnSprite('chicken_coop_v4', 1073, 590, 1088),
    animalType: 'chicken', animalWidth: 14,
    animalSlots: [[48,102],[75,91],[100,99],[63,116],[89,111]]
  },
  b22_cow_pasture: {
    ...barnSprite('cow_barn_v4', 1141, 558, 1076),
    animalType: 'cow', animalWidth: 26,
    animalSlots: [[40,96],[91,96],[67,111]]
  },
  b57_sheep_pasture: {
    ...barnSprite('sheep_barn_v4', 1126, 575, 1046),
    animalType: 'sheep', animalWidth: 20,
    animalSlots: [[40,95],[91,95],[65,111]]
  },
  d33_pig_pen_barn: {
    ...barnSprite('pig_pen_v4', 1187, 569, 1076),
    animalType: 'pig', animalWidth: 28,
    animalSlots: [[38,91],[89,91],[46,110],[85,110]]
  }
};

// Same single design at every economic upgrade level.
export const FARM_BUILDING_LEVELS = Object.fromEntries(Object.entries(FARM_BUILDINGS)
  .map(([id, s]) => [id, { 1: s.uri }]));
export const FARM_BUILDING_GEOMETRY = Object.fromEntries(Object.entries(FARM_BUILDINGS)
  .map(([id, s]) => [id, { 1: s, 2: s, 3: s }]));

export function getFarmAnimalRect(type, footX, footY, visibleWidth, flipped = false) {
  const s = FARM_ANIMALS[type];
  const scale = visibleWidth / s.visibleWidth;
  return { x: footX - (flipped ? s.width - s.anchorX : s.anchorX) * scale,
    y: footY - s.anchorY * scale, w: s.width * scale, h: s.height * scale, flip: flipped };
}

export function drawFarmAnimal(ctx, image, rect) {
  if (!image?.complete || !(image.naturalWidth > 0)) return false;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (rect.flip) {
    ctx.translate(rect.x + rect.w, rect.y);
    ctx.scale(-1, 1);
    ctx.drawImage(image, 0, 0, rect.w, rect.h);
  } else ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
  return true;
}
