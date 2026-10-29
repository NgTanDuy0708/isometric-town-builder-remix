// Building Upgrade and Inspection Modal Controller
import {
  MAX_BUILDING_LEVEL, UPGRADES_CONFIG, getNextUpgrade, getBuildingLevelPopulation
} from "../data/upgradesConfig.js";
import { getTileCost, getTilePopulation } from "../data/gameEconomy.js";
import { RESOURCES_CONFIG } from "../data/resourcesConfig.js";
import { TILE_DATA_URIS } from "../data/sprites.js";
import { getBuildingSpriteUri } from "../data/buildingSprites.js";
import { AESTHETIC_TILE_URIS } from "../data/aestheticTileIcons.js";
import { FENCE_ROTATIONS } from "../data/fenceConfig.js";
import { playModalOpenSound, playModalCloseSound } from "./audioEngine.js";

/**
 * Tính toán số vàng hoàn lại khi phá dỡ công trình:
 * Quy ước: Hoàn lại 50% vàng gốc + 70% vàng đã nâng cấp qua các cấp
 *
 * @param {string} tileId - ID của tile
 * @param {string} category - Danh mục tile ("building", "road", v.v.)
 * @param {number} curLevel - Cấp hiện tại của công trình (1..3)
 * @param {string} gameMode - Chế độ game ("game" hoặc "creative")
 * @returns {{ baseCost: number, baseRefund: number, upgradeRefund: number, totalRefund: number, detailMsg: string }}
 */
export function calculateDemolishRefund(tileId, category = "building", curLevel = 1, gameMode = "game") {
  if (gameMode !== "game") {
    return { baseCost: 0, baseRefund: 0, upgradeRefund: 0, totalRefund: 0, detailMsg: "0🪙" };
  }

  const baseCost = getTileCost(tileId, category);
  let totalUpgradeGold = 0;
  if (curLevel > 1 && UPGRADES_CONFIG[tileId]) {
    for (let lvl = 2; lvl <= curLevel; lvl++) {
      const upg = UPGRADES_CONFIG[tileId][lvl];
      if (upg && typeof upg.costGold === "number") {
        totalUpgradeGold += upg.costGold;
      }
    }
  }

  const baseRefund = Math.round(baseCost * 0.5);
  const upgradeRefund = Math.round(totalUpgradeGold * 0.7);
  const totalRefund = baseRefund + upgradeRefund;
  const detailMsg = upgradeRefund > 0
    ? `(+${totalRefund} 🪙: Gốc ${baseRefund}🪙 [50%] + Nâng cấp ${upgradeRefund}🪙 [70%])`
    : `(+${totalRefund} 🪙 [50% gốc])`;

  return { baseCost, baseRefund, upgradeRefund, totalRefund, detailMsg };
}

