# Vehicle animation sheets

Mode: built-in `image_gen`. Two complete assemblies: wheat handcart + farmer, horse carriage + horse + seated coachman.

Each native transparent PNG has four direction rows (SE, SW, NW, NE) and five columns (idle + four motion poses). The original PNGs are copied byte-for-byte; no palette reduction, offline resize or image edits. Source cropping occurs only at draw time. A shared chassis baseline and width scale prevent wheel/hoof pose changes from resizing or bouncing the whole vehicle.

Sources: `../assets-source/vehicle-sheets-v1/`. Runtime PNGs and atlas: `../public/assets/vehicles/v1/`.

## wheat_cart

```text
Use case: stylized-concept.
Production ANIMATED VEHICLE SPRITE SHEET for the existing medieval isometric village game. ONE consistent complete vehicle-and-person assembly, repeated in EXACTLY 20 full-body poses arranged in a REGULAR GRID of FIVE equal columns and FOUR equal rows. Square native-resolution PNG with genuine transparent alpha. No visible grid, labels, letters, numerals, scenery, road tile, ground or cast shadow.
Match the supplied reference's warm muted medieval pixel-art palette, oak wood, ochre straw, leather, crisp dark contours, small coherent detailed pixel clusters and top-left light. No glossy 3D, photorealism, blur, giant pixel blocks or palette reduction.
Each cell contains ONE COMPLETE connected assembly. EXACTLY the same vehicle, person, cargo, horse if applicable, scale and proportions in every cell. No missing wheels/people, no detached components, no extra horses or drivers. Entire human, hat, handles, harness, tail, hooves and ALL wheel rims inside that cell with ample transparent gutters. Occupy no more than 78% of cell width and 75% of cell height, centred in its cell. Wheel hubs/chassis stay in the same position from column to column; only the gait, wheel-spoke angles and subtle rider/rein motion change. All ground contact points share a stable baseline.
The FOUR ROWS are distinct true elevated 2:1 isometric viewpoints:
ROW 1 SE: leading person/horse points LOWER-RIGHT, vehicle trails UPPER-LEFT.
ROW 2 SW: leading person/horse points LOWER-LEFT, vehicle trails UPPER-RIGHT.
ROW 3 NW: leading person/horse points UPPER-LEFT, vehicle trails LOWER-RIGHT; true REAR view, backs visible.
ROW 4 NE: leading person/horse points UPPER-RIGHT, vehicle trails LOWER-LEFT; true REAR view, backs visible.
FIVE COLUMNS:
1 = stationary idle with planted feet/hooves and still wheels.
2 = left-leading walking/trotting contact.
3 = passing step with raised right leg/diagonal pair.
4 = OPPOSITE contact with right-leading leg/diagonal pair; NOT a copy of column 2.
5 = opposite passing step, ready to loop back to column 2.
Visible wheel SPOKES must advance through four different small rotation angles in columns 2–5 while the wheel HUBS and rims stay fixed. Change legs clearly, keep the carriage rigid and cargo stable. Real attached handles/harness in all directions; no floating feet or clipped sprites.
Image 1 is the identity/style reference for THIS vehicle, not a background to preserve. Subject: ONE rustic TWO-WHEEL OAK WHEAT HANDCART, carrying the same tied golden wheat sheaves, pulled by ONE bearded farmer wearing a straw hat, muted olive tunic, cream sleeves, brown trousers and leather boots. The farmer walks ahead, leans slightly into the load and holds BOTH wooden shafts in BOTH hands in every pose. Feet alternate naturally, knees bend, shoulders/arms flex subtly while gripping handles; no free waving arms. Cart remains mechanically attached behind the farmer. Both wooden wheels turn with changing spoke angles, wheat does not bounce out. No horse, no motor, no roof, no extra passengers. For the rear rows the cart is nearer the camera and the farmer leads away, with his hat/back visible beyond the shafts. EXACTLY this one connected farmer-and-cart unit in each cell.
```

## horse_carriage

```text
Use case: stylized-concept.
Production ANIMATED VEHICLE SPRITE SHEET for the existing medieval isometric village game. ONE consistent complete vehicle-and-person assembly, repeated in EXACTLY 20 full-body poses arranged in a REGULAR GRID of FIVE equal columns and FOUR equal rows. Square native-resolution PNG with genuine transparent alpha. No visible grid, labels, letters, numerals, scenery, road tile, ground or cast shadow.
Match the supplied reference's warm muted medieval pixel-art palette, oak wood, ochre straw, leather, crisp dark contours, small coherent detailed pixel clusters and top-left light. No glossy 3D, photorealism, blur, giant pixel blocks or palette reduction.
Each cell contains ONE COMPLETE connected assembly. EXACTLY the same vehicle, person, cargo, horse if applicable, scale and proportions in every cell. No missing wheels/people, no detached components, no extra horses or drivers. Entire human, hat, handles, harness, tail, hooves and ALL wheel rims inside that cell with ample transparent gutters. Occupy no more than 78% of cell width and 75% of cell height, centred in its cell. Wheel hubs/chassis stay in the same position from column to column; only the gait, wheel-spoke angles and subtle rider/rein motion change. All ground contact points share a stable baseline.
The FOUR ROWS are distinct true elevated 2:1 isometric viewpoints:
ROW 1 SE: leading person/horse points LOWER-RIGHT, vehicle trails UPPER-LEFT.
ROW 2 SW: leading person/horse points LOWER-LEFT, vehicle trails UPPER-RIGHT.
ROW 3 NW: leading person/horse points UPPER-LEFT, vehicle trails LOWER-RIGHT; true REAR view, backs visible.
ROW 4 NE: leading person/horse points UPPER-RIGHT, vehicle trails LOWER-LEFT; true REAR view, backs visible.
FIVE COLUMNS:
1 = stationary idle with planted feet/hooves and still wheels.
2 = left-leading walking/trotting contact.
3 = passing step with raised right leg/diagonal pair.
4 = OPPOSITE contact with right-leading leg/diagonal pair; NOT a copy of column 2.
5 = opposite passing step, ready to loop back to column 2.
Visible wheel SPOKES must advance through four different small rotation angles in columns 2–5 while the wheel HUBS and rims stay fixed. Change legs clearly, keep the carriage rigid and cargo stable. Real attached handles/harness in all directions; no floating feet or clipped sprites.
Image 1 is the identity/style reference for THIS vehicle. Subject: ONE compact BURGUNDY medieval PASSENGER CARRIAGE with honey-oak/gold trim, covered cabin and FOUR WOODEN SPOKED WHEELS, drawn by ONE CHESTNUT HORSE with dark mane, tail and white lower-leg markings. ONE COACHMAN in a burgundy coat and feathered brown hat remains SEATED ON THE FRONT BENCH in all 20 cells, holding the same TWO REINS connected to the horse's bridle. The horse has a clear four-frame gentle TROT: alternating diagonal leg pairs and passing knees/hooves, not four duplicated standing poses. Wheel spokes rotate while wheel hubs/cabin stay stable. Coachman makes only small rein/upper-body movements, never stands, never walks beside the horse, never disappears. The same harness and shafts connect horse and carriage in every direction. Rear rows show the back of cabin and driver with horse leading away; no front face pasted onto a rear view. No second horse, additional passengers, steam engine or motor. Entire horse, tail, hooves, wheels, coachman and reins uncut.
```
