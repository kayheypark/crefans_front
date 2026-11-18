'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import Link from 'next/link';
import {Brand} from '@/components/crefans/Brand';
import {ServiceFooter} from '@/components/crefans/ServiceFooter';
import {SelectField} from '@/components/ui/SelectField';
import {AiPhotoCategoryIcon} from '@/components/crefans/studio/AiPhotoCategoryIcon';
import {AiPhotoWardrobe,CostumeGender} from '@/components/crefans/studio/AiPhotoWardrobe';
import {AiPresetPager} from '@/components/crefans/studio/AiPresetPager';
import e from '@/components/crefans/studio/ai-photo.module.css';
import {aiPhotoKinds,aiPhotoPresetText} from '@/lib/crefans/ai-photo';
import {AI_PHOTO_KEEP_ORIGINAL,aiPhotoMakeupGender,aiPhotoPresetImage,aiPhotoPresetMatches,aiPhotoPresetPage,aiPhotoPresetTitle,aiPhotoPresets,type AiPhotoBackgroundCategory,type AiPhotoPosePosture} from '@/lib/crefans/ai-photo-presets';
import {aiPhotoCostumeCategories,aiPhotoCostumes,type AiPhotoCostumeCategory,AI_PHOTO_COSTUME_HINT} from '@/lib/crefans/ai-photo-costumes';
import type {AiPhotoKind} from '@/types/crefans-studio-management';
import {designVariables} from '@/lib/design/tokens';
import {saveAiPhotoHandoff} from '@/lib/crefans/ai-photo-handoff';
import s from './ai-photo-landing.module.css';
import {useFunnelStep} from '@/features/service/useFunnelStep';

// AI photo editing landing page (2026-11-16 user request; 2026-11-17 real-preset version). Built from the service's own catalog:
// each hero result was made with Seedream from the fictional base person and exactly the presets listed under it (the same
// request text the editor composes), and the preset browser below reuses the editor's cards, wardrobe and pager.
const TRY='/service/try';
type LookPreset={kind:AiPhotoKind;title:string};
const looks:{id:string;costume:string;presets:LookPreset[]}[]=[
 {id:'modernia',costume:'4a0c8f',presets:[{kind:'makeup',title:'지뢰계 메이크업'},{kind:'pose',title:'의자에 앉기'}]},
 {id:'gothic',costume:'ffb58f',presets:[{kind:'makeup',title:'코스프레 베이스'},{kind:'lens',title:'거울샷'}]},
 {id:'maid',costume:'773106',presets:[{kind:'makeup',title:'인형 메이크업'},{kind:'pose',title:'손하트'}]},
 // 2026-11-19 user request: 아이돌 무대복을 네 번째로(마지막에서 앞으로).
 {id:'idol',costume:'e614f6',presets:[{kind:'pose',title:'브이'},{kind:'camera',title:'로우 앵글'}]},
 {id:'mage',costume:'666147',presets:[{kind:'expression',title:'환한 미소'},{kind:'pose',title:'양팔 벌려 서기'}]},
];
const presetByTitle=(kind:AiPhotoKind,title:string)=>{const example=aiPhotoPresets[kind].find(item=>aiPhotoPresetTitle(kind,item)===title);if(!example)throw new Error(`landing preset missing: ${kind} ${title}`);return example;};
/** Hero results with the real catalog entries behind them; a renamed or removed preset fails loudly instead of showing a stale card.
 * thumb is a 168×210 copy of the hero for the 56×70 picker (2026-11-18 performance fix: the picker loaded the 720px originals). */
export const landingLooks=looks.map(look=>{const costume=aiPhotoCostumes.find(item=>item.id===look.costume);if(!costume)throw new Error(`landing costume missing: ${look.costume}`);
 return {id:look.id,label:costume.name,image:`/illustrations/landing/ai-photo/hero-${look.id}-v1.webp`,thumb:`/illustrations/landing/ai-photo/thumb-${look.id}-v1.webp`,cards:[{kind:'outfit' as AiPhotoKind,title:costume.name,image:costume.image},...look.presets.map(item=>({kind:item.kind,title:item.title,image:aiPhotoPresetImage(item.kind,presetByTitle(item.kind,item.title))}))]};});
