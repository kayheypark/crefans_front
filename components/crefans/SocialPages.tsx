'use client';
import {usePostExposure} from '@/features/post-views/usePostExposure';
import {displayTime} from '@/lib/crefans/display-time';
import {Toast} from '@/components/ui/Toast';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import {TipButton} from './BeanPages';
import {MarqueeText} from '@/components/ui/MarqueeText';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {useDelayedLoading} from '@/components/ui/useDelayedLoading';
import {DelayedInlineSpinner} from '@/components/ui/DelayedSpinner';

import {BackButton} from './BackButton';
import {CreatorName} from './CreatorName';
import {CreatorSearch} from './CreatorSearch';
import {MediaVideo} from '@/components/ui/MediaVideo';


import {DialogActions} from '@/components/ui/DialogActions';
import Link from 'next/link';
import {TextLink} from '@/components/ui/TextLink';
import {useContext,useEffect,useId,useRef,useState,type CSSProperties,type FormEvent,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import {Chip,Dialog} from '@/components/ui/Primitives';
import {getPostMembershipOffer} from '@/lib/crefans/membership-plans';
import {Radio} from '@/components/ui/Choice';
import {reportReasons,type ReportReason} from '@/lib/crefans/report-reasons';
import {ChipRow} from '@/components/ui/ChipRow';
import {CategoryChip} from './CategoryChip';
import type {Post,ServiceData,ServiceViewModel} from '@/types/crefans';
import type {MessagesViewModel,SocialActionResult,SocialComment,SocialReply} from '@/types/crefans-social';
import Icon from './Icon';
import CommentIcon from './CommentIcon';
import {PostViews} from './PostViews';
import {PostShareDialog} from './PostShareDialog';
import {Action,Avatar,Empty,PageTitle} from './ServiceUI';
import {CommentBody,CommentContext,useMentionInput} from './CommentMention';
import {MediaSummary} from './MediaSummary';
import {usePresence} from '@/components/ui/usePresence';
import {designTokens} from '@/lib/design/tokens';
import {MediaOverlay} from './MediaOverlay';
import {CommentComposer,CommentDock,CommentDockProvider} from './CommentComposer';
import {PostMembershipNotice} from './PostMembershipNotice';
import {ServiceFooter} from './ServiceFooter';
import s from './social.module.css';

export type PostCardModel=Pick<ServiceViewModel,'basePath'|'canAccess'|'liked'|'saved'|'toggleLike'|'toggleSave'|'likeCounts'|'commentCounts'>&Partial<Pick<ServiceViewModel,'ownCreatorIds'|'reportPost'|'reportComment'|'mentionCandidates'>>&{data:Pick<ServiceData,'creators'|'plans'|'creatorPlans'>};
type CommentsModel=Pick<PostDetailModel,'commentsByPost'|'addComment'|'loadReplies'|'commentPaging'>&Pick<PostDetailModel,'editComment'|'deleteComment'>&Partial<Pick<ServiceViewModel,'basePath'|'reportComment'|'mentionCandidates'>>&{loadComments?:(postId:string)=>Promise<void>};
type CommentActions={onEdit?:(commentId:string,body:string)=>Promise<SocialActionResult>;onDelete?:(commentId:string)=>Promise<SocialActionResult>};
export type PostDetailModel=PostCardModel&Pick<ServiceViewModel,'commentsByPost'|'addComment'|'loadReplies'|'loadComments'|'commentPaging'|'editComment'|'deleteComment'>&{data:PostCardModel['data']&Pick<ServiceData,'posts'>};

function PostNavigation({href,readOnly,children,className,label}:{href:string;readOnly?:boolean;children:ReactNode;className?:string;label?:string}){
  return readOnly?<span className={className} role="link" aria-disabled="true" aria-label={label}>{children}</span>:<Link href={href} className={className} aria-label={label}>{children}</Link>;
}

/** ··· menu: 신고 · 공유 · 수정(내 게시물). Closes on outside click or Escape; readOnly previews keep it inert. */
function PostMenu({post,model,readOnly=false}:{post:Post;model:PostCardModel;readOnly?:boolean}){
  const [open,setOpen]=useState(false),[sharing,setSharing]=useState(false),[report,setReport]=useState(false),[reason,setReason]=useState<ReportReason|''>(''),[feedback,setFeedback]=useSnackbarMessage(),[pending,setPending]=useState(false);
  const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),menuId=useId();
  const own=!!model.ownCreatorIds?.includes(post.creatorId);
  useEffect(()=>{
    if(!open||typeof document==='undefined')return;
    const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
    document.addEventListener('pointerdown',outside,true);
    return()=>document.removeEventListener('pointerdown',outside,true);
  },[open]);
  useEffect(()=>{if(!feedback)return;const timer=setTimeout(()=>setFeedback(''),2500);return()=>clearTimeout(timer);},[feedback]);
  async function submitReport(){
    if(pending||!reason)return;setPending(true);
    try{const result=model.reportPost?await model.reportPost(post.id,reason):{success:true as const,data:{message:'신고를 접수했어요.'},errorMessage:null,errorCode:null};setFeedback(result.success?result.data.message:result.errorMessage);}
    catch{setFeedback('신고를 접수하지 못했어요. 다시 시도해 주세요.');}
    finally{setPending(false);setReport(false);setReason('');}
  }
  return <div ref={root} className={s.menuRoot} onKeyDown={event=>{if(event.key==='Escape'&&open){event.stopPropagation();setOpen(false);}}}>
    <button ref={trigger} type="button" className={s.more} aria-label={`${post.title} 더보기`} aria-haspopup="menu" aria-expanded={open} aria-controls={open?menuId:undefined} disabled={readOnly} onClick={()=>{if(!readOnly)setOpen(previous=>!previous);}}>···</button>
    {open&&<div id={menuId} role="menu" className={s.menu} aria-label="게시물 메뉴">
      <button type="button" role="menuitem" onClick={()=>{setOpen(false);setReport(true);}}>신고</button>
      <button type="button" role="menuitem" onClick={()=>{trigger.current?.focus();setOpen(false);setSharing(true);}}>공유</button>
      {own&&<Link role="menuitem" href={`${model.basePath}/studio/content/${post.id}/edit`} onClick={()=>setOpen(false)}>수정</Link>}
    </div>}
    <Toast message={feedback} onClose={()=>setFeedback('')}/>
    <PostShareDialog open={sharing} onClose={()=>setSharing(false)} basePath={model.basePath} postId={post.id} title={post.title} previewImage={post.media?.length?(post.media[0].type==='image'?post.media[0].url:undefined):post.image}/>
    <Dialog open={report} onClose={()=>{if(!pending)setReport(false);}} title="게시물을 신고할까요?"><p className={s.dialogCopy}>부적절한 게시물을 신고하면 운영팀이 검토합니다. 신고 내용은 크리에이터에게 공개되지 않습니다.</p><fieldset className={s.reportReasons}><legend>신고 사유</legend>{reportReasons.map(option=><Radio key={option.value} name={`report-${post.id}`} label={option.label} checked={reason===option.value} disabled={pending} onChange={()=>setReason(option.value)}/>)}</fieldset><DialogActions style={{marginTop:16}}><Action variant="secondary" disabled={pending} onClick={()=>setReport(false)}>취소</Action><Action variant="danger" disabled={pending||!reason} onClick={()=>void submitReport()}>{pending?'접수 중...':'신고하기'}</Action></DialogActions></Dialog>
  </div>;
}

