'use client';

import {useLayoutEffect,useRef} from 'react';
import s from './loading-spinner.module.css';

export function LoadingProgressDialog({label}:{label:string}){
 const ref=useRef<HTMLDialogElement>(null);
 useLayoutEffect(()=>{
  const dialog=ref.current;
  dialog?.showModal();
  return ()=>dialog?.close();
 },[]);
 return <dialog ref={ref} className={s.progressDialog} aria-label={label} onCancel={event=>event.preventDefault()}>
  <span role="status">{label}</span>
  <progress aria-label={label}/>
 </dialog>;
}
