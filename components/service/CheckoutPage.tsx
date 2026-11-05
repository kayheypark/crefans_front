'use client';
import {useCheckoutModel,useBillingResult} from '@/features/service/useCheckoutModel';
import Link from 'next/link';
import {startOneTimePayment} from '@/features/service/useOneTimePayment';
import {useState} from 'react';
import {SignInPrompt} from '@/components/crefans/AccountPages';
import {BillingRegistrationResultPage} from '@/components/crefans/CommonPages';
import {Action,PageTitle} from '@/components/crefans/ServiceUI';
import {useService} from './ServiceProvider';
import {PaymentTerms} from '@/components/crefans/PaymentTerms';
import {PAYMENT_TERMS} from '@/lib/crefans/payment-terms';
import s from './checkout.module.css';
export function CheckoutPage({id}:{id:string}){
 const {common,refresh}=useService(),{order,error,busy,pay,setError}=useCheckoutModel(id,refresh);
 const [registering,setRegistering]=useState(false),[agreed,setAgreed]=useState(false);
 async function oneTime(){if(registering)return;setRegistering(true);try{const response=await startOneTimePayment(id,PAYMENT_TERMS.version);if(!response.success)setError(response.errorMessage);}finally{setRegistering(false);}}
 async function register(){if(registering||!common)return;setRegistering(true);try{const response=await common.actions.addPaymentMethod({returnPath:`/service/checkout/${id}`});if(!response.success)setError(response.errorMessage);}finally{setRegistering(false);}}
 return <section className={s.page}><PageTitle>{order?.status==='paid'?'멤버십 가입 완료':'멤버십 결제'}</PageTitle>{order&&<><div className={s.summary}><h2>{order.snapshot.name}</h2><p className={s.price}>{order.snapshot.paymentMode==='one-time'&&order.status!=='pending'?'한 달 이용':'월'}{order.amount.toLocaleString('ko-KR')}원</p><ul>{order.snapshot.benefits.map((benefit:string)=><li key={benefit}>{benefit}</li>)}</ul></div>{order.status==='paid'?<><p>가입이 완료되었습니다.</p><Link href="/service/subscriptions">내 구독 확인</Link></>:<>{order.snapshot.paymentEnvironment==='test'&&<p className={s.notice} role="status">테스트 결제입니다. 실제 금액은 청구되지 않습니다.</p>}<section className={s.paymentMethod} aria-label="결제수단"><p>기본 결제수단: {common?.paymentMethods.find(m=>m.isDefault)?.label||'등록된 결제수단 없음'}</p>{common?.paymentMethods.some(m=>m.isDefault&&m.requiresUpdate)&&<p role="alert">기본 카드를 사용할 수 없습니다. 결제수단 관리에서 다른 카드를 기본으로 설정해주세요.</p>}<div className={s.methodActions}><Link href="/service/payment-methods">결제수단 관리</Link><Action variant="secondary" disabled={busy||registering||!common} onClick={()=>void register()}>결제수단 등록</Action></div></section>{order.status!=='processing'&&<div className={s.conditions}><PaymentTerms basePath="/service" agreed={agreed} onAgree={setAgreed} disabled={busy||registering} items={[{label:'상품',value:order.snapshot.name},{label:'결제 금액',value:`${order.amount.toLocaleString('ko-KR')}원 (VAT 포함)`},{label:'결제 주기',value:'등록 카드 결제는 오늘 결제한 뒤 매월 같은 날(그 날이 없는 달은 말일) 자동으로 결제됩니다. 한 달만 결제하면 자동 갱신되지 않습니다.'},{label:'해지',value:'내 구독에서 언제든 다음 결제를 해지할 수 있고, 이미 결제한 기간까지 이용할 수 있습니다.'},{label:'환불',value:order.snapshot.refundWindowDays?`결제 후 ${order.snapshot.refundWindowDays}일 이내이고 멤버십 게시물을 열람하지 않았다면 전액 환불을 요청할 수 있습니다. 게시물을 열람해 이용을 시작한 뒤에는 환불이 제한됩니다.`:'환불 기준은 이용약관을 따릅니다.'}]}/></div>}<div className={s.paymentActions}><Action disabled={busy||registering||!['pending','processing','failed'].includes(order.status)||order.status!=='processing'&&(!agreed||!common?.paymentMethods.some(m=>m.isDefault&&!m.requiresUpdate))} onClick={()=>void pay(order.status==='processing'?undefined:PAYMENT_TERMS.version)}>{busy?'결제 확인 중…':order.status==='processing'?'결제 결과 확인':order.status==='failed'?'다시 결제하기':'결제하고 가입'}</Action><Action variant="secondary" disabled={busy||registering||!agreed||order.status!=='pending'} onClick={()=>void oneTime()}>한 달만 결제하기</Action></div></>}</>}{error&&<p role="alert">{error}</p>}</section>;
}
export function BillingResult({success}:{success:boolean}){
 const {refresh,common,model}=useService(),result=useBillingResult(success,refresh,model.signedIn);
 if(!model.signedIn)return <SignInPrompt basePath="/service"/>;
 const restart=['REGISTRATION_EXPIRED','REGISTRATION_AUTH_REQUIRED','REGISTRATION_FAILED','INVALID_REGISTRATION','CUSTOMER_MISMATCH','PAYMENT_FAILED','AUTH_KEY_USED','REGISTRATION_CANCELLED'].includes(result.code);
 return <BillingRegistrationResultPage status={result.status} message={result.message} returnPath={result.returnPath} retryLabel={restart?'다시 등록하기':undefined} onRetry={()=>{if(restart){result.start();void common?.actions.addPaymentMethod({returnPath:result.returnPath}).then(response=>{if(!response.success)result.setFailure(response.errorMessage,'REGISTRATION_FAILED');});}else void result.retry();}}/>;
}
