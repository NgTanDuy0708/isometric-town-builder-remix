import {drawAnimatedCharacter} from './characterAnimation.js';
export function drawExtractionWorker(c2d, job, config, ox, oy, halfW, quarterW, animTime) {
  const x=ox+(job.c-job.r)*halfW+64,y=oy+(job.r+job.c)*quarterW+96;
  const lumber=['wood','ancientWood'].includes(config.resource),sprite=lumber?'farmer_old':'blacksmith';
  c2d.save();
  if(!drawAnimatedCharacter(c2d,'villager',sprite,x,y,{height:36,facing:job.facing||'SE',walking:job.path.length>0,phase:job.walkPhase||0})){
    c2d.font='25px sans-serif';c2d.textAlign='center';c2d.fillText('👷',x,y);
  }
  const working=job.phase==='working',swing=working?Math.sin(animTime*7)*.6:0;
  c2d.translate(x+12,y-20);if(working)c2d.rotate(swing);
  c2d.font='12px sans-serif';c2d.textAlign='center';c2d.fillText(job.load?config.icon:working?lumber?'🪓':'⛏️':'',0,0);
  c2d.restore();
}