function PostHeading({post,model,readOnly=false,backButton}:{post:Post;model:PostCardModel;readOnly?:boolean;backButton?:ReactNode}){
  const creator=model.data.creators.find(item=>item.id===post.creatorId);
  // KRW monthly price of the cheapest on-sale membership that opens this post; memberships are never shown in beans.
  const plans=post.requiredRank>0?getPostMembershipOffer(model.data,post).plans:[],price=plans.length?Math.min(...plans.map(plan=>plan.price)):null;
  return <header className={s.postHeading}>{backButton}<PostNavigation readOnly={readOnly} href={`${model.basePath}/creator/${post.creatorId}`} className={s.identity}>{creator&&<Avatar creator={creator} size={42}/>}<span><strong><CreatorName person={creator||{name:'크리에이터 정보 없음'}}/></strong><small>{displayTime(post.time)} · {post.requiredRank>0?'멤버십 전용':'전체 공개'}{price!==null&&` · 월 ₩${price.toLocaleString('ko-KR')}${plans.length>1?'부터':''}`}</small></span></PostNavigation><PostMenu post={post} model={model} readOnly={readOnly}/></header>;
}

function PostMedia({post,locked,model,readOnly=false,onOpen}:{post:Post;locked:boolean;model:PostCardModel;readOnly?:boolean;onOpen?:(index:number)=>void}){
  const creator=model.data.creators.find(item=>item.id===post.creatorId);
  if(locked)return <PostMembershipNotice key={post.id} post={post} data={model.data} basePath={model.basePath} readOnly={readOnly}/>;
  const alt=`${creator?.name||'크리에이터'}의 ${post.title}`;
  const media=post.media&&post.media.length>0?post.media:post.image?[{type:'image' as const,url:post.image}]:[];
  if(!media.length)return null;
  return <div className={s.mediaWrap}>{post.media&&post.media.length>0?<PostGallery media={post.media} alt={alt} position={post.position} onOpen={onOpen} readOnly={readOnly}/>:<Zoomable onOpen={onOpen?()=>onOpen(0):undefined} label={`${alt} 크게 보기`}><img className={s.postImage} src={post.image} alt={alt} style={{objectPosition:post.position}}/></Zoomable>}<MediaSummary media={media}/></div>;
}

/** My message receipt: one check when sent, two checks with '읽음' once the other side has opened it (2026-11-01). */
function MessageReceipt({read,label}:{read:boolean;label:string}){
  return <span className={s.receipt} data-read={read||undefined}><svg width={read?17:12} height="12" viewBox={read?'0 0 17 12':'0 0 12 12'} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{read?<><path d="M1 6.5 4 9.5 10 2.5"/><path d="M7 9.5 13 2.5"/></>:<path d="M1.5 6.5 4.5 9.5 10.5 2.5"/>}</svg>{label}</span>;
}

/** Images in the feed open the post overlay; videos keep their native controls. */
function Zoomable({onOpen,label,children}:{onOpen?:()=>void;label:string;children:ReactNode}){
  return onOpen?<button type="button" className={s.zoom} aria-label={label} onClick={onOpen}>{children}</button>:<>{children}</>;
}
const galleryDragThreshold=6;
/** Multi-media card gallery: touch swipes natively, the mouse can drag (snapping to the nearest slide on release) or use the arrows; a drag never opens the overlay. */
function PostGallery({media,alt,position,onOpen,readOnly=false}:{media:NonNullable<Post['media']>;alt:string;position:string;onOpen?:(index:number)=>void;readOnly?:boolean}){
  const [index,setIndex]=useState(0),[dragging,setDragging]=useState(false);
  const track=useRef<HTMLDivElement>(null),drag=useRef<{x:number;left:number;moved:boolean}|null>(null),suppress=useRef(false);
  const goTo=(target:number)=>{const node=track.current;if(!node)return;const next=Math.max(0,Math.min(media.length-1,target));node.scrollTo({left:next*node.clientWidth,behavior:'smooth'});setIndex(next);};
  function down(event:ReactPointerEvent<HTMLDivElement>){if(event.pointerType!=='mouse'||event.button!==0||!track.current)return;drag.current={x:event.clientX,left:track.current.scrollLeft,moved:false};track.current.style.scrollSnapType='none';/* mandatory snap would undo every scrollLeft change mid-drag, so pause it synchronously */}
  function move(event:ReactPointerEvent<HTMLDivElement>){const state=drag.current,node=track.current;if(!state||!node)return;const delta=event.clientX-state.x;if(!state.moved){if(Math.abs(delta)<galleryDragThreshold)return;state.moved=true;setDragging(true);}node.scrollLeft=state.left-delta;}
  function up(){const state=drag.current,node=track.current;drag.current=null;if(!node)return;const settled=Math.round(node.scrollLeft/Math.max(1,node.clientWidth));node.style.scrollSnapType='';if(!state?.moved)return;setDragging(false);suppress.current=true;setTimeout(()=>{suppress.current=false;},0);goTo(settled);}
  if(media.length===1)return media[0].type==='video'?<MediaVideo className={s.postImage} src={media[0].url} firstFrame optimizing={media[0].processing} controls playsInline preload="metadata" aria-label={alt}/>:<Zoomable onOpen={onOpen?()=>onOpen(0):undefined} label={`${alt} 크게 보기`}><img className={s.postImage} src={media[0].url} alt={alt} style={{objectPosition:position}}/></Zoomable>;
  return <div className={s.gallery} role="group" aria-label={`${alt} 미디어 ${media.length}개`}>
    <div ref={track} className={s.galleryTrack} data-dragging={dragging||undefined} onScroll={event=>{if(drag.current)return;const node=event.currentTarget;setIndex(Math.round(node.scrollLeft/Math.max(1,node.clientWidth)));}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} onClickCapture={event=>{if(suppress.current){event.preventDefault();event.stopPropagation();}}}>{media.map((item,mediaIndex)=><div key={`${item.url}-${mediaIndex}`} className={s.gallerySlide}>{item.type==='video'?<MediaVideo className={s.postImage} src={item.url} firstFrame optimizing={item.processing} controls playsInline preload="metadata" aria-label={`${alt} 동영상 ${mediaIndex+1}`}/>:<Zoomable onOpen={onOpen?()=>onOpen(mediaIndex):undefined} label={`${alt} ${mediaIndex+1} 크게 보기`}><img className={s.postImage} src={item.url} alt={`${alt} ${mediaIndex+1}`} style={{objectPosition:position}} draggable={false}/></Zoomable>}</div>)}</div>
    {index>0&&<button type="button" className={`${s.galleryNav} ${s.galleryPrevious}`} aria-label="이전 미디어" disabled={readOnly} onClick={()=>goTo(index-1)}><Icon name="chevron"/></button>}
    {index<media.length-1&&<button type="button" className={`${s.galleryNav} ${s.galleryNext}`} aria-label="다음 미디어" disabled={readOnly} onClick={()=>goTo(index+1)}><Icon name="chevron"/></button>}
    <div className={s.galleryDots} aria-hidden="true">{media.map((item,position)=><i key={`${item.url}-${position}`} data-active={position===index||undefined}/>)}</div>
  </div>;
}

