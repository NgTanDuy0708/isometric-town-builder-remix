/**
 * tutorialManager.js - Module Hướng Dẫn Người Chơi Mới (Step-by-Step Onboarding)
 * 
 * Hệ thống hướng dẫn nhập vai thân thiện cho 5 phút đầu chơi game:
 * - Cụ Trưởng Làng Eldrin đồng hành chỉ dẫn từng bước
 * - 5 bước nhập môn cốt lõi:
 *   1. Khai hoang luống đất trồng (Cửa Hàng -> Nông Trại & Đất)
 *   2. Gieo hạt giống Lúa Mì đầu tiên (Vườn Ươm Hạt Giống)
 *   3. Thu hoạch mùa vàng (Liềm hoặc Bong bóng nổi)
 *   4. Giao thương tại Chợ Nông Sản kiếm vàng
 *   5. Xây dựng hoàn tất Nhà Tranh đón dân cư
 * - Cơ chế tự thu gọn một dòng khi mở Modal hoặc người chơi bấm "Thu gọn"
 * - Không che khuất Cửa Hàng, Vườn Ươm, Chợ ở 1920x1080 & 1366x768
 * - Tự động nhận diện trạng thái game và chuyển bước cascading
 * - Phần thưởng khởi nghiệp chỉ trao 1 lần duy nhất khi hoàn thành đủ 5 bước
 */

const STORAGE_KEY_COMPLETED = "town_builder_tutorial_completed";
const STORAGE_KEY_REWARDED = "town_builder_tutorial_rewarded";
const STORAGE_KEY_STEP = "town_builder_tutorial_step";
const STORAGE_KEY_LEVEL_TUTORIALS_SHOWN = "town_builder_level_tutorials_shown_v1";

