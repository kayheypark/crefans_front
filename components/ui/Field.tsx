'use client';
import {useId,useState} from 'react';
import type {InputHTMLAttributes,TextareaHTMLAttributes,ReactNode} from 'react';
import s from './field.module.css';

type FieldText={label:string;error?:string;hint?:string};
export type FieldProps=Omit<InputHTMLAttributes<HTMLInputElement>,'prefix'> & FieldText & {
  prefix?:ReactNode;
  suffix?:ReactNode;
  clearable?:boolean;
  onClear?:()=>void;
  showPasswordToggle?:boolean;
};
export type TextAreaFieldProps=TextareaHTMLAttributes<HTMLTextAreaElement> & FieldText & {showCount?:boolean};

function FieldIcon({name}:{name:'search'|'clear'|'show'|'hide'}){
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name==='search'?<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>:name==='clear'?<path d="m7 7 10 10M17 7 7 17"/>:<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{name==='hide'&&<path d="m3 3 18 18"/>}</>}</svg>;
}

export function Field({label,error,hint,prefix,suffix,clearable=false,onClear,showPasswordToggle=false,type='text',id:providedId,value,defaultValue,onChange,disabled,readOnly,'aria-describedby':describedBy,'aria-invalid':invalid,...props}:FieldProps){
  const uid=useId(),id=providedId||uid;
  const [uncontrolledValue,setUncontrolledValue]=useState(()=>String(defaultValue??''));
  const [passwordVisible,setPasswordVisible]=useState(false);
  const currentValue=value===undefined?uncontrolledValue:String(value);
  const help=error||hint,helpId=help?`${id}-help`:undefined;
  const description=[describedBy,helpId].filter(Boolean).join(' ')||undefined;
  const leading=prefix??(type==='search'?<FieldIcon name="search"/>:null);
  return <div className={s.field} data-field="input">
    <label htmlFor={id}>{label}{props.required&&<span aria-hidden="true"> *</span>}</label>
    <div className={s.control} data-disabled={disabled||undefined} data-readonly={readOnly||undefined} data-invalid={!!error||invalid===true||invalid==='true'||undefined}>
      {leading!=null&&<span className={s.adornment}>{leading}</span>}
      <input {...props} id={id} type={type==='password'&&showPasswordToggle&&passwordVisible?'text':type} value={value} defaultValue={defaultValue} disabled={disabled} readOnly={readOnly} aria-invalid={error?true:invalid} aria-describedby={description} onChange={event=>{if(value===undefined)setUncontrolledValue(event.target.value);onChange?.(event);}}/>
      {suffix!=null&&<span className={s.adornment}>{suffix}</span>}
      {clearable&&onClear&&currentValue.length>0&&<button type="button" className={s.action} aria-label={`${label} 지우기`} disabled={disabled||readOnly} onClick={()=>{if(!disabled&&!readOnly)onClear();}}><FieldIcon name="clear"/></button>}
      {type==='password'&&showPasswordToggle&&<button type="button" className={s.action} aria-label={passwordVisible?'비밀번호 숨기기':'비밀번호 보기'} aria-pressed={passwordVisible} disabled={disabled||readOnly} onClick={()=>{if(!disabled&&!readOnly)setPasswordVisible(visible=>!visible);}}><FieldIcon name={passwordVisible?'hide':'show'}/></button>}
    </div>
    {help&&<small id={helpId} className={error?s.error:undefined} role={error?'alert':undefined}>{help}</small>}
  </div>;
}

export function TextAreaField({label,error,hint,showCount=false,id:providedId,value,defaultValue,onChange,disabled,readOnly,maxLength,'aria-describedby':describedBy,'aria-invalid':invalid,...props}:TextAreaFieldProps){
  const uid=useId(),id=providedId||uid;
  const [uncontrolledValue,setUncontrolledValue]=useState(()=>String(defaultValue??''));
  const currentValue=value===undefined?uncontrolledValue:String(value);
  const help=error||hint,helpId=help?`${id}-help`:undefined,countId=showCount?`${id}-count`:undefined;
  const description=[describedBy,helpId,countId].filter(Boolean).join(' ')||undefined;
  return <div className={s.field} data-field="textarea">
    <label htmlFor={id}>{label}{props.required&&<span aria-hidden="true"> *</span>}</label>
    <textarea {...props} id={id} value={value} defaultValue={defaultValue} maxLength={maxLength} disabled={disabled} readOnly={readOnly} aria-invalid={error?true:invalid} aria-describedby={description} onChange={event=>{if(value===undefined)setUncontrolledValue(event.target.value);onChange?.(event);}}/>
    {(help||showCount)&&<div className={s.footer}>{help&&<small id={helpId} className={error?s.error:undefined} role={error?'alert':undefined}>{help}</small>}{showCount&&<small id={countId} className={s.count}>{currentValue.length}{maxLength!==undefined?` / ${maxLength}`:''}</small>}</div>}
  </div>;
}
