'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {getPaymentMethods} from '@/lib/api/payments';
import type {PaymentMethods} from '@/types/crefans-payments';
/** GET /payments/methods: undefined while loading, null when it could not be read (the checkout then shows 결제 준비 중). */
export function usePaymentMethods(enabled=true,kind?:'bean'){
 const [methods,setMethods]=useState<PaymentMethods|null|undefined>(undefined),sequence=useRef(0);
 const refresh=useCallback(async()=>{if(!enabled)return;const request=++sequence.current;const result=await getPaymentMethods(kind);if(request===sequence.current)setMethods(result.success?result.data:null);},[enabled,kind]);
 useEffect(()=>{void refresh();return()=>{sequence.current++;};},[refresh]);
 return{methods,refresh};
}
