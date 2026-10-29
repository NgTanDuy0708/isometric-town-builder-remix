import { isFenceTile, canAddFence } from "../data/fenceConfig.js";
import { getTileCost } from "../data/gameEconomy.js";
import { isCellUnlocked } from "../data/landConfig.js";

export function placeFenceOnEdges(ctx, tileId, row, col, flipped = false) {
  const fences = ctx.getFences();
  if (!isFenceTile(tileId) || !ctx.getCurrentGrid()[row]?.[col] ||
      !isCellUnlocked(row, col, ctx.getLandUnlockedChunks(), ctx.getGameMode()) ||
      !canAddFence(fences, tileId, row, col, flipped)) return false;
  const cost = ctx.getGameMode() === "game" ? getTileCost(tileId, "decoration") : 0;
  if (cost > ctx.getPlayerGold()) {
    ctx.showToast("⚠️ Không đủ vàng để đặt hàng rào!", "error");
    return false;
  }
  fences.push({ tileId, row, col, flipped });
  ctx.deductGold(cost);
  ctx.updateGoldDisplay();
  ctx.requestRender();
  ctx.triggerAutoSave();
  return true;
}
