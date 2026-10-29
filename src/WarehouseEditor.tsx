import React, {useEffect,useRef,useState} from 'react';
import {BUILDING_SOURCE_GEOMETRY,getBuildingSpriteUri} from './data/buildingSprites.js';
import {DEFAULT_WAREHOUSE_TUNING,WAREHOUSE_LIMITS,WAREHOUSE_TUNING_KEY,normalizeWarehouseTuning,readWarehouseTuning,getWarehouseRenderAdjustment,drawWarehouseSprite} from './engine/warehouseTuning.js';
import {drawTerrainTile} from './engine/terrainRenderer.js';
import {TERRAIN_SPRITES} from './data/terrainConfig.js';
import './mapEditor.css';
import './warehouseEditor.css';

type Tuning={[K in keyof typeof DEFAULT_WAREHOUSE_TUNING]:K extends 'flipX'?boolean:number};
type NumericKey=Exclude<keyof Tuning,'flipX'>;
const SOURCE=BUILDING_SOURCE_GEOMETRY.b60_combined_warehouse[1];
const DRAFT_KEY=WAREHOUSE_TUNING_KEY+'_draft';
const groups:{title:string;fields:[NumericKey,string,string][]}[]=[
  {title:'Vị trí & kích thước',fields:[['x','Dịch ngang','px'],['y','Dịch dọc','px'],['size','Kích thước tổng thể','×'],['worldWidth','Bề rộng mặt nhà','px']]},
  {title:'Tỷ lệ & hướng ảnh',fields:[['width','Co giãn ngang','×'],['height','Co giãn dọc','×'],['rotation','Góc xoay','°'],['shearX','Xiên ngang',''],['shearY','Xiên dọc / hướng cạnh đất','']]},
  {title:'Điểm neo trên PNG gốc',fields:[['anchorX','Neo X trong ảnh','px'],['anchorY','Neo Y trong ảnh','px']]},
  {title:'Điểm neo trên lưới 2×2',fields:[['worldX','Neo X trên map','px'],['worldY','Neo Y trên map','px'],['opacity','Độ hiển thị','×']]}
];

