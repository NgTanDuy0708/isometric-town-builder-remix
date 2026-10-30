import fs from 'node:fs';
import zlib from 'node:zlib';
import {FRUIT_TREES_CONFIG,FRUIT_TREE_STAGES} from '../src/data/fruitTreeConfig.js';
const manifest=JSON.parse(fs.readFileSync('assets-source/expansion/manifest.json','utf8'));
const early=JSON.parse(fs.readFileSync('assets-source/expansion/fruit-early-manifest.json','utf8'));
const singleSeedPath='docs/generated-assets/single-seeds/manifest.json';
const singleSeeds=fs.existsSync(singleSeedPath)?JSON.parse(fs.readFileSync(singleSeedPath,'utf8')).items.filter(item=>item.kind==='fruit'):[];
const items=[...singleSeeds,...manifest.items,...early.items];
function foot(bytes,bounds){
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),chunks=[];
 for(let p=8;p<bytes.length;){const n=bytes.readUInt32BE(p);if(bytes.toString('ascii',p+4,p+8)==='IDAT')chunks.push(bytes.subarray(p+8,p+8+n));p+=n+12}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=width*4;let previous=Buffer.alloc(stride),cursor=0,sum=0,count=0;
 const paeth=(a,b,c)=>{const p=a+b-c,A=Math.abs(p-a),B=Math.abs(p-b),C=Math.abs(p-c);return A<=B&&A<=C?a:B<=C?b:c};
 for(let y=0;y<height;y++){const filter=raw[cursor++],row=Buffer.from(raw.subarray(cursor,cursor+stride));cursor+=stride;
  for(let x=0;x<stride;x++){const a=x>=4?row[x-4]:0,b=previous[x],c=x>=4?previous[x-4]:0;row[x]=(row[x]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255}
  if(y>=bounds[3]-12&&y<bounds[3])for(let x=0;x<width;x++)if(row[x*4+3]>128){sum+=x;count++}
  previous=row;
 }
 return {x:Math.round(sum/count*100)/100,y:bounds[3]-1};
}
const result={};
for(const [id,cfg] of Object.entries(FRUIT_TREES_CONFIG)){
 const stages={},geometry={};
 for(const stage of FRUIT_TREE_STAGES){
  const item=items.find(i=>i.filename===cfg.stem+'_'+stage+'.png');
  if(!item||item.status!=='generated')throw Error('Missing '+id+' '+stage);
  const m=item.metadata;
  stages[stage]=item.uri||'/assets/expansion/plants/'+item.filename+'?v='+item.sha256.slice(0,12);
  geometry[stage]={width:m.width,height:m.height,bounds:m.opaqueBounds,anchor:foot(fs.readFileSync(item.gameAssetPath),m.opaqueBounds),sha256:item.sha256};
 }
 const matureWidth=Math.max(...['flowering','fruiting','withered'].map(s=>geometry[s].bounds[2]-geometry[s].bounds[0]));
 result[id]={shopCategory:'farming',stages,geometry,matureWidth,worldWidth:id==='d37_blueberry_bush'?80:112};
}
fs.writeFileSync('src/data/fruitTreeSpriteData.js','// Generated from native PNG alpha by scripts/syncFruitTreeSprites.mjs.\nexport const FRUIT_TREE_SPRITE_DATA = '+JSON.stringify(result,null,2)+';\n');
console.log('Registered 8 species / 56 native stages with foot anchors.');

