'use client';
import {aiPhotoBodyOptions,aiPhotoBodySnap,aiPhotoBodyStrength} from '@/lib/crefans/ai-photo';
import s from './ai-photo.module.css';

type Props={controls:readonly {key:string;label:string}[];selection:Readonly<Record<string,number>>;disabled?:boolean;onChange:(key:string,value:number)=>void};
function BodyIcon({kind}:{kind:string}){
 if(kind==='height')return <svg className={s.bodyIcon} viewBox="90 100 830 830" aria-hidden="true"><image href="/brand/ai-photo/body-icons/height-3d-v1.png" width="1024" height="1024"/></svg>;
 if(kind==='chest'||kind==='hip')return <svg className={s.bodyIcon} viewBox={kind==='chest'?'80 285 430 430':'525 285 430 430'} aria-hidden="true"><image href="/brand/ai-photo/body-icons/body-3d-v1.png" width="1024" height="1024"/></svg>;
 return <svg className={s.bodyIcon} viewBox="0 0 32 32" aria-hidden="true">
  {kind==='upper'?<><rect x="7" y="13" width="18" height="6" rx="2" fill="#f472b6"/><rect x="3" y="8" width="6" height="16" rx="2" fill="#db2777"/><rect x="23" y="8" width="6" height="16" rx="2" fill="#db2777"/></>:kind==='lower'?<><path d="M10 4h12l-1 11 4 11h-7l-3-10-1 10H7l2-12Z" fill="#34d399"/><path d="M7 25h7v4H4v-2Zm11 0h7l4 2v2H18Z" fill="#059669"/></>:<><path d="m10 5-7 5 4 8 4-2v13h10V16l4 2 4-8-7-5-6 4Z" fill={kind==='shoulder'?'#38bdf8':'#818cf8'}/>{kind==='shoulder'?<path d="M8 13h16m-13-3-3 3 3 3m10-6 3 3-3 3" fill="none" stroke="#0369a1" strokeWidth="2"/>:<path d="M11 17q2-4 5 0 3-4 5 0" fill="none" stroke="#4f46e5" strokeWidth="2"/>}</>}
 </svg>;
}
export function AiBodyAdjustments({controls,selection,disabled,onChange}:Props){
 return <div className={s.bodyAdjustments}>{controls.map(control=>{const options=aiPhotoBodyOptions[control.key];
  // 2026-11-20 user decision: chest cups / hip sizes are picked from buttons ('원본 유지' first).
  if(options){const value=selection[control.key]??0;return <div key={control.key} className={s.bodyOptions} role="group" aria-label={control.label}>
   <span><span className={s.bodyLabel}><BodyIcon kind={control.key}/>{control.label}</span><output>{value?options[value-1]:'원본 유지'}</output></span>
   <div>{['원본 유지',...options].map((option,index)=><button key={option} type="button" aria-pressed={value===index} disabled={disabled} onClick={()=>onChange(control.key,index)}>{option}</button>)}</div>
  </div>;}
  const value=selection[control.key]??0,text=value===0?'원본 유지':`보정 강도 ${value>0?'+':'−'}${aiPhotoBodyStrength(value)}%`;return <label key={control.key}>
  <span><span className={s.bodyLabel}><BodyIcon kind={control.key}/>{control.label}</span><output>{text}</output></span>
  <input type="range" aria-label={control.label} aria-valuetext={text} min={-2} max={2} step="any" value={value} onChange={event=>onChange(control.key,aiPhotoBodySnap(Number(event.target.value)))} onKeyDown={event=>{const direction=event.key==='ArrowRight'||event.key==='ArrowUp'?1:event.key==='ArrowLeft'||event.key==='ArrowDown'?-1:0;const next=direction?Math.round((value+direction*.02)*10000)/10000:event.key==='Home'?-2:event.key==='End'?2:event.key==='PageUp'?Math.floor(value)+1:event.key==='PageDown'?Math.ceil(value)-1:null;if(next===null)return;event.preventDefault();onChange(control.key,Math.max(-2,Math.min(2,next)));}} disabled={disabled}/>
  <span className={s.bodyTicks} aria-hidden="true"><i/><i/><i/><i/><i/></span>
 </label>;})}</div>;
}
