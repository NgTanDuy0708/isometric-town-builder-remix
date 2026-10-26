/**
 * townCaretaker.js - Tổng Quản Gia Hoàng Gia (Hệ Thống Thuê NPC Thu Hoạch Tự Động)
 * 
 * - Mở khóa ở Cấp 5 (Thị Trưởng Năng Động).
 * - Tặng 1 Ngày (24h) dùng thử miễn phí khi đạt cấp 5.
 * - Cho phép thuê bằng Vàng hoặc Ruby.
 * - Tự động thu hoạch: Ruộng lúa, Cây ăn quả, Chuồng trại (thu hoạch & tự động cho ăn), Xưởng sản xuất.
 * - Bảng điều khiển bật/tắt riêng từng hạng mục công việc.
 */

import { FRUIT_TREES_CONFIG } from "../data/resourcesConfig.js";
import { PRODUCTION_BUILDINGS } from "../data/gameEconomy.js";
import {
  playCoinSound,
  playQuestRewardSound,
  playErrorSound,
  playUIClickSound,
  playModalOpenSound,
  playModalCloseSound,
  playHarvestPlopSound
} from "./audioEngine.js";

export const CARETAKER_UNLOCK_LEVEL = 5;

// Các gói thuê Quản Gia
export const CARETAKER_PACKAGES = [
  { id: "gold_1d", type: "gold", days: 1, cost: 800, label: "1 Ngày", icon: "🪙" },
  { id: "gold_3d", type: "gold", days: 3, cost: 2000, label: "3 Ngày", icon: "🪙", popular: true },
  { id: "gold_7d", type: "gold", days: 7, cost: 4500, label: "7 Ngày", icon: "🪙" },
  { id: "gem_3d", type: "gem", days: 3, cost: 3, label: "3 Ngày", icon: "💎" },
  { id: "gem_7d", type: "gem", days: 7, cost: 6, label: "7 Ngày", icon: "💎", popular: true },
  { id: "gem_14d", type: "gem", days: 14, cost: 10, label: "14 Ngày", icon: "💎" }
];

export class TownCaretakerManager {
  constructor(ctx = {}) {
    this.ctx = ctx || {};
    this.state = {
      hiredUntil: 0,
      freeTrialClaimed: false,
      options: {
        autoCrops: true,
        autoFruitTrees: true,
        autoLivestock: true,
        autoWorkshops: true
      },
      stats: {
        cropsHarvested: 0,
        fruitHarvested: 0,
        animalsHarvested: 0,
        animalsFed: 0,
        workshopsHarvested: 0
      }
    };

    this.autoHarvestTimer = 0;
    this.autoHarvestIntervalSec = 3.0; // Quét mỗi 3 giây
    this.isModalOpen = false;
    this.wasHired = false;
    this.abortController = new AbortController();
  }

