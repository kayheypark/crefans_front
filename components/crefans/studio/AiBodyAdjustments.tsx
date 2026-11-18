'use client';
import {aiPhotoBodySnap,aiPhotoBodyStrength} from '@/lib/crefans/ai-photo';
import s from './ai-photo.module.css';

type Props={controls:readonly {key:string;label:string}[];selection:{key:string;value:number}|null;disabled?:boolean;onChange:(key:string,value:number)=>void};
function BodyIcon({kind}:{kind:string}){
 return <svg className={s.bodyIcon} viewBox="0 0 32 32" aria-hidden="true">
  {kind==='chest'?<>
   <path d="M11 3h3v3c0 2 4 2 4 0V3h3l6 5-3 7-3-1 2 15H9l2-15-3 1-3-7Z" fill="#fce7f3"/>
   <path d="m11 5-2 8 1 7h12l1-7-2-8" fill="#f472b6"/>
   <path d="M10 15c1-4 5-4 6 0 1-4 5-4 6 0v2c-1 3-5 3-6 1-1 2-5 2-6-1Z" fill="#db2777"/>
   <path d="M10 21h12l1 8H9Z" fill="#fbcfe8"/>
  </>:kind==='upper'?<><rect x="7" y="13" width="18" height="6" rx="2" fill="#f472b6"/><rect x="3" y="8" width="6" height="16" rx="2" fill="#db2777"/><rect x="23" y="8" width="6" height="16" rx="2" fill="#db2777"/></>:kind==='lower'?<><path d="M10 4h12l-1 11 4 11h-7l-3-10-1 10H7l2-12Z" fill="#34d399"/><path d="M7 25h7v4H4v-2Zm11 0h7l4 2v2H18Z" fill="#059669"/></>:kind==='height'?<><circle cx="12" cy="7" r="4" fill="#fbbf24"/><path d="M8 13h8l2 10h-4v6h-4v-6H6Z" fill="#a78bfa"/><rect x="23" y="3" width="6" height="26" rx="2" fill="#7c3aed"/><path d="M23 8h3m-3 5h3m-3 5h3m-3 5h3" stroke="#fff" strokeWidth="2"/></>:kind==='hip'?<>
   <path d="M10 3h12l-1 6c0 4 6 6 6 12l-2 8h-8l-1-5-1 5H7l-2-8c0-6 6-8 6-12Z" fill="#ede9fe"/>
   <path d="M10 10h12c1 4 5 6 5 11l-1 5H17l-1-3-1 3H6l-1-5c0-5 4-7 5-11Z" fill="#a78bfa"/>
   <path d="M10 10h12v3H10Z" fill="#7c3aed"/>
   <path d="M8 19c0 5 7 5 8 0 1 5 8 5 8 0M16 14v5" fill="none" stroke="#6d28d9" strokeWidth="1.75" strokeLinecap="round"/>
  </>:<><path d="m10 5-7 5 4 8 4-2v13h10V16l4 2 4-8-7-5-6 4Z" fill={kind==='shoulder'?'#38bdf8':'#818cf8'}/>{kind==='shoulder'?<path d="M8 13h16m-13-3-3 3 3 3m10-6 3 3-3 3" fill="none" stroke="#0369a1" strokeWidth="2"/>:<path d="M11 17q2-4 5 0 3-4 5 0" fill="none" stroke="#4f46e5" strokeWidth="2"/>}</>}
 </svg>;
}
export function AiBodyAdjustments({controls,selection,disabled,onChange}:Props){
 return <div className={s.bodyAdjustments}>{controls.map(control=>{const value=selection?.key===control.key?selection.value:0,text=value===0?'원본 유지':`보정 강도 ${value>0?'+':'−'}${aiPhotoBodyStrength(value)}%`;return <label key={control.key}>
  <span><span className={s.bodyLabel}><BodyIcon kind={control.key}/>{control.label}</span><output>{text}</output></span>
  <input type="range" aria-label={control.label} aria-valuetext={text} min={-2} max={2} step="any" value={value} onChange={event=>onChange(control.key,aiPhotoBodySnap(Number(event.target.value)))} onKeyDown={event=>{const direction=event.key==='ArrowRight'||event.key==='ArrowUp'?1:event.key==='ArrowLeft'||event.key==='ArrowDown'?-1:0;const next=direction?Math.round((value+direction*.02)*10000)/10000:event.key==='Home'?-2:event.key==='End'?2:event.key==='PageUp'?Math.floor(value)+1:event.key==='PageDown'?Math.ceil(value)-1:null;if(next===null)return;event.preventDefault();onChange(control.key,Math.max(-2,Math.min(2,next)));}} disabled={disabled}/>
  <span className={s.bodyTicks} aria-hidden="true"><i/><i/><i/><i/><i/></span>
 </label>;})}</div>;
}
