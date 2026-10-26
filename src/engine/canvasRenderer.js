/**
 * canvasRenderer.js - Module kết xuất đồ họa Canvas 2D Isometric
 * 
 * Quản lý toàn bộ quá trình vẽ thế giới đẳng cự (Isometric Town):
 * - Bộ nhớ đệm sprite gạch và nông sản (imageCache, cropImageCache)
 * - Chiều sâu đồ họa (Depth Sorting theo trục hàng + cột)
 * - Kết xuất luống đất, giai đoạn phát triển cây trồng (mầm, bụi, chín vàng)
 * - Hiệu ứng hoạt hình sinh động: Đàn gà mổ thóc, đàn bò nhai cỏ, cánh cối xoay gió
 * - Khói lò rèn, bánh mì nướng, bong bóng thu hoạch & cảnh báo thiếu hụt nguyên liệu
 * - Hệ thống sương mù che phủ đất chưa mở khóa & huy hiệu mua chunk
 * - Dân làng di chuyển Isometric bobbing & bóng hội thoại
 * - Con trỏ xem trước vị trí đặt công trình (Ghost preview hợp lệ / bị chặn / phá dỡ)
 * - Bộ lọc ánh sáng Ngày/Đêm (Sáng sớm, ban trưa, hoàng hôn, đêm rực rỡ ánh đèn đường)
 * - Hiệu ứng thời tiết (mưa rơi, vũng nước)
 * - Hạt bay phần thưởng Hay Day: Vàng bay 3D xoay tít, sao XP lấp lánh, nông sản bay vào kho
 * - Vòng cung chém liềm gặt lúa & chữ số bay (+50🪙, +20⭐)
 */

import {
  ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W, ROWS, COLS, isTileInViewport
} from "./isoMath.js";
import {
  getChunkId, getChunkBounds, isCellUnlocked, isChunkAdjacentToUnlocked, getNextChunkPrice, getNextChunkCost
} from "../data/landConfig.js";
import {
  PRODUCTION_BUILDINGS, getBuildingYield, getBuildingInputReq
} from "../data/gameEconomy.js";
import { UPGRADES_CONFIG } from "../data/upgradesConfig.js";
import { CROPS_CONFIG } from "../data/cropsConfig.js";
import { CROP_PIXEL_SPRITES } from "../data/cropSprites.js";
import { FRUIT_TREES_CONFIG, RESOURCES_CONFIG } from "../data/resourcesConfig.js";
import { TILES_DATA } from "../data/tilesData.js";
import { TILE_DATA_URIS } from "../data/sprites.js";
import { AESTHETIC_TILE_URIS } from "../data/aestheticTileIcons.js";
import { playCoinFlyHitSound } from "./audioEngine.js";

/**
 * Kiểm tra hình ảnh đã sẵn sàng để vẽ lên Canvas
 * @param {HTMLImageElement} img
 * @returns {boolean}
 */
export function isImageReady(img) {
  return img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
}

/**
 * Kiểm tra xem một toạ độ ngoại vi ngoài bản đồ có thuộc dải Đại Dương hay không
 * @param {number} row 
 * @param {number} col 
 * @returns {boolean}
 */
export function isSurroundingOcean(row, col) {
  // 1. Toàn bộ vùng biển mênh mông phía Tây vương quốc (col < 0)
  if (col < 0) return true;
  // 2. Dải đại dương tiếp nối kéo dài về phía Bắc ngoài đảo (row < 0, col <= 3)
  if (row < 0 && col <= 3) return true;
  // 3. Dải đại dương tiếp nối kéo dài về phía Nam ngoài đảo (row >= ROWS, col <= 2)
  if (row >= ROWS && col <= 2) return true;
  return false;
}

/**
 * Kiểm tra xem một toạ độ ngoại vi có phải bãi biển cát vàng tiếp nối bờ cát hay không
 * @param {number} row 
 * @param {number} col 
 * @returns {boolean}
 */
export function isSurroundingBeach(row, col) {
  if (row < 0 && col === 4) return true;
  if (row >= ROWS && (col === 3 || col === 4)) return true;
  return false;
}

/**
 * Trả về thông tin tile cho các ô đại dương ngoại vi ngoài vương quốc
 * @param {number} row 
 * @param {number} col 
 * @returns {{ tid: string, flipped: boolean }}
 */
export function getSurroundingOceanTile(row, col) {
  // 1. Các địa danh biển cố định ngoài khơi tạo điểm nhấn thị giác sống động
  if (row === 14 && col === -3) {
    return { tid: "m31_sea_var3_bell_buoy", flipped: false }; // Phao tiêu chuông ngay ngoài luồng cập cảng
  }
  if (row === 8 && col === -6) {
    return { tid: "m05_lighthouse_island", flipped: false }; // Ngọn hải đăng viễn dương phía Bắc
  }
  if (row === 22 && col === -5) {
    return { tid: "m06_tropical_palm_island", flipped: true }; // Đảo dừa nhiệt đới thơ mộng
  }
  if (row === 14 && col === -8) {
    return { tid: "m32_sea_var4_shipwreck_reef", flipped: false }; // Rạn đá ngầm tàu đắm cổ ngoài khơi
  }
  if (row === 2 && col === -4) {
    return { tid: "l09_wildlife_sea_turtles", flipped: false }; // Đàn rùa biển bơi lội
  }
  if (row === 28 && col === -6) {
    return { tid: "m05_lighthouse_island", flipped: false }; // Ngọn hải đăng phía Nam
  }
  if (row === 18 && col === -3) {
    return { tid: "m57_sea_var5_sargasso_kelp_manta_ray", flipped: true }; // Cá đuối dơi lướt sóng
  }
  if (row === -4 && col === -2) {
    return { tid: "m07_sea_stacks_reef", flipped: false }; // Trụ đá biển ngàn năm
  }
  if (row === 36 && col === -3) {
    return { tid: "m06_tropical_palm_island", flipped: false }; // Đảo dừa hoang sơ phía Nam
  }
  if (row === 0 && col === -5) {
    return { tid: "m31_sea_var3_bell_buoy", flipped: false }; // Phao tiêu cảnh báo bãi ngầm
  }

  // 2. Phân bổ sóng biển và sinh vật tự nhiên bằng hàm băm giả ngẫu nhiên cố định (deterministic)
  const seed = (row * 49297 + col * 93811) ^ (row * col * 313);
  const n = (seed ^ (seed >>> 13)) * 1274126177;
  const hash = Math.abs((n ^ (n >>> 16)) % 1000) / 1000;
  const flipped = ((row * 11 + col * 17) % 2 === 0);

  // Tỉ lệ đại dương:
  // - 62% Rạn san hô ngầm ngũ sắc (m30_sea_var2_coral_reef - nước biển xanh lam trong vắt)
  // - 20% Rừng tảo bẹ khổng lồ đáy biển (m29_sea_var1_kelp_forest - biển sâu thẫm)
  // - 8% Sinh vật phát quang đêm (m34_sea_var6_bioluminescence)
  // - 4% Đàn cá chuồn lướt sóng (m33_sea_var5_flying_fish)
  // - 2% Tảo bẹ Sargasso & Cá đuối khổng lồ (m57_sea_var5_sargasso_kelp_manta_ray)
  // - 1.5% Đàn rùa biển vịnh san hô (l09_wildlife_sea_turtles)
  // - 1% Phao tiêu chuông dẫn đường (m31_sea_var3_bell_buoy)
  // - 0.8% Trụ đá biển (m07_sea_stacks_reef)
  // - 0.7% Đảo san hô rặng dừa (m06_tropical_palm_island)
  if (hash < 0.62) {
    return { tid: "m30_sea_var2_coral_reef", flipped };
  } else if (hash < 0.82) {
    return { tid: "m29_sea_var1_kelp_forest", flipped };
  } else if (hash < 0.90) {
    return { tid: "m34_sea_var6_bioluminescence", flipped };
  } else if (hash < 0.94) {
    return { tid: "m33_sea_var5_flying_fish", flipped };
  } else if (hash < 0.96) {
    return { tid: "m57_sea_var5_sargasso_kelp_manta_ray", flipped };
  } else if (hash < 0.975) {
    return { tid: "l09_wildlife_sea_turtles", flipped };
  } else if (hash < 0.985) {
    return { tid: "m31_sea_var3_bell_buoy", flipped };
  } else if (hash < 0.993) {
    return { tid: "m07_sea_stacks_reef", flipped };
  } else {
    return { tid: "m06_tropical_palm_island", flipped };
  }
}

/**
 * Trả về thông tin loại cây/đường xá cho các ô rừng đại ngàn bao quanh vương quốc
 * @param {number} row 
 * @param {number} col 
 * @returns {{ tid: string, flipped: boolean }}
 */
export function getSurroundingForestTile(row, col) {
  // 1. Trục đường đá lớn tiếp tục kéo dài xuyên qua cánh rừng phía Nam (Row >= 32, Col 15)
  if (col === 15 && row >= 32) {
    return { tid: "r01_road_straight_ns", flipped: false };
  }

  // 2. Hai bên con đường qua rừng: Cột đèn đường và bụi hoa ven lộ
  if ((col === 14 || col === 16) && row >= 32) {
    if (row % 4 === 0) {
      return { tid: "d07_streetlamps_signpost", flipped: false };
    }
    if (row % 4 === 2) {
      return { tid: "d10_flower_orchard_hedge", flipped: col === 16 };
    }
  }

  // 3. Phân bổ rừng hoang dã tự nhiên bằng hàm băm giả ngẫu nhiên cố định (deterministic)
  const seed = (row * 374761393 + col * 668265263) ^ (row * col * 127);
  const n = (seed ^ (seed >>> 13)) * 1274126177;
  const hash = Math.abs((n ^ (n >>> 16)) % 1000) / 1000;

  const flipped = ((row * 7 + col * 13) % 2 === 0);

  // Tỉ lệ cây rừng rậm rạp:
  // - 52% Rừng thông đại ngàn (d05_pine_grove)
  // - 24% Rừng sồi cổ thụ râm mát (d04_oak_tree_park)
  // - 12% Hoa anh đào rừng nở rộ (d06_cherry_garden)
  // - 8% Bụi cây hoa dại (d10_flower_orchard_hedge)
  // - 4% Bãi cỏ hoa đồng nội xen kẽ (d12_meadow_wildflowers)
  if (hash < 0.52) {
    return { tid: "d05_pine_grove", flipped };
  } else if (hash < 0.76) {
    return { tid: "d04_oak_tree_park", flipped };
  } else if (hash < 0.88) {
    return { tid: "d06_cherry_garden", flipped };
  } else if (hash < 0.96) {
    return { tid: "d10_flower_orchard_hedge", flipped };
  } else {
    return { tid: "d12_meadow_wildflowers", flipped: false };
  }
}

/**
 * Vẽ một ô ngoại vi (Đại Dương bao la hoặc Rừng đại ngàn) bao quanh vương quốc
 */
export function renderSurroundingTile(c2d, row, col, ox, oy, imageCache, dayNightWeather) {
  // A. Ô ĐẠI DƯƠNG NGOẠI VI (Vùng biển Tây và tiếp nối Bắc/Nam)
  if (isSurroundingOcean(row, col)) {
    const oceanTile = getSurroundingOceanTile(row, col);
    const sTid = oceanTile.tid;
    const sFlipped = oceanTile.flipped;

    // 1. Luôn vẽ nước biển xanh lam trong vắt làm nền
    const baseSea = imageCache["m30_sea_var2_coral_reef"];
    if (isImageReady(baseSea)) {
      c2d.drawImage(baseSea, ox, oy);
    } else {
      c2d.save();
      c2d.beginPath();
      c2d.moveTo(ox + 64, oy + 64);
      c2d.lineTo(ox + 128, oy + 96);
      c2d.lineTo(ox + 64, oy + 128);
      c2d.lineTo(ox, oy + 96);
      c2d.closePath();
      c2d.fillStyle = "#0284c7";
      c2d.fill();
      c2d.restore();
    }

    // 2. Vẽ sprite biển/đảo/sinh vật nếu không phải nền san hô cơ bản
    if (sTid !== "m30_sea_var2_coral_reef") {
      const sImg = imageCache[sTid];
      if (isImageReady(sImg)) {
        c2d.save();
        if (sFlipped) {
          c2d.translate(ox + 128, oy);
          c2d.scale(-1, 1);
          c2d.drawImage(sImg, 0, 0);
        } else {
          c2d.drawImage(sImg, ox, oy);
        }
        c2d.restore();
      }
    }

    // 3. Hiệu ứng ánh sáng / phát quang biển ban đêm
    if (dayNightWeather) {
      if (sTid === "m05_lighthouse_island") {
        dayNightWeather.renderLightGlow(c2d, ox + 64, oy + 40, 120, 1.0);
      } else if (sTid === "m31_sea_var3_bell_buoy") {
        dayNightWeather.renderLightGlow(c2d, ox + 64, oy + 72, 45, 0.85);
      } else if (sTid === "m34_sea_var6_bioluminescence") {
        dayNightWeather.renderLightGlow(c2d, ox + 64, oy + 90, 55, 0.55);
      }
    }
    return;
  }

  // B. Ô BÃI CÁT BỜ BIỂN TIẾP NỐI
  if (isSurroundingBeach(row, col)) {
    const beachImg = imageCache["m01_sandy_beach_s"];
    if (isImageReady(beachImg)) {
      c2d.drawImage(beachImg, ox, oy);
    } else {
      const baseMeadow = imageCache["d12_meadow_wildflowers"];
      if (isImageReady(baseMeadow)) c2d.drawImage(baseMeadow, ox, oy);
    }
    return;
  }

  // C. Ô RỪNG ĐẠI NGÀN & ĐẤT LIỀN
  const forestTile = getSurroundingForestTile(row, col);
  const fTid = forestTile.tid;
  const fFlipped = forestTile.flipped;

  // 1. Luôn vẽ thảm cỏ hoa đồng nội bên dưới làm nền đất xanh mướt liền mạch
  const baseMeadow = imageCache["d12_meadow_wildflowers"];
  if (isImageReady(baseMeadow)) {
    c2d.drawImage(baseMeadow, ox, oy);
  } else {
    c2d.save();
    c2d.beginPath();
    c2d.moveTo(ox + 64, oy + 64);
    c2d.lineTo(ox + 128, oy + 96);
    c2d.lineTo(ox + 64, oy + 128);
    c2d.lineTo(ox, oy + 96);
    c2d.closePath();
    c2d.fillStyle = "#5cb85c";
    c2d.fill();
    c2d.restore();
  }

  // 2. Vẽ sprite cây cối / con đường / cột đèn
  if (fTid !== "d12_meadow_wildflowers") {
    const fImg = imageCache[fTid];
    if (isImageReady(fImg)) {
      c2d.save();
      if (fFlipped) {
        c2d.translate(ox + 128, oy);
        c2d.scale(-1, 1);
        c2d.drawImage(fImg, 0, 0);
      } else {
        c2d.drawImage(fImg, ox, oy);
      }
      c2d.restore();
    }
  }

  // 3. Ánh đèn đường phát sáng ấm áp về đêm
  if (dayNightWeather && fTid === "d07_streetlamps_signpost") {
    dayNightWeather.renderLightGlow(c2d, ox + 64, oy + 82, 75, 0.95);
  }
}

