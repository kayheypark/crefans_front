'use client';
import {useState} from 'react';
import {SelectField} from '@/components/ui/SelectField';
import {PreviewMembershipCheckout} from '@/components/preview/service/PreviewMembershipCheckout';
import s from './custom.module.css';

export function MembershipCheckoutCatalog(){
 const [state,setState]=useState('normal');
 return <section className={s.section} id="membership-checkout"><div className={s.sectionHeading}><h2>멤버십 결제</h2><p>상품·결제수단의 섹션 구분과 상세 조건 펼침. 실제 결제 요청 없이 화면 상태를 확인합니다.</p></div><SelectField label="결제 화면 상태" value={state} onChange={setState} options={[{value:'normal',label:'일반 · 동의 전'},{value:'empty',label:'등록된 카드 없음'},{value:'invalid-card',label:'카드 갱신 필요'},{value:'busy',label:'결제 확인 중'},{value:'processing',label:'결과 조회'},{value:'error',label:'결제 오류'},{value:'loading',label:'주문 조회 중'},{value:'long',label:'긴 상품명'},{value:'paid',label:'멤버십 가입 완료'},{value:'paid-one-time',label:'한 달 이용 가입 완료'}]}/><div style={{marginTop:24,paddingInline:16}}><PreviewMembershipCheckout key={state} state={state}/></div></section>;
}
