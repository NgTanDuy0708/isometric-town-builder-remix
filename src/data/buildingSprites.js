import { FARM_BUILDING_LEVELS, FARM_BUILDING_GEOMETRY, getFarmAnimalRect } from './farmSprites.js';
import { applyTownHallTuning, readTownHallTuning, TOWN_HALL_ENTRANCE } from '../engine/townHallTuning.js';
import { getWarehouseRenderAdjustment, readWarehouseTuning } from '../engine/warehouseTuning.js';
import { EXPANSION_BUILDING_LEVELS, EXPANSION_BUILDING_GEOMETRY } from './expansionCatalog.js';
import { WORLD_OBJECT_SCALE, scaleObjectRect } from './renderScale.js';
import { isLivestockTile } from './livestockConfig.js';
import { LIVESTOCK_WORLD_WIDTH } from './livestockFootprint.js';
import { IRON_MINE_LEVEL_SPRITES, IRON_MINE_GEOMETRY } from './ironMineArtData.js';
import { STONE_DEPOSIT_GEOMETRY } from './stoneDepositArtData.js';
// Level-specific building art. Each family shares a canvas and ground anchor.
export const BUILDING_LEVEL_SPRITES = {
  b66_iron_mine: IRON_MINE_LEVEL_SPRITES,
  b65_stone_quarry: {
    1: '/assets/buildings/stone_quarry_lv1.png',
    2: '/assets/buildings/stone_quarry_lv2.png',
    3: '/assets/buildings/stone_quarry_lv3.png'
  },
  b64_bbq_restaurant: {
    1: '/assets/buildings/bbq_restaurant_lv1.png',
    2: '/assets/buildings/bbq_restaurant_lv2.png',
    3: '/assets/buildings/bbq_restaurant_lv3.png'
  },
  ...EXPANSION_BUILDING_LEVELS,
  // One finished warehouse, shared by every storage upgrade level.
  b60_combined_warehouse: {
    1: "/assets/buildings/royal_warehouse_three_storey.png"
  },
  // One definitive civic landmark, shared by every gameplay level.
  b14_town_hall: {
    1: "/assets/buildings/town_hall_redrawn_v2.png"
  },
  b01_cottage_red: {
    1: "/assets/buildings/cottage_lv1.png",
    2: "/assets/buildings/cottage_lv2.png",
    3: "/assets/buildings/cottage_lv3.png"
  },
  b02_tudor_inn: {
    1: "/assets/buildings/inn_lv1.png",
    2: "/assets/buildings/inn_lv2.png",
    3: "/assets/buildings/inn_lv3.png"
  },
  b03_blacksmith_forge: {
    1: "/assets/buildings/forge_lv1.png",
    2: "/assets/buildings/forge_lv2.png",
    3: "/assets/buildings/forge_lv3.png"
  },
  b04_windmill: {
    1: "/assets/buildings/windmill_lv1.png",
    2: "/assets/buildings/windmill_lv2.png",
    3: "/assets/buildings/windmill_lv3.png"
  },
  b05_watermill: {
    1: "/assets/buildings/watermill_lv1.png",
    2: "/assets/buildings/watermill_lv2.png",
    3: "/assets/buildings/watermill_lv3.png"
  },
  b06_bakery: {
    1: "/assets/buildings/bakery_lv1.png",
    2: "/assets/buildings/bakery_lv2.png",
    3: "/assets/buildings/bakery_lv3.png"
  },
  b07_apothecary: {
    1: "/assets/buildings/herbalist_lv1.png",
    2: "/assets/buildings/herbalist_lv2.png",
    3: "/assets/buildings/herbalist_lv3.png"
  },
  b08_watchtower: {
    1: "/assets/buildings/watchtower_lv1.png",
    2: "/assets/buildings/watchtower_lv2.png",
    3: "/assets/buildings/watchtower_lv3.png"
  },
  b09_chapel: {
    1: "/assets/buildings/chapel_lv1.png",
    2: "/assets/buildings/chapel_lv2.png",
    3: "/assets/buildings/chapel_lv3.png"
  },
  b20_noble_manor: {
    1: "/assets/buildings/manor_lv1.png",
    2: "/assets/buildings/manor_lv2.png",
    3: "/assets/buildings/manor_lv3.png"
  },
  ...FARM_BUILDING_LEVELS
};

