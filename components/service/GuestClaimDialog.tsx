'use client';
import {Dialog} from '@/components/ui/Primitives';
import {Action} from '@/components/crefans/ServiceUI';
import s from './guest-claim.module.css';

export type GuestClaimPrompt={posts:number;/** 2026-11-23: photos in the trial draft not yet posted (present only when a draft exists). */draftPhotos?:number;busy:boolean;accept:()=>Promise<boolean|void>;decline:()=>void}|null;
// 2026-11-16 user decision: after signing in on the browser that made trial posts, the member chooses whether to link them.
// Server behaviour (GuestService.claim): posts and photos move to the account; posts older than 24 hours stay private.
// 2026-11-23 user request (C 테스트): a visitor who signed up while still writing in the trial is asked to bring that draft along;
// after linking, onDraftLinked opens the post editor where it continues.
export function GuestClaimDialog({claim,onDraftLinked}:{claim:GuestClaimPrompt;onDraftLinked?:()=>void}){
 const draft=claim?.draftPhotos!==undefined,draftOnly=draft&&!claim?.posts;
 async function accept(){if(!claim)return;const linked=await claim.accept();if(linked&&draft)onDraftLinked?.();}
 return <Dialog open={!!claim} onClose={()=>{if(claim&&!claim.busy)claim.decline();}} title={draftOnly?'체험 내용 가져오기':'체험 게시물 연동'}>
  {claim&&draftOnly&&<div className={s.body}>
   {/* eslint-disable-next-line @next/next/no-img-element -- static illustration */}
   <img className={s.art} src="/illustrations/try/link-v3.webp" alt="" width={112} height={112}/>
   <h3 className={s.headline}>로그인 전에 작성하던 글{claim.draftPhotos?<>과 사진 <strong>{claim.draftPhotos}장</strong></>:''}을<br/>내 계정으로 가져올까요?</h3>
   <ul className={s.points}>
    <li>가져오면 게시글 작성 화면에서 이어서 쓰고 올릴 수 있어요.</li>
    <li>가져오지 않으면 작성하던 내용은 이 계정에서 이어 쓸 수 없어요.</li>
   </ul>
   <div className={s.actions}>
    <Action className={s.primary} disabled={claim.busy} onClick={()=>void accept()}>{claim.busy?'가져오는 중…':'가져와서 이어 쓰기'}</Action>
    <button type="button" className={s.secondary} disabled={claim.busy} onClick={claim.decline}>가져오지 않을게요</button>
   </div>
  </div>}
  {claim&&!draftOnly&&<div className={s.body}>
   {/* eslint-disable-next-line @next/next/no-img-element -- static illustration */}
   <img className={s.art} src="/illustrations/try/link-v3.webp" alt="" width={112} height={112}/>
   <h3 className={s.headline}>로그인 전에 올린 게시물 <strong>{claim.posts}개</strong>를<br/>내 계정에 연동할까요?</h3>
   <ul className={s.points}>
    <li>연동하면 내 프로필 게시물로 옮겨지고, 직접 수정·삭제할 수 있어요.</li>
    <li>연동해도 게시물의 공개 상태는 유지돼요.</li>
    <li>연동하지 않으면 익명 체험 게시물로 남아요.</li>
    {draft&&<li>작성하던 글{claim.draftPhotos?`과 사진 ${claim.draftPhotos}장`:''}도 함께 가져와 게시글 작성에서 이어 쓸 수 있어요.</li>}
   </ul>
   <div className={s.actions}>
    <Action className={s.primary} disabled={claim.busy} onClick={()=>void accept()}>{claim.busy?'연동하는 중…':'내 계정에 연동하기'}</Action>
    <button type="button" className={s.secondary} disabled={claim.busy} onClick={claim.decline}>연동하지 않을게요</button>
   </div>
  </div>}
 </Dialog>;
}
