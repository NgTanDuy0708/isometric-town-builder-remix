// Công thức và hàng đợi dùng chung cho xưởng, nhà trọ và bảng trạng thái.
export const PRODUCTION_RECIPES = {
  plank: { id:'plank', building:'b11_carpenter_sawmill', name:'Ván gỗ', icon:'🪵', inputs:{wood:2}, resource:'plank', durationSec:20, gold:0, xp:5, requiredLevel:4 },
  buildingStone: { id:'buildingStone', building:'b65_stone_quarry', name:'Đá xây dựng', icon:'🧱', inputs:{stone:2}, resource:'buildingStone', durationSec:20, gold:0, xp:5, requiredLevel:4 },
  ironIngot: { id:'ironIngot', building:'b03_blacksmith_forge', name:'Thỏi sắt', icon:'🔩', inputs:{ironOre:2,wood:1}, resource:'ironIngot', durationSec:30, gold:0, xp:8, requiredLevel:4 },
  ironTools: { id:'ironTools', building:'b03_blacksmith_forge', name:'Dụng cụ sắt', icon:'⚒️', inputs:{ironIngot:1,plank:1}, resource:'ironTools', durationSec:45, gold:0, xp:15, requiredLevel:4 },
  bread: { id: 'bread', building: 'b06_bakery', name: 'Bánh mì', icon: '🍞', inputs: { wheat: 1 }, resource: 'bread', durationSec: 60, gold: 45, xp: 15, requiredLevel: 3 },
  fabric: { id: 'fabric', building: 'b58_textile_mill', name: 'Vải dệt', icon: '🧵', inputs: { wool: 1 }, resource: 'fabric', durationSec: 75, gold: 65, xp: 15, requiredLevel: 8 },
  butter: { id: 'butter', building: 'b59_dairy_factory', name: 'Bơ sữa', icon: '🧈', inputs: { milk: 1 }, resource: 'butter', durationSec: 60, gold: 45, xp: 30, requiredLevel: 5 },
  wine: { id: 'wine', building: 'b47_winery_press_barn_sw', name: 'Rượu vang', icon: '🍷', inputs: { grapes: 1 }, resource: 'wine', durationSec: 90, gold: 85, xp: 15, requiredLevel: 22 },
  roastPork: { id: 'roastPork', building: 'b64_bbq_restaurant', name: 'Thịt heo nướng', icon: '🍖', inputs: { meat: 2, carrot: 1 }, resource: 'roastPork', durationSec: 90, gold: 35, xp: 25, requiredLevel: 5 }
};
export const MAX_PRODUCTION_QUEUE = 5;
export function getRecipesForBuilding(tileId) {
  if (tileId === 'b48_winery_press_barn_se') tileId = 'b47_winery_press_barn_sw';
  return Object.values(PRODUCTION_RECIPES).filter(recipe => recipe.building === tileId);
}
