/**
 * farmTools.js - Quản Lý Nông Cụ & Cơ Chế Thu Hoạch Nông Trại
 * 
 * Chức năng:
 * - 🌾 Liềm Thu Hoạch (Sickle): Quét chuột liên tục qua các luống đất chín để gặt hàng loạt
 * - ⛏️ Xẻng Dỡ Bỏ (Shovel): Dỡ bỏ cây trồng đang lớn trên luống đất
 * - 🌱 Gieo Hạt Nhanh (Bulk Seed Sowing): Quét chuột liên tục qua các ô đất cày trống
 * - 📋 Popup Chọn Nông Cụ (Farm Tool Popup) và Thanh Trạng Thái Nông Cụ Đang Dùng (Active HUD)
 * - Tương tác với bong bóng thu hoạch và hỗ trợ sự kiện Ngày Hội Mùa Vàng (x2 Sản Lượng)
 */

import { CROPS_CONFIG } from "../data/cropsConfig.js";
import { RESOURCE_MAX_CAPACITY, getSiloUsed } from "../data/resourcesConfig.js";
import { ROWS, COLS, ORIGIN_X, HALF_W, ORIGIN_Y, QUARTER_W } from "./isoMath.js";
import {
  playTileSelectSound,
  playPlantSeedSound,
  playSickleSlashSound,
  playHarvestPlopSound,
  playDemolishSound,
  playModalOpenSound
} from "./audioEngine.js";

/**
 * Khởi tạo Farm Tools Manager
 * @param {Object} ctx - Ngữ cảnh engine & các callback
 * @returns {Object}
 */
