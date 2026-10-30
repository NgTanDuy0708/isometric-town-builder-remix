import React, { useEffect } from 'react';
import { initIsometricStudio } from './studioEngine.js';
import './styles.css';
import './productionPanel.css';
import { FENCE_ITEMS } from './data/fenceConfig.js';

const STUDIO_MARKUP = `
  <!-- Canvas Container (Full Screen) -->
  <div id="canvas-container">
    <canvas id="builder-canvas"></canvas>
  </div>
  <a href="/map-editor" target="_blank" rel="noreferrer" class="map-editor-link" style="position:fixed;bottom:18px;left:18px;z-index:60;padding:9px 13px;border:1px solid #7f985c;border-radius:9px;background:#fbf9ed;color:#355539;font:600 12px system-ui;text-decoration:none;box-shadow:0 3px 12px #182b1e25">✎ Vẽ map</a>

  <!-- Top-Left Floating HUD Bar: Level & Active Town Event & Season Pill -->
  <aside class="top-left-hud-bar" id="top-left-hud-bar" aria-label="Cấp độ và sự kiện vương quốc">
    <!-- Level & XP Widget -->
    <div class="hud-card hud-level-card" id="hud-level-card" title="Cấp độ người chơi & Tiến độ kinh nghiệm">
      <div class="hud-level-row">
        <span class="hud-level-badge" id="hud-player-level-badge">⭐ Cấp 1</span>
        <span class="hud-level-title" id="hud-player-title">Tân Lập Làng</span>
      </div>
      <div class="hud-xp-track" title="Thanh kinh nghiệm">
        <div class="hud-xp-fill" id="hud-player-xp-bar" style="width: 10%;"></div>
      </div>
      <div class="hud-xp-num" id="hud-player-xp-text">10 / 100 XP</div>
    </div>

    <!-- Sổ Nhiệm Vụ -->
    <button type="button" class="deck-circle-btn quest-circle" id="quest-book-btn" title="📜 Sổ Nhiệm Vụ Vương Quốc (Nhận thưởng Vàng & Kinh nghiệm)">
      <span class="circle-btn-icon"><img src="/assets/ui/icon_mission.png" alt="Nhiệm vụ" class="deck-shop-icon-img" /></span>
      <span class="quest-badge hidden" id="quest-notify-badge">0</span>
      <span class="circle-btn-tooltip">Sổ Nhiệm Vụ</span>
    </button>

    <button type="button" class="deck-circle-btn" id="btn-production-overview" title="Quản lý sản xuất, hàng đợi và nguyên liệu">
      <span class="circle-btn-icon">🏭</span><span class="circle-btn-tooltip">Sản xuất</span>
    </button>

    <!-- Season Indicator & Switcher Widget -->
    <button type="button" class="hud-card hud-season-badge-card summer" id="hud-season-pill" title="Cảnh sắc 4 Mùa Hoàng Gia (Nhấp để đổi nhanh: Hạ ☀️, Thu 🍁, Đông ❄️, Anh Đào 🌸)">
      ☀️ Mùa Hạ Nắng Vàng
    </button>

    <!-- Town Active Event Widget (Next to Level) -->
    <div class="hud-card hud-event-card hidden" id="hud-town-event-card" style="display: none;" title="Sự kiện vương quốc đang diễn ra (Nhấp để xem chi tiết)">
      <div class="hud-event-header">
        <span class="hud-event-icon" id="hud-event-icon">🎪</span>
        <div class="hud-event-info">
          <span class="hud-event-name" id="hud-event-name">Hội Chợ Làng</span>
          <span class="hud-event-timer" id="hud-event-timer">02:00</span>
        </div>
      </div>
      <div class="hud-event-buff" id="hud-event-buff">+50% Giá Bán Chợ 🪙</div>
    </div>
  </aside>

  <!-- Vertical Right-Side HUD Panel: Gold, Gem, Population, Buildings Only -->
  <aside class="right-hud-panel" id="right-hud-panel" aria-label="Bảng thống kê vương quốc">
    <!-- Gold Widget: Hay Day Style Premium Coin Plaque -->
    <div class="hud-card hud-gold-card hayday-coin-plaque" id="builder-gold-badge" title="Kho vàng hoàng gia (Kiếm vàng bằng cách thu hoạch nông sản và làm nhiệm vụ)">
      <div class="hayday-coin-icon-wrapper">
        <div class="hayday-coin-glow"></div>
        <div class="hayday-coin-icon">🪙</div>
      </div>
      <div class="hud-gold-info">
        <span class="hud-gold-label">VÀNG HOÀNG GIA</span>
        <span class="hud-gold-val" id="builder-gold-display">500</span>
      </div>
    </div>

    <!-- Gem / Ruby Plaque (Hay Day Diamond Style) -->
    <div class="hud-card hud-gem-card hayday-gem-plaque" id="builder-gem-badge" title="Kho Ruby Hoàng Gia (Dùng để hoàn thành ngay công trình và nâng cấp kho)">
      <div class="hayday-gem-icon-wrapper">
        <div class="hayday-gem-glow"></div>
        <div class="hayday-gem-icon">💎</div>
      </div>
      <div class="hud-gem-info">
        <span class="gem-label">RUBY HOÀNG GIA</span>
        <span class="hud-gem-val" id="builder-gem-display">30</span>
      </div>
    </div>

    <!-- Population & Villagers Widget -->
    <div class="hud-card hud-pop-card" id="hud-pop-card" title="Dân số vương quốc và cư dân đang đi lại">
      <div class="hud-stat-line">
        <span class="hud-stat-icon">👥</span>
        <span class="hud-stat-name">Dân số:</span>
        <span class="hud-stat-num" id="builder-stat-population">0</span>
      </div>
      <div class="hud-stat-line clickable" id="builder-stat-villagers-btn" title="Nhấp để trò chuyện cùng dân làng đang dạo bước">
        <span class="hud-stat-icon">🚶</span>
        <span class="hud-stat-name">Cư dân:</span>
        <span class="hud-stat-num highlight" id="builder-stat-villagers">0</span>
      </div>
    </div>

    <!-- Kingdom Stats Widget (Chỉ giữ lại Số lượng Công trình) -->
    <div class="hud-card hud-stats-card" id="hud-stats-card" title="Số lượng công trình vương quốc">
      <div class="hud-stat-line">
        <span class="hud-stat-icon">🏠</span>
        <span class="hud-stat-name">Công trình:</span>
        <span class="hud-stat-num" id="builder-stat-buildings">0</span>
      </div>
    </div>
  </aside>

  <!-- Bottom Left Floating Action Deck (Chỉ giữ lại: Cửa Hàng, Chợ, Nhiệm Vụ, Cài Đặt) -->
  <div class="bottom-left-deck" id="bottom-left-deck">
    <!-- Nút mũi tên: gom/sổ các nút tròn (điện thoại) -->
    <button type="button" class="deck-toggle-btn" id="deck-toggle-btn" aria-expanded="false" aria-label="Mở menu" title="Mở / đóng menu"><span class="deck-toggle-arrow">▲</span></button>
    <div class="deck-buttons" id="deck-buttons">
    <!-- Cửa Hàng Xây Dựng -->
    <button type="button" class="deck-circle-btn shop-circle" id="btn-open-shop" title="🏗️ Cửa Hàng Xây Dựng (Nhà ở, Cửa hàng, Đường đi, Cảnh quan, Luống đất...)">
      <span class="circle-btn-icon"><img src="/assets/ui/icon_shop.png" alt="Cửa Hàng" class="deck-shop-icon-img" /></span>
      <span class="circle-btn-tooltip">Cửa Hàng</span>
    </button>

    <!-- Chợ Nông Sản -->
    <button type="button" class="deck-circle-btn market-circle" id="btn-open-market" title="🏪 Chợ Nông Sản (Bán nông sản & hàng hóa kiếm vàng)">
      <span class="circle-btn-icon"><img src="/assets/ui/icon_market.png" alt="Chợ" class="deck-shop-icon-img" /></span>
      <span class="circle-btn-tooltip">Chợ Bán Nông Sản</span>
    </button>

    <!-- Quản Gia Thu Hoạch (Caretaker) -->
    <button type="button" class="deck-circle-btn caretaker-circle" id="btn-open-caretaker" title="👨‍🌾 Tổng Quản Gia Hoàng Gia (Mở khóa ở Cấp 5 - Thuê tự động thu hoạch nông sản, chuồng trại & xưởng)">
      <span class="circle-btn-icon">👨‍🌾</span>
      <span class="caretaker-badge locked" id="caretaker-notify-badge">Cấp 5</span>
      <span class="circle-btn-tooltip">Quản Gia Thu Hoạch</span>
    </button>

    <!-- Bến Cảng Tàu Buôn (Cargo Ship) -->
    <button type="button" class="deck-circle-btn ship-circle" id="btn-open-harbor-ship" title="🚢 Bến Cảng Hoàng Gia (Chuyến tàu buôn 9 thùng hàng, thưởng Ruby & Vật tư)">
      <span class="circle-btn-icon"><img src="/assets/aistudio/TauHoangGia_v1_a5f7fe14.png" alt="Tàu Giao Thương" class="deck-ship-icon-img" /></span>
      <span class="harbor-badge locked" id="cargo-ship-notify-badge">Cấp 6</span>
      <span class="circle-btn-tooltip">Tàu Giao Thương</span>
    </button>

    <!-- Vòng Quay May Mắn (Daily Wheel) -->
    <button type="button" class="deck-circle-btn wheel-circle" id="btn-open-wheel" title="🎡 Vòng Quay May Mắn Hoàng Gia (Mỗi ngày quay 1 lượt miễn phí trúng Ruby, Vàng & Vật tư)">
      <span class="circle-btn-icon">🎡</span>
      <span class="wheel-badge ready" id="wheel-notify-badge">Quay</span>
      <span class="circle-btn-tooltip">Vòng Quay May Mắn</span>
    </button>

    <!-- Bến Câu Cá (Fishing Spot) -->
    <button type="button" class="deck-circle-btn fishing-circle" id="btn-open-fishing" title="🎣 Bến Câu Cá Thư Giãn (Nhấp thả cần câu cá hồi, tôm hoàng gia & rương kho báu)">
      <span class="circle-btn-icon">🎣</span>
      <span class="circle-btn-tooltip">Bến Câu Cá</span>
    </button>

    <!-- Cài Đặt & Thời Tiết -->
    <button type="button" class="deck-circle-btn settings-circle" id="btn-open-settings" title="⚙️ Cài Đặt Hệ Thống (Âm thanh, Thời tiết, Chu kỳ Ngày/Đêm & Tiện ích)">
      <span class="circle-btn-icon">⚙️</span>
      <span class="circle-btn-tooltip">Cài Đặt & Thời Tiết</span>
    </button>
    </div>
  </div>

  <!-- Thanh thao tác công trình (giữ lâu vào công trình): Xoay | Di chuyển | Gỡ -->
  <div class="object-action-overlay hidden" id="object-action-overlay" style="display: none;" role="toolbar" aria-label="Thao tác công trình">
    <div class="action-bar-title" id="obj-action-title">Công trình</div>
    <div class="action-bar-row">
      <button type="button" class="action-bar-btn rotate-btn" id="obj-action-rotate-btn" title="Xoay hướng công trình">
        <span class="action-bar-icon">🔄</span>
        <span class="action-bar-label">Xoay</span>
      </button>
      <button type="button" class="action-bar-btn move-btn" id="obj-action-move-btn" title="Di chuyển sang vị trí khác">
        <span class="action-bar-icon">↔️</span>
        <span class="action-bar-label">Di chuyển</span>
      </button>
      <button type="button" class="action-bar-btn demolish-btn" id="obj-action-demolish-btn" title="Gỡ bỏ (hoàn lại 50% 🪙)">
        <span class="action-bar-icon">🗑️</span>
        <span class="action-bar-label">Gỡ</span>
      </button>
    </div>
  </div>
  <!-- Floating Camera & Zoom Controls (Bottom Right Deck) -->
  <aside class="floating-camera-deck" id="floating-camera-deck" aria-label="Điều khiển góc nhìn">
    <div class="camera-zoom-pill">
      <button type="button" class="cam-btn" id="builder-zoom-in" title="Phóng to (Phím: + hoặc Z)">
        <span>➕</span>
      </button>
      <span class="cam-readout" id="builder-zoom-readout" title="Tỉ lệ phóng to hiện tại">100%</span>
      <button type="button" class="cam-btn" id="builder-zoom-out" title="Thu nhỏ (Phím: - hoặc X)">
        <span>➖</span>
      </button>
      <button type="button" class="cam-btn cam-center-btn" id="builder-reset-view-btn" title="Căn giữa vương quốc (Phím: 0)">
        <span>🎯</span>
      </button>
    </div>
    <div class="camera-coord-tag" id="builder-coord-status">Vương Quốc Khởi Nguyên</div>
  </aside>

  <!-- Active Farm Tool Floating HUD (Follows or Anchors Bottom Center) -->
  <div class="farm-tool-active-hud hidden" id="farm-tool-active-hud">
    <div class="farm-tool-active-badge" id="farm-tool-active-icon">🌱</div>
    <div class="farm-tool-active-info">
      <div class="farm-tool-active-title" id="farm-tool-active-title">Đang gieo hạt</div>
    </div>
    <button type="button" class="farm-tool-finish-btn" id="farm-tool-finish-btn" title="Hoàn tất và quay lại con trỏ tự do (Phím Esc)">✕ Hoàn thành</button>
  </div>

  <!-- Thanh đặt vật phẩm (bóng mờ kéo thả): Tích | Xoay | Hủy -->
  <div class="floating-brush-hud hidden" id="floating-brush-hud">
    <div class="fbh-label">
      <div class="floating-brush-thumb-wrap">
        <img id="floating-brush-thumb" src="" alt="Selected brush" />
      </div>
      <div class="floating-brush-info">
        <div class="floating-brush-title" id="floating-brush-title">Cozy Cottage</div>
        <div class="floating-brush-meta" id="floating-brush-meta">Giá: 50 🪙</div>
      </div>
    </div>
    <div class="action-bar-row">
      <button type="button" class="action-bar-btn confirm-btn" id="floating-brush-confirm" title="Đặt xuống vị trí bóng mờ">
        <span class="action-bar-icon">✓</span>
        <span class="action-bar-label">Tích</span>
      </button>
      <button type="button" class="action-bar-btn rotate-btn" id="floating-brush-rotate" title="Xoay hướng (phím R)">
        <span class="action-bar-icon">🔄</span>
        <span class="action-bar-label">Xoay</span>
      </button>
      <button type="button" class="action-bar-btn cancel-btn" id="floating-brush-cancel" title="Hủy (phím Esc)">
        <span class="action-bar-icon">✕</span>
        <span class="action-bar-label">Hủy</span>
      </button>
    </div>
  </div>
  <!-- Toast Notification -->
  <div id="game-toast" class="game-toast"></div>

  <!-- Settings & Weather Modal Dialog -->
  <div class="settings-modal-backdrop" id="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
    <div class="settings-modal-card">
      <div class="settings-modal-header">
        <div class="settings-modal-header-left">
          <div class="settings-modal-stamp">⚙️</div>
          <div>
            <h2 class="settings-modal-title" id="settings-modal-title">Cài Đặt Vương Quốc & Hệ Thống</h2>
            <p class="settings-modal-subtitle">Điều chỉnh âm thanh, thời tiết, chu kỳ ngày/đêm và các tiện ích quản lý</p>
          </div>
        </div>
        <button type="button" class="settings-modal-close" id="settings-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="settings-modal-body">
        <!-- Group 1: Sound & Music -->
        <div class="settings-group">
          <div class="settings-group-title">🎵 Âm Thanh & Nhạc Nền (Web Audio API)</div>
          
          <div class="settings-row">
            <div class="settings-row-label">
              <span class="row-icon">🎶</span>
              <div>
                <strong>Nhạc Nền 8-Bit Retro</strong>
                <p>Giai điệu chiptune nhẹ nhàng êm tai phong cách Stardew Valley</p>
              </div>
            </div>
            <div class="settings-row-controls">
              <button type="button" class="settings-toggle-btn active" id="setting-bgm-toggle">Bật</button>
              <input type="range" id="setting-bgm-vol" min="0" max="100" value="35" class="settings-slider" title="Âm lượng nhạc nền" />
            </div>
          </div>

          <div class="settings-row">
            <div class="settings-row-label">
              <span class="row-icon">🔊</span>
              <div>
                <strong>Hiệu Ứng Âm Thanh (SFX)</strong>
                <p>Âm nảy vàng 🪙, tiếng búa rèn ⚒️, tiếng chim hót 🐦, tiếng thu hoạch 🌾</p>
              </div>
            </div>
            <div class="settings-row-controls">
              <button type="button" class="settings-toggle-btn active" id="setting-sfx-toggle">Bật</button>
              <input type="range" id="setting-sfx-vol" min="0" max="100" value="70" class="settings-slider" title="Âm lượng hiệu ứng" />
            </div>
          </div>
        </div>

        <!-- Group 2: Weather & Time -->
        <div class="settings-group">
          <div class="settings-group-title">🌦️ Hệ Thống Thời Tiết & Bầu Trời</div>

          <div class="settings-row">
            <div class="settings-row-label">
              <span class="row-icon">☁️</span>
              <div>
                <strong>Hiệu Ứng Thời Tiết</strong>
                <p>Mưa rơi rào nhẹ, sương sớm thung lũng hoặc trời quang mây tạnh</p>
              </div>
            </div>
            <div class="settings-btn-group" id="settings-weather-buttons">
              <button type="button" class="settings-choice-btn active" id="setting-weather-clear" data-w="clear">☀️ Nắng</button>
              <button type="button" class="settings-choice-btn" id="setting-weather-rain" data-w="rain">🌧️ Mưa</button>
              <button type="button" class="settings-choice-btn" id="setting-weather-mist" data-w="mist">🌫️ Sương Mù</button>
            </div>
          </div>

          <div class="settings-row">
            <div class="settings-row-label">
              <span class="row-icon">⏰</span>
              <div>
                <strong>Chu Kỳ Thời Gian</strong>
                <p>Chuyển cảnh ánh sáng bình minh, ban ngày rực rỡ, hoàng hôn và đêm lung linh</p>
              </div>
            </div>
            <div class="settings-btn-group" id="settings-time-buttons">
              <button type="button" class="settings-choice-btn" id="setting-time-dawn" data-t="dawn">🌅 Bình Minh</button>
              <button type="button" class="settings-choice-btn active" id="setting-time-day" data-t="day">☀️ Ban Ngày</button>
              <button type="button" class="settings-choice-btn" id="setting-time-sunset" data-t="sunset">🌇 Hoàng Hôn</button>
              <button type="button" class="settings-choice-btn" id="setting-time-night" data-t="night">🌙 Ban Đêm</button>
            </div>
          </div>

          <div class="settings-row">
            <div class="settings-row-label">
              <span class="row-icon">⚡</span>
              <div>
                <strong>Tự Động Xoay Vòng Ngày / Đêm</strong>
                <p>1 ngày trong game = 24 phút ngoài đời (1 giờ game = 1 phút thực tế, chuyển cảnh mượt mà)</p>
              </div>
            </div>
            <button type="button" class="settings-toggle-btn active" id="setting-auto-cycle-toggle">Đang Bật</button>
          </div>
        </div>

        <!-- Group 3: Seasonal Themes (Chủ Đề Bốn Mùa & Lễ Hội) -->
        <div class="settings-group">
          <div class="settings-group-title">🍁 Mùa Lễ Hội & Cảnh Sắc (Seasonal Themes)</div>
          <div class="settings-row">
            <div class="settings-row-label">
              <span class="row-icon">🌸</span>
              <div>
                <strong>Cảnh Sắc Mùa</strong>
                <p>Hiệu ứng khí quyển: Nắng hạ vàng ☀️, lá phong vàng đỏ 🍁, bông tuyết trắng ❄️, hoa anh đào nở rộ 🌸</p>
              </div>
            </div>
            <div class="settings-btn-group" id="settings-season-buttons">
              <button type="button" class="settings-choice-btn active" id="setting-season-summer" data-season="summer">☀️ Mùa Hạ</button>
              <button type="button" class="settings-choice-btn" id="setting-season-autumn" data-season="autumn">🍁 Mùa Thu</button>
              <button type="button" class="settings-choice-btn" id="setting-season-winter" data-season="winter">❄️ Mùa Đông</button>
              <button type="button" class="settings-choice-btn" id="setting-season-spring_sakura" data-season="spring_sakura">🌸 Hoa Anh Đào</button>
            </div>
          </div>
        </div>

        <!-- Group 4: Game Utilities -->
        <div class="settings-group">
          <div class="settings-group-title">🛠️ Tiện Ích Bản Đồ & Lưu Trữ</div>
          <div class="settings-utils-grid">
            <button type="button" class="settings-util-btn" id="builder-fast-build-btn" title="Hoàn thành tức thì tất cả công trình đang xây và làm chín toàn bộ cây trồng (Tiện ích kiểm thử)">
              <span class="util-icon">⚡</span>
              <span>Tăng Tốc (Dev)</span>
            </button>
            <button type="button" class="settings-util-btn" id="settings-reset-view-btn" title="Căn giữa góc nhìn isometric toàn bộ vương quốc">
              <span class="util-icon">🎯</span>
              <span>Căn Giữa View</span>
            </button>
            <button type="button" class="settings-util-btn" id="settings-undo-btn" title="Hoàn tác thao tác vừa thực hiện (Ctrl+Z)">
              <span class="util-icon">↩️</span>
              <span>Hoàn Tác</span>
            </button>
            <button type="button" class="settings-util-btn" id="settings-redo-btn" title="Làm lại thao tác vừa hoàn tác (Ctrl+Y)">
              <span class="util-icon">↪️</span>
              <span>Làm Lại</span>
            </button>
            <button type="button" class="settings-util-btn" id="btn-restore-backup" title="Khôi phục bản lưu dự phòng trước đó; game sẽ tải lại">
              <span class="util-icon">🛟</span><span>Khôi phục save dự phòng</span>
            </button>
            <button type="button" class="settings-util-btn" id="builder-export-json-btn" title="Lưu và tải file bản đồ JSON về máy">
              <span class="util-icon">💾</span>
              <span>Xuất JSON</span>
            </button>
            <button type="button" class="settings-util-btn" id="builder-import-json-btn" title="Tải file bản đồ JSON từ máy lên">
              <span class="util-icon">📂</span>
              <span>Nhập JSON</span>
            </button>
            <input type="file" id="builder-import-file-input" accept=".json" style="display:none;" />
            <button type="button" class="settings-util-btn dev" id="builder-dev-load-btn" title="Nạp nhanh Bản đồ Dev Test (Full Map 64 Chunk, Full Nhà & Tài Nguyên)">
              <span class="util-icon">🛠️</span>
              <span>Dev Map Test</span>
            </button>
            <button type="button" class="settings-util-btn primary" id="builder-export-btn" title="Chụp ảnh vương quốc chất lượng cao">
              <span class="util-icon">📸</span>
              <span>Chụp Ảnh PNG</span>
            </button>
            <button type="button" class="settings-util-btn" id="btn-replay-tutorial" title="Mở lại hướng dẫn từng bước của Cụ Trưởng Làng">
              <span class="util-icon">🧙‍♂️</span>
              <span>Xem Hướng Dẫn</span>
            </button>
            <button type="button" class="settings-util-btn" id="btn-trigger-event-fair" title="Kích hoạt sự kiện Hội Chợ Làng (+50% giá bán Chợ 🪙)">
              <span class="util-icon">🎪</span>
              <span>Hội Chợ Làng</span>
            </button>
            <button type="button" class="settings-util-btn" id="btn-trigger-event-caravan" title="Kích hoạt sự kiện Thương Đoàn (+80🪙 quà tặng, +20% Chợ & +25% XP)">
              <span class="util-icon">🐫</span>
              <span>Thương Đoàn</span>
            </button>
            <button type="button" class="settings-util-btn" id="btn-trigger-event-harvest" title="Kích hoạt sự kiện Ngày Hội Mùa Vàng (x2 Thu hoạch & x2 XP)">
              <span class="util-icon">🌾</span>
              <span>Ngày Mùa Vàng</span>
            </button>
            <button type="button" class="settings-util-btn danger" id="btn-restart-game" title="Làm sạch vương quốc về đồng cỏ trống ban đầu">
              <span class="util-icon">🔄</span>
              <span>Chơi Lại Từ Đầu</span>
            </button>
          </div>
        </div>
      </div>

      <div class="settings-modal-footer">
        <span class="settings-footer-info" id="builder-save-status">Tự động lưu: Sẵn sàng</span>
        <button type="button" class="quest-btn-close-action" id="settings-modal-dismiss-btn">Xong</button>
      </div>
    </div>
  </div>

  <!-- Level Up Celebration Modal Dialog -->
  <div class="levelup-modal-backdrop hidden" id="levelup-modal" role="dialog" aria-modal="true" aria-labelledby="levelup-modal-title">
    <div class="levelup-modal-card">
      <div class="levelup-sparkles">✨ ⭐ ✨</div>
      <h2 class="levelup-ribbon" id="levelup-modal-title">🎉 CHÚC MỪNG LÊN CẤP! 🎉</h2>
      <div class="levelup-badge-circle" id="levelup-number-badge">CẤP 2</div>
      <div class="levelup-title-text" id="levelup-title-text">Nông Dân Chăm Chỉ</div>
      
      <div class="levelup-reward-box">
        <span class="reward-title">🎁 Phần Thưởng Lên Cấp</span>
        <div class="reward-content" id="levelup-gold-reward">+200 🪙 Vàng</div>
      </div>

      <div class="levelup-unlock-box">
        <span class="unlock-title">🔓 Mở Khóa Mới</span>
        <div class="unlock-list" id="levelup-unlock-list">
          <!-- Populated dynamically -->
        </div>
      </div>

      <button type="button" class="levelup-claim-btn" id="levelup-claim-btn">Tuyệt Vời, Tiếp Tục Chơi!</button>
    </div>
  </div>

  <!-- Quest Book Modal Dialog -->
  <div class="quest-modal-backdrop" id="quest-modal" role="dialog" aria-modal="true" aria-labelledby="quest-modal-title">
    <div class="quest-modal-card">
      <div class="quest-modal-header">
        <div class="quest-modal-header-left">
          <div class="quest-modal-stamp">📜</div>
          <div>
            <h2 class="quest-modal-title" id="quest-modal-title">Sổ Nhiệm Vụ Vương Quốc</h2>
            <p class="quest-modal-subtitle">Hoàn thành nhiệm vụ mở rộng lãnh thổ, thăng cấp và nhận thưởng vàng</p>
          </div>
        </div>
        <button type="button" class="quest-modal-close" id="quest-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="quest-modal-summary">
        <span id="quest-progress-summary">Đã hoàn thành: 0 / 32 nhiệm vụ</span>
        <span style="font-size: 0.72rem; color: #a16207;">⚡ Thưởng vàng & XP được cộng trực tiếp</span>
      </div>

      <!-- Quest Category Filter Tabs -->
      <div class="quest-filter-bar" id="quest-filter-bar">
        <button type="button" class="quest-filter-btn active" data-quest-filter="active" id="quest-filter-btn-active">
          <span>⭐ Đang Làm & Chờ Nhận</span>
          <span class="quest-filter-badge" id="quest-filter-badge-active">0</span>
        </button>
        <button type="button" class="quest-filter-btn" data-quest-filter="all" id="quest-filter-btn-all">
          <span>📚 Theo Chương</span>
          <span class="quest-filter-badge" id="quest-filter-badge-all">32</span>
        </button>
        <button type="button" class="quest-filter-btn" data-quest-filter="claimed" id="quest-filter-btn-claimed">
          <span>✓ Đã Xong</span>
          <span class="quest-filter-badge" id="quest-filter-badge-claimed">0</span>
        </button>
      </div>

      <div class="quest-modal-body" id="quest-list-container">
        <!-- Rendered dynamically -->
      </div>

      <div class="quest-modal-footer">
        <span class="quest-footer-hint">💡 Gợi ý: Dùng Liềm thu hoạch nhanh và bán tại Chợ để nhanh chóng lên cấp!</span>
        <button type="button" class="quest-btn-close-action" id="quest-modal-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Achievements Modal Dialog (Tòa Thị Chính - Đại Sảnh Thành Tựu) -->
  <div class="achievements-modal-backdrop" id="achievements-modal" role="dialog" aria-modal="true" aria-labelledby="achievements-modal-title">
    <div class="achievements-modal-card">
      <div class="achievements-modal-header">
        <div class="achievements-modal-header-left">
          <div class="achievements-modal-stamp">🏛️</div>
          <div>
            <h2 class="achievements-modal-title" id="achievements-modal-title">Tòa Thị Chính: Đại Sảnh Thành Tựu</h2>
            <p class="achievements-modal-subtitle">Ghi danh những kỳ tích vẻ vang và nhận huân chương vương quốc</p>
          </div>
        </div>
        <button type="button" class="achievements-modal-close" id="achievements-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="achievements-modal-summary">
        <span id="achievements-progress-summary">Đã chinh phục: 0 / 12 Thành Tựu</span>
        <span style="font-size: 0.72rem; color: #a16207;">🏆 Huân chương trao tặng phần thưởng Vàng & XP lớn</span>
      </div>

      <div class="achievements-modal-body" id="achievements-list-container">
        <!-- Rendered dynamically via JS -->
      </div>

      <div class="achievements-modal-footer">
        <span class="achievements-footer-hint">💡 Nhấp vào Tòa Thị Chính trên bản đồ bất cứ lúc nào để mở Đại Sảnh Thành Tựu!</span>
        <button type="button" class="achievements-btn-close-action" id="achievements-modal-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Market & Warehouse Modal Dialog -->
  <div class="market-modal-backdrop" id="market-modal" role="dialog" aria-modal="true" aria-labelledby="market-modal-title">
    <div class="market-modal-card">
      <div class="market-modal-header">
        <div class="market-modal-header-left">
          <div class="market-modal-stamp">🏪</div>
          <div>
            <h2 class="market-modal-title" id="market-modal-title">Chợ Vương Quốc & Kho Dự Trữ</h2>
            <p class="market-modal-subtitle">Bán nông sản & vật phẩm chế tác lấy vàng để mở rộng đất và phát triển làng</p>
          </div>
        </div>
        <button type="button" class="market-modal-close" id="market-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="market-modal-summary">
        <span id="market-storage-summary">Kho Nông sản Silo & Kho Vật tư Barn</span>
        <button type="button" id="btn-market-sell-all-crops" class="market-sell-all-top-btn" title="Bán toàn bộ nông sản ruộng đồng trong kho Silo lấy vàng">🌾 Bán Nhanh Nông Sản Silo</button>
      </div>

      <div class="market-modal-body" id="market-items-container">
        <!-- Rendered dynamically -->
      </div>

      <div class="market-modal-footer">
        <span class="market-footer-hint">💡 Mẹo chuỗi sản xuất: Cối xay gió sản xuất Lúa mì 🌾 &rarr; Lò bánh mì tiêu thụ Lúa mì nướng thành Bánh mì 🍞 giá trị cao gấp 2.5 lần!</span>
        <button type="button" class="market-btn-close-action" id="market-modal-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Bảng Đơn Hàng Vương Quốc (NPC Order Board Modal) -->
  <div class="order-board-modal-backdrop" id="order-board-modal" role="dialog" aria-modal="true" aria-labelledby="order-board-modal-title">
    <div class="order-board-modal-card">
      <div class="order-board-modal-header">
        <div class="order-board-modal-header-left">
          <div class="order-board-modal-stamp">📋</div>
          <div>
            <h2 class="order-board-modal-title" id="order-board-modal-title">Bảng Đơn Hàng Vương Quốc</h2>
            <p class="order-board-modal-subtitle">Dân làng và thương khách đang cần tiếp tế! Giao hàng nhận thưởng Vàng & Kinh nghiệm phong phú</p>
          </div>
        </div>
        <button type="button" class="order-board-modal-close" id="order-board-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="order-board-modal-summary">
        <div class="order-board-stats-pill">
          <span>Đã hoàn thành: <strong id="order-board-completed-count">0</strong> đơn 🚚</span>
        </div>
        <div class="order-board-stats-pill highlight">
          <span>Đơn sẵn sàng giao: <strong id="order-board-ready-count">0 / 6</strong></span>
        </div>
      </div>

      <div class="order-board-modal-body">
        <div id="order-board-truck-banner-container" style="display: none; margin-bottom: 12px;"></div>
        <div class="order-board-cork-surface">
          <div class="order-board-grid" id="order-board-grid">
            <!-- Order slips rendered dynamically by orderBoardManager.js -->
          </div>
        </div>
      </div>

      <div class="order-board-modal-footer">
        <span class="order-board-footer-hint">💡 Mẹo giao hàng: Đơn hàng NPC trả thêm từ +25% đến +40% Vàng so với bán Chợ và tặng lượng lớn điểm XP!</span>
        <button type="button" class="order-board-btn-close-action" id="order-board-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Khách Bộ Hành Ghé Thăm Tòa Thị Chính Modal (Town Visitor Modal) -->
  <div class="town-visitor-modal-backdrop" id="town-visitor-modal" role="dialog" aria-modal="true" aria-labelledby="visitor-name">
    <div class="town-visitor-modal-card">
      <div class="town-visitor-modal-header">
        <div class="visitor-avatar-large" id="visitor-avatar">👩‍🍳</div>
        <div class="visitor-info-meta">
          <div class="visitor-welcome-badge">🚶 Khách Ghé Thăm Làng</div>
          <h2 class="visitor-name" id="visitor-name">Bà Marie</h2>
          <div class="visitor-role" id="visitor-role">Bếp trưởng hoàng gia</div>
        </div>
        <button type="button" class="town-visitor-modal-close" id="visitor-deal-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="town-visitor-modal-body">
        <div class="visitor-speech-box" id="visitor-dialogue">
          "Xin chào Lãnh Chúa! Ta nghe tiếng nông sản thị trấn rất tươi ngon..."
        </div>

        <div class="visitor-deal-card">
          <div class="visitor-deal-title">Nhu cầu mua hàng hôm nay:</div>
          <div class="visitor-item-row">
            <span class="visitor-item-icon" id="visitor-item-icon">🌾</span>
            <div class="visitor-item-details">
              <span class="visitor-item-name" id="visitor-item-name">Lúa mì</span>
              <span class="visitor-stock-badge" id="visitor-item-stock">(Kho có: 0/3) ❌</span>
            </div>
          </div>
          <div class="visitor-reward-row">
            <span class="visitor-reward-label">Thù lao trả ngài:</span>
            <div class="visitor-reward-chips">
              <span class="reward-chip gold" id="visitor-reward-gold">+45 🪙</span>
              <span class="reward-chip xp" id="visitor-reward-xp">+30 XP ⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div class="town-visitor-modal-footer">
        <button type="button" class="visitor-btn-decline" id="visitor-deal-decline-btn" title="Từ chối lời đề nghị mua hàng">
          ❌ Không, Cảm Ơn
        </button>
        <button type="button" class="visitor-btn-accept ready" id="visitor-deal-accept-btn" title="Đồng ý bán nông sản cho khách">
          ✅ Bán Cho Khách
        </button>
      </div>
    </div>
  </div>

  <!-- Tổng Quản Gia Hoàng Gia (Town Caretaker Modal) -->
  <div class="town-caretaker-modal-backdrop" id="town-caretaker-modal" role="dialog" aria-modal="true" aria-labelledby="caretaker-modal-title">
    <div class="town-caretaker-modal-card">
      <div class="town-caretaker-modal-header">
        <div class="town-caretaker-modal-header-left">
          <div class="town-caretaker-avatar-large">👨‍🌾</div>
          <div>
            <div class="caretaker-header-badge">👑 Phụng Sự Hoàng Gia</div>
            <h2 class="town-caretaker-modal-title" id="caretaker-modal-title">Tổng Quản Gia - Bác Thomas</h2>
            <p class="town-caretaker-modal-subtitle">Tự động thu hoạch ruộng đồng, chăm sóc gia súc & xưởng thủ công</p>
          </div>
        </div>
        <button type="button" class="town-caretaker-modal-close" id="caretaker-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="town-caretaker-modal-body">
        <!-- Khối trạng thái & hợp đồng -->
        <div id="caretaker-status-wrap"></div>

        <!-- Khối cấu hình công việc -->
        <div id="caretaker-options-wrap"></div>

        <!-- Khối các gói thuê -->
        <div id="caretaker-packages-wrap"></div>

        <!-- Khối thống kê -->
        <div id="caretaker-stats-wrap"></div>
      </div>

      <div class="town-caretaker-modal-footer">
        <span class="caretaker-footer-hint">💡 Bác Thomas sẽ tự động nạp lúa mì, bắp ngô và cà rốt cho gà, bò, cừu khi đàn đói và thu hoạch thành phẩm vào kho!</span>
        <button type="button" class="caretaker-btn-close-action" id="caretaker-modal-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Bến Cảng Đường Thủy & Tàu Buôn Giao Thương (Cargo Ship Modal) -->
  <div class="cargo-ship-modal-backdrop" id="cargo-ship-modal" role="dialog" aria-modal="true" aria-labelledby="cargo-ship-modal-title">
    <div class="cargo-ship-modal-card">
      <div class="cargo-ship-modal-header">
        <div class="cargo-ship-modal-header-left">
          <div class="cargo-ship-avatar-large">
            <img src="/assets/aistudio/TauHoangGia_v1_a5f7fe14.png" alt="Thuyền Buôn Hoàng Gia Caravel" class="cargo-ship-avatar-img" />
          </div>
          <div>
            <div class="ship-header-badge">🌊 HẢI CẢNG ĐẠI LỤC</div>
            <h2 class="cargo-ship-modal-title" id="cargo-ship-modal-title">Thuyền Buôn Hoàng Gia Caravel</h2>
            <p class="cargo-ship-modal-subtitle">Đóng đủ 9 thùng hàng trước khi nhổ neo để nhận Rương Báu & Ruby 💎</p>
          </div>
        </div>
        <button type="button" class="cargo-ship-modal-close" id="cargo-ship-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="cargo-ship-modal-summary">
        <div class="ship-summary-pill" id="cargo-ship-countdown-label">
          ⏳ Tàu sẽ rời bến sau: <strong>15:00</strong>
        </div>
        <div class="ship-summary-pill highlight">
          <span>Chuyến tàu hoàn thành: <strong id="cargo-ship-total-completed">0</strong> ⚓</span>
        </div>
      </div>

      <div class="cargo-ship-modal-body" id="cargo-ship-modal-body">
        <!-- Rendered dynamically by harborShipManager.js -->
      </div>

      <div class="cargo-ship-modal-footer">
        <span class="ship-footer-hint">💡 Mỗi thùng hàng đóng xong sẽ nhận ngay Vàng & XP. Đóng đủ trọn vẹn 9 thùng để rinh về 3–5 Ruby 💎 và Vật tư mở đất!</span>
        <button type="button" class="ship-btn-close-action" id="cargo-ship-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Building Inspection & Upgrade Modal Dialog -->
  <div class="upgrade-modal-backdrop" id="upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="upgrade-modal-title">
    <div class="upgrade-modal-card">
      <div class="upgrade-modal-header">
        <div class="upgrade-modal-header-left">
          <div class="upgrade-modal-stamp" id="upgrade-modal-thumb">🏠</div>
          <div>
            <h2 class="upgrade-modal-title" id="upgrade-modal-title">Chi Tiết Công Trình</h2>
            <div class="upgrade-modal-stars" id="upgrade-modal-stars">⭐ Cấp 1 / 3</div>
          </div>
        </div>
        <button type="button" class="upgrade-modal-close" id="upgrade-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="upgrade-modal-body" id="upgrade-modal-body">
        <!-- Rendered dynamically -->
      </div>

      <div class="upgrade-modal-footer">
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <button type="button" class="upgrade-btn-action" id="upgrade-btn-rotate" title="Xoay hoặc đổi hướng công trình">🔄 Xoay hướng</button>
          <button type="button" class="upgrade-btn-action" id="upgrade-btn-move" title="Di chuyển công trình sang ô đất khác">🚚 Di chuyển</button>
          <button type="button" class="upgrade-btn-demolish" id="upgrade-btn-demolish" title="Phá dỡ công trình (Hoàn lại 50% gốc + 70% nâng cấp)">♻️ Phá dỡ & Hoàn tiền</button>
        </div>
        <button type="button" class="upgrade-btn-close-action" id="upgrade-modal-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Snapshot Modal Dialog -->
  <div class="snapshot-modal-backdrop" id="snapshot-modal" role="dialog" aria-modal="true" aria-labelledby="snapshot-modal-title">
    <div class="snapshot-modal-card">
      <div class="snapshot-modal-header">
        <div>
          <h2 class="snapshot-modal-title" id="snapshot-modal-title">📸 Ảnh Chụp Vương Quốc</h2>
          <p class="snapshot-modal-subtitle">Độ phân giải pixel sắc nét &bull; Khung cảnh vương quốc hiện tại</p>
        </div>
        <button type="button" class="snapshot-modal-close" id="snapshot-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="snapshot-modal-body">
        <img id="snapshot-modal-img" class="snapshot-preview-img pixelated" alt="Kingdom snapshot" />
      </div>

      <div class="snapshot-modal-footer">
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <a id="snapshot-modal-download-link" class="snapshot-action-btn primary" download="isometric-kingdom-32x32.png">💾 Tải Ảnh PNG</a>
          <button type="button" id="snapshot-modal-copy-btn" class="snapshot-action-btn">📋 Sao Chép Ảnh</button>
          <a id="snapshot-modal-open-link" class="snapshot-action-link" target="_blank" rel="noopener">🔍 Xem Ảnh Gốc ↗</a>
        </div>
        <button type="button" class="upgrade-btn-close-action" id="snapshot-modal-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Shop Modal Dialog -->
  <div class="shop-modal-backdrop" id="shop-modal" role="dialog" aria-modal="true" aria-labelledby="shop-modal-title">
    <div class="shop-modal-card">
      <div class="shop-modal-header">
        <div class="shop-modal-header-left">
          <button type="button" class="shop-modal-back-btn" id="shop-modal-back-btn" title="Quay lại danh mục" style="display: none;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 class="shop-modal-title" id="shop-modal-title">
            <img class="shop-modal-header-icon" src="/assets/ui/icon_shop.png" alt="Cửa hàng" />
            <span id="shop-modal-title-text">Cửa hàng</span>
          </h2>
        </div>
        <button type="button" class="shop-modal-close" id="shop-modal-close" title="Đóng">&times;</button>
      </div>

      <!-- Shop Modal Body -->
      <div class="shop-modal-body">
        <!-- 2-Column Categories Grid (Root View) -->
        <div class="shop-categories-grid" id="shop-categories-grid">
          <button type="button" class="shop-cat-card" data-shop-cat="residential" title="Nhà">
            <img src="/assets/categories/cat_residential.png" alt="Nhà" />
          </button>
          <button type="button" class="shop-cat-card" data-shop-cat="production" title="Cửa hàng sản xuất">
            <img src="/assets/categories/cat_production.png" alt="Cửa hàng sản xuất" />
          </button>
          <button type="button" class="shop-cat-card" data-shop-cat="farming" title="Nông trại">
            <img src="/assets/categories/cat_farming.png" alt="Nông trại" />
          </button>
          <button type="button" class="shop-cat-card" data-shop-cat="fences" title="Hàng rào">
            <img src="/assets/categories/cat_fences.png" alt="Hàng rào" />
          </button>
          <button type="button" class="shop-cat-card" data-shop-cat="roads" title="Đường & cầu">
            <img src="/assets/categories/cat_roads.png" alt="Đường & cầu" />
          </button>
          <button type="button" class="shop-cat-card" data-shop-cat="decor" title="Phong cảnh">
            <img src="/assets/categories/cat_decor.png" alt="Phong cảnh" />
          </button>
          <button type="button" class="shop-cat-card" data-shop-cat="wonders" title="Kỳ quan">
            <img src="/assets/categories/cat_wonders.png" alt="Kỳ quan" />
          </button>
        </div>

        <!-- Shop Items Grid (Category View) -->
        <div class="shop-items-grid" id="shop-items-container" style="display: none;">
          <!-- Populated dynamically via JS -->
        </div>
      </div>
    </div>
  </div>

  <!-- Seed Nursery Modal Dialog (Agricultural Town Style) -->
  <div class="seed-modal-backdrop" id="seed-modal" role="dialog" aria-modal="true" aria-labelledby="seed-modal-title">
    <div class="seed-modal-card">
      <div class="seed-modal-header">
        <div>
          <h2 class="seed-modal-title" id="seed-modal-title">🌱 Nông Trại: Gieo Hạt Giống</h2>
          <p class="seed-modal-subtitle">Gieo hạt trên luống đất và chăm sóc mùa màng (Mở khóa theo Cấp người chơi)</p>
        </div>
        <button type="button" class="seed-modal-close" id="seed-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="seed-modal-body" id="seed-items-container">
        <!-- Rendered dynamically from CROPS_CONFIG -->
      </div>

      <div class="seed-modal-footer">
        <span>💡 Dùng <strong>🌾 Liềm Thu Hoạch</strong> để quét gặt hàng chục luống đất chín chỉ trong 1 giây!</span>
        <button type="button" class="quest-btn-close-action" id="seed-modal-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Town Event Detail Modal Dialog -->
  <div class="event-detail-modal-backdrop hidden" id="town-event-detail-modal" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="event-detail-title">
    <div class="event-detail-modal" id="event-detail-card">
      <div class="event-detail-header">
        <div class="event-detail-title-group">
          <span class="event-detail-icon" id="event-detail-icon">🎪</span>
          <span class="event-detail-title" id="event-detail-title">Hội Chợ Làng</span>
        </div>
        <button type="button" class="event-detail-close-btn" id="event-detail-close" aria-label="Đóng popup">&times;</button>
      </div>
      <div class="event-detail-body">
        <p class="event-detail-desc" id="event-detail-desc">Mô tả sự kiện</p>
        <div class="event-detail-buffs-box">
          <div class="event-detail-buffs-title">Hiệu Ứng Đang Kích Hoạt</div>
          <div class="event-detail-buff-list" id="event-detail-buff-list">
            <!-- Dynamic buff items -->
          </div>
        </div>
        <div class="event-detail-timer-box">
          <span class="event-detail-timer-label">⏳ Thời gian còn lại:</span>
          <span class="event-detail-timer-val" id="event-detail-timer">00:00</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Construction Speedup Modal Dialog -->
  <div class="construction-speedup-backdrop hidden" id="construction-speedup-modal" style="display: none;" role="dialog" aria-modal="true">
    <div class="construction-speedup-card">
      <div class="construction-speedup-header">
        <div class="construction-speedup-icon">🏗️</div>
        <div>
          <h2 class="construction-speedup-title" id="construction-speedup-title">Đang Thi Công...</h2>
          <p class="construction-speedup-subtitle" id="construction-speedup-desc">Công trình đang được các thợ xây hoàn thiện</p>
        </div>
        <button type="button" class="construction-speedup-close" id="construction-speedup-close" title="Đóng">&times;</button>
      </div>
      <div class="construction-speedup-body">
        <div class="construction-speedup-preview" id="construction-speedup-preview">
          <!-- Building preview or icon -->
        </div>
        <div class="construction-speedup-timer-bar">
          <div class="construction-speedup-progress" id="construction-speedup-progress" style="width: 45%;"></div>
        </div>
        <div class="construction-speedup-time" id="construction-speedup-time">⏳ Còn lại: 45s</div>
      </div>
      <div class="construction-speedup-footer">
        <button type="button" class="construction-btn-speedup" id="construction-speedup-btn">
          ⚡ Hoàn Thành Ngay (<span id="construction-speedup-cost">2</span> 💎)
        </button>
        <button type="button" class="construction-btn-wait" id="construction-wait-btn">Chờ Xây Xong</button>
      </div>
    </div>
  </div>

  <!-- Storage Modal Dialog (Combined Warehouse) -->
  <div class="storage-modal-backdrop hidden" id="storage-modal" style="display: none;" role="dialog" aria-modal="true">
    <div class="storage-modal-card">
      <div class="storage-modal-header">
        <div class="storage-header-tabs">
          <div class="storage-tab-btn active">
            📦 Kho Tổng Hợp <span class="storage-tab-badge" id="storage-badge-warehouse">0/300</span>
          </div>
        </div>
        <button type="button" class="storage-modal-close" id="storage-modal-close" title="Đóng">&times;</button>
      </div>
      <div class="storage-modal-body">
        <div class="storage-capacity-bar-wrap">
          <div class="storage-capacity-info">
            <span id="storage-cap-title">Sức chứa Kho Tổng Hợp:</span>
            <strong id="storage-cap-value">0 / 300</strong>
          </div>
          <div class="storage-meter">
            <div class="storage-meter-fill" id="storage-meter-fill" style="width: 0%;"></div>
          </div>
        </div>
        <div class="storage-items-grid" id="storage-items-grid">
          <!-- Rendered dynamically -->
        </div>
      </div>
      <div class="storage-modal-footer">
        <div class="storage-upgrade-info">
          <span class="storage-upgrade-hint">Nâng cấp tăng <strong>+25</strong> sức chứa: <strong>200🪙</strong> + <strong>5💎</strong></span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="storage-upgrade-btn" id="storage-upgrade-btn">
            ⬆️ Nâng Cấp Kho (+25)
          </button>
          <button type="button" class="storage-close-btn" id="storage-dismiss-btn">Đóng</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Storage Full Warning Modal Dialog -->
  <div class="storage-full-backdrop hidden" id="storage-full-modal" style="display: none;" role="dialog" aria-modal="true">
    <div class="storage-full-card">
      <div class="storage-full-icon">⚠️</div>
      <h2 class="storage-full-title" id="storage-full-title">Kho Đã Đầy!</h2>
      <p class="storage-full-desc" id="storage-full-desc">
        Sức chứa kho của bạn đã đạt giới hạn tối đa. Bạn cần giải phóng không gian hoặc mở rộng kho để tiếp tục thu hoạch.
      </p>
      <div class="storage-full-actions">
        <button type="button" class="storage-full-btn-upgrade" id="storage-full-upgrade-btn">
          ⬆️ Nâng Cấp Kho (+25 Sức Chứa)
        </button>
        <button type="button" class="storage-full-btn-orders" id="storage-full-orders-btn">
          🚚 Giao Bớt Hàng (Bảng Đơn Hàng)
        </button>
        <button type="button" class="storage-full-btn-close" id="storage-full-close-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Livestock Management Modal Dialog -->
  <div class="livestock-modal-backdrop hidden" id="livestock-modal" style="display: none;" role="dialog" aria-modal="true">
    <div class="livestock-modal-card">
      <div class="livestock-modal-header">
        <div class="livestock-modal-icon" id="livestock-modal-icon">🐔</div>
        <div>
          <h2 class="livestock-modal-title" id="livestock-modal-title">Chuồng Gà Đẻ Trứng</h2>
          <p class="livestock-modal-subtitle" id="livestock-modal-subtitle">Chăn nuôi, cho ăn và thu hoạch sản phẩm tươi ngon</p>
        </div>
        <button type="button" class="livestock-modal-close" id="livestock-modal-close" title="Đóng">&times;</button>
      </div>
      <div class="livestock-modal-body" id="livestock-modal-body">
        <!-- Rendered dynamically -->
      </div>
      <div class="livestock-modal-footer">
        <button type="button" class="livestock-btn-close" id="livestock-modal-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>

  <!-- Land Expansion Modal Dialog -->
  <div class="land-modal-backdrop hidden" id="land-modal" style="display: none;" role="dialog" aria-modal="true">
    <div class="land-modal-card">
      <div class="land-modal-header">
        <div class="land-modal-icon">🏰</div>
        <div>
          <h2 class="land-modal-title">Khai Hoang Mở Rộng Lãnh Thổ</h2>
          <p class="land-modal-subtitle" id="land-modal-subtitle">Mảnh đất mới (4×4 = 16 ô đất màu mỡ) sẵn sàng canh tác</p>
        </div>
        <button type="button" class="land-modal-close" id="land-modal-close" title="Đóng">&times;</button>
      </div>
      <div class="land-modal-body">
        <div class="land-cost-section">
          <div class="land-cost-title">Chi phí mở rộng lãnh thổ:</div>
          <div class="land-cost-gold-box" id="land-gold-cost-box"></div>
          <div class="land-req-items-list" id="land-req-items-list"></div>
        </div>
        <div class="land-tip-box">
          💡 <strong>Mẹo mở đất:</strong> Tích lũy nông sản từ ruộng, sản phẩm chuồng trại và dụng cụ thợ rèn để mở rộng lãnh thổ vương quốc!
        </div>
      </div>
      <div class="land-modal-footer">
        <button type="button" class="land-btn-cancel" id="land-modal-cancel-btn">Để Sau</button>
        <button type="button" class="land-btn-confirm" id="land-modal-confirm-btn">🏰 Mở Rộng Ngay</button>
      </div>
    </div>
  </div>

  <!-- Đại Kỳ Quan Hoàng Gia (Kingdom Wonders Modal) -->
  <div class="wonder-modal-backdrop" id="wonder-modal" role="dialog" aria-modal="true" aria-labelledby="wonder-modal-title">
    <div class="wonder-modal-card">
      <div class="wonder-modal-header">
        <div class="wonder-modal-header-left">
          <div class="wonder-avatar-large" id="wonder-modal-icon">🏛️</div>
          <div>
            <div class="wonder-header-badge">👑 BIỂU TƯỢNG HOÀNG GIA</div>
            <h2 class="wonder-modal-title" id="wonder-modal-title">Đại Kỳ Quan Vương Quốc</h2>
            <p class="wonder-modal-subtitle" id="wonder-modal-subtitle">Xây dựng 3 công trình vĩ đại chia 4 giai đoạn, mở khóa buff vĩnh viễn</p>
          </div>
        </div>
        <button type="button" class="wonder-modal-close" id="wonder-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="wonder-tabs-bar" id="wonder-tabs-bar">
        <button type="button" class="wonder-tab-btn active" data-wonder="royal_palace">🏰 Lâu Đài Hoàng Gia</button>
        <button type="button" class="wonder-tab-btn" data-wonder="ocean_library">📚 Đại Thư Viện Biển</button>
        <button type="button" class="wonder-tab-btn" data-wonder="poseidon_statue">🔱 Tượng Thần Biển</button>
      </div>

      <div class="wonder-modal-body" id="wonder-modal-body">
        <div class="wonder-banner">
          <div class="wonder-buff-pill" id="wonder-modal-buff-badge">Hiệu ứng</div>
        </div>

        <div class="wonder-progress-box" style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
            <span>Tiến độ xây dựng:</span>
            <strong id="wonder-progress-text">Giai đoạn 0/4 (0%)</strong>
          </div>
          <div style="width: 100%; height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;">
            <div id="wonder-progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #f59e0b, #10b981); transition: width 0.3s ease;"></div>
          </div>
        </div>

        <div class="wonder-stages-list" id="wonder-stages-list"></div>

        <button type="button" class="wonder-build-btn" id="wonder-build-action-btn">🔨 Tiến Hành Thi Công</button>
      </div>

      <div class="wonder-modal-footer">
        <span class="wonder-footer-hint">💡 Mỗi giai đoạn tiêu hao lượng lớn Vàng & Vật tư, bù lại ban tặng toàn vương quốc hiệu ứng tăng sản lượng vĩnh viễn!</span>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="wonder-btn-rotate" id="wonder-rotate-btn" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;" title="Xoay lật hướng kỳ quan (Phím tắt: R)">🔄 Xoay Hướng</button>
          <button type="button" class="wonder-btn-relocate" id="wonder-relocate-btn" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;" title="Dời kỳ quan sang vị trí khác">🚚 Di Chuyển</button>
          <button type="button" class="wonder-btn-close-action" id="wonder-modal-dismiss-btn">Đóng</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Bến Câu Cá Thư Giãn (Fishing Spot Modal) -->
  <div class="fishing-modal-backdrop" id="fishing-modal" role="dialog" aria-modal="true" aria-labelledby="fishing-modal-title">
    <div class="fishing-modal-card">
      <div class="fishing-modal-header">
        <div class="fishing-modal-header-left">
          <div class="fishing-avatar-large">🎣</div>
          <div>
            <div class="fishing-header-badge">🌊 HẢI ĐẢO THƯ THÁI</div>
            <h2 class="fishing-modal-title" id="fishing-modal-title">Bến Câu Cá Hoàng Gia</h2>
            <p class="fishing-modal-subtitle">Thả cần ra khơi câu cá hồi, tôm hoàng gia và trục vớt rương báu đại dương</p>
          </div>
        </div>
        <button type="button" class="fishing-modal-close" id="fishing-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="fishing-modal-body" id="fishing-modal-body">
        <div class="fishing-pond-scene">
          <div class="fishing-bobber" id="fishing-bobber">🎣</div>
        </div>

        <div class="fishing-status-msg" id="fishing-pond-status">
          🌊 Làn nước xanh mát dập dềnh sóng biếc. Sẵn sàng buông cần câu!
        </div>

        <div class="fishing-slider-wrap" id="fishing-slider-bar-container" style="display: none;">
          <div class="fishing-slider-track">
            <div class="fishing-slider-target"></div>
            <div class="fishing-slider-thumb" id="fishing-slider-thumb"></div>
          </div>
        </div>

        <div class="fishing-actions" style="display: flex; gap: 10px;">
          <button type="button" class="fishing-action-btn cast" id="fishing-cast-btn">🎣 Thả Cần Câu</button>
          <button type="button" class="fishing-action-btn reel" id="fishing-hook-btn" style="display: none;">⚡ Giật Cần!</button>
        </div>

        <div class="fishing-result-card" id="fishing-result-box" style="display: none;"></div>
      </div>

      <div class="fishing-modal-footer">
        <span class="fishing-footer-hint">💡 Canh vạch phao chạy vào vùng XANH LÁ rồi nhấn Giật Cần để bắt cá thành công!</span>
        <button type="button" class="fishing-btn-close-action" id="fishing-modal-dismiss-btn">Rời Bến</button>
      </div>
    </div>
  </div>

  <!-- Vòng Quay May Mắn Hoàng Gia (Daily Lucky Wheel Modal) -->
  <div class="wheel-modal-backdrop" id="wheel-modal" role="dialog" aria-modal="true" aria-labelledby="wheel-modal-title">
    <div class="wheel-modal-card">
      <div class="wheel-modal-header">
        <div class="wheel-modal-header-left">
          <div class="wheel-avatar-large">🎡</div>
          <div>
            <div class="wheel-header-badge">🎁 PHÚC LỢI HOÀNG TỘC</div>
            <h2 class="wheel-modal-title" id="wheel-modal-title">Vòng Quay May Mắn Hoàng Gia</h2>
            <p class="wheel-modal-subtitle">Mỗi ngày nhận 1 lượt quay miễn phí – Rinh Vàng, Ruby & Vật tư hiếm</p>
          </div>
        </div>
        <button type="button" class="wheel-modal-close" id="wheel-modal-close" title="Đóng">&times;</button>
      </div>

      <div class="wheel-modal-body" id="wheel-modal-body">
        <div class="wheel-stage-container">
          <div class="wheel-pointer-arrow">▼</div>
          <canvas id="wheel-canvas-disk" width="340" height="340" class="wheel-canvas"></canvas>
          <div class="wheel-center-hub">🎯</div>
        </div>
        <div class="wheel-controls-area">
          <div class="wheel-status-text" id="wheel-status-text">Đang tải trạng thái vòng quay...</div>
          <div class="wheel-action-buttons">
            <button type="button" class="wheel-spin-btn primary" id="wheel-spin-btn">🎯 QUAY MIỄN PHÍ NGAY!</button>
          </div>
        </div>
      </div>

      <div class="wheel-modal-footer">
        <span class="wheel-footer-hint">💡 Ghé thăm vương quốc mỗi ngày để tích lũy lượt quay và làm giàu ngân khố!</span>
        <button type="button" class="wheel-btn-close-action" id="wheel-modal-dismiss-btn">Đóng</button>
      </div>
    </div>
  </div>
`;

export default function App() {
  useEffect(() => {
    const cleanup = initIsometricStudio();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      dangerouslySetInnerHTML={{ __html: STUDIO_MARKUP }}
    />
  );
}
