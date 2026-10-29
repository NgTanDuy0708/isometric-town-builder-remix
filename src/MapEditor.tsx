import React, { useEffect, useRef, useState } from 'react';
import { TERRAIN_SPRITES, getTerrainSprite } from './data/terrainConfig.js';
import { drawTerrainTile } from './engine/terrainRenderer.js';
import { ORIGIN_X, ORIGIN_Y, cellToWorld, worldToCell } from './engine/isoMath.js';
import { STORAGE_KEY_V3 } from './engine/storage.js';
import { TILES_DATA } from './data/tilesData.js';
import {
  TERRAIN_IDS, TERRAIN_DRAFT_KEY, cloneTerrain, createTerrainMap, readTerrainMap,
  writeTerrainMap, isValidTerrainMap, paintTerrainStroke, paintTerrainRectangle, fillTerrainRegion
} from './engine/terrainEditing.js';
import './mapEditor.css';

type Cell = { row: number; col: number };
type Grid = string[][];
type Camera = { x: number; y: number; zoom: number };
type Tool = 'brush' | 'fill' | 'rectangle' | 'hand';
type TerrainKind = keyof typeof TERRAIN_IDS;
const materials: {kind:TerrainKind;name:string;shortcut:string;color:string}[] = [
  { kind: 'grass', name: 'Đồng cỏ', shortcut: '1', color: '#8a9e4f' },
  { kind: 'sea', name: 'Nước biển', shortcut: '2', color: '#3f74bc' },
  { kind: 'shore', name: 'Bờ biển', shortcut: '3', color: '#b6bd9a' },
  { kind: 'sand', name: 'Cát vàng', shortcut: '4', color: '#ebcc81' }
];
const tools: {id:Tool; name:string; icon:string; key:string}[] = [
  {id:'brush',name:'Cọ tô',icon:'✎',key:'B'}, {id:'fill',name:'Đổ vùng',icon:'▨',key:'F'},
  {id:'rectangle',name:'Hình chữ nhật',icon:'▭',key:'R'}, {id:'hand',name:'Di chuyển',icon:'✥',key:'H'}
];
const labels = Object.fromEntries(TILES_DATA.map(t => [t.id,t.label]));

function getGameGrid(): Grid | undefined {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_V3) || 'null')?.grid; }
  catch { return undefined; }
}

function Thumbnail({ image, tileId }: {image?:HTMLImageElement;tileId:string}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx=ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0,0,160,84);
    drawTerrainTile(ctx,image,tileId,16,-52);
  },[image,tileId]);
  return <canvas ref={ref} width={160} height={84} aria-hidden="true" />;
}

