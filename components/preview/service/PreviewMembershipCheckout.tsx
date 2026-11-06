'use client';
import {useState} from 'react';
import {MembershipCheckout,type MembershipCheckoutOrder} from '@/components/crefans/MembershipCheckout';

export function PreviewMembershipCheckout({state='normal'}:{state?:string}){
 const [agreed,setAgreed]=useState(false),[paid,setPaid]=useState(state.startsWith('paid')),[card,setCard]=useState(state!=='empty');
 const [singleMonth,setSingleMonth]=useState(state==='paid-one-time');
 const order:MembershipCheckoutOrder={id:'preview-checkout',amount:10000,status:paid?'paid':state==='processing'?'processing':'pending',snapshot:{name:state==='long'?'매일 새로운 이야기를 함께 나누는 크리에이터의 멤버십':'맛집 탐험',creatorId:'haneul',benefits:['멤버십 전용 게시물 이용'],refundWindowDays:7,paymentEnvironment:'test',paymentMode:singleMonth?'one-time':undefined}};
 return <MembershipCheckout basePath="/preview" order={state==='loading'?null:order} error={state==='error'?'결제를 완료하지 못했습니다. 잠시 후 다시 시도해주세요.':''} defaultMethod={card?{label:'기본 카드',requiresUpdate:state==='invalid-card'}:undefined} canRegister={state!=='loading'} busy={state==='busy'} registering={false} agreed={agreed} onAgree={setAgreed} onRegister={()=>setCard(true)} onPay={()=>setPaid(true)} onOneTime={()=>{setSingleMonth(true);setPaid(true);}}/>;
}
