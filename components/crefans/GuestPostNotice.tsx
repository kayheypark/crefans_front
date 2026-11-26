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
 return <Dialog open={open} onClose={()=>setOpen(false)} title="커뮤니티 운영 안내" className={s.notice}>
  <div className={s.hero}>
   <div><small>커뮤니티 운영 안내</small><h3>모두가 편안한<br/>피드를 위해</h3></div>
   <Image src="/brand/ai-photo/unsafe-input-v1.webp" alt="" width={96} height={96}/>
  </div>
  <div className={s.copy}>
   <p>크레팬스는 게시물을 지속적으로 모니터링하고, 운영정책을 위반한 게시물의 노출을 차단합니다.</p>
   <p>이용 중 부적절한 게시물을 발견하면 게시물의 <strong>더보기(···) → 신고</strong>를 눌러 주세요. 운영팀이 확인하겠습니다.</p>
  </div>
  <button className={s.ok} type="button" onClick={()=>setOpen(false)}>확인했어요</button>
  <button className={s.snooze} type="button" onClick={snooze}>{snoozeMinutes}분 동안 보지 않기</button>
 </Dialog>;
}
