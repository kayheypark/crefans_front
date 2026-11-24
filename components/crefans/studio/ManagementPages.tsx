'use client';
import {fetchImageBlob} from '@/lib/browser/media-file';
import {useRouter} from 'next/navigation';
import {Toast} from '@/components/ui/Toast';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import {clearGuestTrialDraft,loadGuestTrialDraft,memberDraftOwner,saveGuestTrialDraft} from '@/lib/crefans/guest-trial-draft';
import {MarqueeText} from '@/components/ui/MarqueeText';
import {TypedConfirmDialog} from '@/components/ui/TypedConfirmDialog';
import {membershipPriceHint} from '@/lib/crefans/creator-payout-policy';

import {BackButton} from '../BackButton';
import {MediaVideo} from '@/components/ui/MediaVideo';
import {VideoProcessing} from '@/components/ui/VideoProcessing';


import {DialogActions} from '@/components/ui/DialogActions';
import {AiResultShare} from './AiResultShare';
import {useState,useEffect,useRef,useId,type FormEvent,type ReactNode} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {TextLink} from '@/components/ui/TextLink';
import {SelectField} from '@/components/ui/SelectField';
import {BenefitsField} from '@/components/ui/BenefitsField';
import {MediaUpload} from '@/components/ui/MediaUpload';
import {usePresence} from '@/components/ui/usePresence';
import {designTokens} from '@/lib/design/tokens';
import {MediaOverlay} from '../MediaOverlay';
import {MembershipPartnerNotice} from '../PartnerPayoutNotice';
import {moveItem} from '@/components/ui/media-order';
import {postCommentsAllowed} from '@/lib/crefans/comments';
import {OptionalImage} from '@/components/ui/OptionalImage';
import {Checkbox} from '@/components/ui/Choice';
import {Toggle} from '@/components/ui/Toggle';
import {imageUploadAccept,mediaUploadAccept,mediaUploadMaxItems} from '@/lib/design/image-upload';
import type {ApiResult} from '@/types/crefans';
import type {StudioManagementModel,StudioContent,StudioContentStatus,StudioMedia,StudioMembership} from '@/types/crefans-studio-management';
import {Dialog,Field,TextAreaField} from '@/components/ui/Primitives';
import {DataTable,orderTableRows,type TableColumn,type TableSort} from '@/components/ui/DataTable';
import {Pagination} from '@/components/ui/Pagination';
import {Action,ActionLink,Avatar,Empty,Notice,PageTitle} from '../ServiceUI';
import Icon from '../Icon';
import type {PostDetailModel} from '../SocialPages';
import {ContentPostPreview} from './ContentPostPreview';
import {AiPhotoDialog,toPng} from './AiPhotoDialog';
import {AiPhotoLibrary} from './AiPhotoLibrary';
import type {LibraryAsset} from '@/types/crefans-photo-library';
import {REPLAY_POST_TEXT_ATTR} from '@/lib/analytics/posthog';
import {AI_PHOTO_DAILY_LIMIT} from '@/lib/crefans/ai-photo';
import s from './management.module.css';
import ai from './ai-photo.module.css';
import cards from './content-list.module.css';

