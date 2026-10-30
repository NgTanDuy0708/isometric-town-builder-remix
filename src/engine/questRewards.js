import { RESOURCE_MAX_CAPACITY, RESOURCES_CONFIG, getWarehouseUsed } from '../data/resourcesConfig.js';

export function claimQuestRewards(ctx, quest, claimed) {
  if (claimed[quest.id]) return false;
  const resources = ctx.getPlayerResources();
  const rewards = Object.entries(quest.rewardResources || {});
  const total = rewards.reduce((sum, [, qty]) => sum + qty, 0);
  const capacity = ctx.getWarehouseCapacity?.() ?? 300;
  if (getWarehouseUsed(resources) + total > capacity || rewards.some(([id, qty]) =>
    !RESOURCES_CONFIG[id] || (resources[id] || 0) + qty > RESOURCE_MAX_CAPACITY)) {
    ctx.showStorageFullModal?.();
    return false;
  }
  // Ghi quyền nhận và vật phẩm trước các callback có thể lưu game.
  claimed[quest.id] = true;
  for (const [id, qty] of rewards) resources[id] = (resources[id] || 0) + qty;
  ctx.addPlayerGold(quest.rewardGold || 0);
  ctx.addPlayerXP(quest.rewardXP ?? 50, quest.title);
  ctx.updateResourcesUI?.();
  ctx.persistGameState();
  return true;
}
