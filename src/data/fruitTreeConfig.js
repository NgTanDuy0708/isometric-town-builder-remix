// One source of truth for growth timing, produce and harvest rewards.
export const FRUIT_TREE_MAX_HARVESTS=3;
export const FRUIT_TREE_STAGES=['seed','sprout','seedling','young','flowering','fruiting','withered'];
export const FRUIT_TREES_CONFIG = {
  "d21_apple_tree": {
    "name": "Cây Táo Đỏ",
    "fruitId": "apple",
    "fruitName": "Táo đỏ giòn",
    "icon": "🍎",
    "intervalSec": 45,
    "yieldQty": 3,
    "rewardGold": 20,
    "rewardXP": 15,
    "stem": "apple_tree"
  },
  "d22_coconut_palm": {
    "name": "Cây Dừa Xiêm",
    "fruitId": "coconut",
    "fruitName": "Dừa xiêm ngọt",
    "icon": "🥥",
    "intervalSec": 60,
    "yieldQty": 2,
    "rewardGold": 32,
    "rewardXP": 22,
    "stem": "coconut_palm"
  },
  "d23_tamarind_tree": {
    "name": "Cây Me Chua Ngọt",
    "fruitId": "tamarind",
    "fruitName": "Trái me chua ngọt",
    "icon": "🍈",
    "intervalSec": 50,
    "yieldQty": 3,
    "rewardGold": 25,
    "rewardXP": 18,
    "stem": "tamarind_tree"
  },
  "d35_cacao_tree": {
    "name": "Cây Ca Cao",
    "fruitId": "cacao",
    "fruitName": "Quả ca cao",
    "icon": "🫘",
    "intervalSec": 75,
    "yieldQty": 3,
    "rewardGold": 30,
    "rewardXP": 20,
    "sellPrice": 42,
    "stem": "cacao_tree"
  },
  "d36_cherry_tree": {
    "name": "Cây Cherry",
    "fruitId": "cherry",
    "fruitName": "Cherry chín",
    "icon": "🍒",
    "intervalSec": 50,
    "yieldQty": 3,
    "rewardGold": 28,
    "rewardXP": 18,
    "sellPrice": 35,
    "stem": "cherry_tree"
  },
  "d37_blueberry_bush": {
    "name": "Bụi Việt Quất",
    "fruitId": "blueberry",
    "fruitName": "Việt quất",
    "icon": "🫐",
    "intervalSec": 40,
    "yieldQty": 4,
    "rewardGold": 20,
    "rewardXP": 15,
    "sellPrice": 25,
    "stem": "blueberry_bush"
  },
  "d38_durian_tree": {
    "name": "Cây Sầu Riêng",
    "fruitId": "durian",
    "fruitName": "Sầu riêng",
    "icon": "🥭",
    "intervalSec": 90,
    "yieldQty": 2,
    "rewardGold": 45,
    "rewardXP": 30,
    "sellPrice": 65,
    "stem": "durian_tree"
  },
  "d39_orange_tree": {
    "name": "Cây Cam",
    "fruitId": "orange",
    "fruitName": "Cam chín",
    "icon": "🍊",
    "intervalSec": 55,
    "yieldQty": 3,
    "rewardGold": 26,
    "rewardXP": 18,
    "sellPrice": 35,
    "stem": "orange_tree"
  }
};
