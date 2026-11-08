'use client';
import {useState} from 'react';
import {SelectField} from '@/components/ui/SelectField';
import {AdvisorChat} from '@/components/crefans/AdvisorChat';
import {mockAdvisorAsk,type MockAdvisorMode} from '@/components/preview/service/advisor-fixtures';
import s from './custom.module.css';

// 고객센터 AI 가이드: 같은 AdvisorChat 에 대역 응답을 주입한다(실제 AI 호출 없음). 대화는 이 브라우저 저장소를 공유한다.
export function AdvisorChatCatalog(){
 const [mode,setMode]=useState<MockAdvisorMode>('normal');
 return <section className={s.section} id="advisor-chat-catalog">
  <div className={s.sectionHeading}><h2>AI 가이드</h2><p>고객센터의 떠 있는 버튼에서 여는 채팅입니다. 답변의 굵게 표시와 표만 해석하고, 질문 전 개인정보를 확인합니다. 환불·충전이 들어간 질문은 표 답변을 돌려줍니다.</p></div>
  <SelectField label="응답 상태" value={mode} onChange={value=>setMode(value as MockAdvisorMode)} options={[{value:'normal',label:'답변'},{value:'notFound',label:'관련 없음'},{value:'error',label:'오류(다시 시도)'},{value:'limit',label:'하루 한도 초과'}]}/>
  <div style={{height:640,maxWidth:420,marginTop:16,border:'1px solid var(--cf-color-border)',borderRadius:20,overflow:'hidden'}}><AdvisorChat key={mode} ask={mockAdvisorAsk(mode)} basePath="/preview"/></div>
 </section>;
}