// Body presets are not advertised on the public page.
export const landingKinds=aiPhotoKinds.filter(kind=>kind.value!=='body');
const illustrated=['expression','pose','camera','lens'];

// 2026-11-17 user request: the comparison starts at 20% (more of the result shows), a floating bubble on the handle and
// pointing-finger markers with a burst on both sides invite a drag or tap; tapping either side moves the line there, and the
// whole hint disappears for good once the line has moved. The range input stays for keyboard use.
// Pointing hand (index finger raised on the left), Lucide 'pointer' outline (ISC licence).
const HINT_FINGER=['M22 14a8 8 0 0 1-8 8','M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2','M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1','M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10','M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'];
const INTRO_MS=1400,HANDLE_HIT=60,TAP_SLOP=6;
export function AiPhotoCompare({before,after,label}:{before:string;after:string;label:string}){
 // 2026-11-17 user request: on entry the line starts at the far right (all original) and eases in-out to 20%; hints follow.
 const [split,setSplit]=useState(100),[intro,setIntro]=useState(true),[moved,setMoved]=useState(false),[dragging,setDragging]=useState(false);
 useEffect(()=>{const start=setTimeout(()=>setSplit(current=>current===100?20:current),120),done=setTimeout(()=>setIntro(false),120+INTRO_MS);return()=>{clearTimeout(start);clearTimeout(done);};},[]);
  const press=useRef<{x:number;y:number;onHandle:boolean;offset:number;mode:'pending'|'drag'}|null>(null);
 const move=(value:number)=>{setIntro(false);setSplit(Math.round(Math.min(100,Math.max(0,value))));setMoved(true);};
 const at=(event:{clientX:number;currentTarget:HTMLElement})=>{const r=event.currentTarget.getBoundingClientRect();return r.width?((event.clientX-r.left)/r.width)*100:split;};
 return <div className={s.compare} data-dragging={dragging||undefined} data-intro={intro||undefined}
  // 2026-11-17 user request: a press is not a click while dragging. Nothing moves on press; moving more than TAP_SLOP horizontally
  // turns it into a drag that follows the finger, a vertical move is left to page scrolling, and only a release without movement
  // counts as a click that moves the line there. A press within the 60px handle area drags from the handle without a jump.
  onPointerDown={event=>{if(event.button>0)return;const r=event.currentTarget.getBoundingClientRect();const onHandle=Math.abs(event.clientX-(r.left+r.width*split/100))<=HANDLE_HIT/2;press.current={x:event.clientX,y:event.clientY,onHandle,offset:onHandle&&r.width?((event.clientX-r.left)/r.width)*100-split:0,mode:'pending'};}}
  onPointerMove={event=>{const p=press.current;if(!p)return;if(p.mode==='pending'){const dx=Math.abs(event.clientX-p.x),dy=Math.abs(event.clientY-p.y);if(dx<TAP_SLOP&&dy<TAP_SLOP)return;if(dy>dx){press.current=null;return;}p.mode='drag';setDragging(true);event.currentTarget.setPointerCapture?.(event.pointerId);}move(at(event)-p.offset);}}
  onPointerUp={event=>{const p=press.current;press.current=null;setDragging(false);if(p?.mode==='pending'){if(p.onHandle){setIntro(false);setMoved(true);}else move(at(event));}}}
  onPointerCancel={()=>{press.current=null;setDragging(false);}}>
  {/* 2026-11-18 performance fix: the original photo is the mobile LCP element, so it is fetched first. */}
  {/* eslint-disable-next-line @next/next/no-img-element -- fixed demo images */}
  <img className={s.compareImage} src={before} alt="원본 사진(가상 인물)" width={720} height={900} draggable={false} fetchPriority="high"/>
  <div className={s.compareAfter} style={{clipPath:`inset(0 0 0 ${split}%)`}}>
   {/* eslint-disable-next-line @next/next/no-img-element -- fixed demo images */}
   <img className={s.compareImage} src={after} alt={`${label} 결과(가상 인물, AI 생성)`} width={720} height={900} draggable={false}/>
  </div>
  <div className={s.compareLine} style={{left:`${split}%`}} aria-hidden="true"><span>‹ ›</span>{!moved&&!intro&&<em className={s.compareBubble} style={{transform:`translateX(${split<30?-18:split>70?-82:-50}%)`}}>밀거나 눌러서 비교해 보세요</em>}</div>
  {!moved&&!intro&&[{side:'left',x:split/2},{side:'right',x:split+(100-split)/2}].map(hint=><span key={hint.side} className={s.compareHint} data-side={hint.side} style={{left:`${hint.x}%`}} aria-hidden="true">
   <svg className={s.compareBurst} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 2v8m0 28v8M2 24h8m28 0h8M8 8l6 6m20 20 6 6M8 40l6-6m20-20 6-6"/></svg>
   <svg className={s.compareFinger} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{HINT_FINGER.map(d=><path key={d} d={d}/>)}</svg>
  </span>)}
  <span className={s.compareTag} data-side="before">원본</span><span className={s.compareTag} data-side="after">{label}</span>
  <input className={s.compareRange} type="range" min={0} max={100} value={split} onChange={event=>move(Number(event.target.value))} aria-label="원본과 결과 비교 위치"/>
  <span className={s.aiMark}>가상 인물 · AI 생성 이미지</span>
 </div>;
}

