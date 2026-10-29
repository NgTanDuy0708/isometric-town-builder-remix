// Source rectangles exclude transparent padding; original PNGs stay untouched.
export const TERRAIN_SPRITES = {
  grass: { uri: '/assets/terrain/meadow.png', source: [69, 351, 1117, 583], color: '#8a9e4f' },
  sea: { uri: '/assets/terrain/sea.png', source: [9, 356, 1236, 635], color: '#3f74bc' },
  shore: { uri: '/assets/terrain/shore.png', source: [24, 37, 1725, 850], color: '#ebcc81' },
  sand: { uri: '/assets/terrain/sand.png', source: [33, 36, 1709, 851], color: '#ebcc81' }
};

export const TERRAIN_TILE_KINDS = {
  d12_meadow_wildflowers: 'grass', g01_grass_flat: 'grass',
  m01_sandy_beach_s: 'shore', s13_sand_ground: 'sand'
};

// These catalog entries already used one shared flat sea/sand image.
for (const id of [
  'm05_lighthouse_island', 'm06_tropical_palm_island', 'm07_sea_stacks_reef',
  'l01_harbor_estuary_seagate', 'l02_coastal_sea_arch_cliff', 'l09_wildlife_sea_turtles',
  'l11_volcanic_caldera_island', 'm29_sea_var1_kelp_forest', 'm30_sea_var2_coral_reef',
  'm31_sea_var3_bell_buoy', 'm32_sea_var4_shipwreck_reef', 'm33_sea_var5_flying_fish',
  'm34_sea_var6_bioluminescence', 'm53_sea_var1_bamboo_weir_cormorant',
  'm54_sea_var2_sunken_temple_ruins', 'm55_sea_var3_basalt_stack_puffin_rookery',
  'm56_sea_var4_floating_lantern_festival', 'm57_sea_var5_sargasso_kelp_manta_ray',
  'm58_sea_var6_geothermal_vent_pumice_shoal'
]) TERRAIN_TILE_KINDS[id] = 'sea';
for (const id of [
  'm23_beach_var1_driftwood', 'm24_beach_var2_rowboat_nets', 'm25_beach_var3_tidepool',
  'm26_beach_var4_parasol_castle', 'm27_beach_var5_dune_boardwalk', 'm28_beach_var6_treasure_chest'
]) TERRAIN_TILE_KINDS[id] = 'sand';

export const TERRAIN_TILE_URIS = Object.fromEntries(Object.entries(TERRAIN_TILE_KINDS)
  .map(([id, kind]) => [id, TERRAIN_SPRITES[kind].uri]));

export function getTerrainSprite(tileId) {
  return TERRAIN_SPRITES[TERRAIN_TILE_KINDS[tileId]];
}

// Coordinates are [row, col]. Continue the same coast beyond both map ends.
export function getBaseTerrainTile(col) {
  if (col <= 3) return 'm30_sea_var2_coral_reef';
  if (col === 4) return 'm01_sandy_beach_s';
  if (col <= 6) return 's13_sand_ground';
  return 'd12_meadow_wildflowers';
}

export function applyCoastTerrainLayout(grid) {
  if (!Array.isArray(grid)) return grid;
  for (const row of grid) {
    if (!Array.isArray(row)) continue;
    for (let col = 0; col <= 6 && col < row.length; col++) {
      // Change terrain only; buildings, crops, roads and their saved state survive.
      if (getTerrainSprite(row[col])) row[col] = getBaseTerrainTile(col);
    }
  }
  return grid;
}