export function getBuildingSpriteUri(tileId, level = 1) {
  const levels = BUILDING_LEVEL_SPRITES[tileId];
  return levels ? (levels[level] || levels[1]) : undefined;
}

// Original generated PNGs are kept byte-for-byte. Scale only at draw time;
// source-space foot anchors preserve placement without shrinking the asset.
export const BUILDING_SOURCE_GEOMETRY = {
  n02_stone_deposit: STONE_DEPOSIT_GEOMETRY,
  ...IRON_MINE_GEOMETRY,
  b65_stone_quarry: {
    1: { width:1254,height:1254,visibleWidth:1131,anchorX:696,anchorY:1121,worldWidth:128 },
    2: { width:1254,height:1254,visibleWidth:1208,anchorX:651,anchorY:1169,worldWidth:144 },
    3: { width:1254,height:1254,visibleWidth:1204,anchorX:668,anchorY:1226,worldWidth:160 }
  },
  b64_bbq_restaurant: {
    1: { width:1254,height:1254,visibleWidth:1061,anchorX:691,anchorY:1052,worldWidth:128,worldAnchorX:64,worldAnchorY:128 },
    2: { width:1254,height:1254,visibleWidth:1191,anchorX:788,anchorY:1107,worldWidth:144,worldAnchorX:64,worldAnchorY:128 },
    3: { width:1254,height:1254,visibleWidth:1142,anchorX:800,anchorY:1160,worldWidth:160,worldAnchorX:64,worldAnchorY:128 }
  },
  ...EXPANSION_BUILDING_GEOMETRY,
  b60_combined_warehouse: {
    // Three-storey replacement: actual straight foundation edges, no projecting
    // dock. Front corner is the intersection of the measured ground-edge fits.
    1: { width: 1254, height: 1254, visibleWidth: 1040,
      anchorX: 638.0688270368859, anchorY: 1238.1570163324172, worldWidth: 256,
      worldAnchorX: 64, worldAnchorY: 128 }
  },
  b14_town_hall: {
    // Bottom stair edge midpoint -> centre of cell [15,15], relative to [13,15].
    1: { width: 1254, height: 1254, visibleWidth: 829, anchorX: TOWN_HALL_ENTRANCE.anchorX, anchorY: TOWN_HALL_ENTRANCE.anchorY,
      worldWidth: 280, worldAnchorX: TOWN_HALL_ENTRANCE.worldX, worldAnchorY: TOWN_HALL_ENTRANCE.worldY }
  },
  b04_windmill: {
    1: { width: 1254, height: 1254, visibleWidth: 718, anchorX: 665, anchorY: 1061, worldWidth: 144 },
    2: { width: 1254, height: 1254, visibleWidth: 907, anchorX: 761, anchorY: 1217, worldWidth: 168 },
    3: { width: 1254, height: 1254, visibleWidth: 789, anchorX: 630, anchorY: 1210, worldWidth: 192 }
  },
  b05_watermill: {
    1: { width: 1254, height: 1254, visibleWidth: 1098, anchorX: 601, anchorY: 1148, worldWidth: 144 },
    2: { width: 1254, height: 1254, visibleWidth: 1169, anchorX: 531, anchorY: 1104, worldWidth: 168 },
    3: { width: 1254, height: 1254, visibleWidth: 1172, anchorX: 438, anchorY: 1221, worldWidth: 192 }
  },
  b06_bakery: {
    1: { width: 1254, height: 1254, visibleWidth: 1050, anchorX: 711, anchorY: 1158, worldWidth: 128 },
    2: { width: 1254, height: 1254, visibleWidth: 1146, anchorX: 673, anchorY: 1191, worldWidth: 152 },
    3: { width: 1254, height: 1254, visibleWidth: 1156, anchorX: 675, anchorY: 1215, worldWidth: 176 }
  },
  b07_apothecary: {
    1: { width: 1254, height: 1254, visibleWidth: 1013, anchorX: 639, anchorY: 1166, worldWidth: 128 },
    2: { width: 1254, height: 1254, visibleWidth: 1076, anchorX: 562, anchorY: 1135, worldWidth: 152 },
    3: { width: 1254, height: 1254, visibleWidth: 1111, anchorX: 780, anchorY: 1177, worldWidth: 176 }
  },
  b08_watchtower: {
    1: { width: 1254, height: 1254, visibleWidth: 686, anchorX: 702, anchorY: 1202, worldWidth: 112 },
    2: { width: 1254, height: 1254, visibleWidth: 655, anchorX: 567, anchorY: 1206, worldWidth: 136 },
    3: { width: 1254, height: 1254, visibleWidth: 586, anchorX: 571, anchorY: 1217, worldWidth: 128 }
  },
  b09_chapel: {
    1: { width: 1254, height: 1254, visibleWidth: 910, anchorX: 677, anchorY: 1147, worldWidth: 128 },
    2: { width: 1254, height: 1254, visibleWidth: 972, anchorX: 678, anchorY: 1225, worldWidth: 152 },
    3: { width: 1254, height: 1254, visibleWidth: 1059, anchorX: 820, anchorY: 1227, worldWidth: 176 }
  },
  b20_noble_manor: {
    1: { width: 1254, height: 1254, visibleWidth: 1051, anchorX: 780, anchorY: 1164, worldWidth: 176 },
    2: { width: 1254, height: 1254, visibleWidth: 1165, anchorX: 908, anchorY: 1188, worldWidth: 192 },
    3: { width: 1254, height: 1254, visibleWidth: 1142, anchorX: 884, anchorY: 1200, worldWidth: 208 }
  },
  ...FARM_BUILDING_GEOMETRY
};