export const LEVEL_TUTORIALS_CONFIG = {
  2: {
    level: 2,
    speaker: "Cụ Trưởng Làng Eldrin",
    avatar: "🌱",
    title: "Mở Khóa Cấp 2: Mở Rộng Đất & Cối Xay Gió",
    pill: "🌟 Tính Năng Mới • Cấp 2",
    message: "Chúc mừng Tân Thị Trưởng đã đạt <strong>Cấp 2</strong>! Làng ta đã phát triển và sẵn sàng <strong>Mở Rộng Lãnh Thổ 🗺️</strong>. Bạn hãy nhấp vào các <strong>Mảnh Đất Hoang cắm biển mốc 🚩</strong> xung quanh để mua đất mới! Đồng thời, Cối Xay Gió 🌾 và Hạt Giống Cà Chua 🍅, Dâu Tây 🍓 đã sẵn sàng trong Cửa Hàng 🏗️.",
    actionHint: "Nhấp biển mốc 🚩 để mở đất mới, hoặc mở Cửa Hàng 🏗️ xem cây trồng mới",
    targetSelector: "#btn-open-shop",
    actionBtnText: "Xem Cửa Hàng 🏗️",
    actionType: "shop"
  },
  3: {
    level: 3,
    speaker: "Quan Chưởng Ấn Hoàng Gia",
    avatar: "🏛️",
    title: "Mở Khóa Cấp 3: Đại Sảnh Thành Tựu & Lò Bánh Mì",
    pill: "🌟 Tính Năng Mới • Cấp 3",
    message: "Hoan hô! Vương quốc đạt <strong>Cấp 3</strong> đã chính thức mở khóa <strong>Đại Sảnh Thành Tựu Hoàng Gia 🏛️</strong> tại Tòa Thị Chính! Bạn có thể thực hiện 16 thành tựu vĩ đại để rinh về hàng ngàn Vàng 🪙 và danh hiệu cao quý. Ngoài ra, bạn đã có thể xây <strong>Lò Bánh Mì 🥖</strong> và <strong>Chuồng Bò Sữa 🐄</strong>!",
    actionHint: "Nhấp vào Tòa Thị Chính giữa làng để mở Đại Sảnh Thành Tựu 🏆",
    targetSelector: null,
    actionBtnText: "Mở Thành Tựu 🏆",
    actionType: "achievements"
  },
  4: {
    level: 4,
    speaker: "Thợ Cả Xưởng Chế Biến",
    avatar: "🧀",
    title: "Mở Khóa Cấp 4: Xưởng Bơ Sữa & Lò Rèn Kim Khí",
    pill: "🌟 Tính Năng Mới • Cấp 4",
    message: "Thị Trưởng ơi! Ở <strong>Cấp 4</strong>, các nghệ nhân làng đã phát minh quy trình tinh chế mới: <strong>Xưởng Bơ Sữa 🧀</strong> (chế biến sữa bò thành Bơ béo ngậy) và <strong>Lò Rèn 🔨</strong> (rèn quặng sắt thành Công Cụ Sắt). Ngoài ra, bạn đã có thể trồng <strong>Cây Ăn Quả (Táo 🍎, Cherry 🍒)</strong> để rung cây thu hoạch trái ngọt!",
    actionHint: "Mở Cửa Hàng 🏗️ -> Mục Sản Xuất để đặt Xưởng Bơ Sữa và Lò Rèn",
    targetSelector: "#btn-open-shop",
    actionBtnText: "Mở Cửa Hàng 🏗️",
    actionType: "shop"
  },
  5: {
    level: 5,
    speaker: "Tổng Quản Gia Eldrin",
    avatar: "🎩",
    title: "Mở Khóa Cấp 5: Thuê Tổng Quản Gia Thu Hoạch Tự Động",
    pill: "🌟 Tính Năng Mới • Cấp 5",
    message: "Kính chào Thị Trưởng! Công việc đồng áng giờ đây đã có tôi phụ trách. Tôi là <strong>Tổng Quản Gia Làng 🎩</strong>! Tôi có thể tự động gặt lúa, hái trái cây, nhặt trứng, vắt sữa cho bạn liên tục 24/7. Vương quốc tặng bạn <strong>1 Ngày Dùng Thử Hoàn Toàn Miễn Phí (24 Giờ)</strong>! Hãy bấm vào <strong>biểu tượng Quản Gia 👨‍🌾</strong> ở góc dưới để kích hoạt ngay nhé!",
    actionHint: "Nhấp nút Quản Gia 👨‍🌾 ở góc trái dưới -> Chọn 'Dùng Thử Miễn Phí 1 Ngày'!",
    targetSelector: "#btn-open-caretaker",
    actionBtnText: "Gặp Quản Gia 👨‍🌾",
    actionType: "caretaker"
  },
  6: {
    level: 6,
    speaker: "Thuyền Trưởng Hải Trình Caravel",
    avatar: "🚢",
    title: "Mở Khóa Cấp 6: Bến Cảng Hoàng Gia & Thuyền Buôn Đổi Ruby",
    pill: "🌟 Tính Năng Mới • Cấp 6",
    message: "Chào Thị Trưởng! Vùng biển của chúng ta đã đón những chuyến tàu buôn đầu tiên cập bến! <strong>Bến Cảng Hoàng Gia & Thuyền Buôn Caravel 🚢</strong> đã mở khóa. Hãy đóng đủ <strong>9 thùng hàng nông sản</strong> trước khi thuyền rời bến để nhận thưởng <strong>Ruby 💎 Hoàng Gia</strong> quý giá cùng <strong>Vật Tư Mở Đất Hiếm</strong> (Chứng Thư Đất, La Bàn, Rìu Khai Hoang)!",
    actionHint: "Nhấp nút Thuyền Buôn 🚢 ở góc trái dưới hoặc Bến Cảng trên biển để xem 9 đơn hàng",
    targetSelector: "#btn-open-harbor-ship",
    actionBtnText: "Xem Thuyền Buôn 🚢",
    actionType: "ship"
  },
  7: {
    level: 7,
    speaker: "Đại Pháp Sư Giả Kim",
    avatar: "🔮",
    title: "Mở Khóa Cấp 7: Xưởng Giả Kim & Ngân Hàng Hoàng Gia",
    pill: "🌟 Tính Năng Mới • Cấp 7",
    message: "Kính chào Thị Trưởng! Vương quốc đã bước vào kỷ nguyên phồn vinh rực rỡ ở <strong>Cấp 7</strong>! Bạn đã mở khóa <strong>Xưởng Giả Kim 🔮</strong> tinh chế quặng quý, <strong>Ngân Hàng Hoàng Gia 🏦</strong> và <strong>Cầu Cảng Đá Bến Biển ⚓</strong>. Hãy kiến thiết vương quốc trở thành đế chế trù phú nhất đại lục!",
    actionHint: "Mở Cửa Hàng 🏗️ -> Khám phá các công trình hoàng kim mới",
    targetSelector: "#btn-open-shop",
    actionBtnText: "Xem Cửa Hàng 🏗️",
    actionType: "shop"
  },
  10: {
    level: 10,
    speaker: "Sứ Giả Đông Sơn",
    avatar: "⛩️",
    title: "Mở Khóa Cấp 10: Phong Cách Phương Đông & Suối Nước Nóng",
    pill: "🌟 Tính Năng Mới • Cấp 10",
    message: "Chúc mừng Thị Trưởng đã chinh phục <strong>Cấp 10</strong>! Bạn đã mở khóa toàn bộ phong cách kiến trúc Á Đông: <strong>Chùa Gỗ 3 Tầng 🏯</strong>, <strong>Suối Khoáng Nóng Onsen ♨️</strong>, <strong>Cổng Torii Rừng Trúc ⛩️</strong> và <strong>Đèn Lồng Đá Zen 🏮</strong> mang lại thanh bình và thu hút du khách thịnh vượng!",
    actionHint: "Mở Cửa Hàng 🏗️ -> Xem các công trình văn hóa phương Đông mới",
    targetSelector: "#btn-open-shop",
    actionBtnText: "Xem Cửa Hàng 🏗️",
    actionType: "shop"
  }
};

