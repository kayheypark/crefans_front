'use client';

import {useEffect,useId,useRef,useState} from 'react';
import type {CSSProperties,ReactNode} from 'react';
import Image from 'next/image';
import s from './info-tooltip.module.css';

/** `trigger` replaces the default info icon (e.g. a badge image) and keeps the same open/pin/close behavior. */
export function InfoTooltip({label,content,trigger:custom}:{label:string;content:string;trigger?:ReactNode}){
  const id=useId(),root=useRef<HTMLSpanElement>(null),trigger=useRef<HTMLButtonElement>(null),popup=useRef<HTMLSpanElement>(null);
  const pinned=useRef(false),keyboardFocus=useRef(false),pointerDown=useRef(false);
  const [open,setOpen]=useState(false),[position,setPosition]=useState<CSSProperties|null>(null);
  function close(){pinned.current=false;setOpen(false);setPosition(null);}

  useEffect(()=>{
    if(!open)return;
    const tip=popup.current,button=trigger.current;
    if(!tip||!button)return;
    if(tip.showPopover&&!tip.matches(':popover-open'))tip.showPopover();
    function place(){
      if(!tip||!button)return;
      const rect=button.getBoundingClientRect(),viewport=window.visualViewport;
      const left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0,width=viewport?.width||innerWidth,height=viewport?.height||innerHeight;
      const tipWidth=Math.min(260,width-16),tipHeight=tip.getBoundingClientRect().height;
      setPosition({width:tipWidth,left:Math.max(left+8,Math.min(rect.left,left+width-tipWidth-8)),top:rect.bottom+tipHeight<=top+height-8?rect.bottom:Math.max(top+8,rect.top-tipHeight)});
    }
    function outside(event:PointerEvent){if(!root.current?.contains(event.target as Node))close();}
    function escape(event:KeyboardEvent){if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}}
    place();
    document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',escape,true);
    window.addEventListener('resize',place);window.addEventListener('scroll',place,true);window.visualViewport?.addEventListener('resize',place);
    return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);window.visualViewport?.removeEventListener('resize',place);};
  },[open]);

  return <span ref={root} className={s.root}
    onPointerEnter={event=>{if(event.pointerType==='mouse')setOpen(true);}}
    onPointerLeave={event=>{if(event.pointerType==='mouse'&&!pinned.current&&!keyboardFocus.current)close();}}>
    <button ref={trigger} type="button" className={custom?`${s.trigger} ${s.customTrigger}`:s.trigger} aria-label={label} aria-describedby={open?id:undefined}
      onPointerDown={()=>{pointerDown.current=true;}}
      onFocus={()=>{if(!pointerDown.current){keyboardFocus.current=true;setOpen(true);}}}
      onBlur={()=>{keyboardFocus.current=false;pointerDown.current=false;close();}}
      onClick={()=>{pointerDown.current=false;if(pinned.current)close();else{pinned.current=true;setOpen(true);}}}>
      {custom??<Image src="/brand/tooltip-info-v1.png" width={20} height={20} alt="" aria-hidden="true"/>}
    </button>
    {open&&<span ref={popup} id={id} role="tooltip" {...{popover:'manual'}} className={s.popup} style={{...position,visibility:position?'visible':'hidden'}}>{content}</span>}
  </span>;
}
