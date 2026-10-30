# Expansion asset generation — 2026-10-29 / 2026-10-30

Built-in imagegen mode, one request per PNG, genuine transparent background.
Source prompts: docs/EXPANSION_ASSET_PROMPTS.md; original combined prompts and actual selected-output prompts are stored in docs/generated-assets/expansion. Same-family prior stages/levels were supplied as image references. Roads use the straight-road reference. The canal's selected output is a targeted edit of its first generated version.

Generated **94/94** PNGs; **0 remain**. Generation resumed on 30 October after the previous usage limit cleared. The orange fruiting image was regenerated to preserve the flowering silhouette; the discarded oversized output is archived under revisions.

Native outputs are 1254×1254 RGBA, preserved byte-for-byte, consistent with rule 9 of the prompt document. Source and public copies have matching SHA-256 hashes. 44 subjects have shop registration; see docs/EXPANSION_INTEGRATION.md. Forty core plant sprites plus sixteen seed/sprout PNGs drive eight species and seven stages. Each tree allows three harvests, then remains withered until dug up. See docs/FRUIT_TREE_LIFECYCLE.md. See docs/EXPANSION_INTEGRATION.md.

## Review before integration

- wooden_buddhist_temple_lv3.png: front foundation clipped at bottom; regenerate with wider framing.
- stone_road_crossroads.png: regenerated 30 October with four diagonal arms and open flat end cuts, matching the approved original straight paving. Native road borders now draw directly; preview: /assets/expansion/roads.html.
- Ground modules need pixel-level connector alignment and seam testing.
- All anchors and relative stage/level scale require calibration; the model did not obey exact working-box coordinates consistently.
- Some native cutout edges show coloured fringe. Inspect against the actual map and repair before integration.

## Remaining images



## Locations

- Original source copies: assets-source/expansion/{buildings,props,gardens,terrain,landmarks,animals,plants}.
- Public copies and preview gallery: public/assets/expansion/index.html.
- Local gallery URL: http://localhost:3000/assets/expansion/index.html.
- Manifest and validation: assets-source/expansion/manifest.json and validation.json.
- Pending combined prompts: docs/generated-assets/expansion/pending.json.
- Discarded canal revision: assets-source/expansion/revisions.
