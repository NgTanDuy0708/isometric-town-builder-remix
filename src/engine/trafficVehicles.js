import {drawRuntimeActor} from './runtimeArt.js';
import { drawAnimatedCharacter, getCharacterImage, characterDirection } from './characterAnimation.js';
/**
 * trafficVehicles.js - Hệ Thống Phương Tiện Giao Thông & Thuyền Bè Ngoại Khơi
 * 
 * Quản lý các phương tiện di chuyển làm sống động vương quốc:
 * 1. Xe Kéo Lúa Mì (Wheat Cart): Xe 2 bánh chở bao lúa vàng kéo trên đường làng.
 * 2. Xe Ngựa Lọc Cọc (Horse Carriage): Cỗ xe 4 bánh có ngựa phi nước kiệu trên đại lộ.
 * 3. Thuyền Đánh Cá (Fishing Boat): Thuyền gỗ giương buồm lướt sóng nhẹ nhàng ven biển.
 */

import { findPathAStar, getAllWalkableRoads, getRandomConnectedRoadCell } from './pathfinding.js';

export class VehicleManager {
  constructor() {
    this.vehicles = []; // Xe trên cạn (xe kéo, xe ngựa)
    this.boats = [];    // Thuyền trên biển
    this.nextId = 1;
    this.selectedVehicle = null;
    this.speechBubble = null;
  }

  /**
   * Khởi tạo các phương tiện và thuyền bè ban đầu
   */
  init(grid) {
    this.vehicles = [];
    this.boats = [];

    // Tạo 2 thuyền đánh cá ven biển ở ngoài khơi nước sâu (Col -2.2 và Col -3.8)
    this.boats.push({
      id: "boat_1",
      type: "fishing_boat",
      name: "Thuyền Cá Hải Vân",
      c: -2.2,
      r: 8.0,
      minR: 4.5,
      maxR: 26.5,
      speed: 0.95,
      direction: 1, // 1: đi xuống nam, -1: đi lên bắc
      bobTimer: 0,
      netTimer: 3.0,
      isCastingNet: false
    });

    this.boats.push({
      id: "boat_2",
      type: "fishing_boat",
      name: "Thuyền Cá Sóng Biếc",
      c: -3.8,
      r: 21.0,
      minR: 5.5,
      maxR: 27.5,
      speed: 0.8,
      direction: -1,
      bobTimer: Math.PI,
      netTimer: 5.5,
      isCastingNet: false
    });
  }

  /**
   * Kiểm tra ô đường đi hợp lệ
   */
  isWalkableRoad(r, c, grid, tileMap, isUnlockedFn) {
    if (!grid || r < 0 || r >= grid.length || !grid[r] || c < 0 || c >= grid[0].length) return false;
    if (isUnlockedFn && !isUnlockedFn(r, c)) return false;
    const tid = grid[r][c];
    if (!tid) return false;
    if (tileMap && tileMap[tid] && tileMap[tid].category === "road") return true;
    return tid.startsWith("r0") || tid.startsWith("r1") || tid.startsWith("r2") || tid.startsWith("r3");
  }

  /**
   * Tạo xe mới (xe kéo hoặc xe ngựa)
   */
  createVehicle(startCell, type = "wheat_cart") {
    const isHorse = type === "horse_carriage";
    getCharacterImage('vehicle', type);
    return {
      id: `veh_${this.nextId++}`,
      type,
      name: isHorse ? "Xe Ngựa Hoàng Gia" : "Xe Kéo Lúa Mì",
      r: startCell.r,
      c: startCell.c,
      targetR: startCell.r,
      targetC: startCell.c,
      moveProgress: 0,
      animationPhase: 0,
      speed: isHorse ? 1.6 : 1.1, // ô mỗi giây
      facing: "SE",
      path: [],
      state: "walking", // "walking" | "idle"
      stateTimer: 0,
      bounce: 0,
      soundPitch: isHorse ? 1.2 : 0.95
    };
  }

  /**
   * Tìm lộ trình mới cho xe trên đường
   */
  findNewPath(vehicle, grid, tileMap, isUnlockedFn) {
    const walkCheck = (r, c) => this.isWalkableRoad(r, c, grid, tileMap, isUnlockedFn);
    const start = { r: Math.round(vehicle.r), c: Math.round(vehicle.c) };

    const wander = getRandomConnectedRoadCell(grid, start, walkCheck, 12);
    if (wander && wander.path && wander.path.length > 1) {
      const path = [...wander.path];
      path.shift();
      vehicle.path = path;
      vehicle.state = "walking";
    } else {
      vehicle.state = "idle";
      vehicle.stateTimer = 2.0 + Math.random() * 2.0;
    }
  }