  init(savedData = null) {
    if (savedData && typeof savedData === "object") {
      this.state.hiredUntil = typeof savedData.hiredUntil === "number" ? savedData.hiredUntil : 0;
      this.state.freeTrialClaimed = !!savedData.freeTrialClaimed;
      if (savedData.options && typeof savedData.options === "object") {
        this.state.options = { ...this.state.options, ...savedData.options };
      }
      if (savedData.stats && typeof savedData.stats === "object") {
        this.state.stats = { ...this.state.stats, ...savedData.stats };
      }
    }

    try {
      const localHired = parseInt(localStorage.getItem("town_builder_caretaker_hired_until") || "0", 10);
      if (localHired > this.state.hiredUntil) {
        this.state.hiredUntil = localHired;
      }
      const localTrial = localStorage.getItem("town_builder_caretaker_trial_claimed");
      if (localTrial === "true") {
        this.state.freeTrialClaimed = true;
      }
    } catch (e) {}

    const { signal } = this.abortController;

    // Nút mở modal Quản Gia trên Action Deck
    const openBtn = document.getElementById("btn-open-caretaker");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        this.openModal();
      }, { signal });
    }

    // Modal close & dismiss
    const closeBtn = document.getElementById("caretaker-modal-close");
    const dismissBtn = document.getElementById("caretaker-modal-dismiss-btn");
    const backdrop = document.getElementById("town-caretaker-modal");

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
    return {
      hiredUntil: this.state.hiredUntil,
      freeTrialClaimed: this.state.freeTrialClaimed,
      options: { ...this.state.options },
      stats: { ...this.state.stats }
    };
  }

  isUnlocked() {
    const level = this.ctx.getPlayerLevel ? this.ctx.getPlayerLevel() : 1;
    return level >= CARETAKER_UNLOCK_LEVEL;
  }

  isHired() {
    return Date.now() < this.state.hiredUntil;
  }

  getTimeRemainingMs() {
    return Math.max(0, this.state.hiredUntil - Date.now());
  }

  claimFreeTrial() {
    if (this.state.freeTrialClaimed) return;
    this.state.freeTrialClaimed = true;
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (this.isHired()) {
      this.state.hiredUntil += oneDayMs;
    } else {
      this.state.hiredUntil = Date.now() + oneDayMs;
    }

    playQuestRewardSound();
    if (this.ctx.showToast) {
      this.ctx.showToast("🎉 Chào mừng Tổng Quản Gia Thomas! Ngài đã nhận 24 giờ phục vụ miễn phí.", "success");
    }

    try {
      localStorage.setItem("town_builder_caretaker_hired_until", this.state.hiredUntil.toString());
      localStorage.setItem("town_builder_caretaker_trial_claimed", "true");
    } catch (e) {}

    this.updateHUD();
    this.renderModal();
    if (this.ctx.persistGameState) this.ctx.persistGameState();
  }

  hirePackage(pkgId) {
    const pkg = CARETAKER_PACKAGES.find(p => p.id === pkgId);
    if (!pkg) return;

    const durationMs = pkg.days * 24 * 60 * 60 * 1000;

    if (pkg.type === "gold") {
      const curGold = this.ctx.getPlayerGold ? this.ctx.getPlayerGold() : 0;
      if (curGold < pkg.cost) {
        playErrorSound();
        if (this.ctx.showToast) {
          this.ctx.showToast(`⚠️ Không đủ Vàng! Cần ${pkg.cost.toLocaleString()} 🪙 để thuê gói này.`, "error");
        }
        return;
      }
      this.ctx.deductGold(pkg.cost);
    } else if (pkg.type === "gem") {
      const curGems = this.ctx.getPlayerGems ? this.ctx.getPlayerGems() : 0;
      if (curGems < pkg.cost) {
        playErrorSound();
        if (this.ctx.showToast) {
          this.ctx.showToast(`⚠️ Không đủ Ruby 💎! Cần ${pkg.cost} 💎 để thuê gói này.`, "error");
        }
        return;
      }
      this.ctx.deductGems(pkg.cost);
    }

    // Gia hạn tiếp nối nếu đang hoạt động, hoặc tính từ thời điểm hiện tại
    if (this.isHired()) {
      this.state.hiredUntil += durationMs;
    } else {
      this.state.hiredUntil = Date.now() + durationMs;
    }

    // Nếu người chơi chưa nhận ngày dùng thử mà thuê luôn gói này, tự động tặng kèm 24h miễn phí
    let bonusTrialNote = "";
    if (!this.state.freeTrialClaimed) {
      this.state.freeTrialClaimed = true;
      const oneDayMs = 24 * 60 * 60 * 1000;
      this.state.hiredUntil += oneDayMs;
      bonusTrialNote = " (+ Tặng thêm 24h dùng thử miễn phí)";
    }

    playCoinSound();
    playQuestRewardSound();
    if (this.ctx.showToast) {
      this.ctx.showToast(`🤝 Đã ký hợp đồng với Quản Gia Thomas (${pkg.label}${bonusTrialNote})! Bác ấy sẽ lo toàn bộ việc thu hoạch.`, "success");
    }

    try {
      localStorage.setItem("town_builder_caretaker_hired_until", this.state.hiredUntil.toString());
      localStorage.setItem("town_builder_caretaker_trial_claimed", "true");
    } catch (e) {}

    this.updateHUD();
    this.renderModal();
    if (this.ctx.persistGameState) this.ctx.persistGameState();
  }

  toggleOption(key) {
    if (key in this.state.options) {
      this.state.options[key] = !this.state.options[key];
      playUIClickSound();
      if (this.ctx.persistGameState) this.ctx.persistGameState();
      this.renderModal();
    }
  }

  runAutoHarvest() {
    if (!this.isHired() || !this.isUnlocked()) return;

    try {
      let crops = 0;
      let fruits = 0;
      let animals = 0;
      let fed = 0;
      let workshops = 0;

    // 1. Thu hoạch ruộng lúa nếu bật
    if (this.state.options.autoCrops && this.ctx.getFarmlandState && this.ctx.harvestCropCell) {
      const farmlandState = this.ctx.getFarmlandState();
      for (const pKey in farmlandState) {
        const parts = pKey.split('_');
        if (parts.length === 2) {
          const r = parseInt(parts[0], 10);
          const c = parseInt(parts[1], 10);
          if (this.ctx.harvestCropCell(r, c, true)) {
            crops++;
          }
        }
      }
    }

    // 2. Thu hoạch cây ăn quả nếu bật
    if (this.state.options.autoFruitTrees && this.ctx.getCurrentGrid && this.ctx.harvestFruitTreeCell) {
      const grid = this.ctx.getCurrentGrid();
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const tid = grid[r][c];
          if (FRUIT_TREES_CONFIG[tid]) {
            if (this.ctx.harvestFruitTreeCell(r, c, true)) {
              fruits++;
            }
          }
        }
      }
    }

    // 3. Chuồng trại: Thu hoạch sản phẩm & Tự động cho ăn nếu bật
    if (this.state.options.autoLivestock && this.ctx.getCurrentGrid) {
      const grid = this.ctx.getCurrentGrid();
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const tid = grid[r][c];
          if (tid === "b21_chicken_coop" || tid === "b22_cow_pasture" || tid === "b57_sheep_pasture") {
            // Thu hoạch nếu sẵn sàng
            if (this.ctx.harvestLivestockCell && this.ctx.harvestLivestockCell(r, c, true)) {
              animals++;
            }
            // Cho ăn nếu đàn đang đói
            if (this.ctx.feedLivestockCell && this.ctx.feedLivestockCell(r, c, true)) {
              fed++;
            }
          }
        }
      }
    }

    // 4. Xưởng thủ công & Quán trọ nếu bật
    if (this.state.options.autoWorkshops && this.ctx.getCurrentGrid && this.ctx.harvestProductionCell) {
      const grid = this.ctx.getCurrentGrid();
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const tid = grid[r][c];
          if (PRODUCTION_BUILDINGS[tid]) {
            if (this.ctx.harvestProductionCell(r, c, true)) {
              workshops++;
            }
          }
        }
      }
    }

    // Tích lũy số liệu thống kê
    if (crops > 0 || fruits > 0 || animals > 0 || fed > 0 || workshops > 0) {
      this.state.stats.cropsHarvested += crops;
      this.state.stats.fruitHarvested += fruits;
      this.state.stats.animalsHarvested += animals;
      this.state.stats.animalsFed += fed;
      this.state.stats.workshopsHarvested += workshops;

      playHarvestPlopSound();

      const summaryParts = [];
      if (crops > 0) summaryParts.push(`${crops} 🌾`);
      if (fruits > 0) summaryParts.push(`${fruits} 🍎`);
      if (animals > 0) summaryParts.push(`${animals} 🥚/🥛`);
      if (fed > 0) summaryParts.push(`cho ăn ${fed} đàn 🐄`);
      if (workshops > 0) summaryParts.push(`${workshops} 🍞/⚒️`);

      if (this.ctx.showToast) {
        this.ctx.showToast(`👨‍🌾 Quản gia Thomas: Thu hoạch ${summaryParts.join(", ")}`, "info");
      }

      if (this.ctx.persistGameState) this.ctx.persistGameState();
      if (this.isModalOpen) this.renderStatsOnly();
    }
  } catch (err) {
    console.error("[TownCaretaker] runAutoHarvest error:", err);
  }
}

  update(dt) {
    try {
      this.autoHarvestTimer += dt;
      if (this.autoHarvestTimer >= this.autoHarvestIntervalSec) {
        this.autoHarvestTimer = 0;
        this.runAutoHarvest();
      }

      // Cập nhật nhãn đếm ngược trên HUD và Modal (nếu đang mở)
      this.updateHUD();
      if (this.isModalOpen) {
        this.renderCountdownOnly();
      }
    } catch (err) {
      console.error("[TownCaretaker] update error:", err);
    }
  }

  formatDuration(ms, showSecsAlways = false) {
    if (ms <= 0) return "00:00:00";
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      if (showSecsAlways) {
        return `${days} ngày ${pad(remHours)}:${pad(mins)}:${pad(secs)}`;
      }
      return `${days} ngày ${remHours} giờ`;
    }
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }

  updateHUD() {
    const badgeEl = document.getElementById("caretaker-notify-badge");
    const openBtn = document.getElementById("btn-open-caretaker");
    if (!badgeEl || !openBtn) return;

    if (!this.isUnlocked()) {
      badgeEl.textContent = "Cấp 5";
      badgeEl.className = "caretaker-badge locked";
      openBtn.title = "🔒 Tổng Quản Gia Hoàng Gia (Mở khóa ở Cấp 5 - Thị Trưởng Năng Động)";
      return;
    }

    // 1. Ưu tiên cao nhất: Đang thuê -> Hiển thị thời gian đếm ngược trực tiếp trên Action Deck
    if (this.isHired()) {
      const remMs = this.getTimeRemainingMs();
      const totalSec = Math.floor(remMs / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      if (days >= 1) {
        badgeEl.textContent = `${days}N ${hours}H`;
      } else {
        badgeEl.textContent = this.formatDuration(remMs, false);
      }
      badgeEl.className = "caretaker-badge active";
      openBtn.title = `🟢 Tổng Quản Gia đang làm việc (Còn: ${this.formatDuration(remMs, true)})`;
      return;
    }

    // 2. Chưa nhận ngày dùng thử miễn phí
    if (!this.state.freeTrialClaimed) {
      badgeEl.textContent = "🎁 Thử 1N";
      badgeEl.className = "caretaker-badge trial-pulse";
      openBtn.title = "🎁 Tổng Quản Gia Hoàng Gia (Tặng 1 ngày dùng thử miễn phí!)";
      return;
    }

    // 3. Đã hết hạn hợp đồng
    badgeEl.textContent = "Thuê";
    badgeEl.className = "caretaker-badge expired";
    openBtn.title = "👨‍🌾 Tổng Quản Gia Hoàng Gia (Hợp đồng đã kết thúc - Bấm để gia hạn)";
  }

  openModal() {
    if (!this.isUnlocked()) {
      playErrorSound();
      if (this.ctx.showToast) {
        this.ctx.showToast("🔒 Tổng Quản Gia Hoàng Gia mở khóa khi đạt Cấp 5 (Thị Trưởng Năng Động)! Hãy làm thêm nhiệm vụ để thăng cấp nhé.", "info");
      }
      return;
    }

    playModalOpenSound();
    this.isModalOpen = true;
    const modal = document.getElementById("town-caretaker-modal");
    if (modal) {
      modal.classList.add("visible");
      modal.classList.add("open");
    }
    this.renderModal();
  }

  closeModal() {
    playModalCloseSound();
    this.isModalOpen = false;
    const modal = document.getElementById("town-caretaker-modal");
    if (modal) {
      modal.classList.remove("visible");
      modal.classList.remove("open");
    }
  }

  renderModal() {
    const statusWrap = document.getElementById("caretaker-status-wrap");
    const optionsWrap = document.getElementById("caretaker-options-wrap");
    const packagesWrap = document.getElementById("caretaker-packages-wrap");
    const statsWrap = document.getElementById("caretaker-stats-wrap");

    if (!statusWrap) return;

    const isHired = this.isHired();
    const remMs = this.getTimeRemainingMs();

    // 1. Khối Trạng Thái Hợp Đồng (Ưu tiên: Nếu đang thuê thì luôn hiện thẻ Đang Làm Việc & Đồng Hồ Đếm Ngược)
    if (isHired) {
      statusWrap.innerHTML = `
        <div class="caretaker-active-status-card">
          <div class="caretaker-status-pill active">
            <span class="status-dot"></span> ĐANG LÀM VIỆC TÍCH CỰC
          </div>
          <div class="caretaker-countdown-large" id="caretaker-modal-countdown">
            ⏳ Còn lại: ${this.formatDuration(remMs, true)}
          </div>
          <p class="caretaker-status-note">Bác Thomas đang liên tục quét ruộng đồng, cho gia súc ăn và thu hoạch xưởng chế biến.</p>
        </div>
      `;
    } else if (!this.state.freeTrialClaimed) {
      statusWrap.innerHTML = `
        <div class="caretaker-trial-banner">
          <div class="caretaker-trial-gift">🎁</div>
          <div class="caretaker-trial-info">
            <h3 class="caretaker-trial-title">Quà Chào Mừng Thị Trưởng Cấp 5!</h3>
            <p class="caretaker-trial-desc">Bác Thomas xin phục vụ trang trại của ngài <strong>miễn phí trọn vẹn trong 24 giờ đầu tiên</strong>.</p>
          </div>
          <button type="button" class="caretaker-trial-btn" id="btn-claim-caretaker-trial">
            ✨ Kích Hoạt 1 Ngày Miễn Phí
          </button>
        </div>
      `;
      const trialBtn = document.getElementById("btn-claim-caretaker-trial");
      if (trialBtn) {
        trialBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.claimFreeTrial();
        });
      }
    } else {
      statusWrap.innerHTML = `
        <div class="caretaker-expired-status-card">
          <div class="caretaker-status-pill expired">
            <span class="status-dot"></span> HỢP ĐỒNG ĐÃ HẾT HẠN
          </div>
          <div class="caretaker-countdown-large expired">
            Đang nghỉ ngơi tại Quán trọ
          </div>
          <p class="caretaker-status-note">Hãy chọn một gói thuê bên dưới bằng Vàng hoặc Ruby để Quản Gia tiếp tục chăm sóc vương quốc nhé!</p>
        </div>
      `;
    }

    // 2. Khối Cấu Hình Công Việc (4 Checkboxes)
    if (optionsWrap) {
      optionsWrap.innerHTML = `
        <div class="caretaker-section-title">🛠️ Công Việc Quản Gia Đảm Nhận</div>
        <div class="caretaker-options-grid">
          <label class="caretaker-option-item ${this.state.options.autoCrops ? 'active' : ''}">
            <input type="checkbox" id="opt-caretaker-crops" ${this.state.options.autoCrops ? 'checked' : ''} />
            <span class="opt-icon">🌾</span>
            <div class="opt-text">
              <span class="opt-title">Nông Sản Ruộng Đồng</span>
              <span class="opt-desc">Tự động gặt lúa mì, bắp ngô, rau củ chín vào kho Silo</span>
            </div>
          </label>

          <label class="caretaker-option-item ${this.state.options.autoFruitTrees ? 'active' : ''}">
            <input type="checkbox" id="opt-caretaker-trees" ${this.state.options.autoFruitTrees ? 'checked' : ''} />
            <span class="opt-icon">🍎</span>
            <div class="opt-text">
              <span class="opt-title">Cây Ăn Quả Thân Gỗ</span>
              <span class="opt-desc">Tự động rung cây táo đỏ, dừa xiêm, trái me vào kho Silo</span>
            </div>
          </label>

          <label class="caretaker-option-item ${this.state.options.autoLivestock ? 'active' : ''}">
            <input type="checkbox" id="opt-caretaker-livestock" ${this.state.options.autoLivestock ? 'checked' : ''} />
            <span class="opt-icon">🐑</span>
            <div class="opt-text">
              <span class="opt-title">Chuồng Trại & Tự Động Cho Ăn</span>
              <span class="opt-desc">Thu hoạch trứng, sữa, len VÀ tự nạp thức ăn cho chu kỳ mới</span>
            </div>
          </label>

          <label class="caretaker-option-item ${this.state.options.autoWorkshops ? 'active' : ''}">
            <input type="checkbox" id="opt-caretaker-workshops" ${this.state.options.autoWorkshops ? 'checked' : ''} />
            <span class="opt-icon">🍞</span>
            <div class="opt-text">
              <span class="opt-title">Xưởng Chế Tác & Quán Trọ</span>
              <span class="opt-desc">Thu hoạch bánh mì, bơ sữa, dụng cụ sắt, vải lụa, rượu vang</span>
            </div>
          </label>
        </div>
      `;

      // Gắn sự kiện thay đổi
      const chkCrops = document.getElementById("opt-caretaker-crops");
      const chkTrees = document.getElementById("opt-caretaker-trees");
      const chkLive = document.getElementById("opt-caretaker-livestock");
      const chkWork = document.getElementById("opt-caretaker-workshops");

      if (chkCrops) chkCrops.addEventListener("change", () => this.toggleOption("autoCrops"));
      if (chkTrees) chkTrees.addEventListener("change", () => this.toggleOption("autoFruitTrees"));
      if (chkLive) chkLive.addEventListener("change", () => this.toggleOption("autoLivestock"));
      if (chkWork) chkWork.addEventListener("change", () => this.toggleOption("autoWorkshops"));
    }

    // 3. Khối Các Gói Thuê / Gia Hạn Hợp Đồng
    if (packagesWrap) {
      packagesWrap.innerHTML = `
        <div class="caretaker-section-title">
          <span>📜 ${isHired ? 'Gia Hạn Hợp Đồng' : 'Ký Hợp Đồng Thuê Quản Gia'}</span>
          <span class="caretaker-sub-pill">Cộng dồn thời gian</span>
        </div>
        <div class="caretaker-packages-grid">
          ${CARETAKER_PACKAGES.map(pkg => `
            <div class="caretaker-package-card ${pkg.popular ? 'popular' : ''} ${pkg.type}">
              ${pkg.popular ? '<div class="popular-tag">PHỔ BIẾN</div>' : ''}
              <div class="pkg-duration">${pkg.label}</div>
              <div class="pkg-cost">${pkg.icon} ${pkg.cost.toLocaleString()} ${pkg.type === 'gold' ? 'Vàng' : 'Ruby'}</div>
              <button type="button" class="pkg-hire-btn ${pkg.type}" data-pkg-id="${pkg.id}">
                ${isHired ? '+ Gia Hạn' : 'Thuê Ngay'}
              </button>
            </div>
          `).join('')}
        </div>
      `;

      packagesWrap.querySelectorAll(".pkg-hire-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const pkgId = e.currentTarget.getAttribute("data-pkg-id");
          if (pkgId) this.hirePackage(pkgId);
        });
      });
    }

    // 4. Khối Thống Kê
    this.renderStatsOnly();
  }

  renderCountdownOnly() {
    const cdEl = document.getElementById("caretaker-modal-countdown");
    const hired = this.isHired();
    if (cdEl && hired) {
      cdEl.textContent = `⏳ Còn lại: ${this.formatDuration(this.getTimeRemainingMs(), true)}`;
    } else if (this.wasHired && !hired && this.isModalOpen) {
      this.wasHired = false;
      this.renderModal();
    }
    this.wasHired = hired;
  }

  renderStatsOnly() {
    const statsWrap = document.getElementById("caretaker-stats-wrap");
    if (!statsWrap) return;
    const s = this.state.stats;
    const totalHarvested = s.cropsHarvested + s.fruitHarvested + s.animalsHarvested + s.workshopsHarvested;

    statsWrap.innerHTML = `
      <div class="caretaker-section-title">📊 Thành Quả Quản Gia Đã Đạt Được</div>
      <div class="caretaker-stats-row">
        <div class="caretaker-stat-chip">
          <span class="chip-val">${totalHarvested.toLocaleString()}</span>
          <span class="chip-label">Tổng thu hoạch</span>
        </div>
        <div class="caretaker-stat-chip">
          <span class="chip-val">${s.cropsHarvested.toLocaleString()} 🌾</span>
          <span class="chip-label">Nông sản</span>
        </div>
        <div class="caretaker-stat-chip">
          <span class="chip-val">${s.animalsHarvested.toLocaleString()} 🥛</span>
          <span class="chip-label">Chuồng trại</span>
        </div>
        <div class="caretaker-stat-chip">
          <span class="chip-val">${s.animalsFed.toLocaleString()} 🐄</span>
          <span class="chip-label">Lượt cho ăn</span>
        </div>
        <div class="caretaker-stat-chip">
          <span class="chip-val">${s.workshopsHarvested.toLocaleString()} 🍞</span>
          <span class="chip-label">Thành phẩm xưởng</span>
        </div>
      </div>
    `;
  }

  destroy() {
    this.abortController.abort();
  }
}
