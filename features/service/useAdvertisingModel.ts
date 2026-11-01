'use client';
import {useEffect,useState,useCallback} from 'react';
import {platformRequest} from '@/lib/api/platform';
import type {AdProduct,AdvertisingModel} from '@/types/crefans-advertising';
export function useAdvertisingModel():AdvertisingModel{
 const [products,setProducts]=useState<AdProduct[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const refresh=useCallback(async()=>{setLoading(true);const result=await platformRequest<AdProduct[]>('/studio/advertising/products');if(result.success){setProducts(result.data);setError('');}else{setProducts([]);setError(result.errorMessage);}setLoading(false);},[]);
 useEffect(()=>{void refresh();},[refresh]);
 return{products,orders:[],loading,error,purchaseReady:false,guidance:'광고상품 구매 기능을 준비 중입니다.',refresh,purchase:async()=>({success:false,data:null,errorCode:'AD_PURCHASE_POLICY_REQUIRED',errorMessage:'결제수단과 광고 시작 방식 확인이 필요합니다.'})};
}
