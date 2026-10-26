/**
 * kingdomWonders.js - Hệ Thống Đại Kỳ Quan Vương Quốc (Kingdom Wonders)
 * 
 * 3 Kỳ Quan Vĩ Đại với 4 Giai Đoạn Thi Công & Buff Vĩnh Cửu:
 * 1. Đại Lâu Đài Hoàng Gia (Royal Palace): +20% Vàng toàn vương quốc.
 * 2. Đại Thư Viện Biển Alexandria (Grand Ocean Library): +25% XP kinh nghiệm.
 * 3. Tượng Đại Thần Poseidon (Colossus of the Sea): x2 sản lượng cá & giảm 50% hồi tàu Caravel.
 */

export const WONDERS_CONFIG = {
  royal_palace: {
    id: "royal_palace",
    name: "Đại Lâu Đài Hoàng Gia",
    subtitle: "Biểu tượng vinh quang tối thượng của vương triều",
    icon: "🏰",
    buffDescription: "Tăng vĩnh viễn +20% Vàng từ tất cả các nguồn (Chợ, Đơn hàng, Thuyền buôn)",
    buffType: "gold",
    buffMultiplier: 1.20,
    stages: [
      {
        stage: 1,
        title: "Giai Đoạn 1: Đặt Móng & San Nền Đá",
        desc: "Khai hoang móng đá hoa cương và dựng cọc cừ kiên cố.",
        goldCost: 1500,
        resourcesCost: { wheat: 50, bread: 10 },
        rubyCost: 0
      },
      {
        stage: 2,
        title: "Giai Đoạn 2: Dựng Trụ Cột & Tường Thành",
        desc: "Xây tường thành đá đồ sộ và các cột chống vòm cẩm thạch.",
        goldCost: 5000,
        resourcesCost: { butter: 25, ironTools: 15 },
        rubyCost: 10
      },
      {
        stage: 3,
        title: "Giai Đoạn 3: Mái Vòm Mạ Vàng & Tháp Canh",
        desc: "Lắp đặt mái vòm dát vàng, cửa sổ kính màu và tháp canh đỉnh cao.",
        goldCost: 12000,
        resourcesCost: { wheat: 80, bread: 30, ironTools: 25 },
        rubyCost: 20
      },
      {
        stage: 4,
        title: "Giai Đoạn 4: Đại Lễ Khánh Thành Hoàng Kim",
        desc: "Hoàn tất đại sảnh ngai vàng, kích hoạt hào quang thịnh vượng vĩnh cửu!",
        goldCost: 25000,
        resourcesCost: { butter: 50, bread: 50, ironTools: 40 },
        rubyCost: 35
      }
    ]
  },
  ocean_library: {
    id: "ocean_library",
    name: "Đại Thư Viện Biển Alexandria",
    subtitle: "Ngọn hải đăng tri thức lưu giữ tinh hoa đại lục",
    icon: "📚",
    buffDescription: "Tăng vĩnh viễn +25% Điểm Kinh Nghiệm (XP) cho mọi hoạt động",
    buffType: "xp",
    buffMultiplier: 1.25,
    stages: [
      {
        stage: 1,
        title: "Giai Đoạn 1: Nền Cầu Cảng Ven Biển",
        desc: "Đắp đê chắn sóng và dựng móng đá vững chắc ven biển.",
        goldCost: 1200,
        resourcesCost: { wheat: 40, bread: 10 },
        rubyCost: 0
      },
      {
        stage: 2,
        title: "Giai Đoạn 2: Khung Tháp Tri Thức & Kệ Sách",
        desc: "Dựng các dãy hành lang đọc sách bằng gỗ quý chống ẩm.",
        goldCost: 4500,
        resourcesCost: { ironTools: 20, butter: 20 },
        rubyCost: 10
      },
      {
        stage: 3,
        title: "Giai Đoạn 3: Kính Thiên Văn & Phòng Dịch Thuật",
        desc: "Lắp đặt đài quan sát thiên văn và lưu trữ văn thư cổ xưa.",
        goldCost: 10000,
        resourcesCost: { bread: 35, ironTools: 30 },
        rubyCost: 20
      },
      {
        stage: 4,
        title: "Giai Đoạn 4: Ngọn Hải Đăng Trí Tuệ",
        desc: "Thắp sáng ngọn đuốc tri thức vĩnh hằng, tỏa hào quang rực rỡ!",
        goldCost: 22000,
        resourcesCost: { wheat: 100, butter: 40, ironTools: 45 },
        rubyCost: 30
      }
    ]
  },
  poseidon_statue: {
    id: "poseidon_statue",
    name: "Tượng Thần Biển Poseidon",
    subtitle: "Bức tượng thần hộ mệnh bảo trợ ngư dân & hải trình",
    icon: "🔱",
    buffDescription: "x2 Sản lượng cá đánh bắt & Giảm 50% thời gian chờ Thuyền Buôn Caravel",
    buffType: "marine",
    buffMultiplier: 2.0,
    stages: [
      {
        stage: 1,
        title: "Giai Đoạn 1: Đảo Nổi Đá San Hô",
        desc: "Kéo đá san hô đáy biển tạo bệ đỡ cho bức tượng thần khổng lồ.",
        goldCost: 1500,
        resourcesCost: { wheat: 50 },
        rubyCost: 0
      },
      {
        stage: 2,
        title: "Giai Đoạn 2: Điêu Khắc Khối Cẩm Thạch",
        desc: "Các nghệ nhân bậc thầy tạc hình tượng Thần Biển oai vệ.",
        goldCost: 5500,
        resourcesCost: { ironTools: 25, bread: 20 },
        rubyCost: 10
      },
      {
        stage: 3,
        title: "Giai Đoạn 3: Đúc Cây Đinh Ba Đồng Thau",
        desc: "Rèn cây đinh ba ánh vàng giơ cao uy nghi rẽ sóng đại dương.",
        goldCost: 13000,
        resourcesCost: { ironTools: 40, butter: 30 },
        rubyCost: 25
      },
      {
        stage: 4,
        title: "Giai Đoạn 4: Ban Phước Lành Biển Cả",
        desc: "Thần Biển thức tỉnh, sóng yên biển lặng và thuyền buôn nườm nượp cập cảng!",
        goldCost: 28000,
        resourcesCost: { bread: 60, butter: 60, ironTools: 50 },
        rubyCost: 40
      }
    ]
  }
};

