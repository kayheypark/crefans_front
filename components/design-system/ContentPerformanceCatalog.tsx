'use client';
import {useState} from 'react';
import {SelectField} from '@/components/ui/SelectField';
import {ContentPerformance} from '@/components/crefans/studio/ContentPerformance';
import {useMockOverview} from '@/components/preview/studio/useMockOverview';
import s from './custom.module.css';
export function ContentPerformanceCatalog(){
 const [state,setState]=useState('normal'),model=useMockOverview(undefined,()=>{});
 const posts=state==='empty'?[]:model.contentPerformance.map(post=>state==='missing'?{...post,image:'',analytics:null}:state==='long'?{...post,title:'긴 제목과 큰 수치가 있는 게시물의 콘텐츠 성과를 확인합니다',views:123456789,analytics:post.analytics?{...post.analytics,feed:123456789}:null}:state==='zero'?{...post,views:0,likes:0,comments:0,analytics:{feed:0,detail:0,shared:0,kakao:0,copy:0,native:0,external:0,video:0,visits:0}}:post);
 return <section className={s.section} id="content-performance-catalog"><SelectField label="콘텐츠 성과 데이터 상태" value={state} onChange={setState} options={[{value:'normal',label:'일반'},{value:'empty',label:'게시물 없음'},{value:'missing',label:'세부 통계 없음'},{value:'zero',label:'집계 0'},{value:'long',label:'긴 제목·큰 수치'}]}/><ContentPerformance key={state} posts={posts}/></section>;
}
