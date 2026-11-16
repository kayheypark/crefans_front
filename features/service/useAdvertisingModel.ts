'use client';
import {useEffect,useState,useCallback,useRef} from 'react';
import {platformRequest} from '@/lib/api/platform';
import {getBankTransfer} from '@/lib/api/payments';
import {usePaymentMethods} from './usePaymentMethods';
import type {AdProduct,AdPurchase,AdvertisingModel} from '@/types/crefans-advertising';
export function useAdvertisingModel():AdvertisingModel{
 const [products,setProducts]=useState<AdProduct[]>([]),[orders,setOrders]=useState<AdPurchase[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),sequence=useRef(0),keys=useRef<Record<string,string>>({}),payments=usePaymentMethods();
 const refresh=useCallback(async()=>{const request=++sequence.current;setLoading(true);try{const [catalog,history]=await Promise.all([platformRequest<AdProduct[]>('/studio/advertising/products'),platformRequest<AdPurchase[]>('/studio/advertising/orders')]);if(request!==sequence.current)return;if(catalog.success&&history.success){setProducts(catalog.data);setOrders(history.data);setError('');}else setError(!catalog.success?catalog.errorMessage:!history.success?history.errorMessage:'광고상품을 불러오지 못했습니다.');}catch{if(request===sequence.current)setError('광고상품을 불러오지 못했습니다. 다시 확인해주세요.');}finally{if(request===sequence.current)setLoading(false);}},[]);
 useEffect(()=>{void refresh();return()=>{sequence.current++;};},[refresh]);
 useEffect(()=>{const ends=orders.flatMap(order=>[order.endsAt,order.blockedUntil]).filter((value):value is string=>!!value).map(Date.parse).filter(value=>value>Date.now());if(!ends.length)return;const timer=setTimeout(()=>void refresh(),Math.min(Math.min(...ends)-Date.now()+1000,2147483647));return()=>clearTimeout(timer);},[orders,refresh]);
 // 2026-11-16: ad products are sold by bank transfer only; buying opens once the company account is set.
 const methods=payments.methods;
 return{products,orders,loading,error,purchaseReady:!!methods?.bankTransfer,guidance:methods===undefined||methods?.bankTransfer?undefined:'결제 준비 중이에요. 결제 방법이 준비되면 구매할 수 있어요.',paymentMethods:methods,refreshPaymentMethods:payments.refresh,bankTransfer:id=>getBankTransfer('ad',id),refresh,activate:async order=>{const result=await platformRequest<AdPurchase>(`/studio/advertising/orders/${encodeURIComponent(order.id)}/use`,{method:'POST',body:{}});if(result.success)setOrders(previous=>previous.map(item=>item.id===result.data.id?result.data:{...item,blockedUntil:item.useStatus==='ready'?result.data.endsAt:null}));await refresh();return result;},purchase:async(product,payment)=>{const key=product.id+':'+product.version;keys.current[key] ||=crypto.randomUUID();const result=await platformRequest<AdPurchase>('/studio/advertising/orders',{productId:product.id,version:product.version,requestId:keys.current[key],...payment});if(result.success||result.errorCode!=='NETWORK_ERROR')delete keys.current[key];if(!result.success&&result.errorCode==='BANK_TRANSFER_UNAVAILABLE')await payments.refresh();if(result.success)await refresh();return result;},
 refund:async(order,refundAccount)=>{const result=await platformRequest<AdPurchase>(`/studio/advertising/orders/${encodeURIComponent(order.id)}/refund`,{refundAccount});await refresh();return result;}};
}
