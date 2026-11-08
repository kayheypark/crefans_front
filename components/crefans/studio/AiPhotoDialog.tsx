'use client';
// 스튜디오 AI 사진 편집 창(2026-11-08 시안 A + 의상 영역 칠하기). 생성은 주입된 onEdit 으로만 요청한다.
// 결과는 'AI 생성' 표시와 함께 고른 사진만 게시물에 추가한다. 원본 사진은 바꾸지 않는다.
import {useEffect,useRef,useState} from 'react';
import type {ApiResult} from '@/types/crefans';
import type {AiPhotoEditInput,AiPhotoEditResult,AiPhotoKind,AiPhotoStyle,StudioMedia} from '@/types/crefans-studio-management';
import {Dialog,TextAreaField} from '@/components/ui/Primitives';
import {Checkbox} from '@/components/ui/Choice';
import {AI_PHOTO_IMAGES_PER_REQUEST,AI_PHOTO_PROMPT_MAX,aiPhotoKinds,aiPhotoProblem,aiPhotoStyles} from '@/lib/crefans/ai-photo';
import {Action} from '../ServiceUI';
import {AiPhotoMask,buildAiMask,type MaskStroke} from './AiPhotoMask';
import s from './ai-photo.module.css';

type Props={open:boolean;onClose:()=>void;images:StudioMedia[];quota:{remaining:number;limit:number;typicalSeconds?:number|null};room:number;
 onEdit:(input:AiPhotoEditInput)=>Promise<ApiResult<AiPhotoEditResult>>;onAdd:(images:StudioMedia[])=>void};

