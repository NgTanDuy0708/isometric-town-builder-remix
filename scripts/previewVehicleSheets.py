"""Review-only contact sheet/GIF and native vehicle export, no runtime image edits."""
from pathlib import Path
import hashlib
import json
import zipfile
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'assets-source/vehicle-sheets-v1/generation.json').read_text(encoding='utf-8'))
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 19)
small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 14)
frames = []
for index in [0, 1, 2, 3, 4, 1, 2, 3, 4]:
    canvas = Image.new('RGBA', (1120, 660), '#2c4234')
    draw = ImageDraw.Draw(canvas)
    for row, job in enumerate(manifest['jobs']):
        asset = job['atlas']
        image = Image.open(root / job['source_file']).convert('RGBA')
        title = 'Xe lúa mì + người kéo' if job['id'] == 'wheat_cart' else 'Xe ngựa + người đánh xe'
        draw.text((18, row * 320 + 8), title, font=font, fill='#f5dfad')
        for col, direction in enumerate(['SE', 'SW', 'NW', 'NE']):
            f = asset['directions'][direction][index]
            crop = image.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
            scale = (162 if row == 0 else 234) / asset['referenceWidth']
            crop = crop.resize((round(f['w'] * scale), round(f['h'] * scale)), Image.Resampling.LANCZOS)
            x, y = col * 280 + 140, row * 320 + 280
            canvas.alpha_composite(crop, (round(x - f['anchorX'] * scale), round(y - f['anchorY'] * scale)))
            draw.text((col * 280 + 100, row * 320 + 295), direction, font=small, fill='#d3ddc6')
    frames.append(canvas.convert('RGB'))
frames[0].save(root / 'scratch/vehicle-animation-preview.png')
frames[0].save(root / 'scratch/vehicle-animation-preview.gif', save_all=True, append_images=frames[1:],
               duration=[450] + [140] * 8, loop=0, disposal=2)
output = root / 'assets-source/vehicle-sheets-v1-native.zip'
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as bundle:
    for job in manifest['jobs']:
        bundle.write(root / job['game_file'], Path(job['game_file']).relative_to('public').as_posix())
    bundle.write(root / 'public/assets/vehicles/v1/atlas.json', 'assets/vehicles/v1/atlas.json')
    bundle.write(root / 'docs/VEHICLE_ANIMATION_PROMPTS.md', 'VEHICLE_ANIMATION_PROMPTS.md')
    bundle.write(root / 'assets-source/vehicle-sheets-v1/generation.json', 'generation.json')
with zipfile.ZipFile(output) as bundle:
    for job in manifest['jobs']:
        assert hashlib.sha256(bundle.read(Path(job['game_file']).relative_to('public').as_posix())).hexdigest() == job['sha256']
print('Saved vehicle GIF, contact sheet and source-identical native ZIP export.')
