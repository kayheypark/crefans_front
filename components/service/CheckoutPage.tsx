'use client';
import {useCheckoutModel,useBillingResult} from '@/features/service/useCheckoutModel';
import {startOneTimePayment} from '@/features/service/useOneTimePayment';
import {useState} from 'react';
import {SignInPrompt} from '@/components/crefans/AccountPages';
import {BillingRegistrationResultPage} from '@/components/crefans/CommonPages';
import {useService} from './ServiceProvider';
import {MembershipCheckout} from '@/components/crefans/MembershipCheckout';
import {PAYMENT_TERMS} from '@/lib/crefans/payment-terms';
export function CheckoutPage({id}:{id:string}){
 const {common,refresh}=useService(),{order,error,busy,pay,setError}=useCheckoutModel(id,refresh);
 const [registering,setRegistering]=useState(false),[agreed,setAgreed]=useState(false);
 async function oneTime(){if(registering)return;setRegistering(true);try{const response=await startOneTimePayment(id,PAYMENT_TERMS.version);if(!response.success)setError(response.errorMessage);}finally{setRegistering(false);}}
 async function register(){if(registering||!common)return;setRegistering(true);try{const response=await common.actions.addPaymentMethod({returnPath:`/service/checkout/${id}`});if(!response.success)setError(response.errorMessage);}finally{setRegistering(false);}}
 return <MembershipCheckout order={order} error={error} basePath="/service" defaultMethod={common?.paymentMethods.find(m=>m.isDefault)} canRegister={!!common} busy={busy} registering={registering} agreed={agreed} onAgree={setAgreed} onRegister={()=>void register()} onPay={()=>void pay(order?.status==='processing'?undefined:PAYMENT_TERMS.version)} onOneTime={()=>void oneTime()}/>;
}
export function BillingResult({success}:{success:boolean}){
 const {refresh,common,model}=useService(),result=useBillingResult(success,refresh,model.signedIn);
 if(!model.signedIn)return <SignInPrompt basePath="/service"/>;
 const restart=['REGISTRATION_EXPIRED','REGISTRATION_AUTH_REQUIRED','REGISTRATION_FAILED','INVALID_REGISTRATION','CUSTOMER_MISMATCH','PAYMENT_FAILED','AUTH_KEY_USED','REGISTRATION_CANCELLED'].includes(result.code);
 return <BillingRegistrationResultPage status={result.status} message={result.message} returnPath={result.returnPath} retryLabel={restart?'다시 등록하기':undefined} onRetry={()=>{if(restart){result.start();void common?.actions.addPaymentMethod({returnPath:result.returnPath}).then(response=>{if(!response.success)result.setFailure(response.errorMessage,'REGISTRATION_FAILED');});}else void result.retry();}}/>;
}
