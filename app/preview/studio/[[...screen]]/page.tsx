import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import StudioRouter from '@/components/preview/studio/StudioRouter';
const titles:Record<string,string>={dashboard:'대시보드',start:'크리에이터 시작하기',content:'게시물',memberships:'멤버십',subscribers:'구독자',messages:'메시지',comments:'댓글',analytics:'통계 요약',reports:'리포트',earnings:'수익 현황',settlements:'정산 내역',withdraw:'출금 신청',withdrawals:'출금 내역',accounts:'정산 계좌',security:'출금 PIN 설정',settings:'크리에이터 설정'};
const reportTitles:Record<string,string>={revenue:'순수익 리포트',subscribers:'구독자 리포트',followers:'팔로워 리포트'};
export function generateMetadata({params}:{params:{screen?:string[]}}):Metadata{const [screen='dashboard',id='revenue']=params.screen||[];return{title:`${(screen==='reports'?reportTitles[id]:titles[screen])||'스튜디오'} · crefans studio`,robots:{index:false,follow:false}};}
export default function Page({params}:{params:{screen?:string[]}}){
 const parts=params.screen||[],[screen='dashboard',id,action]=parts;
 const valid=titles[screen]&&(parts.length<=1||screen==='reports'&&parts.length===2&&!!reportTitles[id]||screen==='content'&&(parts.length===2&&id==='new'||parts.length===3&&action==='edit'));
 if(!valid)notFound();return <StudioRouter segments={parts}/>;
}
