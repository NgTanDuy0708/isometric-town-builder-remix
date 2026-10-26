/**
 * townEvents.js - Hệ Thống Sự Kiện Ngẫu Nhiên Vương Quốc (Town Events System)
 * 
 * Quản lý các sự kiện lễ hội và biến cố ngẫu nhiên:
 * - 🎪 Hội Chợ Làng (Village Fair): Tăng +50% giá bán tại Chợ Nông Sản (Gold x1.5)
 * - 🐫 Thương Đoàn Phương Xa (Traveling Caravan): Tặng quà chào mừng +80🪙, tăng +20% giá bán và +25% XP khi thu hoạch
 * - 🌾 Ngày Hội Mùa Vàng (Golden Harvest Day): Nhân đôi sản lượng nông sản (x2 Sản lượng) và nhân đôi kinh nghiệm (x2 XP)
 * 
 * Tích hợp:
 * - Hiệu ứng banner chúc mừng lễ hội trượt từ trên xuống (Celebratory Announcement Banner)
 * - Thẻ đếm ngược thời gian trực quan trên Right HUD Panel
 * - Popup chi tiết sự kiện khi nhấp vào thẻ HUD (Detail Modal)
 * - Lời thoại dân làng đặc biệt theo từng sự kiện
 * - Chu kỳ tự động xuất hiện mỗi 4 - 6 phút
 * - Tùy chọn kích hoạt thủ công trong Cài Đặt (Settings ⚙️) để kiểm thử
 * - Lưu và khôi phục sự kiện theo thời điểm kết thúc tuyệt đối (endsAt timestamp)
 */

export const TOWN_EVENTS_CONFIG = {
  village_fair: {
    id: "village_fair",
    name: "Hội Chợ Làng",
    icon: "🎪",
    title: "🎪 Hội Chợ Làng Phồn Vinh!",
    description: "Thương nhân tụ hội náo nhiệt! Giá bán nông sản & hàng hóa tại Chợ tăng +50%.",
    buffText: "+50% Giá Bán Chợ 🪙",
    buffDetails: [
      "Tăng +50% Vàng nhận được khi bán nông sản & hàng hóa tại Chợ Nông Sản"
    ],
    durationSec: 120,
    themeColor: "#f59e0b",
    badgeGradient: "linear-gradient(135deg, #d97706, #b45309)",
    multipliers: {
      marketGold: 1.5,
      xp: 1.0,
      cropYield: 1
    },
    dialogues: [
      "🎪 Hội chợ làng vui quá, tiếng kèn tiếng trống rộn rã khắp ngõ!",
      "🎪 Giá nông sản tại Chợ hôm nay tăng 50%, bà con rủ nhau đi bán rôm rả!",
      "🎪 Hội chợ đông vui thế này mong tuần nào vương quốc cũng tổ chức!"
    ]
  },
  traveling_caravan: {
    id: "traveling_caravan",
    name: "Thương Đoàn Phương Xa",
    icon: "🐫",
    title: "🐫 Thương Đoàn Phương Xa Ghé Thăm!",
    description: "Đoàn thương gia viễn xứ cập bến! Tặng quà chào mừng +80🪙, tăng +20% giá bán tại Chợ và +25% XP khi thu hoạch.",
    buffText: "+80🪙 • +20% Chợ • +25% XP ⭐",
    buffDetails: [
      "Tặng ngay +80🪙 Vàng hoàng gia chào mừng",
      "Tăng +20% Vàng nhận được khi bán hàng tại Chợ Nông Sản",
      "Tăng +25% điểm kinh nghiệm khi thu hoạch nông sản, sản phẩm chuồng trại & cây ăn quả"
    ],
    durationSec: 120,
    themeColor: "#8b5cf6",
    badgeGradient: "linear-gradient(135deg, #6366f1, #4338ca)",
    multipliers: {
      marketGold: 1.2,
      xp: 1.25,
      cropYield: 1
    },
    instantGoldGift: 80,
    dialogues: [
      "🐫 Thương đoàn phương xa mang tới bao nhiêu gấm vóc và hương liệu lạ!",
      "🐫 Thương nhân viễn xứ mua sắm rất hào phóng, bà con tranh thủ xuất kho bán hàng nào!",
      "🐫 Những chú lạc đà thồ hàng trông ngộ nghĩnh và hiền lành thật đấy!"
    ]
  },
  golden_harvest: {
    id: "golden_harvest",
    name: "Ngày Hội Mùa Vàng",
    icon: "🌾",
    title: "🌾 Ngày Hội Mùa Vàng Bội Thu!",
    description: "Thần Nông ban phúc lành! Nhân đôi sản lượng nông sản thu hoạch (gấp đôi sản lượng) và nhân đôi kinh nghiệm (gấp đôi XP)!",
    buffText: "x2 Thu Hoạch & x2 XP ⭐",
    buffDetails: [
      "Nhân đôi sản lượng thu hoạch nông sản (gấp đôi sản lượng)",
      "Nhân đôi điểm kinh nghiệm khi thu hoạch mùa màng (gấp đôi kinh nghiệm)"
    ],
    durationSec: 90,
    themeColor: "#10b981",
    badgeGradient: "linear-gradient(135deg, #16a34a, #15803d)",
    multipliers: {
      marketGold: 1.0,
      xp: 2.0,
      cropYield: 2
    },
    dialogues: [
      "🌾 Hôm nay là Ngày Hội Mùa Vàng, gặt một vụ được nhân đôi lúa mì mẩy hạt!",
      "✨ Cánh đồng rực rỡ lấp lánh ánh kim, đi gặt lúa mà kinh nghiệm tăng vù vù!",
      "🌾 Vựa thóc đầy ắp, năm nay vương quốc ta no ấm thịnh vượng rồi!"
    ]
  }
};

