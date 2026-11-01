import {PREMIUM_OFFERS,isPremiumTile,createPremiumState} from '../data/premiumConfig.js';
import {canPlaceOnSurface,isPlacementProtected} from './placementSurface.js';
import {getBaseTerrainTile} from '../data/terrainConfig.js';
export function createPremiumManager(ctx){
  let state=createPremiumState();
  const init=raw=>{state=createPremiumState(raw);};
  // UI supplies a stable receipt for each rendered button; double clicks replay safely.
  function buy(id,receipt){
    if(typeof receipt!=='string'||!receipt||receipt.length>100)return {ok:false,error:'Giao dịch không hợp lệ.'};
    if(state.receipts.includes(receipt))return {ok:false,error:'Giao dịch này đã hoàn tất.'};
    if(receipt!==`${id}:${state.nextId}`)return {ok:false,error:'Ưu đãi đã thay đổi. Mở lại cửa hàng để mua.'};
    const offer=PREMIUM_OFFERS.find(o=>o.id===id);if(!offer)return {ok:false,error:'Vật phẩm không tồn tại.'};
    const resources=ctx.getResources();
    if(ctx.getGems()<offer.gems||Object.entries(offer.resources||{}).some(([key,n])=>(resources[key]||0)<n))return {ok:false,error:'Chưa đủ kim cương hoặc gỗ cổ thụ.'};
    if(offer.tileId&&state.inventory[offer.tileId]>=999)return {ok:false,error:'Túi vật phẩm đã đầy.'};
    const before=structuredClone(state),gems=ctx.getGems(),gold=ctx.getGold(),oldResources={...resources};
    ctx.setGems(gems-offer.gems);for(const[key,n]of Object.entries(offer.resources||{}))resources[key]-=n;
    if(offer.gold)ctx.setGold(gold+offer.gold);
    if(offer.tileId)state.inventory[offer.tileId]++;
    state.receipts.push(receipt);state.receipts=state.receipts.slice(-200);state.nextId++;
    let saved=false;try{saved=ctx.persist()!==false;}catch{/* Roll back the complete transaction below. */}
    if(!saved){state=before;ctx.setGems(gems);ctx.setGold(gold);Object.assign(resources,oldResources);return {ok:false,error:'Không lưu được giao dịch. Số dư đã được giữ lại.'};}
    ctx.onChanged();return {ok:true};
  }
  function place(id,row,col,flipped=false){
    if(!isPremiumTile(id)||!(state.inventory[id]>0))return {ok:false,error:'Mua vật phẩm vào túi trước khi đặt.'};
    const grid=ctx.getGrid(),old=grid[row]?.[col],key=`${row}_${col}`;
    if(!old||!ctx.isUnlocked(row,col)||ctx.isObstacle?.(row,col)||ctx.getConstructions()[key]||
      isPlacementProtected(id,row,col,old)||!canPlaceOnSurface(id,old))return {ok:false,error:'Chọn ô đất trống đã mở, ngoài công trình và lối đi cố định.'};
    const flips=ctx.getFlips(),oldFlip=flips[key];grid[row][col]=id;flips[key]=!!flipped;state.inventory[id]--;
    let saved=false;try{saved=ctx.persist()!==false;}catch{/* Keep inventory when storage is unavailable. */}
    if(!saved){grid[row][col]=old;if(oldFlip===undefined)delete flips[key];else flips[key]=oldFlip;state.inventory[id]++;return {ok:false,error:'Không lưu được vị trí. Vật phẩm vẫn trong túi.'};}
    ctx.onChanged();return {ok:true};
  }
  function reclaim(row,col){
    const grid=ctx.getGrid(),id=grid[row]?.[col],key=`${row}_${col}`;
    if(!isPremiumTile(id)||!ctx.isUnlocked(row,col)||state.inventory[id]>=999)return {ok:false,error:'Không thể cất vật phẩm tại ô này.'};
    const flips=ctx.getFlips(),oldFlip=flips[key];grid[row][col]=ctx.getTerrain?.()?.[row]?.[col]||getBaseTerrainTile(col);
    delete flips[key];state.inventory[id]++;
    let saved=false;try{saved=ctx.persist()!==false;}catch{/* Restore both the world and bag below. */}
    if(!saved){grid[row][col]=id;if(oldFlip!==undefined)flips[key]=oldFlip;state.inventory[id]--;return {ok:false,error:'Không lưu được. Vật phẩm vẫn ở vị trí cũ.'};}
    ctx.onChanged();return {ok:true};
  }
  return {init,getState:()=>state,buy,place,reclaim};
}