type Props={model:StudioManagementModel;basePath:string;id?:string};
type ContentPreviewProps={previewModel?:PostDetailModel;previewCreatorId?:string;/** Studio-wide comment switch from 크리에이터 설정; overrides per-post flags. */commentsGloballyEnabled?:boolean};
const statusLabels={draft:'임시저장',published:'게시됨',scheduled:'예약됨'};
const subscriberStatus={active:'구독 중',cancelled:'갱신 해지',expired:'기간 만료'};
const money=(value:number)=>`₩${value.toLocaleString('ko-KR')}`;
const date=(value:string)=>new Date(value).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const localDateInput=(value:string|null)=>{if(!value)return '';const parsed=new Date(value);return Number.isNaN(parsed.getTime())?'':new Date(parsed.getTime()-parsed.getTimezoneOffset()*60000).toISOString().slice(0,16);};
function useManagementAction(){
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useSnackbarMessage();
  async function run(operation:()=>Promise<ApiResult<{message:string;id?:string}>>,done?:(data:{message:string;id?:string})=>void){
    if(busy)return;setBusy(true);setError('');setMessage('');
    try{const response=await operation();if(response.success){setMessage(response.data.message);done?.(response.data);}else setError(response.errorMessage);}
    catch{setError('요청을 처리하지 못했습니다. 다시 시도해주세요.');}finally{setBusy(false);}
  }
  return {busy,error,message,run,clearMessage:()=>setMessage(''),clear:()=>{setError('');setMessage('');}};
}
function Status({value}:{value:StudioContentStatus}){return <span className={s.status} data-status={value}>{statusLabels[value]}</span>;}
function ContentThumbnail({item}:{item:StudioContent}){return <>{item.media[0]?.type==='image'&&item.media[0].processing?<span className={s.noMedia} role="img" aria-label="워터마크 적용 중"><Icon name="card"/></span>:item.media[0]?.type==='image'?<img src={item.media[0].url} alt=""/>:item.media[0]?.type==='video'&&item.media[0].processing?<VideoProcessing variant="thumbnail"/>:item.media[0]?.type==='video'?<MediaVideo src={item.media[0].url} firstFrame muted playsInline preload="metadata" aria-label="동영상"/>:<span className={s.noMedia}><Icon name="card"/></span>}</>;}
function ContentStatus({item,commentsGloballyEnabled}:{item:StudioContent;commentsGloballyEnabled:boolean}){return <span className={s.statusCell}><Status value={item.status}/>{item.unpublished&&<span className={s.status} data-status="unpublished">미공개</span>}{item.hiddenByOperator&&<span className={s.status}>운영 정책에 따라 숨김</span>}{!postCommentsAllowed(commentsGloballyEnabled,item.commentsEnabled)&&<span className={s.status}>댓글 닫힘</span>}</span>;}
function ContentCard({item,initiallyOpen,access,basePath,fanHref,commentsGloballyEnabled,busy,onPreview,onDelete}:{item:StudioContent;initiallyOpen:boolean;access:string;basePath:string;fanHref?:string;commentsGloballyEnabled:boolean;busy:boolean;onPreview:()=>void;onDelete:()=>void}){
  const [open,setOpen]=useState(initiallyOpen),id=useId(),scheduled=item.status==='scheduled'&&!!item.scheduledAt;
  const parts=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(scheduled?item.scheduledAt!:item.updatedAt));
  const part=(type:string)=>parts.find(value=>value.type===type)?.value;
  const timestamp=`${part('year')}.${part('month')}.${part('day')} ${part('hour')}:${part('minute')}`;
  return <article className={cards.card}>
    <h2 className={cards.heading}><button className={cards.summary} type="button" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>
      <span className={cards.thumbnail}><ContentThumbnail item={item}/></span>
      <span className={cards.label}><span className={cards.title}>{item.title}</span><ContentStatus item={item} commentsGloballyEnabled={commentsGloballyEnabled}/>{item.media.some(media=>media.type==='video'&&media.processing)&&<VideoProcessing variant="badge"/>}{!open&&<span className={cards.date}>{timestamp} {scheduled?'게시 예정':'수정'}</span>}</span>
      <Icon name="chevron" width={18} height={18} className={cards.chevron}/>
    </button></h2>
    <div id={id} hidden={!open}>
      <dl className={cards.details}><div><dt>공개 범위</dt><dd>{access}</dd></div><div><dt>{scheduled?'게시 예정':'최근 수정'}</dt><dd>{timestamp}</dd></div></dl>
      <div className={cards.actions}>
        {fanHref?<Link href={fanHref}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>팬 화면</Link>:<button type="button" onClick={onPreview}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>미리보기</button>}
        <Link className={cards.edit} href={`${basePath}/content/${item.id}/edit`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z"/></svg>수정</Link>
        <button className={cards.delete} type="button" disabled={busy} onClick={onDelete}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></svg>삭제</button>
      </div>
    </div>
  </article>;
}
const accessLabel=(item:StudioContent,memberships:StudioMembership[])=>item.accessLevel?`레벨 ${item.accessLevel} 이상`:item.accessPlanId?`${memberships.find(plan=>plan.id===item.accessPlanId)?.name||'멤버십'} 전용`:'전체 공개';
// Unpublish (2026-11-07): only the author sees an unpublished post; publishing again restores it as it was. Operator hiding is
// a separate state the creator cannot lift, so it is only explained here.
function ContentVisibility({content,access,onChange}:{content:StudioContent;access:string;onChange:(isPublic:boolean)=>Promise<ApiResult<{message:string}>>}){
  const [open,setOpen]=useState(false),task=useManagementAction(),unpublished=!!content.unpublished;
  return <section className={s.visibilityBox} aria-label="공개 상태">
    <div className={s.visibilityText}><strong>{unpublished?'미공개 · 나만 볼 수 있어요':'공개 중'}</strong><span className={s.muted}>{unpublished?'팬과 멤버십 구독자 모두에게 보이지 않아요. 다시 공개하면 그대로 돌아와요.':`팬에게 ${access} 범위로 보여요.`}</span></div>
    <Action variant="secondary" type="button" disabled={task.busy} onClick={()=>{task.clear();setOpen(true);}}>{unpublished?'다시 공개':'미공개로 전환'}</Action>
    {content.hiddenByOperator&&<Notice>운영 정책에 따라 숨겨진 게시물입니다. 숨김은 운영자만 해제할 수 있어서, 공개 상태와 관계없이 다른 회원에게 보이지 않아요.</Notice>}
    <Toast message={task.message} onClose={task.clearMessage}/>
    <Dialog open={open} onClose={()=>{if(!task.busy)setOpen(false);}} title={unpublished?'게시물을 다시 공개할까요?':'게시물을 미공개로 바꿀까요?'}><div className={s.dialogBody}><p><strong><MarqueeText text={content.title}/></strong> 게시물을 {unpublished?`미공개 전과 같은 ${access} 범위로 다시 보여 줍니다.`:'나만 볼 수 있게 바꿉니다.'}</p><Notice>{unpublished?(content.hiddenByOperator?'운영 정책에 따라 숨겨진 게시물이라 운영자가 숨김을 해제하기 전까지는 다른 회원에게 보이지 않아요.':'피드·프로필·링크와 댓글·좋아요·후원이 다시 열려요.'):'피드·프로필·검색·링크로 들어온 팬과 멤버십 구독자 모두에게 보이지 않고, 댓글·좋아요·후원도 받을 수 없어요. 게시물과 댓글·좋아요 기록은 지워지지 않으며 언제든 다시 공개할 수 있어요.'}</Notice>{task.error&&<p className={s.error} role="alert">{task.error}</p>}<DialogActions><Action variant="secondary" disabled={task.busy} onClick={()=>setOpen(false)}>취소</Action><Action variant="brand" disabled={task.busy} onClick={()=>void task.run(()=>onChange(unpublished),()=>setOpen(false))}>{task.busy?'처리 중…':unpublished?'다시 공개':'미공개로 전환'}</Action></DialogActions></div></Dialog>
  </section>;
}
// 2026-11-07 사용자 요청: 발행된 글(미공개 포함, 작성자는 볼 수 있음)은 미리보기 대신 팬 화면 게시물로 이동하고, 임시저장·예약 글만 미리보기를 연다.
export function ContentManagementPage({model,basePath,fanPath=basePath.replace(/\/studio$/,''),previewModel,previewCreatorId,commentsGloballyEnabled=true}:Props&ContentPreviewProps&{fanPath?:string}){
  const fanHref=(item:StudioContent)=>item.status==='published'?`${fanPath}/post/${encodeURIComponent(item.id)}`:undefined;
  const [filter,setFilter]=useState<StudioContentStatus|'all'>(model.selectedContentStatus||'all'),[search,setSearch]=useState(''),[previewId,setPreviewId]=useState<string|null>(null),[deleteId,setDeleteId]=useState<string|null>(null);
  const [sort,setSort]=useState<TableSort>(null),[page,setPage]=useState(1),pageSize=10;
  const task=useManagementAction();
  useEffect(()=>setFilter(model.selectedContentStatus||'all'),[model.selectedContentStatus]);
  useEffect(()=>setPage(1),[filter,search]);
  const filtered=model.contents.filter(item=>(filter==='all'||item.status===filter)&&`${item.title} ${item.body}`.toLowerCase().includes(search.trim().toLowerCase()));
  const preview=model.contents.find(item=>item.id===previewId),removing=model.contents.find(item=>item.id===deleteId);
  const planName=(item:StudioContent)=>accessLabel(item,model.memberships);
  const when=(item:StudioContent)=>item.status==='scheduled'&&item.scheduledAt?`${date(item.scheduledAt)} 게시 예정`:`${date(item.updatedAt)} 수정`;
  const columns:TableColumn<StudioContent>[]=[
    {key:'title',label:'게시물',sortValue:item=>item.title,render:item=><div className={s.contentCell}><ContentThumbnail item={item}/><div className={s.contentLabel}><Link href={`${basePath}/content/${item.id}/edit`}>{item.title}</Link>{item.media.some(media=>media.type==='video'&&media.processing)&&<VideoProcessing variant="badge"/>}</div></div>},
    {key:'status',label:'상태',sortValue:item=>statusLabels[item.status],render:item=><ContentStatus item={item} commentsGloballyEnabled={commentsGloballyEnabled}/>},
    {key:'access',label:'공개 범위',sortValue:item=>planName(item),render:item=><MarqueeText text={planName(item)}/>},
    {key:'date',label:'일시',sortValue:item=>item.status==='scheduled'&&item.scheduledAt?item.scheduledAt:item.updatedAt,render:item=><span className={s.muted}>{when(item)}</span>},
    {key:'actions',label:'관리',render:item=><div className={s.rowButtons}>{fanHref(item)?<Link href={fanHref(item)!} className={`${s.rowButton} ${s.rowButtonLink}`}>팬 화면</Link>:<Action variant="secondary" type="button" className={s.rowButton} onClick={()=>setPreviewId(item.id)}>미리보기</Action>}<Link href={`${basePath}/content/${item.id}/edit`} className={`${s.rowButton} ${s.rowButtonLink}`}>수정</Link><Action variant="secondary" type="button" className={`${s.rowButton} ${s.rowButtonDanger}`} disabled={task.busy} onClick={()=>{task.clear();setDeleteId(item.id);}}>삭제</Action></div>},
  ];
  const currentPage=Math.min(page,Math.max(1,Math.ceil(filtered.length/pageSize)));
  const mobileRows=orderTableRows(filtered,columns,sort).slice((currentPage-1)*pageSize,currentPage*pageSize);
  const changeSort=(value:TableSort)=>{setSort(value);setPage(1);};
  return <section className={`${s.page} ${cards.page}`}><PageTitle back={<BackButton href={basePath} label="대시보드로 돌아가기"/>} action={<ActionLink href={`${basePath}/content/new`}><Icon name="plus" width={17} height={17}/>게시물 작성</ActionLink>}>게시물</PageTitle><p className={`${s.intro} ${cards.intro}`}>크리에이터의 순간을 기록하고, 팬들에게 전하세요.</p>
    <div className={`${s.toolbar} ${cards.toolbar}`}><nav className={`${s.tabs} ${cards.tabs}`} aria-label="게시 상태">{(['all','published','draft','scheduled'] as const).map(value=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{value==='all'?'전체':statusLabels[value]} <span>{model.contents.filter(item=>value==='all'||item.status===value).length}</span></button>)}</nav><label className={s.search}><Icon name="search" width={18} height={18}/><input aria-label="게시물 검색" value={search} onChange={e=>setSearch(e.target.value)} placeholder="게시물 검색"/></label></div>
    <Toast message={task.message} onClose={task.clearMessage}/>{task.error&&!removing&&<p className={s.error} role="alert">{task.error}</p>}
    {filtered.length?<><div className={cards.desktop}><DataTable rows={filtered} columns={columns} rowKey={item=>item.id} sort={sort} onSortChange={changeSort} caption="게시물 목록" page={page} pageSize={pageSize}/></div>
      <div className={cards.mobile}>
        <div className={cards.listToolbar}><strong>총 {filtered.length.toLocaleString('ko-KR')}개</strong><SelectField className={cards.sort} hideLabel label="게시물 정렬" value={sort?`${sort.key}:${sort.direction}`:''} onChange={value=>{const [key,direction]=value.split(':');changeSort(value?{key,direction:direction as 'asc'|'desc'}:null);}} options={[{value:'',label:'기본순'},...columns.filter(column=>column.sortValue).flatMap(column=>[{value:`${column.key}:asc`,label:`${column.label} ${column.key==='date'?'오래된순':'오름차순'}`},{value:`${column.key}:desc`,label:`${column.label} ${column.key==='date'?'최신순':'내림차순'}`}])]}/></div>
        <div className={cards.list} aria-label="게시물 카드 목록" key={`${filter}:${search}:${sort?.key}:${sort?.direction}:${currentPage}`}>{mobileRows.map((item,index)=><ContentCard key={item.id} item={item} initiallyOpen={index===0} access={planName(item)} basePath={basePath} fanHref={fanHref(item)} commentsGloballyEnabled={commentsGloballyEnabled} busy={task.busy} onPreview={()=>setPreviewId(item.id)} onDelete={()=>{task.clear();setDeleteId(item.id);}}/>)}</div>
      </div>{filtered.length>pageSize&&<Pagination page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} label="게시물 목록 페이지"/>}</>:<Empty title="게시물이 없어요" description="새 게시물을 작성하거나 검색 조건을 바꿔보세요." action={<ActionLink variant="secondary" href={`${basePath}/content/new`}>첫 게시물 작성하기</ActionLink>}/>}
    {model.notice&&<Notice>{model.notice}</Notice>}
    <Dialog open={!!preview} onClose={()=>setPreviewId(null)} title="팬 화면 미리보기">{preview&&<ContentPostPreview content={preview} memberships={model.memberships} model={previewModel} creatorId={previewCreatorId} commentsGloballyEnabled={commentsGloballyEnabled}/>}</Dialog>
    {removing&&<TypedConfirmDialog key={removing.id} title="게시물 삭제" phrase={removing.title} actionLabel="삭제하기" busyLabel="삭제 중…" busy={task.busy} error={task.error} onCancel={()=>setDeleteId(null)} onConfirm={confirmation=>task.run(()=>model.actions.deleteContent(removing.id,confirmation),()=>setDeleteId(null))}><p>게시물을 삭제하면 목록에서 확인할 수 없습니다.</p><p>삭제할 게시물 제목을 정확히 입력해주세요.</p></TypedConfirmDialog>}
  </section>;
}

