import {ORIGIN_X,ORIGIN_Y,HALF_W,QUARTER_W} from './isoMath.js';
import {getMilitaryUnit} from '../data/militaryConfig.js';
import {COMBAT_SHEETS} from '../data/combatArtData.js';
import {prepareCombatImages,drawCombatCharacter} from './combatAnimation.js';
import {drawRaidCharacter} from './raidAnimation.js';
import {ENEMY_KINDS} from '../data/defenseConfig.js';
export const GOBLIN_SPRITE_URI=COMBAT_SHEETS.goblin.uri;
export function prepareDefenseSprites(onLoad){
  prepareCombatImages(onLoad);
}
const position=(r,c)=>({x:ORIGIN_X+(c-r)*HALF_W+64,y:ORIGIN_Y+(r+c)*QUARTER_W+96});
export function drawGoblin(ctx,enemy,animTime){
  prepareDefenseSprites();
  const {x,y}=position(enemy.r,enemy.c);
  ctx.save();
  if(!(enemy.kind&&enemy.kind!=='goblin'?drawRaidCharacter(ctx,enemy,x,y):drawCombatCharacter(ctx,'goblin',enemy,x,y,{height:50}))){
    ctx.font='36px sans-serif';ctx.textAlign='center';ctx.fillText(enemy.kind==='dragon'?'🐉':enemy.kind==='troll'?'🧌':'👺',x,y-3);
  }
  ctx.restore();
}
export function drawSoldier(ctx,soldier,animTime){
  prepareDefenseSprites();const {x,y}=position(soldier.r,soldier.c);
  ctx.save();
  if(soldier.hp<=0)ctx.globalAlpha=.5;
  if(!drawCombatCharacter(ctx,soldier.unitType==='mage'?'mage':'guard',soldier,x,y,{height:54})){
    ctx.font='32px sans-serif';ctx.textAlign='center';ctx.fillText(soldier.unitType==='mage'?'🧙':'🛡️',x,y-4);
  }
  ctx.restore();
}
export function drawDefenseOverlay(ctx,state,grid){
  if(!state)return;
  ctx.save();ctx.font='bold 10px sans-serif';ctx.textAlign='center';
  if(['warning','battle'].includes(state.phase)&&state.raid?.spawn){
    const {x,y}=position(state.raid.spawn.r,state.raid.spawn.c);
    ctx.strokeStyle='#dc2626';ctx.lineWidth=3;ctx.fillStyle='#dc262622';
    ctx.beginPath();ctx.moveTo(x,y-32);ctx.lineTo(x+64,y);ctx.lineTo(x,y+32);ctx.lineTo(x-64,y);ctx.closePath();ctx.fill();ctx.stroke();
    const name=(ENEMY_KINDS[state.raid.kind]?.name||'Goblin').toUpperCase();
    ctx.fillStyle='#7f1d1d';ctx.fillText(state.phase==='warning'?`${name} TỚI SAU ${Math.ceil(state.remaining)}s`:`LỐI ${name} VÀO`,x,y-44);
  }
  for(const [key,tower] of Object.entries(state.towers||{})){
    const [r,c]=key.split('_').map(Number);if(grid[r]?.[c]!=='b08_watchtower')continue;
    const {x,y}=position(r,c);
    if(tower.flash>0&&tower.aim){
      const aim=position(tower.aim.r,tower.aim.c),progress=Math.max(0,Math.min(1,1-tower.flash/.18));
      const dx=aim.x-x,dy=aim.y-16-(y-52),length=Math.hypot(dx,dy)||1;
      const ux=dx/length,uy=dy/length,px=x+dx*progress,py=y-52+dy*progress;
      // A short wooden arrow travels to the target; never draw a full-range beam.
      ctx.strokeStyle='#8b4513';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(px-ux*12,py-uy*12);ctx.lineTo(px,py);ctx.stroke();
      ctx.fillStyle='#e2e8f0';ctx.beginPath();ctx.moveTo(px+ux*4,py+uy*4);
      ctx.lineTo(px-ux*3-uy*3,py-uy*3+ux*3);
      ctx.lineTo(px-ux*3+uy*3,py-uy*3-ux*3);ctx.closePath();ctx.fill();
    }
    if(tower.hp<100){ctx.fillStyle='#7f1d1d';ctx.fillText(`🛠 ${Math.ceil(tower.hp)}/100`,x,y-4);}
  }
  for(const enemy of state.enemies||[]){
    if(enemy.hp<=0)continue;const {x,y}=position(enemy.r,enemy.c);
    const top=enemy.flying?140:enemy.kind==='troll'?78:60;
    ctx.fillStyle='#2b2020';ctx.fillRect(x-16,y-top,32,5);ctx.fillStyle='#ef4444';
    ctx.fillRect(x-16,y-top,32*Math.max(0,Math.min(1,enemy.hp/enemy.maxHp)),5);
    if(enemy.fireFor>0&&enemy.fireAim){
      const aim=position(enemy.fireAim.r,enemy.fireAim.c),t=1-enemy.fireFor/.35;
      const fx=x+(aim.x-x)*t,fy=y-65+(aim.y-20-y+65)*t;
      ctx.fillStyle='#f97316';ctx.beginPath();ctx.ellipse(fx,fy,13,8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fde047';ctx.beginPath();ctx.ellipse(fx,fy,7,4,0,0,Math.PI*2);ctx.fill();
    }
  }
  for(const soldier of state.soldiers||[]){
    const {x,y}=position(soldier.r,soldier.c);
    ctx.fillStyle='#1e293b';ctx.fillRect(x-15,y-62,30,4);ctx.fillStyle=soldier.hp>0?'#3b82f6':'#94a3b8';
    ctx.fillRect(x-15,y-62,30*Math.max(0,Math.min(1,soldier.hp/getMilitaryUnit(soldier).hp)),4);
    if(soldier.spellFlash>0&&soldier.aim){
      const aim=position(soldier.aim.r,soldier.aim.c);ctx.strokeStyle='#a78bfa';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(x,y-30);ctx.lineTo(aim.x,aim.y-16);ctx.stroke();
      ctx.fillStyle='#a78bfa44';ctx.beginPath();ctx.ellipse(aim.x,aim.y,64,32,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    }
    if(soldier.trainLeft>0){ctx.fillStyle='#1e3a8a';ctx.fillText(`⏳ ${Math.ceil(soldier.trainLeft)}s`,x,y-68);}
  }
  if(state.villageHp<100){
    const hall=[];for(let r=0;r<grid.length;r++)for(let c=0;c<grid[r].length;c++)if(grid[r][c]==='b14_town_hall')hall.push({r,c});
    hall.sort((a,b)=>b.r+b.c-a.r-a.c);if(hall.length){const {x,y}=position(hall[0].r,hall[0].c);ctx.fillStyle='#7f1d1d';ctx.fillText(`🛡 ${Math.ceil(state.villageHp)}/100`,x,y-32);}
  }
  ctx.restore();
}
