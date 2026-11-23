"use client";
import Image from 'next/image';
import {Checkbox} from '@/components/ui/Choice';
import {Dialog} from '@/components/ui/Primitives';
import {Action,ActionLink} from '../ServiceUI';
import s from './ai-photo.module.css';

// 2026-11-23 user decision (replaces 11-18 "guest AI results without a watermark"): every signed-out result carries the
// bottom-right https://crefans.com mark. The box stays checked; trying to clear it opens the signup offer below.
// The server marks every guest result regardless of what is sent (src/platform/ai-photo.ts in crefans_server).
export const GUEST_WATERMARK_COPY={
 label:'워터마크 넣기',
 lock:'해제는 회원 전용',
 title:'워터마크 해제',
 badge:'매일 10장',
 heading:['워터마크 없는 사진은','회원만 만들 수 있어요'],
 body:{before:'지금 가입하면 워터마크를 뺄 수 있고,',middle:'AI 사진 이용권도 ',highlight:'매일 10장',after:'씩 무료로 드려요.'},
 signup:'회원가입하고 워터마크 빼기',
 keep:'워터마크 넣은 채로 계속하기',
 note:'가입해도 지금 만든 사진과 쓰던 글은 그대로 이어져요.',
};

/** Always checked for guests; an attempt to clear it calls onTryClear instead of changing the value. */
export function GuestWatermarkOption({onTryClear,disabled}:{onTryClear:()=>void;disabled?:boolean}){
 return <div className={s.watermarkOption}>
  <Checkbox label={GUEST_WATERMARK_COPY.label} checked disabled={disabled} onChange={()=>onTryClear()}/>
  <span className={s.watermarkLock}>{GUEST_WATERMARK_COPY.lock}</span>
 </div>;
}

export function GuestWatermarkOffer({open,onClose,signupHref}:{open:boolean;onClose:()=>void;signupHref:string}){
 const c=GUEST_WATERMARK_COPY;
 return <Dialog open={open} onClose={onClose} title={c.title} className={`${s.publishOffer} ${s.watermarkOffer}`}>
  <div className={s.publishOfferBody}>
   <div className={`${s.publishOfferArt} ${s.watermarkOfferArt}`}><Image src="/illustrations/try/guest-ticket-v1.webp" alt="" width={112} height={112}/><span className={s.watermarkOfferBadge}>{c.badge}</span></div>
   <h3 className={s.watermarkOfferHeading}>{c.heading[0]}<br/>{c.heading[1]}</h3>
   <p className={s.watermarkOfferText}>{c.body.before}<br/>{c.body.middle}<strong>{c.body.highlight}</strong>{c.body.after}</p>
   <div className={s.publishOfferActions}>
    <ActionLink href={signupHref} className={s.watermarkOfferSignup}>{c.signup}</ActionLink>
    <Action type="button" variant="secondary" onClick={onClose}>{c.keep}</Action>
   </div>
   <small className={s.watermarkOfferNote}>{c.note}</small>
  </div>
 </Dialog>;
}
