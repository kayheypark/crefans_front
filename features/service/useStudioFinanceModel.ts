'use client';
import {useCallback,useEffect,useState} from 'react';
import {verifyIdentity} from '@/lib/api/identity';
import {platformRequest as api} from '@/lib/api/platform';
import type {ApiResult} from '@/types/crefans';
import type {StudioFinanceModel} from '@/types/crefans-studio-finance';
type StudioAction=<T={message:string}>(path:string,body?:unknown,method?:string)=>Promise<ApiResult<T>>;
export const seoulToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
// Shared by the studio and the fan bean-withdrawal page; `action` refreshes whatever the caller loaded.
export function studioFinanceModel(financial:any,today:string,action:StudioAction):StudioFinanceModel{return{mode:'live',today,data:financial,pinConfigured:financial.pinConfigured,setupWithdrawalPin:async pin=>{const identity=await verifyIdentity('withdrawal-pin');if(!identity.success)return identity;return action('/studio/pin',{pin,identityProof:identity.data.proof});},verifyWithdrawalPin:(pin,input)=>api('/studio/withdraw/verify',{...input,pin}),reviewWithdrawal:input=>api('/studio/withdraw/review',input),requestWithdrawal:input=>action('/studio/withdraw',input),saveAccount:(input,id)=>action('/studio/accounts',{...input,id}),verifyAccount:id=>action(`/studio/accounts/${encodeURIComponent(id)}/verify`,{}),setDefaultAccount:id=>action(`/studio/accounts/${encodeURIComponent(id)}/default`,{},'PUT')};}
// Finance only (accounts, PIN): members with referral reward beans may use it without a creator profile.
export function useStudioFinanceModel(signedIn:boolean){
 const [financial,setFinancial]=useState<any>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),today=seoulToday();
 const refresh=useCallback(async()=>{if(!signedIn){setFinancial(null);setLoading(false);return;}setError('');const r=await api<any>('/studio/finance');if(r.success)setFinancial(r.data);else setError(r.errorMessage);setLoading(false);},[signedIn]);
 useEffect(()=>{void refresh();},[refresh]);
 const action:StudioAction=async(path,body,method)=>{const r=await api<any>(path,body,method);if(r.success)await refresh();return r;};
 return{finance:financial?studioFinanceModel(financial,today,action):null,error,loading,refresh};
}
