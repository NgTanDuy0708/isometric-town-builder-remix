/**
 * seasonalThemes.js - Hệ Thống Skin & Mùa Lễ Hội (Seasonal Themes)
 * 
 * 4 Chủ Đề Mùa Rực Rỡ & Đặc Sắc:
 * 1. summer: Mùa Hè Nắng Vàng ☀️ (God-rays ánh dương, hạt sáng vàng kim lấp lánh)
 * 2. autumn: Mùa Thu Lá Vàng 🍁 (Bộ lọc nắng vàng mật ong, 75 lá phong 5 cánh chao liệng, vệt gió mùa thu)
 * 3. winter: Mùa Đông Tuyết Phủ ❄️ (Khung sương băng tuyết mờ ảo, 90 bông tuyết 6 cánh & bokeh tuyết rơi)
 * 4. spring_sakura: Lễ Hội Hoa Anh Đào 🌸 (Lớp phủ hồng phấn mộng mơ, 80 cánh hoa sakura bồng bềnh trong gió)
 */

const STORAGE_KEY_SEASON = "town_builder_season_theme";

export const SEASON_CONFIGS = {
  summer: {
    id: "summer",
    name: "Mùa Hè Rực Rỡ",
    icon: "☀️",
    badge: "Mùa Hạ Nắng Vàng",
    tint: "rgba(254, 240, 138, 0.12)",
    grassTint: "#3fa34d",
    particleType: "sunbeam"
  },
  autumn: {
    id: "autumn",
    name: "Mùa Thu Lá Vàng",
    icon: "🍁",
    badge: "Mùa Thu Mật Ong",
    tint: "rgba(245, 158, 11, 0.14)",
    grassTint: "#b45309",
    particleType: "maple_leaf"
  },
  winter: {
    id: "winter",
    name: "Mùa Đông Tuyết Phủ",
    icon: "❄️",
    badge: "Mùa Đông Băng Tuyết",
    tint: "rgba(224, 242, 254, 0.18)",
    grassTint: "#e2e8f0",
    particleType: "snowflake"
  },
  spring_sakura: {
    id: "spring_sakura",
    name: "Lễ Hội Hoa Anh Đào",
    icon: "🌸",
    badge: "Hoa Anh Đào Nở Rộ",
    tint: "rgba(251, 207, 232, 0.16)",
    grassTint: "#ec4899",
    particleType: "cherry_petal"
  }
};

