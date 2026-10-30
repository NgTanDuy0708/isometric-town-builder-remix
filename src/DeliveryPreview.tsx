import React,{useEffect,useRef,useState} from 'react';
import {getDeliveryPose,drawDeliveryTruck,drawDeliveryBoard,preloadDeliveryArt,drawDeliveryAsset} from './engine/deliveryAnimation.js';
import {DELIVERY_ART} from './data/deliveryArt.js';
import './mapEditor.css';
import './deliveryPreview.css';

const labels:Record<string,string>={idle:'Đỗ tại bảng đơn hàng',loading:'Đang chất hàng',outbound:'Chở hàng rời làng',delivering:'Đang giao hàng ngoài làng',returning:'Xe rỗng quay về',arriving:'Về chỗ đỗ'};
export default function DeliveryPreview(){
  const canvas=useRef<HTMLCanvasElement>(null),stage=useRef<HTMLDivElement>(null);
  const [size,setSize]=useState({width:1000,height:550}),[ready,setReady]=useState(0),[time,setTime]=useState(0);
  const [playing,setPlaying]=useState(true),[speed,setSpeed]=useState(1),[mode,setMode]=useState('trip');
  const timeRef=useRef(0),[guides,setGuides]=useState(false);
  const pose=getDeliveryPose({isDelivering:true,startedAt:0,tripDurationMs:28000},time*1000);
  useEffect(()=>{
    document.title='Xe giao hàng động · Isometric Village';preloadDeliveryArt(()=>setReady(v=>v+1));
    const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));
    if(stage.current)observer.observe(stage.current);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(!playing)return;let request=0,last=performance.now();
    const tick=(now:number)=>{timeRef.current=(timeRef.current+Math.min((now-last)/1000,.1)*speed)%28;last=now;setTime(timeRef.current);request=requestAnimationFrame(tick);};
    request=requestAnimationFrame(tick);return()=>cancelAnimationFrame(request);
  },[playing,speed]);
  useEffect(()=>{
    const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);el.width=Math.round(size.width*dpr);el.height=Math.round(size.height*dpr);
    ctx.scale(dpr,dpr);ctx.fillStyle='#1e352a';ctx.fillRect(0,0,size.width,size.height);
    const scale=Math.min(size.width/900,size.height/500);ctx.translate(size.width/2,size.height/2);ctx.scale(scale,scale);
    ctx.fillStyle='#b59c69';ctx.beginPath();ctx.moveTo(-420,110);ctx.lineTo(130,-165);ctx.lineTo(220,-120);ctx.lineTo(-330,155);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#dac392';ctx.lineWidth=1;for(let i=-6;i<6;i++){ctx.beginPath();ctx.moveTo(i*46-75,-i*23+30);ctx.lineTo(i*46+3,-i*23+69);ctx.stroke();}
    ctx.save();ctx.translate(132,7);ctx.scale(1.8,1.8);drawDeliveryBoard(ctx,0,0,time);ctx.restore();
    const selected=mode==='idle'?getDeliveryPose({isDelivering:false}):mode==='outgoing'?{...pose,isVisible:true,isMoving:true,isReturning:false,phase:'outbound',frame:Math.floor(time*10)%4}:
      mode==='returning'?{...pose,isVisible:true,isMoving:true,isReturning:true,phase:'returning',frame:Math.floor(time*10)%4}:pose;
    let x=-55,y=65;
    if(mode==='trip'){
      const distance=(pose.row-18.5)*23;
      x-=distance;y+=distance*.5;
    }
    if(guides){ctx.strokeStyle='#a7c4ab';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-11,y);ctx.lineTo(x+11,y);ctx.moveTo(x,y-11);ctx.lineTo(x,y+11);ctx.stroke();}
    ctx.save();ctx.translate(x,y);ctx.scale(2.1,2.1);drawDeliveryTruck(ctx,0,0,selected,time);ctx.restore();
    ctx.fillStyle='#e7edd8';ctx.font='13px system-ui';ctx.fillText('Bảng đơn hàng',75,50);
  },[time,mode,size,ready,guides]);
  return <div className="map-editor delivery-preview"><header className="me-header"><div className="me-brand"><span className="me-logo">▰</span><div><small>ISOMETRIC VILLAGE</small><h1>Xe giao hàng động</h1></div></div><div className="me-header-actions"><a href="/" target="_blank" rel="noreferrer">Mở game ↗</a><a href="/map-editor">Vẽ map</a></div></header>
    <div className="dv-controls"><button onClick={()=>setPlaying(!playing)}>{playing?'Tạm dừng':'Phát hoạt ảnh'}</button>
      <label>Chế độ <select aria-label="Chế độ hoạt ảnh" value={mode} onChange={e=>setMode(e.target.value)}><option value="trip">Trọn chuyến 28 giây</option><option value="idle">Đỗ xe</option><option value="outgoing">Chạy đi · đầy hàng</option><option value="returning">Chạy về · xe rỗng</option></select></label>
      <label>Tốc độ <select aria-label="Tốc độ phát" value={speed} onChange={e=>setSpeed(+e.target.value)}><option value="0.5">0,5×</option><option value="1">1×</option><option value="2">2×</option></select></label>
      <label><input type="checkbox" checked={guides} onChange={e=>setGuides(e.target.checked)}/>Điểm tiếp đất</label>
      <a href={DELIVERY_ART.outgoing.uri} target="_blank" rel="noreferrer">Sprite đi ↗</a><a href={DELIVERY_ART.returning.uri} target="_blank" rel="noreferrer">Sprite về ↗</a></div>
    <div ref={stage} className="me-stage"><canvas ref={canvas} aria-label="Xe giao hàng chạy với bốn khung bánh xe mỗi hướng"/></div>
    <footer className="dv-timeline"><span role="status">{mode==='trip'?labels[pose.phase]:mode==='idle'?labels.idle:mode==='outgoing'?labels.outbound:labels.returning}</span><input aria-label="Thời điểm chuyến giao" type="range" min="0" max="27.99" step="0.01" value={time} onChange={e=>{timeRef.current=+e.target.value;setTime(+e.target.value);}}/><span>{time.toFixed(1)} / 28 s</span><small>4 khung mỗi hướng · 10 fps · PNG gốc</small></footer>
  </div>;
}
