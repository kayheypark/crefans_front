'use client';
import type {InputHTMLAttributes,ReactNode} from 'react';
import s from './choice.module.css';

type ChoiceProps=Omit<InputHTMLAttributes<HTMLInputElement>,'type'|'checked'|'onChange'>&{label:ReactNode;description?:ReactNode;checked:boolean;onChange:(checked:boolean)=>void};

/** Native checkbox/radio inputs drawn with design tokens so agreements and option pickers look the same everywhere. */
function Choice({kind,label,description,checked,onChange,disabled,className='',...props}:ChoiceProps&{kind:'checkbox'|'radio'}){
  return <label className={`${s.choice} ${className}`.trim()} data-disabled={disabled||undefined}>
    <input {...props} type={kind} checked={checked} disabled={disabled} onChange={event=>onChange(event.target.checked)}/>
    <span className={s.text}><span>{label}</span>{description&&<small className={s.description}>{description}</small>}</span>
  </label>;
}
export function Checkbox(props:ChoiceProps){return <Choice kind="checkbox" {...props}/>;}
/** Group radios with a shared `name`; `checked` reflects whether this option is the selected one. */
export function Radio(props:ChoiceProps){return <Choice kind="radio" {...props}/>;}
