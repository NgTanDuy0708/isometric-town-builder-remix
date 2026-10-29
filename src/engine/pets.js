// Pet Simulation & Interactive Living Companions for Isometric Island
// Thú cưng đi dạo trên đảo: Chó 🐶, Mèo 🐱, Thỏ 🐰, Ngựa 🐴

import {
  playDogBarkSound,
  playCatMeowSound,
  playRabbitSqueakSound,
  playHorseNeighSound
} from './audioEngine.js';

export const PET_TYPES = {
  dog: {
    id: "dog",
    name: "Cún Milo",
    species: "Chó Shiba/Golden",
    icon: "🐶",
    baseSpeed: 0.85,
    quotes: [
      "Gâu gâu! (vẫy tít đuôi chạy lại dụi đầu vào chân bạn) ❤️",
      "Gâu! (ngước đôi mắt tròn xoe xin bạn thưởng bánh quy)",
      "Gâu gâu gâu! (chạy vòng tròn vui mừng khi thấy chủ nhân)"
    ]
  },
  cat: {
    id: "cat",
    name: "Mèo Mướp Tom",
    species: "Mèo Tam Thể",
    icon: "🐱",
    baseSpeed: 0.65,
    quotes: [
      "Meo meo~ (cọ má vào tay bạn đòi vuốt ve) ❤️",
      "Meooo~ (nằm lăn ra bãi cỏ phơi bụng tắm nắng sớm)",
      "Grừ grừ... (tiếng rù rù thỏa mãn khi được xoa cằm)"
    ]
  },
  rabbit: {
    id: "rabbit",
    name: "Thỏ Bông Snow",
    species: "Thỏ Trắng Tuyết",
    icon: "🐰",
    baseSpeed: 0.95,
    quotes: [
      "Chít chít! (vểnh đôi tai dài ngửi ngửi mùi cà rốt tươi) 🥕",
      "Hop hop! (nhảy nhót tung tăng trên thảm hoa dại rực rỡ) ❤️",
      "Chít! (dụi cái mũi hồng xinh xắn vào mu bàn tay bạn)"
    ]
  },
  horse: {
    id: "horse",
    name: "Bạch Mã Pegasus",
    species: "Ngựa Trắng Hoàng Gia",
    icon: "🐴",
    baseSpeed: 1.1,
    quotes: [
      "Híii~ (bạch mã dũng mãnh giậm móng cộp cộp chào mừng) ✨",
      "Hí vang! (vẫy chiếc bờm bạch kim óng ả đầy kiêu hãnh) ❤️",
      "Khịt khịt... (ngựa hiền lành cúi đầu để bạn xoa bờm)"
    ]
  }
};

/**
 * Kiểm tra ô đất có thể cho thú cưng đi dạo hay không:
 * Bao gồm đường đi lát đá, đồng cỏ, công viên, bờ biển
 */
export function isPetWalkableTile(tid) {
  if (!tid) return false;
  // Đường đi
  if (tid.startsWith('r') || tid.startsWith('c09') || tid.startsWith('c10')) return true;
  // Bãi cỏ, công viên, vườn hoa, đất cát
  if (
    tid === 'd12_meadow_wildflowers' ||
    tid === 'd04_oak_tree_park' ||
    tid === 'd05_pine_grove' ||
    tid === 'd06_cherry_garden' ||
    tid === 'd10_flower_orchard_hedge' ||
    tid === 'd01_plaza_fountain' ||
    tid === 'd02_village_well' ||
    tid === 'd08_stone_statue_plaza' ||
    tid === 'm01_sandy_beach_s' ||
    tid === 's10_meadow_wildflowers_v1' ||
    tid === 's12_meadow_stepping_stones_v3'
  ) {
    return true;
  }
  return false;
}

export class PetManager {
  constructor() {
    this.pets = [];
    this.speechBubble = null;
    this.hearts = []; // Trái tim bay lơ lửng { x, y, vy, alpha, life }
    this.lastPetTime = 0;
  }

  /**
   * Khởi tạo hoặc cập nhật đàn thú cưng trên đảo
   */
  initPets(unlockedCells) {
    if (this.pets.length > 0) return;
    if (!unlockedCells || unlockedCells.length === 0) return;

    const petConfigs = [
      { type: "dog", name: "Cún Milo" },
      { type: "cat", name: "Mèo Tom" },
      { type: "rabbit", name: "Thỏ Snow" },
      { type: "horse", name: "Ngựa Pegasus" }
    ];

    petConfigs.forEach((cfg, idx) => {
      const cell = unlockedCells[(idx * 7 + 3) % unlockedCells.length];
      this.pets.push({
        id: `pet_${cfg.type}_${idx}`,
        type: cfg.type,
        name: cfg.name,
        r: cell.r,
        c: cell.c,
        targetR: cell.r,
        targetC: cell.c,
        state: "idle", // 'idle', 'walking', 'sleeping'
        facing: idx % 2 === 0 ? "right" : "left",
        stateTimer: 2.0 + Math.random() * 3.0,
        walkPhase: Math.random() * Math.PI * 2,
        bounce: 0,
        lastInteraction: 0
      });
    });
  }

