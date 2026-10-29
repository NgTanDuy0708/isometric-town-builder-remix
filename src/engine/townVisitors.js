/**
 * townVisitors.js - Khách Bộ Hành NPC Ghé Thăm Tòa Thị Chính Mua Nông Sản
 * 
 * NPC từ các vùng lân cận đi bộ dọc theo con đường lớn vào thị trấn,
 * dừng lại trước thềm Tòa Thị Chính với bong bóng đối thoại mua hàng,
 * người chơi có thể bán hàng lấy Vàng & XP hoặc từ chối để đón khách tiếp theo.
 */

import { NPC_CUSTOMERS, getUnlockedResourcesForLevel } from "../data/orderBoardConfig.js";
import { RESOURCES_CONFIG } from "../data/resourcesConfig.js";
import { playCoinSound, playQuestRewardSound, playErrorSound, playUIClickSound, playModalOpenSound, playModalCloseSound } from "./audioEngine.js";

export class TownVisitorManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.visitors = []; // Mảng chứa các khách đang hoạt động
    this.activeModalVisitor = null;
    this.nextSpawnTimer = 6; // Khách đầu tiên ghé thăm sau 6 giây
    this.spawnIntervalSec = 60; // Chu kỳ khách ghé thăm (60s)
  }

  init(savedData = null) {
    if (savedData && Array.isArray(savedData.visitors)) {
      this.visitors = savedData.visitors;
      this.nextSpawnTimer = typeof savedData.nextSpawnTimer === "number" ? savedData.nextSpawnTimer : 20;
    }

    // Gắn sự kiện cho các nút trong Modal Mua Hàng của Khách
    const acceptBtn = document.getElementById("visitor-deal-accept-btn");
    const declineBtn = document.getElementById("visitor-deal-decline-btn");
    const closeBtn = document.getElementById("visitor-deal-modal-close");
    const backdrop = document.getElementById("town-visitor-modal");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", () => {
        if (this.activeModalVisitor) {
          this.acceptOffer(this.activeModalVisitor.id);
        }
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener("click", () => {
        if (this.activeModalVisitor) {
          this.declineOffer(this.activeModalVisitor.id);
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.closeModal();
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          this.closeModal();
        }
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.activeModalVisitor) {
        this.closeModal();
      }
    });
  }

  /**
   * Tạo một khách bộ hành mới xuất hiện ở cuối con đường (Row 31, Col 15)
   */
  spawnVisitor() {
    if (this.visitors.length >= 2) return;

    const level = this.ctx.getPlayerLevel() || 1;
    const unlocked = getUnlockedResourcesForLevel(level);

    // Chọn NPC ngẫu nhiên
    const npc = NPC_CUSTOMERS[Math.floor(Math.random() * NPC_CUSTOMERS.length)];

    // Chọn 1 món hàng NPC muốn mua
    const preferredAvailable = unlocked.filter(r => npc.preferred.includes(r));
    const pool = preferredAvailable.length > 0 ? preferredAvailable : unlocked;
    const resId = pool[Math.floor(Math.random() * pool.length)];
    const resCfg = RESOURCES_CONFIG[resId] || { sellPrice: 10, name: resId, icon: "📦" };

    // Số lượng khách cần mua (1 - 3 món)
    let qty = 1;
    if (resCfg.sellPrice <= 15) {
      qty = Math.floor(Math.random() * 3) + 2; // 2 - 4
    } else if (resCfg.sellPrice <= 40) {
      qty = Math.floor(Math.random() * 2) + 1; // 1 - 2
    }

    // Giá mua hào phóng (+30% so với Chợ)
    const rewardGold = Math.round(resCfg.sellPrice * qty * 1.3) + 8;
    const rewardXP = 8 + qty * 3;

    const dialogues = [
      `Xin chào Lãnh Chúa! Ta nghe tiếng thị trấn trù phú, ngài có thể nhượng lại cho ta ${qty} ${resCfg.name} được không?`,
      `Chào ngài! Ta vừa đi bộ đến Tòa Thị Chính, đang cần gấp ${qty} ${resCfg.name}. Ta sẽ trả giá hậu hĩnh!`,
      `Bữa cơm hôm nay của ta đang thiếu ${qty} ${resCfg.name}. Ngài có sẵn lòng chia sẻ cùng khách phương xa không?`
    ];

    const visitor = {
      id: `vis_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      npc,
      requestedItem: {
        resourceId: resId,
        name: resCfg.name,
        icon: resCfg.icon,
        amount: qty,
        rewardGold,
        rewardXP
      },
      dialogue: dialogues[Math.floor(Math.random() * dialogues.length)],
      row: 31.0,
      col: 15.0,
      targetRow: 17.6 + (this.visitors.length === 0 ? 0 : 0.6), // Đứng tại thềm quảng trường hoàng gia
      targetCol: 14.5 + (this.visitors.length === 0 ? 0 : 1.0),
      state: "walking_in", // "walking_in" | "waiting" | "walking_out"
      walkSpeed: 1.2, // ô mỗi giây (thong thả dạo bước)
      waitingTime: 0,
      heartsAnim: 0
    };

    this.visitors.push(visitor);
  }

  /**
   * Cập nhật vị trí và trạng thái của khách bộ hành
   */
  update(dt) {
    // Đếm ngược sinh khách mới
    if (this.visitors.length < 2) {
      this.nextSpawnTimer -= dt;
      if (this.nextSpawnTimer <= 0) {
        this.spawnVisitor();
        this.nextSpawnTimer = this.spawnIntervalSec + Math.random() * 20;
      }
    }

    for (let i = this.visitors.length - 1; i >= 0; i--) {
      const v = this.visitors[i];

      if (v.heartsAnim > 0) {
        v.heartsAnim -= dt * 1.5;
      }

      if (v.state === "walking_in") {
        // Đi lên dọc theo đường Col 15 tới Tòa Thị Chính
        if (v.row > v.targetRow) {
          v.row = Math.max(v.targetRow, v.row - v.walkSpeed * dt);
        } else if (v.col !== v.targetCol) {
          const dCol = v.targetCol - v.col;
          v.col += Math.sign(dCol) * Math.min(Math.abs(dCol), v.walkSpeed * dt);
        }

        if (Math.abs(v.row - v.targetRow) < 0.05 && Math.abs(v.col - v.targetCol) < 0.05) {
          v.state = "waiting";
          v.row = v.targetRow;
          v.col = v.targetCol;
        }
      } else if (v.state === "waiting") {
        v.waitingTime += dt;
        // Nếu chờ quá 180 giây mà người chơi không tiếp, khách tự quay về
        if (v.waitingTime >= 180) {
          v.state = "walking_out";
        }
      } else if (v.state === "walking_out") {
        // Quay về phía trục đường Col 15 và đi xuống Row 31
        if (Math.abs(v.col - 15.0) > 0.05) {
          const dCol = 15.0 - v.col;
          v.col += Math.sign(dCol) * Math.min(Math.abs(dCol), v.walkSpeed * dt);
        } else {
          v.row += v.walkSpeed * dt;
        }

        // Ra khỏi bản đồ (Row > 31.5)
        if (v.row >= 31.5) {
          this.visitors.splice(i, 1);
        }
      }
    }
  }

  /**
   * Mở modal thương lượng khi người chơi nhấp vào Khách
   */
  openVisitorModal(visitor) {
    if (!visitor || visitor.state !== "waiting") return;
    this.activeModalVisitor = visitor;
    playModalOpenSound();

    const modal = document.getElementById("town-visitor-modal");
    const avatarEl = document.getElementById("visitor-avatar");
    const nameEl = document.getElementById("visitor-name");
    const roleEl = document.getElementById("visitor-role");
    const dialogueEl = document.getElementById("visitor-dialogue");
    const itemIcoEl = document.getElementById("visitor-item-icon");
    const itemNameEl = document.getElementById("visitor-item-name");
    const itemStockEl = document.getElementById("visitor-item-stock");
    const rewardGoldEl = document.getElementById("visitor-reward-gold");
    const rewardXpEl = document.getElementById("visitor-reward-xp");
    const acceptBtn = document.getElementById("visitor-deal-accept-btn");

    const resources = this.ctx.getPlayerResources() || {};
    const owned = resources[visitor.requestedItem.resourceId] || 0;
    const req = visitor.requestedItem.amount;
    const hasEnough = owned >= req;

    if (avatarEl) avatarEl.textContent = visitor.npc.avatar;
    if (nameEl) nameEl.textContent = visitor.npc.name;
    if (roleEl) roleEl.textContent = visitor.npc.role;
    if (dialogueEl) dialogueEl.textContent = `"${visitor.dialogue}"`;
    if (itemIcoEl) itemIcoEl.textContent = visitor.requestedItem.icon;
    if (itemNameEl) itemNameEl.textContent = visitor.requestedItem.name;
    if (itemStockEl) {
      itemStockEl.textContent = `(Kho có: ${owned}/${req}) ${hasEnough ? '✔️' : '❌'}`;
      itemStockEl.className = `visitor-stock-badge ${hasEnough ? 'ok' : 'need'}`;
    }
    if (rewardGoldEl) rewardGoldEl.textContent = `+${visitor.requestedItem.rewardGold} 🪙`;
    if (rewardXpEl) rewardXpEl.textContent = `+${visitor.requestedItem.rewardXP} XP ⭐`;

    if (acceptBtn) {
      acceptBtn.disabled = !hasEnough;
      acceptBtn.className = `visitor-btn-accept ${hasEnough ? 'ready' : 'disabled'}`;
      acceptBtn.textContent = hasEnough ? `✅ Bán Cho Khách (+${visitor.requestedItem.rewardGold}🪙)` : `Thiếu nguyên liệu`;
    }

    if (modal) modal.classList.add("open");
  }

  closeModal() {
    const modal = document.getElementById("town-visitor-modal");
    if (modal) modal.classList.remove("open");
    playModalCloseSound();
    this.activeModalVisitor = null;
  }

  /**
   * Đồng ý bán hàng cho khách
   */
  acceptOffer(visitorId) {
    const v = this.visitors.find(vis => vis.id === visitorId);
    if (!v) return;

    const resources = this.ctx.getPlayerResources();
    const req = v.requestedItem.amount;
    const owned = resources[v.requestedItem.resourceId] || 0;

    if (owned < req) {
      playErrorSound();
      this.ctx.showToast("⚠️ Kho chưa đủ số lượng để bán cho khách!", "warning");
      return;
    }

    // Khấu trừ tài nguyên
    resources[v.requestedItem.resourceId] -= req;
    this.ctx.addPlayerGold(v.requestedItem.rewardGold);
    this.ctx.addPlayerXP(v.requestedItem.rewardXP);

    playQuestRewardSound();
    playCoinSound();

    v.heartsAnim = 1.0;
    v.state = "walking_out";

    this.ctx.updateResourcesUI();
    this.ctx.updateGoldDisplay();
    this.ctx.persistGameState();
    this.ctx.showToast(`❤️ Đã bán hàng cho ${v.npc.name}! Nhận +${v.requestedItem.rewardGold}🪙 +${v.requestedItem.rewardXP}⭐`, "success");

    this.closeModal();
  }

  /**
   * Từ chối bán hàng
   */
  declineOffer(visitorId) {
    const v = this.visitors.find(vis => vis.id === visitorId);
    if (!v) return;

    playUIClickSound();
    v.state = "walking_out";
    this.ctx.showToast(`${v.npc.name}: "Tiếc quá, hẹn gặp lại Lãnh Chúa dịp khác!"`, "info");
    this.closeModal();
  }

  /**
   * Kiểm tra nhấp chuột trên màn hình vào Khách hoặc Bong bóng mua hàng
   */
  handleClick(worldX, worldY, originX, originY, halfW, quarterW) {
    for (const v of this.visitors) {
      if (v.state !== "waiting") continue;

      const screenX = originX + (v.col - v.row) * halfW + 64;
      const screenY = originY + (v.row + v.col) * quarterW + 96;

      // Kiểm tra bán kính click quanh nhân vật và bong bóng trên đầu
      const dx = worldX - screenX;
      const dy = worldY - (screenY - 24);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 40) {
        return v;
      }
    }
    return null;
  }

  /**
   * Vẽ Khách bộ hành và Bong bóng mua hàng trên Canvas
   */
  render(c2d, originX, originY, halfW, quarterW, animTime, opts = {}) {
    for (const v of (opts.only ? [opts.only] : this.visitors)) {
      const screenX = originX + (v.col - v.row) * halfW + 64;
      const screenY = originY + (v.row + v.col) * quarterW + 96;

      c2d.save();

      // Bóng dưới chân
      c2d.fillStyle = "rgba(0, 0, 0, 0.25)";
      c2d.beginPath();
      c2d.ellipse(screenX, screenY + 2, 7, 3.5, 0, 0, Math.PI * 2);
      c2d.fill();

      // Hiệu ứng bước đi
      const isWalking = v.state === "walking_in" || v.state === "walking_out";
      const walkBob = isWalking ? Math.abs(Math.sin(animTime * 8.0)) * 2.5 : 0;
      const charY = screenY - 14 - walkBob;

      // Thân nhân vật
      c2d.fillStyle = v.npc.accentColor || "#3b82f6";
      c2d.beginPath();
      c2d.arc(screenX, charY + 5, 5.5, 0, Math.PI * 2);
      c2d.fill();

      // Đầu nhân vật
      c2d.fillStyle = "#ffedd5";
      c2d.beginPath();
      c2d.arc(screenX, charY - 2, 4.5, 0, Math.PI * 2);
      c2d.fill();

      // Nón / Tóc
      c2d.fillStyle = "#78350f";
      c2d.beginPath();
      c2d.arc(screenX, charY - 4.5, 4, Math.PI, Math.PI * 2);
      c2d.fill();

      const drawOverlay = () => {
        c2d.save();
        // Trái tim khi bán hàng thành công
        if (v.heartsAnim > 0) {
          const heartY = charY - 26 - (1 - v.heartsAnim) * 12;
          c2d.font = "14px sans-serif";
          c2d.textAlign = "center";
          c2d.fillText("❤️", screenX, heartY);
        }

        // Bong bóng mua hàng (khi đang đứng chờ tại Tòa Thị Chính)
        if (v.state === "waiting") {
          const bounceY = Math.sin(animTime * 4.0) * 3;
          const bubbleX = screenX;
          const bubbleY = charY - 22 + bounceY;

          // Vẽ bong bóng trắng viền vàng
          c2d.fillStyle = "#ffffff";
          c2d.strokeStyle = "#f59e0b";
          c2d.lineWidth = 1.8;
          c2d.beginPath();
          c2d.roundRect(bubbleX - 18, bubbleY - 10, 36, 20, 10);
          c2d.fill();
          c2d.stroke();

          // Đuôi bong bóng
          c2d.beginPath();
          c2d.moveTo(bubbleX - 3, bubbleY + 10);
          c2d.lineTo(bubbleX, bubbleY + 14);
          c2d.lineTo(bubbleX + 3, bubbleY + 10);
          c2d.fill();
          c2d.stroke();

          // Icon món hàng và số lượng
          c2d.font = "11px sans-serif";
          c2d.textAlign = "center";
          c2d.textBaseline = "middle";
          c2d.fillStyle = "#1e293b";
          c2d.fillText(`${v.requestedItem.icon}×${v.requestedItem.amount}`, bubbleX, bubbleY);
        }

        c2d.restore();
      };
      if (opts.deferOverlay) opts.deferOverlay(drawOverlay);
      else drawOverlay();
      c2d.restore();
    }
  }

  getSaveState() {
    return {
      visitors: this.visitors.map(v => ({
        id: v.id,
        npc: v.npc,
        requestedItem: v.requestedItem,
        dialogue: v.dialogue,
        row: v.row,
        col: v.col,
        targetRow: v.targetRow,
        targetCol: v.targetCol,
        state: v.state,
        walkSpeed: v.walkSpeed,
        waitingTime: v.waitingTime
      })),
      nextSpawnTimer: this.nextSpawnTimer
    };
  }
}
