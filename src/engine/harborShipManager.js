import {resourceIconHtml} from '../data/resourceIcons.js';
import { getHarborLayout, isShipCell, isHarborCell } from '../data/harborLayout.js';
/**
 * harborShipManager.js - Quản Lý Bến Cảng Đường Thủy & Tàu Buôn Giao Thương (Cargo Boat)
 * 
 * - Mở khóa ở Cấp 6 (Lãnh Chúa Khai Hoang).
 * - Cảng và tàu dùng footprint hai ô cố định ở bờ biển phía Tây (harborLayout.js).
 * - Tàu mang theo 3 khoang hàng × 3 thùng = 9 thùng hàng (Crates).
 * - Đóng từng thùng nhận Vàng & XP tức thì.
 * - Đóng đủ 9/9 thùng và nhổ neo nhận: 3-5 Ruby 💎, 2 vật tư hiếm, lượng lớn Vàng & XP!
 */

import {
  HARBOR_UNLOCK_LEVEL,
  SHIP_STAY_DURATION_MS,
  SHIP_COOLDOWN_MS,
  SHIP_CALL_EARLY_GEMS,
  OCEAN_BAY_TILES,
  generateCargoShip,
  SHIP_WATER_ROW,
  SHIP_WATER_COL
} from "../data/harborShipConfig.js";

import { RESOURCES_CONFIG } from "../data/resourcesConfig.js";
import { CROP_PIXEL_SPRITES } from "../data/cropSprites.js";

export const ROYAL_SHIP_IMAGE_SRC = "/assets/aistudio/TauHoangGia_v1_a5f7fe14.png";
let royalShipImg = null;
function getRoyalShipImage() {
  if (!royalShipImg) {
    royalShipImg = new Image();
    royalShipImg.src = ROYAL_SHIP_IMAGE_SRC;
  }
  return royalShipImg;
}

export const STONE_PIER_IMAGE_SRC = "/assets/aistudio/cang_67fa4e39.png";
let stonePierImg = null;
function getStonePierImage() {
  if (!stonePierImg) {
    stonePierImg = new Image();
    stonePierImg.src = STONE_PIER_IMAGE_SRC;
  }
  return stonePierImg;
}

import {
  playCoinSound,
  playQuestRewardSound,
  playErrorSound,
  playUIClickSound,
  playModalOpenSound,
  playModalCloseSound,
  playShipHornSound,
  playBuildSound
} from "./audioEngine.js";