function initialTuning(){try{const draft=localStorage.getItem(DRAFT_KEY);return draft?normalizeWarehouseTuning(JSON.parse(draft)):readWarehouseTuning();}catch{return readWarehouseTuning();}}
export default function WarehouseEditor(){
  const [tuning,setTuning]=useState<Tuning>(initialTuning),current=useRef(tuning);
  const [dirty,setDirty]=useState(()=>JSON.stringify(initialTuning())!==JSON.stringify(readWarehouseTuning())),[status,setStatus]=useState('Kéo nhà để di chuyển · phím mũi tên để chỉnh từng pixel.');
  const [images,setImages]=useState<Record<string,HTMLImageElement>>({});
  const [viewport,setViewport]=useState({width:900,height:650}),[zoom,setZoom]=useState(1);
  const [grid,setGrid]=useState(true),[frontGuides,setFrontGuides]=useState(false),[point,setPoint]=useState(true);
  const [background,setBackground]=useState('grass'),[previewFlip,setPreviewFlip]=useState(false);
  const [historyTick,setHistoryTick]=useState(0);
  const canvasRef=useRef<HTMLCanvasElement>(null),stageRef=useRef<HTMLDivElement>(null),fileRef=useRef<HTMLInputElement>(null);
  const undoStack=useRef<Tuning[]>([]),redoStack=useRef<Tuning[]>([]);
  const gesture=useRef<{x:number;y:number;tuning:Tuning}|null>(null);
  const worldZoom=Math.min(viewport.width/640,viewport.height/540)*zoom;
  const adj=getWarehouseRenderAdjustment(SOURCE,tuning);
  const checkpoint=()=>{undoStack.current.push({...current.current});if(undoStack.current.length>100)undoStack.current.shift();redoStack.current=[];setHistoryTick(v=>v+1);};
  const change=(next:Partial<Tuning>,record=true)=>{
    if(record)checkpoint();const value=normalizeWarehouseTuning({...current.current,...next});
    current.current=value;setTuning(value);setDirty(true);
  };
  const undo=()=>{const value=undoStack.current.pop();if(!value)return;redoStack.current.push({...current.current});change(value,false);setHistoryTick(v=>v+1);};
  const redo=()=>{const value=redoStack.current.pop();if(!value)return;undoStack.current.push({...current.current});change(value,false);setHistoryTick(v=>v+1);};
  useEffect(()=>{
    document.title='Chỉnh nhà kho · Isometric Village';
    const observer=new ResizeObserver(([entry])=>setViewport({width:entry.contentRect.width,height:entry.contentRect.height}));
    if(stageRef.current)observer.observe(stageRef.current);
    let active=true;
    Promise.all(Object.entries({warehouse:getBuildingSpriteUri('b60_combined_warehouse'),grass:TERRAIN_SPRITES.grass.uri}).map(async([key,uri])=>{
      const image=new Image();image.src=uri;await image.decode();return [key,image] as const;
    })).then(entries=>{if(active)setImages(Object.fromEntries(entries));}).catch(()=>setStatus('Không tải được ảnh kho. Hãy tải lại trang.'));
    const key=(e:KeyboardEvent)=>{
      if((e.target as HTMLElement)?.matches('input,textarea,select'))return;
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();return;}
      const delta:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      if(delta[e.key]){e.preventDefault();const [x,y]=delta[e.key],step=e.shiftKey?10:e.altKey?.1:1;change({x:current.current.x+x*step,y:current.current.y+y*step});}
    };
    window.addEventListener('keydown',key);
    return()=>{active=false;observer.disconnect();window.removeEventListener('keydown',key);};
  },[]);
  useEffect(()=>{const timer=setTimeout(()=>{try{localStorage.setItem(DRAFT_KEY,JSON.stringify(tuning));}catch{setStatus('Không lưu được bản nháp. Hãy xuất thông số JSON.');}},250);return()=>clearTimeout(timer);},[tuning]);
  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas?.getContext('2d');if(!canvas||!ctx)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(viewport.width*dpr);canvas.height=Math.round(viewport.height*dpr);
    ctx.scale(dpr,dpr);
    ctx.fillStyle=background==='dark'?'#18291f':'#e8e7df';ctx.fillRect(0,0,viewport.width,viewport.height);
    if(background==='checker'){for(let y=0;y<viewport.height;y+=20)for(let x=0;x<viewport.width;x+=20)if((x/20+y/20)%2===0){ctx.fillStyle='#f9f8f3';ctx.fillRect(x,y,20,20);}}
    ctx.translate(viewport.width/2-64*worldZoom,viewport.height/2+30*worldZoom);ctx.scale(worldZoom,worldZoom);
    const diamond=(r:number,c:number)=>{const x=(c-r)*64,y=(r+c)*32;ctx.beginPath();ctx.moveTo(x+64,y+64);ctx.lineTo(x+128,y+96);ctx.lineTo(x+64,y+128);ctx.lineTo(x,y+96);ctx.closePath();};
    if(background==='grass')for(let r=-4;r<=3;r++)for(let c=-4;c<=3;c++)drawTerrainTile(ctx,images.grass,'d12_meadow_wildflowers',(c-r)*64,(r+c)*32);
    const guides=()=>{
      for(let r=-1;r<=0;r++)for(let c=-1;c<=0;c++){
        diamond(r,c);ctx.fillStyle='#fbe48315';ctx.fill();ctx.strokeStyle='#f9dd84';ctx.lineWidth=1.5/worldZoom;ctx.stroke();
      }
      ctx.fillStyle=background==='grass'?'#24452d':'#ddd';ctx.font=`${11/worldZoom}px system-ui`;
      ctx.fillText('2 × 2 ô · 256 × 128 px',-32,154);
    };
    if(grid&&!frontGuides)guides();
    if(images.warehouse)drawWarehouseSprite(ctx,images.warehouse,adj,0,0,previewFlip);
    if(grid&&frontGuides)guides();
    if(point){const x=previewFlip!==tuning.flipX?128-adj.pivotX:adj.pivotX,y=adj.pivotY;
      ctx.beginPath();ctx.moveTo(x-8/worldZoom,y);ctx.lineTo(x+8/worldZoom,y);ctx.moveTo(x,y-8/worldZoom);ctx.lineTo(x,y+8/worldZoom);
      ctx.strokeStyle='#fff';ctx.lineWidth=2/worldZoom;ctx.stroke();ctx.beginPath();ctx.arc(x,y,3/worldZoom,0,Math.PI*2);ctx.fillStyle='#d85e48';ctx.fill();}
  },[tuning,images,viewport,worldZoom,grid,frontGuides,point,background,previewFlip]);
  const apply=()=>{try{const old=localStorage.getItem(WAREHOUSE_TUNING_KEY);if(old)localStorage.setItem(WAREHOUSE_TUNING_KEY+'_backup',old);
    localStorage.setItem(WAREHOUSE_TUNING_KEY,JSON.stringify(current.current));localStorage.setItem(DRAFT_KEY,JSON.stringify(current.current));
    setDirty(false);setStatus('Đã áp dụng. Tab game cùng địa chỉ cập nhật ngay; tải lại vẫn giữ thông số.');
  }catch{setStatus('Không lưu được. Hãy xuất JSON để giữ thông số.');}};
  const exportJson=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,warehouse:current.current},null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='warehouse-settings.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const importJson=async(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;
    try{const data=JSON.parse(await file.text()),value=data.warehouse||data;
      if(!value||Array.isArray(value)||!Object.keys(DEFAULT_WAREHOUSE_TUNING).some(key=>key in value))throw new Error();
      change(value);setStatus('Đã nhập thông số vào bản nháp. Nhấn Áp dụng vào game để lưu.');
    }catch{setStatus('File thông số không hợp lệ.');}e.target.value='';};
  const raw=(key:'dx'|'dy'|'dw'|'dh',value:number)=>{
    if(!Number.isFinite(value))return;
    if(key==='dx')change({x:tuning.x+value-adj.dx});if(key==='dy')change({y:tuning.y+value-adj.dy});
    if(key==='dw')change({width:tuning.width*value/adj.dw});if(key==='dh')change({height:tuning.height*value/adj.dh});
  };
  return <div className="map-editor warehouse-editor">
    <header className="me-header"><div className="me-brand"><span className="me-logo">▣</span><div><small>ISOMETRIC VILLAGE</small><h1>Chỉnh nhà kho</h1></div><span className="me-dimension">2 × 2 ô</span></div>
      <div className="me-header-actions"><a href="/map-editor">Vẽ map</a><a href="/" target="_blank" rel="noreferrer">Mở game ↗</a><button className="me-primary" onClick={apply}>Áp dụng vào game{dirty?' ·':''}</button></div></header>
    <div className="me-workspace"><aside className="me-sidebar wh-sidebar">
      <div className="wh-summary">PNG gốc <b>1254 × 1254</b><span>Footprint cố định: 4 ô</span></div>
      {groups.map(group=><details key={group.title} open><summary>{group.title}</summary>{group.fields.map(([key,label,unit])=>{
        const [min,max,step]=WAREHOUSE_LIMITS[key];return <label className="wh-control" key={key}><span>{label}<small>{unit}</small></span><div>
          <input type="range" aria-label={label} min={min} max={max} step={step} value={tuning[key]} onChange={e=>change({[key]:Number(e.target.value)})}/>
          <input type="number" aria-label={`${label} chính xác`} min={min} max={max} step={step} value={Number(tuning[key].toFixed(4))} onChange={e=>{if(Number.isFinite(e.target.valueAsNumber))change({[key]:e.target.valueAsNumber});}}/>
        </div></label>;
      })}{group.title==='Tỷ lệ & hướng ảnh'&&<label className="me-check"><input type="checkbox" checked={tuning.flipX} onChange={e=>change({flipX:e.target.checked})}/>Lật ngang ảnh (áp dụng vào game)</label>}</details>)}
      <details open><summary>Khung vẽ trực tiếp (px)</summary><div className="wh-raw">{(['dx','dy','dw','dh'] as const).map(key=><label key={key}>{key}<input aria-label={`Khung vẽ ${key}`} type="number" step="0.1" value={Number(adj[key].toFixed(4))} onChange={e=>raw(key,e.target.valueAsNumber)}/></label>)}</div></details>
      <button className="wh-wide" onClick={()=>change({width:1,height:1})}>Giữ tỷ lệ ảnh gốc</button>
      <button className="wh-wide" onClick={()=>change({anchorX:DEFAULT_WAREHOUSE_TUNING.anchorX,anchorY:DEFAULT_WAREHOUSE_TUNING.anchorY,worldX:DEFAULT_WAREHOUSE_TUNING.worldX,worldY:DEFAULT_WAREHOUSE_TUNING.worldY,x:0,y:0})}>Căn chân kho vào lưới 2×2</button>
      <details open><summary>Đối chiếu</summary>
        <label className="me-check"><input type="checkbox" checked={grid} onChange={e=>setGrid(e.target.checked)}/>Lưới 2×2</label>
        <label className="me-check"><input type="checkbox" checked={frontGuides} onChange={e=>setFrontGuides(e.target.checked)}/>Vẽ viền lưới trên ảnh</label>
        <label className="me-check"><input type="checkbox" checked={point} onChange={e=>setPoint(e.target.checked)}/>Hiện điểm neo</label>
        <label className="me-check"><input type="checkbox" checked={previewFlip} onChange={e=>setPreviewFlip(e.target.checked)}/>Xem kho khi xoay hướng trong game</label>
        <label className="wh-background">Nền xem trước<select aria-label="Nền xem trước" value={background} onChange={e=>setBackground(e.target.value)}><option value="grass">Cỏ</option><option value="checker">Ô trong suốt</option><option value="dark">Nền tối</option></select></label>
      </details>
      <div className="me-files"><button onClick={exportJson}>Xuất JSON ↓</button><button onClick={()=>fileRef.current?.click()}>Nhập JSON ↑</button></div>
      <input hidden ref={fileRef} type="file" accept=".json,application/json" onChange={importJson}/>
      <button className="me-reset" onClick={()=>{change(readWarehouseTuning());setStatus('Đã nạp thông số đang áp dụng trong game.');}}>Nạp lại bản đã áp dụng</button>
      <button className="me-reset" onClick={()=>{change({...DEFAULT_WAREHOUSE_TUNING});setStatus('Đã khôi phục mặc định trong bản nháp.');}}>Khôi phục mặc định</button>
    </aside><main className="me-main"><div className="me-toolbar"><div className="me-history" data-version={historyTick}><button disabled={!undoStack.current.length} onClick={undo}>↶ Hoàn tác</button><button disabled={!redoStack.current.length} onClick={redo}>↷ Làm lại</button></div><span className="me-hint">Kéo nhà · Mũi tên: 1 px · Shift: 10 px · Alt: 0,1 px</span>
      <div className="me-zoom"><button onClick={()=>setZoom(v=>Math.max(.2,v/1.2))}>−</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(v=>Math.min(5,v*1.2))}>+</button><button onClick={()=>setZoom(1)}>Vừa khung</button></div></div>
      <div ref={stageRef} className="me-stage wh-stage"><canvas ref={canvasRef} aria-label="Xem trước nhà kho 2x2" tabIndex={0}
        onPointerDown={e=>{if(e.button!==0)return;checkpoint();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);gesture.current={x:e.clientX,y:e.clientY,tuning:{...tuning}};}}
        onPointerMove={e=>{const g=gesture.current;if(g)change({x:g.tuning.x+(e.clientX-g.x)/worldZoom*(previewFlip!==g.tuning.flipX?-1:1),y:g.tuning.y+(e.clientY-g.y)/worldZoom},false);}}
        onPointerUp={e=>{gesture.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
        onPointerCancel={()=>{gesture.current=null;}} onLostPointerCapture={()=>{gesture.current=null;}}/>
      </div><footer className="me-status"><span role="status"><i className={dirty?'is-draft':''}/>{status}</span><span>{dirty?'Chưa áp dụng':'Đã lưu'} · {adj.dw.toFixed(1)} × {adj.dh.toFixed(1)} px</span></footer>
    </main></div>
  </div>;
}
