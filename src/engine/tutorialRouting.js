import {PANEL_TARGETS} from '../data/tutorialGuides.js';
import {SHOP_CATEGORY_LABELS} from '../data/shopCatalog.js';

// Describe the next click from the UI that is actually visible, including recovery
// when a player goes back, opens another category, or closes a window mid-tour.
export function routeTutorialStep(step,ui){
  if(step.panel==='shop'&&step.category){
    const label=SHOP_CATEGORY_LABELS[step.category]||step.category,name=step.itemName||'món đang học';
    if(!ui.panels?.shop)return {...step,ack:false,world:undefined,target:PANEL_TARGETS.shop,navigationCategory:null,
      title:`Mở Cửa hàng để tìm ${name}`,body:`Bấm Cửa hàng. Sau đó chọn ${label}; bàn tay sẽ chỉ đúng thẻ ${name} bên trong.`,navigateLabel:'Mở Cửa hàng'};
    if(ui.shopCategory!==step.category){
      const back=!!ui.shopCategory;
      return {...step,ack:false,world:undefined,target:back?'#shop-modal-back-btn':`[data-shop-cat="${step.category}"]`,
        title:back?'Quay lại danh mục':`Chọn ${label}`,navigateLabel:`Đến ${label}`,
        body:back?`Bạn đang ở danh mục khác. Bấm mũi tên ← trong Cửa hàng, rồi chọn ${label} để tìm ${name}.`:`Chọn danh mục ${label} đang sáng. Bước sau sẽ chỉ thẳng vào thẻ ${name}.`};
    }
  }
  if(step.panel==='seed'&&step.ack&&!ui.panels?.seed)return {...step,ack:false,world:'empty-farm',openTour:true,
    title:'Mở lại danh sách hạt giống',body:'Chọn một luống đất trống để xem đúng dòng hạt đang học. Nếu các luống đều có cây, thu hoạch trước hoặc bấm Để sau.',navigateLabel:'Mở danh sách hạt'};
  return step;
}
export function featureStepDone(step,ui){
  if(step.shopStage==='open')return !!ui.panels?.shop;
  return !!ui.panels?.[step.panel]&&(!step.category||ui.shopCategory===step.category);
}
