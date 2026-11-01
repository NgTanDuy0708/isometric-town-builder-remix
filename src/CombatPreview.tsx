import React,{useEffect,useRef,useState} from 'react';
import {createCanvasRenderer} from './engine/canvasRenderer.js';
import {createCombatPreviewScene} from './engine/combatPreviewScene.js';
import {prepareCombatImages,drawCombatCharacter,advanceCombatWalk,markCombatAttack,markCombatHit,tickCombatVisual} from './engine/combatAnimation.js';
import {ORIGIN_X,ORIGIN_Y,HALF_W,QUARTER_W} from './engine/isoMath.js';
import './combatPreview.css';
import {drawRaidCharacter} from './engine/raidAnimation.js';

export default function CombatPreview(){
  const canvas=useRef<HTMLCanvasElement>(null),stage=useRef<HTMLDivElement>(null),samples=useRef<HTMLCanvasElement>(null);
  const controls=useRef({playing:true,speed:1,direction:'SE',pose:'walking'});
  const [playing,setPlaying]=useState(true),[speed,setSpeed]=useState(1),[pose,setPose]=useState('walking'),[direction,setDirection]=useState('SE');
  const [restart,setRestart]=useState(0),[status,setStatus]=useState('Đang tải ảnh…');
  const [enemyKind,setEnemyKind]=useState('goblin');
  controls.current={playing,speed,direction,pose};
  useEffect(()=>{
    const el=canvas.current,parent=stage.current,strip=samples.current;
    if(!el||!parent||!strip)return;
    const ctx=el.getContext('2d'),sample=strip.getContext('2d');if(!ctx||!sample)return;
    document.title='Phòng thủ: ảnh và animation · Isometric Village';
    const scene=createCombatPreviewScene(enemyKind);let width=1000,height=640,time=0,last=performance.now(),raf=0,resultTime=0,lastStatus='';
    const camera={x:0,y:0,zoom:1};
    const resize=()=>{
      width=parent.clientWidth;height=parent.clientHeight;const dpr=Math.min(window.devicePixelRatio||1,2);
      el.width=Math.round(width*dpr);el.height=Math.round(height*dpr);
      camera.zoom=Math.min(width/1450,height/900);
      camera.x=width*.5-(ORIGIN_X+(18-17)*HALF_W+64)*camera.zoom;
      camera.y=height*.5-(ORIGIN_Y+34*QUARTER_W+96)*camera.zoom;
      strip.width=Math.round(Math.min(1000,width)*dpr);strip.height=180*dpr;
    };
    const observer=new ResizeObserver(resize);observer.observe(parent);resize();
    const empty=()=>({}),none=()=>null;
    const renderer=createCanvasRenderer({ensureCanvasRef(){},getCanvas:()=>el,getContainer:()=>parent,getContext2D:()=>ctx,
      getViewportSize:()=>({width,height}),getRenderDpr:()=>Math.min(window.devicePixelRatio||1,2),getCamera:()=>camera,
      getCurrentGrid:()=>scene.grid,getDefenseState:()=>scene.manager.getState(),getDayNightWeather:none,
      getConstructions:empty,getBuildingLevels:()=>scene.levels,getProductionState:empty,getFarmlandState:empty,
      getLandUnlockedChunks:()=>[],getFlippedGrid:empty,getUpgradesInProgress:empty,getGameMode:()=> 'sandbox',
      getVillagerManager:none,getHoverCell:none,getActiveBrush:none,getBrushFlipped:()=>false,getActiveSeedBrush:none,
      getMovingBuilding:none,getAnimTime:()=>time,onRequestRender(){}}) as {renderCanvas:()=>void;destroy:()=>void};
    prepareCombatImages();
    const kinds=['guard','goblin','mage','troll','dragon'];
    const actors=kinds.map(()=>({r:0,c:0,hp:60,path:[] as object[],status:'idle',facing:'SE',walkPhase:0,attackFor:0,hurtFor:0,flightPhase:0}));
    const loop=(now:number)=>{
      const dt=Math.min(.1,(now-last)/1000)*controls.current.speed;last=now;
      if(controls.current.playing){time+=dt;scene.manager.update(dt);}
      if(scene.manager.getState().phase==='result'&&controls.current.playing){resultTime+=dt;if(resultTime>4){scene.reset();resultTime=0;}}
      renderer.renderCanvas();
      const state=scene.manager.getState(),next=`${state.phase==='result'?'Kết thúc trận — tự chạy lại':'Vệ binh chặn địch, pháp sư bắn phép, tháp tự bắn'} · ${state.enemies.filter((enemy:{hp:number})=>enemy.hp>0).length} địch`;
      if(next!==lastStatus){lastStatus=next;setStatus(next);}
      const dpr=Math.min(window.devicePixelRatio||1,2);sample.setTransform(dpr,0,0,dpr,0,0);
      const sw=strip.width/dpr;sample.clearRect(0,0,sw,180);sample.fillStyle='#e8e1cf';sample.fillRect(0,0,sw,180);
      actors.forEach((actor,index)=>{
        actor.facing=controls.current.direction;actor.path=controls.current.pose==='walking'?[{}]:[];actor.status=controls.current.pose;
        if(controls.current.playing){tickCombatVisual(actor,dt);if(actor.path.length)advanceCombatWalk(actor,0,0,dt);
          if(controls.current.pose==='attack'&&actor.attackFor<=0)markCombatAttack(actor,{r:0,c:0});
          if(controls.current.pose==='hurt')markCombatHit(actor);}
        if(controls.current.pose==='idle'){actor.attackFor=0;actor.hurtFor=0;}
        if(controls.current.playing)actor.flightPhase=(actor.flightPhase+dt)%4;
        if(index<3)drawCombatCharacter(sample,kinds[index],actor,(index+.5)*sw/5,150,{height:90});
        else drawRaidCharacter(sample,{...actor,kind:kinds[index]},(index+.5)*sw/5,150);
        sample.font='14px sans-serif';sample.textAlign='center';sample.fillStyle='#3b3225';sample.fillText(['Vệ binh','Goblin','Pháp sư','Quái rừng','Rồng'][index],(index+.5)*sw/5,172);
      });
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);return()=>{cancelAnimationFrame(raf);observer.disconnect();renderer.destroy();};
  },[restart,enemyKind]);
  return <main className="combat-preview">
    <header><a href="/">← Về làng</a><h1>Phòng thủ: ảnh và sprite động</h1><p>Ba cấp trại và học viện phía trên; trận dùng hệ thống di chuyển, giao chiến và renderer của game. Không thay đổi save của bạn.</p></header>
    <nav><button onClick={()=>setPlaying(!playing)}>{playing?'Tạm dừng':'Chạy tiếp'}</button><button onClick={()=>setRestart(v=>v+1)}>Chạy lại trận</button>
      <label>Đợt tấn công <select value={enemyKind} onChange={e=>setEnemyKind(e.target.value)}><option value="goblin">Goblin</option><option value="troll">Quái rừng</option><option value="dragon">Rồng</option></select></label>
      <label>Tốc độ <select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value="1">1×</option><option value=".5">0,5×</option><option value="2">2×</option></select></label><strong role="status">{status}</strong></nav>
    <div ref={stage} className="combat-preview-stage"><canvas ref={canvas} aria-label="Trận phòng thủ với hình và sprite động" /></div>
    <section><h2>Kiểm tra từng động tác</h2><label>Động tác <select value={pose} onChange={e=>setPose(e.target.value)}><option value="idle">Đứng</option><option value="walking">Đi bộ</option><option value="attack">Chém / thi triển phép</option><option value="hurt">Bị đánh</option></select></label>
      <label>Hướng <select value={direction} onChange={e=>setDirection(e.target.value)}>{['SE','SW','NW','NE'].map(value=><option key={value}>{value}</option>)}</select></label>
      <canvas ref={samples} aria-label="Animation vệ binh, goblin, pháp sư" /></section>
  </main>;
}