  /**
   * Cập nhật chuyển động và trạng thái thú cưng
   */
  update(dt, grid, isUnlockedFn) {
    if (!grid || grid.length === 0) return;
    const ROWS = grid.length;
    const COLS = grid[0].length;

    // 1. Cập nhật bong bóng thoại
    if (this.speechBubble && performance.now() > this.speechBubble.expiresAt) {
      this.speechBubble = null;
    }

    // 2. Cập nhật hiệu ứng tim bay
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const h = this.hearts[i];
      h.y += h.vy * dt;
      h.x += Math.sin(h.life * 5) * 12 * dt;
      h.life += dt;
      h.alpha = Math.max(0, 1 - h.life / 1.5);
      if (h.life >= 1.5) {
        this.hearts.splice(i, 1);
      }
    }

    // 3. Nếu chưa có thú cưng, tìm các ô hợp lệ để spawn
    if (this.pets.length === 0) {
      const walkableCells = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (isUnlockedFn && !isUnlockedFn(r, c)) continue;
          if (isPetWalkableTile(grid[r][c])) {
            walkableCells.push({ r, c });
          }
        }
      }
      if (walkableCells.length >= 4) {
        this.initPets(walkableCells);
      }
      return;
    }

    // 4. Update từng thú cưng
    for (const pet of this.pets) {
      // Giảm độ nảy click bounce
      if (pet.bounce > 0) {
        pet.bounce = Math.max(0, pet.bounce - dt * 3.5);
      }

      const pCfg = PET_TYPES[pet.type] || PET_TYPES.dog;
      pet.stateTimer -= dt;

      if (pet.state === "walking") {
        pet.walkPhase += dt * 6.5;

        // Tiến về targetR, targetC
        const dr = pet.targetR - pet.r;
        const dc = pet.targetC - pet.c;
        const dist = Math.hypot(dr, dc);
        const speed = pCfg.baseSpeed * dt;

        if (dist <= speed || dist < 0.05) {
          pet.r = pet.targetR;
          pet.c = pet.targetC;
          // Đến đích, đổi sang nghỉ ngơi hoặc ngủ
          pet.state = Math.random() < 0.35 && pet.type === "cat" ? "sleeping" : "idle";
          pet.stateTimer = 2.0 + Math.random() * 4.0;
        } else {
          pet.r += (dr / dist) * speed;
          pet.c += (dc / dist) * speed;
          pet.facing = dc >= dr ? "right" : "left";
        }
      } else {
        // Đang Idle hoặc Sleeping
        pet.walkPhase += dt * 2.0;

        if (pet.stateTimer <= 0) {
          // Tìm ô tiếp theo để đi dạo
          const curR = Math.round(pet.r);
          const curC = Math.round(pet.c);

          const neighbors = [
            { r: curR + 1, c: curC },
            { r: curR - 1, c: curC },
            { r: curR, c: curC + 1 },
            { r: curR, c: curC - 1 }
          ].filter(n => {
            if (n.r < 0 || n.r >= ROWS || n.c < 0 || n.c >= COLS) return false;
            if (isUnlockedFn && !isUnlockedFn(n.r, n.c)) return false;
            return isPetWalkableTile(grid[n.r][n.c]);
          });

          if (neighbors.length > 0) {
            const nextCell = neighbors[Math.floor(Math.random() * neighbors.length)];
            pet.targetR = nextCell.r;
            pet.targetC = nextCell.c;
            pet.state = "walking";
            pet.stateTimer = 6.0;
          } else {
            // Không có ô lân cận, tiếp tục chờ
            pet.stateTimer = 3.0;
          }
        }
      }
    }
  }

  /**
   * Xử lý tương tác khi người chơi nhấp chuột vào thú cưng
   */
  handleClick(worldX, worldY, originX, originY, halfW, quarterW) {
    const hitRadius = 22;

    for (let i = this.pets.length - 1; i >= 0; i--) {
      const pet = this.pets[i];
      const sx = originX + (pet.c - pet.r) * halfW + 64;
      const sy = originY + (pet.r + pet.c) * quarterW + 90;

      const dist = Math.hypot(worldX - sx, worldY - sy);
      if (dist <= hitRadius) {
        pet.bounce = 1.0;
        pet.state = "idle";
        pet.stateTimer = 3.5;

        // Phát âm thanh tiếng kêu tương ứng
        if (pet.type === "dog") playDogBarkSound();
        else if (pet.type === "cat") playCatMeowSound();
        else if (pet.type === "rabbit") playRabbitSqueakSound();
        else if (pet.type === "horse") playHorseNeighSound();

        // Tạo chùm tim bay ❤️
        for (let k = 0; k < 4; k++) {
          this.hearts.push({
            x: sx + (Math.random() * 20 - 10),
            y: sy - 10 + (Math.random() * 10 - 5),
            vy: -35 - Math.random() * 25,
            alpha: 1.0,
            life: 0
          });
        }

        // Hiện câu thoại tình cảm
        const pCfg = PET_TYPES[pet.type] || PET_TYPES.dog;
        const quote = pCfg.quotes[Math.floor(Math.random() * pCfg.quotes.length)];
        this.speechBubble = {
          petId: pet.id,
          name: pet.name,
          icon: pCfg.icon,
          text: quote,
          expiresAt: performance.now() + 4000
        };

        const now = performance.now();
        const canReward = now - (pet.lastInteraction || 0) > 4000;
        if (canReward) {
          pet.lastInteraction = now;
        }

        return {
          hit: true,
          pet,
          quote,
          rewardGold: canReward ? 10 : 0,
          rewardXP: canReward ? 15 : 0
        };
      }
    }

    return null;
  }

  /**
   * Render hoạt họa đàn thú cưng trên Canvas 2D
   */
  render(ctx, originX, originY, halfW, quarterW, animTime, depthFilter = null, onlyPet = null) {
    if (this.pets.length === 0) return;

    // Sắp xếp theo chiều sâu isometric (r + c)
    const sorted = onlyPet ? [onlyPet] : [...this.pets].sort((a, b) => (a.r + a.c) - (b.r + b.c));

    for (const pet of sorted) {
      if (depthFilter !== null && pet.r + pet.c !== depthFilter) continue;
      const sx = originX + (pet.c - pet.r) * halfW + 64;
      const sy = originY + (pet.r + pet.c) * quarterW + 96;

      ctx.save();

      // 1. Bóng đổ dưới chân
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.beginPath();
      const shadowW = pet.type === "horse" ? 12 : 7;
      const shadowH = pet.type === "horse" ? 6 : 3.5;
      ctx.ellipse(sx, sy + 1, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Độ nhún khi di chuyển & nhảy khi click
      const walkHop = (pet.state === "walking")
        ? Math.abs(Math.sin(pet.walkPhase)) * (pet.type === "rabbit" ? 4.5 : 2.0)
        : 0;
      const clickBounce = pet.bounce > 0 ? Math.sin(pet.bounce * Math.PI) * 12 : 0;
      const cy = sy - walkHop - clickBounce;

      const isLeft = pet.facing === "left";
      const dirScale = isLeft ? -1 : 1;

      // 3. Render chi tiết từng loài thú cưng
      ctx.translate(sx, cy);
      ctx.scale(dirScale, 1);

      if (pet.type === "dog") {
        this.renderDog(ctx, pet, animTime);
      } else if (pet.type === "cat") {
        this.renderCat(ctx, pet, animTime);
      } else if (pet.type === "rabbit") {
        this.renderRabbit(ctx, pet, animTime);
      } else if (pet.type === "horse") {
        this.renderHorse(ctx, pet, animTime);
      }

      ctx.restore();
    }

    if (depthFilter === null && !onlyPet) {
      this.renderOverlays(ctx, originX, originY, halfW, quarterW);
    }
  }

  /** Trái tim + bong bóng thoại, luôn vẽ sau cùng. */
  renderOverlays(ctx, originX, originY, halfW, quarterW) {
    // 4. Render các trái tim bay ❤️
    for (const h of this.hearts) {
      ctx.save();
      ctx.globalAlpha = h.alpha;
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("❤️", h.x, h.y);
      ctx.restore();
    }

    // 5. Render bong bóng thoại thú cưng
    if (this.speechBubble) {
      const targetPet = this.pets.find(p => p.id === this.speechBubble.petId);
      if (targetPet) {
        const bx = originX + (targetPet.c - targetPet.r) * halfW + 64;
        const by = originY + (targetPet.r + targetPet.c) * quarterW + 65;
        this.renderSpeechBubble(ctx, bx, by, this.speechBubble);
      }
    }
  }

  // --- CÁC HÀM RENDER CHI TIẾT TỪNG LOÀI ---

  renderDog(ctx, pet, animTime) {
    // Chó Cún Milo 🐶: Màu vàng Shiba/Golden, tai cụp, đuôi vẫy ngoe nguẩy
    const tailWag = Math.sin(animTime * 14) * 0.45;
    const stride = pet.state === "walking" ? Math.sin(pet.walkPhase) * 2.5 : 0;

    // Chân trước & sau
    ctx.fillStyle = "#b45309";
    ctx.fillRect(-5 + stride, -3, 2.5, 4);
    ctx.fillRect(3 - stride, -3, 2.5, 4);

    // Thân cún
    ctx.fillStyle = "#f59e0b"; // Vàng golden
    ctx.beginPath();
    ctx.roundRect(-6, -9, 12, 7, 3);
    ctx.fill();

    // Bụng trắng kem
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.roundRect(-4, -6, 7, 4, 2);
    ctx.fill();

    // Đuôi vẫy ngoe nguẩy
    ctx.save();
    ctx.translate(-6, -7);
    ctx.rotate(-0.6 + tailWag);
    ctx.fillStyle = "#d97706";
    ctx.fillRect(-4, -1.5, 5, 2.5);
    ctx.restore();

    // Đầu cún
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(4, -9, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Mõm trắng & mũi đen
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.ellipse(6, -8, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#18181b";
    ctx.fillRect(7, -9, 1.5, 1.5); // Mũi
    ctx.fillRect(4.5, -10.5, 1.5, 1.5); // Mắt

    // Tai nâu cụp
    ctx.fillStyle = "#b45309";
    ctx.beginPath();
    ctx.moveTo(2, -13);
    ctx.lineTo(4, -13);
    ctx.lineTo(3.5, -9);
    ctx.fill();
  }

  renderCat(ctx, pet, animTime) {
    // Mèo Mướp Tom 🐱: Màu cam sọc trắng, tai nhọn vểnh, đuôi lượn sóng
    const tailSway = Math.sin(animTime * 4) * 0.3;
    const stride = pet.state === "walking" ? Math.sin(pet.walkPhase) * 2.2 : 0;

    if (pet.state === "sleeping") {
      // Mèo cuộn tròn ngủ
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.arc(0, -5, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fed7aa";
      ctx.beginPath();
      ctx.arc(1, -5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Tai nhọn
      ctx.fillStyle = "#c2410c";
      ctx.beginPath();
      ctx.moveTo(-3, -10);
      ctx.lineTo(-1, -7);
      ctx.lineTo(-5, -7);
      ctx.fill();

      // "zZz"
      ctx.fillStyle = "#60a5fa";
      ctx.font = "bold 9px system-ui";
      ctx.fillText("zZz", 5, -10 + Math.sin(animTime * 3) * 1.5);
      return;
    }

    // 4 chân
    ctx.fillStyle = "#c2410c";
    ctx.fillRect(-4 + stride, -3, 2, 4);
    ctx.fillRect(2 - stride, -3, 2, 4);

    // Thân mèo thanh mảnh
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.roundRect(-5, -8, 10, 6, 3);
    ctx.fill();

    // Sọc vằn cam sẫm
    ctx.fillStyle = "#9a3412";
    ctx.fillRect(-2, -8, 1.5, 4);
    ctx.fillRect(1, -8, 1.5, 4);

    // Đuôi dài lượn cong
    ctx.save();
    ctx.translate(-5, -7);
    ctx.rotate(0.4 + tailSway);
    ctx.fillStyle = "#ea580c";
    ctx.fillRect(-5, -1.5, 6, 2);
    ctx.restore();

    // Đầu mèo & tai nhọn
    ctx.fillStyle = "#ea580c";
    ctx.beginPath();
    ctx.arc(4, -8, 4, 0, Math.PI * 2);
    ctx.fill();

    // Tai nhọn vểnh
    ctx.fillStyle = "#c2410c";
    ctx.beginPath();
    ctx.moveTo(2, -12);
    ctx.lineTo(4, -9);
    ctx.lineTo(1, -9);
    ctx.fill();

    // Mắt xanh lục long lanh & mũi hồng
    ctx.fillStyle = "#10b981"; // Mắt xanh ngọc
    ctx.fillRect(4.5, -9.5, 1.5, 1.5);
    ctx.fillStyle = "#f43f5e"; // Mũi hồng
    ctx.fillRect(6.5, -8, 1, 1);
  }

  renderRabbit(ctx, pet, animTime) {
    // Thỏ Bông Snow 🐰: Trắng tuyết mắt hồng tai dài
    const earWiggle = Math.sin(animTime * 6) * 0.15;
    const stride = pet.state === "walking" ? Math.sin(pet.walkPhase) * 2.8 : 0;

    // Chân sau khỏe bật nhảy
    ctx.fillStyle = "#e4e4e7";
    ctx.fillRect(-4 + stride, -3, 2.5, 3.5);
    ctx.fillRect(2 - stride, -3, 2.5, 3.5);

    // Đuôi tròn bông trắng
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-5.5, -5.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Thân thỏ tròn vo
    ctx.fillStyle = "#f4f4f5";
    ctx.beginPath();
    ctx.roundRect(-4.5, -8, 9, 6.5, 3);
    ctx.fill();

    // Đầu thỏ
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(3.5, -8, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Tai dài vểnh cao
    ctx.save();
    ctx.translate(2, -11);
    ctx.rotate(-0.2 + earWiggle);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-1, -6, 2.2, 6.5);
    ctx.fillStyle = "#fbcfe8"; // Lòng tai hồng phấn
    ctx.fillRect(-0.5, -5, 1.2, 5);
    ctx.restore();

    // Mắt hồng ngọc & mũi hạt gạo
    ctx.fillStyle = "#e11d48";
    ctx.fillRect(4.5, -9, 1.5, 1.5);
    ctx.fillStyle = "#fda4af";
    ctx.fillRect(6, -7.5, 1, 1);
  }

  renderHorse(ctx, pet, animTime) {
    // Bạch Mã Pegasus 🐴: Oai phong, móng guốc, bờm vàng kim
    const stride = pet.state === "walking" ? Math.sin(pet.walkPhase) * 3.5 : 0;
    const tailSway = Math.sin(animTime * 5) * 0.35;

    // 4 chân thon dài với móng guốc
    ctx.fillStyle = "#e2e8f0"; // Chân trắng
    ctx.fillRect(-7 + stride, -5, 2.5, 6);
    ctx.fillRect(4 - stride, -5, 2.5, 6);

    // Móng guốc đen
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-7 + stride, 0, 2.5, 2);
    ctx.fillRect(4 - stride, 0, 2.5, 2);

    // Thân ngựa vạm vỡ
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(-9, -14, 16, 10, 4);
    ctx.fill();

    // Yên ngựa hoàng gia đỏ nhung
    ctx.fillStyle = "#b91c1c";
    ctx.beginPath();
    ctx.roundRect(-4, -14.5, 7, 5, 2);
    ctx.fill();
    ctx.fillStyle = "#f59e0b"; // Viền vàng kim
    ctx.fillRect(-3.5, -10.5, 6, 1);

    // Đuôi ngựa dài phất phơ
    ctx.save();
    ctx.translate(-9, -11);
    ctx.rotate(0.3 + tailSway);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(-6, -1, 7, 3);
    ctx.restore();

    // Cổ & đầu ngựa ngẩng cao
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(4, -14);
    ctx.lineTo(8, -21);
    ctx.lineTo(13, -19);
    ctx.lineTo(8, -10);
    ctx.fill();

    // Bờm vàng óng ả
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(6, -21, 2.5, 8);

    // Mắt tinh anh & mũi
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(10.5, -19.5, 1.5, 1.5);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(12, -18, 1.5, 1.5);
  }

  renderSpeechBubble(ctx, x, y, bubble) {
    ctx.save();
    ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
    const title = `${bubble.icon} ${bubble.name}`;
    const textWidth = Math.max(ctx.measureText(title).width, ctx.measureText(bubble.text).width);
    const boxW = Math.min(240, textWidth + 18);
    const boxH = 42;
    const boxX = x - boxW / 2;
    const boxY = y - boxH - 10;

    // Nền bong bóng thoại bóng bẩy
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();

    // Mũi nhọn trỏ vào đầu thú cưng
    ctx.beginPath();
    ctx.moveTo(x - 5, boxY + boxH);
    ctx.lineTo(x, boxY + boxH + 6);
    ctx.lineTo(x + 5, boxY + boxH);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Viền vàng kim tinh tế
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tên thú cưng
    ctx.fillStyle = "#b45309";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(title, boxX + 8, boxY + 15);

    // Câu thoại ngộ nghĩnh
    ctx.fillStyle = "#1e293b";
    ctx.font = "500 10px system-ui, sans-serif";
    ctx.fillText(bubble.text, boxX + 8, boxY + 31, boxW - 16);

    ctx.restore();
  }
}
