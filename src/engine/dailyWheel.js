/**
 * dailyWheel.js - Vòng Quay May Mắn Hoàng Gia 24 Giờ (Daily Lucky Wheel)
 * 
 * Vòng quay 8 ô trúng thưởng:
 * 1. 300 🪙 Vàng
 * 2. 5 💎 Ruby Hoàng Gia
 * 3. 800 🪙 Vàng
 * 4. 2 💎 Ruby May Mắn
 * 5. 15 💎 Ruby Đại Thắng
 * 6. 500 🪙 Vàng
 * 7. 2,000 🪙 Vàng Độc Đắc
 * 8. 10 💎 Ruby Tài Lộc
 */

const STORAGE_KEY_LAST_SPIN = "town_builder_wheel_last_free_spin";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 giờ

export const WHEEL_SLICES = [
  { index: 0, text: "300 🪙", type: "gold", amount: 300, color: "#f59e0b" },
  { index: 1, text: "5 💎", type: "ruby", amount: 5, color: "#ec4899" },
  { index: 2, text: "800 🪙", type: "gold", amount: 800, color: "#3b82f6" },
  { index: 3, text: "2 💎", type: "ruby", amount: 2, color: "#10b981" },
  { index: 4, text: "15 💎", type: "ruby", amount: 15, color: "#8b5cf6" },
  { index: 5, text: "500 🪙", type: "gold", amount: 500, color: "#06b6d4" },
  { index: 6, text: "2,000 🪙", type: "gold", amount: 2000, color: "#ef4444" },
  { index: 7, text: "10 💎", type: "ruby", amount: 10, color: "#f97316" }
];

