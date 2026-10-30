// Read-only PNG geometry inspection; generated image bytes are never modified.
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const geometry = {}, manifest = [];
for (const level of [1,2,3]) {
  const uri = `/assets/buildings/bbq_restaurant_lv${level}.png`;
  const png = fs.readFileSync(`public${uri}`);
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  if(png[24]!==8 || png[25]!==6 || png[28]!==0) throw Error('Expected non-interlaced 8-bit RGBA');
  const chunks=[];
  for(let p=8;p<png.length;) {const n=png.readUInt32BE(p);if(png.toString('ascii',p+4,p+8)==='IDAT') chunks.push(png.subarray(p+8,p+8+n));p+=12+n;}
  const packed=zlib.inflateSync(Buffer.concat(chunks)),stride=width*4,rgba=Buffer.alloc(stride*height);
  let offset=0;
  for(let y=0;y<height;y++) {
    const filter=packed[offset++];
    for(let x=0;x<stride;x++) {
      const i=y*stride+x,a=x>=4?rgba[i-4]:0,b=y?rgba[i-stride]:0,c=y&&x>=4?rgba[i-stride-4]:0;
      let predictor=0;
      if(filter===1)predictor=a;
      else if(filter===2)predictor=b;
      else if(filter===3)predictor=Math.floor((a+b)/2);
      else if(filter===4){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);predictor=pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
      else if(filter!==0)throw Error('Invalid PNG filter');
      rgba[i]=(packed[offset++]+predictor)&255;
    }
  }
  let minX=width,maxX=0,minY=height,maxY=0,transparent=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const a=rgba[(y*width+x)*4+3];if(!a)transparent++;
    if(a>=128){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  }
  const foot=[];
  for(let y=maxY-3;y<=maxY;y++)for(let x=minX;x<=maxX;x++)if(rgba[(y*width+x)*4+3]>=128)foot.push(x);
  foot.sort((a,b)=>a-b);
  if(!transparent||minX<2||minY<2||maxX>=width-2||maxY>=height-2)throw Error('Clipped or non-transparent asset');
  geometry[level]={width,height,visibleWidth:maxX-minX+1,anchorX:foot[Math.floor(foot.length/2)],anchorY:maxY+1,worldWidth:128+(level-1)*16,worldAnchorX:64,worldAnchorY:128};
  // Cấp 2 có bếp nhô ra và cấp 3 có ghế phía trước: neo góc móng chính,
  // không lấy chân của đạo cụ nhô ra làm tâm công trình.
  if(level===2) Object.assign(geometry[level],{anchorX:788,anchorY:1107});
  if(level===3) Object.assign(geometry[level],{anchorX:800,anchorY:1160});
  manifest.push({level,uri,sha256:crypto.createHash('sha256').update(png).digest('hex'),bounds:{minX,minY,maxX,maxY},transparentFraction:transparent/(width*height)});
}
fs.writeFileSync('docs/generated-assets/restaurant/geometry.json',JSON.stringify(geometry,null,2)+'\n');
fs.writeFileSync('docs/generated-assets/restaurant/manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({geometry,manifest},null,2));
