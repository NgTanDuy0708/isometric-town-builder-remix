import fs from 'node:fs';
import crypto from 'node:crypto';
import {inspectPng} from './pngMetadata.mjs';

const folder='docs/generated-assets/runtime-art';
const requests=JSON.parse(fs.readFileSync(folder+'/prompt-set.json','utf8'));
for(const name of ['cabbage-prompt-set.json']){
  if(fs.existsSync(folder+'/'+name))requests.items.push(...JSON.parse(fs.readFileSync(folder+'/'+name,'utf8')).items);
}
const outputs=JSON.parse(fs.readFileSync(folder+'/outputs.json','utf8'));
const data={visitor:{},vehicle:{},wonder:{},watermelon:{},icon:{}},items=[];
for(const job of requests.items){
  const generatedPath=outputs[job.kind+'/'+job.id];if(!generatedPath)continue;
  data[job.kind] ||= {};
  const bytes=fs.readFileSync(generatedPath),metadata=inspectPng(bytes);
  if(metadata.alphaMin!==0||metadata.alphaMax!==255)throw Error('Missing real alpha: '+job.id);
  if(metadata.opaqueBounds[0]<=0||metadata.opaqueBounds[1]<=0||metadata.opaqueBounds[2]>=metadata.width||metadata.opaqueBounds[3]>=metadata.height)throw Error('Clipped asset: '+job.id);
  const sourcePath=`assets-source/runtime-art/${job.kind}/${job.filename}`,gameAssetPath=`public/assets/runtime-art/${job.kind}/${job.filename}`;
  for(const path of [sourcePath,gameAssetPath]){
    fs.mkdirSync(path.slice(0,path.lastIndexOf('/')),{recursive:true});
    if(fs.existsSync(path)){
      if(!fs.readFileSync(path).equals(bytes))throw Error('Refusing to overwrite a different asset: '+path);
    }else fs.writeFileSync(path,bytes);
  }
  const sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  fs.writeFileSync(`${folder}/${job.kind}-${job.id}.actual.txt`,job.prompt+'\n');
  data[job.kind][job.id]={uri:`/assets/runtime-art/${job.kind}/${job.filename}?v=${sha256.slice(0,12)}`,width:metadata.width,height:metadata.height,bounds:metadata.opaqueBounds,sha256};
  items.push({...job,generatedPath,sourcePath,gameAssetPath,metadata,sha256});
}
fs.writeFileSync('src/data/runtimeArtData.js','// Generated from reviewed native PNGs by scripts/recordRuntimeArt.mjs.\nexport const RUNTIME_ART = '+JSON.stringify(data,null,2)+';\n');
fs.mkdirSync('assets-source/runtime-art',{recursive:true});
fs.writeFileSync('assets-source/runtime-art/manifest.json',JSON.stringify({mode:requests.mode,total:requests.items.length,completed:items.length,items},null,2));
fs.mkdirSync('public/assets/runtime-art',{recursive:true});
fs.writeFileSync('public/assets/runtime-art/manifest.json',JSON.stringify({mode:requests.mode,total:requests.items.length,completed:items.length,items:items.map(({prompt,reference,generatedPath,sourcePath,...i})=>i)},null,2));
console.log(JSON.stringify({completed:items.length,total:requests.items.length}));
