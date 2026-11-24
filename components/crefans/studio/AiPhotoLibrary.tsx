"use client";
import {useEffect,useRef,useState} from 'react';
import {Dialog,Field} from '@/components/ui/Primitives';
import {SelectField} from '@/components/ui/SelectField';
import {MediaUpload} from '@/components/ui/MediaUpload';
import {MediaTypeIcon} from '@/components/ui/MediaTypeIcon';
import {LoadingProgressDialog} from '@/components/ui/LoadingProgressDialog';
import {AiPhotoVideoFrame} from './AiPhotoVideoFrame';
import {Action} from '../ServiceUI';
import type {LibraryAsset,PhotoAsset,PhotoAssetCategory,PhotoLibraryModel} from '@/types/crefans-photo-library';
import type {StudioMedia} from '@/types/crefans-studio-management';
import {photoAssetCategories,photoAssetLabel,photoAssetSaveOptions} from '@/lib/crefans/photo-library';
import {imageUploadAccept,imageUploadMaxBytes,videoUploadAccept,videoUploadMaxBytes} from '@/lib/design/image-upload';
import Icon from '../Icon';
import s from './photo-library.module.css';

type Section={category:PhotoAssetCategory;items:PhotoAsset[];total:number|null;hasMore:boolean};
type LibraryPreview=Pick<LibraryAsset,'type'|'title'|'url'|'thumbnailUrl'>;
type DraftMedia={file:File;type:'video'}|{file:File;type:'image';sourceVideo?:File};
const uploadOptions=[
 {mode:'photo',label:'사진 업로드',icon:'image'},
 {mode:'video',label:'동영상 업로드',icon:'video'},
 {mode:'extract',label:'동영상에서 사진 추출',icon:'scissors'},
] as const;
type UploadMode=typeof uploadOptions[number]['mode'];
// Older API builds return no total; then the count shows what is loaded, with + when more pages exist.
const countText=(total:number|null,loaded:number,more:boolean)=>total??`${loaded}${more?'+':''}`;
function LibraryVideoThumbnail({src}:{src?:string}){
 const [failed,setFailed]=useState(false);
 const hasImage=!!src&&!failed;
 return <span className={s.libraryVideoThumb}>
  {/* eslint-disable-next-line @next/next/no-img-element -- authenticated video thumbnail */}
  {hasImage?<img src={src} alt="" loading="lazy" onError={()=>setFailed(true)}/>:<MediaTypeIcon type="video" size={20}/>}
 </span>;
}
type AttachmentPicker={selected:LibraryAsset[];excluded:ReadonlySet<string>;limit:number;onToggle:(item:LibraryAsset)=>void;onUpdate:(id:string,item?:LibraryAsset)=>void;onConfirm:()=>void};
type Props={open:boolean;model:PhotoLibraryModel;onClose:()=>void}&(
 {manage?:never;attachment?:never;selected:PhotoAsset[];onSelect:(item:PhotoAsset)=>void;onEditSource?:(item:PhotoAsset)=>void;onChanged:(id:string)=>void}
 |{manage?:never;attachment:AttachmentPicker;selected?:never;onSelect?:never;onEditSource?:never;onChanged?:never}
 |{manage:true;attachment?:never;selected?:never;onSelect?:never;onEditSource?:never;onChanged?:never}
);
export function AiPhotoLibrary({open,model,selected,onSelect,onEditSource,onChanged,onClose,attachment,manage}:Props){
 const picked=attachment?.selected??selected??[];
 const isPicked=(item:LibraryAsset)=>picked.some(value=>value.id===item.id);
 const blocked=(item:LibraryAsset)=>!!attachment&&(!!item.processing||!!item.failed||attachment.excluded.has(item.id)||(!isPicked(item)&&picked.length>=attachment.limit));
 function toggle(item:LibraryAsset){
  if(attachment){if(!blocked(item))attachment.onToggle(item);}
  else if(item.category!=='video')onSelect?.(item);
 }
 const latest=useRef(model);latest.current=model;
 const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[page,setPage]=useState(0),[revision,setRevision]=useState(0),[items,setItems]=useState<LibraryAsset[]>([]),[hasMore,setHasMore]=useState(false),[loading,setLoading]=useState(false),[spinner,setSpinner]=useState(false),[error,setError]=useState('');
 const [sections,setSections]=useState<Section[]>([]),[total,setTotal]=useState<number|null>(null),[searchOpen,setSearchOpen]=useState(false);
 const [photoCount,setPhotoCount]=useState<number|string|null>(null),[videoCount,setVideoCount]=useState<number|string|null>(null);
 const listMode=!!category||!!query.trim();
 const videoList=category==='video';
 const [editing,setEditing]=useState<LibraryAsset|'new'|null>(null),[draftMedia,setDraftMedia]=useState<DraftMedia|null>(null),[savedMedia,setSavedMedia]=useState<StudioMedia|null>(null),[title,setTitle]=useState(''),[assetCategory,setAssetCategory]=useState<PhotoAssetCategory>('pose'),[objectPreview,setObjectPreview]=useState<{file:File;url:string}|null>(null),[uploadError,setUploadError]=useState(''),[operation,setOperation]=useState<'save'|'remove'|null>(null);
 const saving=operation!==null;
 const [mode,setMode]=useState<UploadMode|null>(null);
 const [savedVideoId,setSavedVideoId]=useState<string|null>(null);
 const [viewing,setViewing]=useState<LibraryPreview|null>(null),[previewFailed,setPreviewFailed]=useState(false);
 const previewVideo=useRef<HTMLVideoElement>(null);
 function showPreview(item:LibraryPreview){setPreviewFailed(false);setViewing(item);}
 function closePreview(){previewVideo.current?.pause();setViewing(null);}
 useEffect(()=>{
  if(!open)return;
  let live=true;
  const counts=[['',setPhotoCount],['video',setVideoCount]] as const;
  for(const [category,setCount] of counts){
   void latest.current.list({q:'',category,page:0}).then(result=>{
    if(live&&result.success){const {total,items,hasMore}=result.data;setCount(countText(total??null,items.length,hasMore));}
   }).catch(()=>{}); // The list handles fetch errors; keep the last known count.
  }
  return()=>{live=false;};
 },[open,revision]);
 // 2026-11-15 user choice B: without a search or category the library shows one row per category (first page each); a category or search shows the paged grid.
 useEffect(()=>{if(!open)return;let live=true;setLoading(true);const slow=setTimeout(()=>{if(live)setSpinner(true);},1000);const fail=(message?:string|null)=>{if(live)setError(message||'사진을 불러오지 못했어요. 다시 시도해 주세요.');};
  const timer=setTimeout(()=>{const run=listMode?latest.current.list({q:query.trim(),category,page}).then(r=>{if(!live)return;if(r.success){setItems(r.data.items);setHasMore(r.data.hasMore);setTotal(r.data.total??null);}else fail(r.errorMessage);})
   :Promise.all(photoAssetCategories.map(item=>latest.current.list({q:'',category:item.value,page:0}))).then(results=>{if(!live)return;const next:Section[]=[];for(let index=0;index<results.length;index++){const r=results[index];if(!r.success){fail(r.errorMessage);return;}const photos=r.data.items.filter(item=>item.category!=='video');if(photos.length)next.push({category:photoAssetCategories[index].value,items:photos,total:r.data.total??null,hasMore:r.data.hasMore});}setSections(next);});
   void run.catch(()=>fail()).finally(()=>{if(live){setLoading(false);setSpinner(false);}clearTimeout(slow);});},query?250:0);
  return()=>{live=false;clearTimeout(timer);clearTimeout(slow);};},[open,query,category,page,revision,listMode]);
 useEffect(()=>{
  if(!open||category!=='video'||loading||!items.some(item=>item.processing))return;
  const timer=setTimeout(()=>setRevision(value=>value+1),5000);
  return()=>clearTimeout(timer);
 },[open,category,loading,items]);
 const videoOnly=mode==='video'||(editing!==null&&editing!=='new'&&editing.category==='video');
 const file=draftMedia&&(draftMedia.type==='image'||videoOnly)?draftMedia.file:null;
 const sourceVideo=draftMedia?.type==='image'?draftMedia.sourceVideo:undefined;
 const preview=objectPreview&&objectPreview.file===draftMedia?.file?objectPreview.url:'';
 useEffect(()=>{if(!draftMedia){setObjectPreview(null);return;}const url=URL.createObjectURL(draftMedia.file);setObjectPreview({file:draftMedia.file,url});return()=>URL.revokeObjectURL(url);},[draftMedia]);
 function chooseFiles(files:File[]){
  setUploadError('');
  if(files.length!==1){setUploadError('파일은 한 번에 하나만 선택해 주세요.');return;}
  const next=files[0],video=['video/mp4','video/webm','video/quicktime'].includes(next.type)||(!next.type&&/\.(mp4|webm|mov)$/i.test(next.name));
  if(mode==='photo'?!imageUploadAccept.split(',').includes(next.type):!video){setUploadError(mode==='photo'?'JPG·PNG·WebP 사진을 선택해 주세요.':'MP4·WebM·MOV 동영상을 선택해 주세요.');return;}
  if(next.size>(video?videoUploadMaxBytes:imageUploadMaxBytes)){setUploadError(video?'동영상은 300MB까지만 고를 수 있어요.':'사진은 50MB까지만 올릴 수 있어요.');return;}
  setDraftMedia({file:next,type:video?'video':'image'});
  setSavedVideoId(null);
  if(mode!=='extract'&&!title)setTitle(next.name.replace(/\.[^.]+$/,'').slice(0,60));
 }
 function edit(item:LibraryAsset|'new',preset?:PhotoAssetCategory){setMode(null);setDraftMedia(null);setSavedVideoId(null);setUploadError('');setSavedMedia(item==='new'?null:item);setTitle(item==='new'?'':item.title);setAssetCategory(item!=='new'&&item.category!=='video'?item.category:preset||(photoAssetSaveOptions().some(option=>option.value===category)?category as PhotoAssetCategory:'pose'));setEditing(item);}
 async function save(){
  if(saving)return;
  if(!title.trim()||(!file&&!savedMedia))return;
  setOperation('save');
  try{
   let media=savedMedia,videoId=savedVideoId;
   if(sourceVideo&&!videoId){
    const uploaded=await model.upload(sourceVideo);
    if(!uploaded.success)throw new Error(uploaded.errorMessage||'원본 동영상을 올리지 못했어요.');
    videoId=uploaded.data.id;setSavedVideoId(videoId);
   }
   if(!media&&file){const uploaded=await model.upload(file);if(!uploaded.success)throw new Error(uploaded.errorMessage||'업로드하지 못했어요.');media=uploaded.data;setSavedMedia(media);}
   if(!media)return;
   const r=await model.save({id:media.id,title:title.trim(),category:videoOnly?'video':assetCategory,...(videoId?{sourceVideoId:videoId}:{})});
   if(!r.success)throw new Error(r.errorMessage||'저장하지 못했어요.');
   if(editing==='new'){setCategory(videoOnly?'video':category==='video'?'':category);setQuery('');}
   attachment?.onUpdate(media.id,r.data);onChanged?.(media.id);setEditing(null);setDraftMedia(null);setPage(0);setRevision(v=>v+1);
  }catch(e){setError(e instanceof Error?e.message:'파일을 저장하지 못했어요.');}finally{setOperation(null);}
 }
 async function remove(){if(!savedMedia||saving)return;setOperation('remove');try{const r=await model.remove(savedMedia.id);if(!r.success)throw new Error(r.errorMessage||'삭제하지 못했어요.');attachment?.onUpdate(savedMedia.id);onChanged?.(savedMedia.id);setEditing(null);setPage(0);setRevision(v=>v+1);}catch(e){setError(e instanceof Error?e.message:'삭제하지 못했어요.');}finally{setOperation(null);}}
 const manageButton=(item:LibraryAsset)=><button type="button" className={s.tileManage} aria-label={`${item.title} 관리`} onClick={()=>edit(item)}>관리</button>;
 const tile=(item:PhotoAsset)=>{const on=isPicked(item);return <li key={item.id} className={s.tile}><button type="button" className={s.pick} aria-label={`${item.title} ${manage?'정보 보기':'선택'}`} aria-pressed={manage?undefined:on} disabled={loading||blocked(item)} onClick={()=>manage?edit(item):toggle(item)}>
  {/* eslint-disable-next-line @next/next/no-img-element -- authenticated private media */}<img src={item.url} alt=""/><span className={s.assetCaption}>{item.title}</span>{!manage&&<span className={s.check} aria-hidden="true">{on?'✓':''}</span>}</button>{(attachment||manage)&&manageButton(item)}{onEditSource&&<button type="button" className={s.useSource} aria-label={`${item.title} 사진 편집하기`} disabled={loading} onClick={()=>onEditSource(item)}>편집하기</button>}{!attachment&&!manage&&<button type="button" className={s.edit} aria-label={`${item.title} 정보 수정`} onClick={()=>edit(item)}>•••</button>}</li>;};
 function switchMedia(next:''|'video'){
  if((next==='video')===videoList)return;
  setCategory(next);setQuery('');setSearchOpen(false);setPage(0);
  setItems([]);setHasMore(false);setTotal(null);setLoading(true);
 }
 const choosingMode=editing==='new'&&!mode;
 const closeEditor=()=>{if(!saving){setEditing(null);setDraftMedia(null);}};
 return <><Dialog open={open} title="내 보관함" onClose={()=>{if(!saving)onClose();}} fullscreenOnMobile persistent className={attachment?s.attachmentDialog:undefined}><div className={`${s.body} ${s.libraryBody}`}>
  <div className={s.browse}>
  <div className={s.toolbar}>
   <div className={s.mediaTabs} role="group" aria-label="보관함 종류">
    <button type="button" aria-pressed={!videoList} onClick={()=>switchMedia('')}>사진{photoCount!==null&&<span> {photoCount}</span>}</button>
    <button type="button" aria-pressed={videoList} onClick={()=>switchMedia('video')}>동영상{videoCount!==null&&<span> {videoCount}</span>}</button>
   </div>
   <button type="button" className={s.iconButton} aria-label={videoList?'동영상 검색':'사진 검색'} aria-expanded={searchOpen||!!query} onClick={()=>setSearchOpen(value=>!value)}><Icon name="search" width={18} height={18}/></button><button type="button" className={s.uploadButton} onClick={()=>edit('new')}>업로드</button></div>
  {listMode&&!videoList&&<div className={s.listHead}>{category&&<button type="button" className={s.back} aria-label="분류별 보기로 돌아가기" onClick={()=>{setCategory('');setPage(0);}}><Icon name="chevron" width={18} height={18}/></button>}<h3>{category?photoAssetLabel(category as PhotoAssetCategory):'검색 결과'} <span>{countText(total,page*24+items.length,hasMore)}</span></h3></div>}
  {(searchOpen||!!query)&&<Field label={videoList?'동영상 검색':'사진 검색'} type="search" placeholder={videoList?'동영상 이름 검색':'사진 이름 검색'} value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/>}
  <div className={s.content} aria-busy={loading}>{spinner&&<p role="status">{videoList?'동영상을':'사진을'} 불러오고 있어요…</p>}
  {!listMode&&<>{sections.map(section=>{const label=photoAssetLabel(section.category);return <section key={section.category} className={s.section} aria-label={`${label} 사진`}><div className={s.sectionHead}><h3>{label} <span>{countText(section.total,section.items.length,section.hasMore)}</span></h3><button type="button" className={s.all} onClick={()=>{setCategory(section.category);setPage(0);}}>전체보기<Icon name="chevron" width={14} height={14}/></button></div>
    <ul className={s.row}>{section.items.map(tile)}{!attachment&&<li className={s.tile}><button type="button" className={s.addTile} aria-label={`${label} 사진 추가`} onClick={()=>edit('new',section.category)}>＋<span>추가</span></button></li>}</ul></section>;})}
   {!loading&&!sections.length&&<div className={s.empty}><p>아직 보관한 사진이 없어요.</p>{!attachment&&<Action type="button" onClick={()=>edit('new')}>사진 추가</Action>}</div>}</>}
  {listMode&&<>{!loading&&!items.length&&<div className={s.empty}><p>{query?(videoList?'조건에 맞는 동영상이 없어요.':'조건에 맞는 사진이 없어요.'):(videoList?'아직 보관한 동영상이 없어요.':'아직 보관한 사진이 없어요.')}</p></div>}
   <ul className={s.grid}>{items.map(item=>{
    if(item.category!=='video')return !videoList&&tile(item);
    if(!videoList)return null;
    const on=isPicked(item),status=item.processing?' · 준비 중':item.failed?' · 변환 실패':'';
    return <li key={item.id} className={`${s.tile} ${s.videoTile}`}><button type="button" className={s.pick} disabled={attachment?loading||blocked(item):undefined} aria-pressed={attachment?on:undefined} aria-label={item.title+status} onClick={()=>attachment?toggle(item):edit(item)}>
     <LibraryVideoThumbnail key={item.thumbnailUrl} src={item.thumbnailUrl}/>
     <span className={s.assetCaption}>{item.title}{status}</span>
     {attachment&&<span className={s.check} aria-hidden="true">{on?'✓':''}</span>}
    </button>{manageButton(item)}</li>;
   })}</ul>
   {(page>0||hasMore)&&<div className={s.pages}><Action type="button" variant="secondary" disabled={!page||loading} onClick={()=>setPage(v=>v-1)}>이전</Action><span>{page+1}</span><Action type="button" variant="secondary" disabled={!hasMore||loading} onClick={()=>setPage(v=>v+1)}>다음</Action></div>}</>}
  </div>
  </div>
  <div className={s.footer}>
   {attachment&&<h3 className={s.trayLabel}>가져올 파일</h3>}
   {picked.length>0&&<ul className={s.tray} aria-label={attachment?'가져올 파일':'고른 사진'}>{picked.map(item=><li key={item.id}>
    {attachment?<button type="button" className={s.trayManage} aria-label={`${item.title} 관리`} onClick={()=>edit(item)}>
     {/* eslint-disable-next-line @next/next/no-img-element -- authenticated private media */}
     {item.type==='video'?<LibraryVideoThumbnail key={item.thumbnailUrl} src={item.thumbnailUrl}/>:<img src={item.url} alt=""/>}
     <span className={s.trayAction}>관리</span>
     <span className={s.assetCaption}>{item.title}</span>
    </button>:<>
     {/* eslint-disable-next-line @next/next/no-img-element -- authenticated private media */}
     <img src={item.url} alt=""/>
     <span className={s.assetCaption}>{item.title}</span>
    </>}
    <button type="button" className={s.trayRemove} aria-label={`${item.title} 선택 해제`} onClick={()=>toggle(item)}>×</button>
   </li>)}</ul>}
   <Action type="button" onClick={attachment?attachment.onConfirm:onClose} disabled={!!attachment&&!picked.length}>{attachment?`가져오기 (${picked.length}/${attachment.limit})`:picked.length?'선택 완료':'닫기'}</Action></div>
 </div></Dialog>
 <Dialog open={open&&!!editing} title={choosingMode?'파일 추가':editing==='new'?(videoOnly?'동영상 보관하기':'사진 보관하기'):(videoOnly?'동영상 정보':'사진 정보')} onClose={closeEditor} persistent><div className={editing==='new'?`${s.body} ${s.uploadBody}`:s.body}>
  {choosingMode?<div className={s.uploadOptions}>{uploadOptions.map(option=><Action key={option.mode} type="button" variant="secondary" className={s.uploadOption} aria-label={option.label} onClick={()=>setMode(option.mode)}>
   {option.icon==='scissors'?<Icon name="scissors" width={19} height={19}/>:<MediaTypeIcon type={option.icon} size={23}/>}
   {option.label}</Action>)}</div>:<>
  {editing&&editing!=='new'&&editing.url&&(editing.processing||editing.failed?
   <p role="status" className={s.note}>{editing.processing?'동영상을 준비하고 있어요. 잠시 후 다시 열어 주세요.':'동영상을 변환하지 못했어요.'}</p>:
   <div className={s.detailMedia}>
    {editing.type==='video'?<div className={s.detailVideo}><LibraryVideoThumbnail key={editing.thumbnailUrl} src={editing.thumbnailUrl}/></div>:
     // eslint-disable-next-line @next/next/no-img-element -- authenticated private media
     <img className={s.preview} src={editing.url} alt={editing.title}/>}
    <Action type="button" variant="secondary" onClick={()=>showPreview(editing)}>{editing.type==='video'?'재생':'전체보기'}</Action>
   </div>)}
  {editing==='new'&&!savedMedia&&<>
   <button type="button" className={s.backToModes} disabled={saving} onClick={()=>{setMode(null);setDraftMedia(null);setSavedVideoId(null);setUploadError('');setTitle('');}}><Icon name="arrowLeft" width={16} height={16}/> 업로드 방식 선택</button>
   <MediaUpload label="파일 업로드" items={file&&preview?[{id:'library-draft',type:videoOnly?'video':'image',url:preview}]:[]} max={1}
    onPreview={file&&preview&&!saving?()=>showPreview({type:videoOnly?'video':'image',url:preview,title:title.trim()||file.name}):undefined}
    onFilesSelect={chooseFiles} onRemove={()=>{setDraftMedia(null);setSavedVideoId(null);setUploadError('');}} accept={mode==='photo'?imageUploadAccept:videoUploadAccept} disabled={saving} error={uploadError}
    addLabel={mode==='photo'?'사진 추가':'동영상 추가'} hint={mode==='photo'?'JPG·PNG·WebP 사진 한 장 50MB까지(자동으로 줄여서 올려요)':'MP4·WebM·MOV 300MB 이하'}/>
   {mode==='extract'&&draftMedia?.type==='video'&&preview&&<AiPhotoVideoFrame key={preview} src={preview} name={draftMedia.file.name}
    onSelect={frame=>{
     setDraftMedia(previous=>previous===draftMedia?{file:frame,type:'image',sourceVideo:draftMedia.file}:previous);
     setTitle(previous=>previous||draftMedia.file.name.replace(/\.[^.]+$/,'').slice(0,60));
    }}/>}
  </>}
  <Field label={videoOnly?'동영상 이름':'사진 이름'} value={title} maxLength={60} disabled={saving} onChange={e=>setTitle(e.target.value)}/>
  {!videoOnly&&<><SelectField label="참고할 부분" value={assetCategory} onChange={v=>setAssetCategory(v as PhotoAssetCategory)} options={photoAssetSaveOptions(editing&&editing!=='new'&&editing.category!=='video'?editing.category:undefined)} disabled={saving}/>
   <p className={s.note}>사진은 공용 프리셋에 공개되지 않아요. 선택한 부분만 합성에 참고해요.</p></>}
  <Action type="button" onClick={()=>void save()} disabled={saving||!title.trim()||(!file&&!savedMedia)}>{saving?'저장 중…':'보관함에 저장'}</Action>
  {editing!=='new'&&<button type="button" className={s.remove} disabled={saving} onClick={()=>void remove()}>보관함에서 삭제</button>}
  </>}
 </div></Dialog>
 {open&&editing&&operation==='save'&&<LoadingProgressDialog label={(sourceVideo&&!savedVideoId)||(videoOnly&&file&&!savedMedia)?'동영상 업로드 중':'보관함에 저장 중'}/>}
 <Dialog open={open&&!!viewing} title={viewing?.title??'미리보기'} onClose={closePreview} wide fullscreenOnMobile>
  {viewing&&<div className={s.assetPreview}>
   {previewFailed?<p role="alert">미리보기를 불러오지 못했어요.</p>:viewing.type==='video'?
    <video ref={previewVideo} src={viewing.url} poster={viewing.thumbnailUrl} controls autoPlay playsInline preload="metadata" aria-label={viewing.title} onError={()=>setPreviewFailed(true)}/>:
    // eslint-disable-next-line @next/next/no-img-element -- authenticated private media
    <img src={viewing.url} alt={viewing.title} onError={()=>setPreviewFailed(true)}/>}
  </div>}
 </Dialog>
 <Dialog open={open&&!!error} title="사진 보관함 안내" onClose={()=>setError('')} persistent><div className={s.body}><p role="alert">{error}</p><Action type="button" onClick={()=>{setError('');setRevision(v=>v+1);}}>확인</Action></div></Dialog></>;
}
