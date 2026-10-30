// Only homes provide residents. World actors are a visual simulation, not workers.
export const HOUSING_TILE_IDS = new Set([
  'b01_cottage_red', 'b02_tudor_inn', 'b20_noble_manor',
  'b23_mediterranean_villa_sw', 'b24_mediterranean_villa_se',
  'b43_nomad_yurt_sw', 'b44_nomad_yurt_se',
  'b61_clay_house', 'b62_canvas_tent', 'b63_nordic_longhouse'
]);
export const isHousingTile = id => HOUSING_TILE_IDS.has(id);
