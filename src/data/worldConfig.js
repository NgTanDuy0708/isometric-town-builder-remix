import {applyCoastTerrainLayout} from './terrainConfig.js';
import {applyVillageGateLayout} from './villageGate.js';
import {INITIAL_UNLOCKED_CHUNKS,FREE_CHUNKS} from './landConfig.js';

export const REGIONS={town:{name:'Làng Hoàng Gia',image:'/assets/buildings/village_gate_v2.png'},
  forest:{name:'Rừng Cổ Thụ',image:'/assets/decorations/forest_3.png'}};
export const FOREST_UNLOCK={level:10,chunks:8,gold:500,resources:{plank:10,buildingStone:8}};
export const REGION_FIELDS=['grid','terrainMap','fences','mapLocks','mapScenery','customMapLayout','flippedGrid','constructions','productionState','extraction','defense',
  'farmlandState','fruitTreesState','buildingLevels','upgradesInProgress','livestockState','land','wonderSites'];
export const FOREST_MISSIONS=[
  {id:'restore',name:'Khôi phục tiền đồn',description:'Giao 20 gỗ, 10 đá và 5 thỏi sắt.',inputs:{wood:20,stone:10,ironIngot:5},gold:250,gems:3},
  {id:'ancient',name:'Bí mật cây cổ thụ',description:'Khai thác và giao 10 gỗ cổ thụ bằng Trạm kiểm lâm.',inputs:{ancientWood:10},gold:400,gems:5},
  {id:'defend',name:'Bảo vệ Rừng Cổ Thụ',description:'Thắng một đợt tấn công thật trong rừng rồi nhận thưởng phòng thủ.',inputs:{},gold:500,gems:8}
];
export const paidLandCount=chunks=>[...new Set(chunks||[])].filter(id=>Number.isInteger(id)&&id>=0&&id<64&&!FREE_CHUNKS.includes(id)).length;

export function createForestRegion(){
  const grid=Array.from({length:32},()=>Array(32).fill('d12_meadow_wildflowers'));
  applyCoastTerrainLayout(grid);
  // Playable glades and paths, with dense forest around them; reuse native art.
  for(let r=0;r<32;r++)for(let c=7;c<32;c++) {
    if((r<8||r>24||c<9||c>25)&&(r*13+c*7)%4===0)grid[r][c]='d05_pine_grove';
  }
  for(let r=10;r<32;r++)grid[r][15]='r01_road_straight_ns';
  for(let c=10;c<24;c++)grid[18][c]='r02_road_straight_ew';
  grid[18][15]='r03_road_cross';
  for(let r=11;r<=12;r++)for(let c=11;c<=12;c++)grid[r][c]='b60_combined_warehouse';
  grid[16][13]='b11_carpenter_sawmill';grid[20][18]='b01_cottage_red';
  grid[19][13]='b08_watchtower';
  for(const [r,c,id] of [[10,18,'n01_logging_grove'],[21,22,'n02_stone_deposit'],[9,21,'n03_iron_deposit'],
    [12,14,'n04_ancient_grove'],[12,16,'n04_ancient_grove'],[13,14,'n04_ancient_grove'],[13,16,'n04_ancient_grove']])grid[r][c]=id;
  applyVillageGateLayout(grid);
  return {grid,terrainMap:null,fences:[],flippedGrid:{},constructions:{},productionState:{},extraction:null,defense:null,
    farmlandState:{},fruitTreesState:{},buildingLevels:{},upgradesInProgress:{},livestockState:{},
    land:{unlockedChunks:[...new Set([...INITIAL_UNLOCKED_CHUNKS,51,52,59,60])]},wonderSites:{}};
}
