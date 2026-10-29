// Visual front is [31,31], visual back is [0,0]. Canvas paints the back FIRST
// so the front is painted LAST and covers objects behind it.
// Fractional coordinates are intentional: moving actors must not snap layers.
import { getTerrainSprite } from '../data/terrainConfig.js';

export function compareWorldDepth(a, b) {
  return (a.row + a.col) - (b.row + b.col) ||
    a.row - b.row || a.col - b.col ||
    (a.priority || 0) - (b.priority || 0);
}

// Only flat surfaces belong in the ground pass. Bridges, gates, plazas and
// trees stay in the world queue even when their catalog category is "road".
const FLAT_GROUND_IDS = new Set([
  "d12_meadow_wildflowers", "g01_grass_flat", "s13_sand_ground",
  "r03_royal_marble_pavement", "d11_canal_straight",
  "r01_road_straight_ns", "r02_road_straight_ew", "r03_road_cross",
  "r04_road_tee_nes", "r05_road_tee_nsw", "r06_road_tee_ewn",
  "r07_road_tee_ews", "r08_road_corner_ne", "r09_road_corner_es",
  "r10_road_corner_sw", "r11_road_corner_wn",
  "c01_river_bend_ne", "c02_river_bend_nw", "c03_river_bend_se",
  "c04_river_bend_sw", "c05_river_tjct_nse", "c06_river_tjct_ews",
  "c07_river_ford_stone", "c15_road_curve_se", "c16_road_curve_nw"
]);

export function isFlatGroundTile(tileId, uri = "") {
  return !!getTerrainSprite(tileId) || FLAT_GROUND_IDS.has(tileId) ||
    /\/(?:pack_(?:grass|sand|water)_128|ocean_water_128|beach_sand_128|sand_ground_128)\.png$/.test(uri);
}
