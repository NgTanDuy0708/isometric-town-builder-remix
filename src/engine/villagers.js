// Villager Simulation, Living World Entities, and A* Path Walking for Isometric Kingdom

import { findPathAStar, findAdjacentRoadCells, getAllWalkableRoads, getRandomConnectedRoadCell } from './pathfinding.js';

export const VILLAGER_NAMES_BY_ROLE = {
  farmer: ["Bác Pierre", "Jean Nông Dân", "Bác Tám Lúa", "Marie Vựa Thóc"],
  baker: ["Bé Anna Bánh Mì", "Cô Ba Lò Nướng", "Henri Bánh Mật", "Lara Tiệm Bánh"],
  blacksmith: ["Chú Donald", "Thợ Rèn Goran", "Vulkan Sắt Thép", "Bác Sáu Lò Lửa"],
  herbalist: ["Dược Sư Elena", "Cô Lyra Thảo Dược", "Lão Y Sĩ Cedric"],
  innkeeper: ["Bác Arthur Quán Trọ", "Chị Rosa Lữ Quán", "Tom Rót Bia"],
  citizen: ["Bé Bím Tóc Mia", "Cậu Bé Lucas", "Sophie Dạo Phố", "Ông Lão Barnaby", "Oliver Khám Phá"]
};

export const VILLAGER_DIALOGUES_BY_ROLE = {
  farmer: [
    "🌾 Lúa mì vụ này hạt nào hạt nấy mẩy tròn, bội thu vang dội!",
    "🌾 Vừa chuyển xong mấy bao lúa sang lò nướng bánh, thơm phức!",
    "🌾 Đất lành chim đậu, cánh đồng làng ta trù phú nhất vùng!"
  ],
  baker: [
    "🍞 Mẻ bánh mì nóng hổi vừa ra lò, vỏ giòn rụm ruột thơm mềm!",
    "🍞 Hôm nay khách ghé quán trọ đông quá, phải nướng gấp đôi mẻ lúa!",
    "🍞 Bánh mì bơ mật ong là món khoái khẩu của cả làng đấy!"
  ],
  blacksmith: [
    "⚒️ Lửa lò rèn bễ thổi ngày đêm, sắt thép tôi luyện thành khí cụ tốt!",
    "⚒️ Vừa rèn xong bộ cuốc xẻng sắc bén cho đội công nhân khai hoang!",
    "⚒️ Tiếng búa đập đe keng keng vang lừng cả một góc vương quốc!"
  ],
  herbalist: [
    "🌿 Vườn ươm kính đang đơm hoa thảo dược quý hiếm nhất triều đình!",
    "🧪 Thuốc dưỡng sinh từ hoa cỏ giúp bà con dân làng luôn dồi dào sức khỏe!",
    "✨ Hương hoa nhài và thảo mộc thơm ngát cả con đường làng!"
  ],
  innkeeper: [
    "🍺 Rót bia đầy ly nào anh em! Quán trọ Tudor luôn rộng cửa đón khách!",
    "🪙 Doanh thu lữ quán hôm nay vượt chỉ tiêu, cảm ơn Lãnh chúa sáng suốt!",
    "🎶 Tối nay trong quán có ban nhạc du ca gảy đàn vui nhộn lắm đấy!"
  ],
  citizen: [
    "🚶 Đường sá lát đá sạch bóng thế này đi dạo thích mê!",
    "🌸 Mấy khóm hoa cúc dại ven đường nở rộ đẹp mắt quá!",
    "👑 Thần rất tự hào khi được sống trong một vương quốc phồn thịnh thế này!",
    "🏘️ Nhà cửa ngày một khang trang, làng mình sắp thành đại đô thị tráng lệ rồi!"
  ]
};

const ROLE_COLORS = {
  farmer: { tunic: "#15803d", hat: "#ca8a04", accessory: "🌾" },
  baker: { tunic: "#ea580c", hat: "#fef08a", accessory: "🍞" },
  blacksmith: { tunic: "#991b1b", hat: "#52525b", accessory: "⚒️" },
  herbalist: { tunic: "#059669", hat: "#a7f3d0", accessory: "🌿" },
  innkeeper: { tunic: "#b45309", hat: "#fde047", accessory: "🍺" },
  citizen: { tunic: "#2563eb", hat: "#93c5fd", accessory: "" }
};

const EXTRA_CITIZEN_COLORS = ["#7c3aed", "#db2777", "#0d9488", "#4f46e5", "#c026d3"];

