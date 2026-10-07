'use client';
import {useEffect,useRef,useState} from 'react';
import {useSearchParams,useRouter} from 'next/navigation';
import {billingAttemptKey,readBillingCallback,type BillingAttempt} from '@/lib/api/billing';
import {platformRequest as api} from '@/lib/api/platform';
export function useCheckoutModel(id:string,refresh:()=>Promise<void>){
 const [order,setOrder]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{let alive=true;void api<any>(`/checkout/${encodeURIComponent(id)}`).then(r=>{if(alive){if(r.success)setOrder(r.data);else setError(r.errorMessage);}});return()=>{alive=false;};},[id]);
 async function pay(){if(busy)return;setBusy(true);setError('');try{const result=await api<any>(`/checkout/${encodeURIComponent(id)}/pay`,{});if(result.success){setOrder(result.data.order);await refresh();}else setError(result.errorMessage);}finally{setBusy(false);}}
 return{order,error,busy,pay,setError};
}
export function useBillingResult(success:boolean,refresh:()=>Promise<void>,signedIn=true){
 const query=useSearchParams(),router=useRouter(),started=useRef(false),captured=useRef<ReturnType<typeof readBillingCallback>|null>(null);
 const [result,setResult]=useState({status:(success?'loading':'cancelled') as 'loading'|'success'|'error'|'cancelled',message:success?'카드 등록을 확인하고 있습니다.':'카드 등록을 취소했습니다.',returnPath:'/service/payment-methods',code:''});
 async function confirm(){const input=captured.current;if(!input?.attempt){setResult(previous=>({...previous,status:'error',message:'카드 등록 요청을 찾을 수 없습니다. 새로 진행해주세요.',code:'REGISTRATION_EXPIRED'}));return;}setResult(previous=>({...previous,status:'loading',message:'카드 등록을 확인하고 있습니다.'}));const response=await api<{message:string;returnPath:string}>('/billing/methods',{...input.attempt,authKey:input.authKey});if(response.success){setResult({status:'success',message:response.data.message,returnPath:response.data.returnPath,code:''});await refresh();}else setResult(previous=>({...previous,status:'error',message:response.errorMessage,code:response.errorCode}));}
 useEffect(()=>{if(started.current)return;started.current=true;let saved:BillingAttempt|null=null;try{saved=JSON.parse(sessionStorage.getItem(billingAttemptKey)||'null');}catch{}const input=readBillingCallback(new URLSearchParams(query.toString()),saved);captured.current=input;if(input.attempt){sessionStorage.setItem(billingAttemptKey,JSON.stringify(input.attempt));setResult(previous=>({...previous,returnPath:input.attempt!.returnPath}));}router.replace(`/service/billing/${success?'success':'fail'}`,{scroll:false});if(success){if(signedIn)void confirm();}else setResult(previous=>({...previous,status:input.code==='PAY_PROCESS_CANCELED'||!input.code?'cancelled':'error',message:input.code==='PAY_PROCESS_CANCELED'||!input.code?'카드 등록을 취소했습니다.':'카드 인증에 실패했습니다. 카드 정보를 확인하고 다시 등록해주세요.',code:'REGISTRATION_FAILED'}));},[success,query,router]);
 return{...result,retry:confirm,start:()=>setResult(previous=>({...previous,status:'loading',message:'카드 등록창을 열고 있습니다.'})),setFailure:(message:string,code:string)=>setResult(previous=>({...previous,status:'error',message,code}))};
}
