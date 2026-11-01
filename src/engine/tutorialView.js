import {PANEL_TARGETS,PANEL_SELECTORS} from '../data/tutorialGuides.js';

export function isTutorialElementVisible(element){
  if(!element||!element.isConnected)return false;
  const rect=element.getBoundingClientRect();if(rect.width<2||rect.height<2)return false;
  for(let node=element;node&&node.nodeType===1;node=node.parentElement){
    const style=getComputedStyle(node);
    if(node.hidden||style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0)return false;
  }
  return true;
}
export function readTutorialUi(){
  const panels=Object.fromEntries(Object.entries(PANEL_SELECTORS).map(([id,selector])=>[id,isTutorialElementVisible(document.querySelector(selector))]));
  return {panels};
}
const area=(a,b)=>Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
export function chooseCoachPlacement(viewport,card,target){
  const width=Math.min(card.width,viewport.width-24),height=Math.min(card.height,viewport.height-24);
  const right=Math.max(12,viewport.width-width-12),bottom=Math.max(12,viewport.height-height-16),top=Math.min(92,bottom);
  const candidates=[{x:12,y:bottom},{x:right,y:bottom},{x:12,y:top},{x:right,y:top}];
  const avoid=target?{x:target.x-36,y:target.y-36,width:target.width+72,height:target.height+100}:null;
  candidates.sort((a,b)=>(avoid?area({...a,width,height},avoid)-area({...b,width,height},avoid):0));
  return {...candidates[0],width,height};
}

