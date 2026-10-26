/**
 * orderBoardManager.js - Quản Lý Bảng Đơn Hàng Giao Cho NPC & Xe Tải Giao Hàng (Delivery Truck)
 * 
 * - Hệ thống tự động sinh 6 đơn hàng từ các NPC khách hàng vương quốc.
 * - Trước cửa Tòa Thị Chính có Bảng Đơn Hàng và Xe Tải Giao Hàng đậu bên cạnh.
 * - Khi bấm giao hàng: Xe tải khởi hành chạy dọc theo con đường ra khỏi thị trấn để giao hàng.
 * - Trong thời gian xe đi (16 giây): các đơn hàng trên bảng TẠM KHÓA, người chơi phải đợi xe về mới giao tiếp được.
 * - Khi xe về: Xe đỗ lại chỗ cũ, còi xe vang lên, tung hoa vàng & kinh nghiệm chúc mừng!
 */

import {
  ORDER_BOARD_SLOTS_COUNT,
  ORDER_DISCARD_COOLDOWN_SEC,
  generateRandomOrder
} from "../data/orderBoardConfig.js";

import {
  playQuestRewardSound,
  playCoinSound,
  playErrorSound,
  playUIClickSound,
  playModalOpenSound,
  playModalCloseSound
} from "./audioEngine.js";