function PostActions({post,model,comments=post.comments,readOnly=false,onComments,commentsOpen=false}:{post:Post;model:PostCardModel;comments?:number;readOnly?:boolean;onComments?:()=>void;commentsOpen?:boolean}){
  const {liked,saved,toggleLike,toggleSave}=model;
  const isLiked=liked.includes(post.id),isSaved=saved.includes(post.id);
  // A tip never unlocks a post: locked posts show only their supporter count (server refuses with POST_ACCESS_REQUIRED).
  const locked=!(post.canAccess??model.canAccess(post.creatorId,post.requiredRank,post.requiredPlanId));
  return <div className={s.postActions}><TipButton post={post} creator={model.data.creators.find(c=>c.id===post.creatorId)} creatorId={post.creatorId} name={model.data.creators.find(c=>c.id===post.creatorId)?.name||'크리에이터'} postId={post.id} disabled={readOnly||locked}/><button type="button" disabled={readOnly} onClick={()=>{if(!readOnly)toggleLike(post.id);}} aria-pressed={isLiked} aria-label={isLiked?'좋아요 취소':'좋아요'} className={isLiked?s.liked:''}><Icon name="heart"/>{(model.likeCounts[post.id]??post.likes).toLocaleString()}</button>{post.commentsEnabled===false?<span className={s.commentsClosed} aria-label="댓글 닫힘" title="크리에이터가 댓글을 닫아두었어요"><CommentIcon/>닫힘</span>:onComments?<button type="button" disabled={readOnly} aria-expanded={commentsOpen} aria-controls={`comments-${post.id}`} aria-label={`댓글 ${comments}개 ${commentsOpen?'접기':'펼치기'}`} className={commentsOpen?s.commentsOpen:''} onClick={()=>{if(!readOnly)onComments();}}><CommentIcon/>{comments.toLocaleString()}</button>:<PostNavigation readOnly={readOnly} href={`${model.basePath}/post/${post.id}#comments-${post.id}`} label={`댓글 ${comments}개 보기`}><CommentIcon/>{comments.toLocaleString()}</PostNavigation>}<PostViews count={post.views} postId={post.id}/><button type="button" disabled={readOnly} onClick={()=>{if(!readOnly)toggleSave(post.id);}} aria-pressed={isSaved} aria-label={isSaved?'저장 취소':'게시물 저장'} className={`${s.save} ${isSaved?s.saved:''}`}><Icon name="bookmark" width="21" height="21" strokeWidth="1.6"/></button></div>;
}

/** `context` is the ordered list the card sits in (feed, profile feed); the overlay uses it for 이전/다음 게시물. */
export function PostCard({post,model,context}:{post:Post;model:PostCardModel&Partial<CommentsModel>;context?:Post[]}){
  const exposure=usePostExposure(post.id,model.basePath==='/service'&&!model.ownCreatorIds?.includes(post.creatorId),'feed');
  const {canAccess,basePath}=model,[commentsOpen,setCommentsOpen]=useState(false),[viewer,setViewer]=useState(0),[viewerOpen,setViewerOpen]=useState(false);
  /** The overlay stays mounted through its exit animation, like the Dialog primitive. */
  const viewerPresent=usePresence(viewerOpen,designTokens.motion.fast);
  const locked=!(post.canAccess??canAccess(post.creatorId,post.requiredRank,post.requiredPlanId)),count=model.commentCounts[post.id]??post.comments;
  const inline=model.commentsByPost&&model.addComment&&model.loadReplies?{commentsByPost:model.commentsByPost,addComment:model.addComment,loadReplies:model.loadReplies,loadComments:model.loadComments,commentPaging:model.commentPaging,editComment:model.editComment,deleteComment:model.deleteComment,basePath:model.basePath,reportComment:model.reportComment,mentionCandidates:model.mentionCandidates}:null;
  return <article ref={exposure} className={s.post}><PostHeading post={post} model={model}/><PostMedia post={post} locked={locked} model={model} onOpen={index=>{setViewer(index);setViewerOpen(true);}}/>{viewerPresent&&<PostOverlay post={post} model={model} inline={inline} initialIndex={viewer} context={context} open={viewerOpen} onClose={()=>setViewerOpen(false)}/>}<Link className={s.postCopy} href={`${basePath}/post/${post.id}`}><h2>{post.title}</h2><p>{locked?'멤버십으로 이어지는 조금 더 가까운 이야기.':post.body}</p></Link><PostActions post={post} model={model} comments={count} onComments={inline&&post.commentsEnabled!==false?()=>setCommentsOpen(open=>!open):undefined} commentsOpen={commentsOpen}/>{inline&&commentsOpen&&<div className={s.inlineComments}><CommentsSection post={post} model={inline} count={count} locked={locked} onClose={()=>setCommentsOpen(false)}/></div>}</article>;
}

