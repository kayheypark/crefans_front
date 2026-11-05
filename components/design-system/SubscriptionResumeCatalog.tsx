'use client';
import {useState} from 'react';
import {SelectField} from '@/components/ui/SelectField';
import {Action} from '@/components/crefans/ServiceUI';
import {SubscriptionResumeDialog} from '@/components/crefans/SubscriptionResumeDialog';
import s from './custom.module.css';

export function SubscriptionResumeCatalog(){
 const [state,setState]=useState('normal'),[open,setOpen]=useState(false),[agreed,setAgreed]=useState(false);
 return <section className={s.section} id="subscription-resume"><div className={s.sectionHeading}><h2>구독 다시 이용하기</h2><p>즉시 결제 없이 기존 종료일부터 자동 갱신합니다. 금액·다음 결제일 확인과 필수 동의를 제공합니다.</p></div><SelectField label="구독 재개 상태" value={state} onChange={setState} options={[{value:'normal',label:'일반 · 동의 전'},{value:'error',label:'기본 카드 없음'},{value:'busy',label:'재개 처리 중'},{value:'long',label:'긴 상품명'}]}/><Action variant="secondary" onClick={()=>{setAgreed(false);setOpen(true);}}>다시 이용할래요</Action><SubscriptionResumeDialog subscription={open?{id:'catalog-subscription',creatorId:'catalog-creator',planId:'catalog-plan',status:'cancelled',renewAt:'2030-02-05',price:10000}:null} planName={state==='long'?'사진과 영상으로 크리에이터의 모든 일상을 함께하는 아주 긴 이름의 멤버십':'맛집 탐험'} basePath="/preview" agreed={agreed||state==='busy'} pending={state==='busy'} error={state==='error'?'결제수단 관리에서 기본 카드를 등록해주세요.':''} onAgree={setAgreed} onClose={()=>setOpen(false)} onConfirm={()=>setOpen(false)}/></section>;
}
