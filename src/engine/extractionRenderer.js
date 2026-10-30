const images = {};
export function drawExtractionWorker(c2d, job, config, ox, oy, halfW, quarterW, animTime) {
  const x=ox+(job.c-job.r)*halfW+64,y=oy+(job.r+job.c)*quarterW+96;
  const sprite=config.resource==='wood'?'farmer_old':'blacksmith';
  if(!images[sprite]){const im=new Image();im.src=`/assets/villagers/${sprite}.png`;images[sprite]=im;}
  const img=images[sprite], bob=job.path.length?Math.sin(animTime*12)*1.4:0;
  c2d.save();
  if(img.complete&&img.naturalWidth>0){const h=32,w=h*img.naturalWidth/img.naturalHeight;c2d.drawImage(img,x-w/2,y-h+bob,w,h);}
  else{c2d.fillStyle=config.resource==='wood'?'#a16207':'#475569';c2d.fillRect(x-4,y-17+bob,8,17);c2d.fillStyle='#f6d1a5';c2d.fillRect(x-3,y-23+bob,6,6);}
  c2d.font='12px sans-serif';c2d.textAlign='center';c2d.fillText(job.load?config.icon:job.phase==='working'?'⛏️':'',x+9,y-17+bob);
  c2d.restore();
}