// Bộ sprite dân làng (đã crop sát viền + chuẩn hoá cao 200px).
export const VILLAGER_SPRITES = {
  farmer_young: "/assets/villagers/farmer_young.png",
  farmer_old: "/assets/villagers/farmer_old.png",
  farmer_girl: "/assets/villagers/farmer_girl.png",
  woman: "/assets/villagers/woman.png",
  blacksmith: "/assets/villagers/blacksmith.png",
  merchant: "/assets/villagers/merchant.png"
};

const ROLE_SPRITE_POOL = {
  farmer: ["farmer_young", "farmer_old", "farmer_girl", "woman"],
  baker: ["woman", "merchant"],
  blacksmith: ["blacksmith"],
  herbalist: ["woman", "farmer_girl"],
  innkeeper: ["merchant", "farmer_old"],
  citizen: ["farmer_young", "farmer_girl", "woman", "merchant", "farmer_old"]
};

const VILLAGER_SPRITE_HEIGHT = 40; // chiều cao nhân vật trong world px

export class VillagerManager {
  constructor() {
    this.villagers = [];
    this.selectedVillager = null;
    this.speechBubble = null; // { text, villagerId, expiresAt }
    this.nextId = 1;
    this.lastGridVersion = 0;

    // Preload sprite dân làng (canvas sẽ tự vẽ lại khi ảnh decode xong).
    this.spriteImages = {};
    for (const [key, src] of Object.entries(VILLAGER_SPRITES)) {
      const img = new Image();
      img.src = src;
      this.spriteImages[key] = img;
    }
  }

  /**
   * Helper to check if a tile is a road
   */
  isRoadTile(tileId, tileMap) {
    if (!tileId) return false;
    const t = tileMap[tileId];
    if (t && t.category === "road") return true;
    return tileId.startsWith("r0") || tileId.startsWith("r1") || tileId.startsWith("r2") || tileId.startsWith("r3");
  }

