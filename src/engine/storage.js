// Storage service for game persistence and JSON export/import (Save v3)
import { INITIAL_GOLD, INITIAL_GEMS } from "../data/gameEconomy.js";
import { INITIAL_UNLOCKED_CHUNKS } from "../data/landConfig.js";
import { expandGrid16to32 } from "./isoMath.js";
import { createStarterTownMap32, getStarterFarmlandState } from "../data/starterMap.js";

export const SAVE_VERSION = 3;
export const STORAGE_KEY_V3 = 'isometric_town_builder_save_v3';
export const STORAGE_KEY_V2 = 'isometric_town_builder_save_v3'; // Alias backward compatibility
export const STORAGE_KEY = STORAGE_KEY_V3;

// Legacy keys for migration & cleanup
export const LEGACY_KEYS = {
  SAVE_V2: 'isometric_town_builder_save_v2',
  SAVE_V1: 'isometric_town_builder_save_v1',
  SAVED_MAP: 'isometric_town_builder_saved_map',
  GAME: 'isometric_town_builder_game_v1',
  PRODUCTION: 'isometric_town_builder_production_v1',
  FLIPPED: 'isometric_town_builder_flipped_v1',
  CONSTRUCTIONS: 'isometric_town_builder_constructions_v1',
  QUESTS: 'isometric_town_builder_quests_v1'
};

/**
 * Dọn sạch các save và cờ phiên bản cũ (v1, v2) khi người chơi bắt đầu phiên bản v3
 */
