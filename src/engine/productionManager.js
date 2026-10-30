import { LIVESTOCK_TILE_IDS } from "../data/livestockConfig.js";
import { PRODUCTION_RECIPES, MAX_PRODUCTION_QUEUE, getRecipesForBuilding } from '../data/productionRecipes.js';
import {createFruitTreeState,getFruitTreeVisual,resolveFruitTreeState} from './fruitTreeLifecycle.js';
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
const LIVESTOCK_TILES = new Set(LIVESTOCK_TILE_IDS);

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
      state[key] = createFruitTreeState(when);
      const fruit=ctx.getFruitTreesState?.();
      if(fruit)fruit[key]={...state[key]};
      return;
    }
    if (PRODUCTION_BUILDINGS[tileId] && !LIVESTOCK_TILES.has(tileId)) {
      state[key] = PRODUCTION_BUILDINGS[tileId].manualQueue
        ? { lastHarvest:when,ready:false,queueMode:true,queue:[],completedBatches:[] }
        : { lastHarvest: when, ready: false };
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
          const saved=resolveFruitTreeState(null,fruitStates?.[key]);
          state[key]={...saved,ready:getFruitTreeVisual(tid,saved,when).ready};
        } else {
          markBuilt(key, tid, when);
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
    let stateChanged = false;

    for (const key of Object.keys(state)) {
      const p = state[key];
      if (!p) continue;
      const pos = parseKey(key);
      if (!pos) continue;
      const tid = grid[pos.row] ? grid[pos.row][pos.col] : null;
      const prod = PRODUCTION_BUILDINGS[tid];
      if (!prod || LIVESTOCK_TILES.has(tid)) continue;
      if(FRUIT_TREES_CONFIG[tid]){
        const fruit=ctx.getFruitTreesState?.();
        const merged=resolveFruitTreeState(p,fruit?.[key]);
        const ready=getFruitTreeVisual(tid,merged,when).ready;
        if(p.ready!==ready||p.lastHarvest!==merged.lastHarvest)stateChanged=true;
        Object.assign(p,merged,{ready});
        if(fruit)fruit[key]={...p};
        continue;
      }
      if (tid === 'b02_tudor_inn' && p.queueMode && !p.retiredKitchen) {
        // Nhà trọ không còn bếp: giữ món đã xong, hoàn nguyên liệu dưới dạng
        // các gói chờ nhận để không làm tràn kho hay mất nguyên liệu đã giữ.
        const refunds = {};
        for (const batch of [p.activeBatch, ...(p.queue || [])]) {
          for (const [id, qty] of Object.entries(batch?.inputs || {})) refunds[id] = (refunds[id] || 0) + qty;
        }
        p.completedBatches ||= [];
        for (const [id, qty] of Object.entries(refunds)) p.completedBatches.push({ name:RESOURCES_CONFIG[id].name,icon:RESOURCES_CONFIG[id].icon,resource:id,qty,gold:0,xp:0 });
        p.activeBatch = null;
        p.queue = [];
        p.retiredKitchen = true;
        p.ready = p.completedBatches.length > 0;
        if (!p.ready) { delete p.queueMode; p.lastHarvest = when; }
        stateChanged = true;
      }
      if (prod.manualQueue && !p.queueMode) {
        // Old forges started automatically without inputs. Preserve that one
        // existing batch, then require recipes for every subsequent batch.
        convertToQueue(p, tid, buildingLevels[key] || 1, tid === 'b03_blacksmith_forge');
        stateChanged = true;
      }
      if (p.queueMode) {
        stateChanged = updateQueue(p, when) || stateChanged;
        continue;
      }
      if (p.ready || p.paused) continue;

      const bLvl = buildingLevels[key] || 1;
      const speedMult = bLvl === 3 ? 1.6 : (bLvl === 2 ? 1.3 : 1.0);
      const intervalMs = Math.round((prod.intervalSec * 1000) / speedMult);
      const inputRes = INPUT_RESOURCES[tid];
      if (inputRes && !p.inputPaid) {
        const reqQty = getBuildingInputReq(tid, bLvl);
        if ((resources[inputRes] || 0) < reqQty) {
          p.paused = true;
          p.pauseReason = `missing_${inputRes}`;
          stateChanged = true;
          continue;
        }
        resources[inputRes] -= reqQty;
        resourcesChanged = true;
        p.inputPaid = true;
        p.lastHarvest = when;
      }

      if (when - (p.lastHarvest || 0) < intervalMs) continue;

      p.ready = true;
      stateChanged = true;
      delete p.pauseReason;
    }

    if (resourcesChanged && ctx.updateResourcesUI) ctx.updateResourcesUI();
    if ((resourcesChanged || stateChanged) && ctx.persistGameState) ctx.persistGameState();
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
      if (!p || !p.paused || p.queueMode) continue;
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
      p.inputPaid = true;
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
    if (prod.manualQueue && !p.queueMode) {
      convertToQueue(p, tid, ctx.getBuildingLevels()[key] || 1, tid === 'b03_blacksmith_forge');
    }
    if (p.queueMode) return harvestQueued(row, col, p, silent);

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
    p.inputPaid = false;

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

    if (ctx.spawnFlyingProduce) ctx.spawnFlyingProduce(col,row,icon,rule?.resourceId || prod.yieldResource);
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

  function updateQueue(p, when) {
    p.queue ||= [];
    p.completedBatches ||= [];
    let changed = false;
    while (true) {
      if (!p.activeBatch && p.queue.length) {
        p.activeBatch = p.queue.shift();
        p.activeBatch.startedAt = p.nextBatchAt || when;
        delete p.nextBatchAt;
        changed = true;
      }
      if (!p.activeBatch) break;
      p.lastHarvest = p.activeBatch.startedAt;
      const end = p.activeBatch.startedAt + p.activeBatch.durationMs;
      if (when < end) break;
      p.completedBatches.push(p.activeBatch);
      p.activeBatch = null;
      if (p.queue.length) p.nextBatchAt = end;
      changed = true;
    }
    p.ready = p.completedBatches.length > 0;
    p.paused = false;
    delete p.pauseReason;
    return changed;
  }

  function convertToQueue(p, tid, level, preserveRunning = false) {
    if (p.queueMode) return;
    p.queue = [];
    p.completedBatches = [];
    if (p.ready || p.inputPaid || (preserveRunning && Number.isFinite(p.lastHarvest))) {
      const prod = PRODUCTION_BUILDINGS[tid];
      const oldBatch = {
        name: prod.productName, icon: prod.icon, resource: HARVEST_RULES[tid]?.resourceId,
        qty: getBuildingYield(tid, level), gold: UPGRADES_CONFIG[tid]?.[level]?.revenueGold ?? (prod.rewardGold + (UPGRADES_CONFIG[tid]?.[level]?.goldBonus || 0)),
        xp: prod.rewardXP || 15, startedAt: p.lastHarvest,
        durationMs: Math.round(prod.intervalSec * 1000 / (level === 3 ? 1.6 : level === 2 ? 1.3 : 1))
      };
      if (p.ready) p.completedBatches.push(oldBatch);
      else p.activeBatch = oldBatch;
    }
    p.queueMode = true;
    p.ready = p.completedBatches.length > 0;
    p.paused = false;
    delete p.pauseReason;
    delete p.inputPaid;
  }

  function enqueue(row, col, recipeId) {
    const tid = ctx.getCurrentGrid()[row]?.[col];
    const recipe = PRODUCTION_RECIPES[recipeId];
    if (!recipe || !getRecipesForBuilding(tid).includes(recipe) || ctx.getConstructions?.()[cellKey(row, col)]) return { ok: false, error: 'Công trình chưa sẵn sàng.' };
    if ((ctx.getPlayerLevel?.() ?? 1) < recipe.requiredLevel) return { ok: false, error: `Cần Cấp ${recipe.requiredLevel}.` };
    const key = cellKey(row, col);
    const p = state[key] ||= { lastHarvest: Date.now(), ready: false };
    const size = (p.queue?.length || 0) + (p.completedBatches?.length || 0) + (p.activeBatch ? 1 : 0);
    if (size >= MAX_PRODUCTION_QUEUE) return { ok: false, error: 'Đã đủ 5 mẻ. Hãy thu sản phẩm trước.' };
    const resources = ctx.getPlayerResources();
    if (Object.entries(recipe.inputs).some(([id, qty]) => (resources[id] || 0) < qty)) return { ok: false, error: 'Chưa đủ nguyên liệu cho mẻ này.' };
    // Preserve already-paid automatic batches when switching a legacy save.
    convertToQueue(p, tid, ctx.getBuildingLevels()[key] || 1, tid === 'b03_blacksmith_forge');
    const currentSize = (p.queue?.length || 0) + (p.completedBatches?.length || 0) + (p.activeBatch ? 1 : 0);
    if (currentSize >= MAX_PRODUCTION_QUEUE) return { ok: false, error: 'Đã đủ 5 mẻ.' };
    p.queueMode = true;
    p.queue ||= [];
    const level = ctx.getBuildingLevels()[key] || 1;
    for (const [id, qty] of Object.entries(recipe.inputs)) resources[id] -= qty;
    p.queue.push({ recipeId, name: recipe.name, icon: recipe.icon, inputs: { ...recipe.inputs }, resource: recipe.resource, qty: 1, gold: recipe.gold, xp: recipe.xp,
      durationMs: Math.round(recipe.durationSec * 1000 / (level === 3 ? 1.6 : level === 2 ? 1.3 : 1)) });
    updateQueue(p, Date.now());
    ctx.updateResourcesUI?.();
    ctx.persistGameState?.();
    ctx.requestRender?.();
    return { ok: true };
  }

  function cancelQueued(row, col, index) {
    const p = state[cellKey(row, col)];
    const batch = p?.queue?.[index];
    if (!batch) return false;
    const resources = ctx.getPlayerResources();
    const entries = Object.entries(batch.inputs || {});
    const amount = entries.reduce((sum, [, n]) => sum + n, 0);
    if (getWarehouseUsed(resources) + amount > (ctx.getWarehouseCapacity?.() ?? 300) || entries.some(([id, n]) => (resources[id] || 0) + n > RESOURCE_MAX_CAPACITY)) {
      ctx.showStorageFullModal?.();
      return false;
    }
    p.queue.splice(index, 1);
    for (const [id, qty] of entries) resources[id] = (resources[id] || 0) + qty;
    ctx.updateResourcesUI?.();
    ctx.persistGameState?.();
    return true;
  }

  function harvestQueued(row, col, p, silent) {
    const batch = p.completedBatches?.[0];
    if (!batch) return false;
    const resources = ctx.getPlayerResources();
    if (batch.resource && (getWarehouseUsed(resources) + batch.qty > (ctx.getWarehouseCapacity?.() ?? 300) || (resources[batch.resource] || 0) + batch.qty > RESOURCE_MAX_CAPACITY)) {
      if (!silent) ctx.showStorageFullModal?.();
      return false;
    }
    p.completedBatches.shift();
    p.ready = p.completedBatches.length > 0;
    if (p.retiredKitchen && !p.ready) {
      delete p.queueMode;
      p.inputPaid = false;
      p.lastHarvest = Date.now();
    }
    if (batch.resource) resources[batch.resource] = (resources[batch.resource] || 0) + batch.qty;
    ctx.incrementHarvestCount?.();
    ctx.addPlayerGold?.(Math.round(batch.gold * (ctx.getGoldMultiplier?.() ?? 1)));
    ctx.addPlayerXP?.(Math.round(batch.xp * (ctx.getXpMultiplier?.() ?? 1)), batch.name);
    ctx.updateResourcesUI?.();
    if (!silent) {
      ctx.showToast?.(`Đã thu ${batch.qty} ${batch.icon} ${batch.name}`, 'success');
      ctx.spawnFlyingProduce?.(col,row,batch.icon,batch.resource);
    }
    ctx.checkQuestsProgress?.();
    ctx.persistGameState?.();
    ctx.requestRender?.();
    return true;
  }

  function resumeAutomatic(row, col) {
    const key = cellKey(row, col), p = state[key];
    if (PRODUCTION_BUILDINGS[ctx.getCurrentGrid()[row]?.[col]]?.manualQueue) return false;
    if (!p?.queueMode || p.activeBatch || p.queue.length || p.completedBatches.length) return false;
    state[key] = { lastHarvest: Date.now(), ready: false };
    ctx.persistGameState?.();
    return true;
  }

  return {
    enqueue,
    cancelQueued,
    resumeAutomatic,
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
