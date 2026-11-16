'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {getPaymentMethods} from '@/lib/api/payments';
import type {PaymentMethods} from '@/types/crefans-payments';
/** GET /payments/methods: undefined while loading, null when it could not be read (the checkout then shows 결제 준비 중). */
export function usePaymentMethods(enabled=true){
 const [methods,setMethods]=useState<PaymentMethods|null|undefined>(undefined),sequence=useRef(0);
 const refresh=useCallback(async()=>{if(!enabled)return;const request=++sequence.current;const result=await getPaymentMethods();if(request===sequence.current)setMethods(result.success?result.data:null);},[enabled]);
 useEffect(()=>{void refresh();return()=>{sequence.current++;};},[refresh]);
 return{methods,refresh};
}
