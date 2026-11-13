"use client";
import {useEffect,useId,useRef,useState} from 'react';
import type {ApiResult} from '@/types/crefans';
import type {AiPhotoEditInput,AiPhotoEditResult,AiPhotoKind,StudioMedia} from '@/types/crefans-studio-management';
import {Dialog,TextAreaField} from '@/components/ui/Primitives';
import {Checkbox} from '@/components/ui/Choice';
import {AI_PHOTO_IMAGES_PER_REQUEST,AI_PHOTO_PROMPT_MAX,aiPhotoKinds,aiPhotoProblem,aiPhotoStyles} from '@/lib/crefans/ai-photo';
import {Action} from '../ServiceUI';
import {aiPhotoPresetPage} from '@/lib/crefans/ai-photo-presets';
import {AiPhotoCategoryIcon} from './AiPhotoCategoryIcon';
import {PromptLayout,promptPrimary} from '../PromptLayout';
import {AiPhotoMask,buildAiMask,type MaskStroke} from './AiPhotoMask';
import s from './ai-photo.module.css';

type Props={open:boolean;onClose:()=>void;images:StudioMedia[];quota:{remaining:number;limit:number;typicalSeconds?:number|null};room:number;
 onEdit:(input:AiPhotoEditInput)=>Promise<ApiResult<AiPhotoEditResult>>;onAdd:(images:StudioMedia[])=>void};

function ZoomIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>;}

