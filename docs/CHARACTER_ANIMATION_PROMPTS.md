# Character animation sheets

Mode: built-in `image_gen`. Six redesigned villagers and ten existing visitor identities.

Each untouched native PNG contains 4 direction rows (SE, SW, NW, NE) and 5 columns (idle, four walking poses). Source rectangles and foot anchors are measured at draw time metadata; originals are never resized, recoloured or quantized.

Originals: `../assets-source/character-sheets-v1/`. Runtime: `../public/assets/characters/v1/`. Gallery: `../public/character-animation-preview.html`.

## villager / farmer_young

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is a STYLE REFERENCE for character materials/proportions only, not an edit target. Create the NEW farmer described below, not the cook. Preserve one consistent new identity across all 20 cells.
NEW REDESIGNED YOUNG MALE VILLAGE FARMER: friendly young adult, short chestnut hair, small broad-brim golden straw hat with dark brown band, muted moss-green tunic over cream linen shirt, simple brown belt with tiny pouch, warm brown trousers and leather ankle boots. Both hands free for a natural alternating arm swing, no carried tool or oversized accessory. He belongs to this same warm medieval pixel-art village, with a simple clear silhouette readable when drawn 40 pixels high.
```

## villager / farmer_old

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is the SHARED STYLE AND GRID REFERENCE, not an edit target. Use exactly its five-column/four-row layout and consistent pixel-art scale. Replace the young farmer with the NEW distinct villager below; all 20 poses depict only this new identity.
NEW REDESIGNED ELDERLY MALE FARMER: kind weathered face, short grey beard, worn broad straw hat, muted olive-brown waistcoat over cream linen, dark brown trousers and leather boots, compact belt pouch, empty hands. Same village style and body scale as the sheet reference.
```

## villager / farmer_girl

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is the SHARED STYLE AND GRID REFERENCE, not an edit target. Use exactly its five-column/four-row layout and consistent pixel-art scale. Replace the young farmer with the NEW distinct villager below; all 20 poses depict only this new identity.
NEW REDESIGNED YOUNG ADULT FEMALE FARMER: chestnut braided hair, mustard-ochre kerchief, muted moss-green knee-length work dress, cream linen sleeves and short cream apron, brown leggings and sturdy leather boots. No basket or handheld prop; arms swing freely, boots and alternating legs remain clearly visible.
```

## villager / woman

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is the SHARED STYLE AND GRID REFERENCE, not an edit target. Use exactly its five-column/four-row layout and consistent pixel-art scale. Replace the young farmer with the NEW distinct villager below; all 20 poses depict only this new identity.
NEW REDESIGNED ADULT FEMALE VILLAGER / BAKER: warm friendly face, auburn hair tucked in a small cream linen bonnet, muted terracotta-red knee-length dress, cream apron and sleeves, dark brown leggings and leather ankle boots. No carried food or utensils; clear free walking arms and visible boots.
```

## villager / blacksmith

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is the SHARED STYLE AND GRID REFERENCE, not an edit target. Use exactly its five-column/four-row layout and consistent pixel-art scale. Replace the young farmer with the NEW distinct villager below; all 20 poses depict only this new identity.
NEW REDESIGNED MALE BLACKSMITH: sturdy broad-shouldered adult, short dark hair and trimmed dark beard, muted brick-red linen shirt with rolled sleeves, short dark-brown leather smith apron, charcoal trousers, sturdy brown leather boots and plain belt. No hammer, anvil or carried weapon; empty hands for natural opposite arm/leg walking.
```

## villager / merchant

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is the SHARED STYLE AND GRID REFERENCE, not an edit target. Use exactly its five-column/four-row layout and consistent pixel-art scale. Replace the young farmer with the NEW distinct villager below; all 20 poses depict only this new identity.
NEW REDESIGNED MALE VILLAGE MERCHANT / INNKEEPER: approachable middle-aged man with small dark moustache, short chestnut hair and simple muted burgundy cap, ochre waistcoat over cream linen, dark burgundy short coat, brown belt pouches, charcoal breeches and leather boots. No large held bag; empty swinging hands.
```

