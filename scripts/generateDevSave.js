// scripts/generateDevSave.js
// Generator for Developer Testing Save (Full Map Unlocked, Complete Buildings & Rich Resources)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TILES_DATA } from "../src/data/tilesData.js";
import { isValidGrid } from "../src/engine/storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validTileIds = new Set(TILES_DATA.map(t => t.id));

function createDevSave() {
  const ROWS = 32;
  const COLS = 32;
  const grid = [];

  // 1. Fill base with lush wildflower meadows
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push("d12_meadow_wildflowers");
    }
    grid.push(row);
  }

  // 2. Thick lush forest border on 4 edges (so no empty void is visible anywhere)
  for (let c = 0; c < COLS; c++) {
    grid[0][c] = (c % 2 === 0) ? "d05_pine_grove" : "d04_oak_tree_park";
    grid[1][c] = (c % 3 === 0) ? "d05_pine_grove" : "d12_meadow_wildflowers";
    grid[ROWS - 2][c] = (c % 3 === 1) ? "d04_oak_tree_park" : "d12_meadow_wildflowers";
    grid[ROWS - 1][c] = (c % 2 === 0) ? "d04_oak_tree_park" : "d05_pine_grove";
  }
  for (let r = 0; r < ROWS; r++) {
    grid[r][0] = (r % 2 === 0) ? "d04_oak_tree_park" : "d05_pine_grove";
    grid[r][1] = (r % 3 === 0) ? "d05_pine_grove" : "d12_meadow_wildflowers";
    grid[r][COLS - 2] = (r % 3 === 1) ? "d04_oak_tree_park" : "d12_meadow_wildflowers";
    grid[r][COLS - 1] = (r % 2 === 0) ? "d05_pine_grove" : "d04_oak_tree_park";
  }

  // 3. Central Axis (Town Hall, Plaza Fountain, Delivery Road)
  // Must respect starter map protected locations:
  grid[14][15] = "b14_town_hall";          // Central Town Hall (14, 15)
  grid[15][15] = "d01_plaza_fountain";     // Central Plaza Fountain + Order Board + Truck (15, 15)
  for (let r = 16; r <= 31; r++) {
    grid[r][15] = "r01_road_straight_ns";  // Main south boulevard out of town
  }

  // 4. Grand Gatehouse at town entrance (Row 30, 14 & 16)
  grid[30][14] = "b17_twin_gatehouse";
  grid[30][16] = "b17_twin_gatehouse";

  // 5. Central Plaza Surrounds & Essential Warehouses
  grid[12][12] = "b13_barn_silo";          // Grain Silo (Nông sản)
  grid[12][18] = "b12_general_store";      // Barn Warehouse (Thành phẩm & Vật tư)
  grid[13][13] = "d07_streetlamps_signpost";
  grid[13][17] = "d07_streetlamps_signpost";
  grid[14][13] = "d03_market_stalls";      // Market stalls left of Town Hall
  grid[14][17] = "d08_stone_statue_plaza"; // Hero statue right of Town Hall
  grid[15][13] = "d02_village_well";       // Wishing well
  grid[15][17] = "d06_cherry_garden";      // Cherry garden right of fountain

  // 6. Primary Road Network connecting districts
  // East-West Central Avenue (Row 16, Cols 6 to 24)
  for (let c = 6; c <= 24; c++) {
    grid[16][c] = "r02_road_straight_ew";
  }
  grid[16][15] = "r03_road_cross";         // Grand crossway at south of fountain

  // North Royal Avenue (Row 5 to 13, Col 15)
  for (let r = 5; r <= 13; r++) {
    if (r !== 14) grid[r][15] = "r01_road_straight_ns";
  }

  // West Farm Avenue (Col 6, Rows 6 to 24)
  for (let r = 6; r <= 24; r++) {
    grid[r][6] = "r01_road_straight_ns";
  }

  // East Workshop Avenue (Col 24, Rows 5 to 28)
  for (let r = 5; r <= 28; r++) {
    grid[r][24] = "r01_road_straight_ns";
  }

  // South Crossway (Row 24, Cols 6 to 24)
  for (let c = 6; c <= 24; c++) {
    grid[24][c] = "r02_road_straight_ew";
  }
  grid[24][15] = "r03_road_cross";
  grid[24][6] = "r03_road_cross";
  grid[24][24] = "r03_road_cross";
  grid[16][6] = "r03_road_cross";
  grid[16][24] = "r03_road_cross";

  // North Crossway (Row 5, Cols 6 to 24)
  for (let c = 6; c <= 24; c++) {
    grid[5][c] = "r02_road_straight_ew";
  }
  grid[5][15] = "r03_road_cross";
  grid[5][6] = "r03_road_cross";
  grid[5][24] = "r03_road_cross";

  // Western Canal & Footbridge (Col 4, Rows 14 to 25)
  for (let r = 14; r <= 25; r++) {
    grid[r][4] = "d11_canal_straight";
  }
  grid[16][4] = "c09_timber_footbridge_ns"; // Wooden footbridge over canal

  // =========================================================================
  // DISTRICT 1: WEST AGRICULTURAL DISTRICT (FARMLAND & MILLS)
  // =========================================================================
  // 16 Farmland Plots in neat rows (Rows 18-21, Cols 8-11)
  const farmlandState = {};
  const cropList = [
    "wheat", "wheat", "carrot", "carrot",
    "tomato", "tomato", "strawberry", "strawberry",
    "corn", "corn", "cabbage", "cabbage",
    "pumpkin", "watermelon", "grapes", "sunflower"
  ];

  let cropIdx = 0;
  for (let r = 18; r <= 21; r++) {
    for (let c = 8; c <= 11; c++) {
      grid[r][c] = "d13_farmland_plot";
      const cropId = cropList[cropIdx++];
      farmlandState[`${r}_${c}`] = {
        seedId: cropId,
        plantTime: Date.now() - 3600000, // Planted 1 hour ago -> 100% Ripe and Ready to Harvest!
        growDurationMs: 30000
      };
    }
  }

  // Empty plots ready for bulk sowing tests (Row 22, Cols 8-11)
  for (let c = 8; c <= 11; c++) {
    grid[22][c] = "d13_farmland_plot";
    // No entry in farmlandState -> Empty plot ready for seed sowing!
  }

  // Agricultural Mills & Farm Cottage
  grid[18][5] = "b04_windmill";            // Windmill (Lúa mì 🌾)
  grid[21][5] = "b05_watermill";           // Watermill by canal (Nước sạch 💧)
  grid[18][13] = "b01_cottage_red";         // Farm cottage
  grid[20][13] = "d10_flower_orchard_hedge";// Flower hedge & beehives
  grid[22][13] = "d02_village_well";        // Stone well

  // =========================================================================
  // DISTRICT 2: NORTH-WEST LIVESTOCK DISTRICT
  // =========================================================================
  grid[7][8] = "b21_chicken_coop";          // Chicken Coop 🐔
  grid[7][12] = "b22_cow_pasture";          // Cow Pasture 🐮
  grid[10][8] = "b57_sheep_pasture";        // Sheep Pasture 🐑
  grid[10][12] = "b59_dairy_factory";       // Dairy Factory 🧈
  grid[7][10] = "d07_streetlamps_signpost";
  grid[10][10] = "d10_flower_orchard_hedge";

  const livestockState = {
    "7_8": {
      animalCount: 4,                       // 4 hens
      state: "ready",                       // Ready to harvest fresh eggs!
      feedTime: Date.now() - 60000,
      durationMs: 45000
    },
    "7_12": {
      animalCount: 4,                       // 4 cows
      state: "producing",                   // Currently digesting and making milk!
      feedTime: Date.now() - 20000,
      durationMs: 90000
    },
    "10_8": {
      animalCount: 4,                       // 4 sheep
      state: "hungry",                      // Hungry, waiting for wheat!
      feedTime: 0,
      durationMs: 120000
    }
  };

  // =========================================================================
  // DISTRICT 3: EAST INDUSTRIAL & ARTISAN DISTRICT
  // =========================================================================
  grid[18][18] = "b06_bakery";              // Bakery 🍞
  grid[18][22] = "b03_blacksmith_forge";    // Blacksmith Forge ⚒️
  grid[20][18] = "b58_textile_mill";        // Textile Mill 🧶
  grid[20][22] = "b48_winery_press_barn_se";// Winery Cellar & Press 🍷
  grid[22][18] = "b11_carpenter_sawmill";   // Carpenter Sawmill 🪵
  grid[22][22] = "d09_merchant_cart_camp";  // Merchant Cart Camp ⛺
  grid[19][20] = "d07_streetlamps_signpost";
  grid[21][20] = "d03_market_stalls";

  // =========================================================================
  // DISTRICT 4: NORTH CIVIC & ROYAL DISTRICT
  // =========================================================================
  grid[6][15] = "b45_clocktower_guildhall_sw"; // Clocktower Guildhall
  grid[6][18] = "b20_noble_manor";             // Noble Manor
  grid[6][21] = "b15_library_scholar";         // Royal Library
  grid[9][18] = "b09_chapel";                  // Stone Chapel
  grid[9][21] = "b02_tudor_inn";               // Tudor Inn
  grid[11][18] = "b49_amphitheater_stage_sw";  // Outdoor Amphitheater
  grid[11][21] = "b18_greenhouse_orangery";    // Royal Orangery
  grid[8][15] = "d07_streetlamps_signpost";
  grid[10][15] = "d08_stone_statue_plaza";
  grid[8][19] = "d06_cherry_garden";
  grid[10][20] = "d06_cherry_garden";

  // =========================================================================
  // DISTRICT 5: SOUTH-WEST ORCHARD & NATURE RESERVE
  // =========================================================================
  grid[26][8] = "d21_apple_tree";           // Apple Tree 🍎
  grid[26][9] = "d21_apple_tree";           // Apple Tree 🍎
  grid[26][11] = "d22_coconut_palm";        // Coconut Palm 🥥
  grid[26][12] = "d22_coconut_palm";        // Coconut Palm 🥥
  grid[28][8] = "d23_tamarind_tree";        // Tamarind Tree 🥜
  grid[28][9] = "d23_tamarind_tree";        // Tamarind Tree 🥜
  grid[28][11] = "d04_oak_tree_park";
  grid[28][12] = "d05_pine_grove";
  grid[27][10] = "d02_village_well";

  const fruitTreesState = {
    "26_8": { lastHarvest: 0 },
    "26_9": { lastHarvest: 0 },
    "26_11": { lastHarvest: 0 },
    "26_12": { lastHarvest: 0 },
    "28_8": { lastHarvest: 0 },
    "28_9": { lastHarvest: 0 }
  };

  // =========================================================================
  // DISTRICT 6: SOUTH-EAST RESIDENTIAL, ACADEMY & DEFENSE DISTRICT
  // =========================================================================
  grid[26][18] = "b23_mediterranean_villa_sw"; // Mediterranean Villa
  grid[26][21] = "b10_wizard_tower";          // Wizard Tower 🔮
  grid[28][18] = "b16_alchemist_workshop";    // Alchemist Workshop 🧪
  grid[28][21] = "b08_watchtower";            // Watchtower 🏹
  grid[26][13] = "b07_apothecary";            // Herbal Apothecary 🌿
  grid[27][19] = "d07_streetlamps_signpost";
  grid[29][19] = "d06_cherry_garden";

  // Streetlamps along the South Main Boulevard (Row 16 to 30, Col 16)
  grid[17][16] = "d07_streetlamps_signpost";
  grid[20][16] = "d07_streetlamps_signpost";
  grid[23][16] = "d07_streetlamps_signpost";
  grid[26][16] = "d07_streetlamps_signpost";
  grid[29][16] = "d07_streetlamps_signpost";

  // =========================================================================
  // PRODUCTION STATES FOR FACTORIES (Ready to test harvest bubbles!)
  // =========================================================================
  const productionState = {
    "18_5": { lastHarvest: 0, ready: true },    // Windmill ready
    "21_5": { lastHarvest: 0, ready: true },    // Watermill ready
    "18_18": { lastHarvest: 0, ready: true },   // Bakery ready
    "18_22": { lastHarvest: 0, ready: true },   // Forge ready
    "20_18": { lastHarvest: 0, ready: true },   // Textile mill ready
    "20_22": { lastHarvest: 0, ready: true },   // Winery press ready
    "10_12": { lastHarvest: 0, ready: true },   // Dairy plant ready
    "26_8": { lastHarvest: 0, ready: true },    // Apple tree ready
    "26_9": { lastHarvest: 0, ready: true },    // Apple tree ready
    "26_11": { lastHarvest: 0, ready: true },   // Coconut palm ready
    "26_12": { lastHarvest: 0, ready: true },   // Coconut palm ready
    "28_8": { lastHarvest: 0, ready: true },    // Tamarind ready
    "28_9": { lastHarvest: 0, ready: true }     // Tamarind ready
  };

  // Building Levels
  const buildingLevels = {
    "14_15": 3, // Town Hall Lv 3
    "12_12": 3, // Silo Lv 3
    "12_18": 3, // Barn Lv 3
    "18_18": 2, // Bakery Lv 2
    "18_22": 2, // Forge Lv 2
    "18_5": 2,  // Windmill Lv 2
    "20_22": 2  // Winery Lv 2
  };

  // Validate every tile in grid
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tid = grid[r][c];
      if (!validTileIds.has(tid)) {
        throw new Error(`Invalid tile ID at [${r}, ${c}]: ${tid}`);
      }
    }
  }

  // 64 Chunks completely unlocked (0 to 63)
  const allUnlockedChunks = Array.from({ length: 64 }, (_, i) => i);

  // Full Rich Dev Inventory
  const resources = {
    wheat: 300,
    carrot: 250,
    tomato: 250,
    strawberry: 200,
    corn: 200,
    cabbage: 150,
    pumpkin: 150,
    watermelon: 120,
    grapes: 120,
    sunflower: 100,
    egg: 150,
    milk: 150,
    wool: 100,
    fabric: 100,
    butter: 100,
    bread: 150,
    wine: 100,
    ironTools: 120,
    apple: 150,
    coconut: 120,
    tamarind: 120
  };

  const devSavePayload = {
    app: "isometric-town-builder",
    version: 2,
    exportedAt: new Date().toISOString(),
    gridSize: { rows: 32, cols: 32 },
    presetName: "dev_full_wonderland",
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
      harvestsCount: 250,
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

  if (!isValidGrid(devSavePayload.grid)) {
    throw new Error("Generated grid failed isValidGrid validation!");
  }

  return devSavePayload;
}

const devSave = createDevSave();
const outputPath = path.resolve(__dirname, "../dev-full-village-save.json");
fs.writeFileSync(outputPath, JSON.stringify(devSave, null, 2), "utf8");

console.log("=================================================");
console.log("🎉 Dev Save JSON created successfully!");
console.log(`📁 File path: ${outputPath}`);
console.log(`📊 Grid size: ${devSave.grid.length}x${devSave.grid[0].length}`);
console.log(`🏰 Unlocked chunks: ${devSave.land.unlockedChunks.length}/64 (100% Full Map)`);
console.log(`🪙 Gold: ${devSave.economy.playerGold.toLocaleString()}`);
console.log(`💎 Gems: ${devSave.economy.playerGems.toLocaleString()}`);
console.log(`⭐ Level: ${devSave.playerLevel} (XP: ${devSave.playerXP.toLocaleString()})`);
console.log(`🌾 Ripe Farmland Plots: ${Object.keys(devSave.farmlandState).length}`);
console.log(`🏭 Production Buildings Ready: ${Object.keys(devSave.productionState).length}`);
console.log(`🐔 Livestock Pens: ${Object.keys(devSave.livestockState).length}`);
console.log("=================================================");
