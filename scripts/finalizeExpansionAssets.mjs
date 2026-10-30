import fs from 'node:fs';
import crypto from 'node:crypto';

const root = 'assets-source/expansion';
const publicRoot = 'public/assets/expansion';
const promptRoot = 'docs/generated-assets/expansion';
const manifest = JSON.parse(fs.readFileSync(`${root}/manifest.json`, 'utf8'));
const overrides = JSON.parse(fs.readFileSync(`${promptRoot}/prompt-overrides.json`, 'utf8'));
for (const name of fs.readdirSync(promptRoot).filter(n => /^prompt-overrides-\d+\.json$/.test(n)).sort()) {
  Object.assign(overrides, JSON.parse(fs.readFileSync(`${promptRoot}/${name}`, 'utf8')));
}
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

// These are the framing changes actually sent for the selected outputs.
for (const i of manifest.items) {
  let used = overrides[i.filename] || i.prompt;
  if (i.stage === 3 && ['A1', 'A2', 'A3'].includes(i.group)) used += '\n\nKeep the COMPLETE highest roof, props and all feet comfortably inside the canvas with clear transparent padding; zoom out if necessary to avoid clipping.';
  if (i.filename === 'dairy_workshop_lv2.png') used += '\n\nFRAMING CORRECTION: A previous result clipped the far-right roof and wall. Show the ENTIRE complete building with at least 8% transparent margin on every side. Zoom OUT enough to fit all roofs, wall corners, feet, the projecting hanging sign and work bays. Never cut off the right facade. Keep the entrance orientation and materials of the reference.';
  if (i.filename === 'nordic_longhouse_lv2.png') used = 'FRAMING PRIORITY: The ENTIRE longhouse including its far-right rear wall and roof must be visible. Reserve at least 10% clear transparent padding on every side. Make the whole building smaller within the canvas if necessary; never crop any end. The preceding attempt cut off the right half.\n\n' + used;
  if (i.stage === 3 && ['A5', 'A6', 'A8', 'A9'].includes(i.group)) used = 'FRAMING PRIORITY: Show the COMPLETE entire structure including all roofs, extended awnings, posts and feet. Reserve generous transparent margins on all sides. Zoom the framing out if needed; never clip the right wall or roof. Only ONE final highest-level asset.\n\n' + used;
  i.generationPromptPath = `${promptRoot}/${i.filename.replace('.png', '.actual.txt')}`;
  fs.writeFileSync(i.generationPromptPath, used + '\n');
  i.reviewNotes = [];
  if (i.filename === 'wooden_buddhist_temple_lv3.png') i.reviewNotes.push('Cần tạo lại: phần móng phía trước bị cắt ở mép dưới ảnh.');
  if (i.filename === 'stone_road_crossroads.png' && !overrides[i.filename]?.includes('FOUR arms run upper-left')) i.reviewNotes.push('Cần tạo lại: bốn nhánh đang theo trục màn hình, chưa đúng hai trục chéo của lưới isometric.');
  if (i.module === 'T') i.reviewNotes.push('Cần căn đầu nối và kiểm tra ghép ô trong runtime; chưa xác nhận khớp pixel.');
  if (i.status !== 'generated') i.blockedReason = 'imagegen usage_limit_reached';
  else delete i.blockedReason;
}