## visitor / npc_marie

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is ONLY the shared STYLE AND GRID REFERENCE. Input image 2 is the IDENTITY/COSTUME REFERENCE for this specific visitor: preserve their age, gender, hairstyle, headwear, face, main clothing colours and distinguishing accessories in every cell, while matching image 1's polished pixel-art rendering. It is not a farmer costume replacement. Produce this ONE visitor's 20 full-body poses. Any carried basket, shield, staff or satchel must remain the same object attached to the same anatomical hand/side in every direction, small enough to stay inside its cell. A child remains recognizably a child. Keep the five columns and four direction rows exactly as specified; side and back views must show the correct costume/back, not a mirrored face. No labels or extra people.
```

## visitor / npc_angus

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is ONLY the shared STYLE AND GRID REFERENCE. Input image 2 is the IDENTITY/COSTUME REFERENCE for this specific visitor: preserve their age, gender, hairstyle, headwear, face, main clothing colours and distinguishing accessories in every cell, while matching image 1's polished pixel-art rendering. It is not a farmer costume replacement. Produce this ONE visitor's 20 full-body poses. Any carried basket, shield, staff or satchel must remain the same object attached to the same anatomical hand/side in every direction, small enough to stay inside its cell. A child remains recognizably a child. Keep the five columns and four direction rows exactly as specified; side and back views must show the correct costume/back, not a mirrored face. No labels or extra people.
```

## visitor / npc_lily

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is ONLY the shared STYLE AND GRID REFERENCE. Input image 2 is the IDENTITY/COSTUME REFERENCE for this specific visitor: preserve their age, gender, hairstyle, headwear, face, main clothing colours and distinguishing accessories in every cell, while matching image 1's polished pixel-art rendering. It is not a farmer costume replacement. Produce this ONE visitor's 20 full-body poses. Any carried basket, shield, staff or satchel must remain the same object attached to the same anatomical hand/side in every direction, small enough to stay inside its cell. A child remains recognizably a child. Keep the five columns and four direction rows exactly as specified; side and back views must show the correct costume/back, not a mirrored face. No labels or extra people.
```

## visitor / npc_marco

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is ONLY the shared STYLE AND GRID REFERENCE. Input image 2 is the IDENTITY/COSTUME REFERENCE for this specific visitor: preserve their age, gender, hairstyle, headwear, face, main clothing colours and distinguishing accessories in every cell, while matching image 1's polished pixel-art rendering. It is not a farmer costume replacement. Produce this ONE visitor's 20 full-body poses. Any carried basket, shield, staff or satchel must remain the same object attached to the same anatomical hand/side in every direction, small enough to stay inside its cell. A child remains recognizably a child. Keep the five columns and four direction rows exactly as specified; side and back views must show the correct costume/back, not a mirrored face. No labels or extra people.
```

## visitor / npc_lancelot

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is ONLY the shared STYLE AND GRID REFERENCE. Input image 2 is the IDENTITY/COSTUME REFERENCE for this specific visitor: preserve their age, gender, hairstyle, headwear, face, main clothing colours and distinguishing accessories in every cell, while matching image 1's polished pixel-art rendering. It is not a farmer costume replacement. Produce this ONE visitor's 20 full-body poses. Any carried basket, shield, staff or satchel must remain the same object attached to the same anatomical hand/side in every direction, small enough to stay inside its cell. A child remains recognizably a child. Keep the five columns and four direction rows exactly as specified; side and back views must show the correct costume/back, not a mirrored face. No labels or extra people.
```

## visitor / npc_rosalind

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is ONLY the shared STYLE AND GRID REFERENCE. Input image 2 is the IDENTITY/COSTUME REFERENCE for this specific visitor: preserve their age, gender, hairstyle, headwear, face, main clothing colours and distinguishing accessories in every cell, while matching image 1's polished pixel-art rendering. It is not a farmer costume replacement. Produce this ONE visitor's 20 full-body poses. Any carried basket, shield, staff or satchel must remain the same object attached to the same anatomical hand/side in every direction, small enough to stay inside its cell. A child remains recognizably a child. Keep the five columns and four direction rows exactly as specified; side and back views must show the correct costume/back, not a mirrored face. No labels or extra people.
```

