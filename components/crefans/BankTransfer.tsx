'use client';
import {useId,useState} from 'react';
import {Field} from '@/components/ui/Field';
import {Checkbox,Radio} from '@/components/ui/Choice';
import {Toast} from '@/components/ui/Toast';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import {bankTransferFormErrors,kstDateTime,refundAccountErrors,type BankTransferForm} from '@/lib/crefans/bank-transfer';
import type {BankTransfer,PaymentMethods,RefundAccount} from '@/types/crefans-payments';
import type {ApiResult} from '@/types/crefans';
import {Action} from './ServiceUI';
import Icon from './Icon';
import s from './bank-transfer.module.css';

const won=(n:number)=>n.toLocaleString('ko-KR')+'원';
type Method='bank_transfer'|'card';

/**
 * 2026-11-16 무통장입금 (콩 충전·AI 이용권·광고상품). Card (Toss) is offered only when the server says `card:true`;
 * with neither method open the checkout shows {@link PaymentPreparing} instead of a broken flow.
 */
export function PaymentMethodChoice({methods,value,onChange,disabled}:{methods:PaymentMethods;value:Method;onChange:(method:Method)=>void;disabled?:boolean}){
 const name=useId();
 if(!methods.card||!methods.bankTransfer)return <p className={s.method}><span>결제 방법</span><strong>{methods.bankTransfer?'무통장입금':'카드'}</strong></p>;
 return <fieldset className={s.methods} disabled={disabled}><legend>결제 방법</legend>
  <Radio name={name} label="무통장입금" checked={value==='bank_transfer'} onChange={checked=>{if(checked)onChange('bank_transfer');}}/>
  <Radio name={name} label="카드" checked={value==='card'} onChange={checked=>{if(checked)onChange('card');}}/>
 </fieldset>;
}
/** The method a checkout starts with: bank transfer when open, card only when the server allows it. */
export const defaultPaymentMethod=(methods:PaymentMethods|null|undefined):Method|null=>methods?.bankTransfer?'bank_transfer':methods?.card?'card':null;

export function PaymentPreparing({error,onRetry}:{error?:string;onRetry?:()=>void}){
 return <div className={s.preparing} role="status"><strong>결제 준비 중</strong><p>{error||'지금은 결제를 받을 수 없어요. 결제 방법이 준비되면 이곳에서 구매할 수 있어요.'}</p>{error&&onRetry&&<Action variant="secondary" onClick={onRetry}>다시 확인</Action>}</div>;
}

/** 입금자명 (required, 20 characters) and an optional cash receipt request. Errors appear once something was typed. */
export function BankTransferFields({value,onChange,disabled,deadlineHours=24}:{value:BankTransferForm;onChange:(value:BankTransferForm)=>void;disabled?:boolean;deadlineHours?:number}){
 const name=useId(),errors=bankTransferFormErrors(value),set=(patch:Partial<BankTransferForm>)=>onChange({...value,...patch});
 return <div className={s.form}>
  <Field label="입금자명" required maxLength={20} autoComplete="name" value={value.depositorName} disabled={disabled} error={value.depositorName&&errors.depositorName||undefined} hint={`실제로 입금하실 분의 이름이에요. 주문 후 ${deadlineHours}시간 안에 입금해 주세요.`} onChange={event=>set({depositorName:event.target.value})}/>
  <Checkbox label="현금영수증 신청 (선택)" checked={value.cashReceipt} disabled={disabled} onChange={cashReceipt=>set({cashReceipt})}/>
  {value.cashReceipt&&<fieldset className={s.receipt} disabled={disabled}><legend>현금영수증 용도</legend>
   <div className={s.receiptTypes}><Radio name={name} label="소득공제" checked={value.receiptType==='income'} onChange={checked=>{if(checked)set({receiptType:'income',receiptNumber:''});}}/><Radio name={name} label="지출증빙" checked={value.receiptType==='expense'} onChange={checked=>{if(checked)set({receiptType:'expense',receiptNumber:''});}}/></div>
   <Field label={value.receiptType==='income'?'휴대폰 번호':'사업자번호'} required inputMode="numeric" maxLength={value.receiptType==='income'?13:12} placeholder={value.receiptType==='income'?'01012345678':'숫자 10자리'} value={value.receiptNumber} error={value.receiptNumber&&errors.receiptNumber||undefined} hint="입금이 확인된 뒤 발급해 드려요." onChange={event=>set({receiptNumber:event.target.value})}/>
  </fieldset>}
 </div>;
}