export const TUTORIAL_STEPS = [
  {
    step: 1,
    title: "Bước 1/5: Gieo Hạt Giống Lúa Mì",
    speaker: "Cụ Trưởng Làng Eldrin",
    avatar: "🌱",
    message: "Chào mừng Tân Thị Trưởng đến vùng đất mới! Cụ đã cho cày sẵn 4 luống đất màu mỡ cạnh đại lộ. Hãy <strong>nhấp chuột vào một Luống Đất trống</strong> và chọn gieo hạt giống <strong>Lúa Mì</strong> 🌾 trong Vườn Ươm nhé!",
    targetSelector: null, // Không target canvas để tránh hiệu ứng CSS pulse phóng to thu nhỏ bản đồ
    actionHint: "Nhấp Luống Đất trống -> Chọn Hạt Lúa Mì 🌾",
    isDoneCheck: (ctx, state) => {
      const farmState = ctx.getFarmlandState() || {};
      const hasPlantedOnField = Object.values(farmState).some(f => f && f.seedId);
      const res = ctx.getPlayerResources() || {};
      const hasWheatInStock = (res.wheat || 0) > 0;
      return hasPlantedOnField || state.hasPlantedSeed || hasWheatInStock || state.hasSoldInMarket;
    }
  },
  {
    step: 2,
    title: "Bước 2/5: Thu Hoạch Mùa Vàng",
    speaker: "Cụ Trưởng Làng Eldrin",
    avatar: "🌾",
    message: "Lúa mì lớn rất nhanh và đang chín vàng óng! Hãy nhấp trực tiếp vào <strong>Bong bóng Lúa Mì nổi</strong> ✨ hoặc dùng <strong>Liềm Thu Hoạch</strong> 🌾 trên ruộng để gặt ngay vụ mùa đầu tiên.",
    targetSelector: null, // Không target canvas để tránh hiệu ứng CSS pulse phóng to thu nhỏ bản đồ
    actionHint: "Nhấp bong bóng Lúa Mì chín ✨ để thu hoạch",
    isDoneCheck: (ctx, state) => {
      const res = ctx.getPlayerResources() || {};
      return (res.wheat || 0) >= 1 || state.hasHarvestedCrop || state.hasSoldInMarket;
    }
  },
  {
    step: 3,
    title: "Bước 3/5: Giao Thương Kiếm Vàng",
    speaker: "Cụ Trưởng Làng Eldrin",
    avatar: "🏪",
    message: "Kho nông sản Silo đã có lúa mì thơm ngon! Hãy mở <strong>Chợ Nông Sản</strong> 🏪 (nút 🏪 ở góc dưới) và bán số lúa mì này để thu về những đồng tiền vàng 🪙 đầu tiên!",
    targetSelector: "#btn-open-market",
    actionHint: "Mở Chợ Nông Sản 🏪 -> Bán Lúa Mì kiếm vàng 🪙",
    isDoneCheck: (ctx, state) => {
      return state.hasSoldInMarket === true;
    }
  },
  {
    step: 4,
    title: "Bước 4/5: Mở Rộng Thêm Luống Đất",
    speaker: "Cụ Trưởng Làng Eldrin",
    avatar: "🏗️",
    message: "Đã có vàng rủng rỉnh trong túi! Hãy mở <strong>Cửa Hàng Xây Dựng</strong> 🏗️ (mục Nông Trại & Đất) và đặt thêm một <strong>Luống Đất Trồng</strong> mới để mở rộng cánh đồng làng.",
    targetSelector: "#btn-open-shop",
    actionHint: "Mở Cửa Hàng 🏗️ -> Đặt Luống Đất Trồng mới",
    isDoneCheck: (ctx, state) => {
      if (state.hasPlacedFarmland) return true;
      const grid = ctx.getCurrentGrid();
      if (!grid) return false;
      let count = 0;
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          if (grid[r][c] === "d13_farmland_plot") count++;
        }
      }
      return count > 4; // Starter map có 4 luống cày sẵn, đặt thêm luống thứ 5 trở lên!
    }
  },
  {
    step: 5,
    title: "Bước 5/5: Đón Dân Cư Mới Định Cư",
    speaker: "Cụ Trưởng Làng Eldrin",
    avatar: "🏡",
    message: "Đất lành chim đậu! Hãy mở lại Cửa Hàng 🏗️ (mục Nhà Ở) và xây dựng thêm một <strong>Ngôi Nhà Mới</strong> 🏡 để đón thêm người dân về định cư, mở rộng vương quốc!",
    targetSelector: "#btn-open-shop",
    actionHint: "Mở Cửa Hàng 🏗️ -> Xây thêm Nhà Tranh 🏡",
    isDoneCheck: (ctx, state) => {
      if (state.hasBuiltNewHouse) return true;
      const grid = ctx.getCurrentGrid();
      if (!grid) return false;
      let houseCount = 0;
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const tid = grid[r][c];
          if (tid && (tid.startsWith("b01") || tid.startsWith("b09") || tid.startsWith("b10") || tid.startsWith("b11") || tid.startsWith("b15") || tid.startsWith("b17") || tid.startsWith("b20"))) {
            houseCount++;
          }
        }
      }
      return houseCount > 1; // Starter map có 1 nhà b01_cottage_red, xây thêm nhà thứ 2 trở lên!
    }
  }
];

