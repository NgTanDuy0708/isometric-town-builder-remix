import {VILLAGE_GATE_URI,VILLAGE_GATE_GEOMETRY} from './villageGate.js';
export const MAP_SCENE_ITEMS=[
  {id:'scene:gate',label:'Cổng thành tháp đôi',category:'decor',uri:VILLAGE_GATE_URI,maxLevel:1},
  {id:'scene:pier',label:'Cảng biển · cầu cảng đá',category:'nature',uri:'/assets/aistudio/cang_67fa4e39.png',maxLevel:1},
  {id:'scene:ship',label:'Tàu biển Hoàng Gia',category:'nature',uri:'/assets/aistudio/TauHoangGia_v1_a5f7fe14.png',maxLevel:1}
];
export const MAP_SCENE_BY_ID=Object.fromEntries(MAP_SCENE_ITEMS.map(item=>[item.id,item]));
export function getMapSceneRect(id){
  if(id==='scene:gate'){
    const g=VILLAGE_GATE_GEOMETRY[1],scale=g.worldWidth/g.visibleWidth;
    return {dx:g.worldAnchorX-g.anchorX*scale,dy:g.worldAnchorY-g.anchorY*scale,dw:g.width*scale,dh:g.height*scale};
  }
  if(id==='scene:pier')return {dx:64-200*540/768,dy:128-200*690/768,dw:200,dh:200};
  if(id==='scene:ship')return {dx:64-230*.595,dy:128-230*.827,dw:230,dh:230};
  return undefined;
}
