/**
 * productionManager.js
 * ------------------------------------------------------------------
 * Sở hữu toàn bộ state sản xuất của vương quốc:
 *  - productionState: { "row_col": { lastHarvest, ready, paused?, pauseReason? } }
 *  - Tiến trình chín của từng công trình (theo intervalSec / cấp nâng cấp)
 *  - Tự tiêu hao nguyên liệu đầu vào (lúa mì, sữa, lông, nho...)
 *  - Tự gỡ trạng thái "thiếu nguyên liệu" khi kho đã có hàng
 *  - Thu hoạch công trình sản xuất (kể cả vàng theo cấp nâng cấp)
 *
 * Trước đây phần state machine này nằm rải rác trong canvasRenderer (mỗi frame)
 * và studioEngine. Renderer giờ chỉ ĐỌC state để vẽ bong bóng, không mutate nữa.
 */

import {
  PRODUCTION_BUILDINGS,
  getBuildingYield,
  getBuildingInputReq
} from "../data/gameEconomy.js";
import { UPGRADES_CONFIG } from "../data/upgradesConfig.js";
import {
  FRUIT_TREES_CONFIG,
  RESOURCE_MAX_CAPACITY,
  RESOURCES_CONFIG,
  getWarehouseUsed
} from "../data/resourcesConfig.js";
import { ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W } from "./isoMath.js";

// Chuồng trại do LivestockManager quản lý, không đi qua productionState.
const LIVESTOCK_TILES = new Set(["b21_chicken_coop", "b22_cow_pasture", "b57_sheep_pasture"]);

// Nguyên liệu tiêu hao khi bắt đầu một mẻ sản xuất.
const INPUT_RESOURCES = {
  b21_chicken_coop: "wheat",
  b22_cow_pasture: "corn",
  b57_sheep_pasture: "carrot",
  b06_bakery: "wheat",
  b58_textile_mill: "wool",
  b59_dairy_factory: "milk",
  b47_winery_press_barn_sw: "grapes",
  b48_winery_press_barn_se: "grapes"
};

// Cấu hình thu hoạch: resource sinh ra + hiệu ứng bay.
const HARVEST_RULES = {
  b04_windmill: { resourceId: "wheat", icon: "🌾", coinFx: 3, xpFx: 4 },
  b06_bakery: { resourceId: "bread", icon: "🍞", coinFx: 4, xpFx: 6 },
  b03_blacksmith_forge: { resourceId: "ironTools", icon: "⚒️", coinFx: 4, xpFx: 10 },
  b58_textile_mill: { resourceId: "fabric", icon: "🧵", coinFx: 5, xpFx: 12, sound: "loom" },
  b59_dairy_factory: { resourceId: "butter", icon: "🧈", coinFx: 4, xpFx: 10 },
  b47_winery_press_barn_sw: { resourceId: "wine", icon: "🍷", coinFx: 6, xpFx: 16 },
  b48_winery_press_barn_se: { resourceId: "wine", icon: "🍷", coinFx: 6, xpFx: 16 }
};

// Nhãn floating text khi tự động nạp nguyên liệu (giữ đúng như hành vi cũ).
const FEED_LABELS = {
  b06_bakery: "Nướng bánh!",
  b59_dairy_factory: "Làm bơ sữa!"
};

