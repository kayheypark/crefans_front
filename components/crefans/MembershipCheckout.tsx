'use client';
import Link from 'next/link';
import {Action,PageTitle} from './ServiceUI';
import {BackButton} from './BackButton';
import Icon from './Icon';
import {PaymentTerms} from './PaymentTerms';
import {MembershipCompletePage} from './MembershipCompletePage';
import s from './membership-checkout.module.css';

export type MembershipCheckoutOrder={
 id:string;planId?:string;amount:number;status:string;
 snapshot:{name:string;benefits:string[];creatorId?:string;paymentMode?:string;paymentEnvironment?:string;refundWindowDays?:number};
};
type Props={
 order:MembershipCheckoutOrder|null;error:string;basePath:string;
 defaultMethod?:{label:string;requiresUpdate?:boolean};canRegister:boolean;
 busy:boolean;registering:boolean;agreed:boolean;onAgree:(value:boolean)=>void;
 onRegister:()=>void;onPay:()=>void;onOneTime:()=>void;
};

/** Shared checkout presentation; orders, card state and payment actions are supplied by its container. */
export function MembershipCheckout({order,error,basePath,defaultMethod,canRegister,busy,registering,agreed,onAgree,onRegister,onPay,onOneTime}:Props){
 const singleMonth=order?.snapshot.paymentMode==='one-time'&&order.status!=='pending';
 const backHref=order?.snapshot.creatorId?`${basePath}/membership/${encodeURIComponent(order.snapshot.creatorId)}${order.planId?`?plan=${encodeURIComponent(order.planId)}`:''}`:`${basePath}/subscriptions`;
 if(order?.status==='paid')return <MembershipCompletePage basePath={basePath} backHref={backHref} order={order}/>;
 return <section className={s.page}>
  <PageTitle back={<BackButton href={backHref} label="멤버십으로 돌아가기"/>}>멤버십 결제</PageTitle>
  {order&&<>
   <section className={s.product} aria-label="결제 상품">
    <div className={s.productHeading}><div><p className={s.eyebrow}>{singleMonth?'한 달 이용':'월간 멤버십'}</p><h2>{order.snapshot.name}</h2></div>
     <div className={s.price} aria-label={`${order.amount.toLocaleString('ko-KR')}원 (VAT 포함)`}><strong>{order.amount.toLocaleString('ko-KR')}<span>원</span></strong><small>{singleMonth?'한 달 이용':'월'} · VAT 포함</small></div>
    </div>
    {order.snapshot.benefits.length>0&&<ul className={s.benefits}>{order.snapshot.benefits.map(benefit=><li key={benefit}><Icon name="check" width={16} height={16}/><span>{benefit}</span></li>)}</ul>}
   </section>
    <section className={s.paymentMethod} aria-label="결제수단">
     <div className={s.sectionHeading}><h2>결제수단</h2><Link href={`${basePath}/payment-methods`} aria-label="결제수단 관리">관리 <Icon name="chevron" width={16} height={16}/></Link></div>
     <div className={s.cardRow}><Icon name="card" width={22} height={22}/><div className={s.cardInfo}><strong>{defaultMethod?.label||'등록된 결제수단 없음'}</strong><small>{defaultMethod?'등록된 카드로 결제':'매월 결제하려면 카드를 등록해주세요.'}</small></div><Action className={s.register} variant="secondary" disabled={busy||registering||!canRegister} onClick={onRegister}>{registering?'처리 중…':'카드 등록'}</Action></div>
     {defaultMethod?.requiresUpdate&&<p className={s.error} role="alert">기본 카드를 사용할 수 없습니다. 결제수단 관리에서 다른 카드를 기본으로 설정해주세요.</p>}
    </section>
    {order.status!=='processing'&&<PaymentTerms layout="list" basePath={basePath} agreed={agreed} onAgree={onAgree} disabled={busy||registering} items={[
     {label:'결제 주기',summary:'매월 자동 결제 · 한 달 결제도 가능',value:'등록 카드 결제는 오늘 결제한 뒤 매월 같은 날(그 날이 없는 달은 말일) 자동으로 결제됩니다. 한 달만 결제하면 자동 갱신되지 않습니다.'},
     {label:'해지',summary:'다음 결제 해지 · 남은 기간 이용',value:'내 구독에서 언제든 다음 결제를 해지할 수 있고, 이미 결제한 기간까지 이용할 수 있습니다.'},
     {label:'환불',summary:order.snapshot.refundWindowDays?`결제 후 ${order.snapshot.refundWindowDays}일 이내 · 전용 게시물 미열람 시`:'이용약관의 환불 기준 확인',value:order.snapshot.refundWindowDays?`결제 후 ${order.snapshot.refundWindowDays}일 이내이고 멤버십 게시물을 열람하지 않았다면 전액 환불을 요청할 수 있습니다. 게시물을 열람해 이용을 시작한 뒤에는 환불이 제한됩니다.`:'환불 기준은 이용약관을 따릅니다.'}
    ]}/>}
    <div className={s.paymentActions}>
     <Action disabled={busy||registering||!['pending','processing','failed'].includes(order.status)||order.status!=='processing'&&(!agreed||!defaultMethod||defaultMethod.requiresUpdate)} onClick={onPay}>{busy?'결제 확인 중…':order.status==='processing'?'결제 결과 확인':order.status==='failed'?'다시 결제하기':'결제하고 가입'}</Action>
     <Action variant="secondary" disabled={busy||registering||!agreed||order.status!=='pending'} onClick={onOneTime}>한 달만 결제하기</Action>
    </div>
    {order.snapshot.paymentEnvironment==='test'&&<p className={s.notice} role="status">테스트 결제입니다. 실제 금액은 청구되지 않습니다.</p>}
  </>}
  {error&&<p className={s.error} role="alert">{error}</p>}
 </section>;
}
