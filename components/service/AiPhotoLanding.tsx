'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Brand} from '@/components/crefans/Brand';
import {ServiceFooter} from '@/components/crefans/ServiceFooter';
import {aiPhotoKinds} from '@/lib/crefans/ai-photo';
import {aiPhotoPresetTitles} from '@/lib/crefans/ai-photo-presets';
import {aiPhotoCostumes} from '@/lib/crefans/ai-photo-costumes';
import s from './ai-photo-landing.module.css';

// AI photo editing landing page (2026-11-16 user request). Built from the service's own catalog data: the costume chips and the
// edit categories come from the same lists the editor uses, the demo results were made with the same model (Seedream) on a
// fictional person, and every call to action opens the real signed-out trial at /service/try.
const TRY='/service/try';
const demo=[
 {id:'mage',label:'판타지 마법사',image:'/illustrations/landing/ai-photo/cos1-v1.webp'},
 {id:'idol',label:'핑크 아이돌',image:'/illustrations/landing/ai-photo/cos-idol-v1.webp'},
 {id:'cyber-idol',label:'사이버 아이돌',image:'/illustrations/landing/ai-photo/cos2-v1.webp'},
 {id:'hanbok',label:'벚꽃 한복',image:'/illustrations/landing/ai-photo/cos3-v1.webp'},
 {id:'cyber',label:'사이버 슈트',image:'/illustrations/landing/ai-photo/cos-cyber-v1.webp'},
];
// Catalog costumes shown on a public page: original designs only (no game/anime characters) and no revealing outfits.
const showcase=['773106','80974e','666147','b4bf5d','e614f6'];
export const landingCostumes=aiPhotoCostumes.filter(item=>showcase.includes(item.id));
const kindImages:Record<string,string>={outfit:'outfit',makeup:'makeup',expression:'expression',pose:'pose',body:'body',camera:'camera',lens:'lens',background:'background'};
// Body presets are not advertised on the public page.
export const landingKinds=aiPhotoKinds.filter(kind=>kind.value!=='body');

export function AiPhotoCompare({before,after,label}:{before:string;after:string;label:string}){
 const [split,setSplit]=useState(50);
 return <div className={s.compare}>
  {/* eslint-disable-next-line @next/next/no-img-element -- fixed demo images */}
  <img className={s.compareImage} src={before} alt="원본 사진(가상 인물)" width={720} height={900}/>
  <div className={s.compareAfter} style={{clipPath:`inset(0 0 0 ${split}%)`}}>
   {/* eslint-disable-next-line @next/next/no-img-element -- fixed demo images */}
   <img className={s.compareImage} src={after} alt={`${label} 결과(가상 인물, AI 생성)`} width={720} height={900}/>
  </div>
  <div className={s.compareLine} style={{left:`${split}%`}} aria-hidden="true"><span>‹ ›</span></div>
  <span className={s.compareTag} data-side="before">원본</span><span className={s.compareTag} data-side="after">{label}</span>
  <input className={s.compareRange} type="range" min={0} max={100} value={split} onChange={event=>setSplit(Number(event.target.value))} aria-label="원본과 결과 비교 위치"/>
  <span className={s.aiMark}>가상 인물 · AI 생성 이미지</span>
 </div>;
}

