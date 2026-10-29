# Expansion asset generation — 2026-10-29

Built-in imagegen mode, one request per PNG, genuine transparent background.
Source prompts: docs/EXPANSION_ASSET_PROMPTS.md; original combined prompts and actual selected-output prompts are stored in docs/generated-assets/expansion. Same-family prior stages/levels were supplied as image references. Roads use the straight-road reference. The canal's selected output is a targeted edit of its first generated version.

Generated **74/94** PNGs; **20 remain** because imagegen returned HTTP 429 usage_limit_reached. Reported reset: approximately 02:13 on 30 October 2026, Vietnam time. No automatic retry is scheduled.

Native outputs are 1254×1254 RGBA, preserved byte-for-byte, consistent with rule 9 of the prompt document. Source and public copies have matching SHA-256 hashes. No renderer/economy integration was performed.

## Review before integration

- wooden_buddhist_temple_lv3.png: front foundation clipped at bottom; regenerate with wider framing.
- stone_road_crossroads.png: screen-axis branches instead of isometric diagonal axes; regenerate geometry.
- Ground modules need pixel-level connector alignment and seam testing.
- All anchors and relative stage/level scale require calibration; the model did not obey exact working-box coordinates consistently.
- Some native cutout edges show coloured fringe. Inspect against the actual map and repair before integration.

## Remaining images

- apple_tree_fruiting.png
- apple_tree_withered.png
- coconut_palm_fruiting.png
- coconut_palm_withered.png
- tamarind_tree_fruiting.png
- tamarind_tree_withered.png
- cacao_tree_fruiting.png
- cacao_tree_withered.png
- cherry_tree_flowering.png
- cherry_tree_fruiting.png
- cherry_tree_withered.png
- blueberry_bush_flowering.png
- blueberry_bush_fruiting.png
- blueberry_bush_withered.png
- durian_tree_flowering.png
- durian_tree_fruiting.png
- durian_tree_withered.png
- orange_tree_flowering.png
- orange_tree_fruiting.png
- orange_tree_withered.png

## Locations

- Original source copies: assets-source/expansion/{buildings,props,gardens,terrain,landmarks,animals,plants}.
- Public copies and preview gallery: public/assets/expansion/index.html.
- Local gallery URL: http://localhost:3000/assets/expansion/index.html.
- Manifest and validation: assets-source/expansion/manifest.json and validation.json.
- Pending combined prompts: docs/generated-assets/expansion/pending.json.
- Discarded canal revision: assets-source/expansion/revisions.
