'use client';
import {MediaVideo} from '@/components/ui/MediaVideo';


import {DialogActions} from '@/components/ui/DialogActions';
import {useState,useEffect,useRef,type FormEvent} from 'react';
import Link from 'next/link';
import {TextLink} from '@/components/ui/TextLink';
import {SelectField} from '@/components/ui/SelectField';
import {BenefitsField} from '@/components/ui/BenefitsField';
import {ImageUpload} from '@/components/ui/ImageUpload';
import {MediaUpload} from '@/components/ui/MediaUpload';
import {moveItem} from '@/components/ui/media-order';
import {postCommentsAllowed} from '@/lib/crefans/comments';
import {OptionalImage} from '@/components/ui/OptionalImage';
import {Toggle} from '@/components/ui/Toggle';
import {imageUploadAccept,mediaUploadAccept,mediaUploadMaxItems} from '@/lib/design/image-upload';
import type {ApiResult} from '@/types/crefans';
import type {StudioManagementModel,StudioContent,StudioContentStatus,StudioMedia,StudioMembership} from '@/types/crefans-studio-management';
import {Dialog,Field,TextAreaField} from '@/components/ui/Primitives';
import {DataTable,type TableColumn,type TableSort} from '@/components/ui/DataTable';
import {Pagination} from '@/components/ui/Pagination';
import {Action,Avatar,Empty,Notice,PageTitle} from '../ServiceUI';
import Icon from '../Icon';
import type {PostDetailModel} from '../SocialPages';
import {ContentPostPreview} from './ContentPostPreview';
import s from './management.module.css';