// memberMode (2026-11-15): a member who is not a creator writes public posts only; no membership scope, tips or scheduling.
// guest (2026-11-15): a signed-out AI photo trial reuses the editor; it publishes only (no draft/comments) and shows its notice.
type GuestEditor={/** 2026-11-22: Coupang costume link click reward (AiPhotoDialog). */shopReward?:{claim:()=>Promise<boolean>};/** 2026-11-20: the trial's author id; the browser draft is restored only for the same trial. */authorId?:string;postReward?:number;shareReward?:{refresh:()=>Promise<void>;claim:(mediaId:string)=>Promise<boolean>};backHref:string;doneHref:string;notice:ReactNode;/** 2026-11-17: a fictional sample photo placed in the trial so a visitor without a photo can start right away. */samplePhoto?:{url:string;name:string};caption?:(input:{items:string[];prompt:string;title?:string;body?:string})=>Promise<ApiResult<{title:string;body:string;source:'ai'|'template'}>>};
type EditorProps=Props&ContentPreviewProps&{memberMode?:boolean;guest?:GuestEditor;/** 2026-11-23: the signed-in member's id; a trial draft linked at sign-up opens in their new post. */draftOwner?:string};
export const GUEST_AI_PHOTO_REQUIRED='AI로 만든 사진을 한 장 이상 넣어야 게시할 수 있어요. 「AI 사진 편집」에서 사진을 만들고 「사진 결정」을 눌러 주세요. 직접 올린 사진은 체험 게시물에 올라가지 않아요.';
export function ContentEditorPage({model,basePath,id,previewModel,previewCreatorId,commentsGloballyEnabled=true,memberMode=false,guest,draftOwner}:EditorProps){
  const content=id?model.contents.find(item=>item.id===id):undefined;
  if(id&&!content)return <section className={s.page}><PageTitle back={<BackButton href={`${basePath}/content`} label="콘텐츠 목록으로"/>}>게시물 수정</PageTitle><Empty title="게시물을 찾을 수 없어요" illustration={false} description="삭제되었거나 접근할 수 없는 게시물입니다."/></section>;
  return <ContentEditor key={id||'new'} model={model} basePath={basePath} content={content} previewModel={previewModel} previewCreatorId={previewCreatorId} commentsGloballyEnabled={commentsGloballyEnabled} memberMode={memberMode||!!guest} guest={guest} draftOwner={draftOwner}/>;
}
function ContentEditor({model,basePath,content,previewModel,previewCreatorId,commentsGloballyEnabled=true,memberMode=false,guest,draftOwner}:EditorProps&{content?:StudioContent}){
  const [previewOpen,setPreviewOpen]=useState(false),[savedId,setSavedId]=useState(content?.id),[title,setTitle]=useState(content?.title||''),[body,setBody]=useState(content?.body||''),[media,setMedia]=useState<StudioMedia[]>(content?.media||[]),[tipsEnabled,setTipsEnabled]=useState(content?.tipsEnabled??true),[commentsEnabled,setCommentsEnabled]=useState(content?.commentsEnabled??true),[access,setAccess]=useState(content?.accessLevel?`level:${content.accessLevel}`:content?.accessPlanId||''),[scheduledAt,setScheduledAt]=useState(localDateInput(content?.scheduledAt||null)),[scheduleEnabled,setScheduleEnabled]=useState(content?.status==='scheduled'),[error,setError]=useState('');
  // 2026-11-20 user request: while the share reward is still available, a floating ticket (bottom right) reopens the share-reward guide.
  const [shareGuideOpen,setShareGuideOpen]=useState(false);
  // 2026-11-20 user decision (시안 B): posting a real-face photo can feel like too much, so the trial editor offers sharing the AI result
  // next to 지금 게시하기. Same share sheet and the same once-a-day share reward as the AI result screen.
  const [editorShare,setEditorShare]=useState<StudioMedia|null>(null),[editorShareRewarded,setEditorShareRewarded]=useState(false);
  const editorShareFiles=useRef(new Map<string,Promise<File>>());
  function editorShareFile(item:StudioMedia){let file=editorShareFiles.current.get(item.id);if(!file){file=(async()=>{const blob=await fetchImageBlob(item.url);if(!blob.type.startsWith('image/'))throw new Error('image');return new File([await toPng(blob)],'crefans-ai-photo.png',{type:'image/png'});})();editorShareFiles.current.set(item.id,file);file.catch(()=>editorShareFiles.current.delete(item.id));}return file;}
  const [mediaError,setMediaError]=useState(''),[uploading,setUploading]=useState(false),[aiOpen,setAiOpen]=useState(false);
  const [librarySelection,setLibrarySelection]=useState<LibraryAsset[]|null>(null);
  const library=guest?undefined:model.photoLibrary;
  const mediaRoom=mediaUploadMaxItems-media.length;
  // Guest trial caption: what was chosen in the AI editor, and the AI-written draft shown before publishing (2026-11-16).
  // Guest trial (2026-11-16 revision): title/body appear only after an AI photo is added, with an 'AI로 내용 작성' button beside them.
  const captionMode=!!guest?.caption,captionItems=useRef(new Set<string>()),captionPrompt=useRef(''),[captionBusy,setCaptionBusy]=useState(false),[captionReady,setCaptionReady]=useState(false),aiMade=media.some(item=>item.aiGenerated);
  // Tapping an uploaded thumbnail opens it full screen, like on the post page (2026-11-15).
  const [viewIndex,setViewIndex]=useState<number|null>(null),viewPresent=usePresence(viewIndex!==null,designTokens.motion.fast),[viewLast,setViewLast]=useState(0);
  const viewable=media.filter(item=>!item.failed);
  const aiDescriptionId=useId();
  // 2026-11-18 user decision: a game/anime costume photo keeps the post fully public and without tips (the server enforces both).
  const franchise=media.some(item=>item.franchiseCostume),shownAccess=franchise?'':access;
  const accessLevel=shownAccess.startsWith('level:')?Number(shownAccess.slice(6)):null,accessPlanId=accessLevel===null?shownAccess:'';
  const levels=Array.from(new Set([...model.memberships.map(plan=>plan.rank??1),...(accessLevel?[accessLevel]:[])])).sort((a,b)=>a-b);
  const draftMedia=useRef<string[]>([]),mediaRequest=useRef(0),discard=useRef(model.actions.discardContentMedia);
  discard.current=model.actions.discardContentMedia;
  useEffect(()=>()=>{mediaRequest.current++;draftMedia.current.forEach(url=>discard.current(url));previews.current.forEach(url=>URL.revokeObjectURL(url));},[]);
  // iPhone videos convert on the server: thumbnail from the creator's own file, polled until done (2026-11-01).
  const previews=useRef(new Set<string>()),router=useRouter(),converting=media.filter(item=>item.processing).map(item=>item.id).join(','),mediaStatus=model.actions.mediaStatus;
  const dropPreview=(url?:string)=>{if(url&&previews.current.delete(url))URL.revokeObjectURL(url);};
  useEffect(()=>{
    if(!converting||!mediaStatus)return;let live=true;
    const check=async()=>{for(const id of converting.split(',')){const result=await mediaStatus(id);if(!live||!result.success||result.data.status==='processing')continue;
      setMedia(previous=>previous.map(item=>{if(item.id!==id)return item;dropPreview(item.preview);return {id:item.id,type:item.type,url:item.url,...(result.data.status==='failed'?{failed:true}:{})};}));}};
    const timer=setInterval(()=>void check(),5000);return()=>{live=false;clearInterval(timer);};
  },[converting,mediaStatus]);
  const task=useManagementAction(),current=model.contents.find(item=>item.id===savedId),status=current?.status||'draft';
  function updateLibrarySelection(id:string,updated?:LibraryAsset){
    setLibrarySelection(previous=>{
      if(!previous)return null;
      return updated?previous.map(item=>item.id===id?updated:item):previous.filter(item=>item.id!==id);
    });
  }
  function importLibrary(){
    if(!librarySelection||uploading||task.busy)return;
    setMedia(previous=>[...previous,...librarySelection.filter(item=>!previous.some(entry=>entry.id===item.id)).slice(0,Math.max(0,mediaUploadMaxItems-previous.length))]);
    setMediaError('');
    setLibrarySelection(null);
  }
  function removeMedia(id:string){
    setMedia(previous=>{const item=previous.find(entry=>entry.id===id);dropPreview(item?.preview);if(item&&draftMedia.current.includes(item.url)){discard.current(item.url);draftMedia.current=draftMedia.current.filter(url=>url!==item.url);}return previous.filter(entry=>entry.id!==id);});
    setMediaError('');
  }
  async function upload(files:File[]):Promise<StudioMedia[]>{
    const request=++mediaRequest.current,room=mediaUploadMaxItems-media.length,added:StudioMedia[]=[];
    setMediaError(room<files.length?`미디어는 최대 ${mediaUploadMaxItems}개까지 추가할 수 있어요. ${Math.max(room,0)}개만 추가했어요.`:'');
    if(room<=0)return added;
    setUploading(true);
    try{
      for(const file of files.slice(0,room)){
        const result=await model.actions.uploadContentMedia(file);
        if(request!==mediaRequest.current){if(result.success)discard.current(result.data.url);return added;}
        if(result.success){added.push(result.data);draftMedia.current=[...draftMedia.current,result.data.url];let preview:string|undefined;if(result.data.processing&&typeof URL.createObjectURL==='function'){preview=URL.createObjectURL(file);previews.current.add(preview);}setMedia(previous=>[...previous,{...result.data,...(preview?{preview}:{})}]);}
        else{setMediaError(result.errorMessage);break;}
      }
    }catch{if(request===mediaRequest.current)setMediaError('미디어를 불러오지 못했어요. 다시 선택해주세요.');}
    finally{if(request===mediaRequest.current)setUploading(false);}
    return added;
  }
  // 2026-11-17 user decision: the guest trial starts with the landing page's fictional person already added, so a visitor with
  // no photo at hand can try the AI editor at once; removing it and uploading their own photo works as before.
  const sampleTried=useRef(false),[sampleId,setSampleId]=useState<string>(),[sampleNotice,setSampleNotice]=useSnackbarMessage();
  // 2026-11-20 user request: a visitor who went back to the feed and returns keeps the trial draft (photos, AI results, title, body)
  // from this browser; then no new sample photo is added. Saved on every change once restored; cleared after publishing.
  const [draftReady,setDraftReady]=useState(false);
  useEffect(()=>{if(!guest||content)return;const draft=loadGuestTrialDraft(guest.authorId);
    if(draft){sampleTried.current=true;setMedia(draft.media);setTitle(draft.title);setBody(draft.body);if(draft.title||draft.body)setCaptionReady(true);setSampleNotice('작성하던 내용을 이어서 불러왔어요.');}
    setDraftReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- once, when the trial editor opens
  },[]);
  useEffect(()=>{if(guest&&!content&&draftReady)saveGuestTrialDraft(guest.authorId,{media,title,body});},[guest,content,draftReady,media,title,body]);
  // 2026-11-23 user request (C 테스트): after sign-up the linked trial draft (photos, title, body) continues in the member's new post.
  // It stays stored until a save succeeds, so leaving the editor does not lose it.
  const memberDraft=useRef(false);
  useEffect(()=>{if(guest||content)return;const draft=loadGuestTrialDraft(memberDraftOwner(draftOwner),Date.now(),false);if(!draft)return;
    memberDraft.current=true;setMedia(draft.media);setTitle(draft.title);setBody(draft.body);setSampleNotice('체험에서 작성하던 내용을 이어서 불러왔어요.');
  // eslint-disable-next-line react-hooks/exhaustive-deps -- once, when a new post opens
  },[draftOwner]);
  useEffect(()=>{const sample=guest?.samplePhoto;if(!sample||content||sampleTried.current)return;sampleTried.current=true;
    void (async()=>{try{const blob=await fetchImageBlob(sample.url).catch(()=>null);if(!blob)return;const added=await upload([new File([blob],sample.name,{type:blob.type||'image/webp'})]);if(added[0]){setSampleId(added[0].id);setSampleNotice('샘플 원본을 등록해드렸어요.');}}catch{/* the visitor can still upload a photo */}})();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once when the trial editor opens
  },[]);
  const sampleShown=!!sampleId&&media.some(item=>item.id===sampleId);
  // 2026-11-23 user decision: in the trial, a photo the visitor uploads becomes the AI edit target instead of the sample.
  const [uploadedSourceId,setUploadedSourceId]=useState<string>();
  function pickUploaded(added:StudioMedia[]){const photo=guest?[...added].reverse().find(item=>item.type==='image'):undefined;if(photo)setUploadedSourceId(photo.id);}
  // 2026-11-17 user feedback: after the sample photo is added the next step was unclear, so the AI button is highlighted with a
  // short hint until it is opened once.
  const [aiTouched,setAiTouched]=useState(false),nudgeAi=sampleShown&&!aiTouched;
  const openedFromFeed=useRef(false);
  useEffect(()=>{
    if(openedFromFeed.current||guest||content||!model.actions.aiEditPhoto||task.busy||uploading||typeof window==='undefined'||window.location?.hash!=='#ai-photo')return;
    openedFromFeed.current=true;
    setAiOpen(true);setAiTouched(true);void model.actions.refreshAiPhotoQuota?.();
  },[guest,content,model.actions,task.busy,uploading]);
  // 2026-11-24 이탈 분석: the hint bubble says "여기를 눌러" but was a plain note, so tapping it did nothing (dead clicks right after
  // consent). Tapping the bubble now opens the editor like the button; the button stays the keyboard/screen-reader control.
  const aiOpenBlocked=task.busy||uploading;
  const openAi=()=>{if(aiOpenBlocked)return;setAiOpen(true);setAiTouched(true);void model.actions.refreshAiPhotoQuota?.();};
  // 2026-11-17 user request: after an AI photo, nudge 'AI로 내용 작성' until pressed once; once title and body are both filled
  // (by the AI or typed), nudge the publish button instead. One nudge at a time; guest trial only.
  const [writeForReward,setWriteForReward]=useState(false),writeSection=useRef<HTMLElement>(null);
  useEffect(()=>{
    if(writeForReward&&!aiOpen)writeSection.current?.focus();
  },[writeForReward,aiOpen]);
  const publishReward=guest?.postReward?{credits:guest.postReward,onWrite:()=>{setCaptionReady(true);setWriteForReward(true);}}:undefined;
  const shareTarget=guest&&status!=='published'?[...media].reverse().find(item=>item.type==='image'&&item.aiGenerated&&!item.processing&&!item.failed):undefined;
  const shareOffer=!!(shareTarget&&guest?.shareReward);
  const aiLeft=model.aiPhotoQuota?.remaining??Infinity;
  const publishRewardNoteId=publishReward||shareOffer?`${aiDescriptionId}-publish-reward`:undefined;
  const [captionTouched,setCaptionTouched]=useState(false),nudgePublish=captionMode&&!!title.trim()&&!!body.trim(),nudgeCaption=captionMode&&aiMade&&!captionTouched&&!nudgePublish;
  // 2026-11-24: signed-in members (creator studio and member posts, new and edit) get the same button through the studio model.
  // 2026-11-24 user decision (guest and member): with a title/body already written, the button asks first and then has AI polish that
  // text (server keeps meaning and facts); cancel keeps it as is. Empty fields still get a newly written caption. A failed polish is
  // an error from the server, so the written text stays.
  const caption=guest?.caption||(guest?undefined:model.actions.writeCaption),[captionConfirm,setCaptionConfirm]=useState(false);
  // The trial shows the fields only after the first caption (captionReady), so hidden text is never treated as written.
  const askCaption=()=>{if((!captionMode||captionReady)&&(title.trim()||body.trim()))setCaptionConfirm(true);else void writeCaption();};
  async function writeCaption(polish=false){
    if(!caption||captionBusy)return;setError('');setCaptionBusy(true);
    try{const result=await caption({items:Array.from(captionItems.current),prompt:captionPrompt.current,...(polish?{title,body}:{})});
      if(!result.success){setError(result.errorMessage||'제목과 내용을 만들지 못했어요. 다시 시도해 주세요.');return;}
      setTitle(result.data.title);setBody(result.data.body);setCaptionReady(true);}
    catch{setError('제목과 내용을 만들지 못했어요. 다시 시도해 주세요.');}finally{setCaptionBusy(false);}
  }
  const publishableMedia=guest?media.filter(item=>item.aiGenerated):media;
  // 2026-11-23 이탈 분석(PostHog 01a205ea…): the publish-reward offer opened the title/body fields before any AI photo was decided, and
  // the trial post went out without a photo (own uploads are left out of trial posts). A trial post now needs a decided AI photo.
  function save(nextStatus:StudioContentStatus){setError('');if(guest&&!publishableMedia.some(item=>!item.failed)){setError(GUEST_AI_PHOTO_REQUIRED);return;}if(!title.trim()){setError('제목을 입력해주세요.');return;}
    // A failed conversion would be refused by the server; say what to do instead (2026-11-01).
    if(media.some(item=>item.failed)){setError('변환에 실패한 동영상을 지우고 다시 올려 주세요.');return;}if(nextStatus!=='draft'&&!body.trim()){setError('게시할 내용을 입력해주세요.');return;}
    const scheduled=scheduleEnabled&&scheduledAt?new Date(scheduledAt):null;
    if(nextStatus==='scheduled'&&(!scheduled||!Number.isFinite(scheduled.getTime())||scheduled.getTime()<=Date.parse(model.now))){setError('예약 시각을 현재보다 미래로 선택해주세요.');return;}
    void task.run(()=>model.actions.saveContent({id:savedId,title,body,media:publishableMedia.map(({id,type,url,aiGenerated,thumbnailUrl})=>({id,type,url,...(aiGenerated?{aiGenerated}:{}),...(thumbnailUrl?{thumbnailUrl}:{})})),commentsEnabled,tipsEnabled:memberMode?false:tipsEnabled,accessPlanId:accessPlanId||null,accessLevel,status:nextStatus,scheduledAt:nextStatus==='scheduled'?scheduled!.toISOString():null}),data=>{if(data.id)setSavedId(data.id);if(memberDraft.current){memberDraft.current=false;clearGuestTrialDraft();}
      // Publishing, scheduling or saving a published post returns to the list; a draft save keeps editing (2026-11-01).
      if(nextStatus!=='draft'){if(guest)clearGuestTrialDraft();router.push(guest?guest.doneHref:`${basePath}/content`);return;}
      setScheduleEnabled(false);setScheduledAt('');});
  }
  // With a schedule time set, the main button schedules instead of publishing now (2026-11-01); the schedule toggle alone does not publish.
  const scheduling=scheduleEnabled&&!!scheduledAt;
  // The fan preview shows converting videos as "optimizing" like fans would see them; failed ones are left out.
  const draft:StudioContent={id:savedId||'',title,body,media:publishableMedia.filter(item=>!item.failed),commercialRestricted:franchise,commentsEnabled,tipsEnabled,accessPlanId:accessPlanId||null,accessLevel,status,scheduledAt:null,updatedAt:model.now};
  return <section className={s.page}><PageTitle back={<BackButton href={guest?guest.backHref:`${basePath}/content`} label={guest?'피드로 돌아가기':'콘텐츠 목록으로'}/>}>{guest?'AI 사진 체험':savedId?'게시물 수정':'게시물 작성'}</PageTitle>{guest&&<Notice>{guest.notice}</Notice>}
    <div className={s.editorLayout}><div className={s.editorColumn}>
    {/* A new post has no state until it is saved: show the badge only for saved posts (2026-11-01). */}
    {current&&<div className={s.editorHead}><span className={s.statusCell}><Status value={status}/>{current.unpublished&&<span className={s.status} data-status="unpublished">미공개</span>}</span></div>}
    {current&&<ContentVisibility content={current} access={accessLabel(current,model.memberships)} onChange={isPublic=>model.actions.setContentPublic(current.id,isPublic)}/>}
    <form className={s.editor} onSubmit={e=>{e.preventDefault();save(guest||status==='published'?'published':'draft');}}>
      {/* Guest trial (2026-11-16): the photo and AI edit come first; title/body may stay empty and are written at publish time. */}
      {captionMode?<>
      <MediaUpload label="파일 업로드" items={media} max={mediaUploadMaxItems} onFilesSelect={files=>void upload(files).then(pickUploaded)} onRemove={removeMedia} onReorder={(from,to)=>setMedia(previous=>moveItem(previous,from,to))} onPreview={index=>{const at=viewable.indexOf(media[index]);if(at>=0){setViewIndex(at);setViewLast(at);}}} accept={mediaUploadAccept} disabled={task.busy} uploading={uploading} error={mediaError} hint="JPG·PNG·WebP 사진 한 장 50MB까지(자동으로 줄여서 올려요) · MP4·WebM·MOV 300MB 이하"/>
      {model.actions.aiEditPhoto&&(()=>{const photos=media.filter(item=>item.type==='image'&&!item.processing&&!item.failed);return <div className={ai.aiAction}>{nudgeAi&&<p className={ai.aiNudgeHint} role="note" onClick={openAi}>이제 여기를 눌러 의상·포즈를 골라 보세요</p>}<button type="button" className={`${ai.aiWide} ${nudgeAi?ai.aiNudge:''}`} aria-label="AI 사진 편집" aria-describedby={aiDescriptionId} onClick={openAi} disabled={aiOpenBlocked}><Image src="/brand/featured-creators-v1.png" alt="" width={24} height={24} sizes="24px"/><span className={ai.aiActionCopy}><span>AI 사진 편집</span><small id={aiDescriptionId}>메이크업, 헤어변경, 옷변경, 포즈변경, 배경변경</small></span><Icon name="chevron" width={18} height={18}/></button>
        <AiPhotoDialog shopReward={guest?.shopReward} preferSourceId={uploadedSourceId} onUploadBackground={model.actions.uploadContentMedia} shareReward={guest?.shareReward} publishReward={publishReward} noHearts={!!guest} library={model.photoLibrary} onCrop={model.actions.aiCropPhoto} onHeartGame={model.actions.aiHeartGame} onReview={model.actions.aiReview} shop={model.shop} shopBasePath={basePath} open={aiOpen} onClose={()=>setAiOpen(false)} images={photos} quota={model.aiPhotoQuota||{remaining:AI_PHOTO_DAILY_LIMIT,limit:AI_PHOTO_DAILY_LIMIT}} room={mediaUploadMaxItems-media.length} onEdit={model.actions.aiEditPhoto!} onUseTicket={model.actions.useAiPhotoTicket} onShareReport={model.actions.reportShare} onTrack={model.actions.trackAiPhoto} onAdd={(made,context,replaceSourceIds=[])=>{replaceSourceIds.forEach(removeMedia);if(context){context.labels.forEach(label=>captionItems.current.add(label));if(context.prompt)captionPrompt.current=context.prompt;}draftMedia.current=[...draftMedia.current,...made.map(item=>item.url)];setMedia(previous=>[...previous,...made]);setMediaError('');}}/></div>;})()}
      {aiMade||writeForReward?<section ref={writeSection} tabIndex={-1} className={s.captionFields} aria-label="제목과 내용">{aiMade&&nudgeCaption&&<p className={ai.aiNudgeHint} role="note">여기를 눌러 빠르게 작성하세요</p>}{aiMade&&<div className={s.captionBar}><Action variant="secondary" type="button" className={nudgeCaption?ai.aiNudge:''} disabled={captionBusy||task.busy} onClick={()=>{setCaptionTouched(true);askCaption();}}>{captionBusy?'쓰는 중…':'AI로 내용 작성'}</Action></div>}
      {captionReady&&<><Field label="제목" value={title} maxLength={120} onChange={e=>setTitle(e.target.value)} placeholder="제목을 입력하세요"/>
      <TextAreaField label="본문" value={body} rows={12} maxLength={10000} onChange={e=>setBody(e.target.value)} placeholder="내용을 입력하세요"/></>}
      </section>:null}
      </>:<>
      {/* 2026-11-23 user request: PostHog replay records the member's post title/body as typed (lib/analytics/posthog.ts REPLAY_POST_TEXT_ATTR). */}
      {aiMade&&caption&&<div className={s.captionBar}><Action variant="secondary" type="button" disabled={captionBusy||task.busy} onClick={askCaption}>{captionBusy?'쓰는 중…':'AI로 내용 작성'}</Action></div>}
      <Field label="제목" value={title} maxLength={120} {...{[REPLAY_POST_TEXT_ATTR]:''}} onChange={e=>setTitle(e.target.value)} placeholder="제목을 입력하세요"/>
      {/* 2026-11-23 user request: a member's body field is two lines tall on mobile, like the trial's (management.module.css .memberBody). */}
      <TextAreaField label="본문" value={body} rows={12} maxLength={10000} className={memberMode?s.memberBody:undefined} {...{[REPLAY_POST_TEXT_ATTR]:''}} onChange={e=>setBody(e.target.value)} placeholder="내용을 입력하세요"/>
      <MediaUpload label="파일 업로드" items={media} max={mediaUploadMaxItems} onFilesSelect={files=>void upload(files).then(pickUploaded)} onRemove={removeMedia} onReorder={(from,to)=>setMedia(previous=>moveItem(previous,from,to))} onPreview={index=>{const at=viewable.indexOf(media[index]);if(at>=0){setViewIndex(at);setViewLast(at);}}} accept={mediaUploadAccept} disabled={task.busy} uploading={uploading} error={mediaError} hint="JPG·PNG·WebP 사진 한 장 50MB까지(자동으로 줄여서 올려요) · MP4·WebM·MOV 300MB 이하"
       beforeAdd={library&&<Action type="button" variant="secondary" className={s.libraryImport} disabled={task.busy||uploading||mediaRoom<=0} onClick={()=>setLibrarySelection([])}><Icon name="folder" width={20} height={20}/>보관함에서 사진·동영상 가져오기</Action>}/>
      {library&&librarySelection&&<AiPhotoLibrary open model={library} onClose={()=>setLibrarySelection(null)} attachment={{selected:librarySelection,excluded:new Set(media.map(item=>item.id)),limit:mediaRoom,onConfirm:importLibrary,onUpdate:updateLibrarySelection,onToggle:item=>setLibrarySelection(previous=>previous?.some(entry=>entry.id===item.id)?previous.filter(entry=>entry.id!==item.id):previous&&previous.length<mediaRoom?[...previous,item]:previous)}}/>}
      {model.actions.aiEditPhoto&&(()=>{const photos=media.filter(item=>item.type==='image'&&!item.processing&&!item.failed);return <div className={ai.aiAction}>{nudgeAi&&<p className={ai.aiNudgeHint} role="note" onClick={openAi}>이제 여기를 눌러 의상·포즈를 골라 보세요</p>}<button type="button" className={`${ai.aiWide} ${nudgeAi?ai.aiNudge:''}`} aria-label="AI 사진 편집" aria-describedby={aiDescriptionId} onClick={openAi} disabled={aiOpenBlocked}><Image src="/brand/featured-creators-v1.png" alt="" width={24} height={24} sizes="24px"/><span className={ai.aiActionCopy}><span>AI 사진 편집</span><small id={aiDescriptionId}>메이크업, 헤어변경, 옷변경, 포즈변경, 배경변경</small></span><Icon name="chevron" width={18} height={18}/></button>
        <AiPhotoDialog shopReward={guest?.shopReward} preferSourceId={uploadedSourceId} onUploadBackground={model.actions.uploadContentMedia} shareReward={guest?.shareReward} publishReward={publishReward} noHearts={!!guest} library={model.photoLibrary} onCrop={model.actions.aiCropPhoto} onHeartGame={model.actions.aiHeartGame} onReview={model.actions.aiReview} shop={model.shop} shopBasePath={basePath} open={aiOpen} onClose={()=>setAiOpen(false)} images={photos} quota={model.aiPhotoQuota||{remaining:AI_PHOTO_DAILY_LIMIT,limit:AI_PHOTO_DAILY_LIMIT}} room={mediaUploadMaxItems-media.length} onEdit={model.actions.aiEditPhoto!} onUseTicket={model.actions.useAiPhotoTicket} onShareReport={model.actions.reportShare} onTrack={model.actions.trackAiPhoto} onAdd={(made,context,replaceSourceIds=[])=>{replaceSourceIds.forEach(removeMedia);if(context){context.labels.forEach(label=>captionItems.current.add(label));if(context.prompt)captionPrompt.current=context.prompt;}draftMedia.current=[...draftMedia.current,...made.map(item=>item.url)];setMedia(previous=>[...previous,...made]);setMediaError('');}}/></div>;})()}
      </>}
      {!memberMode&&<div className={s.editorOptions}><SelectField marquee label="공개 범위" value={shownAccess} onChange={setAccess} disabled={franchise} hint={franchise?'게임·애니메이션 의상 사진이 있어 전체 공개로만 올릴 수 있어요.':undefined} options={[{value:'',label:'전체 공개'},...levels.map(rank=>({value:`level:${rank}`,label:`레벨 ${rank} 이상`})),...model.memberships.map(plan=>({value:plan.id,label:`${plan.name} 전용${!plan.active?' · 신규 가입 중단':''}`}))]} searchable/>{status!=='published'&&<section className={s.scheduleBox} aria-label="예약 게시 설정"><Toggle label="예약 사용" checked={scheduleEnabled} disabled={task.busy} onChange={enabled=>{setScheduleEnabled(enabled);if(!enabled)setScheduledAt('');setError('');}}/><Field label="예약 게시 시각" type="datetime-local" value={scheduledAt} min={localDateInput(model.now)} disabled={!scheduleEnabled||task.busy} clearable onClear={()=>{setScheduledAt('');setError('');}} onChange={e=>{setScheduledAt(e.target.value);setError('');}} hint="현재 기기의 시간대를 기준으로 선택해주세요."/></section>}</div>}
      {!memberMode&&<div className={s.commentOption}><Checkbox label="이 게시물에서 후원 받기" description={franchise?'게임·애니메이션 의상 사진이 있는 게시물은 저작권 문제로 후원을 받을 수 없어요.':'전체공개 게시물에서도 후원을 받을 수 있습니다.'} checked={tipsEnabled&&!franchise} disabled={task.busy||franchise} onChange={setTipsEnabled}/></div>}
      {!guest&&<div className={s.commentOption}><Toggle label="댓글 허용" description={commentsGloballyEnabled?'끄면 이 게시물에서만 댓글을 닫습니다.':'스튜디오 설정에서 댓글 기능이 꺼져 있어 모든 게시물의 댓글이 닫힙니다. 크리에이터 설정에서 먼저 켜 주세요.'} checked={commentsEnabled} disabled={task.busy||!commentsGloballyEnabled} onChange={setCommentsEnabled}/></div>}
      {(error||task.error)&&<p className={s.error} role="alert">{error||task.error}</p>}<Toast message={task.message} onClose={task.clearMessage}/><Toast message={sampleNotice} onClose={()=>setSampleNotice('')}/>
      {/* Narrow screens (one column): the fan preview opens in its own dialog instead of sitting below the form (2026-11-01). */}
      {/* 2026-11-21 user request: signed-out visitors do not get the 미리보기 button. */}
      {!guest&&<Action variant="secondary" type="button" className={s.mobilePreview} onClick={()=>setPreviewOpen(true)}>미리보기</Action>}
      <div className={publishRewardNoteId&&status!=='published'?`${s.editorActions} ${s.rewardPublishActions}`:s.editorActions}>{status==='published'?<Action type="submit" disabled={task.busy||uploading||!title.trim()||!body.trim()}>수정 저장</Action>:<>{!guest&&<Action variant="secondary" type="submit" disabled={task.busy||uploading||!title.trim()}>{status==='scheduled'?'예약 취소 후 임시저장':'임시저장'}</Action>}{(shareOffer||publishReward||nudgePublish)&&<p id={publishRewardNoteId} className={shareOffer?`${ai.aiNudgeHintRow} ${s.shareOfferNote}`:ai.aiNudgeHintRow} role="note"><span className={ai.aiNudgeHint}>{shareOffer?'게시 대신 공유만 해도 이용권 3장':publishReward?`이용권 ${publishReward.credits}장을 더 받아가세요`:'이제 게시하기를 눌러 올려 보세요'}</span></p>}{shareTarget&&<Action variant="secondary" type="button" className={s.editorShare} aria-describedby={shareOffer?publishRewardNoteId:undefined} disabled={task.busy} onClick={()=>setEditorShare(shareTarget)}>결과 공유</Action>}<Action variant="brand" type="button" className={nudgePublish?ai.aiNudge:''} aria-describedby={publishRewardNoteId} disabled={task.busy||uploading||captionBusy||!title.trim()||!body.trim()||scheduleEnabled&&!scheduledAt} onClick={()=>save(scheduling?'scheduled':'published')}>{scheduling?'예약하기':'지금 게시하기'}</Action></>}</div>
    </form>{model.notice&&<Notice>{model.notice}</Notice>}
    </div>
    <aside className={s.previewPane} aria-label="팬 화면 미리보기"><h2 className={s.previewTitle}>팬 화면 미리보기</h2><ContentPostPreview content={draft} memberships={model.memberships} model={previewModel} creatorId={previewCreatorId} commentsGloballyEnabled={commentsGloballyEnabled}/></aside>
     {viewPresent&&viewable.length>0&&<MediaOverlay media={viewable.map(item=>({type:item.type,url:item.url,processing:item.processing}))} title={title.trim()||'첨부 미디어'} alt={title.trim()||'첨부 미디어'} index={Math.min(viewIndex??viewLast,viewable.length-1)} onIndexChange={index=>{setViewIndex(index);setViewLast(index);}} open={viewIndex!==null} onClose={()=>setViewIndex(null)}/>}
     <Dialog open={captionConfirm} onClose={()=>setCaptionConfirm(false)} title="쓴 글을 AI로 다듬을까요?"><div className={s.dialogBody}><p>지금 쓴 제목과 본문의 뜻은 그대로 두고 맞춤법·문장·말투를 AI가 다듬어요. 다듬은 뒤에도 직접 고칠 수 있어요.</p><DialogActions><Action variant="secondary" type="button" onClick={()=>setCaptionConfirm(false)}>취소</Action><Action variant="brand" type="button" onClick={()=>{setCaptionConfirm(false);void writeCaption(true);}}>다듬기</Action></DialogActions></div></Dialog>
     <Dialog open={previewOpen} onClose={()=>setPreviewOpen(false)} title="팬 화면 미리보기">{previewOpen&&<ContentPostPreview content={draft} memberships={model.memberships} model={previewModel} creatorId={previewCreatorId} commentsGloballyEnabled={commentsGloballyEnabled}/>}</Dialog>
     {editorShare&&<AiResultShare key={editorShare.id} item={editorShare} eligible={!!guest?.shareReward} prepare={editorShareFile} onClose={()=>setEditorShare(null)} onReport={report=>{
      model.actions.reportShare?.(report);
      if(report.outcome==='done'){model.actions.trackAiPhoto?.('ai_result_shared',{mode:'editor'});
       if(guest?.shareReward&&(report.method==='native'||report.method==='copy'))void guest.shareReward.claim(editorShare.id).then(paid=>{if(paid){setEditorShare(null);setEditorShareRewarded(true);}});}
     }}/>}
     <Dialog open={editorShareRewarded} onClose={()=>setEditorShareRewarded(false)} title="이용권 3장을 받았어요!"><div className={ai.shareRewardDone}>{/* eslint-disable-next-line @next/next/no-img-element -- decorative ticket */}<img src="/brand/ai-photo/share-ticket-v1.webp" alt="" width={120} height={120}/><p>공유해 줘서 고마워요.<br/>받은 이용권으로 사진을 더 만들어 보세요.</p></div><DialogActions><Action type="button" onClick={()=>setEditorShareRewarded(false)}>확인</Action></DialogActions></Dialog>
     {/* 2026-11-20 user request: only when the vouchers run low (≤1 left), the same moment the editor offers the publish reward. */}
     {/* 2026-11-22 user report: with no vouchers left the guide's 'AI 사진 만들러 가기' dead-ended (nothing can be generated, so no share
         screen). With an AI result in the editor the guide opens its share sheet directly; with neither a result nor vouchers there is
         nothing to share, so the ticket is not shown. */}
     {guest?.shareReward&&aiLeft<=1&&(shareTarget||aiLeft>0)&&!aiOpen&&!previewOpen&&!viewPresent&&!shareGuideOpen&&<button type="button" className={ai.shareTicketFab} aria-label="공유하고 이용권 3장 받기 안내" onClick={()=>setShareGuideOpen(true)}>{/* eslint-disable-next-line @next/next/no-img-element -- decorative ticket */}<img src="/brand/ai-photo/share-ticket-v1.webp" alt="" width={64} height={64}/><span aria-hidden="true">+3</span></button>}
     <Dialog open={!!guest?.shareReward&&shareGuideOpen} onClose={()=>setShareGuideOpen(false)} title="공유하고 이용권 3장 받기"><div className={ai.shareRewardDone}>{/* eslint-disable-next-line @next/next/no-img-element -- decorative ticket */}<img src="/brand/ai-photo/share-ticket-v1.webp" alt="" width={120} height={120}/><p>AI로 만든 결과 사진을 공유하거나 링크를 복사하면 이용권 3장을 바로 받을 수 있어요(하루 한 번).</p></div><DialogActions><Action type="button" variant="secondary" onClick={()=>setShareGuideOpen(false)}>닫기</Action>{shareTarget?<Action type="button" onClick={()=>{setShareGuideOpen(false);setEditorShare(shareTarget);}}>결과 사진 공유하기</Action>:<Action type="button" onClick={()=>{setShareGuideOpen(false);setAiOpen(true);}}>AI 사진 만들러 가기</Action>}</DialogActions></Dialog>
    </div>
  </section>;
}