export function cleanOldSavesForV3() {
  try {
    Object.values(LEGACY_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('town_builder_achievements_claimed_v1');
    localStorage.removeItem('town_builder_tutorial_completed');
    localStorage.removeItem('town_builder_tutorial_rewarded');
    localStorage.removeItem('town_builder_tutorial_step');
    localStorage.removeItem('town_builder_level_tutorials_shown_v1');
    localStorage.removeItem('town_builder_v3_empty_land_start');
  } catch (e) {}
}

/**
 * Validate that a grid is a 16x16 or 32x32 array of non-empty string IDs
 */
export function isValidGrid(grid) {
  if (!Array.isArray(grid)) return false;
  const size = grid.length;
  if (size !== 16 && size !== 32) return false;
  for (let r = 0; r < size; r++) {
    if (!Array.isArray(grid[r]) || grid[r].length !== size) return false;
    for (let c = 0; c < size; c++) {
      if (typeof grid[r][c] !== 'string' || grid[r][c].length === 0) return false;
    }
  }
  return true;
}

/**
 * Ensure grid is expanded to 32x32
 */
export function ensureGrid32(grid) {
  if (!isValidGrid(grid)) return null;
  if (grid.length === 16) {
    return expandGrid16to32(grid);
  }
  return grid;
}

/**
 * Check if map contains the Town Hall center
 */
export function hasTownHall(grid) {
  if (!grid || !Array.isArray(grid)) return false;
  return grid.some(row => Array.isArray(row) && row.includes('b14_town_hall'));
}

/**
 * Default empty game save state structure
 */
export function getDefaultSaveState(defaultGrid) {
  const normGrid = (defaultGrid && defaultGrid.length === 16) 
    ? expandGrid16to32(defaultGrid) 
    : (defaultGrid || createStarterTownMap32());
  return {
    version: SAVE_VERSION,
    savedAt: Date.now(),
    presetName: 'custom',
    grid: normGrid,
    flippedGrid: {},
    constructions: {},
    productionState: {},
    economy: {
      gameMode: 'game',
      playerGold: INITIAL_GOLD,
      playerGems: INITIAL_GEMS
    },
    storage: {
      siloCapacity: 100,
      barnCapacity: 100,
      warehouseCapacity: 300
    },
    livestockState: {},
    quests: {
      harvestsCount: 0,
      claimedQuests: {}
    },
    land: {
      unlockedChunks: [...INITIAL_UNLOCKED_CHUNKS]
    },
    buildingLevels: {},
    upgradesInProgress: {},
    farmlandState: getStarterFarmlandState(),
    fruitTreesState: {},
    playerLevel: 1,
    playerXP: 0,
    townEvent: null,
    orderBoard: null,
    orderBoardState: null,
    townVisitors: null,
    townCaretaker: null,
    harborShip: null,
    harborShipState: null,
    kingdomWonders: {
      royal_palace: 0,
      ocean_library: 0,
      poseidon_statue: 0
    },
    wonderSites: null,
    dailyWheel: null,
    activeSeason: 'summer',
    resources: {
      wheat: 0,
      bread: 0,
      ironTools: 0
    }
  };
}

/**
 * Migrate legacy multi-key storage into single Save v2
 */
export function migrateLegacyStorage(fallbackGrid) {
  try {
    let hasLegacy = false;
    let grid = null;
    let presetName = 'custom';

    // 1. Grid
    const v1Raw = localStorage.getItem(LEGACY_KEYS.SAVE_V1);
    const mapRaw = localStorage.getItem(LEGACY_KEYS.SAVED_MAP);
    if (v1Raw) {
      hasLegacy = true;
      try {
        const parsed = JSON.parse(v1Raw);
        if (parsed && isValidGrid(parsed.grid)) {
          grid = parsed.grid;
          if (parsed.presetName) presetName = parsed.presetName;
        }
      } catch (e) {}
    } else if (mapRaw) {
      hasLegacy = true;
      try {
        const parsed = JSON.parse(mapRaw);
        if (isValidGrid(parsed)) grid = parsed;
        else if (parsed && isValidGrid(parsed.grid)) grid = parsed.grid;
      } catch (e) {}
    }

    if (!grid) grid = fallbackGrid;

    // 2. Economy
    let gameMode = 'sandbox';
    let playerGold = INITIAL_GOLD;
    const gameRaw = localStorage.getItem(LEGACY_KEYS.GAME);
    if (gameRaw) {
      hasLegacy = true;
      try {
        const parsed = JSON.parse(gameRaw);
        if (parsed.gameMode) gameMode = parsed.gameMode;
        if (typeof parsed.playerGold === 'number') playerGold = parsed.playerGold;
      } catch (e) {}
    }

    // 3. Flipped grid
    let flippedGrid = {};
    const flippedRaw = localStorage.getItem(LEGACY_KEYS.FLIPPED);
    if (flippedRaw) {
      hasLegacy = true;
      try {
        flippedGrid = JSON.parse(flippedRaw) || {};
      } catch (e) {}
    }

    // 4. Constructions
    let constructions = {};
    const constrRaw = localStorage.getItem(LEGACY_KEYS.CONSTRUCTIONS);
    if (constrRaw) {
      hasLegacy = true;
      try {
        constructions = JSON.parse(constrRaw) || {};
      } catch (e) {}
    }

    // 5. Production
    let productionState = {};
    const prodRaw = localStorage.getItem(LEGACY_KEYS.PRODUCTION);
    if (prodRaw) {
      hasLegacy = true;
      try {
        productionState = JSON.parse(prodRaw) || {};
      } catch (e) {}
    }

    // 6. Quests
    let harvestsCount = 0;
    let claimedQuests = {};
    const questsRaw = localStorage.getItem(LEGACY_KEYS.QUESTS);
    if (questsRaw) {
      hasLegacy = true;
      try {
        const parsed = JSON.parse(questsRaw);
        if (typeof parsed.harvestsCount === 'number') harvestsCount = parsed.harvestsCount;
        if (parsed.claimedQuests) claimedQuests = parsed.claimedQuests;
      } catch (e) {}
    }

    if (!hasLegacy) return null;

    const migratedState = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      presetName,
      grid,
      flippedGrid,
      constructions,
      productionState,
      economy: {
        gameMode,
        playerGold
      },
      quests: {
        harvestsCount,
        claimedQuests
      },
      land: {
        unlockedChunks: [...INITIAL_UNLOCKED_CHUNKS]
      },
      resources: {
        wheat: 0,
        bread: 0,
        ironTools: 0
      }
    };

    // Save to v2 (do not remove legacy keys yet for safety)
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migratedState));
    console.info('[Storage] Migrated legacy multi-key saves to Save v2 successfully.');
    return migratedState;
  } catch (err) {
    console.warn('[Storage] Migration failed:', err);
    return null;
  }
}

/**
 * Load entire game save safely (Save v3)
 */