/** Full-screen post viewer opened from a feed image: large media on the left (dark), author · text · actions · comments on the right (white). */
const overlayDragThreshold=6;
const panelStops=[.5,.22,0],panelModes=['기본 보기','미디어 작게 보기','상세 전체 보기'];
const mediaOf=(post:Post)=>post.media&&post.media.length>0?post.media:post.image?[{type:'image' as const,url:post.image}]:[];
function PostOverlay({post:initialPost,model,inline,initialIndex,context,open,onClose}:{post:Post;model:PostCardModel;inline:CommentsModel|null;initialIndex:number;context?:Post[];open:boolean;onClose:()=>void}){
  const [post,setPost]=useState(initialPost),media=mediaOf(post),count=model.commentCounts[post.id]??post.comments;
  const [index,setIndex]=useState(Math.min(initialIndex,Math.max(0,media.length-1))),[commentsOpen,setCommentsOpen]=useState(false);
  const creator=model.data.creators.find(item=>item.id===post.creatorId);
  const overlay=useRef<HTMLDivElement>(null),panelContentId=useId();
  const exposure=usePostExposure(post.id,open&&model.basePath==='/service'&&!model.ownCreatorIds?.includes(post.creatorId),'detail',true);
  // Start with equal media/detail space on mobile; reopening restores this split.
  const [panelSnap,setPanelSnap]=useState(0),[panelDrag,setPanelDrag]=useState<number|null>(null);
  useEffect(()=>{if(open)setPanelSnap(0);},[open]);
  const [mediaExpanded,setMediaExpanded]=useState(false);
  const panelGesture=useRef<{id:number;x:number;y:number;height:number;start:number;axis:'x'|'y'|null}|null>(null),suppressPanelClick=useRef(false);
  const panelFraction=(y:number,start:NonNullable<typeof panelGesture.current>)=>Math.max(0,Math.min(panelStops[0],start.start+(y-start.y)/start.height));
  const panelStart=(event:ReactPointerEvent<HTMLButtonElement>)=>{
    if(event.isPrimary===false||event.button!==0||!overlay.current||overlay.current.clientWidth>767)return;
    suppressPanelClick.current=false;
    panelGesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,height:Math.max(1,overlay.current.clientHeight),start:panelStops[panelSnap],axis:null};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const panelMove=(event:ReactPointerEvent<HTMLButtonElement>)=>{
    const start=panelGesture.current;if(!start||start.id!==event.pointerId)return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(!start.axis){if(Math.max(Math.abs(dx),Math.abs(dy))<overlayDragThreshold)return;start.axis=Math.abs(dy)>=Math.abs(dx)?'y':'x';suppressPanelClick.current=true;}
    if(start.axis==='y')setPanelDrag(panelFraction(event.clientY,start));
  };
  const panelEnd=(event:ReactPointerEvent<HTMLButtonElement>)=>{
    const start=panelGesture.current;if(!start||start.id!==event.pointerId)return;
    panelGesture.current=null;setPanelDrag(null);
    if(start.axis==='y'){const fraction=panelFraction(event.clientY,start);setPanelSnap(panelStops.reduce((nearest,value,i)=>Math.abs(value-fraction)<Math.abs(panelStops[nearest]-fraction)?i:nearest,0));}
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const panelCancel=()=>{panelGesture.current=null;setPanelDrag(null);};
  const toggleMediaExpanded=()=>{panelCancel();setMediaExpanded(current=>!current);};
  useEffect(()=>{if(typeof window==='undefined')return;window.addEventListener('resize',panelCancel);return()=>window.removeEventListener('resize',panelCancel);},[]);
  /** Neighbours come only from the injected list, skipping posts the fan cannot open in the viewer (locked or without media). */
  const viewable=(context||[]).filter(item=>mediaOf(item).length>0&&(item.canAccess??model.canAccess(item.creatorId,item.requiredRank,item.requiredPlanId)));
  const position=viewable.findIndex(item=>item.id===post.id),previousPost=position>0?viewable[position-1]:undefined,nextPost=position>=0?viewable[position+1]:undefined;
  const jump=(target?:Post)=>{if(!target)return;setPost(target);setIndex(0);setCommentsOpen(false);};
  const alt=`${creator?.name||'크리에이터'}의 ${post.title}`;
  return <MediaOverlay ref={node=>{overlay.current=node;exposure.current=node;}} media={media} title={post.title} alt={alt} index={index} onIndexChange={setIndex} open={open} onClose={onClose} onImageClick={()=>{if(overlay.current&&overlay.current.clientWidth<=767)toggleMediaExpanded();}} data-panel-snap={panelSnap} data-panel-dragging={panelDrag!==null||undefined} data-media-expanded={mediaExpanded||undefined} style={{'--post-media-height':`${mediaExpanded?100:(panelDrag??panelStops[panelSnap])*100}%`} as CSSProperties} stageAction={<button type="button" className={s.mediaExpand} aria-label={mediaExpanded?'미디어 축소':'미디어 확대'} aria-controls={panelContentId} aria-expanded={!mediaExpanded} title={mediaExpanded?'상세 패널 다시 보기':'상세 패널 숨기고 크게 보기'} onPointerDown={event=>event.stopPropagation()} onClick={event=>{event.stopPropagation();toggleMediaExpanded();}}><Icon name={mediaExpanded?'shrink':'expand'}/></button>}>
    <CommentDockProvider viewportRef={overlay}><aside className={s.panel} onClick={event=>event.stopPropagation()}>
      <button type="button" className={s.panelHandle} aria-label={`상세 패널 크기: ${panelModes[panelSnap]}`} aria-controls={panelContentId} title="위아래로 드래그하거나 눌러 크기 변경" onPointerDown={panelStart} onPointerMove={panelMove} onPointerUp={panelEnd} onPointerCancel={panelCancel} onLostPointerCapture={panelCancel} onClick={event=>{if(event.detail===0||!suppressPanelClick.current)setPanelSnap(current=>(current+1)%panelStops.length);suppressPanelClick.current=false;}} onKeyDown={event=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();setPanelSnap(current=>event.key==='Home'?0:event.key==='End'?2:Math.max(0,Math.min(2,current+(event.key==='ArrowUp'?1:-1))));}}><span aria-hidden="true"/></button>
      <div id={panelContentId} className={s.panelContent}>
      <PostHeading post={post} model={model}/>
      <div className={s.panelBody}><h2>{post.title}</h2><p>{post.body}</p></div>
      <PostActions post={post} model={model} comments={count} onComments={inline&&post.commentsEnabled!==false?()=>setCommentsOpen(open=>!open):undefined} commentsOpen={commentsOpen}/>
      {inline&&<div className={s.inlineComments} hidden={!commentsOpen}><CommentsSection key={post.id} post={post} model={inline} count={count} locked={false} collapsed={!commentsOpen}/></div>}
      {context&&<div className={s.panelNav}><Action variant="secondary" disabled={!previousPost} onClick={()=>jump(previousPost)}><span aria-hidden="true">‹</span>이전 게시물</Action><Action variant="secondary" disabled={!nextPost} onClick={()=>jump(nextPost)}>다음 게시물<span aria-hidden="true">›</span></Action><Action variant="secondary" className={s.panelNavClose} aria-label="갤러리 닫기" onClick={onClose}>닫기</Action></div>}
      </div>
      <CommentDock gallery/>
    </aside></CommentDockProvider>
  </MediaOverlay>;

}

/** Small closing note under the last post so fans know there is nothing further to scroll. */
export function FeedEnd(){return <p className={s.feedEnd} role="status">모두 확인했습니다</p>;}