export function MembershipManagementPage({model,basePath}:Props){
  const [filter,setFilter]=useState<'active'|'archived'>('active'),[editing,setEditing]=useState<'new'|string|null>(null),[name,setName]=useState(''),[price,setPrice]=useState(''),[rank,setRank]=useState('1'),[benefits,setBenefits]=useState<string[]>(['']),[error,setError]=useState(''),[deleteId,setDeleteId]=useState<string|null>(null);
  const [image,setImage]=useState(''),[imageError,setImageError]=useState(''),[uploading,setUploading]=useState(false);
  const draftImage=useRef(''),imageRequest=useRef(0),discard=useRef(model.actions.discardMembershipImage);
  discard.current=model.actions.discardMembershipImage;
  useEffect(()=>()=>{imageRequest.current++;discard.current(draftImage.current);},[]);
  const [toggleId,setToggleId]=useState<string|null>(null);
  const task=useManagementAction(),editingPlan=model.memberships.find(plan=>plan.id===editing),deleting=model.memberships.find(plan=>plan.id===deleteId),toggling=model.memberships.find(plan=>plan.id===toggleId),filtered=model.memberships.filter(plan=>filter==='active'?plan.active:!plan.active);
  function changeImage(next:string){if(draftImage.current!==next)discard.current(draftImage.current);draftImage.current=next;setImage(next);}
  function close(){imageRequest.current++;changeImage('');setUploading(false);setEditing(null);}
  function open(plan?:StudioMembership){imageRequest.current++;changeImage(plan?.image||'');setEditing(plan?.id||'new');setName(plan?.name||'');setPrice(plan?String(plan.price):'');setRank(String(plan?.rank??1));setBenefits(plan?[...plan.benefits]:['']);setError('');setImageError('');setUploading(false);task.clear();}
  async function upload(file:File){
    const request=++imageRequest.current;setUploading(true);setImageError('');
    try{const result=await model.actions.uploadMembershipImage(file);if(request!==imageRequest.current){if(result.success)discard.current(result.data.image);return;}if(result.success)changeImage(result.data.image);else setImageError(result.errorMessage);}catch{if(request===imageRequest.current)setImageError('이미지를 불러오지 못했어요. 다시 선택해주세요.');}finally{if(request===imageRequest.current)setUploading(false);}
  }
  const level=Number(rank),validLevel=Number.isSafeInteger(level)&&level>=1&&level<=100;
  const membershipReady=validLevel&&!!name.trim()&&Number.isSafeInteger(Number(price))&&Number(price)>0&&benefits.some(value=>value.trim());
  function save(event:FormEvent){event.preventDefault();if(uploading)return;setError('');const amount=Number(price),list=benefits.map(value=>value.trim()).filter(Boolean);if(!name.trim()){setError('멤버십 이름을 입력해주세요.');return;}if(!Number.isSafeInteger(amount)||amount<=0){setError('월 구독료를 0보다 큰 정수로 입력해주세요.');return;}if(!list.length){setError('혜택을 하나 이상 입력해주세요.');return;}if(!validLevel){setError('멤버십 레벨은 1~100의 정수입니다.');return;}void task.run(()=>model.actions.saveMembership({id:editingPlan?.id,name,rank:level,price:amount,benefits:list,...(image||editingPlan?.image?{image}:{})}),close);}
  return <section className={s.page}><PageTitle back={<BackButton href={basePath} label="대시보드로 돌아가기"/>} action={<Action disabled={model.membershipPartner===false} onClick={()=>open()}><Icon name="plus" width={17} height={17}/>멤버십 만들기</Action>}>멤버십</PageTitle><p className={s.intro}>팬들에게 전할 혜택과 구독료를 관리하세요.</p>{model.membershipPartner===false&&<MembershipPartnerNotice mock={basePath.startsWith('/preview')}/>}<nav className={s.tabs} aria-label="멤버십 상태"><button aria-pressed={filter==='active'} onClick={()=>setFilter('active')}>활성화</button><button aria-pressed={filter==='archived'} onClick={()=>setFilter('archived')}>비활성화</button></nav>
    <Toast message={task.message} onClose={task.clearMessage}/>{task.error&&!editing&&!deleting&&<p className={s.error} role="alert">{task.error}</p>}
    {filtered.length?<div className={s.planGrid}>{filtered.map(plan=><article className={s.planCard} key={plan.id}><OptionalImage src={plan.image} alt={`${plan.name} 멤버십`}/><div className={s.planTop}><h2><MarqueeText text={plan.name}/></h2><span>레벨 {plan.rank??1}</span></div><p className={s.price}>{money(plan.price)}<small> / 월</small></p><ul>{plan.benefits.map((benefit,index)=><li key={`${benefit}-${index}`}><Icon name="check" width={16} height={16}/>{benefit}</li>)}</ul><TextLink className={s.memberLink} href={`${basePath}/subscribers?plan=${plan.id}`}>가입자 {model.subscribers.filter(subscriber=>subscriber.planId===plan.id&&subscriber.status!=='expired'&&subscriber.joinedAt<=model.now.slice(0,10)&&subscriber.renewAt>=model.now.slice(0,10)).length}명</TextLink><Toggle label="멤버십 활성화" description={plan.active?'프로필에 공개 · 신규 가입 가능':'프로필에서 숨김 · 신규 가입 중단'} checked={plan.active} disabled={task.busy||!plan.active&&model.membershipPartner===false} onChange={()=>{task.clear();setToggleId(plan.id);}}/><div className={s.planActions}><Action variant="secondary" onClick={()=>open(plan)}>수정</Action>{plan.canDelete===true&&<Action variant="danger" disabled={task.busy} onClick={()=>{task.clear();setDeleteId(plan.id);}}>삭제</Action>}</div></article>)}</div>:<Empty title={filter==='active'?'가입 가능한 멤버십이 없어요':'비활성화한 멤버십이 없어요'} description={model.membershipPartner===false?'파트너 계약을 맺으면 멤버십을 만들어 팬들과 특별한 이야기를 나눌 수 있어요.':'멤버십을 만들어 팬들과 특별한 이야기를 나눠보세요.'}/>}
    <Notice>이미지·가격·레벨·혜택의 변경은 신규 구독에 적용됩니다. 비활성화해도 기존 구독자의 가입 당시 조건과 이용 권한은 유지됩니다.</Notice>
    <Dialog open={!!editing} onClose={close} title={editingPlan?'멤버십 수정':'멤버십 만들기'}><form className={s.dialogBody} onSubmit={save} noValidate><Field label="멤버십 이름" value={name} maxLength={30} onChange={e=>setName(e.target.value)}/><MediaUpload label="멤버십 이미지 · 선택" items={image?[{id:'membership-image',type:'image',url:image}]:[]} max={1} addLabel="사진 추가" onFilesSelect={files=>{if(files[0])return upload(files[0]);}} onRemove={()=>{imageRequest.current++;changeImage('');setImageError('');}} accept={imageUploadAccept} disabled={task.busy} uploading={uploading} error={imageError} hint="JPG·PNG·WebP 50MB까지(자동으로 줄여서 올려요)"/><Field label="월 구독료 (원)" type="number" min="1" step="1" value={price} onChange={e=>setPrice(e.target.value)} hint={membershipPriceHint(Number(price),model.creatorTerms)}/><Field label="멤버십 레벨" type="number" min="1" max="100" step="1" value={rank} onChange={e=>setRank(e.target.value)} hint="높은 레벨은 낮은 레벨 이상 공개 게시물도 볼 수 있습니다. 상품 전용 게시물은 해당 상품 가입자만 볼 수 있습니다."/><BenefitsField label="혜택" value={benefits} onChange={setBenefits} disabled={task.busy} hint="제공할 혜택을 한 항목씩 입력하세요. 필요한 만큼 추가하거나 삭제할 수 있어요."/>{editingPlan&&<Notice>수정한 조건은 앞으로 가입하는 구독자에게 적용됩니다. 기존 구독자의 결제 금액이나 혜택을 자동으로 바꾸지 않습니다.</Notice>}{(error||task.error)&&<p className={s.error} role="alert">{error||task.error}</p>}<DialogActions><Action type="submit" disabled={task.busy||uploading||!membershipReady}>{task.busy?'저장 중…':'저장하기'}</Action></DialogActions></form></Dialog>
    <Dialog open={!!toggling} onClose={()=>{if(!task.busy)setToggleId(null);}} title={toggling?.active?'멤버십을 숨길까요?':'멤버십을 다시 공개할까요?'}><div className={s.dialogBody}><p><strong><MarqueeText text={toggling?.name||''}/></strong> 멤버십을 {toggling?.active?'프로필에서 숨기고 신규 가입을 중단합니다.':'프로필에 공개하고 신규 가입을 다시 받습니다.'}</p><Notice>{toggling?.active?`기존 구독자의 가입 당시 조건과 이용 권한은 유지됩니다. ${model.membershipPartner===false?'다시 공개하려면 파트너 계약(인증 배지)이 필요해요.':'언제든 다시 공개할 수 있습니다.'}`:'현재 조건으로 새 구독을 받습니다. 기존 구독자의 조건은 바뀌지 않습니다.'}</Notice>{task.error&&<p className={s.error} role="alert">{task.error}</p>}<DialogActions><Action variant="secondary" disabled={task.busy} onClick={()=>setToggleId(null)}>취소</Action><Action variant="brand" disabled={task.busy} onClick={()=>toggling&&void task.run(()=>model.actions.setMembershipActive(toggling.id,!toggling.active),()=>setToggleId(null))}>{task.busy?'처리 중…':toggling?.active?'숨기기':'공개하기'}</Action></DialogActions></div></Dialog>
    {deleting&&<TypedConfirmDialog key={deleting.id} title="멤버십을 삭제할까요?" phrase={deleting.name} actionLabel="삭제하기" busyLabel="삭제 중…" busy={task.busy} error={task.error} onCancel={()=>setDeleteId(null)} onConfirm={confirmation=>task.run(()=>model.actions.deleteMembership(deleting.id,confirmation),()=>setDeleteId(null))}><p>멤버십을 판매 목록에서 삭제합니다.</p><Notice>현재 이용 중인 구독자가 없을 때만 삭제할 수 있습니다. 종료된 구독 기록과 가입 당시 조건은 보존됩니다.</Notice></TypedConfirmDialog>}
  </section>;
}

