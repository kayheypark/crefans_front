import {SITE_NAME} from '@/lib/seo/site';
import type {Metadata} from 'next';
import {serviceEvents} from '@/lib/content/events';
import {notFound,redirect} from 'next/navigation';
import ServiceRouter from '@/components/preview/service/ServiceRouter';
const titles:Record<string,string>={events:'이벤트 안내',beans:'지갑',guide:'이용안내',screens:'화면 검수',explore:'탐색하기',creator:'크리에이터 프로필',membership:'멤버십 구독',signup:'회원가입',login:'로그인',feed:'홈',post:'게시물 상세',messages:'메시지',notifications:'알림',me:'내 프로필',subscriptions:'내 구독',settings:'설정',support:'고객센터',following:'팔로잉 목록',followers:'팔로워 목록','payment-methods':'결제수단 관리',notices:'공지사항',legal:'서비스 정책','reset-password':'비밀번호 재설정'};
const beanTitles:Record<string,string>={referral:'친구 초대 이벤트','referral-history':'초대 내역',charge:'콩 충전',success:'콩 충전 완료',fail:'콩 충전 결과',charges:'충전 내역',history:'콩 내역',tips:'후원 내역',withdraw:'콩 출금'};
export async function generateMetadata(props:{params:Promise<{screen:string[]}>}):Promise<Metadata>{const params=await props.params;return{title:`${params.screen[0]==='events'?(serviceEvents.find(event=>event.id===params.screen[1])?.title||titles.events):params.screen[0]==='beans'?beanTitles[params.screen[1]]||titles.beans:titles[params.screen[0]]||'페이지'} | ${SITE_NAME}`,robots:{index:false,follow:false}};}
export default async function Page(props:{params:Promise<{screen:string[]}>}){
 const params=await props.params;
 const [screen,id]=params.screen,detail=['guide','creator','membership','post','legal'].includes(screen);
 const valid=titles[screen]&&(detail?params.screen.length===2:screen==='beans'?params.screen.length===1||params.screen.length===2&&['referral','referral-history','charge','success','fail','charges','history','tips','withdraw'].includes(id):['notices','events'].includes(screen)?params.screen.length<=2:screen==='signup'?params.screen.length===1||id==='complete'&&params.screen.length===2:params.screen.length===1)&&(!(screen==='legal')||['terms','privacy','policy'].includes(id));
 if(screen==='events'&&id==='beta-first'&&params.screen.length===2)redirect('/preview/events');
 if(!valid||(screen==='events'&&id&&!serviceEvents.some(event=>event.id===id))||(screen==='guide'&&!['fan','creator'].includes(id)))notFound();return <ServiceRouter segments={params.screen}/>;
}