export class SeasonalThemeManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.currentSeason = "summer";
    this.particles = [];
    this.windStreaks = [];
    this.maxParticles = 75;
    this.animTime = 0;
    this.init();
  }

  init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEASON);
      if (saved && SEASON_CONFIGS[saved]) {
        this.currentSeason = saved;
      }
    } catch (e) {}

    this.initParticles();
    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    // Sự kiện nút trong Settings Modal
    const container = document.getElementById("settings-season-buttons");
    if (container) {
      container.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-season]");
        if (!btn) return;
        const s = btn.getAttribute("data-season");
        if (s) this.setSeason(s);
      });
    }

    // Sự kiện nhấp trực tiếp vào Pill Mùa trên thanh HUD
    const hudPill = document.getElementById("hud-season-pill");
    if (hudPill) {
      hudPill.addEventListener("click", () => {
        this.cycleNextSeason();
      });
    }
  }

  cycleNextSeason() {
    const seasonKeys = ["summer", "autumn", "winter", "spring_sakura"];
    const idx = seasonKeys.indexOf(this.currentSeason);
    const nextSeason = seasonKeys[(idx + 1) % seasonKeys.length];
    this.setSeason(nextSeason);
  }

  setSeason(seasonId) {
    if (!SEASON_CONFIGS[seasonId]) return;
    this.currentSeason = seasonId;
    try {
      localStorage.setItem(STORAGE_KEY_SEASON, seasonId);
    } catch (e) {}

    this.initParticles();
    if (this.ctx.showToast) {
      const cfg = SEASON_CONFIGS[seasonId];
      this.ctx.showToast(`🎨 Cảnh sắc Vương quốc: ${cfg.icon} ${cfg.name}!`, "success");
    }
    if (this.ctx.requestRender) this.ctx.requestRender();
    this.updateUI();
  }

  getCurrentConfig() {
    return SEASON_CONFIGS[this.currentSeason] || SEASON_CONFIGS.summer;
  }

  initParticles() {
    this.particles = [];
    const cfg = this.getCurrentConfig();
    const count = cfg.id === "winter" ? 90 : (cfg.id === "summer" ? 35 : 75);

    for (let i = 0; i < count; i++) {
      const isMote = cfg.particleType === "sunbeam";
      this.particles.push({
        x: Math.random() * (window.innerWidth || 1280),
        y: Math.random() * (window.innerHeight || 720),
        size: isMote ? (2 + Math.random() * 3.5) : (4 + Math.random() * 7),
        speedY: isMote ? (-10 - Math.random() * 15) : (25 + Math.random() * 45),
        speedX: isMote ? (-5 + Math.random() * 10) : (-20 + Math.random() * 40),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: -2.5 + Math.random() * 5.0,
        opacity: 0.35 + Math.random() * 0.55,
        colorIndex: Math.floor(Math.random() * 3),
        swayPhase: Math.random() * Math.PI * 2
      });
    }

    // Vệt gió mùa thu
    this.windStreaks = [];
    if (cfg.id === "autumn") {
      for (let w = 0; w < 6; w++) {
        this.windStreaks.push({
          x: Math.random() * 1280,
          y: 50 + Math.random() * 600,
          len: 80 + Math.random() * 120,
          speed: 120 + Math.random() * 80,
          opacity: 0.15 + Math.random() * 0.2
        });
      }
    }
  }

  update(dt, viewW = 1280, viewH = 720) {
    this.animTime += dt;
    const cfg = this.getCurrentConfig();
    const w = viewW;
    const h = viewH;

    for (const p of this.particles) {
      p.swayPhase += dt * 2.5;
      const sway = Math.sin(p.swayPhase) * 16 * dt;

      if (cfg.particleType === "sunbeam") {
        // Hạt bụi vàng bay bổng lên trời
        p.y += p.speedY * dt;
        p.x += p.speedX * dt + sway;
        if (p.y < -20) {
          p.y = h + 20;
          p.x = Math.random() * w;
        }
      } else {
        // Lá, tuyết, hoa rơi xuống
        p.y += p.speedY * dt;
        p.x += p.speedX * dt + sway;
        p.rotation += p.rotSpeed * dt;

        if (p.y > h + 25) {
          p.y = -25;
          p.x = Math.random() * w;
        }
      }

      if (p.x < -30) p.x = w + 30;
      else if (p.x > w + 30) p.x = -30;
    }

    // Cập nhật vệt gió thu
    for (const ws of this.windStreaks) {
      ws.x += ws.speed * dt;
      if (ws.x > w + 150) {
        ws.x = -150;
        ws.y = 50 + Math.random() * (h - 100);
      }
    }
  }

  /**
   * Kết xuất toàn bộ khí quyển & hiệu ứng mùa lên màn hình
   */
  renderAtmosphere(ctx, viewW = 1280, viewH = 720) {
    const cfg = this.getCurrentConfig();

    ctx.save();

    // 1. LỚP BỘ LỌC KHÍ QUYỂN TOÀN MÀN HÌNH (Atmospheric Color Grading)
    if (cfg.id === "autumn") {
      // Ánh nắng mật ong vàng óng mùa thu
      const grad = ctx.createLinearGradient(0, 0, viewW, viewH);
      grad.addColorStop(0, "rgba(251, 191, 36, 0.15)");
      grad.addColorStop(1, "rgba(180, 83, 9, 0.10)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, viewW, viewH);

      // Vệt gió nhẹ mùa thu lướt qua
      ctx.strokeStyle = "rgba(254, 240, 138, 0.22)";
      ctx.lineWidth = 1.8;
      ctx.setLineDash([15, 25]);
      for (const ws of this.windStreaks) {
        ctx.beginPath();
        ctx.moveTo(ws.x, ws.y);
        ctx.bezierCurveTo(ws.x + ws.len * 0.4, ws.y - 12, ws.x + ws.len * 0.7, ws.y + 12, ws.x + ws.len, ws.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    } else if (cfg.id === "winter") {
      // Bầu không khí băng giá mùa đông
      ctx.fillStyle = "rgba(224, 242, 254, 0.16)";
      ctx.fillRect(0, 0, viewW, viewH);

      // Viền tuyết mờ mép màn hình (Frosted Screen Border Vignette)
      const radGrad = ctx.createRadialGradient(viewW / 2, viewH / 2, viewW * 0.35, viewW / 2, viewH / 2, viewW * 0.65);
      radGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      radGrad.addColorStop(1, "rgba(240, 249, 255, 0.30)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, viewW, viewH);
    } else if (cfg.id === "spring_sakura") {
      // Khí sắc hoa anh đào phớt hồng thơ mộng
      const grad = ctx.createLinearGradient(0, 0, 0, viewH);
      grad.addColorStop(0, "rgba(251, 207, 232, 0.18)");
      grad.addColorStop(1, "rgba(244, 114, 182, 0.08)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, viewW, viewH);
    } else if (cfg.id === "summer") {
      // Vạt nắng ấm rực rỡ từ góc trên bên phải
      const sunGrad = ctx.createRadialGradient(viewW - 80, 60, 40, viewW - 80, 60, viewW * 0.7);
      sunGrad.addColorStop(0, "rgba(254, 240, 138, 0.22)");
      sunGrad.addColorStop(0.6, "rgba(253, 224, 71, 0.08)");
      sunGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, viewW, viewH);

      // 4 Nan quạt ánh sáng (God-rays)
      ctx.fillStyle = "rgba(254, 249, 195, 0.08)";
      for (let r = 0; r < 4; r++) {
        ctx.beginPath();
        ctx.moveTo(viewW - 80, 60);
        const a1 = Math.PI * 0.65 + r * 0.28;
        const a2 = a1 + 0.12;
        ctx.lineTo(viewW - 80 + Math.cos(a1) * 900, 60 + Math.sin(a1) * 900);
        ctx.lineTo(viewW - 80 + Math.cos(a2) * 900, 60 + Math.sin(a2) * 900);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 2. KẾT XUẤT CÁC HẠT ĐỒ HỌA ĐA DẠNG
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;

      if (cfg.particleType === "maple_leaf") {
        // Lá phong 5 cánh mùa thu chân thực, xoay lật 3D
        const tumbleX = Math.cos(p.rotation * 0.75);
        ctx.scale(tumbleX, 1.0);

        const leafColors = ["#dc2626", "#ea580c", "#f59e0b"];
        ctx.fillStyle = leafColors[p.colorIndex % 3];

        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.35, -s * 0.4);
        ctx.lineTo(s * 0.9, -s * 0.3);
        ctx.lineTo(s * 0.5, s * 0.1);
        ctx.lineTo(s * 0.7, s * 0.7);
        ctx.lineTo(0, s * 0.4);
        ctx.lineTo(-s * 0.7, s * 0.7);
        ctx.lineTo(-s * 0.5, s * 0.1);
        ctx.lineTo(-s * 0.9, -s * 0.3);
        ctx.lineTo(-s * 0.35, -s * 0.4);
        ctx.closePath();
        ctx.fill();

        // Cuống lá phong nhỏ
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.4);
        ctx.lineTo(0, s * 0.85);
        ctx.stroke();
      } else if (cfg.particleType === "snowflake") {
        // Bông tuyết mùa đông 6 cánh & bokeh
        if (p.size > 7.5) {
          // Bông tuyết 6 cánh chi tiết
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.4;
          for (let arm = 0; arm < 3; arm++) {
            ctx.beginPath();
            ctx.moveTo(-p.size, 0);
            ctx.lineTo(p.size, 0);
            ctx.stroke();
            ctx.rotate(Math.PI / 3);
          }
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Hạt tuyết tròn mềm mịn có quầng sáng mờ
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#93c5fd";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (cfg.particleType === "cherry_petal") {
        // Cánh hoa anh đào sakura uốn lượn 3D
        const tumbleX = Math.cos(p.rotation * 0.9);
        ctx.scale(tumbleX, 1.0);

        const sakuraPinks = ["#fbcfe8", "#f472b6", "#ec4899"];
        ctx.fillStyle = sakuraPinks[p.colorIndex % 3];

        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.8, -s * 0.6, s * 0.9, s * 0.6, 0, s);
        ctx.bezierCurveTo(-s * 0.9, s * 0.6, -s * 0.8, -s * 0.6, 0, -s);
        ctx.closePath();
        ctx.fill();
      } else if (cfg.particleType === "sunbeam") {
        // Đốm sáng vàng kim mùa hạ lấp lánh
        ctx.fillStyle = "#fef08a";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // Alias for backward compatibility
  renderParticles(ctx, viewW = 1280, viewH = 720) {
    this.renderAtmosphere(ctx, viewW, viewH);
  }

  updateUI() {
    const seasonPill = document.getElementById("hud-season-pill");
    const cfg = this.getCurrentConfig();

    if (seasonPill) {
      seasonPill.textContent = `${cfg.icon} ${cfg.badge}`;
      seasonPill.className = `hud-card hud-season-badge-card ${this.currentSeason}`;
    }

    // Cập nhật nút active trong modal Settings
    document.querySelectorAll(".season-choice-btn, #settings-season-buttons .settings-choice-btn").forEach(btn => {
      const s = btn.getAttribute("data-season");
      if (s === this.currentSeason) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
}
