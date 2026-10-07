'use client';
import {useEffect,useId,useRef} from 'react';
import {Field} from './Field';
import {Button} from './Primitives';
import s from './benefits-field.module.css';

type BenefitsFieldProps={label:string;value:string[];onChange:(value:string[])=>void;disabled?:boolean;readOnly?:boolean;error?:string;hint?:string};
export function BenefitsField({label,value,onChange,disabled=false,readOnly=false,error,hint}:BenefitsFieldProps){
 const id=useId(),ref=useRef<HTMLFieldSetElement>(null),focusAfterChange=useRef<number|null>(null);
 const locked=disabled||readOnly,help=error||hint;
 useEffect(()=>{
  const index=focusAfterChange.current;if(index===null)return;
  focusAfterChange.current=null;
  const inputs=ref.current?.querySelectorAll('input');
  if(inputs?.length)inputs[Math.min(index,inputs.length-1)]?.focus();else ref.current?.querySelector<HTMLButtonElement>('[data-add-benefit]')?.focus();
 },[value.length]);
 function add(){if(locked)return;focusAfterChange.current=value.length;onChange([...value,'']);}
 function remove(index:number){if(locked)return;focusAfterChange.current=index;onChange(value.filter((_,position)=>position!==index));}
 return <fieldset ref={ref} className={s.field} disabled={disabled} aria-describedby={help?`${id}-help`:undefined}>
  <legend>{label}</legend>
  {help&&<p id={`${id}-help`} className={error?s.error:s.hint} role={error?'alert':undefined}>{help}</p>}
  <div className={s.items}>
   {value.map((benefit,index)=><div className={s.item} key={index}><Field id={`${id}-${index}`} label={`${label} ${index+1}`} value={benefit} disabled={disabled} readOnly={readOnly} onChange={event=>{if(!locked)onChange(value.map((item,position)=>position===index?event.target.value:item));}}/><Button type="button" tone="quiet" disabled={locked} aria-label={`${label} ${index+1} 삭제`} onClick={()=>remove(index)}>삭제</Button></div>)}
  </div>
  {!value.length&&<p className={s.empty}>등록된 항목이 없습니다.</p>}
  <Button type="button" tone="secondary" className={s.add} data-add-benefit disabled={locked} aria-label={`${label} 추가`} onClick={add}><span aria-hidden="true">+</span> {label} 추가</Button>
 </fieldset>;
}