export function createTutorialView(ctx,actions){
  const root=document.createElement('div');root.id='tutorial-widget-overlay';root.className='coach-root';root.hidden=true;
  const el=(tag,className,parent=root)=>{const e=document.createElement(tag);e.className=className;parent.appendChild(e);return e;};
  const spotlight=el('div','coach-spotlight');spotlight.setAttribute('aria-hidden','true');
  const hand=el('img','coach-hand');hand.src='/assets/ui/tutorial_hand.svg';hand.alt='';hand.setAttribute('aria-hidden','true');
  const card=el('section','coach-card');card.setAttribute('role','region');card.setAttribute('aria-label','Hướng dẫn chơi');
  const top=el('div','coach-top',card),progress=el('span','coach-progress',top);
  const device=el('button','coach-device',top);device.type='button';device.addEventListener('click',actions.toggleDevice);
  const title=el('h2','coach-title',card),body=el('p','coach-body',card),controls=el('p','coach-controls',card),status=el('p','coach-status',card);
  status.setAttribute('role','status');
  const buttons=el('div','coach-actions',card);
  const button=(text,className,fn,parent=buttons)=>{const node=el('button',className,parent);node.type='button';node.textContent=text;node.addEventListener('click',fn);return node;};
  const next=button('Tiếp tục','coach-next',actions.next),navigate=button('Mở mục này','coach-navigate',actions.navigate);
  button('Để sau','coach-defer',actions.defer);const skip=button('Bỏ qua','coach-skip',actions.skip);
  const help=el('details','coach-help',card),summary=el('summary','',help);summary.textContent='Phím & thao tác';
  const helpText=el('p','',help);
  const resume=button('Tiếp tục hướng dẫn','coach-resume',actions.resume,root);resume.hidden=true;
  document.getElementById('tutorial-widget-overlay')?.remove();document.body.appendChild(root);
  let current=null,deviceMode='desktop',target=null,revealed='',focused='';
  function visible(selector){return [...document.querySelectorAll(selector)].find(isTutorialElementVisible)||null;}
  function resolve(step){
    if(step.world){const worldTarget=ctx.getTutorialWorldTarget?.(step.world);if(worldTarget)return worldTarget;if(step.openTour)return {element:navigate};return null;}
    let element=step.target?document.querySelector(step.target):null;
    if(element&&!isTutorialElementVisible(element)){
      const deck=element.closest('#bottom-left-deck');
      const toggle=document.getElementById('deck-toggle-btn');
      if(deck&&isTutorialElementVisible(toggle))return {element:toggle,hint:'Mở mũi tên menu trước, rồi chọn nút được chỉ.'};
      element=null;
    }
    if(!element&&step.target?.includes('data-shop-cat'))element=visible('#shop-modal-back-btn')||visible('#btn-open-shop');
    if(!element&&step.panel){
      const panel=document.querySelector(PANEL_SELECTORS[step.panel]);
      element=isTutorialElementVisible(panel)?panel.querySelector('h2,h3')||panel:visible(PANEL_TARGETS[step.panel]);
    }
    if(!element&&step.target?.includes('data-tile-id'))element=visible('#shop-modal-back-btn')||visible('#btn-open-shop');
    return element?{element}:null;
  }
  function refresh(){
    if(!current||root.hidden||resume.hidden===false)return;
    const found=resolve(current.step);let rectangle=null;
    if(found?.element){
      const node=found.element;
      const clip=node.closest('.shop-modal-body,.seed-modal-body');
      const before=node.getBoundingClientRect(),clipRect=clip?.getBoundingClientRect();
      const clipped=clipRect&&(before.top<clipRect.top||before.bottom>clipRect.bottom);
      if((revealed!==current.key+current.step.target||clipped)&&isTutorialElementVisible(node)){
        revealed=current.key+current.step.target;node.scrollIntoView?.({block:'center',inline:'nearest',behavior:'instant'});
      }
      const r=node.getBoundingClientRect();rectangle={x:r.left,y:r.top,width:r.width,height:r.height};
    }else if(found){rectangle=found;}
    if(rectangle&&found?.cell&&focused!==current.key){
      focused=current.key;
      if(rectangle.x<8||rectangle.y<80||rectangle.x+rectangle.width>innerWidth-8||rectangle.y+rectangle.height>innerHeight-90){
        ctx.focusTutorialCell?.(found.cell);rectangle=ctx.getTutorialWorldTarget?.(current.step.world)||rectangle;
      }
    }
    target=rectangle;
    const inView=target&&target.x+target.width>0&&target.y+target.height>0&&target.x<innerWidth&&target.y<innerHeight;
    spotlight.hidden=!inView;hand.hidden=!inView;
    if(inView){
      const x=Math.max(4,target.x-4),y=Math.max(4,target.y-4),w=Math.min(innerWidth-x-4,target.width+8),h=Math.min(innerHeight-y-4,target.height+8);
      Object.assign(spotlight.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
      spotlight.classList.toggle('coach-world',!!found?.cell);
      const above=y+h+60>innerHeight;
      Object.assign(hand.style,{left:Math.max(4,Math.min(innerWidth-46,x+w/2-17))+'px',top:(above?Math.max(4,y-56):y+h-3)+'px',transform:above?'rotate(180deg)':'none'});
    }
    const rect=card.getBoundingClientRect(),position=chooseCoachPlacement({width:innerWidth,height:innerHeight},{width:rect.width,height:rect.height},target);
    card.style.left=position.x+'px';card.style.top=position.y+'px';
    if(found?.hint)status.textContent=found.hint;else status.textContent=current.detail||'';
  }
  function render(model){
    current=model;deviceMode=model.device;root.hidden=!!model.blocked;
    card.hidden=false;resume.hidden=true;
    progress.textContent=model.progress;title.textContent=model.step.title;body.textContent=model.step.body||'';
    controls.textContent=model.step[deviceMode]||'';controls.hidden=!controls.textContent;
    device.textContent=deviceMode==='touch'?'📱 Điện thoại':'🖱️ Máy tính';device.title='Đổi kiểu hướng dẫn thao tác';
    root.dataset.target=model.step.target||('world:'+(model.step.world||''));
    next.hidden=!model.step.ack;next.textContent=model.step.nextLabel||(model.last?'Hoàn tất':'Tiếp tục');
    navigate.hidden=!(model.step.panel||model.step.world);navigate.textContent=model.step.navigateLabel||(model.step.world&&!model.step.openTour?'Về vị trí gợi ý':'Mở mục này');
    skip.textContent=model.mode==='beginner'?'Bỏ qua (không thưởng)':'Đã biết mục này';
    helpText.textContent=deviceMode==='touch'
      ?'Vuốt một ngón: kéo bản đồ. Chụm/tách hai ngón: thu/phóng. Chạm ô: chọn vị trí. ✓ Tích: đặt; Xoay: đổi hướng; Hủy: thoát. Nhấn giữ công trình: Di chuyển/Xoay/Gỡ. Hoàn thành: thoát công cụ gieo/thu hoạch.'
      :'Chuột trái: chọn/tương tác. Khi cầm vật phẩm, nhấp ô trống để đặt hoặc dùng ✓. Space + kéo: pan. Con lăn: zoom; +/Z và −/X: zoom. Home/0: về giữa. R/E: xoay. Esc: hủy/thoát. Nhấn giữ công trình: menu thao tác. D: bật gỡ; Delete/Backspace: gỡ ô đang trỏ. Ctrl+Z/Ctrl+Y: hoàn tác/làm lại khi được hỗ trợ.';
    refresh();
  }
  function hide(deferred=false,label='Tiếp tục hướng dẫn'){
    current=null;root.hidden=!deferred;card.hidden=true;spotlight.hidden=true;hand.hidden=true;resume.hidden=!deferred;resume.textContent=label;
  }
  function focusCurrent(){const found=current&&resolve(current.step);if(found?.cell)ctx.focusTutorialCell?.(found.cell);else found?.element?.scrollIntoView?.({block:'center',inline:'nearest'});}
  return {render,refresh,hide,focusCurrent,destroy(){root.remove();}};
}
