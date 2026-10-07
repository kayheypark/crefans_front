'use client';
import {Button} from './Primitives';
import s from './amount-presets.module.css';

type Props={
  value:string;
  onChange:(value:string)=>void;
  availableAmount:number;
  presets:readonly {label:string;amount:number}[];
  disabled?:boolean;
  hint?:string;
};

export function AmountPresets({value,onChange,availableAmount,presets,disabled=false,hint}:Props){
  const current=value.trim()===''?0:Number(value);
  const validBalance=Number.isSafeInteger(availableAmount)&&availableAmount>=0;
  const validValue=Number.isSafeInteger(current)&&current>=0;
  const adjust=(amount:number)=>{
    if(disabled||!validBalance||!validValue||!Number.isSafeInteger(amount)||amount<=0)return;
    const next=amount>=availableAmount-current?availableAmount:current+amount;
    onChange(String(next));
  };
  return <div className={s.root} role="group" aria-label="금액 빠른 입력">
    <div className={s.toolbar}><Button className={s.control} type="button" tone="quiet" disabled={disabled} onClick={()=>{if(!disabled)onChange('');}}>초기화</Button></div>
    <div className={s.presets}>{presets.map(preset=><Button className={s.control} key={preset.amount} type="button" tone="secondary" disabled={disabled||!validBalance||!validValue||!Number.isSafeInteger(preset.amount)||preset.amount<=0} aria-label={`${preset.label}원 더하기`} onClick={()=>adjust(preset.amount)}>+ {preset.label}</Button>)}<Button className={s.control} type="button" tone="secondary" disabled={disabled||!validBalance} onClick={()=>{if(!disabled&&validBalance)onChange(String(availableAmount));}}>전액</Button></div>
    {hint&&<p className={s.hint}>{hint}</p>}
  </div>;
}
