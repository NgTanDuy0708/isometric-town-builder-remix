// Day/Night Cycle, Ambient Lighting, Streetlamp Glows, and Dynamic Weather Particles
// High performance canvas renderer for Isometric Town Builder

export const TIME_PERIODS = {
  DAWN: 'dawn',
  DAY: 'day',
  SUNSET: 'sunset',
  NIGHT: 'night'
};

export const WEATHER_TYPES = {
  CLEAR: 'clear',
  RAIN: 'rain',
  MIST: 'mist'
};

class DayNightWeatherSystem {
  constructor() {
    this.timeProgress = 0.40; // 0.0=00:00 Midnight, 0.25=06:00 Dawn, 0.40=09:36 Morning, 0.50=12:00 Noon, 0.75=18:00 Sunset
    this.isAutoCycle = true;
    this.dayDurationSec = 1440; // 24 minutes full cycle (1 in-game day = 24 real minutes; 1 in-game hour = 1 real minute)
    this.weather = WEATHER_TYPES.CLEAR;
    this.isAutoWeather = true;
    this.weatherDurationSec = 600; // 10 minutes default clear weather
    this.weatherTimer = 0;

    // Rain particles
    this.rainDrops = [];
    this.ripples = [];
    this.initRain();

    // Fireflies / Night glowing motes
    this.fireflies = [];
    this.initFireflies();

    // Pixel stars for night sky
    this.stars = [];
    this.initStars();
  }

