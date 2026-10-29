import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import zlib from 'node:zlib';
const manifestPath='assets-source/expansion/manifest.json';
const lock=manifestPath+'.lock';let owned=false;
for(let attempt=0;attempt<600;attempt++){try{fs.closeSync(fs.openSync(lock,'wx'));owned=true;break;}catch(e){if(e.code!=='EEXIST')throw e;await new Promise(r=>setTimeout(r,50));}}
if(!owned)throw Error('Manifest lock timeout');
process.on('exit',()=>{if(owned){try{fs.unlinkSync(lock);}catch{}}});
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
function inspect(data){
 const width=data.readUInt32BE(16),height=data.readUInt32BE(20),depth=data[24],colorType=data[25];
 if(depth!==8||colorType!==6)throw Error('Expected 8-bit RGBA PNG');
 const chunks=[];for(let p=8;p<data.length;){const n=data.readUInt32BE(p),type=data.toString('ascii',p+4,p+8);if(type==='IDAT')chunks.push(data.subarray(p+8,p+8+n));p+=n+12;}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=width*4;let previous=Buffer.alloc(stride),cursor=0,min=255,max=0,x0=width,y0=height,x1=0,y1=0;
 const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};
 for(let y=0;y<height;y++){
  const filter=raw[cursor++],row=Buffer.from(raw.subarray(cursor,cursor+stride));cursor+=stride;
  for(let x=0;x<stride;x++){const a=x>=4?row[x-4]:0,b=previous[x],c=x>=4?previous[x-4]:0;row[x]=(row[x]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}
  for(let x=0;x<width;x++){const a=row[x*4+3];min=Math.min(min,a);max=Math.max(max,a);if(a>128){x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);}}
  previous=row;
 }
 return{width,height,mode:'RGBA',alphaMin:min,alphaMax:max,opaqueBounds:[x0,y0,x1,y1]};
}
const replace=process.argv.includes('--replace');const args=process.argv.slice(2).filter(a=>a!=='--replace');
for(let p=0;p<args.length;p+=2){
 const [filename,generatedPath]=args.slice(p,p+2),item=manifest.items.find(i=>i.filename===filename);if(!item)throw Error('Unknown asset '+filename);
 const bytes=fs.readFileSync(generatedPath),meta=inspect(bytes);if(meta.alphaMin!==0||meta.alphaMax<128)throw Error('Invalid transparent asset '+filename);
 const source=path.join('assets-source/expansion',item.folder,filename),dest=path.join('public/assets/expansion',item.folder,filename);
 for(const file of [source,dest]){if(fs.existsSync(file)&&!fs.readFileSync(file).equals(bytes)){if(!replace)throw Error('Refusing to overwrite '+file);if(file===source){fs.mkdirSync('assets-source/expansion/revisions',{recursive:true});fs.copyFileSync(file,path.join('assets-source/expansion/revisions',filename.replace('.png','.'+Date.now()+'.png')));}}fs.writeFileSync(file,bytes);}
 Object.assign(item,{status:'generated',generatedPath,sourcePath:source,gameAssetPath:dest,metadata:meta,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 console.log(JSON.stringify({file:filename,...meta}));
}
manifest.completed=manifest.items.filter(i=>i.status==='generated').length;fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
fs.writeFileSync('public/assets/expansion/manifest.json',JSON.stringify({...manifest,items:manifest.items.map(({prompt,...item})=>item)},null,2));
const cards=manifest.items.map(i=>`<article class="${i.status}"><div>${i.status==='generated'?`<img loading="lazy" src="./${i.folder}/${i.filename}" alt="${i.filename}">`:'<span>Đang chờ tạo</span>'}</div><h2>${i.filename}</h2><p>${i.title} · ${i.metadata?i.metadata.width+' × '+i.metadata.height:'Chưa có ảnh'}</p></article>`).join('');
fs.writeFileSync('public/assets/expansion/index.html',`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Expansion assets · ${manifest.completed}/94</title><style>body{margin:24px;background:#f5f2e8;color:#293b2b;font:14px system-ui}h1{font-size:26px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}article{background:white;border:1px solid #d9dfd1;border-radius:12px;overflow:hidden}article>div{height:240px;display:flex;align-items:center;justify-content:center;background:repeating-conic-gradient(#ecece6 0 25%,#fff 0 50%) 0/20px 20px}img{width:100%;height:100%;object-fit:contain}h2,p{margin:10px;font-size:12px;overflow-wrap:anywhere}article.pending{opacity:.45}</style><h1>Bộ mở rộng · ${manifest.completed} / 94 ảnh</h1><p>PNG gốc có alpha. Mỗi cấp và giai đoạn là một file riêng.</p><div class="grid">${cards}</div>`);
console.log('Completed',manifest.completed,'/',manifest.total);
