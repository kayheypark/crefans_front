'use client';
import {useEffect,useRef,useState} from 'react';
import {useSearchParams,useRouter} from 'next/navigation';
import {platformRequest as api} from '@/lib/api/platform';
export {startOneTimePayment} from '@/lib/api/one-time-payment';
const orderPattern=/^[a-f0-9-]{36}$/;
// 2026-11-02 user decision: a failed or cancelled payment sends the fan back to the membership checkout. Toss failUrl codes
// (docs.tosspayments.com/guides/v2/payment-window/integration) map to fixed wording; the provider message in the URL is not shown.
const failureMessages:Record<string,string>={PAY_PROCESS_CANCELED:'결제를 취소했습니다.',PAY_PROCESS_ABORTED:'결제가 중단되었습니다. 잠시 후 다시 시도해주세요.',REJECT_CARD_COMPANY:'카드사에서 결제를 승인하지 않았습니다. 카드 정보와 한도를 확인하거나 다른 카드로 결제해주세요.'};
export const paymentPendingMessage='결제 결과를 확인하고 있습니다. 같은 결제가 두 번 청구되지는 않습니다. 잠시 후 다시 확인해주세요.';
type Status='loading'|'success'|'error'|'cancelled';
export function useOneTimePayment(success:boolean,signedIn:boolean){
 const query=useSearchParams(),router=useRouter(),input=useRef<{id:string;orderId:string;amount:number;paymentKey:string}|null>(null),busy=useRef(false),done=useRef(false);
 const [state,setState]=useState<{status:Status;message:string;returnPath:string}>({status:success?'loading':'cancelled',message:success?'결제를 확인하고 있습니다.':'결제가 완료되지 않았습니다.',returnPath:'/service/subscriptions'});
 useEffect(()=>{if(input.current)return;const id=query.get('id')||'';input.current={id,orderId:query.get('orderId')||'',amount:Number(query.get('amount')),paymentKey:query.get('paymentKey')||''};const failure=failureMessages[query.get('code')||''];setState(s=>({...s,returnPath:orderPattern.test(id)?`/service/checkout/${id}`:'/service/subscriptions',...(!success?{message:failure||'결제가 완료되지 않았습니다. 다시 결제해주세요.'}:{})}));router.replace(`/service/payment/${success?'success':'fail'}${orderPattern.test(id)?`?id=${id}`:''}`,{scroll:false});},[query,router,success]);
 // The success URL loses paymentKey after the first read (and on refresh), so the stored order decides what the fan sees.
 async function showOrder(id:string){const response=await api<{status:string}>(`/checkout/${id}`);if(!response.success){setState(s=>({...s,status:'error',message:response.errorMessage}));return;}if(response.data.status==='paid'){done.current=true;setState(s=>({...s,status:'success',message:'가입이 완료되었습니다.'}));}else if(response.data.status==='processing')setState(s=>({...s,status:'error',message:paymentPendingMessage}));else setState(s=>({...s,status:'cancelled',message:'결제가 완료되지 않았습니다. 다시 결제해주세요.'}));}
 async function confirm(){if(busy.current||done.current||!input.current)return;busy.current=true;try{const {id,...body}=input.current;if(!orderPattern.test(id)){setState(s=>({...s,status:'error',message:'결제 요청을 찾을 수 없습니다. 내 구독에서 결제 내역을 확인해주세요.'}));return;}setState(s=>({...s,status:'loading',message:'결제를 확인하고 있습니다.'}));if(!body.paymentKey){await showOrder(id);return;}const response=await api<{message:string}>(`/checkout/${id}/confirm`,body);if(response.success){done.current=true;input.current.paymentKey='';}setState(s=>({...s,status:response.success?'success':'error',message:response.success?response.data.message:['PAYMENT_UNCERTAIN','PAYMENT_IN_PROGRESS'].includes(response.errorCode||'')?paymentPendingMessage:response.errorMessage}));}finally{busy.current=false;}}
 useEffect(()=>{if(success&&signedIn)void confirm();},[success,signedIn]);
 const restart=state.status==='cancelled'&&state.returnPath.startsWith('/service/checkout/');
 return{...state,retryLabel:restart?'다시 결제하기':undefined,retry:restart?async()=>router.push(state.returnPath):confirm};
}
