"use client";
import {AiPhotoLibrary} from './AiPhotoLibrary';
import type {PhotoAsset,PhotoLibraryModel} from '@/types/crefans-photo-library';
import {photoAssetLabel} from '@/lib/crefans/photo-library';
import {AiPhotoCrop,AiPhotoRatioPresets} from './AiPhotoCrop';
import type {AiPhotoRatio} from '@/lib/crefans/ai-photo-crop';
import type {AiPhotoCropInput} from '@/types/crefans-studio-management';
import {ShopPage} from './ShopPage';
import type {ShopModel} from '@/types/crefans-shop';
import {useEffect,useId,useRef,useState} from 'react';
import {aiPhotoCostumes,aiPhotoCostumeCategories,aiPhotoCostumeRequest,type AiPhotoCostumeCategory} from '@/lib/crefans/ai-photo-costumes';
import {SelectField} from '@/components/ui/SelectField';
import {AiPresetPager} from './AiPresetPager';
import {AiPhotoWaiting} from './AiPhotoWaiting';
import {AiBodyAdjustments} from './AiBodyAdjustments';
import {AiPhotoWardrobe} from './AiPhotoWardrobe';
import type {ApiResult} from '@/types/crefans';
import type {AiHeartInput,AiHeartResult,AiPhotoEditInput,AiPhotoEditResult,AiPhotoKind,AiPhotoTicketResult,StudioMedia} from '@/types/crefans-studio-management';
import {Dialog,TextAreaField} from '@/components/ui/Primitives';
import {AI_PHOTO_IMAGES_PER_REQUEST,AI_PHOTO_PROMPT_MAX,aiPhotoKinds,aiPhotoProblem,aiPhotoPresetText,aiPhotoBodyControls,aiPhotoMaleBodyControls,aiPhotoBodyPrompt,buildAiPhotoPrompt,type AiPhotoPresetSelection} from '@/lib/crefans/ai-photo';
import {Action} from '../ServiceUI';
import {aiPhotoPresetMatches,aiPhotoPresetPage,aiPhotoPresetImage,aiPhotoPresetTitle,aiPhotoNeutralExpressionPreset,type AiPhotoPosePosture,type AiPhotoBackgroundCategory} from '@/lib/crefans/ai-photo-presets';
import {AiPhotoCategoryIcon} from './AiPhotoCategoryIcon';
import {PromptLayout,promptPrimary} from '../PromptLayout';
import {AiPhotoMask,buildAiMask,type MaskStroke} from './AiPhotoMask';
import s from './ai-photo.module.css';

type Props={library?:PhotoLibraryModel;onCrop?:(input:AiPhotoCropInput)=>Promise<ApiResult<StudioMedia>>;onHeartGame?:(input:AiHeartInput)=>Promise<ApiResult<AiHeartResult>>;shop?:ShopModel;shopBasePath?:string;open:boolean;onClose:()=>void;images:StudioMedia[];quota:{hearts?:number;rewardRemaining?:number;paidRemaining?:number;remaining:number;limit:number;typicalSeconds?:number|null;resetTickets?:{count:number;nextExpiresAt:string|null}};room:number;
 onUseTicket?:()=>Promise<ApiResult<AiPhotoTicketResult>>;
 onEdit:(input:AiPhotoEditInput)=>Promise<ApiResult<AiPhotoEditResult>>;onAdd:(images:StudioMedia[])=>void};

const buildPrompt=(presets:AiPhotoPresetSelection[],custom:string,gender:'original'|'female'|'male')=>buildAiPhotoPrompt(aiPhotoCostumeRequest(presets).presets,custom,gender);

function ZoomIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>;}

