'use client';
import {useEffect,useState} from 'react';
import Image from 'next/image';
import {Dialog} from '@/components/ui/Primitives';
import s from './guest-post-notice.module.css';

const storageKey='crefans.guest-post-notice.20261125.hide-until';
const tenMinutes=10*60*1000;

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
  try{localStorage.setItem(storageKey,String(Date.now()+tenMinutes));}catch{/* Storage may be disabled. */}
  setOpen(false);
 }
 return <Dialog open={open} onClose={()=>setOpen(false)} title="비회원 AI 체험 안내" className={s.notice}>
  <div className={s.visual} aria-hidden="true">{['gothic','mage','idol'].map(name=><div key={name}><Image src={'/illustrations/landing/ai-photo/thumb-'+name+'-v1.webp'} alt="" width={96} height={125}/></div>)}</div>
  <div className={s.copy}><small>비회원 AI 체험 안내</small><h3>하루가 지나도,<br/>피드에서 다시 만나요</h3>
   <p>여러분의 성원에 힘입어 비회원 AI 체험 게시물의 <strong>24시간 공개 제한을 해제할 예정이에요.</strong> 변경 후에는 체험 사진을 계속 공유하고, NSFW로 분류된 사진은 <strong>NSFW관에서 즐길 수 있어요.</strong></p>
   <button className={s.ok} type="button" onClick={()=>setOpen(false)}>확인했어요</button>
   <button className={s.snooze} type="button" onClick={snooze}>10분 동안 다시 보지 않기</button>
  </div>
 </Dialog>;
}