export function loadGameSave(fallbackGrid) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V3);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === SAVE_VERSION && isValidGrid(parsed.grid)) {
        let unlocked = Array.isArray(parsed.land?.unlockedChunks) ? parsed.land.unlockedChunks : [...INITIAL_UNLOCKED_CHUNKS];
        if (unlocked.length === 4 && unlocked[0] === 5 && unlocked[3] === 10) {
          unlocked = [...INITIAL_UNLOCKED_CHUNKS];
        }
        let grid = ensureGrid32(parsed.grid);
        let farmland = (parsed.farmlandState && typeof parsed.farmlandState === 'object') ? parsed.farmlandState : {};
        // Tự động dọn các ô đất bị lưu sai định dạng (thiếu seedId) để người chơi có thể nhấp vào gieo hạt bình thường
        for (const [k, f] of Object.entries(farmland)) {
          if (!f || typeof f !== 'object' || !f.seedId) {
            delete farmland[k];
          }
        }
        // Dãy [x,4]: đổi bờ biển chuyển tiếp cũ sang cát mịn.
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === "m01_sandy_beach_s") grid[r][c] = "s13_sand_ground";
          }
        }
        if (!hasTownHall(grid)) {
          grid = createStarterTownMap32();
          farmland = getStarterFarmlandState();
        }

        return {
          version: SAVE_VERSION,
          savedAt: parsed.savedAt || Date.now(),
          presetName: parsed.presetName || 'custom',
          grid,
          flippedGrid: (parsed.flippedGrid && typeof parsed.flippedGrid === 'object') ? parsed.flippedGrid : {},
          constructions: (parsed.constructions && typeof parsed.constructions === 'object') ? parsed.constructions : {},
          productionState: (parsed.productionState && typeof parsed.productionState === 'object') ? parsed.productionState : {},
          economy: {
            gameMode: parsed.economy?.gameMode || 'game',
            playerGold: typeof parsed.economy?.playerGold === 'number' ? parsed.economy.playerGold : INITIAL_GOLD,
            playerGems: typeof parsed.economy?.playerGems === 'number' ? parsed.economy.playerGems : INITIAL_GEMS
          },
          storage: {
            siloCapacity: typeof parsed.storage?.siloCapacity === 'number' ? parsed.storage.siloCapacity : 100,
            barnCapacity: typeof parsed.storage?.barnCapacity === 'number' ? parsed.storage.barnCapacity : 100,
            warehouseCapacity: typeof parsed.storage?.warehouseCapacity === 'number' ? parsed.storage.warehouseCapacity : undefined
          },
          livestockState: (parsed.livestockState && typeof parsed.livestockState === 'object') ? parsed.livestockState : {},
          quests: {
            harvestsCount: typeof parsed.quests?.harvestsCount === 'number' ? parsed.quests.harvestsCount : 0,
            claimedQuests: parsed.quests?.claimedQuests || {}
          },
          land: {
            unlockedChunks: unlocked
          },
          buildingLevels: (parsed.buildingLevels && typeof parsed.buildingLevels === 'object') ? parsed.buildingLevels : {},
          upgradesInProgress: (parsed.upgradesInProgress && typeof parsed.upgradesInProgress === 'object') ? parsed.upgradesInProgress : {},
          farmlandState: farmland,
          fruitTreesState: (parsed.fruitTreesState && typeof parsed.fruitTreesState === 'object') ? parsed.fruitTreesState : {},
          playerLevel: typeof parsed.playerLevel === 'number' ? parsed.playerLevel : 1,
          playerXP: typeof parsed.playerXP === 'number' ? parsed.playerXP : 0,
          townEvent: (parsed.townEvent && typeof parsed.townEvent === 'object' && typeof parsed.townEvent.endsAt === 'number')
            ? parsed.townEvent
            : null,
          orderBoard: (parsed.orderBoard && typeof parsed.orderBoard === 'object')
            ? parsed.orderBoard
            : ((parsed.orderBoardState && typeof parsed.orderBoardState === 'object') ? parsed.orderBoardState : null),
          orderBoardState: (parsed.orderBoardState && typeof parsed.orderBoardState === 'object')
            ? parsed.orderBoardState
            : ((parsed.orderBoard && typeof parsed.orderBoard === 'object') ? parsed.orderBoard : null),
          townVisitors: (parsed.townVisitors && typeof parsed.townVisitors === 'object')
            ? parsed.townVisitors
            : null,
          townCaretaker: (parsed.townCaretaker && typeof parsed.townCaretaker === 'object')
            ? parsed.townCaretaker
            : null,
          harborShip: (parsed.harborShip && typeof parsed.harborShip === 'object')
            ? parsed.harborShip
            : ((parsed.harborShipState && typeof parsed.harborShipState === 'object') ? parsed.harborShipState : null),
          harborShipState: (parsed.harborShipState && typeof parsed.harborShipState === 'object')
            ? parsed.harborShipState
            : ((parsed.harborShip && typeof parsed.harborShip === 'object') ? parsed.harborShip : null),
          kingdomWonders: (parsed.kingdomWonders && typeof parsed.kingdomWonders === 'object')
            ? parsed.kingdomWonders
            : null,
          wonderSites: (parsed.wonderSites && typeof parsed.wonderSites === 'object')
            ? parsed.wonderSites
            : null,
          dailyWheel: (parsed.dailyWheel && typeof parsed.dailyWheel === 'object')
            ? parsed.dailyWheel
            : null,
          activeSeason: typeof parsed.activeSeason === 'string'
            ? parsed.activeSeason
            : 'summer',
          achievements: (parsed.achievements && typeof parsed.achievements === 'object') ? parsed.achievements : null,
          resources: (parsed.resources && typeof parsed.resources === 'object')
            ? { ...parsed.resources }
            : { wheat: 0, bread: 0, ironTools: 0 }
        };
      }
    }

    // Nếu không có Save v3 (người chơi mới hoặc thiết bị bạn bè từng chơi v1/v2):
    // Dọn dẹp save cũ và trả về null để game tự khởi tạo mới ở Level 1, 500 Vàng, Hướng dẫn đầy đủ
    cleanOldSavesForV3();
    return null;
  } catch (err) {
    console.warn('[Storage] loadGameSave failed:', err);
    return null;
  }
}

