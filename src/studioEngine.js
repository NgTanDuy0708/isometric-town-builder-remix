import {resourceIconHtml} from './data/resourceIcons.js';
import {normalizeVillageSave} from './engine/villageLayoutMigration.js';
import {createWorldManager} from './engine/worldManager.js';
import {createPremiumManager} from './engine/premiumManager.js';
import {createAdventurePanel} from './engine/adventurePanel.js';
import {isPremiumTile} from './data/premiumConfig.js';
import {createFruitTreeState,getFruitTreeVisual,resolveFruitTreeState,harvestFruitTreeProduce,forceFruitTreeReady} from "./engine/fruitTreeLifecycle.js";
import {paintFruitTreeThumbnail} from "./data/fruitTreeSprites.js";
import { LIVESTOCK_RULES, isLivestockTile } from "./data/livestockConfig.js";
import { getLivestockAnchor, reserveLivestockCells, clearLivestockParts } from './data/livestockFootprint.js';
import { canPlaceLivestock } from './engine/livestockFootprint.js';
import { TOWN_HALL_TUNING_KEY } from "./engine/townHallTuning.js";
import { getShopCategory, EXCLUDED_SHOP_TILES } from './data/shopCatalog.js';
import { getWorkforce, checkFarmWorkforce, checkHousingRemoval } from './engine/workforce.js';
import { createExtractionManager } from './engine/extractionManager.js';
import { createExtractionPanel } from './engine/extractionPanel.js';
import { createDefenseManager } from './engine/defenseManager.js';
import { createDefensePanel } from './engine/defensePanel.js';
import { getDefenseCameraView } from './engine/defenseCamera.js';
import { isExpansionGround, paintExpansionGroundThumbnail } from './engine/expansionRenderer.js';
import { canPlaceOnSurface, getClearedSurface, isPlacementProtected } from './engine/placementSurface.js';
import { placeFenceOnEdges } from "./engine/fencePlacement.js";
import {
  INITIAL_GOLD, INITIAL_GEMS, getGemSpeedupCost, getTileCost, getTileBuildDuration, PRODUCTION_BUILDINGS,
  calculateVillageStats, getTilePopulation, getTileRequiredLevel,
  PLAYER_LEVEL_CONFIG, getLevelXpRequirement, getPlayerLevelTitle,
  MAX_PLAYER_LEVEL,
  getMaxPenCount, getNextPenUnlockInfo
} from "./data/gameEconomy.js";
import { QUESTS_CONFIG, QUEST_CHAPTERS, isQuestUnlocked, getQuestById } from "./data/questsData.js";
import { loadGameSave, saveGameSave, exportGameToJSON, importGameFromJSON, getDefaultSaveState, cleanOldSavesForV3 } from "./engine/storage.js";
import { TILE_DATA_URIS } from "./data/sprites.js";
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
  isSiloResource, isBarnResource, getSiloUsed, getBarnUsed, getWarehouseUsed, WAREHOUSE_RESOURCE_IDS
} from "./data/resourcesConfig.js";
import {
  MAX_BUILDING_LEVEL, getNextUpgrade, getBuildingLevelPopulation
} from "./data/upgradesConfig.js";
import { CROPS_CONFIG, getCropGrowDurationMs } from "./data/cropsConfig.js";
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
import { createUpgradeManager, calculateDemolishRefund, getRotatedTileIdAndFlip, isRotationVisible } from "./engine/upgradeManager.js";
import { createUIModalController, showToast } from "./engine/uiModalController.js";
import { initInputHandler, findHitBubble } from "./engine/inputHandler.js";
import { createCanvasRenderer, isImageReady } from "./engine/canvasRenderer.js";
import {readTutorialUi} from "./engine/tutorialView.js";
import {isHousingTile} from "./data/housingConfig.js";
import { createTutorialManager } from "./engine/tutorialManager.js";
import { createTownEventsManager } from "./engine/townEvents.js";
import { createFarmToolsManager } from "./engine/farmTools.js";
import { createOrderBoardManager } from "./engine/orderBoardManager.js";
import { createProductionManager } from "./engine/productionManager.js";
import { createProductionPanel } from './engine/productionPanel.js';
import { getRecipesForBuilding } from './data/productionRecipes.js';
import { restoreBackupSave } from './engine/storage.js';
import { TownVisitorManager } from "./engine/townVisitors.js";
import { TownCaretakerManager } from "./engine/townCaretaker.js";
import { HarborShipManager } from "./engine/harborShipManager.js";
import { VehicleManager } from "./engine/trafficVehicles.js";
import { KingdomWondersManager, WONDERS_CONFIG } from "./engine/kingdomWonders.js";
import { FishingManager } from "./engine/fishingMinigame.js";
import { DailyWheelManager } from "./engine/dailyWheel.js";
import { SeasonalThemeManager } from "./engine/seasonalThemes.js";
import { AESTHETIC_TILE_URIS } from "./data/aestheticTileIcons.js";
import { getBuildingSpriteUri } from "./data/buildingSprites.js";
import { applyCoastTerrainLayout, getTerrainSprite } from "./data/terrainConfig.js";
import { TERRAIN_MAP_KEY, readTerrainMap, syncTerrainToGrid, createTerrainMap, writeTerrainMap, isValidTerrainMap } from "./engine/terrainEditing.js";
import {STARTER_MAP_KEY,MAP_APPLY_KEY,readMapDocument,applyMapDocumentToSave,restartMapGrowth} from './engine/mapEditing.js';
import {setActiveMapLocks,isMapLockedCell,isMapRemovableCell,normalizeMapLocks,setCustomMapLayout} from './data/mapLocks.js';
import {setHarborSites} from './data/harborLayout.js';
import { WAREHOUSE_TUNING_KEY } from "./engine/warehouseTuning.js";
import { isFenceTile, migrateGridFences, FENCE_ITEM_BY_ID } from "./data/fenceConfig.js";
import { paintFenceThumbnail } from "./engine/fenceRenderer.js";
import { createStarterTownMap32, applyTownCenterLayout, getStarterFarmlandState, isProtectedTile, isIndestructibleTile, migrateLegacyWarehouseLayout } from "./data/starterMap.js";
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
      if (brushId && kingdomWondersManager && kingdomWondersManager.movingWonderId) {
        kingdomWondersManager.cancelRelocating();
      }
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
      if (!isRotationVisible(activeBrush)) {
        const lb = tileMap[activeBrush];
        showToast(`ℹ️ ${lb ? lb.label : "Vật phẩm này"} có hình đối xứng, xoay sẽ không thay đổi gì.`, "info");
        return;
      }
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
    let productionManager = null;
    let extractionManager = null;
    let extractionPanel = null;
    let defenseManager = null;
    let defensePanel = null;
    let worldManager=null,premiumManager=null,adventurePanel=null,applyImportedState=null;
    const starterMapGrid = createStarterTownMap32();
    const loadedSave = loadGameSave(starterMapGrid);
    const starterDocument=readMapDocument(localStorage,STARTER_MAP_KEY);
    const pendingMapDocument=readMapDocument(localStorage,MAP_APPLY_KEY);
    const baseSave=loadedSave || getDefaultSaveState(starterMapGrid);
    const initialSave = pendingMapDocument ? applyMapDocumentToSave(baseSave,restartMapGrowth(pendingMapDocument))
      : !loadedSave&&starterDocument?applyMapDocumentToSave(baseSave,restartMapGrowth(starterDocument)):baseSave;
    if(pendingMapDocument)localStorage.removeItem(MAP_APPLY_KEY);
    let mapLocks=normalizeMapLocks(initialSave.mapLocks);
    let mapScenery=initialSave.mapScenery||{},customMapLayout=initialSave.customMapLayout===true;
    setCustomMapLayout(customMapLayout);
    setHarborSites(mapScenery,customMapLayout);
    setActiveMapLocks(mapLocks);
    let currentGrid = (initialSave.grid && initialSave.grid.length === 16) ? expandGrid16to32(initialSave.grid) : (initialSave.grid || starterMapGrid);
    
    // Di trú save cũ: Kho Barn (b12) & Kho Silo (b13) đã được gộp hẳn vào Kho Tổng Hợp 2×2 (b60).
    // Dùng chung hàm với luồng import JSON/dev map để mọi nguồn dữ liệu đều nhất quán.
    if(!initialSave.customMapLayout)migrateLegacyWarehouseLayout(currentGrid);

    // 2. Đặt lại khu trung tâm theo footprint tòa thị chính 2x3 và quảng trường 3x3.
    if(initialSave.world?.active!=='forest'&&!initialSave.customMapLayout)applyTownCenterLayout(currentGrid);

    // Chỉ nút Chơi lại mới được xoá bản đồ; cờ giao diện không quyết định dữ liệu save.

    // Đồng bộ bờ col 4 và cát cols 5..6 cho save cũ, giữ công trình.
    applyCoastTerrainLayout(currentGrid);
    let terrainMap = isValidTerrainMap(initialSave.terrainMap)?initialSave.terrainMap:readTerrainMap(localStorage);
    if (!terrainMap) {
      terrainMap = isValidTerrainMap(initialSave.terrainMap) ? initialSave.terrainMap : createTerrainMap(currentGrid);
      writeTerrainMap(localStorage, terrainMap);
    }
    syncTerrainToGrid(currentGrid, terrainMap);

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
    
    // Kho Tổng Hợp kế thừa tổng sức chứa từ save cũ nhưng luôn nằm trong [300, 1000].
    const legacyStorageCapacity = (initialSave.storage?.siloCapacity || 0) + (initialSave.storage?.barnCapacity || 0);
    const savedWarehouseCapacity = typeof initialSave.storage?.warehouseCapacity === "number"
      ? initialSave.storage.warehouseCapacity
      : legacyStorageCapacity;
    let warehouseCapacity = Math.min(1000, Math.max(300, savedWarehouseCapacity));
    let livestockState = (initialSave.livestockState && typeof initialSave.livestockState === "object") ? initialSave.livestockState : {};
    
    // Production Buildings and Floating Texts State
    const initialProductionState = initialSave.productionState || {};

    // Quản lý sản xuất: sở hữu productionState, tick chín, tiêu nguyên liệu, thu hoạch.
    // CanvasRenderer chỉ đọc state này để vẽ bong bóng, không tự sửa nữa.
    productionManager = createProductionManager({
      getPlayerLevel: () => playerLevel,
      getConstructions: () => constructions,
      getCurrentGrid: () => currentGrid,
      getBuildingLevels: () => buildingLevels,
      getPlayerResources: () => playerResources,
      getFruitTreesState: () => fruitTreesState,
      getWarehouseCapacity: () => warehouseCapacity,
      getGoldMultiplier: () => (townEventsManager && typeof townEventsManager.getGoldMultiplier === "function") ? townEventsManager.getGoldMultiplier() : 1.0,
      getXpMultiplier: () => (townEventsManager && typeof townEventsManager.getXpMultiplier === "function") ? townEventsManager.getXpMultiplier() : 1.0,
      updateResourcesUI: () => updateResourcesUI(),
      persistGameState: () => persistGameState(),
      requestRender: () => requestRender(),
      addPlayerGold: (amt) => { playerGold += amt; updateGoldDisplay(); },
      addPlayerXP: (amt, source) => addPlayerXP(amt, source),
      incrementHarvestCount: () => { totalHarvestsCount++; },
      checkQuestsProgress: () => checkQuestsProgress(),
      showStorageFullModal: () => showStorageFullModal(),
      showToast: (msg, type) => showToast(msg, type),
      addFloatingText: (opt) => addFloatingText(opt),
      spawnFlyingProduce: (c,r,icon,resourceId) => spawnFlyingProduce(c,r,icon,resourceId),
      spawnFlyingCoin: (c, r, amt) => spawnFlyingCoin(c, r, amt),
      spawnFlyingXP: (c, r, amt) => spawnFlyingXP(c, r, amt),
      playCoinSound: () => playCoinSound(),
      playLoomWeaveSound: () => playLoomWeaveSound(),
      harvestLivestockCell: (r, c, silent) => harvestLivestock(r, c, silent),
      harvestFruitTreeCell: (r, c, silent) => harvestFruitTree(r, c, silent)
    });
    productionManager.setState(initialProductionState);

    let farmlandState = initialSave.farmlandState || {};
    for (const [k, f] of Object.entries(farmlandState)) {
      if (!f || typeof f !== 'object' || !f.seedId) {
        delete farmlandState[k];
        continue;
      }
      getCropGrowDurationMs(f);
    }
    let fruitTreesState = (initialSave.fruitTreesState && typeof initialSave.fruitTreesState === 'object') ? initialSave.fruitTreesState : {};

    // Đảm bảo không còn entry sản xuất sót lại cho các ô kho.
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tid = currentGrid[r]?.[c];
        if (tid === "b60_combined_warehouse" || tid === "b12_general_store" || tid === "b13_barn_silo") {
          productionManager.clearCell(`${r}_${c}`);
          productionManager.clearCell(`${r},${c}`);
        }
      }
    }

    // Khởi tạo trạng thái cây ăn quả: CHỈ tạo mới khi chưa có, giữ nguyên cooldown đã lưu.
    // (Trước đây khối này ghi đè lastHarvest = 0 mỗi lần load nên F5 là hái lại được toàn bộ cây.)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tid = currentGrid[r] ? currentGrid[r][c] : null;
        if (!FRUIT_TREES_CONFIG[tid]) continue;
        const k = `${r}_${c}`;
        const saved=resolveFruitTreeState(productionManager.getState()[k],fruitTreesState[k]);
        const ready=getFruitTreeVisual(tid,saved).ready;
        fruitTreesState[k]={...saved,ready};
        productionManager.setEntry(k,{...saved,ready});
      }
    }

    // Bổ sung entry còn thiếu cho các công trình sản xuất khác trên bản đồ.
    productionManager.scanGrid();

    let activeFarmlandCell = null;
    let canvasRenderer = null;

    function spawnFlyingCoin(gridCol, gridRow, count = 3) {
      if (canvasRenderer) canvasRenderer.spawnFlyingCoin(gridCol, gridRow, count);
    }

    function spawnFlyingXP(gridCol, gridRow, xpAmount = 10) {
      if (canvasRenderer) canvasRenderer.spawnFlyingXP(gridCol, gridRow, xpAmount);
    }

    function spawnFlyingProduce(gridCol,gridRow,icon="🌾",resourceId=null) {
      if (canvasRenderer) canvasRenderer.spawnFlyingProduce(gridCol,gridRow,icon,resourceId);
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

    // Farm Tools Manager: gieo hạt hàng loạt + thu hoạch hàng loạt
    let farmToolsManager = null;
    let isMouseDown = false;

    // Flipped Tiles State
    let flippedGrid = initialSave.flippedGrid || {};
    let fences = migrateGridFences(currentGrid, flippedGrid, initialSave.fences || []);

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
    // Mở khóa miễn phí vùng Tây [0,0]-[31,7] (chunk cols 0-1, mọi hàng).
    const WEST_FREE_CHUNKS = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
    for (const ch of WEST_FREE_CHUNKS) {
      if (!landUnlockedChunks.includes(ch)) landUnlockedChunks.push(ch);
    }
    let playerResources = initialSave.resources || { wheat: 0, egg: 0, milk: 0, bread: 0, ironTools: 5 };

    // Building Levels State
    let buildingLevels = (initialSave.buildingLevels && typeof initialSave.buildingLevels === 'object') ? initialSave.buildingLevels : {};
    let upgradesInProgress = (initialSave.upgradesInProgress && typeof initialSave.upgradesInProgress === 'object') ? initialSave.upgradesInProgress : {};

    function getFullSaveData() {
      return {
        version: 2,
        savedAt: Date.now(),
        presetName: 'custom',
        grid: currentGrid,
        terrainMap,
        fences,
        mapLocks,
        mapScenery,customMapLayout,
        flippedGrid,
        constructions,
        productionState: productionManager.getState(),
        extraction: extractionManager?.getState() || null,
        defense: defenseManager?.getState() || null,
        world:worldManager?.getState()||initialSave.world,
        premium:premiumManager?.getState()||initialSave.premium,
        tutorial:tutorialManager?.getState()||initialSave.tutorial,
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
        storage: { warehouseCapacity },
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
          : (initialSave?.activeSeason || "summer"),
        achievements: (uiModalController && typeof uiModalController.getClaimedAchievements === "function")
          ? uiModalController.getClaimedAchievements()
          : (initialSave?.achievements || null)
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
      saveStatusEl.textContent = initialSave ? "✓ Đã nạp tiến trình" : "Tự động lưu: Sẵn sàng";
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
    var selectedObjectCell = null; // công trình đang được chọn (giữ lâu) -> vẽ mờ
    var wasPlacingGhost = false;   // đang ở chế độ đặt (bóng mờ) hay không
    const villagerManager = new VillagerManager();
    const petManager = new PetManager({ onRequestRender: requestRender });

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
          productionManager.markBuilt(key, c.targetTileId, now);
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
              const saved=resolveFruitTreeState(productionManager.getState()[k],fruitTreesState[k]);
              if(getFruitTreeVisual(tid,saved,now).exhausted)continue;
              const matured=forceFruitTreeReady(tid,saved,now);
              fruitTreesState[k]={...matured};productionManager.setEntry(k,{...matured});
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

    // Giới hạn số pixel thực sự phải tô mỗi frame. Trên desktop 2K/4K hoặc màn hình
    // scaling 150-200%, canvas = CSS × devicePixelRatio có thể lên 6-16 triệu pixel
    // → tụt FPS dù GPU khỏe. Cap theo ngân sách pixel, vẫn giữ nét ở mức chấp nhận được.
    const MAX_RENDER_PIXELS = 2800000;
    let renderPixelRatio = 1;
    function computeRenderPixelRatio() {
      const { width, height } = getViewportSize();
      const rawDpr = window.devicePixelRatio || 1;
      const budgetDpr = Math.sqrt(MAX_RENDER_PIXELS / Math.max(1, width * height));
      return Math.max(0.75, Math.min(rawDpr, 2, budgetDpr));
    }

    function resizeCanvas() {
      const { width: viewW, height: viewH } = getViewportSize();
      renderPixelRatio = computeRenderPixelRatio();
      const pixelWidth=Math.round(viewW*renderPixelRatio),pixelHeight=Math.round(viewH*renderPixelRatio);
      // A same-size ResizeObserver notification must not erase the last frame.
      if(canvas.width!==pixelWidth)canvas.width=pixelWidth;
      if(canvas.height!==pixelHeight)canvas.height=pixelHeight;
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
      worldManager?.init(null);premiumManager?.init(null);adventurePanel?.close();
      cleanOldSavesForV3();
      gameMode = "game";
      playerGold = INITIAL_GOLD; // 500 gold
      playerGems = INITIAL_GEMS; // 30 gems
      warehouseCapacity = 300;
      livestockState = {};
      playerLevel = 1;
      playerXP = 0;
      if (farmToolsManager) farmToolsManager.deactivateFarmTool();
      playerResources = {
        wheat: 0, carrot: 0, tomato: 0, strawberry: 0, corn: 0,
        cabbage: 0, pumpkin: 0, watermelon: 0, grapes: 0, sunflower: 0,
        egg: 0, milk: 0, meat: 0, wool: 0, fabric: 0, butter: 0, bread: 0, ironTools: 0
      };
      currentGrid = createStarterTownMap32();
      terrainMap = createTerrainMap(currentGrid);
      writeTerrainMap(localStorage, terrainMap);
      fences = [];
      mapLocks={};setActiveMapLocks(mapLocks);
      mapScenery={};customMapLayout=false;setCustomMapLayout(false);
      setHarborSites();
      constructions = {};
      buildingLevels = {};
      upgradesInProgress = {};
      farmlandState = getStarterFarmlandState();
      productionManager.reset();
      flippedGrid = {};
      landUnlockedChunks = [...INITIAL_UNLOCKED_CHUNKS];
      extractionManager?.init(null);
      extractionPanel?.close();
      defenseManager?.init(null);
      defensePanel?.close();
      defensePanel?.render();
      for (const ch of [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57]) {
        if (!landUnlockedChunks.includes(ch)) landUnlockedChunks.push(ch);
      }
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
        if (typeof townCaretakerManager.reset === "function") townCaretakerManager.reset();
        else townCaretakerManager.init(null);
      }
      if (harborShipManager) {
        harborShipManager.init(null);
      }
      if (kingdomWondersManager) {
        if (typeof kingdomWondersManager.reset === "function") kingdomWondersManager.reset();
        else kingdomWondersManager.init(null);
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
        tutorialManager.resetForNewGame();
        tutorialManager.start();
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

      const customStarter=readMapDocument(localStorage,STARTER_MAP_KEY);
      if(customStarter&&applyImportedState)applyImportedState(applyMapDocumentToSave(getFullSaveData(),restartMapGrowth(customStarter)));
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
      if (leveledUp) tutorialManager?.checkAndTriggerLevelTutorial(playerLevel);
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
      updateWorkerFoodUI();

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
      return productionManager ? productionManager.feedPausedWorkshops() : 0;
    }

    // Đặt bóng mờ ban đầu: gần giữa màn hình, ưu tiên ô cỏ trống đã mở khóa
    function initGhostCell() {
      try {
        if (movingBuilding) {
          hoverCell = { row: movingBuilding.fromRow, col: movingBuilding.fromCol };
          requestRender();
          return;
        }
        const vp = getViewportSize();
        const w = screenToWorldCoords(vp.width / 2, vp.height / 2 - 40);
        const c0 = worldToCell(w.x, w.y);
        let best = c0;
        if (c0) {
          const isFree = (r, c) => {
            const g = currentGrid[r] ? currentGrid[r][c] : undefined;
            return (g === "d12_meadow_wildflowers" || g === "g01_grass_flat" || g === "s13_sand_ground") && !constructions[`${r}_${c}`] && isCellUnlocked(r, c, landUnlockedChunks, gameMode);
          };
          search: for (let d = 0; d <= 8; d++) {
            for (let dr = -d; dr <= d; dr++) {
              for (let dc = -d; dc <= d; dc++) {
                if (Math.max(Math.abs(dr), Math.abs(dc)) !== d) continue;
                if (isFree(c0.row + dr, c0.col + dc)) {
                  best = { row: c0.row + dr, col: c0.col + dc };
                  break search;
                }
              }
            }
          }
        }
        hoverCell = best || null;
        requestRender();
      } catch (err) {
        /* bỏ qua: không đặt được bóng mờ ban đầu */
      }
    }
    // Floating Active Brush & Moving Building HUD
    function updateFloatingBrushHUD() {
      const hud = document.getElementById("floating-brush-hud");
      const titleEl = document.getElementById("floating-brush-title");
      const metaEl = document.getElementById("floating-brush-meta");
      const thumbEl = document.getElementById("floating-brush-thumb");
      if (!hud) return;

      // Chế độ đặt (bóng mờ): vào chế độ -> đặt bóng mờ gần giữa màn hình; thoát -> bỏ bóng mờ
      const placingNow = !!((activeBrush && activeBrush !== "erase") || movingBuilding || (kingdomWondersManager && kingdomWondersManager.movingWonderId));
      if (placingNow && !wasPlacingGhost) {
        selectedObjectCell = null;
        const objOverlayEl = document.getElementById("object-action-overlay");
        if (objOverlayEl) { objOverlayEl.classList.add("hidden"); objOverlayEl.style.display = "none"; }
        initGhostCell();
      } else if (!placingNow && wasPlacingGhost) {
        hoverCell = null;
        requestRender();
      }
      wasPlacingGhost = placingNow;
      const confirmBtnEl = document.getElementById("floating-brush-confirm");
      const rotateBtnEl = document.getElementById("floating-brush-rotate");
      if (confirmBtnEl) confirmBtnEl.style.display = placingNow ? "" : "none";
      if (rotateBtnEl) rotateBtnEl.style.display = placingNow ? "" : "none";
      const rotTid = movingBuilding ? movingBuilding.tileId : ((activeBrush && activeBrush !== "erase") ? activeBrush : null);
      if (rotateBtnEl) rotateBtnEl.classList.toggle("is-disabled", !!rotTid && !isRotationVisible(rotTid));

      if (!activeBrush && !movingBuilding && !(kingdomWondersManager && kingdomWondersManager.movingWonderId)) {
        hud.classList.add("hidden");
        return;
      }
      hud.classList.remove("hidden");
      if (thumbEl) thumbEl.style.visibility = "visible";

      if (kingdomWondersManager && kingdomWondersManager.movingWonderId) {
        const wid = kingdomWondersManager.movingWonderId;
        const names = {
          royal_palace: "Đại Lâu Đài Hoàng Gia",
          ocean_library: "Đại Thư Viện Biển Khơi",
          poseidon_statue: "Tượng Thần Biển Poseidon"
        };
        const isFlipped = !!kingdomWondersManager.movingWonderFlipped;
        const buying = !!kingdomWondersManager.purchasingWonder;
        const cost = WONDERS_CONFIG[wid]?.purchaseGold || 0;
        if (titleEl) {
          titleEl.textContent = (buying ? `🏛️ Mua & đặt: ${names[wid] || "Kỳ Quan"}` : `🚚 Di chuyển: ${names[wid] || "Kỳ Quan"}`) + (isFlipped ? " (Đã xoay)" : "");
        }
        if (metaEl) {
          metaEl.textContent = buying
            ? `Giai đoạn 0 • ${cost > 0 ? cost.toLocaleString() + " 🪙" : "Miễn phí"} • Ô cỏ trống • R: Xoay • Esc: Hủy`
            : "Nhấp ô cỏ trống để đặt • R: Xoay hướng • Esc: Hủy";
        }
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
          thumbEl.src = getBuildingSpriteUri(movingBuilding.tileId, movingBuilding.level || 1) || AESTHETIC_TILE_URIS[movingBuilding.tileId] || TILE_DATA_URIS[movingBuilding.tileId] || TILE_DATA_URIS.d12_meadow_wildflowers;
          thumbEl.style.transform = movingBuilding.flipped ? "scaleX(-1)" : "none";
        }
        return;
      }

      if (activeBrush === "erase") {
        if (titleEl) titleEl.textContent = "❌ Công Cụ Phá Dỡ (Xóa)";
        if (metaEl) metaEl.textContent = "Nhấp chuột trái vào ô cần dọn dẹp (Hoàn tiền 100%)";
        if (thumbEl) {
          thumbEl.removeAttribute("src");
          thumbEl.style.visibility = "hidden";
        }
        return;
      }

      const t = tileMap[activeBrush];
      if (t) {
        if (titleEl) titleEl.textContent = t.label + (brushFlipped ? " (Đã xoay)" : "");
        const cost = getTileCost(t.id, t.category);
        if (metaEl) metaEl.textContent = (isPremiumTile(activeBrush)?`Trong túi: ${premiumManager?.getState().inventory[activeBrush]||0}`:((gameMode === "sandbox" || cost === 0) ? "Miễn phí" : `Chi phí: ${cost} 🪙`)) + (isFenceTile(activeBrush) ? " • Đặt trên cạnh, không chiếm ô đất • R: Xoay" : "");
        if (metaEl && activeBrush === 'd13_farmland_plot') {
          const labor = getWorkforce(currentGrid, constructions, tileMap, buildingLevels, extractionManager?.getState(),defenseManager?.getState(),worldManager?.otherLabor());
          metaEl.textContent += ` • 1 dân/luống • Dân rảnh: ${labor.free}`;
        }
        if (thumbEl) {
          thumbEl.src = AESTHETIC_TILE_URIS[t.id] || TILE_DATA_URIS[t.id] || TILE_DATA_URIS.d12_meadow_wildflowers;
          thumbEl.style.transform = brushFlipped ? "scaleX(-1)" : "none";
        }
      }
    }

    function rotateMovingBuilding() {
      if (!movingBuilding) return;
      if (!isRotationVisible(movingBuilding.tileId)) {
        const lm = tileMap[movingBuilding.tileId];
        showToast(`ℹ️ ${lm ? lm.label : "Vật phẩm này"} có hình đối xứng, xoay sẽ không thay đổi gì.`, "info");
        return;
      }
      const res = getRotatedTileIdAndFlip(movingBuilding.tileId, !!movingBuilding.flipped);
      if (tileMap[res.nextId] || isFenceTile(res.nextId)) {
        movingBuilding.tileId = res.nextId;
      }
      movingBuilding.flipped = res.nextFlip;
      playRotateSound();
      const fenceItem = FENCE_ITEM_BY_ID[movingBuilding.tileId];
      const t = fenceItem || tileMap[movingBuilding.tileId];
      showToast(`🔄 Đã xoay: ${t ? t.label : movingBuilding.tileId}`, "info");
      updateFloatingBrushHUD();
      requestRender();
    }

    function rotateCellAt(row, col) {
      const penAnchor=getLivestockAnchor(currentGrid,row,col,constructions);
      if(penAnchor)({row,col}=penAnchor);
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
      if (!curTid || curTid === "d12_meadow_wildflowers") {
        if (rotateFenceAt(row, col)) return;
        return;
      }
      if (!isRotationVisible(curTid)) {
        const lc = tileMap[curTid];
        showToast(`ℹ️ ${lc ? lc.label : "Vật phẩm này"} có hình đối xứng, xoay sẽ không thay đổi gì.`, "info");
        return;
      }

      // Kho Tổng Hợp 2×2: lật hướng cả khối (ảnh chỉ vẽ ở ô neo dưới-phải).
      if (curTid === "b60_combined_warehouse") {
        let minR = row, minC = col;
        for (let rr = row - 1; rr <= row; rr++) {
          for (let cc = col - 1; cc <= col; cc++) {
            if (currentGrid[rr]?.[cc] === "b60_combined_warehouse" &&
                currentGrid[rr + 1]?.[cc] === "b60_combined_warehouse" &&
                currentGrid[rr]?.[cc + 1] === "b60_combined_warehouse" &&
                currentGrid[rr + 1]?.[cc + 1] === "b60_combined_warehouse") {
              minR = rr;
              minC = cc;
            }
          }
        }
        const anchorKey = `${minR + 1}_${minC + 1}`;
        if (flippedGrid[anchorKey]) delete flippedGrid[anchorKey];
        else flippedGrid[anchorKey] = true;
        playRotateSound();
        saveFlippedGrid();
        persistGameState();
        showToast("🔄 Đã lật hướng Kho Tổng Hợp!", "info");
        requestRender();
        return;
      }

      const curFlipped = !!flippedGrid[key];
      const res = getRotatedTileIdAndFlip(curTid, curFlipped);

      if(isLivestockTile(curTid)) {
        const placementCtx={getCurrentGrid:()=>currentGrid,getConstructions:()=>constructions,
          getLandUnlockedChunks:()=>landUnlockedChunks,getGameMode:()=>gameMode,
          getKingdomWondersManager:()=>kingdomWondersManager};
        if(!canPlaceLivestock(placementCtx,curTid,row,col,res.nextFlip,{row,col})) {
          showToast('🚫 Không đủ hai ô đất trống để xoay chuồng.', 'warning');return;
        }
        clearLivestockParts(currentGrid,row,col,terrainMap);
        reserveLivestockCells(currentGrid,row,col,res.nextFlip);
      }

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
        if (kingdomWondersManager && kingdomWondersManager.movingWonderId) {
          kingdomWondersManager.toggleMovingWonderFlip();
          updateFloatingBrushHUD();
          return;
        }
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

    function updateWorkerFoodUI() {
      const element=document.getElementById('builder-stat-worker-food');
      if(!element)return;
      const food=extractionManager?.foodSummary();
      element.textContent=!food?.workers ? '🍞 Chưa có công nhân hoặc lính cần ăn'
        : food.hungry ? '⚠️ Thiếu ăn · khai thác/chiến đấu 50% tốc độ'
        : food.portions<1 ? '🍞 Hết lương thực · chuẩn bị bữa tiếp theo'
        : `🍞 ${food.portions} khẩu phần · dùng ${food.portionsPerMinute.toLocaleString('vi-VN')}/phút`;
      element.style.color=food?.workers&&food.portions<1?'#9a3412':'';
      element.title='Mở Quản lý công nhân để chọn loại lương thực được dùng.';
    }

    function updateVillageStatsUI() {
      updateWorkerFoodUI();
      const stats = calculateVillageStats(currentGrid, constructions, tileMap, buildingLevels);
      const labor = getWorkforce(currentGrid, constructions, tileMap, buildingLevels, extractionManager?.getState(),defenseManager?.getState(),worldManager?.otherLabor());
      const soldiersEl=document.getElementById('builder-stat-soldiers');if(soldiersEl)soldiersEl.textContent=labor.soldiers.toLocaleString();
      const workersEl = document.getElementById('builder-stat-workers');
      if (workersEl) workersEl.textContent = labor.workers.toLocaleString();
      const freeEl = document.getElementById('builder-stat-free-workers');
      const farmEl = document.getElementById('builder-stat-farmers');
      const shortageEl = document.getElementById('builder-stat-worker-shortage');
      if (freeEl) freeEl.textContent = labor.free.toLocaleString();
      if (farmEl) farmEl.textContent = labor.farmers.toLocaleString();
      if (shortageEl) {
        shortageEl.textContent = labor.shortage ? `Thiếu ${labor.shortage} dân — xây thêm nhà ở` : '';
        shortageEl.hidden = !labor.shortage;
      }
      if (activeBrush === 'd13_farmland_plot') updateFloatingBrushHUD();
      if (statPopEl) statPopEl.textContent = labor.worldTotal.toLocaleString();
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

    // Tutorial targets follow the same grid projection as map input, including zoom/pan.
    let tutorialSuggestedCell = null;
    function focusTutorialCell({row,col}) {
      const rect=container.getBoundingClientRect();
      camera.x=rect.width*.55-(ORIGIN_X+(col-row)*HALF_W+64)*camera.zoom;
      camera.y=rect.height*.44-(ORIGIN_Y+(row+col)*QUARTER_W+96)*camera.zoom;
      requestRender();
    }
    function getTutorialWorldTarget(kind) {
      const cells=[];
      for(let row=0;row<currentGrid.length;row++)for(let col=0;col<currentGrid[row].length;col++){
        const key=`${row}_${col}`,id=currentGrid[row][col],farm=farmlandState[key];
        if(kind==='empty'){
          if(isCellUnlocked(row,col,landUnlockedChunks,gameMode)&&!constructions[key]&&canPlaceOnSurface(activeBrush||'b01_cottage_red',id)
            &&!isPlacementProtected(activeBrush||'b01_cottage_red',row,col,id)&&!kingdomWondersManager?.getWonderAt(row,col)&&(!isLivestockTile(activeBrush)||canPlaceLivestock({
              getCurrentGrid:()=>currentGrid,getConstructions:()=>constructions,getUpgradesInProgress:()=>upgradesInProgress,
              getFences:()=>fences,getGameMode:()=>gameMode,getLandUnlockedChunks:()=>landUnlockedChunks,getKingdomWondersManager:()=>kingdomWondersManager
            },activeBrush,row,col,brushFlipped)))cells.push({row,col});
        }else if(kind==='hall'&&id==='b14_town_hall')cells.push({row,col});
        else if(kind==='house'&&(isHousingTile(id)||isHousingTile(constructions[key]?.targetTileId)))cells.push({row,col});
        else if(id==='d13_farmland_plot'&&!constructions[key]){
          if(kind==='empty-farm'&&!farm?.seedId)cells.push({row,col});
          if((kind==='wheat'||kind==='harvest')&&farm?.seedId==='wheat'){
            const remaining=Math.max(0,farm.plantTime+getCropGrowDurationMs(farm)-Date.now());
            if(kind!=='harvest'||remaining===0)cells.push({row,col,remaining});
          }
        }
      }
      if(!cells.length)return null;
      let cell;
      if(kind==='empty'){
        const same=(a,b)=>a&&b&&a.row===b.row&&a.col===b.col;
        cell=cells.find(c=>same(c,hoverCell))||cells.find(c=>same(c,tutorialSuggestedCell));
        if(!cell){cells.sort((a,b)=>(Math.abs(a.row-17)+Math.abs(a.col-16))-(Math.abs(b.row-17)+Math.abs(b.col-16)));cell=cells[0];tutorialSuggestedCell=cell;}
        const confirm=document.getElementById('floating-brush-confirm');
        if(hoverCell&&same(cell,hoverCell)&&confirm&&confirm.getBoundingClientRect().width>0&&tutorialManager?.getControlMode()==='touch')return {element:confirm};
      }else{cells.sort((a,b)=>kind==='hall'?(Math.abs(a.row-13)+Math.abs(a.col-15))-(Math.abs(b.row-13)+Math.abs(b.col-15)):(a.remaining||0)-(b.remaining||0));cell=cells[0];}
      const rect=container.getBoundingClientRect(),zoom=camera.zoom;
      const x=rect.left+camera.x+(ORIGIN_X+(cell.col-cell.row)*HALF_W+64)*zoom;
      const bubble=kind==='harvest',y=rect.top+camera.y+(ORIGIN_Y+(cell.row+cell.col)*QUARTER_W+(bubble?30:96))*zoom;
      return {x:x-(bubble?23:50)*zoom,y:y-(bubble?24:24)*zoom,width:(bubble?46:100)*zoom,height:48*zoom,cell};
    }
    function closeTutorialPanels(){
      closeShopModal();uiModalController.closeMarketModal();uiModalController.closeSeedModal();uiModalController.closeQuestModal();
      uiModalController.closeAchievementsModal();uiModalController.closeSettingsModal();closeStorageModal();
      productionPanel.close();extractionPanel?.close();defensePanel?.close();adventurePanel?.close();
      townCaretakerManager?.closeModal();harborShipManager?.closeModal();dailyWheelManager?.closeModal();
    }
    function openTutorialPanel(panel,category){
      closeTutorialPanels();setActiveBrush(null);farmToolsManager?.deactivateFarmTool();
      if(panel==='shop'){openShopModal();if(category)openShopCategory(category);}
      else if(panel==='market')openMarketModal();
      else if(panel==='seed'){const cell=getTutorialWorldTarget('empty-farm')?.cell;if(cell)openSeedModal(cell.row,cell.col);}
      else if(panel==='quests')openQuestModal();
      else if(panel==='warehouse')openStorageModal();
      else if(panel==='production')productionPanel.open();
      else if(panel==='workers')extractionPanel?.open();
      else if(panel==='defense')defensePanel?.open();
      else if(panel==='world'||panel==='premium')adventurePanel?.open(panel);
      else if(panel==='achievements')uiModalController.openAchievementsModal();
      else if(panel==='caretaker')townCaretakerManager?.openModal();
      else if(panel==='shipping')harborShipManager?.openModal();
      else if(panel==='wheel')dailyWheelManager?.openModal();
      else if(panel==='event')document.getElementById('hud-town-event-card')?.click();
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
      finishTutorialPlacement: () => {setActiveBrush(null);farmToolsManager?.deactivateFarmTool();},
      getActiveBrush: () => activeBrush,
      getActiveSeedBrush: () => farmToolsManager?.getActiveSeedBrush(),
      getTutorialUi: () => ({...readTutorialUi(), shopCategory:shopModal?.classList.contains('open') && shopItemsContainer?.style.display!=='none'?activeShopCategory:null}),
      isTutorialBlocked: () => !document.getElementById('levelup-modal')?.classList.contains('hidden') || !document.getElementById('storage-full-modal')?.classList.contains('hidden'),
      getTutorialWorldTarget,
      focusTutorialCell,
      openTutorialPanel,
      closeTutorialPanels,
      onChanged: () => persistGameState(),
    });
    tutorialManager.init(initialSave.tutorial);
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
        const event = townEventsManager?.getActiveEvent();
        if(event) tutorialManager.onTownEvent(event.id);
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
      onReplayLevelTutorial: () => tutorialManager.replayLevelTutorial(),
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
      getWarehouseCapacity: () => warehouseCapacity,
      getActiveFarmlandCell: () => activeFarmlandCell,
      showStorageFullModal,
      setActiveFarmlandCell: (cell) => { activeFarmlandCell = cell; },
      activateBulkSeedBrush: (crop) => {
        if (farmToolsManager) farmToolsManager.activateBulkSeedBrush(crop);
      },
      loadImportedState: applyImportedState = (imported,regionTravel=false) => {
        imported = normalizeVillageSave(imported);
        if(!regionTravel){worldManager?.init(imported.world);premiumManager?.init(imported.premium);}
        currentGrid = imported.grid;
        mapLocks=normalizeMapLocks(imported.mapLocks);setActiveMapLocks(mapLocks);
        mapScenery=imported.mapScenery||{};customMapLayout=imported.customMapLayout===true;setCustomMapLayout(customMapLayout);
        setHarborSites(mapScenery,customMapLayout);
        if(!imported.customMapLayout)migrateLegacyWarehouseLayout(currentGrid);
        applyCoastTerrainLayout(currentGrid);
        terrainMap = isValidTerrainMap(imported.terrainMap) ? imported.terrainMap : createTerrainMap(currentGrid);
        writeTerrainMap(localStorage, terrainMap);
        syncTerrainToGrid(currentGrid, terrainMap);
        flippedGrid = imported.flippedGrid || {};
        fences = migrateGridFences(currentGrid, flippedGrid, imported.fences || []);
        constructions = imported.constructions || {};
        productionManager.setState(imported.productionState || {});
        buildingLevels = imported.buildingLevels || {};
        upgradesInProgress = imported.upgradesInProgress || {};
        farmlandState = imported.farmlandState || {};
        for (const [k, f] of Object.entries(farmlandState)) {
          if (!f || typeof f !== "object" || !f.seedId) delete farmlandState[k];
          else getCropGrowDurationMs(f);
        }
        landUnlockedChunks = Array.isArray(imported.land?.unlockedChunks) ? imported.land.unlockedChunks : [...INITIAL_UNLOCKED_CHUNKS];
        if (imported.economy) {
          gameMode = imported.economy.gameMode || "game";
          playerGold = typeof imported.economy.playerGold === "number" ? imported.economy.playerGold : INITIAL_GOLD;
          if (typeof imported.economy.playerGems === "number") playerGems = imported.economy.playerGems;
        }
        if (imported.storage) {
          const importedCap = typeof imported.storage.warehouseCapacity === "number"
            ? imported.storage.warehouseCapacity
            : (imported.storage.siloCapacity || 0) + (imported.storage.barnCapacity || 0);
          warehouseCapacity = Math.min(1000, Math.max(300, importedCap));
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
        // Khôi phục tiến trình nhiệm vụ khi import, tránh nhận lại toàn bộ thưởng đã nhận.
        if (imported.quests && typeof imported.quests === "object") {
          if (typeof imported.quests.harvestsCount === "number") {
            totalHarvestsCount = imported.quests.harvestsCount;
          }
          if (imported.quests.claimedQuests && typeof imported.quests.claimedQuests === "object") {
            questsClaimed = imported.quests.claimedQuests;
          }
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
          kingdomWondersManager.init(imported.kingdomWonders,imported.wonderSites||{});
        }
        if (dailyWheelManager && imported.dailyWheel) {
          dailyWheelManager.init(imported.dailyWheel);
        }
        if (uiModalController && typeof uiModalController.setClaimedAchievements === "function" && imported.achievements) {
          uiModalController.setClaimedAchievements(imported.achievements);
        }
        if (seasonalThemeManager && imported.activeSeason) {
          seasonalThemeManager.setSeason(imported.activeSeason);
        }
        extractionManager?.init(imported.extraction);
        extractionPanel?.close();
        defenseManager?.init(imported.defense);
        defensePanel?.close();
        defensePanel?.render();
        adventurePanel?.render();
        movingBuilding=null;setActiveBrush(null);hoverCell=null;
        if(villagerManager)villagerManager.villagers=[];
        if(petManager)petManager.pets=[];
        undoStack = [];
        redoStack = [];
        updateUndoRedoButtons();
        updateGoldDisplay();
        updateResourcesUI();
        updateModeUI();
        updateVillageStatsUI();
        checkQuestsProgress();
        if(!regionTravel){tutorialManager.init(imported.tutorial);tutorialManager.start();persistGameState();}
      }
    });

    // Khôi phục thành tựu đã nhận từ save (trước đây chỉ lưu ở localStorage riêng nên export/import bị mất).
    if (uiModalController && typeof uiModalController.setClaimedAchievements === "function" && initialSave && initialSave.achievements) {
      uiModalController.setClaimedAchievements(initialSave.achievements);
    }

    // Global Dev testing shortcut for console or instant testing
    window.loadDevTestSave = () => {
      if (applyImportedState) {
        const devSave = {
          ...DEV_FULL_VILLAGE_SAVE,
          grid: DEV_FULL_VILLAGE_SAVE.grid.map(row => [...row])
        };
        applyTownCenterLayout(devSave.grid);
        applyImportedState(devSave);
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
    const shopModalBackBtn = document.getElementById("shop-modal-back-btn");
    const btnOpenShop = document.getElementById("btn-open-shop");
    const shopCategoriesGrid = document.getElementById("shop-categories-grid");
    const shopItemsContainer = document.getElementById("shop-items-container");
    let activeShopCategory = 'residential';

    function showShopCategories() {
      if (shopCategoriesGrid) shopCategoriesGrid.style.display = "grid";
      if (shopItemsContainer) shopItemsContainer.style.display = "none";
      if (shopModalBackBtn) shopModalBackBtn.style.display = "none";
      const modalBody = shopModal ? shopModal.querySelector(".shop-modal-body") : null;
      if (modalBody) modalBody.scrollTop = 0;
      const card = shopModal ? shopModal.querySelector(".shop-modal-card") : null;
      if (card) card.scrollTop = 0;
    }

    function openShopCategory(categoryKey) {
      activeShopCategory = categoryKey;
      if (shopCategoriesGrid) shopCategoriesGrid.style.display = "none";
      if (shopItemsContainer) {
        shopItemsContainer.style.display = "grid";
        shopItemsContainer.scrollTop = 0;
      }
      if (shopModalBackBtn) shopModalBackBtn.style.display = "inline-flex";
      renderShopItems();
      const modalBody = shopModal ? shopModal.querySelector(".shop-modal-body") : null;
      if (modalBody) modalBody.scrollTop = 0;
    }

    function openShopModal() {
      if (!shopModal) return;
      playModalOpenSound();

      showShopCategories();
      shopModal.classList.add("open");

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

    // Gom/sổ cụm nút tròn phía dưới (điện thoại)
    const deckToggleBtn = document.getElementById("deck-toggle-btn");
    const bottomLeftDeck = document.getElementById("bottom-left-deck");
    if (deckToggleBtn && bottomLeftDeck) {
      deckToggleBtn.addEventListener("click", () => {
        playUIClickSound();
        const isOpen = bottomLeftDeck.classList.toggle("open");
        deckToggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      bottomLeftDeck.addEventListener("click", (e) => {
        if (e.target.closest && e.target.closest(".deck-buttons .deck-circle-btn")) {
          setTimeout(() => {
            bottomLeftDeck.classList.remove("open");
            deckToggleBtn.setAttribute("aria-expanded", "false");
          }, 0);
        }
      });
    }
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
    if (shopModalBackBtn) {
      shopModalBackBtn.addEventListener("click", () => {
        playUIClickSound();
        showShopCategories();
      });
    }

    if (shopModal) {
      shopModal.addEventListener("click", function(e) {
        if (e.target === shopModal) closeShopModal();
      });
    }

    // Storage Badges & Modals Listeners
    const hudWarehouseBadge = document.getElementById("hud-storage-warehouse-badge");
    const hudQuickStorageBtn = document.getElementById("hud-quick-storage-btn");
    const storageModalClose = document.getElementById("storage-modal-close");
    const storageDismissBtn = document.getElementById("storage-dismiss-btn");
    const storageUpgradeBtn = document.getElementById("storage-upgrade-btn");

    if (hudWarehouseBadge) hudWarehouseBadge.addEventListener("click", openStorageModal);
    if (hudQuickStorageBtn) hudQuickStorageBtn.addEventListener("click", openStorageModal);
    if (storageModalClose) storageModalClose.addEventListener("click", closeStorageModal);
    if (storageDismissBtn) storageDismissBtn.addEventListener("click", closeStorageModal);
    if (storageUpgradeBtn) storageUpgradeBtn.addEventListener("click", upgradeStorageCurrentTab);

    // Storage Full Warning Listeners
    const storageFullCloseBtn = document.getElementById("storage-full-close-btn");
    const storageFullUpgradeBtn = document.getElementById("storage-full-upgrade-btn");
    const storageFullOrdersBtn = document.getElementById("storage-full-orders-btn");
    const storageFullModal = document.getElementById("storage-full-modal");

    if (storageFullCloseBtn) storageFullCloseBtn.addEventListener("click", closeStorageFullModal);
    if (storageFullUpgradeBtn) storageFullUpgradeBtn.addEventListener("click", () => {
      closeStorageFullModal();
      openStorageModal();
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

    document.querySelectorAll(".shop-cat-card").forEach(catBtn => {
      catBtn.addEventListener("click", () => {
        playUIClickSound();
        const cat = catBtn.getAttribute("data-shop-cat");
        if (cat) openShopCategory(cat);
      });
    });

    function renderShopItems() {
      if (!shopItemsContainer) return;
      shopItemsContainer.innerHTML = "";

      if (activeShopCategory === 'wonders') {
        Object.values(WONDERS_CONFIG).forEach((wonder) => {
          const placed = kingdomWondersManager && kingdomWondersManager.isWonderPlaced(wonder.id);
          const stage = kingdomWondersManager ? (kingdomWondersManager.wondersState[wonder.id] || 0) : 0;
          const cost = wonder.purchaseGold || 0;
          const card = document.createElement("div");
          card.dataset.wonderId = wonder.id;
          card.className = "shop-item-card" + (placed ? " selected" : "");
          card.innerHTML = `
            <img class="shop-item-thumb" src="/assets/wonders/${wonder.id}.png" alt="${wonder.name}" onerror="this.onerror=null; this.src='tiles/d12_meadow_wildflowers_128.png';" />
            <div class="shop-item-name">${wonder.icon} ${wonder.name}</div>
            <div class="shop-item-badges">
              <span class="shop-item-cost">${placed ? "Đã sở hữu" : (cost === 0 ? "Miễn phí" : `${cost} 🪙`)}</span>
            </div>
          `;
          card.addEventListener("click", () => {
            if (!kingdomWondersManager) return;
            if (placed) {
              closeShopModal();
              kingdomWondersManager.openModal(wonder.id);
              return;
            }
            const ok = kingdomWondersManager.startPurchasingWonder(wonder.id);
            if (ok) closeShopModal();
          });
          shopItemsContainer.appendChild(card);
        });
      }

      const filtered = TILES_DATA.filter(t => {
        if(t.id==='b69_forester_lodge'&&worldManager?.getState().active!=='forest')return false;
        if (EXCLUDED_SHOP_TILES.has(t.id)) return false;
        const hasRealImage = !!getBuildingSpriteUri(t.id, 1) || !!AESTHETIC_TILE_URIS[t.id] || !!TILE_DATA_URIS[t.id] || isFenceTile(t.id);
        if (!hasRealImage) return false;

        return getShopCategory(t) === activeShopCategory;
      });

      filtered.forEach(tile => {
        const reqLvl = getTileRequiredLevel(tile.id);
        const isLocked = reqLvl > playerLevel;
        const isPen = isLivestockTile(tile.id);
        const maxPens = isPen ? getMaxPenCount(tile.id, playerLevel) : Infinity;
        const builtPens = isPen ? countBuiltPens(tile.id) : 0;
        const isPenLimitReached = isPen && !isLocked && builtPens >= maxPens;
        const farmLabor = tile.id === 'd13_farmland_plot'
          ? checkFarmWorkforce(currentGrid, constructions, tileMap, buildingLevels, extractionManager?.getState(),defenseManager?.getState(),worldManager?.otherLabor()) : null;

        const card = document.createElement("div");
        card.dataset.tileId = tile.id;
        card.className = "shop-item-card" + (activeBrush === tile.id ? " selected" : "") + (isLocked || isPenLimitReached ? " locked-item" : "");
        const shopName=FRUIT_TREES_CONFIG[tile.id]?"Hạt giống "+tile.label:tile.label;
        card.title = FRUIT_TREES_CONFIG[tile.id]?"Gieo hạt → mầm → cây con → cây non → trổ hoa → chín. Thu hoạch 3 lần rồi héo.":tile.doc || tile.label;
        const cost = getTileCost(tile.id, tile.category);
        const pop = getTilePopulation(tile.id, tile.category);
        const imgSrc = getBuildingSpriteUri(tile.id, 1) || AESTHETIC_TILE_URIS[tile.id] || TILE_DATA_URIS[tile.id];
        if (!imgSrc && !isFenceTile(tile.id)) return;

        let penBadge = "";
        if (isPen && !isLocked) {
          penBadge = `<span style="font-size:0.68rem; padding:1px 5px; border-radius:4px; background:${isPenLimitReached ? '#fee2e2' : '#e0f2fe'}; color:${isPenLimitReached ? '#b91c1c' : '#0369a1'}; font-weight:700;">Chuồng: ${builtPens}/${maxPens}</span>`;
        }

        card.innerHTML = `
          ${isLocked ? `<div class="locked-badge-overlay">🔒 Cần Cấp ${reqLvl}</div>` : (isPenLimitReached ? `<div class="locked-badge-overlay" style="background: rgba(15, 23, 42, 0.75); color: #facc15;">🛖 Đầy chuồng (${builtPens}/${maxPens})</div>` : '')}
          ${isFenceTile(tile.id) || isExpansionGround(tile.id) || FRUIT_TREES_CONFIG[tile.id]
            ? `<canvas class="shop-item-thumb" width="160" height="160" role="img" aria-label="${tile.label}"></canvas>`
            : `<img class="shop-item-thumb" src="${imgSrc}" alt="${tile.label}" onerror="this.style.visibility='hidden';" />`}
          <div class="shop-item-name">${shopName}</div>
          <div class="shop-item-badges">
            <span class="shop-item-cost">${cost === 0 ? "Miễn phí" : `${cost} 🪙`}</span>
            ${pop > 0 ? `<span class="shop-item-pop">+${pop} 👥</span>` : ''}
            ${reqLvl > 1 ? `<span style="font-size:0.68rem; padding:1px 5px; border-radius:4px; background:${isLocked ? '#fee2e2' : '#f0fdf4'}; color:${isLocked ? '#b91c1c' : '#15803d'}; font-weight:700;">Lv.${reqLvl}</span>` : ''}
            ${penBadge}
            ${farmLabor ? `<span class="shop-item-pop">1 dân/luống · Dân rảnh: ${farmLabor.free}${farmLabor.shortage ? ` · Thiếu ${farmLabor.shortage} dân` : ''}</span>` : ''}
            ${isPen ? '<span class="shop-item-pop">2×1 ô</span>' : ''}
            ${FRUIT_TREES_CONFIG[tile.id] ? '<span class="shop-item-pop">3 lần thu hoạch</span>' : ''}
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
          if (tile.id === 'd13_farmland_plot') {
            const labor = checkFarmWorkforce(currentGrid, constructions, tileMap, buildingLevels, extractionManager?.getState(),defenseManager?.getState(),worldManager?.otherLabor());
            if (!labor.allowed) { showToast(labor.message, 'warning'); return; }
          }
          setActiveBrush(tile.id);
          closeShopModal();
          showToast(FRUIT_TREES_CONFIG[tile.id]?`🌰 Đã chọn ${shopName}. Chạm ô đất trống để gieo.`:`🏗️ Đã chọn: ${tile.label}`, "info");
        });

        if (isFenceTile(tile.id)) paintFenceThumbnail(card.querySelector("canvas"), tile.id);
        else if (isExpansionGround(tile.id)) paintExpansionGroundThumbnail(card.querySelector('canvas'), tile.id);
        else if(FRUIT_TREES_CONFIG[tile.id])paintFruitTreeThumbnail(card.querySelector('canvas'),tile.id);
        shopItemsContainer.appendChild(card);
      });
    }

    // =========================================================================
    // FARM TOOLS (GIEO HẠT & THU HOẠCH HÀNG LOẠT) (Refactored to src/engine/farmTools.js)
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
      spawnFlyingProduce: (c,r,icon,resourceId) => spawnFlyingProduce(c,r,icon,resourceId),
      setActiveBrush: (brush) => setActiveBrush(brush),
      clearMovingBuilding: () => {
        movingBuilding = null;
        updateFloatingBrushHUD();
      },
      checkAndFeedBakeries: () => checkAndFeedBakeries(),
      saveGameEconomyState: () => saveGameEconomyState(),
      persistGameState: () => persistGameState(),
      getLandUnlockedChunks: () => landUnlockedChunks,
      getGameMode: () => gameMode,
      checkQuestsProgress: (showToast) => checkQuestsProgress(showToast),
      onTutorialAction: (action, payload) => tutorialManager.onAction(action, payload),
      getCropYieldMultiplier: () => (townEventsManager ? townEventsManager.getCropYieldMultiplier() : 1),
      getXpMultiplier: () => (townEventsManager ? townEventsManager.getXpMultiplier() : 1.0),
      openSeedModal: (row, col) => uiModalController.openSeedModal(row, col),
      getWarehouseCapacity: () => warehouseCapacity,
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
      rotateCellAt,
      removeFenceAt,
      rotateFenceAt,
      setMovingBuilding: (info) => {
        const message = info && (extractionManager?.busyMessage(info.fromRow, info.fromCol)||defenseManager?.busyMessage(info.fromRow,info.fromCol));
        if(message){showToast(message,'warning');return false;}
        movingBuilding = info;
      },
      triggerAutoSave
    });

    const productionPanel = createProductionPanel({
      manager: productionManager,
      getCurrentGrid: () => currentGrid, getConstructions: () => constructions,
      getTileMap: () => tileMap, getPlayerResources: () => playerResources,
      getPlayerLevel: () => playerLevel, getWarehouseCapacity: () => warehouseCapacity,
      getBuildingLevels: () => buildingLevels,
      getFarmlandState: () => farmlandState, getLivestockState: () => livestockState,
      openLivestockModal, openUpgradeModal: (r, c) => upgradeManager.openUpgradeModal(r, c), showToast,
      focusCell: (r, c) => {
        const vp = getViewportSize();
        camera.x = vp.width / 2 - (ORIGIN_X + (c-r) * HALF_W + 64) * camera.zoom;
        camera.y = vp.height / 2 - (ORIGIN_Y + (r+c) * QUARTER_W + 96) * camera.zoom;
        requestRender();
      }
    });
    document.getElementById('btn-production-overview')?.addEventListener('click', () => productionPanel.open(), { signal });
    document.getElementById('btn-restore-backup')?.addEventListener('click', () => {
      try {
        if (restoreBackupSave()) window.location.reload();
        else showToast('Chưa có bản lưu dự phòng hợp lệ.', 'warning');
      } catch { showToast('Không thể khôi phục bản dự phòng.', 'error'); }
    }, { signal });

    function placeFence(tileId, row, col, flipped = false) {
      return placeFenceOnEdges({
        getFences: () => fences, getCurrentGrid: () => currentGrid,
        getLandUnlockedChunks: () => landUnlockedChunks, getGameMode: () => gameMode,
        getPlayerGold: () => playerGold, deductGold: amount => { playerGold -= amount; },
        updateGoldDisplay, showToast, requestRender, triggerAutoSave
      }, tileId, row, col, flipped);
    }

    function removeFenceAt(row, col) {
      const index = fences.findIndex(f => f.row === row && f.col === col);
      if (index >= 0) {
        const removed = fences[index];
        if(removed.locked){showToast('Vật phẩm mặc định của map không thể gỡ.','info');return false;}
        fences.splice(index, 1);
        const item = FENCE_ITEM_BY_ID[removed.tileId];
        const refund = item ? Math.floor(item.price * 0.5) : 15;
        if (refund > 0 && gameMode === "game") {
          playerGold += refund;
          updateGoldDisplay();
          saveGameEconomyState();
        }
        showToast(`♻️ Đã dỡ bỏ ${item ? item.label : "hàng rào"} (+${refund} 🪙 [50%])`, "success");
        playBuildSound();
        persistGameState();
        requestRender();
        return true;
      }
      return false;
    }

    function rotateFenceAt(row, col) {
      let f = fences.find(x => x.row === row && x.col === col);
      if (!f) {
        f = fences.find(x => {
          const segs = getFenceSegments(x.tileId, x.row, x.col, x.flipped);
          return segs.some(([a, b]) => (a.row === row && a.col === col) || (b.row === row && b.col === col));
        });
      }
      if (f) {
        if(f.locked){showToast('Hàng rào mặc định của map không thể thay đổi.','info');return false;}
        const res = getRotatedTileIdAndFlip(f.tileId, !!f.flipped);
        f.tileId = res.nextId;
        f.flipped = res.nextFlip;
        playRotateSound();
        const item = FENCE_ITEM_BY_ID[f.tileId];
        showToast(`🔄 Đã xoay: ${item ? item.label : "Hàng rào"}`, "info");
        persistGameState();
        requestRender();
        return true;
      }
      return false;
    }

    function eraseMapScenery(row,col){
      const key=`${row}_${col}`,item=mapScenery[key];if(!item)return false;
      if(item.locked){showToast('Vật phẩm mặc định của map không thể gỡ.','info');return false;}
      mapScenery[key]=null;setHarborSites(mapScenery,customMapLayout);
      persistGameState();requestRender();return true;
    }

    // Erase cell logic
    function eraseCell(row, col) {
      if(mapScenery[`${row}_${col}`])return eraseMapScenery(row,col);
      if(isMapLockedCell(row,col)){showToast('Vật phẩm mặc định của map không thể gỡ.','info');return false;}
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
      const penAnchor=getLivestockAnchor(currentGrid,row,col,constructions);
      if(penAnchor)({row,col}=penAnchor);
      const tid = constructions[`${row}_${col}`]?.targetTileId || currentGrid[row]?.[col];
      if(typeof premiumManager!=='undefined'&&premiumManager&&isPremiumTile(tid)){
        const result=premiumManager.reclaim(row,col);showToast(result.ok?'Đã cất vật phẩm về túi.':result.error,result.ok?'success':'warning');return result.ok;
      }
      // Hàng rào là lớp riêng trên nền cố định; gỡ rào không làm thay đổi nền.
      if (getTerrainSprite(tid) && !constructions[`${row}_${col}`] &&
          fences.some(f => f.row === row && f.col === col)) {
        if (gameMode === 'game' && !isCellUnlocked(row,col,landUnlockedChunks,gameMode)) return false;
        return removeFenceAt(row,col);
      }
      if (getTerrainSprite(tid) || isProtectedTile(row, col, tid)) {
        if (col <= 5) {
          showToast("🌊 Vùng biển đại dương & bờ cảng tự nhiên của vương quốc, không thể gỡ bỏ!", "warning");
        } else {
          showToast("🏛️ Công trình mặc định của vương quốc, không thể gỡ bỏ!", "warning");
        }
        return false;
      }
      if (isIndestructibleTile(tid)&&!isMapRemovableCell(row,col)) {
        showToast("🏛️ Nhà kho vương quốc là công trình thiết yếu, không thể gỡ bỏ!", "warning");
        return false;
      }
      if (gameMode === "game" && !isCellUnlocked(row, col, landUnlockedChunks, gameMode)) {
        showToast("🔒 Không thể sửa đổi vùng đất chưa được mở khóa!", "warning");
        return false;
      }
      const key = `${row}_${col}`;
      const extraction = typeof extractionManager !== 'undefined' ? extractionManager : null;
      const defense = typeof defenseManager !== 'undefined' ? defenseManager : null;
      const busyMessage = extraction?.busyMessage(row,col)||defense?.busyMessage(row,col);
      if(busyMessage){showToast(busyMessage,'warning');return false;}
      const removal = checkHousingRemoval(currentGrid, row, col, constructions, tileMap, buildingLevels, extraction?.getState(),defense?.getState(),typeof worldManager!=='undefined'?worldManager?.otherLabor():undefined);
      if (!removal.allowed) { showToast(removal.message, 'warning'); return false; }
      defense?.removeTower(row,col);
      if(isLivestockTile(tid))clearLivestockParts(currentGrid,row,col,terrainMap);
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

      if (currentGrid[row][col] === "d12_meadow_wildflowers") {
        if (removeFenceAt(row, col)) return true;
        return false;
      }

      if (currentGrid[row][col] !== "d12_meadow_wildflowers") {
        const oldTid = currentGrid[row][col];
        const oldT = tileMap[oldTid];
        const curLvl = buildingLevels[key] || 1;
        const deadTree=FRUIT_TREES_CONFIG[oldTid]&&getFruitTreeVisual(oldTid,resolveFruitTreeState(productionManager.getState()[key],fruitTreesState[key])).exhausted;
        const refundInfo = deadTree?{baseRefund:0,upgradeRefund:0,totalRefund:0}:calculateDemolishRefund(oldTid, oldT ? oldT.category : "building", curLvl, gameMode);
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
        productionManager.clearCell(key);
        delete fruitTreesState[key];
        if(deadTree)showToast("🪏 Đã đào cây héo. Bạn có thể gieo hạt mới tại ô này.","success");
        saveProductionState();
        if (livestockState && livestockState[key]) {
          delete livestockState[key];
        }
        currentGrid[row][col] = getClearedSurface(oldTid, row, col, terrainMap);
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
            productionManager.markBuilt(key, c.targetTileId, now);
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
    // KHO TỔNG HỢP MANAGEMENT
    // =========================================================================
    function updateStorageHUD() {
      const used = getWarehouseUsed(playerResources);
      const warehouseCountEl = document.getElementById("hud-warehouse-count");
      const warehouseBadge = document.getElementById("storage-badge-warehouse");

      if (warehouseCountEl) warehouseCountEl.textContent = `${used}/${warehouseCapacity}`;
      if (warehouseBadge) warehouseBadge.textContent = `${used}/${warehouseCapacity}`;
    }

    function openStorageModal() {
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
      const capTitle = document.getElementById("storage-cap-title");
      const capValue = document.getElementById("storage-cap-value");
      const meterFill = document.getElementById("storage-meter-fill");
      const gridEl = document.getElementById("storage-items-grid");

      const used = getWarehouseUsed(playerResources);
      const pct = Math.min(100, Math.round((used / warehouseCapacity) * 100));

      if (capTitle) capTitle.textContent = "Sức chứa Kho Tổng Hợp:";
      if (capValue) capValue.textContent = `${used} / ${warehouseCapacity}`;
      if (meterFill) {
        meterFill.style.width = `${pct}%`;
        meterFill.classList.toggle("near-full", pct >= 90);
      }

      if (gridEl) {
        gridEl.innerHTML = WAREHOUSE_RESOURCE_IDS.map(id => {
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
      const MAX_WAREHOUSE_CAPACITY = 1000;

      if (warehouseCapacity >= MAX_WAREHOUSE_CAPACITY) {
        playErrorSound();
        showToast(`🏆 Kho Tổng Hợp đã đạt sức chứa tối đa ${MAX_WAREHOUSE_CAPACITY}!`, "info");
        return;
      }

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

      warehouseCapacity = Math.min(MAX_WAREHOUSE_CAPACITY, warehouseCapacity + 25);
      showToast(`🎉 Đã nâng cấp Kho Tổng Hợp (+25 sức chứa)! Sức chứa mới: ${warehouseCapacity}`, "success");

      playUpgradeSound();
      updateGoldDisplay();
      updateResourcesUI();
      persistGameState();
      renderStorageModalContent();
    }

    function showStorageFullModal() {
      const modal = document.getElementById("storage-full-modal");
      const titleEl = document.getElementById("storage-full-title");
      const descEl = document.getElementById("storage-full-desc");
      const used = getWarehouseUsed(playerResources);
      if (titleEl) titleEl.textContent = "📦 Kho Tổng Hợp Đã Đầy!";
      if (descEl) descEl.textContent = `Sức chứa kho (${used}/${warehouseCapacity}) đã đạt giới hạn tối đa. Hãy giao bớt hàng hoặc nâng cấp kho để tiếp tục thu hoạch.`;

      if (modal) {
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
      productionManager.markBuilt(key, c.targetTileId, now);
      if (FRUIT_TREES_CONFIG[c.targetTileId]) {
        fruitTreesState[key] = {...(productionManager.getState()[key] || createFruitTreeState())};
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

      const cost = getNextChunkCost(landUnlockedChunks);
      const goldOk = playerGold >= cost.gold;

      const bounds = getChunkBounds(chunkId);
      if (subTitleEl) {
        subTitleEl.textContent = `Vùng đất mới [Cột ${bounds.startCol}-${bounds.endCol}, Hàng ${bounds.startRow}-${bounds.endRow}] (16 ô đất màu mỡ)`;
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
                  <span class="land-req-ico">${resourceIconHtml(resKey,resCfg.name,22,resCfg.icon)}</span>
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
      if (landUnlockedChunks.includes(cId)) {
        closeLandExpansionModal();
        return;
      }
      if (!isChunkAdjacentToUnlocked(cId, landUnlockedChunks)) {
        playErrorSound();
        showToast("🔒 Mảnh đất này chưa thể mở! Hãy mở các mảnh đất kề cận trước.", "warning");
        closeLandExpansionModal();
        return;
      }
      const cost = getNextChunkCost(landUnlockedChunks);
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

      pendingExpansionChunkId = null;
      const landConfirmBtn = document.getElementById("land-modal-confirm-btn");
      if (landConfirmBtn) landConfirmBtn.disabled = true;

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

    const livestockSounds = { chicken: playChickenCluckSound, cow: playCowMooSound, sheep: playSheepBaaSound, pig: playHarvestPlopSound };
    const LIVESTOCK_CONFIG = Object.fromEntries(Object.entries(LIVESTOCK_RULES).map(([id, rule]) => [id, { ...rule, sound: livestockSounds[rule.sound] }]));

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
      if (isLivestockTile(tileId)) {
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
      // Chốt số con được cho ăn: mua thêm con giữa chu kỳ sẽ không sinh thêm sản phẩm miễn phí.
      ls.fedCount = ls.animalCount;

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
      const yieldAmt = Math.max(1, Math.min(ls.animalCount, typeof ls.fedCount === "number" ? ls.fedCount : ls.animalCount));
      if (getWarehouseUsed(playerResources) + yieldAmt > warehouseCapacity) {
        if (!silent) showStorageFullModal();
        return false;
      }

      playerResources[cfg.productRes] = Math.min(RESOURCE_MAX_CAPACITY, (playerResources[cfg.productRes] || 0) + yieldAmt);
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
        spawnFlyingProduce(col,row,cfg.productIcon,cfg.productRes);
        showToast(`🎉 Thu hoạch ${yieldAmt} ${cfg.productName} thành công! (+${goldEarned}🪙, +${xpEarned}XP)`, "success");
      }

      ls.state = "hungry";
      delete ls.fedCount;
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
      if (isFenceTile(activeBrush)) return placeFence(activeBrush, row, col, brushFlipped);
      if (gameMode === "game" && !isCellUnlocked(row, col, landUnlockedChunks, gameMode)) return false;
      if (kingdomWondersManager && typeof kingdomWondersManager.getWonderAt === "function" &&
          kingdomWondersManager.getWonderAt(row, col)) return false;
      const key = `${row}_${col}`;
      if (constructions[key]) return false;
      if (isPlacementProtected(activeBrush, row, col, currentGrid[row]?.[col])) return false;
      if (currentGrid[row][col] === activeBrush) return false;

      // Collision Check: Chỉ cho phép vẽ đường / luống đất lên ô cỏ hoa trống
      const curTid = currentGrid[row][col];
      const isEmptyGrass = canPlaceOnSurface(activeBrush, curTid);
      if (!isEmptyGrass) return false;

      if (activeBrush === 'd13_farmland_plot') {
        const labor = checkFarmWorkforce(currentGrid, constructions, tileMap, buildingLevels, typeof extractionManager !== 'undefined' ? extractionManager?.getState() : undefined,typeof defenseManager !== 'undefined'?defenseManager?.getState():undefined,typeof worldManager!=='undefined'?worldManager?.otherLabor():undefined);
        if (!labor.allowed) { showToast(labor.message, 'warning'); return false; }
      }

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
      productionManager.markBuilt(key, activeBrush);
      if (FRUIT_TREES_CONFIG[activeBrush]) {
        fruitTreesState[key] = {...(productionManager.getState()[key] || createFruitTreeState())};
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
    // Helper: Thu hoạch công trình sản xuất. State machine nằm trong productionManager.
    function harvestProductionBuilding(row, col, silent = false) {
      return productionManager ? productionManager.harvest(row, col, silent) : false;
    }

    // Helper: Thu hoạch cây ăn quả độc lập ngoài đồng cỏ (Táo 🍎, Dừa 🥥, Me 🍈)
    function harvestFruitTree(row, col, silent = false) {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
      const tid = currentGrid[row][col];
      const treeCfg = FRUIT_TREES_CONFIG[tid];
      if (!treeCfg) return false;

      const pKey = `${row}_${col}`;
      const tState=resolveFruitTreeState(productionManager.getState()[pKey],fruitTreesState[pKey]);
      const yieldMult=townEventsManager?townEventsManager.getCropYieldMultiplier():1;
      const result=harvestFruitTreeProduce(tid,tState,playerResources,warehouseCapacity,Date.now(),yieldMult);
      if(!result.ok){
        if(!silent){
          if(result.reason==="storageFull")showStorageFullModal();
          else if(result.reason==="exhausted")showToast("🍂 Cây đã thu hoạch đủ 3 lần. Hãy đào cây để gieo hạt mới.","info");
          else showToast(`⏳ ${treeCfg.name} đang kết trái... Chờ thêm ${result.waitSec}s nữa nhé!`,"info");
        }
        return false;
      }
      const yieldQty=result.qty;
      fruitTreesState[pKey]={...result.nextState};
      productionManager.setEntry(pKey,{...result.nextState});

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

      // Produce has been credited after capacity/readiness checks.
      playerGold += goldEarned;
      totalHarvestsCount++;
      addPlayerXP(xpEarned, treeCfg.name);
      updateGoldDisplay();

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
        spawnFlyingProduce(col,row,treeCfg.icon,treeCfg.fruitId);
        showToast(`🍎 Đã rung cây thu hoạch ${yieldQty} ${treeCfg.fruitName}! (+${goldEarned}🪙, +${xpEarned}XP)`, "success");
      } else {
        spawnFlyingProduce(col,row,treeCfg.icon,treeCfg.fruitId);
      }

      updateResourcesUI();
      persistGameState();
      checkQuestsProgress(true);
      requestRender();
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
      getWarehouseCapacity: () => warehouseCapacity,
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
      spawnFlyingProduce: (c,r,icon,resourceId) => spawnFlyingProduce(c,r,icon,resourceId),
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
      getCurrentGrid: () => currentGrid,
      getConstructions: () => constructions,
      setActiveBrush: (id) => setActiveBrush(id),
      clearMovingBuilding: () => { movingBuilding = null; },
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
      updateFloatingBrushHUD: () => updateFloatingBrushHUD(),
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
      commitSpin: (slice, cost) => {
        if (playerGems < cost) return false;
        const oldGold = playerGold, oldGems = playerGems;
        playerGems -= cost;
        if (slice.type === 'gold') playerGold += slice.amount;
        else playerGems += slice.amount;
        if (!saveGameSave(getFullSaveData())) {
          playerGold = oldGold;
          playerGems = oldGems;
          return false;
        }
        updateGoldDisplay();
        updateGemsDisplay();
        return true;
      },
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

    worldManager=createWorldManager({getSave:getFullSaveData,getTileMap:()=>tileMap,getResources:()=>playerResources,getCapacity:()=>warehouseCapacity,
      spendGold:n=>{playerGold-=n;},addGold:n=>{playerGold+=n;},addGems:n=>{playerGems+=n;},addXP:n=>addPlayerXP(n,'Vùng đất'),notify:showToast,
      applySave:save=>{applyImportedState(save,true);centerCamera();renderCanvas();requestRender();},persist:()=>saveGameSave(getFullSaveData()),
      isPlacing:()=>!!(activeBrush||movingBuilding||kingdomWondersManager?.movingWonderId),
      onChanged:()=>{updateGoldDisplay();updateResourcesUI();updateVillageStatsUI();persistGameState();requestRender();}});
    worldManager.init(initialSave.world);
    premiumManager=createPremiumManager({getGems:()=>playerGems,setGems:n=>{playerGems=n;},getGold:()=>playerGold,setGold:n=>{playerGold=n;},
      getResources:()=>playerResources,getGrid:()=>currentGrid,getConstructions:()=>constructions,getFlips:()=>flippedGrid,getTerrain:()=>terrainMap,
      isUnlocked:(r,c)=>isCellUnlocked(r,c,landUnlockedChunks,gameMode),isObstacle:(r,c)=>!!kingdomWondersManager?.getWonderAt(r,c),
      persist:()=>saveGameSave(getFullSaveData()),onChanged:()=>{updateGoldDisplay();updateResourcesUI();updateFloatingBrushHUD();
        if(isPremiumTile(activeBrush)&&!premiumManager.getState().inventory[activeBrush])setActiveBrush(null);requestRender();}});
    premiumManager.init(initialSave.premium);
    adventurePanel=createAdventurePanel({world:worldManager,premium:premiumManager,signal,showToast,getGems:()=>playerGems,
      getDefense:()=>defenseManager?.getState(),
      selectTile:id=>{movingBuilding=null;setActiveBrush(id);},onOpen:()=>{extractionPanel?.close();defensePanel?.close();}});
    adventurePanel.render();

    extractionManager = createExtractionManager({
      getOtherLabor:()=>worldManager.otherLabor(),
      getDefenseState:()=>defenseManager?.getState(),getSoldierFoodCount:()=>defenseManager?.soldierFoodCount()||0,
      getCurrentGrid: () => currentGrid, getConstructions: () => constructions,
      getBuildingLevels: () => buildingLevels, getTileMap: () => tileMap,
      getResources: () => playerResources, getWarehouseCapacity: () => warehouseCapacity,
      getGold: () => playerGold, spendGold: amount => { playerGold -= amount; updateGoldDisplay(); },
      isCellUnlocked: (r,c) => isCellUnlocked(r,c,landUnlockedChunks,gameMode),
      isObstacleCell: (r,c) => !!kingdomWondersManager?.getWonderAt(r,c),
      isReservedCell: (r,c) => isProtectedTile(r,c,currentGrid[r]?.[c]) || !!kingdomWondersManager?.getWonderAt(r,c) || fences.some(f=>f.row===r&&f.col===c),
      onChanged: () => { updateVillageStatsUI(); updateResourcesUI(); persistGameState(); requestRender(); }
    });
    extractionManager.init(initialSave.extraction);
    updateVillageStatsUI();
    extractionPanel = createExtractionPanel({
      onOpen: () => { movingBuilding=null; setActiveBrush(null); },
      signal, getManager: () => extractionManager, getCurrentGrid: () => currentGrid,
      openProductionModal: (r,c) => productionPanel.open(r,c),
      getResources: () => playerResources, getBuildingLevels: () => buildingLevels,
      getConstructions: () => constructions, getGold: () => playerGold, showToast,
      openUpgradeModal: (r,c) => upgradeManager.openUpgradeModal(r,c)
    });

    defenseManager=createDefenseManager({
      getOtherLabor:()=>worldManager.otherLabor(),getRegionId:()=>worldManager.getState().active,
      addGems:n=>{playerGems+=n;updateGoldDisplay();},onVictory:()=>{if(worldManager.getState().active==='forest')worldManager.recordVictory();},
      getTileMap:()=>tileMap,getExtractionState:()=>extractionManager?.getState(),getFoodSpeed:()=>extractionManager?.foodSummary().workSpeed??1,
      getCurrentGrid:()=>currentGrid,getConstructions:()=>constructions,getBuildingLevels:()=>buildingLevels,
      getPlayerLevel:()=>playerLevel,getResources:()=>playerResources,getGold:()=>playerGold,
      spendGold:amount=>{playerGold-=amount;updateGoldDisplay();},
      addGold:amount=>{playerGold+=amount;updateGoldDisplay();},addXP:amount=>addPlayerXP(amount,'Phòng thủ làng'),
      isCellUnlocked:(r,c)=>isCellUnlocked(r,c,landUnlockedChunks,gameMode),
      isObstacleCell:(r,c)=>!!kingdomWondersManager?.getWonderAt(r,c),notify:showToast,
      onChanged:()=>{updateVillageStatsUI();updateResourcesUI();persistGameState();requestRender();}
    });
    defenseManager.init(initialSave.defense);
    updateVillageStatsUI();
    defensePanel=createDefensePanel({manager:defenseManager,signal,showToast,
      getCurrentGrid:()=>currentGrid,getBuildingLevels:()=>buildingLevels,getConstructions:()=>constructions,
      getFoodSummary:()=>extractionManager.foodSummary(),openFood:()=>extractionPanel.open(),
      onOpen:()=>{movingBuilding=null;setActiveBrush(null);},
      viewBattle:summary=>{
        const view=getDefenseCameraView(summary,getViewportSize());if(!view)return;
        Object.assign(camera,view);updateZoomReadout();requestRender();
      },
      openUpgradeModal:(r,c)=>upgradeManager.openUpgradeModal(r,c)});
    defensePanel.render();

    // Input Handler Module (Mouse clicks, panning, zooming, continuous drag, hotkeys)
    const inputHandler = initInputHandler(container, {
      getMapScenery:()=>mapScenery,eraseMapScenery,
      getOtherLabor:()=>worldManager.otherLabor(),getRegionId:()=>worldManager.getState().active,
      isPremiumTile,placePremium:(id,r,c,flipped)=>{const result=premiumManager.place(id,r,c,flipped);if(!result.ok)showToast(result.error,'warning');return result.ok;},
      getDefenseState:()=>defenseManager?.getState(),
      openDefenseModal:(r,c)=>defensePanel?.open(r,c),
      getExtractionState: () => extractionManager?.getState(),
      openExtractionModal: (r,c) => extractionPanel?.open(r,c),
      getTerrainMap: () => terrainMap,
      getFences: () => fences,
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
      getSelectedObjectCell: () => selectedObjectCell,
      setSelectedObjectCell: (val) => { selectedObjectCell = val; requestRender(); },
      updateFloatingBrushHUD: () => updateFloatingBrushHUD(),
      getActiveSeedBrush: () => (farmToolsManager ? farmToolsManager.getActiveSeedBrush() : null),
      setActiveSeedBrush: (val) => { if (farmToolsManager) farmToolsManager.setActiveSeedBrush(val); },
      getActiveBrush: () => activeBrush,
      setActiveBrush,
      getBrushFlipped: () => brushFlipped,
      rotateActiveBrush,
      getMovingBuilding: () => movingBuilding,
      setMovingBuilding: (val) => {
        if(val?.isFence&&fences.some(f=>f.row===val.fromRow&&f.col===val.fromCol&&f.locked)){
          showToast('Hàng rào mặc định của map không thể di chuyển.','info');return false;
        }
        const message = val && (extractionManager?.busyMessage(val.fromRow,val.fromCol)||defenseManager?.busyMessage(val.fromRow,val.fromCol));
        if(message){showToast(message,'warning');return false;}
        if (val && (getTerrainSprite(val.tileId) || isProtectedTile(val.fromRow, val.fromCol, val.tileId))) {
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
      getUpgradesInProgress: () => upgradesInProgress,
      getTileMap: () => tileMap,
      getBuildingLevels: () => buildingLevels,
      getProductionState: () => productionManager.getState(),
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
      tryHarvestCrop: (r, c) => farmToolsManager && farmToolsManager.tryHarvestCrop(r, c),
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
      removeFenceAt: (r, c) => removeFenceAt(r, c),
      rotateFenceAt: (r, c) => rotateFenceAt(r, c),
      openMarketModal,
      openSeedModal,
      inspectGrowingCrop: (r, c) => farmToolsManager && farmToolsManager.inspectGrowingCrop(r, c),
      openUpgradeModal: (r, c) => getRecipesForBuilding(currentGrid[r]?.[c]).length
        ? productionPanel.open(r, c) : upgradeManager.openUpgradeModal(r, c),
      openAchievementsModal: () => uiModalController.openAchievementsModal(),
      hasClaimableAchievements: () => (uiModalController ? uiModalController.hasClaimableAchievements() : false),
      openConstructionSpeedupModal,
      openLandExpansionModal,
      openStorageModal,
      openLivestockModal,
      closeLivestockModal,
      showStorageFullModal,
      getWarehouseCapacity: () => warehouseCapacity,
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
      getMapScenery:()=>mapScenery,getCustomMapLayout:()=>customMapLayout,
      getOtherLabor:()=>worldManager.otherLabor(),
      getExtractionState: () => extractionManager?.getState(),
      getDefenseState: () => defenseManager?.getState(),
      getTerrainMap: () => terrainMap,
      getFences: () => fences,
      getCanvas: () => canvas,
      getContainer: () => container,
      getContext2D: () => ctx,
      ensureCanvasRef,
      getViewportSize,
      getRenderDpr: () => renderPixelRatio,
      getCamera: () => camera,
      getCurrentGrid: () => currentGrid,
      getConstructions: () => constructions,
      getBuildingLevels: () => buildingLevels,
      getFarmlandState: () => farmlandState,
      getProductionState: () => productionManager.getState(),
      getLandUnlockedChunks: () => landUnlockedChunks,
      getFlippedGrid: () => flippedGrid,
      getUpgradesInProgress: () => upgradesInProgress,
      getGameMode: () => gameMode,
      getPlayerResources: () => playerResources,
      getVillagerManager: () => villagerManager,
      getPetManager: () => petManager,
      getOrderBoardManager: () => worldManager?.getState().active==='forest'?null:orderBoardManager,
      getTownVisitorManager: () => worldManager?.getState().active==='forest'?null:townVisitorManager,
      getHarborShipManager: () => worldManager?.getState().active==='forest'?null:harborShipManager,
      getVehicleManager: () => worldManager?.getState().active==='forest'?null:vehicleManager,
      getKingdomWondersManager: () => kingdomWondersManager,
      getSeasonalThemeManager: () => seasonalThemeManager,
      openFishingModal: () => {
        if (fishingManager) fishingManager.openModal();
      },
      getFruitTreesState: () => fruitTreesState,
      getDayNightWeather: () => dayNightWeather,
      getHoverCell: () => hoverCell,
      getSelectedObjectCell: () => selectedObjectCell,
      getActiveBrush: () => activeBrush,
      getBrushFlipped: () => brushFlipped,
      getActiveSeedBrush: () => (farmToolsManager ? farmToolsManager.getActiveSeedBrush() : null),
      getMovingBuilding: () => movingBuilding,
      getAnimTime: () => animTime,
      getWarehouseCapacity: () => warehouseCapacity,
      getLivestockState: () => livestockState,
      hasClaimableAchievements: () => (uiModalController ? uiModalController.hasClaimableAchievements() : false),
      updateResourcesUI,
      onRequestRender: () => requestRender()
    });

    window.addEventListener('storage', (event) => {
      if(event.key===MAP_APPLY_KEY){
        const document=readMapDocument(localStorage,MAP_APPLY_KEY);
        if(document&&applyImportedState){
          applyImportedState(applyMapDocumentToSave(getFullSaveData(),restartMapGrowth(document)));
          localStorage.removeItem(MAP_APPLY_KEY);centerCamera();requestRender();
          showToast('Đã áp dụng map và quyền gỡ vật phẩm từ xưởng vẽ.','success');
        }
        return;
      }
      if (event.key === WAREHOUSE_TUNING_KEY) { requestRender(); return; }
      if (event.key === TOWN_HALL_TUNING_KEY) { requestRender(); return; }
      if (event.key !== TERRAIN_MAP_KEY) return;
      terrainMap = readTerrainMap(localStorage);
      syncTerrainToGrid(currentGrid, terrainMap);
      persistGameState();
      requestRender();
    }, { signal });

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
    let lastWorkshopFeedCheck = 0;
    let lastRenderAt = 0;

    // Cache thống kê làng: trước đây calculateVillageStats quét 32×32 mỗi frame
    // chỉ để truyền population cho dân làng.
    let cachedVillageStats = null;
    let cachedVillageStatsAt = 0;
    function getCachedVillageStats() {
      const ts = Date.now();
      if (!cachedVillageStats || ts - cachedVillageStatsAt > 500) {
        cachedVillageStats = calculateVillageStats(currentGrid, constructions, tileMap, buildingLevels);
        cachedVillageStatsAt = ts;
      }
      return cachedVillageStats;
    }

    let _renderErrorCount = 0;
    function startAnimationLoop() {
      let lastTime = performance.now();
      function loop(now) {
        // Giới hạn ~72 FPS: màn hình 120/144Hz không cần render 144 lần/giây.
        if (now - lastRenderAt < 13) {
          animLoopId = requestAnimationFrame(loop);
          globalAnimLoopId = animLoopId;
          return;
        }
        lastRenderAt = now;

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

        // Tick sản xuất mỗi frame: chín theo thời gian + tiêu hao nguyên liệu.
        // Lưu ý: KHÔNG truyền `now` của requestAnimationFrame vào đây —
        // lastHarvest được lưu bằng Date.now() (epoch ms), trộn 2 hệ thời gian sẽ làm
        // elapsed luôn âm và xưởng không bao giờ chín/paused.
        if (productionManager) productionManager.update();
        extractionManager?.update(dt);
        extractionPanel?.update(now);
        defenseManager?.update(dt);
        defensePanel?.update(now);
        worldManager?.update(dt);

        // Mỗi giây quét lại các xưởng đang "thiếu nguyên liệu": nếu kho đã có sữa/lông/...
        // (ví dụ vừa vắt sữa, vừa nhận thưởng) thì cho xưởng chạy lại ngay.
        // Trước đây việc này chỉ chạy khi thu hoạch nông sản nên xưởng có thể treo vĩnh viễn.
        if (now - lastWorkshopFeedCheck > 1000) {
          lastWorkshopFeedCheck = now;
          checkAndFeedBakeries();
        }

        villagerManager.update(
          dt,
          currentGrid,
          tileMap,
          (r, c) => isCellUnlocked(r, c, landUnlockedChunks, gameMode),
          getCachedVillageStats()
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
            seasonalThemeManager.update(dt, canvas.width / renderPixelRatio, canvas.height / renderPixelRatio);
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
            const dpr = renderPixelRatio;
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
    if (!loadedSave) {
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
    // Dev-only: căn chỉnh tòa thị chính trực tiếp bằng phím mũi tên.
    // Mở http://localhost:3000/?nudge=1, Shift + mũi tên để nhảy 5px.
    if (new URLSearchParams(window.location.search).has("nudge")) {
      window.__thNudge = window.__thNudge || { dx: 0, dy: 0 };
      window.addEventListener("keydown", (e) => {
        const n = window.__thNudge;
        const step = e.shiftKey ? 5 : 1;
        if (e.key === "ArrowLeft") n.dx -= step;
        else if (e.key === "ArrowRight") n.dx += step;
        else if (e.key === "ArrowUp") n.dy -= step;
        else if (e.key === "ArrowDown") n.dy += step;
        else return;
        e.preventDefault();
        console.log("[townhall-nudge]", JSON.stringify(n));
        showToast(`TH nudge: dx=${n.dx}, dy=${n.dy}`, "info");
        requestRender();
      }, { signal });
    }

    if (isAnimated) startAnimationLoop();

    // Auto-start onboarding tutorial for new players (or resume if not completed)
    const tutorialStartTimer=setTimeout(() => {
      if(townEventsManager?.getActiveEvent())tutorialManager.onTownEvent(townEventsManager.getActiveEvent().id);
      tutorialManager.start();
    }, 700);

    return function cleanup() {
      clearTimeout(tutorialStartTimer);
      adventurePanel?.destroy();
      defensePanel?.destroy();
      productionPanel.destroy();
      upgradeManager.destroy();
      uiModalController.destroy();
      inputHandler.destroy();
      if (farmToolsManager) farmToolsManager.destroy();
      if (townCaretakerManager) townCaretakerManager.destroy();
      if (harborShipManager) harborShipManager.destroy();
      if (dailyWheelManager) dailyWheelManager.destroy();
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
