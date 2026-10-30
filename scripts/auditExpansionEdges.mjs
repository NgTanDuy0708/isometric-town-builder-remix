import fs from 'node:fs';
import zlib from 'node:zlib';
const manifest=JSON.parse(fs.readFileSync('assets-source/expansion/manifest.json','utf8'));
for(const name of process.argv.slice(2)){
 const item=manifest.items.find(i=>i.filename===name),data=fs.readFileSync(item.sourcePath);
 const w=data.readUInt32BE(16),h=data.readUInt32BE(20),chunks=[];
 for(let p=8;p<data.length;){const n=data.readUInt32BE(p);if(data.toString('ascii',p+4,p+8)==='IDAT')chunks.push(data.subarray(p+8,p+8+n));p+=n+12;}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=w*4;let prev=Buffer.alloc(stride),cursor=0;
 const red={transparent:0,faint:0,partial:0,opaque:0};
 const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};
 for(let y=0;y<h;y++){
  const filter=raw[cursor++],row=Buffer.from(raw.subarray(cursor,cursor+stride));cursor+=stride;
  for(let x=0;x<stride;x++){const a=x>=4?row[x-4]:0,b=prev[x],c=x>=4?prev[x-4]:0;row[x]=(row[x]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}
  for(let x=0;x<w;x++){const k=x*4;if(row[k]>245&&row[k+1]<10&&row[k+2]<10){const a=row[k+3];red[a===0?'transparent':a<16?'faint':a<240?'partial':'opaque']++;}}
  prev=row;
 }
 console.log(JSON.stringify({filename:name,pureRedPixels:red}));
}