const generated = manifest.items.filter(i => i.status === 'generated');
const pending = manifest.items.filter(i => i.status !== 'generated');
const failures = [];
let bytes = 0;
for (const i of generated) {
  const src = fs.readFileSync(i.sourcePath);
  const dest = fs.readFileSync(i.gameAssetPath);
  bytes += src.length;
  if (hash(src) !== i.sha256 || !src.equals(dest)) failures.push(`${i.filename}: hash/copy mismatch`);
  if (src.readUInt32BE(16) !== i.metadata.width || src.readUInt32BE(20) !== i.metadata.height || src[24] !== 8 || src[25] !== 6) failures.push(`${i.filename}: PNG metadata mismatch`);
  if (i.metadata.alphaMin !== 0 || i.metadata.alphaMax !== 255) failures.push(`${i.filename}: missing alpha range`);
}
if (new Set(manifest.items.map(i => i.filename)).size !== 94) failures.push('Expected 94 unique filenames');
if (failures.length) throw Error(failures.join('\n'));
manifest.completed = generated.length;
manifest.generationState = {
  status: pending.length ? 'in_progress' : 'generated_pending_art_review',
  remaining: pending.length,
  previousLimitReset: '2026-10-30T02:13:18+07:00',
  integration: '44 subjects are registered in the shop; see docs/EXPANSION_INTEGRATION.md. New plant lifecycle art is stored separately and does not yet replace the existing harvest system.',
  notes: 'Native 1254x1254 PNG retained per source document rule 9. Working-box coordinates, anchors and relative scale still need runtime calibration. Some native cutout edges show coloured fringe; inspect against game backgrounds before integration.'
};
fs.writeFileSync(`${root}/manifest.json`, JSON.stringify(manifest, null, 2));
fs.writeFileSync(`${publicRoot}/manifest.json`, JSON.stringify({...manifest, items:manifest.items.map(({prompt,...i})=>i)}, null, 2));
const counts = Object.fromEntries([...new Set(manifest.items.map(i=>i.folder))].map(folder=>[folder, {generated:generated.filter(i=>i.folder===folder).length,total:manifest.items.filter(i=>i.folder===folder).length}]));
fs.writeFileSync(`${root}/validation.json`, JSON.stringify({checkedAt:new Date().toISOString(),generated:generated.length,pending:pending.length,sourceAndPublicHashesMatch:true,rgbaWithRealAlpha:true,nativeSizes:[...new Set(generated.map(i=>`${i.metadata.width}x${i.metadata.height}`))],bytes,counts,reviewRequired:generated.filter(i=>i.reviewNotes.length).map(i=>({filename:i.filename,notes:i.reviewNotes})),failures},null,2));
fs.writeFileSync(`${promptRoot}/pending.json`, JSON.stringify(pending.map(({filename,folder,dependency,prompt})=>({filename,folder,dependency,prompt})),null,2));

const cards = manifest.items.map(i => `<article data-status="${i.status}" data-folder="${i.folder}" data-review="${!!i.reviewNotes.length}"><div class="preview">${i.status==='generated'?`<a href="./${i.folder}/${i.filename}" target="_blank"><img loading="lazy" src="./${i.folder}/${i.filename}?v=${i.sha256.slice(0,12)}" alt="${esc(i.title)}"></a>`:'<span>Chưa tạo · hết hạn mức</span>'}</div><h2>${esc(i.title)} · ${i.group}${i.stage?' / '+i.stage:''}</h2><p>${i.filename}</p><p>${i.metadata?`${i.metadata.width} × ${i.metadata.height} · PNG alpha`:'Đang chờ công cụ'}</p>${i.reviewNotes.map(n=>`<p class="note">${esc(n)}</p>`).join('')}${i.status==='generated'?`<p><a href="./${i.folder}/${i.filename}" download>Tải PNG gốc</a></p>`:''}</article>`).join('');
fs.writeFileSync(`${publicRoot}/index.html`, `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Expansion assets · ${generated.length}/94</title><style>body{margin:24px;background:#f5f2e8;color:#293b2b;font:14px system-ui}h1{font-size:26px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}article{background:white;border:1px solid #d9dfd1;border-radius:12px;overflow:hidden}.preview{height:260px;display:flex;align-items:center;justify-content:center;background:repeating-conic-gradient(#d4d7cf 0 25%,#f8f8f4 0 50%) 0/20px 20px}.preview a{width:100%;height:100%}img{width:100%;height:100%;object-fit:contain}h2,p{margin:12px;font-size:13px;overflow-wrap:anywhere}body>p{margin:12px 0;max-width:1000px;line-height:1.6}h2{font-size:14px}a{color:#1f674e}.note{color:#9a5213}.controls{display:flex;gap:12px;margin:20px 0;flex-wrap:wrap}select,button{padding:9px;border-radius:6px;border:1px solid #aab7aa}article[hidden]{display:none}body.dark .preview{background:#25352b}body.light .preview{background:#fff}</style><h1>Bộ mở rộng · ${generated.length} / 94 ảnh đã tạo</h1><p>Công cụ báo hết hạn mức. Còn ${pending.length} ảnh cây; thời điểm mở lại do công cụ báo: khoảng 02:13 ngày 30/10/2026 (giờ Việt Nam).</p><p>Giữ PNG gốc 1254×1254 với alpha thật. Đã lưu asset để duyệt, chưa đăng ký vào game. Chùa gỗ cấp 3 cần tạo lại phần móng bị cắt. Ngã tư đã được tạo lại với bốn đầu mở theo trục chéo; xem ghép đường tại roads.html. Điểm neo, tỉ lệ các cấp và đầu nối ô cần căn khi tích hợp.</p><div class="controls"><select id="status"><option value="all">Tất cả</option><option value="generated">Đã tạo</option><option value="pending">Còn thiếu</option><option value="review">Có ghi chú cần sửa</option></select><select id="folder"><option value="all">Mọi nhóm</option>${Object.keys(counts).map(f=>`<option>${f}</option>`).join('')}</select><button id="background">Đổi nền xem alpha</button><span id="visible"></span></div><div class="grid">${cards}</div><script>const s=document.querySelector('#status'),f=document.querySelector('#folder'),cards=[...document.querySelectorAll('article')];function filter(){let n=0;for(const c of cards){c.hidden=!((s.value==='all'||s.value===c.dataset.status||(s.value==='review'&&c.dataset.review==='true'))&&(f.value==='all'||f.value===c.dataset.folder));if(!c.hidden)n++}document.querySelector('#visible').textContent=n+' mục'}s.onchange=f.onchange=filter;let bg=0;document.querySelector('#background').onclick=()=>{document.body.className=['','dark','light'][++bg%3]};filter();</script></html>`);

