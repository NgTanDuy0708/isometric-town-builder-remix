import fs from 'node:fs';
import {SINGLE_SEED_ART} from '../src/data/singleSeedSpriteData.js';
import {CROPS_CONFIG} from '../src/data/cropsConfig.js';
import {getSownCropRenderAdjustment} from '../src/data/cropVisuals.js';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const cards=Object.entries(SINGLE_SEED_ART).map(([id,a])=>{
  const [x,y,right,bottom]=a.bounds;
  const scale=Math.min(150/(right-x),90/(bottom-y));
  const rect=getSownCropRenderAdjustment(id);
  const miniature=rect?`<div class="tile"><img src="${a.uri}" style="left:${rect.dx}px;top:${rect.dy}px;width:${rect.dw}px;height:${rect.dh}px"></div>`:'';
  return `<article><h2>${esc(CROPS_CONFIG[id]?.shortName||'Việt quất')}</h2><div class="preview"><img src="${a.uri}" style="left:${(190-(right-x)*scale)/2-x*scale}px;top:${(120-(bottom-y)*scale)/2-y*scale}px;width:${a.width*scale}px;height:${a.height*scale}px"></div>${miniature}<a href="${a.uri}" download>Tải PNG gốc</a></article>`;
}).join('');
fs.writeFileSync('public/assets/seeds/single-v1/index.html',`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Hạt gieo · một hạt một cây</title><style>body{font:15px system-ui;background:#edf0e5;color:#253b2c;margin:24px}h1{font-size:24px}h2{font-size:16px}.grid{display:flex;flex-wrap:wrap;gap:16px}article{background:white;padding:12px;border-radius:10px;width:190px;text-align:center}.preview{height:120px;position:relative;overflow:hidden;background:repeating-conic-gradient(#d6dfce 0 25%,#f6f9f2 0 50%) 0/16px 16px}img{position:absolute;max-width:none;image-rendering:pixelated}.tile{position:relative;width:128px;height:128px;margin:0 auto;background:#855c22;clip-path:polygon(0 75%,50% 50%,100% 75%,50% 100%)}a{color:#276645}</style><h1>Một hạt gieo → một cây</h1><p>19 PNG tạo bằng built-in ImageGen, nền trong suốt. Ảnh phóng lớn phía trên; kích thước trong ô game phía dưới.</p><p><a href="/">Mở game</a></p><div class="grid">${cards}</div></html>`);
console.log('Gallery: /assets/seeds/single-v1/index.html');
