import fs from 'node:fs';
import crypto from 'node:crypto';
import {inspectPng} from './pngMetadata.mjs';
const dir='docs/generated-assets/stone-deposit';
const request=JSON.parse(fs.readFileSync(dir+'/output.json','utf8'));
const bytes=fs.readFileSync(request.path),metadata=inspectPng(bytes,{measureFoot:true});
const [left,top,right,bottom]=metadata.opaqueBounds;
if(metadata.alphaMin!==0||metadata.alphaMax!==255||left<=0||top<=0||right>=metadata.width||bottom>=metadata.height)
  throw Error('Stone deposit needs true transparency and an unclipped silhouette');
const sourcePath='assets-source/stone-deposit/stone_deposit.png';
const gameAssetPath='public/assets/decorations/stone_deposit.png';
for(const path of [sourcePath,gameAssetPath]){
  fs.mkdirSync(path.slice(0,path.lastIndexOf('/')),{recursive:true});
  if(fs.existsSync(path)){
    if(!fs.readFileSync(path).equals(bytes))throw Error('Refusing to overwrite different PNG: '+path);
  }else fs.writeFileSync(path,bytes);
}
const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
const art={uri:'/assets/decorations/stone_deposit.png?v='+sha256.slice(0,12),sha256,...metadata};
const geometry={1:{width:metadata.width,height:metadata.height,visibleWidth:right-left,
  anchorX:metadata.anchor.x,anchorY:metadata.anchor.y,worldWidth:112}};
fs.writeFileSync('src/data/stoneDepositArtData.js','// Native stone resource PNG, measured by scripts/recordStoneDepositAsset.mjs.\nexport const STONE_DEPOSIT_ART = '+JSON.stringify(art,null,2)+';\nexport const STONE_DEPOSIT_GEOMETRY = '+JSON.stringify(geometry,null,2)+';\n');
fs.writeFileSync(dir+'/manifest.json',JSON.stringify({mode:'built-in ImageGen',tileId:'n02_stone_deposit',...request,sourcePath,gameAssetPath,generationPromptPath:dir+'/prompt.txt',...art},null,2)+'\n');
console.log('Registered stone deposit PNG with measured ground contact.');
