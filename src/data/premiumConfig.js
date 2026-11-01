export const PREMIUM_OFFERS=[
  {id:'gold_small',name:'Túi vàng',gems:5,gold:500,image:'/assets/ui/icon_shop.png'},
  {id:'gold_large',name:'Rương vàng',gems:20,gold:2200,image:'/assets/ui/icon_shop.png'},
  {id:'royal_lion',name:'Tượng hiệp sĩ hoàng gia',gems:12,tileId:'p01_royal_lion',image:'/assets/decorations/knight_statue.png'},
  {id:'royal_banner',name:'Cờ hiệu hoàng gia',gems:8,tileId:'p02_royal_banner',image:'/assets/aistudio/C_t_c__hi_u_ho_ng_tri_u_78f7b9bb.png'},
  {id:'forest_trophy',name:'Kỷ vật Rừng Cổ Thụ',gems:0,resources:{ancientWood:5},tileId:'p03_ancient_tree',image:'/assets/decorations/forest_3.png'}
];
export const PREMIUM_TILES=PREMIUM_OFFERS.filter(o=>o.tileId).map(o=>({id:o.tileId,label:o.name,category:'decoration',shopCategory:'hidden',doc:'Vật phẩm sưu tầm. Mua trong cửa hàng kim cương rồi chọn vị trí đặt.'}));
export const isPremiumTile=id=>PREMIUM_TILES.some(t=>t.id===id);
export function createPremiumState(raw){return {version:1,inventory:Object.fromEntries(PREMIUM_TILES.map(t=>[t.id,Math.max(0,Math.min(999,Math.floor(Number(raw?.inventory?.[t.id])||0)))])),
  receipts:Array.isArray(raw?.receipts)?raw.receipts.filter(id=>typeof id==='string').slice(-200):[],nextId:Math.max(1,Math.floor(Number(raw?.nextId)||1))};}
