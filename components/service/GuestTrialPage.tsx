'use client';
import {useEffect,useState} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {ContentEditorPage} from '@/components/crefans/studio/ManagementPages';
import {Action,PageTitle} from '@/components/crefans/ServiceUI';
import {BackButton} from '@/components/crefans/BackButton';
import {GuestTrialConsent} from '@/components/crefans/GuestTrialConsent';
import {Dialog} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import {DelayedSpinner} from '@/components/ui/DelayedSpinner';
import {useGuestTrialModel} from '@/features/service/useGuestTrialModel';
import {useScrollTopOnChange} from '@/lib/design/scroll-top';
import {useFunnelStep} from '@/features/service/useFunnelStep';
import type {ServiceViewModel} from '@/types/crefans';
import type {StudioManagementModel} from '@/types/crefans-studio-management';
import t from './guest-trial.module.css';

// Signed-out AI photo trial (2026-11-15 user decision): consent → upload a photo → AI edit → publish.
// The post shows in the feed for 24 hours and then turns private; signing in on this browser links it to the account.
export const GUEST_POST_NOTICE='게시를 누르면 사진과 글이 피드에 계속 공개돼요. 같은 브라우저에서 로그인하면 내 계정으로 연결할 수 있어요.';
const feedPath='/service/feed',donePath='/service/try/done';
const unsupported=async()=>({success:false as const,data:null,errorMessage:'체험에서는 쓸 수 없는 기능이에요.',errorCode:'GUEST_FEATURE_UNAVAILABLE'});

export default function GuestTrialPage({model,done=false}:{model:ServiceViewModel;done?:boolean}){
 const router=useRouter(),guest=useGuestTrialModel(!model.signedIn),[askLink,setAskLink]=useState(done),[agreed,setAgreed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState('');
 // A signed-in member writes from their own studio instead (their posts are not trial posts).
 useEffect(()=>{if(model.signedIn&&!done)router.replace('/service/studio/content/new');},[model.signedIn,done,router]);
 // After '동의하고 체험 시작' the same route swaps to the editor; start it from the top (mobile scrolls the shell body, desktop the window).
 useScrollTopOnChange(guest.session?.active?'editor':'consent');
 // Funnel count (2026-11-18): the consent screen was shown to a signed-out visitor (once per tab session).
 useFunnelStep('guest_consent_view',!model.signedIn&&!done&&guest.session?.active===false);
 const warning=<div className={t.notice} role="note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></svg><div><strong>게시물 공개 안내</strong>{GUEST_POST_NOTICE}</div></div>;
 if(done)return <section className={t.page}><PageTitle back={<BackButton href={feedPath} label="피드로 돌아가기"/>}>체험 완료</PageTitle><div className={t.done}><span className={t.doneIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6"/></svg></span><h1>체험 게시물을 올렸어요.</h1><p>가입하고 등록한 게시물 연동할까요?</p></div><Dialog open={askLink&&!!guest.session&&!guest.session.postRewardClaimed} onClose={()=>setAskLink(false)} title={"체험 게시물을 올렸어요."} className={t.askDialog} illustration={<div className={t.askArt} aria-hidden="true">{/* eslint-disable-next-line @next/next/no-img-element -- decorative */}<img src="/illustrations/try/link-v3.webp" alt="" width={96} height={96}/><span className={t.askPlus}>+</span><span className={t.askBeans}>{/* eslint-disable-next-line @next/next/no-img-element -- event image */}<img src="/brand/events/open-beta-v2/beans.webp" alt="" width={96} height={96}/><b>100콩</b></span></div>}><div className={t.ask}><p>가입하고 등록한 게시물 연동할까요?</p><p className={t.askNote}>가입하면 프로모션 100콩도 받을 수 있어요. 계정당 한 번, 받은 날부터 30일 동안 후원에 쓸 수 있어요.</p></div><DialogActions style={{marginTop:24}}><Action variant="secondary" onClick={()=>setAskLink(false)}>나중에</Action><Action variant="brand" onClick={()=>router.push('/service/signup')}>가입하고 연동하기</Action></DialogActions></Dialog>{guest.session?.postRewardClaimed&&typeof guest.session.postReward==='number'&&<div className={t.rewardCard}><Image src="/illustrations/try/guest-ticket-v1.webp" alt="" width={60} height={60}/><div><strong>사진 편집 이용권 {guest.session.remaining}장 보유 중</strong><p>첫 게시 보상으로 이용권 {guest.session.postReward}장이 지급됐어요.</p></div><Action variant="brand" onClick={()=>router.push('/service/try')}>사진 편집 계속하기</Action></div>}{warning}<div className={t.actions}><Action variant="brand" onClick={()=>router.push('/service/signup')}>가입하고 연동하기</Action><Action variant="secondary" onClick={()=>router.push(feedPath)}>피드에서 보기</Action></div></section>;
 if(model.signedIn)return <DelayedSpinner/>;
 if(!guest.session)return guest.error?<section className={t.page}><p className={t.error} role="alert">{guest.error}</p><Action onClick={()=>void guest.refresh()}>다시 불러오기</Action></section>:<DelayedSpinner/>;
 if(!guest.session.active)return <GuestTrialConsent agreed={agreed} pending={pending} error={error} onAgree={setAgreed} replay={!!guest.session.replayConsentVersion} onStart={async()=>{if(!agreed||pending)return;setPending(true);setError('');try{const r=await guest.start(!!guest.session?.replayConsentVersion);if(!r.success)setError(r.errorMessage||'체험을 시작하지 못했어요.');}catch{setError('체험을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.');}finally{setPending(false);}}}/>;
 const management:StudioManagementModel={now:new Date().toISOString(),contents:[],memberships:[],subscribers:[],aiPhotoQuota:{remaining:guest.session.remaining,limit:guest.session.limit},
  actions:{saveContent:input=>guest.save({...input,publicationPolicy:'ongoing-v1'}) as ReturnType<StudioManagementModel['actions']['saveContent']>,uploadContentMedia:guest.upload,discardContentMedia(){},aiEditPhoto:guest.aiEdit,aiHeartGame:guest.heartGame,aiReview:guest.review,refreshAiPhotoQuota:guest.refresh,reportShare:guest.share,trackAiPhoto:guest.track,
   deleteContent:unsupported,setContentPublic:unsupported,saveMembership:unsupported,deleteMembership:unsupported,uploadMembershipImage:unsupported,discardMembershipImage(){},setMembershipActive:unsupported}};
 const author={id:'guest-preview',name:'체험 사용자',handle:'',image:'',position:'center',bio:'',tags:[],followers:'',isGuest:true,isCreator:false};
 const previewModel={...model,data:{...model.data,creators:[...model.data.creators,author as unknown as ServiceViewModel['data']['creators'][number]]}};
 return <ContentEditorPage model={management} basePath="/service/try" previewModel={previewModel} previewCreatorId={author.id} guest={{authorId:guest.session.authorId,backHref:feedPath,onBack:guest.backClick,doneHref:donePath,notice:GUEST_POST_NOTICE,postReward:guest.session.postRewardClaimed?undefined:guest.session.postReward,caption:guest.caption,shareReward:guest.session.shareRewardClaimed===false?{refresh:guest.refresh,claim:guest.shareDone}:undefined,shopReward:guest.session.shopRewardClaimed===false?{claim:guest.shopClick}:undefined,samplePhoto:{url:'/illustrations/landing/ai-photo/base-v1.webp',name:'crefans-sample-virtual-person.webp'}}}/>;
}
