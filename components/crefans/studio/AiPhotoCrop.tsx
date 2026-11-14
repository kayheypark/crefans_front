"use client";
import {useRef,useState} from 'react';
import {Dialog} from '@/components/ui/Primitives';
import {Action} from '../ServiceUI';
import {aiPhotoRatios,photoCrop,type AiPhotoRatio,type PhotoCrop} from '@/lib/crefans/ai-photo-crop';
import type {StudioMedia} from '@/types/crefans-studio-management';
import s from './ai-photo.module.css';
export function AiPhotoRatioPresets({value,onChange,disabled=false}:{value:AiPhotoRatio;onChange:(value:AiPhotoRatio)=>void;disabled?:boolean}){
 return <div className={s.ratioPresets} role="group" aria-label="사진 비율">{aiPhotoRatios.map(r=><button key={r} type="button" aria-pressed={value===r} disabled={disabled} onClick={()=>onChange(r)}><span aria-hidden="true" style={{aspectRatio:r==='original'?'1':r.replace(':',' / '),height:20,maxWidth:36,border:'1.5px solid currentColor',borderRadius:3}}/>{r==='original'?'원본':r}</button>)}</div>;
}
export function AiPhotoCrop({item,onClose,onApply}:{item:StudioMedia;onClose:()=>void;onApply:(crop:PhotoCrop)=>Promise<void>}){
 const [ratio,setRatio]=useState<AiPhotoRatio>('original'),[size,setSize]=useState({width:0,height:0}),[position,setPosition]=useState({x:.5,y:.5}),[zoom,setZoom]=useState(1),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const drag=useRef<{id:number;x:number;y:number;left:number;top:number;scale:number}|null>(null),frame=useRef<HTMLDivElement>(null);
 const crop=size.width?photoCrop(size.width,size.height,ratio,position.x,position.y,zoom):null;
 async function apply(){if(!crop||busy)return;setBusy(true);setError('');try{await onApply(crop);}catch(e){setError(e instanceof Error?e.message:'사진을 저장하지 못했어요. 다시 시도해 주세요.');}finally{setBusy(false);}}
 return <Dialog open title="사진 자르기" onClose={()=>{if(!busy)onClose();}} persistent fullscreenOnMobile><div className={s.cropBody}>
  <AiPhotoRatioPresets value={ratio} onChange={setRatio} disabled={busy}/>
  <div ref={frame} className={s.cropFrame} style={{aspectRatio:crop?`${crop.width}/${crop.height}`:'1',width:crop?`min(100%, calc(55dvh * ${crop.width/crop.height}))`:'100%'}} role="group" aria-label="자를 위치 조정" tabIndex={0}
   onKeyDown={e=>{const moves:Record<string,[number,number]>={ArrowLeft:[-.02,0],ArrowRight:[.02,0],ArrowUp:[0,-.02],ArrowDown:[0,.02]};const d=moves[e.key];if(d&&!busy){e.preventDefault();setPosition(p=>({x:Math.max(0,Math.min(1,p.x+d[0])),y:Math.max(0,Math.min(1,p.y+d[1]))}));}}}
   onPointerDown={e=>{if(!crop||busy)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,left:crop.left,top:crop.top,scale:e.currentTarget.clientWidth/crop.width};}}
   onPointerMove={e=>{const d=drag.current;if(!d||!crop||d.id!==e.pointerId)return;setPosition({x:size.width===crop.width?.5:Math.max(0,Math.min(1,(d.left-(e.clientX-d.x)/d.scale)/(size.width-crop.width))),y:size.height===crop.height?.5:Math.max(0,Math.min(1,(d.top-(e.clientY-d.y)/d.scale)/(size.height-crop.height)))});}}
   onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
   {/* eslint-disable-next-line @next/next/no-img-element -- private generated image */}
   <img src={item.url} alt="자르기 미리보기" draggable={false} onLoad={e=>setSize({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})} onError={()=>setError('사진을 불러오지 못했어요. 닫고 다시 시도해 주세요.')} style={crop?{width:`${size.width/crop.width*100}%`,height:`${size.height/crop.height*100}%`,left:`${-crop.left/crop.width*100}%`,top:`${-crop.top/crop.height*100}%`}:{width:'100%'}}/>
   <span className={s.cropGrid} aria-hidden="true"/>
  </div>
  <label className={s.cropZoom}>확대<input type="range" min="1" max="3" step="0.01" value={zoom} disabled={busy||!crop} onChange={e=>setZoom(Number(e.target.value))}/></label>
  {error&&<p role="alert">{error}</p>}
  <div className={s.cropActions}><Action type="button" variant="secondary" disabled={busy} onClick={onClose}>취소</Action><Action type="button" disabled={busy||!crop} onClick={()=>void apply()}>{busy?'저장 중…':'자르기 적용'}</Action></div>
 </div></Dialog>;
}
