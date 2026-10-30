import {EXPANSION_PLANTS} from "./fruitTreeSprites.js";
import { TERRAIN_TILE_URIS } from './terrainConfig.js';

// File-backed sprite assets. Embedded tile, animation, and entity images were removed.
export const TILE_DATA_URIS = {
  ...TERRAIN_TILE_URIS,
  b01_cottage_red: "/assets/buildings/cottage_lv1.png",
  ...Object.fromEntries(Object.entries(EXPANSION_PLANTS).map(([id,data])=>[id,data.stages.fruiting]))
};
