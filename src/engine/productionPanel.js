import {resourceIconHtml} from '../data/resourceIcons.js';
import { getRecipesForBuilding, MAX_PRODUCTION_QUEUE } from '../data/productionRecipes.js';
import { RESOURCES_CONFIG, getWarehouseUsed } from '../data/resourcesConfig.js';
import { LIVESTOCK_RULES } from '../data/livestockConfig.js';
import { CROPS_CONFIG, getCropGrowDurationMs } from '../data/cropsConfig.js';
import { PRODUCTION_BUILDINGS } from '../data/gameEconomy.js';

export function createProductionPanel(ctx) {
  const root = document.createElement('div');
  root.className = 'production-panel-backdrop';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Quản lý sản xuất');
  const card = document.createElement('section');
  card.className = 'production-panel-card';
  root.appendChild(card);
  document.body.appendChild(root);
  let cell = null, timer = null;
  const abort = new AbortController();
  const el = (tag, text, parent = card) => {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    parent.appendChild(node);
    return node;
  };
  const button = (text, action, parent = card, disabled = false) => {
    const node = el('button', text, parent);
    node.type = 'button'; node.disabled = disabled;
    node.addEventListener('click', action);
    return node;
  };
  function close() { root.hidden = true; clearInterval(timer); timer = null; }
  function open(row = null, col = null) {
    cell = row == null ? null : { row, col };
    root.hidden = false;
    render();
    clearInterval(timer);
    timer = setInterval(render, 1000);
    card.querySelector('button')?.focus();
  }
  function render() {
    card.replaceChildren();
    const header = el('div', null); header.className = 'production-panel-header';
    el('h2', cell ? 'Công thức & Hàng đợi' : 'Tình hình sản xuất', header);
    button('Đóng ✕', close, header);
    if (!cell) return renderOverview();
    const { row, col } = cell, key = `${row}_${col}`;
    const tid = ctx.getCurrentGrid()[row]?.[col];
    const recipes = getRecipesForBuilding(tid);
    if (!recipes.length) { close(); return; }
    const p = ctx.manager.getState()[key] || {};
    el('h3', `${ctx.getTileMap()[tid]?.label || tid} · [${row}, ${col}]`);
    el('p', `Tối đa ${MAX_PRODUCTION_QUEUE} mẻ gồm mẻ đang làm, chờ và đã xong. Nguyên liệu được giữ khi thêm mẻ; hủy mẻ chờ sẽ hoàn lại.`);
    const owned = ctx.getPlayerResources();
    const level = ctx.getBuildingLevels?.()[key] || 1;
    const speed = level === 3 ? 1.6 : level === 2 ? 1.3 : 1;
    for (const recipe of recipes) {
      const rowEl = el('div', null); rowEl.className = 'production-panel-row';
      const recipeLabel=el('span', `${recipe.name} · ${Math.ceil(recipe.durationSec / speed)}s · ${Object.entries(recipe.inputs).map(([id, n]) => `${n} ${RESOURCES_CONFIG[id]?.name} (có ${owned[id] || 0})`).join(' + ')}`, rowEl);
      recipeLabel.innerHTML=resourceIconHtml(recipe.resource,recipe.name,24,recipe.icon)+' '+recipeLabel.textContent;
      const locked = ctx.getPlayerLevel() < recipe.requiredLevel;
      const constructing = !!ctx.getConstructions()[key];
      const queueFull = (p.queue?.length || 0) + (p.completedBatches?.length || 0) + (p.activeBatch ? 1 : 0) >= MAX_PRODUCTION_QUEUE;
      const missing = Object.entries(recipe.inputs).some(([id, n]) => (owned[id] || 0) < n);
      button(constructing ? 'Đang xây dựng' : locked ? `Cấp ${recipe.requiredLevel}` : queueFull ? 'Hàng đợi đầy' : '＋ Thêm mẻ', () => {
        const result = ctx.manager.enqueue(row, col, recipe.id);
        if (!result.ok) ctx.showToast(result.error, 'warning');
        render();
      }, rowEl, constructing || locked || missing || queueFull);
    }
    if (p.queueMode) {
      el('h3', 'Hàng đợi');
      if(p.activeBatch){const active=el('p', `⏳ ${p.activeBatch.name}: ${Math.max(0,Math.ceil((p.activeBatch.startedAt+p.activeBatch.durationMs-Date.now())/1000))}s`);active.innerHTML=resourceIconHtml(p.activeBatch.resource,p.activeBatch.name,24,p.activeBatch.icon)+' '+active.textContent;}
      for (const [index, batch] of (p.queue || []).entries()) {
        const rowEl = el('div', null); rowEl.className = 'production-panel-row';
        const queued=el('span', `${index+1}. ${batch.name}`,rowEl);queued.innerHTML=resourceIconHtml(batch.resource,batch.name,24,batch.icon)+' '+queued.textContent;
        button('Hủy & hoàn nguyên liệu', () => { ctx.manager.cancelQueued(row, col, index); render(); }, rowEl);
      }
      el('p', `📦 ${p.completedBatches?.length || 0} mẻ đã xong`);
      button('Thu 1 mẻ', () => { ctx.manager.harvest(row, col); render(); }, card, !p.ready);
      if (!PRODUCTION_BUILDINGS[tid]?.manualQueue) button('Trở về sản xuất tự động', () => { ctx.manager.resumeAutomatic(row, col); render(); }, card,
        !!p.activeBatch || !!p.queue?.length || !!p.completedBatches?.length);
    } else {
      el('p', p.ready ? '📦 Có sản phẩm tự động chờ thu.' : p.paused ? '⚠️ Đang thiếu nguyên liệu.' : '⏳ Đang sản xuất tự động. Thêm mẻ để chuyển sang hàng đợi.');
      if (p.ready) button('Thu sản phẩm', () => { ctx.manager.harvest(row, col); render(); });
    }
    button('Nâng cấp công trình', () => { close(); ctx.openUpgradeModal(row, col); });
    button('Xem toàn bộ sản xuất', () => open());
  }
  function renderOverview() {
    const resources = ctx.getPlayerResources();
    const used = getWarehouseUsed(resources), capacity = ctx.getWarehouseCapacity();
    el('p', `Kho: ${used}/${capacity}${used >= capacity ? ' · Kho đầy, hãy bán/giao hàng để tiếp tục thu hoạch.' : ''}`);
    const grid = ctx.getCurrentGrid(), production = ctx.manager.getState();
    let count = 0;
    for (let row = 0; row < grid.length; row++) for (let col = 0; col < grid[row].length; col++) {
      const tid = grid[row][col], key = `${row}_${col}`;
      if (ctx.getConstructions()[key]) continue;
      const p = production[key], rule = LIVESTOCK_RULES[tid], farm = ctx.getFarmlandState()[key];
      let status = '', action = () => open(row, col);
      if (rule) {
        const ls = ctx.getLivestockState()[key];
        status = !ls?.animalCount ? 'Chưa có vật nuôi' : ls.state === 'hungry' ? `Thiếu thức ăn / chờ cho ăn: ${rule.feedName}` : ls.state === 'ready' ? 'Sẵn sàng thu hoạch' : 'Đang tạo sản phẩm';
        action = () => { close(); ctx.openLivestockModal(row, col); };
      } else if (farm && tid === 'd13_farmland_plot') {
        status = Date.now() - farm.plantTime >= getCropGrowDurationMs(farm) ? 'Sẵn sàng gặt' : `${CROPS_CONFIG[farm.seedId]?.name || 'Cây trồng'} đang lớn`;
        action = close;
      } else if (p) {
        status = p.ready ? 'Sẵn sàng thu hoạch' : p.paused ? `Thiếu ${RESOURCES_CONFIG[p.pauseReason?.replace('missing_', '')]?.name || 'nguyên liệu'}` : p.queueMode && !p.activeBatch ? 'Hàng đợi trống' : 'Đang sản xuất';
        if (!getRecipesForBuilding(tid).length) action = close;
      }
      if (!status) continue;
      count++;
      const rowEl = el('div', null); rowEl.className = 'production-panel-row';
      el('span', `${ctx.getTileMap()[tid]?.label || tid} [${row}, ${col}] · ${status}`, rowEl);
      button('Đi tới', () => { ctx.focusCell(row, col); action(); }, rowEl);
    }
    if (!count) el('p', 'Chưa có hoạt động sản xuất. Hãy gieo hạt hoặc xây xưởng, chuồng trại.');
  }
  root.addEventListener('click', e => { if (e.target === root) close(); }, { signal: abort.signal });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { signal: abort.signal });
  return { open, close, destroy() { close(); abort.abort(); root.remove(); } };
}