export function createOrderBoardManager(ctx) {
  let orders = []; // Mảng 6 slots
  let totalOrdersDelivered = 0;
  let isModalOpen = false;

  // Trạng thái Xe Tải Giao Hàng (Delivery Truck State)
  const truckState = {
    isDelivering: false,
    order: null,
    tripDurationMs: 28000, // 28 giây khứ hồi (chạy chậm rãi, ngắm cảnh làng quê thanh bình)
    startedAt: 0,
    returnsAt: 0,
    // Tọa độ đậu xe và bảng đơn hàng đặt trực tiếp trên ô Đài Phun Nước (Row 15, Col 15) trước thềm Tòa Thị Chính
    homeRow: 15.5,
    homeCol: 15.3,
    boardRow: 15.25,
    boardCol: 15.15
  };

  const modalEl = document.getElementById("order-board-modal");
  const modalCloseBtn = document.getElementById("order-board-modal-close");
  const modalDismissBtn = document.getElementById("order-board-dismiss-btn");
  const gridContainer = document.getElementById("order-board-grid");
  const bannerContainer = document.getElementById("order-board-truck-banner-container");
  const badgeEl = document.getElementById("order-notify-badge");
  const statsCountEl = document.getElementById("order-board-completed-count");
  const statsReadyEl = document.getElementById("order-board-ready-count");

  const deckBtn = document.getElementById("btn-open-order-board");
  const quickStorageBtn = document.getElementById("hud-quick-order-btn");

  function init(savedData = null) {
    if (savedData && Array.isArray(savedData.orders) && savedData.orders.length > 0) {
      orders = savedData.orders.slice(0, ORDER_BOARD_SLOTS_COUNT);
      totalOrdersDelivered = typeof savedData.totalOrdersDelivered === "number" ? savedData.totalOrdersDelivered : 0;
    } else {
      orders = [];
      totalOrdersDelivered = 0;
    }

    if (savedData && savedData.truckState && savedData.truckState.isDelivering && savedData.truckState.returnsAt > Date.now()) {
      truckState.isDelivering = true;
      truckState.order = savedData.truckState.order;
      truckState.startedAt = savedData.truckState.startedAt;
      truckState.returnsAt = savedData.truckState.returnsAt;
    } else {
      truckState.isDelivering = false;
      truckState.order = null;
    }

    // Đảm bảo luôn có đủ 6 slots
    while (orders.length < ORDER_BOARD_SLOTS_COUNT) {
      orders.push(generateRandomOrder(ctx.getPlayerLevel(), orders.filter(o => o && o.items)));
    }

    if (deckBtn) {
      deckBtn.addEventListener("click", () => openModal());
    }

    if (quickStorageBtn) {
      quickStorageBtn.addEventListener("click", () => openModal());
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => closeModal());
    }

    if (modalDismissBtn) {
      modalDismissBtn.addEventListener("click", () => closeModal());
    }

    if (modalEl) {
      modalEl.addEventListener("click", (e) => {
        if (e.target === modalEl) closeModal();
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isModalOpen) closeModal();
    });

    if (gridContainer) {
      gridContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;
        const slotIdx = parseInt(btn.dataset.slotIndex, 10);
        const orderId = btn.dataset.orderId;

        if (action === "deliver") {
          deliverOrder(orderId, slotIdx);
        } else if (action === "discard") {
          discardOrder(slotIdx);
        } else if (action === "speedup") {
          speedupSlot(slotIdx);
        }
      });
    }

    if (bannerContainer) {
      bannerContainer.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action='speedup-truck']");
        if (btn) {
          speedupTruck();
        }
      });
    }

    updateBadge();
  }

  function openModal() {
    if (!modalEl) return;
    playModalOpenSound();
    isModalOpen = true;
    renderBoard();
    modalEl.classList.add("open");
  }

  function closeModal() {
    if (!modalEl || !isModalOpen) return;
    playModalCloseSound();
    isModalOpen = false;
    modalEl.classList.remove("open");
  }

  function canFulfillOrder(order) {
    if (!order || !Array.isArray(order.items)) return false;
    const resources = ctx.getPlayerResources() || {};
    return order.items.every(it => (resources[it.resourceId] || 0) >= it.amount);
  }

  /**
   * Bắt đầu chuyến xe giao hàng
   */
  function deliverOrder(orderId, slotIdx) {
    if (truckState.isDelivering) {
      playErrorSound();
      const remSec = Math.max(1, Math.ceil((truckState.returnsAt - Date.now()) / 1000));
      ctx.showToast(`🚚 Xe tải đang đi giao hàng! Vui lòng đợi xe trở về sau ${remSec}s.`, "warning");
      return;
    }

    const order = orders[slotIdx];
    if (!order || order.id !== orderId) return;

    if (!canFulfillOrder(order)) {
      playErrorSound();
      ctx.showToast("⚠️ Kho chưa đủ nguyên liệu yêu cầu để giao đơn này!", "warning");
      return;
    }

    const resources = ctx.getPlayerResources();

    // Khấu trừ tài nguyên ngay khi xe chất hàng lên thùng xe
    order.items.forEach(it => {
      resources[it.resourceId] = Math.max(0, (resources[it.resourceId] || 0) - it.amount);
    });

    // Xe khởi hành
    truckState.isDelivering = true;
    truckState.order = order;
    truckState.startedAt = Date.now();
    truckState.returnsAt = Date.now() + truckState.tripDurationMs;

    playCoinSound();
    ctx.updateResourcesUI();
    ctx.persistGameState();
    ctx.showToast(`🚚 Xe tải bắt đầu khởi hành giao hàng cho ${order.npc.name}!`, "info");

    // Tạo sẵn đơn hàng mới vào ô này cho lần tiếp theo
    orders[slotIdx] = generateRandomOrder(ctx.getPlayerLevel(), orders.filter(o => o && o.items));

    renderBoard();
    updateBadge();
  }

  /**
   * Gọi xe tải về ngay lập tức (tốn 5 vàng)
   */
  function speedupTruck() {
    if (!truckState.isDelivering) return;
    const currentGold = ctx.getPlayerGold();
    if (currentGold < 5) {
      playErrorSound();
      ctx.showToast("⚠️ Bạn cần 5🪙 để gọi xe tải trở về ngay lập tức!", "warning");
      return;
    }

    ctx.deductGold(5);
    playCoinSound();
    // Hoàn thành chuyến xe lập tức
    completeTruckDelivery();
  }

  /**
   * Xe tải hoàn thành chuyến giao hàng, trao thưởng và cập nhật
   */
  function completeTruckDelivery() {
    if (!truckState.isDelivering || !truckState.order) return;

    const ord = truckState.order;
    ctx.addPlayerGold(ord.rewardGold);
    ctx.addPlayerXP(ord.rewardXP);
    totalOrdersDelivered++;

    playQuestRewardSound();
    playCoinSound();

    truckState.isDelivering = false;
    truckState.order = null;

    ctx.updateGoldDisplay();
    ctx.persistGameState();
    ctx.showToast(`🎉 Xe tải đã giao hàng thành công và trở về! Nhận +${ord.rewardGold}🪙 +${ord.rewardXP}⭐`, "success");

    renderBoard();
    updateBadge();
  }

  function discardOrder(slotIdx) {
    playUIClickSound();
    orders[slotIdx] = {
      cooldownUntil: Date.now() + ORDER_DISCARD_COOLDOWN_SEC * 1000
    };

    ctx.persistGameState();
    ctx.showToast("🗑️ Đã hủy đơn hàng! Ô này sẽ đếm ngược 3 phút (03:00) trước khi có đơn mới.", "info");
    renderBoard();
    updateBadge();
  }

  function speedupSlot(slotIdx) {
    const currentGems = ctx.getPlayerGems ? ctx.getPlayerGems() : 0;
    if (currentGems < 1) {
      playErrorSound();
      ctx.showToast("⚠️ Không đủ Ruby 💎! Cần 1💎 để tìm đơn mới ngay lập tức.", "error");
      return;
    }

    ctx.deductGems(1);
    orders[slotIdx] = generateRandomOrder(ctx.getPlayerLevel(), orders.filter(o => o && o.items));
    ctx.persistGameState();
    ctx.showToast("✨ Đã dùng 1💎 tìm được đơn hàng mới từ thương nhân!", "success");
    renderBoard();
    updateBadge();
  }

  function update() {
    let stateChanged = false;
    const now = Date.now();

    // 1. Kiểm tra Xe Tải hoàn thành chuyến đi
    if (truckState.isDelivering && now >= truckState.returnsAt) {
      completeTruckDelivery();
      stateChanged = true;
    }

    // 2. Kiểm tra ô hồi đơn sau khi xé
    for (let i = 0; i < orders.length; i++) {
      const slot = orders[i];
      if (slot && slot.cooldownUntil && now >= slot.cooldownUntil) {
        orders[i] = generateRandomOrder(ctx.getPlayerLevel(), orders.filter(o => o && o.items));
        stateChanged = true;
      }
    }

    if (stateChanged) {
      ctx.persistGameState();
      if (isModalOpen) renderBoard();
      updateBadge();
    } else if (isModalOpen) {
      // Cập nhật đồng hồ đếm ngược của xe tải
      if (truckState.isDelivering) {
        const truckTimerEl = document.getElementById("truck-delivery-countdown");
        const progressFillEl = document.getElementById("truck-delivery-progress-fill");
        if (truckTimerEl) {
          const rem = Math.max(0, Math.ceil((truckState.returnsAt - now) / 1000));
          truckTimerEl.textContent = formatCooldownTime(rem);
        }
        if (progressFillEl) {
          const elapsed = now - truckState.startedAt;
          const pct = Math.min(100, Math.round((elapsed / truckState.tripDurationMs) * 100));
          progressFillEl.style.width = `${pct}%`;
        }
      }

      // Cập nhật đồng hồ ô đang chờ
      const timerEls = document.querySelectorAll(".order-cooldown-timer");
      timerEls.forEach(el => {
        const slotIdx = parseInt(el.dataset.slotIndex, 10);
        const slot = orders[slotIdx];
        if (slot && slot.cooldownUntil) {
          const remSec = Math.max(0, Math.ceil((slot.cooldownUntil - now) / 1000));
          el.textContent = formatCooldownTime(remSec);
        }
      });
    }

    updateBadge();
  }

  function updateBadge() {
    let readyCount = 0;
    orders.forEach(slot => {
      if (slot && slot.items && canFulfillOrder(slot)) {
        readyCount++;
      }
    });

    if (badgeEl) {
      if (readyCount > 0 && !truckState.isDelivering) {
        badgeEl.textContent = String(readyCount);
        badgeEl.classList.remove("hidden");
      } else {
        badgeEl.classList.add("hidden");
      }
    }

    if (statsReadyEl) {
      statsReadyEl.textContent = `${readyCount} / ${ORDER_BOARD_SLOTS_COUNT}`;
    }

    if (statsCountEl) {
      statsCountEl.textContent = String(totalOrdersDelivered);
    }
  }

  function formatCooldownTime(remSec) {
    const m = Math.floor(remSec / 60);
    const s = remSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function renderBoard() {
    if (!gridContainer) return;
    const resources = ctx.getPlayerResources() || {};
    const now = Date.now();

    // 1. Render Banner trạng thái Xe Tải Giao Hàng
    if (bannerContainer) {
      if (truckState.isDelivering && truckState.order) {
        const remTripSec = Math.max(0, Math.ceil((truckState.returnsAt - now) / 1000));
        const elapsed = now - truckState.startedAt;
        const pct = Math.min(100, Math.round((elapsed / truckState.tripDurationMs) * 100));

        bannerContainer.innerHTML = `
          <div class="order-truck-banner active">
            <div class="truck-banner-anim">🚚💨</div>
            <div class="truck-banner-text">
              <div class="truck-banner-title">
                Xe tải đang đi giao hàng cho <strong>${truckState.order.npc.name}</strong>...
              </div>
              <div class="truck-banner-meta">
                Dự kiến trở về sau: <strong id="truck-delivery-countdown">${formatCooldownTime(remTripSec)}</strong>
              </div>
              <div class="truck-progress-track">
                <div class="truck-progress-fill" id="truck-delivery-progress-fill" style="width: ${pct}%"></div>
              </div>
            </div>
            <button type="button" class="truck-speedup-btn" data-action="speedup-truck" title="Dùng 5🪙 để gọi xe tải trở về ngay lập tức">
              ⚡ Về Ngay (5🪙)
            </button>
          </div>
        `;
        bannerContainer.style.display = "block";
      } else {
        bannerContainer.innerHTML = "";
        bannerContainer.style.display = "none";
      }
    }

    // 2. Render các ô đơn hàng
    gridContainer.innerHTML = "";

    orders.forEach((slot, idx) => {
      const card = document.createElement("div");
      card.className = "order-slip-card";

      if (slot && slot.cooldownUntil) {
        const remSec = Math.max(0, Math.ceil((slot.cooldownUntil - now) / 1000));
        card.classList.add("cooldown-state");
        card.innerHTML = `
          <div class="order-pin">📌</div>
          <div class="order-cooldown-box">
            <div class="order-cooldown-icon">⏳</div>
            <div class="order-cooldown-title">Đang tìm đơn mới...</div>
            <div class="order-cooldown-timer" data-slot-index="${idx}">${formatCooldownTime(remSec)}</div>
            <button type="button" class="order-speedup-btn" data-action="speedup" data-slot-index="${idx}" title="Dùng 1💎 để tìm đơn mới ngay lập tức">
              ⚡ Lấy Đơn Ngay (1💎)
            </button>
          </div>
        `;
        gridContainer.appendChild(card);
        return;
      }

      const isReady = canFulfillOrder(slot);
      if (isReady && !truckState.isDelivering) {
        card.classList.add("ready-to-deliver");
      }

      const itemsHtml = slot.items.map(it => {
        const owned = resources[it.resourceId] || 0;
        const hasEnough = owned >= it.amount;
        return `
          <div class="order-item-row ${hasEnough ? 'item-sufficient' : 'item-missing'}">
            <span class="order-item-ico">${it.icon}</span>
            <span class="order-item-name">${it.name}</span>
            <span class="order-item-qty ${hasEnough ? 'qty-ok' : 'qty-need'}">
              ${owned}/${it.amount} ${hasEnough ? '✔️' : '❌'}
            </span>
          </div>
        `;
      }).join("");

      // Nút Giao Hàng: nếu xe đang đi thì bị khóa
      let deliverBtnHtml = "";
      if (truckState.isDelivering) {
        deliverBtnHtml = `
          <button type="button" class="order-deliver-btn truck-busy" disabled title="Xe tải đang bận đi giao chuyến trước, vui lòng đợi xe về">
            Xe đang giao hàng 🚚
          </button>
        `;
      } else if (isReady) {
        deliverBtnHtml = `
          <button type="button" class="order-deliver-btn active-ready"
            data-action="deliver"
            data-slot-index="${idx}"
            data-order-id="${slot.id}"
            title="Giao hàng ngay: Xe tải sẽ khởi hành chạy đi giao!">
            🚚 GIAO HÀNG
          </button>
        `;
      } else {
        deliverBtnHtml = `
          <button type="button" class="order-deliver-btn disabled-need" disabled title="Kho chưa đủ số lượng yêu cầu">
            Thiếu hàng
          </button>
        `;
      }

      card.innerHTML = `
        <div class="order-pin">📌</div>
        <button type="button" class="order-discard-btn" data-action="discard" data-slot-index="${idx}" title="Hủy bỏ đơn hàng này (hồi đơn mới sau 3 phút)">
          🗑️ Hủy đơn
        </button>

        <div class="order-npc-header">
          <div class="order-npc-avatar" style="border-color: ${slot.npc.accentColor || '#f59e0b'}">
            ${slot.npc.avatar}
          </div>
          <div class="order-npc-meta">
            <div class="order-npc-name">${slot.npc.name}</div>
            <div class="order-npc-role">${slot.npc.role}</div>
          </div>
        </div>

        <div class="order-dialogue-bubble">
          "${slot.dialogue}"
        </div>

        <div class="order-items-list">
          ${itemsHtml}
        </div>

        <div class="order-rewards-bar">
          <span class="order-reward-chip gold" title="Vàng thưởng nhận được">🪙 +${slot.rewardGold}</span>
          <span class="order-reward-chip xp" title="Kinh nghiệm thưởng">⭐ +${slot.rewardXP} XP</span>
        </div>

        <div class="order-card-action">
          ${deliverBtnHtml}
        </div>
      `;

      gridContainer.appendChild(card);
    });

    updateBadge();
  }

  /**
   * Kiểm tra nhấp chuột trên bản đồ thế giới vào Bảng Đơn Hàng hoặc Xe Tải
   */
  function checkWorldClick(worldX, worldY, p3, p4, p5, p6, p7) {
    let cell;
    if (p3 && typeof p3 === 'object' && 'row' in p3) {
      cell = p3;
    } else {
      cell = p7;
    }

    // Chỉ nhận nhấp vào đúng ô 15, 15 (Đài Phun Nước / Bảng Đơn Hàng / Xe Tải)
    // Tuyệt đối không nhận ô đường (16, 15) hay các ô xung quanh (16, 14...)
    if (cell && cell.row === 15 && cell.col === 15) {
      return true;
    }

    return false;
  }

  // Cache cho hình ảnh Bảng Đơn Hàng & Xe Tải Giao Hàng
  let orderBoardImage = null;
  function getOrderBoardImage() {
    if (!orderBoardImage) {
      orderBoardImage = new Image();
      orderBoardImage.onload = () => {
        if (ctx && ctx.requestRender) ctx.requestRender();
      };
      orderBoardImage.src = "/assets/buildings/order_board.png";
    }
    return orderBoardImage;
  }

  let deliveryTruckImage = null;
  function getDeliveryTruckImage() {
    if (!deliveryTruckImage) {
      deliveryTruckImage = new Image();
      deliveryTruckImage.onload = () => {
        if (ctx && ctx.requestRender) ctx.requestRender();
      };
      deliveryTruckImage.src = "/assets/vehicles/delivery_truck.png";
    }
    return deliveryTruckImage;
  }

  function getTruckCell() {
    let r = truckState.homeRow;
    let c = truckState.homeCol;
    let isVisible = true;

    if (truckState.isDelivering) {
      const elapsed = Date.now() - truckState.startedAt;
      const p = Math.min(1.0, elapsed / truckState.tripDurationMs);

      if (p < 0.44) {
        const prog = p / 0.44;
        r = truckState.homeRow + (40.0 - truckState.homeRow) * prog;
        c = prog < 0.1 ? truckState.homeCol + (15.0 - truckState.homeCol) * (prog / 0.1) : 15.0;
      } else if (p < 0.56) {
        isVisible = false;
      } else {
        const prog = (p - 0.56) / 0.44;
        r = 40.0 - (40.0 - truckState.homeRow) * prog;
        c = prog > 0.9 ? 15.0 + (truckState.homeCol - 15.0) * ((prog - 0.9) / 0.1) : 15.0;
      }
    }
    return { row: r, col: c, isVisible };
  }

  /**
   * Vẽ Bảng Đơn Hàng và Xe Tải Giao Hàng trên Canvas
   */
  function renderWorldTruckAndBoard(c2d, originX, originY, halfW, quarterW, animTime, opts = {}) {
    const now = Date.now();
    const renderBoardOnly = opts && opts.only === "board";
    const renderTruckOnly = opts && opts.only === "truck";
    const renderBoth = !renderBoardOnly && !renderTruckOnly;

    // =========================================================================
    // 1. VẼ BẢNG ĐƠN HÀNG (ORDER BOARD) tại trước cửa Tòa Thị Chính
    // =========================================================================
    if (renderBoth || renderBoardOnly) {
      const boardX = originX + (truckState.boardCol - truckState.boardRow) * halfW + 64;
      const boardY = originY + (truckState.boardRow + truckState.boardCol) * quarterW + 96;

      c2d.save();
      // Bóng dưới chân bảng
      c2d.fillStyle = "rgba(0, 0, 0, 0.28)";
      c2d.beginPath();
      c2d.ellipse(boardX, boardY + 6, 16, 8, 0, 0, Math.PI * 2);
      c2d.fill();

      const boardImg = getOrderBoardImage();
      const isBoardReady = boardImg && boardImg.complete && boardImg.naturalWidth > 0;

      if (isBoardReady) {
        c2d.save();
        c2d.translate(boardX, boardY);
        c2d.scale(-1, 1);
        c2d.drawImage(boardImg, -32, -58, 64, 64);
        c2d.restore();
      } else {
        // 2 cột gỗ cắm đất dự phòng
        c2d.fillStyle = "#78350f";
        c2d.fillRect(boardX - 8, boardY - 20, 2, 22);
        c2d.fillRect(boardX + 5, boardY - 20, 2, 22);
        c2d.fillStyle = "#92400e";
        c2d.fillRect(boardX - 12, boardY - 22, 24, 16);
      }

      // Huy hiệu thông báo có đơn sẵn sàng giao trên đầu bảng
      let readyCount = 0;
      orders.forEach(slot => {
        if (slot && slot.items && canFulfillOrder(slot)) readyCount++;
      });

      if (readyCount > 0 && !truckState.isDelivering) {
        const badgeBounce = Math.sin(animTime * 4.0) * 2.5;
        const bx = boardX - 12;
        const by = boardY - 56 + badgeBounce;

        c2d.fillStyle = "#10b981";
        c2d.strokeStyle = "#ffffff";
        c2d.lineWidth = 1.5;
        c2d.beginPath();
        c2d.arc(bx, by, 9, 0, Math.PI * 2);
        c2d.fill();
        c2d.stroke();

        c2d.font = "bold 9.5px sans-serif";
        c2d.fillStyle = "#ffffff";
        c2d.textAlign = "center";
        c2d.textBaseline = "middle";
        c2d.fillText(String(readyCount), bx, by);
      }
      c2d.restore();
    }

    // =========================================================================
    // 2. VẼ XE TẢI GIAO HÀNG (DELIVERY TRUCK)
    // =========================================================================
    if (renderBoth || renderTruckOnly) {
      let truckR = truckState.homeRow;
      let truckC = truckState.homeCol;
      let isVisible = true;
      let isReturning = false;

      if (truckState.isDelivering) {
        const elapsed = now - truckState.startedAt;
        const p = Math.min(1.0, elapsed / truckState.tripDurationMs);

        if (p < 0.44) {
          // Giai đoạn 1: Xe chạy từ Đài Phun Nước xuống con đường xuyên rừng phía Nam (Row 40.0)
          const prog = p / 0.44;
          truckR = truckState.homeRow + (40.0 - truckState.homeRow) * prog;
          truckC = prog < 0.1 ? truckState.homeCol + (15.0 - truckState.homeCol) * (prog / 0.1) : 15.0;
          isReturning = false;
        } else if (p < 0.56) {
          // Giai đoạn 2: Xe ở ngoài thị trấn giao hàng
          isVisible = false;
        } else {
          // Giai đoạn 3: Xe chạy ngược từ con đường xuyên rừng (Row 40.0) về lại Đài Phun Nước
          const prog = (p - 0.56) / 0.44;
          truckR = 40.0 - (40.0 - truckState.homeRow) * prog;
          truckC = prog > 0.9 ? 15.0 + (truckState.homeCol - 15.0) * ((prog - 0.9) / 0.1) : 15.0;
          isReturning = true;
        }
      }

      if (isVisible) {
        const tx = originX + (truckC - truckR) * halfW + 64;
        const ty = originY + (truckR + truckC) * quarterW + 96;

        c2d.save();

        // Bóng xe tải nhỏ gọn
        c2d.fillStyle = "rgba(0, 0, 0, 0.28)";
        c2d.beginPath();
        c2d.ellipse(tx, ty + 6, 18, 9, 0, 0, Math.PI * 2);
        c2d.fill();

        // Khói bốc ra sau đuôi xe khi đang chạy
        if (truckState.isDelivering) {
          const puff = (animTime * 12.0) % 3;
          c2d.fillStyle = "rgba(226, 232, 240, 0.75)";
          c2d.beginPath();
          c2d.arc(tx - (isReturning ? -10 : 10) - puff * 3, ty - 4 - puff * 2, 2.5 + puff * 1.5, 0, Math.PI * 2);
          c2d.fill();
        }

        const truckImg = getDeliveryTruckImage();
        const isTruckReady = truckImg && truckImg.complete && truckImg.naturalWidth > 0;

        if (isTruckReady) {
          c2d.save();
          if (isReturning) {
            c2d.translate(tx, ty);
            c2d.scale(-1, 1);
            c2d.drawImage(truckImg, -28, -46, 56, 56);
          } else {
            c2d.translate(tx, ty);
            c2d.drawImage(truckImg, -28, -46, 56, 56);
          }
          c2d.restore();
        } else {
          // Dự phòng
          c2d.fillStyle = "#dc2626";
          c2d.fillRect(tx - 10, ty - 12, 14, 10);
        }

        c2d.restore();
      }
    }
  }

  return {
    init,
    openModal,
    closeModal,
    update,
    deliverOrder,
    discardOrder,
    speedupSlot,
    speedupTruck,
    checkWorldClick,
    renderWorldTruckAndBoard,
    getTruckCell,
    isTruckDelivering: () => truckState.isDelivering,
    reset: () => {
      orders = [];
      totalOrdersDelivered = 0;
      truckState.isDelivering = false;
      truckState.order = null;
      while (orders.length < ORDER_BOARD_SLOTS_COUNT) {
        orders.push(generateRandomOrder(1, orders.filter(o => o && o.items)));
      }
      updateBadge();
      if (isModalOpen) renderBoard();
    },
    getSaveState: () => ({
      orders,
      totalOrdersDelivered,
      truckState: {
        isDelivering: truckState.isDelivering,
        order: truckState.order,
        startedAt: truckState.startedAt,
        returnsAt: truckState.returnsAt
      }
    }),
    restoreFromSave: (data) => {
      if (data && Array.isArray(data.orders) && data.orders.length > 0) {
        orders = data.orders.slice(0, ORDER_BOARD_SLOTS_COUNT);
        totalOrdersDelivered = typeof data.totalOrdersDelivered === "number" ? data.totalOrdersDelivered : 0;
      }
      if (data && data.truckState && data.truckState.isDelivering && data.truckState.returnsAt > Date.now()) {
        truckState.isDelivering = true;
        truckState.order = data.truckState.order;
        truckState.startedAt = data.truckState.startedAt;
        truckState.returnsAt = data.truckState.returnsAt;
      } else {
        truckState.isDelivering = false;
        truckState.order = null;
      }
      while (orders.length < ORDER_BOARD_SLOTS_COUNT) {
        orders.push(generateRandomOrder(ctx.getPlayerLevel(), orders.filter(o => o && o.items)));
      }
      updateBadge();
    }
  };
}
