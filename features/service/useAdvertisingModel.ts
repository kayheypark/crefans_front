'use client';
import {useEffect,useState,useCallback,useRef} from 'react';
import {platformRequest} from '@/lib/api/platform';
import type {AdProduct,AdPurchase,AdvertisingModel} from '@/types/crefans-advertising';
export function useAdvertisingModel():AdvertisingModel{
 const [products,setProducts]=useState<AdProduct[]>([]),[orders,setOrders]=useState<AdPurchase[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),sequence=useRef(0);
 const refresh=useCallback(async()=>{const request=++sequence.current;setLoading(true);try{const [catalog,history]=await Promise.all([platformRequest<AdProduct[]>('/studio/advertising/products'),platformRequest<AdPurchase[]>('/studio/advertising/orders')]);if(request!==sequence.current)return;if(catalog.success&&history.success){setProducts(catalog.data);setOrders(history.data);setError('');}else setError(!catalog.success?catalog.errorMessage:!history.success?history.errorMessage:'광고상품을 불러오지 못했습니다.');}catch{if(request===sequence.current)setError('광고상품을 불러오지 못했습니다. 다시 확인해주세요.');}finally{if(request===sequence.current)setLoading(false);}},[]);
 useEffect(()=>{void refresh();return()=>{sequence.current++;};},[refresh]);
 useEffect(()=>{const ends=orders.flatMap(order=>[order.endsAt,order.blockedUntil]).filter((value):value is string=>!!value).map(Date.parse).filter(value=>value>Date.now());if(!ends.length)return;const timer=setTimeout(()=>void refresh(),Math.min(Math.min(...ends)-Date.now()+1000,2147483647));return()=>clearTimeout(timer);},[orders,refresh]);
 return{products,orders,loading,error,purchaseReady:false,guidance:'광고상품 구매 기능을 준비 중입니다.',refresh,activate:async order=>{const result=await platformRequest<AdPurchase>(`/studio/advertising/orders/${encodeURIComponent(order.id)}/use`,{method:'POST',body:{}});if(result.success)setOrders(previous=>previous.map(item=>item.id===result.data.id?result.data:{...item,blockedUntil:item.useStatus==='ready'?result.data.endsAt:null}));await refresh();return result;},purchase:async()=>({success:false,data:null,errorCode:'AD_PURCHASE_POLICY_REQUIRED',errorMessage:'광고상품 결제 기능을 준비 중입니다.'})};
}
