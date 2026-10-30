"""Build review-only GIF/contact sheets; runtime/source PNGs are never changed."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
atlas = json.loads((root / 'public/assets/characters/v1/atlas.json').read_text(encoding='utf-8'))
entries = [(group, key, asset) for group, assets in atlas.items() for key, asset in assets.items()]
images = {(group, key): Image.open(root / f'assets-source/character-sheets-v1/{group}_{key}.png').convert('RGBA')
          for group, key, asset in entries}
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)
title_font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 19)
frames = []
durations = []
for direction in ['SE', 'SW', 'NW', 'NE']:
    for index in [0, 1, 2, 3, 4, 1, 2, 3, 4]:
        canvas = Image.new('RGBA', (1280, 370), '#2c4234')
        draw = ImageDraw.Draw(canvas)
        draw.text((24, 12), f'6 villagers + 10 visitors | {direction} | {"Idle" if index == 0 else "Walking"}', font=title_font, fill='#f5dfad')
        for position, (group, key, asset) in enumerate(entries):
            f = asset['directions'][direction][index]
            im = images[(group, key)].crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
            scale = (87 if key == 'npc_lily' else 105) / asset['referenceHeight']
            im = im.resize((round(f['w'] * scale), round(f['h'] * scale)), Image.Resampling.LANCZOS)
            x = position % 8 * 160 + 80
            y = position // 8 * 155 + 165
            draw.ellipse((x - 18, y - 2, x + 18, y + 7), fill='#203125')
            canvas.alpha_composite(im, (round(x - f['anchorX'] * scale), round(y - f['anchorY'] * scale)))
            draw.text((position % 8 * 160 + 18, y + 15), key, font=font, fill='#d5ddc7')
        frames.append(canvas.convert('RGB'))
        durations.append(450 if index == 0 else 140)
frames[0].save(root / 'scratch/character-animation-preview.png')
frames[18].save(root / 'scratch/character-animation-back-preview.png')
frames[0].save(root / 'scratch/character-animation-preview.gif', save_all=True,
               append_images=frames[1:], duration=durations, loop=0, disposal=2)
print('Saved front/back contact sheets and animated GIF preview.')