export default function MapEditor() {
  const [gameGrid] = useState(getGameGrid);
  const [grid,setGrid] = useState<Grid>(() => readTerrainMap(localStorage,TERRAIN_DRAFT_KEY) ||
    readTerrainMap(localStorage) || createTerrainMap(gameGrid));
  const gridRef=useRef(grid);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const stageRef=useRef<HTMLDivElement>(null);
  const importRef=useRef<HTMLInputElement>(null);
  const [images,setImages]=useState<Record<string,HTMLImageElement>>({});
  const [material,setMaterial]=useState<TerrainKind>('grass');
  const [tool,setTool]=useState<Tool>('brush');
  const [size,setSize]=useState(1);
  const [showGrid,setShowGrid]=useState(true);
  const [showOccupied,setShowOccupied]=useState(false);
  const [hover,setHover]=useState<Cell|null>(null);
  const hoverRef=useRef<Cell|null>(null);
  const [rectStart,setRectStart]=useState<Cell|null>(null);
  const [viewport,setViewport]=useState({width:0,height:0});
  const [camera,setCamera]=useState<Camera>({x:0,y:0,zoom:0.3});
  const cameraRef=useRef(camera);
  const initialized=useRef(false);
  const gesture=useRef<any>(null);
  const space=useRef(false);
  const undoStack=useRef<Grid[]>([]),redoStack=useRef<Grid[]>([]);
  const [historyVersion,setHistoryVersion]=useState(0);
  const [status,setStatus]=useState('Bản nháp tự lưu trên trình duyệt này');
  const [dirty,setDirty]=useState(false);

  const moveCamera=(next:Camera) => {cameraRef.current=next;setCamera(next);};
  const update=(next:Grid) => {gridRef.current=next;setGrid(next);setDirty(true);};
  const checkpoint=() => {
    undoStack.current.push(cloneTerrain(gridRef.current));
    if(undoStack.current.length>80)undoStack.current.shift();
    redoStack.current=[];setHistoryVersion(v=>v+1);
  };
  const undo=() => {
    const previous=undoStack.current.pop();if(!previous)return;
    redoStack.current.push(cloneTerrain(gridRef.current));update(previous);setHistoryVersion(v=>v+1);
  };
  const redo=() => {
    const next=redoStack.current.pop();if(!next)return;
    undoStack.current.push(cloneTerrain(gridRef.current));update(next);setHistoryVersion(v=>v+1);
  };
  const fit=() => {
    const box=stageRef.current?.getBoundingClientRect();if(!box)return;
    const zoom=Math.max(0.08,Math.min((box.width-80)/4096,(box.height-90)/2048));
    moveCamera({zoom,x:box.width/2-(ORIGIN_X+64)*zoom,y:box.height/2-(ORIGIN_Y+1088)*zoom});
  };
  const zoomAt=(factor:number,x=viewport.width/2,y=viewport.height/2) => {
    const old=cameraRef.current,zoom=Math.max(0.08,Math.min(3,old.zoom*factor));
    moveCamera({zoom,x:x-(x-old.x)*zoom/old.zoom,y:y-(y-old.y)*zoom/old.zoom});
  };

  useEffect(() => {
    document.title='Xưởng vẽ bản đồ · Isometric Village';
    let active=true;
    Promise.all(Object.entries(TERRAIN_SPRITES).map(async ([kind,def])=>{
      const image=new Image();image.src=def.uri;await image.decode();return [kind,image] as const;
    })).then(entries=>{if(active)setImages(Object.fromEntries(entries));})
      .catch(()=>setStatus('Chưa tải được ảnh nền. Thử tải lại trang.'));
    return ()=>{active=false;};
  },[]);

  useEffect(() => {
    const element=stageRef.current;if(!element)return;
    const resize=new ResizeObserver(()=>{
      const box=element.getBoundingClientRect();setViewport({width:box.width,height:box.height});
      if(!initialized.current){initialized.current=true;fit();}
    });resize.observe(element);return()=>resize.disconnect();
  },[]);

  useEffect(()=>{
    const timer=setTimeout(()=>{
      try{writeTerrainMap(localStorage,grid,TERRAIN_DRAFT_KEY);}
      catch{setStatus('Không lưu được bản nháp. Hãy xuất file JSON để giữ bản vẽ.');}
    },250);return()=>clearTimeout(timer);
  },[grid]);

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if((e.target as HTMLElement)?.matches('input,textarea,select'))return;
      if(e.code==='Space'){space.current=true;e.preventDefault();}
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}
      else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}
      else if(!e.ctrlKey&&!e.metaKey){
        const mat=materials.find(m=>m.shortcut===e.key);if(mat)setMaterial(mat.kind);
        const selected=tools.find(t=>t.key.toLowerCase()===e.key.toLowerCase());if(selected)setTool(selected.id);
      }
    };
    const release=(e:KeyboardEvent)=>{if(e.code==='Space')space.current=false;};
    const blur=()=>{space.current=false;};
    window.addEventListener('keydown',onKey);window.addEventListener('keyup',release);window.addEventListener('blur',blur);
    return()=>{window.removeEventListener('keydown',onKey);window.removeEventListener('keyup',release);window.removeEventListener('blur',blur);};
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const wheel=(e:WheelEvent)=>{
      e.preventDefault();const box=canvas.getBoundingClientRect();
      zoomAt(e.deltaY<0?1.12:1/1.12,e.clientX-box.left,e.clientY-box.top);
    };
    canvas.addEventListener('wheel',wheel,{passive:false});
    return()=>canvas.removeEventListener('wheel',wheel);
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas?.getContext('2d');if(!canvas||!ctx)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(viewport.width*dpr);canvas.height=Math.round(viewport.height*dpr);
    ctx.scale(dpr,dpr);ctx.fillStyle='#14231e';ctx.fillRect(0,0,viewport.width,viewport.height);
    ctx.translate(camera.x,camera.y);ctx.scale(camera.zoom,camera.zoom);
    const diamond=(r:number,c:number)=>{
      const {ox,oy}=cellToWorld(r,c);ctx.beginPath();ctx.moveTo(ox+64,oy+64);
      ctx.lineTo(ox+128,oy+96);ctx.lineTo(ox+64,oy+128);ctx.lineTo(ox,oy+96);ctx.closePath();
    };
    for(let r=0;r<32;r++)for(let c=0;c<32;c++){
      const {ox,oy}=cellToWorld(r,c),id=grid[r][c];
      const kind=materials.find(m=>TERRAIN_IDS[m.kind]===id)?.kind;
      drawTerrainTile(ctx,images[kind||'grass'],id,ox,oy);
      if(showGrid){diamond(r,c);ctx.strokeStyle='rgba(28,49,34,.19)';ctx.lineWidth=.65/camera.zoom;ctx.stroke();}
      if(showOccupied&&gameGrid?.[r]?.[c]&&!getTerrainSprite(gameGrid[r][c])){
        diamond(r,c);ctx.fillStyle='rgba(244,210,124,.25)';ctx.fill();
        ctx.fillStyle='#fff6d8';ctx.beginPath();ctx.arc(ox+64,oy+96,3/camera.zoom,0,Math.PI*2);ctx.fill();
      }
    }
    if(hover&&tool!=='hand'){
      const from=rectStart||hover;
      const loR=rectStart?Math.min(from.row,hover.row):hover.row-Math.floor((size-1)/2);
      const hiR=rectStart?Math.max(from.row,hover.row):hover.row+Math.ceil((size-1)/2);
      const loC=rectStart?Math.min(from.col,hover.col):hover.col-Math.floor((size-1)/2);
      const hiC=rectStart?Math.max(from.col,hover.col):hover.col+Math.ceil((size-1)/2);
      for(let r=Math.max(0,loR);r<=Math.min(31,hiR);r++)for(let c=Math.max(0,loC);c<=Math.min(31,hiC);c++){
        diamond(r,c);ctx.fillStyle='rgba(255,242,169,.25)';ctx.fill();
        ctx.strokeStyle='#fff1b2';ctx.lineWidth=1.5/camera.zoom;ctx.stroke();
      }
    }
  },[grid,images,camera,viewport,showGrid,showOccupied,hover,rectStart,size,tool,gameGrid]);

  const cellAt=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    const box=e.currentTarget.getBoundingClientRect(),cam=cameraRef.current;
    return worldToCell((e.clientX-box.left-cam.x)/cam.zoom,(e.clientY-box.top-cam.y)/cam.zoom);
  };
  const start=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    e.currentTarget.setPointerCapture(e.pointerId);
    if(tool==='hand'||space.current||e.button===1||e.button===2){
      gesture.current={pan:true,x:e.clientX,y:e.clientY,camera:{...cameraRef.current}};return;
    }
    const cell=cellAt(e);if(!cell)return;checkpoint();
    const id=TERRAIN_IDS[material];hoverRef.current=cell;setHover(cell);
    if(tool==='fill'){update(fillTerrainRegion(gridRef.current,cell,id));return;}
    gesture.current={pan:false,tool,from:cell,last:cell,id,size};
    if(tool==='rectangle')setRectStart(cell);
    else update(paintTerrainStroke(gridRef.current,cell,cell,id,size));
  };
  const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    const g=gesture.current;
    if(g?.pan){moveCamera({...g.camera,x:g.camera.x+e.clientX-g.x,y:g.camera.y+e.clientY-g.y});return;}
    const cell=cellAt(e);setHover(cell);hoverRef.current=cell;
    if(cell&&g){
      if(g.tool==='brush'&&(cell.row!==g.last.row||cell.col!==g.last.col))update(paintTerrainStroke(gridRef.current,g.last,cell,g.id,g.size));
      g.last=cell;
    }
  };
  const end=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    const g=gesture.current;
    if(g&&!g.pan&&g.tool==='rectangle')update(paintTerrainRectangle(gridRef.current,g.from,cellAt(e)||g.last,g.id));
    gesture.current=null;setRectStart(null);
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const apply=()=>{
    try{
      const previous=readTerrainMap(localStorage);
      if(previous)writeTerrainMap(localStorage,previous,'isometric_town_builder_terrain_backup_v1');
      writeTerrainMap(localStorage,gridRef.current);
      writeTerrainMap(localStorage,gridRef.current,TERRAIN_DRAFT_KEY);setDirty(false);
      setStatus('Đã áp dụng. Tab game cùng địa chỉ sẽ cập nhật ngay.');
    }catch{setStatus('Không lưu được nền vào game. Hãy xuất JSON để giữ bản vẽ.');}
  };
  const exportMap=()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,terrain:gridRef.current},null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='village-terrain-32x32.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const importMap=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return;
    try{const data=JSON.parse(await file.text());if(!isValidTerrainMap(data.terrain))throw new Error();
      checkpoint();update(data.terrain);setStatus('Đã nhập bản vẽ. Nhấn Áp dụng vào game khi sẵn sàng.');
    }catch{setStatus('File không hợp lệ. Hãy chọn JSON nền 32 × 32 đã xuất từ trang này.');}
    e.target.value='';
  };
  const occupied=hover?gameGrid?.[hover.row]?.[hover.col]:null;

  return <div className="map-editor">
    <header className="me-header">
      <div className="me-brand"><span className="me-logo">◈</span><div><small>ISOMETRIC VILLAGE</small><h1>Xưởng vẽ bản đồ</h1></div><span className="me-dimension">32 × 32</span></div>
      <div className="me-header-actions"><a href="/warehouse-editor">Chỉnh kho</a><a href="/" target="_blank" rel="noreferrer">Mở game ↗</a><button className="me-primary" onClick={apply}>Áp dụng vào game{dirty?' ·':''}</button></div>
    </header>
    <div className="me-workspace">
      <aside className="me-sidebar">
        <div className="me-section-heading"><h2>Chất liệu nền</h2><span>01 — 04</span></div>
        <div className="me-materials">{materials.map(m=><button key={m.kind} className={`me-material ${material===m.kind?'is-active':''}`} onClick={()=>setMaterial(m.kind)} aria-pressed={material===m.kind}>
          <Thumbnail image={images[m.kind]} tileId={TERRAIN_IDS[m.kind]} /><span>{m.name}<kbd>{m.shortcut}</kbd></span>
        </button>)}</div>
        <div className="me-section-heading"><h2>Công cụ</h2></div>
        <div className="me-tools">{tools.map(t=><button key={t.id} className={tool===t.id?'is-active':''} aria-pressed={tool===t.id} onClick={()=>setTool(t.id)} title={`${t.name} (${t.key})`}><b>{t.icon}</b><span>{t.name}</span><kbd>{t.key}</kbd></button>)}</div>
        <label className="me-size">Kích thước cọ <span>{size} × {size} ô</span><input aria-label="Kích thước cọ" type="range" min="1" max="5" value={size} onChange={e=>setSize(+e.target.value)}/></label>
        <div className="me-section-heading"><h2>Hiển thị</h2></div>
        <label className="me-check"><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)}/>Lưới tọa độ</label>
        <label className="me-check"><input type="checkbox" checked={showOccupied} onChange={e=>setShowOccupied(e.target.checked)}/>Đánh dấu ô có công trình</label>
        <div className="me-note"><b>Vẽ nền theo ý bạn</b><p>Nhà, cây, luống trồng và tài nguyên trong game được giữ nguyên.</p></div>
        <div className="me-files"><button onClick={exportMap}>Xuất JSON ↓</button><button onClick={()=>importRef.current?.click()}>Nhập JSON ↑</button></div>
        <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={importMap}/>
        <button className="me-reset" onClick={()=>{checkpoint();update(createTerrainMap());setStatus('Đã tạo lại dải biển, bờ và cát mặc định trong bản nháp.');}}>Dùng bố cục nền mặc định</button>
      </aside>
      <main className="me-main">
        <div className="me-toolbar"><div className="me-history" data-version={historyVersion}><button onClick={undo} disabled={!undoStack.current.length} title="Hoàn tác (Ctrl+Z)">↶ Hoàn tác</button><button onClick={redo} disabled={!redoStack.current.length} title="Làm lại (Ctrl+Shift+Z)">↷</button></div>
          <span className="me-hint">Kéo để tô · Giữ Space để kéo map · Cuộn để zoom</span>
          <div className="me-zoom"><button onClick={()=>zoomAt(1/1.2)} aria-label="Thu nhỏ">−</button><span>{Math.round(camera.zoom*100)}%</span><button onClick={()=>zoomAt(1.2)} aria-label="Phóng to">+</button><button onClick={fit}>Vừa khung</button></div>
        </div>
        <div ref={stageRef} className={`me-stage tool-${tool}`}><canvas ref={canvasRef} aria-label="Bản đồ đẳng cự 32 hàng 32 cột" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={()=>{gesture.current=null;setRectStart(null);}} onPointerLeave={()=>{if(!gesture.current)setHover(null);}} onContextMenu={e=>e.preventDefault()}/>
          <div className="me-compass"><span>SAU [0,0]</span><b>◇</b><span>TRƯỚC [31,31]</span></div>
        </div>
        <footer className="me-status"><span role="status"><i className={dirty?'is-draft':''}/>{status}</span><span>{hover?`Hàng ${hover.row} · Cột ${hover.col}${occupied&&!getTerrainSprite(occupied)?' · '+(labels[occupied]||'Có công trình'):''}`:'1.024 ô · 4 chất liệu'}</span></footer>
      </main>
    </div>
  </div>;
}
