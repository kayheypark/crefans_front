'use client';
import {ActionLink,PageTitle} from './ServiceUI';
import {BackButton} from './BackButton';
import Icon from './Icon';
import type {MembershipCheckoutOrder} from './MembershipCheckout';
import complete from './signup-complete.module.css';
import billing from './billing-result.module.css';
import {intermediaryNotice} from '@/lib/content/business';
import s from './membership-complete.module.css';

/** With an order, the summary is the contract record, so it names the seller with the intermediary notice in one type size (시행규칙 제11조의2). */
export function MembershipCompletePage({basePath,backHref,order,sellerName}:{basePath:string;backHref:string;order?:MembershipCheckoutOrder;sellerName?:string}){
 const singleMonth=order?.snapshot.paymentMode==='one-time';
 return <section className={s.page}>
  <PageTitle back={<BackButton href={backHref} label="멤버십으로 돌아가기"/>}>멤버십 가입 완료</PageTitle>
  <div className={`${billing.complete} ${s.complete}`}>
   <span className={complete.check} aria-hidden="true"><Icon name="check" width={50} height={50} strokeWidth={2.6}/></span>
   <div className={billing.message} role="status"><h2>멤버십 가입이 완료됐어요</h2><p>이제 멤버십 전용 콘텐츠를 만나보세요.<br/>가입 내역은 내 구독에서 확인할 수 있어요.</p></div>
   {order&&<section className={s.summary} aria-label="가입한 멤버십">
    <p className={s.eyebrow}>{singleMonth?'한 달 이용':'월간 멤버십'}</p>
    <h3>{order.snapshot.name}</h3>
    <div className={s.amount}><strong>{order.amount.toLocaleString('ko-KR')}<span>원</span></strong><small>{singleMonth?'한 달 이용':'월'} · VAT 포함</small></div>
    {order.snapshot.benefits.length>0&&<ul>{order.snapshot.benefits.map(benefit=><li key={benefit}><Icon name="check" width={16} height={16}/><span>{benefit}</span></li>)}</ul>}
    <div className={s.seller} aria-label="판매자 안내"><p>판매자: <strong>{sellerName||'이 멤버십을 운영하는 크리에이터'}</strong></p><p>{intermediaryNotice}</p></div>
   </section>}
   <div className={`${billing.actions} ${s.actions}`}><ActionLink href={`${basePath}/subscriptions`} className={billing.return}>내 구독 확인</ActionLink></div>
  </div>
 </section>;
}
