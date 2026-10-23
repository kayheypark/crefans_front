'use client';
import {useCheckoutModel,useBillingResult} from '@/features/service/useCheckoutModel';
import Link from 'next/link';
import {startOneTimePayment} from '@/features/service/useOneTimePayment';
import {useState} from 'react';
import {SignInPrompt} from '@/components/crefans/AccountPages';
import {BillingRegistrationResultPage} from '@/components/crefans/CommonPages';
import {Action,PageTitle} from '@/components/crefans/ServiceUI';
import {useService} from './ServiceProvider';
export function CheckoutPage({id}:{id:string}){
 const {common,refresh}=useService(),{order,error,busy,pay,setError}=useCheckoutModel(id,refresh);
 const [registering,setRegistering]=useState(false);
 async function oneTime(){if(registering)return;setRegistering(true);try{const response=await startOneTimePayment(id);if(!response.success)setError(response.errorMessage);}finally{setRegistering(false);}}
 async function register(){if(registering||!common)return;setRegistering(true);try{const response=await common.actions.addPaymentMethod({returnPath:`/service/checkout/${id}`});if(!response.success)setError(response.errorMessage);}finally{setRegistering(false);}}
 return <section style={{maxWidth:480}}><PageTitle>{order?.status==='paid'?'멤버십 가입 완료':'멤버십 결제'}</PageTitle>{order&&<><p>{order.snapshot.name}</p><p>{order.snapshot.paymentMode==='one-time'?'한 달 이용':'월'} {order.amount.toLocaleString('ko-KR')}원</p><ul>{order.snapshot.benefits.map((benefit:string)=><li key={benefit}>{benefit}</li>)}</ul>{order.status==='paid'?<><p>가입이 완료되었습니다.</p><Link href="/service/subscriptions">내 구독 확인</Link></>:<><p>기본 결제수단: {common?.paymentMethods.find(m=>m.isDefault)?.label||'등록된 결제수단 없음'}</p>{common?.paymentMethods.some(m=>m.isDefault&&m.requiresUpdate)&&<p role="alert">기본 카드를 사용할 수 없습니다. 결제수단 관리에서 다른 카드를 기본으로 설정해주세요.</p>}<Link href="/service/payment-methods">결제수단 관리</Link><Action variant="secondary" disabled={busy||registering||!common} onClick={()=>void register()}>결제수단 등록</Action><Action disabled={busy||registering||!['pending','processing','failed'].includes(order.status)||(order.snapshot.paymentMode==='one-time'||order.status!=='processing'&&!common?.paymentMethods.some(m=>m.isDefault&&!m.requiresUpdate))} onClick={()=>void pay()}>{busy?'결제 확인 중…':order.status==='processing'?'결제 결과 확인':order.status==='failed'?'다시 결제하기':'결제하고 가입'}</Action><Action variant="secondary" disabled={busy||registering||order.status!=='pending'} onClick={()=>void oneTime()}>한 달만 결제하기</Action><p>한 달만 결제하면 자동 갱신되지 않습니다.</p><p>등록 카드로 결제하면 매월 자동 갱신됩니다. 내 구독에서 갱신을 해지할 수 있습니다.</p></>}</>}{error&&<p role="alert">{error}</p>}</section>;
}
export function BillingResult({success}:{success:boolean}){
 const {refresh,common,model}=useService(),result=useBillingResult(success,refresh,model.signedIn);
 if(!model.signedIn)return <SignInPrompt basePath="/service"/>;
 const restart=['REGISTRATION_EXPIRED','REGISTRATION_AUTH_REQUIRED','REGISTRATION_FAILED','INVALID_REGISTRATION','CUSTOMER_MISMATCH','PAYMENT_FAILED','AUTH_KEY_USED','REGISTRATION_CANCELLED'].includes(result.code);
 return <BillingRegistrationResultPage status={result.status} message={result.message} returnPath={result.returnPath} retryLabel={restart?'다시 등록하기':undefined} onRetry={()=>{if(restart){result.start();void common?.actions.addPaymentMethod({returnPath:result.returnPath}).then(response=>{if(!response.success)result.setFailure(response.errorMessage,'REGISTRATION_FAILED');});}else void result.retry();}}/>;
}
