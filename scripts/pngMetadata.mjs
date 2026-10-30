import zlib from "node:zlib";
export function inspectPng(data,{measureFoot=false}={}){
 const width=data.readUInt32BE(16),height=data.readUInt32BE(20),depth=data[24],colorType=data[25];
 if(depth!==8||colorType!==6)throw Error('Expected 8-bit RGBA PNG');
 const chunks=[];for(let p=8;p<data.length;){const n=data.readUInt32BE(p),type=data.toString('ascii',p+4,p+8);if(type==='IDAT')chunks.push(data.subarray(p+8,p+8+n));p+=n+12;}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=width*4;let previous=Buffer.alloc(stride),cursor=0,min=255,max=0,x0=width,y0=height,x1=0,y1=0;
 const footRows=[];
 const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};
 for(let y=0;y<height;y++){
  const filter=raw[cursor++],row=Buffer.from(raw.subarray(cursor,cursor+stride));cursor+=stride;
  for(let x=0;x<stride;x++){const a=x>=4?row[x-4]:0,b=previous[x],c=x>=4?previous[x-4]:0;row[x]=(row[x]+(filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):paeth(a,b,c)))&255;}
  let footSum=0,footCount=0;
  for(let x=0;x<width;x++){const a=row[x*4+3];min=Math.min(min,a);max=Math.max(max,a);if(a>128){x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);if(measureFoot){footSum+=x;footCount++;}}}
  if(measureFoot&&footCount){footRows.push({y,sum:footSum,count:footCount});if(footRows.length>12)footRows.shift();}
  previous=row;
 }
 const result={width,height,mode:'RGBA',alphaMin:min,alphaMax:max,opaqueBounds:[x0,y0,x1,y1]};
 if(measureFoot){const band=footRows.filter(r=>r.y>=y1-12);result.anchor={x:band.reduce((n,r)=>n+r.sum,0)/band.reduce((n,r)=>n+r.count,0),y:y1-1};}
 return result;
}
