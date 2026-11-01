'use client';
import {StudioDashboardExample} from './StudioDashboardExample';
import {SignInPrompt} from '@/components/crefans/SignInPrompt';
import {AdvertisingPreview,type AdvertisingPreviewState} from '@/components/preview/studio/AdvertisingPreview';
import {StudioCommentReply} from '@/components/crefans/studio/StudioCommentReply';
import type {CommunityReply} from '@/types/crefans-community';
import type {SocialActionResult} from '@/types/crefans-social';
import {EventsPage,EventDetailPage} from '@/components/crefans/EventPages';
import {serviceEvents} from '@/lib/content/events';
import {MarqueeText,MarqueeMotionControl} from '@/components/ui/MarqueeText';
import {beanHistoryQuery,emptyBeanHistoryFilters,filterBeanHistory} from '@/lib/crefans/bean-history';
import {ReferralCard} from '@/components/crefans/ReferralCard';
import {BeanWalletOverview,BeanHistoryView,type BeanHistoryKind} from '@/components/crefans/BeanWalletPages';
import type {BeanWallet,BeanTip} from '@/types/crefans-beans';
import {BeanPaymentResultPage} from '@/components/crefans/BeanPaymentResultPage';
import type {BeanPaymentStatus} from '@/types/crefans-beans';
import {BackButton} from '@/components/crefans/BackButton';
import {CreatorName} from '@/components/crefans/CreatorName';
import {CreatorSearch} from '@/components/crefans/CreatorSearch';
import {CategoryChip} from '@/components/crefans/CategoryChip';
import {ChipRow} from '@/components/ui/ChipRow';
import {TextLink} from '@/components/ui/TextLink';
import {DialogActions} from '@/components/ui/DialogActions';
import {useRef,useState} from 'react';
import {CommentComposer,CommentDock,CommentDockProvider} from '@/components/crefans/CommentComposer';
import {ProfileHeader} from '@/components/crefans/ProfileHeader';
import {CreatorCard} from '@/components/crefans/CreatorCard';
import {FollowButton} from '@/components/crefans/FollowButton';
import {InfoTooltip} from '@/components/ui/InfoTooltip';
import {UnreadBadge} from '@/components/ui/UnreadBadge';
import {NavigationIcon,NavigationAvatar} from '@/components/crefans/NavigationIcon';
import {MembershipPlanCard} from '@/components/crefans/MembershipPlanCard';
import {PostMembershipNotice} from '@/components/crefans/PostMembershipNotice';
import {PostViews} from '@/components/crefans/PostViews';
import {ShareDialog} from '@/components/crefans/PostShareDialog';
import {PostCard,type PostCardModel} from '@/components/crefans/SocialPages';
import {MetricCard} from '@/components/crefans/studio/OverviewPages';
import {LedgerRow,AmountRows} from '@/components/crefans/studio/FinancePages';
import {Action,Empty,Notice,PageTitle} from '@/components/crefans/ServiceUI';
import {ApiState} from '@/components/crefans/ApiState';
import {Dialog,SelectField} from '@/components/ui/Primitives';
import {mockServiceResponse} from '@/components/preview/service/fixtures';
import {screenLinks,studioLinks,commonLinks} from '@/components/preview/screen-catalog';
import {ChartMotionCatalog} from './ChartMotionCatalog';
import {VideoProcessingCatalog} from './VideoProcessingCatalog';
import s from './custom.module.css';