export class DailyWheelManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.isSpinning = false;
    this.currentRotation = 0;
    this.countdownTimerId = null;
    this.spinTimerId = null;
    this.lastSpinTime = null;
  }

  init(savedState) {
    this.lastSpinTime = savedState?.lastSpinTime ?? localStorage.getItem(STORAGE_KEY_LAST_SPIN) ?? null;
    if (this.bound) { this.render(); return; }
    this.bound = true;
    this.abortController = new AbortController();
    this.bindEvents();
    this.drawWheelDisk();
    this.updateBadge();
  }

  updateHUD() {
    this.updateBadge();
  }

  getSaveState() {
    return {
      lastSpinTime: this.lastSpinTime
    };
  }

  bindEvents() {
    const openBtn = document.getElementById("btn-open-wheel");
    const closeBtn = document.getElementById("wheel-modal-close");
    const dismissBtn = document.getElementById("wheel-modal-dismiss-btn");
    const spinBtn = document.getElementById("wheel-spin-btn");

    if (openBtn) openBtn.addEventListener("click", () => this.openModal(), { signal: this.abortController.signal });
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeModal(), { signal: this.abortController.signal });
    if (dismissBtn) dismissBtn.addEventListener("click", () => this.closeModal(), { signal: this.abortController.signal });
    if (spinBtn) spinBtn.addEventListener("click", () => this.spin(), { signal: this.abortController.signal });
  }

  drawWheelDisk() {
    const canvas = document.getElementById("wheel-canvas-disk");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 8;
    const numSlices = WHEEL_SLICES.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    ctx.clearRect(0, 0, w, h);

    WHEEL_SLICES.forEach((slice, i) => {
      // Offset by -Math.PI / 2 - sliceAngle / 2 so that slice 0 is centered exactly at the top pointer (0 deg)
      const startAngle = i * sliceAngle - Math.PI / 2 - sliceAngle / 2;
      const endAngle = startAngle + sliceAngle;

      // Slice wedge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      // Divider line
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 4;
      ctx.fillText(slice.text, radius - 18, 0);
      ctx.restore();
    });

    // Outer golden decorative border
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  isFreeSpinAvailable() {
    try {
      const last = this.lastSpinTime;
      if (!last) return true;
      const lastTime = Number(last);
      if (!Number.isFinite(lastTime) || lastTime <= 0) return true;
      return (Date.now() - lastTime) >= COOLDOWN_MS;
    } catch (e) {
      return true;
    }
  }

  getRemainingCooldownMs() {
    try {
      const last = this.lastSpinTime;
      if (!last) return 0;
      const lastTime = parseInt(last, 10);
      const diff = COOLDOWN_MS - (Date.now() - lastTime);
      return Math.max(0, diff);
    } catch (e) {
      return 0;
    }
  }

  formatCooldown(ms) {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  openModal() {
    const modal = document.getElementById("wheel-modal");
    if (modal) {
      modal.classList.add("open");
      this.drawWheelDisk();
      this.render();
      this.startCountdownLoop();
    }
    if (this.ctx.playModalOpenSound) this.ctx.playModalOpenSound();
  }

  closeModal() {
    this.stopCountdownLoop();
    const modal = document.getElementById("wheel-modal");
    if (modal) {
      modal.classList.remove("open");
    }
    if (this.ctx.playModalCloseSound) this.ctx.playModalCloseSound();
  }

  startCountdownLoop() {
    this.stopCountdownLoop();
    this.countdownTimerId = setInterval(() => {
      this.updateStatusText();
    }, 1000);
  }

  stopCountdownLoop() {
    if (this.countdownTimerId) {
      clearInterval(this.countdownTimerId);
      this.countdownTimerId = null;
    }
  }

  updateStatusText() {
    const statusEl = document.getElementById("wheel-status-text");
    const spinBtn = document.getElementById("wheel-spin-btn");
    const isFree = this.isFreeSpinAvailable();

    if (isFree) {
      if (statusEl) statusEl.innerHTML = "✨ Lượt quay hôm nay: <strong style='color: #4ade80;'>MIỄN PHÍ!</strong>";
      if (spinBtn) {
        spinBtn.innerHTML = "🎯 QUAY MIỄN PHÍ NGAY!";
        spinBtn.className = "wheel-spin-action-btn free";
      }
    } else {
      const remaining = this.getRemainingCooldownMs();
      if (statusEl) statusEl.innerHTML = `⏳ Lượt miễn phí kế tiếp sau: <strong>${this.formatCooldown(remaining)}</strong>`;
      if (spinBtn) {
        spinBtn.innerHTML = "🎯 Quay Thêm (5 💎 Ruby)";
        spinBtn.className = "wheel-spin-action-btn paid";
      }
    }
  }

  render() {
    this.updateStatusText();
    this.updateBadge();
  }

  updateBadge() {
    const badge = document.getElementById("wheel-notify-badge");
    if (badge) {
      if (this.isFreeSpinAvailable()) {
        badge.classList.remove("hidden");
        badge.textContent = "FREE";
      } else {
        badge.classList.add("hidden");
      }
    }
  }

  destroy() {
    this.stopCountdownLoop();
    clearTimeout(this.spinTimerId);
    this.abortController?.abort();
  }

  spin() {
    if (this.isSpinning) return;

    const isFree = this.isFreeSpinAvailable();
    if (!isFree) {
      const gems = this.ctx.getPlayerGems ? this.ctx.getPlayerGems() : 0;
      if (gems < 5) {
        if (this.ctx.showToast) {
          this.ctx.showToast("⚠️ Bạn cần 5 💎 Ruby để quay thêm lượt này!", "error");
        }
        return;
      }

    }


    const winningIndex = Math.floor(Math.random() * WHEEL_SLICES.length);
    const winningSlice = WHEEL_SLICES[winningIndex];
    const previousSpinTime = this.lastSpinTime;
    if (isFree) this.lastSpinTime = String(Date.now());
    // Chi phí, thưởng và cooldown cùng một snapshot. Animation chỉ trình diễn kết quả.
    if (!this.ctx.commitSpin?.(winningSlice, isFree ? 0 : 5)) {
      this.lastSpinTime = previousSpinTime;
      this.ctx.showToast?.('Không lưu được lượt quay. Chưa trừ Ruby.', 'error');
      return;
    }
    this.isSpinning = true;
    const spinBtn = document.getElementById('wheel-spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    // Tính góc xoay: mỗi ô 45 độ, xoay ít nhất 5-8 vòng (1800 - 2880 độ)
    const sliceAngle = 360 / WHEEL_SLICES.length;
    // Kim chỉ ở đỉnh (top: 0 độ / 360 độ). Góc dừng để kim trúng ô winningIndex:
    const targetSliceCenter = 360 - (winningIndex * sliceAngle + sliceAngle / 2);
    const fullSpins = 360 * (5 + Math.floor(Math.random() * 3));
    const finalAngle = this.currentRotation + fullSpins + (targetSliceCenter - (this.currentRotation % 360));
    this.currentRotation = finalAngle;

    const wheelDisk = document.getElementById("wheel-canvas-disk");
    if (wheelDisk) {
      wheelDisk.style.transition = "transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1)";
      wheelDisk.style.transform = `rotate(${finalAngle}deg)`;
    }

    if (this.ctx.playCoinSound) this.ctx.playCoinSound();

    this.spinTimerId = setTimeout(() => {
      this.isSpinning = false;
      if (spinBtn) spinBtn.disabled = false;

      if (this.ctx.playQuestRewardSound) this.ctx.playQuestRewardSound();
      if (this.ctx.showToast) {
        this.ctx.showToast(`🎉 CHÚC MỪNG! Bạn đã quay trúng: ${winningSlice.text}!`, "success");
      }

      this.render();
      if (this.ctx.persistGameState) this.ctx.persistGameState();
    }, 4600);
  }
}