const MIN_INTERVAL_MS = 240 * 1000; // 4 phút
const MAX_INTERVAL_MS = 360 * 1000; // 6 phút

/**
 * Khởi tạo Town Events Manager
 * @param {Object} ctx - Ngữ cảnh engine
 */
export function createTownEventsManager(ctx) {
  let activeEvent = null;
  let eventTimerId = null;
  let scheduleTimerId = null;
  let bannerElement = null;
  let isDetailModalOpen = false;

  /**
   * Tạo phần tử DOM cho Celebration Banner nếu chưa có
   */
  function ensureDOM() {
    if (!document.getElementById("town-event-banner")) {
      bannerElement = document.createElement("div");
      bannerElement.id = "town-event-banner";
      bannerElement.className = "town-event-banner";
      document.body.appendChild(bannerElement);
    } else {
      bannerElement = document.getElementById("town-event-banner");
    }
  }

  /**
   * Định dạng số giây thành chuỗi mm:ss
   * @param {number} totalSec
   * @returns {string}
   */
  function formatTime(totalSec) {
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * Cập nhật nội dung hiển thị trong Detail Modal (Popup chi tiết sự kiện)
   */
  function updateDetailModal() {
    const modal = document.getElementById("town-event-detail-modal");
    if (!modal) return;

    if (!activeEvent) {
      closeDetailModal();
      return;
    }

    const iconEl = document.getElementById("event-detail-icon");
    const titleEl = document.getElementById("event-detail-title");
    const descEl = document.getElementById("event-detail-desc");
    const buffListEl = document.getElementById("event-detail-buff-list");
    const timerEl = document.getElementById("event-detail-timer");
    const cardEl = document.getElementById("event-detail-card");

    const remainingSec = Math.max(0, Math.ceil((activeEvent.endsAt - Date.now()) / 1000));

    if (iconEl) iconEl.textContent = activeEvent.config.icon;
    if (titleEl) titleEl.textContent = activeEvent.config.name;
    if (descEl) descEl.textContent = activeEvent.config.description;
    if (timerEl) timerEl.textContent = formatTime(remainingSec);

    if (cardEl && activeEvent.config.themeColor) {
      cardEl.style.borderColor = activeEvent.config.themeColor;
    }

    if (buffListEl && activeEvent.config.buffDetails) {
      buffListEl.innerHTML = activeEvent.config.buffDetails
        .map(b => `<div class="event-detail-buff-item"><span class="buff-check">⚡</span> <span>${b}</span></div>`)
        .join("");
    }
  }

  /**
   * Mở Modal chi tiết sự kiện
   */
  function openDetailModal() {
    if (!activeEvent) return;
    const modal = document.getElementById("town-event-detail-modal");
    if (!modal) return;

    updateDetailModal();
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    isDetailModalOpen = true;
  }

  /**
   * Đóng Modal chi tiết sự kiện
   */
  function closeDetailModal() {
    const modal = document.getElementById("town-event-detail-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.style.display = "none";
    }
    isDetailModalOpen = false;
  }

  /**
   * Cập nhật hiển thị HUD card và thời gian đếm ngược
   */
  function updateHUD() {
    const card = document.getElementById("hud-town-event-card");
    if (!card) return;

    if (!activeEvent) {
      card.classList.add("hidden");
      card.style.display = "none";
      if (isDetailModalOpen) {
        closeDetailModal();
      }
      return;
    }

    const remainingSec = Math.max(0, Math.ceil((activeEvent.endsAt - Date.now()) / 1000));
    if (remainingSec <= 0) {
      stopEvent(true);
      return;
    }

    card.classList.remove("hidden");
    card.style.display = "flex";

    const iconEl = document.getElementById("hud-event-icon");
    const nameEl = document.getElementById("hud-event-name");
    const timerEl = document.getElementById("hud-event-timer");
    const buffEl = document.getElementById("hud-event-buff");

    if (iconEl) iconEl.textContent = activeEvent.config.icon;
    if (nameEl) {
      nameEl.textContent = activeEvent.config.name;
      nameEl.title = activeEvent.config.name;
    }
    if (timerEl) timerEl.textContent = formatTime(remainingSec);
    if (buffEl) {
      buffEl.textContent = activeEvent.config.buffText;
      buffEl.title = activeEvent.config.buffText;
    }

    card.style.background = activeEvent.config.badgeGradient;

    if (isDetailModalOpen) {
      updateDetailModal();
    }
  }

  /**
   * Gắn các event listeners cho tương tác UI (Widget Click, Modal Close)
   */
  function setupUIListeners() {
    const card = document.getElementById("hud-town-event-card");
    if (card) {
      card.addEventListener("click", () => {
        openDetailModal();
      });
    }

    const closeBtn = document.getElementById("event-detail-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        closeDetailModal();
      });
    }

    const modal = document.getElementById("town-event-detail-modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeDetailModal();
        }
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isDetailModalOpen) {
        closeDetailModal();
      }
    });
  }

  /**
   * Hiển thị Banner chúc mừng rực rỡ từ trên đỉnh màn hình
   * @param {Object} evtConfig
   */
  function showCelebrationBanner(evtConfig) {
    ensureDOM();
    if (!bannerElement) return;

    bannerElement.innerHTML = `
      <div class="town-event-banner-card" style="border-color: ${evtConfig.themeColor};">
        <div class="town-event-banner-icon">${evtConfig.icon}</div>
        <div class="town-event-banner-content">
          <div class="town-event-banner-title" style="color: ${evtConfig.themeColor};">${evtConfig.title}</div>
          <div class="town-event-banner-desc">${evtConfig.description}</div>
          <div class="town-event-banner-badge" style="background: ${evtConfig.badgeGradient};">
            ⚡ Hiệu lực: ${evtConfig.buffText} (${evtConfig.durationSec}s)
          </div>
        </div>
        <button type="button" class="town-event-banner-close" id="town-event-banner-close" aria-label="Đóng thông báo">&times;</button>
      </div>
    `;

    bannerElement.classList.add("show");

    const closeBtn = bannerElement.querySelector("#town-event-banner-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        bannerElement.classList.remove("show");
      });
    }

    // Tự động thu gọn banner sau 6.5 giây
    setTimeout(() => {
      if (bannerElement) bannerElement.classList.remove("show");
    }, 6500);
  }

  /**
   * Bắt đầu vòng lặp timer đếm ngược
   */
  function startEventTimer() {
    if (eventTimerId) clearInterval(eventTimerId);
    eventTimerId = setInterval(() => {
      if (!activeEvent) {
        clearInterval(eventTimerId);
        eventTimerId = null;
        return;
      }

      const timeLeft = activeEvent.endsAt - Date.now();
      if (timeLeft <= 0) {
        stopEvent(true);
      } else {
        updateHUD();
      }
    }, 1000);
  }

  /**
   * Kích hoạt một sự kiện ngẫu nhiên hoặc chỉ định.
   * Quy tắc: THAY THẾ (Override & Switch) - nếu đang có sự kiện cũ, dừng sự kiện cũ
   * và kích hoạt sự kiện mới ngay lập tức kèm thông báo toast giải thích rõ ràng.
   * @param {string} [eventId] - 'village_fair' | 'traveling_caravan' | 'golden_harvest'
   */
  function triggerEvent(eventId) {
    const hadActiveEvent = !!activeEvent;
    const oldEventName = activeEvent ? activeEvent.config.name : null;

    // Dừng sự kiện cũ (không hiện toast kết thúc của sự kiện cũ)
    if (activeEvent) {
      stopEvent(false);
    }

    if (scheduleTimerId) {
      clearTimeout(scheduleTimerId);
      scheduleTimerId = null;
    }

    const availableKeys = Object.keys(TOWN_EVENTS_CONFIG);
    const chosenKey = eventId && TOWN_EVENTS_CONFIG[eventId] 
      ? eventId 
      : availableKeys[Math.floor(Math.random() * availableKeys.length)];

    const config = TOWN_EVENTS_CONFIG[chosenKey];
    const durationMs = config.durationSec * 1000;
    const now = Date.now();

    activeEvent = {
      id: config.id,
      config,
      startTime: now,
      endsAt: now + durationMs
    };

    ensureDOM();
    showCelebrationBanner(config);
    updateHUD();
    startEventTimer();

    // Phát âm thanh chúc mừng
    if (ctx.playQuestRewardSound) {
      ctx.playQuestRewardSound();
    }

    // Thông báo Toast chuyển sự kiện hoặc bắt đầu mới
    if (hadActiveEvent && oldEventName) {
      if (ctx.showToast) {
        ctx.showToast(`🔄 Chuyển sang sự kiện mới: ${config.name} (kết thúc ${oldEventName})`, "info");
      }
    } else {
      if (ctx.showToast) {
        ctx.showToast(`🎉 Bắt đầu sự kiện: ${config.title}`, "success");
      }
    }

    // Nếu sự kiện có quà tặng chào mừng (Thương đoàn phương xa +80 vàng)
    if (config.instantGoldGift && ctx.addPlayerGold) {
      ctx.addPlayerGold(config.instantGoldGift);
      if (ctx.spawnFlyingCoin) {
        ctx.spawnFlyingCoin(16, 16, 6);
      }
      if (ctx.showToast) {
        ctx.showToast(`🎁 Thương đoàn tặng vương quốc +${config.instantGoldGift} 🪙 Vàng chào mừng!`, "success");
      }
    }

    // Lưu trạng thái tiến trình
    if (ctx.onEventStateChanged) {
      ctx.onEventStateChanged();
    }

    if (ctx.requestRender) {
      ctx.requestRender();
    }
  }

  /**
   * Kết thúc sự kiện hiện tại
   * @param {boolean} [showEndToast=true]
   */
  function stopEvent(showEndToast = true) {
    if (eventTimerId) {
      clearInterval(eventTimerId);
      eventTimerId = null;
    }

    const endedEvent = activeEvent;
    activeEvent = null;

    closeDetailModal();
    updateHUD();

    if (bannerElement) {
      bannerElement.classList.remove("show");
    }

    // Yêu cầu Lỗi 1: Toast ngắn "Sự kiện đã kết thúc: <tên>"
    if (endedEvent && showEndToast && ctx.showToast) {
      ctx.showToast(`Sự kiện đã kết thúc: ${endedEvent.config.name}`, "info");
    }

    // Lưu trạng thái tiến trình sau khi kết thúc
    if (ctx.onEventStateChanged) {
      ctx.onEventStateChanged();
    }

    if (ctx.requestRender) {
      ctx.requestRender();
    }

    // Lên lịch cho sự kiện tiếp theo sau 4 - 6 phút
    scheduleNextEvent();
  }

  /**
   * Lên lịch kích hoạt ngẫu nhiên sự kiện tiếp theo
   */
  function scheduleNextEvent() {
    if (scheduleTimerId) clearTimeout(scheduleTimerId);
    const delay = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
    scheduleTimerId = setTimeout(() => {
      triggerEvent();
    }, delay);
  }

  /**
   * Cập nhật mỗi frame từ game loop (xử lý tức thời khi hết giờ)
   */
  function update() {
    if (activeEvent && Date.now() >= activeEvent.endsAt) {
      stopEvent(true);
    }
  }

  /**
   * Lấy dữ liệu sự kiện để lưu vào save file
   * @returns {Object|null}
   */
  function getSaveState() {
    if (!activeEvent || typeof activeEvent.endsAt !== "number" || activeEvent.endsAt <= Date.now()) {
      return null;
    }
    return {
      id: activeEvent.id,
      endsAt: activeEvent.endsAt,
      startTime: activeEvent.startTime
    };
  }

  /**
   * Khôi phục sự kiện từ save file
   * @param {Object|null} saved
   */
  function restoreFromSave(saved) {
    if (!saved || typeof saved.endsAt !== "number" || !saved.id || !TOWN_EVENTS_CONFIG[saved.id]) {
      stopEvent(false);
      return;
    }

    const now = Date.now();
    if (saved.endsAt <= now) {
      // Đã hết thời hạn khi tải lại trang, bỏ qua sự kiện
      stopEvent(false);
      return;
    }

    if (scheduleTimerId) {
      clearTimeout(scheduleTimerId);
      scheduleTimerId = null;
    }

    const config = TOWN_EVENTS_CONFIG[saved.id];
    activeEvent = {
      id: config.id,
      config,
      startTime: typeof saved.startTime === "number" ? saved.startTime : now,
      endsAt: saved.endsAt
    };

    ensureDOM();
    updateHUD();
    startEventTimer();

    if (ctx.requestRender) {
      ctx.requestRender();
    }
  }

  // Khởi tạo các event listeners UI
  setupUIListeners();

  // Khởi tạo trạng thái ban đầu: ẩn thẻ widget nếu chưa có sự kiện
  updateHUD();

  // Khởi động lịch trình sự kiện ngẫu nhiên đầu tiên sau 3.5 phút
  scheduleTimerId = setTimeout(() => {
    triggerEvent();
  }, 210 * 1000);

  return {
    triggerEvent,
    stopEvent,
    update,
    getSaveState,
    restoreFromSave,
    openDetailModal,
    closeDetailModal,
    getActiveEvent: () => activeEvent,
    getGoldMultiplier: () => (activeEvent ? (activeEvent.config.multipliers.marketGold || 1.0) : 1.0),
    getMarketGoldMultiplier: () => (activeEvent ? activeEvent.config.multipliers.marketGold : 1.0),
    getCropYieldMultiplier: () => (activeEvent ? activeEvent.config.multipliers.cropYield : 1),
    getXpMultiplier: () => (activeEvent ? activeEvent.config.multipliers.xp : 1.0),
    getRandomDialogue: () => {
      if (!activeEvent || !activeEvent.config.dialogues) return null;
      const list = activeEvent.config.dialogues;
      return list[Math.floor(Math.random() * list.length)];
    },
    destroy: () => {
      if (eventTimerId) clearInterval(eventTimerId);
      if (scheduleTimerId) clearTimeout(scheduleTimerId);
      if (bannerElement && bannerElement.parentNode) {
        bannerElement.parentNode.removeChild(bannerElement);
      }
    }
  };
}