  /**
   * Check if a cell is road and on unlocked land
   */
  isWalkableRoad(r, c, grid, tileMap, isUnlockedFn) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;
    if (isUnlockedFn && !isUnlockedFn(r, c)) return false;
    const tid = grid[r][c];
    return this.isRoadTile(tid, tileMap);
  }

  /**
   * Determine role and visual style based on nearby building or home
   */
  createVillager(startCell, roleType = null) {
    const roles = ["farmer", "baker", "blacksmith", "herbalist", "innkeeper", "citizen", "citizen"];
    const role = roleType || roles[Math.floor(Math.random() * roles.length)];
    const names = VILLAGER_NAMES_BY_ROLE[role] || VILLAGER_NAMES_BY_ROLE.citizen;
    const name = names[Math.floor(Math.random() * names.length)];

    let baseStyle = ROLE_COLORS[role] || ROLE_COLORS.citizen;
    let tunicColor = baseStyle.tunic;
    if (role === "citizen") {
      tunicColor = EXTRA_CITIZEN_COLORS[Math.floor(Math.random() * EXTRA_CITIZEN_COLORS.length)];
    }

    const dialogues = VILLAGER_DIALOGUES_BY_ROLE[role] || VILLAGER_DIALOGUES_BY_ROLE.citizen;
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    const spritePool = ROLE_SPRITE_POOL[role] || ROLE_SPRITE_POOL.citizen;
    const spriteKey = spritePool[Math.floor(Math.random() * spritePool.length)];

    return {
      id: `v_${this.nextId++}`,
      name,
      role,
      tunicColor,
      hatColor: baseStyle.hat,
      accessory: baseStyle.accessory,
      spriteKey,
      r: startCell.r,
      c: startCell.c,
      targetR: startCell.r,
      targetC: startCell.c,
      path: [],
      speed: 1.1 + Math.random() * 0.45, // 1.1 to 1.55 cells per second
      state: "walking", // "walking" | "visiting"
      stateTimer: 0,
      facing: "SE", // "SE" | "SW" | "NE" | "NW"
      walkPhase: Math.random() * 10,
      destinationName: "Đường làng",
      dialogue,
      bounce: 0
    };
  }

  /**
   * Find suitable POI destination (windmill, bakery, tavern, forge, etc.) or random road
   */
  findNewPathForVillager(villager, grid, tileMap, isUnlockedFn) {
    const walkCheck = (r, c) => this.isWalkableRoad(r, c, grid, tileMap, isUnlockedFn);
    const start = { r: Math.round(villager.r), c: Math.round(villager.c) };

    // If current position isn't walkable (road destroyed), find closest road
    if (!walkCheck(start.r, start.c)) {
      const allRoads = getAllWalkableRoads(grid, walkCheck);
      if (allRoads.length === 0) return;
      const closest = allRoads[Math.floor(Math.random() * allRoads.length)];
      villager.r = closest.r;
      villager.c = closest.c;
      villager.targetR = closest.r;
      villager.targetC = closest.c;
      start.r = closest.r;
      start.c = closest.c;
    }

    // Try to find a path to a thematic building destination based on role!
    let targetBuildingId = null;
    let destLabel = "Đường làng";

    if (villager.role === "farmer" && Math.random() < 0.6) {
      targetBuildingId = "b04_windmill";
      destLabel = "Cối xay gió 🌾";
    } else if (villager.role === "baker" && Math.random() < 0.6) {
      targetBuildingId = "b06_bakery";
      destLabel = "Tiệm bánh làng 🍞";
    } else if (villager.role === "blacksmith" && Math.random() < 0.6) {
      targetBuildingId = "b03_blacksmith_forge";
      destLabel = "Lò rèn đe búa ⚒️";
    } else if (villager.role === "innkeeper" && Math.random() < 0.6) {
      targetBuildingId = "b02_tudor_inn";
      destLabel = "Quán trọ Tudor 🍺";
    } else if (villager.role === "herbalist" && Math.random() < 0.6) {
      targetBuildingId = "b07_apothecary";
      destLabel = "Vườn thảo dược 🌿";
    }

    let foundTargetCell = null;
    if (targetBuildingId) {
      // Find building coordinates on grid
      const candidates = [];
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
          if (grid[r][c] === targetBuildingId && (!isUnlockedFn || isUnlockedFn(r, c))) {
            const adjRoads = findAdjacentRoadCells(grid, r, c, walkCheck);
            if (adjRoads.length > 0) {
              candidates.push(adjRoads[Math.floor(Math.random() * adjRoads.length)]);
            }
          }
        }
      }
      if (candidates.length > 0) {
        foundTargetCell = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    let path = null;
    if (foundTargetCell) {
      path = findPathAStar(grid, start, foundTargetCell, walkCheck);
    }

    // Fallback: pick a connected road wander
    if (!path || path.length <= 1) {
      const wander = getRandomConnectedRoadCell(grid, start, walkCheck, 8);
      if (wander && wander.path && wander.path.length > 1) {
        path = wander.path;
        destLabel = "Dạo mát trên đường";
      }
    }

    if (path && path.length > 1) {
      // Drop start node
      path.shift();
      villager.path = path;
      villager.destinationName = destLabel;
      villager.state = "walking";
    } else {
      // Idle for a moment
      villager.state = "visiting";
      villager.stateTimer = 2.0 + Math.random() * 2.0;
    }
  }

  /**
   * Update all villagers positions and paths
   */
  update(dt, grid, tileMap, isUnlockedFn, villageStats) {
    const walkCheck = (r, c) => this.isWalkableRoad(r, c, grid, tileMap, isUnlockedFn);
    const allRoads = getAllWalkableRoads(grid, walkCheck);

    if (allRoads.length === 0) {
      this.villagers = [];
      return;
    }

    // Desired villagers based on population:
    // Minimum 2 explorers (if roads exist), up to 14 active villagers for rich lively kingdom
    const pop = (villageStats && villageStats.population) ? villageStats.population : 4;
    const targetCount = Math.min(14, Math.max(2, Math.floor(pop / 2.5)));

    // Spawn if needed
    while (this.villagers.length < targetCount) {
      const spawnCell = allRoads[Math.floor(Math.random() * allRoads.length)];
      const villager = this.createVillager(spawnCell);
      this.findNewPathForVillager(villager, grid, tileMap, isUnlockedFn);
      this.villagers.push(villager);
    }

    // Prune excess if population shrunk heavily
    if (this.villagers.length > targetCount + 2) {
      this.villagers.splice(targetCount);
    }

    // Update each villager
    const now = performance.now();
    for (const v of this.villagers) {
      if (v.bounce > 0) {
        v.bounce = Math.max(0, v.bounce - dt * 3.0);
      }

      if (v.state === "visiting") {
        v.stateTimer -= dt;
        if (v.stateTimer <= 0) {
          this.findNewPathForVillager(v, grid, tileMap, isUnlockedFn);
        }
        continue;
      }

      // Moving along path
      if (!v.path || v.path.length === 0) {
        v.state = "visiting";
        v.stateTimer = 1.5 + Math.random() * 2.5;
        continue;
      }

      const nextNode = v.path[0];
      const dr = nextNode.r - v.r;
      const dc = nextNode.c - v.c;
      const dist = Math.sqrt(dr * dr + dc * dc);

      // Determine facing direction
      if (Math.abs(dc) >= Math.abs(dr)) {
        v.facing = dc > 0 ? "SE" : "NW";
      } else {
        v.facing = dr > 0 ? "SW" : "NE";
      }

      const step = v.speed * dt;
      v.walkPhase += step * 5.0;

      if (dist <= step) {
        // Reached next node
        v.r = nextNode.r;
        v.c = nextNode.c;
        v.path.shift();

        if (v.path.length === 0) {
          v.state = "visiting";
          v.stateTimer = 2.5 + Math.random() * 3.0;
          this.checkVillagerNearbyActivity(v, grid);
        }
      } else {
        v.r += (dr / dist) * step;
        v.c += (dc / dist) * step;
        if (!v.activityCheckTimer) v.activityCheckTimer = 0;
        v.activityCheckTimer += dt;
        if (v.activityCheckTimer >= 1.0) {
          v.activityCheckTimer = 0;
          this.checkVillagerNearbyActivity(v, grid);
        }
      }
    }

    // Expire speech bubble
    if (this.speechBubble && now > this.speechBubble.expiresAt) {
      this.speechBubble = null;
    }
  }

  /**
   * Quét các công trình lân cận trong bán kính 2 ô để kích hoạt hành vi tương tác vị trí
   */
  checkVillagerNearbyActivity(v, grid) {
    const currR = Math.round(v.r);
    const currC = Math.round(v.c);
    v.activityIcon = null;
    v.activityQuote = null;

    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const nr = currR + dr;
        const nc = currC + dc;
        if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
          const tid = grid[nr][nc];
          if (!tid) continue;
          if (tid.includes("inn") || tid === "b02_tudor_inn") {
            v.activityIcon = "🍻";
            v.activityQuote = "🍻 Dzô! Cụng ly nào anh em! Quán trọ Tudor bia ngon tuyệt hảo!";
            return;
          } else if (tid.includes("fountain") || tid === "d01_plaza_fountain") {
            v.activityIcon = "⛲";
            v.activityQuote = "⛲ Nước phun mát rượi, ngắm đài phun nước trung tâm thư thái quá!";
            return;
          } else if (tid.includes("park") || tid.includes("bench") || tid === "d04_oak_tree_park" || tid === "d05_pine_grove") {
            v.activityIcon = "🪑";
            v.activityQuote = "🪑 Ngồi ghế đá bóng mát công viên, nghe chim hót thật yên bình!";
            return;
          } else if (tid.includes("well") || tid === "d02_village_well") {
            v.activityIcon = "💧";
            v.activityQuote = "💧 Múc gàu nước giếng làng trong vắt mát lạnh giải khát!";
            return;
          } else if (tid === "b14_town_hall") {
            v.activityIcon = "👑";
            v.activityQuote = "👑 Tòa thị chính uy nghiêm quá! Chào ngài thị trưởng kính mến!";
            return;
          }
        }
      }
    }
  }

  /**
   * Render villagers on the isometric canvas
   */
  render(ctx, originX, originY, halfW, quarterW, animTime, zoom, opts = {}) {
    if (this.villagers.length === 0) return;

    // Sort villagers by isometric depth (r + c) so they occlude correctly
    const sorted = opts.only ? [opts.only] : [...this.villagers].sort((a, b) => (a.r + a.c) - (b.r + b.c));

    for (const v of sorted) {
      // Screen coordinates in isometric 2:1 dimetric space
      const screenX = originX + (v.c - v.r) * halfW + 64;
      const screenY = originY + (v.r + v.c) * quarterW + 96;

      ctx.save();

      // Shadow under villager feet
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 1, 6.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Walking bounce & click bounce
      const walkBob = (v.state === "walking") ? Math.abs(Math.sin(v.walkPhase)) * 2.2 : 0;
      const clickBounce = v.bounce > 0 ? Math.sin(v.bounce * Math.PI) * 10 : 0;
      const charY = screenY - walkBob - clickBounce;

      // Sprite dân làng (thay cho hình vẽ procedural trước đây)
      const spriteImg = this.spriteImages ? this.spriteImages[v.spriteKey] : null;
      const spriteReady = spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0;

      if (spriteReady) {
        const spriteH = VILLAGER_SPRITE_HEIGHT;
        const spriteW = spriteH * (spriteImg.naturalWidth / spriteImg.naturalHeight);
        const faceLeft = v.facing === "NW" || v.facing === "SW";
        ctx.save();
        ctx.translate(screenX, charY);
        if (faceLeft) ctx.scale(-1, 1);
        ctx.drawImage(spriteImg, -spriteW / 2, -spriteH, spriteW, spriteH);
        ctx.restore();
      } else {
        // Fallback khi ảnh chưa decode xong: silhouette tối giản để dân không bị vô hình.
        ctx.fillStyle = "#27272a";
        ctx.fillRect(screenX - 3, charY - 16, 6, 16);
        ctx.fillStyle = v.tunicColor || "#15803d";
        ctx.beginPath();
        ctx.roundRect(screenX - 5, charY - 28, 10, 14, 3);
        ctx.fill();
        ctx.fillStyle = "#fcd34d";
        ctx.beginPath();
        ctx.arc(screenX, charY - 31, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = v.hatColor || "#78350f";
        ctx.beginPath();
        ctx.ellipse(screenX, charY - 33, 6.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const drawOverlay = () => {
        ctx.save();
        // Biểu tượng hoạt động vị trí (cụng ly 🍻, ngắm đài phun nước ⛲, ngồi ghế đá 🪑, giếng làng 💧)
        if (v.activityIcon && (!this.speechBubble || this.speechBubble.villagerId !== v.id)) {
          const floatY = charY - 52 + Math.sin(performance.now() * 0.005 + v.id) * 2.5;
          // Bong bóng tròn nổi bật
          ctx.save();
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 1.5;
          ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(screenX, floatY, 9.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Mũi tên nhỏ trỏ xuống đầu cư dân
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(screenX - 2.5, floatY + 9);
          ctx.lineTo(screenX + 2.5, floatY + 9);
          ctx.lineTo(screenX, floatY + 12);
          ctx.closePath();
          ctx.fill();

          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(v.activityIcon, screenX, floatY);
          ctx.restore();
        }

        // Selected villager indicator ring
        if (this.selectedVillager && this.selectedVillager.id === v.id) {
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(screenX, screenY + 1, 9, 4.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Dialogue speech bubble if active
        if (this.speechBubble && this.speechBubble.villagerId === v.id) {
          const bubbleW = 140;
          const bubbleH = 26;
          const bX = screenX;
          const bY = charY - 52;

          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 1.5;

          // Bubble rounded box
          ctx.beginPath();
          ctx.roundRect(bX - bubbleW / 2, bY - bubbleH, bubbleW, bubbleH, 6);
          ctx.fill();
          ctx.stroke();

          // Little pointer arrow
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(bX - 4, bY);
          ctx.lineTo(bX + 4, bY);
          ctx.lineTo(bX, bY + 5);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = "#f59e0b";
          ctx.beginPath();
          ctx.moveTo(bX - 4, bY);
          ctx.lineTo(bX, bY + 5);
          ctx.lineTo(bX + 4, bY);
          ctx.stroke();

          // Dialogue text
          ctx.font = "600 8.5px system-ui, -apple-system, sans-serif";
          ctx.fillStyle = "#1e293b";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          let displayText = this.speechBubble.text;
          if (displayText.length > 28) {
            displayText = displayText.slice(0, 26) + "...";
          }
          ctx.fillText(displayText, bX, bY - bubbleH / 2);
        }

        ctx.restore();
      };
      if (opts.deferOverlay) opts.deferOverlay(drawOverlay);
      else drawOverlay();
      ctx.restore();
    }
  }

  /**
   * Handle canvas click to interact with villagers
   */
  handleClick(screenX, screenY, originX, originY, halfW, quarterW) {
    const hitRadius = 20;

    for (let i = this.villagers.length - 1; i >= 0; i--) {
      const v = this.villagers[i];
      const vx = originX + (v.c - v.r) * halfW + 64;
      const vy = originY + (v.r + v.c) * quarterW + 74;

      const dist = Math.hypot(screenX - vx, screenY - vy);
      if (dist <= hitRadius) {
        this.selectedVillager = v;
        v.bounce = 1.0;

        // Ưu tiên câu thoại hoạt động vị trí (quán trọ, đài phun nước, công viên)
        let quote = v.activityQuote || null;
        if (!quote && this.customDialogueProvider) {
          quote = this.customDialogueProvider(v.role);
        }
        if (!quote) {
          const dialogues = VILLAGER_DIALOGUES_BY_ROLE[v.role] || VILLAGER_DIALOGUES_BY_ROLE.citizen;
          quote = dialogues[Math.floor(Math.random() * dialogues.length)];
        }

        this.speechBubble = {
          villagerId: v.id,
          text: quote,
          expiresAt: performance.now() + 4500
        };

        return {
          hit: true,
          villager: v,
          quote
        };
      }
    }

    this.selectedVillager = null;
    return { hit: false };
  }
}