export default function AiPhotoLanding(){
 const [look,setLook]=useState(demo[0].id),[kind,setKind]=useState(landingKinds[0].value);
 const current=demo.find(item=>item.id===look)||demo[0];
 const presets=kind==='outfit'?landingCostumes.map(item=>item.name):aiPhotoPresetTitles[kind].slice(0,12);
 return <main className={s.page}>
  <header className={s.header}><Brand href="/service/feed"/><Link className={s.headerLink} href={TRY}>무료 체험</Link></header>

  <section className={s.hero} aria-labelledby="ai-photo-title">
   <div className={s.heroCopy}>
    <h1 id="ai-photo-title">사진 한 장으로,<br/>오늘의 <em>캐릭터</em>가 되어 보세요</h1>
    <p className={s.lead}>원하는 <strong>코스튬과 메이크업, 포즈와 배경</strong>을 고르면 AI가 사진을 새로 만들어요. <strong>원본 사진은 그대로</strong> 두고, 마음에 드는 결과만 골라 게시해요.</p>
    <div className={s.actions}><Link className={s.primary} href={TRY}>로그인 없이 무료 체험</Link><a className={s.secondary} href="#how">어떻게 쓰나요?</a></div>
    <p className={s.small}>비회원은 브라우저당 <strong>10회까지 무료</strong>로 만들어 볼 수 있어요.</p>
   </div>
   <div className={s.heroDemo}>
    <AiPhotoCompare before="/illustrations/landing/ai-photo/base-v1.webp" after={current.image} label={current.label}/>
    <div className={s.looks} role="radiogroup" aria-label="결과 코스튬 고르기">{demo.map(item=><button key={item.id} type="button" role="radio" aria-checked={item.id===look} className={s.look} onClick={()=>setLook(item.id)}>{/* eslint-disable-next-line @next/next/no-img-element -- fixed demo images */}<img src={item.image} alt="" width={56} height={70}/><span>{item.label}</span></button>)}</div>
   </div>
  </section>

  <section className={s.section} aria-labelledby="ai-photo-kinds">
   <h2 id="ai-photo-kinds">고를 수 있는 편집</h2>
   <div className={s.kinds} role="tablist" aria-label="편집 종류">{landingKinds.map(item=><button key={item.value} type="button" role="tab" aria-selected={item.value===kind} className={s.kind} onClick={()=>setKind(item.value)}>{/* eslint-disable-next-line @next/next/no-img-element -- category icons */}<img src={`/brand/ai-photo/${kindImages[item.value]}-colorful-flat-v3.png`} alt="" width={36} height={36}/><span>{item.label}</span></button>)}</div>
   {kind==='outfit'?<div className={s.costumes} role="tabpanel" aria-label="코스튬 프리셋">{landingCostumes.map(item=><figure key={item.id} className={s.costume}>{/* eslint-disable-next-line @next/next/no-img-element -- catalog images */}<img src={item.image} alt="" width={160} height={200}/><figcaption><strong>{item.name}</strong><span>{item.detail}</span></figcaption></figure>)}<p className={s.more}>게임·애니메이션 의상을 포함해 <strong>300종이 넘는 코스튬</strong>이 있어요.</p></div>
    :<ul className={s.presetList} role="tabpanel" aria-label={`${landingKinds.find(item=>item.value===kind)?.label} 프리셋`}>{presets.map(name=><li key={name}>{name}</li>)}</ul>}
  </section>

  <section className={s.section} id="how" aria-labelledby="ai-photo-how">
   <h2 id="ai-photo-how">세 단계면 끝나요</h2>
   <ol className={s.steps}>
    <li><b>1</b><strong>사진 올리기</strong><span><strong>내 사진</strong>이나 동의를 받은 사람의 사진을 올려요.</span></li>
    <li><b>2</b><strong>골라 담기</strong><span>코스튬·메이크업·포즈·배경을 고르면 <strong>AI가 한 장으로</strong> 만들어요. 결과를 보고 <strong>이어서 보정</strong>할 수 있어요.</span></li>
    <li><b>3</b><strong>바로 게시</strong><span>마음에 드는 사진을 고르고, <strong>‘AI로 내용 작성’</strong>으로 제목·내용까지 채워 피드에 올려요.</span></li>
   </ol>
  </section>

  <section className={s.section} aria-labelledby="ai-photo-plans">
   <h2 id="ai-photo-plans">이용 방법</h2>
   <div className={s.plans}>
    <article><h3>비회원 체험</h3><p className={s.planValue}>10회 무료</p><p><strong>로그인 없이</strong> 브라우저에서 바로 써 봐요. 게시물은 <strong>24시간</strong> 동안 피드에 보이고, 같은 브라우저로 가입하면 내 계정으로 옮겨져요.</p><Link className={s.primary} href={TRY}>지금 체험하기</Link></article>
    <article><h3>회원</h3><p className={s.planValue}>하루 10회 무료</p><p>게시물 작성에서 써요. <strong>매일 오전 9시</strong>에 다시 채워지고, <strong>하트 게임 보상</strong>으로 더 만들 수 있어요.</p><Link className={s.secondary} href="/service/studio">스튜디오 열기</Link></article>
    <article><h3>AI 이용권</h3><p className={s.planValue}>필요한 만큼</p><p>무료 횟수를 다 쓰면 스튜디오 상점에서 <strong>AI 이용권</strong>을 무통장입금으로 구매할 수 있어요. <strong>남은 횟수는 환불</strong>받을 수 있어요.</p><Link className={s.secondary} href="/service/studio/shop">상점 보기</Link></article>
   </div>
  </section>

  <section className={s.notice} aria-labelledby="ai-photo-rules">
   <h2 id="ai-photo-rules">꼭 지켜 주세요</h2>
   <ul>
    <li>사진 속 인물은 <strong>본인이거나 동의를 받은 사람</strong>이어야 해요. <strong>다른 사람 얼굴 합성, 미성년자, 노출·성적인 합성은 만들 수 없어요.</strong></li>
    <li>게시물에 넣은 AI 사진에는 <strong>‘AI 생성’ 표시</strong>가 붙어요. 결과는 원본 사진과 요청에 따라 달라질 수 있어요.</li>
    <li>사진 생성은 BytePlus, 유해성 검사는 OpenAI가 처리해요(해외). 자세한 내용은 <Link href="/service/legal/privacy">개인정보 처리방침</Link>을 확인해 주세요.</li>
   </ul>
  </section>

  <section className={s.final}><h2>오늘은 어떤 캐릭터가 될까요?</h2><Link className={s.primary} href={TRY}>로그인 없이 무료 체험</Link><p className={s.small}>이 페이지의 인물은 가상 인물이며, 결과 사진은 AI로 생성했어요.</p></section>
  {/* 2026-11-17: PG review needs the operator details at the bottom of the home page; same footer as the service landing. */}
  <div className={s.siteFooter}><ServiceFooter basePath="/service" always business/></div>
 </main>;
}
