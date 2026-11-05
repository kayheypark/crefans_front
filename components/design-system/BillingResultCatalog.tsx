'use client';
import {useState} from 'react';
import {SelectField} from '@/components/ui/SelectField';
import {BillingRegistrationResultPage} from '@/components/crefans/CommonPages';
import s from './custom.module.css';
export function BillingResultCatalog(){
 const [state,setState]=useState('success');
 const status=state==='management'?'success':state as 'success'|'loading'|'error'|'cancelled';
 const messages={success:'카드 등록이 완료됐어요',loading:'카드 등록을 확인하고 있습니다.',error:'카드 등록 결과를 확인하지 못했습니다. 다시 확인해주세요.',cancelled:'카드 등록을 취소했습니다.'};
 return <section className={s.section} id="billing-result"><div className={s.sectionHeading}><h2>카드 등록 완료</h2><p>회원가입 완료와 같은 체크 아이콘, 명시적인 이전 화면 복귀 버튼을 사용합니다.</p></div><SelectField label="카드 등록 결과 상태" value={state} onChange={setState} options={[{value:'success',label:'완료 · 결제로 복귀'},{value:'management',label:'완료 · 카드 관리로 복귀'},{value:'loading',label:'확인 중'},{value:'error',label:'확인 실패'},{value:'cancelled',label:'등록 취소'}]}/><BillingRegistrationResultPage basePath="/preview" status={status} message={messages[status]} returnPath={state==='management'?'/preview/payment-methods':'/preview/checkout'} onRetry={()=>setState('loading')}/></section>;
}
