'use client';
import {useId,useState,type ReactNode} from 'react';
import s from './accordion.module.css';

/** Disclosure row that animates open/closed (grid-rows transition) instead of jumping like native <details>. */
export function AccordionItem({title,children,defaultOpen=false}:{title:ReactNode;children:ReactNode;defaultOpen?:boolean}){
  const [open,setOpen]=useState(defaultOpen),id=useId();
  return <div className={s.item} data-accordion-item data-open={open}>
    <button type="button" className={s.trigger} aria-expanded={open} aria-controls={`${id}-panel`} onClick={()=>setOpen(previous=>!previous)}><span>{title}</span><svg className={s.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
    <div id={`${id}-panel`} className={s.panel} role="region" aria-hidden={!open||undefined}><div className={s.panelInner}><div className={s.content}>{children}</div></div></div>
  </div>;
}