export const TILE_ROTATION_MAP = {
  ...FENCE_ROTATIONS,
  // Straight roads (NS <-> EW)
  "r01_road_straight_ns": "r02_road_straight_ew",
  "r02_road_straight_ew": "r01_road_straight_ns",

  // Road corners (clockwise 90 deg)
  "r08_road_corner_ne": "r09_road_corner_es",
  "r09_road_corner_es": "r10_road_corner_sw",
  "r10_road_corner_sw": "r11_road_corner_wn",
  "r11_road_corner_wn": "r08_road_corner_ne",

  // Road T-junctions (clockwise 90 deg)
  "r04_road_tee_nes": "r07_road_tee_ews",
  "r07_road_tee_ews": "r05_road_tee_nsw",
  "r05_road_tee_nsw": "r06_road_tee_ewn",
  "r06_road_tee_ewn": "r04_road_tee_nes",

  // River bends (clockwise 90 deg)
  "c01_river_bend_ne": "c03_river_bend_se",
  "c03_river_bend_se": "c04_river_bend_sw",
  "c04_river_bend_sw": "c02_river_bend_nw",
  "c02_river_bend_nw": "c01_river_bend_ne",

  // River T-junctions
  "c05_river_tjct_nse": "c06_river_tjct_ews",
  "c06_river_tjct_ews": "c05_river_tjct_nse",

  // Timber footbridges
  "c09_timber_footbridge_ns": "c10_timber_footbridge_ew",
  "c10_timber_footbridge_ew": "c09_timber_footbridge_ns",

  // Waterfalls
  "c11_waterfall_gorge_n": "c12_waterfall_gorge_w",
  "c12_waterfall_gorge_w": "c11_waterfall_gorge_n",

  // Road curves
  "c15_road_curve_se": "c16_road_curve_nw",
  "c16_road_curve_nw": "c15_road_curve_se",

  // Slopes / ramps (clockwise 90 deg)
  "s01_slope_ramp_n": "s03_slope_ramp_e",
  "s03_slope_ramp_e": "s04_slope_ramp_s",
  "s04_slope_ramp_s": "s02_slope_ramp_w",
  "s02_slope_ramp_w": "s01_slope_ramp_n",

  // Slope stairs
  "s05_slope_stairs_n": "s06_slope_stairs_w",
  "s06_slope_stairs_w": "s05_slope_stairs_n",

  // Pairwise directional buildings (SW <-> SE)
  "b21_japanese_pagoda_sw": "b22_japanese_pagoda_se",
  "b22_japanese_pagoda_se": "b21_japanese_pagoda_sw",

  "b23_mediterranean_villa_sw": "b24_mediterranean_villa_se",
  "b24_mediterranean_villa_se": "b23_mediterranean_villa_sw",

  "b25_bayou_boathouse_sw": "b26_bayou_boathouse_se",
  "b26_bayou_boathouse_se": "b25_bayou_boathouse_sw",

  "b27_artisan_forge_sw": "b28_artisan_forge_se",
  "b28_artisan_forge_se": "b27_artisan_forge_sw",

  "b29_botanical_conservatory_sw": "b30_botanical_conservatory_se",
  "b30_botanical_conservatory_se": "b29_botanical_conservatory_sw",

  "b31_highland_keep_sw": "b32_highland_keep_se",
  "b32_highland_keep_se": "b31_highland_keep_sw",

  "b33_lumber_sawmill_sw": "b34_lumber_sawmill_se",
  "b34_lumber_sawmill_se": "b33_lumber_sawmill_sw",

  "b35_apothecary_tower_sw": "b36_apothecary_tower_se",
  "b36_apothecary_tower_se": "b35_apothecary_tower_sw",

  "b37_shipyard_drydock_sw": "b38_shipyard_drydock_se",
  "b38_shipyard_drydock_se": "b37_shipyard_drydock_sw",

  "b39_desert_caravanserai_sw": "b40_desert_caravanserai_se",
  "b40_desert_caravanserai_se": "b39_desert_caravanserai_sw",

  "b41_pottery_kiln_sw": "b42_pottery_kiln_se",
  "b42_pottery_kiln_se": "b41_pottery_kiln_sw",

  "b43_nomad_yurt_sw": "b44_nomad_yurt_se",
  "b44_nomad_yurt_se": "b43_nomad_yurt_sw",

  "b45_clocktower_guildhall_sw": "b46_clocktower_guildhall_se",
  "b46_clocktower_guildhall_se": "b45_clocktower_guildhall_sw",

  "b47_winery_press_barn_sw": "b48_winery_press_barn_se",
  "b48_winery_press_barn_se": "b47_winery_press_barn_sw",

  "b49_amphitheater_stage_sw": "b50_amphitheater_stage_se",
  "b50_amphitheater_stage_se": "b49_amphitheater_stage_sw",

  "b51_waterworks_pump_house_sw": "b52_waterworks_pump_house_se",
  "b52_waterworks_pump_house_se": "b51_waterworks_pump_house_sw",

  "b53_glassblower_studio_sw": "b54_glassblower_studio_se",
  "b54_glassblower_studio_se": "b53_glassblower_studio_sw",

  "b55_desert_kasbah_sw": "b56_desert_kasbah_se",
  "b56_desert_kasbah_se": "b55_desert_kasbah_sw",
};

/**
 * Xoay hướng tile và đảo trạng thái lật gương (Flip)
 *
 * @param {string} tileId
 * @param {boolean} currentFlipped
 * @returns {{ nextId: string, nextFlip: boolean }}
 */