const screens=[...screenLinks,...studioLinks,...commonLinks];
function CommentComposerExample(){
 const root=useRef<HTMLDivElement>(null),[value,setValue]=useState(''),[state,setState]=useState('normal');
 return <section className={s.section}><div className={s.sectionHeading}><h2>모바일 댓글 입력바</h2><p>모바일은 스크롤 영역 아래의 한 줄 입력바, PC는 본문 안 여러 줄 입력입니다. 빈 댓글은 등록할 수 없고, 실패하면 작성 내용을 유지합니다.</p></div><SelectField label="댓글 입력 상태" value={state} onChange={setState} options={[{value:'normal',label:'일반·빈 값'},{value:'error',label:'등록 실패'},{value:'pending',label:'등록 중'},{value:'readOnly',label:'읽기 전용'}]}/><CommentDockProvider viewportRef={root}><div ref={root} style={{maxWidth:480,marginTop:16}}><CommentComposer postId="catalog-comment" title="예시 게시물" value={value} error={state==='error'?'댓글을 등록하지 못했어요. 다시 시도해 주세요.':''} pending={state==='pending'} readOnly={state==='readOnly'} onChange={setValue} onSubmit={event=>{event.preventDefault();if(state==='normal'&&value.trim())setValue('');}}/><CommentDock/></div></CommentDockProvider></section>;
}
function ShareDialogExample(){
 const [open,setOpen]=useState(false),[status,setStatus]=useState('ready'),[message,setMessage]=useState('');
 return <section className={s.section} id="post-share"><div className={s.sectionHeading}><h2>게시물 공유</h2><p>복사·카카오톡·기기 공유를 선택합니다. 이 카탈로그의 동작은 외부로 전송하지 않는 상태 예시입니다.</p></div><SelectField label="공유 상태" value={status} onChange={setStatus} options={[{value:'ready',label:'공유 가능'},{value:'unavailable',label:'미연결·미지원'},{value:'loading',label:'카카오 로딩'},{value:'error',label:'실패·직접 복사'},{value:'pending',label:'처리 중'}]}/><Action onClick={()=>{setMessage('');setOpen(true);}}>공유 레이어 열기</Action><ShareDialog open={open} onClose={()=>setOpen(false)} title="게시물 공유 예시" state={{url:'https://example.com/service/post/sample',nativeSupported:status!=='unavailable',kakao:status==='unavailable'?'unavailable':status==='loading'?'loading':'ready',pending:status==='pending',message,error:status==='error'?'링크를 복사하지 못했어요. 아래 주소를 직접 복사해 주세요.':'',manualCopy:status==='error',dismissMessage:()=>setMessage(''),copy:async()=>setMessage('복사 동작 예시입니다.'),shareKakao:async()=>setMessage('카카오톡 동작 예시입니다.'),shareMore:async()=>setMessage('기기 공유 동작 예시입니다.')}}/></section>;
}
function BeanWalletExample(){
 const [view,setView]=useState('wallet'),[state,setState]=useState('normal'),[filters,setFilters]=useState({...emptyBeanHistoryFilters});
 const empty=state==='empty',wallet:BeanWallet={walletId:'catalog-wallet',status:'active',page:1,spendableBeans:2600,spendableBreakdown:{purchased:2500,promotion:100},withdrawableBeans:3000,accounts:[{bucket:'purchased',balance:'2500'},{bucket:'promotion',balance:'100'},{bucket:'earned-paid',balance:'3000'}],charges:empty?[]:[{id:'catalog-paid',quantity:100,amount:11000,status:'paid',environment:'test',createdAt:'2026-10-26T00:00:07Z'},{id:'catalog-pending',quantity:30,amount:3300,status:'pending',environment:'test',createdAt:'2026-10-26T00:05:10Z'}],entries:empty?[]:[{id:'catalog-entry-1',delta:'100',created_at:'2026-10-26T00:00:00Z',movement:{reason:'콩 충전',kind:'charge'}},{id:'catalog-entry-2',delta:'-10',created_at:'2026-10-25T23:30:00Z',movement:{reason:'게시물 후원',kind:'tip',tip:{post_id:'sample',sourceType:'post',postTitle:'촬영 비하인드',postTitleSource:'snapshot',postAvailable:true}}}]};
 const sent:BeanTip[]=empty?[]:[{post_id:'sample',sourceType:'post',postTitle:'촬영 비하인드',postTitleSource:'snapshot',postAvailable:true,id:'catalog-tip',sender_id:'catalog-fan',creator_id:'moka',creatorName:'모카',quantity:10,paid_quantity:0,promotion_quantity:10,message:'다음 작품도 기대할게요!',created_at:'2026-10-25T23:30:00Z'},{id:'catalog-profile',sourceType:'profile',sender_id:'catalog-fan',creator_id:'moka',creatorName:'모카',quantity:30,paid_quantity:30,promotion_quantity:0,message:'',created_at:'2026-10-25T23:30:00Z'},{id:'catalog-deleted',sourceType:'post',post_id:'removed',postTitle:'이전 작품',postTitleSource:'snapshot',postAvailable:false,sender_id:'catalog-fan',creator_id:'moka',creatorName:'모카',quantity:50,paid_quantity:50,promotion_quantity:0,message:'',created_at:'2026-10-25T23:30:00Z'}];
 const filtered=filterBeanHistory(wallet.charges||[],wallet.entries,sent,beanHistoryQuery(filters));
 const model={basePath:'/preview',wallet:state==='loading'||state==='error'?null:{...wallet,charges:filtered.charges,entries:filtered.entries,chargesTotal:filtered.charges.length,entriesTotal:filtered.entries.length},sent:filtered.tips,sentTotal:filtered.tips.length,loading:state==='loading',error:state==='error'?'내역을 불러오지 못했습니다. 다시 시도해주세요.':''};
 return <section className={s.section} id="bean-wallet"><div className={s.sectionHeading}><h2>지갑과 내역</h2><p>콩 아이콘 충전 버튼, 두 열의 내역 진입 버튼과 기본 펼침 세부 내역을 같은 공용 화면으로 표시합니다.</p></div><div className={s.row}><SelectField label="지갑 화면" value={view} onChange={value=>{setView(value);setFilters({...emptyBeanHistoryFilters});}} options={[{value:'wallet',label:'지갑'},{value:'charges',label:'충전 내역'},{value:'history',label:'콩 내역'},{value:'tips',label:'후원 내역'}]}/><SelectField label="지갑 데이터 상태" value={state} onChange={setState} options={[{value:'normal',label:'일반'},{value:'empty',label:'빈 내역'},{value:'loading',label:'불러오는 중'},{value:'error',label:'조회 실패'},{value:'pending',label:'결제 버튼 비활성'}]}/></div>{view==='wallet'?<BeanWalletOverview {...model}/>:<BeanHistoryView kind={view as BeanHistoryKind} model={model} filters={filters} onFiltersChange={setFilters} pending={state==='pending'} onPay={()=>setState('pending')} onPage={()=>setState('normal')}/>}</section>;
}
function BeanPaymentResultExample(){
 const [status,setStatus]=useState<BeanPaymentStatus>('success');
 const messages={success:'',loading:'충전 결과를 확인하고 있습니다.',pending:'아직 충전 완료가 확인되지 않았습니다.',cancelled:'결제가 중단되었습니다. 내 콩 지갑에서 같은 주문을 이어갈 수 있습니다.',error:'충전 결과를 확인하지 못했습니다. 같은 주문으로 다시 확인해주세요.'};
 return <section className={s.section} id="bean-payment-result"><div className={s.sectionHeading}><h2>콩 충전 완료</h2><p>주문에서 확인된 충전 수량과 결제 금액을 표시합니다.</p></div><SelectField label="콩 충전 결과 상태" value={status} onChange={value=>setStatus(value as BeanPaymentStatus)} options={[{value:'success',label:'충전 완료'},{value:'loading',label:'결과 확인 중'},{value:'pending',label:'승인 미확정'},{value:'cancelled',label:'결제 중단'},{value:'error',label:'확인 실패·주문 없음'}]}/><BeanPaymentResultPage basePath="/preview" status={status} charge={status==='success'?{id:'00000000-0000-4000-8000-000000000100',quantity:100,amount:11000,status:'paid',environment:'test',createdAt:'2026-10-26T00:00:07Z'}:null} message={messages[status]} onRetry={()=>setStatus('loading')}/></section>;
}
function BackButtonExample(){
 const [returned,setReturned]=useState(false);
 return <section className={s.section}><div className={s.sectionHeading}><h2>뒤로가기 버튼</h2><p>페이지 복귀와 대화 목록 전환에 같은 44px 원형 왼쪽 화살표 버튼을 사용합니다.</p></div><div className={s.patternGrid}><div className={s.patternExample}><h3>페이지 이동</h3><BackButton href="/preview/notices" label="공지사항 목록으로"/></div><div className={s.patternExample}><h3>화면 내 전환</h3>{returned?<><p role="status">대화 목록으로 돌아왔습니다.</p><Action onClick={()=>setReturned(false)}>대화 열기</Action></>:<BackButton label="대화 목록으로" onClick={()=>setReturned(true)}/>}</div></div></section>;
}
function EventPagesExample(){
 const [view,setView]=useState('detail'),[eventId,setEventId]=useState(serviceEvents[0].id);
 return <section className={s.section} id="event-pages"><div className={s.sectionHeading}><h2>이벤트 안내</h2><p>네 가지 혜택을 각각 목록·상세로 표시합니다. 공통 유의사항을 반복하고 혜택별 조건은 해당 상세에만 표시합니다. 상품권은 처음, 원년멤버 배지는 마지막에 둡니다.</p></div><SelectField label="이벤트 화면" value={view} onChange={setView} options={[{value:'detail',label:'상세'},{value:'list',label:'목록'},{value:'empty',label:'빈 목록'},{value:'missing',label:'없는 이벤트'}]}/>{view==='detail'&&<SelectField label="상세 이벤트" value={eventId} onChange={setEventId} options={serviceEvents.map(event=>({value:event.id,label:event.title}))}/>}<div style={{marginTop:24}}>{view==='list'||view==='empty'?<EventsPage events={view==='empty'?[]:serviceEvents} basePath="/preview"/>:<EventDetailPage event={view==='missing'?undefined:serviceEvents.find(event=>event.id===eventId)} basePath="/preview"/>}</div></section>;
}
function AdvertisingExample(){
 const [state,setState]=useState<AdvertisingPreviewState>('normal');
 return <section className={s.section} id="advertising"><div className={s.sectionHeading}><h2>스튜디오 광고상품</h2><p>목업과 서비스가 상품 카드·구매 안내·완료 내역을 같은 화면으로 표시합니다. 실제 결제하지 않습니다.</p></div><SelectField label="광고상품 데이터 상태" value={state} onChange={value=>setState(value as AdvertisingPreviewState)} options={[{value:'normal',label:'일반·판매 중지 포함'},{value:'empty',label:'빈 목록'},{value:'loading',label:'불러오는 중'},{value:'error',label:'조회 실패'},{value:'disabled',label:'구매 비활성'}]}/><div style={{marginTop:24}}><AdvertisingPreview key={state} state={state}/></div></section>;
}
function StudioReplyExample(){
 const [state,setState]=useState('normal'),[body,setBody]=useState('글을 봐주셔서 감사합니다. 다음 이야기도 기대해 주세요.'),[deleted,setDeleted]=useState(false);
 const reply:CommunityReply={id:'catalog-reply',body,time:'방금',author:{id:'catalog-creator',name:state==='fan'?'팬지민':'하늘',image:'/illustrations/redesign/hero-woman.png'},fromCreator:state!=='fan'};
 async function run(change:()=>void):Promise<SocialActionResult>{if(state==='pending')await new Promise(resolve=>setTimeout(resolve,1500));if(state==='error')return{success:false,data:null,errorMessage:'변경하지 못했어요. 다시 시도해 주세요.',errorCode:'PREVIEW_ERROR'};change();return{success:true,data:{message:'변경했습니다.'},errorMessage:null,errorCode:null};}
 return <section className={s.section} id="studio-reply"><div className={s.sectionHeading}><h2>스튜디오 답글</h2><p>작성자 사진·이름을 표시하고 본인 답글만 수정·삭제합니다. 삭제 전 확인하며 실패하면 내용을 유지합니다.</p></div><SelectField label="답글 상태" value={state} onChange={value=>{setState(value);setDeleted(false);}} options={[{value:'normal',label:'내 답글'},{value:'fan',label:'팬 답글 · 읽기 전용'},{value:'error',label:'변경 실패'},{value:'pending',label:'저장·삭제 중'}]}/><div style={{maxWidth:560,marginTop:16}}>{deleted?<p>댓글이 없습니다.</p>:<StudioCommentReply key={state} reply={reply} onEdit={value=>run(()=>setBody(value))} onDelete={()=>run(()=>setDeleted(true))}/>}</div></section>;
}
function ReferralExample(){
 const [state,setState]=useState('normal');
 return <section className={s.section} id="referral"><div className={s.sectionHeading}><h2>친구 초대 이벤트</h2><p>보상·초대 링크·참여 현황을 표시하며 복사 완료는 공통 하단 스낵바로 안내합니다.</p></div><SelectField label="초대 현황" value={state} onChange={setState} options={[{value:'normal',label:'참여 있음'},{value:'empty',label:'아직 참여 없음'}]}/><div style={{maxWidth:600}}><ReferralCard referral={{code:'00000000-0000-4000-8000-000000000001',invited:state==='normal'?3:0,qualified:state==='normal'?1:0,rewarded:state==='normal'?2:0,rewardBeans:state==='normal'?200:0,rewardPerInvite:100,holdDays:7,monthlyCap:10}}/></div></section>;
}

