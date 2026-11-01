'use client';
import {useEffect,useState} from 'react';
import {readTipRecipient,type TipRecipient} from '@/lib/crefans/bean-tip-return';
import {Avatar} from '@/components/ui/Avatar';
import {CreatorName} from './CreatorName';
import Link from 'next/link';
import {beanOrderNumber} from '@/lib/crefans/bean-history';
import type {BeanCharge,BeanPaymentStatus} from '@/types/crefans-beans';
import {Action} from './ServiceUI';
import s from './beans.module.css';

export function BeanPaymentResultPage({basePath,status,charge,message,onRetry}:{basePath:string;status:BeanPaymentStatus;charge:BeanCharge|null;message:string;onRetry:()=>void}){
 const [recipient,setRecipient]=useState<TipRecipient|null>(null);
 useEffect(()=>{setRecipient(charge?.id?readTipRecipient(basePath,`order:${charge.id}`):null);},[basePath,charge?.id]);
 const completed=status==='success'&&charge?.status==='paid';
 const title=completed?'콩 충전 완료':status==='loading'?'충전 결과 확인 중':status==='cancelled'?'결제를 완료하지 않았어요':status==='pending'?'충전 확인이 필요해요':'충전 결과를 확인해주세요';
 return <section className={`${s.page} ${s.chargeResult}`} aria-busy={status==='loading'}>
  {completed&&<img className={s.resultArtwork} src="/brand/beans/soft3d-v6/10.png" width={120} height={120} alt=""/>}
  <h1>{title}</h1>
  <p className={s.resultMessage} role={status==='error'?'alert':'status'}>{completed?'충전한 콩으로 좋아하는 크리에이터를 응원해보세요.':message}</p>
  {completed&&<dl className={s.resultReceipt}>
   <div><dt>충전한 콩</dt><dd className={s.resultQuantity}>{charge.quantity.toLocaleString('ko-KR')}콩</dd></div>
   <div><dt>결제 금액 <small>VAT 포함</small></dt><dd>{charge.amount.toLocaleString('ko-KR')}원</dd></div>
   <div className={s.resultOrder}><dt>주문번호</dt><dd>{beanOrderNumber(charge.createdAt)}</dd></div>
  </dl>}
  <div className={s.resultActions}>
   {(status==='error'||status==='pending')&&<Action onClick={onRetry}>같은 주문 결과 다시 확인</Action>}
   {completed&&recipient&&<Link className={s.tipContinue} href={`${basePath}/${recipient.postId?`post/${encodeURIComponent(recipient.postId)}`:`creator/${encodeURIComponent(recipient.id)}`}?tip=1`}><Avatar src={recipient.image} name={recipient.name} position={recipient.position} size={40}/><span><strong><CreatorName person={recipient}/></strong><span>계속 후원하러가기</span></span></Link>}
   <Link className={s.chargeLink} href={`${basePath}/beans`}>내 콩 지갑 보기</Link>
   {completed&&<Link className={s.resultSecondary} href={`${basePath}/explore`}>크리에이터 둘러보기</Link>}
  </div>
 </section>;
}
