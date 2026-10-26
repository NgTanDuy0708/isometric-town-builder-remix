/**
 * fishingMinigame.js - Bến Câu Cá Hoàng Gia (Fishing Spot Minigame)
 * 
 * Tính năng thư giãn tương tác:
 * - Thả cần câu xuống làn nước biếc
 * - Canh nhịp giật cần (Timing Bar Slider) khi cá cắn câu
 * - Bắt các loại thủy hải sản: Cá Hồi Hoàng Gia 🐟, Tôm Hùm Khổng Lồ 🦞, Cá Ngừ 🍣, Rương Kho Báu Đáy Biển 👑
 */

export const FISH_TYPES = [
  { id: "salmon", name: "Cá Hồi Hoàng Gia", icon: "🐟", price: 45, xp: 20, rarity: "common" },
  { id: "lobster", name: "Tôm Hùm Khổng Lồ", icon: "🦞", price: 80, xp: 35, rarity: "uncommon" },
  { id: "tuna", name: "Cá Ngừ Đại Dương", icon: "🍣", price: 120, xp: 50, rarity: "rare" },
  { id: "treasure", name: "Rương Báu Đáy Biển", icon: "👑", price: 300, ruby: 3, xp: 100, rarity: "legendary" }
];

export class FishingManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.state = "idle"; // "idle" | "waiting_bite" | "hooking" | "result"
    this.sliderPos = 0;   // 0 -> 100
    this.sliderDir = 1;
    this.sliderSpeed = 160; // tốc độ di chuyển thanh đo
    this.biteTimer = 0;
    this.animFrameId = null;
    this.lastCaughtFish = null;
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    const openBtn = document.getElementById("btn-open-fishing");
    const closeBtn = document.getElementById("fishing-modal-close");
    const dismissBtn = document.getElementById("fishing-modal-dismiss-btn");
    const castBtn = document.getElementById("fishing-cast-btn");
    const hookBtn = document.getElementById("fishing-hook-btn");

    if (openBtn) openBtn.addEventListener("click", () => this.openModal());
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeModal());
    if (dismissBtn) dismissBtn.addEventListener("click", () => this.closeModal());
    if (castBtn) castBtn.addEventListener("click", () => this.startCast());
    if (hookBtn) hookBtn.addEventListener("click", () => this.hook());
  }

  openModal() {
    this.state = "idle";
    this.lastCaughtFish = null;
    const modal = document.getElementById("fishing-modal");
    if (modal) {
      modal.classList.add("open");
      this.render();
    }
    if (this.ctx.playModalOpenSound) this.ctx.playModalOpenSound();
  }

  closeModal() {
    this.state = "idle";
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    const modal = document.getElementById("fishing-modal");
    if (modal) {
      modal.classList.remove("open");
    }
    if (this.ctx.playModalCloseSound) this.ctx.playModalCloseSound();
  }

  startCast() {
    if (this.state !== "idle" && this.state !== "result") return;
    this.state = "waiting_bite";
    this.lastCaughtFish = null;
    this.biteTimer = 1.5 + Math.random() * 2.5; // 1.5s đến 4s thì cá cắn câu
    this.render();

    let lastT = performance.now();
    const waitLoop = () => {
      if (this.state !== "waiting_bite") return;
      const now = performance.now();
      const dt = (now - lastT) / 1000;
      lastT = now;
      this.biteTimer -= dt;

      if (this.biteTimer <= 0) {
        // CÁ CẮN CÂU! Chuyển sang giật cần
        this.triggerBite();
        return;
      }
      this.animFrameId = requestAnimationFrame(waitLoop);
    };
    this.animFrameId = requestAnimationFrame(waitLoop);
  }

  triggerBite() {
    this.state = "hooking";
    this.sliderPos = 0;
    this.sliderDir = 1;
    if (this.ctx.playCoinSound) this.ctx.playCoinSound();
    this.render();

    let lastT = performance.now();
    const sliderLoop = () => {
      if (this.state !== "hooking") return;
      const now = performance.now();
      const dt = (now - lastT) / 1000;
      lastT = now;

      this.sliderPos += this.sliderSpeed * dt * this.sliderDir;
      if (this.sliderPos >= 100) {
        this.sliderPos = 100;
        this.sliderDir = -1;
      } else if (this.sliderPos <= 0) {
        this.sliderPos = 0;
        this.sliderDir = 1;
      }

      this.updateSliderUI();
      this.animFrameId = requestAnimationFrame(sliderLoop);
    };
    this.animFrameId = requestAnimationFrame(sliderLoop);
  }

  hook() {
    if (this.state !== "hooking") return;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    // Vùng trúng cá:
    // 35% -> 65%: Vùng Xanh (Trúng cá thường / tôm)
    // 45% -> 55%: Vùng Vàng Kim (Perfect Hook -> Cá ngừ / Rương báu)
    const pos = this.sliderPos;
    let caught = null;

    if (pos >= 45 && pos <= 55) {
      // Perfect Hook!
      caught = Math.random() < 0.4 ? FISH_TYPES[3] : FISH_TYPES[2]; // Rương báu hoặc Cá Ngừ
    } else if (pos >= 35 && pos <= 65) {
      // Good Hook
      caught = Math.random() < 0.5 ? FISH_TYPES[1] : FISH_TYPES[0]; // Tôm hùm hoặc Cá Hồi
    } else {
      // Missed
      caught = null;
    }

    this.state = "result";
    this.lastCaughtFish = caught;

    if (caught) {
      if (this.ctx.playQuestRewardSound) this.ctx.playQuestRewardSound();
      if (this.ctx.addPlayerGold) this.ctx.addPlayerGold(caught.price);
      if (caught.ruby && this.ctx.addPlayerGems) this.ctx.addPlayerGems(caught.ruby);
      if (this.ctx.addPlayerXP) this.ctx.addPlayerXP(caught.xp, `Câu được ${caught.name}`);
      if (this.ctx.showToast) {
        this.ctx.showToast(`🎣 CÂU THÀNH CÔNG: ${caught.icon} ${caught.name}! +${caught.price}🪙${caught.ruby ? ' +' + caught.ruby + '💎' : ''}`, "success");
      }
    } else {
      if (this.ctx.playErrorSound) this.ctx.playErrorSound();
      if (this.ctx.showToast) {
        this.ctx.showToast("💦 Cá tuột mất rồi! Hãy canh chuẩn thanh đo vào vùng Xanh/Vàng nhé!", "info");
      }
    }

    this.render();
  }

  updateSliderUI() {
    const thumb = document.getElementById("fishing-slider-thumb");
    if (thumb) {
      thumb.style.left = `${this.sliderPos}%`;
    }
  }

  render() {
    const pondStatusEl = document.getElementById("fishing-pond-status");
    const castBtn = document.getElementById("fishing-cast-btn");
    const hookBtn = document.getElementById("fishing-hook-btn");
    const sliderContainer = document.getElementById("fishing-slider-bar-container");
    const resultBox = document.getElementById("fishing-result-box");

    if (this.state === "idle") {
      if (pondStatusEl) pondStatusEl.innerHTML = "🌊 Làn nước xanh mát dập dềnh sóng biếc. Sẵn sàng buông cần câu!";
      if (castBtn) { castBtn.style.display = "inline-flex"; castBtn.textContent = "🎣 Thả Cần Câu"; }
      if (hookBtn) hookBtn.style.display = "none";
      if (sliderContainer) sliderContainer.style.display = "none";
      if (resultBox) resultBox.style.display = "none";
    } else if (this.state === "waiting_bite") {
      if (pondStatusEl) pondStatusEl.innerHTML = "⏳ Phao câu đang trôi... Chờ cá đớp mồi...";
      if (castBtn) { castBtn.style.display = "none"; }
      if (hookBtn) hookBtn.style.display = "none";
      if (sliderContainer) sliderContainer.style.display = "none";
      if (resultBox) resultBox.style.display = "none";
    } else if (this.state === "hooking") {
      if (pondStatusEl) pondStatusEl.innerHTML = "💥 CÁ CẮN CÂU RỒI! GIẬT CẦN NGAY ĐÚNG VÙNG XANH/VÀNG!";
      if (castBtn) castBtn.style.display = "none";
      if (hookBtn) { hookBtn.style.display = "inline-flex"; }
      if (sliderContainer) sliderContainer.style.display = "block";
      if (resultBox) resultBox.style.display = "none";
    } else if (this.state === "result") {
      if (sliderContainer) sliderContainer.style.display = "none";
      if (hookBtn) hookBtn.style.display = "none";
      if (castBtn) { castBtn.style.display = "inline-flex"; castBtn.textContent = "🎣 Tiếp Tục Câu Cá"; }

      if (resultBox) {
        resultBox.style.display = "flex";
        if (this.lastCaughtFish) {
          const f = this.lastCaughtFish;
          resultBox.className = "fishing-result-box success";
          resultBox.innerHTML = `
            <div class="fishing-result-icon">${f.icon}</div>
            <div class="fishing-result-info">
              <div class="fishing-result-name">${f.name}</div>
              <div class="fishing-result-reward">+${f.price} 🪙 Vàng ${f.ruby ? `+${f.ruby} 💎 Ruby` : ''} | +${f.xp} ⭐ XP</div>
            </div>
          `;
        } else {
          resultBox.className = "fishing-result-box fail";
          resultBox.innerHTML = `
            <div class="fishing-result-icon">💦</div>
            <div class="fishing-result-info">
              <div class="fishing-result-name">Cá đã chạy mất!</div>
              <div class="fishing-result-reward">Thử lại một lần nữa nhé!</div>
            </div>
          `;
        }
      }
    }
  }
}