export const DEFAULT_WONDER_SITES = {
  royal_palace: {
    id: "royal_palace",
    row: 8,
    col: 16,
    flipped: false,
    name: "Đại Lâu Đài Hoàng Gia",
    area: "Đồi Hoàng Triều (Phía Bắc)"
  },
  ocean_library: {
    id: "ocean_library",
    row: 18,
    col: 8,
    flipped: false,
    name: "Đại Thư Viện Biển Khơi",
    area: "Quảng Trường Ven Biển (Phía Tây)"
  },
  poseidon_statue: {
    id: "poseidon_statue",
    row: 6,
    col: 2,
    flipped: false,
    name: "Tượng Thần Biển Poseidon",
    area: "Mỏm Đá Hải Khơi (Vịnh Biển)"
  }
};

export let WONDER_SITES = { ...DEFAULT_WONDER_SITES };

const WONDER_IMAGES = {};
export function getWonderImage(id, onRequestRender) {
  if (!WONDER_IMAGES[id]) {
    const img = new Image();
    img.onload = () => {
      if (typeof onRequestRender === "function") {
        onRequestRender();
      }
    };
    if (id === "royal_palace") {
      img.src = "/assets/wonders/royal_palace.png";
    } else if (id === "ocean_library") {
      img.src = "/assets/wonders/ocean_library.png";
    } else if (id === "poseidon_statue") {
      img.src = "/assets/wonders/poseidon_statue.png";
    }
    WONDER_IMAGES[id] = img;
  }
  return WONDER_IMAGES[id];
}

export function preloadAllWonderImages(onRequestRender) {
  for (const id of ["royal_palace", "ocean_library", "poseidon_statue"]) {
    getWonderImage(id, onRequestRender);
  }
}

// Eagerly preload wonder images immediately
preloadAllWonderImages();

export class KingdomWondersManager {
  constructor(ctx) {
    this.ctx = ctx;
    // Lưu tiến độ từng kỳ quan: { [wonderId]: currentStage (0 đến 4) }
    this.wondersState = {
      royal_palace: 0,
      ocean_library: 0,
      poseidon_statue: 0
    };
    this.selectedWonderId = "royal_palace";
    this.wonderSites = this.loadSites();
    this.movingWonderId = null;
    this.movingWonderFlipped = false;

    preloadAllWonderImages(() => {
      if (this.ctx && this.ctx.requestRender) this.ctx.requestRender();
    });
  }