// Vật phẩm có hình đối xứng gương: lật/xoay không làm đổi hình nhìn thấy -> báo rõ cho người chơi thay vì im lặng.
// (Luống đất: ảnh mặt đất gần như đối xứng hoàn toàn, đo được ~3% điểm ảnh khác nhau khi lật.)
export const ROTATION_NO_EFFECT_TILES = new Set(["d13_farmland_plot", "d12_meadow_wildflowers"]);
export function isRotationVisible(tileId) {
  return !ROTATION_NO_EFFECT_TILES.has(tileId);
}

export function getRotatedTileIdAndFlip(tileId, currentFlipped) {
  const target = TILE_ROTATION_MAP[tileId];
  if (target && (getBuildingSpriteUri(target) || AESTHETIC_TILE_URIS[target] || TILE_DATA_URIS[target])) {
    return {
      nextId: TILE_ROTATION_MAP[tileId],
      nextFlip: currentFlipped
    };
  }

  // Fallback: Đảo lật gương ngang cho các công trình hoặc cây cối đơn lẻ
  return {
    nextId: tileId,
    nextFlip: !currentFlipped
  };
}

/**
 * Khởi tạo Bộ quản lý Nâng cấp & Giám sát công trình (Upgrade & Inspection Manager)
 *
 * @param {Object} ctx - Ngữ cảnh state và hành động từ studioEngine
 */
