// One category per catalog item; sprite variants are levels, not extra purchases.
const legacyCategories = {
  residential: ['b01_cottage_red','b02_tudor_inn','b09_chapel','b14_town_hall','b20_noble_manor','b60_combined_warehouse'],
  production: ['b03_blacksmith_forge','b04_windmill','b05_watermill','b06_bakery','b07_apothecary','b08_watchtower'],
  farming: ['d13_farmland_plot','d21_apple_tree','d22_coconut_palm','d23_tamarind_tree','b21_chicken_coop','b22_cow_pasture','b57_sheep_pasture','d33_pig_pen_barn'],
  roads: ['d01_plaza_fountain'],
  decor: ['d25_tulip_flowerbed','d26_marble_lion_statue','d27_royal_banner_flag','d28_forest_dense_canopy','d29_forest_oak_woodland','d30_forest_oak_thicket','d31_forest_pine_cliff','d32_forest_pine_boulders']
};
const legacy = Object.fromEntries(Object.entries(legacyCategories).flatMap(([category, ids]) => ids.map(id => [id, category])));
export function getShopCategory(tile) {
  return tile.shopCategory || legacy[tile.id] || (tile.category === 'road' ? 'roads' : null);
}
