'use client';

import {useEffect, useId, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent} from 'react';
import {designTokens} from '@/lib/design/tokens';
import s from './select.module.css';

export type SelectOption = {value:string;label:string;disabled?:boolean};
type CommonProps = {
  options:SelectOption[];label:string;searchable?:boolean;selectAll?:boolean;
  placeholder?:string;disabled?:boolean;readOnly?:boolean;error?:string;hint?:string;
  required?:boolean;id?:string;name?:string;hideLabel?:boolean;className?:string;
};
type SelectFieldProps = CommonProps & (
  {multiple?:false;value:string;onChange:(value:string)=>void} |
  {multiple:true;value:string[];onChange:(value:string[])=>void}
);

export function SelectField(props:SelectFieldProps){
  const {options,label,searchable=false,selectAll=false,placeholder='선택해 주세요',disabled=false,readOnly=false,error,hint,required,id,name,hideLabel=false,className=''}=props;
  const uid=useId(), fieldId=id||uid, listId=`${fieldId}-options`;
  const root=useRef<HTMLDivElement>(null), trigger=useRef<HTMLButtonElement>(null);
  const popup=useRef<HTMLDivElement>(null), search=useRef<HTMLInputElement>(null);
  const [open,setOpen]=useState(false), [present,setPresent]=useState(false);
  const [query,setQuery]=useState(''), [active,setActive]=useState<string|null>(null);
  const [position,setPosition]=useState<CSSProperties|null>(null);
  const selected=props.multiple?props.value:[props.value];
  const visible=options.filter(option=>option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const enabled=visible.filter(option=>!option.disabled);
  const selectedOptions=options.filter(option=>selected.includes(option.value));
  const allSelected=enabled.length>0&&enabled.every(option=>selected.includes(option.value));
  const activeIndex=visible.findIndex(option=>option.value===active&&!option.disabled);
  const activeId=open&&activeIndex>=0?`${listId}-${activeIndex}`:undefined;

  function close(restoreFocus=false){
    setOpen(false);
    if(restoreFocus)trigger.current?.focus();
  }
  function show(last=false){
    if(disabled||readOnly)return;
    setQuery('');
    const available=options.filter(option=>!option.disabled);
    const chosen=available.find(option=>selected.includes(option.value));
    setActive(chosen?.value??(last?available.at(-1)?.value:available[0]?.value)??null);
    setPosition(null);setPresent(true);setOpen(true);
  }
  function choose(option:SelectOption){
    if(disabled||readOnly||option.disabled)return;
    if(props.multiple){
      props.onChange(props.value.includes(option.value)?props.value.filter(value=>value!==option.value):[...props.value,option.value]);
    }else{
      props.onChange(option.value);close(true);
    }
  }
  function toggleAll(){
    if(!props.multiple||disabled||readOnly||!enabled.length)return;
    const values=enabled.map(option=>option.value);
    props.onChange(allSelected?props.value.filter(value=>!values.includes(value)):[...props.value,...values.filter(value=>!props.value.includes(value))]);
  }
  function keyDown(event:KeyboardEvent<HTMLElement>){
    if(disabled||readOnly)return;
    if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();close(true);return;}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='a'&&open&&props.multiple&&selectAll&&event.target!==search.current){event.preventDefault();toggleAll();return;}
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
      event.preventDefault();
      if(!open){
        show(event.key==='ArrowUp'||event.key==='End');
        if(event.key==='Home'||event.key==='End'){
          const available=options.filter(option=>!option.disabled);
          setActive((event.key==='Home'?available[0]:available.at(-1))?.value??null);
        }
        return;
      }
      const index=enabled.findIndex(option=>option.value===active);
      const next=event.key==='Home'?0:event.key==='End'?enabled.length-1:event.key==='ArrowDown'?Math.min(index+1,enabled.length-1):Math.max(index-1,0);
      setActive(enabled[next]?.value??null);return;
    }
    if(event.key==='Enter'||(event.key===' '&&event.target!==search.current)){
      event.preventDefault();
      if(!open)show();else if(activeIndex>=0)choose(visible[activeIndex]);
    }
  }

  useEffect(()=>{
    if(!open||(!disabled&&!readOnly))return;
    setOpen(false);
  },[disabled,readOnly,open]);
  useEffect(()=>{
    if(open||!present)return;
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer=window.setTimeout(()=>setPresent(false),reduced?0:designTokens.motion.fast);
    return()=>window.clearTimeout(timer);
  },[open,present]);
  useEffect(()=>{
    if(!open)return;
    if(!enabled.some(option=>option.value===active))setActive(enabled[0]?.value??null);
  },[open,query,options,active]);
  useEffect(()=>{
    if(!open||!present)return;
    const menu=popup.current, button=trigger.current;
    if(!menu||!button)return;
    if(menu.showPopover&&!menu.matches(':popover-open'))menu.showPopover();
    function place(){
      if(!menu||!button)return;
      const rect=button.getBoundingClientRect(), viewport=window.visualViewport;
      const leftEdge=viewport?.offsetLeft||0, topEdge=viewport?.offsetTop||0;
      const width=viewport?.width||window.innerWidth, height=viewport?.height||window.innerHeight;
      const below=topEdge+height-rect.bottom-14, above=rect.top-topEdge-14;
      const down=below>=Math.min(menu.scrollHeight,260)||below>=above;
      const maxHeight=Math.max(64,Math.min(360,down?below:above));
      const menuWidth=Math.min(Math.max(rect.width,240),width-16);
      setPosition({left:Math.max(leftEdge+8,Math.min(rect.left,leftEdge+width-menuWidth-8)),top:down?rect.bottom+6:Math.max(topEdge+8,rect.top-Math.min(menu.scrollHeight,maxHeight)-6),width:menuWidth,maxHeight});
    }
    function outside(event:PointerEvent){
      const target=event.target as Node;
      if(!root.current?.contains(target)&&!menu?.contains(target))close();
    }
    function scroll(event:Event){if(!menu?.contains(event.target as Node))place();}
    place();
    const frame=window.requestAnimationFrame(()=>{if(searchable)search.current?.focus();});
    document.addEventListener('pointerdown',outside,true);
    window.addEventListener('resize',place);window.addEventListener('scroll',scroll,true);
    window.visualViewport?.addEventListener('resize',place);
    return()=>{
      window.cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown',outside,true);
      window.removeEventListener('resize',place);window.removeEventListener('scroll',scroll,true);
      window.visualViewport?.removeEventListener('resize',place);
    };
  },[open,present,searchable,query,options]);
  useEffect(()=>{
    if(activeId)document.getElementById(activeId)?.scrollIntoView({block:'nearest'});
  },[activeId]);

  return <div ref={root} className={`${s.field} ${className}`} data-select="root" onBlur={event=>{if(open&&!root.current?.contains(event.relatedTarget as Node))close();}}>
    <label className={hideLabel?s.srOnly:s.label} htmlFor={fieldId}>{label}{required&&<span aria-hidden="true"> *</span>}</label>
    <button ref={trigger} id={fieldId} type="button" role="combobox" className={s.trigger} data-select="trigger"
      disabled={disabled} aria-readonly={readOnly||undefined} aria-required={required||undefined}
      aria-expanded={open} aria-controls={listId} aria-haspopup="listbox" aria-activedescendant={!searchable?activeId:undefined}
      aria-invalid={!!error} aria-describedby={error||hint?`${fieldId}-help`:undefined}
      onClick={()=>open?close():show()} onKeyDown={keyDown}>
      <span className={`${s.value} ${!selectedOptions.length?s.placeholder:''}`}>{selectedOptions.length?selectedOptions.map(option=>option.label).join(', '):placeholder}</span>
      {props.multiple&&selectedOptions.length>1&&<span className={s.count} aria-hidden="true">{selectedOptions.length}</span>}
      <svg className={s.chevron} data-open={open} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    {name&&(props.multiple?props.value:[props.value]).map((value,index)=><input key={`${value}-${index}`} type="hidden" name={name} value={value} disabled={disabled}/>)}
    {(error||hint)&&<small id={`${fieldId}-help`} className={error?s.error:s.hint}>{error||hint}</small>}
    {present&&<div ref={popup} {...{popover:'manual'}} className={s.popup} data-select="popup" data-open={open} aria-hidden={!open||undefined} style={{...position,visibility:position?'visible':'hidden'}} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}}}>
      <div className={s.toolbar}><span>{props.multiple?`${selectedOptions.length}개 선택`:label}</span><button type="button" disabled={!open} aria-label="선택 목록 닫기" onClick={()=>close(true)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
      {searchable&&<input ref={search} className={s.search} type="search" role="searchbox" aria-label={`${label} 검색`} aria-controls={listId} aria-activedescendant={activeId} value={query} placeholder="검색어를 입력하세요" autoComplete="off" disabled={!open} onKeyDown={keyDown} onChange={event=>setQuery(event.target.value)}/>}
      {props.multiple&&selectAll&&<button className={s.selectAll} type="button" disabled={!open||!enabled.length} aria-keyshortcuts="Control+A Meta+A" onPointerDown={event=>event.preventDefault()} onClick={toggleAll}>{allSelected?'전체 선택 해제':query.trim()?'검색 결과 전체 선택':'전체 선택'}<span>{enabled.length}개</span></button>}
      <div className={s.list} id={listId} role="listbox" aria-label={label} aria-multiselectable={props.multiple||undefined}>
        {visible.map((option,index)=><div key={option.value} id={`${listId}-${index}`} className={s.option} role="option" aria-selected={selected.includes(option.value)} aria-disabled={option.disabled||undefined} data-active={active===option.value&&!option.disabled} onPointerMove={()=>{if(!option.disabled)setActive(option.value);}} onPointerDown={event=>event.preventDefault()} onClick={()=>choose(option)}>
          {props.multiple&&<span className={s.check} aria-hidden="true" data-checked={selected.includes(option.value)}>{selected.includes(option.value)&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6"/></svg>}</span>}
          <span>{option.label}</span>
          {!props.multiple&&selected.includes(option.value)&&<svg className={s.selectedIcon} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>}
        </div>)}
        {!visible.length&&<div className={s.empty} role="status">{query.trim()?'검색 결과가 없습니다.':'선택할 항목이 없습니다.'}</div>}
      </div>
    </div>}
  </div>;
}
