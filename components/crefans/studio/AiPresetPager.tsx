'use client';
import {useRef,useState,type ReactNode} from 'react';
import s from './ai-photo.module.css';

/** Horizontal page gestures leave vertical scrolling and pinch zoom to the browser. */
export function AiPresetPager({children,onStep,disabled}:{children:ReactNode;onStep:(direction:number)=>void;disabled:boolean}){
 const start=useRef<{id:number;x:number;y:number;horizontal:boolean}|null>(null),dragged=useRef(false);
 const [offset,setOffset]=useState(0);
 return <div className={s.presetViewport} role="group" aria-label="프리셋 페이지" onDragStart={event=>event.preventDefault()}
  onPointerDown={event=>{if(disabled||!event.isPrimary||event.button!==0)return;dragged.current=false;start.current={id:event.pointerId,x:event.clientX,y:event.clientY,horizontal:false};}}
  onPointerMove={event=>{const from=start.current;if(!from||from.id!==event.pointerId)return;const x=event.clientX-from.x,y=event.clientY-from.y;
   if(!from.horizontal){if(Math.abs(y)>8&&Math.abs(y)>Math.abs(x)){start.current=null;return;}if(Math.abs(x)<8)return;from.horizontal=true;dragged.current=true;event.currentTarget.setPointerCapture(event.pointerId);}
   setOffset(Math.max(-event.currentTarget.clientWidth,Math.min(event.currentTarget.clientWidth,x)));
  }}
  onPointerUp={event=>{const from=start.current;start.current=null;setOffset(0);if(!from||from.id!==event.pointerId||!from.horizontal||disabled)return;
   const distance=event.clientX-from.x;if(Math.abs(distance)>=Math.min(64,event.currentTarget.clientWidth*.2))onStep(distance<0?1:-1);
  }}
  onPointerCancel={()=>{start.current=null;setOffset(0);}}
  onLostPointerCapture={()=>{start.current=null;setOffset(0);}}
  onClickCapture={event=>{if(dragged.current&&event.detail!==0){event.preventDefault();event.stopPropagation();}}}>
  <div style={{transform:`translateX(${offset}px)`}}>{children}</div>
 </div>;
}
