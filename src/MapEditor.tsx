import React,{useEffect,useMemo,useRef,useState} from 'react';
import {getDefaultSaveState,STORAGE_KEY_V3,BACKUP_STORAGE_KEY} from './engine/storage.js';
import {createStarterTownMap32} from './data/starterMap.js';
import {ORIGIN_X,ORIGIN_Y,cellToWorld} from './engine/isoMath.js';
import {TERRAIN_IDS,readTerrainMap,TERRAIN_DRAFT_KEY,syncTerrainToGrid,isValidTerrainMap} from './engine/terrainEditing.js';
import {getTerrainSprite} from './data/terrainConfig.js';
import {isLivestockTile} from './data/livestockConfig.js';
import {createMapEditorRenderer} from './engine/mapEditorRenderer.js';
import {MAP_ITEMS,MAP_ITEM_BY_ID,MAP_CATEGORIES,MAP_DRAFT_KEY,STARTER_MAP_KEY,MAP_APPLY_KEY,
  createMapDocument,readMapDocument,writeMapDocument,isValidMapDocument,stampMapItem,eraseMapItem,
  getMapSelection,setMapRemovalRule,paintMapTerrain,mapItemUri,rotateMapItem} from './engine/mapEditing.js';
import {insideMapEditor} from './engine/mapEditing.js';
import {getRotatedTileIdAndFlip} from './engine/upgradeManager.js';
import './mapEditor.css';

type Cell={row:number;col:number};
type Tool='brush'|'fill'|'rectangle'|'hand'|'erase'|'select';
type Camera={x:number;y:number;zoom:number};
const materials=[['grass','Đồng cỏ'],['sea','Nước biển'],['shore','Bờ biển'],['sand','Cát vàng']] as const;
const tools=[['brush','✎','Cọ đặt','B'],['select','⌖','Chọn vật phẩm','V'],['erase','⌫','Tẩy vật phẩm','E'],['fill','▨','Đổ nền','F'],['rectangle','▭','Vùng nền','G'],['hand','✥','Di chuyển','H']] as const;
function readSave(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY_V3)||'null');}catch{return null;}}
function defaultDocument(){return createMapDocument(getDefaultSaveState(createStarterTownMap32()));}
function initialDocument(){
  const draft=readMapDocument(localStorage,MAP_DRAFT_KEY);if(draft)return draft;
  const save=readSave();const town=save?.world?.active==='forest'?save.world.regions.town:save;
  const doc=town?.grid?createMapDocument(town):readMapDocument(localStorage,STARTER_MAP_KEY)||defaultDocument();
  const terrain=readTerrainMap(localStorage,TERRAIN_DRAFT_KEY)||readTerrainMap(localStorage);
  if(terrain){doc.terrainMap=terrain;syncTerrainToGrid(doc.grid,terrain);}
  return doc;
}