export function createProductionManager(ctx) {
  let state = {};
  let lastScanAt = 0;

  const getNow = () => Date.now();
  const cellKey = (row, col) => `${row}_${col}`;
  const parseKey = (key) => {
    const parts = String(key).split("_");
    if (parts.length !== 2) return null;
    const row = parseInt(parts[0], 10);
    const col = parseInt(parts[1], 10);
    if (!Number.isFinite(row) || !Number.isFinite(col)) return null;
    return { row, col };
  };

  function init(savedState) {
    state = savedState && typeof savedState === "object" ? savedState : {};
  }

  function getState() {
    return state;
  }

  function setState(next) {
    state = next && typeof next === "object" ? next : {};
  }

  function reset() {
    state = {};
  }

  function clearCell(key) {
    delete state[key];
  }

  function setEntry(key, entry) {
    state[key] = entry;
  }

  /**
   * Đánh dấu công trình vừa xây xong / vừa hoàn thành nâng cấp.
   */
  function markBuilt(key, tileId, when = getNow()) {
    if (FRUIT_TREES_CONFIG[tileId]) {
      state[key] = { lastHarvest: 0, ready: true };
      return;
    }
    if (PRODUCTION_BUILDINGS[tileId]) {
      state[key] = { lastHarvest: when, ready: false };
    }
  }

  /**
   * Bổ sung entry còn thiếu cho các công trình sản xuất đang có trên bản đồ
   * (save cũ thiếu state, hoặc cây ăn quả vừa được đặt trực tiếp lên bản đồ).
   */
  function scanGrid(when = getNow()) {
    const grid = ctx.getCurrentGrid();
    if (!grid) return;
    const fruitStates = ctx.getFruitTreesState ? ctx.getFruitTreesState() : null;
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      for (let c = 0; c < grid[r].length; c++) {
        const tid = grid[r][c];
        if (!PRODUCTION_BUILDINGS[tid] || LIVESTOCK_TILES.has(tid)) continue;
        const key = cellKey(r, c);
        if (state[key]) continue;
        if (FRUIT_TREES_CONFIG[tid]) {
          const lastHarvest = fruitStates && fruitStates[key] ? (fruitStates[key].lastHarvest || 0) : 0;
          const elapsedSec = (when - lastHarvest) / 1000;
          state[key] = {
            lastHarvest,
            ready: elapsedSec >= (FRUIT_TREES_CONFIG[tid].intervalSec || 45)
          };
        } else {
          state[key] = { lastHarvest: when, ready: false };
        }
      }
    }
  }

  /**
   * Tick mỗi frame: chín theo thời gian, tiêu nguyên liệu, đặt paused nếu thiếu.
   */
  function update(when = getNow()) {
    // Quét bản đồ tối đa 2 lần/giây thay vì mỗi frame (32×32 = 1024 ô/lần).
    if (lastScanAt === 0 || when - lastScanAt > 500) {
      scanGrid(when);
      lastScanAt = when;
    }
    const grid = ctx.getCurrentGrid();
    const buildingLevels = ctx.getBuildingLevels() || {};
    const resources = ctx.getPlayerResources() || {};
    let resourcesChanged = false;

    for (const key of Object.keys(state)) {
      const p = state[key];
      if (!p) continue;
      const pos = parseKey(key);
      if (!pos) continue;
      const tid = grid[pos.row] ? grid[pos.row][pos.col] : null;
      const prod = PRODUCTION_BUILDINGS[tid];
      if (!prod || LIVESTOCK_TILES.has(tid)) continue;
      if (p.ready || p.paused) continue;

      const bLvl = buildingLevels[key] || 1;
      const speedMult = bLvl === 3 ? 1.6 : (bLvl === 2 ? 1.3 : 1.0);
      const intervalMs = Math.round((prod.intervalSec * 1000) / speedMult);
      if (when - (p.lastHarvest || 0) < intervalMs) continue;

      const inputRes = INPUT_RESOURCES[tid];
      if (inputRes) {
        const reqQty = getBuildingInputReq(tid, bLvl);
        if ((resources[inputRes] || 0) < reqQty) {
          p.paused = true;
          p.pauseReason = `missing_${inputRes}`;
          continue;
        }
        resources[inputRes] -= reqQty;
        resourcesChanged = true;
      }

      p.ready = true;
      delete p.pauseReason;
    }

    if (resourcesChanged && ctx.updateResourcesUI) ctx.updateResourcesUI();
  }

  /**
   * Tự gỡ paused cho các xưởng khi kho đã có nguyên liệu trở lại.
   * (Trước đây chỉ chạy khi thu hoạch nông sản nên xưởng có thể treo vĩnh viễn.)
   */
  function feedPausedWorkshops(when = getNow()) {
    const grid = ctx.getCurrentGrid();
    const buildingLevels = ctx.getBuildingLevels() || {};
    const resources = ctx.getPlayerResources() || {};
    let fedCount = 0;

    for (const key of Object.keys(state)) {
      const p = state[key];
      if (!p || !p.paused) continue;
      const pos = parseKey(key);
      if (!pos) continue;
      const tid = grid[pos.row] ? grid[pos.row][pos.col] : null;
      if (!PRODUCTION_BUILDINGS[tid] || FRUIT_TREES_CONFIG[tid]) continue;

      const inputRes = INPUT_RESOURCES[tid];
      if (!inputRes) {
        // Không cần nguyên liệu thì không có lý do gì để paused.
        p.paused = false;
        delete p.pauseReason;
        continue;
      }

      const bLvl = buildingLevels[key] || 1;
      const reqQty = getBuildingInputReq(tid, bLvl);
      if ((resources[inputRes] || 0) < reqQty) continue;

      resources[inputRes] -= reqQty;
      p.paused = false;
      delete p.pauseReason;
      p.lastHarvest = when;
      p.ready = false;
      fedCount++;

      if (ctx.addFloatingText && FEED_LABELS[tid]) {
        const ox = ORIGIN_X + (pos.col - pos.row) * HALF_W;
        const oy = ORIGIN_Y + (pos.row + pos.col) * QUARTER_W;
        const icon = RESOURCES_CONFIG[inputRes] ? RESOURCES_CONFIG[inputRes].icon : "📦";
        ctx.addFloatingText({
          x: ox + 64,
          y: oy + 8,
          text: `-${reqQty} ${icon} ${FEED_LABELS[tid]}`,
          startTime: performance.now(),
          duration: 1300
        });
      }
    }

    if (fedCount > 0) {
      if (ctx.updateResourcesUI) ctx.updateResourcesUI();
      if (ctx.persistGameState) ctx.persistGameState();
    }
    return fedCount;
  }

  /**
   * Thu hoạch công trình sản xuất. Trả về true nếu thành công.
   */
  function harvest(row, col, silent = false) {
    const grid = ctx.getCurrentGrid();
    const tid = grid[row] ? grid[row][col] : null;
    if (!tid) return false;

    if (LIVESTOCK_TILES.has(tid)) {
      return ctx.harvestLivestockCell ? ctx.harvestLivestockCell(row, col, silent) : false;
    }
    if (FRUIT_TREES_CONFIG[tid]) {
      return ctx.harvestFruitTreeCell ? ctx.harvestFruitTreeCell(row, col, silent) : false;
    }

    const prod = PRODUCTION_BUILDINGS[tid];
    const key = cellKey(row, col);
    const p = state[key];
    if (!prod || !p || !p.ready) return false;

    const buildingLevels = ctx.getBuildingLevels() || {};
    const bLvl = buildingLevels[key] || 1;
    const yieldQty = getBuildingYield(tid, bLvl);
    const rule = HARVEST_RULES[tid] || null;
    const resources = ctx.getPlayerResources() || {};

    // Chỉ công trình thực sự sinh tài nguyên mới bị chặn bởi sức chứa kho.
    // Quán trọ Tudor (b02) và Cối xay nước (b05) chỉ sinh vàng nên vẫn thu được khi kho đầy.
    if (rule) {
      const capacity = ctx.getWarehouseCapacity ? ctx.getWarehouseCapacity() : 300;
      if (getWarehouseUsed(resources) + yieldQty > capacity) {
        if (!silent && ctx.showStorageFullModal) ctx.showStorageFullModal();
        return false;
      }
    }

    p.ready = false;
    p.lastHarvest = Date.now();

    if (ctx.incrementHarvestCount) ctx.incrementHarvestCount();

    if (rule && rule.resourceId) {
      resources[rule.resourceId] = Math.min(
        RESOURCE_MAX_CAPACITY,
        (resources[rule.resourceId] || 0) + yieldQty
      );
      if (ctx.updateResourcesUI) ctx.updateResourcesUI();
    }

    const goldMult = ctx.getGoldMultiplier ? ctx.getGoldMultiplier() : 1.0;
    const upgradeCfg = UPGRADES_CONFIG[tid] ? UPGRADES_CONFIG[tid][bLvl] : null;
    const baseGold = (upgradeCfg && typeof upgradeCfg.revenueGold === "number")
      ? upgradeCfg.revenueGold
      : (prod.rewardGold || 25) + (upgradeCfg && typeof upgradeCfg.goldBonus === "number" ? upgradeCfg.goldBonus : 0);
    const rewardGoldGain = Math.round(baseGold * goldMult);

    if (ctx.addPlayerGold) ctx.addPlayerGold(rewardGoldGain);
    if (!silent && ctx.playCoinSound) ctx.playCoinSound();

    const xpMult = ctx.getXpMultiplier ? ctx.getXpMultiplier() : 1.0;
    if (ctx.addPlayerXP) ctx.addPlayerXP(Math.round((prod.rewardXP || 15) * xpMult), prod.name);

    const icon = rule ? rule.icon : (prod.icon || "📦");
    const rewardMsg = `+${yieldQty} ${icon} +${rewardGoldGain} 🪙`;

    if (ctx.spawnFlyingProduce) ctx.spawnFlyingProduce(col, row, icon);
    if (ctx.spawnFlyingCoin) ctx.spawnFlyingCoin(col, row, rule ? rule.coinFx : 3);
    if (ctx.spawnFlyingXP) ctx.spawnFlyingXP(col, row, rule ? rule.xpFx : 4);
    if (rule && rule.sound === "loom" && !silent && ctx.playLoomWeaveSound) ctx.playLoomWeaveSound();

    if (!silent) {
      if (ctx.addFloatingText) {
        const ox = ORIGIN_X + (col - row) * HALF_W;
        const oy = ORIGIN_Y + (row + col) * QUARTER_W;
        ctx.addFloatingText({
          x: ox + 64,
          y: oy + 20,
          text: rewardMsg,
          startTime: performance.now(),
          duration: 1500
        });
      }
      if (ctx.showToast) ctx.showToast(`🎉 Thu hoạch thành công! ${rewardMsg}`, "success");
    }

    // Thu hoạch lúa mì từ cối xay có thể mở khoá ngay các lò bánh đang thiếu nguyên liệu.
    if (rule && rule.resourceId === "wheat") feedPausedWorkshops();

    if (ctx.checkQuestsProgress) ctx.checkQuestsProgress();
    if (ctx.persistGameState) ctx.persistGameState();
    if (ctx.requestRender) ctx.requestRender();
    return true;
  }

  return {
    init,
    getState,
    setState,
    reset,
    clearCell,
    setEntry,
    markBuilt,
    scanGrid,
    update,
    feedPausedWorkshops,
    harvest
  };
}
