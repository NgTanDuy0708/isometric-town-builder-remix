export const LIVESTOCK_RULES = {
      b21_chicken_coop: {
        title: "Chuồng Gà Đẻ Trứng",
        animalName: "Gà mái",
        animalIcon: "🐔",
        feedRes: "wheat",
        feedName: "Lúa mì",
        feedIcon: "🌾",
        productRes: "egg",
        productName: "Trứng gà tươi",
        productIcon: "🥚",
        durationSec: 45,
        maxAnimals: 5,
        baseAnimalPrice: 20,
        priceStep: 15,
        goldGain: 25,
        xpGain: 15,
        sound: "chicken"
      },
      b22_cow_pasture: {
        title: "Chuồng Bò Sữa",
        animalName: "Bò sữa",
        animalIcon: "🐮",
        feedRes: "corn",
        feedName: "Bắp ngô",
        feedIcon: "🌽",
        productRes: "milk",
        productName: "Bình sữa tươi",
        productIcon: "🥛",
        durationSec: 75,
        maxAnimals: 3,
        baseAnimalPrice: 50,
        priceStep: 30,
        goldGain: 50,
        xpGain: 25,
        sound: "cow"
      },
      b57_sheep_pasture: {
        title: "Chuồng Cừu Lấy Lông",
        animalName: "Cừu lông",
        animalIcon: "🐑",
        feedRes: "carrot",
        feedName: "Cà rốt",
        feedIcon: "🥕",
        productRes: "wool",
        productName: "Lông cừu mịn",
        productIcon: "🐑",
        durationSec: 60,
        maxAnimals: 3,
        baseAnimalPrice: 80,
        priceStep: 45,
        goldGain: 40,
        xpGain: 20,
        sound: "sheep"
      }
    };
LIVESTOCK_RULES.d33_pig_pen_barn = { ...LIVESTOCK_RULES.b22_cow_pasture, title: "Chuồng Heo", animalName: "Heo", animalIcon: "🐷", productRes: "meat", productName: "Thịt heo", productIcon: "🥩", maxAnimals: 4, sound: "pig" };
export const LIVESTOCK_TILE_IDS = Object.keys(LIVESTOCK_RULES);
export function isLivestockTile(tileId) { return Object.hasOwn(LIVESTOCK_RULES, tileId); }
