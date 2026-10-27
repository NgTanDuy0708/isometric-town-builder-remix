/**
 * farmTools.js - Gieo Hạt & Thu Hoạch Hàng Loạt Nông Trại
 *
 * Chức năng:
 * - 🌱 Gieo Hạt Nhanh (Bulk Seed Sowing): Đặt ngón/chuột lên luống đất trống rồi trượt để gieo hàng loạt
 * - 🌾 Thu hoạch hàng loạt: giữ vào cây chín rồi trượt sang các cây chín khác
 *   (inputHandler điều khiển cử chỉ, gọi tryHarvestCrop cho từng ô)
 * - Thanh trạng thái gieo hạt (Active HUD) và sự kiện Ngày Hội Mùa Vàng (x2 Sản Lượng)
 */

import { CROPS_CONFIG, getCropGrowDurationMs } from "../data/cropsConfig.js";
import { RESOURCE_MAX_CAPACITY, getWarehouseUsed } from "../data/resourcesConfig.js";
import { ROWS, COLS, ORIGIN_X, HALF_W, ORIGIN_Y, QUARTER_W } from "./isoMath.js";
import { isCellUnlocked } from "../data/landConfig.js";
import {
  playPlantSeedSound,
  playSickleSlashSound,
  playHarvestPlopSound
} from "./audioEngine.js";

/**
 * Khởi tạo Farm Tools Manager
 * @param {Object} ctx - Ngữ cảnh engine & các callback
 * @returns {Object}
 */
export function createFarmToolsManager(ctx) {
  let activeSeedBrush = null; // crop.id | null

  const abortController = new AbortController();
  const { signal } = abortController;

  // DOM Elements
  const farmToolActiveHud = document.getElementById("farm-tool-active-hud");
  const farmToolActiveIcon = document.getElementById("farm-tool-active-icon");
  const farmToolActiveTitle = document.getElementById("farm-tool-active-title");
  const farmToolFinishBtn = document.getElementById("farm-tool-finish-btn");

  /**
   * Cất hạt giống, quay về con trỏ tự do
   */
  function deactivateFarmTool() {
    const hudVisible = farmToolActiveHud && !farmToolActiveHud.classList.contains("hidden");
    if (!activeSeedBrush && !hudVisible) return;
    activeSeedBrush = null;
    if (farmToolActiveHud) farmToolActiveHud.classList.add("hidden");
    ctx.showToast("Đã cất hạt giống, quay về con trỏ tự do", "info");
    if (ctx.requestRender) ctx.requestRender();
  }

  /**
   * Kích hoạt cọ gieo hạt hàng loạt
   * @param {Object} crop - Cấu hình hạt giống từ CROPS_CONFIG
   */
  function activateBulkSeedBrush(crop) {
    activeSeedBrush = crop.id;

    if (ctx.setActiveBrush) ctx.setActiveBrush(null);
    if (ctx.clearMovingBuilding) ctx.clearMovingBuilding();

    if (farmToolActiveHud) farmToolActiveHud.classList.remove("hidden");
    if (farmToolActiveIcon) farmToolActiveIcon.textContent = crop.icon;
    if (farmToolActiveTitle) farmToolActiveTitle.textContent = (crop.shortName || crop.name);
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

    const chunks = ctx.getLandUnlockedChunks ? ctx.getLandUnlockedChunks() : null;
    const mode = ctx.getGameMode ? ctx.getGameMode() : "game";
    if (!isCellUnlocked(r, c, chunks, mode)) return;

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
    if (elapsed < getCropGrowDurationMs(farmData)) return false;

    const cropCfg = CROPS_CONFIG[farmData.seedId];
    if (!cropCfg) return false;

    const yieldMult = ctx.getCropYieldMultiplier ? ctx.getCropYieldMultiplier() : 1;
    const yieldCount = (cropCfg.harvestYield || 3) * yieldMult;
    const playerResources = ctx.getPlayerResources();
    const warehouseCap = ctx.getWarehouseCapacity ? ctx.getWarehouseCapacity() : 300;
    const currentWarehouseUsed = getWarehouseUsed(playerResources);

    if (currentWarehouseUsed + yieldCount > warehouseCap) {
      if (!silent) {
        if (ctx.showStorageFullModal) {
          ctx.showStorageFullModal();
        } else if (ctx.showToast) {
          ctx.showToast(`⚠️ Kho Tổng Hợp đã đầy (${currentWarehouseUsed}/${warehouseCap})! Hãy giao đơn hàng hoặc nâng cấp kho.`, "warning");
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
   * Thu hoạch 1 ô luống đất nếu cây đã chín (dùng cho thu hoạch hàng loạt)
   * @param {number} r - Tọa độ hàng
   * @param {number} c - Tọa độ cột
   * @returns {boolean}
   */
  function tryHarvestCrop(r, c) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    const currentGrid = ctx.getCurrentGrid();
    if (!currentGrid[r] || currentGrid[r][c] !== "d13_farmland_plot") return false;
    return harvestFarmlandCrop(r, c, false);
  }

  /**
   * Cây đang lớn: báo thời gian còn lại
   * @param {number} r - Tọa độ hàng
   * @param {number} c - Tọa độ cột
   */
  function inspectGrowingCrop(r, c) {
    const farmData = ctx.getFarmlandState()[`${r}_${c}`];
    if (!farmData) return;
    const crop = CROPS_CONFIG[farmData.seedId];
    const leftSec = Math.max(0, Math.ceil((getCropGrowDurationMs(farmData) - (Date.now() - farmData.plantTime)) / 1000));
    ctx.showToast(`🌱 ${crop ? crop.name : "Cây trồng"} đang lớn, còn khoảng ${leftSec}s`, "info");
  }

  if (farmToolFinishBtn) {
    farmToolFinishBtn.addEventListener("click", deactivateFarmTool, { signal });
  }

  return {
    deactivateFarmTool,
    activateBulkSeedBrush,
    tryApplySeedBrush,
    tryHarvestCrop,
    inspectGrowingCrop,
    harvestCropCell: (r, c, silent = false) => harvestFarmlandCrop(r, c, silent),
    getActiveSeedBrush: () => activeSeedBrush,
    setActiveSeedBrush: (val) => {
      activeSeedBrush = val;
      if (!val && farmToolActiveHud) {
        farmToolActiveHud.classList.add("hidden");
      }
    },
    destroy: () => abortController.abort()
  };
}
