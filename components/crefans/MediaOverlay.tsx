'use client';
import {forwardRef,useEffect,useRef,useState,type HTMLAttributes,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import {MediaVideo} from '@/components/ui/MediaVideo';
import Icon from './Icon';
import s from './social.module.css';

type MediaOverlayProps=Omit<HTMLAttributes<HTMLDivElement>,'title'> & {
  media:ReadonlyArray<{type:'image'|'video';url:string}>;title:string;alt:string;
  index:number;onIndexChange:(index:number)=>void;open:boolean;onClose:()=>void;stageAction?:ReactNode;onImageClick?:()=>void;
};
const overlaySwipeThreshold=40,overlayDragThreshold=6;
/** Shared full-screen media stage. Optional children supply a detail panel; URLs and access decisions belong to the caller. */
export const MediaOverlay=forwardRef<HTMLDivElement,MediaOverlayProps>(function MediaOverlay({media,title,alt,index,onIndexChange,open,onClose,stageAction,onImageClick,children,...props},ref){
  const closeButton=useRef<HTMLButtonElement>(null);
  /** The stage is a sliding track: the finger/mouse drags it live, release snaps to the neighbour with a transition. Ends clamp (no wrap). Videos keep their controls. */
  const [offset,setOffset]=useState(0),swipe=useRef<{id:number;x:number;y:number;axis:'x'|'y'|null}|null>(null),suppressImageClick=useRef(false);
  const swipeStart=(event:ReactPointerEvent<HTMLDivElement>)=>{
    if(event.isPrimary===false||event.button>0){swipe.current=null;suppressImageClick.current=true;setOffset(0);return;}
    suppressImageClick.current=false;
    const target=event.target as HTMLElement;
    if((media.length<2&&!onImageClick)||target.tagName==='VIDEO'||target.closest?.('button,a,input,textarea,select'))return;
    swipe.current={id:event.pointerId,x:event.clientX,y:event.clientY,axis:null};
  };
  const swipeMove=(event:ReactPointerEvent<HTMLDivElement>)=>{const start=swipe.current;if(!start||start.id!==event.pointerId)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(!start.axis){if(Math.abs(dx)<overlayDragThreshold&&Math.abs(dy)<overlayDragThreshold)return;start.axis=Math.abs(dx)>=Math.abs(dy)?'x':'y';suppressImageClick.current=true;}if(start.axis!=='x'||media.length<2)return;const atEdge=(index===0&&dx>0)||(index===media.length-1&&dx<0);setOffset(atEdge?dx/3:dx);};
  const swipeEnd=(event:ReactPointerEvent<HTMLDivElement>)=>{const start=swipe.current;if(start&&start.id!==event.pointerId)return;swipe.current=null;setOffset(0);if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.max(Math.abs(dx),Math.abs(dy))>=overlayDragThreshold)suppressImageClick.current=true;if(start.axis!=='x'||media.length<2||Math.abs(dx)<overlaySwipeThreshold)return;if(dx<0)next();else previous();};
  const previous=()=>onIndexChange(Math.max(0,index-1)),next=()=>onIndexChange(Math.min(media.length-1,index+1));
  useEffect(()=>{
    if(typeof document==='undefined')return;
    const trigger=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';closeButton.current?.focus();
    return()=>{document.body.style.overflow=overflow;if(trigger?.isConnected)trigger.focus();};
  },[]);
  const keyDown=(event:ReactKeyboardEvent<HTMLDivElement>)=>{
    if(event.defaultPrevented||!open)return;
    const target=event.target as HTMLElement;
    if(target.closest('dialog,[role=dialog]')!==event.currentTarget)return;
    if(event.key==='Escape'){event.stopPropagation();onClose();return;}
    const editing=target.closest('input,textarea,select,[contenteditable=true],video');
    if(!editing&&media.length>1&&['ArrowLeft','ArrowRight'].includes(event.key)){
      event.preventDefault();if(event.key==='ArrowLeft')previous();else next();
    }
    if(event.key==='Tab'){
      const focusable=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),video[controls],[tabindex="0"]')).filter(node=>node.tabIndex>=0&&node.getClientRects().length>0&&getComputedStyle(node).visibility!=='hidden'&&!node.closest('[aria-hidden=true]')&&node.closest('dialog,[role=dialog]')===event.currentTarget);
      const current=focusable.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      const next=current<0?(event.shiftKey?focusable.length-1:0):(current+(event.shiftKey?-1:1)+focusable.length)%focusable.length;
      focusable[next]?.focus();
    }
  };
  return <div {...props} ref={ref} className={s.overlay} role="dialog" aria-modal="true" aria-label={title} data-state={open?'open':'closing'} data-media-only={!children||undefined} onKeyDown={keyDown} onClick={onClose}>
    <div className={s.stage} onClick={event=>{event.stopPropagation();if(open&&!suppressImageClick.current&&(event.target as HTMLElement).tagName==='IMG')onImageClick?.();}} onPointerDown={swipeStart} onPointerMove={swipeMove} onPointerUp={swipeEnd} onPointerCancel={()=>{swipe.current=null;suppressImageClick.current=true;setOffset(0);}}>
      <div className={s.stageTrack} data-index={index} data-dragging={offset!==0||undefined} style={{transform:`translateX(calc(${-index*100}% + ${offset}px))`}}>{media.map((item,slide)=><div key={`${item.url}-${slide}`} className={s.stageSlide} aria-hidden={slide!==index||undefined}>{item.type==='video'?<MediaVideo src={item.url} controls={slide===index} playsInline preload="metadata" aria-label={`${alt} 동영상 ${slide+1}`}/>:<img src={item.url} alt={media.length>1?`${alt} ${slide+1}`:alt} draggable={false}/>}</div>)}</div>
      {media.length>1&&<>{index>0&&<button type="button" className={`${s.stageNav} ${s.stagePrevious}`} aria-label="이전 미디어" onClick={previous}><Icon name="chevron"/></button>}{index<media.length-1&&<button type="button" className={`${s.stageNav} ${s.stageNext}`} aria-label="다음 미디어" onClick={next}><Icon name="chevron"/></button>}<div className={`${s.galleryDots} ${s.stageDots}`} aria-hidden="true">{media.map((item,dot)=><i key={`${item.url}-${dot}`} data-active={dot===index||undefined}/>)}</div></>}
      {stageAction}
    </div>
    {children}
    <button type="button" ref={closeButton} className={s.overlayClose} aria-label="닫기" onClick={event=>{event.stopPropagation();onClose();}}><Icon name="close" width={24} height={24}/></button>
  </div>;
});