export default function MapEditor(){
  const [doc,setDoc]=useState<any>(initialDocument),docRef=useRef(doc);
  const previewRef=useRef(doc);
  const [layer,setLayer]=useState<'terrain'|'items'>('items');
  const [material,setMaterial]=useState<keyof typeof TERRAIN_IDS>('grass');
  const [item,setItem]=useState('b01_cottage_red'),[category,setCategory]=useState('all'),[search,setSearch]=useState('');
  const [level,setLevel]=useState(1),[flipped,setFlipped]=useState(false),[locked,setLocked]=useState(false),[animals,setAnimals]=useState(1);
  const [tool,setTool]=useState<Tool>('brush'),[size,setSize]=useState(1),[showGrid,setShowGrid]=useState(true);
  const [selection,setSelection]=useState<any>(null),[hover,setHover]=useState<Cell|null>(null),[rectStart,setRectStart]=useState<Cell|null>(null);
  const [status,setStatus]=useState('Bản nháp tự lưu · Đặt vật phẩm không tốn vàng'),[dirty,setDirty]=useState(false),[historyVersion,setHistoryVersion]=useState(0);
  const [camera,setCamera]=useState<Camera>({x:0,y:0,zoom:.3}),cameraRef=useRef(camera);
  const canvasRef=useRef<HTMLCanvasElement>(null),stageRef=useRef<HTMLDivElement>(null),importRef=useRef<HTMLInputElement>(null);
  const renderer=useRef<any>(null),frame=useRef(0),space=useRef(false),gesture=useRef<any>(null);
  const undoStack=useRef<any[]>([]),redoStack=useRef<any[]>([]),live=useRef<any>({});
  const visible=useMemo(()=>{
    const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d').toLowerCase();
    const query=normalize(search);return MAP_ITEMS.filter(i=>(category==='all'||i.category===category)&&normalize(i.label+' '+i.id).includes(query));
  },[category,search]);
  const selectedItem=MAP_ITEM_BY_ID[item];
  live.current={doc,hover,rectStart,tool,layer,item,level,flipped,locked,animals,size,showGrid,selection};
  previewRef.current=hover&&tool==='brush'&&layer==='items'?stampMapItem(doc,hover.row,hover.col,item,{level,flipped,locked,animals}).doc:doc;
  const requestDraw=()=>{if(!frame.current)frame.current=requestAnimationFrame(()=>{frame.current=0;draw();});};
  function draw(){
    const canvas=canvasRef.current,ctx=canvas?.getContext('2d');if(!canvas||!ctx||!renderer.current)return;
    renderer.current.render();const state=live.current,cam=cameraRef.current,dpr=Math.min(window.devicePixelRatio||1,2);
    ctx.save();ctx.setTransform(dpr*cam.zoom,0,0,dpr*cam.zoom,dpr*cam.x,dpr*cam.y);
    const diamond=(r:number,c:number)=>{const {ox,oy}=cellToWorld(r,c);ctx.beginPath();ctx.moveTo(ox+64,oy+64);ctx.lineTo(ox+128,oy+96);ctx.lineTo(ox+64,oy+128);ctx.lineTo(ox,oy+96);ctx.closePath();};
    if(state.showGrid)for(let r=0;r<32;r++)for(let c=0;c<32;c++)if(getTerrainSprite(state.doc.grid[r][c])){
      diamond(r,c);ctx.strokeStyle='rgba(35,55,30,.22)';ctx.lineWidth=.65/cam.zoom;ctx.stroke();
    }
    for(const key of Object.keys(state.doc.mapLocks).filter(key=>state.doc.mapLocks[key])){const [r,c]=key.split('_').map(Number);const {ox,oy}=cellToWorld(r,c);ctx.fillStyle='#ffe8a6';ctx.font=`${10/cam.zoom}px system-ui`;ctx.fillText('◆',ox+60,oy+98);}
    const lockedProps=[...Object.entries(state.doc.mapScenery).filter(([,value]:any)=>value?.locked).map(([key])=>{const [row,col]=key.split('_').map(Number);return {row,col};}),...state.doc.fences.filter((f:any)=>f.locked)];
    for(const {row,col} of lockedProps){const {ox,oy}=cellToWorld(row,col);ctx.fillStyle='#ffe8a6';ctx.font=`${10/cam.zoom}px system-ui`;ctx.fillText('◆',ox+60,oy+98);}
    if(state.hover&&state.tool!=='hand'){
      const start=state.rectStart||state.hover,end=state.hover;
      const radius=state.layer==='terrain'&&state.tool==='brush'?Math.floor((state.size-1)/2):0;
      for(let r=Math.max(0,Math.min(start.row,end.row)-radius);r<=Math.min(31,Math.max(start.row,end.row)+radius);r++)for(let c=Math.max(0,Math.min(start.col,end.col)-radius);c<=Math.min(31,Math.max(start.col,end.col)+radius);c++){
        diamond(r,c);ctx.fillStyle=state.tool==='erase'?'#ff776633':'#fff0a922';ctx.fill();ctx.strokeStyle='#ffefac';ctx.lineWidth=1.5/cam.zoom;ctx.stroke();
      }
    }
    ctx.restore();
  }
  const update=(next:any)=>{docRef.current=next;setDoc(next);setDirty(true);};
  const checkpoint=()=>{undoStack.current.push(structuredClone(docRef.current));if(undoStack.current.length>60)undoStack.current.shift();redoStack.current=[];setHistoryVersion(v=>v+1);};
  const undo=()=>{const prev=undoStack.current.pop();if(!prev)return;redoStack.current.push(structuredClone(docRef.current));update(prev);setSelection(null);setHistoryVersion(v=>v+1);};
  const redo=()=>{const next=redoStack.current.pop();if(!next)return;undoStack.current.push(structuredClone(docRef.current));update(next);setSelection(null);setHistoryVersion(v=>v+1);};
  function rotateItem(){
    const state=live.current;
    if(state.selection){const result=rotateMapItem(docRef.current,state.selection.row,state.selection.col);if(!result.changed){setStatus(result.error||'Vật phẩm này không thể xoay tại đây.');return;}checkpoint();update(result.doc);const next=getMapSelection(result.doc,state.selection.row,state.selection.col);setSelection(next);if(next?.id){setItem(next.id);setFlipped(next.flipped);}}
    else {const next=getRotatedTileIdAndFlip(state.item,state.flipped);setItem(next.nextId);setFlipped(next.nextFlip);setLayer('items');}
  }
  const moveCamera=(next:Camera)=>{cameraRef.current=next;setCamera(next);requestDraw();};
  const fit=()=>{const box=stageRef.current?.getBoundingClientRect();if(!box)return;const zoom=Math.max(.08,Math.min((box.width-80)/4096,(box.height-90)/2048));moveCamera({zoom,x:box.width/2-(ORIGIN_X+64)*zoom,y:box.height/2-(ORIGIN_Y+1088)*zoom});};
  const zoomAt=(factor:number,x?:number,y?:number)=>{const box=stageRef.current?.getBoundingClientRect();if(!box)return;const old=cameraRef.current,zoom=Math.max(.08,Math.min(3,old.zoom*factor)),px=x??box.width/2,py=y??box.height/2;moveCamera({zoom,x:px-(px-old.x)*zoom/old.zoom,y:py-(py-old.y)*zoom/old.zoom});};
  useEffect(()=>{
    document.title='Xưởng dựng map · đầy đủ vật phẩm';const canvas=canvasRef.current;if(!canvas)return;
    renderer.current=createMapEditorRenderer({canvas,getDocument:()=>previewRef.current,getCamera:()=>cameraRef.current,onRender:requestDraw});
    let initialized=false;const resize=new ResizeObserver(()=>{const box=stageRef.current?.getBoundingClientRect();if(!box)return;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);if(!initialized){initialized=true;fit();}requestDraw();});
    resize.observe(stageRef.current!);requestDraw();return()=>{resize.disconnect();cancelAnimationFrame(frame.current);renderer.current?.destroy();renderer.current=null;};
  },[]);
  useEffect(()=>{requestDraw();},[doc,hover,rectStart,tool,layer,size,showGrid,camera,item,level,flipped,locked,animals]);
  useEffect(()=>{const timer=setTimeout(()=>{try{writeMapDocument(localStorage,MAP_DRAFT_KEY,doc);}catch{setStatus('Không lưu được bản nháp. Hãy xuất JSON để giữ map.');}},250);return()=>clearTimeout(timer);},[doc]);
  useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const wheel=(e:WheelEvent)=>{e.preventDefault();const box=canvas.getBoundingClientRect();zoomAt(e.deltaY<0?1.12:1/1.12,e.clientX-box.left,e.clientY-box.top);};canvas.addEventListener('wheel',wheel,{passive:false});return()=>canvas.removeEventListener('wheel',wheel);},[]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.matches('input,textarea,select'))return;if(e.code==='Space'){space.current=true;e.preventDefault();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}else if(!e.ctrlKey&&!e.metaKey){if(e.key.toLowerCase()==='r'){e.preventDefault();if(!e.repeat)rotateItem();return;}const next=tools.find(t=>t[3].toLowerCase()===e.key.toLowerCase());if(next)setTool(next[0]);if(e.key.toLowerCase()==='x')setFlipped(v=>!v);}};const release=(e:KeyboardEvent)=>{if(e.code==='Space')space.current=false;};const blur=()=>{space.current=false;};window.addEventListener('keydown',key);window.addEventListener('keyup',release);window.addEventListener('blur',blur);return()=>{window.removeEventListener('keydown',key);window.removeEventListener('keyup',release);window.removeEventListener('blur',blur);};},[]);
  const cellAt=(e:React.PointerEvent<HTMLCanvasElement>)=>{const box=e.currentTarget.getBoundingClientRect(),cam=cameraRef.current;const wx=(e.clientX-box.left-cam.x)/cam.zoom,wy=(e.clientY-box.top-cam.y)/cam.zoom,dx=wx-(ORIGIN_X+64),dy=wy-(ORIGIN_Y+96);const row=Math.round(dy/64-dx/128),col=Math.round(dy/64+dx/128);if(live.current.layer==='terrain'&&(row<0||row>=32||col<0||col>=32))return null;return insideMapEditor(row,col)?{row,col}:null;};
  const stamp=(cell:Cell)=>{const s=live.current;if(s.tool==='erase'){update(eraseMapItem(docRef.current,cell.row,cell.col));return;}const result=stampMapItem(docRef.current,cell.row,cell.col,s.item,s);if(result.changed)update(result.doc);else if(result.error)setStatus(result.error);};
  const start=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    e.currentTarget.setPointerCapture(e.pointerId);if(tool==='hand'||space.current||e.button===1||e.button===2){gesture.current={pan:true,x:e.clientX,y:e.clientY,camera:{...cameraRef.current}};return;}
    const cell=cellAt(e);if(!cell)return;setHover(cell);
    if(tool==='select'){const found=getMapSelection(docRef.current,cell.row,cell.col);setSelection(found);if(found){if(MAP_ITEM_BY_ID[found.id])setItem(found.id);setLevel(found.level);setFlipped(found.flipped);setLocked(found.locked);setAnimals(docRef.current.livestockState[`${found.row}_${found.col}`]?.animalCount||0);}return;}
    if(layer==='terrain'&&(cell.row<0||cell.row>=32||cell.col<0||cell.col>=32)){setStatus('Cọ nền dùng trong 32 × 32 ô. Vật phẩm có thể đặt cả ngoài rìa.');return;}
    checkpoint();setSelection(null);if(layer==='terrain'&&tool!=='erase'){
      if(tool==='fill'){update(paintMapTerrain(docRef.current,cell,cell,TERRAIN_IDS[material],size,'fill'));return;}
      if(tool==='rectangle')setRectStart(cell);else update(paintMapTerrain(docRef.current,cell,cell,TERRAIN_IDS[material],size));
    }else stamp(cell);
    gesture.current={from:cell,last:cell,tool,layer,material,size};
  };
  const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{const g=gesture.current;if(g?.pan){moveCamera({...g.camera,x:g.camera.x+e.clientX-g.x,y:g.camera.y+e.clientY-g.y});return;}const cell=cellAt(e);setHover(cell);if(cell&&g&&(cell.row!==g.last.row||cell.col!==g.last.col)){if(g.layer==='terrain'&&g.tool==='brush')update(paintMapTerrain(docRef.current,g.last,cell,TERRAIN_IDS[g.material as keyof typeof TERRAIN_IDS],g.size));else if(g.tool==='brush'||g.tool==='erase'){const distance=Math.max(Math.abs(cell.row-g.last.row),Math.abs(cell.col-g.last.col));for(let i=1;i<=distance;i++)stamp({row:Math.round(g.last.row+(cell.row-g.last.row)*i/distance),col:Math.round(g.last.col+(cell.col-g.last.col)*i/distance)});}g.last=cell;}};
  const end=(e:React.PointerEvent<HTMLCanvasElement>)=>{const g=gesture.current;if(g&&!g.pan&&g.layer==='terrain'&&g.tool==='rectangle')update(paintMapTerrain(docRef.current,g.from,cellAt(e)||g.last,TERRAIN_IDS[g.material as keyof typeof TERRAIN_IDS],1,'rectangle'));gesture.current=null;setRectStart(null);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);};
  const saveStarter=()=>{try{writeMapDocument(localStorage,STARTER_MAP_KEY,docRef.current);setDirty(false);setStatus('Đã lưu map khởi đầu. Game mới và nút Chơi lại sẽ dùng bản này.');}catch{setStatus('Không lưu được map khởi đầu. Hãy xuất JSON để giữ bản vẽ.');}};
  const apply=()=>{try{const previous=localStorage.getItem(STORAGE_KEY_V3);if(previous)localStorage.setItem(BACKUP_STORAGE_KEY,previous);writeMapDocument(localStorage,MAP_APPLY_KEY,docRef.current);setStatus('Đã gửi map vào game. Mở hoặc tải lại tab game để xem; vàng và tài nguyên được giữ.');setDirty(false);}catch{setStatus('Không áp dụng được map. Hãy xuất JSON để giữ bản vẽ.');}};
  const exportMap=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(docRef.current,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='village-initial-map-32x32.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const importMap=async(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());let next=data;if(data.version===1&&isValidTerrainMap(data.terrain)){next={...structuredClone(docRef.current),terrainMap:data.terrain};syncTerrainToGrid(next.grid,data.terrain);}if(!isValidMapDocument(next))throw Error();checkpoint();update(next);setStatus('Đã nhập map cùng vật phẩm và tùy chọn gỡ.');}catch{setStatus('File không hợp lệ. Chọn JSON map 32 × 32 đã xuất từ trang này.');}e.target.value='';};
  const rule=(value:boolean)=>{setLocked(value);if(selection){checkpoint();const next=setMapRemovalRule(docRef.current,selection.row,selection.col,value,selection.fenceOnly);update(next);setSelection(getMapSelection(next,selection.row,selection.col));}};
  const updateSelected=()=>{if(!selection)return;const base=selection.fenceOnly?eraseMapItem(docRef.current,selection.row,selection.col,true):docRef.current;const result=stampMapItem(base,selection.row,selection.col,selection.id,{level,flipped,locked,animals});if(result.changed){checkpoint();update(result.doc);setSelection(getMapSelection(result.doc,selection.row,selection.col));setStatus('Đã cập nhật vật phẩm đang chọn.');}else if(result.error)setStatus(result.error);};
  return <div className="map-editor">
    <header className="me-header"><div className="me-brand"><span className="me-logo">◈</span><div><small>ISOMETRIC VILLAGE</small><h1>Xưởng dựng map</h1></div><span className="me-dimension">32 × 32</span></div><div className="me-header-actions"><a href="/" target="_blank" rel="noreferrer">Mở game ↗</a><button onClick={apply}>Áp dụng vào game</button><button className="me-primary" onClick={saveStarter}>Lưu map khởi đầu{dirty?' ·':''}</button></div></header>
    <div className="me-workspace"><aside className="me-sidebar">
      <div className="me-layer-tabs"><button className={layer==='items'?'is-active':''} onClick={()=>{setLayer('items');setTool('brush');}}>Vật phẩm ({MAP_ITEMS.length})</button><button className={layer==='terrain'?'is-active':''} onClick={()=>{setLayer('terrain');setTool('brush');}}>Nền đất</button></div>
      <div className="me-quick-items">{[['scene:gate','Cổng thành'],['scene:pier','Cảng biển'],['scene:ship','Tàu biển']].map(([id,label])=><button key={id} onClick={()=>{setLayer('items');setItem(id);setTool('brush');setSelection(null);setLevel(1);}}>{label}</button>)}</div>
      <button className="me-rotate" onClick={rotateItem} title="Xoay vật phẩm (R)">↻ Xoay vật phẩm <kbd>R</kbd></button>
      {layer==='terrain'?<div className="me-materials">{materials.map(([id,name])=><button key={id} className={`me-material ${material===id?'is-active':''}`} onClick={()=>setMaterial(id)}><span>{name}</span></button>)}</div>:<>
        <input className="me-search" aria-label="Tìm vật phẩm" placeholder="Tìm nhà, cây, đường, tài nguyên…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="me-category" aria-label="Nhóm vật phẩm" value={category} onChange={e=>setCategory(e.target.value)}>{MAP_CATEGORIES.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select>
        <div className="me-catalog">{visible.map(entry=><button key={entry.id} title={entry.label} className={`me-item ${item===entry.id?'is-active':''}`} aria-pressed={item===entry.id} onClick={()=>{setItem(entry.id!);setLevel(1);setSelection(null);setTool('brush');}}><img src={entry.uri} loading="lazy" alt=""/><span>{entry.label}</span></button>)}{!visible.length&&<p>Không tìm thấy vật phẩm.</p>}</div>
        <div className="me-item-options"><b>{selection?MAP_ITEM_BY_ID[selection.id]?.label||'Vật phẩm đã chọn':selectedItem?.label}</b><img className="me-selected-thumb" src={mapItemUri(item,level)} alt=""/><label>Cấp <select aria-label="Cấp công trình" value={level} onChange={e=>setLevel(+e.target.value)}>{Array.from({length:selectedItem?.maxLevel||1},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label><button onClick={()=>setFlipped(v=>!v)} aria-pressed={flipped}>{flipped?'↔ Đã lật hướng':'↔ Lật hướng (X)'}</button>{isLivestockTile(item)&&<label>Số con <input type="number" min="0" max="5" value={animals} onChange={e=>setAnimals(+e.target.value)}/></label>}{selection&&<button onClick={updateSelected}>Cập nhật vật phẩm đã chọn</button>}{selection?.fence&&!selection.fenceOnly&&<button onClick={()=>{const f=selection.fence;setSelection({row:f.row,col:f.col,id:f.tileId,level:1,flipped:f.flipped,locked:!!f.locked,fenceOnly:true});setItem(f.tileId);setLocked(!!f.locked);setFlipped(!!f.flipped);}}>Chọn hàng rào tại ô này</button>}</div>
      </>}
      <fieldset className="me-removal"><legend>Quyền gỡ vật phẩm</legend><label><input type="radio" name="removal" checked={locked} onChange={()=>rule(true)}/>Mặc định (không thể gỡ)</label><label><input type="radio" name="removal" checked={!locked} onChange={()=>rule(false)}/>Có thể gỡ</label><small>{selection?'Áp dụng cho vật phẩm đang chọn.':'Áp dụng cho các vật phẩm đặt tiếp theo.'}</small></fieldset>
      <div className="me-section-heading"><h2>Công cụ</h2></div><div className="me-tools">{tools.filter(t=>layer==='terrain'||!['fill','rectangle'].includes(t[0])).map(([id,icon,name,key])=><button key={id} className={tool===id?'is-active':''} onClick={()=>setTool(id)}><b>{icon}</b><span>{name}</span><kbd>{key}</kbd></button>)}</div>
      {layer==='terrain'&&<label className="me-size">Kích thước cọ {size} × {size}<input aria-label="Kích thước cọ" type="range" min="1" max="5" value={size} onChange={e=>setSize(+e.target.value)}/></label>}
      <label className="me-check"><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)}/>Lưới tọa độ</label>
      <label className="me-check"><input type="checkbox" checked={doc.land?.unlockedChunks?.length===64} onChange={e=>{checkpoint();update({...docRef.current,land:{unlockedChunks:e.target.checked?Array.from({length:64},(_,i)=>i):getDefaultSaveState().land.unlockedChunks}});}}/>Mở toàn bộ đất khi bắt đầu</label>
      <div className="me-note"><b>Dựng cả trong và ngoài map</b><p>Kéo map để đặt cổng, cảng, tàu, đèn và cây ở cả vùng ngoại vi. Tòa thị chính giữ vị trí trung tâm. Dấu ◆ là vật phẩm không thể gỡ khi chơi; công cụ Tẩy ở đây vẫn sửa được.</p></div>
      <div className="me-files"><button onClick={exportMap}>Xuất JSON ↓</button><button onClick={()=>importRef.current?.click()}>Nhập JSON ↑</button></div><input ref={importRef} type="file" accept="application/json,.json" hidden onChange={importMap}/>
      <button className="me-reset" onClick={()=>{checkpoint();const save=readSave();update(save?.grid?createMapDocument(save):defaultDocument());setStatus('Đã lấy bố cục từ game vào bản nháp.');}}>Lấy map game hiện tại</button>
      <button className="me-reset" onClick={()=>{const starter=readMapDocument(localStorage,STARTER_MAP_KEY);if(starter){checkpoint();update(starter);setStatus('Đã mở map khởi đầu đã lưu.');}}}>Mở map khởi đầu đã lưu</button>
      <button className="me-reset" onClick={()=>{checkpoint();update(defaultDocument());setStatus('Bản nháp trở về bố cục mặc định.');}}>Dùng bố cục mặc định</button>
    </aside><main className="me-main"><div className="me-toolbar"><div className="me-history" data-version={historyVersion}><button onClick={undo} disabled={!undoStack.current.length}>↶ Hoàn tác</button><button onClick={redo} disabled={!redoStack.current.length}>↷</button></div><span className="me-hint">Kéo để đặt · Space để kéo map · Cuộn để zoom</span><div className="me-zoom"><button onClick={()=>zoomAt(1/1.2)}>−</button><span>{Math.round(camera.zoom*100)}%</span><button onClick={()=>zoomAt(1.2)}>+</button><button onClick={fit}>Vừa khung</button></div></div>
      <div className={`me-stage tool-${tool}`} ref={stageRef}><canvas ref={canvasRef} aria-label="Bản đồ đầy đủ vật phẩm 32 hàng 32 cột" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={()=>{gesture.current=null;setRectStart(null);}} onPointerLeave={()=>{if(!gesture.current)setHover(null);}} onContextMenu={e=>e.preventDefault()}/><div className="me-compass"><span>SAU [0,0]</span><b>◇</b><span>TRƯỚC [31,31]</span></div></div>
      <footer className="me-status"><span role="status"><i className={dirty?'is-draft':''}/>{status}</span><span>{hover?`Hàng ${hover.row} · Cột ${hover.col}`:`${MAP_ITEMS.length} vật phẩm · 4 loại nền`}</span></footer>
    </main></div>
  </div>;
}