export function AiPhotoDialog({open,onClose,images,quota,room,onEdit,onAdd}:Props){
 const [sourceId,setSourceId]=useState(images[0]?.id||''),[kind,setKind]=useState<AiPhotoKind>('pose'),[prompt,setPrompt]=useState(''),[style,setStyle]=useState<AiPhotoStyle>('photo');
 const [consent,setConsent]=useState(false),[strokes,setStrokes]=useState<MaskStroke[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [results,setResults]=useState<StudioMedia[]>([]),[selected,setSelected]=useState<string[]>([]),[remaining,setRemaining]=useState(quota.remaining);
 useEffect(()=>{setRemaining(quota.remaining);},[quota.remaining]);
 // One column on phones: bring the new results into view (they sit below the form).
 const resultsRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(results.length&&typeof window!=='undefined'&&window.matchMedia?.('(max-width:767px)').matches)resultsRef.current?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});},[results]);
 useEffect(()=>{if(!images.some(item=>item.id===sourceId))setSourceId(images[0]?.id||'');},[images,sourceId]);
 const source=images.find(item=>item.id===sourceId),kindInfo=aiPhotoKinds.find(item=>item.value===kind)!;
 function changeSource(id:string){setSourceId(id);setStrokes([]);setError('');}
 async function generate(){
  if(!source||busy)return;
  const problem=aiPhotoProblem({prompt,consent,kind,hasMask:strokes.length>0,remaining});if(problem){setError(problem);return;}
  setBusy(true);setError('');
  try{
   const mask=kind==='outfit'?await buildAiMask(source.url,strokes):undefined;
   if(kind==='outfit'&&!mask){setError('칠한 영역을 처리하지 못했어요. 다시 칠해 주세요.');return;}
   const result=await onEdit({source,kind,prompt:prompt.trim(),style,...(mask?{mask}:{}),consent:true});
   if(!result.success){setError(result.errorMessage);return;}
   const made=result.data.images.map(item=>({...item,aiGenerated:true}));
   setResults(made);setSelected(made.slice(0,1).map(item=>item.id));setRemaining(result.data.remaining);
  }catch{setError('사진을 만들지 못했어요. 잠시 후 다시 시도해 주세요.');}
  finally{setBusy(false);}
 }
 const [viewer,setViewer]=useState<number|null>(null),[elapsed,setElapsed]=useState(0);
 // Seconds since 만들기 was pressed (2026-11-08 user request: show elapsed time and the usual time while it runs).
 useEffect(()=>{if(!busy){setElapsed(0);return;}const begun=Date.now();const timer=setInterval(()=>setElapsed(Math.floor((Date.now()-begun)/1000)),1000);return()=>clearInterval(timer);},[busy]);
 const typical=quota.typicalSeconds;
 function toggle(id:string){setSelected(previous=>previous.includes(id)?previous.filter(item=>item!==id):[...previous,id]);}
 function add(){
  const picked=results.filter(item=>selected.includes(item.id));
  if(!picked.length){setError('게시물에 넣을 사진을 골라 주세요.');return;}
  if(picked.length>room){setError(`사진은 ${room}장만 더 넣을 수 있어요.`);return;}
  onAdd(picked);setResults([]);setSelected([]);setPrompt('');setStrokes([]);setError('');onClose();
 }
 return <Dialog open={open} onClose={()=>{if(viewer!==null){setViewer(null);return;}if(!busy)onClose();}} title="AI로 사진 만들기" wide persistent fullscreenOnMobile>
  {!images.length?<div className={s.empty}><p>먼저 바꿀 사진을 올려 주세요. 올린 사진의 옷·포즈·배경을 바꿀 수 있어요.</p><Action type="button" variant="secondary" onClick={onClose}>닫기</Action></div>:
  <div className={s.layout}>
   <div className={s.controls}>
    <p className={s.label}>원본 사진</p>
    {images.length>1&&<div className={s.sources} role="radiogroup" aria-label="원본 사진 고르기">{images.map((item,index)=><button key={item.id} type="button" role="radio" aria-checked={item.id===sourceId} aria-label={`${index+1}번 사진`} className={s.source} onClick={()=>changeSource(item.id)} disabled={busy}>
     {/* eslint-disable-next-line @next/next/no-img-element -- uploaded draft thumbnail */}
     <img src={item.preview||item.url} alt=""/>{item.aiGenerated&&<span className={s.ai}>AI</span>}</button>)}</div>}
    <p className={s.label}>무엇을 바꿀까요?</p>
    <div className={s.tabs} role="tablist" aria-label="바꿀 것">{aiPhotoKinds.map(item=><button key={item.value} type="button" role="tab" aria-selected={kind===item.value} onClick={()=>{setKind(item.value);setError('');}} disabled={busy}>{item.label}</button>)}</div>
    {source&&(kind==='outfit'?<><AiPhotoMask src={source.url} alt="원본 사진" strokes={strokes} onChange={next=>{setStrokes(next);setError('');}} disabled={busy}/><p className={s.hint}>바꿀 옷 부분만 칠해 주세요. 칠한 곳만 바뀌고 얼굴과 배경은 그대로 둬요.</p></>:
     // eslint-disable-next-line @next/next/no-img-element -- creator's own uploaded photo
     <img className={s.preview} src={source.url} alt="원본 사진"/>)}
    <TextAreaField label="원하는 모습" rows={3} maxLength={AI_PHOTO_PROMPT_MAX} value={prompt} onChange={event=>{setPrompt(event.target.value);setError('');}} placeholder={kindInfo.placeholder} disabled={busy}/>
    <div className={s.styles} role="radiogroup" aria-label="사진 느낌">{aiPhotoStyles.map(item=><button key={item.value} type="button" role="radio" aria-checked={style===item.value} className={s.chip} onClick={()=>setStyle(item.value)} disabled={busy}>{item.label}</button>)}</div>
    <div className={s.consent}><Checkbox checked={consent} onChange={value=>{setConsent(value);setError('');}} disabled={busy} label={<>사진 속 인물은 <b>나 자신</b>이거나 <b>동의</b>를 받았어요.</>} description="노출·성적인 합성, 미성년자, 다른 사람 얼굴 합성은 만들 수 없어요. 만든 사진에는 ‘AI 생성’ 표시가 붙어요."/></div>
    {error&&<p className={s.error} role="alert">{error}</p>}
    <div className={s.generate}><span className={s.quota}>오늘 남은 횟수 {remaining}/{quota.limit}</span><Action type="button" onClick={()=>void generate()} disabled={busy||remaining<=0}>{busy?`만드는 중… ${elapsed}초`:`${AI_PHOTO_IMAGES_PER_REQUEST}장 만들기`}</Action></div>
   </div>
   <div ref={resultsRef} className={s.results} aria-live="polite" aria-busy={busy}>
    <p className={s.label}>{results.length?'결과 · 게시물에 넣을 사진을 고르세요':'결과'}</p>
    {busy&&<div className={s.progress}><p role="status">사진을 만들고 있어요. {typical?`보통 약 ${typical}초 걸려요.`:'걸리는 시간을 재는 중이에요.'}</p><strong aria-hidden="true">{elapsed}초 지남{typical?` / 보통 약 ${typical}초`:''}</strong>{typical?<span className={s.progressBar} aria-hidden="true"><i style={{width:`${Math.min(95,Math.round(elapsed/typical*100))}%`}}/></span>:null}<small>창을 닫지 말고 기다려 주세요.</small></div>}
    {busy?<div className={s.placeholder}>{Array.from({length:AI_PHOTO_IMAGES_PER_REQUEST},(_,i)=><span key={i} className={s.loading}/>)}</div>:
     results.length?<div className={s.grid}>{results.map((item,index)=><div key={item.id} className={s.resultItem}><button type="button" className={s.result} aria-pressed={selected.includes(item.id)} aria-label={`결과 ${index+1}`} onClick={()=>toggle(item.id)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- generated draft image */}
      <img src={item.url} alt=""/><span className={s.ai}>AI 생성</span></button>
      <button type="button" className={s.zoom} aria-label={`결과 ${index+1} 크게 보기`} title="크게 보기" onClick={()=>setViewer(index)}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></button></div>)}</div>:
     <p className={s.emptyResult}>바꿀 것과 원하는 모습을 정하고 만들기를 누르세요. 원본 사진은 그대로 남아요.</p>}
    {!!results.length&&<div className={s.resultActions}><Action type="button" variant="secondary" onClick={()=>void generate()} disabled={busy||remaining<=0}>다시 만들기</Action><Action type="button" onClick={add} disabled={busy||!selected.length}>게시물에 추가{selected.length?` (${selected.length})`:''}</Action></div>}
   </div>
  </div>}
  {viewer!==null&&results[viewer]&&<AiResultViewer items={results} index={viewer} selected={selected} onIndex={setViewer} onToggle={toggle} onClose={()=>setViewer(null)}/>}
 </Dialog>;
}