type Props={model:StudioManagementModel;basePath:string;id?:string};
type ContentPreviewProps={previewModel?:PostDetailModel;previewCreatorId?:string;/** Studio-wide comment switch from 크리에이터 설정; overrides per-post flags. */commentsGloballyEnabled?:boolean};
const statusLabels={draft:'임시저장',published:'게시됨',scheduled:'예약됨'};
const subscriberStatus={active:'구독 중',cancelled:'갱신 해지',expired:'기간 만료'};
const money=(value:number)=>`₩${value.toLocaleString('ko-KR')}`;
const date=(value:string)=>new Date(value).toLocaleString('ko-KR',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const localDateInput=(value:string|null)=>{if(!value)return '';const parsed=new Date(value);return Number.isNaN(parsed.getTime())?'':new Date(parsed.getTime()-parsed.getTimezoneOffset()*60000).toISOString().slice(0,16);};
function useManagementAction(){
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  async function run(operation:()=>Promise<ApiResult<{message:string;id?:string}>>,done?:(data:{message:string;id?:string})=>void){
    if(busy)return;setBusy(true);setError('');setMessage('');
    try{const response=await operation();if(response.success){setMessage(response.data.message);done?.(response.data);}else setError(response.errorMessage);}
    catch{setError('요청을 처리하지 못했습니다. 다시 시도해주세요.');}finally{setBusy(false);}
  }
  return {busy,error,message,run,clear:()=>{setError('');setMessage('');}};
}
function Status({value}:{value:StudioContentStatus}){return <span className={s.status} data-status={value}>{statusLabels[value]}</span>;}
export function ContentManagementPage({model,basePath,previewModel,previewCreatorId,commentsGloballyEnabled=true}:Props&ContentPreviewProps){
  const [filter,setFilter]=useState<StudioContentStatus|'all'>(model.selectedContentStatus||'all'),[search,setSearch]=useState(''),[previewId,setPreviewId]=useState<string|null>(null),[deleteId,setDeleteId]=useState<string|null>(null);
  const [sort,setSort]=useState<TableSort>(null),[page,setPage]=useState(1),pageSize=10;
  const task=useManagementAction();
  useEffect(()=>setFilter(model.selectedContentStatus||'all'),[model.selectedContentStatus]);
  useEffect(()=>setPage(1),[filter,search]);
  const filtered=model.contents.filter(item=>(filter==='all'||item.status===filter)&&`${item.title} ${item.body}`.toLowerCase().includes(search.trim().toLowerCase()));
  const preview=model.contents.find(item=>item.id===previewId),removing=model.contents.find(item=>item.id===deleteId);
  const planName=(item:StudioContent)=>item.accessLevel?`레벨 ${item.accessLevel} 이상`:item.accessPlanId?`${model.memberships.find(plan=>plan.id===item.accessPlanId)?.name||'멤버십'} 전용`:'전체 공개';
  const when=(item:StudioContent)=>item.status==='scheduled'&&item.scheduledAt?`${date(item.scheduledAt)} 게시 예정`:`${date(item.updatedAt)} 수정`;
  const columns:TableColumn<StudioContent>[]=[
    {key:'title',label:'게시물',sortValue:item=>item.title,render:item=><div className={s.contentCell}>{item.media[0]?.type==='image'?<img src={item.media[0].url} alt=""/>:item.media[0]?.type==='video'?<MediaVideo src={item.media[0].url} muted playsInline preload="metadata" aria-label="동영상"/>:<span className={s.noMedia}><Icon name="card"/></span>}<Link href={`${basePath}/content/${item.id}/edit`}>{item.title}</Link></div>},
    {key:'status',label:'상태',sortValue:item=>statusLabels[item.status],render:item=><span className={s.statusCell}><Status value={item.status}/>{!postCommentsAllowed(commentsGloballyEnabled,item.commentsEnabled)&&<span className={s.status}>댓글 닫힘</span>}</span>},
    {key:'access',label:'공개 범위',sortValue:item=>planName(item),render:item=>planName(item)},
    {key:'date',label:'일시',sortValue:item=>item.status==='scheduled'&&item.scheduledAt?item.scheduledAt:item.updatedAt,render:item=><span className={s.muted}>{when(item)}</span>},
    {key:'actions',label:'관리',render:item=><div className={s.rowActions}><button type="button" onClick={()=>setPreviewId(item.id)}>미리보기</button><TextLink href={`${basePath}/content/${item.id}/edit`}>수정</TextLink><button type="button" className={s.dangerText} disabled={task.busy} onClick={()=>{task.clear();setDeleteId(item.id);}}>삭제</button></div>},
  ];
  return <section className={s.page}><PageTitle action={<Link className={s.primaryLink} href={`${basePath}/content/new`}><Icon name="plus" width={17} height={17}/>게시물 작성</Link>}>게시물</PageTitle><p className={s.intro}>크리에이터의 순간을 기록하고, 팬들에게 전하세요.</p>
    <div className={s.toolbar}><nav className={s.tabs} aria-label="게시 상태">{(['all','published','draft','scheduled'] as const).map(value=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{value==='all'?'전체':statusLabels[value]} <span>{model.contents.filter(item=>value==='all'||item.status===value).length}</span></button>)}</nav><label className={s.search}><Icon name="search" width={18} height={18}/><input aria-label="게시물 검색" value={search} onChange={e=>setSearch(e.target.value)} placeholder="게시물 검색"/></label></div>
    {task.message&&<p className={s.feedback} role="status">{task.message}</p>}{task.error&&!removing&&<p className={s.error} role="alert">{task.error}</p>}
    {filtered.length?<><DataTable rows={filtered} columns={columns} rowKey={item=>item.id} sort={sort} onSortChange={value=>{setSort(value);setPage(1);}} caption="게시물 목록" page={page} pageSize={pageSize}/>{filtered.length>pageSize&&<Pagination page={page} pageSize={pageSize} totalItems={filtered.length} onPageChange={setPage} label="게시물 목록 페이지"/>}</>:<Empty title="게시물이 없어요" description="새 게시물을 작성하거나 검색 조건을 바꿔보세요." action={<TextLink href={`${basePath}/content/new`} className={s.textLink}>첫 게시물 작성하기</TextLink>}/>}
    {model.notice&&<Notice>{model.notice}</Notice>}
    <Dialog open={!!preview} onClose={()=>setPreviewId(null)} title="팬 화면 미리보기">{preview&&<ContentPostPreview content={preview} memberships={model.memberships} model={previewModel} creatorId={previewCreatorId} commentsGloballyEnabled={commentsGloballyEnabled}/>}</Dialog>
    <Dialog open={!!removing} onClose={()=>setDeleteId(null)} title="게시물 삭제"><div className={s.dialogBody}><p><strong>{removing?.title}</strong> 게시물을 삭제할까요?</p><p className={s.muted}>삭제 후에는 목록에서 확인할 수 없습니다.</p>{task.error&&<p className={s.error} role="alert">{task.error}</p>}<DialogActions><Action variant="secondary" onClick={()=>setDeleteId(null)}>취소</Action><Action variant="danger" disabled={task.busy} onClick={()=>removing&&void task.run(()=>model.actions.deleteContent(removing.id),()=>setDeleteId(null))}>삭제하기</Action></DialogActions></div></Dialog>
  </section>;
}

type EditorProps=Props&ContentPreviewProps;
export function ContentEditorPage({model,basePath,id,previewModel,previewCreatorId,commentsGloballyEnabled=true}:EditorProps){
  const content=id?model.contents.find(item=>item.id===id):undefined;
  if(id&&!content)return <Empty title="게시물을 찾을 수 없어요" description="삭제되었거나 접근할 수 없는 게시물입니다." action={<TextLink href={`${basePath}/content`} className={s.textLink}>콘텐츠 목록으로</TextLink>}/>;
  return <ContentEditor key={id||'new'} model={model} basePath={basePath} content={content} previewModel={previewModel} previewCreatorId={previewCreatorId} commentsGloballyEnabled={commentsGloballyEnabled}/>;
}
function ContentEditor({model,basePath,content,previewModel,previewCreatorId,commentsGloballyEnabled=true}:EditorProps&{content?:StudioContent}){
  const [savedId,setSavedId]=useState(content?.id),[title,setTitle]=useState(content?.title||''),[body,setBody]=useState(content?.body||''),[media,setMedia]=useState<StudioMedia[]>(content?.media||[]),[commentsEnabled,setCommentsEnabled]=useState(content?.commentsEnabled??true),[access,setAccess]=useState(content?.accessLevel?`level:${content.accessLevel}`:content?.accessPlanId||''),[scheduledAt,setScheduledAt]=useState(localDateInput(content?.scheduledAt||null)),[error,setError]=useState('');
  const [mediaError,setMediaError]=useState(''),[uploading,setUploading]=useState(false);
  const accessLevel=access.startsWith('level:')?Number(access.slice(6)):null,accessPlanId=accessLevel===null?access:'';
  const levels=Array.from(new Set([...model.memberships.map(plan=>plan.rank??1),...(accessLevel?[accessLevel]:[])])).sort((a,b)=>a-b);
  const draftMedia=useRef<string[]>([]),mediaRequest=useRef(0),discard=useRef(model.actions.discardContentMedia);
  discard.current=model.actions.discardContentMedia;
  useEffect(()=>()=>{mediaRequest.current++;draftMedia.current.forEach(url=>discard.current(url));},[]);
  const task=useManagementAction(),current=model.contents.find(item=>item.id===savedId),status=current?.status||'draft';
  function removeMedia(id:string){
    setMedia(previous=>{const item=previous.find(entry=>entry.id===id);if(item&&draftMedia.current.includes(item.url)){discard.current(item.url);draftMedia.current=draftMedia.current.filter(url=>url!==item.url);}return previous.filter(entry=>entry.id!==id);});
    setMediaError('');
  }
  async function upload(files:File[]){
    const request=++mediaRequest.current,room=mediaUploadMaxItems-media.length;
    setMediaError(room<files.length?`미디어는 최대 ${mediaUploadMaxItems}개까지 추가할 수 있어요. ${Math.max(room,0)}개만 추가했어요.`:'');
    if(room<=0)return;
    setUploading(true);
    try{
      for(const file of files.slice(0,room)){
        const result=await model.actions.uploadContentMedia(file);
        if(request!==mediaRequest.current){if(result.success)discard.current(result.data.url);return;}
        if(result.success){draftMedia.current=[...draftMedia.current,result.data.url];setMedia(previous=>[...previous,result.data]);}
        else{setMediaError(result.errorMessage);break;}
      }
    }catch{if(request===mediaRequest.current)setMediaError('미디어를 불러오지 못했어요. 다시 선택해주세요.');}
    finally{if(request===mediaRequest.current)setUploading(false);}
  }
  function save(nextStatus:StudioContentStatus){setError('');if(!title.trim()){setError('제목을 입력해주세요.');return;}if(nextStatus!=='draft'&&!body.trim()){setError('게시할 내용을 입력해주세요.');return;}
    const scheduled=scheduledAt?new Date(scheduledAt):null;
    if(nextStatus==='scheduled'&&(!scheduled||!Number.isFinite(scheduled.getTime())||scheduled.getTime()<=Date.parse(model.now))){setError('예약 시각을 현재보다 미래로 선택해주세요.');return;}
    void task.run(()=>model.actions.saveContent({id:savedId,title,body,media,commentsEnabled,accessPlanId:accessPlanId||null,accessLevel,status:nextStatus,scheduledAt:nextStatus==='scheduled'?scheduled!.toISOString():null}),data=>{if(data.id)setSavedId(data.id);});
  }
  const draft:StudioContent={id:savedId||'',title,body,media,commentsEnabled,accessPlanId:accessPlanId||null,accessLevel,status,scheduledAt:null,updatedAt:model.now};
  return <section className={s.page}><PageTitle action={<TextLink href={`${basePath}/content`} className={s.textLink}>목록으로</TextLink>}>{savedId?'게시물 수정':'게시물 작성'}</PageTitle>
    <div className={s.editorLayout}><div className={s.editorColumn}>
    <div className={s.editorHead}><Status value={status}/></div>
    <form className={s.editor} onSubmit={e=>{e.preventDefault();save(status==='published'?'published':'draft');}}>
      <Field label="제목" value={title} maxLength={120} onChange={e=>setTitle(e.target.value)} placeholder="팬들에게 전할 이야기의 제목"/>
      <TextAreaField label="본문" value={body} rows={12} maxLength={10000} onChange={e=>setBody(e.target.value)} placeholder="나누고 싶은 이야기를 적어주세요."/>
      <MediaUpload label="미디어 · 선택" items={media} max={mediaUploadMaxItems} onFilesSelect={upload} onRemove={removeMedia} onReorder={(from,to)=>setMedia(previous=>moveItem(previous,from,to))} accept={mediaUploadAccept} disabled={task.busy} uploading={uploading} error={mediaError} hint={`JPG·PNG·WebP 5MB, MP4·WebM 300MB · 최대 ${mediaUploadMaxItems}개 · 끌어서 순서 변경`}/>
      <div className={s.editorOptions}><SelectField label="공개 범위" value={access} onChange={setAccess} options={[{value:'',label:'전체 공개'},...levels.map(rank=>({value:`level:${rank}`,label:`레벨 ${rank} 이상`})),...model.memberships.map(plan=>({value:plan.id,label:`${plan.name} 전용${!plan.active?' · 신규 가입 중단':''}`}))]} searchable/>{status!=='published'&&<label className={s.field}>예약 게시 시각<input type="datetime-local" value={scheduledAt} min={localDateInput(model.now)} onChange={e=>setScheduledAt(e.target.value)}/></label>}</div>
      <div className={s.commentOption}><Toggle label="댓글 허용" description={commentsGloballyEnabled?'끄면 이 게시물에서만 댓글을 닫습니다.':'스튜디오 설정에서 댓글 기능이 꺼져 있어 모든 게시물의 댓글이 닫힙니다. 크리에이터 설정에서 먼저 켜 주세요.'} checked={commentsEnabled} disabled={task.busy||!commentsGloballyEnabled} onChange={setCommentsEnabled}/></div>
      {(error||task.error)&&<p className={s.error} role="alert">{error||task.error}</p>}{task.message&&<p className={s.feedback} role="status">{task.message}</p>}
      <div className={s.editorActions}>{status==='published'?<Action type="submit" disabled={task.busy||uploading||!title.trim()||!body.trim()}>수정 저장</Action>:<><Action variant="secondary" type="submit" disabled={task.busy||uploading||!title.trim()}>{status==='scheduled'?'예약 취소 후 임시저장':'임시저장'}</Action><Action variant="secondary" type="button" disabled={task.busy||uploading||!title.trim()||!body.trim()||!scheduledAt} onClick={()=>save('scheduled')}>예약하기</Action><Action variant="brand" type="button" disabled={task.busy||uploading||!title.trim()||!body.trim()} onClick={()=>save('published')}>지금 게시하기</Action></>}</div>
    </form>{model.notice&&<Notice>{model.notice}</Notice>}
    </div>
    <aside className={s.previewPane} aria-label="팬 화면 미리보기"><h2 className={s.previewTitle}>팬 화면 미리보기</h2><ContentPostPreview content={draft} memberships={model.memberships} model={previewModel} creatorId={previewCreatorId} commentsGloballyEnabled={commentsGloballyEnabled}/></aside>
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
  return <section className={s.page}><PageTitle action={<Action onClick={()=>open()}><Icon name="plus" width={17} height={17}/>멤버십 만들기</Action>}>멤버십</PageTitle><p className={s.intro}>팬들에게 전할 혜택과 구독료를 관리하세요.</p><nav className={s.tabs} aria-label="멤버십 상태"><button aria-pressed={filter==='active'} onClick={()=>setFilter('active')}>활성화</button><button aria-pressed={filter==='archived'} onClick={()=>setFilter('archived')}>비활성화</button></nav>
    {task.message&&<p className={s.feedback} role="status">{task.message}</p>}{task.error&&!editing&&!deleting&&<p className={s.error} role="alert">{task.error}</p>}
    {filtered.length?<div className={s.planGrid}>{filtered.map(plan=><article className={s.planCard} key={plan.id}><OptionalImage src={plan.image} alt={`${plan.name} 멤버십`}/><div className={s.planTop}><h2>{plan.name}</h2><span>레벨 {plan.rank??1}</span></div><p className={s.price}>{money(plan.price)}<small> / 월</small></p><ul>{plan.benefits.map((benefit,index)=><li key={`${benefit}-${index}`}><Icon name="check" width={16} height={16}/>{benefit}</li>)}</ul><TextLink className={s.memberLink} href={`${basePath}/subscribers?plan=${plan.id}`}>가입자 {model.subscribers.filter(subscriber=>subscriber.planId===plan.id&&subscriber.status!=='expired'&&subscriber.joinedAt<=model.now.slice(0,10)&&subscriber.renewAt>=model.now.slice(0,10)).length}명</TextLink><Toggle label="멤버십 활성화" description={plan.active?'프로필에 공개 · 신규 가입 가능':'프로필에서 숨김 · 신규 가입 중단'} checked={plan.active} disabled={task.busy} onChange={()=>{task.clear();setToggleId(plan.id);}}/><div className={s.planActions}><Action variant="secondary" onClick={()=>open(plan)}>수정</Action>{plan.canDelete===true&&<Action variant="danger" disabled={task.busy} onClick={()=>{task.clear();setDeleteId(plan.id);}}>삭제</Action>}</div></article>)}</div>:<Empty title={filter==='active'?'가입 가능한 멤버십이 없어요':'비활성화한 멤버십이 없어요'} description="멤버십을 만들어 팬들과 특별한 이야기를 나눠보세요."/>}
    <Notice>이미지·가격·레벨·혜택의 변경은 신규 구독에 적용됩니다. 비활성화해도 기존 구독자의 가입 당시 조건과 이용 권한은 유지됩니다.</Notice>
    <Dialog open={!!editing} onClose={close} title={editingPlan?'멤버십 수정':'멤버십 만들기'}><form className={s.dialogBody} onSubmit={save} noValidate><Field label="멤버십 이름" value={name} maxLength={30} onChange={e=>setName(e.target.value)}/><ImageUpload label="멤버십 이미지 · 선택" image={image} onFileSelect={upload} onRemove={()=>{imageRequest.current++;changeImage('');setImageError('');}} accept={imageUploadAccept} disabled={task.busy} uploading={uploading} error={imageError} hint="JPG·PNG·WebP, 5MB 이하. 이미지가 없으면 텍스트 카드로 표시됩니다."/><Field label="월 구독료 (원)" type="number" min="1" step="1" value={price} onChange={e=>setPrice(e.target.value)}/><Field label="멤버십 레벨" type="number" min="1" max="100" step="1" value={rank} onChange={e=>setRank(e.target.value)} hint="높은 레벨은 낮은 레벨 이상 공개 게시물도 볼 수 있습니다. 상품 전용 게시물은 해당 상품 가입자만 볼 수 있습니다."/><BenefitsField label="혜택" value={benefits} onChange={setBenefits} disabled={task.busy} hint="제공할 혜택을 한 항목씩 입력하세요. 필요한 만큼 추가하거나 삭제할 수 있어요."/>{editingPlan&&<Notice>수정한 조건은 앞으로 가입하는 구독자에게 적용됩니다. 기존 구독자의 결제 금액이나 혜택을 자동으로 바꾸지 않습니다.</Notice>}{(error||task.error)&&<p className={s.error} role="alert">{error||task.error}</p>}<DialogActions><Action type="submit" disabled={task.busy||uploading||!membershipReady}>{task.busy?'저장 중…':'저장하기'}</Action></DialogActions></form></Dialog>
    <Dialog open={!!toggling} onClose={()=>{if(!task.busy)setToggleId(null);}} title={toggling?.active?'멤버십을 숨길까요?':'멤버십을 다시 공개할까요?'}><div className={s.dialogBody}><p><strong>{toggling?.name}</strong> 멤버십을 {toggling?.active?'프로필에서 숨기고 신규 가입을 중단합니다.':'프로필에 공개하고 신규 가입을 다시 받습니다.'}</p><Notice>{toggling?.active?'기존 구독자의 가입 당시 조건과 이용 권한은 유지됩니다. 언제든 다시 공개할 수 있습니다.':'현재 조건으로 새 구독을 받습니다. 기존 구독자의 조건은 바뀌지 않습니다.'}</Notice>{task.error&&<p className={s.error} role="alert">{task.error}</p>}<DialogActions><Action variant="secondary" disabled={task.busy} onClick={()=>setToggleId(null)}>취소</Action><Action variant="brand" disabled={task.busy} onClick={()=>toggling&&void task.run(()=>model.actions.setMembershipActive(toggling.id,!toggling.active),()=>setToggleId(null))}>{task.busy?'처리 중…':toggling?.active?'숨기기':'공개하기'}</Action></DialogActions></div></Dialog>
    <Dialog open={!!deleting} onClose={()=>setDeleteId(null)} title="멤버십을 삭제할까요?"><div className={s.dialogBody}><p><strong>{deleting?.name}</strong> 멤버십을 판매 목록에서 삭제합니다.</p><Notice>현재 이용 중인 구독자가 없을 때만 삭제할 수 있습니다. 종료된 구독 기록과 가입 당시 조건은 보존됩니다.</Notice>{task.error&&<p className={s.error} role="alert">{task.error}</p>}<DialogActions><Action variant="secondary" disabled={task.busy} onClick={()=>setDeleteId(null)}>취소</Action><Action variant="danger" disabled={task.busy} onClick={()=>deleting&&void task.run(()=>model.actions.deleteMembership(deleting.id),()=>setDeleteId(null))}>삭제하기</Action></DialogActions></div></Dialog>
  </section>;
}

export function SubscriberManagementPage({model}:Props){
  const [search,setSearch]=useState(''),[plan,setPlan]=useState(model.selectedSubscriberPlanId||''),[status,setStatus]=useState('all'),[selected,setSelected]=useState<string|null>(model.selectedSubscriberId||null);
  useEffect(()=>setSelected(model.selectedSubscriberId||null),[model.selectedSubscriberId]);
  useEffect(()=>setPlan(model.selectedSubscriberPlanId||''),[model.selectedSubscriberPlanId]);
  const detail=model.subscribers.find(subscriber=>subscriber.id===selected),filtered=model.subscribers.filter(subscriber=>(!plan||subscriber.planId===plan)&&(status==='all'||subscriber.status===status)&&`${subscriber.name} ${subscriber.handle}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <section className={s.page}><PageTitle>구독자</PageTitle><p className={s.intro}>함께하는 팬과 가입 당시의 멤버십 조건을 확인하세요.</p><div className={s.subscriberFilters}><label className={s.search}><Icon name="search" width={18} height={18}/><input aria-label="구독자 검색" value={search} onChange={e=>setSearch(e.target.value)} placeholder="닉네임 또는 사용자 이름"/></label><SelectField label="멤버십 필터" hideLabel value={plan} onChange={setPlan} options={[{value:'',label:'모든 멤버십'},...model.memberships.map(item=>({value:item.id,label:item.name}))]} searchable/><SelectField label="구독 상태" hideLabel value={status} onChange={setStatus} options={[{value:'all',label:'모든 상태'},...Object.entries(subscriberStatus).map(([value,label])=>({value,label}))]}/></div>
    <p className={s.count}>총 {filtered.length}명</p>{filtered.length?<div className={s.subscriberList}>{filtered.map(subscriber=><button key={subscriber.id} onClick={()=>setSelected(subscriber.id)}><Avatar creator={subscriber} size={44}/><div><strong>{subscriber.name}</strong><span>@{subscriber.handle}</span></div><div className={s.subscriberPlan}><strong>{subscriber.planSnapshot.name}</strong><span>{money(subscriber.planSnapshot.price)} / 월</span></div><span className={s.subscriberStatus} data-status={subscriber.status}>{subscriberStatus[subscriber.status]}</span><Icon name="chevron" width={16} height={16}/></button>)}</div>:<Empty title="조건에 맞는 구독자가 없어요" description="검색어나 필터를 바꿔 확인해주세요."/>}
    <Dialog open={!!detail} onClose={()=>setSelected(null)} title="구독자 상세">{detail&&<div className={s.dialogBody}><div className={s.detailHead}><Avatar creator={detail} size={64}/><div><h2>{detail.name}</h2><p>@{detail.handle}</p></div></div><dl className={s.details}><div><dt>가입한 멤버십</dt><dd>{detail.planSnapshot.name} · v{detail.planSnapshot.version}</dd></div><div><dt>가입 당시 구독료</dt><dd>{money(detail.planSnapshot.price)} / 월</dd></div><div><dt>구독 상태</dt><dd>{subscriberStatus[detail.status]}</dd></div><div><dt>가입일</dt><dd>{detail.joinedAt}</dd></div><div><dt>{detail.status==='active'?'다음 갱신일':'이용 종료일'}</dt><dd>{detail.renewAt}</dd></div></dl><h3 className={s.smallTitle}>가입 당시 혜택</h3><ul className={s.benefits}>{detail.planSnapshot.benefits.map((benefit,index)=><li key={`${benefit}-${index}`}><Icon name="check" width={15} height={15}/>{benefit}</li>)}</ul><p className={s.muted}>현재 판매 중인 멤버십이 바뀌어도 위 가입 조건은 유지됩니다.</p><DialogActions><Action variant="secondary" onClick={()=>setSelected(null)}>닫기</Action></DialogActions></div>}</Dialog>
  </section>;
}
