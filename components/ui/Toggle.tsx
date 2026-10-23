'use client';
import s from './toggle.module.css';
export function Toggle({label,description,checked,onChange,disabled=false}:{label:string;description?:string;checked:boolean;onChange:(value:boolean)=>void;disabled?:boolean}){
  return <label className={s.toggle}><span><strong>{label}</strong>{description&&<small>{description}</small>}</span><input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={event=>onChange(event.target.checked)}/></label>;
}
