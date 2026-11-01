import {DEFENSE_UNLOCK_LEVEL,TOWER_REPAIR,VILLAGE_REPAIR,getRaidReward,ENEMY_KINDS} from '../data/defenseConfig.js';
import {MILITARY_CAMPS,MILITARY_UNITS,getMilitaryUnit,getSoldierSlots} from '../data/militaryConfig.js';

export function getDefenseStatus(summary){
  const name=ENEMY_KINDS[summary.raid?.kind]?.name||'Goblin';
  if(summary.phase==='warning')return `👺 ${name} tới sau ${Math.ceil(summary.remaining)}s`;
  if(summary.phase==='battle')return `⚔️ Đang giao chiến · ${summary.enemies.filter(enemy=>enemy.hp>0).length} ${name.toLowerCase()} · làng ${Math.ceil(summary.villageHp)}/100`;
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
  function watchBattle(){close();ctx.viewBattle?.(ctx.manager.summary());}
  function startTraining(kind='goblin'){const result=ctx.manager.startTraining(kind);if(result.ok)watchBattle();return result;}
  function render(){
    const summary=ctx.manager.summary(),hud=document.getElementById('builder-defense-status');
    if(hud)hud.textContent=getDefenseStatus(summary);
    const watch=document.getElementById('btn-watch-defense');if(watch)watch.hidden=!summary.active;
    if(root.hidden)return;
    card.replaceChildren();
    const header=el('div');header.className='extraction-header';el('h2','🛡️ Phòng thủ làng',header);
    action('Đóng ✕',close,false,header);
    el('p',getDefenseStatus(summary));
    if(summary.active)action('Xem trận trên bản đồ',watchBattle);
    if(summary.unlockError)el('p',summary.unlockError).className='extraction-food-warning';
    el('p',`Sức phòng thủ làng: ${Math.ceil(summary.villageHp)}/100. Tháp hư ngừng bắn ở 0; nhà cửa và dân được giữ nguyên.`).className='extraction-help';
    action(`Sửa phòng thủ làng · ${price(VILLAGE_REPAIR)}`,()=>ctx.manager.repair(),summary.active||summary.villageHp>=100);
    if(summary.phase==='result'){
      const result=summary.result;
      el('h3',result.outcome==='victory'?'Đã tiêu diệt toàn bộ địch':result.outcome==='defeat'?'Phòng tuyến bị chọc thủng':'Địch rút lui khi hết giờ');
      if(result.outcome==='victory'&&!result.practice){
        const reward=getRaidReward(result.training,result.wave,result.kind);
        action(result.claimed?'Đã nhận thưởng':`Nhận ${reward.gold} vàng + ${reward.xp} XP${reward.gems?` + ${reward.gems} 💎`:''}`,()=>ctx.manager.claimReward(),result.claimed);
      }else el('p',result.practice?'Diễn tập lại để quan sát trận, không nhận thêm thưởng.':'Không mất công trình hoặc hàng trong kho. Sửa tháp/làng rồi chuẩn bị lại; đợt này không có thưởng.');
      action('Tiếp tục',()=>ctx.manager.acknowledge(),result.outcome==='victory'&&!result.claimed&&!result.practice);
    }else{
      if(!summary.trainingDone){
        el('h3','Nhiệm vụ: Diễn tập phòng thủ');
        el('p',`Đạt cấp ${DEFENSE_UNLOCK_LEVEL}, hoàn thành ít nhất 1 Tháp canh và đánh bại 3 goblin. Có 15 giây cảnh báo trước diễn tập.`);
        action('Bắt đầu diễn tập goblin',startTraining,!!summary.unlockError||summary.phase!=='idle');
      }else{
        action(summary.enabled?'Dừng các đợt kế tiếp':'Bật tấn công ngẫu nhiên',()=>ctx.manager.setEnabled(!summary.enabled),!summary.enabled&&!!summary.unlockError);
        if(summary.phase==='idle')action('Diễn tập lại · không thưởng',startTraining,!!summary.unlockError);
        if(summary.phase==='idle'){
          action('Diễn tập quái rừng · cấp 10 · không thưởng',()=>startTraining('troll'),!!summary.unlockError||summary.playerLevel<10);
          action('Diễn tập rồng · cấp 12 · không thưởng',()=>startTraining('dragon'),!!summary.unlockError||summary.playerLevel<12);
        }
      }
    }
    el('p','Bật tấn công: có 5 phút chuẩn bị lần đầu, sau đó mỗi 8–12 phút chơi có một đợt và 60 giây cảnh báo. Tắt không hủy trận/cảnh báo đang diễn ra. Đóng game tạm dừng, không sinh thêm đợt offline.').className='extraction-help';
    el('h3','Tháp canh');
    el('p','Từ cấp 10, quái rừng xuất hiện ở mỗi đợt chẵn (mọi đợt tại vùng rừng). Từ cấp 12, mỗi đợt thứ 3 có rồng bay, phun lửa tầm 2,5 ô. Vệ binh không đánh được mục tiêu bay: chuẩn bị tháp và pháp sư. Thắng rồng thật nhận thêm 1 kim cương.').className='extraction-help';
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
    el('h3','⚔️ Quân đội: vệ binh và pháp sư');
    const food=ctx.getFoodSummary?.(),labor=ctx.manager.labor();
    el('p',`Dân rảnh: ${labor.free} · Lính (kể cả đang huấn luyện): ${labor.soldiers}${food?` · Lương thực chung: ${food.portions} khẩu phần, dùng ${food.portionsPerMinute.toLocaleString('vi-VN')}/phút${food.hungry?' · Thiếu ăn, huấn luyện/đánh chậm gấp đôi':''}`:''}`);
    if(ctx.openFood)action('Chọn lương thực cho công nhân và lính',()=>{close();ctx.openFood();});
    el('p','1 lính cần 1 dân rảnh + 50 vàng + 1 dụng cụ sắt; huấn luyện 20 giây. Lính tự chặn goblin rồi về trại, hồi 2 máu/giây ở trại ngoài giao chiến. Bị hạ vẫn giữ dân, không mất vĩnh viễn.').className='extraction-help';
    el('p','Pháp sư mở cấp 8: 1 dân + 80 vàng + 1 dụng cụ sắt + 2 vải; huấn luyện 30 giây. Có 40 máu, tầm 3 ô, mỗi phép 14 sát thương quanh mục tiêu trong 1 ô, hồi phép 2 giây. Dùng cùng khẩu phần với vệ binh.').className='extraction-help';
    const grid=ctx.getCurrentGrid?.()||[],camps=[];
    for(let r=0;r<grid.length;r++)for(let c=0;c<grid[r].length;c++)if(MILITARY_CAMPS[grid[r][c]])camps.push({r,c});
    if(!camps.length)el('p','Xây Trại huấn luyện vệ binh (cấp 6) hoặc Học viện pháp sư (cấp 8) trong Cửa hàng → Sản xuất.');
    for(const camp of camps){
      const key=`${camp.r}_${camp.c}`,section=el('section');section.className='extraction-workshop';
      const campConfig=MILITARY_CAMPS[grid[camp.r][camp.c]],config=MILITARY_UNITS[campConfig.unitType];
      const roster=summary.soldiers.filter(soldier=>soldier.homeRow===camp.r&&soldier.homeCol===camp.c);
      const slots=getSoldierSlots(ctx.getBuildingLevels?.()[key]||1);
      el('h3',`${campConfig.name} (${camp.r}, ${camp.c}) · ${roster.length}/${slots} người`,section);
      action(campConfig.unitType==='mage'?'Huấn luyện pháp sư · 80 vàng + 1 dụng cụ sắt + 2 vải':'Huấn luyện 1 lính · 50 vàng + 1 dụng cụ sắt',()=>ctx.manager.trainSoldier(camp.r,camp.c),
        labor.free<1||summary.playerLevel<config.level||roster.length>=slots||!!ctx.getConstructions?.()[key],section);
      action('Nâng cấp trại',()=>{close();ctx.openUpgradeModal(camp.r,camp.c);},false,section);
      const labels={training:'Đang huấn luyện',idle:'Đồn trú',marching:'Đang tới chặn địch',fighting:'Đang chiến đấu',
        recovering:'Dưỡng thương',returning:'Đang về trại',no_path:'Không có đường',understaffed:'Thiếu suất dân — tạm dừng'};
      for(const soldier of roster){
        el('p',`#${soldier.id} ${getMilitaryUnit(soldier).name} · ${labels[soldier.status]||soldier.status} · ${Math.ceil(soldier.hp)}/${config.hp} máu${soldier.trainLeft?` · còn ${Math.ceil(soldier.trainLeft)}s`:''}${soldier.retiring?' · Chờ về để nghỉ':''}`,section);
        action(soldier.retiring?'Đang chờ về trại':'Cho lính nghỉ',()=>ctx.manager.dismissSoldier(soldier.id),summary.active||soldier.retiring,section);
      }
    }
    const preview=el('a','Xem mô phỏng trận và toàn bộ động tác');preview.href='/combat-preview';preview.target='_blank';preview.rel='noopener';
  }
  function open(r,c){ctx.onOpen?.();selected=Number.isInteger(r)&&Number.isInteger(c)?{r,c}:null;root.hidden=false;render();card.querySelector('button')?.focus();}
  document.getElementById('btn-open-defense')?.addEventListener('click',()=>open(),{signal:ctx.signal});
  document.getElementById('btn-watch-defense')?.addEventListener('click',watchBattle,{signal:ctx.signal});
  root.addEventListener('click',event=>{if(event.target===root)close();},{signal:ctx.signal});
  window.addEventListener('keydown',event=>{if(event.key==='Escape')close();},{signal:ctx.signal});
  return {open,close,render,update(now){if(now-lastPaint>=500){lastPaint=now;render();}},destroy(){root.remove();}};
}
