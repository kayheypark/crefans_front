'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ContentEditorPage} from '@/components/crefans/studio/ManagementPages';
import {Action,Notice,PageTitle} from '@/components/crefans/ServiceUI';
import {BackButton} from '@/components/crefans/BackButton';
import {Checkbox} from '@/components/ui/Choice';
import {DelayedSpinner} from '@/components/ui/DelayedSpinner';
import {useGuestTrialModel} from '@/features/service/useGuestTrialModel';
import type {ServiceViewModel} from '@/types/crefans';
import type {StudioManagementModel} from '@/types/crefans-studio-management';
import s from '@/components/crefans/studio/management.module.css';

// Signed-out AI photo trial (2026-11-15 user decision): consent → upload a photo → AI edit (10 tries, no hearts) → publish.
// The post shows in the feed for 24 hours and then turns private; signing in on this browser links it to the account.
export const GUEST_POST_NOTICE='이 게시물은 하루가 지나면 접근할 수 없는 비공개 게시글로 전환되며, 현재 브라우저로 회원가입 후 로그인하면 본인의 게시물로 연결됩니다.';
const feedPath='/service/feed',donePath='/service/try/done';
const unsupported=async()=>({success:false as const,data:null,errorMessage:'체험에서는 쓸 수 없는 기능이에요.',errorCode:'GUEST_FEATURE_UNAVAILABLE'});

export default function GuestTrialPage({model,done=false}:{model:ServiceViewModel;done?:boolean}){
 const router=useRouter(),guest=useGuestTrialModel(!model.signedIn&&!done),[agreed,setAgreed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState('');
 // A signed-in member writes from their own studio instead (their posts are not trial posts).
 useEffect(()=>{if(model.signedIn&&!done)router.replace('/service/studio/content/new');},[model.signedIn,done,router]);
 if(done)return <section className={s.page}><PageTitle back={<BackButton href={feedPath} label="피드로 돌아가기"/>}>체험 게시물을 올렸어요</PageTitle><Notice>{GUEST_POST_NOTICE}</Notice><div className={s.editorActions}><Action variant="secondary" onClick={()=>router.push(feedPath)}>피드에서 보기</Action><Action variant="brand" onClick={()=>router.push('/service/signup')}>회원가입하고 내 게시물로 연결</Action></div></section>;
 if(model.signedIn)return <DelayedSpinner/>;
 if(!guest.session)return guest.error?<section className={s.page}><p role="alert">{guest.error}</p><Action onClick={()=>void guest.refresh()}>다시 불러오기</Action></section>:<DelayedSpinner/>;
 if(!guest.session.active)return <section className={s.page}><PageTitle back={<BackButton href={feedPath} label="피드로 돌아가기"/>}>로그인 없이 AI 사진 체험</PageTitle>
  <p className={s.intro}>내 사진을 올리고 AI로 옷·포즈·배경을 바꿔 피드에 올려 보세요. 체험 AI 편집은 {guest.session.limit}회까지 쓸 수 있어요.</p>
  <Notice>{GUEST_POST_NOTICE}</Notice>
  <ul className={s.intro}>
   <li>체험을 시작하면 이 브라우저를 구분하는 쿠키(최대 30일)와 접속 IP를 되돌릴 수 없게 바꾼 값으로 체험 횟수를 관리해요.</li>
   <li>올린 사진과 요청은 AI 사진 생성(BytePlus, 해외)과 유해성 검사(OpenAI, 해외)에 쓰여요.</li>
   <li>사진 속 인물은 본인이거나 동의를 받은 사람이어야 하고, 노출·성적인 합성, 미성년자, 다른 사람 얼굴 합성은 만들 수 없어요.</li>
   <li>체험 게시물에는 댓글·후원·멤버십이 없고, 하트 같은 보상은 주지 않아요.</li>
  </ul>
  <Checkbox label="위 내용과 개인정보 처리방침 17항(비회원 AI 사진 체험)에 동의합니다" checked={agreed} disabled={pending} onChange={setAgreed}/>
  <p className={s.intro}><Link href="/service/legal/privacy">개인정보 처리방침 보기</Link> · <Link href="/service/login?next=/service/studio/content/new">이미 회원이라면 로그인</Link></p>
  {error&&<p className={s.error} role="alert">{error}</p>}
  <div className={s.editorActions}><Action variant="brand" disabled={!agreed||pending} onClick={async()=>{setPending(true);setError('');const r=await guest.start();if(!r.success)setError(r.errorMessage||'체험을 시작하지 못했어요.');setPending(false);}}>{pending?'준비 중…':'동의하고 체험 시작'}</Action></div>
 </section>;
 const management:StudioManagementModel={now:new Date().toISOString(),contents:[],memberships:[],subscribers:[],aiPhotoQuota:{remaining:guest.session.remaining,limit:guest.session.limit},
  actions:{saveContent:input=>guest.save(input) as ReturnType<StudioManagementModel['actions']['saveContent']>,uploadContentMedia:guest.upload,discardContentMedia(){},aiEditPhoto:guest.aiEdit,refreshAiPhotoQuota:guest.refresh,
   deleteContent:unsupported,setContentPublic:unsupported,saveMembership:unsupported,deleteMembership:unsupported,uploadMembershipImage:unsupported,discardMembershipImage(){},setMembershipActive:unsupported}};
 const author={id:'guest-preview',name:'체험 사용자',handle:'',image:'',position:'center',bio:'',tags:[],followers:'',isGuest:true,isCreator:false};
 const previewModel={...model,data:{...model.data,creators:[...model.data.creators,author as unknown as ServiceViewModel['data']['creators'][number]]}};
 return <ContentEditorPage model={management} basePath="/service/try" previewModel={previewModel} previewCreatorId={author.id} guest={{backHref:feedPath,doneHref:donePath,notice:GUEST_POST_NOTICE}}/>;
}