export function AiPhotoDialog({library,onCrop,onHeartGame,open,onClose,images,quota,room,onEdit,onAdd,onUseTicket,shop,shopBasePath='/service/studio'}:Props){
 const [libraryOpen,setLibraryOpen]=useState(false),[libraryAssets,setLibraryAssets]=useState<PhotoAsset[]>([]);
 const sourceOrigins=useRef(new Map<string,string>());
 const [sourceId,setSourceId]=useState(images[0]?.id||''),[kind,setKind]=useState<AiPhotoKind>('outfit');
 const [selectedPresets,setSelectedPresets]=useState<AiPhotoPresetSelection[]>([]),[customPrompt,setCustomPrompt]=useState('');
 const [bodySelection,setBodySelection]=useState<{key:string;value:number}|null>(null);
 const [targetGender,setTargetGender]=useState<'original'|'female'|'male'>('original');
 const [aspectRatio,setAspectRatio]=useState<AiPhotoRatio>('original'),[cropItem,setCropItem]=useState<StudioMedia|null>(null);
 const [downloading,setDownloading]=useState(false);
 async function downloadPhoto(item:StudioMedia){if(downloading)return;setDownloading(true);try{const response=await fetch(item.url);if(!response.ok)throw new Error('download');const blob=await response.blob();if(!blob.type.startsWith('image/'))throw new Error('image');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`crefans-ai-${item.id.replace(/[^a-zA-Z0-9_-]/g,'')}.${blob.type==='image/jpeg'?'jpg':blob.type==='image/webp'?'webp':'png'}`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}catch{setError('사진을 다운로드하지 못했어요. 잠시 후 다시 시도해 주세요.');}finally{setDownloading(false);}}
 const [shopOpen,setShopOpen]=useState(false);
 const [genderChosen,setGenderChosen]=useState(false);
 const libraryPresets=libraryAssets.map(item=>({kind:item.category,prompt:`참고 사진의 ${photoAssetLabel(item.category)} 적용`}));
 const prompt=buildPrompt([...selectedPresets,...libraryPresets],customPrompt,targetGender)||(aspectRatio!=='original'?'Preserve the subject and appearance; adapt the composition to the requested image dimensions.':'');
 const editKinds=Array.from(new Set([...selectedPresets.map(item=>item.kind),...libraryAssets.map(item=>item.category),...(customPrompt.trim()?[kind]:[])]));
 function changeGender(value:'original'|'female'|'male'){if(buildPrompt(selectedPresets,customPrompt,value).length>AI_PHOTO_PROMPT_MAX){setError('선택한 프리셋과 커스텀 프롬프트가 너무 길어요. 내용을 줄여 주세요.');return;}if((targetGender==='male')!==(value==='male'))setBodySelection(null);setTargetGender(value);setGenderChosen(true);setPresetPages({});setSelectedPresets(previous=>previous.filter(item=>(item.kind!=='body'||(targetGender==='male')===(value==='male'))&&(item.kind!=='makeup'||aiPhotoPresetPage('makeup',0,value).examples.some(example=>aiPhotoPresetText(example)===item.prompt)||value==='original')));setError('');}
 const [workingSources,setWorkingSources]=useState<StudioMedia[]>([]);
 const sources=[...images,...workingSources.filter(item=>!images.some(original=>original.id===item.id))],hasOutfit=editKinds.includes('outfit');
 const [cosplayOpen,setCosplayOpen]=useState(true);
 const [detailedOutfit,setDetailedOutfit]=useState(false);
 const requiresMask=hasOutfit&&detailedOutfit;
 const [presetQuery,setPresetQuery]=useState('');
 const [backgroundCategory,setBackgroundCategory]=useState<AiPhotoBackgroundCategory>('indoor');
 const [posePosture,setPosePosture]=useState<AiPhotoPosePosture>('sitting');
 const [costumeCategory,setCostumeCategory]=useState<AiPhotoCostumeCategory>('general');
 const costumes=aiPhotoCostumes.filter(costume=>presetQuery.trim()?aiPhotoPresetMatches(presetQuery,costume.name,costume.detail,aiPhotoCostumeCategories.find(category=>category.value===costume.category)!.label):costume.category===costumeCategory),costumeCategoryInfo=aiPhotoCostumeCategories.find(category=>category.value===costumeCategory)!;
 const cosplay=kind==='outfit'&&cosplayOpen;
 const hasCostume=selectedPresets.some(item=>item.kind==='outfit'&&aiPhotoCostumes.some(costume=>aiPhotoPresetText(costume.prompt)===item.prompt));
 const style=hasOutfit&&(hasCostume||cosplayOpen)?'cosplay':'photo';
 const [presetPages,setPresetPages]=useState<Partial<Record<AiPhotoKind,number>>>({});
 const panelId=useId(),preset=aiPhotoPresetPage(kind,presetPages[kind]||0,targetGender,presetQuery,posePosture,backgroundCategory);
 function searchPresets(value:string){setPresetQuery(value);setPresetPages({});}
 function stepPreset(direction:number){if(busy||preset.pages<=1)return;setPresetPages(previous=>({...previous,[kind]:((previous[kind]||0)+direction+preset.pages)%preset.pages}));}
 function setCustom(value:string){setCustomPrompt(value);setError(buildPrompt(selectedPresets,value,targetGender).length>AI_PHOTO_PROMPT_MAX?'선택한 프리셋과 커스텀 프롬프트는 합쳐서 2000자까지 사용할 수 있어요.':'');}
 function isPresetSelected(value:string){return selectedPresets.some(item=>item.kind===kind&&item.prompt===aiPhotoPresetText(value));}
 function applyPresets(next:AiPhotoPresetSelection[]){const selection=next,length=buildPrompt(selection,customPrompt,targetGender).length;if(length>AI_PHOTO_PROMPT_MAX&&length>prompt.length){setError('선택한 프리셋과 커스텀 프롬프트가 너무 길어요. 내용을 줄여 주세요.');return false;}setSelectedPresets(selection);setError(length>AI_PHOTO_PROMPT_MAX?'선택한 프리셋과 커스텀 프롬프트는 합쳐서 2000자까지 사용할 수 있어요.':'');return true;}
 function pickPreset(value:string){setLibraryAssets(items=>items.filter(item=>item.category!==kind));applyPresets([...selectedPresets.filter(item=>item.kind!==kind),...(isPresetSelected(value)?[]:[{kind,prompt:aiPhotoPresetText(value)}])]);}
 function changeBody(key:string,level:number){if(applyPresets([...selectedPresets.filter(item=>item.kind!=='body'),...(level?[{kind:'body' as const,prompt:aiPhotoBodyPrompt(key,level)}]:[])]))setBodySelection(level?{key,value:level}:null);}
 function changeKind(value:AiPhotoKind){if(value===kind)return;setKind(value);searchPresets('');setError('');if(value==='expression'&&!libraryAssets.some(item=>item.category==='expression')&&!selectedPresets.some(item=>item.kind==='expression'))applyPresets([...selectedPresets,{kind:'expression',prompt:aiPhotoNeutralExpressionPreset}]);}
 const [strokes,setStrokes]=useState<MaskStroke[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [results,setResults]=useState<StudioMedia[]>([]),[selected,setSelected]=useState<string[]>([]),[remaining,setRemaining]=useState(quota.remaining);
 const [heartGame,setHeartGame]=useState<{id:string;kinds:('heart'|'candy'|'moon')[]}|null>(null),[heartBalance,setHeartBalance]=useState(quota.hearts||0),[rewardNote,setRewardNote]=useState('');
 const heartQueue=useRef(Promise.resolve()),gameEvent=useRef(0);
 function recordHeart(piece:number){if(!heartGame||!onHeartGame)return;const id=heartGame.id,eventId=String(++gameEvent.current);heartQueue.current=heartQueue.current.then(async()=>{await onHeartGame({action:'click',id,piece,eventId});}).catch(()=>{});}
 const [heartScore,setHeartScore]=useState(0),[resultHearts,setResultHearts]=useState(0);
 const heartScoreRef=useRef(0);
 function collectHeart(delta:number){heartScoreRef.current=Math.max(0,Math.min(30,heartScoreRef.current+delta));setHeartScore(heartScoreRef.current);}
 const [stage,setStage]=useState<'edit'|'results'>('edit'),[sourcePicker,setSourcePicker]=useState(false);
 const [viewer,setViewer]=useState<number|null>(null),[sourceViewer,setSourceViewer]=useState(false),[elapsed,setElapsed]=useState(0);
 const bodyRef=useRef<HTMLDivElement>(null),resultTitleRef=useRef<HTMLHeadingElement>(null),editRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(genderChosen)bodyRef.current?.querySelector<HTMLButtonElement>('[aria-label="생성 인물 성별"] button[aria-pressed="true"]')?.focus({preventScroll:true});},[genderChosen]);
 useEffect(()=>{setRemaining(quota.remaining);},[quota.remaining]);
 useEffect(()=>{setHeartBalance(quota.hearts||0);},[quota.hearts]);
 const [ticketBusy,setTicketBusy]=useState(false),[ticketNote,setTicketNote]=useState(''),tickets=quota.resetTickets?.count??0;
 async function useTicket(){if(!onUseTicket||ticketBusy||busy)return;setTicketBusy(true);setError('');setTicketNote('');
  try{const r=await onUseTicket();if(r.success){setRemaining(r.data.remaining);setTicketNote(r.data.message);}else setError(r.errorMessage||'리셋권을 사용하지 못했어요. 잠시 후 다시 시도해 주세요.');}catch{setError('리셋권을 사용하지 못했어요. 잠시 후 다시 시도해 주세요.');}finally{setTicketBusy(false);}}
 useEffect(()=>{if(!sources.some(item=>item.id===sourceId))setSourceId(sources[0]?.id||'');},[images,workingSources,sourceId]);
 useEffect(()=>{if(bodyRef.current)bodyRef.current.scrollTop=0;if(stage==='results')resultTitleRef.current?.focus({preventScroll:true});},[stage,busy]);
 useEffect(()=>{if(!busy){setElapsed(0);return;}const begun=Date.now();const timer=setInterval(()=>setElapsed(Math.floor((Date.now()-begun)/1000)),1000);return()=>clearInterval(timer);},[busy]);
 const source=sources.find(item=>item.id===sourceId),originalSource=sources.find(item=>item.id===(sourceOrigins.current.get(sourceId)||sourceId)),typical=quota.typicalSeconds;
 function changeSource(id:string){setSourceId(id);setStrokes([]);setDetailedOutfit(false);setSourcePicker(false);setError('');}
 async function generate(){
  if(busy)return;
  if(!source){setError('편집할 사진을 먼저 올려 주세요.');return;}
  if(remaining<=0){if(shop){setShopOpen(true);void shop.refresh();return;}setError(tickets>0?'오늘 만들 수 있는 횟수를 모두 썼어요. 리셋권을 사용하면 다시 만들 수 있어요.':'오늘 만들 수 있는 횟수를 모두 썼어요. 매일 오전 9시에 다시 이용할 수 있어요.');return;}
  if(!prompt.trim()){setError('프리셋을 고르거나 커스텀 프롬프트를 적어 주세요.');return;}
  if(prompt.length>AI_PHOTO_PROMPT_MAX){setError('선택한 프리셋과 커스텀 프롬프트는 합쳐서 2000자까지 사용할 수 있어요.');return;}
  const requestKind=editKinds[0]||(targetGender!=='original'?'pose':aspectRatio!=='original'?'camera':kind);
  const problem=aiPhotoProblem({prompt,consent:true,kind:hasOutfit?'outfit':requestKind,requireMask:requiresMask,hasMask:strokes.length>0,remaining});if(problem){setError(problem);return;}
  let game:typeof heartGame=null;
  if(onHeartGame){setBusy(true);try{const r=await onHeartGame({action:'start'});if(!r.success||!r.data.id||!r.data.kinds){setError(r.errorMessage||'하트 게임을 시작하지 못했어요.');return;}game={id:r.data.id,kinds:r.data.kinds};setHeartGame(game);heartQueue.current=Promise.resolve();gameEvent.current=0;}catch{setError('하트 게임을 시작하지 못했어요.');return;}finally{setBusy(false);}}
  setRewardNote('');heartScoreRef.current=0;setHeartScore(0);setBusy(true);setError('');setStage('results');
  try{
   const mask=requiresMask?await buildAiMask(source.url,strokes):undefined;
   if(requiresMask&&!mask){setError('칠한 영역을 처리하지 못했어요. 다시 칠해 주세요.');setStage('edit');return;}
   const result=await onEdit({aspectRatio,...(libraryAssets.length?{libraryIds:libraryAssets.map(item=>item.id)}:{}),...(game?{heartGameId:game.id}:{}),source,mode:cosplayOpen?'cosplay':'general',kind:editKinds.length>1?'combined':requestKind,...(editKinds.length>1?{editKinds}:{}),prompt:prompt.trim(),style,...(hasCostume?{costumeIds:aiPhotoCostumeRequest(selectedPresets).costumeIds}:{}),...(targetGender!=='original'?{targetGender}:{}),...(mask?{mask}:{}),consent:true});
   if(!result.success){if(result.errorCode==='DAILY_LIMIT'&&shop){setRemaining(0);setShopOpen(true);void shop.refresh();}else setError(result.errorMessage);setStage(results.length?'results':'edit');return;}
   const made=result.data.images.map(item=>({...item,aiGenerated:true}));for(const item of made)sourceOrigins.current.set(item.id,sourceOrigins.current.get(source.id)||source.id);
   setResultHearts(heartScoreRef.current);setResults(made);setSelected(made.slice(0,1).map(item=>item.id));setRemaining(result.data.remaining);
  }catch{setError('사진을 만들지 못했어요. 잠시 후 다시 시도해 주세요.');setStage(results.length?'results':'edit');}
  finally{if(game&&onHeartGame){await heartQueue.current;try{const reward=await onHeartGame({action:'finish',id:game.id});if(reward.success){setResultHearts(reward.data.earned||0);setHeartBalance(reward.data.hearts||0);if(reward.data.remaining!==undefined)setRemaining(reward.data.remaining);if(reward.data.converted){setRewardNote(`하트 ${reward.data.converted*10}개를 생성 ${reward.data.converted}회로 바꿨어요`);}}else setRewardNote('하트 적립 확인이 지연되고 있어요.');}catch{setRewardNote('하트 적립 확인이 지연되고 있어요.');}setHeartGame(null);}setBusy(false);}
 }
 function toggle(id:string){setSelected(previous=>previous.includes(id)?previous.filter(item=>item!==id):[...previous,id]);setError('');}
 function add(){
  const picked=results.filter(item=>selected.includes(item.id));
  if(!picked.length){setError('게시물에 넣을 사진을 골라 주세요.');return;}
  if(picked.length>room){setError(`사진은 ${room}장만 더 넣을 수 있어요.`);return;}
  onAdd(picked);sourceOrigins.current.clear();setAspectRatio('original');setResults([]);setSelected([]);setCustomPrompt('');setSelectedPresets([]);setLibraryAssets([]);setBodySelection(null);setKind('outfit');setPosePosture('sitting');setBackgroundCategory('indoor');searchPresets('');setWorkingSources([]);setTargetGender('original');setGenderChosen(false);setStrokes([]);setDetailedOutfit(false);setError('');setStage('edit');setCosplayOpen(true);onClose();
 }
 function editResult(item:StudioMedia){setTargetGender('original');setWorkingSources(previous=>previous.some(source=>source.id===item.id)?previous:[...previous,item]);changeSource(item.id);setCustomPrompt('');setSelectedPresets([]);setLibraryAssets([]);setBodySelection(null);setKind('pose');setPosePosture('sitting');setBackgroundCategory('indoor');searchPresets('');setStage('edit');}
 const viewing=viewer!==null||sourceViewer;
 function closeViewer(){setViewer(null);setSourceViewer(false);if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>editRef.current?.focus({preventScroll:true}));}
 function selectLibrary(item:PhotoAsset){if(libraryAssets.some(value=>value.id===item.id)){setLibraryAssets(items=>items.filter(value=>value.id!==item.id));return;}const next=[...libraryAssets.filter(value=>value.category!==item.category),item];if(next.length>4){setError('내 보관함 사진은 최대 4개까지 선택해 주세요.');setLibraryOpen(false);return;}setSelectedPresets(items=>items.filter(value=>value.kind!==item.category));setLibraryAssets(next);}
 const composer=<div className={s.composer}>
  {library&&<div className={s.libraryEntry}><button type="button" disabled={busy} onClick={()=>setLibraryOpen(true)}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 7V4h7l2 3h9v13H3Z"/><path d="m8 16 3-3 2 2 2-2 3 4"/></svg>내 보관함<span>{libraryAssets.length?`${libraryAssets.length}개 선택`:'사진 추가 · 선택'}</span></button>{libraryAssets.length>0&&<div className={s.librarySelected}>{libraryAssets.map(item=><button key={item.id} type="button" onClick={()=>setLibraryAssets(items=>items.filter(value=>value.id!==item.id))} aria-label={`${item.title} 선택 해제`}><img src={item.url} alt=""/><span>{photoAssetLabel(item.category)} · {item.title}</span><span aria-hidden="true">×</span></button>)}</div>}</div>}
  <strong>비율</strong><AiPhotoRatioPresets value={aspectRatio} onChange={setAspectRatio} disabled={busy}/>
  <TextAreaField label="커스텀 프롬프트" rows={3} showCount maxLength={AI_PHOTO_PROMPT_MAX} value={customPrompt} onChange={event=>setCustom(event.target.value)} placeholder="선택한 프리셋에 더하고 싶은 내용을 적어 주세요." disabled={busy}/>
 </div>;

 return <><Dialog open={open} onClose={()=>{if(viewing){closeViewer();return;}if(!busy)onClose();}} title="AI 사진 편집" persistent fullscreenOnMobile className={s.editor}>
  {!sources.length?<div className={s.body}><PromptLayout variant="dialog" icon="/brand/featured-creators-v1.png" title="바꿀 사진을 먼저 올려 주세요" description="게시물에 사진을 올리면 AI로 옷·포즈·배경을 바꿀 수 있어요." actions={<><Action type="button" className={promptPrimary} onClick={onClose}>사진 올리러 가기</Action>{library&&<Action type="button" variant="secondary" onClick={()=>setLibraryOpen(true)}>내 보관함</Action>}</>}/></div>:!genderChosen?<div className={s.genderEntry}><h3>남성인가요, 여성인가요?</h3><div className={s.genderEntryChoices}>{(['male','female'] as const).map(value=><button key={value} type="button" onClick={()=>changeGender(value)}><span aria-hidden="true">{value==='male'?'♂':'♀'}</span>{value==='male'?'남성':'여성'}</button>)}</div></div>:<>
   <div ref={bodyRef} className={s.body} inert={viewing}>
   {stage==='edit'&&<div className={s.sourceSection}>
     <div className={s.sourceHeading}><span>{source?.aiGenerated?'편집할 이미지':'원본 사진'}</span>{sources.length>1&&<button type="button" aria-expanded={sourcePicker} onClick={()=>setSourcePicker(!sourcePicker)}>사진 선택</button>}</div>
     {sourcePicker&&<div className={s.sources} role="radiogroup" aria-label="편집할 이미지 고르기">{sources.map((item,index)=><button key={item.id} type="button" role="radio" aria-checked={item.id===sourceId} aria-label={`${index+1}번 사진`} className={s.source} onClick={()=>changeSource(item.id)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded draft thumbnail */}
      <img src={item.preview||item.url} alt=""/>{item.aiGenerated&&<span className={s.ai}>AI</span>}</button>)}</div>}
     {(kind==='outfit'||hasOutfit)&&<button type="button" role="switch" aria-checked={detailedOutfit} className={s.outfitSwitch} disabled={busy} onClick={()=>{setDetailedOutfit(!detailedOutfit);setError('');}}>옷 세부 지정<span aria-hidden="true"/></button>}
     {source&&((kind==='outfit'||hasOutfit)&&detailedOutfit?<><AiPhotoMask src={source.url} alt={source.aiGenerated?'편집할 이미지':'원본 사진'} strokes={strokes} onChange={next=>{setStrokes(next);setError('');}} disabled={busy}/></>:<div className={s.previewFrame}>
      {/* eslint-disable-next-line @next/next/no-img-element -- creator's own uploaded photo */}
      <img className={s.preview} src={source.url} alt={source.aiGenerated?'편집할 이미지':'원본 사진'}/><button ref={editRef} type="button" className={s.zoom} aria-label="원본 사진 크게 보기" onClick={()=>setSourceViewer(true)}><ZoomIcon/></button>
     </div>)}
   </div>}
    {stage==='edit'?<div className={s.controls}>
     <div className={s.modePicker}><div role="group" aria-label="편집 모드"><button type="button" className={s.cosplayMode} aria-pressed={cosplayOpen} disabled={busy} onClick={()=>{changeKind('outfit');setCosplayOpen(true);searchPresets('');}}>{cosplayOpen&&<span className={s.modeHearts} aria-hidden="true">{Array.from({length:12},(_,index)=><svg key={index} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-9-5.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12Z"/></svg>)}</span>}<span className={s.modeLabel}>코스어 모드</span></button><button type="button" aria-pressed={!cosplayOpen} disabled={busy} onClick={()=>{setCosplayOpen(false);searchPresets('');}}>일반 모드</button></div></div>
     <div className={s.genderPicker}><span>생성 인물</span><div role="group" aria-label="생성 인물 성별">{(['female','male'] as const).map(value=><button key={value} type="button" aria-pressed={targetGender===value} disabled={busy} onClick={()=>changeGender(value)}>{value==='female'?'여성':'남성'}</button>)}</div></div>
     <div className={s.tabs} role="tablist" aria-label="편집 카테고리">{aiPhotoKinds.map((item,index)=><button key={item.value} id={`${panelId}-${item.value}`} type="button" role="tab" aria-controls={panelId} tabIndex={kind===item.value?0:-1} aria-selected={kind===item.value} onClick={()=>changeKind(item.value)} onKeyDown={event=>{
      const next=event.key==='ArrowRight'?(index+1)%aiPhotoKinds.length:event.key==='ArrowLeft'?(index+aiPhotoKinds.length-1)%aiPhotoKinds.length:event.key==='Home'?0:event.key==='End'?aiPhotoKinds.length-1:null;
      if(next===null)return;event.preventDefault();changeKind(aiPhotoKinds[next].value);event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
     }} disabled={busy}><AiPhotoCategoryIcon kind={item.value}/><span>{item.label}</span>{kind===item.value&&<svg className={s.tabCheck} aria-hidden="true" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="m2 6 3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}</button>)}</div>
     {kind==='background'&&<div className={s.posePosture} role="group" aria-label="배경 카테고리">{(['indoor','outdoor'] as const).map(value=><button key={value} type="button" aria-pressed={backgroundCategory===value} disabled={busy} onClick={()=>{setBackgroundCategory(value);searchPresets('');}}>{value==='indoor'?'실내':'아웃도어'}</button>)}</div>}
     {kind==='pose'&&<div className={s.posePosture} role="group" aria-label="포즈 자세">{(['sitting','standing'] as const).map(value=><button key={value} type="button" aria-pressed={posePosture===value} disabled={busy} onClick={()=>{setPosePosture(value);searchPresets('');}}>{value==='sitting'?'앉기':'서기'}</button>)}</div>}
     {kind!=='body'&&<div className={s.presetSearch}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input type="search" aria-label="프리셋 검색" placeholder={cosplay?'의상 이름·작품 검색':`${aiPhotoKinds.find(item=>item.value===kind)!.label} 프리셋 검색`} value={presetQuery} onChange={event=>searchPresets(event.target.value)} disabled={busy}/>{presetQuery&&<button type="button" aria-label="검색어 지우기" disabled={busy} onClick={()=>searchPresets('')}>×</button>}</div>}
     {kind==='outfit'&&cosplayOpen?<div id={panelId} role="tabpanel" aria-labelledby={`${panelId}-${kind}`} className={s.wardrobe}>
      <div className={s.wardrobeHeading}><h3>어떤 의상을 입어볼까요?</h3></div>
      <div className={s.costumeCategoryBar}><SelectField className={s.costumeCategoryPicker} label="의상 카테고리" hideLabel value={costumeCategory} onChange={value=>{setCostumeCategory(value as AiPhotoCostumeCategory);searchPresets('');}} options={aiPhotoCostumeCategories.map(category=>({value:category.value,label:category.label,image:category.image}))} disabled={busy}/><span>{presetQuery.trim()?'전체 의상 검색':costumeCategoryInfo.group} · {costumes.length}종</span></div>
      <AiPhotoWardrobe key={`${costumeCategory}-${presetQuery}`} items={costumes} selectedPrompts={selectedPresets.filter(item=>item.kind==='outfit').map(item=>item.prompt)} disabled={busy} onPick={pickPreset}/>
      <p className={s.costumeNote}>선택한 코디 사진을 가발·소품·신발의 참조 이미지로 함께 보내요. 원본 구도에 보이는 범위에 적용하며 결과는 달라질 수 있어요.</p>
     </div>:<div id={panelId} role="tabpanel" aria-labelledby={`${panelId}-${kind}`} className={s.presets}>
      {kind==='body'?<AiBodyAdjustments controls={targetGender==='male'?aiPhotoMaleBodyControls:aiPhotoBodyControls} selection={bodySelection} onChange={changeBody} disabled={busy}/>:<>
      <div className={s.presetHeading}><span>{presetQuery.trim()?`검색 결과 ${preset.total}개`:'프리셋'}</span><div className={s.presetNavigation}><button type="button" aria-label="이전 프리셋 페이지" disabled={busy||preset.pages<=1} onClick={()=>stepPreset(-1)}>‹</button><span aria-live="polite">{preset.index+1} / {preset.pages}</span><button type="button" aria-label="다음 프리셋 페이지" disabled={busy||preset.pages<=1} onClick={()=>stepPreset(1)}>›</button></div></div>
      <AiPresetPager key={`${kind}-${presetQuery}`} onStep={stepPreset} disabled={busy||preset.pages<=1}><div className={s.photoPresetGrid}>{preset.examples.map(example=><button type="button" key={example} className={s.preset} aria-label={aiPhotoPresetTitle(kind,example,targetGender)} aria-pressed={isPresetSelected(example)} onClick={()=>pickPreset(example)} disabled={busy}>
       {/* eslint-disable-next-line @next/next/no-img-element -- static preset illustration or example photograph */}
       <img className={['expression','pose','camera','lens'].includes(kind)?s.presetIllustration:undefined} src={aiPhotoPresetImage(kind,example,targetGender)} alt="" loading="lazy"/><span>{aiPhotoPresetTitle(kind,example,targetGender)}</span><span className={s.presetCheck} aria-hidden="true">{isPresetSelected(example)?'✓':''}</span></button>)}</div></AiPresetPager>
      {preset.total===0&&<p className={s.presetEmpty} role="status">검색 결과가 없어요. 다른 검색어를 입력해 주세요.</p>}
      {!['expression','pose','camera','lens'].includes(kind)&&<p className={s.hint}>사진은 AI로 만든 예시예요. 선택한 요청을 내 사진에 적용해요.</p>}
     </>}
     </div>}
    {composer}
     <p className={s.hint}>만들기를 누르면 본인 또는 사용 허락을 받은 사진임을 확인합니다.</p>
     <details className={s.notice}><summary>AI 생성 표시 및 이용 안내</summary><p>나체·성적인 합성, 미성년자, 다른 사람 얼굴 합성은 만들 수 없어요. 만든 사진에는 ‘AI 생성’ 표시가 붙어요.</p></details>
    </div>:<div className={s.results}>
     <div className={busy?s.waitingHeading:s.resultHeading}><h3 ref={resultTitleRef} tabIndex={-1}>{!busy&&<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="m12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/></svg>}{busy?'사진을 만들고 있어요':'사진이 완성됐어요'}</h3>{!busy&&<button ref={editRef} type="button" className={s.editSettings} onClick={()=>{setStage('edit');setError('');}}>설정 수정</button>}</div>
     {busy?<AiPhotoWaiting elapsed={elapsed} typical={typical} score={heartScore} game={heartGame?{kinds:heartGame.kinds,onHit:recordHeart}:undefined} onCollect={collectHeart}/>:
      <><div className={s.grid}>{results.map((item,index)=><div key={item.id} className={s.resultItem}><div className={s.resultFrame}><button type="button" className={s.result} aria-pressed={selected.includes(item.id)} aria-label={`결과 ${index+1}`} onClick={()=>toggle(item.id)}>
       {/* eslint-disable-next-line @next/next/no-img-element -- generated draft image */}
       <img src={item.url} alt=""/><span className={s.ai}>{/* eslint-disable-next-line @next/next/no-img-element -- existing decorative brand icon */}<img src="/brand/featured-creators-v1.png" alt="" aria-hidden="true" width={14} height={14} style={{width:14,height:14,flexShrink:0}}/>AI 생성</span><span className={s.selection} aria-hidden="true">{selected.includes(item.id)?'✓':''}</span></button>
       <button type="button" className={s.zoom} aria-label={`결과 ${index+1} 크게 보기`} title="크게 보기" onClick={()=>setViewer(index)}><ZoomIcon/></button><div className={s.resultTools}>{onCrop&&<button type="button" onClick={()=>setCropItem(item)} aria-label={`결과 ${index+1} 자르기`}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v13a2 2 0 0 0 2 2h13M3 6h13a2 2 0 0 1 2 2v13"/></svg>자르기</button>}<button type="button" disabled={downloading} onClick={()=>void downloadPhoto(item)} aria-label={`결과 ${index+1} 다운로드`}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/></svg>{downloading?'저장 중…':'다운로드'}</button></div></div></div>)}</div><div className={s.heartResult}><strong aria-label={`누적 하트 ${onHeartGame?heartBalance:resultHearts}개 / 100개`}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-9-5.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12Z"/></svg><span>{onHeartGame?heartBalance:resultHearts}/100</span></strong><p>100개가 모이면 10번의 기회가 생겨요</p>{rewardNote&&<p role="status">{rewardNote}</p>}</div></>}
    </div>}
    {stage==='results'&&!busy&&<div className={s.resultActions}><Action type="button" variant="secondary" disabled={!originalSource} onClick={()=>{if(originalSource)editResult(originalSource);}}>원본으로</Action><Action type="button" variant="secondary" onClick={()=>{const item=results.find(result=>selected.includes(result.id));if(item)editResult(item);}} disabled={selected.length!==1}>계속 보정</Action><Action type="button" onClick={add} disabled={!selected.length}>사진 결정</Action></div>}
    {(!busy&&(stage==='edit'||remaining<=0))&&<div className={s.quota}><span>남은 생성 횟수 <b>{remaining}</b>회</span>{onUseTicket&&tickets>0&&<span className={s.ticket}>리셋권 {tickets}장{quota.resetTickets?.nextExpiresAt&&<small> · {new Date(quota.resetTickets.nextExpiresAt).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric'})} 만료</small>}<button type="button" onClick={()=>void useTicket()} disabled={ticketBusy||busy||(remaining-(quota.paidRemaining||0)-(quota.rewardRemaining||0))>=quota.limit} title={(remaining-(quota.paidRemaining||0)-(quota.rewardRemaining||0))>=quota.limit?'오늘 아직 사용한 횟수가 없어요':undefined}>{ticketBusy?'사용 중…':'1장 써서 횟수 채우기'}</button></span>}</div>}
    {ticketNote&&<p className={s.ticketNote} role="status">{ticketNote}</p>}
   </div>
   {stage==='edit'&&<div className={s.footer} inert={viewing}>
    <Action type="button" className={s.createWithQuota} aria-label={`${AI_PHOTO_IMAGES_PER_REQUEST}장 만들기`} aria-describedby={`${panelId}-remaining`} onClick={()=>void generate()} disabled={busy}><span className={s.createLabel}>{`${AI_PHOTO_IMAGES_PER_REQUEST}장 만들기`}</span><span id={`${panelId}-remaining`} className={s.createQuota}>남은 {remaining}회</span></Action>
   </div>}
  </>}
  {viewer!==null&&results[viewer]&&<AiResultViewer items={results} index={viewer} selected={selected} onIndex={setViewer} onDownload={downloadPhoto} downloading={downloading} onToggle={toggle} onClose={closeViewer}/>}
  {sourceViewer&&source&&<AiResultViewer items={[source]} index={0} selected={[]} onIndex={()=>{}} onClose={closeViewer} original/>}
 </Dialog>
 {library&&<AiPhotoLibrary open={open&&libraryOpen} model={library} selected={libraryAssets} onSelect={selectLibrary} onChanged={id=>setLibraryAssets(items=>items.filter(item=>item.id!==id))} onClose={()=>setLibraryOpen(false)}/>}
 {open&&cropItem&&onCrop&&<AiPhotoCrop key={cropItem.id} item={cropItem} onClose={()=>setCropItem(null)} onApply={async crop=>{const r=await onCrop({sourceId:cropItem.id,...crop});if(!r.success)throw new Error(r.errorMessage||'사진을 저장하지 못했어요.');const next={...r.data,aiGenerated:true};sourceOrigins.current.set(next.id,sourceOrigins.current.get(cropItem.id)||sourceId);setResults(items=>items.map(item=>item.id===cropItem.id?next:item));setSelected(ids=>ids.map(id=>id===cropItem.id?next.id:id));setCropItem(null);}}/>}
 <Dialog open={open&&shopOpen} onClose={()=>setShopOpen(false)} title="횟수권 구매" fullscreenOnMobile>{shop&&<ShopPage model={shop} basePath={shopBasePath}/>}</Dialog>
 <Dialog open={open&&!!error} onClose={()=>setError('')} title="AI 사진 편집 안내" persistent>
  <div className={s.errorMessage}><p role="alert">{error}</p><Action type="button" onClick={()=>setError('')}>확인</Action></div>
 </Dialog></>;
}

/** Full-screen look at one result: swipe or arrows to move, pick it from here, Esc or 닫기 returns to the editor (the editor stays open). */
function AiResultViewer({items,index,selected,onIndex,onToggle,onClose,onDownload,downloading=false,original=false}:{onDownload?:(item:StudioMedia)=>Promise<void>;downloading?:boolean;items:StudioMedia[];index:number;selected:string[];onIndex:(index:number)=>void;onToggle?:(id:string)=>void;onClose:()=>void;original?:boolean}){
 const closeRef=useRef<HTMLButtonElement>(null),start=useRef<number|null>(null),pointers=useRef(new Set<number>()),item=items[index],picked=selected.includes(item.id);
 useEffect(()=>{closeRef.current?.focus({preventScroll:true});},[]);
 const go=(next:number)=>{if(next>=0&&next<items.length)onIndex(next);};
 return <div className={s.viewer} role="group" aria-label={original?'원본 사진 크게 보기':`결과 ${index+1} 크게 보기`} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}else if(event.key==='ArrowLeft')go(index-1);else if(event.key==='ArrowRight')go(index+1);}}
  onPointerDown={event=>{pointers.current.add(event.pointerId);start.current=pointers.current.size===1&&(typeof window==='undefined'||(window.visualViewport?.scale||1)<=1)?event.clientX:null;}} onPointerCancel={event=>{pointers.current.delete(event.pointerId);start.current=null;}} onPointerUp={event=>{pointers.current.delete(event.pointerId);const from=start.current;start.current=null;if(from===null||pointers.current.size)return;const dx=event.clientX-from;if(Math.abs(dx)>50)go(index+(dx<0?1:-1));}}>
  <div className={s.viewerBar}><span>{original?'원본 사진':`결과 ${index+1} / ${items.length}`}</span><div className={s.viewerTools}>{onDownload&&<button type="button" className={s.viewerClose} disabled={downloading} onClick={()=>void onDownload(item)}>{downloading?'저장 중…':'다운로드'}</button>}<button ref={closeRef} type="button" className={s.viewerClose} onClick={onClose}>닫기</button></div></div>
  <div className={s.viewerStage}>
   {index>0&&<button type="button" className={`${s.viewerNav} ${s.viewerPrev}`} aria-label="이전 결과" onClick={()=>go(index-1)}>‹</button>}
   {/* eslint-disable-next-line @next/next/no-img-element -- generated draft image at full size */}
   <span className={s.viewerFrame}><img src={item.url} alt={original?'원본 사진':`결과 ${index+1} (AI 생성 사진)`} draggable={false}/>{(!original||item.aiGenerated)&&<span className={s.ai}>{/* eslint-disable-next-line @next/next/no-img-element -- existing decorative brand icon */}<img src="/brand/featured-creators-v1.png" alt="" aria-hidden="true" width={14} height={14} style={{width:14,height:14,flexShrink:0}}/>AI 생성</span>}</span>
   {index<items.length-1&&<button type="button" className={`${s.viewerNav} ${s.viewerNext}`} aria-label="다음 결과" onClick={()=>go(index+1)}>›</button>}
  </div>
  {onToggle&&<div className={s.viewerActions}><Action type="button" variant={picked?'secondary':'primary'} aria-pressed={picked} onClick={()=>onToggle(item.id)}>{picked?'선택됨 ✓':'이 사진 선택'}</Action></div>}
 </div>;
}
