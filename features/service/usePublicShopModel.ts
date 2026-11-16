'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {platformRequest as api} from '@/lib/api/platform';
import type {ShopModel,ShopProduct} from '@/types/crefans-shop';
// 2026-11-17 user decision: visitors browse the shop without signing in. Read-only: the public product list and whether monthly
// plans are on sale. Buying always sends the visitor to sign in first (ShopPage `onGuest`), so the actions below never run.
const signedOut={success:false as const,data:null,errorCode:'AUTH_REQUIRED',errorMessage:'로그인 후 이용할 수 있어요.'};
export function usePublicShopModel():ShopModel{
 const [products,setProducts]=useState<ShopProduct[]>([]),[available,setAvailable]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(''),sequence=useRef(0);
 const refresh=useCallback(async()=>{const seq=++sequence.current;setLoading(true);try{const r=await api<{products:ShopProduct[];subscriptionsAvailable:boolean}>('/shop/products');if(seq!==sequence.current)return;if(r.success){setProducts(r.data.products);setAvailable(r.data.subscriptionsAvailable);setError('');}else setError(r.errorMessage);}catch{if(seq===sequence.current)setError('상품을 불러오지 못했어요.');}finally{if(seq===sequence.current)setLoading(false);}},[]);
 useEffect(()=>{void refresh();return()=>{sequence.current++;};},[refresh]);
 return{products,orders:[],loading,error,refresh,subscriptions:{available,items:[]},refund:async()=>signedOut,purchase:async()=>signedOut};
}
