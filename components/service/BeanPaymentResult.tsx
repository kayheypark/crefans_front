'use client';
import {useSearchParams} from 'next/navigation';
import {useBeans} from '@/components/crefans/BeanContext';
import {BeanPaymentResultPage} from '@/components/crefans/BeanPaymentResultPage';
import {SignInPrompt} from '@/components/crefans/SignInPrompt';
import {useBeanPaymentResult} from '@/features/service/useBeanPaymentResult';
export function BeanPaymentResult({success}:{success:boolean}){const query=useSearchParams();return <Result key={`${success}:${query.get('id')||''}`} success={success}/>;}
function Result({success}:{success:boolean}){
 const model=useBeans(),state=useBeanPaymentResult(model,success);
 if(!model?.enabled)return <p>콩 후원을 준비 중입니다.</p>;
 if(!model.signedIn)return <SignInPrompt basePath={model.basePath}/>;
 return <BeanPaymentResultPage basePath={model.basePath} {...state} onRetry={()=>void state.retry()}/>;
}