## visitor / npc_elric

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is ONLY the shared STYLE AND GRID REFERENCE. Input image 2 is the IDENTITY/COSTUME REFERENCE for this specific visitor: preserve their age, gender, hairstyle, headwear, face, main clothing colours and distinguishing accessories in every cell, while matching image 1's polished pixel-art rendering. It is not a farmer costume replacement. Produce this ONE visitor's 20 full-body poses. Any carried basket, shield, staff or satchel must remain the same object attached to the same anatomical hand/side in every direction, small enough to stay inside its cell. A child remains recognizably a child. Keep the five columns and four direction rows exactly as specified; side and back views must show the correct costume/back, not a mirrored face. No labels or extra people.
```

## visitor / npc_giles

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is ONLY the shared STYLE AND GRID REFERENCE. Input image 2 is the IDENTITY/COSTUME REFERENCE for this specific visitor: preserve their age, gender, hairstyle, headwear, face, main clothing colours and distinguishing accessories in every cell, while matching image 1's polished pixel-art rendering. It is not a farmer costume replacement. Produce this ONE visitor's 20 full-body poses. Any carried basket, shield, staff or satchel must remain the same object attached to the same anatomical hand/side in every direction, small enough to stay inside its cell. A child remains recognizably a child. Keep the five columns and four direction rows exactly as specified; side and back views must show the correct costume/back, not a mirrored face. No labels or extra people.
```

## visitor / npc_pierre

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is ONLY the shared STYLE AND GRID REFERENCE. Input image 2 is the IDENTITY/COSTUME REFERENCE for this specific visitor: preserve their age, gender, hairstyle, headwear, face, main clothing colours and distinguishing accessories in every cell, while matching image 1's polished pixel-art rendering. It is not a farmer costume replacement. Produce this ONE visitor's 20 full-body poses. Any carried basket, shield, staff or satchel must remain the same object attached to the same anatomical hand/side in every direction, small enough to stay inside its cell. A child remains recognizably a child. Keep the five columns and four direction rows exactly as specified; side and back views must show the correct costume/back, not a mirrored face. No labels or extra people.
```

## visitor / npc_jack

```text
Use case: stylized-concept.
Asset: production CHARACTER ANIMATION SPRITE SHEET for a medieval isometric farming town game. Create ONE character identity repeated in EXACTLY 20 poses in a regular GRID: FIVE equal columns and FOUR equal rows. Genuine transparent PNG alpha; square canvas. No visible grid lines, labels, letters, numbers, shadows, ground or scenery.
Style: crisp detailed pixel-art clusters, warm muted earthy colours, clean dark contours, readable face and clothing, upper-left light. Same polished medieval village world as the reference. A compact full-body adult about five heads tall, slightly stylized but not a giant chibi head, not photorealistic, no glossy 3D, no smooth airbrushed blur, no coarse mosaic. Native-resolution detail is important.
GRID CONTRACT: every cell contains exactly ONE complete full-body pose, same character size, identical costume/face/hairstyle/accessories, boots aligned to the same baseline within each row. Each figure centered in its cell, occupying roughly 72% of cell height and less than 65% of cell width. Generous transparent gutters; NO figure or prop crosses a cell boundary. Do not omit or merge cells.
ROWS from top to bottom are true distinct isometric views:
ROW 1 = facing lower-right (SE), face and front/right torso visible.
ROW 2 = facing lower-left (SW), face and front/left torso visible.
ROW 3 = facing upper-left (NW), BACK of head and back/left torso visible, no face.
ROW 4 = facing upper-right (NE), BACK of head and back/right torso visible, no face.
Columns from left to right:
COL 1 = neutral IDLE, both feet planted, relaxed arms.
COL 2 = WALK, left foot forward/right foot back, right arm forward.
COL 3 = WALK passing pose, left supporting leg straight, right knee stepping through, arms near sides.
COL 4 = WALK opposite contact, right foot forward/left foot back, left arm forward.
COL 5 = WALK opposite passing pose, right supporting leg straight, left knee stepping through.
Make limb poses visibly DIFFERENT so columns 2–5 form a genuine looping walk cycle. Keep head, torso volume, hat and clothing stable. Strict elevated 2:1 dimetric game camera in every view; never replace the back rows with front views. No action poses, no idle duplicates in walking columns, no extra limbs, no cropped heads/boots.
Input image 1 is ONLY the shared STYLE AND GRID REFERENCE. Input image 2 is the IDENTITY/COSTUME REFERENCE for this specific visitor: preserve their age, gender, hairstyle, headwear, face, main clothing colours and distinguishing accessories in every cell, while matching image 1's polished pixel-art rendering. It is not a farmer costume replacement. Produce this ONE visitor's 20 full-body poses. Any carried basket, shield, staff or satchel must remain the same object attached to the same anatomical hand/side in every direction, small enough to stay inside its cell. A child remains recognizably a child. Keep the five columns and four direction rows exactly as specified; side and back views must show the correct costume/back, not a mirrored face. No labels or extra people.
```
