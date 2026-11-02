'use client';
import Link from 'next/link';
import {useEffect,useId,useRef,useState} from 'react';
import {Dialog,Toast} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import type {AccountActionResult} from '@/types/crefans-account';
import {Action,Avatar,NavIcon} from './ServiceUI';
import s from './header-account-menu.module.css';

export function HeaderAccountMenu({viewer,basePath,routeKey,onLogout}:{viewer:{name:string;image?:string;position?:string};basePath:string;routeKey:string;onLogout:()=>Promise<AccountActionResult>}){
 const [open,setOpen]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useSnackbarMessage();
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),busy=useRef(false),id=useId();
 useEffect(()=>setOpen(false),[routeKey]);
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
  document.addEventListener('pointerdown',outside,true);
  return()=>document.removeEventListener('pointerdown',outside,true);
 },[open]);
 async function logout(){
  if(busy.current)return;busy.current=true;setPending(true);
  try{const result=await onLogout();setOpen(false);if(result.success)setNotice(result.data.message);else setError(result.errorMessage);}
  catch{setOpen(false);setError('로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.');}
  finally{busy.current=false;setPending(false);}
 }
 return <>
  <div ref={root} className={s.desktop} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setOpen(false);}} onKeyDown={event=>{if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();setOpen(false);trigger.current?.focus();}}}>
   <button ref={trigger} type="button" className={s.trigger} aria-label="계정 메뉴" aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>setOpen(value=>!value)}><Avatar creator={viewer} size={32}/><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
   {open&&<nav id={id} className={s.panel} aria-label="계정 메뉴">
    <Link href={`${basePath}/me`} onClick={()=>setOpen(false)}><NavIcon name="user"/>내 프로필</Link>
    <Link href={`${basePath}/settings`} onClick={()=>setOpen(false)}><NavIcon name="settings"/>설정</Link>
    <button type="button" className={s.logout} disabled={pending} aria-busy={pending||undefined} onClick={()=>void logout()}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 4H5v16h5M9 12h12m-4-4 4 4-4 4"/></svg>로그아웃</button>
   </nav>}
  </div>
  <Link className={s.mobile} aria-label={`${viewer.name} 내 프로필`} href={`${basePath}/me`}><Avatar creator={viewer} size={30}/></Link>
  <Dialog open={!!error} title="로그아웃하지 못했어요" onClose={()=>setError('')}><p>{error}</p><DialogActions><Action onClick={()=>setError('')}>확인</Action></DialogActions></Dialog>
  <Toast message={notice} onClose={()=>setNotice('')}/>
 </>;
}
