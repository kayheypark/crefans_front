'use client';
import {Suspense} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {usePreview,usePreviewCommon} from './PreviewProvider';
import ServiceShell from '@/components/crefans/ServiceShell';
import {SignupPage,LoginPage,MyProfilePage,SettingsPage,SupportPage} from '@/components/crefans/AccountPages';
import {FeedPage,PostDetailPage,MessagesPage,NotificationsPage} from '@/components/crefans/SocialPages';
import {ExplorePage,CreatorProfilePage,MembershipPage,SubscriptionsPage} from '@/components/crefans/CreatorPages';
import {FollowingPage,FollowersPage,NoticesPage,NoticeDetailPage,LegalPage,PasswordResetPage,PaymentMethodsPage,CommonNavigation} from '@/components/crefans/CommonPages';
import type {LegalKind} from '@/types/crefans-common';
import s from '@/components/crefans/service.module.css';
export {screenLinks} from '../screen-catalog';
import {screenLinks,studioLinks,commonLinks} from '../screen-catalog';
function Screens(){return <section className={s.catalogue}><h1>전체 화면</h1><p>팬 서비스와 크리에이터 스튜디오의 각 화면으로 이동합니다.</p>{[['팬 서비스',screenLinks],['크리에이터 스튜디오',studioLinks],['공통 기능',commonLinks]].map(([title,items])=><section key={String(title)}><h2 style={{marginTop:36}}>{String(title)}</h2><div className={s.screenGrid}>{(items as string[][]).map(([path,title,description],index)=><Link key={path} href={`/preview/${path}`}><small>{String(index+1).padStart(2,'0')}</small><h2>{title} ↗</h2><p>{description}</p></Link>)}</div></section>)}</section>;}
export default function ServiceRouter({segments}:{segments:string[]}){
 const model=usePreview(),common=usePreviewCommon(),query=useSearchParams(),[screen,id]=segments,basePath=model.basePath;
 function content(){switch(screen){
  case 'explore':return <ExplorePage model={model}/>;
  case 'creator':return <CreatorProfilePage model={model} id={id}/>;
  case 'membership':return <MembershipPage model={model} id={id} initialPlanId={query.get('plan')||undefined}/>;
  case 'signup':return <SignupPage model={model}/>;
  case 'login':return <LoginPage model={model}/>;
  case 'feed':return <FeedPage model={model}/>;
  case 'post':return <PostDetailPage model={model} id={id} forceLocked={query.get('locked')==='1'}/>;
  case 'messages':return <MessagesPage model={model}/>;
  case 'notifications':return <NotificationsPage model={model}/>;
  case 'me':return <MyProfilePage model={model}/>;
  case 'subscriptions':return <SubscriptionsPage model={model}/>;
  case 'settings':return <SettingsPage model={model}/>;
  case 'support':return <><SupportPage model={model}/><CommonNavigation basePath={basePath}/></>;
  case 'following':return <FollowingPage model={model}/>;
  case 'followers':return <FollowersPage model={model}/>;
  case 'payment-methods':return <PaymentMethodsPage model={common} basePath={basePath}/>;
  case 'notices':return id?<NoticeDetailPage id={id} model={common} basePath={basePath}/>:<NoticesPage model={common} basePath={basePath}/>;
  case 'legal':return <LegalPage kind={id as LegalKind} model={common} basePath={basePath}/>;
  case 'reset-password':return <PasswordResetPage model={common} basePath={basePath}/>;
  default:return <Screens/>;
 }}
 return <ServiceShell model={model} active={screen} auth={['signup','login','reset-password'].includes(screen)}><Suspense fallback={<p className={s.loading}>화면을 준비하고 있어요.</p>}>{content()}</Suspense></ServiceShell>;
}
