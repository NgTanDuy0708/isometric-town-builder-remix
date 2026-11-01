import {routeTutorialStep,featureStepDone} from './tutorialRouting.js';
import {BASIC_STEPS,getGuide,getLevelGuide} from '../data/tutorialGuides.js';
import {createTutorialState,getTutorialFacts,basicStepDone} from './tutorialProgress.js';
import {createTutorialView,readTutorialUi,isTutorialElementVisible} from './tutorialView.js';
export {BASIC_STEPS as TUTORIAL_STEPS} from '../data/tutorialGuides.js';
export const LEVEL_TUTORIALS_CONFIG=Object.fromEntries(Array.from({length:25},(_,i)=>[i+1,getLevelGuide(i+1)]));

export function isAnyModalOpen(){
  return typeof document!=='undefined'&&[...document.querySelectorAll('[role="dialog"]')].some(isTutorialElementVisible);
}

export function createTutorialManager(ctx){
  let state=createTutorialState(),timer=null,checking=false,started=false,manualDevice=null,lastPointer=null,lastPaint='';
  const abort=new AbortController();
  const actions={next,skip,defer,resume,navigate,toggleDevice};
  const view=ctx.view||createTutorialView(ctx,actions);
  const save=()=>ctx.onChanged?.();
  const ui=()=>ctx.getTutorialUi?.()||readTutorialUi();
  const device=()=>manualDevice||lastPointer||ctx.getControlMode?.()||
    (typeof window!=='undefined'&&window.matchMedia?.('(pointer: coarse)').matches?'touch':'desktop');
  const basicActive=()=>state.basic.status==='active';
  const active=()=>basicActive()||!!state.activeGuide;
  function init(raw,{fresh=false}={}){
    stopLoop();started=false;state=createTutorialState(raw);lastPaint='';
    if(!raw&&!fresh){
      try{
        const completed=localStorage.getItem('town_builder_tutorial_completed')==='true';
        const hasHomes=(ctx.getCurrentGrid?.()||[]).flat().some(id=>id==='b01_cottage_red'||id==='b02_tudor_inn');
        if(completed&&(hasHomes||(ctx.getPlayerLevel?.()||1)>1))state.basic.status='complete';
        state.rewarded=localStorage.getItem('town_builder_tutorial_rewarded')==='true';
      }catch{/* Full-save state is authoritative; missing legacy storage is harmless. */}
    }
    view.hide();
  }
  function ensureLoop(){
    if(timer||ctx.autoTick===false)return;
    timer=setInterval(checkProgress,200);
  }
  function stopLoop(){if(timer){clearInterval(timer);timer=null;}}
  function enqueue(id){
    if(!getGuide(id)||state.completedGuides.includes(id)||state.activeGuide===id||state.queue.includes(id))return false;
    state.queue.push(id);return true;
  }
  function checkAndTriggerLevelTutorial(level,force=false){
    level=Math.min(25,Math.max(1,Math.floor(Number(level)||1)));
    if(force){replayLevelTutorial(level);return;}else{
      for(let l=state.lastLevel+1;l<=level;l++)enqueue('level-'+l);
      state.lastLevel=Math.max(state.lastLevel,level);
    }
    save();if(started){ensureLoop();checkProgress();}
  }
  function replayLevelTutorial(level=ctx.getPlayerLevel?.()||1){
    if(basicActive()){ctx.showToast?.('Hoàn tất hoặc bỏ qua hướng dẫn khởi đầu trước khi xem lại hướng dẫn cấp.','info');return;}
    const id='level-'+Math.min(25,Math.max(1,Math.floor(Number(level)||1)));
    if(state.activeGuide&&state.activeGuide!==id&&!state.queue.includes(state.activeGuide))state.queue.unshift(state.activeGuide);
    state.queue=state.queue.filter(guideId=>guideId!==id);
    state.completedGuides=state.completedGuides.filter(guideId=>guideId!==id);
    ctx.finishTutorialPlacement?.();ctx.closeTutorialPanels?.();
    state.activeGuide=id;state.guideStepId='summary';state.deferred=false;started=true;lastPaint='';save();ensureLoop();checkProgress();
  }
  function onTownEvent(id){
    if(enqueue('event-'+id)){save();if(started){ensureLoop();checkProgress();}}
  }
  function pump(){
    if(basicActive()||state.activeGuide||state.deferred||ctx.isTutorialBlocked?.())return;
    while(state.queue.length){
      const id=state.queue.shift();if(state.completedGuides.includes(id))continue;
      const guide=getGuide(id);if(!guide)continue;
      state.activeGuide=id;state.guideStepId=guide.steps[0].id;save();break;
    }
  }
  function current(){
    if(basicActive()){
      const index=Math.max(0,BASIC_STEPS.findIndex(s=>s.id===state.basic.stepId));
      return {step:BASIC_STEPS[index],index,length:BASIC_STEPS.length,key:'basic:'+BASIC_STEPS[index].id,mode:'beginner'};
    }
    const guide=getGuide(state.activeGuide);if(!guide)return null;
    let index=guide.steps.findIndex(s=>s.id===state.guideStepId);if(index<0)index=0;
    return {guide,step:guide.steps[index],index,length:guide.steps.length,key:guide.id+':'+guide.steps[index].id,mode:'level_feature'};
  }
  function start(forceRestart=false){
    if(forceRestart)reset();
    started=true;
    if(state.basic.status==='new')state.basic.status='active';
    if(state.basic.status==='complete')enqueue('level-1');
    checkAndTriggerLevelTutorial(ctx.getPlayerLevel?.()||1);
    ensureLoop();checkProgress();
  }
  function reset(){
    state.basic={status:'active',stepId:'welcome'};
    state.milestones={plantedWheat:false,harvestedWheat:false,soldWheat:false};
    state.deferred=false;lastPaint='';save();
  }
  function resetForNewGame(){init(null,{fresh:true});}
  function detail(step,f){
    if(step.id==='wait-house'){
      const pending=Object.values(ctx.getConstructions?.()||{}).find(c=>c.targetTileId==='b01_cottage_red');
      return pending?'Nhà còn khoảng '+Math.max(0,Math.ceil((pending.startTime+pending.durationMs-Date.now())/1000))+' giây. Dân sẽ tăng khi xây xong.':'Chờ công trình hoàn tất.';
    }
    if(step.id==='wait-wheat')return 'Còn khoảng '+f.wheatSeconds+' giây đến vụ lúa đầu.';
    if(step.id==='place-house'||step.id==='place-farm')return device()==='touch'?'Chọn ô trên map → ✓ Tích.':'Có thể nhấp một ô cỏ hợp lệ khác thay ô gợi ý.';
    if(step.panel==='seed'&&!ui().panels?.seed&&!ctx.getTutorialWorldTarget?.('empty-farm'))return 'Cần một luống trống để mở danh sách hạt. Thu hoạch luống đã chín, hoặc bấm Để sau nếu muốn học sau.';
    return '';
  }
  function paint(){
    if(!started)return;
    const c=current();
    if(state.deferred){
      const remaining=state.queue.length+(state.activeGuide?1:0);
      view.hide(active()||remaining>0,basicActive()?'Tiếp tục hướng dẫn tân thủ':(remaining+' hướng dẫn mới · Xem tiếp'));return;
    }
    if(!c){view.hide();return;}
    const facts=getTutorialFacts(ctx,state),blocked=!!ctx.isTutorialBlocked?.();
    const step=routeTutorialStep(c.step,ui());
    const message=detail(step,facts),mode=device(),key=c.key+':'+mode+':'+message+':'+blocked+':'+JSON.stringify([step.target,step.world,step.ack,step.title,step.body]);
    const model={...c,step,device:mode,detail:message,blocked,last:c.index===c.length-1,
      progress:c.mode==='beginner'?'Khởi đầu · '+(c.index+1)+'/'+c.length:c.guide.title+' · '+(c.index+1)+'/'+c.length};
    if(key!==lastPaint){lastPaint=key;view.render(model);}else view.refresh?.();
  }
  function finishBasic(){
    state.basic.status='complete';state.basic.stepId='complete';
    // Mark before changing the wallet/XP: replay and reload cannot pay twice.
    if(!state.rewarded){
      state.rewarded=true;
      try{localStorage.setItem('town_builder_tutorial_rewarded','true');}catch{}
      ctx.addPlayerGold?.(200);ctx.addPlayerXP?.(20,'Hoàn thành hướng dẫn khởi nghiệp');
      ctx.playQuestRewardSound?.();ctx.showToast?.('Hoàn thành hướng dẫn: +200 vàng và +20 XP.','success');
    }
    try{localStorage.setItem('town_builder_tutorial_completed','true');}catch{}
    enqueue('level-1');save();
  }
  function completeGuide(){
    if(state.activeGuide&&!state.completedGuides.includes(state.activeGuide))state.completedGuides.push(state.activeGuide);
    state.activeGuide=null;state.guideStepId='summary';save();
  }
  function advance(){
    const c=current();if(!c)return;
    let nextIndex=c.index+1;
    if(c.mode!=='beginner'&&c.guide.steps[nextIndex]?.optionalPlacement&&ctx.getActiveBrush?.()!==c.guide.steps[nextIndex].optionalPlacement)nextIndex++;
    const nextStep=c.guide?.steps[nextIndex];
    // Reading several unlocks keeps the shop open. The pointer can move directly
    // to the next card, or to Back/category, without reopening the same window.
    const keepShop=c.step.inspectTileId&&!ctx.getActiveBrush?.()&&nextStep?.panel==='shop';
    const keepSeeds=c.step.seedId&&!ctx.getActiveSeedBrush?.()&&nextStep?.panel==='seed';
    if(c.step.optionalPlacement)ctx.finishTutorialPlacement?.();
    if(c.step.closeAfter&&!keepShop&&!keepSeeds)ctx.closeTutorialPanels?.();
    if(c.mode==='beginner'){
      if(nextIndex<BASIC_STEPS.length)state.basic.stepId=BASIC_STEPS[nextIndex].id;
      else finishBasic();
    }else{
      if(nextIndex<c.length)state.guideStepId=c.guide.steps[nextIndex].id;
      else completeGuide();
    }
    lastPaint='';save();
  }
  function checkProgress(){
    if(!started||checking)return;checking=true;
    try{
      if(state.deferred){paint();return;}
      pump();
      if(!ctx.isTutorialBlocked?.()){
        let f=getTutorialFacts(ctx,state);
        if(basicActive()){
          const i=BASIC_STEPS.findIndex(s=>s.id===state.basic.stepId),homeWait=BASIC_STEPS.findIndex(s=>s.id==='wait-house');
          if(i>=homeWait&&i<BASIC_STEPS.length-1&&!f.houseReady&&!f.housePending){state.basic.stepId='house-shop';save();lastPaint='';}
          const cropSteps=['wait-wheat','harvest-wheat'];
          if(cropSteps.includes(state.basic.stepId)&&f.seedBrush){state.basic.stepId='leave-seed-tool';save();lastPaint='';}
          if(cropSteps.includes(state.basic.stepId)&&!f.wheat.length&&!f.harvested){state.basic.stepId=f.fields.length?'open-seed':'farm-shop';save();lastPaint='';}
        }
        for(let count=0;count<40;count++){
          const c=current();if(!c)break;
          if((c.step.inspectTileId&&f.brush===c.step.inspectTileId)||(c.step.optionalPlacement&&!f.brush)){
            advance();f=getTutorialFacts(ctx,state);continue;
          }
          if(c.step.ack)break;
          const stateUi=ui();
          const done=c.mode==='beginner'?basicStepDone(c.step.id,f,stateUi):
            featureStepDone(c.step,stateUi);
          if(!done)break;
          advance();f=getTutorialFacts(ctx,state);
        }
      }
      paint();
    }finally{checking=false;}
  }
  function next(){
    const c=current();if(!c||!routeTutorialStep(c.step,ui()).ack||state.deferred||ctx.isTutorialBlocked?.())return;
    advance();pump();checkProgress();
  }
  function navigate(){
    const c=current();if(!c)return;const step=routeTutorialStep(c.step,ui());
    if(step.world&&!step.openTour){view.focusCurrent?.();return;}
    if(step.panel)ctx.openTutorialPanel?.(step.panel,Object.hasOwn(step,'navigationCategory')?step.navigationCategory:step.shopStage==='open'?null:step.category);
    checkProgress();
  }
  function skip(){
    if(basicActive()){
      state.basic.status='skipped';state.deferred=state.queue.length>0;
      try{localStorage.setItem('town_builder_tutorial_completed','true');}catch{}
      ctx.showToast?.('Đã bỏ qua, không nhận thưởng. Có thể mở lại trong Cài đặt.','info');
    }else{ctx.closeTutorialPanels?.();completeGuide();}
    lastPaint='';save();pump();checkProgress();
  }
  function defer(){state.deferred=true;lastPaint='';save();paint();}
  function resume(){started=true;state.deferred=false;lastPaint='';save();ensureLoop();pump();checkProgress();}
  function dismissLevelTutorial(){if(!basicActive()){completeGuide();pump();checkProgress();}}
  function onAction(type,payload={}){
    if(!basicActive()){
      const step=current()?.step;
      if(type==='build_tile'&&step?.optionalPlacement&&payload.tileId===step.optionalPlacement){advance();checkProgress();}
      if(type==='plant_seed'&&step?.seedId&&step.seedId===payload.seedId){ctx.finishTutorialPlacement?.();advance();checkProgress();}
      return;
    }
    if(type==='plant_seed'&&payload.seedId==='wheat')state.milestones.plantedWheat=true;
    if(type==='harvest_crop'&&payload.seedId==='wheat')state.milestones.harvestedWheat=true;
    if(type==='market_sell'&&(payload.resourceId==='wheat'||payload.resourceIds?.includes('wheat')))state.milestones.soldWheat=true;
    save();checkProgress();
  }
  function toggleDevice(){manualDevice=device()==='touch'?'desktop':'touch';lastPaint='';paint();}
  if(typeof window!=='undefined'){
    window.addEventListener('pointerdown',event=>{
      if(manualDevice||!event.pointerType)return;
      const nextMode=event.pointerType==='mouse'?'desktop':'touch';
      if(nextMode!==lastPointer){lastPointer=nextMode;lastPaint='';paint();}
    },{passive:true,signal:abort.signal});
    window.addEventListener('resize',()=>{lastPaint='';paint();},{signal:abort.signal});
    window.visualViewport?.addEventListener('resize',()=>view.refresh?.(),{signal:abort.signal});
  }
  return {init,start,reset,resetForNewGame,skipTutorial:skip,onAction,checkProgress,checkAndTriggerLevelTutorial,
    next,defer,navigate,toggleDevice,replayLevelTutorial,showLevelTutorial:checkAndTriggerLevelTutorial,dismissLevelTutorial,onTownEvent,resume,
    getState:()=>state,getControlMode:device,isActive:active,getCurrentStep:()=>basicActive()?BASIC_STEPS.findIndex(s=>s.id===state.basic.stepId)+1:0,
    getCurrentMode:()=>basicActive()?'beginner':state.activeGuide?'level_feature':null,getCurrentStepInfo:current,
    destroy(){started=false;stopLoop();abort.abort();view.destroy();}};
}