const notes = `# Expansion asset generation — 2026-10-29\n\nBuilt-in imagegen mode, one request per PNG, genuine transparent background.\nSource prompts: docs/EXPANSION_ASSET_PROMPTS.md; original combined prompts and actual selected-output prompts are stored in docs/generated-assets/expansion. Same-family prior stages/levels were supplied as image references. Roads use the straight-road reference. The canal's selected output is a targeted edit of its first generated version.\n\nGenerated **${generated.length}/94** PNGs; **${pending.length} remain** because imagegen returned HTTP 429 usage_limit_reached. Reported reset: approximately 02:13 on 30 October 2026, Vietnam time. No automatic retry is scheduled.\n\nNative outputs are 1254×1254 RGBA, preserved byte-for-byte, consistent with rule 9 of the prompt document. Source and public copies have matching SHA-256 hashes. No renderer/economy integration was performed.\n\n## Review before integration\n\n- wooden_buddhist_temple_lv3.png: front foundation clipped at bottom; regenerate with wider framing.\n- stone_road_crossroads.png: regenerated 30 October with four diagonal arms and open flat end cuts, matching the approved original straight paving. Native road borders now draw directly; preview: /assets/expansion/roads.html.\n- Ground modules need pixel-level connector alignment and seam testing.\n- All anchors and relative stage/level scale require calibration; the model did not obey exact working-box coordinates consistently.\n- Some native cutout edges show coloured fringe. Inspect against the actual map and repair before integration.\n\n## Remaining images\n\n${pending.map(i=>'- '+i.filename).join('\n')}\n\n## Locations\n\n- Original source copies: assets-source/expansion/{buildings,props,gardens,terrain,landmarks,animals,plants}.\n- Public copies and preview gallery: public/assets/expansion/index.html.\n- Local gallery URL: http://localhost:3000/assets/expansion/index.html.\n- Manifest and validation: assets-source/expansion/manifest.json and validation.json.\n- Pending combined prompts: docs/generated-assets/expansion/pending.json.\n- Discarded canal revision: assets-source/expansion/revisions.\n`;
const currentNotes = notes
  .replace('# Expansion asset generation — 2026-10-29', '# Expansion asset generation — 2026-10-29 / 2026-10-30')
  .replace(/Generated \*\*[\s\S]*?No automatic retry is scheduled\./, `Generated **${generated.length}/94** PNGs; **${pending.length} remain**. Generation resumed on 30 October after the previous usage limit cleared. The orange fruiting image was regenerated to preserve the flowering silhouette; the discarded oversized output is archived under revisions.`)
  .replace('No renderer/economy integration was performed.', '44 subjects have shop registration; see docs/EXPANSION_INTEGRATION.md. The newly generated plant stages are source art and are not yet connected to a five-stage harvest lifecycle.');
