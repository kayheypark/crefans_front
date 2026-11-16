'use client';
import {useState} from 'react';
import {Dialog} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import {Field} from '@/components/ui/Field';
import {Action} from './ServiceUI';
import type {PhoneCheckModel,PhoneCheckStart} from '@/types/crefans-events';
import s from './events.module.css';

// 2026-11-16: OCTOMO number-ownership check (the member texts a code from their phone). It is not identity or age verification.
export function PhoneCheckDialog({open,onClose,check,onVerified}:{open:boolean;onClose:()=>void;check:PhoneCheckModel;onVerified:()=>void}){
 const [phone,setPhone]=useState(''),[sent,setSent]=useState<PhoneCheckStart|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const digits=phone.replace(/[^0-9]/g,''),valid=/^010[0-9]{8}$/.test(digits);
 async function start(){if(!valid||busy)return;setBusy(true);setError('');try{const r=await check.start(digits);if(r.success)setSent(r.data);else setError(r.errorMessage);}catch{setError('잠시 후 다시 시도해 주세요.');}finally{setBusy(false);}}
 async function confirm(){if(busy)return;setBusy(true);setError('');try{const r=await check.confirm(digits);if(r.success&&r.data.verified){setSent(null);onVerified();onClose();}else if(!r.success)setError(r.errorMessage);}catch{setError('잠시 후 다시 시도해 주세요.');}finally{setBusy(false);}}
 return <Dialog open={open} onClose={()=>{if(!busy)onClose();}} title="휴대폰 번호 확인">
  <div className={s.phoneCheck}>
   {!sent?<><p>프로모션 100콩은 휴대폰 번호 하나에 한 번 받을 수 있어요. 번호를 입력하면 보낼 문자를 알려 드려요.</p>
    <Field label="휴대폰 번호" inputMode="numeric" autoComplete="tel" placeholder="01012345678" value={phone} onChange={event=>setPhone(event.target.value)} disabled={busy}/></>
   :<><p>이 휴대폰으로 아래 내용을 문자로 보내 주세요. 보낸 뒤 ‘보냈어요’를 눌러 주세요.</p>
    <dl className={s.phoneSms}><div><dt>받는 번호</dt><dd>{sent.receiver}</dd></div><div><dt>보낼 내용</dt><dd><strong>{sent.code}</strong></dd></div></dl>
    <a className={s.phoneSmsLink} href={sent.smsUri}>문자 앱 열기</a>
    <p className={s.phoneNote}>문자 요금은 이용 중인 요금제에 따라 나올 수 있어요. 10분 안에 보내 주세요.</p></>}
   <p className={s.phoneNote}>번호 소유만 확인하며, 회사는 번호를 되돌릴 수 없는 값으로만 보관해요.</p>
   {error&&<p className={s.claimError} role="alert">{error}</p>}
  </div>
  <DialogActions style={{marginTop:20}}>
   <Action variant="secondary" disabled={busy} onClick={sent?()=>{setSent(null);setError('');}:onClose}>{sent?'번호 다시 입력':'닫기'}</Action>
   {sent?<Action disabled={busy} onClick={()=>void confirm()}>{busy?'확인 중…':'보냈어요'}</Action>:<Action disabled={!valid||busy} onClick={()=>void start()}>{busy?'준비 중…':'보낼 문자 받기'}</Action>}
  </DialogActions>
 </Dialog>;
}
