// Native generated PNGs; source-space feet ignore faint transparent edge pixels.
const sprite = (file, visibleWidth, anchorX, anchorY) => ({
  uri: `/assets/farm/${file}.png`, width: 1254, height: 1254,
  visibleWidth, anchorX, anchorY
});

const barnSprite = (file, visibleWidth, anchorX, anchorY) => ({
  ...sprite(file, visibleWidth, anchorX, anchorY),
  sourceFile: `assets-source/farm-buildings-v2/${file}.png`
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
    ...barnSprite('chicken_coop_v2', 951, 750, 1018), worldWidth: 144,
    animalType: 'chicken', animalWidth: 11,
    animalSlots: [[720, 820], [825, 825], [930, 830], [775, 890], [885, 895]],
    foreground: [[350, 750], [750, 885], [1145, 700], [1170, 1040], [350, 1040]]
  },
  b22_cow_pasture: {
    ...barnSprite('cow_barn_v2', 1006, 761, 1029), worldWidth: 144,
    animalType: 'cow', animalWidth: 20,
    animalSlots: [[850, 820], [730, 840], [850, 900]],
    foreground: [[420, 770], [760, 890], [1155, 690], [1180, 1050], [420, 1050]]
  },
  b57_sheep_pasture: {
    ...barnSprite('sheep_barn_v2', 1066, 760, 1053), worldWidth: 144,
    animalType: 'sheep', animalWidth: 15,
    animalSlots: [[880, 850], [730, 855], [850, 930]],
    foreground: [[365, 770], [760, 900], [1190, 700], [1210, 1080], [365, 1080]]
  },
  d33_pig_pen_barn: {
    ...barnSprite('pig_pen_v2', 1036, 732, 1064), worldWidth: 144,
    animalType: 'pig', animalWidth: 21, animalSlots: [[770, 825], [900, 840], [720, 910], [860, 940]],
    foreground: [[340, 750], [735, 890], [1165, 690], [1190, 1090], [340, 1090]]
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
