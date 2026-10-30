import fs from 'node:fs';
import crypto from 'node:crypto';
import {inspectPng} from './pngMetadata.mjs';
const requests=JSON.parse(fs.readFileSync('docs/generated-assets/fruit-lifecycle/prompt-set.json','utf8'));
const manifest={mode:requests.mode,total:requests.items.length,completed:0,items:[]};
for(const item of requests.items){
 const bytes=fs.readFileSync(item.generatedPath),metadata=inspectPng(bytes);
 if(metadata.alphaMin!==0||metadata.alphaMax!==255)throw Error('Missing true alpha: '+item.filename);
 const sourcePath='assets-source/expansion/plants/'+item.filename,gameAssetPath='public/assets/expansion/plants/'+item.filename;
 for(const file of [sourcePath,gameAssetPath]){
  if(fs.existsSync(file)&&!fs.readFileSync(file).equals(bytes))throw Error('Refusing to overwrite '+file);
  fs.writeFileSync(file,bytes);
 }
 const generationPromptPath='docs/generated-assets/fruit-lifecycle/'+item.filename.replace('.png','.actual.txt');
 fs.writeFileSync(generationPromptPath,item.prompt+'\n');
 manifest.items.push({...item,status:'generated',metadata,sourcePath,gameAssetPath,generationPromptPath,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 manifest.completed++;
 console.log(JSON.stringify({filename:item.filename,...metadata}));
}
fs.writeFileSync('assets-source/expansion/fruit-early-manifest.json',JSON.stringify(manifest,null,2));
fs.writeFileSync('public/assets/expansion/fruit-early-manifest.json',JSON.stringify({...manifest,items:manifest.items.map(({prompt,reference,generatedPath,...item})=>item)},null,2));
