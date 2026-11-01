import {isLivestockTile} from './livestockConfig.js';

// Native image_gen PNG. Only scale at draw time; preserve its original alpha.
export const CONSTRUCTION_ART={
  uri:'/assets/buildings/construction_scaffold_v1.png',
  width:1254,height:1254,bounds:[160,51,1122,1187],
  anchorX:631.8731025273452,anchorY:1187,
  sha256:'49cbe736e28fc1ac94f97926a4830244b0fd3a6f74c347aea3fdd30a5f579e9b'
};

export function getConstructionRenderAdjustment(tileId,flipped=false){
  const pen=isLivestockTile(tileId);
  // A square scaffold fits the narrow axis of a two-cell pen, centred between
  // its cells. A 2x2 warehouse gets a uniformly enlarged copy of the same art.
  const width=tileId==='b60_combined_warehouse'?224:112;
  const worldX=pen?64+(flipped?32:-32):64,worldY=pen?112:128;
  const scale=width/(CONSTRUCTION_ART.bounds[2]-CONSTRUCTION_ART.bounds[0]);
  return {dx:worldX-CONSTRUCTION_ART.anchorX*scale,dy:worldY-CONSTRUCTION_ART.anchorY*scale,
    dw:CONSTRUCTION_ART.width*scale,dh:CONSTRUCTION_ART.height*scale,worldX,worldY};
}