/** @param {Record<string, any> | undefined} tuning */
export function getBuildingRenderAdjustment(tileId, level = 1, tuning = undefined) {
  const levels = BUILDING_SOURCE_GEOMETRY[tileId];
  const source = levels && (levels[level] || levels[1]);
  if (!source) {
    if (['b01_cottage_red','b02_tudor_inn','b03_blacksmith_forge'].includes(tileId)) {
      return scaleObjectRect({dx:-64,dy:-128,dw:256,dh:256});
    }
    return undefined;
  }
  if (tileId === 'b60_combined_warehouse') return getWarehouseRenderAdjustment(source, tuning ?? readWarehouseTuning());
  const scale = isLivestockTile(tileId) ? source.worldWidth / source.visibleWidth
    : source.worldWidth / source.visibleWidth * (tileId === 'b14_town_hall' ? 1 : WORLD_OBJECT_SCALE);
  const adjustment = {
    dx: (source.worldAnchorX ?? 64) - source.anchorX * scale,
    dy: (source.worldAnchorY ?? 128) - source.anchorY * scale,
    dw: source.width * scale,
    dh: source.height * scale,
    highQuality: true
  };
  return tileId === 'b14_town_hall'
    ? applyTownHallTuning(adjustment, source, tuning ?? readTownHallTuning()) : adjustment;
}

// Return source-anchored animal rectangles on each building's ground plane.
export function getBuildingAnimalSlots(tileId, level = 1) {
  const levels = BUILDING_SOURCE_GEOMETRY[tileId];
  const source = levels && (levels[level] || levels[1]);
  if (!source?.animalSlots) return [];
  if(source.animalSlotsAreWorld) return source.animalSlots.map(([x,y],index)=>
    getFarmAnimalRect(source.animalType,x,y,source.animalWidth,index%2===1));
  const adjustment = getBuildingRenderAdjustment(tileId, level);
  const scale = adjustment.dw / source.width;
  return source.animalSlots.map(([x, y], index) => getFarmAnimalRect(
    source.animalType, adjustment.dx + x * scale, adjustment.dy + y * scale,
    source.animalWidth * (isLivestockTile(tileId) ? LIVESTOCK_WORLD_WIDTH/source.worldWidth : WORLD_OBJECT_SCALE), index % 2 === 1));
}