  initRain() {
    this.rainDrops = [];
    for (let i = 0; i < 90; i++) {
      this.rainDrops.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        speed: 14 + Math.random() * 8,
        length: 12 + Math.random() * 8,
        alpha: 0.35 + Math.random() * 0.35
      });
    }
  }

  initFireflies() {
    this.fireflies = [];
    for (let i = 0; i < 35; i++) {
      this.fireflies.push({
        x: Math.random() * 2500,
        y: Math.random() * 1500,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2,
        size: 1.5 + Math.random() * 2.0
      });
    }
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random() * 0.65, // upper sky
        radius: 0.8 + Math.random() * 1.5,
        twinkleSpeed: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  update(deltaSec) {
    if (this.isAutoCycle) {
      this.timeProgress = (this.timeProgress + deltaSec / this.dayDurationSec) % 1.0;
    }

    // Auto weather subtle shifts if not manually overridden by player
    if (this.isAutoWeather) {
      this.weatherTimer += deltaSec;
      if (this.weatherTimer >= this.weatherDurationSec) {
        this.weatherTimer = 0;
        // 80% sunny/clear, 12% gentle rain, 8% morning mist
        const r = Math.random();
        if (r < 0.80) {
          this.weather = WEATHER_TYPES.CLEAR;
          this.weatherDurationSec = 600 + Math.random() * 360; // 10 - 16 minutes sunny
        } else if (r < 0.92) {
          this.weather = WEATHER_TYPES.RAIN;
          this.weatherDurationSec = 120 + Math.random() * 90; // 2 - 3.5 minutes gentle rain
        } else {
          this.weather = WEATHER_TYPES.MIST;
          this.weatherDurationSec = 90 + Math.random() * 90; // 1.5 - 3 minutes mist
        }
      }
    }

    // Update Rain
    if (this.weather === WEATHER_TYPES.RAIN) {
      for (const drop of this.rainDrops) {
        drop.x -= drop.speed * 0.35; // diagonal isometric rain
        drop.y += drop.speed;
        if (drop.y > 1500 || drop.x < -200) {
          drop.y = -30 - Math.random() * 40;
          drop.x = Math.random() * 2600;
          if (Math.random() < 0.25) {
            this.ripples.push({ x: drop.x, y: 700 + Math.random() * 600, r: 1, alpha: 0.7 });
          }
        }
      }

      // Update Ripples
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const rip = this.ripples[i];
        rip.r += 0.8;
        rip.alpha -= 0.04;
        if (rip.alpha <= 0 || rip.r > 40) {
          this.ripples.splice(i, 1);
        }
      }
    }

    // Update Fireflies
    for (const ff of this.fireflies) {
      ff.x += ff.vx;
      ff.y += ff.vy;
      ff.phase += 0.05;
      if (Math.random() < 0.02) {
        ff.vx = (Math.random() - 0.5) * 0.5;
        ff.vy = (Math.random() - 0.5) * 0.5;
      }
    }
  }

  getCurrentPeriod() {
    const t = this.timeProgress;
    // 1 in-game day = 24 real minutes (1440s). 1 in-game hour = 1 real minute.
    // 00:00 -> 05:30 Night
    // 05:30 -> 07:30 Dawn (2 hours / 2 min)
    // 07:30 -> 17:30 Day (10 hours / 10 min)
    // 17:30 -> 19:30 Sunset (2 hours / 2 min)
    // 19:30 -> 24:00 Night (10 hours total night)
    if (t >= 0.23 && t < 0.31) return TIME_PERIODS.DAWN;
    if (t >= 0.31 && t < 0.73) return TIME_PERIODS.DAY;
    if (t >= 0.73 && t < 0.81) return TIME_PERIODS.SUNSET;
    return TIME_PERIODS.NIGHT;
  }

  getInGameTime() {
    // 0.0 -> 00:00 (Midnight). 1 full cycle = 24 in-game hours = 24 real minutes
    const totalMinutes = (this.timeProgress * 24 * 60) % (24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    const hh = String(hours).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    const period = this.getCurrentPeriod();
    let periodName = "Ban Ngày";
    let periodIcon = "☀️";
    if (period === TIME_PERIODS.DAWN) { periodName = "Bình Minh"; periodIcon = "🌅"; }
    else if (period === TIME_PERIODS.SUNSET) { periodName = "Hoàng Hôn"; periodIcon = "🌇"; }
    else if (period === TIME_PERIODS.NIGHT) { periodName = "Ban Đêm"; periodIcon = "🌙"; }

    return {
      timeStr: `${hh}:${mm}`,
      periodName,
      periodIcon,
      display: `${periodIcon} ${hh}:${mm} • ${periodName}`
    };
  }

  setTimePeriod(period) {
    this.isAutoCycle = false;
    switch (period) {
      case TIME_PERIODS.DAWN:
        this.timeProgress = 0.26; // 06:15 AM
        break;
      case TIME_PERIODS.DAY:
        this.timeProgress = 0.50; // 12:00 PM (Trưa rực rỡ)
        break;
      case TIME_PERIODS.SUNSET:
        this.timeProgress = 0.76; // 18:15 PM (Hoàng hôn)
        break;
      case TIME_PERIODS.NIGHT:
        this.timeProgress = 0.88; // 21:00 PM (Ban đêm)
        break;
    }
  }

  setWeather(w) {
    this.weather = w;
    this.isAutoWeather = false; // Player manually locked weather
  }

  toggleAutoCycle() {
    this.isAutoCycle = !this.isAutoCycle;
    return this.isAutoCycle;
  }

  // Draw Horizon Sky background in screen space
  renderSky(ctx, width, height) {
    if (!width || !height || width <= 0 || height <= 0) return;

    ctx.save();
    try {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;

      const t = this.timeProgress;
      let topColor, botColor;

      if (t >= 0.31 && t < 0.73) {
        // Daytime - bright refreshing pastoral sky
        topColor = '#4a90e2';
        botColor = '#b8e1fc';
      } else if (t >= 0.73 && t < 0.81) {
        // Sunset - radiant amber/crimson/purple
        const factor = (t - 0.73) / 0.08;
        topColor = '#4a154b';
        botColor = factor > 0.5 ? '#f97316' : '#fbbf24';
      } else if (t >= 0.81 || t < 0.23) {
        // Deep Night - dark mystical twilight with starry sky
        topColor = '#0f172a';
        botColor = '#1e293b';
      } else {
        // Dawn - soft morning rose and peach
        topColor = '#2b3252';
        botColor = '#fbcfe8';
      }

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, topColor);
      grad.addColorStop(1, botColor);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render twinkling stars during Night and late Sunset
      if (t >= 0.77 || t < 0.26) {
        const starAlpha = Math.min(1.0, (t >= 0.82 || t <= 0.20) ? 0.9 : 0.4);
        const now = performance.now() * 0.001;
        for (const s of this.stars) {
          const twinkle = 0.5 + 0.5 * Math.sin(now * s.twinkleSpeed + s.phase);
          const r = Math.max(0.5, s.radius);
          ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * twinkle})`;
          ctx.beginPath();
          ctx.arc(s.x * width, s.y * height, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } finally {
      ctx.restore();
    }
  }

  // Draw ambient darkness and color tint over the rendered world
  renderLightingFilter(ctx, width, height) {
    if (!width || !height || width <= 0 || height <= 0) return;

    const t = this.timeProgress;
    let tintColor = null;

    if (t >= 0.73 && t < 0.81) {
      // Sunset warm glow overlay
      const alpha = 0.18 * Math.sin((t - 0.73) / 0.08 * Math.PI);
      tintColor = `rgba(249, 115, 22, ${Math.max(0, alpha)})`;
    } else if (t >= 0.81 || t < 0.23) {
      // Midnight blue atmospheric darkness (softened to keep kingdom clearly visible)
      const isPeakNight = (t >= 0.85 || t <= 0.15);
      const peakAlpha = isPeakNight ? 0.28 : 0.16;
      tintColor = `rgba(11, 17, 36, ${peakAlpha})`;
    } else if (t >= 0.23 && t < 0.31) {
      // Dawn rosy glow
      tintColor = `rgba(244, 114, 182, 0.08)`;
    }

    if (tintColor) {
      ctx.save();
      try {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = tintColor;
        ctx.fillRect(0, 0, width, height);
      } finally {
        ctx.restore();
      }
    }
  }

  // Render glowing streetlamps and cozy window lights
  renderLightGlow(ctx, worldX, worldY, radius = 55, intensity = 0.75) {
    const t = this.timeProgress;
    // Only glow brightly during sunset, night, and dawn
    if (t >= 0.28 && t < 0.72) return; // In broad daylight, lights are off

    let glowAlpha = intensity;
    if (t >= 0.72 && t < 0.78) glowAlpha *= (t - 0.72) / 0.06;
    else if (t >= 0.22 && t < 0.28) glowAlpha *= (0.28 - t) / 0.06;
    glowAlpha = Math.max(0, Math.min(1.0, glowAlpha));
    if (glowAlpha <= 0.01) return;

    const safeRadius = Math.max(5, radius);

    ctx.save();
    try {
      ctx.globalCompositeOperation = 'lighter';
      const grad = ctx.createRadialGradient(worldX, worldY, 2, worldX, worldY, safeRadius);
      grad.addColorStop(0, `rgba(254, 240, 138, ${glowAlpha})`);
      grad.addColorStop(0.35, `rgba(251, 191, 36, ${glowAlpha * 0.6})`);
      grad.addColorStop(0.7, `rgba(245, 158, 11, ${glowAlpha * 0.2})`);
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(worldX, worldY, safeRadius, 0, Math.PI * 2);
      ctx.fill();
    } finally {
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }
  }

  // Render weather overlays (Rain, mist, fireflies) in screen space
  renderWeatherOverlay(ctx, width, height) {
    if (!width || !height || width <= 0 || height <= 0) return;

    const t = this.timeProgress;

    // Fireflies at night
    if ((t >= 0.78 || t < 0.24) && this.weather !== WEATHER_TYPES.RAIN) {
      ctx.save();
      try {
        ctx.globalCompositeOperation = 'lighter';
        for (const ff of this.fireflies) {
          const rawPulse = 0.4 + 0.6 * Math.sin(ff.phase);
          const safePulse = Math.max(0.08, rawPulse);
          const safeRad = Math.max(0.6, ff.size * safePulse);
          ctx.fillStyle = `rgba(250, 204, 21, ${Math.min(1.0, 0.75 * safePulse)})`;
          ctx.beginPath();
          const sx = ((ff.x % width) + width) % width;
          const sy = ((ff.y % height) + height) % height;
          ctx.arc(sx, sy, safeRad, 0, Math.PI * 2);
          ctx.fill();
        }
      } finally {
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      }
    }

    // Rain
    if (this.weather === WEATHER_TYPES.RAIN) {
      ctx.save();
      try {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (const drop of this.rainDrops) {
          const sx = ((drop.x % width) + width) % width;
          const sy = drop.y;
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - drop.length * 0.35, sy + drop.length);
        }
        ctx.stroke();

        // Ripples
        ctx.lineWidth = 1.0;
        for (const rip of this.ripples) {
          const rX = Math.max(0.3, rip.r * 1.8);
          const rY = Math.max(0.15, rip.r * 0.8);
          const sx = ((rip.x % width) + width) % width;
          const sy = ((rip.y % height) + height) % height;
          ctx.strokeStyle = `rgba(224, 242, 254, ${Math.max(0, rip.alpha)})`;
          ctx.beginPath();
          ctx.ellipse(sx, sy, rX, rY, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } finally {
        ctx.restore();
      }
    }

    // Mist
    if (this.weather === WEATHER_TYPES.MIST) {
      ctx.save();
      try {
        ctx.globalCompositeOperation = 'source-over';
        const now = performance.now() * 0.0003;
        const mistOffset = Math.sin(now) * 60;
        const startY = Math.max(0, Math.min(height - 20, height * 0.3 + mistOffset));
        const grad = ctx.createLinearGradient(0, startY, 0, height);
        grad.addColorStop(0, 'rgba(241, 245, 249, 0)');
        grad.addColorStop(0.5, 'rgba(241, 245, 249, 0.22)');
        grad.addColorStop(1, 'rgba(241, 245, 249, 0.35)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } finally {
        ctx.restore();
      }
    }
  }
}

export const dayNightWeather = new DayNightWeatherSystem();