/** Live category pages come from the model; complete preview collections can be filtered locally. */
export function FeedPage({model}:{model:ServiceViewModel}){
  const {data,basePath}=model;
  const [localCategory,setLocalCategory]=useState('전체');
  const category=model.feedCategory?.value??localCategory,selectCategory=model.feedCategory?.select??setLocalCategory;
  const categories=['전체',...data.categories.filter(item=>item!=='전체')];
  const posts=model.feedCategory||category==='전체'?data.posts:data.posts.filter(post=>data.creators.some(creator=>creator.id===post.creatorId&&creator.tags.includes(category)));
  return <div className={`${s.feed} ${!posts.length&&category==='전체'?s.emptyFeed:''}`}>
    <div className={s.feedToolbar}>
      <CreatorSearch href={`${basePath}/explore`}/>
      <ChipRow label="관심 카테고리" className={s.feedCategories}>{categories.map(item=><CategoryChip key={item} label={item} iconUrl={model.data.categoryIcons?.[item]} selected={category===item} onClick={()=>selectCategory(item)}/>)}</ChipRow>
    </div>
    {posts.length?<>{posts.map(post=><PostCard key={post.id} post={post} model={model} context={posts}/>)}{model.feedPaging?.hasMore?<Action variant="secondary" disabled={model.feedPaging.loading} onClick={()=>void model.feedPaging?.loadMore()}>더 보기<DelayedInlineSpinner loading={!!model.feedPaging.loading}/></Action>:<FeedEnd/>}<ServiceFooter basePath={basePath}/></>:<><Empty title={category==='전체'?'아직 게시물이 없어요':'이 카테고리의 게시물이 없어요'} description={category==='전체'?'마음에 드는 크리에이터를 만나보세요.':'다른 카테고리의 게시물을 확인해 보세요.'} action={category==='전체'?<TextLink className={s.textLink} href={`${basePath}/explore`}>크리에이터 둘러보기</TextLink>:<Action variant="secondary" onClick={()=>selectCategory('전체')}>전체 피드 보기</Action>}/><ServiceFooter basePath={basePath} always/></>}
  </div>;
}

