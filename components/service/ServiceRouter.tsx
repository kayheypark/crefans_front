'use client';
import {EventsPage,EventDetailPage} from '@/components/crefans/EventPages';
import {serviceEvents} from '@/lib/content/events';
import {ProfileConnectionsPage} from '@/components/crefans/ProfileConnectionsPage';
import {loadProfileConnections} from '@/features/service/profile-connections';
import {BeanChargePage} from '@/components/crefans/BeanChargePage';
import {SignupCompletePage} from '@/components/crefans/SignupCompletePage';
import {BeanWalletPage,BeanHistoryPage} from '@/components/crefans/BeanWalletPages';
import {BeanPaymentResult} from '@/components/service/BeanPaymentResult';
import {ServiceGuidePage} from '@/components/crefans/ServiceGuidePage';
import {Suspense} from 'react';
import {BeanWithdrawContainer} from './BeanWithdrawContainer';
import {useRouter,useSearchParams} from 'next/navigation';
import PublicMemberPage from '@/components/crefans/PublicMemberPage';
import {useService} from './ServiceProvider';
import {PaymentResult} from './PaymentResult';
import {CheckoutPage,BillingResult} from './CheckoutPage';
import ServiceShell from '@/components/crefans/ServiceShell';
import {SignupPage,LoginPage,MyProfilePage,SettingsPage,SupportPage,SignInPrompt} from '@/components/crefans/AccountPages';
import {FeedPage,PostDetailPage,MessagesPage,NotificationsPage} from '@/components/crefans/SocialPages';
import {ExplorePage,CreatorProfilePage,MembershipPage,SubscriptionsPage} from '@/components/crefans/CreatorPages';
import {FollowingPage,FollowersPage,NoticesPage,NoticeDetailPage,LegalPage,PasswordResetPage,PaymentMethodsPage,CommonNavigation} from '@/components/crefans/CommonPages';
import type {LegalKind} from '@/types/crefans-common';
import s from '@/components/crefans/service.module.css';


export default function ServiceRouter({segments}:{segments:string[]}){
 const {model,common,loading,error,refresh,publicProfile}=useService(),query=useSearchParams(),router=useRouter(),[screen,id]=segments,basePath=model.basePath;
 function content(){if(loading)return <p role="status">불러오는 중…</p>;if(!model.signedIn&&!(['following','followers'].includes(screen)&&query.get('profile'))&&['messages','notifications','me','subscriptions','settings','following','followers','payment-methods','checkout','beans'].includes(screen))return <SignInPrompt basePath={basePath}/>;switch(screen){
  case 'checkout':return <CheckoutPage id={id}/>;
  case 'payment':return <PaymentResult success={id==='success'}/>;
  case 'billing':return <BillingResult success={id==='success'}/>;
  case 'guide':return <ServiceGuidePage audience={id==='creator'?'creator':'fan'} basePath={basePath}/>;
  case 'explore':return <ExplorePage model={model}/>;
  case 'creator':return publicProfile?.isCreator===false?<PublicMemberPage profile={publicProfile} model={model}/>:<CreatorProfilePage model={model} id={publicProfile?.id||id}/>;
  case 'member':return publicProfile?<PublicMemberPage profile={publicProfile} model={model}/>:null;
  case 'membership':return <MembershipPage model={model} id={publicProfile?.id||id} initialPlanId={query.get('plan')||undefined}/>;
  case 'signup':return id==='complete'?<SignupCompletePage basePath={basePath} live leave={path=>router.replace(path)}/>:<SignupPage model={model} onComplete={()=>router.push(`${basePath}/signup/complete`)}/>;
  case 'login':return <LoginPage model={model} next={query.get('next')} navigate={path=>router.replace(path)}/>;
  case 'beans':return id==='withdraw'?<BeanWithdrawContainer signedIn={model.signedIn} basePath={basePath}/>:id==='charges'||id==='history'||id==='tips'?<BeanHistoryPage key={id} kind={id}/>:id==='charge'?<BeanChargePage/>:id?<BeanPaymentResult success={id==='success'}/>:<BeanWalletPage/>;
  case 'feed':return <FeedPage model={model}/>;
  case 'post':return <PostDetailPage model={model} id={id} forceLocked={query.get('locked')==='1'}/>;
  case 'messages':return <MessagesPage model={model}/>;
  case 'notifications':return <NotificationsPage model={model}/>;
  case 'me':return <MyProfilePage model={model}/>;
  case 'subscriptions':return <SubscriptionsPage model={model}/>;
  case 'settings':return <SettingsPage model={model}/>;
  case 'support':return <><SupportPage model={model}/><CommonNavigation basePath={basePath}/></>;
  case 'following':return query.get('profile')?<ProfileConnectionsPage key={query.get('profile')+'following'} id={query.get('profile')!} kind="following" basePath={basePath} load={loadProfileConnections}/>:<FollowingPage model={model}/>;
  case 'followers':return query.get('profile')?<ProfileConnectionsPage key={query.get('profile')+'followers'} id={query.get('profile')!} kind="followers" basePath={basePath} load={loadProfileConnections}/>:<FollowersPage model={model}/>;
  case 'payment-methods':return common?<PaymentMethodsPage model={common} basePath={basePath}/>:null;
  case 'events':return id?<EventDetailPage event={serviceEvents.find(event=>event.id===id)} basePath={basePath}/>:<EventsPage events={serviceEvents} basePath={basePath}/>;
  case 'notices':return !common?null:id?<NoticeDetailPage id={id} model={common} basePath={basePath}/>:<NoticesPage model={common} basePath={basePath}/>;
  case 'legal':return common&&<LegalPage kind={id as LegalKind} model={common} basePath={basePath}/>;
  case 'reset-password':return common&&<PasswordResetPage model={common} basePath={basePath}/>;
  default:return <FeedPage model={model}/>;
 }}
 return <ServiceShell model={model} active={screen} scrollKey={segments.join('/')} auth={['signup','login','reset-password'].includes(screen)}>{error&&<div role="alert"><p>{error}</p><button onClick={()=>void refresh()}>다시 불러오기</button></div>}<Suspense fallback={<p className={s.loading}>화면을 준비하고 있어요.</p>}>{content()}</Suspense></ServiceShell>;
}
