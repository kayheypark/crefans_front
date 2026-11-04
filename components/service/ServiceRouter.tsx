'use client';
import {FoundingBadgeSettings} from '@/components/service/FoundingBadgeSettings';
import {FoundingBadgeEventDetail} from '@/components/service/FoundingBadgeEventDetail';
import {PromotionEventDetail} from '@/components/service/PromotionEventDetail';
import {EventsPage,EventDetailPage} from '@/components/crefans/EventPages';
import {serviceEvents} from '@/lib/content/events';
import {ProfileConnectionsPage} from '@/components/crefans/ProfileConnectionsPage';
import {loadProfileConnections} from '@/features/service/profile-connections';
import {BeanChargePage} from '@/components/crefans/BeanChargePage';
import {SignupCompletePage} from '@/components/crefans/SignupCompletePage';
import {BeanWalletPage,BeanHistoryPage,BeanReferralPage} from '@/components/crefans/BeanWalletPages';
import {ReferralHistoryPage} from '@/components/crefans/ReferralHistoryPage';
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
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {useDelayedLoading} from '@/components/ui/useDelayedLoading';
import {Dialog} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import {Action,ActionLink} from '@/components/crefans/ServiceUI';
import {useCurrentLoginHref} from '@/components/crefans/useCurrentLoginHref';
import {SignupPage,LoginPage,MyProfilePage,SettingsPage,SupportPage,SignInPrompt} from '@/components/crefans/AccountPages';
import {FeedPage,PostDetailPage,MessagesPage,NotificationsPage} from '@/components/crefans/SocialPages';
import {ExplorePage,CreatorProfilePage,MembershipPage,SubscriptionsPage} from '@/components/crefans/CreatorPages';
import {FollowingPage,FollowersPage,NoticesPage,NoticeDetailPage,LegalPage,PasswordResetPage,PaymentMethodsPage,CommonNavigation} from '@/components/crefans/CommonPages';
import type {LegalKind} from '@/types/crefans-common';
import s from '@/components/crefans/service.module.css';


export default function ServiceRouter({segments}:{segments:string[]}){
 const {model,common,loading,error,refresh,publicProfile,actionNotice,dismissFeedback}=useService(),query=useSearchParams(),router=useRouter(),[screen,id]=segments,basePath=model.basePath;
 const loginHref=useCurrentLoginHref(basePath),feedback=actionNotice||(error?{message:error,loginRequired:false}:null);
 // Loading rule: a page change shows nothing for the first second, then the shared spinner (no '불러오는 중…' text on every tab tap).
 const slow=useDelayedLoading(loading);
 function content(){if(loading)return slow?<LoadingSpinner/>:null;if(!model.signedIn&&!(['following','followers'].includes(screen)&&query.get('profile'))&&['messages','notifications','me','subscriptions','settings','following','followers','payment-methods','checkout','beans'].includes(screen))return <SignInPrompt basePath={basePath}/>;switch(screen){
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
  case 'beans':return id==='referral'?<BeanReferralPage/>:id==='referral-history'?<ReferralHistoryPage/>:id==='withdraw'?<BeanWithdrawContainer signedIn={model.signedIn} basePath={basePath}/>:id==='charges'||id==='history'||id==='tips'?<BeanHistoryPage key={id} kind={id}/>:id==='charge'?<BeanChargePage/>:id?<BeanPaymentResult success={id==='success'}/>:<BeanWalletPage/>;
  case 'feed':return <FeedPage model={model}/>;
  case 'post':return <PostDetailPage model={model} id={id} forceLocked={query.get('locked')==='1'}/>;
  case 'messages':return <MessagesPage model={model}/>;
  case 'notifications':return <NotificationsPage model={model}/>;
  case 'me':return <MyProfilePage model={model}/>;
  case 'subscriptions':return <SubscriptionsPage model={model}/>;
  case 'settings':return <SettingsPage model={model} badgeSettings={<FoundingBadgeSettings key={model.viewer.handle} signedIn={model.signedIn} actions={model.foundingBadge} basePath={basePath}/>}/>;
  case 'support':return <><SupportPage model={model}/><CommonNavigation basePath={basePath}/></>;
  case 'following':return query.get('profile')?<ProfileConnectionsPage key={query.get('profile')+'following'} id={query.get('profile')!} kind="following" basePath={basePath} load={loadProfileConnections}/>:<FollowingPage model={model}/>;
  case 'followers':return query.get('profile')?<ProfileConnectionsPage key={query.get('profile')+'followers'} id={query.get('profile')!} kind="followers" basePath={basePath} load={loadProfileConnections}/>:<FollowersPage model={model}/>;
  case 'payment-methods':return common?<PaymentMethodsPage model={common} basePath={basePath}/>:null;
  case 'events':return id==='founding-badge'?<FoundingBadgeEventDetail key={model.account.email} event={serviceEvents.find(event=>event.id===id)} basePath={basePath} signedIn={model.signedIn} actions={model.foundingBadge}/>:id==='promotion-beans'?<PromotionEventDetail key={model.account.email} event={serviceEvents.find(event=>event.id===id)} basePath={basePath}/>:id?<EventDetailPage event={serviceEvents.find(event=>event.id===id)} basePath={basePath}/>:<EventsPage events={serviceEvents} basePath={basePath}/>;
  case 'notices':return !common?null:id?<NoticeDetailPage id={id} model={common} basePath={basePath}/>:<NoticesPage model={common} basePath={basePath}/>;
  case 'legal':return common&&<LegalPage kind={id as LegalKind} model={common} basePath={basePath}/>;
  case 'reset-password':return common&&<PasswordResetPage model={common} basePath={basePath}/>;
  default:return <FeedPage model={model}/>;
 }}
 return <ServiceShell model={model} authLoading={loading} active={screen} scrollKey={segments.join('/')} auth={['signup','login','reset-password'].includes(screen)}><Suspense fallback={<p className={s.loading}>화면을 준비하고 있어요.</p>}>{content()}</Suspense><Dialog open={!!feedback} onClose={dismissFeedback} title={feedback?.loginRequired?'로그인이 필요해요':actionNotice?'알림':'화면을 불러오지 못했어요'}><p>{feedback?.loginRequired?'로그인하면 팔로우, 좋아요, 저장 기능을 이용할 수 있어요.':feedback?.message}</p><DialogActions style={{marginTop:24}}>{feedback?.loginRequired?<><Action variant="secondary" onClick={dismissFeedback}>나중에</Action><ActionLink href={loginHref}>로그인하기</ActionLink></>:actionNotice?<Action onClick={dismissFeedback}>확인</Action>:<><Action variant="secondary" onClick={dismissFeedback}>닫기</Action><Action onClick={()=>{dismissFeedback();void refresh();}}>다시 불러오기</Action></>}</DialogActions></Dialog></ServiceShell>;
}
