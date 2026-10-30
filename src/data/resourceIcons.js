import {RUNTIME_ART} from './runtimeArtData.js';

export const RESOURCE_ICON_URIS=Object.fromEntries(Object.entries(RUNTIME_ART.icon).map(([id,data])=>[id,data.uri]));
const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function resourceIconHtml(id,label='',size=24,fallback='📦') {
  const uri=RESOURCE_ICON_URIS[id];
  return uri?`<img src="${uri}" alt="${escapeHtml(label)}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated;vertical-align:middle;flex-shrink:0">`:escapeHtml(fallback);
}

export function visitorPortraitHtml(id,label='',size=64,fallback='👤') {
  const uri=RUNTIME_ART.visitor[id]?.uri;
  return uri?`<img src="${uri}" alt="${escapeHtml(label)}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;object-fit:contain;image-rendering:pixelated">`:escapeHtml(fallback);
}
