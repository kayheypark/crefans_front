'use client';

import type {InputHTMLAttributes} from 'react';
import {Field} from './Field';
import s from './pin-field.module.css';

export type PinFieldProps=Pick<InputHTMLAttributes<HTMLInputElement>,'id'|'name'|'disabled'|'readOnly'|'required'|'autoFocus'|'autoComplete'> & {
  label:string;
  value:string;
  onChange:(value:string)=>void;
  error?:string;
  hint?:string;
};

export function PinField({label,value,onChange,error,hint,disabled,readOnly,autoComplete='off',...props}:PinFieldProps){
  return <Field {...props} label={label} value={value} onChange={event=>{if(!disabled&&!readOnly)onChange(event.target.value.replace(/\D/g,'').slice(0,6));}} type="password" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete={autoComplete} spellCheck={false} disabled={disabled} readOnly={readOnly} error={error} hint={hint} className={s.input} placeholder="숫자 6자리"/>;
}
