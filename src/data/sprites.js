import { TERRAIN_TILE_URIS } from './terrainConfig.js';

// File-backed sprite assets. Embedded tile, animation, and entity images were removed.
export const TILE_DATA_URIS = {
  ...TERRAIN_TILE_URIS,
  b01_cottage_red: "/assets/buildings/cottage_lv1.png",
  d21_apple_tree: "/assets/trees/apple_tree_ripe.png",
  d22_coconut_palm: "/assets/trees/coconut_palm_ripe.png",
  d23_tamarind_tree: "/assets/trees/tamarind_tree_ripe.png"
};