/**
 * Save entire game state to localStorage safely (Save v3)
 */
export function saveGameSave(state) {
  if (!state || !isValidGrid(state.grid)) return false;
  try {
    const payload = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      presetName: state.presetName || 'custom',
      grid: state.grid,
      flippedGrid: state.flippedGrid || {},
      constructions: state.constructions || {},
      productionState: state.productionState || {},
      economy: {
        gameMode: state.economy?.gameMode || 'game',
        playerGold: typeof state.economy?.playerGold === 'number' ? state.economy.playerGold : INITIAL_GOLD,
        playerGems: typeof state.economy?.playerGems === 'number' ? state.economy.playerGems : INITIAL_GEMS
      },
      storage: {
        siloCapacity: typeof state.storage?.siloCapacity === 'number' ? state.storage.siloCapacity : 100,
        barnCapacity: typeof state.storage?.barnCapacity === 'number' ? state.storage.barnCapacity : 100,
        // Sức chứa Kho Tổng Hợp: bắt buộc phải lưu, nếu không mọi nâng cấp kho sẽ mất khi reload.
        warehouseCapacity: typeof state.storage?.warehouseCapacity === 'number' ? state.storage.warehouseCapacity : undefined
      },
      livestockState: state.livestockState || {},
      quests: {
        harvestsCount: typeof state.quests?.harvestsCount === 'number' ? state.quests.harvestsCount : 0,
        claimedQuests: state.quests?.claimedQuests || {}
      },
      land: {
        unlockedChunks: Array.isArray(state.land?.unlockedChunks) ? state.land.unlockedChunks : [...INITIAL_UNLOCKED_CHUNKS]
      },
      buildingLevels: state.buildingLevels || {},
      upgradesInProgress: state.upgradesInProgress || {},
      farmlandState: state.farmlandState || {},
      fruitTreesState: state.fruitTreesState || {},
      playerLevel: typeof state.playerLevel === 'number' ? state.playerLevel : 1,
      playerXP: typeof state.playerXP === 'number' ? state.playerXP : 0,
      townEvent: (state.townEvent && typeof state.townEvent === 'object' && typeof state.townEvent.endsAt === 'number')
        ? state.townEvent
        : null,
      orderBoard: state.orderBoard || state.orderBoardState || null,
      orderBoardState: state.orderBoard || state.orderBoardState || null,
      townVisitors: state.townVisitors || null,
      townCaretaker: state.townCaretaker || null,
      harborShip: state.harborShip || state.harborShipState || null,
      harborShipState: state.harborShip || state.harborShipState || null,
      kingdomWonders: state.kingdomWonders || null,
      wonderSites: state.wonderSites || null,
      dailyWheel: state.dailyWheel || null,
      activeSeason: state.activeSeason || 'summer',
      achievements: (state.achievements && typeof state.achievements === 'object') ? state.achievements : null,
      resources: (state.resources && typeof state.resources === 'object')
        ? { ...state.resources }
        : { wheat: 0, bread: 0, ironTools: 0 }
    };
    localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('[Storage] saveGameSave failed (storage full or blocked):', err);
    return false;
  }
}

