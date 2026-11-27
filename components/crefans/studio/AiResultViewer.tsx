'use client';
import {useEffect,useRef,type Ref} from 'react';
import type {StudioMedia} from '@/types/crefans-studio-management';
import {Action} from '../ServiceUI';
import s from './ai-photo.module.css';

export function PhotoZoomButton({label,onClick,ref}:{label:string;onClick:()=>void;ref?:Ref<HTMLButtonElement>}){
 return <button ref={ref} type="button" className={s.zoom} aria-label={label} title="크게 보기" onClick={onClick}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg></button>;
}

export function AiResultViewer({items,index,selected,onIndex,onToggle,onClose,onShare,original=false}:{onShare?:(item:StudioMedia)=>void;items:StudioMedia[];index:number;selected:string[];onIndex:(index:number)=>void;onToggle?:(id:string)=>void;onClose:()=>void;original?:boolean}){
 const closeRef=useRef<HTMLButtonElement>(null),start=useRef<number|null>(null),pointers=useRef(new Set<number>()),item=items[index],picked=selected.includes(item.id);
 useEffect(()=>{closeRef.current?.focus({preventScroll:true});},[]);
 const go=(next:number)=>{if(next>=0&&next<items.length)onIndex(next);};
 return <div className={s.viewer} role="group" aria-label={original?'원본 사진 크게 보기':`결과 ${index+1} 크게 보기`} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}else if(event.key==='ArrowLeft')go(index-1);else if(event.key==='ArrowRight')go(index+1);}}
  onPointerDown={event=>{pointers.current.add(event.pointerId);start.current=pointers.current.size===1&&(typeof window==='undefined'||(window.visualViewport?.scale||1)<=1)?event.clientX:null;}} onPointerCancel={event=>{pointers.current.delete(event.pointerId);start.current=null;}} onPointerUp={event=>{pointers.current.delete(event.pointerId);const from=start.current;start.current=null;if(from===null||pointers.current.size)return;const dx=event.clientX-from;if(Math.abs(dx)>50)go(index+(dx<0?1:-1));}}>
  <div className={s.viewerBar}><span>{original?'원본 사진':`결과 ${index+1} / ${items.length}`}</span><div className={s.viewerTools}>{onShare&&<button type="button" className={s.viewerClose} onClick={()=>onShare(item)}>공유</button>}<button ref={closeRef} type="button" className={s.viewerClose} onClick={onClose}>닫기</button></div></div>
  <div className={s.viewerStage}>
   {index>0&&<button type="button" className={`${s.viewerNav} ${s.viewerPrev}`} aria-label="이전 결과" onClick={()=>go(index-1)}>‹</button>}
   {/* eslint-disable-next-line @next/next/no-img-element -- generated draft image at full size */}
   <span className={s.viewerFrame}><img src={item.url} alt={original?'원본 사진':`결과 ${index+1} (AI 생성 사진)`} draggable={false}/>{(!original||item.aiGenerated)&&<span className={s.ai}>{/* eslint-disable-next-line @next/next/no-img-element -- existing decorative brand icon */}<img src="/brand/featured-creators-v1.png" alt="" aria-hidden="true" width={14} height={14} style={{width:14,height:14,flexShrink:0}}/>AI 생성</span>}</span>
   {index<items.length-1&&<button type="button" className={`${s.viewerNav} ${s.viewerNext}`} aria-label="다음 결과" onClick={()=>go(index+1)}>›</button>}
  </div>
  {onToggle&&<div className={s.viewerActions}><Action type="button" variant={picked?'secondary':'primary'} aria-pressed={picked} onClick={()=>onToggle(item.id)}>{picked?'선택됨 ✓':'이 사진 선택'}</Action></div>}
 </div>;
}
