'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {platformRequest as api} from '@/lib/api/platform';
import type {ShopOrder} from '@/types/crefans-shop';
export function useShopPayment(){const query=useSearchParams(),id=query.get('id')||'',paymentKey=query.get('paymentKey'),orderId=query.get('orderId'),amount=query.get('amount'),result=query.get('result');const [order,setOrder]=useState<ShopOrder|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),running=useRef(false);
 const load=useCallback(async()=>{if(!id)return;const r=await api<ShopOrder>(`/studio/shop/orders/${encodeURIComponent(id)}`);if(r.success)setOrder(r.data);else setError(r.errorMessage);},[id]);
 const confirm=useCallback(async()=>{if(running.current||!id||!paymentKey||!orderId||!amount)return;running.current=true;setBusy(true);setError('');try{const r=await api<ShopOrder>(`/studio/shop/orders/${encodeURIComponent(id)}/confirm`,{paymentKey,orderId,amount:Number(amount)});if(r.success){setOrder(r.data);history.replaceState(null,'',`?id=${encodeURIComponent(id)}`);}else setError(r.errorMessage);}catch{setError('결제 결과를 확인 중이에요. 같은 주문으로 다시 확인해 주세요.');}finally{running.current=false;setBusy(false);}},[id,paymentKey,orderId,amount]);
 useEffect(()=>{if(result==='success')void confirm();else void load();},[confirm,load,result]);
 async function pay(){if(running.current)return;running.current=true;setBusy(true);setError('');try{const r=await api<{clientKey:string;customerKey:string;orderId:string;orderName:string;amount:number}>(`/studio/shop/orders/${encodeURIComponent(id)}/payment-window`,{});if(!r.success){setError(r.errorMessage);return;}const {loadTossPayments}=await import('@tosspayments/tosspayments-sdk');const sdk=await loadTossPayments(r.data.clientKey),url=`${location.origin}/service/studio/shop/pay?id=${encodeURIComponent(id)}`;await sdk.payment({customerKey:r.data.customerKey}).requestPayment({method:'CARD',orderId:r.data.orderId,orderName:r.data.orderName,amount:{currency:'KRW',value:r.data.amount},successUrl:url+'&result=success',failUrl:url+'&result=fail'});}catch{setError('결제창을 닫았거나 열지 못했어요. 같은 주문으로 다시 시도할 수 있어요.');}finally{running.current=false;setBusy(false);}}
 return {order,error,busy,result,paymentKey,load,confirm,pay};
}