/** Replies stay collapsed until asked for, then load once through the model; a second click only hides them. */
function CommentItem({comment,postId,loadReplies,readOnly,onEdit,onDelete,onReply}:{comment:SocialComment;postId:string;loadReplies:CommentsModel['loadReplies'];readOnly:boolean;onReply?:(body:string)=>Promise<SocialActionResult>}&CommentActions){
  const [replies,setReplies]=useState<SocialReply[]|null>(null),[open,setOpen]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState('');
  const [replying,setReplying]=useState<{name:string;toReply:boolean}|null>(null),[replyDraft,setReplyDraft]=useState(''),[replyBusy,setReplyBusy]=useState(false),[replyError,setReplyError]=useState('');
  // Loading rule: the toggle keeps its label for 1s, then a small spinner beside it; an earlier error stays until the response.
  const count=comment.replyCount||0,slowReplies=useDelayedLoading(loading);
  async function toggle(){
    if(readOnly||loading)return;
    if(replies){setOpen(previous=>!previous);return;}
    setLoading(true);
    try{const result=await loadReplies(postId,comment.id);if(result.success){setError('');setReplies(result.data);setOpen(true);}else setError(result.errorMessage);}
    catch{setError('답글을 불러오지 못했어요. 다시 시도해 주세요.');}
    finally{setLoading(false);}
  }
  // After changing one of the replies, reload them so the thread shows the server's current state.
  const refreshReplies=async()=>{const result=await loadReplies(postId,comment.id);if(result.success)setReplies(result.data);};
  const replyActions:CommentActions={onEdit:onEdit&&(async(id,body)=>{const r=await onEdit(id,body);if(r.success)await refreshReplies();return r;}),onDelete:onDelete&&(async id=>{const r=await onDelete(id);if(r.success)await refreshReplies();return r;})};
  // 답글 달기: the input opens under this comment; answering a reply stays in this thread (the API keeps one depth) and starts with "@이름 ".
  // A deleted parent takes no new replies (INVALID_PARENT), so its replies get no button either.
  const canReply=!!onReply&&!readOnly&&!comment.deleted;
  const replyMention=useMentionInput(replyDraft,setReplyDraft);
  const startReply=(name:string,toReply:boolean)=>{setReplying({name,toReply});setReplyDraft(toReply?`@${name} `:'');setReplyError('');};
  const closeReply=()=>{setReplying(null);setReplyDraft('');setReplyError('');};
  async function sendReply(event:FormEvent){
    event.preventDefault();const body=replyDraft.trim();if(replyBusy||!onReply)return;if(!body){setReplyError('답글 내용을 입력해 주세요.');return;}
    setReplyBusy(true);setReplyError('');
    try{const result=await onReply(body);if(!result.success){setReplyError(result.errorMessage);return;}setReplyDraft('');setReplying(null);const list=await loadReplies(postId,comment.id);if(list.success){setReplies(list.data);setOpen(true);}}
    catch{setReplyError('답글을 등록하지 못했어요. 다시 시도해 주세요.');}
    finally{setReplyBusy(false);}
  }
  const replyButton=(name:string,toReply:boolean)=>canReply&&!replying?<button type="button" className={s.commentReplyAction} aria-label={`${name}님 ${toReply?'답글':'댓글'}에 답글 달기`} onClick={()=>startReply(name,toReply)}>답글 달기</button>:null;
  const replyForm=replying&&<form className={`${s.commentEdit} ${s.replyForm}`} onSubmit={event=>void sendReply(event)}><div className={s.mentionField}><textarea ref={replyMention.ref} {...replyMention.fieldProps} aria-label="답글 쓰기" placeholder={`${replying.name}님에게 답글`} value={replyDraft} maxLength={1000} disabled={replyBusy} autoFocus onFocus={event=>{const end=event.currentTarget.value.length;event.currentTarget.setSelectionRange(end,end);}} onChange={replyMention.change}/>{replyMention.list}</div><div className={s.commentEditActions}><Action type="button" variant="secondary" disabled={replyBusy} onClick={closeReply}>취소</Action><Action type="submit" disabled={replyBusy||!replyDraft.trim()}>{replyBusy?'등록 중…':'등록'}</Action></div>{replyError&&<p className={s.error} role="alert">{replyError}</p>}</form>;
  return <div className={s.thread}><CommentRow comment={comment} size={36} readOnly={readOnly} onEdit={onEdit} onDelete={onDelete} extra={replyButton(comment.author.name,false)}/>
    {replying&&!replying.toReply&&replyForm}
    {count>0&&<button type="button" className={s.repliesToggle} aria-expanded={open} disabled={readOnly||loading} onClick={()=>void toggle()}>{open?'답글 숨기기':`답글 ${count}개 보기`}</button>}{slowReplies&&<LoadingSpinner inline/>}
    {error&&<p className={s.error} role="alert">{error}</p>}
    {open&&replies&&<div className={s.replies}>{replies.map(reply=><CommentRow comment={reply} size={28} key={reply.id} readOnly={readOnly} extra={replyButton(reply.author.name,true)} {...replyActions}/>)}</div>}
    {replying?.toReply&&replyForm}
  </div>;
}
/** One comment or reply; the post author's own rows are tinted and badged "작성자" at every depth (anyone who posts, not only creators). */
/** The viewer's own rows offer 수정·삭제; edited rows say "수정됨"; a deleted comment kept for its replies reads "삭제된 댓글입니다." */
function CommentRow({comment,size,readOnly=false,onEdit,onDelete,extra}:{comment:SocialReply;size:number;readOnly?:boolean;extra?:ReactNode}&CommentActions){
  const [editing,setEditing]=useState(false),[draft,setDraft]=useState(comment.body),[confirming,setConfirming]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const {onReport}=useContext(CommentContext),[reporting,setReporting]=useState(false),[reason,setReason]=useState<ReportReason|''>(''),[feedback,setFeedback]=useSnackbarMessage();
  const editMention=useMentionInput(draft,setDraft);
  if(comment.deleted)return <div className={s.comment} data-deleted="true"><div><p className={s.deletedComment}>삭제된 댓글입니다.</p></div></div>;
  async function run(task:()=>Promise<SocialActionResult>,done:()=>void){if(busy)return;setBusy(true);setError('');try{const r=await task();if(r.success)done();else setError(r.errorMessage);}catch{setError('처리하지 못했어요. 다시 시도해 주세요.');}finally{setBusy(false);}}
  const canChange=comment.own&&!readOnly&&!!onEdit&&!!onDelete,canReport=!comment.own&&!readOnly&&!!onReport;
  async function report(){if(busy||!reason||!onReport)return;setBusy(true);try{const r=await onReport(comment.id,reason);setFeedback(r.success?r.data.message:r.errorMessage);}catch{setFeedback('신고를 접수하지 못했어요. 다시 시도해 주세요.');}finally{setBusy(false);setReporting(false);setReason('');}}
  return <div className={s.comment} data-creator={comment.fromCreator||undefined}><Avatar creator={comment.author} size={size}/><div><strong><CreatorName person={comment.author}/>{comment.fromCreator&&<span className={s.creatorBadge}>작성자</span>}</strong>
    {editing?<form className={s.commentEdit} onSubmit={event=>{event.preventDefault();const body=draft.trim();if(!body){setError('댓글 내용을 입력해 주세요.');return;}void run(()=>onEdit!(comment.id,body),()=>setEditing(false));}}><div className={s.mentionField}><textarea ref={editMention.ref} {...editMention.fieldProps} aria-label="댓글 수정" value={draft} maxLength={1000} disabled={busy} onChange={editMention.change}/>{editMention.list}</div><div className={s.commentEditActions}><Action type="button" variant="secondary" disabled={busy} onClick={()=>{setEditing(false);setDraft(comment.body);setError('');}}>취소</Action><Action type="submit" disabled={busy||!draft.trim()}>{busy?'저장 중…':'저장'}</Action></div></form>:<CommentBody body={comment.body} mentions={comment.mentions}/>}
    <small>{displayTime(comment.time)}{comment.edited&&<span className={s.editedMark}> · 수정됨</span>}{!editing&&extra}{canChange&&!editing&&<span className={s.commentOwnActions}><button type="button" onClick={()=>{setDraft(comment.body);setEditing(true);setError('');}}>수정</button><button type="button" onClick={()=>{setConfirming(true);setError('');}}>삭제</button></span>}{canReport&&!editing&&<span className={s.commentOwnActions}><button type="button" aria-label={`${comment.author.name}님 댓글 신고`} onClick={()=>setReporting(true)}>신고</button></span>}</small>
    {error&&<p className={s.error} role="alert">{error}</p>}
    <Toast message={feedback} onClose={()=>setFeedback('')}/>
    {canReport&&<Dialog open={reporting} onClose={()=>{if(!busy)setReporting(false);}} title="댓글을 신고할까요?"><p className={s.dialogCopy}>운영팀이 검토해 필요하면 댓글을 숨깁니다. 신고한 사람은 작성자에게 공개되지 않습니다.</p><fieldset className={s.reportReasons}><legend>신고 사유</legend>{reportReasons.map(option=><Radio key={option.value} name={`report-comment-${comment.id}`} label={option.label} checked={reason===option.value} disabled={busy} onChange={()=>setReason(option.value)}/>)}</fieldset><DialogActions style={{marginTop:16}}><Action variant="secondary" disabled={busy} onClick={()=>setReporting(false)}>취소</Action><Action variant="danger" disabled={busy||!reason} onClick={()=>void report()}>{busy?'접수 중...':'신고하기'}</Action></DialogActions></Dialog>}
    <Dialog open={confirming} onClose={()=>{if(!busy)setConfirming(false);}} title="댓글을 삭제할까요?"><p className={s.dialogCopy}>삭제한 댓글은 되돌릴 수 없어요. 답글이 있으면 "삭제된 댓글입니다."로 표시돼요.</p><DialogActions style={{marginTop:16}}><Action variant="secondary" disabled={busy} onClick={()=>setConfirming(false)}>취소</Action><Action variant="danger" disabled={busy} onClick={()=>void run(()=>onDelete!(comment.id),()=>setConfirming(false))}>{busy?'삭제 중…':'삭제'}</Action></DialogActions></Dialog>
  </div></div>;
}
const COMMENT_PAGE=10;
/** Shared by the detail page and the inline feed card so comments behave the same wherever they open. */
export function CommentsSection({post,model,count,locked,readOnly=false,collapsed=false,onClose}:{post:Post;model:CommentsModel;count:number;locked:boolean;readOnly?:boolean;collapsed?:boolean;onClose?:()=>void}){
  // Keep the gallery composer mounted for its mobile portal; fetch the list only when expanded.
  useEffect(()=>{if(!collapsed&&!locked&&!readOnly&&post.commentsEnabled!==false)void model.loadComments?.(post.id);},[post.id,collapsed,locked,readOnly,post.commentsEnabled,model.loadComments]);
  const id=post.id,{commentsByPost,addComment,loadReplies}=model;
  const actions:CommentActions={onEdit:model.editComment&&((commentId,body)=>model.editComment!(id,commentId,body)),onDelete:model.deleteComment&&(commentId=>model.deleteComment!(id,commentId))};
  const [draft,setDraft]=useState(''),[error,setError]=useState(''),[submitting,setSubmitting]=useState(false),[visible,setVisible]=useState(COMMENT_PAGE);
  useEffect(()=>{setDraft('');setError('');setVisible(COMMENT_PAGE);},[id]);
  const comments=commentsByPost[id]||[],paging=model.commentPaging?.[id];
  // Loading rule: before the first comments response (or while an empty list reloads) nothing for 1s, then a spinner; '댓글이 없습니다' only after the response.
  const commentsPending=!!model.loadComments&&!collapsed&&!locked&&!readOnly&&(!paging||paging.loading),slowComments=useDelayedLoading(commentsPending);
  async function submit(event:FormEvent){
    event.preventDefault();if(submitting||readOnly)return;if(!draft.trim()){setError('댓글 내용을 입력해 주세요.');return;}if(locked)return;
    setSubmitting(true);setError('');
    try{const result=await addComment(id,draft.trim());if(result.success)setDraft('');else setError(result.errorMessage);}catch{setError('댓글을 등록하지 못했어요. 다시 시도해 주세요.');}finally{setSubmitting(false);}
  }
  if(post.commentsEnabled===false)return <section className={s.comments} id={`comments-${id}`}><h2>댓글</h2><div className={s.commentLocked}><Icon name="lock" width={19} height={19}/>크리에이터가 이 게시물의 댓글을 닫아두었어요.</div></section>;
  const context={basePath:model.basePath,mentionCandidates:model.mentionCandidates&&!readOnly?()=>model.mentionCandidates!(id):undefined,onReport:model.reportComment};
  return <CommentContext.Provider value={context}><section className={s.comments} id={`comments-${id}`}><h2>댓글 <span>{count}</span></h2>{locked?<div className={s.commentLocked}><Icon name="lock" width={19} height={19}/>멤버십 가입 후 댓글을 볼 수 있어요.</div>:<>{comments.slice(0,visible).map(comment=><CommentItem comment={comment} postId={id} loadReplies={loadReplies} readOnly={readOnly} key={comment.id} {...actions} onReply={body=>addComment(id,body,comment.id)}/>)}{(comments.length>visible||paging?.hasMore)&&<button type="button" className={s.moreComments} disabled={readOnly||paging?.loading} onClick={()=>{if(paging?.hasMore&&comments.length<=visible)void paging.loadMore();setVisible(previous=>previous+COMMENT_PAGE);}}>{`댓글 ${paging?COMMENT_PAGE:Math.min(COMMENT_PAGE,comments.length-visible)}개 더 보기 `}<DelayedInlineSpinner loading={!!paging?.loading}/>{!paging&&<span>{`· ${comments.length-visible}개 남음`}</span>}</button>}{comments.length===0&&(commentsPending?(slowComments&&<LoadingSpinner/>):<p className={s.noResults}>댓글이 없습니다</p>)}<CommentComposer postId={id} title={post.title} value={draft} error={error} pending={submitting} readOnly={readOnly} onChange={value=>{setDraft(value);setError('');}} onSubmit={submit} onClose={onClose}/></>}</section></CommentContext.Provider>;
}

