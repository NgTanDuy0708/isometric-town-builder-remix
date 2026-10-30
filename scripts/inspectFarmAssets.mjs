// Inspect native generated PNGs without cropping, stretching or changing pixels.
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

export function inspectPng(file) {
  const png=fs.readFileSync(file),width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  if(png[24]!==8||png[25]!==6||png[28]!==0)throw Error('Expected non-interlaced 8-bit RGBA: '+file);
  const chunks=[];
  for(let p=8;p<png.length;) {
    const n=png.readUInt32BE(p);
    if(png.toString('ascii',p+4,p+8)==='IDAT')chunks.push(png.subarray(p+8,p+8+n));
    p+=12+n;
  }
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
    const alpha=rgba[(y*width+x)*4+3];if(alpha===0)transparent++;
    if(alpha>=128){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  }
  const foot=[];
  for(let y=maxY-3;y<=maxY;y++)for(let x=minX;x<=maxX;x++)if(rgba[(y*width+x)*4+3]>=128)foot.push(x);
  foot.sort((a,b)=>a-b);
  const profile=[];
  for(let x=minX;x<=maxX;x+=Math.max(1,Math.floor((maxX-minX)/12))) {
    let bottom=-1;for(let y=maxY;y>=minY;y--)if(rgba[(y*width+x)*4+3]>=128){bottom=y;break;}
    profile.push([x,bottom]);
  }
  return {width,height,sha256:crypto.createHash('sha256').update(png).digest('hex'),
    bounds:{minX,minY,maxX,maxY},visibleWidth:maxX-minX+1,
    foot:{x:foot[Math.floor(foot.length/2)],y:maxY+1},transparentFraction:transparent/(width*height),profile};
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/inspectFarmAssets.mjs')) {
  for(const name of ['cow_barn_v3','pig_pen_v3','sheep_barn_v3','chicken_coop_v3']) {
    const file=`public/assets/farm/${name}.png`;
    if(fs.existsSync(file))console.log(JSON.stringify({file,...inspectPng(file)},null,2));
  }
}