  /**
   * Cập nhật vị trí các phương tiện theo thời gian thực
   */
  update(dt, grid, tileMap, isUnlockedFn, villageStats) {
    const walkCheck = (r, c) => this.isWalkableRoad(r, c, grid, tileMap, isUnlockedFn);
    const allRoads = getAllWalkableRoads(grid, walkCheck);

    // Duy trì 1-2 xe kéo và 1 xe ngựa nếu đường sá đủ rộng
    if (allRoads.length >= 8) {
      const targetVehicleCount = allRoads.length >= 24 ? 3 : (allRoads.length >= 14 ? 2 : 1);
      while (this.vehicles.length < targetVehicleCount) {
        const spawnCell = allRoads[Math.floor(Math.random() * allRoads.length)];
        const vType = (this.vehicles.length === 1 && allRoads.length >= 20) ? "horse_carriage" : "wheat_cart";
        const veh = this.createVehicle(spawnCell, vType);
        this.findNewPath(veh, grid, tileMap, isUnlockedFn);
        this.vehicles.push(veh);
      }
    } else {
      this.vehicles = [];
    }

    // Cập nhật từng xe trên cạn
    for (const v of this.vehicles) {
      if (v.bounce > 0) v.bounce = Math.max(0, v.bounce - dt * 2.5);

      if (v.state === "idle") {
        v.stateTimer -= dt;
        if (v.stateTimer <= 0) {
          this.findNewPath(v, grid, tileMap, isUnlockedFn);
        }
        continue;
      }

      if (v.state === "walking") {
        if (!v.path || v.path.length === 0) {
          v.state = "idle";
          v.stateTimer = 1.5 + Math.random() * 2.0;
          continue;
        }

        const nextNode = v.path[0];
        v.targetR = nextNode.r;
        v.targetC = nextNode.c;

        // Xác định hướng xe
        const dr = v.targetR - v.r;
        const dc = v.targetC - v.c;
        v.facing = characterDirection(dr, dc, v.facing);

        const step = v.speed * dt;
        const dist = Math.hypot(dr, dc);
        v.animationPhase = (Number.isFinite(v.animationPhase) ? v.animationPhase : 0) + Math.min(step, dist) * 8;

        if (dist <= step) {
          v.r = v.targetR;
          v.c = v.targetC;
          v.path.shift();
          if (v.path.length === 0) {
            v.state = "idle";
            v.stateTimer = 1.0 + Math.random() * 2.0;
          }
        } else {
          v.r += (dr / dist) * step;
          v.c += (dc / dist) * step;
        }
      }
    }

    // Cập nhật thuyền bè trên biển
    for (const b of this.boats) {
      b.bobTimer += dt * 2.2;
      b.netTimer -= dt;

      if (b.netTimer <= 0) {
        b.isCastingNet = !b.isCastingNet;
        b.netTimer = b.isCastingNet ? 4.0 : 8.0;
      }

      const curSpeed = b.isCastingNet ? b.speed * 0.45 : b.speed;
      b.r += curSpeed * dt * b.direction;

      // Đổi chiều khi chạm giới hạn bắc / nam
      if (b.direction > 0 && b.r >= (b.maxR || 26.5)) {
        b.direction = -1;
      } else if (b.direction < 0 && b.r <= (b.minR || 4.5)) {
        b.direction = 1;
      }
    }

    // Hết hạn speech bubble
    if (this.speechBubble && performance.now() > this.speechBubble.expiresAt) {
      this.speechBubble = null;
    }
  }