export const renderSurroundingForestTile = renderSurroundingTile;

/**
 * Khởi tạo Canvas Renderer Module
 * @param {Object} ctx - Đối tượng cung cấp context và state của game
 * @returns {Object} Renderer interface
 */
export function createCanvasRenderer(ctx) {
  // 1. Khởi tạo Image Cache cho Tiles
  const imageCache = {};
  TILES_DATA.forEach(t => {
    const img = new Image();
    const uri = AESTHETIC_TILE_URIS[t.id] || ((typeof TILE_DATA_URIS !== 'undefined' && TILE_DATA_URIS[t.id]) 
      ? TILE_DATA_URIS[t.id] 
      : ('tiles/' + t.id + '_128.png'));
    img.src = uri;
    img.onload = () => {
      if (ctx.onRequestRender) ctx.onRequestRender();
    };
    imageCache[t.id] = img;
  });

  // 2. Khởi tạo Image Cache cho Cây trồng (Crops)
  const cropImageCache = {};
  for (const [cKey, cUri] of Object.entries(CROP_PIXEL_SPRITES)) {
    const cImg = new Image();
    cImg.src = cUri;
    cropImageCache[cKey] = cImg;
  }

  // 2b. Khởi tạo Image Cache cho Cây Táo Đỏ 3 Giai Đoạn Pixel Art
  const appleTreeStageImages = {
    growing: new Image(),
    flowering: new Image(),
    ripe: new Image()
  };
  appleTreeStageImages.growing.src = "/assets/trees/apple_tree_growing.png";
  appleTreeStageImages.flowering.src = "/assets/trees/apple_tree_flowering.png";
  appleTreeStageImages.ripe.src = "/assets/trees/apple_tree_ripe.png";
  appleTreeStageImages.growing.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  appleTreeStageImages.flowering.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  appleTreeStageImages.ripe.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  imageCache["d21_apple_tree"] = appleTreeStageImages.ripe;

  // 2c. Khởi tạo Image Cache cho Cây Me Chua Ngọt 3 Giai Đoạn Pixel Art
  const tamarindTreeStageImages = {
    growing: new Image(),
    flowering: new Image(),
    ripe: new Image()
  };
  tamarindTreeStageImages.growing.src = "/assets/trees/tamarind_tree_growing.png";
  tamarindTreeStageImages.flowering.src = "/assets/trees/tamarind_tree_flowering.png";
  tamarindTreeStageImages.ripe.src = "/assets/trees/tamarind_tree_ripe.png";
  tamarindTreeStageImages.growing.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  tamarindTreeStageImages.flowering.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  tamarindTreeStageImages.ripe.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  imageCache["d23_tamarind_tree"] = tamarindTreeStageImages.ripe;

  // 2d. Khởi tạo Image Cache cho Cây Dừa Xiêm 3 Giai Đoạn Pixel Art
  const coconutPalmStageImages = {
    growing: new Image(),
    flowering: new Image(),
    ripe: new Image()
  };
  coconutPalmStageImages.growing.src = "/assets/trees/coconut_palm_growing.png";
  coconutPalmStageImages.flowering.src = "/assets/trees/coconut_palm_flowering.png";
  coconutPalmStageImages.ripe.src = "/assets/trees/coconut_palm_ripe.png";
  coconutPalmStageImages.growing.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  coconutPalmStageImages.flowering.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  coconutPalmStageImages.ripe.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  imageCache["d22_coconut_palm"] = coconutPalmStageImages.ripe;

  // 2e. Khởi tạo Image Cache cho Con Vật Chăn Nuôi (Gà, Bò, Cừu)
  const animalSpriteImages = {
    chicken: new Image(),
    cow: new Image(),
    sheep: new Image()
  };
  animalSpriteImages.chicken.src = "/assets/aistudio/con_g__a3d3ad36.png";
  animalSpriteImages.cow.src = "/assets/aistudio/con_b__8eb91304.png";
  animalSpriteImages.sheep.src = "/assets/aistudio/con_c_u_8042aec2.png";
  animalSpriteImages.chicken.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  animalSpriteImages.cow.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };
  animalSpriteImages.sheep.onload = () => { if (ctx.onRequestRender) ctx.onRequestRender(); };

  // 3. Quản lý trạng thái hiệu ứng thị giác (Floating particles & texts)
  let floatingTexts = [];
  let flyingParticles = [];
  let slashEffects = [];

  /**
   * Tạo hiệu ứng đồng xu bay lên kho tài nguyên
   */
  function spawnFlyingCoin(gridCol, gridRow, count = 3) {
    const worldX = ORIGIN_X + (gridCol - gridRow) * HALF_W + 64;
    const worldY = ORIGIN_Y + (gridRow + gridCol) * QUARTER_W + 30;
    const now = performance.now();

    for (let i = 0; i < count; i++) {
      flyingParticles.push({
        type: "coin",
        worldX,
        worldY,
        arcOffsetX: (Math.random() - 0.5) * 80,
        arcOffsetY: 40 + Math.random() * 50,
        startTime: now + i * 80,
        duration: 720 + Math.random() * 140
      });
    }
  }

  /**
   * Tạo hiệu ứng ngôi sao XP kinh nghiệm bay vào thanh cấp độ
   */
  function spawnFlyingXP(gridCol, gridRow, xpAmount = 10) {
    const worldX = ORIGIN_X + (gridCol - gridRow) * HALF_W + 64;
    const worldY = ORIGIN_Y + (gridRow + gridCol) * QUARTER_W + 20;

    flyingParticles.push({
      type: "xp",
      worldX,
      worldY,
      arcOffsetX: (Math.random() - 0.5) * 60,
      arcOffsetY: 50 + Math.random() * 40,
      startTime: performance.now() + 50,
      duration: 750,
      xpVal: xpAmount
    });
  }

  /**
   * Tạo hiệu ứng nông sản vừa thu hoạch bay vào kho nông trại
   */
  function spawnFlyingProduce(gridCol, gridRow, icon = "🌾") {
    const worldX = ORIGIN_X + (gridCol - gridRow) * HALF_W + 64;
    const worldY = ORIGIN_Y + (gridRow + gridCol) * QUARTER_W + 20;

    flyingParticles.push({
      type: "produce",
      worldX,
      worldY,
      arcOffsetX: (Math.random() - 0.5) * 50,
      arcOffsetY: 45 + Math.random() * 35,
      startTime: performance.now(),
      duration: 780,
      icon: icon
    });
  }

  /**
   * Tạo hiệu ứng vòng cung liềm chém thu hoạch
   */
  function spawnSlashEffect(gridCol, gridRow) {
    const sX = ORIGIN_X + (gridCol - gridRow) * HALF_W + 64;
    const sY = ORIGIN_Y + (gridRow + gridCol) * QUARTER_W + 90;
    slashEffects.push({
      x: sX,
      y: sY,
      startTime: performance.now(),
      duration: 380
    });
  }

  /**
   * Thêm chữ nổi (+50🪙, +20⭐, Thông báo gieo hạt)
   */
  function addFloatingText(optOrX, y, text, duration = 1500) {
    if (typeof optOrX === "object" && optOrX !== null) {
      floatingTexts.push({
        x: optOrX.x,
        y: optOrX.y,
        text: optOrX.text,
        startTime: optOrX.startTime || performance.now(),
        duration: optOrX.duration || 1500
      });
    } else {
      floatingTexts.push({
        x: optOrX,
        y,
        text,
        startTime: performance.now(),
        duration
      });
    }
  }

  /**
   * Vẽ hoạt hình Đàn gà trong Chuồng Gà (Sử dụng Sprite Gà Pixel Art mới)
   */
  function renderLivestockChickens(c2d, ox, oy, animTime, pState, ls) {
    c2d.save();

    const count = ls ? (ls.animalCount || 0) : 0;
    if (ls && ls.state === "producing") {
      const dur = ls.durationMs || 40000;
      if (Date.now() - (ls.feedTime || 0) >= dur) {
        ls.state = "ready";
      }
    }

    const state = count === 0 ? "empty" : (ls ? ls.state : "empty");
    const isHungry = state === "hungry";
    const isProducing = state === "producing";
    const isReady = state === "ready";

    // Vị trí 5 con gà đứng rải rác bên trong sân chuồng gà (nằm trọn trong hàng rào gỗ)
    const chickenSlots = [
      { x: ox + 38, y: oy + 80, flip: false, w: 19, h: 19 },
      { x: ox + 72, y: oy + 78, flip: true, w: 19, h: 19 },
      { x: ox + 54, y: oy + 78, flip: false, w: 19, h: 19 },
      { x: ox + 64, y: oy + 72, flip: false, w: 18, h: 18 },
      { x: ox + 48, y: oy + 84, flip: true, w: 19, h: 19 }
    ];

    if (count > 0) {
      const img = animalSpriteImages.chicken;
      const ready = isImageReady(img);
      const renderLimit = Math.min(count, 5);

      for (let i = 0; i < renderLimit; i++) {
        const slot = chickenSlots[i];
        const bob = isProducing 
          ? Math.abs(Math.sin(animTime * 6.5 + i * 1.8)) * 3 
          : Math.sin(animTime * 2.5 + i * 1.5) * 1.2;
        
        c2d.save();
        if (ready) {
          if (slot.flip) {
            c2d.translate(slot.x + slot.w, slot.y - bob);
            c2d.scale(-1, 1);
            c2d.drawImage(img, 0, 0, slot.w, slot.h);
          } else {
            c2d.drawImage(img, slot.x, slot.y - bob, slot.w, slot.h);
          }
        } else {
          c2d.font = "16px sans-serif";
          c2d.textAlign = "center";
          c2d.fillText("🐔", slot.x + 10, slot.y + 12 - bob);
        }
        c2d.restore();
      }
    }

    if (isReady && count > 0) {
      // Harvest Bubble
      const bounceY = Math.sin(animTime * 3.5) * 4;
      const bubbleX = ox + 64;
      const bubbleY = oy + 6 + bounceY;

      c2d.font = "12px sans-serif";
      c2d.fillText("✨", bubbleX - 18, bubbleY - 12);
      c2d.fillText("✨", bubbleX + 18, bubbleY - 8);

      c2d.fillStyle = "#ffffff";
      c2d.strokeStyle = "#10b981";
      c2d.lineWidth = 2.5;
      c2d.beginPath();
      c2d.arc(bubbleX, bubbleY, 16, 0, Math.PI * 2);
      c2d.fill();
      c2d.stroke();

      c2d.font = "18px sans-serif";
      c2d.textAlign = "center";
      c2d.textBaseline = "middle";
      c2d.fillText("🥚", bubbleX, bubbleY);

      c2d.fillStyle = "#15803d";
      c2d.beginPath();
      c2d.roundRect(bubbleX - 25, bubbleY + 12, 50, 14, 4);
      c2d.fill();

      c2d.font = "700 9px sans-serif";
      c2d.fillStyle = "#ffffff";
      c2d.fillText(`+${count} Trứng`, bubbleX, bubbleY + 19);
    } else if (isHungry && count > 0) {
      // Hungry Bubble
      const bounceY = Math.sin(animTime * 4.0) * 3;
      const bubbleX = ox + 64;
      const bubbleY = oy + 8 + bounceY;

      c2d.fillStyle = "#fffbeb";
      c2d.strokeStyle = "#f59e0b";
      c2d.lineWidth = 2.5;
      c2d.beginPath();
      c2d.arc(bubbleX, bubbleY, 15, 0, Math.PI * 2);
      c2d.fill();
      c2d.stroke();

      c2d.font = "14px sans-serif";
      c2d.textAlign = "center";
      c2d.textBaseline = "middle";
      c2d.fillText("🌾", bubbleX, bubbleY);

      c2d.fillStyle = "#d97706";
      c2d.beginPath();
      c2d.roundRect(bubbleX - 22, bubbleY + 11, 44, 12, 4);
      c2d.fill();

      c2d.font = "700 8px sans-serif";
      c2d.fillStyle = "#ffffff";
      c2d.fillText(`Đói (${count}🌾)`, bubbleX, bubbleY + 17);
    } else if (isProducing && count > 0) {
      // Countdown bar
      const elapsed = Date.now() - (ls?.feedTime || Date.now());
      const dur = ls?.durationMs || 40000;
      const progress = Math.min(1.0, elapsed / dur);
      const secLeft = Math.max(0, Math.ceil((dur - elapsed) / 1000));
      const barW = 40;
      const barH = 4;
      const barX = ox + 64 - barW / 2;
      const barY = oy + 116;

      c2d.fillStyle = "rgba(0,0,0,0.55)";
      c2d.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      c2d.fillStyle = "#10b981";
      c2d.fillRect(barX, barY, barW * progress, barH);

      c2d.font = "700 9px sans-serif";
      c2d.fillStyle = "#ffffff";
      c2d.shadowColor = "#000";
      c2d.shadowBlur = 3;
      c2d.textAlign = "center";
      c2d.fillText(`⏳ ${secLeft}s ⚡💎`, ox + 64, barY - 3);
    }

    c2d.restore();
  }

  /**
   * Vẽ hoạt hình Đàn bò trong Trang Trại Bò Sữa (Sử dụng Sprite Bò Pixel Art mới)
   */
  function renderDairyCows(c2d, ox, oy, animTime, pState, buildingTid, ls) {
    c2d.save();

    const count = ls ? (ls.animalCount || 0) : 0;
    if (ls && ls.state === "producing") {
      const dur = ls.durationMs || 60000;
      if (Date.now() - (ls.feedTime || 0) >= dur) {
        ls.state = "ready";
      }
    }

    const state = count === 0 ? "empty" : (ls ? ls.state : "empty");
    const isHungry = state === "hungry";
    const isProducing = state === "producing";
    const isReady = state === "ready";

    // Vị trí 3 con bò đứng gặm cỏ bên trong chuồng bò
    const cowSlots = [
      { x: ox + 38, y: oy + 74, flip: false, w: 26, h: 26 },
      { x: ox + 68, y: oy + 72, flip: true, w: 26, h: 26 },
      { x: ox + 52, y: oy + 78, flip: false, w: 26, h: 26 }
    ];

    if (count > 0) {
      const img = animalSpriteImages.cow;
      const ready = isImageReady(img);
      const renderLimit = Math.min(count, 3);

      for (let i = 0; i < renderLimit; i++) {
        const slot = cowSlots[i];
        const bob = isProducing 
          ? Math.sin(animTime * 4.5 + i * 2) * 1.5 
          : Math.sin(animTime * 2.0 + i * 1.5) * 0.8;

        c2d.save();
        if (ready) {
          if (slot.flip) {
            c2d.translate(slot.x + slot.w, slot.y - bob);
            c2d.scale(-1, 1);
            c2d.drawImage(img, 0, 0, slot.w, slot.h);
          } else {
            c2d.drawImage(img, slot.x, slot.y - bob, slot.w, slot.h);
          }
        } else {
          c2d.font = "20px sans-serif";
          c2d.textAlign = "center";
          c2d.fillText("🐮", slot.x + 16, slot.y + 18 - bob);
        }
        c2d.restore();
      }
    }

    if (isReady && count > 0) {
      // Harvest Bubble
      const bounceY = Math.sin(animTime * 3.5) * 4;
      const bubbleX = ox + 64;
      const bubbleY = oy + 6 + bounceY;

      c2d.font = "12px sans-serif";
      c2d.fillText("✨", bubbleX - 18, bubbleY - 12);
      c2d.fillText("✨", bubbleX + 18, bubbleY - 8);

      c2d.fillStyle = "#ffffff";
      c2d.strokeStyle = "#10b981";
      c2d.lineWidth = 2.5;
      c2d.beginPath();
      c2d.arc(bubbleX, bubbleY, 16, 0, Math.PI * 2);
      c2d.fill();
      c2d.stroke();

      c2d.font = "18px sans-serif";
      c2d.textAlign = "center";
      c2d.textBaseline = "middle";
      c2d.fillText("🥛", bubbleX, bubbleY);

      c2d.fillStyle = "#15803d";
      c2d.beginPath();
      c2d.roundRect(bubbleX - 25, bubbleY + 12, 50, 14, 4);
      c2d.fill();

      c2d.font = "700 9px sans-serif";
      c2d.fillStyle = "#ffffff";
      c2d.fillText(`+${count} Sữa`, bubbleX, bubbleY + 19);
    } else if (isHungry && count > 0) {
      // Hungry Bubble
      const bounceY = Math.sin(animTime * 4.0) * 3;
      const bubbleX = ox + 64;
      const bubbleY = oy + 8 + bounceY;

      c2d.fillStyle = "#fffbeb";
      c2d.strokeStyle = "#f59e0b";
      c2d.lineWidth = 2.5;
      c2d.beginPath();
      c2d.arc(bubbleX, bubbleY, 15, 0, Math.PI * 2);
      c2d.fill();
      c2d.stroke();

      c2d.font = "14px sans-serif";
      c2d.textAlign = "center";
      c2d.textBaseline = "middle";
      c2d.fillText("🌽", bubbleX, bubbleY);

      c2d.fillStyle = "#d97706";
      c2d.beginPath();
      c2d.roundRect(bubbleX - 22, bubbleY + 11, 44, 12, 4);
      c2d.fill();

      c2d.font = "700 8px sans-serif";
      c2d.fillStyle = "#ffffff";
      c2d.fillText(`Đói (${count}🌽)`, bubbleX, bubbleY + 17);
    } else if (isProducing && count > 0) {
      // Countdown bar
      const elapsed = Date.now() - (ls?.feedTime || Date.now());
      const dur = ls?.durationMs || 60000;
      const progress = Math.min(1.0, elapsed / dur);
      const secLeft = Math.max(0, Math.ceil((dur - elapsed) / 1000));
      const barW = 40;
      const barH = 4;
      const barX = ox + 64 - barW / 2;
      const barY = oy + 120;

      c2d.fillStyle = "rgba(0,0,0,0.55)";
      c2d.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      c2d.fillStyle = "#10b981";
      c2d.fillRect(barX, barY, barW * progress, barH);

      c2d.font = "700 9px sans-serif";
      c2d.fillStyle = "#ffffff";
      c2d.shadowColor = "#000";
      c2d.shadowBlur = 3;
      c2d.textAlign = "center";
      c2d.fillText(`⏳ ${secLeft}s ⚡💎`, ox + 64, barY - 3);
    }

    c2d.restore();
  }

  /**
   * Vẽ hoạt hình Đàn cừu trong Chuồng Cừu (Sử dụng Sprite Cừu Pixel Art mới)
   */
  function renderLivestockSheep(c2d, ox, oy, animTime, pState, ls) {
    c2d.save();

    const count = ls ? (ls.animalCount || 0) : 0;
    if (ls && ls.state === "producing") {
      const dur = ls.durationMs || 60000;
      if (Date.now() - (ls.feedTime || 0) >= dur) {
        ls.state = "ready";
      }
    }

    const state = count === 0 ? "empty" : (ls ? ls.state : "empty");
    const isHungry = state === "hungry";
    const isProducing = state === "producing";
    const isReady = state === "ready";

    // Vị trí 3 con cừu bên trong chuồng cừu
    const sheepSlots = [
      { x: ox + 38, y: oy + 74, flip: false, w: 25, h: 25 },
      { x: ox + 68, y: oy + 74, flip: true, w: 25, h: 25 },
      { x: ox + 52, y: oy + 80, flip: false, w: 25, h: 25 }
    ];

    if (count > 0) {
      const img = animalSpriteImages.sheep;
      const ready = isImageReady(img);
      const renderLimit = Math.min(count, 3);

      for (let i = 0; i < renderLimit; i++) {
        const slot = sheepSlots[i];
        const bob = isProducing 
          ? Math.sin(animTime * 4.5 + i * 2) * 1.5 
          : Math.sin(animTime * 2.0 + i * 1.5) * 0.8;

        c2d.save();
        if (ready) {
          if (slot.flip) {
            c2d.translate(slot.x + slot.w, slot.y - bob);
            c2d.scale(-1, 1);
            c2d.drawImage(img, 0, 0, slot.w, slot.h);
          } else {
            c2d.drawImage(img, slot.x, slot.y - bob, slot.w, slot.h);
          }
        } else {
          c2d.font = "18px sans-serif";
          c2d.textAlign = "center";
          c2d.fillText("🐑", slot.x + 14, slot.y + 16 - bob);
        }
        c2d.restore();
      }
    }

    if (isReady && count > 0) {
      // Harvest Bubble
      const bounceY = Math.sin(animTime * 3.5) * 4;
      const bubbleX = ox + 64;
      const bubbleY = oy + 6 + bounceY;

      c2d.font = "12px sans-serif";
      c2d.fillText("✨", bubbleX - 18, bubbleY - 12);
      c2d.fillText("✨", bubbleX + 18, bubbleY - 8);

      c2d.fillStyle = "#ffffff";
      c2d.strokeStyle = "#10b981";
      c2d.lineWidth = 2.5;
      c2d.beginPath();
      c2d.arc(bubbleX, bubbleY, 16, 0, Math.PI * 2);
      c2d.fill();
      c2d.stroke();

      c2d.font = "18px sans-serif";
      c2d.textAlign = "center";
      c2d.textBaseline = "middle";
      c2d.fillText("🐑", bubbleX, bubbleY);

      c2d.fillStyle = "#15803d";
      c2d.beginPath();
      c2d.roundRect(bubbleX - 25, bubbleY + 12, 50, 14, 4);
      c2d.fill();

      c2d.font = "700 9px sans-serif";
      c2d.fillStyle = "#ffffff";
      c2d.fillText(`+${count} Lông`, bubbleX, bubbleY + 19);
    } else if (isHungry && count > 0) {
      // Hungry Bubble
      const bounceY = Math.sin(animTime * 4.0) * 3;
      const bubbleX = ox + 64;
      const bubbleY = oy + 8 + bounceY;

      c2d.fillStyle = "#fffbeb";
      c2d.strokeStyle = "#f59e0b";
      c2d.lineWidth = 2.5;
      c2d.beginPath();
      c2d.arc(bubbleX, bubbleY, 15, 0, Math.PI * 2);
      c2d.fill();
      c2d.stroke();

      c2d.font = "14px sans-serif";
      c2d.textAlign = "center";
      c2d.textBaseline = "middle";
      c2d.fillText("🥕", bubbleX, bubbleY);

      c2d.fillStyle = "#d97706";
      c2d.beginPath();
      c2d.roundRect(bubbleX - 22, bubbleY + 11, 44, 12, 4);
      c2d.fill();

      c2d.font = "700 8px sans-serif";
      c2d.fillStyle = "#ffffff";
      c2d.fillText(`Đói (${count}🥕)`, bubbleX, bubbleY + 17);
    } else if (isProducing && count > 0) {
      // Countdown bar
      const elapsed = Date.now() - (ls?.feedTime || Date.now());
      const dur = ls?.durationMs || 60000;
      const progress = Math.min(1.0, elapsed / dur);
      const secLeft = Math.max(0, Math.ceil((dur - elapsed) / 1000));
      const barW = 40;
      const barH = 4;
      const barX = ox + 64 - barW / 2;
      const barY = oy + 120;

      c2d.fillStyle = "rgba(0,0,0,0.55)";
      c2d.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      c2d.fillStyle = "#10b981";
      c2d.fillRect(barX, barY, barW * progress, barH);

      c2d.font = "700 9px sans-serif";
      c2d.fillStyle = "#ffffff";
      c2d.shadowColor = "#000";
      c2d.shadowBlur = 3;
      c2d.textAlign = "center";
      c2d.fillText(`⏳ ${secLeft}s ⚡💎`, ox + 64, barY - 3);
    }

    c2d.restore();
  }

  /**
   * Vẽ chi tiết Xưởng Dệt Vải: Khung cửi, guồng quay sợi & vải phơi
   */
  function renderTextileMillDetails(c2d, ox, oy, animTime) {
    c2d.save();

    // Spinning wheel in courtyard
    const wheelX = ox + 42;
    const wheelY = oy + 104;
    c2d.strokeStyle = "#78350f";
    c2d.lineWidth = 1.5;
    c2d.beginPath();
    c2d.arc(wheelX, wheelY, 8, 0, Math.PI * 2);
    c2d.stroke();

    // Spinning spokes
    const spokeRot = animTime * 6.0;
    c2d.save();
    c2d.translate(wheelX, wheelY);
    c2d.rotate(spokeRot);
    c2d.beginPath();
    c2d.moveTo(-7, 0); c2d.lineTo(7, 0);
    c2d.moveTo(0, -7); c2d.lineTo(0, 7);
    c2d.stroke();
    c2d.restore();

    // Wooden drying frame with hanging dyed fabrics
    const frameX = ox + 78;
    const frameY = oy + 94;
    c2d.strokeStyle = "#854d0e";
    c2d.lineWidth = 2;
    c2d.beginPath();
    c2d.moveTo(frameX, frameY);
    c2d.lineTo(frameX + 32, frameY + 8);
    c2d.stroke();

    // Cloth strips waving gently
    const wave = Math.sin(animTime * 3.5) * 1.5;
    // Red cloth
    c2d.fillStyle = "#dc2626";
    c2d.fillRect(frameX + 3, frameY + 2, 7, 12 + wave);
    // Blue cloth
    c2d.fillStyle = "#2563eb";
    c2d.fillRect(frameX + 13, frameY + 4, 7, 13 - wave);
    // Golden fabric
    c2d.fillStyle = "#eab308";
    c2d.fillRect(frameX + 23, frameY + 6, 7, 11 + wave);

    c2d.restore();
  }

  function renderDairyFactoryDetails(c2d, ox, oy, animTime) {
    c2d.save();

    // Wooden Butter Churn Barrel in courtyard
    const churnX = ox + 38;
    const churnY = oy + 98;
    c2d.fillStyle = "#854d0e";
    c2d.fillRect(churnX, churnY, 10, 14);
    c2d.fillStyle = "#475569";
    c2d.fillRect(churnX, churnY + 2, 10, 2);
    c2d.fillRect(churnX, churnY + 10, 10, 2);

    // Churn plunger handle bobbing up and down
    const plungeBob = Math.sin(animTime * 5.0) * 2.5;
    c2d.strokeStyle = "#b45309";
    c2d.lineWidth = 1.5;
    c2d.beginPath();
    c2d.moveTo(churnX + 5, churnY - 2 + plungeBob);
    c2d.lineTo(churnX + 5, churnY - 9 + plungeBob);
    c2d.stroke();

    // Churn handle crossbar
    c2d.beginPath();
    c2d.moveTo(churnX + 2, churnY - 8 + plungeBob);
    c2d.lineTo(churnX + 8, churnY - 8 + plungeBob);
    c2d.stroke();

    // Milk Can / Steel Pail
    const pailX = ox + 52;
    const pailY = oy + 104;
    c2d.fillStyle = "#94a3b8";
    c2d.fillRect(pailX, pailY, 7, 9);
    c2d.fillStyle = "#cbd5e1";
    c2d.fillRect(pailX + 1, pailY + 1, 5, 2);
    c2d.fillStyle = "#64748b";
    c2d.fillRect(pailX + 2, pailY - 1, 3, 2);

    // Wooden table with fresh golden butter blocks
    const tableX = ox + 76;
    const tableY = oy + 98;
    c2d.fillStyle = "#78350f";
    c2d.fillRect(tableX, tableY + 5, 20, 3);
    c2d.fillRect(tableX + 2, tableY + 8, 2, 6);
    c2d.fillRect(tableX + 16, tableY + 8, 2, 6);

    // Golden butter bricks
    c2d.fillStyle = "#facc15";
    c2d.strokeStyle = "#eab308";
    c2d.lineWidth = 0.8;
    c2d.fillRect(tableX + 4, tableY + 1, 5, 4);
    c2d.strokeRect(tableX + 4, tableY + 1, 5, 4);
    c2d.fillRect(tableX + 11, tableY, 6, 5);
    c2d.strokeRect(tableX + 11, tableY, 6, 5);

    c2d.restore();
  }

  /**
   * Vẽ hoạt họa Cây Ăn Quả Độc Lập Trồng Ngoài Đất Cỏ (Táo 🍎, Dừa 🥥, Me 🍈)
   */
  function renderFruitTreeDetails(c2d, ox, oy, animTime, tid, treeState, i, j) {
    const cfg = FRUIT_TREES_CONFIG[tid];
    if (!cfg) return;

    const now = Date.now();
    const lastHarvest = treeState ? (treeState.lastHarvest || 0) : 0;
    const elapsedSec = (now - lastHarvest) / 1000;
    const isReady = treeState ? (treeState.ready || elapsedSec >= cfg.intervalSec) : true;

    c2d.save();

    // Vị trí vòm cây trung tâm
    const canopyX = ox + 64;
    const canopyY = oy + 42;

    if (tid === "d21_apple_tree" || tid === "d23_tamarind_tree" || tid === "d22_coconut_palm") {
      // Cây Táo Đỏ, Cây Me và Cây Dừa đã có Pixel Art 3 giai đoạn tự nhiên (Lá non -> Hoa/Dừa non -> Trái chín)
      if (isReady) {
        // Lấp lánh trái chín rực rỡ
        const spPhase = animTime * 4 + i;
        c2d.font = "9px sans-serif";
        c2d.fillStyle = "#ffffff";
        c2d.fillText("✨", canopyX + Math.cos(spPhase) * 22, canopyY - 14 + Math.sin(spPhase) * 10);
      } else {
        // Thanh tiến độ sinh trưởng + nhãn giai đoạn
        const progress = Math.min(1.0, elapsedSec / cfg.intervalSec);
        const barW = 34;
        const barH = 3.5;
        const barX = canopyX - barW / 2;
        const barY = canopyY - 24;

        c2d.fillStyle = "rgba(0, 0, 0, 0.55)";
        c2d.beginPath();
        c2d.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, 2);
        c2d.fill();

        let stageFlower = "🌸 Nở hoa";
        let stageColor = "#ec4899";
        let textColor = "#fbcfe8";

        if (tid === "d23_tamarind_tree") {
          stageFlower = "🌼 Trổ hoa";
          stageColor = "#eab308";
          textColor = "#fef08a";
        } else if (tid === "d22_coconut_palm") {
          stageFlower = "🥥 Dừa non";
          stageColor = "#38bdf8";
          textColor = "#bae6fd";
        }

        c2d.fillStyle = progress >= 0.45 ? stageColor : "#22c55e";
        c2d.beginPath();
        c2d.roundRect(barX, barY, barW * progress, barH, 1.5);
        c2d.fill();

        // Huy hiệu nhỏ: "🌱 Lớn lá" hoặc "🌸 Nở hoa" / "🌼 Trổ hoa" / "🥥 Dừa non"
        const stageLabel = progress >= 0.45 ? stageFlower : "🌱 Lớn lá";
        c2d.font = "700 8px system-ui, sans-serif";
        c2d.textAlign = "center";
        c2d.fillStyle = progress >= 0.45 ? textColor : "#bbf7d0";
        c2d.shadowColor = "rgba(0,0,0,0.8)";
        c2d.shadowBlur = 3;
        c2d.fillText(stageLabel, canopyX, barY - 4);
      }
      c2d.restore();
      return;
    }

    if (isReady) {
      // Lấp lánh hoa quả chín
      const spPhase = animTime * 4 + i;
      c2d.font = "9px sans-serif";
      c2d.fillStyle = "#ffffff";
      c2d.fillText("✨", canopyX + Math.cos(spPhase) * 24, canopyY - 10 + Math.sin(spPhase) * 12);
    } else {
      // Cây đang sinh trưởng: Thanh tiến độ nhỏ
      const progress = Math.min(1.0, elapsedSec / cfg.intervalSec);
      const barW = 32;
      const barH = 3;
      const barX = canopyX - barW / 2;
      const barY = canopyY - 16;

      c2d.fillStyle = "rgba(0, 0, 0, 0.4)";
      c2d.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      c2d.fillStyle = "#22c55e";
      c2d.fillRect(barX, barY, barW * progress, barH);

      // Hoa nhỏ đang nở rộ
      const flowerSway = Math.sin(animTime * 2.5 + i) * 1.0;
      c2d.fillStyle = "#fbcfe8"; // Cánh hoa hồng phấn
      c2d.fillRect(canopyX - 12, canopyY - 6 + flowerSway, 2.5, 2.5);
      c2d.fillRect(canopyX + 10, canopyY - 10 + flowerSway, 2.5, 2.5);
      c2d.fillRect(canopyX + 2, canopyY + 4 + flowerSway, 2.5, 2.5);
    }

    c2d.restore();
  }

  // Các vật phẩm thẩm mỹ hoàng gia đã được thay thế bằng hình ảnh Pixel Art chính thức từ /assets/aistudio/
  const AESTHETIC_TILE_IDS = [];

  // Bù trừ vị trí vẽ (dx, dy) và kích thước cho các asset ảnh nghệ thuật & thẩm mỹ
  // Đảm bảo chân đế đặt chuẩn xác trên mặt phẳng ô đất kim cương:
  // - Cờ hiệu: đặt chân đế đá vào đúng tâm của ô đất (ox + 64, oy + 96)
  // - Luống hoa tulip, hàng rào gỗ, lối đi cẩm thạch: hạ sát xuống nền đất, không bị bay lơ lửng
  const TILE_RENDER_ADJUSTMENTS = {
    // Cột cờ hiệu hoàng triều: đặt vào tâm của ô đất (dy = -16 căn chân đế đá vào đúng tâm ô)
    d27_royal_banner_flag: { dx: 0, dy: -16, dw: 128, dh: 128 },
    // Luống hoa tulip nở rộ: hạ sát mặt đất phẳng (dy = +22)
    d25_tulip_flowerbed: { dx: 0, dy: 22, dw: 128, dh: 128 },
    // Hàng rào gỗ nông trang: hai cọc gỗ cắm chắc chắn xuống mặt đất (dy = +18)
    d24_rustic_wooden_fence: { dx: 0, dy: 18, dw: 128, dh: 128 },
    // Lối đi cẩm thạch hoàng gia: hạ xuống khớp khít với ô đất kim cương (dy = +22)
    r03_royal_marble_pavement: { dx: 0, dy: 22, dw: 128, dh: 128 },
    // Chuồng Gà Đẻ Trứng: hạ sát xuống nền đất kim cương không bị bay lơ lửng (dy = +22)
    b21_chicken_coop: { dx: 0, dy: 22, dw: 128, dh: 128 },
    // Chuồng Bò Sữa: hạ sát xuống nền đất kim cương không bị bay lơ lửng (dy = +22)
    b22_cow_pasture: { dx: 0, dy: 22, dw: 128, dh: 128 },
    // Chuồng Cừu Lấy Lông: hạ sát xuống nền đất kim cương không bị bay lơ lửng (dy = +22)
    b57_sheep_pasture: { dx: 0, dy: 22, dw: 128, dh: 128 }
  };

  /**
   * Kết xuất thủ công chi tiết 5 vật phẩm thẩm mỹ hoàng gia
   */
  function renderAestheticTileDetails(c2d, ox, oy, animTime, tid) {
    c2d.save();

    if (tid === "r03_royal_marble_pavement") {
      // 1. Gạch Lát Cẩm Thạch Hoàng Gia
      c2d.fillStyle = "#f8fafc";
      c2d.strokeStyle = "#f59e0b";
      c2d.lineWidth = 2.5;
      c2d.beginPath();
      c2d.moveTo(ox + 64, oy + 66);
      c2d.lineTo(ox + 124, oy + 96);
      c2d.lineTo(ox + 64, oy + 126);
      c2d.lineTo(ox + 4, oy + 96);
      c2d.closePath();
      c2d.fill();
      c2d.stroke();

      // Chỉ viền đá chéo
      c2d.strokeStyle = "#cbd5e1";
      c2d.lineWidth = 1.5;
      c2d.beginPath();
      c2d.moveTo(ox + 64, oy + 76);
      c2d.lineTo(ox + 108, oy + 96);
      c2d.lineTo(ox + 64, oy + 116);
      c2d.lineTo(ox + 20, oy + 96);
      c2d.closePath();
      c2d.stroke();
      c2d.moveTo(ox + 64, oy + 76); c2d.lineTo(ox + 64, oy + 116);
      c2d.moveTo(ox + 20, oy + 96); c2d.lineTo(ox + 108, oy + 96);
      c2d.stroke();

      // Hoa văn ngôi sao hoàng gia vàng kim ở tâm
      c2d.fillStyle = "#fef08a";
      c2d.strokeStyle = "#d97706";
      c2d.lineWidth = 1.5;
      c2d.beginPath();
      c2d.moveTo(ox + 64, oy + 88);
      c2d.lineTo(ox + 74, oy + 96);
      c2d.lineTo(ox + 64, oy + 104);
      c2d.lineTo(ox + 54, oy + 96);
      c2d.closePath();
      c2d.fill();
      c2d.stroke();
      c2d.fillStyle = "#f59e0b";
      c2d.beginPath();
      c2d.arc(ox + 64, oy + 96, 3.5, 0, Math.PI * 2);
      c2d.fill();

    } else if (tid === "d24_rustic_wooden_fence") {
      // 2. Hàng Rào Gỗ Mộc
      const posts = [
        { x: ox + 36, y: oy + 76 },
        { x: ox + 62, y: oy + 88 },
        { x: ox + 88, y: oy + 100 }
      ];

      // Thanh giằng ngang
      c2d.strokeStyle = "#92400e";
      c2d.lineWidth = 3.5;
      c2d.beginPath();
      c2d.moveTo(ox + 34, oy + 80);
      c2d.lineTo(ox + 90, oy + 106);
      c2d.stroke();

      c2d.beginPath();
      c2d.moveTo(ox + 34, oy + 92);
      c2d.lineTo(ox + 90, oy + 118);
      c2d.stroke();

      // Cột gỗ
      for (const p of posts) {
        c2d.fillStyle = "#78350f";
        c2d.fillRect(p.x - 4, p.y - 18, 8, 30);
        c2d.fillStyle = "#a16207";
        c2d.fillRect(p.x - 3, p.y - 18, 3, 30);
        c2d.beginPath();
        c2d.moveTo(p.x - 4, p.y - 18);
        c2d.lineTo(p.x, p.y - 23);
        c2d.lineTo(p.x + 4, p.y - 18);
        c2d.closePath();
        c2d.fill();
      }

      // Vài bông hoa cúc trắng nhỏ cạnh cọc rào
      c2d.fillStyle = "#ffffff";
      c2d.beginPath();
      c2d.arc(ox + 32, oy + 104, 2.5, 0, Math.PI * 2);
      c2d.arc(ox + 94, oy + 120, 2.5, 0, Math.PI * 2);
      c2d.fill();
      c2d.fillStyle = "#f59e0b";
      c2d.beginPath();
      c2d.arc(ox + 32, oy + 104, 1, 0, Math.PI * 2);
      c2d.arc(ox + 94, oy + 120, 1, 0, Math.PI * 2);
      c2d.fill();

    } else if (tid === "d25_tulip_flowerbed") {
      // 3. Luống Hoa Tulip Đỏ & Vàng
      c2d.fillStyle = "#58351e";
      c2d.strokeStyle = "#3d2212";
      c2d.lineWidth = 1.5;
      c2d.beginPath();
      c2d.moveTo(ox + 64, oy + 70);
      c2d.lineTo(ox + 118, oy + 96);
      c2d.lineTo(ox + 64, oy + 122);
      c2d.lineTo(ox + 10, oy + 96);
      c2d.closePath();
      c2d.fill();
      c2d.stroke();

      // Thảm lá xanh mướt
      c2d.fillStyle = "#15803d";
      c2d.beginPath();
      c2d.ellipse(ox + 64, oy + 96, 36, 17, 0, 0, Math.PI * 2);
      c2d.fill();
      c2d.fillStyle = "#16a34a";
      c2d.beginPath();
      c2d.ellipse(ox + 64, oy + 96, 28, 12, 0, 0, Math.PI * 2);
      c2d.fill();

      // Hoa Tulip nở rộ rực rỡ
      const tulips = [
        { x: ox + 64, y: oy + 90, color: "#e11d48", topColor: "#be123c" },
        { x: ox + 48, y: oy + 94, color: "#f43f5e", topColor: "#be123c" },
        { x: ox + 80, y: oy + 94, color: "#f43f5e", topColor: "#be123c" },
        { x: ox + 56, y: oy + 102, color: "#fbbf24", topColor: "#f59e0b" },
        { x: ox + 72, y: oy + 102, color: "#fbbf24", topColor: "#f59e0b" },
        { x: ox + 64, y: oy + 100, color: "#c026d3", topColor: "#9333ea" }
      ];

      for (const fl of tulips) {
        c2d.fillStyle = fl.color;
        c2d.beginPath();
        c2d.arc(fl.x, fl.y, 5, 0, Math.PI * 2);
        c2d.fill();
        c2d.fillStyle = fl.topColor;
        c2d.beginPath();
        c2d.moveTo(fl.x, fl.y - 6);
        c2d.lineTo(fl.x - 4, fl.y);
        c2d.lineTo(fl.x + 4, fl.y);
        c2d.closePath();
        c2d.fill();
      }

    } else if (tid === "d27_royal_banner_flag") {
      // 5. Cột Cờ Hiệu Hoàng Triều Tung Bay
      c2d.fillStyle = "#64748b";
      c2d.strokeStyle = "#334155";
      c2d.lineWidth = 1.5;
      c2d.beginPath();
      c2d.ellipse(ox + 64, oy + 98, 16, 8, 0, 0, Math.PI * 2);
      c2d.fill();
      c2d.stroke();

      c2d.fillStyle = "#94a3b8";
      c2d.beginPath();
      c2d.ellipse(ox + 64, oy + 96, 12, 6, 0, 0, Math.PI * 2);
      c2d.fill();

      // Cột cờ bằng đồng thau cao vút
      c2d.strokeStyle = "#d97706";
      c2d.lineWidth = 3.5;
      c2d.beginPath();
      c2d.moveTo(ox + 64, oy + 94);
      c2d.lineTo(ox + 64, oy + 18);
      c2d.stroke();

      c2d.strokeStyle = "#fef08a";
      c2d.lineWidth = 1.2;
      c2d.beginPath();
      c2d.moveTo(ox + 63, oy + 94);
      c2d.lineTo(ox + 63, oy + 18);
      c2d.stroke();

      // Quả cầu vàng trên đỉnh cột
      c2d.fillStyle = "#f59e0b";
      c2d.strokeStyle = "#b45309";
      c2d.lineWidth = 1.2;
      c2d.beginPath();
      c2d.arc(ox + 64, oy + 16, 4, 0, Math.PI * 2);
      c2d.fill();
      c2d.stroke();

      // Cờ hiệu đuôi én đỏ hoàng gia tung bay trong gió (Có sóng hoạt họa)
      const flagWave = Math.sin(animTime * 4.5) * 3.5;
      c2d.fillStyle = "#dc2626";
      c2d.strokeStyle = "#f59e0b";
      c2d.lineWidth = 1.8;
      c2d.beginPath();
      c2d.moveTo(ox + 64, oy + 22);
      c2d.lineTo(ox + 108 + flagWave, oy + 32);
      c2d.lineTo(ox + 94 + flagWave * 0.8, oy + 44);
      c2d.lineTo(ox + 108 + flagWave, oy + 56);
      c2d.lineTo(ox + 64, oy + 50);
      c2d.closePath();
      c2d.fill();
      c2d.stroke();

      // Huy hiệu vương miện vàng ở giữa cờ
      c2d.fillStyle = "#fef08a";
      c2d.beginPath();
      c2d.arc(ox + 82 + flagWave * 0.5, oy + 39, 5, 0, Math.PI * 2);
      c2d.fill();
      c2d.fillStyle = "#b45309";
      c2d.beginPath();
      c2d.moveTo(ox + 79 + flagWave * 0.5, oy + 40);
      c2d.lineTo(ox + 85 + flagWave * 0.5, oy + 40);
      c2d.lineTo(ox + 84 + flagWave * 0.5, oy + 37);
      c2d.lineTo(ox + 82 + flagWave * 0.5, oy + 39);
      c2d.lineTo(ox + 80 + flagWave * 0.5, oy + 37);
      c2d.closePath();
      c2d.fill();
    }

    c2d.restore();
  }

  /**
   * Hàm kết xuất chính: RENDER CANVAS
   */
  function renderCanvas() {
    // 0. Đảm bảo tham chiếu DOM hợp lệ
    ctx.ensureCanvasRef();
    const canvas = ctx.getCanvas();
    const container = ctx.getContainer();
    const c2d = ctx.getContext2D();
    if (!canvas || !container || !c2d) return;

    // Đảm bảo canvas có kích thước hợp lệ
    if (canvas.width <= 0 || canvas.height <= 0) {
      const { width: vw, height: vh } = ctx.getViewportSize();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = vw + 'px';
      canvas.style.height = vh + 'px';
      if (canvas.width <= 0 || canvas.height <= 0) return;
    }

    // 1. Reset canvas transform, composite mode, and clear full buffer
    c2d.setTransform(1, 0, 0, 1, 0, 0);
    c2d.globalCompositeOperation = 'source-over';
    c2d.globalAlpha = 1.0;
    c2d.clearRect(0, 0, canvas.width, canvas.height);

    const dpr = window.devicePixelRatio || 1;
    const viewW = canvas.width / dpr;
    const viewH = canvas.height / dpr;

    const camera = ctx.getCamera();
    const dayNightWeather = ctx.getDayNightWeather();
    const currentGrid = ctx.getCurrentGrid();
    const constructions = ctx.getConstructions();
    const farmlandState = ctx.getFarmlandState();
    const productionState = ctx.getProductionState();
    const buildingLevels = ctx.getBuildingLevels();
    const landUnlockedChunks = ctx.getLandUnlockedChunks();
    const flippedGrid = ctx.getFlippedGrid();
    const upgradesInProgress = ctx.getUpgradesInProgress();
    const gameMode = ctx.getGameMode();
    const playerResources = ctx.getPlayerResources();
    const villagerManager = ctx.getVillagerManager();
    const fruitTreesState = ctx.getFruitTreesState ? ctx.getFruitTreesState() : null;
    const petManager = ctx.getPetManager ? ctx.getPetManager() : null;
    const orderBoardManager = ctx.getOrderBoardManager ? ctx.getOrderBoardManager() : null;
    const livestockState = ctx.getLivestockState ? ctx.getLivestockState() : {};
    const townVisitorManager = ctx.getTownVisitorManager ? ctx.getTownVisitorManager() : null;
    const harborShipManager = ctx.getHarborShipManager ? ctx.getHarborShipManager() : null;
    const vehicleManager = ctx.getVehicleManager ? ctx.getVehicleManager() : null;
    const kingdomWondersManager = ctx.getKingdomWondersManager ? ctx.getKingdomWondersManager() : null;
    const seasonalThemeManager = ctx.getSeasonalThemeManager ? ctx.getSeasonalThemeManager() : null;
    const hoverCell = ctx.getHoverCell();
    const activeBrush = ctx.getActiveBrush();
    const brushFlipped = ctx.getBrushFlipped();
    const activeFarmTool = ctx.getActiveFarmTool();
    const activeSeedBrush = ctx.getActiveSeedBrush();
    const movingBuilding = ctx.getMovingBuilding();
    const animTime = ctx.getAnimTime();

    c2d.save();
    try {
      c2d.scale(dpr, dpr);

      // Render Dynamic Sky (Dawn, Day, Sunset, Night with stars)
      if (dayNightWeather) {
        dayNightWeather.renderSky(c2d, viewW, viewH);
      }

      c2d.save();
      c2d.translate(camera.x, camera.y);
      c2d.scale(camera.zoom, camera.zoom);

      // Render grid tiles depth sorted (Bao gồm Vương quốc 32x32 và Cánh rừng đại ngàn bao quanh 4 phía)
      const FOREST_BORDER = 24;
      const minI = -FOREST_BORDER;
      const maxI = ROWS - 1 + FOREST_BORDER;
      const minJ = -FOREST_BORDER;
      const maxJ = COLS - 1 + FOREST_BORDER;
      const minDepth = minI + minJ;
      const maxDepth = maxI + maxJ;

      for (let depth = minDepth; depth <= maxDepth; depth++) {
        const startI = Math.max(minI, depth - maxJ);
        const endI = Math.min(maxI, depth - minJ);

        for (let i = startI; i <= endI; i++) {
          const j = depth - i;
          const ox = ORIGIN_X + (j - i) * HALF_W;
          const oy = ORIGIN_Y + (i + j) * QUARTER_W;

          // Fast viewport culling with safe padding (320px)
          if (!isTileInViewport(ox, oy, camera, viewW, viewH, 320)) continue;

          const isPlayable = (i >= 0 && i < ROWS && j >= 0 && j < COLS);
          if (!isPlayable) {
            renderSurroundingTile(c2d, i, j, ox, oy, imageCache, dayNightWeather);
            continue;
          }

          if (isPlayable) {
            const tid = currentGrid[i][j];
            const key = `${i}_${j}`;

            if (constructions[key]) {
              const c = constructions[key];
              const elapsed = Date.now() - c.startTime;
              const progress = Math.min(1.0, elapsed / c.durationMs);

              c2d.save();
              c2d.strokeStyle = "#d97706";
              c2d.lineWidth = 2;
              c2d.beginPath();
              c2d.moveTo(ox + 64, oy + 64);
              c2d.lineTo(ox + 128, oy + 96);
              c2d.lineTo(ox + 64, oy + 128);
              c2d.lineTo(ox, oy + 96);
              c2d.closePath();
              c2d.stroke();

              const cImg = imageCache[c.targetTileId];
              if (isImageReady(cImg)) {
                const cAdj = TILE_RENDER_ADJUSTMENTS[c.targetTileId] || { dx: 0, dy: 0, dw: 128, dh: 128 };
                const cDx = cAdj.dx || 0;
                const cDy = cAdj.dy || 0;
                const cDw = cAdj.dw || 128;
                const cDh = cAdj.dh || 128;
                c2d.save();
                c2d.globalAlpha = 0.35 + progress * 0.45;
                if (c.flipped) {
                  c2d.translate(ox + 128 - cDx, oy + cDy);
                  c2d.scale(-1, 1);
                  c2d.drawImage(cImg, 0, 0, cDw, cDh);
                } else {
                  c2d.drawImage(cImg, ox + cDx, oy + cDy, cDw, cDh);
                }
                c2d.restore();
              }

              const bounce = Math.sin(animTime * 6.0) * 3;
              c2d.font = "20px sans-serif";
              c2d.textAlign = "center";
              c2d.fillText("🏗️", ox + 64, oy + 70 + bounce);

              const secLeft = Math.ceil((c.durationMs - elapsed) / 1000);
              const gemCost = Math.max(1, Math.ceil(secLeft / 15));
              const barW = 56;
              const barH = 6;
              const barX = ox + 64 - barW / 2;
              const barY = oy + 104;

              c2d.fillStyle = "rgba(15, 23, 42, 0.75)";
              c2d.beginPath();
              c2d.roundRect(barX - 2, barY - 2, barW + 4, barH + 4, 3);
              c2d.fill();

              c2d.fillStyle = "#f59e0b";
              c2d.beginPath();
              c2d.roundRect(barX, barY, Math.max(2, barW * progress), barH, 2);
              c2d.fill();

              // Badge: 15s ⚡💎 1
              const tagW = 66;
              const tagH = 17;
              const tagX = ox + 64 - tagW / 2;
              const tagY = barY - 20;
              c2d.fillStyle = "rgba(15, 23, 42, 0.9)";
              c2d.strokeStyle = "#38bdf8";
              c2d.lineWidth = 1;
              c2d.beginPath();
              c2d.roundRect(tagX, tagY, tagW, tagH, 8);
              c2d.fill();
              c2d.stroke();

              c2d.font = "700 9px sans-serif";
              c2d.fillStyle = "#ffffff";
              c2d.textAlign = "center";
              c2d.textBaseline = "middle";
              c2d.shadowColor = "rgba(0,0,0,0.8)";
              c2d.shadowBlur = 3;
              c2d.fillText(`${secLeft}s  ⚡💎${gemCost}`, ox + 64, tagY + tagH / 2);
              c2d.restore();
              continue;
            }

            if (tid === "d13_farmland_plot") {
              const farmImg = imageCache["d13_farmland_plot"];
              if (isImageReady(farmImg)) {
                c2d.drawImage(farmImg, ox, oy);
              } else {
                c2d.save();
                c2d.beginPath();
                c2d.moveTo(ox + 64, oy + 64);
                c2d.lineTo(ox + 128, oy + 96);
                c2d.lineTo(ox + 64, oy + 128);
                c2d.lineTo(ox, oy + 96);
                c2d.closePath();
                c2d.fillStyle = "#553018";
                c2d.fill();
                c2d.strokeStyle = "#3e210e";
                c2d.lineWidth = 1;
                c2d.stroke();
                c2d.restore();
              }

              const farmData = farmlandState[key];
              if (farmData) {
                const cropCfg = CROPS_CONFIG[farmData.seedId];
                if (cropCfg) {
                  const elapsed = Date.now() - farmData.plantTime;
                  const progress = Math.min(1.0, elapsed / farmData.growDurationMs);
                  const isRipe = progress >= 1.0;
                  const cropCenterX = ox + 64;
                  const cropCenterY = oy + 90;

                  if (isRipe) {
                    const bounceY = Math.sin(animTime * 4.0 + (i * 2 + j * 3)) * 4;
                    const bubbleX = cropCenterX;
                    const bubbleY = oy + 30 + bounceY;

                    // Hay Day Golden Twinkling Sparkles
                    const spTime = animTime * 4.0 + (i * 3 + j * 5);
                    const spAlpha = Math.max(0, Math.sin(spTime));
                    if (spAlpha > 0.35) {
                      c2d.save();
                      c2d.font = "12px sans-serif";
                      c2d.globalAlpha = spAlpha;
                      c2d.fillText("✨", cropCenterX + Math.cos(spTime) * 16, cropCenterY - 18 + Math.sin(spTime) * 10);
                      c2d.restore();
                    }

                    // Harvest Bubble
                    c2d.save();
                    c2d.fillStyle = "rgba(0, 0, 0, 0.3)";
                    c2d.beginPath();
                    c2d.ellipse(bubbleX, bubbleY + 16, 14, 4, 0, 0, Math.PI * 2);
                    c2d.fill();

                    c2d.fillStyle = "#ffffff";
                    c2d.strokeStyle = "#22c55e";
                    c2d.lineWidth = 2.5;
                    c2d.beginPath();
                    c2d.arc(bubbleX, bubbleY, 16, 0, Math.PI * 2);
                    c2d.fill();
                    c2d.stroke();

                    const iconImg = cropImageCache['icon_' + farmData.seedId];
                    if (isImageReady(iconImg)) {
                      c2d.imageSmoothingEnabled = false;
                      c2d.drawImage(iconImg, bubbleX - 11, bubbleY - 11, 22, 22);
                    } else {
                      c2d.font = "18px sans-serif";
                      c2d.textAlign = "center";
                      c2d.textBaseline = "middle";
                      c2d.fillText(cropCfg.icon, bubbleX, bubbleY);
                    }

                    const badgeText = `+${cropCfg.harvestYield || 3} Chín!`;
                    c2d.fillStyle = "#15803d";
                    c2d.beginPath();
                    c2d.roundRect(bubbleX - 25, bubbleY + 12, 50, 14, 4);
                    c2d.fill();

                    c2d.font = "700 9px monospace";
                    c2d.fillStyle = "#ffffff";
                    c2d.fillText(badgeText, bubbleX, bubbleY + 19);
                    c2d.restore();

                    // Ripe Crop with Hay Day Wind Sway
                    const swayAngle = Math.sin(animTime * 3.2 + (i * 1.5 + j * 2)) * 0.07;
                    const ripeImg = cropImageCache[farmData.seedId];
                    if (isImageReady(ripeImg)) {
                      c2d.save();
                      c2d.imageSmoothingEnabled = false;
                      c2d.translate(cropCenterX, cropCenterY);
                      c2d.rotate(swayAngle);
                      c2d.drawImage(ripeImg, -24, -32, 48, 48);
                      c2d.restore();
                    } else {
                      c2d.save();
                      c2d.font = "24px sans-serif";
                      c2d.textAlign = "center";
                      c2d.textBaseline = "middle";
                      c2d.fillText(cropCfg.icon, cropCenterX, cropCenterY);
                      c2d.restore();
                    }
                  } else if (progress < 0.50) {
                    // Trạng thái 2: Planted (Giai đoạn 1: 0% - 50% thời gian) - Hiển thị mầm cây
                    const sproutImg = cropImageCache['sprout'];
                    if (isImageReady(sproutImg)) {
                      c2d.save();
                      c2d.imageSmoothingEnabled = false;
                      c2d.drawImage(sproutImg, cropCenterX - 18, cropCenterY - 22, 36, 36);
                      c2d.restore();
                    } else {
                      c2d.save();
                      c2d.font = "18px sans-serif";
                      c2d.textAlign = "center";
                      c2d.textBaseline = "middle";
                      c2d.fillText("🌱", cropCenterX, cropCenterY);
                      c2d.restore();
                    }
                  } else {
                    const bushImg = cropImageCache['bush'];
                    const windSway = Math.sin(animTime * 3.0 + i * 2 + j * 3) * 1.8;
                    if (isImageReady(bushImg)) {
                      c2d.save();
                      c2d.imageSmoothingEnabled = false;
                      c2d.drawImage(bushImg, cropCenterX - 22 + windSway, cropCenterY - 28, 44, 44);
                      c2d.restore();
                    } else {
                      c2d.save();
                      c2d.font = "22px sans-serif";
                      c2d.textAlign = "center";
                      c2d.textBaseline = "middle";
                      c2d.fillText("🌿", cropCenterX + windSway, cropCenterY);
                      c2d.restore();
                    }
                  }

                  if (!isRipe) {
                    const miniW = 34;
                    const miniH = 3;
                    const miniX = cropCenterX - miniW / 2;
                    const miniY = oy + 104;
                    c2d.save();
                    c2d.fillStyle = "rgba(0, 0, 0, 0.45)";
                    c2d.fillRect(miniX - 1, miniY - 1, miniW + 2, miniH + 2);
                    c2d.fillStyle = "#22c55e";
                    c2d.fillRect(miniX, miniY, miniW * progress, miniH);
                    c2d.restore();
                  }
                }
              }
            } else {
              let img = imageCache[tid];
              let drawOffsetY = 0;

              // Xử lý Cây Táo Đỏ, Cây Me & Cây Dừa 3 Giai Đoạn
              if (tid === "d21_apple_tree") {
                const p = productionState[key] || (fruitTreesState ? fruitTreesState[key] : null);
                const now = Date.now();
                const lastHarvest = p ? (p.lastHarvest || 0) : 0;
                const cfg = FRUIT_TREES_CONFIG[tid];
                const pIntervalMs = (cfg && cfg.intervalSec) ? cfg.intervalSec * 1000 : 45000;
                const pElapsed = now - lastHarvest;
                const isReady = p ? (p.ready || pElapsed >= pIntervalMs) : true;
                const progress = Math.min(1.0, pElapsed / pIntervalMs);

                if (isReady) {
                  img = appleTreeStageImages.ripe;
                } else if (progress >= 0.45) {
                  img = appleTreeStageImages.flowering;
                } else {
                  img = appleTreeStageImages.growing;
                }
              } else if (tid === "d23_tamarind_tree") {
                const p = productionState[key] || (fruitTreesState ? fruitTreesState[key] : null);
                const now = Date.now();
                const lastHarvest = p ? (p.lastHarvest || 0) : 0;
                const cfg = FRUIT_TREES_CONFIG[tid];
                const pIntervalMs = (cfg && cfg.intervalSec) ? cfg.intervalSec * 1000 : 60000;
                const pElapsed = now - lastHarvest;
                const isReady = p ? (p.ready || pElapsed >= pIntervalMs) : true;
                const progress = Math.min(1.0, pElapsed / pIntervalMs);

                if (isReady) {
                  img = tamarindTreeStageImages.ripe;
                } else if (progress >= 0.45) {
                  img = tamarindTreeStageImages.flowering;
                } else {
                  img = tamarindTreeStageImages.growing;
                }
              } else if (tid === "d22_coconut_palm") {
                const p = productionState[key] || (fruitTreesState ? fruitTreesState[key] : null);
                const now = Date.now();
                const lastHarvest = p ? (p.lastHarvest || 0) : 0;
                const cfg = FRUIT_TREES_CONFIG[tid];
                const pIntervalMs = (cfg && cfg.intervalSec) ? cfg.intervalSec * 1000 : 60000;
                const pElapsed = now - lastHarvest;
                const isReady = p ? (p.ready || pElapsed >= pIntervalMs) : true;
                const progress = Math.min(1.0, pElapsed / pIntervalMs);

                if (isReady) {
                  img = coconutPalmStageImages.ripe;
                } else if (progress >= 0.45) {
                  img = coconutPalmStageImages.flowering;
                } else {
                  img = coconutPalmStageImages.growing;
                }
              }

              const baseMeadow = imageCache["d12_meadow_wildflowers"];
              if (isImageReady(baseMeadow) && tid !== "d12_meadow_wildflowers") {
                c2d.drawImage(baseMeadow, ox, oy);
              }
              if (!isImageReady(img)) {
                img = baseMeadow;
              }
              const isCellBeingMoved = movingBuilding && movingBuilding.fromRow === i && movingBuilding.fromCol === j;

              if (isImageReady(img)) {
                const tileAdj = TILE_RENDER_ADJUSTMENTS[tid] || { dx: 0, dy: 0, dw: 128, dh: 128 };
                const tDx = tileAdj.dx || 0;
                const tDy = (tileAdj.dy || 0) + drawOffsetY;
                const tDw = tileAdj.dw || 128;
                const tDh = tileAdj.dh || 128;
                c2d.save();
                if (isCellBeingMoved) c2d.globalAlpha = 0.35;
                if (flippedGrid[key]) {
                  c2d.translate(ox + 128 - tDx, oy + tDy);
                  c2d.scale(-1, 1);
                  c2d.drawImage(img, 0, 0, tDw, tDh);
                } else {
                  c2d.drawImage(img, ox + tDx, oy + tDy, tDw, tDh);
                }
                c2d.restore();
              } else {
                // Procedural fallback: đảm bảo luôn hiện thảm cỏ xanh mướt ngay cả khi ảnh chưa kịp decode
                c2d.save();
                c2d.beginPath();
                c2d.moveTo(ox + 64, oy + 64);
                c2d.lineTo(ox + 128, oy + 96);
                c2d.lineTo(ox + 64, oy + 128);
                c2d.lineTo(ox, oy + 96);
                c2d.closePath();
                c2d.fillStyle = "#5cb85c";
                c2d.fill();
                c2d.strokeStyle = "#4cae4c";
                c2d.lineWidth = 1;
                c2d.stroke();
                c2d.restore();
              }

              // 5 Vật phẩm thẩm mỹ & trang trí hoàng gia
              if (AESTHETIC_TILE_IDS.includes(tid)) {
                c2d.save();
                if (isCellBeingMoved) c2d.globalAlpha = 0.35;
                renderAestheticTileDetails(c2d, ox, oy, animTime, tid);
                c2d.restore();
              }

              const ls = (livestockState && livestockState[key]) ? livestockState[key] : null;
              if (isCellBeingMoved) c2d.save(), c2d.globalAlpha = 0.35;
              if (tid === "b21_chicken_coop") {
                renderLivestockChickens(c2d, ox, oy, animTime, productionState[key], ls);
              } else if (tid === "b22_cow_pasture") {
                renderDairyCows(c2d, ox, oy, animTime, productionState[key], tid, ls);
              } else if (tid === "b57_sheep_pasture") {
                renderLivestockSheep(c2d, ox, oy, animTime, productionState[key], ls);
              } else if (tid === "b58_textile_mill") {
                renderTextileMillDetails(c2d, ox, oy, animTime);
              } else if (tid === "b59_dairy_factory") {
                renderDairyFactoryDetails(c2d, ox, oy, animTime);
              }
              if (isCellBeingMoved) c2d.restore();

              // Cây ăn quả độc lập trên cỏ (Táo 🍎, Dừa 🥥, Me 🍈)
              if (FRUIT_TREES_CONFIG[tid]) {
                renderFruitTreeDetails(c2d, ox, oy, animTime, tid, productionState[key] || (fruitTreesState ? fruitTreesState[key] : null), i, j);
              }

              // Bong bóng danh vọng Thành Tựu trên nóc Tòa Thị Chính
              if (tid === "b14_town_hall") {
                const hasClaimable = ctx.hasClaimableAchievements ? ctx.hasClaimableAchievements() : false;
                if (hasClaimable) {
                  c2d.save();
                  const bounceY = Math.sin(animTime * 4.0) * 5;
                  const bx = ox + 64;
                  const by = oy + 2 + bounceY;

                  // Sparkles
                  c2d.font = "14px sans-serif";
                  c2d.textAlign = "center";
                  c2d.textBaseline = "middle";
                  c2d.fillText("✨", bx - 22, by - 12);
                  c2d.fillText("✨", bx + 22, by - 10);

                  // Bubble outer shadow & border
                  c2d.fillStyle = "#ffffff";
                  c2d.shadowColor = "#f59e0b";
                  c2d.shadowBlur = 14;
                  c2d.beginPath();
                  c2d.arc(bx, by, 18, 0, Math.PI * 2);
                  c2d.fill();

                  c2d.lineWidth = 2.5;
                  c2d.strokeStyle = "#f59e0b";
                  c2d.stroke();
                  c2d.shadowBlur = 0;

                  // Trophy Icon
                  c2d.font = "20px sans-serif";
                  c2d.fillText("🏆", bx, by + 1);

                  // Ribbon Tag
                  c2d.fillStyle = "#d97706";
                  c2d.beginPath();
                  c2d.roundRect(bx - 32, by + 14, 64, 15, 4);
                  c2d.fill();
                  c2d.font = "800 9px sans-serif";
                  c2d.fillStyle = "#ffffff";
                  c2d.fillText("THÀNH TỰU ⭐", bx, by + 21.5);

                  c2d.restore();
                }
              }

              // Night lights for streetlamps and buildings
              if (dayNightWeather) {
                if (tid === "d07_streetlamps_signpost") {
                  dayNightWeather.renderLightGlow(c2d, ox + 64, oy + 82, 75, 0.95);
                } else if (tid.startsWith("b") || tid === "d01_plaza_fountain") {
                  dayNightWeather.renderLightGlow(c2d, ox + 64, oy + 95, 48, 0.65);
                }
              }

              // Production Building Status & Harvest Bubbles (Bỏ qua chuồng trại chăn nuôi đã render riêng)
              const isLivestock = tid === "b21_chicken_coop" || tid === "b22_cow_pasture" || tid === "b57_sheep_pasture";
              if (PRODUCTION_BUILDINGS[tid] && !isLivestock) {
                const prod = PRODUCTION_BUILDINGS[tid];
                let p = productionState[key];
                if (!p) {
                  p = { lastHarvest: Date.now(), ready: false };
                  productionState[key] = p;
                }

                const bLvl = buildingLevels[key] || 1;
                const speedMult = bLvl === 3 ? 1.6 : (bLvl === 2 ? 1.3 : 1.0);
                const pIntervalMs = Math.round((prod.intervalSec * 1000) / speedMult);
                const pElapsed = Date.now() - p.lastHarvest;

                if (pElapsed >= pIntervalMs && !p.ready && !p.paused) {
                  if (tid === "b06_bakery") {
                    const reqWheat = getBuildingInputReq(tid, bLvl);
                    if ((playerResources.wheat || 0) >= reqWheat) {
                      playerResources.wheat -= reqWheat;
                      p.ready = true;
                      ctx.updateResourcesUI();
                    } else {
                      p.paused = true;
                      p.pauseReason = "missing_wheat";
                    }
                  } else if (tid === "b21_chicken_coop") {
                    const reqWheat = getBuildingInputReq(tid, bLvl);
                    if ((playerResources.wheat || 0) >= reqWheat) {
                      playerResources.wheat -= reqWheat;
                      p.ready = true;
                      ctx.updateResourcesUI();
                    } else {
                      p.paused = true;
                      p.pauseReason = "missing_wheat";
                    }
                  } else if (tid === "b13_barn_silo" || tid === "b22_cow_pasture") {
                    const reqCorn = getBuildingInputReq(tid, bLvl);
                    if ((playerResources.corn || 0) >= reqCorn) {
                      playerResources.corn -= reqCorn;
                      p.ready = true;
                      ctx.updateResourcesUI();
                    } else {
                      p.paused = true;
                      p.pauseReason = "missing_corn";
                    }
                  } else if (tid === "b57_sheep_pasture") {
                    const reqCarrot = getBuildingInputReq(tid, bLvl);
                    if ((playerResources.carrot || 0) >= reqCarrot) {
                      playerResources.carrot -= reqCarrot;
                      p.ready = true;
                      ctx.updateResourcesUI();
                    } else {
                      p.paused = true;
                      p.pauseReason = "missing_carrot";
                    }
                  } else if (tid === "b58_textile_mill") {
                    const reqWool = getBuildingInputReq(tid, bLvl);
                    if ((playerResources.wool || 0) >= reqWool) {
                      playerResources.wool -= reqWool;
                      p.ready = true;
                      ctx.updateResourcesUI();
                    } else {
                      p.paused = true;
                      p.pauseReason = "missing_wool";
                    }
                  } else if (tid === "b59_dairy_factory") {
                    const reqMilk = getBuildingInputReq(tid, bLvl);
                    if ((playerResources.milk || 0) >= reqMilk) {
                      playerResources.milk -= reqMilk;
                      p.ready = true;
                      ctx.updateResourcesUI();
                    } else {
                      p.paused = true;
                      p.pauseReason = "missing_milk";
                    }
                  } else if (tid === "b47_winery_press_barn_sw" || tid === "b48_winery_press_barn_se") {
                    const reqGrapes = getBuildingInputReq(tid, bLvl);
                    if ((playerResources.grapes || 0) >= reqGrapes) {
                      playerResources.grapes -= reqGrapes;
                      p.ready = true;
                      ctx.updateResourcesUI();
                    } else {
                      p.paused = true;
                      p.pauseReason = "missing_grapes";
                    }
                  } else {
                    p.ready = true;
                  }
                }

                if (p.paused && (p.pauseReason === "missing_wheat" || p.pauseReason === "missing_corn" || p.pauseReason === "missing_carrot" || p.pauseReason === "missing_wool" || p.pauseReason === "missing_milk" || p.pauseReason === "missing_grapes")) {
                  const bounceY = Math.sin(animTime * 4.0 + (i * 2 + j * 3)) * 3.5;
                  const bubbleX = ox + 64;
                  const bubbleY = oy + 6 + bounceY;

                  c2d.save();
                  c2d.fillStyle = "#fffbeb";
                  c2d.strokeStyle = "#f59e0b";
                  c2d.lineWidth = 2.5;
                  c2d.beginPath();
                  c2d.arc(bubbleX, bubbleY, 15, 0, Math.PI * 2);
                  c2d.fill();
                  c2d.stroke();

                  let iconText = "⚠️🌾";
                  let reasonText = "Thiếu lúa mì";
                  if (p.pauseReason === "missing_corn") {
                    iconText = "⚠️🌽";
                    reasonText = "Cần bắp ngô";
                  } else if (p.pauseReason === "missing_carrot") {
                    iconText = "⚠️🥕";
                    reasonText = "Cần cà rốt";
                  } else if (p.pauseReason === "missing_wool") {
                    iconText = "⚠️🐑";
                    reasonText = "Cần lông cừu";
                  } else if (p.pauseReason === "missing_milk") {
                    iconText = "⚠️🥛";
                    reasonText = "Cần sữa tươi";
                  } else if (p.pauseReason === "missing_grapes") {
                    iconText = "⚠️🍇";
                    reasonText = "Cần nho tím";
                  } else if (tid === "b21_chicken_coop") {
                    reasonText = "Cần lúa mì";
                  }

                  c2d.font = "14px sans-serif";
                  c2d.textAlign = "center";
                  c2d.textBaseline = "middle";
                  c2d.fillText(iconText, bubbleX, bubbleY);

                  c2d.fillStyle = "#d97706";
                  c2d.beginPath();
                  c2d.roundRect(bubbleX - 30, bubbleY + 11, 60, 12, 4);
                  c2d.fill();

                  c2d.font = "700 8px sans-serif";
                  c2d.fillStyle = "#ffffff";
                  c2d.fillText(reasonText, bubbleX, bubbleY + 17);
                  c2d.restore();
                } else if (p.ready) {
                  const bounceY = Math.sin(animTime * 3.5 + (i * 2 + j * 3)) * 4;
                  const bubbleX = ox + 64;
                  const bubbleY = oy + 6 + bounceY;

                  c2d.save();
                  c2d.fillStyle = "#ffffff";
                  c2d.strokeStyle = "#10b981";
                  c2d.lineWidth = 2.5;
                  c2d.beginPath();
                  c2d.arc(bubbleX, bubbleY, 16, 0, Math.PI * 2);
                  c2d.fill();
                  c2d.stroke();

                  c2d.font = "16px sans-serif";
                  c2d.textAlign = "center";
                  c2d.textBaseline = "middle";
                  c2d.fillText(prod.icon || "🪙", bubbleX, bubbleY);

                  const uCfg = UPGRADES_CONFIG[tid];
                  const curGoldGain = (prod.rewardGold || 10) + (bLvl > 1 && uCfg && uCfg[bLvl] && uCfg[bLvl].goldBonus ? uCfg[bLvl].goldBonus : 0);
                  let badgeText = `+${curGoldGain}🪙`;
                  const yieldQty = getBuildingYield(tid, bLvl);
                  if (tid === "b04_windmill") {
                    badgeText = `+${yieldQty}🌾 +${curGoldGain}🪙`;
                  } else if (tid === "b06_bakery") {
                    badgeText = `+${yieldQty}🍞 +${curGoldGain}🪙`;
                  } else if (tid === "b03_blacksmith_forge") {
                    badgeText = `+${yieldQty}⚒️ +${curGoldGain}🪙`;
                  } else if (tid === "b21_chicken_coop") {
                    badgeText = `+${yieldQty}🥚 +${curGoldGain}🪙`;
                  } else if (tid === "b13_barn_silo" || tid === "b22_cow_pasture") {
                    badgeText = `+${yieldQty}🥛 +${curGoldGain}🪙`;
                  } else if (tid === "b57_sheep_pasture") {
                    badgeText = `+${yieldQty}🐑 +${curGoldGain}🪙`;
                  } else if (tid === "b58_textile_mill") {
                    badgeText = `+${yieldQty}🧵 +${curGoldGain}🪙`;
                  } else if (tid === "b59_dairy_factory") {
                    badgeText = `+${yieldQty}🧈 +${curGoldGain}🪙`;
                  } else if (tid === "b47_winery_press_barn_sw" || tid === "b48_winery_press_barn_se") {
                    badgeText = `+${yieldQty}🍷 +${curGoldGain}🪙`;
                  } else if (tid === "d21_apple_tree") {
                    badgeText = `+${yieldQty}🍎 +${curGoldGain}🪙`;
                  } else if (tid === "d22_coconut_palm") {
                    badgeText = `+${yieldQty}🥥 +${curGoldGain}🪙`;
                  } else if (tid === "d23_tamarind_tree") {
                    badgeText = `+${yieldQty}🍈 +${curGoldGain}🪙`;
                  }

                  c2d.fillStyle = "#15803d";
                  c2d.beginPath();
                  c2d.roundRect(bubbleX - 28, bubbleY + 12, 56, 13, 4);
                  c2d.fill();

                  c2d.font = "700 8.5px monospace";
                  c2d.fillStyle = "#ffffff";
                  c2d.fillText(badgeText, bubbleX, bubbleY + 18.5);
                  c2d.restore();
                } else {
                  const pProg = Math.min(1.0, pElapsed / pIntervalMs);
                  const miniW = 34;
                  const miniH = 3;
                  const miniX = ox + 64 - miniW / 2;
                  const miniY = oy + 26;

                  c2d.save();
                  c2d.fillStyle = "rgba(0, 0, 0, 0.45)";
                  c2d.fillRect(miniX - 1, miniY - 1, miniW + 2, miniH + 2);
                  c2d.fillStyle = "#e2b474";
                  c2d.fillRect(miniX, miniY, miniW * pProg, miniH);
                  c2d.restore();
                }
              }

              // Upgrade In Progress Overlay & Level Badges
              if (upgradesInProgress[key]) {
                const u = upgradesInProgress[key];
                const elapsed = Date.now() - u.startTime;
                const progress = Math.min(1.0, elapsed / u.durationMs);

                c2d.save();
                c2d.strokeStyle = "#2563eb";
                c2d.lineWidth = 2;
                c2d.beginPath();
                c2d.moveTo(ox + 64, oy + 64);
                c2d.lineTo(ox + 128, oy + 96);
                c2d.lineTo(ox + 64, oy + 128);
                c2d.lineTo(ox, oy + 96);
                c2d.closePath();
                c2d.stroke();

                const bounce = Math.sin(animTime * 6.0) * 3;
                c2d.font = "20px sans-serif";
                c2d.textAlign = "center";
                c2d.fillText("⭐", ox + 64, oy + 68 + bounce);

                const barW = 48;
                const barH = 5;
                const barX = ox + 64 - barW / 2;
                const barY = oy + 104;

                c2d.fillStyle = "rgba(0, 0, 0, 0.65)";
                c2d.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
                c2d.fillStyle = "#3b82f6";
                c2d.fillRect(barX, barY, barW * progress, barH);

                const secLeft = Math.ceil((u.durationMs - elapsed) / 1000);
                c2d.font = "700 9px sans-serif";
                c2d.fillStyle = "#ffffff";
                c2d.shadowColor = "#000";
                c2d.shadowBlur = 3;
                c2d.fillText(`Cấp ${u.targetLevel} (${secLeft}s)`, ox + 64, barY - 3);
                c2d.restore();
              } else {
                const curBuildingLevel = buildingLevels[key] || 1;
                if (curBuildingLevel > 1) {
                  c2d.save();
                  const starBadge = curBuildingLevel === 3 ? "🌟 Lv.3" : "⭐ Lv.2";
                  c2d.fillStyle = "rgba(0, 0, 0, 0.65)";
                  c2d.beginPath();
                  c2d.roundRect(ox + 64 - 20, oy + 98, 40, 14, 4);
                  c2d.fill();
                  c2d.font = "700 9px sans-serif";
                  c2d.fillStyle = "#fef08a";
                  c2d.textAlign = "center";
                  c2d.textBaseline = "middle";
                  c2d.fillText(starBadge, ox + 64, oy + 105);
                  c2d.restore();
                }
              }
            }

            // Render Locked Territory Fog & Purchase Badges
            if (gameMode === "game" && !isCellUnlocked(i, j, landUnlockedChunks, gameMode)) {
              const cId = getChunkId(i, j);
              const isAdjacent = isChunkAdjacentToUnlocked(cId, landUnlockedChunks);

              c2d.save();
              c2d.beginPath();
              c2d.moveTo(ox + 64, oy + 64);
              c2d.lineTo(ox + 128, oy + 96);
              c2d.lineTo(ox + 64, oy + 128);
              c2d.lineTo(ox, oy + 96);
              c2d.closePath();

              if (isAdjacent) {
                c2d.fillStyle = "rgba(15, 23, 42, 0.38)";
                c2d.fill();
                c2d.strokeStyle = "rgba(245, 158, 11, 0.28)";
                c2d.lineWidth = 1;
                c2d.stroke();
              } else {
                c2d.fillStyle = "rgba(15, 23, 42, 0.65)";
                c2d.fill();
              }
              c2d.restore();

              // Badge at chunk center (Hiển thị cả Vàng 🪙 và Biểu tượng Nguyên liệu 🌾🥕🍞⚒️)
              const b = getChunkBounds(cId);
              if (isAdjacent && b && i === (b.startRow + 1) && j === (b.startCol + 1)) {
                const chunkCost = getNextChunkCost(landUnlockedChunks.length);
                const markOx = ox + 64;
                const markOy = oy + 92;

                const resIcons = Object.keys(chunkCost.resources)
                  .map(id => RESOURCES_CONFIG[id]?.icon || "📦")
                  .join(" ");

                c2d.save();
                c2d.fillStyle = "rgba(15, 23, 42, 0.9)";
                c2d.strokeStyle = "#f59e0b";
                c2d.lineWidth = 1.5;
                c2d.beginPath();
                c2d.roundRect(markOx - 48, markOy - 16, 96, 32, 7);
                c2d.fill();
                c2d.stroke();

                if (resIcons) {
                  c2d.font = "700 11px sans-serif";
                  c2d.textAlign = "center";
                  c2d.textBaseline = "middle";
                  c2d.fillStyle = "#fef08a";
                  c2d.fillText(`🔒 ${chunkCost.gold.toLocaleString()}🪙`, markOx, markOy - 5);

                  c2d.font = "9px sans-serif";
                  c2d.fillStyle = "#cbd5e1";
                  c2d.fillText(`+ ${resIcons}`, markOx, markOy + 7);
                } else {
                  c2d.font = "700 11px sans-serif";
                  c2d.textAlign = "center";
                  c2d.textBaseline = "middle";
                  c2d.fillStyle = "#fef08a";
                  c2d.fillText(`🔒 ${chunkCost.gold.toLocaleString()}🪙`, markOx, markOy);
                }
                c2d.restore();
              }
            }

            // Render Order Board & Delivery Truck with proper depth sorting at their cell position
            if (orderBoardManager && typeof orderBoardManager.renderWorldTruckAndBoard === "function") {
              if (i === 15 && j === 15) {
                orderBoardManager.renderWorldTruckAndBoard(c2d, ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W, animTime, { only: "board" });
              }
              if (typeof orderBoardManager.getTruckCell === "function") {
                const tc = orderBoardManager.getTruckCell();
                if (tc && tc.isVisible) {
                  // Sort by leading cell offset (front of truck) so road tiles underneath/ahead are rendered BEFORE the truck
                  const leadRow = (tc.row > 15.5) ? (tc.row + 0.8) : tc.row;
                  if (Math.floor(leadRow) === i && Math.floor(tc.col) === j) {
                    orderBoardManager.renderWorldTruckAndBoard(c2d, ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W, animTime, { only: "truck" });
                  }
                }
              }
            }
          }
        }
      }

      // Render Villagers
      if (villagerManager) {
        villagerManager.render(c2d, ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W, animTime, camera.zoom);
      }

      // Render Pets (Chó 🐶, Mèo 🐱, Thỏ 🐰, Ngựa 🐴 đi dạo trên đảo)
      if (petManager) {
        petManager.render(c2d, ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W, animTime, camera.zoom);
      }

      // Render Town Visitors (Khách Bộ Hành Ghé Thăm Tòa Thị Chính)
      if (townVisitorManager && typeof townVisitorManager.render === "function") {
        townVisitorManager.render(c2d, ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W, animTime);
      }

      // Render Harbor Dock & Cargo Ship (Bến Cảng & Tàu Buôn Bờ Nước Row 14, Col 6)
      if (harborShipManager && typeof harborShipManager.renderWorldShipAndDock === "function") {
        harborShipManager.renderWorldShipAndDock(c2d, ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W, animTime);
      }

      // Render Kingdom Wonders (Đại Kỳ Quan Vương Quốc tại Khu Đất Hoàng Gia Row 8, Col 15)
      if (kingdomWondersManager && typeof kingdomWondersManager.renderWorldWonder === "function") {
        kingdomWondersManager.renderWorldWonder(c2d, ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W, animTime);
      }

      // Render Traffic Vehicles (Xe kéo lúa mì, Xe ngựa lọc cọc, Thuyền đánh cá ven biển)
      if (vehicleManager && typeof vehicleManager.render === "function") {
        const isNight = (dayNightWeather && typeof dayNightWeather.getCurrentPeriod === "function")
          ? (dayNightWeather.getCurrentPeriod() === "night")
          : false;
        vehicleManager.render(c2d, ORIGIN_X, ORIGIN_Y, HALF_W, QUARTER_W, camera, isNight);
      }

      // Render Floating Gain Texts
      const pNow = performance.now();
      floatingTexts = floatingTexts.filter(ft => (pNow - ft.startTime) < ft.duration);
      for (const ft of floatingTexts) {
        const tProgress = (pNow - ft.startTime) / ft.duration;
        const curY = ft.y - tProgress * 36;
        const alpha = Math.max(0, 1.0 - tProgress);

        c2d.save();
        c2d.font = "700 13px sans-serif";
        c2d.textAlign = "center";
        c2d.fillStyle = `rgba(34, 197, 94, ${alpha})`;
        c2d.shadowColor = `rgba(0, 0, 0, ${alpha * 0.9})`;
        c2d.shadowBlur = 4;
        c2d.fillText(ft.text, ft.x, curY);
        c2d.restore();
      }

      // Hover Indicator & Ghost Preview
      if (hoverCell) {
        const hOx = ORIGIN_X + (hoverCell.col - hoverCell.row) * HALF_W;
        const hOy = ORIGIN_Y + (hoverCell.row + hoverCell.col) * QUARTER_W;
        c2d.save();
        c2d.beginPath();
        c2d.moveTo(hOx + 64, hOy + 64);
        c2d.lineTo(hOx + 128, hOy + 96);
        c2d.lineTo(hOx + 64, hOy + 128);
        c2d.lineTo(hOx, hOy + 96);
        c2d.closePath();
        
        const kingdomWondersManager = ctx.getKingdomWondersManager ? ctx.getKingdomWondersManager() : null;
        if (kingdomWondersManager && kingdomWondersManager.movingWonderId) {
          const isUnlocked = isCellUnlocked(hoverCell.row, hoverCell.col, landUnlockedChunks, gameMode);
          c2d.strokeStyle = isUnlocked ? "#f59e0b" : "#ef4444";
          c2d.fillStyle = isUnlocked ? "rgba(245, 158, 11, 0.35)" : "rgba(239, 68, 68, 0.35)";
          c2d.lineWidth = 2.5;
          c2d.fill();
          c2d.stroke();
          c2d.restore();

          const wid = kingdomWondersManager.movingWonderId;
          let wImg = imageCache[`wonder_${wid}`];
          if (!wImg) {
            wImg = new Image();
            wImg.onload = () => { if (ctx && ctx.requestRender) ctx.requestRender(); };
            wImg.src = `/assets/wonders/${wid}.png`;
            imageCache[`wonder_${wid}`] = wImg;
          }
          if (isImageReady(wImg)) {
            c2d.save();
            c2d.globalAlpha = isUnlocked ? 0.75 : 0.35;
            const spY = wid === "royal_palace" ? (hOy + 12) : hOy;
            const isFlipped = !!kingdomWondersManager.movingWonderFlipped;
            if (isFlipped) {
              c2d.translate(hOx + 128, spY);
              c2d.scale(-1, 1);
              c2d.drawImage(wImg, 0, 0, 128, 128);
            } else {
              c2d.drawImage(wImg, hOx, spY, 128, 128);
            }
            c2d.restore();
          }
        } else if (activeFarmTool === "sickle") {
          c2d.strokeStyle = "#84cc16";
          c2d.fillStyle = "rgba(132, 204, 22, 0.32)";
          c2d.lineWidth = 2.5;
          c2d.fill();
        } else if (activeFarmTool === "shovel") {
          c2d.strokeStyle = "#f97316";
          c2d.fillStyle = "rgba(249, 115, 22, 0.32)";
          c2d.lineWidth = 2.5;
          c2d.fill();
        } else if (activeSeedBrush) {
          c2d.strokeStyle = "#22c55e";
          c2d.fillStyle = "rgba(34, 197, 94, 0.30)";
          c2d.lineWidth = 2.5;
          c2d.fill();
        } else if (activeBrush === "erase") {
          c2d.strokeStyle = "#ef4444";
          c2d.fillStyle = "rgba(239, 68, 68, 0.28)";
          c2d.lineWidth = 2;
          c2d.fill();
        } else if (activeBrush || movingBuilding) {
          const hKey = `${hoverCell.row}_${hoverCell.col}`;
          const hTid = currentGrid[hoverCell.row] ? currentGrid[hoverCell.row][hoverCell.col] : null;
          const isUnlocked = isCellUnlocked(hoverCell.row, hoverCell.col, landUnlockedChunks, gameMode);
          const hasConstruction = !!constructions[hKey];
          const isEmptyGrass = hTid === "d12_meadow_wildflowers" || hTid === "g01_grass_flat";
          const isValidPlacement = isUnlocked && !hasConstruction && isEmptyGrass;

          if (isValidPlacement) {
            c2d.strokeStyle = "#22c55e";
            c2d.fillStyle = "rgba(34, 197, 94, 0.32)";
            c2d.lineWidth = 2.5;
            c2d.fill();
          } else {
            c2d.strokeStyle = "#ef4444";
            c2d.fillStyle = "rgba(239, 68, 68, 0.42)";
            c2d.lineWidth = 2.5;
            c2d.fill();
          }
        } else {
          c2d.strokeStyle = "rgba(255, 255, 255, 0.4)";
          c2d.lineWidth = 1.5;
        }
        c2d.stroke();

        if (activeFarmTool) {
          c2d.font = "24px sans-serif";
          c2d.textAlign = "center";
          c2d.textBaseline = "middle";
          c2d.fillText(activeFarmTool === "sickle" ? "🌾" : "⛏️", hOx + 64, hOy + 82);
        } else if (activeSeedBrush) {
          const crop = CROPS_CONFIG[activeSeedBrush];
          c2d.font = "24px sans-serif";
          c2d.textAlign = "center";
          c2d.textBaseline = "middle";
          c2d.fillText(crop ? crop.icon : "🌱", hOx + 64, hOy + 82);
        }

        if (activeBrush && activeBrush !== "erase") {
          const hKey = `${hoverCell.row}_${hoverCell.col}`;
          const hTid = currentGrid[hoverCell.row] ? currentGrid[hoverCell.row][hoverCell.col] : null;
          const isUnlocked = isCellUnlocked(hoverCell.row, hoverCell.col, landUnlockedChunks, gameMode);
          const hasConstruction = !!constructions[hKey];
          const isEmptyGrass = hTid === "d12_meadow_wildflowers" || hTid === "g01_grass_flat";
          const isValidPlacement = isUnlocked && !hasConstruction && isEmptyGrass;

          const brushImg = imageCache[activeBrush];
          if (isImageReady(brushImg)) {
            const bAdj = TILE_RENDER_ADJUSTMENTS[activeBrush] || { dx: 0, dy: 0, dw: 128, dh: 128 };
            const bDx = bAdj.dx || 0;
            const bDy = bAdj.dy || 0;
            const bDw = bAdj.dw || 128;
            const bDh = bAdj.dh || 128;
            c2d.save();
            c2d.globalAlpha = isValidPlacement ? 0.68 : 0.38;
            if (brushFlipped) {
              c2d.translate(hOx + 128 - bDx, hOy + bDy);
              c2d.scale(-1, 1);
              c2d.drawImage(brushImg, 0, 0, bDw, bDh);
            } else {
              c2d.drawImage(brushImg, hOx + bDx, hOy + bDy, bDw, bDh);
            }
            c2d.restore();
          }

          if (AESTHETIC_TILE_IDS.includes(activeBrush)) {
            c2d.save();
            c2d.globalAlpha = isValidPlacement ? 0.75 : 0.40;
            renderAestheticTileDetails(c2d, hOx, hOy, animTime, activeBrush);
            c2d.restore();
          }

          if (!isValidPlacement) {
            c2d.save();
            c2d.font = "26px sans-serif";
            c2d.textAlign = "center";
            c2d.textBaseline = "middle";
            c2d.fillText("🚫", hOx + 64, hOy + 96);
            c2d.restore();
          }
        } else if (movingBuilding) {
          const hKey = `${hoverCell.row}_${hoverCell.col}`;
          const hTid = currentGrid[hoverCell.row] ? currentGrid[hoverCell.row][hoverCell.col] : null;
          const isUnlocked = isCellUnlocked(hoverCell.row, hoverCell.col, landUnlockedChunks, gameMode);
          const hasConstruction = !!constructions[hKey];
          const isEmptyGrass = hTid === "d12_meadow_wildflowers" || hTid === "g01_grass_flat";
          const isValidPlacement = isUnlocked && !hasConstruction && isEmptyGrass;

          const bImg = imageCache[movingBuilding.tileId];
          if (isImageReady(bImg)) {
            const mAdj = TILE_RENDER_ADJUSTMENTS[movingBuilding.tileId] || { dx: 0, dy: 0, dw: 128, dh: 128 };
            const mDx = mAdj.dx || 0;
            const mDy = mAdj.dy || 0;
            const mDw = mAdj.dw || 128;
            const mDh = mAdj.dh || 128;
            c2d.save();
            c2d.globalAlpha = isValidPlacement ? 0.70 : 0.40;
            if (movingBuilding.flipped) {
              c2d.translate(hOx + 128 - mDx, hOy + mDy);
              c2d.scale(-1, 1);
              c2d.drawImage(bImg, 0, 0, mDw, mDh);
            } else {
              c2d.drawImage(bImg, hOx + mDx, hOy + mDy, mDw, mDh);
            }
            c2d.restore();
          }

          if (AESTHETIC_TILE_IDS.includes(movingBuilding.tileId)) {
            c2d.save();
            c2d.globalAlpha = isValidPlacement ? 0.75 : 0.40;
            renderAestheticTileDetails(c2d, hOx, hOy, animTime, movingBuilding.tileId);
            c2d.restore();
          }

          const lsOldKey = `${movingBuilding.fromRow}_${movingBuilding.fromCol}`;
          const ls = (livestockState && livestockState[lsOldKey]) ? livestockState[lsOldKey] : null;
          if (ls && ls.animalCount > 0 && isValidPlacement) {
            c2d.save();
            c2d.globalAlpha = 0.75;
            if (movingBuilding.tileId === "b21_chicken_coop") {
              renderLivestockChickens(c2d, hOx, hOy, animTime, null, ls);
            } else if (movingBuilding.tileId === "b22_cow_pasture") {
              renderDairyCows(c2d, hOx, hOy, animTime, null, movingBuilding.tileId, ls);
            } else if (movingBuilding.tileId === "b57_sheep_pasture") {
              renderLivestockSheep(c2d, hOx, hOy, animTime, null, ls);
            }
            c2d.restore();
          }

          if (!isValidPlacement) {
            c2d.save();
            c2d.font = "26px sans-serif";
            c2d.textAlign = "center";
            c2d.textBaseline = "middle";
            c2d.fillText("🚫", hOx + 64, hOy + 96);
            c2d.restore();
          }
        }

        // Crop Growth Floating Tooltip
        if (!activeBrush && !activeFarmTool && !activeSeedBrush && !movingBuilding) {
          const tid = currentGrid[hoverCell.row][hoverCell.col];
          if (tid === "d13_farmland_plot") {
            const farmKey = `${hoverCell.row}_${hoverCell.col}`;
            const fData = farmlandState[farmKey];
            if (fData) {
              const crop = CROPS_CONFIG[fData.seedId];
              const elapsed = Date.now() - fData.plantTime;
              const remaining = Math.max(0, Math.ceil((fData.growDurationMs - elapsed) / 1000));
              const isRipe = remaining === 0;

              const tooltipX = hOx + 64;
              const tooltipY = hOy + 42;
              const tipText = isRipe ? `${crop ? crop.icon : ''} Chín vàng!` : `${crop ? crop.icon : ''} Còn ${remaining}s`;

              c2d.save();
              c2d.font = "700 11px sans-serif";
              const textWidth = c2d.measureText(tipText).width;
              const tipW = textWidth + 16;
              const tipH = 20;

              c2d.fillStyle = "rgba(15, 23, 42, 0.88)";
              c2d.strokeStyle = isRipe ? "#22c55e" : "#e2b474";
              c2d.lineWidth = 1.5;
              c2d.beginPath();
              c2d.roundRect(tooltipX - tipW / 2, tooltipY - tipH / 2, tipW, tipH, 5);
              c2d.fill();
              c2d.stroke();

              c2d.fillStyle = "#ffffff";
              c2d.textAlign = "center";
              c2d.textBaseline = "middle";
              c2d.fillText(tipText, tooltipX, tooltipY);
              c2d.restore();
            }
          }
        }
        c2d.restore();
      }

      // Render Slash Effects (Hay Day Sickle Reaping Arc)
      const nowMs = performance.now();
      slashEffects = slashEffects.filter(s => (nowMs - s.startTime) <= s.duration);
      for (const slash of slashEffects) {
        const sProg = (nowMs - slash.startTime) / slash.duration;
        const sAlpha = Math.max(0, 1.0 - sProg);
        c2d.save();
        c2d.strokeStyle = `rgba(255, 255, 255, ${sAlpha})`;
        c2d.shadowColor = "#84cc16";
        c2d.shadowBlur = 10;
        c2d.lineWidth = 3.5 * (1.0 - sProg * 0.5);
        c2d.beginPath();
        c2d.arc(slash.x, slash.y, 24, -0.75 * Math.PI, 0.4 * Math.PI, false);
        c2d.stroke();

        // Scattering wheat / foliage particles
        for (let p = 0; p < 5; p++) {
          const ang = p * 1.25 + sProg * 2.5;
          const dist = sProg * 32;
          c2d.fillStyle = `rgba(250, 204, 21, ${sAlpha})`;
          c2d.beginPath();
          c2d.arc(slash.x + Math.cos(ang) * dist, slash.y + Math.sin(ang) * dist, 2.5, 0, Math.PI * 2);
          c2d.fill();
        }
        c2d.restore();
      }

      c2d.restore(); // camera transform restore

      // Render Day/Night ambient lighting filter and Weather over the world
      if (dayNightWeather) {
        dayNightWeather.renderLightingFilter(c2d, viewW, viewH);
        dayNightWeather.renderWeatherOverlay(c2d, viewW, viewH);
      }

      // Render Seasonal Theme Atmosphere & Particles (Bộ lọc sắc màu 4 mùa, Lá phong, Tuyết rơi, Cánh hoa Sakura)
      if (seasonalThemeManager && typeof seasonalThemeManager.renderAtmosphere === "function") {
        seasonalThemeManager.renderAtmosphere(c2d, viewW, viewH);
      }

      // Render Hay Day Flying Rewards (Coins, XP Stars, Harvested Produce)
      const nowP = performance.now();
      const nextFlying = [];
      const goldBadge = document.getElementById('builder-gold-badge');
      for (const p of flyingParticles) {
        const elapsed = nowP - p.startTime;
        if (elapsed < 0) {
          nextFlying.push(p);
          continue; // delayed cascade
        }
        const t = elapsed / p.duration;
        if (t >= 1.0) {
          // Arrived at destination!
          if (p.type === "coin") {
            if (goldBadge) {
              goldBadge.classList.remove("coin-bump");
              void goldBadge.offsetWidth;
              goldBadge.classList.add("coin-bump");
            }
            playCoinFlyHitSound();
          } else if (p.type === "xp") {
            const xpEl = document.getElementById("hud-player-xp-bar");
            if (xpEl) {
              xpEl.classList.remove("coin-bump");
              void xpEl.offsetWidth;
              xpEl.classList.add("coin-bump");
            }
          } else if (p.type === "produce") {
            const storageEl = document.getElementById("hud-storage-card");
            if (storageEl) {
              storageEl.classList.remove("coin-bump");
              void storageEl.offsetWidth;
              storageEl.classList.add("coin-bump");
            }
          }
          continue; // expired
        }

        nextFlying.push(p);

        // Dynamic world to screen coordinate transform
        const startX = camera.x + p.worldX * camera.zoom;
        const startY = camera.y + p.worldY * camera.zoom;

        let targetX = viewW - 90;
        let targetY = 40;
        if (p.type === "coin") {
          const rect = goldBadge ? goldBadge.getBoundingClientRect() : null;
          if (rect) { targetX = rect.left + 24; targetY = rect.top + rect.height / 2; }
        } else if (p.type === "xp") {
          const xpEl = document.getElementById("hud-player-xp-bar");
          const rect = xpEl ? xpEl.getBoundingClientRect() : null;
          if (rect) { targetX = rect.left + rect.width / 2; targetY = rect.top + rect.height / 2; }
        } else if (p.type === "produce") {
          const storageEl = document.getElementById("hud-storage-card");
          const rect = storageEl ? storageEl.getBoundingClientRect() : null;
          if (rect) { targetX = rect.left + rect.width / 2; targetY = rect.top + rect.height / 2; }
        }

        const midX = (startX + targetX) / 2 + p.arcOffsetX;
        const midY = Math.min(startY, targetY) - p.arcOffsetY;

        // Quadratic Bezier interpolation
        const invT = 1.0 - t;
        const curX = invT * invT * startX + 2.0 * invT * t * midX + t * t * targetX;
        const curY = invT * invT * startY + 2.0 * invT * t * midY + t * t * targetY;

        c2d.save();
        if (p.type === "coin") {
          // Sparkling golden aura
          c2d.fillStyle = "rgba(253, 224, 71, 0.45)";
          c2d.shadowColor = "#f59e0b";
          c2d.shadowBlur = 12;
          c2d.beginPath();
          c2d.arc(curX, curY, 13, 0, Math.PI * 2);
          c2d.fill();

          // 3D Spinning coin effect
          const spin = Math.sin((elapsed / 90) * Math.PI);
          c2d.translate(curX, curY);
          c2d.scale(Math.abs(spin) * 0.45 + 0.55, 1.0);
          c2d.font = "20px sans-serif";
          c2d.textAlign = "center";
          c2d.textBaseline = "middle";
          c2d.fillText("🪙", 0, 0);
        } else if (p.type === "xp") {
          c2d.shadowColor = "#38bdf8";
          c2d.shadowBlur = 14;
          c2d.font = "22px sans-serif";
          c2d.textAlign = "center";
          c2d.textBaseline = "middle";
          c2d.fillText("⭐", curX, curY);
        } else if (p.type === "produce") {
          c2d.shadowColor = "#22c55e";
          c2d.shadowBlur = 10;
          c2d.font = "22px sans-serif";
          c2d.textAlign = "center";
          c2d.textBaseline = "middle";
          c2d.fillText(p.icon || "🌾", curX, curY);
        }
        c2d.restore();
      }
      flyingParticles = nextFlying;

      c2d.restore(); // dpr scale restore
    } finally {
      c2d.setTransform(1, 0, 0, 1, 0, 0);
      c2d.globalCompositeOperation = 'source-over';
      c2d.globalAlpha = 1.0;
    }
  }

  return {
    renderCanvas,
    spawnFlyingCoin,
    spawnFlyingXP,
    spawnFlyingProduce,
    spawnSlashEffect,
    addFloatingText,
    getImageCache: () => imageCache,
    getCropImageCache: () => cropImageCache,
    destroy: () => {
      floatingTexts = [];
      flyingParticles = [];
      slashEffects = [];
    }
  };
}
