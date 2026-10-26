import {
  INITIAL_GOLD, INITIAL_GEMS, getGemSpeedupCost, getTileCost, getTileBuildDuration, PRODUCTION_BUILDINGS,
  calculateVillageStats, getTilePopulation, getTileRequiredLevel,
  PLAYER_LEVEL_CONFIG, getLevelXpRequirement, getPlayerLevelTitle,
  getBuildingYield, getBuildingInputReq, MAX_PLAYER_LEVEL,
  getMaxPenCount, getNextPenUnlockInfo
} from "./data/gameEconomy.js";
import { QUESTS_CONFIG, QUEST_CHAPTERS, isQuestUnlocked, getQuestById } from "./data/questsData.js";
import { loadGameSave, saveGameSave, exportGameToJSON, importGameFromJSON, getDefaultSaveState, cleanOldSavesForV3 } from "./engine/storage.js";
import { TILE_ANIM_URIS, ENTITY_SPRITES, TILE_DATA_URIS } from "./data/sprites.js";
import { TILES_DATA, PRESETS } from "./data/tilesData.js";
import {
  ROWS, COLS, HALF_W, QUARTER_W, PAD, ORIGIN_X, ORIGIN_Y,
  WORLD_CENTER_X, WORLD_CENTER_Y, screenToWorld, worldToCell,
  isTileInViewport, expandGrid16to32, createEmptyGrid32
} from "./engine/isoMath.js";
import {
  CHUNK_SIZE, CHUNKS_PER_AXIS, TOTAL_CHUNKS, INITIAL_UNLOCKED_CHUNKS,
  getChunkId, getChunkBounds, isCellUnlocked, isChunkAdjacentToUnlocked, getNextChunkPrice, getNextChunkCost
} from "./data/landConfig.js";
import {
  RESOURCE_MAX_CAPACITY, RESOURCES_CONFIG, RESOURCE_CHAINS,
  isSiloResource, isBarnResource, getSiloUsed, getBarnUsed, SILO_RESOURCE_IDS, BARN_RESOURCE_IDS
} from "./data/resourcesConfig.js";
import {
  MAX_BUILDING_LEVEL, UPGRADES_CONFIG, getNextUpgrade, getBuildingLevelPopulation
} from "./data/upgradesConfig.js";
import { CROPS_CONFIG } from "./data/cropsConfig.js";
import { FRUIT_TREES_CONFIG } from "./data/resourcesConfig.js";
import { VillagerManager, VILLAGER_DIALOGUES_BY_ROLE } from "./engine/villagers.js";
import { PetManager } from "./engine/pets.js";
import {
  initAudio, toggleMute, setMasterVolume, setBgmVolume, setSfxVolume, getAudioState,
  playCoinSound, playBuildSound, playDemolishSound, playRotateSound, playUpgradeSound,
  playBlacksmithSound, playWindmillSound, playWatermillSound, playBirdSound,
  playVillagerSpeakSound, playQuestRewardSound, playUIClickSound, playTileSelectSound,
  playHarvestPlopSound, playMarketSellSound, playLandExpandSound,
  playModalOpenSound, playModalCloseSound, playErrorSound, playRainSound,
  playCoinFlyHitSound, playChickenCluckSound, playCowMooSound,
  playSheepBaaSound, playLoomWeaveSound, playTreeRustleHarvestSound,
  startBGM, stopBGM
} from "./engine/audioEngine.js";
import { dayNightWeather, TIME_PERIODS, WEATHER_TYPES } from "./engine/dayNightWeather.js";
import { CROP_PIXEL_SPRITES } from "./data/cropSprites.js";
import { createUpgradeManager, calculateDemolishRefund, getRotatedTileIdAndFlip } from "./engine/upgradeManager.js";
import { createUIModalController, showToast } from "./engine/uiModalController.js";
import { initInputHandler, findHitBubble } from "./engine/inputHandler.js";
import { createCanvasRenderer, isImageReady } from "./engine/canvasRenderer.js";
import { createTutorialManager } from "./engine/tutorialManager.js";
import { createTownEventsManager } from "./engine/townEvents.js";
import { createFarmToolsManager } from "./engine/farmTools.js";
import { createOrderBoardManager } from "./engine/orderBoardManager.js";
import { TownVisitorManager } from "./engine/townVisitors.js";
import { TownCaretakerManager } from "./engine/townCaretaker.js";
import { HarborShipManager } from "./engine/harborShipManager.js";
import { VehicleManager } from "./engine/trafficVehicles.js";
import { KingdomWondersManager } from "./engine/kingdomWonders.js";
import { FishingManager } from "./engine/fishingMinigame.js";
import { DailyWheelManager } from "./engine/dailyWheel.js";
import { SeasonalThemeManager } from "./engine/seasonalThemes.js";
import { AESTHETIC_TILE_URIS } from "./data/aestheticTileIcons.js";
import { createStarterTownMap32, getStarterFarmlandState, isProtectedTile, isIndestructibleTile } from "./data/starterMap.js";
import { DEV_FULL_VILLAGE_SAVE } from "./data/devSaveData.js";

let globalAnimLoopId = null;
let globalAbortController = null;

