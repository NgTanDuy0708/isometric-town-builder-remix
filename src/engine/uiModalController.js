import { QUESTS_CONFIG, QUEST_CHAPTERS, isQuestUnlocked } from "../data/questsData.js";
import { ACHIEVEMENTS_CONFIG } from "../data/achievementsConfig.js";
import { RESOURCES_CONFIG, RESOURCE_MAX_CAPACITY, SILO_RESOURCE_IDS } from "../data/resourcesConfig.js";
import { claimQuestRewards } from './questRewards.js';
import { CROPS_CONFIG } from "../data/cropsConfig.js";
import { CROP_PIXEL_SPRITES } from "../data/cropSprites.js";
import { calculateVillageStats, INITIAL_GOLD } from "../data/gameEconomy.js";
import { INITIAL_UNLOCKED_CHUNKS } from "../data/landConfig.js";
import { exportGameToJSON, importGameFromJSON } from "./storage.js";
import { DEV_FULL_VILLAGE_SAVE } from "../data/devSaveData.js";
import { dayNightWeather, WEATHER_TYPES, TIME_PERIODS } from "./dayNightWeather.js";
import {
  initAudio, toggleMute, setMasterVolume, setBgmVolume, setSfxVolume, getAudioState,
  playCoinSound, playBuildSound, playDemolishSound, playUIClickSound,
  playPlantSeedSound, playMarketSellSound, playCoinFlyHitSound,
  playModalOpenSound, playModalCloseSound, playErrorSound, playRainSound,
  playWatermillSound, playQuestRewardSound, startBGM, stopBGM
} from "./audioEngine.js";

let toastTimeout = null;

/**
 * Hiển thị thông báo Toast góc màn hình
 * @param {string} message - Nội dung thông báo
 * @param {"info"|"success"|"warning"|"error"} type - Loại thông báo
 */
export function showToast(message, type = "info") {
  const toastEl = document.getElementById("game-toast");
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.className = "game-toast visible " + type;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.className = "game-toast";
  }, 2500);
}

/**
 * Khởi tạo Bộ điều khiển tất cả các Modal giao diện (UI Modal Controller)
 * Bao gồm: Sổ Nhiệm Vụ, Chợ Nông Sản, Túi Hạt Giống, Cài Đặt Âm Thanh/Thời Tiết, Snapshot Chụp Ảnh, Xuất/Nhập JSON.
 *
 * @param {Object} ctx - Ngữ cảnh engine
 */