export function SubscriberManagementPage({model,basePath}:Props){
  const [search,setSearch]=useState(''),[plan,setPlan]=useState(model.selectedSubscriberPlanId||''),[status,setStatus]=useState('all'),[selected,setSelected]=useState<string|null>(model.selectedSubscriberId||null);
  useEffect(()=>setSelected(model.selectedSubscriberId||null),[model.selectedSubscriberId]);
  useEffect(()=>setPlan(model.selectedSubscriberPlanId||''),[model.selectedSubscriberPlanId]);
  const detail=model.subscribers.find(subscriber=>subscriber.id===selected),filtered=model.subscribers.filter(subscriber=>(!plan||subscriber.planId===plan)&&(status==='all'||subscriber.status===status)&&`${subscriber.name} ${subscriber.handle}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <section className={s.page}><PageTitle back={<BackButton href={basePath} label="대시보드로 돌아가기"/>}>구독자</PageTitle><p className={s.intro}>함께하는 팬과 가입 당시의 멤버십 조건을 확인하세요.</p><div className={s.subscriberFilters}><label className={s.search}><Icon name="search" width={18} height={18}/><input aria-label="구독자 검색" value={search} onChange={e=>setSearch(e.target.value)} placeholder="사용자명 또는 핸들"/></label><SelectField marquee label="멤버십 필터" hideLabel value={plan} onChange={setPlan} options={[{value:'',label:'모든 멤버십'},...model.memberships.map(item=>({value:item.id,label:item.name}))]} searchable/><SelectField label="구독 상태" hideLabel value={status} onChange={setStatus} options={[{value:'all',label:'모든 상태'},...Object.entries(subscriberStatus).map(([value,label])=>({value,label}))]}/></div>
    <p className={s.count}>총 {filtered.length}명</p>{filtered.length?<div className={s.subscriberList}>{filtered.map(subscriber=><button key={subscriber.id} onClick={()=>setSelected(subscriber.id)}><Avatar creator={subscriber} size={44}/><div><strong><MarqueeText text={subscriber.name}/></strong><MarqueeText text={`@${subscriber.handle}`}/></div><div className={s.subscriberPlan}><strong><MarqueeText text={subscriber.planSnapshot.name}/></strong><span>{money(subscriber.planSnapshot.price)} / 월</span></div><span className={s.subscriberStatus} data-status={subscriber.status}>{subscriberStatus[subscriber.status]}</span><Icon name="chevron" width={16} height={16}/></button>)}</div>:<Empty title="조건에 맞는 구독자가 없어요" description="검색어나 필터를 바꿔 확인해주세요."/>}
    <Dialog open={!!detail} onClose={()=>setSelected(null)} title="구독자 상세">{detail&&<div className={s.dialogBody}><div className={s.detailHead}><Avatar creator={detail} size={64}/><div><h2><MarqueeText text={detail.name}/></h2><MarqueeText text={`@${detail.handle}`}/></div></div><dl className={s.details}><div><dt>가입한 멤버십</dt><dd><MarqueeText text={detail.planSnapshot.name}/>v{detail.planSnapshot.version}</dd></div><div><dt>가입 당시 구독료</dt><dd>{money(detail.planSnapshot.price)} / 월</dd></div><div><dt>구독 상태</dt><dd>{subscriberStatus[detail.status]}</dd></div><div><dt>가입일</dt><dd>{detail.joinedAt}</dd></div><div><dt>{detail.status==='active'?'다음 갱신일':'이용 종료일'}</dt><dd>{detail.renewAt}</dd></div></dl><h3 className={s.smallTitle}>가입 당시 혜택</h3><ul className={s.benefits}>{detail.planSnapshot.benefits.map((benefit,index)=><li key={`${benefit}-${index}`}><Icon name="check" width={15} height={15}/>{benefit}</li>)}</ul><p className={s.muted}>현재 판매 중인 멤버십이 바뀌어도 위 가입 조건은 유지됩니다.</p><DialogActions><Action variant="secondary" onClick={()=>setSelected(null)}>닫기</Action></DialogActions></div>}</Dialog>
  </section>;
}
