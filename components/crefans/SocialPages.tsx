'use client';
import {MediaVideo} from '@/components/ui/MediaVideo';


import {DialogActions} from '@/components/ui/DialogActions';
import Link from 'next/link';
import {TextLink} from '@/components/ui/TextLink';
import {useEffect,useId,useRef,useState,type FormEvent,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import {Chip,Dialog,TextAreaField} from '@/components/ui/Primitives';
import {ChipRow} from '@/components/ui/ChipRow';
import type {Post,ServiceData,ServiceViewModel} from '@/types/crefans';
import type {MessagesViewModel,SocialActionResult,SocialComment,SocialReply} from '@/types/crefans-social';
import Icon from './Icon';
import {Action,Avatar,Empty,PageTitle} from './ServiceUI';
import {ServiceLinks} from './ServiceLinks';
import {CommentMentions} from './CommentMentions';
import {MediaTypeIcon} from '@/components/ui/MediaTypeIcon';
import {usePresence} from '@/components/ui/usePresence';
import {designTokens} from '@/lib/design/tokens';
import s from './social.module.css';

function CommentIcon(){return <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H4l1.5-4A8 8 0 1 1 20 11.5Z"/></svg>;}

export type PostCardModel=Pick<ServiceViewModel,'basePath'|'canAccess'|'liked'|'saved'|'toggleLike'|'toggleSave'|'likeCounts'|'commentCounts'>&Partial<Pick<ServiceViewModel,'ownCreatorIds'|'reportPost'>>&{data:Pick<ServiceData,'creators'|'plans'|'creatorPlans'>};
type CommentsModel=Pick<PostDetailModel,'commentsByPost'|'addComment'|'loadReplies'|'commentPaging'>&{loadComments?:(postId:string)=>Promise<void>};
export type PostDetailModel=PostCardModel&Pick<ServiceViewModel,'commentsByPost'|'addComment'|'loadReplies'|'loadComments'|'commentPaging'>&{data:PostCardModel['data']&Pick<ServiceData,'posts'>};

function PostNavigation({href,readOnly,children,className,label}:{href:string;readOnly?:boolean;children:ReactNode;className?:string;label?:string}){
  return readOnly?<span className={className} role="link" aria-disabled="true" aria-label={label}>{children}</span>:<Link href={href} className={className} aria-label={label}>{children}</Link>;
}

/** ··· menu: 신고 · 공유 · 수정(내 게시물). Closes on outside click or Escape; readOnly previews keep it inert. */
function PostMenu({post,model,readOnly=false}:{post:Post;model:PostCardModel;readOnly?:boolean}){
  const [open,setOpen]=useState(false),[report,setReport]=useState(false),[feedback,setFeedback]=useState(''),[pending,setPending]=useState(false);
  const root=useRef<HTMLDivElement>(null),menuId=useId();
  const own=!!model.ownCreatorIds?.includes(post.creatorId);
  useEffect(()=>{
    if(!open||typeof document==='undefined')return;
    const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
    document.addEventListener('pointerdown',outside,true);
    return()=>document.removeEventListener('pointerdown',outside,true);
  },[open]);
  useEffect(()=>{if(!feedback)return;const timer=setTimeout(()=>setFeedback(''),2500);return()=>clearTimeout(timer);},[feedback]);
  async function share(){
    setOpen(false);
    const url=`${typeof location!=='undefined'?location.origin:''}${model.basePath}/post/${post.id}`;
    try{if(typeof navigator!=='undefined'&&navigator.clipboard){await navigator.clipboard.writeText(url);setFeedback('링크를 복사했어요.');}else setFeedback(url);}
    catch{setFeedback(url);}
  }
  async function submitReport(){
    if(pending)return;setPending(true);
    try{const result=model.reportPost?await model.reportPost(post.id):{success:true as const,data:{message:'신고를 접수했어요.'},errorMessage:null,errorCode:null};setFeedback(result.success?result.data.message:result.errorMessage);}
    catch{setFeedback('신고를 접수하지 못했어요. 다시 시도해 주세요.');}
    finally{setPending(false);setReport(false);}
  }
  return <div ref={root} className={s.menuRoot} onKeyDown={event=>{if(event.key==='Escape'&&open){event.stopPropagation();setOpen(false);}}}>
    <button type="button" className={s.more} aria-label={`${post.title} 더보기`} aria-haspopup="menu" aria-expanded={open} aria-controls={open?menuId:undefined} disabled={readOnly} onClick={()=>{if(!readOnly)setOpen(previous=>!previous);}}>···</button>
    {open&&<div id={menuId} role="menu" className={s.menu} aria-label="게시물 메뉴">
      <button type="button" role="menuitem" onClick={()=>{setOpen(false);setReport(true);}}>신고</button>
      <button type="button" role="menuitem" onClick={()=>void share()}>공유</button>
      {own&&<Link role="menuitem" href={`${model.basePath}/studio/content/${post.id}/edit`} onClick={()=>setOpen(false)}>수정</Link>}
    </div>}
    {feedback&&<span className={s.menuFeedback} role="status">{feedback}</span>}
    <Dialog open={report} onClose={()=>{if(!pending)setReport(false);}} title="게시물을 신고할까요?"><p className={s.dialogCopy}>부적절한 게시물을 신고하면 운영팀이 검토합니다. 신고 내용은 크리에이터에게 공개되지 않습니다.</p><DialogActions style={{marginTop:16}}><Action variant="secondary" disabled={pending} onClick={()=>setReport(false)}>취소</Action><Action variant="danger" disabled={pending} onClick={()=>void submitReport()}>{pending?'접수 중...':'신고하기'}</Action></DialogActions></Dialog>
  </div>;
}

function PostHeading({post,model,readOnly=false}:{post:Post;model:PostCardModel;readOnly?:boolean}){
  const creator=model.data.creators.find(item=>item.id===post.creatorId);
  return <header className={s.postHeading}><PostNavigation readOnly={readOnly} href={`${model.basePath}/creator/${post.creatorId}`} className={s.identity}>{creator&&<Avatar creator={creator} size={42}/>}<span><strong>{creator?.name||'크리에이터 정보 없음'}</strong><small>{post.time} · {post.requiredRank>0?'멤버십 전용':'전체 공개'}</small></span></PostNavigation><PostMenu post={post} model={model} readOnly={readOnly}/></header>;
}

function PostMedia({post,locked,model,readOnly=false,onOpen}:{post:Post;locked:boolean;model:PostCardModel;readOnly?:boolean;onOpen?:(index:number)=>void}){
  const creator=model.data.creators.find(item=>item.id===post.creatorId);
  const plan=(model.data.creatorPlans?.[post.creatorId]||model.data.plans).find(item=>post.requiredPlanId?item.id===post.requiredPlanId:item.rank===post.requiredRank);
  if(locked)return <div className={s.lockedMedia}><Icon name="lock" width={30} height={30}/><strong>멤버십 전용 콘텐츠입니다</strong><p>{post.requiredPlanId?`${plan?.name||'지정된'} 멤버십 전용입니다.`:`레벨 ${post.requiredRank} 이상 멤버십으로 볼 수 있습니다.`}</p><PostNavigation readOnly={readOnly} className={s.subscribe} href={`${model.basePath}/membership/${post.creatorId}`}>멤버십 살펴보기</PostNavigation></div>;
  const alt=`${creator?.name||'크리에이터'}의 ${post.title}`;
  const media=post.media&&post.media.length>0?post.media:post.image?[{type:'image' as const,url:post.image}]:[];
  if(!media.length)return null;
  return <div className={s.mediaWrap}>{post.media&&post.media.length>0?<PostGallery media={post.media} alt={alt} position={post.position} onOpen={onOpen} readOnly={readOnly}/>:<Zoomable onOpen={onOpen?()=>onOpen(0):undefined} label={`${alt} 크게 보기`}><img className={s.postImage} src={post.image} alt={alt} style={{objectPosition:post.position}}/></Zoomable>}<MediaSummary media={media}/></div>;
}

/** Bottom-right glyph counts so fans know how many photos and videos a post holds before opening it. */
function MediaSummary({media}:{media:{type:'image'|'video'}[]}){
  const images=media.filter(item=>item.type==='image').length,videos=media.filter(item=>item.type==='video').length;
  return <span className={s.mediaSummary} aria-label={`사진 ${images}장, 동영상 ${videos}개`}>{images>0&&<span><MediaTypeIcon type="image" size={13}/>{images}</span>}{videos>0&&<span><MediaTypeIcon type="video" size={13}/>{videos}</span>}</span>;
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
  if(media.length===1)return media[0].type==='video'?<MediaVideo className={s.postImage} src={media[0].url} controls playsInline preload="metadata" aria-label={alt}/>:<Zoomable onOpen={onOpen?()=>onOpen(0):undefined} label={`${alt} 크게 보기`}><img className={s.postImage} src={media[0].url} alt={alt} style={{objectPosition:position}}/></Zoomable>;
  return <div className={s.gallery} role="group" aria-label={`${alt} 미디어 ${media.length}개`}>
    <div ref={track} className={s.galleryTrack} data-dragging={dragging||undefined} onScroll={event=>{if(drag.current)return;const node=event.currentTarget;setIndex(Math.round(node.scrollLeft/Math.max(1,node.clientWidth)));}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} onClickCapture={event=>{if(suppress.current){event.preventDefault();event.stopPropagation();}}}>{media.map((item,mediaIndex)=><div key={`${item.url}-${mediaIndex}`} className={s.gallerySlide}>{item.type==='video'?<MediaVideo className={s.postImage} src={item.url} controls playsInline preload="metadata" aria-label={`${alt} 동영상 ${mediaIndex+1}`}/>:<Zoomable onOpen={onOpen?()=>onOpen(mediaIndex):undefined} label={`${alt} ${mediaIndex+1} 크게 보기`}><img className={s.postImage} src={item.url} alt={`${alt} ${mediaIndex+1}`} style={{objectPosition:position}} draggable={false}/></Zoomable>}</div>)}</div>
    {index>0&&<button type="button" className={`${s.galleryNav} ${s.galleryPrevious}`} aria-label="이전 미디어" disabled={readOnly} onClick={()=>goTo(index-1)}><Icon name="chevron"/></button>}
    {index<media.length-1&&<button type="button" className={`${s.galleryNav} ${s.galleryNext}`} aria-label="다음 미디어" disabled={readOnly} onClick={()=>goTo(index+1)}><Icon name="chevron"/></button>}
    <div className={s.galleryDots} aria-hidden="true">{media.map((item,position)=><i key={`${item.url}-${position}`} data-active={position===index||undefined}/>)}</div>
  </div>;
}

function PostActions({post,model,comments=post.comments,readOnly=false,onComments,commentsOpen=false}:{post:Post;model:PostCardModel;comments?:number;readOnly?:boolean;onComments?:()=>void;commentsOpen?:boolean}){
  const {liked,saved,toggleLike,toggleSave}=model;
  const isLiked=liked.includes(post.id),isSaved=saved.includes(post.id);
  return <div className={s.postActions}><button type="button" disabled={readOnly} onClick={()=>{if(!readOnly)toggleLike(post.id);}} aria-pressed={isLiked} aria-label={isLiked?'좋아요 취소':'좋아요'} className={isLiked?s.liked:''}><Icon name="heart"/>{(model.likeCounts[post.id]??post.likes).toLocaleString()}</button>{post.commentsEnabled===false?<span className={s.commentsClosed} aria-label="댓글 닫힘" title="크리에이터가 댓글을 닫아두었어요"><CommentIcon/>닫힘</span>:onComments?<button type="button" disabled={readOnly} aria-expanded={commentsOpen} aria-controls={`comments-${post.id}`} aria-label={`댓글 ${comments}개 ${commentsOpen?'접기':'펼치기'}`} className={commentsOpen?s.commentsOpen:''} onClick={()=>{if(!readOnly)onComments();}}><CommentIcon/>{comments.toLocaleString()}</button>:<PostNavigation readOnly={readOnly} href={`${model.basePath}/post/${post.id}#comments-${post.id}`} label={`댓글 ${comments}개 보기`}><CommentIcon/>{comments.toLocaleString()}</PostNavigation>}<button type="button" disabled={readOnly} onClick={()=>{if(!readOnly)toggleSave(post.id);}} aria-pressed={isSaved} aria-label={isSaved?'저장 취소':'게시물 저장'} className={`${s.save} ${isSaved?s.saved:''}`}><Icon name="bookmark" width="21" height="21" strokeWidth="1.6"/></button></div>;
}

/** `context` is the ordered list the card sits in (feed, profile feed); the overlay uses it for 이전/다음 게시물. */
export function PostCard({post,model,context}:{post:Post;model:PostCardModel&Partial<CommentsModel>;context?:Post[]}){
  const {canAccess,basePath}=model,[commentsOpen,setCommentsOpen]=useState(false),[viewer,setViewer]=useState(0),[viewerOpen,setViewerOpen]=useState(false);
  /** The overlay stays mounted through its exit animation, like the Dialog primitive. */
  const viewerPresent=usePresence(viewerOpen,designTokens.motion.fast);
  const locked=!(post.canAccess??canAccess(post.creatorId,post.requiredRank,post.requiredPlanId)),count=model.commentCounts[post.id]??post.comments;
  const inline=model.commentsByPost&&model.addComment&&model.loadReplies?{commentsByPost:model.commentsByPost,addComment:model.addComment,loadReplies:model.loadReplies,loadComments:model.loadComments,commentPaging:model.commentPaging}:null;
  return <article className={s.post}><PostHeading post={post} model={model}/><PostMedia post={post} locked={locked} model={model} onOpen={index=>{setViewer(index);setViewerOpen(true);}}/>{viewerPresent&&<PostOverlay post={post} model={model} inline={inline} initialIndex={viewer} context={context} open={viewerOpen} onClose={()=>setViewerOpen(false)}/>}<Link className={s.postCopy} href={`${basePath}/post/${post.id}`}><h2>{post.title}</h2><p>{locked?'멤버십으로 이어지는 조금 더 가까운 이야기.':post.body}</p></Link><PostActions post={post} model={model} comments={count} onComments={inline&&post.commentsEnabled!==false?()=>setCommentsOpen(open=>!open):undefined} commentsOpen={commentsOpen}/>{inline&&commentsOpen&&<div className={s.inlineComments}><CommentsSection post={post} model={inline} count={count} locked={locked}/></div>}</article>;
}

/** Full-screen post viewer opened from a feed image: large media on the left (dark), author · text · actions · comments on the right (white). */
const overlaySwipeThreshold=40,overlayDragThreshold=6;
const mediaOf=(post:Post)=>post.media&&post.media.length>0?post.media:post.image?[{type:'image' as const,url:post.image}]:[];
function PostOverlay({post:initialPost,model,inline,initialIndex,context,open,onClose}:{post:Post;model:PostCardModel;inline:CommentsModel|null;initialIndex:number;context?:Post[];open:boolean;onClose:()=>void}){
  const [post,setPost]=useState(initialPost),media=mediaOf(post),count=model.commentCounts[post.id]??post.comments;
  const [index,setIndex]=useState(Math.min(initialIndex,Math.max(0,media.length-1))),[commentsOpen,setCommentsOpen]=useState(false);
  const closeButton=useRef<HTMLButtonElement>(null),creator=model.data.creators.find(item=>item.id===post.creatorId);
  /** Neighbours come only from the injected list, skipping posts the fan cannot open in the viewer (locked or without media). */
  const viewable=(context||[]).filter(item=>mediaOf(item).length>0&&(item.canAccess??model.canAccess(item.creatorId,item.requiredRank,item.requiredPlanId)));
  const position=viewable.findIndex(item=>item.id===post.id),previousPost=position>0?viewable[position-1]:undefined,nextPost=position>=0?viewable[position+1]:undefined;
  const jump=(target?:Post)=>{if(!target)return;setPost(target);setIndex(0);setCommentsOpen(false);};
  /** The stage is a sliding track: the finger/mouse drags it live, release snaps to the neighbour with a transition. Ends clamp (no wrap). Videos keep their controls. */
  const [offset,setOffset]=useState(0),swipe=useRef<{x:number;y:number;axis:'x'|'y'|null}|null>(null);
  const swipeStart=(event:ReactPointerEvent<HTMLDivElement>)=>{if(media.length<2||(event.target as HTMLElement).tagName==='VIDEO')return;swipe.current={x:event.clientX,y:event.clientY,axis:null};};
  const swipeMove=(event:ReactPointerEvent<HTMLDivElement>)=>{const start=swipe.current;if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;if(!start.axis){if(Math.abs(dx)<overlayDragThreshold&&Math.abs(dy)<overlayDragThreshold)return;start.axis=Math.abs(dx)>=Math.abs(dy)?'x':'y';}if(start.axis!=='x')return;const atEdge=(index===0&&dx>0)||(index===media.length-1&&dx<0);setOffset(atEdge?dx/3:dx);};
  const swipeEnd=(event:ReactPointerEvent<HTMLDivElement>)=>{const start=swipe.current;swipe.current=null;setOffset(0);if(!start||start.axis!=='x')return;const dx=event.clientX-start.x;if(Math.abs(dx)<overlaySwipeThreshold)return;if(dx<0)next();else previous();};
  const previous=()=>setIndex(current=>Math.max(0,current-1)),next=()=>setIndex(current=>Math.min(media.length-1,current+1));
  useEffect(()=>{
    if(typeof document==='undefined'||!open)return;
    const keys=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();else if(media.length>1&&event.key==='ArrowLeft')previous();else if(media.length>1&&event.key==='ArrowRight')next();};
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';document.addEventListener('keydown',keys);closeButton.current?.focus();
    return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',keys);};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[media.length,open]);
  const alt=`${creator?.name||'크리에이터'}의 ${post.title}`;
  return <div className={s.overlay} role="dialog" aria-modal="true" aria-label={post.title} data-state={open?'open':'closing'} onClick={onClose}>
    <div className={s.stage} onClick={event=>event.stopPropagation()} onPointerDown={swipeStart} onPointerMove={swipeMove} onPointerUp={swipeEnd} onPointerCancel={()=>{swipe.current=null;setOffset(0);}}>
      <div className={s.stageTrack} data-index={index} data-dragging={offset!==0||undefined} style={{transform:`translateX(calc(${-index*100}% + ${offset}px))`}}>{media.map((item,slide)=><div key={`${item.url}-${slide}`} className={s.stageSlide} aria-hidden={slide!==index||undefined}>{item.type==='video'?<MediaVideo src={item.url} controls={slide===index} playsInline preload="metadata" aria-label={`${alt} 동영상 ${slide+1}`}/>:<img src={item.url} alt={media.length>1?`${alt} ${slide+1}`:alt} draggable={false}/>}</div>)}</div>
      {media.length>1&&<>{index>0&&<button type="button" className={`${s.stageNav} ${s.stagePrevious}`} aria-label="이전 미디어" onClick={previous}><Icon name="chevron"/></button>}{index<media.length-1&&<button type="button" className={`${s.stageNav} ${s.stageNext}`} aria-label="다음 미디어" onClick={next}><Icon name="chevron"/></button>}<div className={`${s.galleryDots} ${s.stageDots}`} aria-hidden="true">{media.map((item,dot)=><i key={`${item.url}-${dot}`} data-active={dot===index||undefined}/>)}</div></>}
      <button type="button" ref={closeButton} className={s.overlayClose} aria-label="닫기" onClick={onClose}>×</button>
    </div>
    <aside className={s.panel} onClick={event=>event.stopPropagation()}>
      <PostHeading post={post} model={model}/>
      <div className={s.panelBody}><h2>{post.title}</h2><p>{post.body}</p></div>
      <PostActions post={post} model={model} comments={count} onComments={inline&&post.commentsEnabled!==false?()=>setCommentsOpen(open=>!open):undefined} commentsOpen={commentsOpen}/>
      {inline&&commentsOpen&&<div className={s.inlineComments}><CommentsSection post={post} model={inline} count={count} locked={false}/></div>}
      {context&&<div className={s.panelNav}><Action variant="secondary" disabled={!previousPost} onClick={()=>jump(previousPost)}>이전 게시물</Action><Action variant="secondary" disabled={!nextPost} onClick={()=>jump(nextPost)}>다음 게시물</Action></div>}
    </aside>
  </div>;
}

/** Small closing note under the last post so fans know there is nothing further to scroll. */
export function FeedEnd(){return <p className={s.feedEnd} role="status">모두 확인했습니다</p>;}

/** No search or 추천/팔로잉 tabs: the backend ranks the feed, the view just renders the posts it receives in order. */
export function FeedPage({model}:{model:ServiceViewModel}){
  const {data,basePath}=model;
  return <div className={`${s.feed} ${data.posts.length?'':s.emptyFeed}`}>{data.posts.length?<>{data.posts.map(post=><PostCard key={post.id} post={post} model={model} context={data.posts}/>)}{model.feedPaging?.hasMore?<Action variant="secondary" disabled={model.feedPaging.loading} onClick={()=>void model.feedPaging?.loadMore()}>{model.feedPaging.loading?'불러오는 중…':'더 보기'}</Action>:<FeedEnd/>}</>:<><Empty title="아직 게시물이 없어요" description="마음에 드는 크리에이터를 만나보세요." action={<TextLink className={s.textLink} href={`${basePath}/explore`}>크리에이터 둘러보기</TextLink>}/><footer className={s.feedFooter}><nav aria-label="서비스 안내"><ServiceLinks basePath={basePath}/></nav></footer></>}</div>;
}

/** Replies stay collapsed until asked for, then load once through the model; a second click only hides them. */
function CommentItem({comment,postId,loadReplies,readOnly}:{comment:SocialComment;postId:string;loadReplies:CommentsModel['loadReplies'];readOnly:boolean}){
  const [replies,setReplies]=useState<SocialReply[]|null>(null),[open,setOpen]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState('');
  const count=comment.replyCount||0;
  async function toggle(){
    if(readOnly||loading)return;
    if(replies){setOpen(previous=>!previous);return;}
    setLoading(true);setError('');
    try{const result=await loadReplies(postId,comment.id);if(result.success){setReplies(result.data);setOpen(true);}else setError(result.errorMessage);}
    catch{setError('답글을 불러오지 못했어요. 다시 시도해 주세요.');}
    finally{setLoading(false);}
  }
  return <div className={s.thread}><CommentRow comment={comment} size={36}/>
    {count>0&&<button type="button" className={s.repliesToggle} aria-expanded={open} disabled={readOnly||loading} onClick={()=>void toggle()}>{loading?'답글 불러오는 중...':open?'답글 숨기기':`답글 ${count}개 보기`}</button>}
    {error&&<p className={s.error} role="alert">{error}</p>}
    {open&&replies&&<div className={s.replies}>{replies.map(reply=><CommentRow comment={reply} size={28} key={reply.id}/>)}</div>}
  </div>;
}
/** One comment or reply; the post author's own rows are tinted and badged "작성자" at every depth (anyone who posts, not only creators). */
function CommentRow({comment,size}:{comment:SocialReply;size:number}){
  return <div className={s.comment} data-creator={comment.fromCreator||undefined}><Avatar creator={comment.author} size={size}/><div><strong>{comment.author.name}{comment.fromCreator&&<span className={s.creatorBadge}>작성자</span>}</strong><CommentMentions mentions={comment.mentions}/><p>{comment.body}</p><small>{comment.time}</small></div></div>;
}
const COMMENT_PAGE=10;
/** Shared by the detail page and the inline feed card so comments behave the same wherever they open. */
export function CommentsSection({post,model,count,locked,readOnly=false}:{post:Post;model:CommentsModel;count:number;locked:boolean;readOnly?:boolean}){
  useEffect(()=>{if(!locked&&!readOnly&&post.commentsEnabled!==false)void model.loadComments?.(post.id);},[post.id,locked,readOnly,post.commentsEnabled,model.loadComments]);
  const id=post.id,{commentsByPost,addComment,loadReplies}=model;
  const [draft,setDraft]=useState(''),[error,setError]=useState(''),[submitting,setSubmitting]=useState(false),[visible,setVisible]=useState(COMMENT_PAGE);
  useEffect(()=>{setDraft('');setError('');setVisible(COMMENT_PAGE);},[id]);
  const comments=commentsByPost[id]||[],paging=model.commentPaging?.[id];
  async function submit(event:FormEvent){
    event.preventDefault();if(submitting||readOnly)return;if(!draft.trim()){setError('댓글 내용을 입력해 주세요.');return;}if(locked)return;
    setSubmitting(true);setError('');
    try{const result=await addComment(id,draft.trim());if(result.success)setDraft('');else setError(result.errorMessage);}catch{setError('댓글을 등록하지 못했어요. 다시 시도해 주세요.');}finally{setSubmitting(false);}
  }
  if(post.commentsEnabled===false)return <section className={s.comments} id={`comments-${id}`}><h2>댓글</h2><div className={s.commentLocked}><Icon name="lock" width={19} height={19}/>크리에이터가 이 게시물의 댓글을 닫아두었어요.</div></section>;
  return <section className={s.comments} id={`comments-${id}`}><h2>댓글 <span>{count}</span></h2>{locked?<div className={s.commentLocked}><Icon name="lock" width={19} height={19}/>멤버십 가입 후 댓글을 볼 수 있어요.</div>:<>{comments.slice(0,visible).map(comment=><CommentItem comment={comment} postId={id} loadReplies={loadReplies} readOnly={readOnly} key={comment.id}/>)}{(comments.length>visible||paging?.hasMore)&&<button type="button" className={s.moreComments} disabled={readOnly||paging?.loading} onClick={()=>{if(paging?.hasMore&&comments.length<=visible)void paging.loadMore();setVisible(previous=>previous+COMMENT_PAGE);}}>{paging?.loading?'댓글 불러오는 중…':`댓글 ${paging?COMMENT_PAGE:Math.min(COMMENT_PAGE,comments.length-visible)}개 더 보기 `}{!paging&&<span>{`· ${comments.length-visible}개 남음`}</span>}</button>}{comments.length===0&&<p className={s.noResults}>{paging?.loading?'댓글 불러오는 중…':'첫 번째 이야기를 남겨보세요.'}</p>}<form onSubmit={submit} className={s.commentForm}><TextAreaField label="댓글 남기기" id={`post-comment-${id}`} value={draft} onChange={event=>{if(!readOnly){setDraft(event.target.value);setError('');}}} placeholder="따뜻한 이야기를 남겨주세요" maxLength={1000} readOnly={readOnly} disabled={submitting} error={error||undefined}/><Action type="submit" disabled={submitting||readOnly||!draft.trim()}>{submitting?'등록 중...':'등록'}</Action></form></>}</section>;
}

export function PostDetailPage({id,model,forceLocked=false,readOnly=false}:{id:string;model:PostDetailModel;forceLocked?:boolean;readOnly?:boolean}){
  const {canAccess,data,basePath,commentCounts}=model;
  const post=data.posts.find(item=>item.id===id);
  if(!post)return <Empty title="게시물을 찾을 수 없어요" action={readOnly?undefined:<TextLink className={s.textLink} href={`${basePath}/feed`}>피드로 돌아가기</TextLink>}/>;
  const locked=(forceLocked&&(post.requiredRank>0||!!post.requiredPlanId))||!(post.canAccess??canAccess(post.creatorId,post.requiredRank,post.requiredPlanId));
  const count=commentCounts[id]??post.comments;
  return <div className={s.feed}>{readOnly?null:<TextLink className={s.back} href={`${basePath}/feed`}>피드로 돌아가기</TextLink>}<article className={s.post}><PostHeading post={post} model={model} readOnly={readOnly}/><PostMedia post={post} locked={locked} model={model} readOnly={readOnly}/><div className={s.postCopy}><h1>{post.title}</h1><p>{locked?'멤버십 전용 게시물이에요. 이용 가능한 멤버십을 확인해 주세요.':post.body}</p></div><PostActions post={post} model={model} comments={count} readOnly={readOnly}/></article><CommentsSection post={post} model={model} count={count} locked={locked} readOnly={readOnly}/></div>;
}

export function MessagesPage({model}:{model:MessagesViewModel}){
  const {data,messagesByCreator,blockedCreatorIds,basePath}=model;
  const [selected,setSelected]=useState<string|null>(null),[roomOpen,setRoomOpen]=useState(false),[query,setQuery]=useState('');
  const [drafts,setDrafts]=useState<Record<string,string>>({});
  const [dialog,setDialog]=useState<'report'|'block'|null>(null),[feedback,setFeedback]=useState(''),[error,setError]=useState(''),[pending,setPending]=useState(false);
  const roomRef=useRef<HTMLDivElement>(null),activeIdRef=useRef<string|null>(null);
  const allContacts=data.creators.filter(item=>Object.hasOwn(messagesByCreator,item.id));
  const activeId=allContacts.some(item=>item.id===selected)?selected:(allContacts[0]?.id||null);
  const creator=allContacts.find(item=>item.id===activeId),conversation=activeId?messagesByCreator[activeId]||[]:[],isBlocked=!!activeId&&blockedCreatorIds.includes(activeId);
  const draft=activeId?drafts[activeId]||'':'';
  activeIdRef.current=activeId;
  useEffect(()=>{if(roomRef.current)roomRef.current.scrollTop=roomRef.current.scrollHeight;},[activeId,conversation.length]);
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
  return <div className={s.messages} data-room-open={roomOpen}><aside className={s.conversationList}><h1>메시지</h1><label className={s.search}><Icon name="search" width={18} height={18}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="대화 검색" aria-label="대화 검색"/></label><div className={s.contacts}>{contacts.map(contact=>{const last=messagesByCreator[contact.id]?.at(-1);return <button type="button" key={contact.id} className={s.contact} data-selected={activeId===contact.id} aria-pressed={activeId===contact.id} onClick={()=>select(contact.id)}><Avatar creator={contact} size={43}/><span><strong>{contact.name}</strong><small>{blockedCreatorIds.includes(contact.id)?'차단한 사용자':last?.body}</small></span><time>{last?.time}</time></button>;})}{contacts.length===0&&<p className={s.noResults}>{query?'검색한 대화가 없어요.':'아직 대화가 없어요.'}</p>}</div></aside>{creator&&activeId?<section className={s.room} aria-label={`${creator.name}님과의 대화`}><header className={s.roomHeading}><button type="button" className={s.mobileBack} aria-label="대화 목록으로" onClick={()=>setRoomOpen(false)}>←</button><Link className={s.identity} href={model.contactHref?.(creator.id)||`${basePath}/creator/${creator.id}`}><Avatar creator={creator} size={40}/><span><strong>{creator.name}</strong><small>{isBlocked?'차단됨':model.contactRoleLabel||'크리에이터'}</small></span></Link><details className={s.roomMenu}><summary aria-label="대화 옵션">···</summary><div><button type="button" disabled={pending} onClick={event=>{event.currentTarget.closest('details')?.removeAttribute('open');setDialog('report');}}>신고하기</button>{isBlocked?<button type="button" disabled={pending} onClick={()=>void perform(()=>model.setConversationBlocked(activeId,false))}>차단 해제</button>:<button type="button" disabled={pending} onClick={event=>{event.currentTarget.closest('details')?.removeAttribute('open');setDialog('block');}}>차단하기</button>}</div></details></header><div className={s.messageScroll} ref={roomRef}>{model.conversationLabels[activeId]&&<span className={s.day}>{model.conversationLabels[activeId]}</span>}{conversation.map(message=><div className={s.message} data-mine={message.mine} key={message.id}><p>{message.body}</p><small>{message.statusLabel?`${message.statusLabel} · `:''}{message.time}</small></div>)}</div><div className={s.roomFeedback} role="status">{feedback}</div>{error&&!dialog&&<p className={s.error} id="message-error" role="alert">{error}</p>}{isBlocked?<div className={s.blocked}>차단한 사용자에게 메시지를 보낼 수 없어요.</div>:<form className={s.messageForm} onSubmit={send}><label className={s.srOnly} htmlFor="message-draft">메시지 입력</label><input id="message-draft" value={draft} disabled={pending} onChange={event=>{setDrafts(previous=>({...previous,[activeId]:event.target.value}));setError('');}} placeholder="메시지를 입력하세요..." maxLength={2000} aria-invalid={!!error} aria-describedby={error?'message-error':undefined}/><button type="submit" disabled={!draft.trim()||pending} aria-label="메시지 보내기"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m3 10 18-7-7 18-3-8-8-3Zm8 3L21 3"/></svg></button></form>}</section>:<section className={s.room}><Empty title="아직 대화가 없어요" description="새로운 대화가 시작되면 이곳에서 확인할 수 있어요."/></section>}<Dialog open={!!dialog} onClose={()=>{if(!pending)setDialog(null);}} title={dialog==='block'?`${creator?.name||'사용자'}님을 차단할까요?`:'대화 신고'}><p className={s.dialogCopy}>{dialog==='block'?model.socialCopy.blockDescription:model.socialCopy.reportDescription}</p>{error&&<p className={s.error} role="alert">{error}</p>}<DialogActions><Action variant="secondary" disabled={pending} onClick={()=>setDialog(null)}>취소</Action><Action variant="danger" disabled={pending} onClick={confirm}>{pending?'처리 중...':dialog==='block'?'차단하기':'신고 확인'}</Action></DialogActions></Dialog></div>;
}

export function NotificationsPage({model}:{model:ServiceViewModel}){
  const [filter,setFilter]=useState('전체');
  const {read,markRead,data}=model;
  const visible=data.notifications.filter(item=>filter==='전체'||item.type===filter);
  const filters=['전체',...Array.from(new Set(['멤버십','댓글','좋아요','시스템',...data.notifications.map(item=>item.type)]))];
  return <div className={s.notifications}><PageTitle action={<button type="button" className={s.markAll} disabled={data.notifications.every(item=>read.includes(item.id))} onClick={()=>markRead(data.notifications.map(item=>item.id))}>모두 읽음</button>}>알림</PageTitle><ChipRow className={s.notificationFilters} label="알림 분류">{filters.map(item=><Chip key={item} selected={filter===item} onClick={()=>setFilter(item)}>{item}</Chip>)}</ChipRow><div>{visible.map(item=>{const creator=data.creators.find(creator=>creator.id===item.creatorId),unread=!read.includes(item.id);return <Link className={s.notification} data-unread={unread} href={item.href} key={item.id} onClick={()=>markRead([item.id])}>{creator?<Avatar creator={creator} size={43}/>:<span className={s.systemIcon}><Icon name="card" width={21} height={21}/></span>}<span className={s.notificationText}><span>{item.text}</span><small>{item.time}</small></span>{unread&&<span className={s.unreadDot} aria-label="읽지 않음"/>}<Icon name="chevron" width={16} height={16}/></Link>;})}{visible.length===0&&<Empty title="새로운 알림이 없어요" description="소식이 도착하면 이곳에서 확인할 수 있어요."/>}</div></div>;
}