export function PostDetailPage({id,model,forceLocked=false,readOnly=false}:{id:string;model:PostDetailModel;forceLocked?:boolean;readOnly?:boolean}){
  const {canAccess,data,basePath,commentCounts}=model;
  const post=data.posts.find(item=>item.id===id);
  const exposure=usePostExposure(id,!!post&&!readOnly&&basePath==='/service'&&!model.ownCreatorIds?.includes(post.creatorId),'detail');
  const locked=!post||(forceLocked&&(post.requiredRank>0||!!post.requiredPlanId))||!(post.canAccess??canAccess(post.creatorId,post.requiredRank,post.requiredPlanId));
  const [viewer,setViewer]=useState({postId:'',index:0,open:false});
  const viewerOpen=viewer.postId===id&&viewer.open&&!locked&&!readOnly;
  const viewerPresent=usePresence(viewerOpen,designTokens.motion.fast);
  useEffect(()=>{setViewer(current=>current.postId?{...current,postId:'',open:false}:current);},[id,locked,readOnly]);
  const back=readOnly?null:<BackButton href={`${basePath}/feed`} label="피드로 돌아가기"/>;
  if(!post)return <div className={s.feed}>{back&&<div className={s.back}>{back}</div>}<Empty title="게시물을 찾을 수 없어요"/></div>;
  const count=commentCounts[id]??post.comments;
  return <div className={s.feed} data-post-detail><article ref={exposure} className={s.post}><PostHeading post={post} model={model} readOnly={readOnly} backButton={back}/><PostMedia post={post} locked={locked} model={model} readOnly={readOnly} onOpen={!locked&&!readOnly?index=>setViewer({postId:id,index,open:true}):undefined}/>{viewerPresent&&viewer.postId===id&&!locked&&!readOnly&&<PostOverlay key={id} post={post} model={model} inline={model} initialIndex={viewer.index} open={viewerOpen} onClose={()=>setViewer(current=>({...current,open:false}))}/>}<div className={s.postCopy}><h1>{post.title}</h1><p>{locked?'멤버십 전용 게시물이에요. 이용 가능한 멤버십을 확인해 주세요.':post.body}</p></div><PostActions post={post} model={model} comments={count} readOnly={readOnly}/></article><CommentsSection post={post} model={model} count={count} locked={locked} readOnly={readOnly}/></div>;
}

