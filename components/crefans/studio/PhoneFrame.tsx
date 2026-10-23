'use client';
import type {ReactNode} from 'react';
import s from './phone-frame.module.css';

/** Mobile device mockup used by studio previews. Wrap fan views in it; clicks inside are swallowed so previews never navigate. */
export function PhoneFrame({children,label='모바일 화면 미리보기',inert=false}:{children:ReactNode;label?:string;inert?:boolean}){
  return <div className={s.device} role="figure" aria-label={label}><span className={s.notch} aria-hidden="true"/><div className={s.screen} data-inert={inert||undefined} onClickCapture={inert?event=>{event.preventDefault();event.stopPropagation();}:undefined}>{children}</div></div>;
}
