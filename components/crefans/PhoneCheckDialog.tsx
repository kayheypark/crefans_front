'use client';
import {useEffect,useRef,useState} from 'react';
import {Dialog} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import {Field} from '@/components/ui/Field';
import {Action} from './ServiceUI';
import {smsHref,smsPlatform,type SmsPlatform} from '@/lib/crefans/sms-link';
import type {PhoneCheckModel,PhoneCheckStart} from '@/types/crefans-events';
import s from './events.module.css';

// 2026-11-16: OCTOMO number-ownership check (MO: the member texts a code from their own phone). It is not identity or age verification.
// User decision: show a preview of the exact message first, then '인증하러 가기' opens the messaging app (Android/iPhone links differ);
// on PC a QR from OCTOMO opens it from the phone camera. Returning from the messaging app checks once automatically.
export function PhoneCheckDialog({open,onClose,check,onVerified,intro='프로모션 100콩은 휴대폰 번호 하나에 한 번 받을 수 있어요.',initialPhone,platform:fixedPlatform}:{open:boolean;onClose:()=>void;check:PhoneCheckModel;onVerified:()=>void;intro?:string;/** A number already typed in the page: the dialog opens straight on the message preview. */initialPhone?:string;/** Tests pin the platform. */platform?:SmsPlatform}){
 const [phone,setPhone]=useState(''),[sent,setSent]=useState<PhoneCheckStart|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[opened,setOpened]=useState(false);
 const [platform,setPlatform]=useState<SmsPlatform>(fixedPlatform??'android');
 useEffect(()=>{if(!fixedPlatform&&typeof navigator!=='undefined')setPlatform(smsPlatform(navigator.userAgent,navigator.maxTouchPoints||0));},[fixedPlatform]);
 const digits=phone.replace(/[^0-9]/g,''),valid=/^010[0-9]{8}$/.test(digits),mobile=platform!=='desktop';
 const busyRef=useRef(false),autoChecked=useRef(false);
 // Opened with a number from the page: start right away (the platform was read on mount, before the page could open this).
 useEffect(()=>{if(!open||!initialPhone||!/^010[0-9]{8}$/.test(initialPhone))return;setPhone(initialPhone);setSent(null);setError('');void start(initialPhone);// eslint-disable-next-line react-hooks/exhaustive-deps
 },[open,initialPhone]);
 async function start(number=digits){if(!/^010[0-9]{8}$/.test(number)||busyRef.current)return;busyRef.current=true;setBusy(true);setError('');try{const r=await check.start(number,mobile?undefined:{qr:true});if(r.success){setSent(r.data);setOpened(false);autoChecked.current=false;}else setError(r.errorMessage);}catch{setError('잠시 후 다시 시도해 주세요.');}finally{busyRef.current=false;setBusy(false);}}
 async function confirm(quiet=false){if(busyRef.current)return;busyRef.current=true;setBusy(true);if(!quiet)setError('');try{const r=await check.confirm(digits);if(r.success&&r.data.verified){setSent(null);onVerified();onClose();}else if(!r.success&&!(quiet&&r.errorCode==='PHONE_SMS_NOT_FOUND'))setError(r.errorMessage);}catch{if(!quiet)setError('잠시 후 다시 시도해 주세요.');}finally{busyRef.current=false;setBusy(false);}}
 // Coming back from the messaging app: one quiet check (a not-yet-delivered SMS is not shown as an error).
 useEffect(()=>{if(!sent||!opened||typeof document==='undefined')return;const back=()=>{if(document.visibilityState==='visible'&&!autoChecked.current){autoChecked.current=true;setTimeout(()=>void confirm(true),1500);}};document.addEventListener('visibilitychange',back);return()=>document.removeEventListener('visibilitychange',back);});
 function openMessages(){if(!sent)return;setOpened(true);autoChecked.current=false;if(typeof window!=='undefined'&&window.location)window.location.href=smsHref(sent.receiver,sent.code,platform);}
 const mobileActions=<div className={s.smsActions}>
   {!opened?<Action className={s.smsMain} onClick={openMessages}>인증하러 가기</Action>
    :<><Action className={s.smsMain} disabled={busy} onClick={()=>void confirm()}>{busy?'확인 중…':'보냈어요'}</Action><Action className={s.smsMain} variant="secondary" disabled={busy} onClick={openMessages}>메시지 앱 다시 열기</Action></>}
   <button type="button" className={s.smsBack} disabled={busy} onClick={()=>{setSent(null);setError('');setOpened(false);}}>번호 다시 입력</button>
  </div>;
 return <Dialog open={open} onClose={()=>{if(!busy)onClose();}} title="휴대폰 번호 확인">
  <div className={s.phoneCheck}>
   {!sent?<><p>{intro} 메시지 앱으로 문자 한 통을 보내 번호를 확인해요.</p>
    <Field label="휴대폰 번호" inputMode="numeric" autoComplete="tel" placeholder="01012345678" value={phone} onChange={event=>setPhone(event.target.value)} disabled={busy}/></>
   :<>
    <p>아래 문자를 <strong>{digits.replace(/^(010)(\d{4})(\d{4})$/,'$1-$2-$3')}</strong>에서 보내면 확인돼요.{mobile?'':' 휴대폰 카메라로 QR을 찍으면 메시지 앱이 열려요.'}</p>
    {/* Same look as the Messages compose screen (2026-11-16 user reference): recipient on top, the code already in the input, green send. */}
    <figure className={s.smsPreview} aria-label={`보낼 문자 미리보기: 받는 사람 ${sent.receiver}, 내용 ${sent.code}`}>
     <div className={s.smsTop}><span className={s.smsAvatar} aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4.2"/><path d="M4.5 20.5c1.2-4 4.2-6 7.5-6s6.3 2 7.5 6"/></svg></span><span className={s.smsNumber}>+82 {sent.receiver}<i aria-hidden="true">›</i></span></div>
     <p className={s.smsMeta}>문자 메시지 · SMS</p>
     <div className={s.smsSpace}/>
     <div className={s.smsComposer}><span className={s.smsPlus} aria-hidden="true">+</span><span className={s.smsInput}>{sent.code}<i className={s.smsCaret} aria-hidden="true"/></span><span className={s.smsSend} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 19V6m0 0-5.5 5.5M12 6l5.5 5.5"/></svg></span></div>
     <figcaption className={s.smsHint}>메시지 앱이 열리면 이렇게 채워져 있어요. 초록 전송 버튼만 누르세요.</figcaption>
    </figure>
    {mobile&&mobileActions}
    {!mobile&&sent.qrCode&&<figure className={s.smsQr}>{/* eslint-disable-next-line @next/next/no-img-element -- server-issued PNG data URL */}<img src={sent.qrCode} alt="메시지 앱을 여는 QR 코드" width={160} height={160}/><figcaption>QR이 안 되면 휴대폰에서 직접 {sent.receiver}로 {sent.code}을(를) 보내 주세요.</figcaption></figure>}
    <p className={s.phoneNote}>문자 요금은 요금제에 따라 나올 수 있어요. 10분 안에 보내 주세요.</p>
   </>}
   <p className={s.phoneNote}>번호를 가지고 있는지만 확인하며, 회사는 번호를 되돌릴 수 없는 값으로만 보관해요.</p>
   {error&&<p className={s.claimError} role="alert">{error}</p>}
  </div>
  {sent&&mobile?null:<DialogActions style={{marginTop:20}}>
   <Action variant="secondary" disabled={busy} onClick={sent?()=>{setSent(null);setError('');}:onClose}>{sent?'번호 다시 입력':'닫기'}</Action>
   {!sent?<Action disabled={!valid||busy} onClick={()=>void start()}>{busy?'준비 중…':'다음'}</Action>:<Action disabled={busy} onClick={()=>void confirm()}>{busy?'확인 중…':'보냈어요'}</Action>}
  </DialogActions>}
 </Dialog>;
}