fs.writeFileSync(`${root}/README.md`, currentNotes);
fs.writeFileSync(`${promptRoot}/GENERATION_NOTES.md`, currentNotes);

let gallery = fs.readFileSync(`${publicRoot}/index.html`, 'utf8');
gallery = gallery.replace(/<p>Công cụ báo hết hạn mức\.[\s\S]*?<\/p>/,
  `<p>${pending.length ? `Còn ${pending.length} ảnh đang chờ tạo.` : 'Đã tạo đủ 94 PNG. Tám loại cây đều có năm giai đoạn.'} <a href="./plants.html">Xem bộ cây theo giai đoạn</a>.</p>`)
  .replace('Đã lưu asset để duyệt, chưa đăng ký vào game.', 'Các vật phẩm đã có trong cửa hàng; ảnh cây mới được lưu riêng để ghép chu kỳ sinh trưởng.')
  .replaceAll('Chưa tạo · hết hạn mức', 'Đang chờ tạo');
fs.writeFileSync(`${publicRoot}/index.html`, gallery);
const stageLabels = ['Cây con', 'Cây non', 'Trổ hoa', 'Kết trái', 'Héo sau thu hoạch'];
const plantGroups = [...new Set(manifest.items.filter(i=>i.folder==='plants').map(i=>i.group))];
const rows = plantGroups.map(group => {
  const stages = manifest.items.filter(i=>i.group===group).sort((a,b)=>a.stage-b.stage);
  return `<section><h2>${esc(stages[0].title)}</h2><div class="stages">${stages.map(i=>`<article><h3>${stageLabels[i.stage-1]}</h3><a href="./plants/${i.filename}" target="_blank"><img src="./plants/${i.filename}?v=${i.sha256.slice(0,12)}" alt="${esc(i.title)} — ${stageLabels[i.stage-1]}"></a><a href="./plants/${i.filename}" download>Tải PNG</a></article>`).join('')}</div></section>`;
}).join('');
fs.writeFileSync(`${publicRoot}/plants.html`, `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Cây ăn trái · năm giai đoạn</title><style>body{margin:24px;color:#243d2e;background:#f3f1e8;font:14px system-ui}h1{font-size:26px}h2{font-size:19px;margin-top:30px}.stages{display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:12px;overflow:auto}article{background:white;border:1px solid #d9dfd1;border-radius:10px;text-align:center;padding-bottom:12px}h3{font-size:14px}img{display:block;width:100%;aspect-ratio:1;object-fit:contain;background:repeating-conic-gradient(#e0e5d9 0 25%,#fafbf8 0 50%) 0/16px 16px}a{color:#24614b}button{padding:8px;margin:8px 0}body.dark img{background:#213b2a}body.light img{background:#fff}</style><h1>Cây ăn trái · đủ năm giai đoạn</h1><p>Tám loài · 40 PNG gốc nền trong suốt, cùng khung hình. Các ảnh vẫn cần căn điểm neo khi đưa vào chu kỳ sinh trưởng trong game.</p><a href="./index.html">← Toàn bộ 94 ảnh</a><br><button id="bg">Đổi nền kiểm tra alpha</button>${rows}<script>let bg=0;document.querySelector('#bg').onclick=()=>{document.body.className=['','dark','light'][++bg%3]};</script></html>`);
console.log(JSON.stringify({generated:generated.length,pending:pending.length,counts,bytes,validation:'passed',gallery:`${publicRoot}/index.html`},null,2));
