'use client';
import {useSearchParams} from 'next/navigation';
import {BeanPaymentResult} from '@/components/service/BeanPaymentResult';
import {BeanPaymentResultPage} from '@/components/crefans/BeanPaymentResultPage';
export function PreviewBeanPaymentResult({success}:{success:boolean}){
 const query=useSearchParams();
 if(!success||query.has('id'))return <BeanPaymentResult success={success}/>;
 return <BeanPaymentResultPage basePath="/preview" status="success" charge={{id:'00000000-0000-4000-8000-000000000100',quantity:100,amount:11000,status:'paid',environment:'test',createdAt:'2026-10-26T00:00:07Z'}} message="" onRetry={()=>{}}/>;
}