export function initIsometricStudio() {
  if (globalAnimLoopId) {
    cancelAnimationFrame(globalAnimLoopId);
    globalAnimLoopId = null;
  }
  if (globalAbortController) {
    globalAbortController.abort();
    globalAbortController = null;
  }
  globalAbortController = new AbortController();
  const { signal } = globalAbortController;

  return (function() {
    let container = document.getElementById('canvas-container');
    let canvas = document.getElementById('builder-canvas');
    if (!canvas || !container) return;
    let ctx = canvas.getContext('2d');

    // Self-healing: if DOM elements were replaced (HMR), re-acquire references
    function ensureCanvasRef() {
      if (!canvas || !canvas.isConnected || !container || !container.isConnected) {
        container = document.getElementById('canvas-container');
        canvas = document.getElementById('builder-canvas');
        if (canvas && container) {
          ctx = canvas.getContext('2d');
          return true;
        }
        return false;
      }
      return true;
    }

    function getViewportSize() {
      ensureCanvasRef();
      const rect = container ? container.getBoundingClientRect() : null;
      const w = (rect && rect.width > 50) ? rect.width : (window.innerWidth || 1280);
      const h = (rect && rect.height > 50) ? rect.height : (window.innerHeight || 720);
      return { width: w, height: h };
    }

    function getIdealCenterCamera(zoom, viewW, viewH) {
      return {
        x: viewW / 2 - WORLD_CENTER_X * zoom,
        y: viewH / 2 - WORLD_CENTER_Y * zoom
      };
    }

    // Camera State: start centered on the kingdom
    const initVp = getViewportSize();
    const initCam = getIdealCenterCamera(0.85, initVp.width, initVp.height);
    const camera = {
      x: initCam.x,
      y: initCam.y,
      zoom: 0.85
    };

    const screenToWorldCoords = (sx, sy) => screenToWorld(sx, sy, camera);

    // App State
    let activeBrush = null;
    let brushFlipped = false;

    function setActiveBrush(brushId) {
      if (brushId && brushId !== activeBrush) playTileSelectSound();
      activeBrush = brushId;
      updateBrushCardCost();
      updateFloatingBrushHUD();
      const btnDemolish = document.getElementById("btn-toggle-demolish");
      if (btnDemolish) {
        if (brushId === "erase") {
          btnDemolish.classList.add("active");
        } else {
          btnDemolish.classList.remove("active");
        }
      }
      if (brushId && container) {
        container.style.cursor = brushId === "erase" ? "not-allowed" : "crosshair";
      } else if (container) {
        container.style.cursor = "default";
      }
      requestRender();
    }

    // Directional and horizontal flip rotation logic (imported from upgradeManager.js)

    function rotateActiveBrush() {
      if (!activeBrush || activeBrush === "erase") return;
      const res = getRotatedTileIdAndFlip(activeBrush, brushFlipped);
      if (tileMap[res.nextId]) {
        activeBrush = res.nextId;
      }
      brushFlipped = res.nextFlip;
      playRotateSound();
      showToast(brushFlipped ? "🔄 Đã lật/xoay hướng Đông Nam" : "🔄 Đã đổi hướng ban đầu", "info");
      updateFloatingBrushHUD();
      requestRender();
    }

    let activeCategory = 'all';
    let townEventsManager = null;
    let orderBoardManager = null;
    let townVisitorManager = null;
    let townCaretakerManager = null;
    let harborShipManager = null;
    let vehicleManager = null;
    let kingdomWondersManager = null;
    let fishingManager = null;
    let dailyWheelManager = null;
    let seasonalThemeManager = null;
    let uiModalController = null;
    let tutorialManager = null;
    const starterMapGrid = createStarterTownMap32();
    const initialSave = loadGameSave(starterMapGrid) || getDefaultSaveState(starterMapGrid);
    let currentGrid = (initialSave.grid && initialSave.grid.length === 16) ? expandGrid16to32(initialSave.grid) : (initialSave.grid || starterMapGrid);
    
    // Tự động kiểm tra & cập nhật bản đồ cho các save cũ:
    // 1. Kho Silo (b13_barn_silo) và Kho Barn (b12_general_store)
    let hasSilo = false;
    let hasBarn = false;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Tự động chuyển đổi Nhà Kho cũ (b48_winery_press_barn_se hoặc b47_winery_press_barn_sw) sang b12_general_store
        if (currentGrid[r]?.[c] === "b48_winery_press_barn_se" || currentGrid[r]?.[c] === "b47_winery_press_barn_sw") {
          currentGrid[r][c] = "b12_general_store";
        }
        if (currentGrid[r]?.[c] === "b13_barn_silo") hasSilo = true;
        if (currentGrid[r]?.[c] === "b12_general_store") hasBarn = true;
      }
    }
    if (!hasSilo && currentGrid[12]) {
      currentGrid[12][12] = "b13_barn_silo";
    }
    if (!hasBarn && currentGrid[12]) {
      currentGrid[12][18] = "b12_general_store";
    }

    // 2. Tòa Thị Chính tại (14, 15), Đài phun nước quảng trường tại (15, 15), và Trục đường ra làng (16..31, 15)
    if (currentGrid[14]) currentGrid[14][15] = "b14_town_hall";
    if (currentGrid[15]) {
      currentGrid[15][15] = "d01_plaza_fountain"; // Mặt đường cũ trước Tòa Thị Chính thay bằng Đài phun nước quảng trường
    }
    for (let r = 16; r <= 31; r++) {
      if (currentGrid[r]) currentGrid[r][15] = "r01_road_straight_ns";
    }

    // Dọn sạch hoàn toàn các ô r02_cobblestone không có hình ảnh từ các bản đồ save cũ
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (currentGrid[r]?.[c] === "r02_cobblestone") {
          currentGrid[r][c] = "d12_meadow_wildflowers";
        }
      }
    }
    
    // Game Economy State: Always Game Mode
    let gameMode = "game";
    let playerGold = typeof initialSave.economy?.playerGold === "number" ? initialSave.economy.playerGold : INITIAL_GOLD;
    let playerGems = typeof initialSave.economy?.playerGems === "number" ? initialSave.economy.playerGems : INITIAL_GEMS;
    
    // Storage & Livestock State (Hay Day Style)
    let siloCapacity = typeof initialSave.storage?.siloCapacity === "number" ? initialSave.storage.siloCapacity : 100;
    let barnCapacity = typeof initialSave.storage?.barnCapacity === "number" ? initialSave.storage.barnCapacity : 100;
    let livestockState = (initialSave.livestockState && typeof initialSave.livestockState === "object") ? initialSave.livestockState : {};
    
    // Production Buildings and Floating Texts State
    let productionState = initialSave.productionState || {};
    let farmlandState = initialSave.farmlandState || {};
    for (const [k, f] of Object.entries(farmlandState)) {
      if (!f || typeof f !== 'object' || !f.seedId) {
        delete farmlandState[k];
      }
    }
    let fruitTreesState = (initialSave.fruitTreesState && typeof initialSave.fruitTreesState === 'object') ? initialSave.fruitTreesState : {};

    // Đảm bảo không còn productionState sót lại cho các ô Nhà Kho (Barn & Silo)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tid = currentGrid[r]?.[c];
        if (tid === "b12_general_store" || tid === "b13_barn_silo") {
          delete productionState[`${r}_${c}`];
          delete productionState[`${r},${c}`];
        }
      }
    }

    // Tự động khởi tạo quả chín sẵn sàng thu hoạch cho mọi cây ăn quả trên bản đồ
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (currentGrid[r] && FRUIT_TREES_CONFIG[currentGrid[r][c]]) {
          const k = `${r}_${c}`;
          productionState[k] = { lastHarvest: 0, ready: true };
          fruitTreesState[k] = { lastHarvest: 0 };
        }
      }
    }

    let activeFarmlandCell = null;
    let canvasRenderer = null;

    function spawnFlyingCoin(gridCol, gridRow, count = 3) {
      if (canvasRenderer) canvasRenderer.spawnFlyingCoin(gridCol, gridRow, count);
    }

    function spawnFlyingXP(gridCol, gridRow, xpAmount = 10) {
      if (canvasRenderer) canvasRenderer.spawnFlyingXP(gridCol, gridRow, xpAmount);
    }

    function spawnFlyingProduce(gridCol, gridRow, icon = "🌾") {
      if (canvasRenderer) canvasRenderer.spawnFlyingProduce(gridCol, gridRow, icon);
    }

    function spawnSlashEffect(gridCol, gridRow) {
      if (canvasRenderer) canvasRenderer.spawnSlashEffect(gridCol, gridRow);
    }

    function addFloatingText(opt) {
      if (canvasRenderer) canvasRenderer.addFloatingText(opt);
    }

    // Player Level & XP System (Tự động đồng bộ cấp độ chuẩn xác theo mốc XP mới)
    let playerXP = typeof initialSave.playerXP === "number" ? initialSave.playerXP : 0;
    let playerLevel = 1;
    for (let i = PLAYER_LEVEL_CONFIG.length - 1; i >= 0; i--) {
      if (playerXP >= PLAYER_LEVEL_CONFIG[i].xpReq) {
        playerLevel = PLAYER_LEVEL_CONFIG[i].level;
        break;
      }
    }

    // Farm Tools Manager: 'sickle' (liềm) | 'shovel' (xẻng) | bulk seed sowing
    let farmToolsManager = null;
    let isMouseDown = false;

    // Flipped Tiles State
    let flippedGrid = initialSave.flippedGrid || {};

    // Constructions State
    let constructions = initialSave.constructions || {};

    // Quests and Harvests State
    let totalHarvestsCount = typeof initialSave.quests?.harvestsCount === "number" ? initialSave.quests.harvestsCount : 0;
    let questsClaimed = initialSave.quests?.claimedQuests || {};

    // Land & Resources State
    let landUnlockedChunks = Array.isArray(initialSave.land?.unlockedChunks) ? initialSave.land.unlockedChunks : [...INITIAL_UNLOCKED_CHUNKS];
    if (landUnlockedChunks.length === 4 && landUnlockedChunks[0] === 5 && landUnlockedChunks[3] === 10) {
      landUnlockedChunks = [...INITIAL_UNLOCKED_CHUNKS];
    }
    // Guarantee that all starter kingdom chunks (16x16) are always unlocked
    for (const ch of INITIAL_UNLOCKED_CHUNKS) {
      if (!landUnlockedChunks.includes(ch)) {
        landUnlockedChunks.push(ch);
      }
    }
    let playerResources = initialSave.resources || { wheat: 0, egg: 0, milk: 0, bread: 0, ironTools: 5 };
    if ((playerResources.ironTools || 0) < 5) {
      playerResources.ironTools = 5;
    }

    // Building Levels State
    let buildingLevels = (initialSave.buildingLevels && typeof initialSave.buildingLevels === 'object') ? initialSave.buildingLevels : {};
    let upgradesInProgress = (initialSave.upgradesInProgress && typeof initialSave.upgradesInProgress === 'object') ? initialSave.upgradesInProgress : {};

    function getFullSaveData() {
      return {
        version: 2,
        savedAt: Date.now(),
        presetName: 'custom',
        grid: currentGrid,
        flippedGrid,
        constructions,
        productionState,
        farmlandState,
        fruitTreesState,
        playerLevel,
        playerXP,
        buildingLevels,
        upgradesInProgress,
        economy: {
          gameMode,
          playerGold,
          playerGems
        },
        storage: {
          siloCapacity,
          barnCapacity
        },
        livestockState,
        quests: {
          harvestsCount: totalHarvestsCount,
          claimedQuests: questsClaimed
        },
        land: {
          unlockedChunks: landUnlockedChunks
        },
        resources: playerResources,
        townEvent: townEventsManager
          ? townEventsManager.getSaveState()
          : (initialSave && initialSave.townEvent && typeof initialSave.townEvent.endsAt === "number" && initialSave.townEvent.endsAt > Date.now() ? initialSave.townEvent : null),
        orderBoard: orderBoardManager
          ? orderBoardManager.getSaveState()
          : (initialSave?.orderBoard || null),
        townVisitors: townVisitorManager
          ? townVisitorManager.getSaveState()
          : (initialSave?.townVisitors || null),
        townCaretaker: townCaretakerManager
          ? townCaretakerManager.getSaveState()
          : (initialSave?.townCaretaker || null),
        harborShip: harborShipManager
          ? harborShipManager.getSaveState()
          : (initialSave?.harborShip || null),
        kingdomWonders: kingdomWondersManager
          ? kingdomWondersManager.getSaveState()
          : (initialSave?.kingdomWonders || null),
        wonderSites: kingdomWondersManager
          ? kingdomWondersManager.wonderSites
          : (initialSave?.wonderSites || null),
        dailyWheel: dailyWheelManager
          ? dailyWheelManager.getSaveState()
          : (initialSave?.dailyWheel || null),
        activeSeason: seasonalThemeManager
          ? seasonalThemeManager.currentSeason
          : (initialSave?.activeSeason || "summer")
      };
    }

    function persistGameState() {
      try {
        const ok = saveGameSave(getFullSaveData());
        if (!ok) {
          showToast("⚠️ Không thể lưu game! Bộ nhớ trình duyệt có thể đã đầy.", "error");
        }
      } catch (e) {
        console.warn('[Storage] persistGameState error:', e);
        showToast("⚠️ Lỗi khi lưu game: " + e.message, "error");
      }
    }

    function saveProductionState() { persistGameState(); }
    function saveFlippedGrid() { persistGameState(); }
    function saveConstructionsState() { persistGameState(); }
    function saveGameEconomyState() { persistGameState(); }
    function saveQuestsState() { persistGameState(); }

    const saveStatusEl = document.getElementById("builder-save-status");
    if (saveStatusEl) {
      saveStatusEl.textContent = initialSave ? "✓ Đã nạp tiến trình v2" : "Tự động lưu: Sẵn sàng";
    }

    let saveTimeout = null;
    function triggerAutoSave() {
      if (saveTimeout) clearTimeout(saveTimeout);
      if (saveStatusEl) saveStatusEl.textContent = "Đang lưu...";
      saveTimeout = setTimeout(() => {
        const ok = saveGameSave(getFullSaveData());
        if (saveStatusEl) {
          saveStatusEl.textContent = ok ? "✓ Đã tự động lưu" : "Lưu trữ bị chặn";
        }
        if (!ok) {
          showToast("⚠️ Không thể lưu game! Bộ nhớ trình duyệt có thể đã đầy. Hãy xuất file JSON để sao lưu.", "error");
        }
      }, 300);
    }

    let undoStack = [];
    let redoStack = [];
    let hoverCell = null;
    let movingBuilding = null;
    const villagerManager = new VillagerManager();
    const petManager = new PetManager();

    const tileMap = {};
    TILES_DATA.forEach(t => { tileMap[t.id] = t; });

    // Animation & Living World State
    let isAnimated = true;
    let animFrame = 0;
    let animTime = 0.0;
    let animLoopId = null;

    // DOM Elements
    const coordStatus = document.getElementById('builder-coord-status');
    const undoBtn = document.getElementById('builder-undo-btn');
    const redoBtn = document.getElementById('builder-redo-btn');

    function updateUndoRedoButtons() {
      if (undoBtn) {
        undoBtn.style.opacity = undoStack.length > 0 ? "1" : "0.4";
        undoBtn.style.cursor = undoStack.length > 0 ? "pointer" : "default";
      }
      if (redoBtn) {
        redoBtn.style.opacity = redoStack.length > 0 ? "1" : "0.4";
        redoBtn.style.cursor = redoStack.length > 0 ? "pointer" : "default";
      }
    }

    const resetViewBtn = document.getElementById('builder-reset-view-btn');
    const zoomInBtn = document.getElementById('builder-zoom-in');
    const zoomOutBtn = document.getElementById('builder-zoom-out');
    const zoomReadout = document.getElementById('builder-zoom-readout');

    function updateZoomReadout() {
      if (zoomReadout) {
        zoomReadout.textContent = Math.round(camera.zoom * 100) + '%';
      }
    }

    if (resetViewBtn) resetViewBtn.addEventListener("click", () => {
      playUIClickSound();
      centerCamera();
      showToast("🎯 Đã căn giữa vương quốc", "info");
    });
    const settingsResetViewBtn = document.getElementById('settings-reset-view-btn');
    if (settingsResetViewBtn) settingsResetViewBtn.addEventListener("click", () => {
      playUIClickSound();
      centerCamera();
      showToast("🎯 Đã căn giữa vương quốc", "info");
    });
    const settingsUndoBtn = document.getElementById('settings-undo-btn');
    if (settingsUndoBtn) settingsUndoBtn.addEventListener("click", () => {
      undo();
    });
    const settingsRedoBtn = document.getElementById('settings-redo-btn');
    if (settingsRedoBtn) settingsRedoBtn.addEventListener("click", () => {
      redo();
    });
    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => {
        playUIClickSound();
        zoomIn();
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => {
        playUIClickSound();
        zoomOut();
      });
    }

    // Audio, Day/Night & Weather Controls
    const audioBtn = document.getElementById('builder-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        playUIClickSound();
        initAudio();
        const muted = toggleMute();
        audioBtn.textContent = muted ? '🔇 Tắt âm' : '🎵 Nhạc: Bật';
        audioBtn.classList.toggle('active', !muted);
        showToast(muted ? '🔇 Đã tắt âm thanh' : '🎵 Đã bật nhạc nền 8-bit & hiệu ứng', 'info');
      });
    }

    // Auto unlock and start BGM on any first interaction
    const unlockAudioOnGesture = () => {
      initAudio();
      if (!getAudioState().isMuted) {
        startBGM();
      }
    };
    window.addEventListener('pointerdown', unlockAudioOnGesture, { once: true });
    window.addEventListener('keydown', unlockAudioOnGesture, { once: true });

    const timeBtn = document.getElementById('builder-time-toggle');
    if (timeBtn) {
      timeBtn.addEventListener('click', () => {
        playUIClickSound();
        const period = dayNightWeather.getCurrentPeriod();
        if (dayNightWeather.isAutoCycle) {
          dayNightWeather.setTimePeriod(TIME_PERIODS.DAY);
          timeBtn.textContent = '☀️ Ngày';
          showToast('☀️ Chuyển sang Ban ngày rực rỡ', 'info');
        } else if (period === TIME_PERIODS.DAY) {
          dayNightWeather.setTimePeriod(TIME_PERIODS.SUNSET);
          timeBtn.textContent = '🌅 Hoàng hôn';
          showToast('🌅 Chuyển sang Hoàng hôn ấm áp', 'info');
        } else if (period === TIME_PERIODS.SUNSET) {
          dayNightWeather.setTimePeriod(TIME_PERIODS.NIGHT);
          timeBtn.textContent = '🌙 Đêm';
          showToast('🌙 Chuyển sang Đêm lung linh ánh đèn', 'info');
        } else {
          dayNightWeather.toggleAutoCycle();
          timeBtn.textContent = '⚡ Tự động';
          showToast('⚡ Bật tự động xoay vòng Ngày / Đêm', 'info');
        }
        requestRender();
      });
    }

    const weatherBtn = document.getElementById('builder-weather-toggle');
    if (weatherBtn) {
      weatherBtn.addEventListener('click', () => {
        playUIClickSound();
        if (dayNightWeather.weather === WEATHER_TYPES.CLEAR) {
          dayNightWeather.setWeather(WEATHER_TYPES.RAIN);
          weatherBtn.textContent = '🌧️ Mưa';
          showToast('🌧️ Bắt đầu có mưa rào rơi nhẹ', 'info');
          playRainSound();
        } else if (dayNightWeather.weather === WEATHER_TYPES.RAIN) {
          dayNightWeather.setWeather(WEATHER_TYPES.MIST);
          weatherBtn.textContent = '🌫️ Sương mù';
          showToast('🌫️ Sương sớm bồng bềnh thung lũng', 'info');
          playWatermillSound();
        } else {
          dayNightWeather.setWeather(WEATHER_TYPES.CLEAR);
          weatherBtn.textContent = '☀️ Nắng';
          showToast('☀️ Trời quang mây tạnh', 'info');
          playBirdSound();
        }
        requestRender();
      });
    }

    const fastBuildBtn = document.getElementById('builder-fast-build-btn');
    if (fastBuildBtn) {
      fastBuildBtn.addEventListener('click', () => {
        playUIClickSound();
        let count = 0;
        const now = Date.now();
        for (const [key, c] of Object.entries(constructions)) {
          currentGrid[c.row][c.col] = c.targetTileId;
          if (c.flipped) flippedGrid[key] = true;
          else delete flippedGrid[key];
          if (PRODUCTION_BUILDINGS[c.targetTileId]) {
            productionState[key] = { lastHarvest: now, ready: false };
          }
          delete constructions[key];
          count++;
        }
        for (const [key, u] of Object.entries(upgradesInProgress)) {
          buildingLevels[key] = u.targetLevel;
          delete upgradesInProgress[key];
          count++;
        }
        let cropCount = 0;
        for (const [key, f] of Object.entries(farmlandState)) {
          if (f && f.plantTime) {
            f.plantTime = now - f.growDurationMs;
            cropCount++;
          }
        }
        let treeCount = 0;
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const tid = currentGrid[r][c];
            if (FRUIT_TREES_CONFIG[tid]) {
              const k = `${r}_${c}`;
              fruitTreesState[k] = { lastHarvest: 0 };
              treeCount++;
            }
          }
        }
        if (count > 0 || cropCount > 0 || treeCount > 0) {
          playBuildSound();
          saveConstructionsState();
          saveFlippedGrid();
          updateVillageStatsUI();
          checkQuestsProgress();
          persistGameState();
          requestRender();
          showToast(`⚡ Đã hoàn thành ${count} công trình, làm chín ${cropCount} luống rau & ${treeCount} cây ăn quả!`, 'success');
        } else {
          showToast('⚡ Không có công trình nào đang chờ thi công hay mùa màng cần tăng tốc.', 'info');
        }
      });
    }

    let lastWasMobile = window.innerWidth <= 768;
    const DEFAULT_ZOOM = 0.85;
    const MAX_ZOOM = 2.2;

    function getMinZoom() {
      const { width, height } = getViewportSize();
      const isMobile = width <= 768;
      // Giới hạn zoom tối thiểu sao cho bản đồ lấp đầy màn hình, không zoom ra thấy viền ngoài trống
      // (Không zoom quá nhỏ để lộ khoảng không ngoài đảo)
      const fitW = width / 3400;
      const fitH = height / 1700;
      const calculated = Math.max(fitW, fitH);
      const lowerBound = isMobile ? 0.60 : 0.70;
      return Math.max(lowerBound, Math.min(calculated, 0.85));
    }

    function clampCamera() {
      const { width: viewW, height: viewH } = getViewportSize();
      const minZ = getMinZoom();
      camera.zoom = Math.min(Math.max(camera.zoom, minZ), MAX_ZOOM);

      // Cho phép pan thoải mái khắp vùng đất vương quốc (32x32)
      // Giữ cho tâm màn hình luôn nằm trong phạm vi đảo, không trôi vào khoảng không
      // WORLD_CENTER_X = 2112, WORLD_CENTER_Y = 1088
      const maxWorldPanX = 1500; // world units sang 2 bên (bao trọn vương quốc và viền rừng)
      const maxWorldPanY = 850;  // world units lên xuống

      // Giới hạn toạ độ camera trên màn hình
      const minCamX = viewW / 2 - (WORLD_CENTER_X + maxWorldPanX) * camera.zoom;
      const maxCamX = viewW / 2 - (WORLD_CENTER_X - maxWorldPanX) * camera.zoom;
      const minCamY = viewH / 2 - (WORLD_CENTER_Y + maxWorldPanY) * camera.zoom;
      const maxCamY = viewH / 2 - (WORLD_CENTER_Y - maxWorldPanY) * camera.zoom;

      const ideal = getIdealCenterCamera(camera.zoom, viewW, viewH);
      // Bảo vệ tuyệt đối chống NaN / Infinity
      if (isNaN(camera.x) || !isFinite(camera.x)) camera.x = ideal.x;
      if (isNaN(camera.y) || !isFinite(camera.y)) camera.y = ideal.y;

      camera.x = Math.max(minCamX, Math.min(maxCamX, camera.x));
      camera.y = Math.max(minCamY, Math.min(maxCamY, camera.y));
    }

    function applyZoom(targetZoom, pivotX, pivotY) {
      const { width: viewW, height: viewH } = getViewportSize();
      const px = pivotX !== undefined ? pivotX : viewW / 2;
      const py = pivotY !== undefined ? pivotY : viewH / 2;

      const minZ = getMinZoom();
      const newZoom = Math.min(Math.max(targetZoom, minZ), MAX_ZOOM);

      if (Math.abs(newZoom - camera.zoom) > 0.001) {
        camera.x = px - (px - camera.x) * (newZoom / camera.zoom);
        camera.y = py - (py - camera.y) * (newZoom / camera.zoom);
        camera.zoom = newZoom;
        clampCamera();
        updateZoomReadout();
        requestRender();
      }
    }

    function zoomIn() {
      applyZoom(camera.zoom * 1.25);
    }

    function zoomOut() {
      applyZoom(camera.zoom * (1 / 1.25));
    }

    function centerCamera() {
      const { width: viewW, height: viewH } = getViewportSize();
      const minZ = getMinZoom();
      camera.zoom = Math.max(minZ, DEFAULT_ZOOM);
      const ideal = getIdealCenterCamera(camera.zoom, viewW, viewH);
      camera.x = ideal.x;
      camera.y = ideal.y;
      clampCamera();
      updateZoomReadout();
      requestRender();
    }

    let hasInitiallyCentered = false;
    function resizeCanvas() {
      const { width: viewW, height: viewH } = getViewportSize();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(viewW * dpr);
      canvas.height = Math.round(viewH * dpr);
      canvas.style.width = viewW + 'px';
      canvas.style.height = viewH + 'px';

      const isMobile = window.innerWidth <= 768;
      if (!hasInitiallyCentered && viewW > 100 && viewH > 100) {
        hasInitiallyCentered = true;
        centerCamera();
        return;
      }
      if (isMobile !== lastWasMobile) {
        lastWasMobile = isMobile;
        centerCamera();
        return;
      }
      clampCamera();
      requestRender();
    }
    window.addEventListener('resize', resizeCanvas, { signal });

    // Tự động đồng bộ kích thước canvas khi DOM layout hoàn tất
    if (typeof ResizeObserver !== 'undefined' && container) {
      try {
        const ro = new ResizeObserver(() => resizeCanvas());
        ro.observe(container);
      } catch (err) {
        // Fallback to window resize
      }
    }

    // Top Bar Action Buttons & Economy
    const btnTopbarMarket = document.getElementById('btn-topbar-market');
    const btnRestartGame = document.getElementById('btn-restart-game');
    const goldDisplay = document.getElementById('builder-gold-display');
    const goldBadge = document.getElementById('builder-gold-badge');

    function resetToInitialGameState() {
      cleanOldSavesForV3();
      gameMode = "game";
      playerGold = INITIAL_GOLD; // 500 gold
      playerGems = INITIAL_GEMS; // 30 gems
      siloCapacity = 100;
      barnCapacity = 100;
      livestockState = {};
      playerLevel = 1;
      playerXP = 0;
      if (farmToolsManager) farmToolsManager.deactivateFarmTool();
      playerResources = {
        wheat: 0, carrot: 0, tomato: 0, strawberry: 0, corn: 0,
        cabbage: 0, pumpkin: 0, watermelon: 0, grapes: 0, sunflower: 0,
        egg: 0, milk: 0, wool: 0, fabric: 0, butter: 0, bread: 0, ironTools: 0
      };
      currentGrid = createStarterTownMap32();
      constructions = {};
      buildingLevels = {};
      upgradesInProgress = {};
      farmlandState = getStarterFarmlandState();
      productionState = {};
      flippedGrid = {};
      landUnlockedChunks = [...INITIAL_UNLOCKED_CHUNKS];
      questsClaimed = {};
      totalHarvestsCount = 0;
      undoStack = [];
      redoStack = [];
      updateUndoRedoButtons();
      activeBrush = null;
      movingBuilding = null;
      if (villagerManager) villagerManager.villagers = [];
      if (townEventsManager) townEventsManager.stopEvent(false);
      if (orderBoardManager) orderBoardManager.reset();
      if (townVisitorManager) {
        townVisitorManager.visitors = [];
        townVisitorManager.nextSpawnTimer = 6;
      }
      if (townCaretakerManager) {
        townCaretakerManager.init(null);
      }
      if (harborShipManager) {
        harborShipManager.init(null);
      }
      if (kingdomWondersManager) {
        kingdomWondersManager.init(null);
      }
      if (dailyWheelManager) {
        dailyWheelManager.init(null);
      }
      if (uiModalController && typeof uiModalController.resetAchievements === "function") {
        uiModalController.resetAchievements();
      } else {
        try { localStorage.removeItem("town_builder_achievements_claimed_v1"); } catch {}
      }

      // Xóa sạch trạng thái tutorial và kích hoạt lại Hướng Dẫn Khởi Nghiệp từ Bước 1
      try {
        localStorage.removeItem("town_builder_tutorial_completed");
        localStorage.removeItem("town_builder_tutorial_rewarded");
        localStorage.removeItem("town_builder_tutorial_step");
      } catch (e) {}
      if (tutorialManager) {
        tutorialManager.start(true);
      }

      // Đóng tất cả các modal đang mở (bao gồm cả Cài Đặt) để đưa người chơi về màn hình chính
      document.querySelectorAll(".modal.open, .modal.visible, .town-caretaker-modal-backdrop.open, .town-caretaker-modal-backdrop.visible, .levelup-modal-backdrop").forEach(m => {
        m.classList.remove("open");
        m.classList.remove("visible");
      });

      updateModeUI();
      updateGoldDisplay();
      updateGemsDisplay();
      updateLevelUI();
      updateResourcesUI();
      updateVillageStatsUI();
      checkQuestsProgress();
      if (uiModalController) {
        if (typeof uiModalController.renderAchievementsList === "function") uiModalController.renderAchievementsList();
        if (typeof uiModalController.renderQuestList === "function") uiModalController.renderQuestList();
      }

      persistGameState();
      resizeCanvas();
      centerCamera();
      // Đảm bảo định vị chính xác tâm bản đồ ngay sau khi browser hoàn tất layout
      requestAnimationFrame(() => {
        resizeCanvas();
        centerCamera();
      });
      requestRender();
      showToast("👑 Vương quốc khởi đầu mới: Cụ Trưởng Làng Eldrin đã trở lại đồng hành cùng bạn!", "success");
    }

    if (btnTopbarMarket) {
      btnTopbarMarket.addEventListener("click", () => {
        playUIClickSound();
        openMarketModal();
      });
    }

    if (btnRestartGame) {
      btnRestartGame.addEventListener("click", () => {
        playUIClickSound();
        if (confirm("Bạn có chắc chắn muốn chơi lại từ đầu? Bản đồ sẽ trở về Tòa Thị Chính trung tâm với 500 vàng khởi đầu.")) {
          resetToInitialGameState();
        }
      });
    }

    if (goldBadge) {
      goldBadge.style.cursor = "pointer";
      goldBadge.addEventListener("click", () => {
        showToast("🪙 Kho Vàng: Hãy trồng trọt, thu hoạch nông sản và làm nhiệm vụ để tích lũy vàng!", "info");
      });
    }

    const gemDisplay = document.getElementById("builder-gem-display");
    const gemBadge = document.getElementById("builder-gem-badge");
    if (gemBadge) {
      gemBadge.addEventListener("click", () => {
        showToast("💎 Kho Ruby: Dùng Ruby để hoàn thành ngay công trình đang thi công và nâng cấp sức chứa kho!", "info");
      });
    }

    function updateGoldDisplay() {
      if (goldDisplay) {
        goldDisplay.textContent = playerGold.toLocaleString();
      }
    }

    function updateGemsDisplay() {
      if (gemDisplay) {
        gemDisplay.textContent = playerGems.toLocaleString();
      }
    }

    function deductGems(amt) {
      if (playerGems < amt) return false;
      playerGems -= amt;
      updateGemsDisplay();
      persistGameState();
      return true;
    }

    function addPlayerGems(amt) {
      if (amt <= 0) return;
      playerGems += amt;
      updateGemsDisplay();
      persistGameState();
    }

    // Player Leveling & XP System
    function getXpForNextLevel(lvl) {
      return getLevelXpRequirement(lvl);
    }

    function addPlayerXP(amount, sourceName = "") {
      if (amount <= 0) return;
      if (kingdomWondersManager && typeof kingdomWondersManager.getXpBuffMultiplier === "function") {
        amount = Math.round(amount * kingdomWondersManager.getXpBuffMultiplier());
      }
      playerXP += amount;
      let nextReq = getXpForNextLevel(playerLevel);
      let leveledUp = false;

      while (playerXP >= nextReq && playerLevel < MAX_PLAYER_LEVEL) {
        playerLevel++;
        leveledUp = true;
        nextReq = getXpForNextLevel(playerLevel);
      }

      updateLevelUI();
      persistGameState();
      checkQuestsProgress(true);

      if (leveledUp) {
        triggerLevelUpCelebration(playerLevel);
      }
    }

    function updateLevelUI() {
      const badgeEl = document.getElementById("hud-player-level-badge");
      const titleEl = document.getElementById("hud-player-title");
      const barEl = document.getElementById("hud-player-xp-bar");
      const textEl = document.getElementById("hud-player-xp-text");

      if (badgeEl) badgeEl.textContent = `⭐ Cấp ${playerLevel}`;
      if (titleEl) titleEl.textContent = getPlayerLevelTitle(playerLevel);

      const curReq = PLAYER_LEVEL_CONFIG.find(c => c.level === playerLevel)?.xpReq || 0;
      const nextReq = getXpForNextLevel(playerLevel);
      const span = Math.max(1, nextReq - curReq);
      const prog = Math.min(1.0, Math.max(0, (playerXP - curReq) / span));

      if (playerLevel >= MAX_PLAYER_LEVEL) {
        if (barEl) barEl.style.width = "100%";
        if (textEl) textEl.textContent = `${playerXP} XP (Cấp Tối Đa 👑)`;
      } else {
        if (barEl) barEl.style.width = `${Math.round(prog * 100)}%`;
        if (textEl) textEl.textContent = `${playerXP} / ${nextReq} XP`;
      }

      if (townCaretakerManager) {
        townCaretakerManager.updateHUD();
      }
      if (harborShipManager) {
        harborShipManager.updateHUD();
      }
      if (dailyWheelManager) {
        dailyWheelManager.updateHUD();
      }
    }

    function triggerLevelUpCelebration(newLevel) {
      playQuestRewardSound();
      const cfg = PLAYER_LEVEL_CONFIG.find(c => c.level === newLevel);
      const bonusGold = (cfg && cfg.rewardGold) ? cfg.rewardGold : (newLevel * 100);
      playerGold += bonusGold;
      updateGoldDisplay();

      const modal = document.getElementById("levelup-modal");
      const numBadge = document.getElementById("levelup-number-badge");
      const titleText = document.getElementById("levelup-title-text");
      const rewardText = document.getElementById("levelup-gold-reward");
      const unlockList = document.getElementById("levelup-unlock-list");

      if (numBadge) numBadge.textContent = `CẤP ${newLevel}`;
      if (titleText) titleText.textContent = getPlayerLevelTitle(newLevel);
      if (rewardText) rewardText.textContent = `+${bonusGold} 🪙 Vàng Thưởng Lên Cấp!`;
      if (unlockList) {
        unlockList.textContent = cfg?.unlockNote || "Mở khóa nhiều công trình & hạt giống mới trong Cửa Hàng!";
      }

      if (modal) {
        modal.classList.remove("hidden");
      }
      showToast(`🎉 CHÚC MỪNG! BẠN ĐÃ THĂNG LÊN CẤP ${newLevel}! Nhận thưởng +${bonusGold}🪙`, "success");
    }

    const levelupClaimBtn = document.getElementById("levelup-claim-btn");
    if (levelupClaimBtn) {
      levelupClaimBtn.addEventListener("click", () => {
        playUIClickSound();
        const modal = document.getElementById("levelup-modal");
        if (modal) modal.classList.add("hidden");

        // Tự động kích hoạt Tutorial tính năng mới mở khóa ở cấp độ này
        setTimeout(() => {
          if (tutorialManager) {
            tutorialManager.checkAndTriggerLevelTutorial(playerLevel);
          }
        }, 350);
      });
    }

    const resWheatEl = document.getElementById("builder-res-wheat");
    const resAppleEl = document.getElementById("builder-res-apple");
    const resBreadEl = document.getElementById("builder-res-bread");
    const resIronEl = document.getElementById("builder-res-iron");
    const resEggEl = document.getElementById("builder-res-egg");
    const resMilkEl = document.getElementById("builder-res-milk");
    const resButterEl = document.getElementById("builder-res-butter");
    const resWoolEl = document.getElementById("builder-res-wool");
    const resFabricEl = document.getElementById("builder-res-fabric");

    function updateResourcesUI() {
      if (resWheatEl) resWheatEl.textContent = `${playerResources.wheat || 0}`;
      if (resAppleEl) resAppleEl.textContent = `${playerResources.apple || 0}`;
      if (resBreadEl) resBreadEl.textContent = `${playerResources.bread || 0}`;
      if (resIronEl) resIronEl.textContent = `${playerResources.ironTools || 0}`;
      if (resEggEl) resEggEl.textContent = `${playerResources.egg || 0}`;
      if (resMilkEl) resMilkEl.textContent = `${playerResources.milk || 0}`;
      if (resButterEl) resButterEl.textContent = `${playerResources.butter || 0}`;
      if (resWoolEl) resWoolEl.textContent = `${playerResources.wool || 0}`;
      if (resFabricEl) resFabricEl.textContent = `${playerResources.fabric || 0}`;

      updateStorageHUD();

      if (btnTopbarMarket) {
        const totalSellable = Object.entries(RESOURCES_CONFIG).reduce((sum, [k, cfg]) => {
          return sum + (playerResources[k] || 0);
        }, 0);
        btnTopbarMarket.textContent = totalSellable > 0 ? `🏪 Chợ (${totalSellable})` : '🏪 Chợ Nông Sản';
      }

      if (orderBoardManager) {
        orderBoardManager.update();
      }
    }

    function checkAndFeedBakeries() {
      let fedCount = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tid = currentGrid[r][c];
          if (constructions[`${r}_${c}`]) continue;
          const pKey = `${r}_${c}`;
          const p = productionState[pKey];
          if (!p || !p.paused) continue;

          if (tid === "b06_bakery" && p.pauseReason === "missing_wheat") {
            const bLvl = buildingLevels[pKey] || 1;
            const reqWheat = getBuildingInputReq(tid, bLvl);
            if ((playerResources.wheat || 0) >= reqWheat) {
              playerResources.wheat -= reqWheat;
              p.paused = false;
              delete p.pauseReason;
              p.lastHarvest = Date.now();
              p.ready = false;
              fedCount++;

              const ox = ORIGIN_X + (c - r) * HALF_W;
              const oy = ORIGIN_Y + (r + c) * QUARTER_W;
              addFloatingText({
                x: ox + 64,
                y: oy + 8,
                text: `-${reqWheat} 🌾 Nướng bánh!`,
                startTime: performance.now(),
                duration: 1300
              });
            }
          } else if (tid === "b21_chicken_coop" && p.pauseReason === "missing_wheat") {
            if ((playerResources.wheat || 0) >= 1) {
              playerResources.wheat -= 1;
              p.paused = false;
              delete p.pauseReason;
              p.lastHarvest = Date.now();
              p.ready = false;
              playChickenCluckSound();
              fedCount++;
            }
          } else if ((tid === "b13_barn_silo" || tid === "b22_cow_pasture") && p.pauseReason === "missing_corn") {
            if ((playerResources.corn || 0) >= 1) {
              playerResources.corn -= 1;
              p.paused = false;
              delete p.pauseReason;
              p.lastHarvest = Date.now();
              p.ready = false;
              playCowMooSound();
              fedCount++;
            }
          } else if (tid === "b57_sheep_pasture" && p.pauseReason === "missing_carrot") {
            if ((playerResources.carrot || 0) >= 1) {
              playerResources.carrot -= 1;
              p.paused = false;
              delete p.pauseReason;
              p.lastHarvest = Date.now();
              p.ready = false;
              playSheepBaaSound();
              fedCount++;
            }
          } else if (tid === "b58_textile_mill" && p.pauseReason === "missing_wool") {
            if ((playerResources.wool || 0) >= 1) {
              playerResources.wool -= 1;
              p.paused = false;
              delete p.pauseReason;
              p.lastHarvest = Date.now();
              p.ready = false;
              playLoomWeaveSound();
              fedCount++;
            }
          } else if (tid === "b59_dairy_factory" && p.pauseReason === "missing_milk") {
            const bLvl = buildingLevels[pKey] || 1;
            const reqMilk = getBuildingInputReq(tid, bLvl);
            if ((playerResources.milk || 0) >= reqMilk) {
              playerResources.milk -= reqMilk;
              p.paused = false;
              delete p.pauseReason;
              p.lastHarvest = Date.now();
              p.ready = false;
              fedCount++;

              const ox = ORIGIN_X + (c - r) * HALF_W;
              const oy = ORIGIN_Y + (r + c) * QUARTER_W;
              addFloatingText({
                x: ox + 64,
                y: oy + 8,
                text: `-${reqMilk} 🥛 Làm bơ sữa!`,
                startTime: performance.now(),
                duration: 1300
              });
            }
          } else if ((tid === "b47_winery_press_barn_sw" || tid === "b48_winery_press_barn_se") && p.pauseReason === "missing_grapes") {
            if ((playerResources.grapes || 0) >= 1) {
              playerResources.grapes -= 1;
              p.paused = false;
              delete p.pauseReason;
              p.lastHarvest = Date.now();
              p.ready = false;
              fedCount++;
            }
          }
        }
      }
      if (fedCount > 0) {
        updateResourcesUI();
        persistGameState();
      }
    }

    // Floating Active Brush & Moving Building HUD
    function updateFloatingBrushHUD() {
      const hud = document.getElementById("floating-brush-hud");
      const titleEl = document.getElementById("floating-brush-title");
      const metaEl = document.getElementById("floating-brush-meta");
      const thumbEl = document.getElementById("floating-brush-thumb");
      if (!hud) return;

      if (!activeBrush && !movingBuilding && !(kingdomWondersManager && kingdomWondersManager.movingWonderId)) {
        hud.classList.add("hidden");
        return;
      }
      hud.classList.remove("hidden");

      if (kingdomWondersManager && kingdomWondersManager.movingWonderId) {
        const wid = kingdomWondersManager.movingWonderId;
        const names = {
          royal_palace: "Đại Lâu Đài Hoàng Gia",
          ocean_library: "Đại Thư Viện Biển Khơi",
          poseidon_statue: "Tượng Thần Biển Poseidon"
        };
        const isFlipped = !!kingdomWondersManager.movingWonderFlipped;
        if (titleEl) titleEl.textContent = `🚚 Di chuyển: ${names[wid] || "Kỳ Quan"}` + (isFlipped ? " (Đã xoay)" : "");
        if (metaEl) metaEl.textContent = "Nhấp bất kỳ ô nào để đặt • R: Xoay hướng • Esc: Hủy";
        if (thumbEl) {
          thumbEl.src = `/assets/wonders/${wid}.png`;
          thumbEl.style.transform = isFlipped ? "scaleX(-1)" : "none";
        }
        return;
      }

      if (movingBuilding) {
        const t = tileMap[movingBuilding.tileId];
        if (titleEl) titleEl.textContent = `🚚 Di chuyển: ${t ? t.label : movingBuilding.tileId}` + (movingBuilding.flipped ? " (Đã xoay)" : "");
        if (metaEl) metaEl.textContent = "Nhấp ô cỏ trống để đặt • R: Xoay • Esc: Hủy";
        if (thumbEl) {
          thumbEl.src = AESTHETIC_TILE_URIS[movingBuilding.tileId] || ((typeof TILE_DATA_URIS !== "undefined" && TILE_DATA_URIS[movingBuilding.tileId]) ? TILE_DATA_URIS[movingBuilding.tileId] : ("tiles/" + movingBuilding.tileId + "_128.png"));
        }
        return;
      }

      if (activeBrush === "erase") {
        if (titleEl) titleEl.textContent = "❌ Công Cụ Phá Dỡ (Xóa)";
        if (metaEl) metaEl.textContent = "Nhấp chuột trái vào ô cần dọn dẹp (Hoàn tiền 100%)";
        if (thumbEl) {
          thumbEl.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><text y='30' font-size='28'>❌</text></svg>";
        }
        return;
      }

      const t = tileMap[activeBrush];
      if (t) {
        if (titleEl) titleEl.textContent = t.label + (brushFlipped ? " (Đã xoay)" : "");
        const cost = getTileCost(t.id, t.category);
        if (metaEl) metaEl.textContent = (gameMode === "sandbox" || cost === 0) ? "Miễn phí" : `Chi phí: ${cost} 🪙`;
        if (thumbEl) {
          thumbEl.src = AESTHETIC_TILE_URIS[t.id] || ((typeof TILE_DATA_URIS !== "undefined" && TILE_DATA_URIS[t.id]) ? TILE_DATA_URIS[t.id] : ("tiles/" + t.id + "_128.png"));
        }
      }
    }

    function rotateMovingBuilding() {
      if (!movingBuilding) return;
      const res = getRotatedTileIdAndFlip(movingBuilding.tileId, !!movingBuilding.flipped);
      if (tileMap[res.nextId]) {
        movingBuilding.tileId = res.nextId;
      }
      movingBuilding.flipped = res.nextFlip;
      playRotateSound();
      const t = tileMap[movingBuilding.tileId];
      showToast(`🔄 Đã xoay: ${t ? t.label : movingBuilding.tileId}`, "info");
      updateFloatingBrushHUD();
      requestRender();
    }

    function rotateCellAt(row, col) {
      if (!isCellUnlocked(row, col, landUnlockedChunks, gameMode)) {
        showToast("🔒 Mảnh đất này chưa được mở khóa!", "warning");
        return;
      }
      const key = `${row}_${col}`;
      if (constructions[key]) {
        showToast("🏗️ Ô này đang thi công, không thể xoay!", "info");
        return;
      }
      const curTid = currentGrid[row][col];
      if (!curTid || curTid === "d12_meadow_wildflowers") return;

      const curFlipped = !!flippedGrid[key];
      const res = getRotatedTileIdAndFlip(curTid, curFlipped);

      if (res.nextId !== curTid && tileMap[res.nextId]) {
        currentGrid[row][col] = res.nextId;
      }
      if (res.nextFlip) {
        flippedGrid[key] = true;
      } else {
        delete flippedGrid[key];
      }

      playRotateSound();
      saveFlippedGrid();
      persistGameState();
      const t = tileMap[currentGrid[row][col]];
      showToast(`🔄 Đã xoay: ${t ? t.label : curTid}`, "info");
      requestRender();
    }

    const hudRotateBtn = document.getElementById("floating-brush-rotate");
    const hudCancelBtn = document.getElementById("floating-brush-cancel");
    if (hudRotateBtn) {
      hudRotateBtn.addEventListener("click", () => {
        if (movingBuilding) {
          rotateMovingBuilding();
          return;
        }
        rotateActiveBrush();
      });
    }
    if (hudCancelBtn) {
      hudCancelBtn.addEventListener("click", () => {
        if (kingdomWondersManager && kingdomWondersManager.movingWonderId) {
          kingdomWondersManager.cancelRelocating();
          updateFloatingBrushHUD();
          return;
        }
        if (movingBuilding) {
          movingBuilding = null;
          updateFloatingBrushHUD();
          showToast("Đã hủy di chuyển vật phẩm", "info");
          requestRender();
          return;
        }
        setActiveBrush(null);
      });
    }

    function updateBrushCardCost() {
      updateFloatingBrushHUD();
    }

    function updateModeUI() {
      updateGoldDisplay();
      updateResourcesUI();
      updateFloatingBrushHUD();
      updateVillageStatsUI();
      checkQuestsProgress(true);
    }

    // Village Statistics HUD
    const statPopEl = document.getElementById("builder-stat-population");
    const statVillagersEl = document.getElementById("builder-stat-villagers");
    const statVillagersBtn = document.getElementById("builder-stat-villagers-btn");
    const statBldEl = document.getElementById("builder-stat-buildings");
    const statIncEl = document.getElementById("builder-stat-income");
    const statLandEl = document.getElementById("builder-stat-land");

    if (statVillagersBtn) {
      statVillagersBtn.addEventListener("click", () => {
        if (villagerManager.villagers.length === 0) {
          showToast("Chưa có cư dân đi lại! Hãy xây thêm nhà ở và lát đường làng.", "info");
          return;
        }
        const v = villagerManager.villagers[Math.floor(Math.random() * villagerManager.villagers.length)];
        const vWorldX = ORIGIN_X + (v.c - v.r) * HALF_W + 64;
        const vWorldY = ORIGIN_Y + (v.r + v.c) * QUARTER_W + 90;
        const rect = container.getBoundingClientRect();
        camera.x = rect.width / 2 - vWorldX * camera.zoom;
        camera.y = rect.height / 2 - vWorldY * camera.zoom;
        updateZoomReadout();
        v.bounce = 1.0;
        playVillagerSpeakSound(v.pitch || 1.0);
        let quote = villagerManager.customDialogueProvider ? villagerManager.customDialogueProvider(v.role) : null;
        if (!quote) {
          const dialogues = VILLAGER_DIALOGUES_BY_ROLE[v.role] || VILLAGER_DIALOGUES_BY_ROLE.citizen;
          quote = dialogues[Math.floor(Math.random() * dialogues.length)];
        }
        villagerManager.speechBubble = {
          villagerId: v.id,
          text: quote,
          expiresAt: performance.now() + 5000
        };
        villagerManager.selectedVillager = v;
        showToast(`🚶 ${v.name}: "${quote}"`, "info");
        requestRender();
      });
    }

    function updateVillageStatsUI() {
      const stats = calculateVillageStats(currentGrid, constructions, tileMap, buildingLevels);
      if (statPopEl) statPopEl.textContent = stats.population.toLocaleString();
      if (statVillagersEl) statVillagersEl.textContent = villagerManager.villagers.length.toString();
      if (statBldEl) statBldEl.textContent = stats.completedBuildings.toLocaleString();
      if (statIncEl) statIncEl.textContent = `+${stats.productionPerMin}`;
      if (statLandEl) {
        if (gameMode === 'sandbox') {
          statLandEl.textContent = "64/64 (Tự do)";
        } else {
          statLandEl.textContent = `${landUnlockedChunks.length}/64`;
        }
      }
      return stats;
    }

    // Quests System
    function getQuestCurrentProgress(quest, stats) {
      if (quest.checkType === "residential_count") {
        let count = 0;
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const tid = currentGrid[r][c];
            if (!constructions[`${r}_${c}`]) {
              if (tid.startsWith("b01") || tid.startsWith("b09") || tid.startsWith("b10") || tid.startsWith("b11") || tid.startsWith("b15") || tid.startsWith("b17") || tid.startsWith("b20")) {
                count++;
              }
            }
          }
        }
        return count;
      } else if (quest.checkType === "road_count") {
        return stats.roadsCount;
      } else if (quest.checkType === "specific_tile") {
        let count = 0;
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (currentGrid[r][c] === quest.tileId && !constructions[`${r}_${c}`]) {
              count++;
            }
          }
        }
        return count;
      } else if (quest.checkType === "decor_count") {
        return stats.decorCount;
      } else if (quest.checkType === "harvest_count") {
        return totalHarvestsCount;
      } else if (quest.checkType === "population") {
        return stats.population;
      } else if (quest.checkType === "land_unlocked") {
        return (gameMode === "sandbox") ? 64 : landUnlockedChunks.length;
      } else if (quest.checkType === "farmland_count") {
        let count = 0;
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (currentGrid[r][c] === "d13_farmland_plot" && !constructions[`${r}_${c}`]) {
              count++;
            }
          }
        }
        return count;
      } else if (quest.checkType === "player_level") {
        return playerLevel;
      } else if (quest.checkType === "resource_total") {
        return playerResources[quest.resourceId] || 0;
      }
      return 0;
    }

    let lastClaimableCount = -1;
    function checkQuestsProgress(suppressToast = false) {
      const stats = updateVillageStatsUI();
      let claimableCount = 0;
      let completedCount = 0;

      QUESTS_CONFIG.forEach(q => {
        const isClaimed = !!questsClaimed[q.id];
        const isUnlocked = isQuestUnlocked(q, questsClaimed);
        const currentProg = getQuestCurrentProgress(q, stats);
        const isReady = isUnlocked && currentProg >= q.target;

        if (isClaimed) completedCount++;
        if (isReady && !isClaimed) claimableCount++;
      });

      const notifyBadge = document.getElementById("quest-notify-badge");
      if (notifyBadge) {
        if (claimableCount > 0) {
          notifyBadge.textContent = claimableCount;
          notifyBadge.classList.remove("hidden");
        } else {
          notifyBadge.classList.add("hidden");
        }
      }

      const summaryEl = document.getElementById("quest-progress-summary");
      if (summaryEl) {
        summaryEl.textContent = `Đã hoàn thành: ${completedCount} / ${QUESTS_CONFIG.length} nhiệm vụ`;
      }

      if (!suppressToast && lastClaimableCount >= 0 && claimableCount > lastClaimableCount) {
        showToast(`📜 Có ${claimableCount} nhiệm vụ đã hoàn thành! Nhấp "Nhiệm vụ" để nhận thưởng`, "success");
      }
      lastClaimableCount = claimableCount;

      return { claimableCount, completedCount, stats };
    }

    // Tutorial Onboarding Manager (Step-by-step 5-minute guide & Level Feature Guides)
    tutorialManager = createTutorialManager({
      getPlayerLevel: () => playerLevel,
      getCurrentGrid: () => currentGrid,
      getConstructions: () => constructions,
      getFarmlandState: () => farmlandState,
      getPlayerResources: () => playerResources,
      getPlayerGold: () => playerGold,
      addPlayerGold: (amt) => {
        playerGold += amt;
        updateGoldDisplay();
      },
      addPlayerXP: (amt, reason) => addPlayerXP(amt, reason),
      spawnFlyingCoin,
      spawnFlyingXP,
      showToast,
      playQuestRewardSound,
      playVillagerSpeakSound,
      playUIClickSound,
      openShopModal: () => {
        const modal = document.getElementById("shop-modal");
        if (modal) modal.classList.add("open");
      },
      openMarketModal: () => openMarketModal(),
      openAchievementsModal: () => {
        if (uiModalController) uiModalController.openAchievementsModal();
      },
      openCaretakerModal: () => {
        if (townCaretakerManager) townCaretakerManager.openModal();
      },
      openHarborShipModal: () => {
        if (harborShipManager) harborShipManager.openModal();
      },
      openLandExpansionModal: () => {
        openLandExpansionModal(10);
      }
    });
    window.tutorialManager = tutorialManager;

    // Town Random Events Manager (Hội Chợ, Thương Đoàn, Mùa Vàng)
    townEventsManager = createTownEventsManager({
      showToast,
      playQuestRewardSound,
      addPlayerGold: (amt) => {
        playerGold += amt;
        updateGoldDisplay();
      },
      spawnFlyingCoin,
      requestRender: () => requestRender(),
      onEventStateChanged: () => {
        persistGameState();
      }
    });

    // Khôi phục sự kiện đang diễn ra nếu save data còn hiệu lực
    if (initialSave && initialSave.townEvent && typeof initialSave.townEvent.endsAt === "number") {
      townEventsManager.restoreFromSave(initialSave.townEvent);
    }

    // Khởi tạo Bảng Đơn Hàng Giao Cho NPC (Order Board)
    orderBoardManager = createOrderBoardManager({
      getPlayerResources: () => playerResources,
      getPlayerGold: () => playerGold,
      getPlayerXP: () => playerXP,
      getPlayerLevel: () => playerLevel,
      addPlayerGold: (amt) => {
        playerGold += amt;
        updateGoldDisplay();
      },
      deductGold: (amt) => {
        playerGold -= amt;
        updateGoldDisplay();
      },
      addPlayerXP,
      updateResourcesUI,
      updateGoldDisplay,
      persistGameState,
      showToast
    });
    orderBoardManager.init(initialSave.orderBoard);

    // Khởi tạo Quản Lý Khách Bộ Hành Ghé Thăm Tòa Thị Chính (Town Visitors)
    townVisitorManager = new TownVisitorManager({
      getPlayerResources: () => playerResources,
      getPlayerGold: () => playerGold,
      getPlayerXP: () => playerXP,
      getPlayerLevel: () => playerLevel,
      addPlayerGold: (amt) => {
        playerGold += amt;
        updateGoldDisplay();
      },
      addPlayerXP,
      updateResourcesUI,
      updateGoldDisplay,
      persistGameState,
      showToast
    });
    townVisitorManager.init(initialSave.townVisitors);

    // Provide dynamic event dialogues to walking villagers
    villagerManager.customDialogueProvider = () => {
      if (townEventsManager && Math.random() < 0.65) {
        return townEventsManager.getRandomDialogue();
      }
      return null;
    };

    // UI Modal Controller (Quests, Market, Seed Nursery, Settings, Snapshot, Toasts)
    uiModalController = createUIModalController({
      onTutorialAction: (type, payload) => tutorialManager.onAction(type, payload),
      onReplayTutorial: () => tutorialManager.start(true),
      getMarketGoldMultiplier: () => {
        const evMult = townEventsManager ? townEventsManager.getMarketGoldMultiplier() : 1.0;
        const wonderMult = kingdomWondersManager ? kingdomWondersManager.getGoldBuffMultiplier() : 1.0;
        return evMult * wonderMult;
      },
      triggerTownEvent: (id) => townEventsManager.triggerEvent(id),
      getCurrentGrid: () => currentGrid,
      getConstructions: () => constructions,
      getTileMap: () => tileMap,
      getBuildingLevels: () => buildingLevels,
      getQuestsClaimed: () => questsClaimed,
      getPlayerGold: () => playerGold,
      getPlayerXP: () => playerXP,
      getPlayerLevel: () => playerLevel,
      getPlayerResources: () => playerResources,
      getGameMode: () => gameMode,
      getLandUnlockedChunks: () => landUnlockedChunks,
      getFarmlandState: () => farmlandState,
      getHarvestsCount: () => totalHarvestsCount,
      getOrderBoardManager: () => orderBoardManager,
      getCanvas: () => canvas,
      getFullSaveData,
      getQuestCurrentProgress,
      addPlayerGold: (amt) => {
        playerGold += amt;
        updateGoldDisplay();
      },
      deductGold: (amt) => {
        playerGold -= amt;
        updateGoldDisplay();
      },
      addPlayerXP,
      updateGoldDisplay,
      updateResourcesUI,
      updateModeUI,
      updateLevelUI,
      updateVillageStatsUI,
      checkQuestsProgress,
      persistGameState,
      saveGameEconomyState,
      saveQuestsState,
      requestRender,
      centerCamera,
      renderCanvas,
      getSiloCapacity: () => siloCapacity,
      getBarnCapacity: () => barnCapacity,
      getActiveFarmlandCell: () => activeFarmlandCell,
      setActiveFarmlandCell: (cell) => { activeFarmlandCell = cell; },
      activateBulkSeedBrush: (crop) => {
        if (farmToolsManager) farmToolsManager.activateBulkSeedBrush(crop);
      },
      loadImportedState: (imported) => {
        currentGrid = imported.grid;
        flippedGrid = imported.flippedGrid || {};
        constructions = imported.constructions || {};
        productionState = imported.productionState || {};
        buildingLevels = imported.buildingLevels || {};
        upgradesInProgress = imported.upgradesInProgress || {};
        farmlandState = imported.farmlandState || {};
        landUnlockedChunks = Array.isArray(imported.land?.unlockedChunks) ? imported.land.unlockedChunks : [...INITIAL_UNLOCKED_CHUNKS];
        if (imported.economy) {
          gameMode = imported.economy.gameMode || "game";
          playerGold = typeof imported.economy.playerGold === "number" ? imported.economy.playerGold : INITIAL_GOLD;
          if (typeof imported.economy.playerGems === "number") playerGems = imported.economy.playerGems;
        }
        if (imported.storage) {
          if (typeof imported.storage.siloCapacity === "number") siloCapacity = imported.storage.siloCapacity;
          if (typeof imported.storage.barnCapacity === "number") barnCapacity = imported.storage.barnCapacity;
        }
        if (imported.livestockState && typeof imported.livestockState === "object") {
          livestockState = imported.livestockState;
        }
        if (imported.fruitTreesState && typeof imported.fruitTreesState === "object") {
          fruitTreesState = imported.fruitTreesState;
        }
        if (imported.playerXP !== undefined) {
          playerXP = imported.playerXP;
          playerLevel = 1;
          for (let i = PLAYER_LEVEL_CONFIG.length - 1; i >= 0; i--) {
            if (playerXP >= PLAYER_LEVEL_CONFIG[i].xpReq) {
              playerLevel = PLAYER_LEVEL_CONFIG[i].level;
              break;
            }
          }
        } else if (imported.playerLevel) {
          playerLevel = imported.playerLevel;
        }
        if (imported.resources) {
          playerResources = { ...playerResources, ...imported.resources };
        }
        if (orderBoardManager && imported.orderBoard) {
          orderBoardManager.restoreFromSave(imported.orderBoard);
        }
        if (townVisitorManager && imported.townVisitors) {
          townVisitorManager.init(imported.townVisitors);
        }
        if (townCaretakerManager && imported.townCaretaker) {
          townCaretakerManager.init(imported.townCaretaker);
        }
        if (harborShipManager && imported.harborShip) {
          harborShipManager.init(imported.harborShip);
        }
        if (kingdomWondersManager && imported.kingdomWonders) {
          kingdomWondersManager.init(imported.kingdomWonders);
        }
        if (dailyWheelManager && imported.dailyWheel) {
          dailyWheelManager.init(imported.dailyWheel);
        }
        if (seasonalThemeManager && imported.activeSeason) {
          seasonalThemeManager.setSeason(imported.activeSeason);
        }
        undoStack = [];
        redoStack = [];
        updateUndoRedoButtons();
        updateGoldDisplay();
        updateResourcesUI();
        updateModeUI();
        updateVillageStatsUI();
        checkQuestsProgress();
        persistGameState();
      }
    });

    // Global Dev testing shortcut for console or instant testing
    window.loadDevTestSave = () => {
      if (uiModalController && uiModalController.loadImportedState) {
        uiModalController.loadImportedState(DEV_FULL_VILLAGE_SAVE);
      }
      centerCamera();
      requestRender();
      playBuildSound();
      showToast("🛠️ Đã nạp thành công Bản Đồ Dev Test (Full Map 64 Chunks & Full Nhà)!", "success");
    };

    const openQuestModal = () => uiModalController.openQuestModal();
    const closeQuestModal = () => uiModalController.closeQuestModal();
    const renderQuestList = () => uiModalController.renderQuestList();
    const openMarketModal = () => uiModalController.openMarketModal();
    const closeMarketModal = () => uiModalController.closeMarketModal();
    const renderMarketModal = () => uiModalController.renderMarketModal();
    const openSeedModal = (r, c) => uiModalController.openSeedModal(r, c);
    const closeSeedModal = () => uiModalController.closeSeedModal();
    const renderSeedModal = () => uiModalController.renderSeedModal();
    const openSettingsModal = () => uiModalController.openSettingsModal();
    const closeSettingsModal = () => uiModalController.closeSettingsModal();





    // SHOP MODAL CATEGORIZED
    const shopModal = document.getElementById("shop-modal");
    const shopModalClose = document.getElementById("shop-modal-close");
    const btnOpenShop = document.getElementById("btn-open-shop");
    const shopItemsContainer = document.getElementById("shop-items-container");
    const shopBtnFreeCursor = document.getElementById("shop-btn-free-cursor");
    let activeShopCategory = 'all';

    function openShopModal() {
      if (!shopModal) return;
      playModalOpenSound();

      if (tutorialManager && tutorialManager.isActive()) {
        const step = tutorialManager.getCurrentStep();
        if (step === 1) {
          activeShopCategory = 'farming';
        } else if (step === 5) {
          activeShopCategory = 'residential';
        }
      }

      // Đồng bộ trạng thái active của tab danh mục
      document.querySelectorAll("#shop-category-tabs .shop-tab-btn").forEach(btn => {
        if (btn.getAttribute("data-shop-cat") === activeShopCategory) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      renderShopItems();
      shopModal.classList.add("open");

      if (shopItemsContainer) shopItemsContainer.scrollTop = 0;
      const modalBody = shopModal.querySelector(".shop-modal-body");
      if (modalBody) modalBody.scrollTop = 0;
      const card = shopModal.querySelector(".shop-modal-card");
      if (card) card.scrollTop = 0;
    }

    function closeShopModal() {
      if (shopModal) {
        playModalCloseSound();
        shopModal.classList.remove("open");
      }
    }

    if (btnOpenShop) btnOpenShop.addEventListener("click", openShopModal);
    const btnToggleDemolish = document.getElementById("btn-toggle-demolish");
    if (btnToggleDemolish) {
      btnToggleDemolish.addEventListener("click", () => {
        playUIClickSound();
        if (activeBrush === "erase") {
          setActiveBrush(null);
          showToast("Đã tắt công cụ Phá Dỡ (Con trỏ tự do)", "info");
        } else {
          setActiveBrush("erase");
          showToast("❌ Đã bật Phá Dỡ [D]: Nhấp vào bất kỳ công trình, đài phun nước, cây cối... để dỡ bỏ và hoàn tiền 50%!", "info");
        }
      });
    }
    if (shopModalClose) shopModalClose.addEventListener("click", closeShopModal);
    if (shopBtnFreeCursor) {
      shopBtnFreeCursor.addEventListener("click", () => {
        setActiveBrush(null);
        closeShopModal();
        showToast("Đã chọn Con trỏ tự do", "info");
      });
    }

    if (shopModal) {
      shopModal.addEventListener("click", function(e) {
        if (e.target === shopModal) closeShopModal();
      });
    }

    // Storage Badges & Modals Listeners
    const hudSiloBadge = document.getElementById("hud-storage-silo-badge");
    const hudBarnBadge = document.getElementById("hud-storage-barn-badge");
    const hudQuickStorageBtn = document.getElementById("hud-quick-storage-btn");
    const storageModalClose = document.getElementById("storage-modal-close");
    const storageDismissBtn = document.getElementById("storage-dismiss-btn");
    const storageTabSilo = document.getElementById("storage-tab-silo");
    const storageTabBarn = document.getElementById("storage-tab-barn");
    const storageUpgradeBtn = document.getElementById("storage-upgrade-btn");

    if (hudSiloBadge) hudSiloBadge.addEventListener("click", () => openStorageModal("silo"));
    if (hudBarnBadge) hudBarnBadge.addEventListener("click", () => openStorageModal("barn"));
    if (hudQuickStorageBtn) hudQuickStorageBtn.addEventListener("click", () => openStorageModal("silo"));
    if (storageModalClose) storageModalClose.addEventListener("click", closeStorageModal);
    if (storageDismissBtn) storageDismissBtn.addEventListener("click", closeStorageModal);
    if (storageTabSilo) storageTabSilo.addEventListener("click", () => {
      currentStorageTab = "silo";
      renderStorageModalContent();
    });
    if (storageTabBarn) storageTabBarn.addEventListener("click", () => {
      currentStorageTab = "barn";
      renderStorageModalContent();
    });
    if (storageUpgradeBtn) storageUpgradeBtn.addEventListener("click", upgradeStorageCurrentTab);

    // Storage Full Warning Listeners
    const storageFullCloseBtn = document.getElementById("storage-full-close-btn");
    const storageFullUpgradeBtn = document.getElementById("storage-full-upgrade-btn");
    const storageFullOrdersBtn = document.getElementById("storage-full-orders-btn");
    const storageFullModal = document.getElementById("storage-full-modal");

    if (storageFullCloseBtn) storageFullCloseBtn.addEventListener("click", closeStorageFullModal);
    if (storageFullUpgradeBtn) storageFullUpgradeBtn.addEventListener("click", () => {
      const type = storageFullModal?.dataset?.fullType || "silo";
      closeStorageFullModal();
      openStorageModal(type);
    });
    if (storageFullOrdersBtn) storageFullOrdersBtn.addEventListener("click", () => {
      closeStorageFullModal();
      if (orderBoardManager) orderBoardManager.openModal();
    });

    // Construction Speedup Listeners
    const speedupCloseBtn = document.getElementById("construction-speedup-close");
    const speedupWaitBtn = document.getElementById("construction-wait-btn");
    const speedupActionBtn = document.getElementById("construction-speedup-btn");

    if (speedupCloseBtn) speedupCloseBtn.addEventListener("click", closeConstructionSpeedupModal);
    if (speedupWaitBtn) speedupWaitBtn.addEventListener("click", closeConstructionSpeedupModal);
    if (speedupActionBtn) speedupActionBtn.addEventListener("click", speedupCurrentConstruction);

    // Livestock Modal Listeners
    const livestockCloseBtn = document.getElementById("livestock-modal-close");
    const livestockDismissBtn = document.getElementById("livestock-modal-dismiss-btn");

    if (livestockCloseBtn) livestockCloseBtn.addEventListener("click", closeLivestockModal);
    if (livestockDismissBtn) livestockDismissBtn.addEventListener("click", closeLivestockModal);

    // Land Expansion Modal Listeners
    const landCloseBtn = document.getElementById("land-modal-close");
    const landCancelBtn = document.getElementById("land-modal-cancel-btn");
    const landConfirmBtn = document.getElementById("land-modal-confirm-btn");

    if (landCloseBtn) landCloseBtn.addEventListener("click", closeLandExpansionModal);
    if (landCancelBtn) landCancelBtn.addEventListener("click", closeLandExpansionModal);
    if (landConfirmBtn) landConfirmBtn.addEventListener("click", confirmLandExpansion);

    document.querySelectorAll("[data-shop-cat]").forEach(catBtn => {
      catBtn.addEventListener("click", () => {
        document.querySelectorAll("[data-shop-cat]").forEach(b => b.classList.remove("active"));
        catBtn.classList.add("active");
        activeShopCategory = catBtn.getAttribute("data-shop-cat");
        renderShopItems();
      });
    });

    function renderShopItems() {
      if (!shopItemsContainer) return;
      shopItemsContainer.innerHTML = "";

      if (activeShopCategory === 'erase') {
        const card = document.createElement("div");
        card.className = "shop-item-card" + (activeBrush === "erase" ? " selected" : "");
        card.innerHTML = `
          <div class="shop-item-thumb" style="font-size: 2.5rem; line-height: 1.2;">❌</div>
          <div class="shop-item-name">Phá Dỡ & Dọn Dẹp</div>
          <div class="shop-item-desc">Click vào công trình để phá dỡ và hoàn tiền 100%.</div>
          <div class="shop-item-badges mt-2">
            <span class="shop-item-cost" style="background:#fee2e2; border-color:#fca5a5; color:#b91c1c;">Miễn phí</span>
          </div>
        `;
        card.addEventListener("click", () => {
          setActiveBrush("erase");
          closeShopModal();
          showToast("❌ Đã bật Công cụ Phá dỡ! Nhấp vào ô công trình để xóa.", "info");
        });
        shopItemsContainer.appendChild(card);
        return;
      }

      const filtered = TILES_DATA.filter(t => {
        if (activeShopCategory === 'all') return true;

        if (activeShopCategory === 'residential') {
          return t.category === 'building' && (
            t.id.includes('cottage') || t.id.includes('house') || t.id.includes('manor') ||
            t.id.includes('inn') || t.id.includes('home') || t.id.includes('villa') ||
            t.id.includes('chapel') || t.id.includes('pagoda') || t.id.includes('keep')
          );
        }

        if (activeShopCategory === 'production') {
          return t.category === 'building' && !(
            t.id.includes('cottage') || t.id.includes('house') || t.id.includes('manor') ||
            t.id.includes('inn') || t.id.includes('home') || t.id.includes('villa')
          );
        }

        if (activeShopCategory === 'farming') {
          return t.id.includes('farmland') || t.id.includes('field') || t.id.includes('wheat') ||
                 t.id.includes('crop') || t.id.includes('hay') || t.id.includes('barn') ||
                 t.id.includes('windmill') || t.id.includes('paddy') || t.id.includes('orchard') ||
                 t.id.includes('picket') || t.id.includes('garden') || t.id.includes('apiary') ||
                 t.id.includes('pasture') || t.id.includes('sheep') || t.id.includes('vineyard') ||
                 t.id.includes('coop') || t.id.includes('chicken') || t.id.includes('cow');
        }

        if (activeShopCategory === 'roads') {
          return t.category === 'road' || t.id.includes('bridge') || t.id.includes('cobble') ||
                 t.id.includes('path') || t.id.includes('plaza') || t.id.includes('stair') ||
                 t.id.includes('road') || t.id.includes('quay') || t.id.includes('ford');
        }

        if (activeShopCategory === 'decor') {
          return t.category === 'decoration' || t.category === 'decor' || t.category === 'nature' ||
                 t.id.startsWith('d') || t.id.includes('flower') || t.id.includes('tree') ||
                 t.id.includes('park') || t.id.includes('grove') || t.id.includes('well') ||
                 t.id.includes('fountain') || t.id.includes('statue') || t.id.includes('lamp') ||
                 t.id.includes('cart') || t.id.includes('wagon') || t.id.includes('bench');
        }

        if (activeShopCategory === 'nature') {
          return t.category === 'terrain' || t.category === 'biome' || t.category === 'landmark' ||
                 t.id.startsWith('s') || t.id.startsWith('m') || t.id.startsWith('l');
        }

        return t.category === activeShopCategory;
      });

      filtered.forEach(tile => {
        const reqLvl = getTileRequiredLevel(tile.id);
        const isLocked = reqLvl > playerLevel;
        const isPen = tile.id === "b21_chicken_coop" || tile.id === "b22_cow_pasture" || tile.id === "b57_sheep_pasture";
        const maxPens = isPen ? getMaxPenCount(tile.id, playerLevel) : Infinity;
        const builtPens = isPen ? countBuiltPens(tile.id) : 0;
        const isPenLimitReached = isPen && !isLocked && builtPens >= maxPens;

        const card = document.createElement("div");
        card.className = "shop-item-card" + (activeBrush === tile.id ? " selected" : "") + (isLocked || isPenLimitReached ? " locked-item" : "");
        const cost = getTileCost(tile.id, tile.category);
        const pop = getTilePopulation(tile.id, tile.category);
        const imgSrc = AESTHETIC_TILE_URIS[tile.id] || ((typeof TILE_DATA_URIS !== 'undefined' && TILE_DATA_URIS[tile.id]) ? TILE_DATA_URIS[tile.id] : ('tiles/' + tile.id + '_128.png'));

        let penBadge = "";
        if (isPen && !isLocked) {
          penBadge = `<span style="font-size:0.68rem; padding:1px 5px; border-radius:4px; background:${isPenLimitReached ? '#fee2e2' : '#e0f2fe'}; color:${isPenLimitReached ? '#b91c1c' : '#0369a1'}; font-weight:700;">Chuồng: ${builtPens}/${maxPens}</span>`;
        }

        card.innerHTML = `
          ${isLocked ? `<div class="locked-badge-overlay">🔒 Cần Cấp ${reqLvl}</div>` : (isPenLimitReached ? `<div class="locked-badge-overlay" style="background: rgba(15, 23, 42, 0.75); color: #facc15;">🛖 Đầy chuồng (${builtPens}/${maxPens})</div>` : '')}
          <img class="shop-item-thumb" src="${imgSrc}" alt="${tile.label}" onerror="this.onerror=null; this.src='tiles/d12_meadow_wildflowers_128.png';" />
          <div class="shop-item-name">${tile.label}</div>
          <div class="shop-item-desc">${tile.doc || "Công trình trang trí vương quốc."}</div>
          <div class="shop-item-badges">
            <span class="shop-item-cost">${cost === 0 ? "Miễn phí" : `${cost} 🪙`}</span>
            ${pop > 0 ? `<span class="shop-item-pop">+${pop} 👥</span>` : ''}
            ${reqLvl > 1 ? `<span style="font-size:0.68rem; padding:1px 5px; border-radius:4px; background:${isLocked ? '#fee2e2' : '#f0fdf4'}; color:${isLocked ? '#b91c1c' : '#15803d'}; font-weight:700;">Lv.${reqLvl}</span>` : ''}
            ${penBadge}
          </div>
        `;

        card.addEventListener("click", () => {
          if (isLocked) {
            playErrorSound();
            showToast(`🔒 Bạn cần đạt Cấp ${reqLvl} để mở khóa công trình "${tile.label}"! Hãy trồng trọt và làm nhiệm vụ để lên cấp.`, "error");
            return;
          }
          if (isPenLimitReached) {
            playErrorSound();
            const nextInfo = getNextPenUnlockInfo(tile.id, playerLevel);
            if (nextInfo) {
              showToast(`⚠️ Bạn đã xây tối đa ${maxPens} chuồng ở Cấp ${playerLevel}! Đạt Cấp ${nextInfo.nextLevel} để mở thêm chuồng tiếp theo.`, "warning");
            } else {
              showToast(`⚠️ Bạn đã xây tối đa ${maxPens} chuồng (giới hạn cao nhất của vương quốc)!`, "warning");
            }
            return;
          }
          setActiveBrush(tile.id);
          closeShopModal();
          showToast(`🏗️ Đã chọn: ${tile.label}`, "info");
        });

        shopItemsContainer.appendChild(card);
      });
    }

    // =========================================================================
    // FARM TOOLS (LIỀM & XẺNG) SYSTEM (Refactored to src/engine/farmTools.js)
    // =========================================================================
    farmToolsManager = createFarmToolsManager({
      getCurrentGrid: () => currentGrid,
      getFarmlandState: () => farmlandState,
      getPlayerGold: () => playerGold,
      deductGold: (amt) => {
        playerGold -= amt;
        updateGoldDisplay();
      },
      addPlayerXP: (amt, reason) => addPlayerXP(amt, reason),
      updateGoldDisplay: () => updateGoldDisplay(),
      updateResourcesUI: () => updateResourcesUI(),
      getPlayerResources: () => playerResources,
      incrementHarvestCount: () => { totalHarvestsCount++; },
      showToast: (msg, type) => showToast(msg, type),
      addFloatingText: (opt) => addFloatingText(opt),
      spawnSlashEffect: (c, r) => spawnSlashEffect(c, r),
      spawnFlyingCoin: (c, r, count) => spawnFlyingCoin(c, r, count),
      spawnFlyingXP: (c, r, amt) => spawnFlyingXP(c, r, amt),
      spawnFlyingProduce: (c, r, icon) => spawnFlyingProduce(c, r, icon),
      setActiveBrush: (brush) => setActiveBrush(brush),
      clearMovingBuilding: () => {
        movingBuilding = null;
        updateFloatingBrushHUD();
      },
      checkAndFeedBakeries: () => checkAndFeedBakeries(),
      saveGameEconomyState: () => saveGameEconomyState(),
      persistGameState: () => persistGameState(),
      checkQuestsProgress: (showToast) => checkQuestsProgress(showToast),
      onTutorialAction: (action, payload) => tutorialManager.onAction(action, payload),
      getCropYieldMultiplier: () => (townEventsManager ? townEventsManager.getCropYieldMultiplier() : 1),
      getXpMultiplier: () => (townEventsManager ? townEventsManager.getXpMultiplier() : 1.0),
      openSeedModal: (row, col) => uiModalController.openSeedModal(row, col),
      getSiloCapacity: () => siloCapacity,
      showStorageFullModal: (type) => showStorageFullModal(type),
      requestRender: () => requestRender()
    });





    // Upgrade & Building Inspection Manager (Refactored to src/engine/upgradeManager.js)
    const upgradeManager = createUpgradeManager({
      getCurrentGrid: () => currentGrid,
      getFlippedGrid: () => flippedGrid,
      getTileMap: () => tileMap,
      getBuildingLevels: () => buildingLevels,
      getUpgradesInProgress: () => upgradesInProgress,
      getPlayerGold: () => playerGold,
      getPlayerResources: () => playerResources,
      getGameMode: () => gameMode,
      deductGold: (amt) => {
        playerGold -= amt;
        updateGoldDisplay();
      },
      deductResources: (resCosts) => {
        for (const [rKey, reqQty] of Object.entries(resCosts)) {
          playerResources[rKey] = Math.max(0, (playerResources[rKey] || 0) - reqQty);
        }
        updateResourcesUI();
      },
      saveFlippedGrid,
      persistGameState,
      showToast,
      requestRender,
      eraseCell: (r, c) => eraseCell(r, c),
      setMovingBuilding: (info) => { movingBuilding = info; },
      triggerAutoSave
    });

    // Erase cell logic
    function eraseCell(row, col) {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
      const tid = currentGrid[row]?.[col];
      if (isProtectedTile(row, col, tid)) {
        if (col <= 5) {
          showToast("🌊 Vùng biển đại dương & bờ cảng tự nhiên của vương quốc, không thể gỡ bỏ!", "warning");
        } else {
          showToast("🏛️ Công trình mặc định của vương quốc, không thể gỡ bỏ!", "warning");
        }
        return false;
      }
      if (isIndestructibleTile(tid)) {
        showToast("🏛️ Nhà kho vương quốc là công trình thiết yếu, không thể gỡ bỏ!", "warning");
        return false;
      }
      if (gameMode === "game" && !isCellUnlocked(row, col, landUnlockedChunks, gameMode)) {
        showToast("🔒 Không thể sửa đổi vùng đất chưa được mở khóa!", "warning");
        return false;
      }
      const key = `${row}_${col}`;
      delete flippedGrid[key];
      delete farmlandState[key];
      saveFlippedGrid();

      if (constructions[key]) {
        const c = constructions[key];
        const t = tileMap[c.targetTileId];
        const cost = (gameMode === "game" && t) ? getTileCost(c.targetTileId, t.category) : 0;
        delete constructions[key];
        saveConstructionsState();
        if (cost > 0 && gameMode === "game") {
          playerGold += cost;
          updateGoldDisplay();
          saveGameEconomyState();
          showToast(`🛑 Đã hủy xây dựng, hoàn lại 100% (+${cost} 🪙)`, "info");
        }
        updateVillageStatsUI();
        checkQuestsProgress();
        requestRender();
        return true;
      }

      if (currentGrid[row][col] !== "d12_meadow_wildflowers") {
        const oldTid = currentGrid[row][col];
        const oldT = tileMap[oldTid];
        const curLvl = buildingLevels[key] || 1;
        const refundInfo = calculateDemolishRefund(oldTid, oldT ? oldT.category : "building", curLvl, gameMode);
        const baseRefund = refundInfo.baseRefund;
        const upgradeRefund = refundInfo.upgradeRefund;
        const totalRefund = refundInfo.totalRefund;

        // Nếu công trình đang thi công nâng cấp dở dang, hoàn lại 100% chi phí lần nâng cấp đó
        if (upgradesInProgress[key]) {
          const u = upgradesInProgress[key];
          if (u.costGold && gameMode === "game") {
            playerGold += u.costGold;
          }
          if (u.costResources) {
            for (const [rKey, reqQty] of Object.entries(u.costResources)) {
              playerResources[rKey] = Math.min(RESOURCE_MAX_CAPACITY, (playerResources[rKey] || 0) + reqQty);
            }
            updateResourcesUI();
          }
          delete upgradesInProgress[key];
        }

        delete buildingLevels[key];

        if (totalRefund > 0 && gameMode === "game") {
          playerGold += totalRefund;
          updateGoldDisplay();
          saveGameEconomyState();
          const detailMsg = upgradeRefund > 0
            ? `(+${totalRefund} 🪙: Gốc ${baseRefund}🪙 [50%] + Nâng cấp ${upgradeRefund}🪙 [70%])`
            : `(+${totalRefund} 🪙 [50% gốc])`;
          showToast(`♻️ Đã dỡ bỏ ${oldT ? oldT.label : ""}, hoàn lại ${detailMsg}`, "success");
        }
        delete productionState[key];
        saveProductionState();
        if (livestockState && livestockState[key]) {
          delete livestockState[key];
        }
        currentGrid[row][col] = "d12_meadow_wildflowers";
        updateVillageStatsUI();
        checkQuestsProgress();
        persistGameState();
        requestRender();
        return true;
      }

      return false;
    }

    // Process active constructions tick
    function updateConstructions() {
      const now = Date.now();
      let hasFinished = false;
      for (const [key, c] of Object.entries(constructions)) {
        if (now - c.startTime >= c.durationMs) {
          currentGrid[c.row][c.col] = c.targetTileId;
          if (c.flipped) {
            flippedGrid[key] = true;
          } else {
            delete flippedGrid[key];
          }
          if (PRODUCTION_BUILDINGS[c.targetTileId]) {
            productionState[key] = { lastHarvest: now, ready: false };
          }
          delete constructions[key];
          hasFinished = true;
          const t = tileMap[c.targetTileId];
          showToast(`🏗️ Đã hoàn thành xây dựng ${t ? t.label : c.targetTileId}!`, "success");
        }
      }

      // 2. Tick nâng cấp công trình (1B)
      for (const [key, u] of Object.entries(upgradesInProgress)) {
        if (now - u.startTime >= u.durationMs) {
          buildingLevels[key] = u.targetLevel;
          delete upgradesInProgress[key];
          hasFinished = true;
          const tid = currentGrid[u.row][u.col];
          const t = tileMap[tid];
          showToast(`🎉 Nâng cấp ${t ? t.label : "công trình"} lên Cấp ${u.targetLevel} hoàn tất!`, "success");
        }
      }
      if (hasFinished) {
        saveConstructionsState();
        saveFlippedGrid();
        updateVillageStatsUI();
        checkQuestsProgress();
        persistGameState();
        requestRender();
      }
    }

    // =========================================================================
    // STORAGE & SILO/BARN MANAGEMENT
    // =========================================================================
    let currentStorageTab = "silo"; // "silo" | "barn"

    function updateStorageHUD() {
      const sUsed = getSiloUsed(playerResources);
      const bUsed = getBarnUsed(playerResources);

      const siloCountEl = document.getElementById("hud-silo-count");
      const barnCountEl = document.getElementById("hud-barn-count");
      const siloBadge = document.getElementById("storage-badge-silo");
      const barnBadge = document.getElementById("storage-badge-barn");

      if (siloCountEl) siloCountEl.textContent = `${sUsed}/${siloCapacity}`;
      if (barnCountEl) barnCountEl.textContent = `${bUsed}/${barnCapacity}`;
      if (siloBadge) siloBadge.textContent = `${sUsed}/${siloCapacity}`;
      if (barnBadge) barnBadge.textContent = `${bUsed}/${barnCapacity}`;
    }

    function openStorageModal(tab = "silo") {
      currentStorageTab = tab;
      const modal = document.getElementById("storage-modal");
      renderStorageModalContent();
      if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
      }
      playModalOpenSound();
    }

    function closeStorageModal() {
      const modal = document.getElementById("storage-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
      }
      playModalCloseSound();
    }

    function renderStorageModalContent() {
      const isSilo = currentStorageTab === "silo";
      const tabSiloBtn = document.getElementById("storage-tab-silo");
      const tabBarnBtn = document.getElementById("storage-tab-barn");
      const capTitle = document.getElementById("storage-cap-title");
      const capValue = document.getElementById("storage-cap-value");
      const meterFill = document.getElementById("storage-meter-fill");
      const gridEl = document.getElementById("storage-items-grid");

      if (tabSiloBtn) tabSiloBtn.classList.toggle("active", isSilo);
      if (tabBarnBtn) tabBarnBtn.classList.toggle("active", !isSilo);

      const used = isSilo ? getSiloUsed(playerResources) : getBarnUsed(playerResources);
      const cap = isSilo ? siloCapacity : barnCapacity;
      const pct = Math.min(100, Math.round((used / cap) * 100));

      if (capTitle) capTitle.textContent = isSilo ? "Sức chứa Kho Nông Sản (Silo):" : "Sức chứa Kho Thành Phẩm (Barn):";
      if (capValue) capValue.textContent = `${used} / ${cap}`;
      if (meterFill) {
        meterFill.style.width = `${pct}%`;
        meterFill.classList.toggle("near-full", pct >= 90);
      }

      const resList = isSilo ? SILO_RESOURCE_IDS : BARN_RESOURCE_IDS;
      if (gridEl) {
        gridEl.innerHTML = resList.map(id => {
          const cfg = RESOURCES_CONFIG[id];
          const qty = playerResources[id] || 0;
          return `
            <div class="storage-item-card" style="opacity: ${qty > 0 ? '1' : '0.45'};">
              <div class="storage-item-ico">${cfg?.icon || '📦'}</div>
              <div class="storage-item-name">${cfg?.name || id}</div>
              <div class="storage-item-qty">${qty} ${cfg?.unitName || ''}</div>
            </div>
          `;
        }).join("");
      }

      updateStorageHUD();
    }

    function upgradeStorageCurrentTab() {
      const costGold = 200;
      const costGems = 5;

      if (playerGold < costGold) {
        playErrorSound();
        showToast(`⚠️ Không đủ vàng để nâng cấp kho! Cần ${costGold} 🪙 (Hiện có: ${playerGold} 🪙)`, "error");
        return;
      }
      if (playerGems < costGems) {
        playErrorSound();
        showToast(`⚠️ Không đủ Ruby 💎 để nâng cấp kho! Cần ${costGems} 💎 (Hiện có: ${playerGems} 💎)`, "error");
        return;
      }

      playerGold -= costGold;
      deductGems(costGems);

      if (currentStorageTab === "silo") {
        siloCapacity += 25;
        showToast(`🎉 Đã nâng cấp Kho Silo (+25 Sức Chứa)! Sức chứa mới: ${siloCapacity}`, "success");
      } else {
        barnCapacity += 25;
        showToast(`🎉 Đã nâng cấp Kho Barn (+25 Sức Chứa)! Sức chứa mới: ${barnCapacity}`, "success");
      }

      playUpgradeSound();
      updateGoldDisplay();
      updateResourcesUI();
      persistGameState();
      renderStorageModalContent();
    }

    function showStorageFullModal(type = "silo") {
      const modal = document.getElementById("storage-full-modal");
      const titleEl = document.getElementById("storage-full-title");
      const descEl = document.getElementById("storage-full-desc");

      if (type === "silo") {
        const sUsed = getSiloUsed(playerResources);
        if (titleEl) titleEl.textContent = "🌾 Kho Nông Sản (Silo) Đã Đầy!";
        if (descEl) descEl.textContent = `Sức chứa kho nông sản (${sUsed}/${siloCapacity}) đã đạt giới hạn tối đa. Bạn cần giải phóng nông sản bằng cách giao đơn hàng hoặc nâng cấp Silo để tiếp tục thu hoạch.`;
      } else {
        const bUsed = getBarnUsed(playerResources);
        if (titleEl) titleEl.textContent = "📦 Kho Thành Phẩm (Barn) Đã Đầy!";
        if (descEl) descEl.textContent = `Sức chứa kho vật tư & thành phẩm (${bUsed}/${barnCapacity}) đã đạt giới hạn tối đa. Bạn cần hoàn thành đơn hàng cho NPC hoặc nâng cấp Barn để tiếp tục thu hoạch.`;
      }

      if (modal) {
        modal.dataset.fullType = type;
        modal.classList.remove("hidden");
        modal.style.display = "flex";
      }
      playErrorSound();
    }

    function closeStorageFullModal() {
      const modal = document.getElementById("storage-full-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
      }
    }

    // =========================================================================
    // CONSTRUCTION SPEEDUP WITH RUBY/GEMS
    // =========================================================================
    let activeSpeedupCell = null;
    let speedupTimerInterval = null;

    function openConstructionSpeedupModal(row, col) {
      const key = `${row}_${col}`;
      const c = constructions[key];
      if (!c) return;

      activeSpeedupCell = { row, col };
      const modal = document.getElementById("construction-speedup-modal");
      const titleEl = document.getElementById("construction-speedup-title");
      const descEl = document.getElementById("construction-speedup-desc");
      const costEl = document.getElementById("construction-speedup-cost");
      const timeEl = document.getElementById("construction-speedup-time");
      const progEl = document.getElementById("construction-speedup-progress");
      const prevEl = document.getElementById("construction-speedup-preview");

      const t = tileMap[c.targetTileId];
      if (titleEl) titleEl.textContent = `🏗️ ${t ? t.label : 'Công Trình'}`;
      if (descEl) descEl.textContent = t ? (t.doc || "Công trình đang được các thợ xây hoàn thiện.") : "Đang thi công...";
      if (prevEl) {
        prevEl.innerHTML = `<span style="font-size: 2.4rem;">${t?.icon || '🏛️'}</span>`;
      }

      function refreshSpeedupUI() {
        const curC = constructions[key];
        if (!curC) {
          closeConstructionSpeedupModal();
          return;
        }
        const now = Date.now();
        const elapsed = now - curC.startTime;
        const remSec = Math.max(0, Math.ceil((curC.durationMs - elapsed) / 1000));
        const pct = Math.min(100, Math.max(0, (elapsed / curC.durationMs) * 100));
        const gemCost = getGemSpeedupCost(remSec);

        if (timeEl) timeEl.textContent = `⏳ Còn lại: ${remSec}s`;
        if (progEl) progEl.style.width = `${pct}%`;
        if (costEl) costEl.textContent = gemCost.toString();
      }

      refreshSpeedupUI();
      if (speedupTimerInterval) clearInterval(speedupTimerInterval);
      speedupTimerInterval = setInterval(refreshSpeedupUI, 1000);

      if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
      }
      playModalOpenSound();
    }

    function closeConstructionSpeedupModal() {
      activeSpeedupCell = null;
      if (speedupTimerInterval) {
        clearInterval(speedupTimerInterval);
        speedupTimerInterval = null;
      }
      const modal = document.getElementById("construction-speedup-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
      }
    }

    function speedupCurrentConstruction() {
      if (!activeSpeedupCell) return;
      const key = `${activeSpeedupCell.row}_${activeSpeedupCell.col}`;
      const c = constructions[key];
      if (!c) {
        closeConstructionSpeedupModal();
        return;
      }
      const now = Date.now();
      const elapsed = now - c.startTime;
      const remSec = Math.max(0, Math.ceil((c.durationMs - elapsed) / 1000));
      const gemCost = getGemSpeedupCost(remSec);

      if (playerGems < gemCost) {
        playErrorSound();
        showToast(`⚠️ Không đủ Ruby 💎! Cần ${gemCost} 💎 (Hiện có: ${playerGems} 💎)`, "error");
        return;
      }

      deductGems(gemCost);
      currentGrid[c.row][c.col] = c.targetTileId;
      if (c.flipped) {
        flippedGrid[key] = true;
      } else {
        delete flippedGrid[key];
      }
      if (PRODUCTION_BUILDINGS[c.targetTileId]) {
        productionState[key] = { lastHarvest: now, ready: false };
      }
      if (FRUIT_TREES_CONFIG[c.targetTileId]) {
        productionState[key] = { lastHarvest: 0, ready: true };
        fruitTreesState[key] = { lastHarvest: 0 };
      }
      delete constructions[key];

      playBuildSound();
      updateVillageStatsUI();
      checkQuestsProgress();
      persistGameState();
      requestRender();

      const t = tileMap[c.targetTileId];
      showToast(`⚡ Đã dùng ${gemCost} 💎 hoàn thành ngay: ${t ? t.label : c.targetTileId}!`, "success");
      closeConstructionSpeedupModal();
    }

    // =========================================================================
    // LAND EXPANSION SYSTEM (MỞ RỘNG ĐẤT BẰNG VÀNG & NGUYÊN LIỆU)
    // =========================================================================
    let pendingExpansionChunkId = null;

    function openLandExpansionModal(chunkId) {
      pendingExpansionChunkId = chunkId;
      const modal = document.getElementById("land-modal");
      const subTitleEl = document.getElementById("land-modal-subtitle");
      const goldBoxEl = document.getElementById("land-gold-cost-box");
      const reqListEl = document.getElementById("land-req-items-list");
      const confirmBtn = document.getElementById("land-modal-confirm-btn");

      const cost = getNextChunkCost(landUnlockedChunks.length);
      const goldOk = playerGold >= cost.gold;

      const bounds = getChunkBounds(chunkId);
      if (subTitleEl) {
        subTitleEl.textContent = `Vùng đất mới [Cột ${bounds.minCol}-${bounds.maxCol}, Hàng ${bounds.minRow}-${bounds.maxRow}] (16 ô đất màu mỡ)`;
      }

      if (goldBoxEl) {
        goldBoxEl.innerHTML = `
          <div class="land-gold-cost-val">🪙 ${cost.gold.toLocaleString()} Vàng</div>
          <div class="land-gold-status ${goldOk ? 'ok' : 'missing'}">
            ${goldOk ? `✓ Đủ (Có: ${playerGold.toLocaleString()})` : `✕ Thiếu ${(cost.gold - playerGold).toLocaleString()}`}
          </div>
        `;
      }

      let allResOk = true;
      if (reqListEl) {
        const reqEntries = Object.entries(cost.resources || {});
        if (reqEntries.length === 0) {
          reqListEl.innerHTML = `<div style="font-size: 0.85rem; color: #94a3b8; padding: 4px 0;">Không cần thêm nguyên liệu.</div>`;
        } else {
          let html = "";
          for (const [resKey, reqQty] of reqEntries) {
            const resCfg = RESOURCES_CONFIG[resKey] || { name: resKey, icon: "📦" };
            const curQty = playerResources[resKey] || 0;
            const ok = curQty >= reqQty;
            if (!ok) allResOk = false;
            html += `
              <div class="land-req-row">
                <div class="land-req-left">
                  <span class="land-req-ico">${resCfg.icon}</span>
                  <span>${resCfg.name}</span>
                </div>
                <div class="land-req-badge ${ok ? 'ok' : 'missing'}">
                  ${curQty}/${reqQty} ${ok ? '✓ Đủ' : `(Thiếu ${reqQty - curQty})`}
                </div>
              </div>
            `;
          }
          reqListEl.innerHTML = html;
        }
      }

      const canAfford = goldOk && allResOk;
      if (confirmBtn) {
        if (canAfford) {
          confirmBtn.disabled = false;
          confirmBtn.classList.remove("disabled");
          confirmBtn.innerHTML = "🏰 Khai Hoang Ngay";
        } else {
          confirmBtn.disabled = true;
          confirmBtn.classList.add("disabled");
          confirmBtn.innerHTML = "⚠️ Chưa Đủ Điều Kiện";
        }
      }

      if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
      }
      playModalOpenSound();
    }

    function closeLandExpansionModal() {
      pendingExpansionChunkId = null;
      const modal = document.getElementById("land-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
      }
      playModalCloseSound();
    }

    function confirmLandExpansion() {
      if (pendingExpansionChunkId === null || pendingExpansionChunkId === undefined) return;
      const cId = pendingExpansionChunkId;
      const cost = getNextChunkCost(landUnlockedChunks.length);
      const goldOk = playerGold >= cost.gold;

      let allResOk = true;
      for (const [resKey, reqQty] of Object.entries(cost.resources || {})) {
        if ((playerResources[resKey] || 0) < reqQty) {
          allResOk = false;
          break;
        }
      }

      if (!goldOk || !allResOk) {
        playErrorSound();
        showToast("⚠️ Bạn chưa có đủ Vàng hoặc Nguyên liệu để khai hoang!", "error");
        return;
      }

      // Deduct gold & resources
      playerGold -= cost.gold;
      for (const [resKey, reqQty] of Object.entries(cost.resources || {})) {
        playerResources[resKey] = Math.max(0, (playerResources[resKey] || 0) - reqQty);
      }

      landUnlockedChunks.push(cId);
      playLandExpandSound();
      updateGoldDisplay();
      updateResourcesUI();
      addPlayerXP(35, "Khai hoang lãnh thổ");
      updateVillageStatsUI();
      checkQuestsProgress();
      persistGameState();
      requestRender();

      showToast(`🎉 Khai hoang thành công mảnh đất mới! (-${cost.gold.toLocaleString()} 🪙)`, "success");
      closeLandExpansionModal();
    }

    // =========================================================================
    // LIVESTOCK SYSTEM (CHUỒNG GÀ, CHUỒNG BÒ, CHUỒNG CỪU - 3 TRẠNG THÁI)
    // =========================================================================
    let activeLivestockCell = null;
    let livestockTimerInterval = null;

    const LIVESTOCK_CONFIG = {
      b21_chicken_coop: {
        title: "Chuồng Gà Đẻ Trứng",
        animalName: "Gà mái",
        animalIcon: "🐔",
        feedRes: "wheat",
        feedName: "Lúa mì",
        feedIcon: "🌾",
        productRes: "egg",
        productName: "Trứng gà tươi",
        productIcon: "🥚",
        durationSec: 45,
        maxAnimals: 5,
        baseAnimalPrice: 20,
        priceStep: 15,
        goldGain: 25,
        xpGain: 15,
        sound: playChickenCluckSound
      },
      b22_cow_pasture: {
        title: "Chuồng Bò Sữa",
        animalName: "Bò sữa",
        animalIcon: "🐮",
        feedRes: "corn",
        feedName: "Bắp ngô",
        feedIcon: "🌽",
        productRes: "milk",
        productName: "Bình sữa tươi",
        productIcon: "🥛",
        durationSec: 75,
        maxAnimals: 3,
        baseAnimalPrice: 50,
        priceStep: 30,
        goldGain: 50,
        xpGain: 25,
        sound: playCowMooSound
      },
      b57_sheep_pasture: {
        title: "Chuồng Cừu Lấy Lông",
        animalName: "Cừu lông",
        animalIcon: "🐑",
        feedRes: "carrot",
        feedName: "Cà rốt",
        feedIcon: "🥕",
        productRes: "wool",
        productName: "Lông cừu mịn",
        productIcon: "🐑",
        durationSec: 60,
        maxAnimals: 3,
        baseAnimalPrice: 80,
        priceStep: 45,
        goldGain: 40,
        xpGain: 20,
        sound: playSheepBaaSound
      }
    };

    function getLivestockAnimalCost(tid, currentCount) {
      const cfg = LIVESTOCK_CONFIG[tid] || LIVESTOCK_CONFIG.b21_chicken_coop;
      const base = cfg.baseAnimalPrice || 30;
      const step = cfg.priceStep || 15;
      return base + (currentCount || 0) * step;
    }

    function countBuiltPens(tileId) {
      let count = 0;
      for (let r = 0; r < ROWS; r++) {
        if (!currentGrid[r]) continue;
        for (let c = 0; c < COLS; c++) {
          if (currentGrid[r][c] === tileId) count++;
        }
      }
      for (const c of Object.values(constructions)) {
        if (c && c.targetTileId === tileId) count++;
      }
      return count;
    }

    function checkCanPlaceTile(tileId) {
      if (tileId === "b21_chicken_coop" || tileId === "b22_cow_pasture" || tileId === "b57_sheep_pasture") {
        const maxPens = getMaxPenCount(tileId, playerLevel);
        const builtPens = countBuiltPens(tileId);
        if (builtPens >= maxPens) {
          const nextInfo = getNextPenUnlockInfo(tileId, playerLevel);
          return {
            allowed: false,
            isPen: true,
            maxPens,
            builtPens,
            nextInfo
          };
        }
        return { allowed: true, isPen: true, maxPens, builtPens };
      }
      return { allowed: true };
    }

    function getLivestockData(row, col) {
      const key = `${row}_${col}`;
      const tid = currentGrid[row]?.[col];
      const cfg = LIVESTOCK_CONFIG[tid] || LIVESTOCK_CONFIG.b21_chicken_coop;

      if (!livestockState[key]) {
        livestockState[key] = {
          animalCount: 0, // Chuồng mới xây hoàn toàn trống (0 con)
          state: "empty", // "empty" | "hungry" | "producing" | "ready"
          feedTime: 0,
          durationMs: (cfg.durationSec || 45) * 1000
        };
      }
      const ls = livestockState[key];
      if (ls.animalCount === undefined) {
        ls.animalCount = 0;
      }
      if (ls.animalCount === 0) {
        ls.state = "empty";
      }
      if (ls.state === "producing" && ls.animalCount > 0) {
        const dur = ls.durationMs || ((cfg.durationSec || 45) * 1000);
        if (Date.now() - (ls.feedTime || 0) >= dur) {
          ls.state = "ready";
        }
      }
      return ls;
    }

    function openLivestockModal(row, col) {
      const key = `${row}_${col}`;
      const tid = currentGrid[row]?.[col];
      const cfg = LIVESTOCK_CONFIG[tid];
      if (!cfg) return;

      activeLivestockCell = { row, col, tid, key };
      renderLivestockModalContent();

      if (livestockTimerInterval) clearInterval(livestockTimerInterval);
      livestockTimerInterval = setInterval(() => {
        if (!activeLivestockCell) return;
        const ls = getLivestockData(activeLivestockCell.row, activeLivestockCell.col);
        if (ls.state === "producing" && ls.animalCount > 0) {
          const elapsed = Date.now() - ls.feedTime;
          if (elapsed >= ls.durationMs) {
            ls.state = "ready";
            persistGameState();
            requestRender();
          }
          renderLivestockModalContent();
        }
      }, 1000);

      const modal = document.getElementById("livestock-modal");
      if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
      }
      playModalOpenSound();
    }

    function closeLivestockModal() {
      activeLivestockCell = null;
      if (livestockTimerInterval) {
        clearInterval(livestockTimerInterval);
        livestockTimerInterval = null;
      }
      const modal = document.getElementById("livestock-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
      }
      playModalCloseSound();
    }

    function renderLivestockModalContent() {
      if (!activeLivestockCell) return;
      const { row, col, tid, key } = activeLivestockCell;
      const cfg = LIVESTOCK_CONFIG[tid];
      if (!cfg) return;

      const ls = getLivestockData(row, col);
      const maxLimit = cfg.maxAnimals || 3;

      const iconEl = document.getElementById("livestock-modal-icon");
      const titleEl = document.getElementById("livestock-modal-title");
      const subEl = document.getElementById("livestock-modal-subtitle");
      const bodyEl = document.getElementById("livestock-modal-body");

      if (iconEl) iconEl.textContent = cfg.animalIcon;
      if (titleEl) titleEl.textContent = cfg.title;
      if (subEl) subEl.textContent = `Nuôi tối đa ${maxLimit} con • Cần thức ăn ${cfg.feedName} ${cfg.feedIcon}`;

      const feedOwned = playerResources[cfg.feedRes] || 0;
      const feedNeeded = ls.animalCount;

      let stateHtml = "";
      if (ls.animalCount === 0 || ls.state === "empty") {
        stateHtml = `
          <div class="livestock-state-card" style="border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.08); padding: 14px;">
            <div class="livestock-state-desc" style="line-height: 1.5;">
              🛖 <strong>Chuồng hiện đang trống (0/${maxLimit} con)</strong>
              <br><span style="font-size: 0.85rem; color: #94a3b8;">Nhấn nút <strong>"+ Mua 1 ${cfg.animalName}"</strong> ở trên để mua con giống đầu tiên về chuồng và bắt đầu chăn nuôi!</span>
            </div>
          </div>
        `;
      } else if (ls.state === "hungry") {
        stateHtml = `
          <div class="livestock-state-card">
            <div class="livestock-state-desc">
              🍽️ Đàn ${cfg.animalName} đang đói bụng! Cần <strong>${feedNeeded} ${cfg.feedName} ${cfg.feedIcon}</strong> để cho ăn.
              <br><small style="color: #94a3b8;">(Kho hiện có: ${feedOwned} ${cfg.feedName})</small>
            </div>
            <button type="button" class="livestock-action-btn feed" id="livestock-feed-btn">
              ${cfg.feedIcon} Cho Ăn Ngay (${feedNeeded} ${cfg.feedName})
            </button>
          </div>
        `;
      } else if (ls.state === "producing") {
        const elapsed = Date.now() - ls.feedTime;
        const remSec = Math.max(0, Math.ceil((ls.durationMs - elapsed) / 1000));
        const gemCost = getGemSpeedupCost(remSec);
        stateHtml = `
          <div class="livestock-state-card">
            <div class="livestock-state-desc">
              ⏳ Đàn ${cfg.animalName} (${ls.animalCount} con) đang tiêu hóa & tạo sản phẩm...
              <br><strong style="font-size: 1.1rem; color: #facc15;">Còn lại: ${remSec} giây</strong>
            </div>
            <button type="button" class="livestock-action-btn" id="livestock-speedup-btn" style="background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%); color: #fff;">
              ⚡ Tăng Tốc Ngay (${gemCost} 💎)
            </button>
          </div>
        `;
      } else {
        // ready
        stateHtml = `
          <div class="livestock-state-card">
            <div class="livestock-state-desc">
              ✨ Sản phẩm đã sẵn sàng! Đàn ${cfg.animalName} đã cho <strong>${ls.animalCount} ${cfg.productName} ${cfg.productIcon}</strong>.
            </div>
            <button type="button" class="livestock-action-btn harvest" id="livestock-harvest-btn">
              ${cfg.productIcon} Thu Hoạch Ngay (+${ls.animalCount} ${cfg.productName})
            </button>
          </div>
        `;
      }

      const nextAnimalPrice = getLivestockAnimalCost(tid, ls.animalCount);
      const buyBtnHtml = ls.animalCount < maxLimit
        ? `<button type="button" class="livestock-btn-buy-animal" id="livestock-buy-animal-btn">
             + Mua 1 ${cfg.animalName} (${nextAnimalPrice} 🪙)
           </button>`
        : `<span style="font-size: 0.78rem; color: #10b981; font-weight: 700;">Đã đầy chuồng (${maxLimit}/${maxLimit} con)</span>`;

      if (bodyEl) {
        bodyEl.innerHTML = `
          <div class="livestock-animals-status">
            <div>
              <div style="font-size: 0.82rem; color: #94a3b8;">Số lượng vật nuôi:</div>
              <div class="livestock-count-badge">${ls.animalCount} / ${maxLimit} con ${cfg.animalIcon}</div>
            </div>
            ${buyBtnHtml}
          </div>
          ${stateHtml}
        `;

        const buyBtn = document.getElementById("livestock-buy-animal-btn");
        if (buyBtn) {
          buyBtn.addEventListener("click", () => buyLivestockAnimal(row, col));
        }
        const feedBtn = document.getElementById("livestock-feed-btn");
        if (feedBtn) {
          feedBtn.addEventListener("click", () => feedLivestock(row, col));
        }
        const harvestBtn = document.getElementById("livestock-harvest-btn");
        if (harvestBtn) {
          harvestBtn.addEventListener("click", () => harvestLivestock(row, col));
        }
        const speedupBtn = document.getElementById("livestock-speedup-btn");
        if (speedupBtn) {
          speedupBtn.addEventListener("click", () => speedupLivestock(row, col));
        }
      }
    }

    function buyLivestockAnimal(row, col) {
      const tid = currentGrid[row]?.[col];
      const cfg = LIVESTOCK_CONFIG[tid];
      if (!cfg) return;
      const ls = getLivestockData(row, col);
      const maxLimit = cfg.maxAnimals || 3;

      if (ls.animalCount >= maxLimit) {
        playErrorSound();
        showToast(`⚠️ Chuồng ${cfg.animalName} này đã nuôi tối đa ${maxLimit} con!`, "warning");
        return;
      }

      const cost = getLivestockAnimalCost(tid, ls.animalCount);
      if (playerGold < cost) {
        playErrorSound();
        showToast(`⚠️ Không đủ vàng! Cần ${cost} 🪙 để mua con ${cfg.animalName} tiếp theo.`, "error");
        return;
      }

      playerGold -= cost;
      ls.animalCount++;
      if (ls.state === "empty") {
        ls.state = "hungry";
      }
      updateGoldDisplay();
      cfg.sound();
      playCoinSound();
      showToast(`🎉 Đã mua thêm 1 ${cfg.animalName}! Chuồng hiện có: ${ls.animalCount}/${maxLimit} con (-${cost}🪙).`, "success");
      persistGameState();
      requestRender();
      renderLivestockModalContent();
    }

    function feedLivestock(row, col, silent = false) {
      const tid = currentGrid[row]?.[col];
      const cfg = LIVESTOCK_CONFIG[tid];
      if (!cfg) return false;
      const ls = getLivestockData(row, col);

      if (ls.animalCount <= 0) {
        if (!silent) {
          playErrorSound();
          showToast(`⚠️ Chuồng chưa có ${cfg.animalName}! Hãy mua vật nuôi trước.`, "warning");
        }
        return false;
      }

      if (ls.state !== "hungry") return false;

      const needed = ls.animalCount;
      const owned = playerResources[cfg.feedRes] || 0;
      if (owned < needed) {
        if (!silent) {
          playErrorSound();
          showToast(`⚠️ Không đủ ${cfg.feedName} để cho đàn ${cfg.animalName} ăn! Cần ${needed}, hiện có ${owned}.`, "error");
        }
        return false;
      }

      playerResources[cfg.feedRes] -= needed;
      ls.state = "producing";
      ls.feedTime = Date.now();
      ls.durationMs = cfg.durationSec * 1000;

      if (!silent) {
        cfg.sound();
        showToast(`🌾 Đã cho ${ls.animalCount} chú ${cfg.animalName} ăn ngon lành! Bắt đầu tạo sản phẩm.`, "success");
      }
      updateResourcesUI();
      persistGameState();
      requestRender();
      if (activeLivestockCell) renderLivestockModalContent();
      return true;
    }

    function harvestLivestock(row, col, silent = false) {
      const tid = currentGrid[row]?.[col];
      const cfg = LIVESTOCK_CONFIG[tid];
      if (!cfg) return false;
      const ls = getLivestockData(row, col);

      if (ls.animalCount <= 0) return false;

      if (ls.state === "producing") {
        const dur = ls.durationMs || ((cfg.durationSec || 45) * 1000);
        if (Date.now() - (ls.feedTime || 0) >= dur) {
          ls.state = "ready";
        }
      }

      if (ls.state !== "ready") return false;

      // Check Kho Barn Sức Chứa
      const yieldAmt = ls.animalCount;
      if (getBarnUsed(playerResources) + yieldAmt > barnCapacity) {
        if (!silent) showStorageFullModal("barn");
        return false;
      }

      playerResources[cfg.productRes] = (playerResources[cfg.productRes] || 0) + yieldAmt;
      const goldMult = (townEventsManager && typeof townEventsManager.getGoldMultiplier === "function") ? townEventsManager.getGoldMultiplier() : 1.0;
      const xpMult = (townEventsManager && typeof townEventsManager.getXpMultiplier === "function") ? townEventsManager.getXpMultiplier() : 1.0;
      const goldEarned = Math.round(cfg.goldGain * goldMult);
      const xpEarned = Math.round(cfg.xpGain * xpMult);

      playerGold += goldEarned;
      addPlayerXP(xpEarned, cfg.title);
      totalHarvestsCount++;

      if (!silent) {
        cfg.sound();
        playHarvestPlopSound();
        spawnFlyingCoin(col, row, 4);
        spawnFlyingXP(col, row, xpEarned);
        spawnFlyingProduce(col, row, cfg.productIcon);
        showToast(`🎉 Thu hoạch ${yieldAmt} ${cfg.productName} thành công! (+${goldEarned}🪙, +${xpEarned}XP)`, "success");
      }

      ls.state = "hungry";
      updateGoldDisplay();
      updateResourcesUI();
      persistGameState();
      checkQuestsProgress();
      requestRender();

      if (activeLivestockCell) renderLivestockModalContent();
      return true;
    }

    function speedupLivestock(row, col) {
      const tid = currentGrid[row]?.[col];
      const cfg = LIVESTOCK_CONFIG[tid];
      if (!cfg) return;
      const ls = getLivestockData(row, col);

      if (ls.state !== "producing") return;

      const elapsed = Date.now() - ls.feedTime;
      const remSec = Math.max(0, Math.ceil((ls.durationMs - elapsed) / 1000));
      const gemCost = getGemSpeedupCost(remSec);

      if (playerGems < gemCost) {
        playErrorSound();
        showToast(`⚠️ Không đủ Ruby 💎! Cần ${gemCost} 💎.`, "error");
        return;
      }

      deductGems(gemCost);
      ls.state = "ready";
      cfg.sound();
      persistGameState();
      requestRender();
      showToast(`⚡ Đã dùng ${gemCost} 💎 làm chín sản phẩm ngay lập tức!`, "success");
      renderLivestockModalContent();
    }

    function updateLivestockTick() {
      if (!livestockState) return;
      const now = Date.now();
      let stateChanged = false;
      for (const [key, ls] of Object.entries(livestockState)) {
        if (ls && ls.state === "producing") {
          const dur = ls.durationMs || 45000;
          if (now - (ls.feedTime || 0) >= dur) {
            ls.state = "ready";
            stateChanged = true;
          }
        }
      }
      if (stateChanged) {
        if (activeLivestockCell) renderLivestockModalContent();
        persistGameState();
        requestRender();
      }
    }

    function tryPlaceContinuousBrush(row, col) {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
      if (!activeBrush) return false;
      if (gameMode === "game" && !isCellUnlocked(row, col, landUnlockedChunks, gameMode)) return false;
      const key = `${row}_${col}`;
      if (constructions[key]) return false;
      if (currentGrid[row][col] === activeBrush) return false;

      // Collision Check: Chỉ cho phép vẽ đường / luống đất lên ô cỏ hoa trống
      const curTid = currentGrid[row][col];
      const isEmptyGrass = curTid === "d12_meadow_wildflowers" || curTid === "g01_grass_flat";
      if (!isEmptyGrass) return false;

      const t = tileMap[activeBrush];
      const cost = (gameMode === "game" && t) ? getTileCost(activeBrush, t.category) : 0;
      if (cost > playerGold) return false;

      if (cost > 0) {
        playerGold -= cost;
        updateGoldDisplay();
        saveGameEconomyState();
      }

      currentGrid[row][col] = activeBrush;
      if (brushFlipped) {
        flippedGrid[key] = true;
      } else {
        delete flippedGrid[key];
      }
      if (FRUIT_TREES_CONFIG[activeBrush]) {
        productionState[key] = { lastHarvest: 0, ready: true };
        fruitTreesState[key] = { lastHarvest: 0 };
      }
      playBuildSound();
      saveFlippedGrid();
      updateVillageStatsUI();
      checkQuestsProgress();
      tutorialManager.onAction("build_tile", { tileId: activeBrush });
      requestRender();
      triggerAutoSave();
      return true;
    }

    // Helper: Thu hoạch công trình sản xuất (Dùng chung cho cả click trực tiếp ô đất và click bong bóng)
    function harvestProductionBuilding(row, col, silent = false) {
      const pKey = `${row}_${col}`;
      const curTid = currentGrid[row][col];

      // Nếu là chuồng trại chăn nuôi, chuyển qua logic thu hoạch chăn nuôi chuyên biệt
      if (curTid === "b21_chicken_coop" || curTid === "b22_cow_pasture" || curTid === "b57_sheep_pasture") {
        return harvestLivestock(row, col, silent);
      }

      const prod = PRODUCTION_BUILDINGS[curTid];
      if (!prod || !productionState[pKey] || !productionState[pKey].ready) return false;

      const bLvl = buildingLevels[pKey] || 1;
      const yieldQty = getBuildingYield(curTid, bLvl);

      // Kiểm tra sức chứa kho Silo / Barn trước khi cho phép thu hoạch
      const isSiloItem = curTid === "b04_windmill" || curTid.startsWith("d2");
      if (isSiloItem) {
        if (getSiloUsed(playerResources) + yieldQty > siloCapacity) {
          if (!silent) showStorageFullModal("silo");
          return false;
        }
      } else {
        if (getBarnUsed(playerResources) + yieldQty > barnCapacity) {
          if (!silent) showStorageFullModal("barn");
          return false;
        }
      }

      productionState[pKey].ready = false;
      productionState[pKey].lastHarvest = Date.now();
      totalHarvestsCount++;

      const goldMult = (townEventsManager && typeof townEventsManager.getGoldMultiplier === "function") ? townEventsManager.getGoldMultiplier() : 1.0;
      const baseGold = prod.rewardGold || 25;
      const rewardGoldGain = Math.round(baseGold * goldMult);
      let rewardMsg = `+${yieldQty} ${prod.icon || "📦"} +${rewardGoldGain} 🪙`;

      if (curTid === "b04_windmill") {
        playerResources.wheat = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.wheat || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🌾 +${rewardGoldGain} 🪙`;
        checkAndFeedBakeries();
        spawnFlyingProduce(col, row, "🌾");
        spawnFlyingCoin(col, row, 3);
        spawnFlyingXP(col, row, 4);
      } else if (curTid === "b06_bakery") {
        playerResources.bread = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.bread || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🍞 +${rewardGoldGain} 🪙`;
        spawnFlyingProduce(col, row, "🍞");
        spawnFlyingCoin(col, row, 4);
        spawnFlyingXP(col, row, 6);
      } else if (curTid === "b03_blacksmith_forge") {
        playerResources.ironTools = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.ironTools || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} ⚒️ +${rewardGoldGain} 🪙`;
        spawnFlyingProduce(col, row, "⚒️");
        spawnFlyingCoin(col, row, 4);
        spawnFlyingXP(col, row, 10);
      } else if (curTid === "b21_chicken_coop") {
        playerResources.egg = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.egg || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🥚 +${rewardGoldGain} 🪙`;
        playChickenCluckSound();
        spawnFlyingProduce(col, row, "🥚");
        spawnFlyingCoin(col, row, 3);
        spawnFlyingXP(col, row, 5);
        checkAndFeedBakeries();
      } else if (curTid === "b13_barn_silo" || curTid === "b22_cow_pasture") {
        playerResources.milk = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.milk || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🥛 +${rewardGoldGain} 🪙`;
        playCowMooSound();
        spawnFlyingProduce(col, row, "🥛");
        spawnFlyingCoin(col, row, 4);
        spawnFlyingXP(col, row, 8);
        checkAndFeedBakeries();
      } else if (curTid === "b57_sheep_pasture") {
        playerResources.wool = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.wool || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🐑 +${rewardGoldGain} 🪙`;
        playSheepBaaSound();
        spawnFlyingProduce(col, row, "🐑");
        spawnFlyingCoin(col, row, 4);
        spawnFlyingXP(col, row, 9);
        checkAndFeedBakeries();
      } else if (curTid === "b58_textile_mill") {
        playerResources.fabric = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.fabric || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🧵 +${rewardGoldGain} 🪙`;
        playLoomWeaveSound();
        spawnFlyingProduce(col, row, "🧵");
        spawnFlyingCoin(col, row, 5);
        spawnFlyingXP(col, row, 12);
      } else if (curTid === "b59_dairy_factory") {
        playerResources.butter = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.butter || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🧈 +${rewardGoldGain} 🪙`;
        spawnFlyingProduce(col, row, "🧈");
        spawnFlyingCoin(col, row, 4);
        spawnFlyingXP(col, row, 10);
      } else if (curTid === "b47_winery_press_barn_sw" || curTid === "b48_winery_press_barn_se") {
        playerResources.wine = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.wine || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🍷 +${rewardGoldGain} 🪙`;
        spawnFlyingProduce(col, row, "🍷");
        spawnFlyingCoin(col, row, 6);
        spawnFlyingXP(col, row, 16);
      } else if (curTid === "d21_apple_tree") {
        playerResources.apple = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.apple || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🍎 +${rewardGoldGain} 🪙`;
        playTreeRustleHarvestSound();
        spawnFlyingProduce(col, row, "🍎");
        spawnFlyingCoin(col, row, 3);
        spawnFlyingXP(col, row, 5);
      } else if (curTid === "d22_coconut_palm") {
        playerResources.coconut = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.coconut || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🥥 +${rewardGoldGain} 🪙`;
        playTreeRustleHarvestSound();
        spawnFlyingProduce(col, row, "🥥");
        spawnFlyingCoin(col, row, 4);
        spawnFlyingXP(col, row, 8);
      } else if (curTid === "d23_tamarind_tree") {
        playerResources.tamarind = Math.min(RESOURCE_MAX_CAPACITY, (playerResources.tamarind || 0) + yieldQty);
        updateResourcesUI();
        rewardMsg = `+${yieldQty} 🍈 +${rewardGoldGain} 🪙`;
        playTreeRustleHarvestSound();
        spawnFlyingProduce(col, row, "🍈");
        spawnFlyingCoin(col, row, 3);
        spawnFlyingXP(col, row, 7);
      } else {
        spawnFlyingCoin(col, row, 3);
        spawnFlyingXP(col, row, 4);
      }

      playerGold += rewardGoldGain;
      if (!silent) playCoinSound();
      const xpMultiplier = townEventsManager ? townEventsManager.getXpMultiplier() : 1.0;
      addPlayerXP(Math.round((prod.rewardXP || 15) * xpMultiplier), prod.name);
      updateGoldDisplay();
      saveGameEconomyState();
      persistGameState();

      if (!silent) {
        const ox = ORIGIN_X + (col - row) * HALF_W;
        const oy = ORIGIN_Y + (row + col) * QUARTER_W;
        addFloatingText({
          x: ox + 64,
          y: oy + 20,
          text: rewardMsg,
          startTime: performance.now(),
          duration: 1500
        });

        showToast(`🎉 Thu hoạch thành công! ${rewardMsg}`, "success");
      }
      checkQuestsProgress();
      requestRender();
      return true;
    }

    // Helper: Thu hoạch cây ăn quả độc lập ngoài đồng cỏ (Táo 🍎, Dừa 🥥, Me 🍈)
    function harvestFruitTree(row, col, silent = false) {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
      const tid = currentGrid[row][col];
      const treeCfg = FRUIT_TREES_CONFIG[tid];
      if (!treeCfg) return false;

      const pKey = `${row}_${col}`;
      const tState = fruitTreesState[pKey] || { lastHarvest: 0 };
      const elapsedSec = (Date.now() - (tState.lastHarvest || 0)) / 1000;
      if (elapsedSec < treeCfg.intervalSec) {
        if (!silent) {
          const waitSec = Math.ceil(treeCfg.intervalSec - elapsedSec);
          showToast(`⏳ ${treeCfg.name} đang kết trái... Chờ thêm ${waitSec}s nữa nhé!`, "info");
        }
        return false;
      }

      const yieldMult = townEventsManager ? townEventsManager.getCropYieldMultiplier() : 1;
      const yieldQty = (treeCfg.yieldQty || 3) * yieldMult;

      // Kiểm tra sức chứa Silo
      if (getSiloUsed(playerResources) + yieldQty > siloCapacity) {
        if (!silent) showStorageFullModal("silo");
        return false;
      }

      // Rung cây thu hoạch quả!
      if (!silent) {
        playTreeRustleHarvestSound();
        playHarvestPlopSound();
        spawnSlashEffect(col, row);
      }

      const goldMult = (townEventsManager && typeof townEventsManager.getGoldMultiplier === "function") ? townEventsManager.getGoldMultiplier() : 1.0;
      const xpMult = (townEventsManager && typeof townEventsManager.getXpMultiplier === "function") ? townEventsManager.getXpMultiplier() : 1.0;
      const goldEarned = Math.round((treeCfg.rewardGold || 20) * goldMult);
      const xpEarned = Math.round((treeCfg.rewardXP || 6) * xpMult);

      playerResources[treeCfg.fruitId] = Math.min(RESOURCE_MAX_CAPACITY, (playerResources[treeCfg.fruitId] || 0) + yieldQty);
      playerGold += goldEarned;
      totalHarvestsCount++;
      addPlayerXP(xpEarned, treeCfg.name);
      updateGoldDisplay();

      // Reset timer sinh trưởng (Cây thân gỗ lâu năm tiếp tục cho quả ở mùa kế)
      fruitTreesState[pKey] = {
        lastHarvest: Date.now()
      };

      if (!silent) {
        const ox = ORIGIN_X + (col - row) * HALF_W;
        const oy = ORIGIN_Y + (row + col) * QUARTER_W;
        addFloatingText({
          x: ox + 64,
          y: oy + 20,
          text: `+${yieldQty} ${treeCfg.icon} (+${goldEarned}🪙 +${xpEarned}XP)`,
          startTime: performance.now(),
          duration: 1200
        });

        spawnFlyingCoin(col, row, 3);
        spawnFlyingXP(col, row, xpEarned);
      }
      spawnFlyingProduce(col, row, treeCfg.icon);

      updateResourcesUI();
      persistGameState();
      checkQuestsProgress(true);
      requestRender();
      showToast(`🍎 Đã rung cây thu hoạch ${yieldQty} ${treeCfg.fruitName}! (+${goldEarned}🪙, +${xpEarned}XP)`, "success");
      return true;
    }

    // Khởi tạo Quản Gia Hoàng Gia (Town Caretaker Manager)
    townCaretakerManager = new TownCaretakerManager({
      getPlayerLevel: () => playerLevel,
      getPlayerGold: () => playerGold,
      getPlayerGems: () => playerGems,
      addPlayerGold: (amt) => {
        playerGold += amt;
        updateGoldDisplay();
      },
      deductGold: (amt) => {
        playerGold -= amt;
        updateGoldDisplay();
      },
      deductGems: (amt) => {
        deductGems(amt);
      },
      addPlayerXP: (amt, reason) => {
        addPlayerXP(amt, reason);
      },
      getPlayerResources: () => playerResources,
      getSiloCapacity: () => siloCapacity,
      getBarnCapacity: () => barnCapacity,
      getCurrentGrid: () => currentGrid,
      getFarmlandState: () => farmlandState,
      harvestCropCell: (r, c, silent) => farmToolsManager ? farmToolsManager.harvestCropCell(r, c, silent) : false,
      harvestFruitTreeCell: (r, c, silent) => harvestFruitTree(r, c, silent),
      harvestLivestockCell: (r, c, silent) => harvestLivestock(r, c, silent),
      feedLivestockCell: (r, c, silent) => feedLivestock(r, c, silent),
      harvestProductionCell: (r, c, silent) => harvestProductionBuilding(r, c, silent),
      showToast: (msg, type) => showToast(msg, type),
      persistGameState: () => persistGameState(),
      requestRender: () => requestRender()
    });
    townCaretakerManager.init(initialSave ? initialSave.townCaretaker : null);

    // Khởi tạo Bến Cảng Đường Thủy & Tàu Buôn Giao Thương (Harbor Cargo Ship Manager)
    harborShipManager = new HarborShipManager({
      getPlayerLevel: () => playerLevel,
      getPlayerGold: () => playerGold,
      getPlayerGems: () => playerGems,
      addPlayerGold: (amt) => {
        playerGold += amt;
        updateGoldDisplay();
      },
      addPlayerGems: (amt) => {
        addPlayerGems(amt);
      },
      deductGold: (amt) => {
        playerGold -= amt;
        updateGoldDisplay();
      },
      deductGems: (amt) => {
        deductGems(amt);
      },
      addPlayerXP: (amt, reason) => {
        addPlayerXP(amt, reason);
      },
      getPlayerResources: () => playerResources,
      showToast: (msg, type) => showToast(msg, type),
      persistGameState: () => persistGameState(),
      requestRender: () => requestRender(),
      spawnFlyingProduce: (c, r, icon) => spawnFlyingProduce(c, r, icon),
      getCurrentGrid: () => currentGrid,
      spawnFlyingCoin: (c, r, amt) => spawnFlyingCoin(c, r, amt),
      updateResourcesUI: () => updateResourcesUI()
    });
    harborShipManager.init(initialSave ? initialSave.harborShip : null);

    // Gói 1: Phương Tiện Giao Thông (Vehicle Manager: Xe kéo lúa mì, xe ngựa, thuyền đánh cá)
    vehicleManager = new VehicleManager(dayNightWeather);
    vehicleManager.init(currentGrid);

    // Gói 2: Đại Kỳ Quan Hoàng Gia (Kingdom Wonders Manager: Lâu Đài, Thư Viện Biển, Tượng Thần Biển)
    kingdomWondersManager = new KingdomWondersManager({
      getPlayerGold: () => playerGold,
      deductPlayerGold: (amt) => {
        playerGold -= amt;
        updateGoldDisplay();
      },
      getPlayerGems: () => playerGems,
      deductPlayerGems: (amt) => {
        deductGems(amt);
      },
      getPlayerResources: () => playerResources,
      deductPlayerResources: (item, amt) => {
        playerResources[item] = Math.max(0, (playerResources[item] || 0) - amt);
        updateResourcesUI();
      },
      showToast,
      playBuildSound: playBuildSound,
      playQuestRewardSound,
      playModalOpenSound,
      playModalCloseSound,
      persistGameState,
      getLandUnlockedChunks: () => landUnlockedChunks,
      getGameMode: () => gameMode,
      requestRender: () => requestRender()
    });
    kingdomWondersManager.init(
      initialSave ? initialSave.kingdomWonders : null,
      initialSave ? initialSave.wonderSites : null
    );

    // Gói 3: Bến Câu Cá Thư Giãn (Fishing Spot Manager)
    fishingManager = new FishingManager({
      addPlayerGold: (amt) => {
        playerGold += amt;
        updateGoldDisplay();
      },
      addPlayerGems: (amt) => {
        addPlayerGems(amt);
      },
      addPlayerXP: (amt, reason) => {
        addPlayerXP(amt, reason);
      },
      showToast,
      playQuestRewardSound,
      playErrorSound,
      playCoinSound: playCoinFlyHitSound,
      playModalOpenSound,
      playModalCloseSound
    });
    fishingManager.init();

    // Gói 3: Vòng Quay May Mắn Hoàng Gia (Daily Lucky Wheel Manager)
    dailyWheelManager = new DailyWheelManager({
      addPlayerGold: (amt) => {
        playerGold += amt;
        updateGoldDisplay();
      },
      addPlayerGems: (amt) => {
        addPlayerGems(amt);
      },
      getPlayerGems: () => playerGems,
      deductPlayerGems: (amt) => {
        deductGems(amt);
      },
      showToast,
      playQuestRewardSound,
      playCoinSound: playCoinFlyHitSound,
      playModalOpenSound,
      playModalCloseSound,
      persistGameState,
      requestRender: () => requestRender()
    });
    dailyWheelManager.init(initialSave ? initialSave.dailyWheel : null);

    // Gói 4: Mùa Lễ Hội & Cảnh Sắc (Seasonal Themes Manager)
    seasonalThemeManager = new SeasonalThemeManager({
      showToast,
      requestRender: () => requestRender()
    });
    seasonalThemeManager.init();

    // Input Handler Module (Mouse clicks, panning, zooming, continuous drag, hotkeys)
    const inputHandler = initInputHandler(container, {
      getCamera: () => camera,
      applyZoom,
      zoomIn,
      zoomOut,
      centerCamera,
      clampCamera,
      screenToWorldCoords,
      worldToCell,
      onTutorialAction: (type, payload) => tutorialManager.onAction(type, payload),
      setHoverCell: (val) => { hoverCell = val; },
      getHoverCell: () => hoverCell,
      getActiveSeedBrush: () => (farmToolsManager ? farmToolsManager.getActiveSeedBrush() : null),
      setActiveSeedBrush: (val) => { if (farmToolsManager) farmToolsManager.setActiveSeedBrush(val); },
      getActiveFarmTool: () => (farmToolsManager ? farmToolsManager.getActiveFarmTool() : null),
      setActiveFarmTool: (val) => { if (farmToolsManager) farmToolsManager.setActiveFarmTool(val); },
      getActiveBrush: () => activeBrush,
      setActiveBrush,
      getBrushFlipped: () => brushFlipped,
      rotateActiveBrush,
      getMovingBuilding: () => movingBuilding,
      setMovingBuilding: (val) => {
        if (val && isProtectedTile(val.fromRow, val.fromCol, val.tileId)) {
          if (val.fromCol <= 5) {
            showToast("🌊 Vùng biển đại dương & bờ cảng tự nhiên của vương quốc, không thể di chuyển!", "warning");
          } else {
            showToast("🏛️ Công trình mặc định của vương quốc, không thể di chuyển!", "warning");
          }
          return;
        }
        movingBuilding = val;
        updateFloatingBrushHUD();
        requestRender();
      },
      rotateMovingBuilding,
      rotateCellAt,
      getCurrentGrid: () => currentGrid,
      getConstructions: () => constructions,
      getTileMap: () => tileMap,
      getBuildingLevels: () => buildingLevels,
      getProductionState: () => productionState,
      getFarmlandState: () => farmlandState,
      getLandUnlockedChunks: () => landUnlockedChunks,
      getFlippedGrid: () => flippedGrid,
      getGameMode: () => gameMode,
      getPlayerGold: () => playerGold,
      deductGold: (amt) => {
        playerGold -= amt;
        updateGoldDisplay();
      },
      getVillagerManager: () => villagerManager,
      getPetManager: () => petManager,
      getOrderBoardManager: () => orderBoardManager,
      getTownVisitorManager: () => townVisitorManager,
      getHarborShipManager: () => harborShipManager,
      getVehicleManager: () => vehicleManager,
      getKingdomWondersManager: () => kingdomWondersManager,
      getSeasonalThemeManager: () => seasonalThemeManager,
      openFishingModal: () => {
        if (fishingManager) fishingManager.openModal();
      },
      getFruitTreesState: () => fruitTreesState,
      getDayNightWeather: () => dayNightWeather,
      tryApplySeedBrush: (r, c) => farmToolsManager && farmToolsManager.tryApplySeedBrush(r, c),
      tryApplyFarmTool: (r, c) => farmToolsManager && farmToolsManager.tryApplyFarmTool(r, c),
      tryPlaceContinuousBrush,
      harvestProductionBuilding,
      harvestFruitTree,
      addPlayerGold: (amt, reason) => {
        playerGold += amt;
        updateGoldDisplay();
        showToast(`+${amt}🪙 ${reason || ""}`, "success");
      },
      addPlayerXP: (amt, title) => addPlayerXP(amt, title),
      eraseCell: (r, c) => eraseCell(r, c),
      openMarketModal,
      openSeedModal,
      openFarmToolPopup: (r, c) => farmToolsManager && farmToolsManager.openFarmToolPopup(r, c),
      openUpgradeModal: (r, c) => upgradeManager.openUpgradeModal(r, c),
      openAchievementsModal: () => uiModalController.openAchievementsModal(),
      hasClaimableAchievements: () => (uiModalController ? uiModalController.hasClaimableAchievements() : false),
      openConstructionSpeedupModal,
      openLandExpansionModal,
      openStorageModal,
      openLivestockModal,
      closeLivestockModal,
      showStorageFullModal,
      getSiloCapacity: () => siloCapacity,
      getBarnCapacity: () => barnCapacity,
      getLivestockState: () => livestockState,
      deactivateFarmTool: () => farmToolsManager && farmToolsManager.deactivateFarmTool(),
      pushUndo,
      requestRender,
      updateGoldDisplay,
      saveGameEconomyState,
      saveConstructionsState,
      saveFlippedGrid,
      updateVillageStatsUI,
      checkQuestsProgress,
      persistGameState,
      triggerAutoSave,
      checkCanPlaceTile: (tid) => checkCanPlaceTile(tid),
      showToast
    });

    // Canvas 2D Isometric Graphics Renderer Module
    canvasRenderer = createCanvasRenderer({
      getCanvas: () => canvas,
      getContainer: () => container,
      getContext2D: () => ctx,
      ensureCanvasRef,
      getViewportSize,
      getCamera: () => camera,
      getCurrentGrid: () => currentGrid,
      getConstructions: () => constructions,
      getBuildingLevels: () => buildingLevels,
      getFarmlandState: () => farmlandState,
      getProductionState: () => productionState,
      getLandUnlockedChunks: () => landUnlockedChunks,
      getFlippedGrid: () => flippedGrid,
      getUpgradesInProgress: () => upgradesInProgress,
      getGameMode: () => gameMode,
      getPlayerResources: () => playerResources,
      getVillagerManager: () => villagerManager,
      getPetManager: () => petManager,
      getOrderBoardManager: () => orderBoardManager,
      getTownVisitorManager: () => townVisitorManager,
      getHarborShipManager: () => harborShipManager,
      getVehicleManager: () => vehicleManager,
      getKingdomWondersManager: () => kingdomWondersManager,
      getSeasonalThemeManager: () => seasonalThemeManager,
      openFishingModal: () => {
        if (fishingManager) fishingManager.openModal();
      },
      getFruitTreesState: () => fruitTreesState,
      getDayNightWeather: () => dayNightWeather,
      getHoverCell: () => hoverCell,
      getActiveBrush: () => activeBrush,
      getBrushFlipped: () => brushFlipped,
      getActiveFarmTool: () => (farmToolsManager ? farmToolsManager.getActiveFarmTool() : null),
      getActiveSeedBrush: () => (farmToolsManager ? farmToolsManager.getActiveSeedBrush() : null),
      getMovingBuilding: () => movingBuilding,
      getAnimTime: () => animTime,
      getSiloCapacity: () => siloCapacity,
      getBarnCapacity: () => barnCapacity,
      getLivestockState: () => livestockState,
      hasClaimableAchievements: () => (uiModalController ? uiModalController.hasClaimableAchievements() : false),
      updateResourcesUI,
      onRequestRender: () => requestRender()
    });

    function renderCanvas() {
      if (canvasRenderer) canvasRenderer.renderCanvas();
    }

  let renderPending = false;
  function requestRender() {
    if (isAnimated) return; // 60 FPS animation loop is already running
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
      renderPending = false;
      renderCanvas();
    });
  }

    function pushUndo() {
      undoStack.push(currentGrid.map(r => [...r]));
      if (undoStack.length > 50) undoStack.shift();
      redoStack = [];
      updateUndoRedoButtons();
    }

    let lastAmbientSoundTime = 0;
    let _renderErrorCount = 0;
    function startAnimationLoop() {
      let lastTime = performance.now();
      function loop(now) {
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        animTime += dt;
        animFrame = Math.floor(animTime * 4) % 4;

        // Update Day/Night, Lighting & Weather
        dayNightWeather.update(dt);

        // Ambient sound triggers (birds, windmill, blacksmith)
        if (now - lastAmbientSoundTime > 14000) {
          lastAmbientSoundTime = now;
          const r = Math.random();
          if (r < 0.4) playBirdSound();
          else if (r < 0.7) playWindmillSound();
          else playBlacksmithSound();
        }

        // Update Constructions tick (separated from render)
        updateConstructions();
        updateLivestockTick();

        villagerManager.update(
          dt,
          currentGrid,
          tileMap,
          (r, c) => isCellUnlocked(r, c, landUnlockedChunks, gameMode),
          calculateVillageStats(currentGrid, constructions, tileMap, buildingLevels)
        );

        petManager.update(
          dt,
          currentGrid,
          (r, c) => isCellUnlocked(r, c, landUnlockedChunks, gameMode)
        );

        if (townEventsManager) {
          townEventsManager.update();
        }

        if (orderBoardManager) {
          orderBoardManager.update();
        }

        if (townVisitorManager) {
          townVisitorManager.update(dt);
        }

        if (townCaretakerManager) {
          try {
            townCaretakerManager.update(dt);
          } catch (ctErr) {
            console.error('[TownCaretaker] update error:', ctErr);
          }
        }

        if (harborShipManager) {
          try {
            harborShipManager.update(dt);
          } catch (hsErr) {
            console.error('[HarborShip] update error:', hsErr);
          }
        }

        if (vehicleManager) {
          try {
            vehicleManager.update(
              dt,
              currentGrid,
              tileMap,
              (r, c) => isCellUnlocked(r, c, landUnlockedChunks, gameMode)
            );
          } catch (vehErr) {
            console.error('[VehicleManager] update error:', vehErr);
          }
        }

        if (seasonalThemeManager) {
          try {
            const dpr = window.devicePixelRatio || 1;
            seasonalThemeManager.update(dt, canvas.width / dpr, canvas.height / dpr);
          } catch (stErr) {
            console.error('[SeasonalTheme] update error:', stErr);
          }
        }

        try {
          renderCanvas();
        } catch (renderErr) {
          _renderErrorCount++;
          if (_renderErrorCount <= 3) {
            console.error('[TownBuilder] renderCanvas error:', renderErr);
          }
          // Even on error, draw a diagnostic screen so user sees SOMETHING
          try {
            const dpr = window.devicePixelRatio || 1;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.scale(dpr, dpr);
            ctx.fillStyle = '#f59e0b';
            ctx.font = '16px monospace';
            ctx.fillText('⚠️ Rendering error — check browser console (F12)', 20, 30);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px monospace';
            ctx.fillText(`Error: ${renderErr.message}`, 20, 55);
            ctx.fillText(`Canvas: ${canvas.width}x${canvas.height}  Camera: (${camera.x.toFixed(0)}, ${camera.y.toFixed(0)}) zoom=${camera.zoom.toFixed(2)}`, 20, 75);
          } catch (_) { /* nothing we can do */ }
        }

        if (isAnimated) {
          animLoopId = requestAnimationFrame(loop);
          globalAnimLoopId = animLoopId;
        }
      }
      animLoopId = requestAnimationFrame(loop);
      globalAnimLoopId = animLoopId;
    }

    // Initialize UI and render - tự động reset mới nếu là người chơi mới hoặc chưa có Save v3
    if (!localStorage.getItem('isometric_town_builder_save_v3')) {
      resetToInitialGameState();
    } else {
      updateGoldDisplay();
      updateGemsDisplay();
      updateModeUI();
      updateLevelUI();
      updateVillageStatsUI();
      updateResourcesUI();
      checkQuestsProgress(true);
      resizeCanvas();
      centerCamera();
      // Đảm bảo định vị chính xác tâm bản đồ ngay sau khi browser hoàn tất layout
      requestAnimationFrame(() => {
        resizeCanvas();
        centerCamera();
      });
    }
    if (isAnimated) startAnimationLoop();

    // Auto-start onboarding tutorial for new players (or resume if not completed)
    setTimeout(() => {
      tutorialManager.start();
    }, 700);

    return function cleanup() {
      upgradeManager.destroy();
      uiModalController.destroy();
      inputHandler.destroy();
      if (farmToolsManager) farmToolsManager.destroy();
      if (townCaretakerManager) townCaretakerManager.destroy();
      if (harborShipManager) harborShipManager.destroy();
      if (dailyWheelManager) dailyWheelManager.stopCountdownLoop();
      if (fishingManager && fishingManager.animFrameId) cancelAnimationFrame(fishingManager.animFrameId);
      if (canvasRenderer) canvasRenderer.destroy();
      tutorialManager.destroy();
      townEventsManager.destroy();
      if (animLoopId) {
        cancelAnimationFrame(animLoopId);
        animLoopId = null;
      }
      if (globalAnimLoopId) {
        cancelAnimationFrame(globalAnimLoopId);
        globalAnimLoopId = null;
      }
      if (globalAbortController) {
        globalAbortController.abort();
        globalAbortController = null;
      }
    };
  })();
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.location.reload();
  });
}
