import {ORIGIN_X,ORIGIN_Y,HALF_W,QUARTER_W} from './isoMath.js';
let goblinImage;
const position=(r,c)=>({x:ORIGIN_X+(c-r)*HALF_W+64,y:ORIGIN_Y+(r+c)*QUARTER_W+96});
export function drawGoblin(ctx,enemy,animTime){
  if(!goblinImage){goblinImage=new Image();goblinImage.src='/assets/combat/goblin.svg';}
  const {x,y}=position(enemy.r,enemy.c),bob=enemy.path?.length?Math.sin(animTime*10)*1.2:0;
  ctx.save();
  if(goblinImage.complete&&goblinImage.naturalWidth)ctx.drawImage(goblinImage,x-14,y-32+bob,28,32);
  else{ctx.font='24px sans-serif';ctx.textAlign='center';ctx.fillText('👺',x,y-3+bob);}
  ctx.restore();
}
export function drawDefenseOverlay(ctx,state,grid){
  if(!state)return;
  ctx.save();ctx.font='bold 10px sans-serif';ctx.textAlign='center';
  for(const [key,tower] of Object.entries(state.towers||{})){
    const [r,c]=key.split('_').map(Number);if(grid[r]?.[c]!=='b08_watchtower')continue;
    const {x,y}=position(r,c);
    if(tower.flash>0&&tower.aim){
      const aim=position(tower.aim.r,tower.aim.c);ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(x,y-52);ctx.lineTo(aim.x,aim.y-16);ctx.stroke();
    }
    if(tower.hp<100){ctx.fillStyle='#7f1d1d';ctx.fillText(`🛠 ${Math.ceil(tower.hp)}/100`,x,y-4);}
  }
  for(const enemy of state.enemies||[]){
    if(enemy.hp<=0)continue;const {x,y}=position(enemy.r,enemy.c);
    ctx.fillStyle='#2b2020';ctx.fillRect(x-12,y-38,24,4);ctx.fillStyle='#ef4444';
    ctx.fillRect(x-12,y-38,24*Math.max(0,Math.min(1,enemy.hp/enemy.maxHp)),4);
  }
  if(state.villageHp<100){
    const hall=[];for(let r=0;r<grid.length;r++)for(let c=0;c<grid[r].length;c++)if(grid[r][c]==='b14_town_hall')hall.push({r,c});
    hall.sort((a,b)=>b.r+b.c-a.r-a.c);if(hall.length){const {x,y}=position(hall[0].r,hall[0].c);ctx.fillStyle='#7f1d1d';ctx.fillText(`🛡 ${Math.ceil(state.villageHp)}/100`,x,y-32);}
  }
  ctx.restore();
}