/** The editor's preset browser (cosplay mode) on the landing: same tabs, wardrobe, filters, search and 3x3 pages. Picking only marks cards. */
export function LandingPresetBrowser({onPicked}:{onPicked?:(picked:Record<string,string[]>)=>void}={}){
 const [kind,setKind]=useState<AiPhotoKind>('outfit'),[page,setPage]=useState(0),[query,setQuery]=useState(''),[costumeCategory,setCostumeCategory]=useState<AiPhotoCostumeCategory>(aiPhotoCostumeCategories[0].value);
 const [posture,setPosture]=useState<AiPhotoPosePosture>('standing'),[backgroundCategory,setBackgroundCategory]=useState<AiPhotoBackgroundCategory>('indoor'),[picked,setPickedState]=useState<Record<string,string[]>>({});
 const setPicked=(update:(previous:Record<string,string[]>)=>Record<string,string[]>)=>setPickedState(previous=>{const next=update(previous);onPicked?.(next);return next;});
 const category=aiPhotoCostumeCategories.find(item=>item.value===costumeCategory)!;
 const costumes=aiPhotoCostumes.filter(item=>query.trim()?aiPhotoPresetMatches(query,item.name,item.detail,aiPhotoCostumeCategories.find(c=>c.value===item.category)!.label):item.category===costumeCategory);
 const preset=aiPhotoPresetPage(kind,page,'original',query,kind==='pose'?posture:undefined,kind==='background'?backgroundCategory:undefined);
 const chosen=picked[kind]||[];
 function change(next:AiPhotoKind){setKind(next);setPage(0);setQuery('');}
 function search(value:string){setQuery(value);setPage(0);}
 function pick(value:string){setPicked(previous=>{const current=previous[kind]||[];if(value===AI_PHOTO_KEEP_ORIGINAL)return {...previous,[kind]:[]};
  const next=current.includes(value)?current.filter(item=>item!==value):kind==='makeup'?[...current,value]:[value];return {...previous,[kind]:next};});}
 const selected=(value:string)=>value===AI_PHOTO_KEEP_ORIGINAL?chosen.length===0:chosen.includes(value);
 return <div className={`${e.controls} ${s.browser}`}>
  <div className={e.tabs} role="tablist" aria-label="편집 카테고리">{landingKinds.map(item=><button key={item.value} type="button" role="tab" aria-selected={kind===item.value} onClick={()=>change(item.value)}><AiPhotoCategoryIcon kind={item.value}/><span>{item.label}</span>{kind===item.value&&<svg className={e.tabCheck} aria-hidden="true" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="m2 6 3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}</button>)}</div>
  {kind==='background'&&<div className={e.posePosture} role="group" aria-label="배경 카테고리">{(['indoor','outdoor'] as const).map(value=><button key={value} type="button" aria-pressed={backgroundCategory===value} onClick={()=>{setBackgroundCategory(value);search('');}}>{value==='indoor'?'실내':'아웃도어'}</button>)}</div>}
  {kind==='pose'&&<div className={e.posePosture} role="group" aria-label="포즈 자세">{(['sitting','standing'] as const).map(value=><button key={value} type="button" aria-pressed={posture===value} onClick={()=>{setPosture(value);search('');}}>{value==='sitting'?'앉기':'서기'}</button>)}</div>}
  <div className={e.presetSearch}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input type="search" aria-label="프리셋 검색" placeholder={kind==='outfit'?'의상 이름·작품 검색':`${landingKinds.find(item=>item.value===kind)!.label} 프리셋 검색`} value={query} onChange={event=>search(event.target.value)}/>{query&&<button type="button" aria-label="검색어 지우기" onClick={()=>search('')}>×</button>}</div>
  {kind==='outfit'?<div role="tabpanel" aria-label="코스튬 프리셋" className={e.wardrobe}>
   <div className={e.wardrobeHeading}><h3>어떤 의상을 입어볼까요?</h3></div>
   <p className={e.costumeHint}>{AI_PHOTO_COSTUME_HINT}</p>
   <div className={e.costumeCategoryBar}><SelectField className={e.costumeCategoryPicker} label="의상 카테고리" hideLabel value={costumeCategory} onChange={value=>{setCostumeCategory(value as AiPhotoCostumeCategory);search('');}} options={aiPhotoCostumeCategories.map(item=>({value:item.value,label:item.label,image:item.image}))}/><span>{query.trim()?'전체 의상 검색':category.group} · {costumes.length}종</span></div>
   <AiPhotoWardrobe key={`${costumeCategory}-${query}`} items={costumes} selectedPrompts={picked.outfit||[]} disabled={false} onPick={value=>{const text=aiPhotoPresetText(value);setPicked(previous=>({...previous,outfit:(previous.outfit||[]).includes(text)?[]:[text]}));}}/>
  </div>:<div role="tabpanel" aria-label={`${landingKinds.find(item=>item.value===kind)!.label} 프리셋`} className={e.presets}>
   <div className={e.presetHeading}><span>{query.trim()?`검색 결과 ${preset.total}개`:'프리셋'}</span><div className={e.presetNavigation}><button type="button" aria-label="이전 프리셋 페이지" disabled={preset.pages<=1} onClick={()=>setPage(preset.index-1)}>‹</button><span aria-live="polite">{preset.index+1} / {preset.pages}</span><button type="button" aria-label="다음 프리셋 페이지" disabled={preset.pages<=1} onClick={()=>setPage(preset.index+1)}>›</button></div></div>
   <AiPresetPager key={`${kind}-${query}`} onStep={step=>setPage(preset.index+step)} disabled={preset.pages<=1}><div className={e.photoPresetGrid}>{preset.examples.map(example=><button type="button" key={example} className={e.preset} aria-label={aiPhotoPresetTitle(kind,example)} aria-pressed={selected(example)} onClick={()=>pick(example)}>
    {/* eslint-disable-next-line @next/next/no-img-element -- static preset illustration or example photograph */}
    <img className={illustrated.includes(kind)||example===AI_PHOTO_KEEP_ORIGINAL?e.presetIllustration:undefined} src={aiPhotoPresetImage(kind,example)} alt="" loading="lazy"/>{kind==='makeup'&&aiPhotoMakeupGender(example)&&<CostumeGender gender={aiPhotoMakeupGender(example)} title={aiPhotoMakeupGender(example)==='male'?'남성 메이크업':'여성 메이크업'}/>}<span>{aiPhotoPresetTitle(kind,example)}</span><span className={e.presetCheck} aria-hidden="true">{selected(example)?'✓':''}</span></button>)}</div></AiPresetPager>
   {preset.total===0&&<p className={e.presetEmpty} role="status">검색 결과가 없어요. 다른 검색어를 입력해 주세요.</p>}
  </div>}
 </div>;
}

export default function AiPhotoLanding(){
 useFunnelStep('landing_view');
 const [look,setLook]=useState(landingLooks[0].id),[landingPicked,setLandingPicked]=useState<Record<string,string[]>>({});
 const current=landingLooks.find(item=>item.id===look)||landingLooks[0];
 return <main className={s.page} style={designVariables as CSSProperties}>
  <header className={s.header}><Brand href="/service/feed"/><Link className={s.headerLink} href={TRY}>무료 체험</Link></header>

  <section className={s.hero} aria-labelledby="ai-photo-title">
   <div className={s.heroCopy}>
    <h1 id="ai-photo-title">사진 한 장으로,<br/>오늘의 <em>캐릭터</em>가 되어 보세요</h1>
    <p className={s.lead}>원하는 <strong>코스튬과 메이크업, 포즈와 배경</strong>을 고르면 AI가 사진을 새로 만들어요. <strong>원본 사진은 그대로</strong> 두고, 마음에 드는 결과만 골라 게시해요.</p>
    <div className={s.actions}><Link className={s.primary} href={TRY}>로그인 없이 무료 체험</Link><a className={s.secondary} href="#ai-photo-kinds">프리셋 둘러보기</a></div>
    <p className={s.small}>비회원은 브라우저당 <strong>10회까지 무료</strong>로 만들어 볼 수 있어요.</p>
   </div>
   <div className={s.heroDemo}>
    <AiPhotoCompare before="/illustrations/landing/ai-photo/base-v1.webp" after={current.image} label={current.label}/>
    <div className={s.looks} role="radiogroup" aria-label="결과 사진 고르기">{landingLooks.map(item=><button key={item.id} type="button" role="radio" aria-checked={item.id===look} className={s.look} onClick={()=>setLook(item.id)}>{/* eslint-disable-next-line @next/next/no-img-element -- fixed demo images */}<img src={item.thumb} alt="" width={56} height={70}/><span>{item.label}</span></button>)}</div>
    <div className={s.used}><p>이 사진에 고른 프리셋</p><ul className={s.usedCards}>{current.cards.map(card=><li key={`${card.kind}-${card.title}`} className={s.usedCard}>{/* eslint-disable-next-line @next/next/no-img-element -- catalog preset images */}<img src={card.image} alt="" width={72} height={72} loading="lazy" data-illustrated={illustrated.includes(card.kind)||undefined}/><span>{landingKinds.find(item=>item.value===card.kind)?.label}</span><strong>{card.title}</strong></li>)}</ul></div>
   </div>
  </section>

  <section className={s.section} aria-labelledby="ai-photo-kinds-title" id="ai-photo-kinds">
   <h2 id="ai-photo-kinds-title">고를 수 있는 편집</h2>
   <p className={s.sectionLead}>실제 편집 화면과 같은 프리셋이에요. 눌러서 둘러보고, 체험에서 내 사진에 적용해 보세요.</p>
   <LandingPresetBrowser onPicked={setLandingPicked}/>
   {/* 2026-11-17 user request: the picked presets carry over to the trial editor (this browser only). */}
   <Link className={s.primary} href={TRY} onClick={()=>saveAiPhotoHandoff(Object.entries(landingPicked).flatMap(([kind,values])=>values.filter(value=>value!==AI_PHOTO_KEEP_ORIGINAL).map(value=>({kind:kind as AiPhotoKind,prompt:aiPhotoPresetText(value)}))))}>이 프리셋으로 무료 체험</Link>
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
