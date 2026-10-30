import fs from 'node:fs';
import crypto from 'node:crypto';
import {inspectPng} from './pngMetadata.mjs';
const directory='docs/generated-assets/iron-mine';
const {jobs,reference}=JSON.parse(fs.readFileSync(directory+'/prompt-set.json','utf8'));
const outputs=JSON.parse(fs.readFileSync(directory+'/outputs.json','utf8'));
const art={},items=[],levels={},geometry={b66_iron_mine:{},n03_iron_deposit:{}};
for(const job of jobs){
  const generatedPath=outputs[job.id];
  if(!generatedPath)throw Error('Missing '+job.id);
  const bytes=fs.readFileSync(generatedPath),metadata=inspectPng(bytes,{measureFoot:true});
  const [left,top,right,bottom]=metadata.opaqueBounds;
  if(metadata.alphaMin!==0||metadata.alphaMax!==255||left<=0||top<=0||right>=metadata.width||bottom>=metadata.height)
    throw Error('Missing alpha or clipped image: '+job.id);
  const filename=job.id+'.png',sourcePath='assets-source/iron-mine/'+filename,gameAssetPath='public/assets/buildings/'+filename;
  for(const file of [sourcePath,gameAssetPath]){
    fs.mkdirSync(file.slice(0,file.lastIndexOf('/')),{recursive:true});
    if(fs.existsSync(file)){
      if(!fs.readFileSync(file).equals(bytes))throw Error('Refusing to replace different native image: '+file);
    }else fs.writeFileSync(file,bytes);
  }
  const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  const uri='/assets/buildings/'+filename+'?v='+sha256.slice(0,12);
  art[job.id]={uri,sha256,...metadata};
  const frame={width:metadata.width,height:metadata.height,visibleWidth:right-left,
    anchorX:metadata.anchor.x,anchorY:metadata.anchor.y,worldWidth:job.kind==='node'?112:({1:128,2:144,3:160})[job.level]};
  if(job.kind==='building'){levels[job.level]=uri;geometry.b66_iron_mine[job.level]=frame;}
  else geometry.n03_iron_deposit[1]=frame;
  const generationPromptPath=directory+'/'+job.id+'.actual.txt';
  fs.writeFileSync(generationPromptPath,job.prompt+'\n');
  items.push({...job,referencePath:job.level>1?outputs.iron_mine_lv1:reference,generatedPath,sourcePath,gameAssetPath,generationPromptPath,metadata,sha256,uri});
}
fs.writeFileSync(directory+'/manifest.json',JSON.stringify({mode:'built-in ImageGen',items},null,2)+'\n');
fs.writeFileSync('src/data/ironMineArtData.js','// Native generated PNGs, registered by scripts/recordIronMineAssets.mjs.\nexport const IRON_MINE_ART = '+JSON.stringify(art,null,2)+';\nexport const IRON_MINE_LEVEL_SPRITES = '+JSON.stringify(levels,null,2)+';\nexport const IRON_MINE_GEOMETRY = '+JSON.stringify(geometry,null,2)+';\n');
console.log('Registered three mine levels and one natural iron deposit, with native foot anchors.');
