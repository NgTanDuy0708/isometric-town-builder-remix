import { EXTRACTION_WORKSHOPS, EXTRACTION_NODES, getWorkerSlots, WORKER_HIRE_GOLD } from '../data/extractionConfig.js';
import { WORKER_STATUS } from './extractionManager.js';
import { getRecipesForBuilding } from '../data/productionRecipes.js';
import { WORKER_FOODS, WORKER_MEAL_SECONDS } from '../data/workerFoodConfig.js';
import { RESOURCES_CONFIG } from '../data/resourcesConfig.js';

export function createExtractionPanel(ctx) {
  const panel = document.getElementById('extraction-modal');
  const body = document.getElementById('extraction-modal-body');
  let selected = null, lastPaint = 0;
  function close() { if(panel) { panel.classList.add('hidden'); panel.style.display='none'; } }
  function render() {
    if(!panel || panel.classList.contains('hidden') || !body)return;
    const focusedId=document.activeElement?.id;
    let focusTarget=null;
    const manager=ctx.getManager(), state=manager.getState(), grid=ctx.getCurrentGrid(), labor=manager.labor();
    const shops=[];
    for(let r=0;r<grid.length;r++)for(let c=0;c<grid[r].length;c++){
      if(EXTRACTION_WORKSHOPS[grid[r][c]])shops.push({r,c,id:grid[r][c]});
    }
    const visible=selected?shops.filter(s=>s.r===selected.row&&s.c===selected.col):shops;
    body.replaceChildren();
    const summary=document.createElement('p');
    summary.textContent=`Dân rảnh: ${labor.free} · Công nhân: ${labor.workers} · Gỗ: ${ctx.getResources().wood || 0} · Đá: ${ctx.getResources().stone || 0} · Quặng sắt: ${ctx.getResources().ironOre || 0}`;
    body.append(summary);
    const food=manager.foodSummary();
    const foodSection=document.createElement('section');foodSection.className='extraction-food';
    const foodTitle=document.createElement('h3');foodTitle.textContent='🍞 Lương thực công nhân';foodSection.append(foodTitle);
    const foodStatus=document.createElement('p');foodStatus.className=food.hungry?'extraction-food-warning':'';
    foodStatus.setAttribute('role','status');
    foodStatus.textContent=`${food.portions} khẩu phần có thể dùng · ${food.workers} công nhân cần ${food.portionsPerMinute.toLocaleString('vi-VN')} khẩu phần/phút · ${food.reserve} khẩu phần đã chuẩn bị.`;
    if(food.hungry)foodStatus.textContent+=' Thiếu ăn: thời gian khai thác tăng gấp đôi. Thu hoạch lúa/ngô hoặc nhận bánh mì, rồi bật loại được dùng bên dưới để phục hồi.';
    else if(food.workers)foodStatus.textContent+=` Khẩu phần tiếp theo sau ${food.secondsUntilMeal}s.`;
    if(food.workers&&!food.hungry&&food.portions<1)foodStatus.textContent+=' Hết lương thực được phép dùng — hãy chuẩn bị cho bữa tiếp theo.';
    foodSection.append(foodStatus);
    for(const item of WORKER_FOODS){
      const label=document.createElement('label');label.className='extraction-food-choice';
      const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=food.enabledFoods.includes(item.id);
      checkbox.id=`worker-food-${item.id}`;
      if(checkbox.id===focusedId)focusTarget=checkbox;
      checkbox.onchange=()=>{manager.setFoodEnabled(item.id,checkbox.checked);render();};
      const text=document.createElement('span'),config=RESOURCES_CONFIG[item.id];
      text.textContent=`${config.icon} ${config.name}: 1 = ${item.portions} khẩu phần (có ${ctx.getResources()[item.id] || 0})`;
      label.append(checkbox,text);foodSection.append(label);
    }
    const foodHelp=document.createElement('p');foodHelp.className='extraction-help';
    foodHelp.textContent=`Tự dùng theo thứ tự trên, chỉ dùng loại đã bật. Mỗi công nhân cần 1 khẩu phần/${WORKER_MEAL_SECONDS}s chơi, kể cả lúc chờ tài nguyên/kho. Người đang xin nghỉ hoặc thiếu suất dân không tiêu thụ. Phần ăn đã chuẩn bị được giữ lại khi đổi lựa chọn. Chỉ giảm tốc độ đốn/đào khi thiếu ăn; vận chuyển vẫn bình thường. Nông dân và dân rảnh chưa tiêu thụ lương thực.`;
    foodSection.append(foodHelp);body.append(foodSection);
    const help=document.createElement('p');help.className='extraction-help';
    help.textContent=`Mỗi công nhân cần 1 dân rảnh và ${WORKER_HIRE_GOLD} vàng thuê một lần. Chừa lối đất trống/đường từ xưởng tới điểm tài nguyên và Kho Tổng Hợp. Chọn Chế biến để làm ván/đá xây dựng; quặng luyện tại Lò rèn. Khai thác chạy khi game đang mở.`;
    body.append(help);
    if(!visible.length){const empty=document.createElement('p');empty.textContent='Xây Xưởng mộc, Xưởng khai thác đá hoặc Mỏ sắt trong Cửa hàng → Sản xuất để bắt đầu.';body.append(empty);}
    for(const shop of visible){
      const section=document.createElement('section');section.className='extraction-workshop';
      const config=EXTRACTION_WORKSHOPS[shop.id], jobs=state.jobs.filter(j=>j.homeRow===shop.r&&j.homeCol===shop.c);
      const title=document.createElement('h3');title.textContent=`${config.icon} ${config.name} (${shop.r}, ${shop.c})`;
      const count=document.createElement('p');count.textContent=`Công nhân: ${jobs.length}/${getWorkerSlots(ctx.getBuildingLevels()[`${shop.r}_${shop.c}`] || 1)}`;
      const hire=document.createElement('button');hire.type='button';hire.textContent=`Thuê 1 người · ${WORKER_HIRE_GOLD} 🪙`;
      hire.disabled=!!ctx.getConstructions()[`${shop.r}_${shop.c}`]||labor.free<1||jobs.length>=getWorkerSlots(ctx.getBuildingLevels()[`${shop.r}_${shop.c}`] || 1)||ctx.getGold()<WORKER_HIRE_GOLD;
      hire.onclick=()=>{const result=manager.hire(shop.r,shop.c);ctx.showToast(result.message,result.allowed?'success':'warning');render();};
      const upgrade=document.createElement('button');upgrade.type='button';upgrade.textContent='Xem / nâng cấp xưởng';
      upgrade.onclick=()=>{close();ctx.openUpgradeModal(shop.r,shop.c);};
      section.append(title,count,hire,upgrade);
      if(getRecipesForBuilding(shop.id).length){
        const process=document.createElement('button');process.type='button';process.textContent='Chế biến nguyên liệu';
        process.disabled=!!ctx.getConstructions()[`${shop.r}_${shop.c}`];
        process.onclick=()=>{close();ctx.openProductionModal(shop.r,shop.c);};section.append(process);
      }
      for(const job of jobs){
        const row=document.createElement('div');row.className='extraction-job';
        const text=document.createElement('span');text.textContent=`#${job.id} · ${WORKER_STATUS[job.status] || 'Đang chờ'}${job.load?` · ${job.load} ${config.icon}`:''}${job.retiring?' · Xin nghỉ sau khi về xưởng':''}`;
        if(food.hungry&&!job.retiring&&job.status!=='understaffed')text.textContent+=' · Thiếu ăn: khai thác 50% tốc độ';
        const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent=job.retiring?'Đang chờ về':'Cho nghỉ';dismiss.disabled=job.retiring;
        dismiss.onclick=()=>{manager.dismiss(job.id);render();};row.append(text,dismiss);section.append(row);
      }
      body.append(section);
    }
    const nodes=document.createElement('p');nodes.className='extraction-help';
    nodes.textContent=Object.entries(state.nodes).filter(([k])=>{const [r,c]=k.split('_').map(Number);return EXTRACTION_NODES[grid[r]?.[c]];}).map(([k,n])=>{
      const [r,c]=k.split('_').map(Number),config=EXTRACTION_NODES[grid[r][c]];
      return `${config.name} (${r}, ${c}): ${n.remaining}/${config.capacity}${n.remaining===0?` · hồi sau ${Math.ceil(config.recoverySeconds-n.recovery)}s`:''}`;
    }).join(' | ');
    body.append(nodes);
    focusTarget?.focus();
  }
  function open(row,col){ctx.onOpen?.();selected=Number.isInteger(row)&&Number.isInteger(col)?{row,col}:null;if(panel){panel.classList.remove('hidden');panel.style.display='flex';render();}}
  document.getElementById('extraction-close')?.addEventListener('click',close,{signal:ctx.signal});
  document.getElementById('btn-open-extraction')?.addEventListener('click',()=>open(),{signal:ctx.signal});
  panel?.addEventListener('click',e=>{if(e.target===panel)close();},{signal:ctx.signal});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')close();},{signal:ctx.signal});
  return {open,close,render,update(now){if(now-lastPaint>=500){lastPaint=now;render();}}};
}
