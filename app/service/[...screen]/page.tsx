import {SITE_NAME} from '@/lib/seo/site';
import type {Metadata} from 'next';
import {serviceEvents} from '@/lib/content/events';
import {notFound,redirect} from 'next/navigation';
import ServiceRouter from '@/components/service/ServiceRouter';
import {jsonLdText,serviceSeo} from '@/lib/seo/service-metadata';
const titles:Record<string,string>={events:'이벤트 안내',beans:'지갑',payment:'결제 결과',member:'팬 프로필',checkout:'멤버십 결제',billing:'결제수단 등록',screens:'화면 검수',explore:'탐색하기',creator:'크리에이터 프로필',membership:'멤버십 구독',signup:'회원가입',login:'로그인',feed:'홈',post:'게시물 상세',messages:'메시지',notifications:'알림',me:'내 프로필',subscriptions:'내 구독',settings:'설정',support:'고객센터',following:'팔로잉 목록',followers:'팔로워 목록','payment-methods':'결제수단 관리',notices:'공지사항',legal:'서비스 정책','reset-password':'비밀번호 재설정'};
const beanTitles:Record<string,string>={referral:'친구 초대 이벤트','referral-history':'초대 내역',charge:'콩 충전',success:'콩 충전 완료',fail:'콩 충전 결과',charges:'충전 내역',history:'콩 내역',tips:'후원 내역',withdraw:'콩 출금'};
const fallbackTitle=(screen:string[])=>`${screen[0]==='events'?(serviceEvents.find(event=>event.id===screen[1])?.title||titles.events):screen[0]==='beans'?beanTitles[screen[1]]||titles.beans:titles[screen[0]]||'페이지'} | ${SITE_NAME}`;
// Public screens are indexed with share previews; private screens keep a plain title and noindex (lib/seo, 2026-11-01).
export async function generateMetadata(props:{params:Promise<{screen:string[]}>}):Promise<Metadata>{const params=await props.params;return(await serviceSeo(params.screen[0],params.screen[1],fallbackTitle(params.screen))).metadata;}
export default async function Page(props:{params:Promise<{screen:string[]}>}){
 const params=await props.params;
 const [screen,id]=params.screen,detail=['creator','membership','post','legal','checkout','billing','payment','member'].includes(screen);
 const valid=titles[screen]&&(detail?params.screen.length===2:screen==='beans'?params.screen.length===1||params.screen.length===2&&['referral','referral-history','charge','success','fail','charges','history','tips','withdraw'].includes(id):['notices','events'].includes(screen)?params.screen.length<=2:screen==='signup'?params.screen.length===1||id==='complete'&&params.screen.length===2:params.screen.length===1)&&(!(screen==='legal')||['terms','privacy','policy'].includes(id));
 if(screen==='events'&&id==='beta-first'&&params.screen.length===2)redirect('/service/events');
 if(!valid||(screen==='events'&&id&&!serviceEvents.some(event=>event.id===id)))notFound();
 const {jsonLd}=await serviceSeo(screen,id,'');
 return <>{jsonLd.map((item,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLdText(item)}}/>)}<ServiceRouter segments={params.screen}/></>;
}