/** Full-screen look at one result: swipe or arrows to move, pick it from here, Esc or 닫기 returns to the editor (the editor stays open). */
function AiResultViewer({items,index,selected,onIndex,onToggle,onClose}:{items:StudioMedia[];index:number;selected:string[];onIndex:(index:number)=>void;onToggle:(id:string)=>void;onClose:()=>void}){
 const closeRef=useRef<HTMLButtonElement>(null),start=useRef<number|null>(null),item=items[index],picked=selected.includes(item.id);
 useEffect(()=>{closeRef.current?.focus({preventScroll:true});},[]);
 const go=(next:number)=>{if(next>=0&&next<items.length)onIndex(next);};
 return <div className={s.viewer} role="group" aria-label={`결과 ${index+1} 크게 보기`} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}else if(event.key==='ArrowLeft')go(index-1);else if(event.key==='ArrowRight')go(index+1);}}
  onPointerDown={event=>{start.current=event.clientX;}} onPointerUp={event=>{const from=start.current;start.current=null;if(from===null)return;const dx=event.clientX-from;if(Math.abs(dx)>50)go(index+(dx<0?1:-1));}}>
  <div className={s.viewerBar}><span>결과 {index+1} / {items.length}</span><button ref={closeRef} type="button" className={s.viewerClose} onClick={onClose}>닫기</button></div>
  <div className={s.viewerStage}>
   {index>0&&<button type="button" className={`${s.viewerNav} ${s.viewerPrev}`} aria-label="이전 결과" onClick={()=>go(index-1)}>‹</button>}
   {/* eslint-disable-next-line @next/next/no-img-element -- generated draft image at full size */}
   <span className={s.viewerFrame}><img src={item.url} alt={`결과 ${index+1} (AI 생성 사진)`} draggable={false}/><span className={s.ai}>AI 생성</span></span>
   {index<items.length-1&&<button type="button" className={`${s.viewerNav} ${s.viewerNext}`} aria-label="다음 결과" onClick={()=>go(index+1)}>›</button>}
  </div>
  <div className={s.viewerActions}><Action type="button" variant={picked?'secondary':'primary'} aria-pressed={picked} onClick={()=>onToggle(item.id)}>{picked?'선택됨 ✓':'이 사진 선택'}</Action></div>
 </div>;
}
