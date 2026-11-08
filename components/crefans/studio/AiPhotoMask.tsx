'use client';
// 의상 교체용 영역 칠하기. 칠한 곳만 바뀌도록 원본 크기의 마스크 PNG(칠한 곳 투명)를 만든다.
// 좌표와 붓 크기는 사진 폭 대비 비율로 저장해 화면 크기와 무관하게 같은 마스크가 나온다.
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import s from './ai-photo.module.css';

export type MaskStroke={size:number;points:{x:number;y:number}[]};
const BRUSHES=[{label:'작게',size:.03},{label:'보통',size:.06},{label:'크게',size:.1}];

function paint(context:CanvasRenderingContext2D,strokes:MaskStroke[],width:number,height:number,color:string){
 context.strokeStyle=color;context.fillStyle=color;context.lineCap='round';context.lineJoin='round';
 for(const stroke of strokes){
  const radius=stroke.size*width/2;context.lineWidth=radius*2;
  if(stroke.points.length===1){const [p]=stroke.points;context.beginPath();context.arc(p.x*width,p.y*height,radius,0,Math.PI*2);context.fill();continue;}
  context.beginPath();stroke.points.forEach((p,i)=>i?context.lineTo(p.x*width,p.y*height):context.moveTo(p.x*width,p.y*height));context.stroke();
 }
}

/** Mask for the image edit API: opaque everywhere, transparent where painted. Same pixel size as the source photo. */
export async function buildAiMask(src:string,strokes:MaskStroke[]):Promise<Blob|null>{
 const image=new Image();image.crossOrigin='anonymous';image.src=src;await image.decode();
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 const context=canvas.getContext('2d');if(!context)return null;
 context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
 context.globalCompositeOperation='destination-out';paint(context,strokes,canvas.width,canvas.height,'#000');
 return new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
}

export function AiPhotoMask({src,alt,strokes,onChange,disabled}:{src:string;alt:string;strokes:MaskStroke[];onChange:(strokes:MaskStroke[])=>void;disabled?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null),current=useRef<MaskStroke|null>(null),[brush,setBrush]=useState(BRUSHES[1].size),[box,setBox]=useState({width:0,height:0});
 useEffect(()=>{
  const node=canvas.current;if(!node)return;
  const resize=()=>setBox({width:node.clientWidth,height:node.clientHeight});resize();
  if(typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(resize);observer.observe(node);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  const node=canvas.current,context=node?.getContext('2d');if(!node||!context||!box.width)return;
  const ratio=window.devicePixelRatio||1;node.width=box.width*ratio;node.height=box.height*ratio;context.setTransform(ratio,0,0,ratio,0,0);
  context.clearRect(0,0,box.width,box.height);paint(context,strokes,box.width,box.height,'rgb(244 114 182 / 55%)');
 },[strokes,box]);
 const point=(event:PointerEvent<HTMLCanvasElement>)=>{const r=event.currentTarget.getBoundingClientRect();return {x:Math.min(1,Math.max(0,(event.clientX-r.left)/r.width)),y:Math.min(1,Math.max(0,(event.clientY-r.top)/r.height))};};
 function down(event:PointerEvent<HTMLCanvasElement>){if(disabled||event.button!==0)return;event.currentTarget.setPointerCapture?.(event.pointerId);current.current={size:brush,points:[point(event)]};onChange([...strokes,current.current]);}
 function move(event:PointerEvent<HTMLCanvasElement>){const stroke=current.current;if(!stroke)return;stroke.points=[...stroke.points,point(event)];onChange([...strokes.slice(0,-1),{...stroke}]);}
 function up(){current.current=null;}
 return <div className={s.mask}>
  <div className={s.maskStage}>
   {/* eslint-disable-next-line @next/next/no-img-element -- creator's own uploaded photo at its natural ratio */}
   <img src={src} alt={alt} draggable={false}/>
   <canvas ref={canvas} aria-label="바꿀 옷 부분 칠하기" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} data-disabled={disabled||undefined}/>
  </div>
  <div className={s.maskTools}>
   <span className={s.maskLabel}>붓 크기</span>
   {BRUSHES.map(item=><button key={item.label} type="button" className={s.chip} aria-pressed={brush===item.size} onClick={()=>setBrush(item.size)} disabled={disabled}>{item.label}</button>)}
   <span className={s.maskSpacer}/>
   <button type="button" className={s.textButton} onClick={()=>onChange(strokes.slice(0,-1))} disabled={disabled||!strokes.length}>되돌리기</button>
   <button type="button" className={s.textButton} onClick={()=>onChange([])} disabled={disabled||!strokes.length}>모두 지우기</button>
  </div>
 </div>;
}