  loadSites() {
    try {
      const raw = localStorage.getItem("town_builder_kingdom_wonder_sites");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.royal_palace && parsed.ocean_library && parsed.poseidon_statue) {
          for (const k of ["royal_palace", "ocean_library", "poseidon_statue"]) {
            parsed[k].flipped = !!parsed[k].flipped;
          }
          return parsed;
        }
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_WONDER_SITES));
  }

  saveSites() {
    try {
      localStorage.setItem("town_builder_kingdom_wonder_sites", JSON.stringify(this.wonderSites));
    } catch (e) {}
  }

  startRelocatingWonder(wonderId) {
    this.movingWonderId = wonderId;
    this.movingWonderFlipped = !!(this.wonderSites[wonderId] && this.wonderSites[wonderId].flipped);
    const wonder = WONDERS_CONFIG[wonderId] || WONDERS_CONFIG.royal_palace;
    if (this.ctx.showToast) {
      this.ctx.showToast(`🚚 Đang di chuyển ${wonder.name}! Nhấn [R] để xoay hướng, nhấp ô để đặt.`, "info");
    }
    if (this.ctx.requestRender) this.ctx.requestRender();
  }

  toggleMovingWonderFlip() {
    if (!this.movingWonderId) return false;
    this.movingWonderFlipped = !this.movingWonderFlipped;
    if (this.ctx.playRotateSound) this.ctx.playRotateSound();
    else if (this.ctx.playBuildSound) this.ctx.playBuildSound();
    if (this.ctx.requestRender) this.ctx.requestRender();
    return true;
  }

  toggleWonderFlip(wonderId) {
    const wid = wonderId || this.selectedWonderId;
    if (!wid || !this.wonderSites[wid]) return false;
    const wonder = WONDERS_CONFIG[wid] || WONDERS_CONFIG.royal_palace;
    this.wonderSites[wid].flipped = !this.wonderSites[wid].flipped;
    this.saveSites();
    if (this.ctx.playRotateSound) this.ctx.playRotateSound();
    else if (this.ctx.playBuildSound) this.ctx.playBuildSound();
    if (this.ctx.showToast) {
      const dirText = this.wonderSites[wid].flipped ? "Tây Bắc (Đã lật)" : "Đông Bắc (Mặc định)";
      this.ctx.showToast(`🔄 Đã xoay hướng ${wonder.name}: ${dirText}!`, "success");
    }
    if (this.ctx.requestRender) this.ctx.requestRender();
    return true;
  }

  getWonderAt(row, col) {
    for (const site of Object.values(this.wonderSites)) {
      if (site.row === row && site.col === col) return site;
    }
    return null;
  }

  placeWonderAt(row, col) {
    if (!this.movingWonderId) return false;
    const wid = this.movingWonderId;
    const wonder = WONDERS_CONFIG[wid] || WONDERS_CONFIG.royal_palace;

    this.wonderSites[wid].row = row;
    this.wonderSites[wid].col = col;
    this.wonderSites[wid].flipped = !!this.movingWonderFlipped;
    this.saveSites();
    this.movingWonderId = null;

    if (this.ctx.playBuildSound) this.ctx.playBuildSound();
    if (this.ctx.showToast) this.ctx.showToast(`✨ Đã đặt ${wonder.name} thành công!`, "success");
    if (this.ctx.requestRender) this.ctx.requestRender();
    return true;
  }

  cancelRelocating() {
    if (this.movingWonderId) {
      this.movingWonderId = null;
      if (this.ctx.showToast) this.ctx.showToast("Đã hủy di chuyển kỳ quan.", "info");
      if (this.ctx.requestRender) this.ctx.requestRender();
    }
  }

  init(savedState, savedSites) {
    if (savedState && typeof savedState === "object") {
      this.wondersState = {
        royal_palace: savedState.royal_palace || 0,
        ocean_library: savedState.ocean_library || 0,
        poseidon_statue: savedState.poseidon_statue || 0
      };
    }
    if (savedSites && typeof savedSites === "object") {
      for (const k of ["royal_palace", "ocean_library", "poseidon_statue"]) {
        if (savedSites[k] && typeof savedSites[k].row === "number" && typeof savedSites[k].col === "number") {
          this.wonderSites[k] = {
            ...this.wonderSites[k],
            row: savedSites[k].row,
            col: savedSites[k].col,
            flipped: !!savedSites[k].flipped
          };
        }
      }
    }
    // Dual persistence fallback via localStorage
    try {
      const raw = localStorage.getItem("town_builder_kingdom_wonders");
      if (raw) {
        const localW = JSON.parse(raw);
        if (localW && typeof localW === "object") {
          for (const key of ["royal_palace", "ocean_library", "poseidon_statue"]) {
            if (typeof localW[key] === "number" && localW[key] > (this.wondersState[key] || 0)) {
              this.wondersState[key] = localW[key];
            }
          }
        }
      }
    } catch (e) {}
    this.bindEvents();
  }

  bindEvents() {
    const openBtn = document.getElementById("btn-open-wonders");
    const closeBtn = document.getElementById("wonder-modal-close");
    const dismissBtn = document.getElementById("wonder-modal-dismiss-btn");
    const relocateBtn = document.getElementById("wonder-relocate-btn");
    const rotateBtn = document.getElementById("wonder-rotate-btn");
    const buildBtn = document.getElementById("wonder-build-action-btn");
    const tabsBar = document.getElementById("wonder-tabs-bar");

    if (openBtn) {
      openBtn.addEventListener("click", () => this.openModal());
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal());
    }
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => this.closeModal());
    }
    if (rotateBtn) {
      rotateBtn.addEventListener("click", () => {
        const wid = this.selectedWonderId;
        this.toggleWonderFlip(wid);
      });
    }
    if (relocateBtn) {
      relocateBtn.addEventListener("click", () => {
        const wid = this.selectedWonderId;
        this.closeModal();
        this.startRelocatingWonder(wid);
      });
    }
    if (buildBtn) {
      buildBtn.addEventListener("click", () => this.upgradeCurrentWonder());
    }
    if (tabsBar) {
      tabsBar.addEventListener("click", (e) => {
        const btn = e.target.closest(".wonder-tab-btn");
        if (!btn) return;
        const wid = btn.getAttribute("data-wonder");
        if (wid && WONDERS_CONFIG[wid]) {
          this.selectedWonderId = wid;
          this.renderModal();
    if (this.ctx.requestRender) this.ctx.requestRender();
        }
      });
    }
  }

  getSaveState() {
    return { ...this.wondersState };
  }

  getGoldBuffMultiplier() {
    return this.wondersState.royal_palace >= 4 ? 1.20 : 1.0;
  }

  getXpBuffMultiplier() {
    return this.wondersState.ocean_library >= 4 ? 1.25 : 1.0;
  }

  isPoseidonActive() {
    return this.wondersState.poseidon_statue >= 4;
  }

  openModal(wonderId = null) {
    if (wonderId && WONDERS_CONFIG[wonderId]) {
      this.selectedWonderId = wonderId;
    }
    const modal = document.getElementById("wonder-modal");
    if (modal) {
      modal.classList.add("open");
      this.renderModal();
    if (this.ctx.requestRender) this.ctx.requestRender();
    }
    if (this.ctx.playModalOpenSound) this.ctx.playModalOpenSound();
  }

  closeModal() {
    const modal = document.getElementById("wonder-modal");
    if (modal) {
      modal.classList.remove("open");
    }
    if (this.ctx.playModalCloseSound) this.ctx.playModalCloseSound();
  }

  renderModal() {
    const wonder = WONDERS_CONFIG[this.selectedWonderId] || WONDERS_CONFIG.royal_palace;
    const curStage = this.wondersState[wonder.id] || 0;
    const isCompleted = curStage >= 4;

    const titleEl = document.getElementById("wonder-modal-title");
    const subTitleEl = document.getElementById("wonder-modal-subtitle");
    const iconEl = document.getElementById("wonder-modal-icon");
    const buffBadgeEl = document.getElementById("wonder-modal-buff-badge");
    const progressFillEl = document.getElementById("wonder-progress-fill");
    const progressTextEl = document.getElementById("wonder-progress-text");
    const stagesContainer = document.getElementById("wonder-stages-list");
    const buildBtn = document.getElementById("wonder-build-action-btn");

    if (titleEl) titleEl.textContent = wonder.name;
    if (subTitleEl) subTitleEl.textContent = wonder.subtitle;
    if (iconEl) iconEl.textContent = wonder.icon;
    if (buffBadgeEl) {
      buffBadgeEl.textContent = `${isCompleted ? '✨ ĐANG HOẠT ĐỘNG: ' : '🔒 HIỆU ỨNG: '}${wonder.buffDescription}`;
      buffBadgeEl.className = `wonder-buff-badge ${isCompleted ? 'active' : ''}`;
    }

    const pct = (curStage / 4) * 100;
    if (progressFillEl) progressFillEl.style.width = `${pct}%`;
    if (progressTextEl) progressTextEl.textContent = `Giai đoạn ${curStage}/4 (${pct}%)`;

    // Render tabs
    document.querySelectorAll(".wonder-tab-btn").forEach(btn => {
      const id = btn.getAttribute("data-wonder");
      if (id === this.selectedWonderId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Render 4 stages
    if (stagesContainer) {
      stagesContainer.innerHTML = wonder.stages.map((stg) => {
        const isDone = curStage >= stg.stage;
        const isCurrent = curStage === stg.stage - 1;
        const statusClass = isDone ? 'completed' : (isCurrent ? 'current' : 'locked');

        const goldReq = `${stg.goldCost.toLocaleString()} 🪙`;
        const rubyReq = stg.rubyCost > 0 ? `, ${stg.rubyCost} 💎` : '';
        const resReq = Object.entries(stg.resourcesCost)
          .map(([k, qty]) => `${qty} ${k === 'wheat' ? '🌾' : (k === 'bread' ? '🍞' : (k === 'butter' ? '🧈' : '🔨'))}`)
          .join(', ');

        return `
          <div class="wonder-stage-card ${statusClass}">
            <div class="wonder-stage-badge">${isDone ? '✓' : stg.stage}</div>
            <div class="wonder-stage-info">
              <div class="wonder-stage-title">${stg.title}</div>
              <div class="wonder-stage-desc">${stg.desc}</div>
              <div class="wonder-stage-cost">Chi phí: <strong>${goldReq}${rubyReq}${resReq ? ', ' + resReq : ''}</strong></div>
            </div>
            <div class="wonder-stage-status-label">${isDone ? 'Đã hoàn thành' : (isCurrent ? 'Đang thi công' : 'Chưa mở')}</div>
          </div>
        `;
      }).join('');
    }

    // Build action button
    if (buildBtn) {
      if (isCompleted) {
        buildBtn.disabled = true;
        buildBtn.innerHTML = "👑 KỲ QUAN HOÀN TẤT & ĐANG PHÁT HUY HÀO QUANG!";
        buildBtn.className = "wonder-build-btn completed";
      } else {
        const nextStageCfg = wonder.stages[curStage];
        const canAfford = this.canAffordStage(nextStageCfg);
        buildBtn.disabled = !canAfford;
        buildBtn.innerHTML = `🔨 Tiến Hành Thi Công Giai Đoạn ${curStage + 1} (${nextStageCfg.goldCost.toLocaleString()}🪙)`;
        buildBtn.className = `wonder-build-btn ${canAfford ? 'ready' : 'disabled'}`;
      }
    }
  }

  canAffordStage(stg) {
    if (!stg) return false;
    const gold = this.ctx.getPlayerGold ? this.ctx.getPlayerGold() : 0;
    const gems = this.ctx.getPlayerGems ? this.ctx.getPlayerGems() : 0;
    const res = this.ctx.getPlayerResources ? this.ctx.getPlayerResources() : {};

    if (gold < stg.goldCost) return false;
    if (gems < stg.rubyCost) return false;

    for (const [k, qty] of Object.entries(stg.resourcesCost)) {
      if ((res[k] || 0) < qty) return false;
    }

    return true;
  }

  upgradeCurrentWonder() {
    const wonder = WONDERS_CONFIG[this.selectedWonderId];
    if (!wonder) return;
    const curStage = this.wondersState[wonder.id] || 0;
    if (curStage >= 4) return;

    const nextStg = wonder.stages[curStage];
    if (!this.canAffordStage(nextStg)) {
      if (this.ctx.showToast) {
        this.ctx.showToast("⚠️ Chưa đủ Vàng, Ruby hoặc Nông sản để nâng cấp giai đoạn này!", "error");
      }
      return;
    }

    // Khấu trừ tài nguyên
    if (this.ctx.deductPlayerGold) this.ctx.deductPlayerGold(nextStg.goldCost);
    if (this.ctx.deductPlayerGems && nextStg.rubyCost > 0) this.ctx.deductPlayerGems(nextStg.rubyCost);
    if (this.ctx.deductPlayerResources) {
      for (const [k, qty] of Object.entries(nextStg.resourcesCost)) {
        this.ctx.deductPlayerResources(k, qty);
      }
    }

    this.wondersState[wonder.id] = curStage + 1;
    const newStage = this.wondersState[wonder.id];

    try {
      localStorage.setItem("town_builder_kingdom_wonders", JSON.stringify(this.wondersState));
    } catch (e) {}

    if (this.ctx.playBuildSound) this.ctx.playBuildSound();
    if (this.ctx.persistGameState) this.ctx.persistGameState();

    if (newStage >= 4) {
      if (this.ctx.playQuestRewardSound) this.ctx.playQuestRewardSound();
      if (this.ctx.showToast) {
        this.ctx.showToast(`🎉 HOÀN THÀNH ĐẠI KỲ QUAN: ${wonder.name}! Kích hoạt hào quang: ${wonder.buffDescription}`, "success");
      }
    } else {
      if (this.ctx.showToast) {
        this.ctx.showToast(`🔨 Thi công thành công Giai Đoạn ${newStage}/4 của ${wonder.name}!`, "success");
      }
    }

    this.renderModal();
    if (this.ctx.requestRender) this.ctx.requestRender();
  }

  /**
   * Kiểm tra nhấp chuột vào bất kỳ khu vực nào trong 3 Đại Kỳ Quan trên bản đồ thế giới
   */
  checkWorldClick(worldX, worldY, cell, originX, originY, halfW, quarterW) {
    for (const site of Object.values(this.wonderSites)) {
      if (cell && cell.row === site.row && cell.col === site.col) {
        this.selectedWonderId = site.id;
        this.openModal(site.id);
        return true;
      }
      const ox = originX + (site.col - site.row) * halfW;
      const oy = originY + (site.row + site.col) * quarterW;
      // Bounding box tương tác nhấp chuột chính xác theo kích thước 1 ô gọn gàng
      if (worldX >= ox - 10 && worldX <= ox + 138 && worldY >= oy - 30 && worldY <= oy + 128) {
        this.selectedWonderId = site.id;
        this.openModal(site.id);
        return true;
      }
    }
    return false;
  }

  /**
   * Kết xuất Kỳ Quan Hoàng Gia trên bản đồ thế giới
   */
  renderWorldWonder(ctx, originX, originY, halfW, quarterW, animTime = 0) {
    for (const site of Object.values(this.wonderSites)) {
      this.renderSite(ctx, site, originX, originY, halfW, quarterW, animTime);
    }
  }

  renderSite(ctx, site, originX, originY, halfW, quarterW, animTime = 0) {
    const wonder = WONDERS_CONFIG[site.id] || WONDERS_CONFIG.royal_palace;
    const curStage = this.wondersState[site.id] || 0;

    const ox = originX + (site.col - site.row) * halfW;
    const oy = originY + (site.row + site.col) * quarterW;
    const cx = ox + 64;
    const cy = oy + 96;

    ctx.save();

    // 1. Tọa độ và kích thước chuẩn xác vừa vặn 1 ô (128x128 standard isometric footprint)
    const spriteW = 128;
    const spriteH = 128;
    const spriteX = ox;
    const spriteY = site.id === "royal_palace" ? (oy + 12) : oy;

    // 2. Tiếp đất chân thực - Đổ bóng mặt đất tự nhiên (Không bao giờ bay lơ lửng)
    if (site.id === "poseidon_statue") {
      const wave = Math.sin(animTime * 2.5) * 2;
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 40 + wave, 20 + wave * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Kết xuất sprite theo từng giai đoạn thi công
    const wonderImg = getWonderImage(site.id, () => {
      if (this.ctx && this.ctx.requestRender) this.ctx.requestRender();
    });
    const imgReady = wonderImg && wonderImg.complete && wonderImg.naturalWidth > 0;
    const isFlipped = !!site.flipped;

    const renderWonderSprite = (alpha = 1.0) => {
      if (!imgReady) {
        // Fallback nhẹ nhàng trong tích tắc nếu ảnh đang tải từ mạng
        ctx.save();
        ctx.fillStyle = site.id === "poseidon_statue" ? "rgba(14, 165, 233, 0.45)" : (site.id === "ocean_library" ? "rgba(20, 184, 166, 0.45)" : "rgba(245, 158, 11, 0.45)");
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20, 36, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(wonder.icon || "🏛️", cx, cy - 22);
        ctx.restore();
        return;
      }
      ctx.save();
      if (alpha < 1.0) ctx.globalAlpha = alpha;
      if (isFlipped) {
        ctx.translate(ox + 128, spriteY);
        ctx.scale(-1, 1);
        ctx.drawImage(wonderImg, 0, 0, spriteW, spriteH);
      } else {
        ctx.drawImage(wonderImg, spriteX, spriteY, spriteW, spriteH);
      }
      ctx.restore();
    };

    if (curStage === 0) {
      // Giai đoạn 0: Ảnh mờ 40% (xem trước bản vẽ/bóng dáng kỳ quan chưa khởi công) + Cọc cờ quy hoạch
      renderWonderSprite(0.40);

      if (isFlipped) {
        ctx.save();
        ctx.translate(cx, 0);
        ctx.scale(-1, 1);
        ctx.translate(-cx, 0);
      }
      ctx.fillStyle = "#64748b";
      ctx.fillRect(cx + 28, cy - 14, 2.5, 16);
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(cx + 30.5, cy - 14);
      ctx.lineTo(cx + 42, cy - 10);
      ctx.lineTo(cx + 30.5, cy - 6);
      ctx.closePath();
      ctx.fill();
      if (isFlipped) ctx.restore();
    } else if (curStage === 1) {
      // Giai đoạn 1: Hiện mờ 60% + Giàn giáo nhỏ gọn dưới chân móng
      renderWonderSprite(0.60);

      if (isFlipped) {
        ctx.save();
        ctx.translate(cx, 0);
        ctx.scale(-1, 1);
        ctx.translate(-cx, 0);
      }
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 32, cy - 18, 12, 16);
      ctx.strokeRect(cx + 20, cy - 18, 12, 16);
      if (isFlipped) ctx.restore();
    } else if (curStage === 2) {
      // Giai đoạn 2: Hiện mờ 75% + Giàn giáo thi công phần thân
      renderWonderSprite(0.75);

      if (isFlipped) {
        ctx.save();
        ctx.translate(cx, 0);
        ctx.scale(-1, 1);
        ctx.translate(-cx, 0);
      }
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 26, cy - 22, 12, 22);
      ctx.strokeRect(cx + 14, cy - 22, 12, 22);
      if (isFlipped) ctx.restore();
    } else if (curStage === 3) {
      // Giai đoạn 3: Hiện rõ 90% gần hoàn tất
      renderWonderSprite(0.90);

      if (isFlipped) {
        ctx.save();
        ctx.translate(cx, 0);
        ctx.scale(-1, 1);
        ctx.translate(-cx, 0);
      }
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx + 18, cy - 38, 10, 16);
      if (isFlipped) ctx.restore();
    } else if (curStage >= 4) {
      // Giai đoạn 4: Hoàn thành mỹ mãn 100% sắc nét + Hạt bụi vàng kim bay lơ lửng quanh đỉnh tháp
      renderWonderSprite(1.0);

      for (let p = 0; p < 4; p++) {
        const pAngle = animTime * 1.5 + (p * Math.PI * 2) / 4;
        const px = cx + Math.cos(pAngle) * (spriteW * 0.32);
        const py = (spriteY + 28) + Math.sin(pAngle * 2) * 8;
        ctx.fillStyle = p % 2 === 0 ? "rgba(254, 240, 138, 0.9)" : "rgba(245, 158, 11, 0.9)";
        ctx.beginPath();
        ctx.arc(px, py, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Bảng hiệu & Huy hiệu nổi trên nóc kỳ quan (Nhấp để mở)
    const floatY = spriteY - 14 + Math.sin(animTime * 3) * 2.5;
    const badgeText = curStage >= 4
      ? "👑 " + wonder.name + " (Hoàn Thành)"
      : (curStage === 0 ? "🏛️ " + wonder.name + " (Nhấp Khởi Công)" : "🔨 " + wonder.name + " (GĐ " + curStage + "/4)");

    ctx.font = "700 11px system-ui, -apple-system, sans-serif";
    const textW = ctx.measureText(badgeText).width;
    const padX = 8;
    const bW = textW + padX * 2;
    const bH = 20;

    ctx.fillStyle = curStage >= 4 ? "#15803d" : "#78350f";
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - bW / 2, floatY - bH / 2, bW, bH, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, cx, floatY);

    ctx.restore();
  }
}
