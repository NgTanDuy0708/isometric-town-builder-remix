import {REGIONS,FOREST_MISSIONS} from '../data/worldConfig.js';
import {PREMIUM_OFFERS} from '../data/premiumConfig.js';
export function createAdventurePanel(ctx){
  const root=document.createElement('div');root.className='extraction-backdrop adventure-backdrop';root.hidden=true;
  root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Vùng đất và cửa hàng kim cương');
  const card=document.createElement('section');card.className='extraction-card adventure-card';root.appendChild(card);document.body.appendChild(root);
  let tab='world';
  const el=(tag,text,parent=card)=>{const node=document.createElement(tag);if(text!=null)node.textContent=text;parent.appendChild(node);return node;};
  function action(label,fn,disabled=false,parent=card){const button=el('button',label,parent);button.type='button';button.disabled=disabled;
    button.addEventListener('click',()=>{button.disabled=true;const result=fn();if(result?.ok===false)ctx.showToast(result.error,'warning');render();});return button;}
  function image(uri,name,parent){const img=el('img',null,parent);img.src=uri;img.alt=name;img.className='adventure-image';}
  function close(){root.hidden=true;}
  function render(){
    root.dataset.tutorialTab=tab;
    const world=ctx.world.getState(),hud=document.getElementById('builder-region-status');if(hud)hud.textContent=REGIONS[world.active].name;
    if(root.hidden)return;card.replaceChildren();
    const header=el('div');header.className='extraction-header';el('h2',tab==='world'?'🗺️ Vùng đất của vương quốc':'💎 Cửa hàng kim cương',header);action('Đóng ✕',close,false,header);
    const tabs=el('div');tabs.className='adventure-tabs';action('Vùng đất',()=>{tab='world';},false,tabs);action('Cửa hàng & túi vật phẩm',()=>{tab='premium';},false,tabs);
    if(tab==='world'){
      el('p','Các vùng dùng chung vàng, kim cương, kho và dân số. Ruộng, công trình, quân đội, địa hình và sự kiện được lưu riêng.');
      const tiles=el('div');tiles.className='adventure-grid';
      for(const[id,region]of Object.entries(REGIONS)){
        const section=el('section',null,tiles);section.className='extraction-workshop';image(region.image,region.name,section);el('h3',region.name,section);
        if(world.unlocked.includes(id)){
          const phase=id===world.active?ctx.getDefense?.()?.phase:world.regions[id]?.defense?.phase;
          if(['warning','battle','result'].includes(phase))el('p',phase==='warning'?'⚠️ Có cảnh báo tấn công':phase==='battle'?'⚔️ Đang bị tấn công':'🏆 Có kết quả phòng thủ chờ xem',section);
          action(id===world.active?'Đang ở đây':'Đi qua cổng',()=>{const result=ctx.world.travel(id);if(result.ok)close();return result;},id===world.active,section);
        }
        else{
          const required=ctx.world.requirements();
          el('p',`${required.level?'✓':'○'} Cấp 10 · ${required.training?'✓':'○'} Thắng diễn tập · ${required.land?'✓':'○'} Khai phá 8 khu đất trả phí`,section);
          el('p','Mở đường: 500 vàng + 10 ván + 8 đá xây dựng.',section);
          action('Mở Rừng Cổ Thụ',()=>ctx.world.unlock(),Object.values(required).some(v=>!v),section);
        }
      }
      el('p','Khi đang xem vùng khác, công nhân, lương thực, chế biến và phòng thủ vẫn chạy. Đóng game tạm dừng khai thác và chiến đấu. Hoàn thành trận hoặc hủy thao tác đặt trước khi rời vùng.').className='extraction-help';
      if(world.active==='forest'){
        el('h3','🌳 Hành trình Rừng Cổ Thụ');
        el('p','Xưởng mộc là trung tâm tiền đồn. Xây Trạm kiểm lâm, thuê dân để thu gỗ cổ thụ. Phòng thủ hoạt động riêng tại đây.');
        for(let i=0;i<FOREST_MISSIONS.length;i++){
          const m=FOREST_MISSIONS[i],done=world.completedMissions.includes(m.id),section=el('section');section.className='extraction-workshop';
          el('h3',`${done?'✓ ':''}${m.name}`,section);el('p',m.description,section);
          el('p',`Thưởng ${m.gold} vàng + ${m.gems} kim cương`,section);
          action(done?'Đã hoàn thành':'Giao hàng / nhận thưởng',()=>ctx.world.claimMission(m.id),done||FOREST_MISSIONS.slice(0,i).some(x=>!world.completedMissions.includes(x.id)),section);
        }
      }
    }else{
      const premium=ctx.premium.getState();el('p',`Bạn có ${ctx.getGems()} kim cương. Vật phẩm mua vào túi; chỉ trừ khỏi túi khi đặt thành công.`);
      const tiles=el('div');tiles.className='adventure-grid';
      for(const offer of PREMIUM_OFFERS){
        const section=el('section',null,tiles);section.className='extraction-workshop';image(offer.image,offer.name,section);el('h3',offer.name,section);
        el('p',offer.gold?`${offer.gems} 💎 → ${offer.gold.toLocaleString('vi-VN')} vàng`:offer.gems?`${offer.gems} 💎`:'Chế tác: 5 gỗ cổ thụ',section);
        const receipt=`${offer.id}:${premium.nextId}`;
        action(offer.gold?'Đổi lấy vàng':offer.gems?'Mua vào túi':'Chế tác kỷ vật',()=>ctx.premium.buy(offer.id,receipt),ctx.getGems()<offer.gems,section);
        if(offer.tileId){el('p',`Trong túi: ${premium.inventory[offer.tileId]||0}`,section);
          action('Chọn vị trí đặt',()=>{ctx.selectTile(offer.tileId);close();},!(premium.inventory[offer.tileId]>0),section);}
      }
      el('p','Vật phẩm trang trí không tăng sát thương hay dân số. Bạn có thể kiếm kim cương từ hành trình rừng và các trận rồng thật. Không mua hoặc trừ tiền thật.').className='extraction-help';
    }
  }
  function open(next='world'){tab=next;ctx.onOpen?.();root.hidden=false;render();card.querySelector('button')?.focus();}
  document.getElementById('btn-world-map')?.addEventListener('click',()=>open('world'),{signal:ctx.signal});
  document.getElementById('btn-premium-shop')?.addEventListener('click',()=>open('premium'),{signal:ctx.signal});
  root.addEventListener('click',event=>{if(event.target===root)close();},{signal:ctx.signal});
  window.addEventListener('keydown',event=>{if(event.key==='Escape')close();},{signal:ctx.signal});
  return {open,close,render,destroy(){root.remove();}};
}