/**
 * Kiểm tra xem có bất kỳ Modal nào đang mở trong game hay không
 * @returns {boolean}
 */
export function isAnyModalOpen() {
  const modalSelectors = [
    "#shop-modal.open",
    "#seed-modal.open",
    "#market-modal.open",
    "#upgrade-modal.open",
    "#settings-modal.open",
    "#snapshot-modal.open",
    ".levelup-modal-backdrop:not(.hidden)",
    "#farm-tool-popup:not(.hidden)"
  ];
  return document.querySelector(modalSelectors.join(", ")) !== null;
}

/**
 * Khởi tạo Tutorial Manager
 * @param {Object} ctx - Ngữ cảnh tương tác từ game engine
 */
export function createTutorialManager(ctx) {
  let currentStepIndex = 0;
  let isActive = false;
  let currentMode = null; // "beginner" | "level_feature" | null
  let activeLevelCfg = null;
  let pendingLevelTutorials = [];
  let isManuallyMinimized = false;
  let hasPlantedSeed = false;
  let hasHarvestedCrop = false;
  let hasSoldInMarket = false;
  let hasPlacedFarmland = false;
  let hasBuiltNewHouse = false;

  let overlayEl = null;
  let checkTimerId = null;

  function getShownLevelTutorials() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LEVEL_TUTORIALS_SHOWN);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      }
    } catch (e) {}
    return [];
  }

  function markLevelTutorialShown(level) {
    try {
      const arr = getShownLevelTutorials();
      if (!arr.includes(level)) {
        arr.push(level);
        localStorage.setItem(STORAGE_KEY_LEVEL_TUTORIALS_SHOWN, JSON.stringify(arr));
      }
    } catch (e) {}
  }

  const internalState = {
    get hasPlantedSeed() { return hasPlantedSeed; },
    get hasHarvestedCrop() { return hasHarvestedCrop; },
    get hasSoldInMarket() { return hasSoldInMarket; },
    get hasPlacedFarmland() { return hasPlacedFarmland; },
    get hasBuiltNewHouse() { return hasBuiltNewHouse; }
  };

  /**
   * Tạo phần tử giao diện DOM cho Tutorial Widget
   */
  function createDOM() {
    if (document.getElementById("tutorial-widget-overlay")) {
      overlayEl = document.getElementById("tutorial-widget-overlay");
      return;
    }

    overlayEl = document.createElement("div");
    overlayEl.id = "tutorial-widget-overlay";
    overlayEl.className = "tutorial-widget-overlay";
    overlayEl.innerHTML = `
      <!-- Thẻ hướng dẫn chi tiết mở rộng -->
      <div class="tutorial-card-container" id="tutorial-card-container">
        <div class="tutorial-avatar-badge" id="tutorial-avatar-badge">🧙‍♂️</div>
        <div class="tutorial-text-col">
          <div class="tutorial-card-topline">
            <span class="tutorial-speaker-name" id="tutorial-speaker-name">Cụ Trưởng Làng Eldrin</span>
            <span class="tutorial-step-pill" id="tutorial-step-pill">Bước 1/5</span>
          </div>
          <div class="tutorial-card-body" id="tutorial-card-body"></div>
          <div class="tutorial-card-actions">
            <button type="button" class="tutorial-btn-action" id="tutorial-btn-action" style="display: none;">Khám phá ngay 🚀</button>
            <button type="button" class="tutorial-btn-skip" id="tutorial-btn-skip" title="Bỏ qua phần hướng dẫn này (không nhận thưởng)">Bỏ qua</button>
            <button type="button" class="tutorial-btn-minimize" id="tutorial-btn-minimize" title="Thu nhỏ thẻ để thao tác trên màn hình">Thu gọn (Đã hiểu) ▾</button>
          </div>
        </div>
      </div>

      <!-- Thanh gợi ý rút gọn 1 dòng (hiển thị khi modal mở hoặc người chơi bấm Thu gọn) -->
      <div class="tutorial-mini-bar" id="tutorial-mini-bar" title="Nhấp để mở lại hướng dẫn đầy đủ của Cụ Trưởng Làng">
        <span class="tutorial-mini-avatar" id="tutorial-mini-avatar">🧙‍♂️</span>
        <span class="tutorial-mini-step" id="tutorial-mini-step">Bước 1/5:</span>
        <span class="tutorial-mini-hint" id="tutorial-mini-hint">Mở Cửa Hàng 🏗️ -> Đặt Luống Đất Trồng</span>
        <span class="tutorial-mini-expand-btn">⯅ Mở lại</span>
      </div>
    `;

    document.body.appendChild(overlayEl);

    // Nút hành động trực tiếp của tính năng mở khóa level (mở Cửa Hàng, Quản Gia, Bến Cảng...)
    const btnAction = overlayEl.querySelector("#tutorial-btn-action");
    if (btnAction) {
      btnAction.addEventListener("click", () => {
        if (ctx.playUIClickSound) ctx.playUIClickSound();
        if (currentMode === "level_feature" && activeLevelCfg) {
          const act = activeLevelCfg.actionType;
          if (act === "shop" && ctx.openShopModal) ctx.openShopModal();
          else if (act === "achievements" && ctx.openAchievementsModal) ctx.openAchievementsModal();
          else if (act === "caretaker" && ctx.openCaretakerModal) ctx.openCaretakerModal();
          else if (act === "ship" && ctx.openHarborShipModal) ctx.openHarborShipModal();
          else if (act === "market" && ctx.openMarketModal) ctx.openMarketModal();
          else if (act === "land" && ctx.openLandExpansionModal) ctx.openLandExpansionModal();

          dismissLevelTutorial();
        }
      });
    }

    // Bỏ qua hướng dẫn (hoặc Đã hiểu với Level Feature Tutorial)
    const btnSkip = overlayEl.querySelector("#tutorial-btn-skip");
    if (btnSkip) {
      btnSkip.addEventListener("click", () => {
        if (ctx.playUIClickSound) ctx.playUIClickSound();
        if (currentMode === "level_feature") {
          dismissLevelTutorial();
        } else {
          skipTutorial();
        }
      });
    }

    // Thu gọn (Đã hiểu) -> Chỉ thu nhỏ, KHÔNG được chuyển bước
    const btnMinimize = overlayEl.querySelector("#tutorial-btn-minimize");
    if (btnMinimize) {
      btnMinimize.addEventListener("click", () => {
        if (ctx.playUIClickSound) ctx.playUIClickSound();
        isManuallyMinimized = true;
        updateDisplayMode();
      });
    }

    // Nhấp vào thanh mini bar để mở lại thẻ đầy đủ
    const miniBar = overlayEl.querySelector("#tutorial-mini-bar");
    if (miniBar) {
      miniBar.addEventListener("click", () => {
        if (ctx.playUIClickSound) ctx.playUIClickSound();
        isManuallyMinimized = false;
        updateDisplayMode();
      });
    }
  }

  /**
   * Cập nhật chế độ hiển thị: Full Card hay Mini Bar 1 dòng
   * Tự động thu gọn khi có bất kỳ modal nào đang mở để không che nội dung modal
   */
  function updateDisplayMode() {
    if (!overlayEl || !isActive) return;

    const modalOpen = isAnyModalOpen();
    const shouldMinimize = isManuallyMinimized || modalOpen;

    if (shouldMinimize) {
      overlayEl.classList.add("minimized");
      if (modalOpen) {
        overlayEl.classList.add("modal-docked");
      } else {
        overlayEl.classList.remove("modal-docked");
      }
    } else {
      overlayEl.classList.remove("minimized");
      overlayEl.classList.remove("modal-docked");
    }
  }

  /**
   * Làm nổi bật (highlight pulsing) phần tử DOM mục tiêu
   */
  function updateTargetHighlight(selector) {
    document.querySelectorAll(".tutorial-target-pulse").forEach(el => {
      el.classList.remove("tutorial-target-pulse");
    });

    if (!selector || selector === "#builder-canvas" || selector.includes("canvas")) return;
    const target = document.querySelector(selector);
    if (target) {
      target.classList.add("tutorial-target-pulse");
      // Nút nằm trong cụm nút tròn đang gom (điện thoại): tự sổ ra để người chơi thấy nút cần bấm
      const deckEl = target.closest ? target.closest("#bottom-left-deck") : null;
      if (deckEl) {
        deckEl.classList.add("open");
        const deckToggle = document.getElementById("deck-toggle-btn");
        if (deckToggle) deckToggle.setAttribute("aria-expanded", "true");
      }
    }
  }

  /**
   * Cập nhật nội dung hiển thị của bước hiện tại
   */
  function renderStep() {
    if (!isActive || currentStepIndex < 0 || currentStepIndex >= TUTORIAL_STEPS.length) {
      if (overlayEl) overlayEl.classList.remove("open");
      updateTargetHighlight(null);
      return;
    }

    createDOM();
    currentMode = "beginner";
    activeLevelCfg = null;
    const curCfg = TUTORIAL_STEPS[currentStepIndex];

    const avatarEl = document.getElementById("tutorial-avatar-badge");
    const speakerEl = document.getElementById("tutorial-speaker-name");
    const pillEl = document.getElementById("tutorial-step-pill");
    const bodyEl = document.getElementById("tutorial-card-body");
    const btnActionEl = document.getElementById("tutorial-btn-action");
    const btnSkipEl = document.getElementById("tutorial-btn-skip");
    const btnMinEl = document.getElementById("tutorial-btn-minimize");

    const miniAvatarEl = document.getElementById("tutorial-mini-avatar");
    const miniStepEl = document.getElementById("tutorial-mini-step");
    const miniHintEl = document.getElementById("tutorial-mini-hint");

    if (avatarEl) avatarEl.textContent = curCfg.avatar;
    if (speakerEl) speakerEl.textContent = curCfg.speaker;
    if (pillEl) pillEl.textContent = `Bước ${curCfg.step}/5`;
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="tutorial-instruction">${curCfg.message}</div>
        <div class="tutorial-hint-tag">🎯 Hướng dẫn: ${curCfg.actionHint}</div>
      `;
    }

    if (btnActionEl) btnActionEl.style.display = "none";
    if (btnSkipEl) {
      btnSkipEl.textContent = "Bỏ qua";
      btnSkipEl.title = "Bỏ qua phần hướng dẫn này (không nhận thưởng)";
    }
    if (btnMinEl) {
      btnMinEl.textContent = "Thu gọn (Đã hiểu) ▾";
    }

    if (miniAvatarEl) miniAvatarEl.textContent = curCfg.avatar;
    if (miniStepEl) miniStepEl.textContent = `Bước ${curCfg.step}/5:`;
    if (miniHintEl) miniHintEl.textContent = curCfg.actionHint;

    updateTargetHighlight(curCfg.targetSelector);
    if (overlayEl) overlayEl.classList.add("open");

    // Khi bước chuyển, đặt lại trạng thái thu nhỏ thủ công để người chơi đọc hướng dẫn mới
    isManuallyMinimized = false;
    updateDisplayMode();

    if (ctx.playVillagerSpeakSound) {
      ctx.playVillagerSpeakSound();
    }
  }

  /**
   * Hiển thị thẻ hướng dẫn tính năng mới khi lên cấp (Level Feature Tutorial)
   */
  function renderLevelTutorial(cfg) {
    if (!cfg) return;
    createDOM();
    currentMode = "level_feature";
    activeLevelCfg = cfg;
    isActive = true;

    const avatarEl = document.getElementById("tutorial-avatar-badge");
    const speakerEl = document.getElementById("tutorial-speaker-name");
    const pillEl = document.getElementById("tutorial-step-pill");
    const bodyEl = document.getElementById("tutorial-card-body");
    const btnActionEl = document.getElementById("tutorial-btn-action");
    const btnSkipEl = document.getElementById("tutorial-btn-skip");
    const btnMinEl = document.getElementById("tutorial-btn-minimize");

    const miniAvatarEl = document.getElementById("tutorial-mini-avatar");
    const miniStepEl = document.getElementById("tutorial-mini-step");
    const miniHintEl = document.getElementById("tutorial-mini-hint");

    if (avatarEl) avatarEl.textContent = cfg.avatar;
    if (speakerEl) speakerEl.textContent = cfg.speaker;
    if (pillEl) pillEl.textContent = cfg.pill;
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="tutorial-instruction">${cfg.message}</div>
        <div class="tutorial-hint-tag">🎯 Gợi ý: ${cfg.actionHint}</div>
      `;
    }

    if (btnActionEl) {
      btnActionEl.style.display = "inline-flex";
      btnActionEl.textContent = cfg.actionBtnText || "Khám phá ngay 🚀";
    }
    if (btnSkipEl) {
      btnSkipEl.textContent = "Đã hiểu ✓";
      btnSkipEl.title = "Đóng thẻ hướng dẫn tính năng này";
    }
    if (btnMinEl) {
      btnMinEl.textContent = "Thu gọn ▾";
    }

    if (miniAvatarEl) miniAvatarEl.textContent = cfg.avatar;
    if (miniStepEl) miniStepEl.textContent = `Cấp ${cfg.level}:`;
    if (miniHintEl) miniHintEl.textContent = cfg.actionHint;

    updateTargetHighlight(cfg.targetSelector);
    if (overlayEl) overlayEl.classList.add("open");

    isManuallyMinimized = false;
    updateDisplayMode();

    if (ctx.playVillagerSpeakSound) {
      ctx.playVillagerSpeakSound();
    }
  }

  /**
   * Đóng thẻ hướng dẫn tính năng mới của cấp độ
   */
  function dismissLevelTutorial() {
    activeLevelCfg = null;
    currentMode = null;
    isActive = false;
    if (overlayEl) overlayEl.classList.remove("open");
    updateTargetHighlight(null);

    // Kiểm tra hàng đợi cấp độ tiếp theo nếu người chơi thăng cấp liên tiếp
    if (pendingLevelTutorials.length > 0) {
      const nextLevel = pendingLevelTutorials.shift();
      setTimeout(() => {
        checkAndTriggerLevelTutorial(nextLevel, true);
      }, 400);
    }
  }

  /**
   * Kiểm tra và kích hoạt thẻ hướng dẫn tính năng mới khi đạt cấp độ tương ứng
   * @param {number} level
   * @param {boolean} [force=false]
   */
  function checkAndTriggerLevelTutorial(level, force = false) {
    const cfg = LEVEL_TUTORIALS_CONFIG[level];
    if (!cfg) return;

    const shown = getShownLevelTutorials();
    if (!force && shown.includes(level)) return;

    // Đang có bất kỳ thẻ hướng dẫn nào mở (tân thủ hoặc thẻ cấp độ trước đó) thì xếp hàng chờ,
    // tránh việc thẻ Cấp 2 bị thẻ Cấp 3 render đè và mất vĩnh viễn.
    if (isActive) {
      if (!pendingLevelTutorials.includes(level)) {
        pendingLevelTutorials.push(level);
      }
      return;
    }

    markLevelTutorialShown(level);
    renderLevelTutorial(cfg);
  }

  /**
   * Kiểm tra điều kiện hoàn thành của bước hiện tại và tự động chuyển bước (hỗ trợ cascading)
   */
  function checkProgress() {
    if (!isActive || currentMode !== "beginner") return;

    let stepAdvanced = false;
    while (isActive && currentStepIndex < TUTORIAL_STEPS.length) {
      const curCfg = TUTORIAL_STEPS[currentStepIndex];
      if (curCfg && curCfg.isDoneCheck && curCfg.isDoneCheck(ctx, internalState)) {
        stepAdvanced = true;
        if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
          currentStepIndex++;
          localStorage.setItem(STORAGE_KEY_STEP, currentStepIndex.toString());
        } else {
          finishTutorial();
          return;
        }
      } else {
        break;
      }
    }

    if (stepAdvanced && isActive) {
      renderStep();
    }
  }

  /**
   * Bắt đầu vòng lặp kiểm tra trạng thái định kỳ 300ms
   */
  function startCheckLoop() {
    stopCheckLoop();
    checkTimerId = setInterval(() => {
      if (isActive) {
        checkProgress();
        updateDisplayMode();
      }
    }, 300);
  }

  /**
   * Dừng vòng lặp kiểm tra
   */
  function stopCheckLoop() {
    if (checkTimerId) {
      clearInterval(checkTimerId);
      checkTimerId = null;
    }
  }

  /**
   * Hoàn thành Tutorial và phát thưởng khởi nghiệp (chỉ phát thưởng 1 lần duy nhất)
   */
  function finishTutorial() {
    isActive = false;
    currentMode = null;
    stopCheckLoop();

    localStorage.setItem(STORAGE_KEY_COMPLETED, "true");
    localStorage.removeItem(STORAGE_KEY_STEP);

    if (overlayEl) overlayEl.classList.remove("open");
    updateTargetHighlight(null);

    const alreadyRewarded = localStorage.getItem(STORAGE_KEY_REWARDED) === "true";

    if (!alreadyRewarded) {
      localStorage.setItem(STORAGE_KEY_REWARDED, "true");

      if (ctx.addPlayerGold) ctx.addPlayerGold(200);
      if (ctx.addPlayerXP) ctx.addPlayerXP(20, "Hoàn thành Hướng Dẫn Khởi Nghiệp");

      if (ctx.spawnFlyingCoin) {
        ctx.spawnFlyingCoin(16, 16, 6);
      }
      if (ctx.spawnFlyingXP) {
        ctx.spawnFlyingXP(16, 16, 25);
      }

      if (ctx.playQuestRewardSound) {
        ctx.playQuestRewardSound();
      }

      if (ctx.showToast) {
        ctx.showToast("🎉 Chúc mừng bạn đã hoàn thành Khóa Học Khởi Nghiệp! Nhận thưởng +200🪙 và +20⭐", "success");
      }
    } else {
      if (ctx.showToast) {
        ctx.showToast("🎉 Bạn đã hoàn thành khóa ôn tập Hướng Dẫn Khởi Nghiệp!", "success");
      }
    }

    // Sau khi kết thúc tân thủ, kiểm tra xem có level tutorial nào đang chờ hiển thị không
    if (pendingLevelTutorials.length > 0) {
      const nextLevel = pendingLevelTutorials.shift();
      setTimeout(() => {
        checkAndTriggerLevelTutorial(nextLevel, true);
      }, 500);
    }
  }

  /**
   * Bỏ qua hướng dẫn (KHÔNG nhận thưởng)
   */
  function skipTutorial() {
    isActive = false;
    currentMode = null;
    stopCheckLoop();

    localStorage.setItem(STORAGE_KEY_COMPLETED, "true");
    localStorage.removeItem(STORAGE_KEY_STEP);

    if (overlayEl) overlayEl.classList.remove("open");
    updateTargetHighlight(null);

    if (ctx.showToast) {
      ctx.showToast("Đã đóng hướng dẫn người chơi mới. Bạn có thể mở lại trong Cài Đặt ⚙️ bất kỳ lúc nào!", "info");
    }

    // Sau khi bỏ qua tân thủ, kiểm tra xem có level tutorial nào đang chờ hiển thị không
    if (pendingLevelTutorials.length > 0) {
      const nextLevel = pendingLevelTutorials.shift();
      setTimeout(() => {
        checkAndTriggerLevelTutorial(nextLevel, true);
      }, 500);
    }
  }

  /**
   * Lắng nghe các hành vi trong game để ghi nhận tiến độ
   * @param {string} actionType - 'build_tile' | 'plant_seed' | 'harvest_crop' | 'market_sell'
   * @param {Object} [payload]
   */
  function onAction(actionType, payload) {
    if (!isActive || currentMode !== "beginner") return;

    if (actionType === "plant_seed") {
      hasPlantedSeed = true;
    } else if (actionType === "harvest_crop") {
      hasHarvestedCrop = true;
    } else if (actionType === "market_sell") {
      hasSoldInMarket = true;
    } else if (actionType === "build_tile") {
      if (payload?.tileId === "d13_farmland_plot") {
        hasPlacedFarmland = true;
      }
      const tid = payload?.tileId || "";
      if (tid.startsWith("b01") || tid.startsWith("b09") || tid.startsWith("b10") || tid.startsWith("b11") || tid.startsWith("b15") || tid.startsWith("b17") || tid.startsWith("b20")) {
        hasBuiltNewHouse = true;
      }
    }

    checkProgress();
  }

  function reset() {
    isActive = false;
    currentMode = null;
    activeLevelCfg = null;
    pendingLevelTutorials = [];
    stopCheckLoop();
    isManuallyMinimized = false;
    hasPlantedSeed = false;
    hasHarvestedCrop = false;
    hasSoldInMarket = false;
    hasPlacedFarmland = false;
    hasBuiltNewHouse = false;
    currentStepIndex = 0;

    try {
      localStorage.removeItem(STORAGE_KEY_COMPLETED);
      // KHÔNG xoá STORAGE_KEY_REWARDED: phần thưởng khởi nghiệp chỉ được trao 1 lần duy nhất.
      // (Trước đây xoá cờ này khiến "Mở lại hướng dẫn" farm được +200🪙 vô hạn.)
      localStorage.removeItem(STORAGE_KEY_STEP);
      localStorage.removeItem(STORAGE_KEY_LEVEL_TUTORIALS_SHOWN);
    } catch (e) {}

    if (overlayEl) overlayEl.classList.remove("open");
    updateTargetHighlight(null);
  }

  /**
   * Bắt đầu hoặc kích hoạt lại hướng dẫn
   * @param {boolean} [forceRestart=false]
   */
  function start(forceRestart = false) {
    if (forceRestart) {
      reset();
    }

    const isCompleted = localStorage.getItem(STORAGE_KEY_COMPLETED) === "true";
    if (isCompleted && !forceRestart) {
      // Tân thủ đã hoàn thành, kiểm tra xem có tính năng cấp độ mới nào người chơi chưa xem không
      const curLvl = ctx.getPlayerLevel ? ctx.getPlayerLevel() : 1;
      if (curLvl >= 2) {
        const shown = getShownLevelTutorials();
        const unshown = Object.keys(LEVEL_TUTORIALS_CONFIG)
          .map(Number)
          .filter(lvl => lvl <= curLvl && !shown.includes(lvl))
          .sort((a, b) => a - b);

        if (unshown.length > 0) {
          for (let i = 0; i < unshown.length - 1; i++) {
            markLevelTutorialShown(unshown[i]);
          }
          const highest = unshown[unshown.length - 1];
          setTimeout(() => {
            checkAndTriggerLevelTutorial(highest, false);
          }, 1200);
        }
      }
      return;
    }

    currentMode = "beginner";
    activeLevelCfg = null;
    isActive = true;
    isManuallyMinimized = false;
    hasPlantedSeed = false;
    hasHarvestedCrop = false;
    hasSoldInMarket = false;
    hasPlacedFarmland = false;
    hasBuiltNewHouse = false;

    currentStepIndex = 0;
    if (!forceRestart) {
      const savedStep = parseInt(localStorage.getItem(STORAGE_KEY_STEP) || "0", 10);
      if (!isNaN(savedStep) && savedStep >= 0 && savedStep < TUTORIAL_STEPS.length) {
        currentStepIndex = savedStep;
      }
    }

    // Tự động kiểm tra trạng thái hiện tại (nếu điều kiện đã thỏa từ trước thì tự chuyển tiếp ngay)
    while (currentStepIndex < TUTORIAL_STEPS.length && TUTORIAL_STEPS[currentStepIndex].isDoneCheck(ctx, internalState)) {
      currentStepIndex++;
    }

    if (currentStepIndex >= TUTORIAL_STEPS.length) {
      finishTutorial();
      return;
    }

    renderStep();
    startCheckLoop();
  }

  return {
    start,
    reset,
    skipTutorial,
    onAction,
    checkProgress,
    checkAndTriggerLevelTutorial,
    showLevelTutorial: (lvl, force = false) => checkAndTriggerLevelTutorial(lvl, force),
    dismissLevelTutorial,
    isActive: () => isActive,
    getCurrentStep: () => (currentMode === "beginner" && isActive ? currentStepIndex + 1 : 0),
    getCurrentMode: () => currentMode,
    destroy: () => {
      isActive = false;
      stopCheckLoop();
      updateTargetHighlight(null);
      if (overlayEl && overlayEl.parentNode) {
        overlayEl.parentNode.removeChild(overlayEl);
        overlayEl = null;
      }
    }
  };
}
