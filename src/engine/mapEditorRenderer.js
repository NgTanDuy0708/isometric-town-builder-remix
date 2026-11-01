import {createCanvasRenderer} from './canvasRenderer.js';
import {KingdomWondersManager} from './kingdomWonders.js';
// Read-only adapter: use exactly the game's layering, assets and foot anchors.
export function createMapEditorRenderer({canvas,getDocument,getCamera,onRender}){
  const none=()=>null,empty=()=>({}),doc=()=>getDocument();
  const wonders=new KingdomWondersManager({requestRender:onRender,getGameMode:()=> 'sandbox'});
  const renderer=createCanvasRenderer({
    ensureCanvasRef(){},getCanvas:()=>canvas,getContainer:()=>canvas,getContext2D:()=>canvas.getContext('2d'),
    getRenderDpr:()=>Math.min(globalThis.devicePixelRatio||1,2),getCamera,getDayNightWeather:none,
    getCurrentGrid:()=>doc().grid,getTerrainMap:()=>doc().terrainMap,getFences:()=>doc().fences,
    getMapScenery:()=>doc().mapScenery,getCustomMapLayout:()=>true,
    getConstructions:empty,getFarmlandState:()=>doc().farmlandState,getProductionState:empty,
    getBuildingLevels:()=>doc().buildingLevels,getLandUnlockedChunks:()=>[],getFlippedGrid:()=>doc().flippedGrid,
    getUpgradesInProgress:empty,getGameMode:()=> 'sandbox',getVillagerManager:none,getHoverCell:none,
    getActiveBrush:none,getBrushFlipped:()=>false,getActiveSeedBrush:none,getMovingBuilding:none,getAnimTime:()=>0,
    getFruitTreesState:()=>doc().fruitTreesState,getLivestockState:()=>doc().livestockState,
    getKingdomWondersManager:()=>wonders,requestRender:onRender,onRequestRender:onRender
  });
  return {render(){wonders.wonderSites=doc().wonderSites||{};wonders.wondersState=doc().kingdomWonders||{};renderer.renderCanvas();},destroy:()=>renderer.destroy()};
}
