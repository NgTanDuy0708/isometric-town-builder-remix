"""Validate selected original sprites and package the four-stage crop catalog."""
from pathlib import Path
import json, zipfile
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT/'assets-source/crops/growth-v1'
geometry = json.loads((SOURCE/'geometry.json').read_text(encoding='utf-8'))
seeds = json.loads((ROOT/'assets-source/crop-seeds/sown-v1/manifest.json').read_text(encoding='utf-8'))
labels = {item['id']: item['label'] for item in seeds['images']}
assert len(geometry) == 16
families = []
selected = []
for crop, frames in geometry.items():
    family = dict(id=crop,label=labels[crop],stages={})
    sown = ROOT/f'assets-source/crop-seeds/sown-v1/{crop}_sown.png'
    selected.append((sown, f'images/sown/{crop}_sown.png'))
    family['stages']['sown'] = f'images/sown/{crop}_sown.png'
    for stage, frame in frames.items():
        source = SOURCE/frame['file']
        runtime = ROOT/'public/assets/crops/growth-v1'/frame['file']
        assert source.read_bytes() == runtime.read_bytes(), source
        family['stages'][stage] = 'images/growth/'+frame['file']
        selected.append((source,'images/growth/'+frame['file']))
    families.append(family)
assert len(selected) == 64
for path, _ in selected:
    im=Image.open(path)
    assert im.mode == 'RGBA' and im.size == (1254,1254),path
    assert im.getchannel('A').getextrema() == (0,255),path

html=(SOURCE/'index.html').read_text(encoding='utf-8')
html=html.replace('../../crop-seeds/sown-v1/','images/sown/')
html=html.replace(':geometry[id][stage].file',':"images/growth/"+geometry[id][stage].file')
html=html.replace('../../../docs/generated-assets/sown-seeds-v1/','prompts/sown/')
html=html.replace('../../../docs/generated-assets/crop-growth-v1/','prompts/growth/')
html=html.replace('../../../public/assets/decorations/farmland_plot.png','preview/farmland_plot.png')
manifest=dict(generator='built-in imagegen',sprites=64,families=families,geometry=geometry)
(SOURCE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
archive=ROOT/'assets-source/crops/crop-lifecycle-v1.zip'
assert not archive.exists(),'Refusing to overwrite existing archive'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED) as z:
    for path,name in selected:z.write(path,name)
    for path in (ROOT/'docs/generated-assets/sown-seeds-v1').glob('*.txt'):z.write(path,'prompts/sown/'+path.name)
    for path in (ROOT/'docs/generated-assets/crop-growth-v1').glob('*.txt'):z.write(path,'prompts/growth/'+path.name)
    z.writestr('index.html',html)
    z.write(SOURCE/'manifest.json','manifest.json')
    z.write(SOURCE/'README.md','README.md')
    z.write(ROOT/'public/assets/decorations/farmland_plot.png','preview/farmland_plot.png')
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert len([p for p in z.namelist() if p.startswith('images/') and p.endswith('.png')])==64
    for family in families:
        for path in family['stages'].values():assert path in z.namelist(),path
print('Verified 64 original transparent sprites; ZIP:',archive.name,round(archive.stat().st_size/1024/1024,2),'MiB')