export class HarborShipManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.ship = null;
    this.isModalOpen = false;
    this.totalShipsCompleted = 0;
    this.abortController = new AbortController();
  }

  init(savedData = null) {
    // Đảm bảo khu vực bến tàu có Vịnh Biển & Cầu Cảng Đá thay vì bãi cỏ
    this.ensureOceanBayGrid();

    if (savedData && typeof savedData === "object" && savedData.cargoHolds) {
      this.ship = savedData;
      this.totalShipsCompleted = typeof savedData.totalShipsCompleted === "number" ? savedData.totalShipsCompleted : 0;
    } else {
      // Khởi tạo chuyến tàu đầu tiên nếu đã đạt cấp 6
      if (this.isUnlocked()) {
        const lvl = this.ctx.getPlayerLevel ? this.ctx.getPlayerLevel() : 6;
        this.ship = generateCargoShip(lvl);
      }
    }

    const { signal } = this.abortController;

    // Nút mở Bến Cảng trên Topbar / Action Deck
    const openBtn = document.getElementById("btn-open-harbor-ship");
    if (openBtn) {
      openBtn.addEventListener("click", () => this.openModal(), { signal });
    }

    // Modal Close buttons
    const closeBtn = document.getElementById("cargo-ship-modal-close");
    const dismissBtn = document.getElementById("cargo-ship-dismiss-btn");
    const backdrop = document.getElementById("cargo-ship-modal");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal(), { signal });
    }
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => this.closeModal(), { signal });
    }
    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) this.closeModal();
      }, { signal });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isModalOpen) {
        this.closeModal();
      }
    }, { signal });

    this.updateHUD();
  }

  getSaveState() {
    if (!this.ship) return null;
    return {
      ...this.ship,
      totalShipsCompleted: this.totalShipsCompleted
    };
  }

  isUnlocked() {
    const level = this.ctx.getPlayerLevel ? this.ctx.getPlayerLevel() : 1;
    return level >= HARBOR_UNLOCK_LEVEL;
  }

  getPackedCratesCount() {
    if (!this.ship || !this.ship.cargoHolds) return 0;
    let count = 0;
    this.ship.cargoHolds.forEach(h => {
      h.crates.forEach(c => {
        if (c.packed) count++;
      });
    });
    return count;
  }

  isShipFullyPacked() {
    return this.getPackedCratesCount() === 9;
  }

  getTimeRemainingMs() {
    if (!this.ship) return 0;
    const now = Date.now();
    if (this.ship.status === "docked") {
      return Math.max(0, this.ship.departsAt - now);
    } else if (this.ship.status === "away") {
      return Math.max(0, this.ship.nextArrivalAt - now);
    }
    return 0;
  }

  packCrate(holdIndex, crateIndex) {
    if (!this.ship || this.ship.status !== "docked") return;

    const hold = this.ship.cargoHolds[holdIndex];
    if (!hold) return;
    const crate = hold.crates[crateIndex];
    if (!crate || crate.packed) return;

    const playerResources = this.ctx.getPlayerResources ? this.ctx.getPlayerResources() : {};
    const owned = playerResources[crate.resId] || 0;

    if (owned < crate.qty) {
      playErrorSound();
      if (this.ctx.showToast) {
        const resCfg = RESOURCES_CONFIG[crate.resId] || { name: crate.resId };
        this.ctx.showToast(`⚠️ Chưa đủ ${resCfg.name}! Cần ${crate.qty}, kho hiện có ${owned}.`, "error");
      }
      return;
    }

    // Trừ tài nguyên và trao thưởng ngay cho thùng hàng đó
    playerResources[crate.resId] -= crate.qty;
    crate.packed = true;

    this.ctx.addPlayerGold(crate.rewardGold);
    this.ctx.addPlayerXP(crate.rewardXP, "Đóng kiện hàng tàu");

    playBuildSound();
    playCoinSound();

    if (this.ctx.spawnFlyingProduce) {
      this.ctx.spawnFlyingProduce(SHIP_WATER_COL,SHIP_WATER_ROW,crate.resIcon||"📦",crate.resId);
    }
    if (this.ctx.spawnFlyingCoin) {
      this.ctx.spawnFlyingCoin(SHIP_WATER_COL, SHIP_WATER_ROW, 4);
    }

    if (this.ctx.updateResourcesUI) this.ctx.updateResourcesUI();
    if (this.ctx.persistGameState) this.ctx.persistGameState();

    const packedTotal = this.getPackedCratesCount();
    if (packedTotal === 9) {
      playQuestRewardSound();
      if (this.ctx.showToast) {
        this.ctx.showToast("🎉 Toàn bộ 9/9 thùng hàng đã đóng kín! Bạn có thể nhổ neo xuất bến để nhận Thưởng Lớn!", "success");
      }
    } else {
      if (this.ctx.showToast) {
        this.ctx.showToast(`📦 Đã đóng thùng hàng ${crate.resName} × ${crate.qty}! (+${crate.rewardGold}🪙, +${crate.rewardXP}XP)`, "success");
      }
    }

    this.renderModal();
    this.updateHUD();
  }

  castOffShip(forceEarly = false) {
    if (!this.ship || this.ship.status !== "docked") return;

    const isFull = this.isShipFullyPacked();

    if (!isFull && !forceEarly) {
      const confirmEarly = window.confirm(
        "⚓ XUẤT BẾN SỚM?\n\n" +
        `Bạn mới chỉ đóng được ${this.getPackedCratesCount()}/9 thùng hàng.\n` +
        "Nếu xuất bến ngay bây giờ, bạn sẽ KHÔNG nhận được Ruby 💎 và Vật tư mở đất quý giá!\n\n" +
        "Bạn có chắc chắn muốn cho tàu rời bến không?"
      );
      if (!confirmEarly) return;
    }

    if (isFull) {
      // Trao Đại Phần Thưởng Toàn Thắng (Grand Completion Reward)
      const gr = this.ship.grandReward || { gems: 4, gold: 800, xp: 500, supplyId: "ironTools", supplyQty: 2 };

      if (this.ctx.addPlayerGems) this.ctx.addPlayerGems(gr.gems);
      this.ctx.addPlayerGold(gr.gold);
      this.ctx.addPlayerXP(gr.xp, "Đại thắng lợi Chuyến tàu buôn");

      const playerResources = this.ctx.getPlayerResources ? this.ctx.getPlayerResources() : {};
      if (gr.supplyId) {
        playerResources[gr.supplyId] = (playerResources[gr.supplyId] || 0) + (gr.supplyQty || 2);
      }

      this.totalShipsCompleted++;
      playShipHornSound();
      playQuestRewardSound();

      const supplyCfg = RESOURCES_CONFIG[gr.supplyId] || { name: gr.supplyId, icon: "🔩" };
      if (this.ctx.showToast) {
        this.ctx.showToast(
          `⚓ CHUYẾN TÀU XUẤT BẾN TOÀN THẮNG! Nhận +${gr.gems} 💎 Ruby, +${gr.gold} 🪙 Vàng, +${gr.supplyQty} ${supplyCfg.icon} ${supplyCfg.name}!`,
          "success"
        );
      }

      if (this.ctx.updateResourcesUI) this.ctx.updateResourcesUI();
    } else {
      playShipHornSound();
      if (this.ctx.showToast) {
        this.ctx.showToast("⚓ Tàu buôn đã nhổ neo xuất bến sớm.", "info");
      }
    }

    // Chuyển sang trạng thái "away" (cooldown)
    const now = Date.now();
    this.ship.status = "away";
    this.ship.nextArrivalAt = now + SHIP_COOLDOWN_MS;

    this.renderModal();
    this.updateHUD();
    if (this.ctx.persistGameState) this.ctx.persistGameState();
  }

  callShipEarly() {
    if (!this.ship || this.ship.status !== "away") return;

    const curGems = this.ctx.getPlayerGems ? this.ctx.getPlayerGems() : 0;
    if (curGems < SHIP_CALL_EARLY_GEMS) {
      playErrorSound();
      if (this.ctx.showToast) {
        this.ctx.showToast(`⚠️ Không đủ Ruby 💎! Cần ${SHIP_CALL_EARLY_GEMS} 💎 để gọi tàu đến ngay.`, "error");
      }
      return;
    }

    this.ctx.deductGems(SHIP_CALL_EARLY_GEMS);
    const lvl = this.ctx.getPlayerLevel ? this.ctx.getPlayerLevel() : 6;
    this.ship = generateCargoShip(lvl);

    playShipHornSound();
    playQuestRewardSound();
    if (this.ctx.showToast) {
      this.ctx.showToast("🚢 Tàu buôn đã nhận tín hiệu và cập bến ngay lập tức!", "success");
    }

    this.renderModal();
    this.updateHUD();
    if (this.ctx.persistGameState) this.ctx.persistGameState();
  }

  update(dt) {
    if (!this.isUnlocked()) return;

    const now = Date.now();

    // Nếu chưa có tàu và đã đạt cấp 6
    if (!this.ship) {
      const lvl = this.ctx.getPlayerLevel ? this.ctx.getPlayerLevel() : 6;
      this.ship = generateCargoShip(lvl);
      this.updateHUD();
      return;
    }

    // 1. Tàu đang đỗ và hết thời hạn 15 phút -> Tàu tự động rời bến
    if (this.ship.status === "docked" && now >= this.ship.departsAt) {
      this.castOffShip(true);
      return;
    }

    // 2. Tàu đang đi vắng và hết cooldown 10 phút -> Tàu mới cập bến
    if (this.ship.status === "away" && now >= this.ship.nextArrivalAt) {
      const lvl = this.ctx.getPlayerLevel ? this.ctx.getPlayerLevel() : 6;
      this.ship = generateCargoShip(lvl);
      playShipHornSound();
      if (this.ctx.showToast) {
        this.ctx.showToast("🚢 Chuyến tàu giao thương hoàng gia vừa cập bến cảng phía Tây!", "success");
      }
      this.updateHUD();
      if (this.isModalOpen) this.renderModal();
      if (this.ctx.persistGameState) this.ctx.persistGameState();
    }

    // Cập nhật nhãn đếm ngược
    this.updateHUD();
    if (this.isModalOpen) {
      this.renderCountdownOnly();
    }
  }

  formatDuration(ms) {
    if (ms <= 0) return "00:00";
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(mins)}:${pad(secs)}`;
  }

  updateHUD() {
    const badgeEl = document.getElementById("cargo-ship-notify-badge");
    const openBtn = document.getElementById("btn-open-harbor-ship");
    if (!badgeEl || !openBtn) return;

    if (!this.isUnlocked()) {
      badgeEl.textContent = "Cấp 6";
      badgeEl.className = "harbor-badge locked";
      openBtn.title = "🔒 Bến Cảng Hoàng Gia (Mở khóa ở Cấp 6 - Lãnh Chúa Khai Hoang)";
      return;
    }

    if (!this.ship) return;

    if (this.ship.status === "docked") {
      const packed = this.getPackedCratesCount();
      const remMs = this.getTimeRemainingMs();
      badgeEl.textContent = `${packed}/9 📦`;
      badgeEl.className = packed === 9 ? "harbor-badge ready" : "harbor-badge active";
      openBtn.title = `🚢 Tàu buôn đang cập bến (${packed}/9 thùng - Còn: ${this.formatDuration(remMs)})`;
    } else {
      const remMs = this.getTimeRemainingMs();
      badgeEl.textContent = `⚓ ${this.formatDuration(remMs)}`;
      badgeEl.className = "harbor-badge away";
      openBtn.title = `⚓ Tàu kế tiếp sẽ đến sau: ${this.formatDuration(remMs)}`;
    }
  }

  openModal() {
    if (!this.isUnlocked()) {
      playErrorSound();
      if (this.ctx.showToast) {
        this.ctx.showToast("🔒 Bến Cảng Hoàng Gia mở khóa khi đạt Cấp 6 (Lãnh Chúa Khai Hoang)! Hãy phát triển vương quốc để mở khóa.", "info");
      }
      return;
    }

    playModalOpenSound();
    this.isModalOpen = true;
    const modal = document.getElementById("cargo-ship-modal");
    if (modal) {
      modal.classList.add("visible");
      modal.classList.add("open");
    }
    this.renderModal();
  }

  closeModal() {
    playModalCloseSound();
    this.isModalOpen = false;
    const modal = document.getElementById("cargo-ship-modal");
    if (modal) {
      modal.classList.remove("visible");
      modal.classList.remove("open");
    }
  }

  renderModal() {
    const bodyEl = document.getElementById("cargo-ship-modal-body");
    const countdownEl = document.getElementById("cargo-ship-countdown-label");
    const totalCountEl = document.getElementById("cargo-ship-total-completed");

    if (totalCountEl) totalCountEl.textContent = this.totalShipsCompleted;
    if (!bodyEl || !this.ship) return;

    const isDocked = this.ship.status === "docked";
    const packedCount = this.getPackedCratesCount();
    const remMs = this.getTimeRemainingMs();

    if (countdownEl) {
      if (isDocked) {
        countdownEl.innerHTML = `⏳ Tàu sẽ rời bến sau: <strong>${this.formatDuration(remMs)}</strong>`;
      } else {
        countdownEl.innerHTML = `⚓ Chuyến tàu tiếp theo cập bến sau: <strong>${this.formatDuration(remMs)}</strong>`;
      }
    }

    if (!isDocked) {
      // Giao diện khi tàu đang đi vắng (Cooldown)
      const previewGoods = this.ship.nextPreviewGoods || ["wheat", "milk", "bread"];
      bodyEl.innerHTML = `
        <div class="ship-cooldown-view">
          <div class="ship-cooldown-stamp">
            <img src="${ROYAL_SHIP_IMAGE_SRC}" alt="Tàu Hoàng Gia" class="ship-cooldown-img" />
          </div>
          <h3 class="ship-cooldown-title">Tàu Buôn Hoàng Gia Đang Vận Chuyển Hàng Ra Khơi</h3>
          <p class="ship-cooldown-desc">Thương thuyền Hoàng Gia đang trên đường vượt sóng giao hàng đến các hải cảng lân cận. Hãy tranh thủ tích lũy nông sản để sẵn sàng cho chuyến tàu kế tiếp!</p>

          <div class="ship-preview-card">
            <div class="preview-title">🔍 Dự báo hàng hóa tàu tới sẽ thu mua:</div>
            <div class="preview-goods-row">
              ${previewGoods.map(gId => {
                const cfg = RESOURCES_CONFIG[gId] || { name: gId, icon: "📦" };
                const sprite = CROP_PIXEL_SPRITES['icon_' + gId];
                return `
                  <div class="preview-good-chip">
                    ${sprite ? `<img src="${sprite}" class="preview-icon-img" alt="${cfg.name}"/>` : `<span class="preview-icon">${cfg.icon}</span>`}
                    <span class="preview-name">${cfg.name}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="ship-speedup-row">
            <span class="speedup-hint">Cần tàu tới ngay lập tức?</span>
            <button type="button" class="ship-speedup-btn" id="btn-call-ship-early">
              ⚡ Gọi Tàu Cập Bến Ngay (${SHIP_CALL_EARLY_GEMS} 💎)
            </button>
          </div>
        </div>
      `;

      const speedupBtn = document.getElementById("btn-call-ship-early");
      if (speedupBtn) {
        speedupBtn.addEventListener("click", () => this.callShipEarly());
      }
      return;
    }

    // Giao diện khi tàu đang cập bến (3 khoang × 3 thùng = 9 thùng)
    const gr = this.ship.grandReward || { gems: 4, gold: 800, xp: 500, supplyId: "ironTools", supplyQty: 2 };
    const supplyCfg = RESOURCES_CONFIG[gr.supplyId] || { name: gr.supplyId, icon: "🔩" };
    const playerResources = this.ctx.getPlayerResources ? this.ctx.getPlayerResources() : {};

    bodyEl.innerHTML = `
      <!-- Grand Reward Banner -->
      <div class="ship-grand-reward-banner ${packedCount === 9 ? 'complete' : ''}">
        <div class="grand-reward-chest">🎁</div>
        <div class="grand-reward-info">
          <div class="grand-reward-header">
            <span class="grand-title">Phần Thưởng Toàn Thắng (Đủ 9/9 Thùng):</span>
            <span class="grand-progress-pill">${packedCount} / 9 Thùng</span>
          </div>
          <div class="grand-reward-chips">
            <span class="gr-chip gem">💎 +${gr.gems} Ruby</span>
            <span class="gr-chip gold">🪙 +${gr.gold.toLocaleString()} Vàng</span>
            <span class="gr-chip xp">⭐ +${gr.xp} XP</span>
            <span class="gr-chip supply">${resourceIconHtml(gr.supplyId,supplyCfg.name,22,supplyCfg.icon)} +${gr.supplyQty} ${supplyCfg.name}</span>
          </div>
        </div>
        <button type="button" class="ship-castoff-btn ${packedCount === 9 ? 'ready' : ''}" id="btn-ship-castoff">
          ${packedCount === 9 ? '⚓ Nhổ Neo & Nhận Thưởng' : 'Xuất Bến Sớm'}
        </button>
      </div>

      <!-- 3 Cargo Holds Grid -->
      <div class="ship-holds-container">
        ${this.ship.cargoHolds.map((hold, hIdx) => {
          return `
            <div class="ship-hold-column">
              <div class="hold-header">
                <span class="hold-icon">${hold.holdIcon}</span>
                <span class="hold-title">${hold.holdName}</span>
              </div>
              <div class="hold-crates-list">
                ${hold.crates.map((crate, cIdx) => {
                  const owned = playerResources[crate.resId] || 0;
                  const canPack = owned >= crate.qty;
                  const sprite = CROP_PIXEL_SPRITES['icon_' + crate.resId];
                  return `
                    <div class="crate-card ${crate.packed ? 'packed' : ''}">
                      <div class="crate-icon-wrap">
                        ${sprite ? `<img src="${sprite}" class="crate-pixel-img" alt="${crate.resName}"/>` : `<span class="crate-icon">${crate.resIcon}</span>`}
                        ${crate.packed ? '<span class="crate-stamp">✅ ĐÃ ĐÓNG</span>' : ''}
                      </div>
                      <div class="crate-meta">
                        <span class="crate-req-name">${crate.resName} × ${crate.qty}</span>
                        <span class="crate-stock ${canPack ? 'ok' : 'missing'}">
                          Kho có: ${owned} / ${crate.qty}
                        </span>
                        <span class="crate-rewards">+${crate.rewardGold}🪙 +${crate.rewardXP}XP</span>
                      </div>
                      ${!crate.packed ? `
                        <button type="button" class="crate-pack-btn ${canPack ? 'ready' : 'disabled'}" data-hidx="${hIdx}" data-cidx="${cIdx}">
                          ${canPack ? '📦 Đóng Thùng' : 'Thiếu Hàng'}
                        </button>
                      ` : `
                        <div class="crate-done-label">Hoàn thành</div>
                      `}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Gắn sự kiện đóng thùng
    bodyEl.querySelectorAll(".crate-pack-btn.ready").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const hIdx = parseInt(e.currentTarget.getAttribute("data-hidx"), 10);
        const cIdx = parseInt(e.currentTarget.getAttribute("data-cidx"), 10);
        this.packCrate(hIdx, cIdx);
      });
    });

    // Gắn sự kiện nhổ neo xuất bến
    const castOffBtn = document.getElementById("btn-ship-castoff");
    if (castOffBtn) {
      castOffBtn.addEventListener("click", () => {
        this.castOffShip(false);
      });
    }
  }

  renderCountdownOnly() {
    const countdownEl = document.getElementById("cargo-ship-countdown-label");
    if (countdownEl && this.ship) {
      const isDocked = this.ship.status === "docked";
      const remMs = this.getTimeRemainingMs();
      if (isDocked) {
        countdownEl.innerHTML = `⏳ Tàu sẽ rời bến sau: <strong>${this.formatDuration(remMs)}</strong>`;
      } else {
        countdownEl.innerHTML = `⚓ Chuyến tàu tiếp theo cập bến sau: <strong>${this.formatDuration(remMs)}</strong>`;
      }
    }
  }

  ensureOceanBayGrid() {
    if (!this.ctx || !this.ctx.getCurrentGrid) return;
    const grid = this.ctx.getCurrentGrid();
    if (!grid || !grid[14]) return;
    // Nếu bản đồ không có cầu cảng thì không tự thêm vịnh biển/đảo trang trí.
    if (grid[14][4] !== 'm04_stone_harbor_pier') return;
    // Đảm bảo dải đại dương trải dài toàn bộ 32 hàng dọc theo sườn Tây
    if (grid[0][0] !== 'm30_sea_var2_coral_reef' || grid[31][0] !== 'm30_sea_var2_coral_reef') {
      for (const item of OCEAN_BAY_TILES) {
        if (grid[item.r] && grid[item.r][item.c] !== undefined) {
          const curTid = grid[item.r][item.c];
          if (!curTid.startsWith('b') || curTid === 'b04_windmill') {
            grid[item.r][item.c] = item.tid;
          }
        }
      }
      if (this.ctx.persistGameState) this.ctx.persistGameState();
      if (this.ctx.requestRender) this.ctx.requestRender();
    }
  }

  /**
   * Kiểm tra click trúng Bến Tàu / Thuyền Buồm trên bản đồ thế giới
   */
  checkWorldClick(worldX, worldY, cell, originX, originY, halfW, quarterW) {
    // Editor-authored harbour sites may lie beyond the playable 32x32 grid.
    if (!cell) {
      const dx=worldX-(originX+halfW),dy=worldY-(originY+3*quarterW);
      cell={row:Math.round(dy/(2*quarterW)-dx/(2*halfW)),col:Math.round(dy/(2*quarterW)+dx/(2*halfW))};
      if(!isHarborCell(cell.row,cell.col))return false;
    }
    // Cả hai ô dọc thân tàu đều mở cùng bảng giao thương.
    if (this.ship && this.ship.status === "docked") {
      if (isShipCell(cell.row,cell.col)) {
        this.openModal();
        return true;
      }
      return false;
    }
    // Khi tàu đi vắng, cả footprint cảng và tàu đều mở bảng gọi tàu sớm.
    if (this.ship && this.ship.status === "away") {
      if (isHarborCell(cell.row,cell.col)) {
        this.openModal();
        return true;
      }
    }
    return false;
  }

  /**
   * Vẽ Bến Tàu & Thuyền Buồm Caravel trên Canvas Isometric 2:1
   */
  renderWorldShipAndDock(c2d, originX, originY, halfW, quarterW, animTime, opts = {}) {
    const layout = getHarborLayout(originX, originY, halfW, quarterW, animTime || 0);
    // Dùng cùng điểm tiếp đất cho ảnh cảng và hình dự phòng khi ảnh chưa tải.
    const dockX = layout.dockFoot.x;
    const dockY = layout.dockFoot.y;

    // Tọa độ ô nước [15, 3] nơi Tàu Hoàng Gia neo đậu
    const shipWaterX = layout.shipFoot.x;
    const shipWaterY = layout.shipFoot.y;

    c2d.save();

    // 1. Cầu cảng hai ô, chân bậc thang neo tại đỉnh dưới ô bờ [14,4].
    const pierImg = getStonePierImage();
    const pierDrawW = layout.pier.w;
    const pierDrawH = layout.pier.h;
    // Neo chân bậc thang phía đất liền vào bờ [14,4], không neo giữa thân cảng.
    const drawPierX = layout.pier.x;
    const drawPierY = layout.pier.y;

    if (opts.only !== "ship") {
    if (pierImg && pierImg.complete && pierImg.naturalWidth > 0) {
      // Vẽ hình ảnh Cầu Cảng Đá chất lượng cao
      c2d.drawImage(pierImg, drawPierX, drawPierY, pierDrawW, pierDrawH);
    } else {
      // Dự phòng khi ảnh đang tải: Vẽ cầu tàu canvas
      c2d.fillStyle = "#78350f";
      c2d.fillRect(dockX - 32, dockY - 14, 48, 12);
      c2d.fillStyle = "#92400e";
      c2d.fillRect(dockX - 30, dockY - 18, 44, 8);
      c2d.fillStyle = "#b45309";
      c2d.fillRect(dockX - 30, dockY - 20, 44, 2);
    }

    }

    // 2. Nếu chưa mở khóa (Level < 6) -> Vẽ tấm biển cắm cọc khóa
    if (!this.isUnlocked()) {
      if (opts.only === "ship") { c2d.restore(); return; }
      c2d.fillStyle = "#64748b";
      c2d.fillRect(dockX - 16, dockY - 42, 32, 16);
      c2d.fillStyle = "#f1f5f9";
      c2d.font = "bold 9px monospace";
      c2d.textAlign = "center";
      c2d.fillText("🔒 CẤP 6", dockX, dockY - 30);
      c2d.restore();
      return;
    }

    // 3. Nếu tàu đang đi vắng (status === "away") -> Vẽ biển đếm ngược tàu tới
    if (this.ship && this.ship.status === "away") {
      if (opts.only === "ship") { c2d.restore(); return; }
      const remMs = this.getTimeRemainingMs();
      c2d.fillStyle = "#92400e";
      c2d.fillRect(dockX - 22, dockY - 44, 44, 18);
      c2d.fillStyle = "#fef3c7";
      c2d.fillRect(dockX - 20, dockY - 42, 40, 14);
      c2d.fillStyle = "#b45309";
      c2d.font = "bold 9px monospace";
      c2d.textAlign = "center";
      c2d.fillText(`⚓ ${this.formatDuration(remMs)}`, dockX, dockY - 32);
      c2d.restore();
      return;
    }

    if (opts.only === "dock") { c2d.restore(); return; }

    // 4. Khi Tàu Buôn Đang Cập Bến (status === "docked") -> Đậu trên mặt nước ô [15, 3]
    const waveOffset = layout.wave; // Nhấp nhô nhẹ nhàng theo sóng biển
    const shipImg = getRoyalShipImage();
    const shipDrawW = layout.ship.w;
    const shipDrawH = layout.ship.h;

    // Căn chính xác đáy lườn tàu nằm ngay mặt nước ô [15, 3]
    const drawX = layout.ship.x;
    const drawY = layout.ship.y;

    if (shipImg && shipImg.complete && shipImg.naturalWidth > 0) {
      // Vẽ hình ảnh Tàu Hoàng Gia chính diện, đặt đáy tàu ngập vừa vặn trong nước
      c2d.drawImage(shipImg, drawX, drawY, shipDrawW, shipDrawH);

      // Dây thừng buộc mạn tàu vào cọc cọc đồng cầu cảng đá
      const bollardX = drawPierX + pierDrawW * 0.53;
      const bollardY = drawPierY + pierDrawH * 0.55;
      const shipBowX = drawX + shipDrawW * 0.84;
      const shipBowY = drawY + shipDrawH * 0.68;

      c2d.strokeStyle = "#e2e8f0";
      c2d.lineWidth = 1.4;
      c2d.beginPath();
      c2d.moveTo(shipBowX, shipBowY);
      c2d.quadraticCurveTo((shipBowX + bollardX) / 2 - 4, (shipBowY + bollardY) / 2 + 10 + waveOffset * 0.5, bollardX, bollardY);
      c2d.stroke();

      const drawOverlay = () => {
        c2d.save();
        // Bong bóng thông báo nổi trên cột buồm chính
        const packedCount = this.getPackedCratesCount();
        const bubbleX = drawX + shipDrawW * 0.435;
        const bubbleY = drawY + shipDrawH * 0.143 - 8;

        c2d.fillStyle = packedCount === 9 ? "#10b981" : "#ffffff";
        c2d.strokeStyle = packedCount === 9 ? "#047857" : "#f59e0b";
        c2d.lineWidth = 1.5;

        const bubbleText = packedCount === 9 ? "⚓ XUẤT BẾN!" : `${packedCount}/9 📦`;
        c2d.beginPath();
        c2d.roundRect(bubbleX - 28, bubbleY - 11, 56, 17, 8);
        c2d.fill();
        c2d.stroke();

        c2d.fillStyle = packedCount === 9 ? "#ffffff" : "#0f172a";
        c2d.font = "bold 9px sans-serif";
        c2d.textAlign = "center";
        c2d.fillText(bubbleText, bubbleX, bubbleY + 1);
        c2d.restore();
      };
      if (opts.deferOverlay) opts.deferOverlay(drawOverlay);
      else drawOverlay();
      c2d.restore();
      return;
    }

    // Dự phòng khi ảnh đang tải: Vẽ thân tàu canvas tại ô [15, 3]
    const shipX = shipWaterX;
    const shipY = shipWaterY + waveOffset;

    // Thân tàu gỗ Caravel (Hull)
    c2d.fillStyle = "#78350f"; // Nâu gỗ đậm
    c2d.beginPath();
    c2d.moveTo(shipX - 20, shipY + 6);
    c2d.lineTo(shipX + 46, shipY - 6);  // Đuôi tàu
    c2d.lineTo(shipX + 42, shipY + 14); // Mạn đuôi
    c2d.lineTo(shipX - 16, shipY + 18); // Mạn trước
    c2d.closePath();
    c2d.fill();

    // Mũi tàu vươn nhọn kiêu hãnh (Bow)
    c2d.fillStyle = "#92400e";
    c2d.beginPath();
    c2d.moveTo(shipX - 20, shipY + 6);
    c2d.lineTo(shipX - 32, shipY + 2); // Mũi nhọn
    c2d.lineTo(shipX - 16, shipY + 18);
    c2d.closePath();
    c2d.fill();

    // Vạch trang trí mạn tàu màu vàng kim
    c2d.strokeStyle = "#fbbf24";
    c2d.lineWidth = 2;
    c2d.beginPath();
    c2d.moveTo(shipX - 26, shipY + 5);
    c2d.lineTo(shipX + 42, shipY - 4);
    c2d.stroke();

    // Cột buồm chính (Main Mast)
    c2d.fillStyle = "#451a03";
    c2d.fillRect(shipX + 12, shipY - 52, 4, 56);

    // Cánh buồm vải căng gió (Sail)
    c2d.fillStyle = "#fef3c7"; // Trắng ngà
    c2d.beginPath();
    c2d.moveTo(shipX - 8, shipY - 48);
    c2d.quadraticCurveTo(shipX + 14, shipY - 46 + waveOffset * 0.5, shipX + 34, shipY - 44);
    c2d.lineTo(shipX + 30, shipY - 18);
    c2d.quadraticCurveTo(shipX + 12, shipY - 22 + waveOffset * 0.5, shipX - 6, shipY - 20);
    c2d.closePath();
    c2d.fill();
    c2d.strokeStyle = "#d97706";
    c2d.lineWidth = 1;
    c2d.stroke();

    // Biểu tượng mỏ neo / vương miện trên buồm
    c2d.fillStyle = "#dc2626"; // Đỏ hoàng gia
    c2d.font = "bold 11px sans-serif";
    c2d.textAlign = "center";
    c2d.fillText("⚓", shipX + 14, shipY - 30);

    // Cờ đuôi nheo hoàng gia trên đỉnh cột buồm
    c2d.fillStyle = "#dc2626";
    c2d.beginPath();
    c2d.moveTo(shipX + 14, shipY - 52);
    c2d.lineTo(shipX + 26, shipY - 48 + Math.sin(animTime * 4) * 2);
    c2d.lineTo(shipX + 14, shipY - 44);
    c2d.closePath();
    c2d.fill();

    // Kiện hàng gỗ chất trên boong tàu
    c2d.fillStyle = "#d97706";
    c2d.fillRect(shipX + 22, shipY - 2, 7, 7);
    c2d.fillRect(shipX + 30, shipY - 5, 8, 8);

    // Dây thừng buộc neo vào cọc cầu tàu
    c2d.strokeStyle = "#e2e8f0";
    c2d.lineWidth = 1;
    c2d.beginPath();
    c2d.moveTo(shipX + 34, shipY + 2);
    c2d.lineTo(dockX - 26, dockY - 18);
    c2d.stroke();

    const drawOverlay = () => {
      c2d.save();
      // Bong bóng thông báo nổi trên cột buồm
      const packedCount = this.getPackedCratesCount();
      const bubbleY = shipY - 60;
      const bubbleX = shipX + 14;

      c2d.fillStyle = packedCount === 9 ? "#10b981" : "#ffffff";
      c2d.strokeStyle = packedCount === 9 ? "#047857" : "#f59e0b";
      c2d.lineWidth = 1.5;

      // Hộp bong bóng
      const bubbleText = packedCount === 9 ? "⚓ XUẤT BẾN!" : `${packedCount}/9 📦`;
      c2d.beginPath();
      c2d.roundRect(bubbleX - 28, bubbleY - 11, 56, 17, 8);
      c2d.fill();
      c2d.stroke();

      c2d.fillStyle = packedCount === 9 ? "#ffffff" : "#0f172a";
      c2d.font = "bold 9px sans-serif";
      c2d.textAlign = "center";
      c2d.fillText(bubbleText, bubbleX, bubbleY + 1);
      c2d.restore();
    };
    if (opts.deferOverlay) opts.deferOverlay(drawOverlay);
    else drawOverlay();
    c2d.restore();
  }

  destroy() {
    this.abortController.abort();
  }
}
