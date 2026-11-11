'use client';

import {useEffect,useId,useRef,type ReactNode} from 'react';
import type {PinPad as PinPadState} from '@/hooks/usePinPad';
import {TextLink} from './TextLink';
import s from './pin-pad.module.css';

export type PinPadProps={
  pad:PinPadState;
  /** What the PIN is for, e.g. "출금 PIN 입력". Read first by screen readers. */
  title:string;
  /** Small line above the title, e.g. the creator name or a step ("한 번 더 입력"). */
  eyebrow?:ReactNode;
  hint?:ReactNode;
  error?:string;
  busy?:boolean;
  /** Content between the dots and the keypad, e.g. a summary or a link. */
  children?:ReactNode;
  /** Where "PIN을 잊으셨나요?" leads (the PIN reset page). Shown on confirmation pads, not on the setup pad. */
  resetHref?:string;
  autoFocus?:boolean;
  className?:string;
};

/**
 * Six-dot PIN entry with a shuffled on-screen keypad (2026-11-11). The keypad is the main input on phones; on PC the
 * focused pad also accepts number keys, Backspace and Delete. Pair it with `usePinPad`, which owns the value and order.
 * Layout (design C, 2026-11-11): header, dots and summary, then a light hairline keypad; edge to edge inside a dialog
 * (phone bottom sheet via `Dialog sheet`, PC card) and a bordered block inline on a page.
 */
export function PinPad({pad,title,eyebrow,hint,error,busy=false,children,resetHref,autoFocus=true,className=''}:PinPadProps){
  const root=useRef<HTMLDivElement>(null),titleId=useId(),statusId=useId(),locked=pad.disabled||busy;
  useEffect(()=>{if(autoFocus)root.current?.focus({preventScroll:true});},[autoFocus]);
  // PC keyboard: a dialog moves focus to its title after opening, so listen on the document and accept keys pressed
  // anywhere inside the same dialog (or page, when the pad is inline) except in editable fields.
  const {onKeyDown}=pad;
  useEffect(()=>{
    const node=root.current;if(!node||locked)return;
    const scope=node.closest('dialog')??node.ownerDocument.body;
    const listener=(event:globalThis.KeyboardEvent)=>{
      const target=event.target as HTMLElement|null;
      if(event.defaultPrevented||!target||!scope.contains(target)||target.closest('input,textarea,select,[contenteditable="true"]'))return;
      if(scope===node.ownerDocument.body&&target.closest('dialog'))return;
      onKeyDown(event);
    };
    node.ownerDocument.addEventListener('keydown',listener);return()=>node.ownerDocument.removeEventListener('keydown',listener);
  },[locked,onKeyDown]);
  const keys=[...pad.layout.slice(0,9),'clear',pad.layout[9],'back'];
  return <div ref={root} className={`${s.pad} ${className}`} role="group" aria-labelledby={titleId} aria-describedby={statusId} tabIndex={-1} data-busy={busy||undefined}>
    <div className={s.head}>
      {eyebrow&&<p className={s.eyebrow}>{eyebrow}</p>}
      <p id={titleId} className={s.title}>{title}</p>
      <div className={s.dots} aria-hidden="true">{Array.from({length:pad.length},(_,i)=><span key={i} data-filled={i<pad.value.length||undefined}/>)}</div>
      <p id={statusId} className={s.status} aria-live="polite">{busy?'확인하고 있어요':`${pad.length}자리 중 ${pad.value.length}자리 입력`}</p>
      {error?<p className={s.error} role="alert">{error}</p>:hint&&<p className={s.hint}>{hint}</p>}
      {resetHref&&<TextLink className={s.reset} href={resetHref}>PIN을 잊으셨나요?</TextLink>}
    </div>
    {children&&<div className={s.extra}>{children}</div>}
    <div className={s.keypad}>
      {keys.map((key,i)=>key==='clear'?<button key="clear" type="button" className={s.word} disabled={locked||!pad.value} onClick={pad.clear}>전체삭제</button>
        :key==='back'?<button key="back" type="button" className={s.word} disabled={locked||!pad.value} onClick={pad.backspace} aria-label="한 자리 지우기"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d="M8.5 5H20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8.5L3 12l5.5-7Z"/><path d="m11 9.5 5 5m0-5-5 5"/></svg></button>
        :<button key={`d${i}`} type="button" className={s.digit} disabled={locked||pad.complete} onClick={()=>pad.press(key)}>{key}</button>)}
    </div>
  </div>;
}
