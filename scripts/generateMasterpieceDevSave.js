// scripts/generateMasterpieceDevSave.js
// Generates an exquisite, atmospheric, picturesque medieval town for Developer Testing.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TILES_DATA } from "../src/data/tilesData.js";
import { isValidGrid } from "../src/engine/storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const validTileIds = new Set(TILES_DATA.map(t => t.id));

function buildMasterpieceDevMap() {
  const ROWS = 32;
  const COLS = 32;
  const grid = [];

  // 1. Initialize base with diverse, textured wildflower meadows
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      // Natural meadow variation instead of flat repeating tiles
      if ((r + c * 3) % 7 === 0) {
        row.push("s10_meadow_wildflowers_v1"); // Blooming flower patches
      } else if ((r * 2 + c) % 11 === 0) {
        row.push("s12_meadow_stepping_stones_v3"); // Gentle stepping paths
      } else {
        row.push("d12_meadow_wildflowers");
      }
    }
    grid.push(row);
  }

  // 2. Natural Organic Forest Borders (clusters of ancient oaks, birches, silver pines)
  // Deep top forest
  for (let c = 0; c < COLS; c++) {
    grid[0][c] = (c % 3 === 0) ? "s23_forest_var3_pine_cedar" : (c % 3 === 1 ? "s21_forest_var1_hollow_oak" : "s22_forest_var2_silver_birch");
    grid[1][c] = (c % 4 === 0) ? "d05_pine_grove" : (c % 4 === 2 ? "s21_forest_var1_hollow_oak" : "d12_meadow_wildflowers");
    grid[2][c] = ((c * 5) % 9 === 0) ? "s11_meadow_rock_outcrop_v2" : grid[2][c];
  }
  // Left border
  for (let r = 0; r < ROWS; r++) {
    grid[r][0] = (r % 3 === 0) ? "s21_forest_var1_hollow_oak" : (r % 3 === 1 ? "s23_forest_var3_pine_cedar" : "s22_forest_var2_silver_birch");
    grid[r][1] = (r % 4 === 0) ? "d05_pine_grove" : (r % 4 === 2 ? "s21_forest_var1_hollow_oak" : grid[r][1]);
  }
  // Right border
  for (let r = 0; r < ROWS; r++) {
    grid[r][COLS - 1] = (r % 3 === 0) ? "s23_forest_var3_pine_cedar" : (r % 3 === 1 ? "s21_forest_var1_hollow_oak" : "d05_pine_grove");
    grid[r][COLS - 2] = (r % 4 === 0) ? "s22_forest_var2_silver_birch" : (r % 4 === 2 ? "d04_oak_tree_park" : grid[r][COLS - 2]);
  }
  // Bottom border (excluding main entrance at col 15)
  for (let c = 0; c < COLS; c++) {
    if (c !== 15 && c !== 14 && c !== 16) {
      grid[ROWS - 1][c] = (c % 3 === 0) ? "s23_forest_var3_pine_cedar" : "d05_pine_grove";
      grid[ROWS - 2][c] = (c % 4 === 0) ? "s21_forest_var1_hollow_oak" : grid[ROWS - 2][c];
    }
  }

  // 3. Natural Meandering River (Flowing from NW mountains down past watermill & quays)
  grid[2][3] = "c02_river_bend_nw";
  grid[3][3] = "d11_canal_straight";
  grid[4][3] = "d11_canal_straight";
  grid[5][3] = "c04_river_bend_sw";
  grid[5][4] = "c01_river_bend_ne";
  for (let r = 6; r <= 15; r++) {
    grid[r][4] = "d11_canal_straight";
  }
  // Stone bridge where West Road crosses the river
  grid[16][4] = "r12_road_bridge_stone";
  // River continues south towards harbor
  for (let r = 17; r <= 23; r++) {
    grid[r][4] = "d11_canal_straight";
  }
  grid[20][4] = "c08_river_quay_dock"; // Stone quay dock with moored boat
  grid[24][4] = "c04_river_bend_sw";
  grid[24][5] = "r02_road_straight_ew"; // Small waterway canal
  grid[24][6] = "c03_river_bend_se";
  grid[25][6] = "d11_canal_straight";
  grid[26][6] = "c04_river_bend_sw";
  grid[26][7] = "c09_timber_footbridge_ns"; // Timber footbridge over stream
  grid[26][8] = "c03_river_bend_se";

  // Riverbank Weeping Willows
  grid[7][3] = "r36_road_var6_canal_willow_quay";
  grid[11][3] = "s24_forest_var4_cherry_willow";
  grid[18][3] = "r36_road_var6_canal_willow_quay";
  grid[22][3] = "s24_forest_var4_cherry_willow";

  // 4. TOWN CENTER & ROYAL PLAZA (Row 12..16, Col 12..18)
  // Protected central nodes:
  grid[14][15] = "b14_town_hall";          // Central Town Hall
  grid[15][15] = "d01_plaza_fountain";     // Plaza Fountain + Delivery Truck & Order Board
  // Main south boulevard out of town
  for (let r = 16; r <= 31; r++) {
    grid[r][15] = "r01_road_straight_ns";
  }

  // Grand Plaza Surrounds & Architectural Marvels
  grid[13][15] = "r25_plaza_var1_marble_fountain"; // North marble fountain
  grid[14][14] = "r28_plaza_var4_bandstand_gazebo"; // Musical gazebo
  grid[14][16] = "l30_town_crier_plaza";           // Town crier & acrobats
  grid[15][14] = "d08_stone_statue_plaza";          // Hero statue
  grid[15][16] = "r26_plaza_var2_armillary_sundial";// Armillary sundial

  // The 2 Essential Kingdom Warehouses
  grid[12][12] = "b13_barn_silo";          // Grain Silo (Nông sản)
  grid[12][18] = "b12_general_store";      // Barn Warehouse (Thành phẩm)
  grid[13][12] = "d07_streetlamps_signpost";
  grid[13][18] = "d07_streetlamps_signpost";
  grid[14][12] = "d03_market_stalls";
  grid[14][18] = "d09_merchant_cart_camp";
  grid[15][12] = "d02_village_well";
  grid[15][18] = "d06_cherry_garden";

  // 5. ROAD NETWORK
  // Grand East-West Promenade along Row 16
  for (let c = 5; c <= 25; c++) {
    if (c !== 15 && c !== 4) grid[16][c] = "r02_road_straight_ew";
  }
  grid[16][15] = "r03_road_cross";
  grid[16][6] = "r03_road_cross";
  grid[16][20] = "r03_road_cross";
  grid[16][26] = "r33_road_var3_coaching_crossroads";

  // Royal Avenue North towards Cathedral (Row 6 to 12, Col 15)
  for (let r = 7; r <= 12; r++) {
    grid[r][15] = "r01_road_straight_ns";
  }
  grid[7][15] = "l23_royal_coach_procession"; // Royal carriage on avenue

  // Artisan Quarter Road along Col 20
  for (let r = 17; r <= 24; r++) {
    grid[r][20] = "r01_road_straight_ns";
  }

  // Farm Access Lane along Col 7
  for (let r = 17; r <= 23; r++) {
    grid[r][7] = "r01_road_straight_ns";
  }

  // 6. DISTRICT A: NORTH ROYAL CITADEL & CATHEDRAL (Row 5..10, Col 14..26)
  grid[6][15] = "b45_clocktower_guildhall_sw"; // Astronomical Clocktower
  grid[6][18] = "b20_noble_manor";             // Noble Manor
  grid[6][22] = "b15_library_scholar";         // Royal Library
  grid[8][18] = "b09_chapel";                  // Stone Cathedral/Chapel
  grid[8][22] = "l39_monastery_cloister";      // Cloister arcade
  grid[9][22] = "l42_monk_scribe_procession";  // Monk scribe procession
  grid[10][18] = "b49_amphitheater_stage_sw";  // Outdoor amphitheater
  grid[10][22] = "b18_greenhouse_orangery";    // Royal glass orangery

  // Gardens & Courtyards
  grid[6][16] = "d06_cherry_garden";
  grid[6][20] = "d10_flower_orchard_hedge";
  grid[8][16] = "d07_streetlamps_signpost";
  grid[8][20] = "d06_cherry_garden";
  grid[10][16] = "d07_streetlamps_signpost";
  grid[10][20] = "r25_plaza_var1_marble_fountain";

  // 7. DISTRICT B: NORTH-WEST LIVESTOCK RANCH (Row 6..11, Col 6..12)
  grid[7][5] = "b05_watermill";           // Watermill directly by the flowing canal
  grid[6][8] = "b21_chicken_coop";         // Chicken Coop 🐔 (4 hens pecking)
  grid[6][11] = "b22_cow_pasture";         // Cow Pasture 🐮 (4 cows grazing)
  grid[9][8] = "b57_sheep_pasture";        // Sheep Pasture 🐑 (4 fluffy sheep)
  grid[9][11] = "b59_dairy_factory";       // Dairy Factory 🧈 (Fresh butter)
  grid[11][8] = "s26_forest_var6_apiary_lavender"; // Beehives & lavender
  grid[7][7] = "s12_meadow_stepping_stones_v3";
  grid[8][8] = "d07_streetlamps_signpost";
  grid[8][11] = "d10_flower_orchard_hedge";
  grid[11][11] = "d02_village_well";

  // 8. DISTRICT C: WEST FARMLAND VALLEY & VINEYARDS (Row 17..24, Cols 4..13)
  grid[18][5] = "b04_windmill";            // Windmill perched on scenic overlook
  grid[17][8] = "s35_farm_var1_wheat_scarecrow"; // Golden wheat & scarecrow
  grid[17][10] = "s39_farm_var5_tulip_stripes";  // Colorful striped tulip beds
  grid[17][12] = "b01_cottage_red";              // Cozy farmhouse
  grid[18][12] = "s40_farm_var6_kitchen_garden"; // Kitchen herb garden

  // 16 Fertile Farmland Plots (4x4) with Ripe Crops for Sickle Harvest Test
  const farmlandState = {};
  const crops4x4 = [
    "wheat", "wheat", "carrot", "carrot",
    "tomato", "tomato", "strawberry", "strawberry",
    "corn", "corn", "cabbage", "cabbage",
    "pumpkin", "watermelon", "grapes", "sunflower"
  ];

  let cIdx = 0;
  for (let r = 18; r <= 21; r++) {
    for (let c = 8; c <= 11; c++) {
      grid[r][c] = "d13_farmland_plot";
      const cid = crops4x4[cIdx++];
      farmlandState[`${r}_${c}`] = {
        seedId: cid,
        plantTime: Date.now() - 3600000, // Ready to harvest!
        growDurationMs: 30000
      };
    }
  }

  // 4 Empty tilled plots ready for seed sowing test
  for (let c = 8; c <= 11; c++) {
    grid[22][c] = "d13_farmland_plot";
  }

  // Surrounding Vineyard & Cider Press
  grid[19][12] = "d10_flower_orchard_hedge";
  grid[21][12] = "s37_farm_var3_pumpkin_melon";  // Pumpkin & melon patch
  grid[23][8] = "s36_farm_var2_lavender_distill"; // Lavender hill & distillery
  grid[23][10] = "b48_winery_press_barn_se";     // French Winery & Press 🍷
  grid[23][12] = "l41_wine_barrel_dray_falconer";// Wine barrel carriage & falconer
  grid[24][8] = "s38_farm_var4_apple_cider_press"; // Apple cider press

  // 9. DISTRICT D: EAST OLD TOWN & ARTISAN QUARTER (Row 17..24, Cols 17..26)
  grid[17][18] = "b06_bakery";              // Village Bakery 🍞
  grid[17][22] = "b03_blacksmith_forge";    // Blacksmith Forge ⚒️
  grid[17][25] = "b02_tudor_inn";           // Tudor Inn & Pub
  grid[19][18] = "d03_market_stalls";       // Village market
  grid[19][22] = "d02_village_well";        // Town well
  grid[19][25] = "b01_cottage_red";         // Artisan cottage
  grid[21][18] = "b58_textile_mill";        // Textile Mill 🧶
  grid[21][22] = "b11_carpenter_sawmill";   // Carpenter Sawmill 🪵
  grid[21][25] = "b41_pottery_kiln_sw";     // Dragon Pottery Kiln 🏺
  grid[23][18] = "d09_merchant_cart_camp";  // Caravanserai camp
  grid[23][22] = "b23_mediterranean_villa_sw"; // Mediterranean Villa
  grid[23][25] = "b29_botanical_conservatory_sw"; // Botanical Conservatory

  grid[18][20] = "d07_streetlamps_signpost";
  grid[20][20] = "r30_plaza_var6_stone_wellhouse";
  grid[22][20] = "d07_streetlamps_signpost";

  // 10. DISTRICT E: SOUTH-WEST FRUIT ORCHARD & RETREAT (Row 25..30, Cols 6..13)
  grid[26][8] = "d21_apple_tree";           // Apple Tree 🍎
  grid[26][9] = "d21_apple_tree";           // Apple Tree 🍎
  grid[26][11] = "d22_coconut_palm";        // Coconut Palm 🥥
  grid[26][12] = "d22_coconut_palm";        // Coconut Palm 🥥
  grid[28][8] = "d23_tamarind_tree";        // Tamarind Tree 🥜
  grid[28][9] = "d23_tamarind_tree";        // Tamarind Tree 🥜
  grid[28][11] = "s21_forest_var1_hollow_oak";
  grid[28][12] = "s24_forest_var4_cherry_willow";
  grid[29][9] = "d02_village_well";
  grid[30][8] = "d04_oak_tree_park";
  grid[30][10] = "d05_pine_grove";

  const fruitTreesState = {
    "26_8": { lastHarvest: 0 },
    "26_9": { lastHarvest: 0 },
    "26_11": { lastHarvest: 0 },
    "26_12": { lastHarvest: 0 },
    "28_8": { lastHarvest: 0 },
    "28_9": { lastHarvest: 0 }
  };

  // 11. DISTRICT F: SOUTH-EAST ARCANA, DEFENSE & ACADEMY (Row 25..30, Cols 17..27)
  grid[25][18] = "b07_apothecary";            // Herbal Apothecary 🌿
  grid[25][22] = "b16_alchemist_workshop";    // Alchemist Lab 🧪
  grid[25][26] = "b10_wizard_tower";          // Ancient Wizard Tower 🔮
  grid[27][18] = "d10_flower_orchard_hedge";  // Rose garden
  grid[27][22] = "d06_cherry_garden";         // Cherry garden
  grid[27][26] = "b08_watchtower";            // Border Watchtower 🏹
  grid[29][18] = "b01_cottage_red";           // Sentry cottage
  grid[29][22] = "r34_road_var4_cherry_bell_shrine"; // Cherry bell shrine
  grid[29][26] = "b31_highland_keep_sw";      // Highland Keep fortress 🏰

  // 12. GRAND SOUTHERN EXIT BOULEVARD (Row 17..31, Col 15 flanked)
  // Triumphal Columns & Cypress
  grid[18][14] = "r32_road_var2_triumphal_boulevard";
  grid[18][16] = "r32_road_var2_triumphal_boulevard";
  grid[21][14] = "d07_streetlamps_signpost";
  grid[21][16] = "d07_streetlamps_signpost";
  grid[24][14] = "r32_road_var2_triumphal_boulevard";
  grid[24][16] = "r32_road_var2_triumphal_boulevard";
  grid[27][14] = "d07_streetlamps_signpost";
  grid[27][16] = "d07_streetlamps_signpost";
  grid[29][14] = "r31_road_var1_tollgate_guardhouse"; // Medieval Tollgate
  grid[29][16] = "r31_road_var1_tollgate_guardhouse";
  grid[30][14] = "b17_twin_gatehouse";                // Majestic Twin Gatehouse
  grid[30][16] = "b17_twin_gatehouse";
  grid[31][14] = "d05_pine_grove";
  grid[31][16] = "d05_pine_grove";

  // Validate every tile
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tid = grid[r][c];
      if (!validTileIds.has(tid)) {
        throw new Error(`Invalid tile ID at [${r}, ${c}]: ${tid}`);
      }
    }
  }

  // Livestock state (all 3 pens populated)
  const livestockState = {
    "6_8": {
      animalCount: 4,
      state: "ready", // Ready to collect eggs!
      feedTime: Date.now() - 60000,
      durationMs: 45000
    },
    "6_11": {
      animalCount: 4,
      state: "producing", // Producing milk!
      feedTime: Date.now() - 30000,
      durationMs: 90000
    },
    "9_8": {
      animalCount: 4,
      state: "hungry", // Hungry sheep waiting for wheat!
      feedTime: 0,
      durationMs: 120000
    }
  };

  // Factory Production State (Ready to collect bubbles)
  const productionState = {
    "7_5": { lastHarvest: 0, ready: true },    // Watermill ready
    "18_5": { lastHarvest: 0, ready: true },   // Windmill ready
    "17_18": { lastHarvest: 0, ready: true },  // Bakery ready
    "17_22": { lastHarvest: 0, ready: true },  // Blacksmith ready
    "21_18": { lastHarvest: 0, ready: true },  // Textile mill ready
    "23_10": { lastHarvest: 0, ready: true },  // Winery press ready
    "9_11": { lastHarvest: 0, ready: true },   // Dairy plant ready
    "26_8": { lastHarvest: 0, ready: true },   // Apple tree ready
    "26_9": { lastHarvest: 0, ready: true },   // Apple tree ready
    "26_11": { lastHarvest: 0, ready: true },  // Coconut palm ready
    "26_12": { lastHarvest: 0, ready: true },  // Coconut palm ready
    "28_8": { lastHarvest: 0, ready: true },   // Tamarind ready
    "28_9": { lastHarvest: 0, ready: true }    // Tamarind ready
  };

  const buildingLevels = {
    "14_15": 3,
    "12_12": 3,
    "12_18": 3,
    "17_18": 2,
    "17_22": 2,
    "18_5": 2,
    "23_10": 2
  };

  const allUnlockedChunks = Array.from({ length: 64 }, (_, i) => i);

  const resources = {
    wheat: 350,
    carrot: 300,
    tomato: 300,
    strawberry: 250,
    corn: 250,
    cabbage: 200,
    pumpkin: 200,
    watermelon: 180,
    grapes: 180,
    sunflower: 150,
    egg: 200,
    milk: 200,
    wool: 150,
    fabric: 150,
    butter: 150,
    bread: 200,
    wine: 150,
    ironTools: 150,
    apple: 200,
    coconut: 180,
    tamarind: 180
  };

  const masterpieceSave = {
    app: "isometric-town-builder",
    version: 2,
    exportedAt: new Date().toISOString(),
    gridSize: { rows: 32, cols: 32 },
    presetName: "masterpiece_medieval_wonderland",
    grid,
    flippedGrid: {},
    constructions: {},
    productionState,
    economy: {
      gameMode: "game",
      playerGold: 999999,
      playerGems: 9999
    },
    storage: {
      siloCapacity: 1000,
      barnCapacity: 1000
    },
    livestockState,
    quests: {
      harvestsCount: 350,
      claimedQuests: {
        quest_harvest_1: true,
        quest_wheat_1: true
      }
    },
    land: {
      unlockedChunks: allUnlockedChunks
    },
    buildingLevels,
    upgradesInProgress: {},
    farmlandState,
    fruitTreesState,
    playerLevel: 25,
    playerXP: 600000,
    orderBoardState: null,
    townVisitors: null,
    resources
  };

  if (!isValidGrid(masterpieceSave.grid)) {
    throw new Error("Grid failed isValidGrid check!");
  }

  return masterpieceSave;
}

const save = buildMasterpieceDevMap();

// Write to root dev-full-village-save.json
const jsonPath = path.resolve(__dirname, "../dev-full-village-save.json");
fs.writeFileSync(jsonPath, JSON.stringify(save, null, 2), "utf8");

// Write to src/data/devSaveData.js
const jsPath = path.resolve(__dirname, "../src/data/devSaveData.js");
fs.writeFileSync(jsPath, `export const DEV_FULL_VILLAGE_SAVE = ${JSON.stringify(save, null, 2)};\n`, "utf8");

console.log("=================================================");
console.log("🏰 MASTERPIECE DEV MAP GENERATED SUCCESSFULLY!");
console.log(`📁 File updated: ${jsonPath}`);
console.log(`📁 Module updated: ${jsPath}`);
console.log(`📊 Grid size: 32x32 (${save.grid.length}x${save.grid[0].length})`);
console.log(`🏰 Unlocked chunks: 64/64 (100% Full Map)`);
console.log(`🌾 Ripe Farmland Plots: ${Object.keys(save.farmlandState).length}`);
console.log(`🏭 Factories Ready: ${Object.keys(save.productionState).length}`);
console.log(`🐔 Livestock Pens: ${Object.keys(save.livestockState).length}`);
console.log("=================================================");