export function AiPhotoDialog({open,onClose,images,quota,room,onEdit,onAdd}:Props){
 const [sourceId,setSourceId]=useState(images[0]?.id||''),[kind,setKind]=useState<AiPhotoKind>('pose'),[prompts,setPrompts]=useState<Partial<Record<AiPhotoKind,string>>>({});
 const style='photo';
 const [presetPages,setPresetPages]=useState<Partial<Record<AiPhotoKind,number>>>({});
 const [undo,setUndo]=useState<{kind:AiPhotoKind;prompt:string}|null>(null);
 const panelId=useId(),prompt=prompts[kind]||'',preset=aiPhotoPresetPage(kind,presetPages[kind]||0);
 function setPrompt(value:string){setPrompts(previous=>({...previous,[kind]:value}));setError('');setUndo(null);}
 function pickPreset(value:string){setPrompts(previous=>({...previous,[kind]:value}));setUndo({kind,prompt});setError('');}
 function changeKind(value:AiPhotoKind){setKind(value);setError('');setUndo(null);}
 const [consent,setConsent]=useState(false),[strokes,setStrokes]=useState<MaskStroke[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [results,setResults]=useState<StudioMedia[]>([]),[selected,setSelected]=useState<string[]>([]),[remaining,setRemaining]=useState(quota.remaining);
 const [stage,setStage]=useState<'edit'|'results'>('edit'),[sourcePicker,setSourcePicker]=useState(false);
 const [viewer,setViewer]=useState<number|null>(null),[sourceViewer,setSourceViewer]=useState(false),[elapsed,setElapsed]=useState(0);
 const errorRef=useRef<HTMLParagraphElement>(null);
 const bodyRef=useRef<HTMLDivElement>(null),resultTitleRef=useRef<HTMLHeadingElement>(null),editRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{setRemaining(quota.remaining);},[quota.remaining]);
 useEffect(()=>{if(error)errorRef.current?.scrollIntoView({block:'nearest'});},[error]);
 useEffect(()=>{if(!images.some(item=>item.id===sourceId))setSourceId(images[0]?.id||'');},[images,sourceId]);
 useEffect(()=>{if(bodyRef.current)bodyRef.current.scrollTop=0;if(stage==='results')resultTitleRef.current?.focus({preventScroll:true});},[stage]);
 useEffect(()=>{if(!busy){setElapsed(0);return;}const begun=Date.now();const timer=setInterval(()=>setElapsed(Math.floor((Date.now()-begun)/1000)),1000);return()=>clearInterval(timer);},[busy]);
 const source=images.find(item=>item.id===sourceId),kindInfo=aiPhotoKinds.find(item=>item.value===kind)!,typical=quota.typicalSeconds;
 function changeSource(id:string){setSourceId(id);setStrokes([]);setSourcePicker(false);setError('');}
 async function generate(){
  if(!source||busy)return;
  const problem=aiPhotoProblem({prompt,consent,kind,hasMask:strokes.length>0,remaining});if(problem){setError(problem);return;}
  setBusy(true);setError('');setStage('results');
  try{
   const mask=kind==='outfit'?await buildAiMask(source.url,strokes):undefined;
   if(kind==='outfit'&&!mask){setError('칠한 영역을 처리하지 못했어요. 다시 칠해 주세요.');setStage('edit');return;}
   const result=await onEdit({source,kind,prompt:prompt.trim(),style,...(mask?{mask}:{}),consent:true});
   if(!result.success){setError(result.errorMessage);setStage(results.length?'results':'edit');return;}
   const made=result.data.images.map(item=>({...item,aiGenerated:true}));
   setResults(made);setSelected(made.slice(0,1).map(item=>item.id));setRemaining(result.data.remaining);
  }catch{setError('사진을 만들지 못했어요. 잠시 후 다시 시도해 주세요.');setStage(results.length?'results':'edit');}
  finally{setBusy(false);}
 }
 function toggle(id:string){setSelected(previous=>previous.includes(id)?previous.filter(item=>item!==id):[...previous,id]);setError('');}
 function add(){
  const picked=results.filter(item=>selected.includes(item.id));
  if(!picked.length){setError('게시물에 넣을 사진을 골라 주세요.');return;}
  if(picked.length>room){setError(`사진은 ${room}장만 더 넣을 수 있어요.`);return;}
  onAdd(picked);setResults([]);setSelected([]);setPrompts({});setUndo(null);setStrokes([]);setError('');setStage('edit');onClose();
 }
 const viewing=viewer!==null||sourceViewer;
 function closeViewer(){setViewer(null);setSourceViewer(false);if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>editRef.current?.focus({preventScroll:true}));}
 return <Dialog open={open} onClose={()=>{if(viewing){closeViewer();return;}if(!busy)onClose();}} title="AI 사진 편집" persistent fullscreenOnMobile className={s.editor}>
  {!images.length?<div className={s.body}><PromptLayout variant="dialog" icon="/brand/featured-creators-v1.png" title="바꿀 사진을 먼저 올려 주세요" description="게시물에 사진을 올리면 AI로 옷·포즈·배경을 바꿀 수 있어요." actions={<Action type="button" className={promptPrimary} onClick={onClose}>사진 올리러 가기</Action>}/></div>:<>
   <div ref={bodyRef} className={s.body} inert={viewing}>
   {stage==='edit'&&<div className={s.sourceSection}>
     <div className={s.sourceHeading}><span>원본 사진</span>{images.length>1&&<button type="button" aria-expanded={sourcePicker} onClick={()=>setSourcePicker(!sourcePicker)}>사진 바꾸기</button>}</div>
     {sourcePicker&&<div className={s.sources} role="radiogroup" aria-label="원본 사진 고르기">{images.map((item,index)=><button key={item.id} type="button" role="radio" aria-checked={item.id===sourceId} aria-label={`${index+1}번 사진`} className={s.source} onClick={()=>changeSource(item.id)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded draft thumbnail */}
      <img src={item.preview||item.url} alt=""/>{item.aiGenerated&&<span className={s.ai}>AI</span>}</button>)}</div>}
     {source&&(kind==='outfit'?<><AiPhotoMask src={source.url} alt="원본 사진" strokes={strokes} onChange={next=>{setStrokes(next);setError('');}} disabled={busy}/><p className={s.hint}>바꿀 옷 부분만 칠해 주세요. 얼굴과 배경은 유지하도록 요청해요.</p></>:<div className={s.previewFrame}>
      {/* eslint-disable-next-line @next/next/no-img-element -- creator's own uploaded photo */}
      <img className={s.preview} src={source.url} alt="원본 사진"/><button ref={editRef} type="button" className={s.zoom} aria-label="원본 사진 크게 보기" onClick={()=>setSourceViewer(true)}><ZoomIcon/></button>
     </div>)}
   </div>}
    {stage==='edit'?<div className={s.controls}>
     <div className={s.tabs} role="tablist" aria-label="편집 카테고리">{aiPhotoKinds.map((item,index)=><button key={item.value} id={`${panelId}-${item.value}`} type="button" role="tab" aria-controls={panelId} tabIndex={kind===item.value?0:-1} aria-selected={kind===item.value} onClick={()=>changeKind(item.value)} onKeyDown={event=>{
      const next=event.key==='ArrowRight'?(index+1)%aiPhotoKinds.length:event.key==='ArrowLeft'?(index+aiPhotoKinds.length-1)%aiPhotoKinds.length:event.key==='Home'?0:event.key==='End'?aiPhotoKinds.length-1:null;
      if(next===null)return;event.preventDefault();changeKind(aiPhotoKinds[next].value);event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
     }} disabled={busy}><AiPhotoCategoryIcon kind={item.value}/><span>{item.label}</span></button>)}</div>
     <div id={panelId} role="tabpanel" aria-labelledby={`${panelId}-${kind}`} className={s.presets}>
      <div className={s.presetHeading}><span>예시를 누르면 입력창에 담겨요.</span><span aria-live="polite">{preset.index+1} / {preset.pages}</span></div>
      {preset.examples.map(example=><button type="button" key={example} className={s.preset} aria-pressed={prompt===example} onClick={()=>pickPreset(example)} disabled={busy}><span>{example}</span><span className={s.presetCheck} aria-hidden="true">{prompt===example?'✓':''}</span></button>)}
      <button type="button" className={s.morePresets} onClick={()=>setPresetPages(previous=>({...previous,[kind]:(preset.index+1)%preset.pages}))} disabled={busy}>다른 예시 보기 <span aria-hidden="true">↻</span></button>
     </div>
    <div className={s.composer}>
     <TextAreaField label="직접 입력 · 수정" rows={2} showCount maxLength={AI_PHOTO_PROMPT_MAX} value={prompt} onChange={event=>setPrompt(event.target.value)} placeholder={kindInfo.placeholder} disabled={busy}/>
     {undo?.kind===kind&&<button className={s.undoPreset} type="button" onClick={()=>setPrompt(undo.prompt)}>예시 적용 취소</button>}
     <div className={s.consent}><Checkbox checked={consent} onChange={value=>{setConsent(value);setError('');}} disabled={busy} label="사진 속 인물은 나 자신이거나 사용 동의를 받았어요."/></div>
    </div>
     <details className={s.notice}><summary>AI 생성 표시 및 이용 안내</summary><p>노출·성적인 합성, 미성년자, 다른 사람 얼굴 합성은 만들 수 없어요. 만든 사진에는 ‘AI 생성’ 표시가 붙어요.</p></details>
    </div>:<div className={s.results} aria-busy={busy}>
     <div className={s.summary}>
      {/* eslint-disable-next-line @next/next/no-img-element -- own source thumbnail */}
      {source&&<img src={source.preview||source.url} alt=""/>}<div><strong>{kindInfo.label} 바꾸기</strong><span>{aiPhotoStyles.find(item=>item.value===style)?.label}</span></div>
      <button ref={editRef} type="button" onClick={()=>{setStage('edit');setError('');}} disabled={busy}>설정 수정</button>
     </div>
     <div className={s.resultHeading}><h3 ref={resultTitleRef} tabIndex={-1}>{busy?'사진을 만들고 있어요':'만든 사진'}</h3>{!busy&&<span>{selected.length}장 선택</span>}</div>
     {busy?<><div className={s.progress}><p role="status">{typical?`보통 약 ${typical}초 걸려요.`:'걸리는 시간을 재는 중이에요.'}</p><strong aria-hidden="true">{elapsed}초 지남{typical?` / 보통 약 ${typical}초`:''}</strong>{typical?<span className={s.progressBar} aria-hidden="true"><i style={{width:`${Math.min(95,Math.round(elapsed/typical*100))}%`}}/></span>:null}<small>창을 닫지 말고 기다려 주세요.</small></div><div className={s.placeholder}>{Array.from({length:AI_PHOTO_IMAGES_PER_REQUEST},(_,i)=><span key={i} className={s.loading}/>)}</div></>:
      <><p className={s.help}>사진을 선택하거나 크게 볼 수 있어요.</p><div className={s.grid}>{results.map((item,index)=><div key={item.id} className={s.resultItem}><div className={s.resultFrame}><button type="button" className={s.result} aria-pressed={selected.includes(item.id)} aria-label={`결과 ${index+1}`} onClick={()=>toggle(item.id)}>
       {/* eslint-disable-next-line @next/next/no-img-element -- generated draft image */}
       <img src={item.url} alt=""/><span className={s.ai}>AI 생성</span><span className={s.selection} aria-hidden="true">{selected.includes(item.id)?'✓':''}</span></button>
       <button type="button" className={s.zoom} aria-label={`결과 ${index+1} 크게 보기`} title="크게 보기" onClick={()=>setViewer(index)}><ZoomIcon/></button></div><div className={s.resultName}><span>결과 {index+1}</span>{selected.includes(item.id)&&<span>선택됨</span>}</div></div>)}</div><p className={s.originalNote}>원본 사진은 그대로 보관돼요.</p></>}
    </div>}
    {stage==='results'&&!busy&&<div className={s.resultActions}><Action type="button" variant="secondary" onClick={()=>void generate()} disabled={busy||remaining<=0}><span aria-hidden="true">↻</span> 다시 만들기</Action><Action type="button" onClick={add} disabled={busy||!selected.length}>게시물에 추가 ({selected.length})</Action></div>}
    {(stage==='edit'||busy)&&<div className={s.quota}><span>오늘 남은 횟수 <b>{remaining}</b>/{quota.limit}</span></div>}
    {error&&<p ref={errorRef} className={s.error} role="alert">{error}</p>}
   </div>
   {(stage==='edit'||busy)&&<div className={s.footer} inert={viewing}>
    <Action type="button" onClick={()=>void generate()} disabled={busy||remaining<=0}>{busy?`만드는 중… ${elapsed}초`:`${AI_PHOTO_IMAGES_PER_REQUEST}장 만들기`}</Action>
   </div>}
  </>}
  {viewer!==null&&results[viewer]&&<AiResultViewer items={results} index={viewer} selected={selected} onIndex={setViewer} onToggle={toggle} onClose={closeViewer}/>}
  {sourceViewer&&source&&<AiResultViewer items={[source]} index={0} selected={[]} onIndex={()=>{}} onClose={closeViewer} original/>}
 </Dialog>;
}