export function ServicePatternCatalog(){
 const [following,setFollowing]=useState(false),[plan,setPlan]=useState('standard'),[locked,setLocked]=useState(false),[liked,setLiked]=useState<string[]>([]),[saved,setSaved]=useState<string[]>([]),[dialog,setDialog]=useState(''),[screen,setScreen]=useState('messages');
 const [apiState,setApiState]=useState('loading'),[offerState,setOfferState]=useState('available'),[search,setSearch]=useState(''),[category,setCategory]=useState('전체');
 const data=mockServiceResponse.success?mockServiceResponse.data:null;
 if(!data)return null;
 const post=data.posts[0];
 const offerPlans=data.creatorPlans?.[post.creatorId]??data.plans;
 const offerData={...data,creatorPlans:{...data.creatorPlans,[post.creatorId]:offerState==='empty'?[]:offerPlans.map(item=>({...item,image:offerState==='noImage'?undefined:offerState==='imageError'?'/missing-membership-image.png':item.image,available:offerState!=='unavailable'}))}};
 const postModel:PostCardModel={data:offerData,basePath:'/preview',canAccess:()=>!locked,liked,saved,toggleLike:id=>setLiked(value=>value.includes(id)?value.filter(item=>item!==id):[...value,id]),toggleSave:id=>setSaved(value=>value.includes(id)?value.filter(item=>item!==id):[...value,id]),likeCounts:{[post.id]:post.likes+(liked.includes(post.id)?1:0)},commentCounts:{}};
 return <>
  <VideoProcessingCatalog/>
  <section className={s.section}><div className={s.sectionHeading}><h2>서비스에서 사용하는 컴포넌트</h2><p>목업과 같은 컴포넌트에 예시 데이터를 주입했습니다. 여기서 확인한 디자인이 실제 목업 화면에도 적용됩니다.</p></div>
   <div className={s.patternGrid}><div className={s.patternExample}><h3>팔로우 버튼</h3><p className={s.muted}>탐색 카드·프로필·팔로잉 목록이 같은 컴포넌트를 씁니다. 팔로우 중일 때 누르면 해제 확인 모달이 먼저 뜹니다.</p><div className={s.row}><FollowButton following={following} name={data.creators[1].name} onToggle={()=>setFollowing(!following)}/><FollowButton following={false} name={data.creators[1].name} onToggle={()=>{}} disabled/></div></div><div className={s.patternExample}><h3>크리에이터 카드 · 탐색</h3><CreatorCard creator={data.creators[1]} href="/preview/creator/jiwoo" following={following} onFollow={()=>setFollowing(value=>!value)}/></div><div className={s.patternExample}><h3>멤버십 카드 · 구독</h3><MembershipPlanCard plan={data.plans.find(item=>item.id===plan)||data.plans[0]} selected onSelect={()=>setDialog('선택한 멤버십')}/><div style={{marginTop:20}}><SelectField label="멤버십 데이터 변경" options={data.plans.map(item=>({value:item.id,label:item.name}))} value={plan} onChange={setPlan}/></div></div></div>
  </section>
  <EventPagesExample/><StudioReplyExample/><AdvertisingExample/><StudioDashboardExample/>
  <section className={s.section} id="signin-prompt"><div className={s.sectionHeading}><h2>로그인 필요 안내</h2><p>공용 로그인 안내·선택한 3D 자물쇠·로그인 복귀 경로를 유지합니다. 모바일은 서비스 안내를 2열로 표시합니다.</p></div><SignInPrompt basePath="/preview"/></section>
  <BeanWalletExample/><ReferralExample/>
  <BeanPaymentResultExample/>
  <BackButtonExample/>
  <ShareDialogExample/>
  <section className={s.section} id="post-views"><div className={s.sectionHeading}><h2>게시물 조회수</h2><p>누적 조회수를 표시합니다. 1만 회부터 축약하고 전체 숫자는 접근성 이름과 툴팁으로 제공합니다. 값이 없으면 표시하지 않습니다.</p></div><div style={{display:'flex',gap:24,flexWrap:'wrap'}}><PostViews count={0}/><PostViews count={1842}/><PostViews count={24831}/><PostViews count={123456789}/><PostViews/></div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>크리에이터 카테고리 칩</h2><p>홈·탐색·프로필에서 같은 라운드 플랫 아이콘을 사용합니다. 등록되지 않은 분류는 이름만 표시합니다.</p></div><ChipRow label="카테고리 아이콘 예시">{[...data.categories,'새 카테고리'].map(label=><CategoryChip key={label} label={label} selected={category===label} onClick={()=>setCategory(label)}/>)}</ChipRow></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>크리에이터 검색</h2><p>홈의 검색 링크와 탐색의 검색 입력이 같은 컴포넌트와 디자인을 사용합니다.</p></div><div className={s.patternGrid}><div className={s.patternExample}><h3>홈 · 검색 진입</h3><CreatorSearch href="/preview/explore"/></div><div className={s.patternExample}><h3>탐색 · 검색 입력</h3><CreatorSearch value={search} onChange={setSearch}/></div><div className={s.patternExample}><h3>읽기 전용</h3><CreatorSearch value="모카" onChange={()=>{}} readOnly/></div><div className={s.patternExample}><h3>비활성</h3><CreatorSearch value="" onChange={()=>{}} disabled/></div></div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>피드와 접근 권한</h2><p>게시물·프로필·좋아요·저장·접근 제한을 같은 피드 컴포넌트에서 확인합니다. 이미지를 열면 모바일에서 손잡이 드래그·클릭으로 기본, 미디어 축소, 상세 전체 보기 세 단계를 확인할 수 있습니다. 갤러리 영역 오른쪽 아래 확대·축소 버튼은 상세 패널을 숨겨 미디어를 화면 전체로 보여주고 이전 패널 높이로 복원합니다.</p></div><label className={s.check}><input type="checkbox" checked={locked} onChange={e=>setLocked(e.target.checked)}/>멤버십 전용으로 잠그기</label><div style={{maxWidth:600}}>{locked&&<SelectField label="멤버십 안내 상태" value={offerState} onChange={setOfferState} options={[{value:'available',label:'가입 가능·이미지 있음'},{value:'noImage',label:'이미지 없음'},{value:'imageError',label:'이미지 로딩 실패'},{value:'unavailable',label:'판매 중단'},{value:'empty',label:'멤버십 없음'},{value:'readOnly',label:'읽기 전용'}]}/>}<p className={s.muted}>멤버십 안내 버튼은 페이지 이동 없이 가격과 혜택 레이어를 엽니다.</p>{locked&&offerState==='readOnly'?<PostMembershipNotice post={{...post,requiredRank:2}} data={offerData} basePath="/preview" readOnly/>:<PostCard post={{...post,requiredRank:locked?2:0}} model={postModel}/>}</div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>프로필 사진 크게 보기</h2><p>배경사진과 프로필 사진은 게시물과 같은 미디어 오버레이로 엽니다. 기본 아바타와 이미지가 없는 배경은 확대 버튼을 제공하지 않습니다.</p></div><div className={s.patternGrid}><div style={{maxWidth:480}}><ProfileHeader person={data.creators[0]} cover={data.creators[0].cover||data.creators[0].image} handle={data.creators[0].handle} bio={data.creators[0].bio} tags={[...data.creators[0].tags,'새 카테고리']} counts={[]}/></div><div style={{maxWidth:480}}><ProfileHeader person={{name:'사진 없는 프로필'}} handle="no-image" bio="" counts={[]}/></div></div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>크리에이터 스튜디오</h2><p>지표, 추이, 정산 내역과 금액 상세도 스튜디오에서 쓰는 그대로 표시합니다.</p></div><div className={s.patternGrid}><MetricCard metric={{id:'members',label:'함께하는 구독자',value:'128',description:'현재 유효한 멤버십',points:[12,21,18,28,25,34,40]}}/><div className={s.patternExample}><h3>금액 상세</h3><AmountRows gross={199000} reversals={19900} fees={17910} net={161190}/></div></div><div className={s.patternExample} style={{marginTop:24}}><h3>정산 내역 행</h3><LedgerRow title="9월 멤버십 정산" detail="2026.09.12" amount={161190} status={<span>정산 대기</span>} onClick={()=>setDialog('정산 상세')}/><LedgerRow title="금액을 불러오지 못한 내역" detail="금액 데이터 없음" amount={null} onClick={()=>setDialog('정산 상세')}/></div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>제목과 안내·데이터 상태</h2><p>데이터가 없거나 오류가 난 경우에도 예시 콘텐츠를 자동으로 채우지 않습니다.</p></div><div className={s.patternExample}><PageTitle action={<Action onClick={()=>setDialog('새 게시물')}>새 게시물</Action>}>콘텐츠 관리</PageTitle><Notice>받은 안내 문구가 있을 때만 표시합니다.</Notice><div className={s.row}><Action variant="primary">기본 행동</Action><Action variant="brand">주요 행동</Action><Action variant="secondary">보조 행동</Action><Action disabled>비활성</Action></div><Empty title="아직 콘텐츠가 없어요" description="첫 이야기를 작성해 보세요." action={<Action onClick={()=>setDialog('새 게시물')}>작성하기</Action>}/></div><div style={{marginTop:24}}><SelectField label="데이터 상태" value={apiState} onChange={setApiState} options={[{value:'loading',label:'불러오는 중'},{value:'error',label:'요청 실패'},{value:'success',label:'성공'}]}/><ApiState loading={apiState==='loading'} response={apiState==='error'?{success:false,data:null,errorMessage:'내용을 불러오지 못했습니다.',errorCode:'PREVIEW_ERROR'}:{success:true,data:'전달받은 내용입니다.',errorMessage:null,errorCode:null}} onRetry={()=>setApiState('success')}>{text=><p>{text}</p>}</ApiState></div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>크리에이터 인증 배지</h2><p>운영자가 부여한 인증만 닉네임 오른쪽에 표시합니다.</p></div><div className={s.patternExample}><p><CreatorName person={{name:'인증 크리에이터',isVerified:true}}/></p><p><CreatorName person={{name:'일반 크리에이터',isVerified:false}}/></p><p><CreatorName person={{name:'이름이 긴 크리에이터의 표시 예시',isVerified:true}}/></p></div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>정보 툴팁</h2><p>마우스·키보드 포커스·터치로 설명을 확인합니다. Escape나 바깥 영역 선택으로 닫습니다.</p></div><div className={s.patternExample}><span>주목할 크리에이터</span><InfoTooltip label="주목할 크리에이터 안내" content="홍보성 프로모션이 적용된 크리에이터나 해당 광고 상품을 이용중인 크리에이터가 노출될 수 있습니다."/></div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>미확인 개수 배지</h2><p>0개는 숨기고 1~99개는 숫자, 100개 이상은 99+로 표시합니다.</p></div><div className={s.row}>{[0,1,9,99,100].map(count=><div className={s.patternExample} key={count}><span style={{position:'relative',display:'inline-flex'}} aria-label={`읽지 않은 알림 ${count}개`}><NavigationIcon name="bell"/><UnreadBadge count={count}/></span><p>{count}개</p></div>)}</div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>내비게이션 아이콘</h2><p>선택 메뉴는 파랑·보라, 나머지는 회색입니다. 프로필 사진이 없거나 불러오지 못하면 같은 아이콘의 기본 프로필을 표시합니다.</p></div><div className={s.patternGrid}>{[true,false].map(active=><div className={s.patternExample} key={String(active)}><h3>{active?'선택':'미선택'}</h3><div className={s.row}>{(['home','explore','message','bell','user'] as const).map(name=><NavigationIcon key={name} name={name} active={active}/>)}</div></div>)}<div className={s.patternExample}><h3>프로필 사진·기본 프로필</h3><div className={s.row}><NavigationAvatar person={data.creators[0]}/><NavigationAvatar active/></div></div></div></section>
  <section className={s.section} id="founding-member-badge"><div className={s.sectionHeading}><h2>원년멤버 한정판 배지</h2><p>원년멤버 이벤트 기념 배지입니다. 크리에이터 인증과 구분하며 모델이 표시 여부를 전달합니다.</p></div><div className={s.patternExample}><p><CreatorName person={{name:'하늘',isVerified:true,isFoundingMember:true}}/></p><p><CreatorName person={{name:'팬지민',isFoundingMember:true}}/></p><p><CreatorName person={{name:'배지 없음',isFoundingMember:false}}/></p><p style={{width:180}}><CreatorName person={{name:'긴 이름에서도 원년멤버 배지가 유지되는 예시',isVerified:true,isFoundingMember:true}}/></p></div></section>
  <section className={s.section} id="marquee-text"><div className={s.sectionHeading}><h2>긴 이름 마키</h2><p>영역을 넘는 이름만 왕복합니다. 움직임을 끄거나 기기의 동작 줄이기를 사용하면 전체 텍스트를 줄바꿈합니다.</p></div><div className={s.patternExample} style={{width:220,maxWidth:'100%'}}><MarqueeText text="짧은 이름"/><MarqueeText text=""/><CreatorName person={{name:'모카의 분홍빛 코스프레와 일상이야기',isVerified:true}}/><MarqueeText text="@moka_cosplay_story_daily"/><MarqueeText text="모카와 함께 보는 특별한 코스프레 화보 컬렉션 멤버십"/><MarqueeMotionControl/><MarqueeMotionControl/></div></section>
  <CommentComposerExample/>
  <ChartMotionCatalog/>
  <section className={s.section}><div className={s.sectionHeading}><h2>화면별 구성 미리보기</h2><p>헤더·탭·메시지·알림·목록 등 전체 구성을 실제 목업 페이지로 확인합니다. 아래 선택창에서 팬·스튜디오·공통 화면을 모두 열 수 있습니다.</p></div><SelectField label="확인할 화면" options={screens.map(([value,label])=>({value,label}))} searchable value={screen} onChange={setScreen}/><p className={s.muted}>{screens.find(item=>item[0]===screen)?.[2]} · <TextLink href={`/preview/${screen}`} target="_blank" rel="noreferrer">새 탭에서 확인</TextLink></p><iframe className={s.screenFrame} src={`/preview/${screen}`} title={`${screens.find(item=>item[0]===screen)?.[1]} 구성 미리보기`}/></section>
  <Dialog open={!!dialog} title={dialog} onClose={()=>setDialog('')}><p>컴포넌트에서 전달한 행동을 확인하는 예시입니다.</p><DialogActions><Action onClick={()=>setDialog('')}>확인</Action></DialogActions></Dialog>
 </>;
}