/** 입금 안내: where and how much to send, until when, and the current state of the deposit. */
export function BankTransferInstructions({transfer,onReportDeposit}:{transfer:BankTransfer;/** 2026-11-17: '입금했어요' tells operators (Telegram) once per order. */onReportDeposit?:()=>Promise<ApiResult<{reported:boolean;message:string}>>}){
 const [notice,setNotice]=useSnackbarMessage(),[error,setError]=useState(''),[reporting,setReporting]=useState(false),[reported,setReported]=useState(false);
 async function report(){if(!onReportDeposit||reporting||reported)return;setError('');setReporting(true);try{const r=await onReportDeposit();if(r.success){setReported(true);setNotice(r.data.message);}else setError(r.errorMessage||'알리지 못했어요. 잠시 후 다시 시도해 주세요.');}finally{setReporting(false);}}
 async function copy(){setError('');try{await navigator.clipboard.writeText(transfer.account.accountNumber);setNotice('계좌번호를 복사했어요.');}catch{setError('복사하지 못했어요. 계좌번호를 직접 입력해 주세요.');}}
 const awaiting=transfer.status==='awaiting';
 return <section className={s.instructions} aria-label="입금 안내">
  <div className={s.heading}><h3>입금 안내</h3><span className={s.status} data-status={transfer.status}>{transfer.statusLabel}</span></div>
  <dl className={s.details}>
   <div><dt>입금 금액</dt><dd><strong>{won(transfer.amount)}</strong></dd></div>
   <div><dt>은행</dt><dd>{transfer.account.bankName}</dd></div>
   <div><dt>계좌번호</dt><dd className={s.account}><span>{transfer.account.accountNumber}</span><button type="button" className={s.copy} onClick={()=>void copy()} aria-label="계좌번호 복사"><Icon name="copy" width={16} height={16}/>복사</button></dd></div>
   <div><dt>예금주</dt><dd>{transfer.account.holder}</dd></div>
   <div><dt>입금자명</dt><dd>{transfer.depositorName}</dd></div>
   <div><dt>입금 기한</dt><dd>{kstDateTime(transfer.expiresAt)}까지</dd></div>
   {transfer.cashReceipt&&<div><dt>현금영수증</dt><dd>{transfer.cashReceipt.type==='income'?'소득공제':'지출증빙'} · {transfer.cashReceipt.issued?'발급 완료':'입금 확인 후 발급'}</dd></div>}
  </dl>
  {error&&<p role="alert" className={s.error}>{error}</p>}
  {awaiting&&onReportDeposit&&<Action type="button" className={s.reportDeposit} variant={reported?'secondary':'primary'} disabled={reporting||reported} onClick={()=>void report()}>{reported?'입금 알림을 보냈어요':reporting?'알리는 중…':'입금했어요'}</Action>}
  {awaiting?<ul className={s.notes}>
   <li>주문 후 24시간 안에 입금해 주세요. 기한까지 입금하지 않으면 주문이 자동으로 취소되고, 기한이 지난 뒤 들어온 입금은 확인 후 전액 돌려드려요.</li>
   <li>입금은 운영자가 직접 확인해요. 주문 금액과 정확히 같은 금액을 입금해야 확인할 수 있어요.</li>
   <li>입금자명이 다르면 확인이 늦어질 수 있어요.</li>
  </ul>:transfer.status==='confirmed'?<p className={s.done}>입금이 확인되었어요.</p>:<p className={s.closed}>입금 기한이 지나 주문이 취소되었어요. 이미 입금하셨다면 확인 후 전액 돌려드려요(고객센터로 알려 주세요). 필요하면 다시 주문해 주세요.</p>}
  <Toast message={notice} onClose={()=>setNotice('')}/>
 </section>;
}

/** Refund account for a bank-transfer purchase: the operator sends the refund by hand within `businessDays`. */
export function RefundAccountFields({value,onChange,disabled,businessDays=3}:{value:RefundAccount;onChange:(value:RefundAccount)=>void;disabled?:boolean;businessDays?:number}){
 const errors=refundAccountErrors(value),set=(patch:Partial<RefundAccount>)=>onChange({...value,...patch});
 return <fieldset className={s.refund} disabled={disabled}><legend>환불받을 계좌</legend>
  <p className={s.hint}>무통장입금 주문은 입력한 계좌로 운영자가 직접 보내 드려요. 신청 후 영업일 기준 {businessDays}일 안에 입금돼요.</p>
  <Field label="은행" required maxLength={20} value={value.bankName} error={value.bankName&&errors.bankName||undefined} onChange={event=>set({bankName:event.target.value})}/>
  <Field label="계좌번호" required inputMode="numeric" maxLength={30} placeholder="숫자만 입력 (- 포함 가능)" value={value.accountNumber} error={value.accountNumber&&errors.accountNumber||undefined} onChange={event=>set({accountNumber:event.target.value})}/>
  <Field label="예금주" required maxLength={20} value={value.holder} error={value.holder&&errors.holder||undefined} onChange={event=>set({holder:event.target.value})}/>
 </fieldset>;
}
