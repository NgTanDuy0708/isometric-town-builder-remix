"""Measure generated crop sprites without modifying their source pixels."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets-source/crops/growth-v1'
HEIGHTS = dict(wheat=92, carrot=72, radish=72, tomato=104, mushroom=44,
               sunflower=120, onion=64, chili=88, cucumber=104,
               cucumber_pickling=62, pumpkin=62, grapes=104, corn=120,
               lettuce=44, strawberry=52, pear=132)

def measure(path):
    im = Image.open(path)
    assert im.mode == 'RGBA', path
    alpha = im.getchannel('A').point(lambda p: 255 if p >= 128 else 0)
    box = alpha.getbbox()
    assert box, path
    w, h = im.size
    # Centre strip finds the stem/neck, rather than a lower side leaf.
    x0, x1 = round(w * .45), round(w * .55)
    centre = alpha.crop((x0, 0, x1, h))
    cb = centre.getbbox()
    assert cb, path
    foot_y = cb[3] - 1
    xs = [x for x in range(x0, x1) if alpha.getpixel((x, foot_y))]
    foot_x = sum(xs) / len(xs)
    return dict(file=path.name, width=w, height=h, bounds=list(box), anchor=dict(x=foot_x, y=foot_y))

geometry = {}
for crop, target_height in HEIGHTS.items():
    paths = {stage: SOURCE / f'{crop}_{stage}.png' for stage in ('sprout', 'grow', 'ripe')}
    if crop in ('onion', 'radish') and (SOURCE / f'{crop}_sprout_v2.png').exists():
        paths['sprout'] = SOURCE / f'{crop}_sprout_v2.png'
    if not all(p.exists() for p in paths.values()):
        continue
    frames = {stage: measure(path) for stage, path in paths.items()}
    ripe = frames['ripe']; rb = ripe['bounds']
    ripe_scale = min(target_height / (rb[3]-rb[1]), 112 / (rb[2]-rb[0]))
    mature_h = (rb[3]-rb[1]) * ripe_scale
    for stage, ratio in (('sprout', .28), ('grow', .65), ('ripe', 1)):
        frame = frames[stage]; b = frame['bounds']
        frame['scale'] = min(mature_h * ratio / (b[3]-b[1]), 112 * ratio / (b[2]-b[0]))
    geometry[crop] = frames
assert geometry, 'No complete crop families found'
js = '// Measured source anchors and display scales; original PNGs are untouched.\n'
js += 'export const CROP_GROWTH_GEOMETRY = ' + json.dumps(geometry, indent=2) + ';\n'
(ROOT/'src/data/cropGrowthGeometry.js').write_text(js, encoding='utf-8')
(SOURCE/'geometry.json').write_text(json.dumps(geometry,indent=2)+'\n',encoding='utf-8')
print(f'Measured {len(geometry)} complete families / {len(geometry)*3} images')
