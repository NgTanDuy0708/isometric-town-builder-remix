/**
 * aestheticTileIcons.js - Vector SVG Icons & Thumbnails for New Aesthetic Tiles
 * Standard 128x128 isometric projection matching the town builder grid:
 * Base diamond: (64, 64) -> (128, 96) -> (64, 128) -> (0, 96)
 */

function encodeSvg(svg) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg.trim());
}

export const AESTHETIC_TILE_URIS = {
  // 1. Lối đi cẩm thạch hoàng gia
  r03_royal_marble_pavement: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <defs>
        <linearGradient id="marbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
      </defs>
      <!-- Base Grass Diamond -->
      <polygon points="64,64 128,96 64,128 0,96" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
      <!-- Marble Paver Slab -->
      <polygon points="64,66 124,96 64,126 4,96" fill="url(#marbleGrad)" stroke="url(#goldBorder)" stroke-width="3"/>
      <!-- Inner Diagonal Tile Inlays -->
      <polygon points="64,74 110,96 64,118 18,96" fill="none" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="64" y1="74" x2="64" y2="118" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="18" y1="96" x2="110" y2="96" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- Central Royal Golden Rosette -->
      <polygon points="64,88 74,96 64,104 54,96" fill="#fef08a" stroke="#d97706" stroke-width="1.5"/>
      <circle cx="64" cy="96" r="3.5" fill="#f59e0b"/>
      <!-- Polished Marble Highlight -->
      <polygon points="36,88 44,85 41,92 33,94" fill="#ffffff" opacity="0.9"/>
    </svg>
  `),

  // 2. Hàng rào gỗ nông trang
  d24_rustic_wooden_fence: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <!-- Grass Diamond Base -->
      <polygon points="64,64 128,96 64,128 0,96" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
      <!-- Stone/Pebble patches -->
      <ellipse cx="48" cy="100" rx="4" ry="2" fill="#94a3b8"/>
      <ellipse cx="80" cy="110" rx="5" ry="2.5" fill="#94a3b8"/>
      <!-- Left Post (Post 1) -->
      <polygon points="34,70 42,66 42,102 34,106" fill="#854d0e"/>
      <polygon points="34,70 42,66 38,62 30,66" fill="#a16207"/>
      <!-- Right Post (Post 2) -->
      <polygon points="86,96 94,92 94,124 86,128" fill="#854d0e"/>
      <polygon points="86,96 94,92 90,88 82,92" fill="#a16207"/>
      <!-- Center Post (Post 3) -->
      <polygon points="60,82 68,78 68,114 60,118" fill="#78350f"/>
      <polygon points="60,82 68,78 64,74 56,78" fill="#92400e"/>
      <!-- Top Rail -->
      <polygon points="36,75 92,101 92,106 36,80" fill="#b45309" stroke="#713f12" stroke-width="0.8"/>
      <!-- Bottom Rail -->
      <polygon points="36,87 92,113 92,118 36,92" fill="#b45309" stroke="#713f12" stroke-width="0.8"/>
      <!-- Daisies near post -->
      <circle cx="30" cy="108" r="2.5" fill="#ffffff"/>
      <circle cx="30" cy="108" r="1" fill="#f59e0b"/>
      <circle cx="96" cy="122" r="2.5" fill="#f43f5e"/>
    </svg>
  `),

  // 3. Luống hoa tulip nở rộ
  d25_tulip_flowerbed: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <!-- Grass Diamond -->
      <polygon points="64,64 128,96 64,128 0,96" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
      <!-- Dark Loam Soil Bed -->
      <polygon points="64,68 120,96 64,124 8,96" fill="#58351e" stroke="#3d2212" stroke-width="2"/>
      <polygon points="64,72 112,96 64,120 16,96" fill="#713f12"/>
      <!-- Green Leaves & Foliage -->
      <ellipse cx="64" cy="96" rx="34" ry="16" fill="#15803d"/>
      <ellipse cx="64" cy="96" rx="28" ry="12" fill="#16a34a"/>
      <!-- Red Tulips -->
      <circle cx="64" cy="90" r="5" fill="#e11d48"/>
      <polygon points="64,83 60,90 68,90" fill="#be123c"/>
      <circle cx="46" cy="96" r="4.5" fill="#f43f5e"/>
      <polygon points="46,89 42,96 50,96" fill="#be123c"/>
      <circle cx="82" cy="96" r="4.5" fill="#f43f5e"/>
      <polygon points="82,89 78,96 86,96" fill="#be123c"/>
      <!-- Golden Yellow Tulips -->
      <circle cx="55" cy="102" r="4.5" fill="#fbbf24"/>
      <polygon points="55,95 51,102 59,102" fill="#f59e0b"/>
      <circle cx="73" cy="102" r="4.5" fill="#fbbf24"/>
      <polygon points="73,95 69,102 77,102" fill="#f59e0b"/>
      <!-- Purple Tulip in Center -->
      <circle cx="64" cy="100" r="4.5" fill="#c026d3"/>
    </svg>
  `),

  // 4. Tượng hiệp sĩ cưỡi ngựa bằng đá hoa cương
  d26_marble_lion_statue: "/assets/decorations/knight_statue.png",

  // 5. Cột cờ hiệu hoàng triều
  d27_royal_banner_flag: encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
      <!-- Grass Diamond Base -->
      <polygon points="64,64 128,96 64,128 0,96" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
      <!-- Cobblestone Ring Foundation -->
      <ellipse cx="64" cy="98" rx="16" ry="8" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
      <ellipse cx="64" cy="96" rx="12" ry="6" fill="#94a3b8"/>
      <!-- Stone Pedestal -->
      <polygon points="58,92 70,92 68,98 56,98" fill="#cbd5e1"/>
      <!-- Tall Brass Flagpole -->
      <line x1="64" y1="94" x2="64" y2="18" stroke="#d97706" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="63" y1="94" x2="63" y2="18" stroke="#fef08a" stroke-width="1.2"/>
      <circle cx="64" cy="16" r="4" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/>
      <!-- Royal Swallowtail Pennant Flag (Crimson with Gold Border) -->
      <polygon points="64,22 110,34 96,46 110,58 64,52" fill="#dc2626" stroke="#f59e0b" stroke-width="1.8"/>
      <!-- Gold Crest inside flag -->
      <circle cx="82" cy="40" r="5.5" fill="#fef08a" stroke="#d97706" stroke-width="1"/>
      <polygon points="79,41 85,41 84,37 82,39 80,37" fill="#b45309"/>
    </svg>
  `),

  // 6. Cây Táo Đỏ 3 Giai Đoạn Pixel Art
  d21_apple_tree: "/assets/trees/apple_tree_ripe.png",

  // 7. Cây Dừa Xiêm 3 Giai Đoạn Pixel Art
  d22_coconut_palm: "/assets/trees/coconut_palm_ripe.png",

  // 8. Cây Me Chua Ngọt 3 Giai Đoạn Pixel Art
  d23_tamarind_tree: "/assets/trees/tamarind_tree_ripe.png"
};
