import {DEFENSE_UNLOCK_LEVEL,TOWER_REPAIR,VILLAGE_REPAIR,getRaidReward} from '../data/defenseConfig.js';

export function getDefenseStatus(summary){
  if(summary.phase==='warning')return `👺 Goblin tới sau ${Math.ceil(summary.remaining)}s`;
  if(summary.phase==='battle')return `⚔️ Đang giao chiến · ${summary.enemies.filter(enemy=>enemy.hp>0).length} goblin · làng ${Math.ceil(summary.villageHp)}/100`;
  if(summary.phase==='result')return summary.result?.outcome==='victory'?'🏆 Thắng trận · xem kết quả':'🛠️ Kết thúc trận · xem kết quả';
  if(summary.phase==='preparing'&&summary.enabled)return summary.unlockError?`🛡️ Đang chờ: ${summary.unlockError}`:`🛡️ Đợt tới sau ${Math.ceil(summary.remaining)}s`;
  return summary.trainingDone?'🛡️ Tấn công ngẫu nhiên đang tắt':`🛡️ Diễn tập phòng thủ · cấp ${DEFENSE_UNLOCK_LEVEL}`;
}

export function createDefensePanel(ctx){
  const root=document.createElement('div');root.className='extraction-backdrop defense-backdrop';root.hidden=true;
  root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Phòng thủ làng');
  const card=document.createElement('section');card.className='extraction-card';root.appendChild(card);document.body.appendChild(root);
  let selected=null,lastPaint=0;
  function close(){root.hidden=true;}
  const el=(tag,text,parent=card)=>{const node=document.createElement(tag);if(text!=null)node.textContent=text;parent.appendChild(node);return node;};
  function action(label,fn,disabled=false,parent=card){
    const button=el('button',label,parent);button.type='button';button.disabled=disabled;
    button.addEventListener('click',()=>{const result=fn();if(result?.ok===false)ctx.showToast(result.error,'warning');render();});return button;
  }
  const price=cost=>`${cost.gold} vàng + ${cost.resources.wood} gỗ + ${cost.resources.stone} đá`;
  function render(){
    const summary=ctx.manager.summary(),hud=document.getElementById('builder-defense-status');
    if(hud)hud.textContent=getDefenseStatus(summary);
    if(root.hidden)return;
    card.replaceChildren();
    const header=el('div');header.className='extraction-header';el('h2','🛡️ Phòng thủ làng',header);
    action('Đóng ✕',close,false,header);
    el('p',getDefenseStatus(summary));
    if(summary.unlockError)el('p',summary.unlockError).className='extraction-food-warning';
    el('p',`Sức phòng thủ làng: ${Math.ceil(summary.villageHp)}/100. Tháp hư ngừng bắn ở 0; nhà cửa và dân được giữ nguyên.`).className='extraction-help';
    action(`Sửa phòng thủ làng · ${price(VILLAGE_REPAIR)}`,()=>ctx.manager.repair(),summary.active||summary.villageHp>=100);
    if(summary.phase==='result'){
      const result=summary.result;
      el('h3',result.outcome==='victory'?'Đã tiêu diệt toàn bộ goblin':result.outcome==='defeat'?'Phòng tuyến bị chọc thủng':'Goblin rút lui khi hết giờ');
      if(result.outcome==='victory'){
        const reward=getRaidReward(result.training,result.wave);
        action(result.claimed?'Đã nhận thưởng':`Nhận ${reward.gold} vàng + ${reward.xp} XP`,()=>ctx.manager.claimReward(),result.claimed);
      }else el('p','Không mất công trình hoặc hàng trong kho. Sửa tháp/làng rồi chuẩn bị lại; đợt này không có thưởng.');
      action('Tiếp tục',()=>ctx.manager.acknowledge(),result.outcome==='victory'&&!result.claimed);
    }else{
      if(!summary.trainingDone){
        el('h3','Nhiệm vụ: Diễn tập phòng thủ');
        el('p',`Đạt cấp ${DEFENSE_UNLOCK_LEVEL}, hoàn thành ít nhất 1 Tháp canh và đánh bại 3 goblin. Có 15 giây cảnh báo trước diễn tập.`);
        action('Bắt đầu diễn tập goblin',()=>ctx.manager.startTraining(),!!summary.unlockError||summary.phase!=='idle');
      }else{
        action(summary.enabled?'Dừng các đợt kế tiếp':'Bật tấn công ngẫu nhiên',()=>ctx.manager.setEnabled(!summary.enabled),!summary.enabled&&!!summary.unlockError);
      }
    }
    el('p','Bật tấn công: có 5 phút chuẩn bị lần đầu, sau đó mỗi 8–12 phút chơi có một đợt và 60 giây cảnh báo. Tắt không hủy trận/cảnh báo đang diễn ra. Đóng game tạm dừng, không sinh thêm đợt offline.').className='extraction-help';
    el('h3','Tháp canh');
    const visible=selected?summary.towerList.filter(tower=>tower.r===selected.r&&tower.c===selected.c):summary.towerList;
    if(!visible.length)el('p','Xây Tháp canh trong Cửa hàng → Sản xuất (mở cấp 4). Chừa đất trống/đường tới rìa đất đã mở.');
    for(const tower of visible){
      const section=el('section');section.className='extraction-workshop';
      el('h3',`Tháp (${tower.r}, ${tower.c}) · ${Math.ceil(tower.hp)}/100`,section);
      el('p',`Tầm ${tower.range} ô · ${tower.damage} sát thương/giây${tower.hp<=0?' · Hư, cần sửa':''}`,section);
      action(`Sửa tháp · ${price(TOWER_REPAIR)}`,()=>ctx.manager.repair(tower.k),summary.active||tower.hp>=100,section);
      action('Xem / nâng cấp',()=>{close();ctx.openUpgradeModal(tower.r,tower.c);},false,section);
    }
    if(selected)action('Xem toàn bộ tháp',()=>{selected=null;});
    el('p','Bản đầu dùng tháp tự bắn và goblin. Lính, pháp sư và rồng sẽ bổ sung ở lượt sau. Đồ họa goblin đang dùng hình SVG tạm.').className='extraction-help';
  }
  function open(r,c){ctx.onOpen?.();selected=Number.isInteger(r)&&Number.isInteger(c)?{r,c}:null;root.hidden=false;render();card.querySelector('button')?.focus();}
  document.getElementById('btn-open-defense')?.addEventListener('click',()=>open(),{signal:ctx.signal});
  root.addEventListener('click',event=>{if(event.target===root)close();},{signal:ctx.signal});
  window.addEventListener('keydown',event=>{if(event.key==='Escape')close();},{signal:ctx.signal});
  return {open,close,render,update(now){if(now-lastPaint>=500){lastPaint=now;render();}},destroy(){root.remove();}};
}
