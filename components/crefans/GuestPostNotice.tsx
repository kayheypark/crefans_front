'use client';
import {useEffect,useState} from 'react';
import Image from 'next/image';
import {Dialog} from '@/components/ui/Primitives';
import s from './guest-post-notice.module.css';

const storageKey='crefans.guest-post-notice.20261125.hide-until';
const snoozeMinutes=30;

export function GuestPostNotice(){
 const [open,setOpen]=useState(false);
 useEffect(()=>{
  try{setOpen(!(Number(localStorage.getItem(storageKey))>Date.now()));}
  catch{setOpen(true);}
  function sync(event:StorageEvent){if(event.key===storageKey&&Number(event.newValue)>Date.now())setOpen(false);}
  window.addEventListener('storage',sync);
  return ()=>window.removeEventListener('storage',sync);
 },[]);
 function snooze(){
  try{localStorage.setItem(storageKey,String(Date.now()+snoozeMinutes*60*1000));}catch{/* Storage may be disabled. */}
  setOpen(false);
 }
 return <Dialog open={open} onClose={()=>setOpen(false)} title="비회원 AI 체험 안내" className={s.notice}>
  <div className={s.visual} aria-hidden="true">{['gothic','mage','idol'].map(name=><div key={name}><Image src={'/illustrations/landing/ai-photo/thumb-'+name+'-v1.webp'} alt="" width={96} height={125}/></div>)}</div>
  <div className={s.copy}><small>비회원 AI 체험 안내</small><h3>하루가 지나도,<br/>피드에서 다시 만나요</h3>
   <p>여러분의 성원에 힘입어 새로 올리는 비회원 AI 체험 게시물은 <strong>피드에서 계속 볼 수 있어요.</strong> NSFW로 분류된 사진은 <strong>NSFW관에서 즐길 수 있어요.</strong></p>
   <button className={s.ok} type="button" onClick={()=>setOpen(false)}>확인했어요</button>
   <button className={s.snooze} type="button" onClick={snooze}>{snoozeMinutes}분 동안 보지 않기</button>
  </div>
 </Dialog>;
}
