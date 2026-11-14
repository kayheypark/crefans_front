'use client';
import {aiPhotoBodySnap,aiPhotoBodyStrength} from '@/lib/crefans/ai-photo';
import s from './ai-photo.module.css';

type Props={controls:readonly {key:string;label:string}[];selection:{key:string;value:number}|null;disabled?:boolean;onChange:(key:string,value:number)=>void};
function BodyIcon({kind}:{kind:string}){
 return <svg className={s.bodyIcon} viewBox="0 0 32 32" aria-hidden="true">
  {kind==='upper'?<><rect x="7" y="13" width="18" height="6" rx="2" fill="#f472b6"/><rect x="3" y="8" width="6" height="16" rx="2" fill="#db2777"/><rect x="23" y="8" width="6" height="16" rx="2" fill="#db2777"/></>:kind==='lower'?<><path d="M10 4h12l-1 11 4 11h-7l-3-10-1 10H7l2-12Z" fill="#34d399"/><path d="M7 25h7v4H4v-2Zm11 0h7l4 2v2H18Z" fill="#059669"/></>:kind==='height'?<><circle cx="12" cy="7" r="4" fill="#fbbf24"/><path d="M8 13h8l2 10h-4v6h-4v-6H6Z" fill="#a78bfa"/><rect x="23" y="3" width="6" height="26" rx="2" fill="#7c3aed"/><path d="M23 8h3m-3 5h3m-3 5h3m-3 5h3" stroke="#fff" strokeWidth="2"/></>:kind==='hip'?<><path d="M9 4h14l1 7 4 9-4 9h-8l-1-9-1 9H6l-3-9 5-9Z" fill="#fb923c"/><path d="M8 10h16v4H8Z" fill="#ea580c"/><path d="m15 14 1 6" stroke="#fff" strokeWidth="2"/></>:<><path d="m10 5-7 5 4 8 4-2v13h10V16l4 2 4-8-7-5-6 4Z" fill={kind==='shoulder'?'#38bdf8':'#818cf8'}/>{kind==='shoulder'?<path d="M8 13h16m-13-3-3 3 3 3m10-6 3 3-3 3" fill="none" stroke="#0369a1" strokeWidth="2"/>:<path d="M11 17q2-4 5 0 3-4 5 0" fill="none" stroke="#4f46e5" strokeWidth="2"/>}</>}
 </svg>;
}
export function AiBodyAdjustments({controls,selection,disabled,onChange}:Props){
 return <div className={s.bodyAdjustments}>{controls.map(control=>{const value=selection?.key===control.key?selection.value:0,text=value===0?'원본 유지':`보정 강도 ${value>0?'+':'−'}${aiPhotoBodyStrength(value)}%`;return <label key={control.key}>
  <span><span className={s.bodyLabel}><BodyIcon kind={control.key}/>{control.label}</span><output>{text}</output></span>
  <input type="range" aria-label={control.label} aria-valuetext={text} min={-2} max={2} step="any" value={value} onChange={event=>onChange(control.key,aiPhotoBodySnap(Number(event.target.value)))} onKeyDown={event=>{const direction=event.key==='ArrowRight'||event.key==='ArrowUp'?1:event.key==='ArrowLeft'||event.key==='ArrowDown'?-1:0;const next=direction?Math.round((value+direction*.02)*10000)/10000:event.key==='Home'?-2:event.key==='End'?2:event.key==='PageUp'?Math.floor(value)+1:event.key==='PageDown'?Math.ceil(value)-1:null;if(next===null)return;event.preventDefault();onChange(control.key,Math.max(-2,Math.min(2,next)));}} disabled={disabled}/>
  <span className={s.bodyTicks} aria-hidden="true"><i/><i/><i/><i/><i/></span>
 </label>;})}</div>;
}
