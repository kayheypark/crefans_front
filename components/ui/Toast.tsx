'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {designTokens,designVariables} from '@/lib/design/tokens';
import {usePresence} from './usePresence';
import s from './ui.module.css';
const toastDuration=4000;

export function Toast({message,onClose}:{message:string;onClose:()=>void}) {
  const present=usePresence(!!message,designTokens.motion.fast),[lastMessage,setLastMessage]=useState(message);
  const closeRef=useRef(onClose),surface=useRef<HTMLDivElement>(null);
  const [target,setTarget]=useState<HTMLElement|null>(null);
  useEffect(()=>{
    if(!present||typeof document==='undefined')return;
    const update=()=>{const dialogs=Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]')).filter(dialog=>dialog.dataset.state!=='closing');setTarget(dialogs.at(-1)||document.body);};
    update();
    const observer=new MutationObserver(update);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','data-state']});
    return()=>observer.disconnect();
  },[present]);
  useEffect(()=>{
    const node=surface.current;if(!node||!present||typeof node.showPopover!=='function')return;
    node.setAttribute('popover','manual');node.showPopover();
    return()=>{if(node.isConnected&&node.matches(':popover-open'))node.hidePopover();};
  },[present,target]);
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(()=>{if(message)setLastMessage(message);},[message]);
  useEffect(()=>{if(!message)return;const timer=setTimeout(()=>closeRef.current(),toastDuration);return()=>clearTimeout(timer);},[message]);
  const content=<div className={s.toastRegion} style={designVariables as CSSProperties} role="status" aria-live="polite" aria-atomic="true">{present && <div ref={surface} className={s.toast} data-state={message?'open':'closing'} onClick={event=>event.stopPropagation()}><span>{message||lastMessage}</span><button type="button" className={s.iconButton} aria-label="알림 닫기" disabled={!message} onClick={onClose}>×</button>{message && <div key={message} className={s.toastProgress} aria-hidden="true" style={{animationDuration:`${toastDuration}ms`}}/>}</div>}</div>;
  return target?createPortal(content,target):content;
}
