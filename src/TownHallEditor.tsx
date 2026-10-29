import React, { useEffect, useRef, useState } from 'react';
import { BUILDING_SOURCE_GEOMETRY, getBuildingRenderAdjustment, getBuildingSpriteUri } from './data/buildingSprites.js';
import { DEFAULT_TOWN_HALL_TUNING, TOWN_HALL_TUNING_KEY, normalizeTownHallTuning, readTownHallTuning, drawTownHallSprite, TOWN_HALL_ENTRANCE, alignTownHallEntrance } from './engine/townHallTuning.js';
import { drawTerrainTile } from './engine/terrainRenderer.js';
import { TERRAIN_SPRITES } from './data/terrainConfig.js';
import './mapEditor.css';
import './townHallEditor.css';

type Tuning = { size: number; width: number; height: number; x: number; y: number; rotation: number; groundShear: number };
export default function TownHallEditor() {
  const [tuning, setTuning] = useState<Tuning>(readTownHallTuning);
  const [status, setStatus] = useState('Kéo tòa nhà để di chuyển; chỉnh thanh trượt để đổi tỉ lệ.');
  const [dirty, setDirty] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [guides, setGuides] = useState(true);
  const [original, setOriginal] = useState(false);
  const [size, setSize] = useState({ width: 900, height: 700 });
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null), stageRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; tuning: Tuning } | null>(null);
  const worldZoom = Math.min(size.width / 700, size.height / 540) * zoom;
  const change = (next: Tuning) => { setTuning(normalizeTownHallTuning(next)); setDirty(true); };
  useEffect(() => { setTuning(readTownHallTuning()); setDirty(false); }, [TOWN_HALL_TUNING_KEY]);
  useEffect(() => {
    document.title = 'Chỉnh tòa thị chính · Isometric Village';
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    if (stageRef.current) observer.observe(stageRef.current);
    let active = true;
    Promise.all(Object.entries({ hall: getBuildingSpriteUri('b14_town_hall'), grass: TERRAIN_SPRITES.grass.uri }).map(async ([key, uri]) => {
      const img = new Image(); img.src = uri; await img.decode(); return [key, img] as const;
    })).then(entries => { if (active) setImages(Object.fromEntries(entries)); }).catch(() => setStatus('Không tải được ảnh. Hãy tải lại trang.'));
    return () => { active = false; observer.disconnect(); };
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.width * dpr); canvas.height = Math.round(size.height * dpr);
    ctx.scale(dpr, dpr); ctx.fillStyle = '#a4b578'; ctx.fillRect(0, 0, size.width, size.height);
    ctx.translate(size.width / 2 - 64 * worldZoom, size.height / 2 - 20 * worldZoom); ctx.scale(worldZoom, worldZoom);
    const diamond = (r: number, c: number) => {
      const x = (c-r-2)*64, y = (r+c-28)*32;
      ctx.beginPath(); ctx.moveTo(x+64,y+64); ctx.lineTo(x+128,y+96); ctx.lineTo(x+64,y+128); ctx.lineTo(x,y+96); ctx.closePath();
    };
    for (let r=6;r<=22;r++) for(let c=7;c<=23;c++) {
      const x=(c-r-2)*64, y=(r+c-28)*32;
      drawTerrainTile(ctx,images.grass,'d12_meadow_wildflowers',x,y);
    }
    if(guides) {
      diamond(15,15); ctx.fillStyle='#8ee3fc55';ctx.fill();ctx.strokeStyle='#b8f0ff';ctx.lineWidth=3/worldZoom;ctx.stroke();
      for(let r=11;r<=16;r++) for(let c=12;c<=18;c++) {diamond(r,c);ctx.strokeStyle='#35523144';ctx.lineWidth=1/worldZoom;ctx.stroke();}
      ctx.beginPath();ctx.moveTo(64,0);ctx.lineTo(256,96);ctx.lineTo(128,160);ctx.lineTo(-64,64);ctx.closePath();
      ctx.fillStyle='#f7d57745';ctx.fill();ctx.strokeStyle='#fff0a0';ctx.lineWidth=2/worldZoom;ctx.stroke();
    }
    const adj = getBuildingRenderAdjustment('b14_town_hall',1,tuning);
    if(images.hall && adj) drawTownHallSprite(ctx,images.hall,adj);
    if(guides) {
      const x=TOWN_HALL_ENTRANCE.worldX+tuning.x, y=TOWN_HALL_ENTRANCE.worldY+tuning.y;
      ctx.strokeStyle='#fff';ctx.lineWidth=2/worldZoom;
      ctx.beginPath();ctx.moveTo(x-8/worldZoom,y);ctx.lineTo(x+8/worldZoom,y);ctx.moveTo(x,y-8/worldZoom);ctx.lineTo(x,y+8/worldZoom);ctx.stroke();
      ctx.fillStyle='#263f2b';ctx.font=`${12/worldZoom}px system-ui`;ctx.fillText('Chân cầu thang · [15,15]',x+12/worldZoom,y+4/worldZoom);
    }
  },[tuning,images,size,worldZoom,guides,original]);
  const apply = () => {
    try { localStorage.setItem(TOWN_HALL_TUNING_KEY,JSON.stringify(tuning));setDirty(false);setStatus('Đã áp dụng. Tab game cùng địa chỉ sẽ cập nhật ngay.'); }
    catch { setStatus('Không lưu được. Bạn có thể xuất thông số để giữ bản chỉnh.'); }
  };
  const exportSettings = () => {
    const url=URL.createObjectURL(new Blob([JSON.stringify({version:4,townHall:tuning},null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='town-hall-settings.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const controls: {key:keyof Tuning;label:string;min:number;max:number;step:number;unit:string}[] = [
    {key:'rotation',label:'Góc xoay ảnh',min:-180,max:180,step:.1,unit:'°'},
    {key:'size',label:'Kích thước tổng thể',min:.5,max:1.8,step:.01,unit:'%'},
    {key:'width',label:'Độ rộng',min:.5,max:1.8,step:.01,unit:'%'},
    {key:'height',label:'Chiều cao',min:.5,max:1.8,step:.01,unit:'%'},
    {key:'x',label:'Dịch ngang',min:-128,max:128,step:1,unit:'px'},
    {key:'y',label:'Dịch dọc',min:-128,max:128,step:1,unit:'px'}
  ];
  return <div className="map-editor town-hall-editor">
    <header className="me-header"><div className="me-brand"><span className="me-logo">⌂</span><div><small>ISOMETRIC VILLAGE</small><h1>Chỉnh tòa thị chính</h1></div><span className="me-dimension">2 × 3 ô</span></div>
      <div className="me-header-actions"><a href="/" target="_blank" rel="noreferrer">Mở game ↗</a><button className="me-primary" onClick={apply}>Áp dụng vào game{dirty?' ·':''}</button></div></header>
    <div className="me-workspace"><aside className="me-sidebar">
      <div className="me-section-heading"><h2>Tỉ lệ & vị trí</h2></div>
      <div className="th-rotation"><button onClick={()=>change({...tuning,rotation:(tuning.rotation??0)-1})}>↶ −1°</button><button onClick={()=>change({...tuning,rotation:0})}>0°</button><button onClick={()=>change({...tuning,rotation:(tuning.rotation??0)+1})}>+1° ↷</button></div>
      {controls.map(c=><label className="th-control" key={c.key}><span>{c.label}<output>{c.unit==='°'?(tuning[c.key]??0).toFixed(1):Math.round(tuning[c.key]*(c.unit==='%'?100:1))}{c.unit}</output></span>
        <input aria-label={c.label} type="range" min={c.min} max={c.max} step={c.step} value={tuning[c.key]??DEFAULT_TOWN_HALL_TUNING[c.key]} onChange={e=>change({...tuning,[c.key]:Number(e.target.value)})}/></label>)}
      <button className="th-wide" onClick={()=>{change(alignTownHallEntrance(tuning));setStatus("Đã căn cầu thang vào [15,15] và khôi phục tỉ lệ nguyên bản của ảnh mới. Nhấn Áp dụng để lưu.");}}>Căn cầu thang vào [15,15]</button>
      <button className="th-wide" onClick={()=>change({...tuning,width:1,height:1})}>Giữ tỉ lệ ảnh gốc</button>
      <div className="me-section-heading"><h2>Đối chiếu</h2></div>
      <label className="me-check"><input type="checkbox" checked={guides} onChange={e=>setGuides(e.target.checked)}/>Lưới & điểm tiếp đất</label>
      <label className="me-check"><input type="checkbox" checked={original} onChange={e=>setOriginal(e.target.checked)}/>Xem ảnh gốc</label>
      <div className="me-note"><b>Căn theo chân nhà</b><p>Ảnh mới hiển thị ở tỉ lệ nguyên bản. Căn tự động đặt chân cầu thang vào [15,15]. Góc xoay ảnh nghiêng toàn bộ tòa nhà.</p></div>
      <div className="me-files"><button onClick={exportSettings}>Xuất thông số ↓</button></div>
      <button className="me-reset" onClick={()=>{change({...DEFAULT_TOWN_HALL_TUNING});setStatus('Đã khôi phục bản mặc định trong preview. Nhấn Áp dụng để lưu.');}}>Khôi phục mặc định</button>
    </aside><main className="me-main"><div className="me-toolbar"><span>{original?'Ảnh gốc · tỉ lệ nguyên bản':'Kéo tòa nhà để di chuyển'}</span><div className="me-zoom"><button aria-label="Thu nhỏ" onClick={()=>setZoom(v=>Math.max(.5,v/1.2))}>−</button><span>{Math.round(zoom*100)}%</span><button aria-label="Phóng to" onClick={()=>setZoom(v=>Math.min(2.5,v*1.2))}>+</button><button onClick={()=>setZoom(1)}>Vừa khung</button></div></div>
      <div ref={stageRef} className="me-stage th-stage">
        <canvas ref={canvasRef} style={{visibility:original?'hidden':'visible'}} aria-label="Xem trước tòa thị chính trên footprint 2x3" onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);gesture.current={x:e.clientX,y:e.clientY,tuning};}} onPointerMove={e=>{const g=gesture.current;if(g)change({...g.tuning,x:g.tuning.x+(e.clientX-g.x)/worldZoom,y:g.tuning.y+(e.clientY-g.y)/worldZoom});}} onPointerUp={e=>{gesture.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onPointerCancel={()=>{gesture.current=null;}} onLostPointerCapture={()=>{gesture.current=null;}}/>
        {original&&<div className="th-original"><img src={getBuildingSpriteUri('b14_town_hall')} alt="Ảnh tòa thị chính gốc, không co kéo"/></div>}
      </div><footer className="me-status"><span role="status"><i className={dirty?'is-draft':''}/>{status}</span><span>{dirty?'Bản chỉnh chưa áp dụng':'Đã lưu'}</span></footer>
    </main></div>
  </div>;
}
