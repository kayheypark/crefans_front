'use client';
import {Dialog} from '@/components/ui/Primitives';
import {Action} from '@/components/crefans/ServiceUI';
import s from './guest-claim.module.css';

export type GuestClaimPrompt={posts:number;busy:boolean;accept:()=>Promise<void>;decline:()=>void}|null;
// 2026-11-16 user decision: after signing in on the browser that made trial posts, the member chooses whether to link them.
// Server behaviour (GuestService.claim): posts and photos move to the account; posts older than 24 hours stay private.
export function GuestClaimDialog({claim}:{claim:GuestClaimPrompt}){
 return <Dialog open={!!claim} onClose={()=>{if(claim&&!claim.busy)claim.decline();}} title="체험 게시물 연동">
  {claim&&<div className={s.body}>
   {/* eslint-disable-next-line @next/next/no-img-element -- static illustration */}
   <img className={s.art} src="/illustrations/try/link-v3.webp" alt="" width={112} height={112}/>
   <h3 className={s.headline}>로그인 전에 올린 게시물 <strong>{claim.posts}개</strong>를<br/>내 계정에 연동할까요?</h3>
   <ul className={s.points}>
    <li>연동하면 내 프로필 게시물로 옮겨지고, 직접 수정·삭제할 수 있어요.</li>
    <li>올린 지 24시간이 지난 게시물은 비공개로 옮겨져요.</li>
    <li>연동하지 않으면 익명 체험 게시물로 남고, 24시간 뒤 비공개돼요.</li>
   </ul>
   <div className={s.actions}>
    <Action className={s.primary} disabled={claim.busy} onClick={()=>void claim.accept()}>{claim.busy?'연동하는 중…':'내 계정에 연동하기'}</Action>
    <button type="button" className={s.secondary} disabled={claim.busy} onClick={claim.decline}>연동하지 않을게요</button>
   </div>
  </div>}
 </Dialog>;
}
