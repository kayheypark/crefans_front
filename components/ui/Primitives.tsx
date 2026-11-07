"use client";
import {MarqueeText} from '@/components/ui/MarqueeText';
import { useEffect, useId, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import {designTokens} from '@/lib/design/tokens';
export {Toast} from './Toast';
import {usePresence} from './usePresence';
import {EmptyIllustration} from './EmptyIllustration';
import s from './ui.module.css';
export {Field,TextAreaField} from './Field';
export {SelectField} from './SelectField';
let scrollLocks=0;
let originalOverflow='';

export function Button({tone='brand', loading=false, children, className='', disabled, ...props}: ButtonHTMLAttributes<HTMLButtonElement> & {tone?:'brand'|'secondary'|'quiet'|'danger';loading?:boolean}) {
  return <button {...props} disabled={disabled || loading} aria-busy={loading || undefined} className={`${s.button} ${s[tone]} ${className}`}>{loading && <span className={s.spinner} aria-hidden="true" />}{children}</button>;
}
export function Chip({selected=false,children,onClick,icon}: {selected?:boolean;children:ReactNode;onClick?:()=>void;icon?:ReactNode}) {
  return <button type="button" className={`${s.chip}${icon?` ${s.chipWithIcon}`:''}`} aria-pressed={selected} onClick={onClick}>{icon&&<span className={s.chipIcon} aria-hidden="true">{icon}</span>}{children}</button>;
}
/** `outline` is a small bordered gray label (e.g. AD); `label` gives it a spoken name when the visible text is an abbreviation. */
export function Badge({children,tone='brand',label}:{children:ReactNode;tone?:'brand'|'success'|'danger'|'outline';label?:string}) {return <span className={s.badge} data-tone={tone} {...(label?{role:'img','aria-label':label,title:label}:{})}>{children}</span>;}
export function EmptyState({title,description,action}:{title:string;description:string;action?:ReactNode}) {return <div className={s.empty} role="status"><EmptyIllustration/><p className={s.emptyTitle}>{title}</p><p>{description}</p>{action}</div>;}
export function Dialog({open,onClose,title,children,sheet=false,illustration}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;sheet?:boolean;illustration?:ReactNode}) {
  const ref=useRef<HTMLDialogElement>(null), titleRef=useRef<HTMLHeadingElement>(null), id=useId();
  const present=usePresence(open,designTokens.motion.fast);
  const [snapshot,setSnapshot]=useState({title,children});
  useEffect(()=>{if(open)setSnapshot({title,children});},[open,title,children]);
  useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(present&&!dialog.open)dialog.showModal();if(open)titleRef.current?.focus({preventScroll:true});if(!present&&dialog.open)dialog.close();},[open,present]);
  useEffect(()=>{if(!present)return;if(scrollLocks++===0){originalOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}return()=>{if(--scrollLocks===0)document.body.style.overflow=originalOverflow;};},[present]);
  function keepFocus(event:KeyboardEvent<HTMLDialogElement>){
    const dialog=event.currentTarget;
    if(event.key!=='Tab'||(event.target as HTMLElement).closest('dialog')!==dialog)return;
    const items=Array.from(dialog.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,[tabindex]')).filter(item=>item.tabIndex>=0&&!item.matches(':disabled')&&item.getClientRects().length>0&&item.closest('dialog')===dialog);
    event.preventDefault();
    if(!items.length){titleRef.current?.focus();return;}
    const current=items.indexOf(document.activeElement as HTMLElement);
    const next=current<0?(event.shiftKey?items.length-1:0):(current+(event.shiftKey?-1:1)+items.length)%items.length;
    items[next].focus();
  }
  return <dialog ref={ref} className={`${s.dialog} ${sheet?s.sheet:''} ${illustration?s.illustratedDialog:''}`} data-state={open?'open':'closing'} aria-labelledby={id} onKeyDown={keepFocus} onCancel={e=>{if(e.target!==e.currentTarget)return;e.preventDefault();if(open)onClose();}} onClose={()=>{if(open)onClose();}} onClickCapture={e=>{if(!open){e.preventDefault();e.stopPropagation();}}} onClick={e=>{if(e.target===e.currentTarget){const b=e.currentTarget.getBoundingClientRect();if(e.clientX<b.left || e.clientX>b.right || e.clientY<b.top || e.clientY>b.bottom)onClose();}}}><header>{illustration&&<div className={s.dialogIllustration} aria-hidden="true">{illustration}</div>}<h2 ref={titleRef} id={id} tabIndex={-1}><MarqueeText text={open?title:snapshot.title}/></h2><button type="button" className={`${s.iconButton} ${s.dialogClose}`} aria-label="닫기" onClick={onClose}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="m5 5 14 14M5 19 19 5"/></svg></button></header>{open?children:present?snapshot.children:null}</dialog>;
}
