'use client';
import {useOneTimePayment} from '@/features/service/useOneTimePayment';
import {BillingRegistrationResultPage} from '@/components/crefans/CommonPages';
import {SignInPrompt} from '@/components/crefans/AccountPages';
import {useService} from './ServiceProvider';
export function PaymentResult({success}:{success:boolean}){
 const {model}=useService(),result=useOneTimePayment(success,model.signedIn);
 if(!model.signedIn)return <SignInPrompt basePath="/service"/>;
 return <BillingRegistrationResultPage kind="payment" {...result} onRetry={()=>void result.retry()}/>;
}