export function createUIModalController(ctx) {
  const abortController = new AbortController();
  const { signal } = abortController;

  // =========================================================================
  // 1. SỔ NHIỆM VỤ (QUEST MODAL)
  // =========================================================================
  const questModal = document.getElementById("quest-modal");
  const questModalClose = document.getElementById("quest-modal-close");
  const questModalDismiss = document.getElementById("quest-modal-dismiss-btn");
  const questBookBtn = document.getElementById("quest-book-btn");
  const questListContainer = document.getElementById("quest-list-container");
  let activeQuestFilter = "active"; // "active" | "all" | "claimed"

  function openQuestModal() {
    if (!questModal) return;
    playModalOpenSound();
    renderQuestList();
    questModal.classList.add("open");
    setTimeout(() => {
      if (questListContainer) {
        const firstReady = questListContainer.querySelector('[data-quest-ready="true"]') || questListContainer.firstElementChild;
        if (firstReady && typeof firstReady.scrollIntoView === 'function') {
          firstReady.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 60);
  }

  function closeQuestModal() {
    if (questModal) {
      playModalCloseSound();
      questModal.classList.remove("open");
    }
  }

  if (questBookBtn) questBookBtn.addEventListener("click", openQuestModal, { signal });
  if (questModalClose) questModalClose.addEventListener("click", closeQuestModal, { signal });
  if (questModalDismiss) questModalDismiss.addEventListener("click", closeQuestModal, { signal });
  if (questModal) {
    questModal.addEventListener("click", function(e) {
      if (e.target === questModal) closeQuestModal();
    }, { signal });
  }

  // Hook Quest Category Filter Tabs
  const questFilterBtns = document.querySelectorAll(".quest-filter-btn");
  questFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      questFilterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeQuestFilter = btn.getAttribute("data-quest-filter") || "active";
      renderQuestList();
    }, { signal });
  });

  function createQuestCard(q, isClaimed, isUnlocked, currentProg, isReady, pct, questsClaimed, stats) {
    const item = document.createElement("div");
    item.className = "quest-item-card" + (isClaimed ? " claimed" : (isReady ? " ready" : (!isUnlocked ? " locked" : "")));
    if (isReady) item.setAttribute("data-quest-ready", "true");

    const iconBadge = document.createElement("div");
    iconBadge.className = "quest-icon-badge";
    iconBadge.textContent = isUnlocked ? q.icon : "🔒";
    item.appendChild(iconBadge);

    const infoCol = document.createElement("div");
    infoCol.className = "quest-info";

    const titleRow = document.createElement("div");
    titleRow.className = "quest-title-row";
    const title = document.createElement("span");
    title.className = "quest-item-title";
    title.textContent = q.title;
    titleRow.appendChild(title);
    infoCol.appendChild(titleRow);

    const desc = document.createElement("div");
    desc.className = "quest-item-desc";
    desc.textContent = q.desc;
    infoCol.appendChild(desc);

    const progWrap = document.createElement("div");
    progWrap.className = "quest-progress-wrap";
    const progBarBg = document.createElement("div");
    progBarBg.className = "quest-progress-bar-bg";
    const progBarFill = document.createElement("div");
    progBarFill.className = "quest-progress-bar-fill" + (isReady ? " ready" : "");
    progBarFill.style.width = pct + "%";
    progBarBg.appendChild(progBarFill);
    progWrap.appendChild(progBarBg);

    const progText = document.createElement("span");
    progText.className = "quest-progress-text";
    progText.textContent = `${currentProg} / ${q.target}`;
    progWrap.appendChild(progText);

    infoCol.appendChild(progWrap);
    item.appendChild(infoCol);

    const actionCol = document.createElement("div");
    actionCol.className = "quest-action-col";

    const rewardRow = document.createElement("div");
    rewardRow.className = "quest-reward-pill-row";

    if (q.rewardGold) {
      const goldPill = document.createElement("span");
      goldPill.className = "quest-reward-pill";
      goldPill.textContent = `+${q.rewardGold}🪙`;
      rewardRow.appendChild(goldPill);
    }

    if (q.rewardXP) {
      const xpPill = document.createElement("span");
      xpPill.className = "quest-reward-pill";
      xpPill.style.background = "#f0fdf4";
      xpPill.style.borderColor = "#86efac";
      xpPill.style.color = "#15803d";
      xpPill.textContent = `+${q.rewardXP}⭐`;
      rewardRow.appendChild(xpPill);
    }

    for (const [id, qty] of Object.entries(q.rewardResources || {})) {
      const pill = document.createElement('span');
      pill.className = 'quest-reward-pill';
      pill.textContent = `+${qty} ${RESOURCES_CONFIG[id]?.icon || '📦'}`;
      rewardRow.appendChild(pill);
    }

    if (isClaimed) {
      const claimedBadge = document.createElement("span");
      claimedBadge.className = "quest-claimed-badge";
      claimedBadge.textContent = "✓ Đã nhận";
      actionCol.appendChild(claimedBadge);
    } else if (isReady) {
      const claimBtn = document.createElement("button");
      claimBtn.type = "button";
      claimBtn.className = "quest-claim-btn";
      claimBtn.textContent = `🎁 Nhận thưởng`;
      claimBtn.addEventListener("click", () => {
        if (!claimQuestRewards(ctx, q, questsClaimed)) return;
        const xpGain = q.rewardXP ?? 50;
        playQuestRewardSound();
        ctx.updateGoldDisplay();
        ctx.saveGameEconomyState();
        ctx.saveQuestsState();
        ctx.persistGameState();
        showToast(`🎉 Nhận thưởng từ nhiệm vụ "${q.title}" (+${q.rewardGold || 0}🪙, +${xpGain}XP)!`, "success");
        ctx.checkQuestsProgress(true);
        renderQuestList();
      });
      actionCol.appendChild(claimBtn);
      actionCol.appendChild(rewardRow);
    } else {
      actionCol.appendChild(rewardRow);
    }

    item.appendChild(actionCol);
    return item;
  }

  function renderQuestList() {
    if (!questListContainer) return;
    const currentGrid = ctx.getCurrentGrid();
    const constructions = ctx.getConstructions();
    const tileMap = ctx.getTileMap();
    const buildingLevels = ctx.getBuildingLevels();
    const questsClaimed = ctx.getQuestsClaimed();

    const stats = calculateVillageStats(currentGrid, constructions, tileMap, buildingLevels);
    questListContainer.innerHTML = "";

    let readyCount = 0;
    let inProgressCount = 0;
    let claimedCount = 0;

    const questDataList = QUESTS_CONFIG.map(q => {
      const isClaimed = !!questsClaimed[q.id];
      const isUnlocked = isQuestUnlocked(q, questsClaimed);
      const currentProg = Math.min(ctx.getQuestCurrentProgress(q, stats), q.target);
      const isReady = isUnlocked && currentProg >= q.target && !isClaimed;
      const pct = Math.min(100, Math.round((currentProg / q.target) * 100));

      if (isClaimed) claimedCount++;
      else if (isReady) readyCount++;
      else if (isUnlocked) inProgressCount++;

      return {
        q,
        isClaimed,
        isUnlocked,
        currentProg,
        isReady,
        pct
      };
    });

    const activeCount = readyCount + inProgressCount;
    const totalCount = QUESTS_CONFIG.length;

    // Update Tab Badges & Summary
    const badgeActive = document.getElementById("quest-filter-badge-active");
    if (badgeActive) badgeActive.textContent = activeCount.toString();
    const badgeAll = document.getElementById("quest-filter-badge-all");
    if (badgeAll) badgeAll.textContent = totalCount.toString();
    const badgeClaimed = document.getElementById("quest-filter-badge-claimed");
    if (badgeClaimed) badgeClaimed.textContent = claimedCount.toString();

    const questSummary = document.getElementById("quest-progress-summary");
    if (questSummary) {
      questSummary.textContent = `Đã hoàn thành: ${claimedCount} / ${totalCount} nhiệm vụ (${Math.round((claimedCount / totalCount) * 100)}%)`;
    }

    // 1. Chế độ Xem "Đang Làm & Chờ Nhận" (Default - Tối ưu UX theo yêu cầu của Duy)
    if (activeQuestFilter === "active") {
      const activeList = questDataList.filter(d => !d.isClaimed && d.isUnlocked);
      // Sắp xếp: Sẵn sàng nhận thưởng lên ĐẦU, tiếp đến là tiến độ cao nhất
      activeList.sort((a, b) => {
        if (a.isReady && !b.isReady) return -1;
        if (!a.isReady && b.isReady) return 1;
        return b.pct - a.pct;
      });

      if (activeList.length === 0) {
        const empty = document.createElement("div");
        empty.className = "quest-empty-state";
        empty.innerHTML = `
          <div class="quest-empty-state-icon">👑</div>
          <div style="font-weight: 700; color: #44403c; margin-bottom: 4px;">Toàn Bộ Nhiệm Vụ Đã Xong!</div>
          <div>Tuyệt vời! Bạn đã hoàn thành tất cả nhiệm vụ hiện có.<br/>Hãy mở khóa thêm lãnh thổ hoặc nâng cấp công trình để tiếp tục.</div>
        `;
        questListContainer.appendChild(empty);
      } else {
        activeList.forEach(d => {
          const card = createQuestCard(d.q, d.isClaimed, d.isUnlocked, d.currentProg, d.isReady, d.pct, questsClaimed, stats);
          questListContainer.appendChild(card);
        });
      }
      return;
    }

    // 2. Chế độ Xem "Đã Xong" (Lịch sử đã hoàn thành, mờ nhẹ)
    if (activeQuestFilter === "claimed") {
      const claimedList = questDataList.filter(d => d.isClaimed);
      if (claimedList.length === 0) {
        const empty = document.createElement("div");
        empty.className = "quest-empty-state";
        empty.innerHTML = `
          <div class="quest-empty-state-icon">🌱</div>
          <div style="font-weight: 700; color: #44403c; margin-bottom: 4px;">Chưa Có Nhiệm Vụ Đã Hoàn Thành</div>
          <div>Hãy chuyển sang tab "Đang Làm" để bắt đầu nhận các nhiệm vụ đầu tiên!</div>
        `;
        questListContainer.appendChild(empty);
      } else {
        claimedList.forEach(d => {
          const card = createQuestCard(d.q, d.isClaimed, d.isUnlocked, d.currentProg, d.isReady, d.pct, questsClaimed, stats);
          questListContainer.appendChild(card);
        });
      }
      return;
    }

    // 3. Chế độ Xem "Theo Chương" (Toàn bộ, sắp xếp đưa quest xong xuống dưới mờ đi)
    QUEST_CHAPTERS.forEach(chap => {
      const chapQuests = questDataList.filter(d => d.q.chapter === chap.id);
      if (chapQuests.length === 0) return;

      const chapHeader = document.createElement("div");
      chapHeader.className = "quest-chapter-header";

      const chapTitle = document.createElement("span");
      chapTitle.textContent = chap.title;
      chapHeader.appendChild(chapTitle);

      const chapDesc = document.createElement("span");
      chapDesc.className = "quest-chapter-subtitle";
      const chapDone = chapQuests.filter(d => d.isClaimed).length;
      chapDesc.textContent = `${chapDone} / ${chapQuests.length} hoàn thành`;
      chapHeader.appendChild(chapDesc);

      questListContainer.appendChild(chapHeader);

      // Sắp xếp trong chương: Ready trước, sau đó In-Progress, sau đó Claimed ở cuối
      const sortedInChap = [...chapQuests].sort((a, b) => {
        if (a.isClaimed && !b.isClaimed) return 1;
        if (!a.isClaimed && b.isClaimed) return -1;
        if (a.isReady && !b.isReady) return -1;
        if (!a.isReady && b.isReady) return 1;
        return b.pct - a.pct;
      });

      sortedInChap.forEach(d => {
        const card = createQuestCard(d.q, d.isClaimed, d.isUnlocked, d.currentProg, d.isReady, d.pct, questsClaimed, stats);
        questListContainer.appendChild(card);
      });
    });
  }

  // =========================================================================
  // 1B. ĐẠI SẢNH THÀNH TỰU (ACHIEVEMENTS MODAL - TÒA THỊ CHÍNH)
  // =========================================================================
  const achievementsModal = document.getElementById("achievements-modal");
  const achievementsModalClose = document.getElementById("achievements-modal-close");
  const achievementsModalDismiss = document.getElementById("achievements-modal-dismiss-btn");
  const achievementsListContainer = document.getElementById("achievements-list-container");
  const achievementsProgressSummary = document.getElementById("achievements-progress-summary");

  const ACHIEVEMENTS_STORAGE_KEY = "town_builder_achievements_claimed_v1";
  function loadClaimedAchievements() {
    try {
      const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveClaimedAchievements(data) {
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save achievements", e);
    }
  }

  const claimedAchievements = loadClaimedAchievements();

  function resetAchievements() {
    for (const k of Object.keys(claimedAchievements)) {
      delete claimedAchievements[k];
    }
    try {
      localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
    } catch {}
    if (achievementsModal && achievementsModal.classList.contains("open")) {
      renderAchievementsList();
    }
  }

  function getClaimedAchievements() {
    return { ...claimedAchievements };
  }

  function setClaimedAchievements(data) {
    for (const k of Object.keys(claimedAchievements)) {
      delete claimedAchievements[k];
    }
    if (data && typeof data === "object") {
      Object.assign(claimedAchievements, data);
    }
    saveClaimedAchievements(claimedAchievements);
  }

  function getAchievementState() {
    const currentGrid = ctx.getCurrentGrid();
    const constructions = ctx.getConstructions();
    const tileMap = ctx.getTileMap();
    const buildingLevels = ctx.getBuildingLevels();
    const stats = calculateVillageStats(currentGrid, constructions, tileMap, buildingLevels);

    let hasTownHall = false;
    let townHallLevel = 1;
    for (let r = 0; r < currentGrid.length; r++) {
      for (let c = 0; c < currentGrid[r].length; c++) {
        if (currentGrid[r][c] === "b14_town_hall" && !constructions[`${r}_${c}`]) {
          hasTownHall = true;
          townHallLevel = (buildingLevels && buildingLevels[`${r}_${c}`]) ? buildingLevels[`${r}_${c}`] : 1;
          break;
        }
      }
      if (hasTownHall) break;
    }

    return {
      harvestsCount: ctx.getHarvestsCount ? ctx.getHarvestsCount() : 0,
      playerGold: ctx.getPlayerGold ? ctx.getPlayerGold() : 0,
      playerLevel: ctx.getPlayerLevel ? ctx.getPlayerLevel() : 1,
      population: stats.population || 0,
      resources: ctx.getPlayerResources ? ctx.getPlayerResources() : {},
      unlockedChunksCount: (ctx.getLandUnlockedChunks ? ctx.getLandUnlockedChunks().length : 16),
      hasTownHall,
      townHallLevel,
      orderBoard: ctx.getOrderBoardManager ? ctx.getOrderBoardManager()?.getSaveState?.() : null
    };
  }

  function hasClaimableAchievements() {
    const state = getAchievementState();
    return ACHIEVEMENTS_CONFIG.some(ach => {
      if (claimedAchievements[ach.id]) return false;
      return ach.getProgress(state) >= ach.target;
    });
  }

  function openAchievementsModal() {
    if (!achievementsModal) return;
    playModalOpenSound();
    renderAchievementsList();
    achievementsModal.classList.add("open");
  }

  function closeAchievementsModal() {
    if (achievementsModal) {
      playModalCloseSound();
      achievementsModal.classList.remove("open");
    }
  }

  if (achievementsModalClose) achievementsModalClose.addEventListener("click", closeAchievementsModal, { signal });
  if (achievementsModalDismiss) achievementsModalDismiss.addEventListener("click", closeAchievementsModal, { signal });
  if (achievementsModal) {
    achievementsModal.addEventListener("click", function(e) {
      if (e.target === achievementsModal) closeAchievementsModal();
    }, { signal });
  }

  function renderAchievementsList() {
    if (!achievementsListContainer) return;
    achievementsListContainer.innerHTML = "";

    const state = getAchievementState();

    let claimedCount = 0;
    let readyCount = 0;

    const cardsData = ACHIEVEMENTS_CONFIG.map(ach => {
      const isClaimed = !!claimedAchievements[ach.id];
      const curProg = Math.min(ach.getProgress(state), ach.target);
      const isReady = curProg >= ach.target && !isClaimed;
      const pct = Math.min(100, Math.round((curProg / ach.target) * 100));

      if (isClaimed) claimedCount++;
      else if (isReady) readyCount++;

      return { ach, isClaimed, curProg, isReady, pct };
    });

    if (achievementsProgressSummary) {
      achievementsProgressSummary.textContent = `Đã chinh phục: ${claimedCount} / ${ACHIEVEMENTS_CONFIG.length} Thành Tựu (${Math.round((claimedCount / ACHIEVEMENTS_CONFIG.length) * 100)}%)`;
    }

    // Sort: Ready first, then in-progress (highest % first), claimed at bottom
    cardsData.sort((a, b) => {
      if (a.isClaimed && !b.isClaimed) return 1;
      if (!a.isClaimed && b.isClaimed) return -1;
      if (a.isReady && !b.isReady) return -1;
      if (!a.isReady && b.isReady) return 1;
      return b.pct - a.pct;
    });

    cardsData.forEach(d => {
      const item = document.createElement("div");
      item.className = "achievements-item-card" + (d.isClaimed ? " claimed" : (d.isReady ? " ready" : ""));

      const iconBadge = document.createElement("div");
      iconBadge.className = "achievements-icon-badge";
      iconBadge.textContent = d.ach.icon;
      item.appendChild(iconBadge);

      const infoCol = document.createElement("div");
      infoCol.className = "achievements-info";

      const titleRow = document.createElement("div");
      titleRow.className = "achievements-title-row";
      const title = document.createElement("span");
      title.className = "achievements-item-title";
      title.textContent = d.ach.title;
      titleRow.appendChild(title);
      infoCol.appendChild(titleRow);

      const desc = document.createElement("div");
      desc.className = "achievements-item-desc";
      desc.textContent = d.ach.desc;
      infoCol.appendChild(desc);

      const progWrap = document.createElement("div");
      progWrap.className = "quest-progress-wrap";
      const progBarBg = document.createElement("div");
      progBarBg.className = "quest-progress-bar-bg";
      const progBarFill = document.createElement("div");
      progBarFill.className = "quest-progress-bar-fill" + (d.isReady ? " ready" : "");
      progBarFill.style.width = d.pct + "%";
      progBarBg.appendChild(progBarFill);
      progWrap.appendChild(progBarBg);

      const progText = document.createElement("span");
      progText.className = "quest-progress-text";
      progText.textContent = `${d.curProg.toLocaleString()} / ${d.ach.target.toLocaleString()}`;
      progWrap.appendChild(progText);

      infoCol.appendChild(progWrap);
      item.appendChild(infoCol);

      const actionCol = document.createElement("div");
      actionCol.className = "achievements-action-col";

      const rewardRow = document.createElement("div");
      rewardRow.className = "quest-reward-pill-row";

      if (d.ach.rewardGold) {
        const goldPill = document.createElement("span");
        goldPill.className = "quest-reward-pill";
        goldPill.textContent = `+${d.ach.rewardGold.toLocaleString()}🪙`;
        rewardRow.appendChild(goldPill);
      }

      if (d.ach.rewardXP) {
        const xpPill = document.createElement("span");
        xpPill.className = "quest-reward-pill";
        xpPill.style.background = "#f0fdf4";
        xpPill.style.borderColor = "#86efac";
        xpPill.style.color = "#15803d";
        xpPill.textContent = `+${d.ach.rewardXP.toLocaleString()}⭐`;
        rewardRow.appendChild(xpPill);
      }

      if (d.isClaimed) {
        const claimedBadge = document.createElement("span");
        claimedBadge.className = "achievements-claimed-badge";
        claimedBadge.textContent = "✓ Đã nhận";
        actionCol.appendChild(claimedBadge);
      } else if (d.isReady) {
        const claimBtn = document.createElement("button");
        claimBtn.type = "button";
        claimBtn.className = "achievements-claim-btn";
        claimBtn.textContent = `🏆 Nhận Huân Chương`;
        claimBtn.addEventListener("click", () => {
          claimedAchievements[d.ach.id] = true;
          saveClaimedAchievements(claimedAchievements);
          ctx.addPlayerGold(d.ach.rewardGold || 0);
          ctx.addPlayerXP(d.ach.rewardXP || 100, d.ach.title);
          playQuestRewardSound();
          ctx.updateGoldDisplay();
          ctx.saveGameEconomyState();
          ctx.persistGameState();
          showToast(`🏆 Chúc mừng! Đã chinh phục "${d.ach.title}" (+${d.ach.rewardGold.toLocaleString()}🪙, +${d.ach.rewardXP.toLocaleString()}XP)!`, "success");
          renderAchievementsList();
        });
        actionCol.appendChild(claimBtn);
        actionCol.appendChild(rewardRow);
      } else {
        actionCol.appendChild(rewardRow);
      }

      item.appendChild(actionCol);
      achievementsListContainer.appendChild(item);
    });
  }

  // =========================================================================
  // 2. CHỢ NÔNG SẢN (MARKET MODAL)
  // =========================================================================
  const marketModal = document.getElementById("market-modal");
  const marketModalClose = document.getElementById("market-modal-close");
  const marketModalDismiss = document.getElementById("market-modal-dismiss-btn");
  const btnOpenMarket = document.getElementById("btn-open-market");
  const hudQuickMarketBtn = document.getElementById("hud-quick-market-btn");
  const marketItemsContainer = document.getElementById("market-items-container");
  const btnSellAllCrops = document.getElementById("btn-market-sell-all-crops");
  const goldBadge = document.getElementById("hud-gold-badge");

  function openMarketModal() {
    if (!marketModal) return;
    playModalOpenSound();
    renderMarketModal();
    marketModal.classList.add("open");
  }

  function closeMarketModal() {
    if (marketModal) {
      playModalCloseSound();
      marketModal.classList.remove("open");
    }
  }

  if (btnOpenMarket) btnOpenMarket.addEventListener("click", openMarketModal, { signal });
  if (hudQuickMarketBtn) hudQuickMarketBtn.addEventListener("click", openMarketModal, { signal });
  if (marketModalClose) marketModalClose.addEventListener("click", closeMarketModal, { signal });
  if (marketModalDismiss) marketModalDismiss.addEventListener("click", closeMarketModal, { signal });
  if (marketModal) {
    marketModal.addEventListener("click", function(e) {
      if (e.target === marketModal) closeMarketModal();
    }, { signal });
  }

  if (btnSellAllCrops) {
    btnSellAllCrops.addEventListener("click", () => {
      let totalGain = 0;
      let soldCount = 0;
      const playerResources = ctx.getPlayerResources();
      const goldMult = ctx.getMarketGoldMultiplier ? ctx.getMarketGoldMultiplier() : 1.0;

      SILO_RESOURCE_IDS.forEach(resId => {
        const qty = playerResources[resId] || 0;
        const cfg = RESOURCES_CONFIG[resId];
        if (qty > 0 && cfg) {
          totalGain += Math.round(qty * cfg.sellPrice * goldMult);
          soldCount += qty;
        }
      });

      if (soldCount === 0) {
        showToast("Trong kho Silo chưa có nông sản ruộng đồng nào để bán!", "info");
        return;
      }

      const confirmSell = window.confirm(
        `🌾 BÁN TOÀN BỘ NÔNG SẢN SILO\n\n` +
        `Bạn có chắc chắn muốn bán ${soldCount.toLocaleString()} nông sản ruộng đồng để nhận ${totalGain.toLocaleString()} 🪙 vàng không?\n\n` +
        `• Lưu ý: Thao tác này chỉ bán nông sản trong kho Silo và không thể hoàn tác!`
      );
      if (!confirmSell) return;

      SILO_RESOURCE_IDS.forEach(resId => {
        playerResources[resId] = 0;
      });

      ctx.addPlayerGold(totalGain);
      playMarketSellSound();
      playCoinFlyHitSound();
      if (goldBadge) {
        goldBadge.classList.remove("coin-bump");
        void goldBadge.offsetWidth;
        goldBadge.classList.add("coin-bump");
      }
      ctx.updateGoldDisplay();
      ctx.updateResourcesUI();
      renderMarketModal();
      ctx.persistGameState();
      if (ctx.onTutorialAction) ctx.onTutorialAction("market_sell");
      showToast(`💰 Đã bán toàn bộ ${soldCount.toLocaleString()} nông sản từ kho Silo, thu về +${totalGain.toLocaleString()} 🪙 vàng!`, "success");
    }, { signal });
  }

  function sellResource(resId, qty) {
    const playerResources = ctx.getPlayerResources();
    const curQty = playerResources[resId] || 0;
    if (curQty < qty || qty <= 0) return;

    const cfg = RESOURCES_CONFIG[resId];
    const goldMult = ctx.getMarketGoldMultiplier ? ctx.getMarketGoldMultiplier() : 1.0;
    const goldGain = Math.round(qty * cfg.sellPrice * goldMult);
    playerResources[resId] -= qty;
    ctx.addPlayerGold(goldGain);

    playMarketSellSound();
    playCoinFlyHitSound();

    if (goldBadge) {
      goldBadge.classList.remove("coin-bump");
      void goldBadge.offsetWidth;
      goldBadge.classList.add("coin-bump");
    }

    ctx.updateGoldDisplay();
    ctx.updateResourcesUI();
    renderMarketModal();
    ctx.persistGameState();
    if (ctx.onTutorialAction) ctx.onTutorialAction("market_sell");

    showToast(`💰 Đã bán ${qty} ${cfg.name}, thu về +${goldGain.toLocaleString()} 🪙!`, "success");
  }

  function renderMarketModal() {
    if (!marketItemsContainer) return;
    marketItemsContainer.innerHTML = "";
    const playerResources = ctx.getPlayerResources();

    const summaryEl = document.getElementById("market-storage-summary");
    if (summaryEl) {
      const warehouseCap = ctx.getWarehouseCapacity ? ctx.getWarehouseCapacity() : 300;
      summaryEl.textContent = `Kho Tổng Hợp: ${warehouseCap} (Hạn mức: ${RESOURCE_MAX_CAPACITY}/loại)`;
    }

    const categories = [
      { key: "crop", title: "🌾 Nông Sản Ruộng Đồng (Thu hoạch từ đất)" },
      { key: "fruit", title: "🍎 Hoa Quả Đồng Cỏ (Táo đỏ, Dừa xiêm, Trái me)" },
      { key: "livestock", title: "🐑 Chăn Nuôi Chuồng Trại (Trứng gà, Sữa tươi, Lông cừu)" },
      { key: "crafted", title: "🧵 Hàng Hóa Chế Tác & Xưởng Dệt (Vải dệt, Bánh mì, Dụng cụ, Rượu vang)" }
    ];

    categories.forEach(cat => {
      const catEntries = Object.entries(RESOURCES_CONFIG).filter(([_, cfg]) => cfg.category === cat.key);
      if (catEntries.length === 0) return;

      const catTitle = document.createElement("div");
      catTitle.className = "market-category-title";
      catTitle.textContent = cat.title;
      marketItemsContainer.appendChild(catTitle);

      catEntries.forEach(([resKey, cfg]) => {
        const curQty = playerResources[resKey] || 0;
        const maxCap = cfg.maxCapacity || RESOURCE_MAX_CAPACITY;
        const pct = Math.min(100, Math.round((curQty / maxCap) * 100));

        const item = document.createElement("div");
        item.className = "market-item-card";

        const iconBadge = document.createElement("div");
        iconBadge.className = "market-icon-badge";
        const iconSrc = CROP_PIXEL_SPRITES['icon_' + resKey];
        if (iconSrc) {
          iconBadge.innerHTML = `<img src="${iconSrc}" class="market-item-pixel-img" alt="${cfg.name}">`;
        } else {
          iconBadge.textContent = cfg.icon;
        }
        item.appendChild(iconBadge);

        const infoCol = document.createElement("div");
        infoCol.className = "market-info";

        const titleRow = document.createElement("div");
        titleRow.className = "market-title-row";
        const title = document.createElement("span");
        title.className = "market-item-title";
        title.textContent = `${cfg.name} (${cfg.unitName})`;
        titleRow.appendChild(title);

        const goldMult = ctx.getMarketGoldMultiplier ? ctx.getMarketGoldMultiplier() : 1.0;
        const effectivePrice = Math.round(cfg.sellPrice * goldMult);

        const priceTag = document.createElement("span");
        priceTag.className = "market-item-price-tag";
        priceTag.textContent = goldMult > 1 
          ? `Giá: +${effectivePrice} 🪙 (${cfg.sellPrice} x ${goldMult}) 🔥` 
          : `Giá: +${cfg.sellPrice} 🪙 / ${cfg.unitName}`;
        titleRow.appendChild(priceTag);

        infoCol.appendChild(titleRow);

        const desc = document.createElement("div");
        desc.className = "market-item-desc";
        desc.textContent = cfg.desc;
        infoCol.appendChild(desc);

        const progWrap = document.createElement("div");
        progWrap.className = "market-progress-wrap";
        const progBarBg = document.createElement("div");
        progBarBg.className = "market-progress-bar-bg";
        const progBarFill = document.createElement("div");
        progBarFill.className = "market-progress-bar-fill" + (curQty >= maxCap ? " full" : "");
        progBarFill.style.width = pct + "%";
        progBarBg.appendChild(progBarFill);
        progWrap.appendChild(progBarBg);

        const progText = document.createElement("span");
        progText.className = "market-progress-text";
        progText.textContent = `Trong kho: ${curQty} / ${maxCap} ${cfg.unitName}`;
        progWrap.appendChild(progText);

        infoCol.appendChild(progWrap);
        item.appendChild(infoCol);

        const actionCol = document.createElement("div");
        actionCol.className = "market-action-col";

        const btn1 = document.createElement("button");
        btn1.type = "button";
        btn1.className = "market-sell-btn" + (curQty < 1 ? " disabled" : "");
        btn1.textContent = `Bán 1 (+${effectivePrice}🪙)`;
        btn1.addEventListener("click", () => sellResource(resKey, 1));
        actionCol.appendChild(btn1);

        if (curQty >= 5) {
          const btn5 = document.createElement("button");
          btn5.type = "button";
          btn5.className = "market-sell-btn secondary";
          btn5.textContent = `Bán 5 (+${effectivePrice * 5}🪙)`;
          btn5.addEventListener("click", () => sellResource(resKey, 5));
          actionCol.appendChild(btn5);
        }

        if (curQty > 1) {
          const btnAll = document.createElement("button");
          btnAll.type = "button";
          btnAll.className = "market-sell-btn max";
          btnAll.textContent = `Bán hết ${curQty} (+${effectivePrice * curQty}🪙)`;
          btnAll.addEventListener("click", () => sellResource(resKey, curQty));
          actionCol.appendChild(btnAll);
        }

        item.appendChild(actionCol);
        marketItemsContainer.appendChild(item);
      });
    });
  }

  // =========================================================================
  // 3. TÚI HẠT GIỐNG NÔNG TRẠI (SEED MODAL)
  // =========================================================================
  const seedModal = document.getElementById("seed-modal");
  const seedModalClose = document.getElementById("seed-modal-close");
  const seedModalDismiss = document.getElementById("seed-modal-dismiss-btn");
  const seedItemsContainer = document.getElementById("seed-items-container");

  function openSeedModal(row, col) {
    if (!seedModal) return;
    ctx.setActiveFarmlandCell({ row, col });
    playModalOpenSound();
    renderSeedModal();
    seedModal.classList.add("open");
    if (seedItemsContainer) seedItemsContainer.scrollTop = 0;
    const card = seedModal.querySelector(".seed-modal-card");
    if (card) card.scrollTop = 0;
  }

  function closeSeedModal() {
    if (seedModal) {
      playModalCloseSound();
      seedModal.classList.remove("open");
    }
    ctx.setActiveFarmlandCell(null);
  }

  if (seedModalClose) seedModalClose.addEventListener("click", closeSeedModal, { signal });
  if (seedModalDismiss) seedModalDismiss.addEventListener("click", closeSeedModal, { signal });
  if (seedModal) {
    seedModal.addEventListener("click", (e) => {
      if (e.target === seedModal) closeSeedModal();
    }, { signal });
  }

  function renderSeedModal() {
    if (!seedItemsContainer) return;
    seedItemsContainer.innerHTML = "";
    const playerLevel = ctx.getPlayerLevel();
    const playerGold = ctx.getPlayerGold();

    Object.values(CROPS_CONFIG).forEach(crop => {
      const reqLvl = crop.requiredLevel || 1;
      const isLocked = reqLvl > playerLevel;
      const canAfford = playerGold >= crop.seedCost;

      const card = document.createElement("div");
      card.className = "seed-card" + (isLocked ? " locked-seed" : "");

      const iconSrc = CROP_PIXEL_SPRITES['icon_' + crop.id];
      const iconEl = iconSrc
        ? `<img src="${iconSrc}" class="seed-pixel-icon" alt="${crop.name}" style="width: 32px; height: 32px; image-rendering: pixelated; object-fit: contain;">`
        : `<span style="font-size: 1.8rem;">${crop.icon}</span>`;

      let btnText = `Gieo (${crop.seedCost}🪙)`;
      if (isLocked) btnText = `🔒 Cần Cấp ${reqLvl}`;
      else if (!canAfford) btnText = 'Thiếu vàng';

      card.innerHTML = `
        ${isLocked ? `<div class="locked-badge-overlay">🔒 Cần Cấp ${reqLvl}</div>` : ''}
        <div class="seed-card-left">
          <div class="seed-icon">${iconEl}</div>
          <div>
            <div class="seed-name">${crop.name} ${reqLvl > 1 ? `<span style="font-size:0.7rem; color:${isLocked ? '#dc2626' : '#16a34a'}; font-weight:700;">(Lv.${reqLvl})</span>` : ''}</div>
            <div class="seed-desc">${crop.desc}</div>
          </div>
        </div>
        <button type="button" class="seed-btn-sow ${(!canAfford || isLocked) ? 'disabled' : ''}">
          ${btnText}
        </button>
      `;

      const plantBtn = card.querySelector(".seed-btn-sow");
      if (plantBtn) {
        plantBtn.addEventListener("click", () => {
          if (isLocked) {
            playErrorSound();
            showToast(`🔒 Bạn cần đạt Cấp ${reqLvl} để gieo hạt ${crop.name}!`, "error");
            return;
          }
          if (ctx.getPlayerGold() < crop.seedCost) {
            playErrorSound();
            showToast("⚠️ Không đủ vàng mua hạt giống!", "error");
            return;
          }

          const cell = ctx.getActiveFarmlandCell();
          if (cell) {
            ctx.deductGold(crop.seedCost);
            playPlantSeedSound();
            ctx.addPlayerXP(1, `Gieo ${crop.name}`);
            ctx.updateGoldDisplay();

            const farmlandState = ctx.getFarmlandState();
            const farmKey = `${cell.row}_${cell.col}`;
            farmlandState[farmKey] = {
              seedId: crop.id,
              plantTime: Date.now(),
              growDurationMs: crop.growTimeSec * 1000
            };
            ctx.persistGameState();
            if (ctx.onTutorialAction) ctx.onTutorialAction("plant_seed", { seedId: crop.id });
          }

          ctx.activateBulkSeedBrush(crop);
          closeSeedModal();
          ctx.requestRender();
        });
      }

      seedItemsContainer.appendChild(card);
    });
  }

  // =========================================================================
  // 4. CÀI ĐẶT HỆ THỐNG & ÂM THANH (SETTINGS MODAL)
  // =========================================================================
  const settingsModal = document.getElementById("settings-modal");
  const settingsModalClose = document.getElementById("settings-modal-close");
  const settingsModalDismiss = document.getElementById("settings-modal-dismiss-btn");
  const btnOpenSettings = document.getElementById("btn-open-settings");

  function openSettingsModal() {
    if (!settingsModal) return;
    playModalOpenSound();
    updateSettingsModalUI();
    settingsModal.classList.add("open");
  }

  function closeSettingsModal() {
    if (settingsModal) {
      playModalCloseSound();
      settingsModal.classList.remove("open");
    }
  }

  if (btnOpenSettings) btnOpenSettings.addEventListener("click", openSettingsModal, { signal });
  if (settingsModalClose) settingsModalClose.addEventListener("click", closeSettingsModal, { signal });
  if (settingsModalDismiss) settingsModalDismiss.addEventListener("click", closeSettingsModal, { signal });
  if (settingsModal) {
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) closeSettingsModal();
    }, { signal });
  }

  function updateSettingsModalUI() {
    const aState = getAudioState();
    const bgmBtn = document.getElementById("setting-bgm-toggle");
    const bgmVol = /** @type {HTMLInputElement|null} */ (document.getElementById("setting-bgm-vol"));
    const sfxBtn = document.getElementById("setting-sfx-toggle");
    const sfxVol = /** @type {HTMLInputElement|null} */ (document.getElementById("setting-sfx-vol"));

    if (bgmBtn) {
      bgmBtn.textContent = aState.isBgmPlaying ? "Bật" : "Tắt";
      bgmBtn.className = "settings-toggle-btn " + (aState.isBgmPlaying ? "active" : "");
    }
    if (bgmVol) bgmVol.value = String(Math.round(aState.bgmVolume * 100));

    if (sfxBtn) {
      sfxBtn.textContent = !aState.isMuted ? "Bật" : "Tắt";
      sfxBtn.className = "settings-toggle-btn " + (!aState.isMuted ? "active" : "");
    }
    if (sfxVol) sfxVol.value = String(Math.round(aState.sfxVolume * 100));

    document.querySelectorAll("#settings-weather-buttons .settings-choice-btn").forEach(btn => {
      const w = btn.getAttribute("data-w");
      btn.classList.toggle("active", dayNightWeather.weather === w);
    });

    const curPeriod = dayNightWeather.getCurrentPeriod();
    document.querySelectorAll("#settings-time-buttons .settings-choice-btn").forEach(btn => {
      const t = btn.getAttribute("data-t");
      btn.classList.toggle("active", curPeriod === t);
    });

    const autoBtn = document.getElementById("setting-auto-cycle-toggle");
    if (autoBtn) {
      autoBtn.textContent = dayNightWeather.isAutoCycle ? "Đang Bật" : "Đang Tắt";
      autoBtn.className = "settings-toggle-btn " + (dayNightWeather.isAutoCycle ? "active" : "");
    }
  }

  const bgmToggle = document.getElementById("setting-bgm-toggle");
  if (bgmToggle) {
    bgmToggle.addEventListener("click", () => {
      playUIClickSound();
      const aState = getAudioState();
      if (aState.isBgmPlaying) stopBGM();
      else startBGM();
      updateSettingsModalUI();
    }, { signal });
  }

  const bgmVolSlider = document.getElementById("setting-bgm-vol");
  if (bgmVolSlider) {
    bgmVolSlider.addEventListener("input", (e) => {
      setBgmVolume(parseFloat(e.target.value) / 100);
    }, { signal });
  }

  const sfxToggle = document.getElementById("setting-sfx-toggle");
  if (sfxToggle) {
    sfxToggle.addEventListener("click", () => {
      playUIClickSound();
      toggleMute();
      updateSettingsModalUI();
    }, { signal });
  }

  const sfxVolSlider = document.getElementById("setting-sfx-vol");
  if (sfxVolSlider) {
    sfxVolSlider.addEventListener("input", (e) => {
      setSfxVolume(parseFloat(e.target.value) / 100);
    }, { signal });
  }

  document.querySelectorAll("#settings-weather-buttons .settings-choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      playUIClickSound();
      const w = btn.getAttribute("data-w");
      dayNightWeather.setWeather(w);
      if (w === WEATHER_TYPES.RAIN) playRainSound();
      else if (w === WEATHER_TYPES.MIST) playWatermillSound();
      updateSettingsModalUI();
      ctx.requestRender();
    }, { signal });
  });

  document.querySelectorAll("#settings-time-buttons .settings-choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      playUIClickSound();
      const t = btn.getAttribute("data-t");
      dayNightWeather.setTimePeriod(t);
      updateSettingsModalUI();
      ctx.requestRender();
    }, { signal });
  });

  const autoCycleToggle = document.getElementById("setting-auto-cycle-toggle");
  if (autoCycleToggle) {
    autoCycleToggle.addEventListener("click", () => {
      playUIClickSound();
      dayNightWeather.setAutoCycle(!dayNightWeather.isAutoCycle);
      updateSettingsModalUI();
    }, { signal });
  }

  const btnReplayTutorial = document.getElementById("btn-replay-tutorial");
  if (btnReplayTutorial) {
    btnReplayTutorial.addEventListener("click", () => {
      closeSettingsModal();
      if (ctx.onReplayTutorial) ctx.onReplayTutorial();
    }, { signal });
  }

  // Kích hoạt thủ công Sự kiện ngẫu nhiên trong Cài Đặt để kiểm thử
  const btnTriggerFair = document.getElementById("btn-trigger-event-fair");
  if (btnTriggerFair) {
    btnTriggerFair.addEventListener("click", () => {
      closeSettingsModal();
      if (ctx.triggerTownEvent) ctx.triggerTownEvent("village_fair");
    }, { signal });
  }

  const btnTriggerCaravan = document.getElementById("btn-trigger-event-caravan");
  if (btnTriggerCaravan) {
    btnTriggerCaravan.addEventListener("click", () => {
      closeSettingsModal();
      if (ctx.triggerTownEvent) ctx.triggerTownEvent("traveling_caravan");
    }, { signal });
  }

  const btnTriggerHarvest = document.getElementById("btn-trigger-event-harvest");
  if (btnTriggerHarvest) {
    btnTriggerHarvest.addEventListener("click", () => {
      closeSettingsModal();
      if (ctx.triggerTownEvent) ctx.triggerTownEvent("golden_harvest");
    }, { signal });
  }

  // =========================================================================
  // 5. CHỤP ẢNH & XUẤT/NHẬP JSON (SNAPSHOT & STORAGE)
  // =========================================================================
  const snapshotModal = document.getElementById("snapshot-modal");
  const snapshotModalClose = document.getElementById("snapshot-modal-close");
  const snapshotModalDismiss = document.getElementById("snapshot-modal-dismiss-btn");
  const snapshotModalCopyBtn = document.getElementById("snapshot-modal-copy-btn");
  const snapshotModalImg = /** @type {HTMLImageElement|null} */ (document.getElementById("snapshot-modal-img"));
  const snapshotModalDownloadLink = /** @type {HTMLAnchorElement|null} */ (document.getElementById("snapshot-modal-download-link"));
  const snapshotModalOpenLink = /** @type {HTMLAnchorElement|null} */ (document.getElementById("snapshot-modal-open-link"));
  const btnSnapshotPNG = document.getElementById("builder-export-btn");

  function closeSnapshotModal() {
    if (snapshotModal) {
      playModalCloseSound();
      snapshotModal.classList.remove("open");
    }
  }

  if (snapshotModalClose) snapshotModalClose.addEventListener("click", closeSnapshotModal, { signal });
  if (snapshotModalDismiss) snapshotModalDismiss.addEventListener("click", closeSnapshotModal, { signal });
  if (snapshotModal) {
    snapshotModal.addEventListener("click", (e) => {
      if (e.target === snapshotModal) closeSnapshotModal();
    }, { signal });
  }

  if (snapshotModalCopyBtn) {
    snapshotModalCopyBtn.addEventListener("click", async () => {
      const canvas = ctx.getCanvas();
      if (!canvas) return;
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) throw new Error("Không thể tạo dữ liệu ảnh");
          if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            showToast("📋 Đã sao chép ảnh vương quốc vào clipboard!", "success");
          } else {
            showToast("📋 Trình duyệt không hỗ trợ sao chép ảnh trực tiếp.", "info");
          }
        }, "image/png");
      } catch (err) {
        showToast("⚠️ Không thể sao chép ảnh: " + err.message, "error");
      }
    }, { signal });
  }

  if (btnSnapshotPNG) {
    btnSnapshotPNG.addEventListener("click", () => {
      playUIClickSound();
      const canvas = ctx.getCanvas();
      if (!canvas) return;

      try {
        ctx.renderCanvas();

        const dataUrl = canvas.toDataURL("image/png");
        const filename = `isometric-town-${new Date().toISOString().slice(0, 10)}.png`;

        if (snapshotModalImg) snapshotModalImg.src = dataUrl;
        if (snapshotModalDownloadLink) {
          snapshotModalDownloadLink.href = dataUrl;
          snapshotModalDownloadLink.download = filename;
        }
        if (snapshotModalOpenLink) {
          snapshotModalOpenLink.href = dataUrl;
        }

        const dlLink = document.createElement("a");
        dlLink.href = dataUrl;
        dlLink.download = filename;
        document.body.appendChild(dlLink);
        dlLink.click();
        setTimeout(() => document.body.removeChild(dlLink), 500);

        if (snapshotModal) {
          playModalOpenSound();
          snapshotModal.classList.add("open");
        }

        showToast(`📸 Đã chụp ảnh và xuất file: ${filename}`, "success");
      } catch (snapErr) {
        playErrorSound();
        showToast(`⚠️ Không thể chụp ảnh: ${snapErr.message}`, "error");
      }
    }, { signal });
  }

  // Xuất JSON
  const btnExportJSON = document.getElementById("builder-export-json-btn");
  if (btnExportJSON) {
    btnExportJSON.addEventListener("click", () => {
      playUIClickSound();
      try {
        const stateData = ctx.getFullSaveData();
        const filename = `isometric-town-save-${new Date().toISOString().slice(0, 10)}.json`;
        exportGameToJSON(stateData, filename);
        showToast(`💾 Đã xuất file JSON thành công: ${filename}`, "success");
      } catch (expErr) {
        playErrorSound();
        showToast(`⚠️ Lỗi khi xuất JSON: ${expErr.message}`, "error");
      }
    }, { signal });
  }

  // Nhập JSON
  const btnImportJSON = document.getElementById("builder-import-json-btn");
  const fileImportInput = /** @type {HTMLInputElement|null} */ (document.getElementById("builder-import-file-input"));

  if (btnImportJSON && fileImportInput) {
    btnImportJSON.addEventListener("click", () => {
      playUIClickSound();
      fileImportInput.click();
    }, { signal });

    fileImportInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        const imported = await importGameFromJSON(file, ctx.getCurrentGrid());
        if (!imported || !imported.grid) {
          throw new Error("Dữ liệu bản đồ trong file không hợp lệ");
        }

        ctx.loadImportedState(imported);
        closeSettingsModal();
        ctx.centerCamera();
        ctx.requestRender();

        playBuildSound();
        showToast(`📂 Đã nạp thành công bản đồ từ ${file.name}!`, "success");
      } catch (impErr) {
        playErrorSound();
        showToast(`⚠️ Không thể nhập file: ${impErr.message}`, "error");
      } finally {
        fileImportInput.value = "";
      }
    }, { signal });
  }

  // Nạp nhanh Bản Đồ Dev Test (Dành riêng cho Dev)
  const btnDevLoad = document.getElementById("builder-dev-load-btn");
  if (btnDevLoad) {
    btnDevLoad.addEventListener("click", () => {
      playUIClickSound();
      ctx.loadImportedState(DEV_FULL_VILLAGE_SAVE);
      closeSettingsModal();
      ctx.centerCamera();
      ctx.requestRender();
      playBuildSound();
      showToast("🛠️ Đã nạp thành công Bản Đồ Dev Test (Full Map 64 Chunks & Full Nhà)!", "success");
    }, { signal });
  }

  return {
    openQuestModal,
    closeQuestModal,
    renderQuestList,
    openAchievementsModal,
    closeAchievementsModal,
    renderAchievementsList,
    resetAchievements,
    getClaimedAchievements,
    setClaimedAchievements,
    hasClaimableAchievements,
    openMarketModal,
    closeMarketModal,
    renderMarketModal,
    openSeedModal,
    closeSeedModal,
    renderSeedModal,
    openSettingsModal,
    closeSettingsModal,
    updateSettingsModalUI,
    closeSnapshotModal,
    destroy: () => abortController.abort()
  };
}