export function createUpgradeManager(ctx) {
  const upgradeModal = document.getElementById("upgrade-modal");
  const upgradeModalClose = document.getElementById("upgrade-modal-close");
  const upgradeModalDismiss = document.getElementById("upgrade-modal-dismiss-btn");
  const upgradeBtnRotate = document.getElementById("upgrade-btn-rotate");
  const upgradeBtnMove = document.getElementById("upgrade-btn-move");
  const upgradeBtnDemolish = document.getElementById("upgrade-btn-demolish");
  const upgradeModalThumb = /** @type {HTMLImageElement|null} */ (document.getElementById("upgrade-modal-thumb"));
  const upgradeModalTitle = document.getElementById("upgrade-modal-title");
  const upgradeModalStars = document.getElementById("upgrade-modal-stars");
  const upgradeModalBody = document.getElementById("upgrade-modal-body");

  let inspectedCell = null;
  const abortController = new AbortController();
  const { signal } = abortController;

  function openUpgradeModal(row, col) {
    if (!upgradeModal) return;
    inspectedCell = { row, col };
    playModalOpenSound();
    renderUpgradeModalContent();
    upgradeModal.classList.add("open");
  }

  function closeUpgradeModal() {
    if (upgradeModal) {
      playModalCloseSound();
      upgradeModal.classList.remove("open");
    }
    inspectedCell = null;
  }

  if (upgradeModalClose) upgradeModalClose.addEventListener("click", closeUpgradeModal, { signal });
  if (upgradeModalDismiss) upgradeModalDismiss.addEventListener("click", closeUpgradeModal, { signal });
  if (upgradeModal) {
    upgradeModal.addEventListener("click", function(e) {
      if (e.target === upgradeModal) closeUpgradeModal();
    }, { signal });
  }

  if (upgradeBtnRotate) {
    upgradeBtnRotate.addEventListener("click", function() {
      if (!inspectedCell) return;
      const { row, col } = inspectedCell;
      const key = `${row}_${col}`;
      const currentGrid = ctx.getCurrentGrid();
      const flippedGrid = ctx.getFlippedGrid();
      const tileMap = ctx.getTileMap();
      const curTid = currentGrid[row][col];
      const curFlipped = !!flippedGrid[key];

      const res = getRotatedTileIdAndFlip(curTid, curFlipped);
      if (tileMap[res.nextId]) {
        currentGrid[row][col] = res.nextId;
      }
      if (res.nextFlip) {
        flippedGrid[key] = true;
      } else {
        delete flippedGrid[key];
      }

      ctx.saveFlippedGrid();
      ctx.persistGameState();
      ctx.showToast("🔄 Đã xoay công trình thành công!", "info");
      renderUpgradeModalContent();
      ctx.requestRender();
    }, { signal });
  }

  if (upgradeBtnMove) {
    upgradeBtnMove.addEventListener("click", function() {
      if (!inspectedCell) return;
      const { row, col } = inspectedCell;
      const currentGrid = ctx.getCurrentGrid();
      const flippedGrid = ctx.getFlippedGrid();
      const buildingLevels = ctx.getBuildingLevels();
      const tid = currentGrid[row][col];
      const key = `${row}_${col}`;
      const lvl = buildingLevels[key] || 1;
      const isFlipped = !!flippedGrid[key];

      ctx.setMovingBuilding({
        fromRow: row,
        fromCol: col,
        tileId: tid,
        level: lvl,
        flipped: isFlipped
      });

      closeUpgradeModal();
      ctx.showToast("🚚 Đang chọn vị trí mới... Nhấp vào ô Cỏ Hoa trống để đặt công trình!", "info");
      ctx.requestRender();
    }, { signal });
  }

  if (upgradeBtnDemolish) {
    upgradeBtnDemolish.addEventListener("click", function() {
      if (!inspectedCell) return;
      const { row, col } = inspectedCell;
      const didErase = ctx.eraseCell(row, col);
      if (didErase) {
        ctx.triggerAutoSave();
        closeUpgradeModal();
      }
    }, { signal });
  }

  function renderUpgradeModalContent() {
    if (!inspectedCell || !upgradeModalBody) return;
    const { row, col } = inspectedCell;
    const key = `${row}_${col}`;
    const currentGrid = ctx.getCurrentGrid();
    const tileMap = ctx.getTileMap();
    const tid = currentGrid[row][col];
    const t = tileMap[tid];

    if (!t) {
      closeUpgradeModal();
      return;
    }

    const buildingLevels = ctx.getBuildingLevels();
    const curLvl = buildingLevels[key] || 1;
    const basePop = getTilePopulation(tid, t.category);
    const curPop = getBuildingLevelPopulation(tid, curLvl, basePop);

    if (upgradeModalTitle) upgradeModalTitle.textContent = `${t.label} (Ô ${row}, ${col})`;
    if (upgradeModalThumb) {
      upgradeModalThumb.src = getBuildingSpriteUri(tid, curLvl) || AESTHETIC_TILE_URIS[tid] || TILE_DATA_URIS[tid] || TILE_DATA_URIS.d12_meadow_wildflowers;
    }

    if (upgradeModalStars) {
      let starsStr = "";
      for (let s = 1; s <= MAX_BUILDING_LEVEL; s++) {
        starsStr += (s <= curLvl) ? "⭐" : "☆";
      }
      upgradeModalStars.textContent = `Cấp ${curLvl} / ${MAX_BUILDING_LEVEL} [ ${starsStr} ]`;
    }

    // Xem trước số vàng hoàn lại khi phá dỡ
    const refundInfo = calculateDemolishRefund(tid, t.category, curLvl, ctx.getGameMode());
    if (upgradeBtnDemolish) {
      upgradeBtnDemolish.textContent = `♻️ Phá dỡ (+${refundInfo.totalRefund}🪙)`;
      upgradeBtnDemolish.title = `Phá dỡ: Hoàn lại 50% gốc (${refundInfo.baseRefund}🪙) + 70% nâng cấp (${refundInfo.upgradeRefund}🪙)`;
    }

    upgradeModalBody.innerHTML = "";

    const infoBox = document.createElement("div");
    infoBox.className = "upgrade-info-box";
    infoBox.innerHTML = `
      <div class="upgrade-stat-row">
        <span>Dân số đóng góp:</span>
        <b>+${curPop} người</b>
      </div>
      <div class="upgrade-stat-row">
        <span>Mô tả:</span>
        <span>${t.doc || "Công trình kiến trúc vương quốc."}</span>
      </div>
    `;

    const upgradesInProgress = ctx.getUpgradesInProgress();
    if (upgradesInProgress[key]) {
      const u = upgradesInProgress[key];
      const elapsed = Date.now() - u.startTime;
      const secLeft = Math.max(1, Math.ceil((u.durationMs - elapsed) / 1000));
      const statusBox = document.createElement("div");
      statusBox.className = "upgrade-stat-row";
      statusBox.style.cssText = "margin-top:6px; padding:8px; background:#eff6ff; border-radius:6px; color:#1d4ed8; font-weight:700;";
      statusBox.innerHTML = `<span>⏳ Đang thi công nâng cấp lên Cấp ${u.targetLevel}: còn ${secLeft}s...</span>`;
      infoBox.appendChild(statusBox);
    }

    upgradeModalBody.appendChild(infoBox);

    const nextUpg = getNextUpgrade(tid, curLvl);
    if (nextUpg) {
      const card = document.createElement("div");
      card.className = "upgrade-action-card";
      const playerGold = ctx.getPlayerGold();
      const playerResources = ctx.getPlayerResources();
      const canGold = playerGold >= nextUpg.costGold;

      // Kiểm tra nguyên liệu nâng cấp
      const resCosts = nextUpg.costResources || {};
      let canResources = true;
      let missingResName = "";
      const resCostBadges = Object.entries(resCosts).map(([rKey, reqQty]) => {
        const cfg = RESOURCES_CONFIG[rKey];
        const hasQty = playerResources[rKey] || 0;
        const isEnough = hasQty >= reqQty;
        if (!isEnough) {
          canResources = false;
          if (!missingResName) missingResName = cfg ? cfg.name : rKey;
        }
        const icon = cfg ? cfg.icon : "📦";
        const name = cfg ? cfg.name : rKey;
        const badgeColor = isEnough ? "#15803d" : "#b91c1c";
        const badgeBg = isEnough ? "#f0fdf4" : "#fee2e2";
        return `<span style="display:inline-flex; align-items:center; gap:3px; padding:2px 6px; border-radius:4px; font-size:0.75rem; background:${badgeBg}; color:${badgeColor}; font-weight:600;">
          ${icon} ${name}: ${hasQty}/${reqQty}
        </span>`;
      }).join(" ");

      const isUpgrading = !!upgradesInProgress[key];
      const canUpgrade = canGold && canResources && !isUpgrading;
      const durSec = nextUpg.durationSec || 8;

      let btnLabel = `🚀 Nâng Cấp (${nextUpg.costGold}🪙)`;
      if (isUpgrading) {
        btnLabel = "⏳ Đang Nâng Cấp...";
      } else if (!canGold) {
        btnLabel = `Thiếu Vàng (${nextUpg.costGold}🪙)`;
      } else if (!canResources) {
        btnLabel = `Thiếu ${missingResName}`;
      }

      const upgIcon = nextUpg.icon || (nextUpg.nextLevel === 3 ? "🌟" : "⭐");
      const upgDesc = nextUpg.benefitText || nextUpg.desc || "Nâng cấp gia tăng hiệu quả công trình.";

      card.innerHTML = `
        <div class="upgrade-action-title">Nâng cấp Lên Cấp ${nextUpg.nextLevel} ${upgIcon}</div>
        <div class="upgrade-action-desc">${upgDesc}</div>
        <div class="upgrade-cost-row" style="flex-wrap:wrap; gap:6px;">
          <span>Vàng: <b>${nextUpg.costGold} 🪙</b></span>
          <span>Thời gian: <b>${durSec}s</b></span>
          ${resCostBadges ? `<div style="width:100%; display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">${resCostBadges}</div>` : ''}
        </div>
        <button type="button" class="upgrade-action-btn" ${!canUpgrade ? 'disabled' : ''}>
          ${btnLabel}
        </button>
      `;

      const upgBtn = card.querySelector(".upgrade-action-btn");
      if (upgBtn) {
        upgBtn.addEventListener("click", () => {
          if (!canUpgrade) return;

          ctx.deductGold(nextUpg.costGold);
          ctx.deductResources(resCosts);

          upgradesInProgress[key] = {
            row,
            col,
            targetLevel: nextUpg.nextLevel,
            startTime: Date.now(),
            durationMs: durSec * 1000,
            costGold: nextUpg.costGold,
            costResources: resCosts
          };

          ctx.persistGameState();
          ctx.showToast(`⚒️ Bắt đầu nâng cấp ${t.label} lên Cấp ${nextUpg.nextLevel} (${durSec}s)...`, "info");
          closeUpgradeModal();
          ctx.requestRender();
        });
      }

      upgradeModalBody.appendChild(card);
    } else {
      const maxTag = document.createElement("div");
      maxTag.className = "upgrade-max-tag";
      maxTag.textContent = "🏆 Công trình đã đạt Cấp Tối Đa!";
      upgradeModalBody.appendChild(maxTag);
    }
  }

  return {
    openUpgradeModal,
    closeUpgradeModal,
    renderUpgradeModalContent,
    getInspectedCell: () => inspectedCell,
    destroy: () => abortController.abort()
  };
}
