import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import ServiceRouter from '@/components/service/ServiceRouter';
const titles:Record<string,string>={member:'팬 프로필',checkout:'멤버십 결제',billing:'결제수단 등록',screens:'화면 검수',explore:'탐색하기',creator:'크리에이터 프로필',membership:'멤버십 구독',signup:'회원가입',login:'로그인',feed:'홈',post:'게시물 상세',messages:'메시지',notifications:'알림',me:'내 프로필',subscriptions:'내 구독',settings:'설정',support:'고객센터',following:'팔로잉 목록',followers:'팔로워 목록','payment-methods':'결제수단 관리',notices:'공지사항',legal:'서비스 정책','reset-password':'비밀번호 재설정'};
export function generateMetadata({params}:{params:{screen:string[]}}):Metadata{return{title:`${titles[params.screen[0]]||'페이지'} · crefans`,robots:{index:false,follow:false}};}
export default function Page({params}:{params:{screen:string[]}}){
 const [screen,id]=params.screen,detail=['creator','membership','post','legal','checkout','billing','member'].includes(screen);
 const valid=titles[screen]&&(detail?params.screen.length===2:screen==='notices'?params.screen.length<=2:params.screen.length===1)&&(!(screen==='legal')||['terms','privacy','policy'].includes(id));
 if(!valid)notFound();return <ServiceRouter segments={params.screen}/>;
}
