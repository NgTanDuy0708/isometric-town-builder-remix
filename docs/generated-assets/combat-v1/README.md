# Combat art generation

Mode: built-in image_gen. Native transparent PNGs are copied unchanged into public/assets/combat/v1 and assets-source/combat-v1. Atlas rectangles and contact points are measured; original pixels are never repainted or resampled.

Characters: guard, goblin and mage. Each sheet: 4 direction rows (SE, SW, NW, NE) and 8 pose columns (idle, walk ×4, attack ×2, hurt). Buildings: barracks and mage academy, one image for each of three levels.

Exact prompts and generated file provenance are recorded in prompt-set.json and outputs.json by the asset integration script.

Completed 31/10/2026: all nine native PNGs are integrated in gameplay. `src/data/combatArtData.js` stores measured source rectangles and foundation/foot anchors. `src/engine/combatAnimation.js` selects native frames for idle, distance-driven walking, actual attacks and hit reaction. `soldierManager` and `defenseManager` advance this state; rendering does not mutate simulation.

The mage SE walk pose in column 5 turns toward SW in the generated original. Playback uses columns 2,3,4,3 for that one direction, keeping the original 32-pose sheet untouched. The other directions/types use four walking poses.

Buildings have distinct level 1/2/3 PNGs. All foundation contact points map to the same world anchor (64,128); no image stretching/shearing is applied. Character poses use one common body scale per sheet, each foot anchor maps to the current world position.

Open `/combat-preview` or **Phòng thủ làng → Xem mô phỏng trận và toàn bộ động tác**. The top canvas uses the real map renderer and battle manager in an isolated scene with two guards, one mage, goblins and all six buildings; no save is read or written. The lower canvas selects all four directions and idle/walk/attack/hit. Pause, half speed and replay controls allow checking transitions.

Rebuild metadata with `python scripts/recordCombatAssets.py` while the generated originals listed in `outputs.json` are available. This copies native files byte-for-byte; it only measures alpha, source bounds and contact points. `tests/combatArt.test.mjs` checks the nine SHA256s, native RGBA transparency, 96 bounded poses, animation selection and anchored drawing. Gameplay layer tests verify the same PNGs are drawn by the real map renderer.

UI verification limit: the integrated browser could not reach local Vite; Windows Computer Use was stopped by the user with Escape. No further desktop/browser control was attempted. Native assets were visually inspected inline; gameplay draw calls and simulation are covered by tests, but this is not a claim of a verified live game screenshot.
