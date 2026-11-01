'use client';
import {useState} from 'react';
import {SelectField} from '@/components/ui/SelectField';
import {DashboardPage} from '@/components/crefans/studio/DashboardPage';
import {useMockOverview} from '@/components/preview/studio/useMockOverview';
import s from './custom.module.css';

export function StudioDashboardExample(){
 const [state,setState]=useState('normal');
 const model=useMockOverview(undefined,()=>{}),empty=state==='empty';
 const example={...model,profile:{...model.profile,name:state==='long'?'매일 새로운 이야기를 들려주는 크리에이터의 아주 긴 활동명':'하늘',avatar:'/illustrations/redesign/variety/haneul-courtyard-v3.png'},metrics:model.metrics.map(metric=>({...metric,value:empty?'0':metric.value})),tasks:empty?[]:model.tasks,activities:empty?[]:model.activities,contentPerformance:empty?[]:model.contentPerformance};
 return <section className={s.section} id="studio-dashboard"><div className={s.sectionHeading}><h2>스튜디오 빠른 작업 대시보드</h2><p>게시물 작성과 주요 작업을 먼저 배치하고, 주입된 지표·활동·게시물 성과를 표시합니다. 아래 내용은 예시 데이터입니다.</p></div><SelectField label="대시보드 데이터 상태" value={state} onChange={setState} options={[{value:'normal',label:'일반'},{value:'empty',label:'첫 이용 · 빈 목록'},{value:'long',label:'긴 활동명'}]}/><div style={{marginTop:24}}><DashboardPage model={example} basePath="/preview/studio"/></div></section>;
}