export function MessagesPage({model,back}:{model:MessagesViewModel;back?:ReactNode}){
  const {data,messagesByCreator,blockedCreatorIds,basePath}=model;
  const [selected,setSelected]=useState<string|null>(null),[roomOpen,setRoomOpen]=useState(false),[query,setQuery]=useState('');
  const [drafts,setDrafts]=useState<Record<string,string>>({});
  const [dialog,setDialog]=useState<'report'|'block'|null>(null),[feedback,setFeedback]=useSnackbarMessage(),[error,setError]=useState(''),[pending,setPending]=useState(false);
  const roomRef=useRef<HTMLDivElement>(null),activeIdRef=useRef<string|null>(null);
  const allContacts=data.creators.filter(item=>Object.hasOwn(messagesByCreator,item.id));
  const activeId=allContacts.some(item=>item.id===selected)?selected:(allContacts[0]?.id||null);
  const creator=allContacts.find(item=>item.id===activeId),conversation=activeId?messagesByCreator[activeId]||[]:[],isBlocked=!!activeId&&blockedCreatorIds.includes(activeId);
  const draft=activeId?drafts[activeId]||'':'';
  activeIdRef.current=activeId;
  useEffect(()=>{if(roomRef.current)roomRef.current.scrollTop=roomRef.current.scrollHeight;},[activeId,conversation.length]);
  const unreadIds=JSON.stringify(conversation.filter(message=>!message.mine&&message.unread).slice(0,100).map(message=>message.id));
  const readRef=useRef(model.markConversationRead);readRef.current=model.markConversationRead;
  useEffect(()=>{
    if(!activeId||unreadIds==='[]'||!readRef.current)return;
    const media=window.matchMedia('(max-width:767px)');let requested=false,live=true;
    const markVisible=()=>{if(requested||document.visibilityState!=='visible'||(!roomOpen&&media.matches))return;requested=true;void readRef.current!(activeId,JSON.parse(unreadIds)).then(result=>{if(live&&!result.success)setError(result.errorMessage);}).catch(()=>{if(live)setError('읽음 상태를 저장하지 못했어요. 다시 대화를 열어주세요.');});};
    markVisible();media.addEventListener('change',markVisible);document.addEventListener('visibilitychange',markVisible);
    return()=>{live=false;media.removeEventListener('change',markVisible);document.removeEventListener('visibilitychange',markVisible);};
  },[activeId,roomOpen,unreadIds]);
  function select(id:string){setSelected(id);setRoomOpen(true);setFeedback('');setError('');}
  async function send(event:FormEvent){
    event.preventDefault();if(pending||!activeId)return;if(!draft.trim()){setError('메시지를 입력해 주세요.');return;}if(isBlocked)return;
    const sendingId=activeId;setPending(true);setError('');
    try{const result=await model.sendMessage(sendingId,draft.trim());if(result.success)setDrafts(previous=>({...previous,[sendingId]:''}));else if(activeIdRef.current===sendingId)setError(result.errorMessage);}catch{if(activeIdRef.current===sendingId)setError('메시지를 보내지 못했어요. 다시 시도해 주세요.');}finally{setPending(false);}
  }
  async function perform(action:()=>Promise<SocialActionResult>){
    if(pending)return;setPending(true);setError('');const actingId=activeId;
    try{const result=await action();if(activeIdRef.current===actingId){if(result.success){setFeedback(result.data.message);setDialog(null);}else setError(result.errorMessage);}}catch{if(activeIdRef.current===actingId)setError('요청을 처리하지 못했어요. 다시 시도해 주세요.');}finally{setPending(false);}
  }
  function confirm(){if(!activeId)return;const id=activeId;void perform(()=>dialog==='block'?model.setConversationBlocked(id,true):model.reportConversation(id));}
  const contacts=allContacts.filter(item=>item.name.includes(query.trim()));
  return <div className={s.messages} data-room-open={roomOpen} data-pull-refresh-block={roomOpen||pending||Object.values(drafts).some(value=>value.trim())||undefined}><aside className={s.conversationList}>{back?<div className={s.listTitle}>{back}<h1>메시지</h1></div>:<h1>메시지</h1>}<label className={s.search}><Icon name="search" width={18} height={18}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="대화 검색" aria-label="대화 검색"/></label><div className={s.contacts} data-pull-refresh-scroll>{contacts.map(contact=>{const last=messagesByCreator[contact.id]?.at(-1),unread=messagesByCreator[contact.id]?.some(message=>!message.mine&&message.unread);return <button type="button" key={contact.id} className={s.contact} data-unread={unread||undefined} data-selected={activeId===contact.id} aria-pressed={activeId===contact.id} onClick={()=>select(contact.id)}><Avatar creator={contact} size={43}/><span><strong><CreatorName person={contact}/></strong><small>{blockedCreatorIds.includes(contact.id)?'차단한 사용자':last?.body}</small></span><time>{displayTime(last?.time)}</time>{unread&&<i className={s.unreadDot} aria-label="읽지 않음"/>}</button>;})}{contacts.length===0&&(query?<Empty title="검색한 대화가 없어요" description="다른 이름으로 검색해 보세요."/>:<Empty title="아직 대화가 없어요" description="새로운 대화가 시작되면 이곳에서 확인할 수 있어요."/>)}</div></aside>{creator&&activeId?<section className={s.room} aria-label={`${creator.name}님과의 대화`}><header className={s.roomHeading}><BackButton className={s.mobileBack} label="대화 목록으로" onClick={()=>setRoomOpen(false)}/><Link className={s.identity} href={model.contactHref?.(creator.id)||`${basePath}/creator/${creator.id}`}><Avatar creator={creator} size={40}/><span><strong><CreatorName person={creator}/></strong><small>{isBlocked?'차단됨':model.contactRoleLabel||'크리에이터'}</small></span></Link><details className={s.roomMenu}><summary aria-label="대화 옵션">···</summary><div><button type="button" disabled={pending} onClick={event=>{event.currentTarget.closest('details')?.removeAttribute('open');setDialog('report');}}>신고하기</button>{isBlocked?<button type="button" disabled={pending} onClick={()=>void perform(()=>model.setConversationBlocked(activeId,false))}>차단 해제</button>:<button type="button" disabled={pending} onClick={event=>{event.currentTarget.closest('details')?.removeAttribute('open');setDialog('block');}}>차단하기</button>}</div></details></header><div className={s.messageScroll} ref={roomRef}>{model.conversationLabels[activeId]&&<span className={s.day}>{model.conversationLabels[activeId]}</span>}{conversation.map(message=><div className={s.message} data-mine={message.mine} key={message.id}><p>{message.body}</p><small>{message.mine?<><MessageReceipt read={!!message.read} label={message.read?'읽음':message.statusLabel||'전송됨'}/> · </>:message.statusLabel?`${message.statusLabel} · `:''}{displayTime(message.time)}</small></div>)}</div><Toast message={feedback} onClose={()=>setFeedback('')}/>{error&&!dialog&&<p className={s.error} id="message-error" role="alert">{error}</p>}{isBlocked?<div className={s.blocked}>차단한 사용자에게 메시지를 보낼 수 없어요.</div>:<form className={s.messageForm} onSubmit={send}><label className={s.srOnly} htmlFor="message-draft">메시지 입력</label><input id="message-draft" value={draft} disabled={pending} onChange={event=>{setDrafts(previous=>({...previous,[activeId]:event.target.value}));setError('');}} placeholder="메시지를 입력하세요..." maxLength={2000} aria-invalid={!!error} aria-describedby={error?'message-error':undefined}/><button type="submit" disabled={!draft.trim()||pending} aria-label="메시지 보내기"><Icon name="arrowUp" width={20} height={20}/></button></form>}</section>:<section className={s.room}><Empty title="아직 대화가 없어요" description="새로운 대화가 시작되면 이곳에서 확인할 수 있어요."/></section>}<Dialog open={!!dialog} onClose={()=>{if(!pending)setDialog(null);}} title={dialog==='block'?`${creator?.name||'사용자'}님을 차단할까요?`:'대화 신고'}><p className={s.dialogCopy}>{dialog==='block'?model.socialCopy.blockDescription:model.socialCopy.reportDescription}</p>{error&&<p className={s.error} role="alert">{error}</p>}<DialogActions><Action variant="secondary" disabled={pending} onClick={()=>setDialog(null)}>취소</Action><Action variant="danger" disabled={pending} onClick={confirm}>{pending?'처리 중...':dialog==='block'?'차단하기':'신고 확인'}</Action></DialogActions></Dialog></div>;
}

export function NotificationsPage({model}:{model:ServiceViewModel}){
  const [filter,setFilter]=useState('전체');
  const {read,markRead,data}=model;
  const visible=data.notifications.filter(item=>filter==='전체'||item.type===filter);
  const filters=['전체',...Array.from(new Set(['멤버십','댓글','메시지','새 게시물',...data.notifications.map(item=>item.type)]))].filter(item=>item!=='라이브');
  return <div className={s.notifications}><PageTitle action={<button type="button" className={s.markAll} disabled={data.notifications.every(item=>read.includes(item.id))} onClick={()=>markRead(data.notifications.map(item=>item.id))}>모두 읽음</button>}>알림</PageTitle><ChipRow className={s.notificationFilters} label="알림 분류">{filters.map(item=><Chip key={item} selected={filter===item} onClick={()=>setFilter(item)}>{item}</Chip>)}</ChipRow><div>{visible.map(item=>{const creator=data.creators.find(creator=>creator.id===item.creatorId),unread=!read.includes(item.id);return <Link className={s.notification} data-unread={unread} href={item.href} key={item.id} onClick={()=>markRead([item.id])}>{creator?<Avatar creator={creator} size={43}/>:<span className={s.systemIcon}><Icon name="card" width={21} height={21}/></span>}<span className={s.notificationText}><MarqueeText text={item.text}/><small>{displayTime(item.time)}</small></span>{unread&&<span className={s.unreadDot} aria-label="읽지 않음"/>}<Icon name="chevron" width={16} height={16}/></Link>;})}{visible.length===0&&<Empty title="새로운 알림이 없어요" description="소식이 도착하면 이곳에서 확인할 수 있어요."/>}</div></div>;
}