export function createFarmToolsManager(ctx) {
  let activeFarmTool = null; // 'sickle' | 'shovel' | null
  let activeSeedBrush = null; // crop.id | null
  let pendingFarmCell = null; // { row, col } | null

  const abortController = new AbortController();
  const { signal } = abortController;

  // DOM Elements
  const farmToolPopup = document.getElementById("farm-tool-popup");
  const farmToolPopupClose = document.getElementById("farm-tool-popup-close");
  const farmToolSickleChoice = document.getElementById("farm-tool-sickle-choice");
  const farmToolShovelChoice = document.getElementById("farm-tool-shovel-choice");
  const farmToolSeedChoice = document.getElementById("farm-tool-seed-choice");
  const farmToolActiveHud = document.getElementById("farm-tool-active-hud");
  const farmToolActiveIcon = document.getElementById("farm-tool-active-icon");
  const farmToolActiveTitle = document.getElementById("farm-tool-active-title");
  const farmToolActiveDesc = document.getElementById("farm-tool-active-desc");
  const farmToolFinishBtn = document.getElementById("farm-tool-finish-btn");
  const btnOpenFarmTools = document.getElementById("btn-open-farm-tools");

  /**
   * Mở popup chọn nông cụ
   * @param {number|null} cellRow
   * @param {number|null} cellCol
   */
  function openFarmToolPopup(cellRow = null, cellCol = null) {
    pendingFarmCell = (cellRow !== null && cellCol !== null) ? { row: cellRow, col: cellCol } : null;
    if (farmToolPopup) {
      farmToolPopup.classList.remove("hidden");
      playModalOpenSound();
    }
  }

  /**
   * Đóng popup chọn nông cụ
   */
  function closeFarmToolPopup() {
    if (farmToolPopup) {
      farmToolPopup.classList.add("hidden");
    }
  }

  /**
   * Kích hoạt nông cụ ('sickle' hoặc 'shovel')
   * @param {"sickle"|"shovel"} toolType
   */
  function activateFarmTool(toolType) {
    activeFarmTool = toolType;
    activeSeedBrush = null;
    closeFarmToolPopup();

    if (ctx.setActiveBrush) ctx.setActiveBrush(null);
    if (ctx.clearMovingBuilding) ctx.clearMovingBuilding();

    if (farmToolActiveHud) farmToolActiveHud.classList.remove("hidden");

    if (toolType === "sickle") {
      if (farmToolActiveIcon) farmToolActiveIcon.textContent = "🌾";
      if (farmToolActiveTitle) farmToolActiveTitle.textContent = "Đang dùng: Liềm Thu Hoạch";
      if (farmToolActiveDesc) farmToolActiveDesc.textContent = "Di chuột quét qua các luống đất chín để gặt hàng loạt tức thì!";
      playTileSelectSound();
      ctx.showToast("🌾 Đã trang bị Liềm: Di chuột quét qua các luống đất chín để gặt tức thì!", "info");
    } else if (toolType === "shovel") {
      if (farmToolActiveIcon) farmToolActiveIcon.textContent = "⛏️";
      if (farmToolActiveTitle) farmToolActiveTitle.textContent = "Đang dùng: Xẻng Dỡ Bỏ";
      if (farmToolActiveDesc) farmToolActiveDesc.textContent = "Nhấp hoặc kéo chuột qua luống đất để dỡ bỏ cây trồng!";
      playTileSelectSound();
      ctx.showToast("⛏️ Đã trang bị Xẻng: Kéo chuột qua luống đất để dỡ bỏ cây trồng!", "info");
    }

    if (pendingFarmCell) {
      tryApplyFarmTool(pendingFarmCell.row, pendingFarmCell.col);
      pendingFarmCell = null;
    }
  }

  /**
   * Tắt chế độ nông cụ hoặc gieo hạt, cất công cụ
   */
  function deactivateFarmTool() {
    const hudVisible = farmToolActiveHud && !farmToolActiveHud.classList.contains("hidden");
    if (!activeFarmTool && !activeSeedBrush && !hudVisible) return;
    activeFarmTool = null;
    activeSeedBrush = null;
    if (farmToolActiveHud) farmToolActiveHud.classList.add("hidden");
    ctx.showToast("Đã cất nông cụ, quay về con trỏ tự do", "info");
    if (ctx.requestRender) ctx.requestRender();
  }

  /**
   * Kích hoạt cọ gieo hạt hàng loạt
   * @param {Object} crop - Cấu hình hạt giống từ CROPS_CONFIG
   */
  function activateBulkSeedBrush(crop) {
    activeSeedBrush = crop.id;
    activeFarmTool = null;

    if (ctx.setActiveBrush) ctx.setActiveBrush(null);
    if (ctx.clearMovingBuilding) ctx.clearMovingBuilding();

    if (farmToolActiveHud) farmToolActiveHud.classList.remove("hidden");
    if (farmToolActiveIcon) farmToolActiveIcon.textContent = crop.icon;
    if (farmToolActiveTitle) farmToolActiveTitle.textContent = `Đang gieo: ${crop.name} (${crop.seedCost}🪙/ô)`;
    if (farmToolActiveDesc) farmToolActiveDesc.textContent = "Di hoặc quét chuột qua các luống đất trống để gieo hàng loạt!";
    ctx.showToast(`🌱 Đang gieo ${crop.name}: Quét chuột qua các ô đất trống để gieo hàng loạt!`, "success");
  }

  /**
   * Thực hiện gieo hạt giống khi di chuột qua ô đất
   * @param {number} r - Tọa độ hàng
   * @param {number} c - Tọa độ cột
   */
  function tryApplySeedBrush(r, c) {
    if (!activeSeedBrush) return;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

    const currentGrid = ctx.getCurrentGrid();
    if (currentGrid[r][c] !== "d13_farmland_plot") return;

    const farmlandState = ctx.getFarmlandState();
    const pKey = `${r}_${c}`;
    if (farmlandState[pKey]) return; // Đã có cây trồng

    const crop = CROPS_CONFIG[activeSeedBrush];
    if (!crop) return;

    if (ctx.getPlayerGold() < crop.seedCost) {
      ctx.showToast("⚠️ Không đủ vàng để gieo thêm hạt giống!", "warning");
      deactivateFarmTool();
      return;
    }

    ctx.deductGold(crop.seedCost);
    playPlantSeedSound();
    ctx.addPlayerXP(1, `Gieo ${crop.name}`);
    ctx.updateGoldDisplay();

    farmlandState[pKey] = {
      seedId: crop.id,
      plantTime: Date.now(),
      growDurationMs: crop.growTimeSec * 1000
    };

    const ox = ORIGIN_X + (c - r) * HALF_W;
    const oy = ORIGIN_Y + (r + c) * QUARTER_W;
    ctx.addFloatingText({
      x: ox + 64,
      y: oy + 26,
      text: `🌱 -${crop.seedCost}🪙`,
      startTime: performance.now(),
      duration: 900
    });

    ctx.persistGameState();
    if (ctx.onTutorialAction) ctx.onTutorialAction("plant_seed", { seedId: crop.id });
    if (ctx.requestRender) ctx.requestRender();
  }

  /**
   * Thu hoạch 1 ô cây trồng nông trại nếu đã chín và kho Silo còn chỗ
   * @param {number} r - Tọa độ hàng
   * @param {number} c - Tọa độ cột
   * @param {boolean} [silent=false] - Không phát âm thanh hoặc popup nếu là do Quản Gia thu hoạch
   * @returns {boolean} - true nếu thu hoạch thành công
   */
  function harvestFarmlandCrop(r, c, silent = false) {
    const farmlandState = ctx.getFarmlandState();
    const pKey = `${r}_${c}`;
    const farmData = farmlandState[pKey];
    if (!farmData) return false;
    const elapsed = Date.now() - farmData.plantTime;
    if (elapsed < farmData.growDurationMs) return false;

    const cropCfg = CROPS_CONFIG[farmData.seedId];
    if (!cropCfg) return false;

    const yieldMult = ctx.getCropYieldMultiplier ? ctx.getCropYieldMultiplier() : 1;
    const yieldCount = (cropCfg.harvestYield || 3) * yieldMult;
    const playerResources = ctx.getPlayerResources();
    const siloCap = ctx.getSiloCapacity ? ctx.getSiloCapacity() : 100;
    const currentSiloUsed = getSiloUsed(playerResources);

    if (currentSiloUsed + yieldCount > siloCap) {
      if (!silent) {
        if (ctx.showStorageFullModal) {
          ctx.showStorageFullModal("silo");
        } else if (ctx.showToast) {
          ctx.showToast(`⚠️ Kho Nông Sản (Silo) đã đầy (${currentSiloUsed}/${siloCap})! Hãy giao đơn hàng hoặc nâng cấp kho.`, "warning");
        }
      }
      return false;
    }

    if (!silent) {
      playSickleSlashSound();
      playHarvestPlopSound();
      ctx.spawnSlashEffect(c, r);
    }

    const xpMult = ctx.getXpMultiplier ? ctx.getXpMultiplier() : 1.0;
    playerResources[farmData.seedId] = Math.min(RESOURCE_MAX_CAPACITY, (playerResources[farmData.seedId] || 0) + yieldCount);
    delete farmlandState[pKey];
    ctx.incrementHarvestCount();

    const xpGained = Math.round((cropCfg.harvestXP || 10) * xpMult);
    ctx.addPlayerXP(xpGained, cropCfg.name);

    if (!silent) {
      const ox = ORIGIN_X + (c - r) * HALF_W;
      const oy = ORIGIN_Y + (r + c) * QUARTER_W;
      ctx.addFloatingText({
        x: ox + 64,
        y: oy + 26,
        text: `+${yieldCount} ${cropCfg.icon} (+${xpGained}XP)`,
        startTime: performance.now(),
        duration: 1200
      });
      ctx.spawnFlyingCoin(c, r, 3);
      ctx.spawnFlyingXP(c, r, xpGained);
      ctx.spawnFlyingProduce(c, r, cropCfg.icon);
    }

    if (ctx.checkAndFeedBakeries) ctx.checkAndFeedBakeries();
    ctx.updateResourcesUI();
    ctx.saveGameEconomyState();
    ctx.persistGameState();
    ctx.checkQuestsProgress(true);
    if (ctx.onTutorialAction) ctx.onTutorialAction("harvest_crop", { seedId: farmData.seedId });
    if (ctx.requestRender) ctx.requestRender();
    return true;
  }

  /**
   * Áp dụng nông cụ (Liềm hoặc Xẻng) lên ô đất
   * @param {number} r - Tọa độ hàng
   * @param {number} c - Tọa độ cột
   */
  function tryApplyFarmTool(r, c) {
    if (!activeFarmTool) return;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

    const currentGrid = ctx.getCurrentGrid();
    const tid = currentGrid[r][c];
    if (tid !== "d13_farmland_plot") return;

    const farmlandState = ctx.getFarmlandState();
    const pKey = `${r}_${c}`;

    if (activeFarmTool === "sickle") {
      harvestFarmlandCrop(r, c, false);
    } else if (activeFarmTool === "shovel") {
      if (farmlandState[pKey]) {
        delete farmlandState[pKey];
        playDemolishSound();
        const ox = ORIGIN_X + (c - r) * HALF_W;
        const oy = ORIGIN_Y + (r + c) * QUARTER_W;
        ctx.addFloatingText({
          x: ox + 64,
          y: oy + 26,
          text: `Đã dọn ⛏️`,
          startTime: performance.now(),
          duration: 1200
        });
        ctx.persistGameState();
        if (ctx.requestRender) ctx.requestRender();
      }
    }
  }

  // Gắn các sự kiện click cho các nút giao diện nông cụ
  if (btnOpenFarmTools) {
    btnOpenFarmTools.addEventListener("click", () => openFarmToolPopup(), { signal });
  }
  if (farmToolPopupClose) {
    farmToolPopupClose.addEventListener("click", closeFarmToolPopup, { signal });
  }
  if (farmToolFinishBtn) {
    farmToolFinishBtn.addEventListener("click", deactivateFarmTool, { signal });
  }
  if (farmToolSickleChoice) {
    farmToolSickleChoice.addEventListener("click", () => activateFarmTool("sickle"), { signal });
  }
  if (farmToolShovelChoice) {
    farmToolShovelChoice.addEventListener("click", () => activateFarmTool("shovel"), { signal });
  }
  if (farmToolSeedChoice) {
    farmToolSeedChoice.addEventListener("click", () => {
      const cell = pendingFarmCell;
      closeFarmToolPopup();
      if (ctx.openSeedModal) {
        ctx.openSeedModal(cell ? cell.row : 0, cell ? cell.col : 0);
      }
    }, { signal });
  }

  return {
    openFarmToolPopup,
    closeFarmToolPopup,
    activateFarmTool,
    deactivateFarmTool,
    activateBulkSeedBrush,
    tryApplySeedBrush,
    tryApplyFarmTool,
    harvestCropCell: (r, c, silent = false) => harvestFarmlandCrop(r, c, silent),
    getActiveFarmTool: () => activeFarmTool,
    setActiveFarmTool: (val) => {
      activeFarmTool = val;
      if (!val && !activeSeedBrush && farmToolActiveHud) {
        farmToolActiveHud.classList.add("hidden");
      }
    },
    getActiveSeedBrush: () => activeSeedBrush,
    setActiveSeedBrush: (val) => {
      activeSeedBrush = val;
      if (!val && !activeFarmTool && farmToolActiveHud) {
        farmToolActiveHud.classList.add("hidden");
      }
    },
    destroy: () => abortController.abort()
  };
}
