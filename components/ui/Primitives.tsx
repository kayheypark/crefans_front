"use client";
import { useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import {designTokens} from '@/lib/design/tokens';
import {usePresence} from './usePresence';
import s from './ui.module.css';
export {Field,TextAreaField} from './Field';
export {SelectField} from './SelectField';
let scrollLocks=0;
let originalOverflow='';
const toastDuration=4000;

export function Button({tone='brand', loading=false, children, className='', disabled, ...props}: ButtonHTMLAttributes<HTMLButtonElement> & {tone?:'brand'|'secondary'|'quiet'|'danger';loading?:boolean}) {
  return <button {...props} disabled={disabled || loading} aria-busy={loading || undefined} className={`${s.button} ${s[tone]} ${className}`}>{loading && <span className={s.spinner} aria-hidden="true" />}{children}</button>;
}
export function Chip({selected=false,children,onClick}: {selected?:boolean;children:ReactNode;onClick?:()=>void}) {
  return <button type="button" className={s.chip} aria-pressed={selected} onClick={onClick}>{children}</button>;
}
export function Badge({children,tone='brand'}:{children:ReactNode;tone?:'brand'|'success'|'danger'}) {return <span className={s.badge} data-tone={tone}>{children}</span>;}
export function EmptyState({title,description,action}:{title:string;description:string;action?:ReactNode}) {return <div className={s.empty} role="status"><p className={s.emptyTitle}>{title}</p><p>{description}</p>{action}</div>;}
export function Dialog({open,onClose,title,children,sheet=false}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;sheet?:boolean}) {
  const ref=useRef<HTMLDialogElement>(null), id=useId();
  const present=usePresence(open,designTokens.motion.fast);
  const [snapshot,setSnapshot]=useState({title,children});
  useEffect(()=>{if(open)setSnapshot({title,children});},[open,title,children]);
  useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(present&&!dialog.open)dialog.showModal();if(!present&&dialog.open)dialog.close();},[present]);
  useEffect(()=>{if(!present)return;if(scrollLocks++===0){originalOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}return()=>{if(--scrollLocks===0)document.body.style.overflow=originalOverflow;};},[present]);
  return <dialog ref={ref} className={`${s.dialog} ${sheet?s.sheet:''}`} data-state={open?'open':'closing'} aria-labelledby={id} onCancel={e=>{if(e.target!==e.currentTarget)return;e.preventDefault();if(open)onClose();}} onClose={()=>{if(open)onClose();}} onClickCapture={e=>{if(!open){e.preventDefault();e.stopPropagation();}}} onClick={e=>{if(e.target===e.currentTarget){const b=e.currentTarget.getBoundingClientRect();if(e.clientX<b.left || e.clientX>b.right || e.clientY<b.top || e.clientY>b.bottom)onClose();}}}><header><h2 id={id}>{open?title:snapshot.title}</h2><button type="button" className={s.iconButton} aria-label="닫기" onClick={onClose}>×</button></header>{open?children:present?snapshot.children:null}</dialog>;
}
export function Toast({message,onClose}:{message:string;onClose:()=>void}) {
  const present=usePresence(!!message,designTokens.motion.fast),[lastMessage,setLastMessage]=useState(message);
  const closeRef=useRef(onClose);
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(()=>{if(message)setLastMessage(message);},[message]);
  useEffect(()=>{if(!message)return;const timer=setTimeout(()=>closeRef.current(),toastDuration);return()=>clearTimeout(timer);},[message]);
  return <div role="status" aria-live="polite" aria-atomic="true">{present && <div className={s.toast} data-state={message?'open':'closing'}><span>{message||lastMessage}</span><button type="button" className={s.iconButton} aria-label="알림 닫기" disabled={!message} onClick={onClose}>×</button>{message && <div key={message} className={s.toastProgress} aria-hidden="true" style={{animationDuration:`${toastDuration}ms`}}/>}</div>}</div>;
}
