'use client';
import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import s from './ai-photo.module.css';

export const AI_PHOTO_DONE_MS=1200;
/** Taps are ignored this long after the result appears (the layer's time plus a short tail) so heart-game taps can't hit it. */
export const AI_PHOTO_TAP_LOCK_MS=AI_PHOTO_DONE_MS+500;

// 2026-11-21 user request: when a photo is made, a "사진이 완료됐어요" layer covers the whole screen for a moment before the result
// shows. It sits in the top layer (manual popover, above the open dialog) and swallows taps, so heart-game taps that keep going
// don't land on the result and unselect it.
export function AiPhotoDone({show,onDone}:{show:number;onDone:()=>void}){
 const ref=useRef<HTMLDivElement>(null),done=useRef(onDone);done.current=onDone;
 useEffect(()=>{
  if(!show)return;
  const node=ref.current;
  if(node&&typeof node.showPopover==='function'&&!node.matches(':popover-open'))node.showPopover();
  const timer=setTimeout(()=>{if(node?.isConnected&&node.matches(':popover-open'))node.hidePopover();done.current();},AI_PHOTO_DONE_MS);
  return()=>clearTimeout(timer);
 },[show]);
 if(!show)return null;
 const stop=(event:{preventDefault():void;stopPropagation():void})=>{event.preventDefault();event.stopPropagation();};
 const layer=<div ref={ref} key={show} popover="manual" className={s.doneLayer} data-testid="ai-photo-done" role="status" aria-live="assertive"
  onPointerDown={stop} onPointerUp={stop} onClick={stop} onTouchStart={stop} onTouchEnd={stop}>
  <div className={s.doneCard}>
   <span className={s.doneCheck} aria-hidden="true"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>
   <strong>생성이 완료됐어요</strong>
   <span className={s.doneSub}>결과를 보여 드릴게요</span>
  </div>
 </div>;
 return typeof document!=='undefined'&&document.body?createPortal(layer,document.body):layer;
}
