'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ContentEditorPage} from '@/components/crefans/studio/ManagementPages';
import {Action,PageTitle} from '@/components/crefans/ServiceUI';
import {BackButton} from '@/components/crefans/BackButton';
import {Checkbox} from '@/components/ui/Choice';
import {DelayedSpinner} from '@/components/ui/DelayedSpinner';
import {useGuestTrialModel} from '@/features/service/useGuestTrialModel';
import type {ServiceViewModel} from '@/types/crefans';
import type {StudioManagementModel} from '@/types/crefans-studio-management';
import t from './guest-trial.module.css';

// Signed-out AI photo trial (2026-11-15 user decision): consent → upload a photo → AI edit (10 tries, no hearts) → publish.
// The post shows in the feed for 24 hours and then turns private; signing in on this browser links it to the account.
export const GUEST_POST_NOTICE='이 게시물은 하루가 지나면 접근할 수 없는 비공개 게시글로 전환되며, 현재 브라우저로 회원가입 후 로그인하면 본인의 게시물로 연결됩니다.';
const feedPath='/service/feed',donePath='/service/try/done';
const unsupported=async()=>({success:false as const,data:null,errorMessage:'체험에서는 쓸 수 없는 기능이에요.',errorCode:'GUEST_FEATURE_UNAVAILABLE'});

export default function GuestTrialPage({model,done=false}:{model:ServiceViewModel;done?:boolean}){
 const router=useRouter(),guest=useGuestTrialModel(!model.signedIn&&!done),[agreed,setAgreed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState('');
 // A signed-in member writes from their own studio instead (their posts are not trial posts).
 useEffect(()=>{if(model.signedIn&&!done)router.replace('/service/studio/content/new');},[model.signedIn,done,router]);
 const warning=<div className={t.notice} role="note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></svg><div><strong>하루 뒤 비공개로 바뀌어요</strong>{GUEST_POST_NOTICE}</div></div>;
 if(done)return <section className={t.page}><PageTitle back={<BackButton href={feedPath} label="피드로 돌아가기"/>}>체험 완료</PageTitle><div className={t.done}><span className={t.doneIcon} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6"/></svg></span><h1>체험 게시물을 올렸어요</h1><p>지금부터 24시간 동안 피드에서 모두가 볼 수 있어요.</p></div>{warning}<div className={t.actions}><Action variant="brand" onClick={()=>router.push('/service/signup')}>회원가입하고 내 게시물로 연결</Action><Action variant="secondary" onClick={()=>router.push(feedPath)}>피드에서 보기</Action></div></section>;
 if(model.signedIn)return <DelayedSpinner/>;
 if(!guest.session)return guest.error?<section className={t.page}><p className={t.error} role="alert">{guest.error}</p><Action onClick={()=>void guest.refresh()}>다시 불러오기</Action></section>:<DelayedSpinner/>;
 if(!guest.session.active)return <section className={t.page}><PageTitle back={<BackButton href={feedPath} label="피드로 돌아가기"/>}>AI 사진 체험</PageTitle>
  <div className={t.hero}><span className={t.badge}>로그인 없이 {guest.session.limit}회 무료</span><h1>내 사진을 AI로 바꿔 피드에 올려 보세요</h1><p>옷·메이크업·포즈·배경을 골라 바꾸고, 마음에 들면 바로 게시해요.</p>{/* eslint-disable-next-line @next/next/no-img-element -- decorative category illustration */}<img src="/brand/ai-photo/outfit-colorful-flat-v3.png" alt=""/></div>
  <ol className={t.steps} aria-label="체험 순서"><li><b>1</b>사진 올리기</li><li><b>2</b>AI로 바꾸기</li><li><b>3</b>피드에 올리기</li></ol>
  {warning}
  <section className={t.card} aria-labelledby="guest-trial-checks"><h2 id="guest-trial-checks">시작 전에 확인해 주세요</h2><ul className={t.checks}>
   <li>이 브라우저를 구분하는 쿠키(최대 30일)와 접속 IP를 되돌릴 수 없게 바꾼 값으로 체험 횟수를 관리해요.</li>
   <li>올린 사진과 요청은 AI 사진 생성(BytePlus, 해외)과 유해성 검사(OpenAI, 해외)에 쓰여요.</li>
   <li>사진 속 인물은 본인이거나 동의를 받은 사람이어야 해요. 노출·성적인 합성, 미성년자, 다른 사람 얼굴 합성은 만들 수 없어요.</li>
   <li>체험 게시물에는 댓글·후원·멤버십이 없고, 하트 같은 보상은 주지 않아요.</li>
  </ul></section>
  <div className={t.consent}><Checkbox label="위 내용과 개인정보 처리방침 17항(비회원 AI 사진 체험)에 동의합니다" checked={agreed} disabled={pending} onChange={setAgreed}/><div className={t.links}><Link href="/service/legal/privacy">개인정보 처리방침 보기</Link><Link href="/service/login?next=/service/studio/content/new">이미 회원이라면 로그인</Link></div></div>
  {error&&<p className={t.error} role="alert">{error}</p>}
  <div className={t.actions}><Action variant="brand" disabled={!agreed||pending} onClick={async()=>{setPending(true);setError('');const r=await guest.start();if(!r.success)setError(r.errorMessage||'체험을 시작하지 못했어요.');setPending(false);}}>{pending?'준비 중…':'동의하고 체험 시작'}</Action></div>
 </section>;
 const management:StudioManagementModel={now:new Date().toISOString(),contents:[],memberships:[],subscribers:[],aiPhotoQuota:{remaining:guest.session.remaining,limit:guest.session.limit},
  actions:{saveContent:input=>guest.save(input) as ReturnType<StudioManagementModel['actions']['saveContent']>,uploadContentMedia:guest.upload,discardContentMedia(){},aiEditPhoto:guest.aiEdit,refreshAiPhotoQuota:guest.refresh,
   deleteContent:unsupported,setContentPublic:unsupported,saveMembership:unsupported,deleteMembership:unsupported,uploadMembershipImage:unsupported,discardMembershipImage(){},setMembershipActive:unsupported}};
 const author={id:'guest-preview',name:'체험 사용자',handle:'',image:'',position:'center',bio:'',tags:[],followers:'',isGuest:true,isCreator:false};
 const previewModel={...model,data:{...model.data,creators:[...model.data.creators,author as unknown as ServiceViewModel['data']['creators'][number]]}};
 return <ContentEditorPage model={management} basePath="/service/try" previewModel={previewModel} previewCreatorId={author.id} guest={{backHref:feedPath,doneHref:donePath,notice:GUEST_POST_NOTICE}}/>;
}
