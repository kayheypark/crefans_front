'use client';
import {useEffect,useRef,useState} from 'react';
import {useSearchParams,useRouter} from 'next/navigation';
import {platformRequest as api} from '@/lib/api/platform';
export {startOneTimePayment} from '@/lib/api/one-time-payment';
export function useOneTimePayment(success:boolean,signedIn:boolean){
 const query=useSearchParams(),router=useRouter(),input=useRef<{id:string;orderId:string;amount:number;paymentKey:string}|null>(null),busy=useRef(false),done=useRef(false);
 const [state,setState]=useState<{status:'loading'|'success'|'error'|'cancelled';message:string;returnPath:string}>({status:success?'loading':'cancelled',message:success?'결제를 확인하고 있습니다.':'결제가 완료되지 않았습니다.',returnPath:'/service/subscriptions'});
 useEffect(()=>{if(input.current)return;const id=query.get('id')||'';input.current={id,orderId:query.get('orderId')||'',amount:Number(query.get('amount')),paymentKey:query.get('paymentKey')||''};setState(s=>({...s,returnPath:/^[a-f0-9-]{36}$/.test(id)?`/service/checkout/${id}`:'/service/subscriptions'}));router.replace(`/service/payment/${success?'success':'fail'}${/^[a-f0-9-]{36}$/.test(id)?`?id=${id}`:''}`,{scroll:false});},[query,router,success]);
 async function confirm(){if(busy.current||done.current||!input.current)return;busy.current=true;try{const {id,...body}=input.current;if(!/^[a-f0-9-]{36}$/.test(id)||!body.paymentKey){setState(s=>({...s,status:'error',message:'결제 요청을 찾을 수 없습니다. 주문 내역을 확인해주세요.'}));return;}setState(s=>({...s,status:'loading'}));const response=await api<{message:string}>(`/checkout/${id}/confirm`,body);if(response.success){done.current=true;input.current.paymentKey='';}setState(s=>({...s,status:response.success?'success':'error',message:response.success?response.data.message:response.errorMessage}));}finally{busy.current=false;}}
 useEffect(()=>{if(success&&signedIn)void confirm();},[success,signedIn]);
 return{...state,retry:confirm};
}
