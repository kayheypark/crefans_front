import type {ApiResult} from '@/types/crefans';
import {platformRequest as api} from './platform';
export type BillingAttempt={registrationId:string;state:string;customerKey:string;returnPath:string};
export const billingAttemptKey='crefans-billing-registration';
export const billingReturnPath=(path:string)=>path==='/service/payment-methods'||/^\/service\/checkout\/[a-f0-9-]{36}$/.test(path)?path:'/service/payment-methods';
export async function startBillingRegistration(returnPath='/service/payment-methods'):Promise<ApiResult<{message:string}>>{
 const result=await api<BillingAttempt&{clientKey:string}>('/billing/registrations',{returnPath:billingReturnPath(returnPath)});if(!result.success)return result;
 const attempt=result.data;try{sessionStorage.setItem(billingAttemptKey,JSON.stringify({registrationId:attempt.registrationId,state:attempt.state,customerKey:attempt.customerKey,returnPath:attempt.returnPath}));
 const {loadTossPayments}=await import('@tosspayments/tosspayments-sdk');const sdk=await loadTossPayments(attempt.clientKey),query=new URLSearchParams({registrationId:attempt.registrationId,state:attempt.state});await sdk.payment({customerKey:attempt.customerKey}).requestBillingAuth({method:'CARD',successUrl:`${location.origin}/service/billing/success?${query}`,failUrl:`${location.origin}/service/billing/fail?${query}`});return{success:true,data:{message:'카드 등록창을 열었습니다.'},errorMessage:null,errorCode:null};}
 catch(error:any){return{success:false,data:null,errorCode:error?.code==='USER_CANCEL'?'REGISTRATION_CANCELLED':'REGISTRATION_FAILED',errorMessage:error?.code==='USER_CANCEL'?'카드 등록을 취소했습니다.':'카드 등록창을 열지 못했습니다. 다시 시도해주세요.'};}
}
export function readBillingCallback(query:URLSearchParams,saved:BillingAttempt|null){
 saved=saved&&typeof saved.registrationId==='string'&&typeof saved.state==='string'&&typeof saved.customerKey==='string'&&typeof saved.returnPath==='string'?{...saved,returnPath:billingReturnPath(saved.returnPath)}:null;
 const id=query.get('registrationId'),state=query.get('state');
 const attempt=id&&state?{registrationId:id,state,customerKey:query.get('customerKey')||(saved?.registrationId===id?saved.customerKey:undefined),returnPath:saved?.registrationId===id?billingReturnPath(saved.returnPath):'/service/payment-methods'}:saved;
 return{attempt,authKey:query.get('authKey'),code:query.get('code')};
}
