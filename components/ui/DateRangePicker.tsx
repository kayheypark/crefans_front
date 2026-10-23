'use client';

import {useEffect,useId,useRef,useState} from 'react';
import type {CSSProperties,KeyboardEvent} from 'react';
import {designTokens} from '@/lib/design/tokens';
import {Button} from './Primitives';
import {addDays,addMonths,buildDateRangePresets,calendarWeeks,dayTitle,formatRange,monthTitle,sameRange,startOfMonth,weekdayLabels,type DateRange} from './date-range';
import s from './date-range-picker.module.css';

export type DateRangeApplyResult={success:boolean;errorMessage?:string|null};
type Props={
  label:string;value:DateRange;defaultValue:DateRange;
  /** Latest selectable day; presets end here. */
  maxDate:string;
  /** Earliest recorded day for the "전체 기간" preset. */
  minDate?:string|null;
  onApply:(range:DateRange)=>Promise<DateRangeApplyResult>;
  disabled?:boolean;hideLabel?:boolean;id?:string;className?:string;
};
type Draft={start:string|null;end:string|null};
const WIDE_VIEWPORT=720;

export function DateRangePicker({label,value,defaultValue,maxDate,minDate=null,onApply,disabled=false,hideLabel=false,id,className=''}:Props){
  const uid=useId(),fieldId=id||uid,dialogId=`${fieldId}-dialog`;
  const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),popup=useRef<HTMLDivElement>(null);
  const [open,setOpen]=useState(false),[present,setPresent]=useState(false);
  const [draft,setDraft]=useState<Draft>({start:value.startDate,end:value.endDate});
  const [hover,setHover]=useState<string|null>(null),[view,setView]=useState(()=>startOfMonth(value.endDate));
  const [panels,setPanels]=useState(2),[position,setPosition]=useState<CSSProperties|null>(null);
  const [error,setError]=useState(''),[applying,setApplying]=useState(false),[focusDate,setFocusDate]=useState<string|null>(null);
  const presets=buildDateRangePresets(maxDate,minDate);
  const appliedPreset=presets.find(preset=>sameRange(preset.range,value));
  const complete=draft.start&&draft.end?{startDate:draft.start,endDate:draft.end}:null;
  const preview=draft.start&&!draft.end&&hover?{startDate:hover<draft.start?hover:draft.start,endDate:hover<draft.start?draft.start:hover}:complete;
  const months=Array.from({length:panels},(_,index)=>addMonths(view,index));
  const lastMonth=months[months.length-1];

  function show(){
    if(disabled)return;
    setDraft({start:value.startDate,end:value.endDate});setError('');setHover(null);
    const wide=typeof window==='undefined'||window.innerWidth>=WIDE_VIEWPORT;
    const count=wide?2:1;
    setPanels(count);setView(addMonths(startOfMonth(value.endDate),1-count));setFocusDate(value.startDate);
    setPosition(null);setPresent(true);setOpen(true);
  }
  function close(restoreFocus=false){setOpen(false);setHover(null);if(restoreFocus)trigger.current?.focus();}
  function reveal(range:DateRange){setView(addMonths(startOfMonth(range.endDate),1-panels));setFocusDate(range.startDate);}
  function choosePreset(range:DateRange){setDraft({start:range.startDate,end:range.endDate});setError('');reveal(range);}
  function pick(date:string){
    if(date>maxDate)return;
    setError('');
    setDraft(previous=>!previous.start||previous.end?{start:date,end:null}:date<previous.start?{start:date,end:previous.start}:{start:previous.start,end:date});
  }
  function reset(){choosePreset(defaultValue);}
  async function apply(){
    if(!complete){setError('시작일과 종료일을 모두 선택해 주세요.');return;}
    setApplying(true);setError('');
    try{
      const result=await onApply(complete);
      if(result.success)close(true);else setError(result.errorMessage||'기간을 적용하지 못했습니다. 다시 시도해 주세요.');
    }catch{setError('기간을 적용하지 못했습니다. 다시 시도해 주세요.');}
    finally{setApplying(false);}
  }
  function moveFocus(date:string){
    const clamped=date>maxDate?maxDate:date;
    if(clamped<view||clamped>addDays(addMonths(lastMonth,1),-1))setView(addMonths(startOfMonth(clamped),clamped<view?0:1-panels));
    setFocusDate(clamped);
  }
  function gridKeyDown(event:KeyboardEvent<HTMLElement>,date:string){
    const steps:Record<string,()=>string>={ArrowLeft:()=>addDays(date,-1),ArrowRight:()=>addDays(date,1),ArrowUp:()=>addDays(date,-7),ArrowDown:()=>addDays(date,7),PageUp:()=>addMonths(date,-1),PageDown:()=>addMonths(date,1),Home:()=>addDays(date,-((new Date(`${date}T00:00:00Z`).getUTCDay()+6)%7)),End:()=>addDays(date,6-((new Date(`${date}T00:00:00Z`).getUTCDay()+6)%7))};
    const step=steps[event.key];
    if(!step)return;
    event.preventDefault();moveFocus(step());
  }
  function popupKeyDown(event:KeyboardEvent<HTMLElement>){
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}
  }

  useEffect(()=>{if(open&&disabled)close();},[disabled,open]);
  useEffect(()=>{
    if(open||!present)return;
    const reduced=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer=setTimeout(()=>setPresent(false),reduced?0:designTokens.motion.fast);
    return()=>clearTimeout(timer);
  },[open,present]);
  useEffect(()=>{
    if(!open||!present||!focusDate)return;
    const button=popup.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]:not([data-outside=true])`)||popup.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`);
    button?.focus();
  },[open,present,focusDate,view]);
  useEffect(()=>{
    if(!open||!present||typeof window==='undefined')return;
    const menu=popup.current,button=trigger.current;
    if(!menu||!button)return;
    if(menu.showPopover&&!menu.matches(':popover-open'))menu.showPopover();
    function place(){
      if(!menu||!button)return;
      const viewport=window.visualViewport,width=viewport?.width||window.innerWidth,height=viewport?.height||window.innerHeight;
      const leftEdge=viewport?.offsetLeft||0,topEdge=viewport?.offsetTop||0;
      if(width<WIDE_VIEWPORT){setPosition({left:leftEdge+8,right:'auto',width:width-16,bottom:'auto',top:topEdge+8,maxHeight:height-16});return;}
      const rect=button.getBoundingClientRect(),menuWidth=Math.min(menu.offsetWidth||640,width-16),menuHeight=menu.offsetHeight||480;
      const below=topEdge+height-rect.bottom-14,above=rect.top-topEdge-14;
      const down=below>=menuHeight||below>=above;
      setPosition({left:Math.max(leftEdge+8,Math.min(rect.right-menuWidth,leftEdge+width-menuWidth-8)),top:down?rect.bottom+6:Math.max(topEdge+8,rect.top-Math.min(menuHeight,above)-6),maxHeight:Math.max(240,down?below:above)});
    }
    function outside(event:PointerEvent){const target=event.target as Node;if(!root.current?.contains(target)&&!menu?.contains(target))close();}
    place();
    document.addEventListener('pointerdown',outside,true);
    window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
    return()=>{
      document.removeEventListener('pointerdown',outside,true);
      window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);
      if(menu.hidePopover&&menu.matches(':popover-open'))menu.hidePopover();
    };
  },[open,present]);

  const status=preview?formatRange(preview):draft.start?`${dayTitle(draft.start)}부터 · 종료일을 선택해 주세요`:'시작일을 선택해 주세요';
  return <div ref={root} className={`${s.field} ${className}`}>
    <span id={`${fieldId}-label`} className={hideLabel?s.srOnly:s.label}>{label}</span>
    <button ref={trigger} type="button" id={fieldId} className={s.trigger} aria-haspopup="dialog" aria-expanded={open} aria-controls={present?dialogId:undefined} aria-labelledby={`${fieldId}-label ${fieldId}`} disabled={disabled} onClick={()=>open?close():show()}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>
      <span className={s.value}>{appliedPreset&&<b>{appliedPreset.label}</b>}{formatRange(value)}</span>
      <svg className={s.chevron} data-open={open} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    {present&&<div ref={popup} {...{popover:'manual'}} id={dialogId} role="dialog" aria-label={`${label} 선택`} className={s.popup} data-open={open} data-panels={panels} aria-hidden={!open||undefined} style={{...position,visibility:position?'visible':'hidden'}} onKeyDown={popupKeyDown}>
      <div className={s.presets} role="group" aria-label="기간 프리셋">{presets.map(preset=>{
        const active=!!preview&&sameRange(preset.range,preview);
        return <button key={preset.id} type="button" className={s.preset} aria-pressed={active} disabled={applying} onClick={()=>choosePreset(preset.range)}>{preset.label}</button>;
      })}</div>
      <div className={s.calendars}>
        <div className={s.monthNav}>
          <button type="button" className={s.navButton} aria-label="이전 달" disabled={applying} onClick={()=>setView(addMonths(view,-1))}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>
          <span className={s.monthRange}>{panels>1?`${monthTitle(view)} – ${monthTitle(lastMonth)}`:monthTitle(view)}</span>
          <button type="button" className={s.navButton} aria-label="다음 달" disabled={applying||addMonths(lastMonth,1)>maxDate} onClick={()=>setView(addMonths(view,1))}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button>
        </div>
        <div className={s.months} onMouseLeave={()=>setHover(null)}>{months.map(month=><table key={month} className={s.grid} role="grid" aria-label={monthTitle(month)}>
          <caption className={s.monthTitle}>{monthTitle(month)}</caption>
          <thead><tr>{weekdayLabels.map(day=><th key={day} scope="col" abbr={`${day}요일`}>{day}</th>)}</tr></thead>
          <tbody>{calendarWeeks(month).map((week,index)=><tr key={index}>{week.map(date=>{
            const outside=date.slice(0,7)!==month.slice(0,7),inRange=!!preview&&date>=preview.startDate&&date<=preview.endDate;
            const isStart=!!preview&&date===preview.startDate,isEnd=!!preview&&date===preview.endDate;
            const selected=date===draft.start||date===draft.end;
            return <td key={date} data-range={inRange||undefined} data-edge={isStart&&isEnd?'both':isStart?'start':isEnd?'end':undefined} data-outside={outside||undefined}>
              <button type="button" className={s.day} data-date={date} data-outside={outside||undefined} data-selected={selected||undefined} data-today={date===maxDate||undefined} tabIndex={date===focusDate?0:-1} aria-label={dayTitle(date)} aria-pressed={selected} disabled={applying||date>maxDate} onClick={()=>pick(date)} onMouseEnter={()=>setHover(date)} onFocus={()=>{setHover(date);setFocusDate(date);}} onKeyDown={event=>gridKeyDown(event,date)}>{Number(date.slice(8,10))}</button>
            </td>;
          })}</tr>)}</tbody>
        </table>)}</div>
      </div>
      <div className={s.footer}>
        <div className={s.selection}><span role="status">{status}</span>{error&&<p className={s.error} role="alert">{error}</p>}</div>
        <div className={s.actions}>
          <Button type="button" tone="quiet" disabled={applying} onClick={reset}>초기화</Button>
          <Button type="button" tone="secondary" disabled={applying} onClick={()=>close(true)}>취소</Button>
          <Button type="button" loading={applying} disabled={!complete} onClick={()=>void apply()}>적용</Button>
        </div>
      </div>
    </div>}
  </div>;
}
