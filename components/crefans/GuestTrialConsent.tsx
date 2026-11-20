'use client';
import {useRef} from 'react';
import {PullToRefresh} from './PullToRefresh';
import {Action,PageTitle} from './ServiceUI';
import {BackButton} from './BackButton';
import {Checkbox} from '@/components/ui/Choice';
import s from './guest-trial-consent.module.css';

type Props={agreed:boolean;pending:boolean;error:string;onAgree:(value:boolean)=>void;onStart:()=>void;/** 2026-11-19 user decision (dev test): session-replay analytics is part of the single required consent (policy 17). */replay?:boolean};
export function GuestTrialConsent({agreed,pending,error,onAgree,onStart,replay=false}:Props){
 const scrollRef=useRef<HTMLDivElement>(null);
 return <section className={s.page} data-guest-consent>
  <div className={s.heading}><PageTitle back={<BackButton href="/service/feed" label="피드로 돌아가기"/>}>AI 사진 체험</PageTitle></div>
  <div ref={scrollRef} className={s.body} tabIndex={0} aria-label="체험 안내">
   <h2>내 사진으로<br/><em>모더니아가 되어볼까요?</em></h2>
   <p className={s.subtitle}>사진을 올리고, 코스튬을 골라 바꿔 보세요.</p>
   <div className={s.hero} aria-label="내 사진과 코스튬으로 코스어가 되는 예시">
    <div className={s.comparison}>
     <figure><div className={s.before}>
      {/* eslint-disable-next-line @next/next/no-img-element -- existing AI-generated example */}<img src="/illustrations/landing/ai-photo/base-v1.webp" alt="내 사진 예시, 가상 인물" width={720} height={900}/>
      <span className={s.costume}>{/* eslint-disable-next-line @next/next/no-img-element -- existing costume asset */}<img src="/brand/ai-photo/costumes/nikke-modernia-v2.webp" alt="선택한 모더니아 코스튬" width={512} height={512}/><b aria-hidden="true">+</b></span>
     </div><figcaption>내 사진 + 코스튬</figcaption></figure>
     <span className={s.arrow} aria-hidden="true">→</span>
     <figure>{/* eslint-disable-next-line @next/next/no-img-element -- existing AI-generated example */}<img className={s.result} src="/illustrations/landing/ai-photo/hero-modernia-v1.webp" alt="모더니아 코스어가 된 내 모습 예시, 가상 인물" width={720} height={900}/><figcaption>코스어가 된 내 모습!</figcaption></figure>
    </div>
   </div>
   <div className={s.summary}><p><strong>사진과 요청은 해외 AI 서비스로 전송돼요</strong><span>BytePlus 사진 생성 · OpenAI 유해성 검사</span></p><p><strong>본인 또는 사용 허락을 받은 성인 사진만</strong><span>미성년자·성적인 합성·다른 사람 얼굴 합성 불가</span></p></div>
   <div className={s.notice}><strong>게시하면 피드에 공개돼요.<br/>하지만 하루가 지나면 <span className={s.disappear}>피드에서 사라져요</span>.</strong><p>하루 뒤 비공개로 전환되며, 같은 브라우저에서 가입·로그인하면 내 게시물로 연결할 수 있어요.</p></div>
   <details className={s.details}><summary>체험·개인정보 안내 자세히</summary><ul>
   <li>이 브라우저를 구분하는 쿠키(최대 30일)와 접속 IP를 서버 보안키로 바꾼 값으로 체험 횟수를 관리해요. 체험 시작 기록에는 접속 IP가 보안 기록으로 남아요.</li>
   <li>올린 사진과 요청은 AI 사진 생성(BytePlus, 해외)과 유해성 검사(OpenAI, 해외)에 쓰여요. AI 사진을 만든 뒤 'AI로 내용 작성'을 누르면 고른 항목 이름과 요청 문장만 OpenAI(해외)로 보내 제목, 본문을 써 드리고, 게시 전에 고칠 수 있어요.</li>
   <li>사진 속 인물은 본인이거나 동의를 받은 사람이어야 해요. 노출, 성적인 합성, 미성년자, 다른 사람 얼굴 합성은 만들 수 없어요.</li>
   {replay&&<li>사용 흐름과 불편을 분석하려고 화면 녹화(업로드 썸네일, AI 생성 결과, 게시글 제목·본문, 프리셋·의상 검색어)를 HTTPS로 PostHog, Inc.(미국, privacy@posthog.com)에 전송하고 최대 30일 보관해요.</li>}
   <li>체험 게시물에는 AI로 만든 사진만 올릴 수 있어요. 댓글, 후원, 멤버십이 없고, 하트 같은 보상은 주지 않아요.</li>

   </ul></details>
  </div>
  <PullToRefresh scrollRef={scrollRef} enabled={!pending} routeKey="guest-consent"/>
  <div className={s.footer}>
   <Checkbox label="위 내용과 개인정보 처리방침 17항(비회원 AI 사진 체험)에 동의합니다" checked={agreed} disabled={pending} onChange={onAgree}/>
   {error&&<p className={s.error} role="alert">{error}</p>}
   {/* 2026-11-20 user request: some visitors leave here thinking they must upload their own photo; the editor adds a sample selfie. */}
   <p className={s.sampleBubbleRow} role="note"><span className={s.sampleBubble}>내 사진이 없어도 샘플 셀카로 할 수 있어요</span></p>
   <Action variant="brand" disabled={!agreed||pending} onClick={onStart}>{pending?'준비 중…':'동의하고 0원체험'}</Action>
   <p className={s.hint}>사진 생성은 다음 화면에서 진행해요</p>
  </div>
 </section>;
}
