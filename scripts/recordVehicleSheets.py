"""Measure compound vehicle frames and keep generated PNG bytes untouched."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import statistics
from recordCharacterSheets import measure

root = Path(__file__).resolve().parents[1]
archive = root / 'assets-source/vehicle-sheets-v1'
public = root / 'public/assets/vehicles/v1'
parser = argparse.ArgumentParser()
parser.add_argument('--record', nargs=2, metavar=('ID', 'GENERATED_PNG'))
args = parser.parse_args()
manifest_file = archive / 'generation.json'
manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
if args.record:
    key, path = args.record
    source = Path(path)
    measured = measure(source)
    frames = [f for direction in measured['directions'].values() for f in direction]
    measured['referenceWidth'] = statistics.median(f['w'] for f in frames)
    for direction in measured['directions'].values():
        # Keep the rigid chassis on one baseline; do not bob it with a raised hoof.
        baseline = max(f['y'] + f['anchorY'] for f in direction)
        for f in direction:
            f['anchorX'] = f['w'] / 2
            f['anchorY'] = baseline - f['y']
    public.mkdir(parents=True, exist_ok=True)
    for destination in [archive / f'{key}.png', public / f'{key}.png']:
        if destination.exists() and destination.read_bytes() != source.read_bytes():
            raise FileExistsError(f'Refusing to overwrite a different sheet: {destination}')
        shutil.copyfile(source, destination)
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    job = next(job for job in manifest['jobs'] if job['id'] == key)
    job.update(generated_file=str(source), source_file=f'assets-source/vehicle-sheets-v1/{key}.png',
               game_file=f'public/assets/vehicles/v1/{key}.png', sha256=digest,
               atlas={'uri': f'/assets/vehicles/v1/{key}.png?v={digest[:12]}', 'sha256': digest, **measured})
atlas = {job['id']: job['atlas'] for job in manifest['jobs'] if job.get('atlas')}
payload = json.dumps(atlas, ensure_ascii=False, indent=2)
(root / 'src/data/vehicleSheetsData.js').write_text('// Generated from native PNGs.\nexport const VEHICLE_SHEETS = ' + payload + ';\n', encoding='utf-8')
public.mkdir(parents=True, exist_ok=True)
(public / 'atlas.json').write_text(payload + '\n', encoding='utf-8')
manifest['status'] = 'complete' if len(atlas) == len(manifest['jobs']) else 'in_progress'
manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
doc = ['# Vehicle animation sheets\n',
       'Mode: built-in `image_gen`. Two complete assemblies: wheat handcart + farmer, horse carriage + horse + seated coachman.\n',
       'Each native transparent PNG has four direction rows (SE, SW, NW, NE) and five columns (idle + four motion poses). '
       'The original PNGs are copied byte-for-byte; no palette reduction, offline resize or image edits. Source cropping occurs only at draw time. '
       'A shared chassis baseline and width scale prevent wheel/hoof pose changes from resizing or bouncing the whole vehicle.\n',
       'Sources: `../assets-source/vehicle-sheets-v1/`. Runtime PNGs and atlas: `../public/assets/vehicles/v1/`.\n']
for job in manifest['jobs']:
    doc += [f"## {job['id']}\n", '```text\n' + job['prompt'] + '\n```\n']
(root / 'docs/VEHICLE_ANIMATION_PROMPTS.md').write_text('\n'.join(doc), encoding='utf-8')
print(f'Recorded {len(atlas)}/{len(manifest["jobs"])} vehicle sheets')
