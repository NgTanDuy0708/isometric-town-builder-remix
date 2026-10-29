// Level-specific building art. Each family shares a canvas and ground anchor.
export const BUILDING_LEVEL_SPRITES = {
  // One definitive civic landmark, shared by every gameplay level.
  b14_town_hall: {
    1: "/assets/buildings/town_hall_main.png"
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
  }
};

export function getBuildingSpriteUri(tileId, level = 1) {
  const levels = BUILDING_LEVEL_SPRITES[tileId];
  return levels ? (levels[level] || levels[1]) : undefined;
}

// Original generated PNGs are kept byte-for-byte. Scale only at draw time;
// source-space foot anchors preserve placement without shrinking the asset.
export const BUILDING_SOURCE_GEOMETRY = {
  b14_town_hall: {
    // Front foundation contact -> front vertex of rows 12..13, cols 14..16.
    1: { width: 1254, height: 1254, visibleWidth: 1019, anchorX: 816, anchorY: 1214,
      worldWidth: 300, worldAnchorX: 128, worldAnchorY: 160 }
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
  }
};

export function getBuildingRenderAdjustment(tileId, level = 1) {
  const levels = BUILDING_SOURCE_GEOMETRY[tileId];
  const source = levels && (levels[level] || levels[1]);
  if (!source) return undefined;
  const scale = source.worldWidth / source.visibleWidth;
  return {
    dx: (source.worldAnchorX ?? 64) - source.anchorX * scale,
    dy: (source.worldAnchorY ?? 128) - source.anchorY * scale,
    dw: source.width * scale,
    dh: source.height * scale,
    highQuality: true
  };
}
