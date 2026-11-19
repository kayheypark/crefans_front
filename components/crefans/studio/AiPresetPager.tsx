'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import s from './ai-photo.module.css';

// 2026-11-19 user request: a hint that presets also page by dragging left/right. Hidden for the rest of the visit after the first swipe.
let swipedOnce=false;

/** Horizontal page gestures leave vertical scrolling and pinch zoom to the browser. */
export function AiPresetPager({children,onStep,disabled}:{children:ReactNode;onStep:(direction:number)=>void;disabled:boolean}){
 const start=useRef<{id:number;x:number;y:number;horizontal:boolean}|null>(null),dragged=useRef(false),viewport=useRef<HTMLDivElement>(null),off=useRef(disabled);
 const [offset,setOffset]=useState(0),[swiped,setSwiped]=useState(swipedOnce);
 off.current=disabled;
 // iOS Safari still starts a vertical scroll on a mostly horizontal drag inside touch-action:pan-y and then cancels the pointer
 // (WebKit bug 203335). Claiming the first touchmove of a horizontal drag stops that scroll; React touch handlers are passive.
 useEffect(()=>{const el=viewport.current;if(!el)return;let from:{x:number;y:number}|null=null,axis:''|'x'|'y'='';
  const down=(event:TouchEvent)=>{axis='';from=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;};
  const move=(event:TouchEvent)=>{if(!from||off.current||event.touches.length!==1){from=null;return;}
   if(!axis){const x=Math.abs(event.touches[0].clientX-from.x),y=Math.abs(event.touches[0].clientY-from.y);if(x<3&&y<3)return;axis=x>y?'x':'y';}
   if(axis==='x'&&event.cancelable)event.preventDefault();};
  el.addEventListener('touchstart',down,{passive:true});el.addEventListener('touchmove',move,{passive:false});
  return()=>{el.removeEventListener('touchstart',down);el.removeEventListener('touchmove',move);};},[]);
 const [seen,setSeen]=useState(false),[overlayDone,setOverlayDone]=useState(false),overlay=!disabled&&!swiped&&seen&&!overlayDone;
 // The hand plays once the cards are half on screen (the landing grid starts below the fold); without IntersectionObserver it plays at once.
 useEffect(()=>{if(seen)return;const el=viewport.current;if(!el||typeof IntersectionObserver==='undefined'){setSeen(true);return;}
  const io=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setSeen(true);io.disconnect();}},{threshold:.5});io.observe(el);return()=>io.disconnect();},[seen]);
 // 2026-11-19 user report "오버레이로, 손가락이 잘림": a dimmed overlay on the cards with a whole hand and the text swipes twice, then fades out
 // (or goes at the first touch). It never blocks taps.
 return <><div ref={viewport} className={s.presetViewport} role="group" aria-label="프리셋 페이지" onDragStart={event=>event.preventDefault()}
  onPointerDown={event=>{setOverlayDone(true);if(disabled||!event.isPrimary||event.button!==0)return;dragged.current=false;start.current={id:event.pointerId,x:event.clientX,y:event.clientY,horizontal:false};}}
  onPointerMove={event=>{const from=start.current;if(!from||from.id!==event.pointerId)return;const x=event.clientX-from.x,y=event.clientY-from.y;
   if(!from.horizontal){if(Math.abs(y)>8&&Math.abs(y)>Math.abs(x)){start.current=null;return;}if(Math.abs(x)<8)return;from.horizontal=true;dragged.current=true;event.currentTarget.setPointerCapture(event.pointerId);}
   setOffset(Math.max(-event.currentTarget.clientWidth,Math.min(event.currentTarget.clientWidth,x)));
  }}
  onPointerUp={event=>{const from=start.current;start.current=null;setOffset(0);if(!from||from.id!==event.pointerId||!from.horizontal||disabled)return;
   const distance=event.clientX-from.x;if(Math.abs(distance)>=Math.min(64,event.currentTarget.clientWidth*.2)){swipedOnce=true;setSwiped(true);onStep(distance<0?1:-1);}
  }}
  onPointerCancel={()=>{start.current=null;setOffset(0);}}
  // Touch pointers are implicitly captured by the card under the finger. Taking capture for a horizontal drag makes that card fire
  // lostpointercapture, which bubbles here; only the viewport's own loss ends the drag (2026-11-15 mobile swipe fix).
  onLostPointerCapture={event=>{if(event.target!==event.currentTarget)return;start.current=null;setOffset(0);}}
  onClickCapture={event=>{if(dragged.current&&event.detail!==0){event.preventDefault();event.stopPropagation();}}}>
  <div style={{transform:`translateX(${offset}px)`}}>{children}</div>
  {overlay&&<span className={s.swipeOverlay} aria-hidden="true" onAnimationEnd={event=>{if(event.target===event.currentTarget)setOverlayDone(true);}}>
   <svg className={s.swipeHand} width="56" height="56" viewBox="-4 -3 32 32" fill="#fff" stroke="#1f2233" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.6-2.2L4 15.6a1.5 1.5 0 0 1 2.2-2L9 15.5"/></svg>
   <span>좌우로 밀어서 넘겨 보세요</span></span>}
 </div></>;
}