/**
 * Clear saved state from localStorage
 */
export function clearStorageMap() {
  try {
    localStorage.removeItem(STORAGE_KEY_V3);
    cleanOldSavesForV3();
  } catch (err) {
    console.warn('[Storage] clear failed:', err);
  }
}

/**
 * Export full game progress to JSON file
 */
export function exportGameToJSON(state, filename = 'isometric-town-progress.json') {
  if (!state || !isValidGrid(state.grid)) {
    throw new Error('Dữ liệu game không hợp lệ để xuất');
  }
  const payload = {
    app: 'isometric-town-builder',
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    gridSize: { rows: 32, cols: 32 },
    presetName: state.presetName || 'custom',
    grid: state.grid,
    flippedGrid: state.flippedGrid || {},
    constructions: state.constructions || {},
    productionState: state.productionState || {},
    economy: {
      gameMode: state.economy?.gameMode || 'game',
      playerGold: typeof state.economy?.playerGold === 'number' ? state.economy.playerGold : INITIAL_GOLD,
      playerGems: typeof state.economy?.playerGems === 'number' ? state.economy.playerGems : INITIAL_GEMS
    },
    storage: {
      siloCapacity: typeof state.storage?.siloCapacity === 'number' ? state.storage.siloCapacity : 100,
      barnCapacity: typeof state.storage?.barnCapacity === 'number' ? state.storage.barnCapacity : 100
    },
    livestockState: state.livestockState || {},
    quests: {
      harvestsCount: typeof state.quests?.harvestsCount === 'number' ? state.quests.harvestsCount : 0,
      claimedQuests: state.quests?.claimedQuests || {}
    },
    land: {
      unlockedChunks: Array.isArray(state.land?.unlockedChunks) ? state.land.unlockedChunks : [...INITIAL_UNLOCKED_CHUNKS]
    },
    buildingLevels: state.buildingLevels || {},
    upgradesInProgress: state.upgradesInProgress || {},
    farmlandState: state.farmlandState || {},
    playerLevel: state.playerLevel || 1,
    playerXP: state.playerXP || 0,
    orderBoard: state.orderBoard || state.orderBoardState || null,
    orderBoardState: state.orderBoard || state.orderBoardState || null,
    townVisitors: state.townVisitors || null,
    townCaretaker: state.townCaretaker || null,
    harborShip: state.harborShip || state.harborShipState || null,
    kingdomWonders: state.kingdomWonders || null,
    wonderSites: state.wonderSites || null,
    dailyWheel: state.dailyWheel || null,
    activeSeason: state.activeSeason || 'summer',
    achievements: (state.achievements && typeof state.achievements === 'object') ? state.achievements : null,
    resources: (state.resources && typeof state.resources === 'object')
      ? { ...state.resources }
      : { wheat: 0, bread: 0, ironTools: 0 }
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Import and parse full game save from JSON file
 * Supports both v2 full-state format and legacy v1/grid-only format
 */
export function importGameFromJSON(file, currentFallbackGrid) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Vui lòng chọn một file JSON để nạp'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          reject(new Error('Cú pháp file không đúng định dạng JSON: ' + parseErr.message));
          return;
        }

        if (!data || typeof data !== 'object') {
          reject(new Error('Nội dung file JSON rỗng hoặc không hợp lệ'));
          return;
        }

        // Case 1: Pure 16x16 2D array
        if (isValidGrid(data)) {
          resolve(getDefaultSaveState(data));
          return;
        }

        // Case 2: Save v1 or object with only grid
        if (data.grid && isValidGrid(data.grid) && (!data.version || data.version === 1)) {
          const state = getDefaultSaveState(data.grid);
          if (data.presetName) state.presetName = data.presetName;
          resolve(state);
          return;
        }

        // Case 3: Save v2 (full game save)
        if (data.grid && isValidGrid(data.grid)) {
          const normalized = {
            version: SAVE_VERSION,
            savedAt: data.savedAt || Date.now(),
            presetName: data.presetName || 'custom',
            grid: ensureGrid32(data.grid),
            flippedGrid: (data.flippedGrid && typeof data.flippedGrid === 'object') ? data.flippedGrid : {},
            constructions: (data.constructions && typeof data.constructions === 'object') ? data.constructions : {},
            productionState: (data.productionState && typeof data.productionState === 'object') ? data.productionState : {},
            economy: {
              gameMode: data.economy?.gameMode === 'game' ? 'game' : 'sandbox',
              playerGold: typeof data.economy?.playerGold === 'number' ? data.economy.playerGold : INITIAL_GOLD,
              playerGems: typeof data.economy?.playerGems === 'number' ? data.economy.playerGems : INITIAL_GEMS
            },
            storage: {
              siloCapacity: typeof data.storage?.siloCapacity === 'number' ? data.storage.siloCapacity : 100,
              barnCapacity: typeof data.storage?.barnCapacity === 'number' ? data.storage.barnCapacity : 100,
              warehouseCapacity: typeof data.storage?.warehouseCapacity === 'number' ? data.storage.warehouseCapacity : undefined
            },
            livestockState: (data.livestockState && typeof data.livestockState === 'object') ? data.livestockState : {},
            quests: {
              harvestsCount: typeof data.quests?.harvestsCount === 'number' ? data.quests.harvestsCount : 0,
              claimedQuests: (data.quests?.claimedQuests && typeof data.quests.claimedQuests === 'object') ? data.quests.claimedQuests : {}
            },
            land: {
              unlockedChunks: Array.isArray(data.land?.unlockedChunks) ? data.land.unlockedChunks : [...INITIAL_UNLOCKED_CHUNKS]
            },
            buildingLevels: (data.buildingLevels && typeof data.buildingLevels === 'object') ? data.buildingLevels : {},
            upgradesInProgress: (data.upgradesInProgress && typeof data.upgradesInProgress === 'object') ? data.upgradesInProgress : {},
            farmlandState: (data.farmlandState && typeof data.farmlandState === 'object') ? data.farmlandState : {},
            fruitTreesState: (data.fruitTreesState && typeof data.fruitTreesState === 'object') ? data.fruitTreesState : {},
            playerLevel: typeof data.playerLevel === 'number' ? data.playerLevel : 1,
            playerXP: typeof data.playerXP === 'number' ? data.playerXP : 0,
            townEvent: (data.townEvent && typeof data.townEvent === 'object' && typeof data.townEvent.endsAt === 'number') ? data.townEvent : null,
            orderBoard: (data.orderBoard && typeof data.orderBoard === 'object') ? data.orderBoard : ((data.orderBoardState && typeof data.orderBoardState === 'object') ? data.orderBoardState : null),
            orderBoardState: (data.orderBoardState && typeof data.orderBoardState === 'object') ? data.orderBoardState : ((data.orderBoard && typeof data.orderBoard === 'object') ? data.orderBoard : null),
            townVisitors: (data.townVisitors && typeof data.townVisitors === 'object') ? data.townVisitors : null,
            townCaretaker: (data.townCaretaker && typeof data.townCaretaker === 'object') ? data.townCaretaker : null,
            harborShip: (data.harborShip && typeof data.harborShip === 'object') ? data.harborShip : ((data.harborShipState && typeof data.harborShipState === 'object') ? data.harborShipState : null),
            harborShipState: (data.harborShipState && typeof data.harborShipState === 'object') ? data.harborShipState : ((data.harborShip && typeof data.harborShip === 'object') ? data.harborShip : null),
            kingdomWonders: (data.kingdomWonders && typeof data.kingdomWonders === 'object') ? data.kingdomWonders : null,
            wonderSites: (data.wonderSites && typeof data.wonderSites === 'object') ? data.wonderSites : null,
            dailyWheel: (data.dailyWheel && typeof data.dailyWheel === 'object') ? data.dailyWheel : null,
            activeSeason: typeof data.activeSeason === 'string' ? data.activeSeason : 'summer',
            achievements: (data.achievements && typeof data.achievements === 'object') ? data.achievements : null,
            resources: (data.resources && typeof data.resources === 'object')
              ? { ...data.resources }
              : { wheat: 0, bread: 0, ironTools: 0 }
          };
          resolve(normalized);
          return;
        }

        reject(new Error('File JSON không chứa dữ liệu bản đồ hợp lệ (cần lưới 16x16 hoặc 32x32)'));
      } catch (err) {
        reject(new Error('Không thể xử lý file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi trong quá trình đọc file từ thiết bị'));
    reader.readAsText(file);
  });
}

// Backward compatibility aliases
export const saveMapToStorage = (grid, preset = 'custom') => saveGameSave({ grid, presetName: preset });
export const loadMapFromStorage = () => loadGameSave(null);
export const exportMapToJSON = (grid, filename) => exportGameToJSON({ grid }, filename);
export const importMapFromJSON = (file) => importGameFromJSON(file).then(s => s.grid);