/** Full-screen look at one result: swipe or arrows to move, pick it from here, Esc or 닫기 returns to the editor (the editor stays open). */
function AiResultViewer({items,index,selected,onIndex,onToggle,onClose,original=false}:{items:StudioMedia[];index:number;selected:string[];onIndex:(index:number)=>void;onToggle?:(id:string)=>void;onClose:()=>void;original?:boolean}){
 const closeRef=useRef<HTMLButtonElement>(null),start=useRef<number|null>(null),item=items[index],picked=selected.includes(item.id);
 useEffect(()=>{closeRef.current?.focus({preventScroll:true});},[]);
 const go=(next:number)=>{if(next>=0&&next<items.length)onIndex(next);};
 return <div className={s.viewer} role="group" aria-label={original?'원본 사진 크게 보기':`결과 ${index+1} 크게 보기`} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}else if(event.key==='ArrowLeft')go(index-1);else if(event.key==='ArrowRight')go(index+1);}}
  onPointerDown={event=>{start.current=event.clientX;}} onPointerUp={event=>{const from=start.current;start.current=null;if(from===null)return;const dx=event.clientX-from;if(Math.abs(dx)>50)go(index+(dx<0?1:-1));}}>
  <div className={s.viewerBar}><span>{original?'원본 사진':`결과 ${index+1} / ${items.length}`}</span><button ref={closeRef} type="button" className={s.viewerClose} onClick={onClose}>닫기</button></div>
  <div className={s.viewerStage}>
   {index>0&&<button type="button" className={`${s.viewerNav} ${s.viewerPrev}`} aria-label="이전 결과" onClick={()=>go(index-1)}>‹</button>}
   {/* eslint-disable-next-line @next/next/no-img-element -- generated draft image at full size */}
   <span className={s.viewerFrame}><img src={item.url} alt={original?'원본 사진':`결과 ${index+1} (AI 생성 사진)`} draggable={false}/>{(!original||item.aiGenerated)&&<span className={s.ai}>AI 생성</span>}</span>
   {index<items.length-1&&<button type="button" className={`${s.viewerNav} ${s.viewerNext}`} aria-label="다음 결과" onClick={()=>go(index+1)}>›</button>}
  </div>
  {onToggle&&<div className={s.viewerActions}><Action type="button" variant={picked?'secondary':'primary'} aria-pressed={picked} onClick={()=>onToggle(item.id)}>{picked?'선택됨 ✓':'이 사진 선택'}</Action></div>}
 </div>;
}