  /**
   * Vẽ tất cả phương tiện và thuyền bè lên canvas (Được gọi bên trong camera transform)
   */
  render(ctx, originX, originY, halfW, quarterW, camera, isNight = false, opts = {}) {
    const now = performance.now();

    // 1. Vẽ Thuyền Đánh Cá trên biển
    // 1. Vẽ Thuyền Đánh Cá ngoài biển
    for (const b of this.boats) {
      if (opts.only && opts.only !== b) continue;
      const worldX = originX + (b.c - b.r) * halfW + 64;
      const worldY = originY + (b.r + b.c) * quarterW + 90;
      const bob = Math.sin(b.bobTimer) * 3.5;

      ctx.save();
      ctx.translate(worldX, worldY + bob);

      // Bóng/Sóng thuyền trên mặt nước
      ctx.fillStyle = "rgba(14, 116, 144, 0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 12, 28, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      const isReturn = b.direction < 0;
      let boatImg = isReturn ? this._fishingBoatReturnImg : this._fishingBoatImg;
      if (!boatImg) {
        boatImg = new Image();
        boatImg.src = isReturn ? "/assets/vehicles/fishing_boat_return.png" : "/assets/vehicles/fishing_boat.png";
        if (isReturn) this._fishingBoatReturnImg = boatImg;
        else this._fishingBoatImg = boatImg;
      }
      const isBoatReady = boatImg && boatImg.complete && boatImg.naturalWidth > 0;

      if (isBoatReady) {
        // Vẽ đúng ảnh theo hướng đi mà không cần lật Canvas
        ctx.drawImage(boatImg, -34, -56, 68, 68);
      } else {
        // Thân thuyền gỗ dự phòng
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.moveTo(-16, 2);
        ctx.lineTo(16, 2);
        ctx.lineTo(12, 8);
        ctx.lineTo(-12, 8);
        ctx.closePath();
        ctx.fill();
      }

      // Lưới cá quăng xuống nước (nếu đang thả lưới)
      if (b.isCastingNet) {
        ctx.strokeStyle = "rgba(254, 240, 138, 0.85)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.ellipse(18, 14, 9, 4.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "10px sans-serif";
        ctx.fillText("🐟", 15, 12);
      }

      ctx.restore();
    }

    // 2. Vẽ Xe Kéo & Xe Ngựa trên đường làng
    for (const v of this.vehicles) {
      if (opts.only && opts.only !== v) continue;
      const worldX = originX + (v.c - v.r) * halfW + 64;
      const worldY = originY + (v.r + v.c) * quarterW + 90;

      ctx.save();
      ctx.translate(worldX, worldY);

      // Bóng xe đổ xuống mặt đường
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.beginPath();
      ctx.ellipse(0, 4, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Each animated frame keeps vehicle, driver/puller and harness together.
      const animated = drawAnimatedCharacter(ctx, 'vehicle', v.type, 0, 4, {
        width: v.type === 'horse_carriage' ? 78 : 54,
        facing: v.facing || 'SE', walking: v.state === 'walking' && !!v.path?.length,
        phase: v.animationPhase || 0
      });
      if (!animated) drawRuntimeActor(ctx,'vehicle',v.type,0,4,{
        width:v.type==='horse_carriage'?78:54,
        flipped:v.facing==='SE'||v.facing==='NE'
      });

      const drawOverlay = () => {
        ctx.save();
        // Reapply the actor transform when the overlay is deferred to the UI pass.
        if (opts.deferOverlay) ctx.translate(worldX, worldY);
        // Speech bubble khi người chơi nhấp vào xe
        if (this.speechBubble && this.speechBubble.vehicleId === v.id) {
          const bubbleW = 140;
          const bubbleH = 24;
          const bX = 0;
          const bY = -24;

          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(bX - bubbleW / 2, bY - bubbleH, bubbleW, bubbleH, 6);
          ctx.fill();
          ctx.stroke();

          // Mũi tên trỏ
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(-3, bY);
          ctx.lineTo(3, bY);
          ctx.lineTo(0, bY + 4);
          ctx.closePath();
          ctx.fill();

          ctx.font = "600 8.5px system-ui, -apple-system, sans-serif";
          ctx.fillStyle = "#1e293b";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(this.speechBubble.text, bX, bY - bubbleH / 2);
        }

        ctx.restore();
      };
      if (opts.deferOverlay) opts.deferOverlay(drawOverlay);
      else drawOverlay();
      ctx.restore();
    }
  }

  /**
   * Tương tác nhấp chuột vào xe hoặc thuyền
   */
  handleClick(screenX, screenY, originX, originY, halfW, quarterW, camera) {
    const hitRadius = 24;

    for (const v of this.vehicles) {
      const worldX = originX + (v.c - v.r) * halfW + 64;
      const worldY = originY + (v.r + v.c) * quarterW + 90;
      const sx = camera.x + worldX * camera.zoom;
      const sy = camera.y + worldY * camera.zoom;

      if (Math.hypot(screenX - sx, screenY - sy) <= hitRadius) {
        v.bounce = 1.0;
        const quote = v.type === "horse_carriage"
          ? "🐎 Cộc cộc! Xe ngựa hoàng gia xin nhường đường quý khách!"
          : "🌾 Lúa thơm mới gặt, chuẩn bị chở sang lò nướng bánh mì đây!";
        this.speechBubble = {
          vehicleId: v.id,
          text: quote,
          expiresAt: performance.now() + 4500
        };
        return { hit: true, name: v.name, quote };
      }
    }

    for (const b of this.boats) {
      const worldX = originX + (b.c - b.r) * halfW + 64;
      const worldY = originY + (b.r + b.c) * quarterW + 90;
      const sx = camera.x + worldX * camera.zoom;
      const sy = camera.y + worldY * camera.zoom;

      if (Math.hypot(screenX - sx, screenY - sy) <= hitRadius + 14) {
        return {
          hit: true,
          name: b.name,
          quote: "🐟 Mẻ lưới hôm nay được nhiều cá hồi và tôm hùm béo ngậy lắm!"
        };
      }
    }

    return { hit: false };
  }
}
