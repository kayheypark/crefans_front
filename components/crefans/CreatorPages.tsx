'use client';
import {PAYMENT_TERMS} from '@/lib/crefans/payment-terms';
import {intermediaryNotice} from '@/lib/content/business';
import {SubscriptionResumeDialog} from './SubscriptionResumeDialog';
import {CREATOR_PROVISION} from '@/lib/crefans/creator-provision';
import {Toast} from '@/components/ui/Toast';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import {TipButton} from './BeanPages';
import {MarqueeText} from '@/components/ui/MarqueeText';

import {CreatorName} from './CreatorName';
import {CreatorSearch} from './CreatorSearch';

import {DialogActions} from '@/components/ui/DialogActions';
import {useEffect,useRef,useState} from 'react';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {useDelayedLoading} from '@/components/ui/useDelayedLoading';
import {DelayedInlineSpinner} from '@/components/ui/DelayedSpinner';
import Image from 'next/image';
import Link from 'next/link';
import {TextLink} from '@/components/ui/TextLink';
import {Checkbox} from '@/components/ui/Choice';
import {getCreatorPlans,getSubscriptionPlan} from '@/lib/crefans/membership-plans';
import {MembershipThumb} from './MembershipThumb';
import {useRouter,useSearchParams} from 'next/navigation';
import {Badge,Dialog} from '@/components/ui/Primitives';
import {ChipRow} from '@/components/ui/ChipRow';
import {CategoryChip} from './CategoryChip';
import {InfoTooltip} from '@/components/ui/InfoTooltip';
import Icon from './Icon';
import {CreatorCard} from './CreatorCard';
import {MembershipPlanCard} from './MembershipPlanCard';
import {FollowButton} from './FollowButton';
import {ProfileHeader} from './ProfileHeader';
import {PostMediaTile} from './PostMediaTile';
import {getPostMedia} from '@/lib/crefans/post-media';
import {FeedEnd,PostCard} from './SocialPages';
import {Action,Avatar,Empty,PageTitle} from './ServiceUI';
import type {ServiceViewModel,Subscription} from '@/types/crefans';
import s from './creator.module.css';

const money=(value:number)=>`₩${value.toLocaleString('ko-KR')}`;
const date=(value:string)=>value.replaceAll('-','.');
const statusLabels={active:'구독 중',cancelled:'갱신 해지',expired:'기간 종료'};
const socialKeys=['youtube','instagram','facebook'] as const,socialLabels={youtube:'유튜브',instagram:'인스타그램',facebook:'페이스북'} as const;

export function ExplorePage({model}:{model:ServiceViewModel}){
  const {following,toggleFollow,basePath,data:{creators:providedCreators,categories}}=model;
  const creators=model.directory?.creators||providedCreators;
  const searchParams=useSearchParams();
  const searchQuery=searchParams.get('q')||'';
  const [query,setQuery]=useState(searchQuery);
  const [category,setCategory]=useState('전체');
  useEffect(()=>{setQuery(searchQuery);setCategory('전체');},[searchQuery]);
  const term=query.trim().toLocaleLowerCase();
  useEffect(()=>{model.directory?.search(term,category);},[term,category,model.directory?.search]);
  const matches=(creator:typeof creators[number])=>creator.isCreator!==false&&creator.searchable!==false&&(category==='전체'||creator.tags.includes(category))&&`${creator.name} ${creator.handle} ${creator.tags.join(' ')} ${creator.bio}`.toLocaleLowerCase().includes(term);
  const visible=creators.filter(matches);
  const newcomers=(model.directory?model.directory.newCreators||[]:(model.data.newCreatorIds||[]).flatMap(id=>providedCreators.filter(creator=>creator.id===id))).filter(matches).slice(0,6);
  /** Featured and new creators share cards; the full directory remains a light list. */
  const promoted=visible.filter(creator=>creator.promoted),others=visible.filter(creator=>!creator.promoted);
  // Loading rule: no '불러오는 중…' text on every visit; the shared spinner appears only after 1s.
  const slow=useDelayedLoading(!!model.directory?.loading);
  return <div className={s.explore}>
    <h1 className={s.srOnly}>탐색하기</h1>
    <CreatorSearch value={query} onChange={setQuery}/>
    <ChipRow className={s.filters} label="크리에이터 카테고리">{['전체',...categories.filter(item=>item!=='전체')].map(item=><CategoryChip key={item} label={item} iconUrl={model.data.categoryIcons?.[item]} selected={category===item} onClick={()=>setCategory(item)}/>)}</ChipRow>
    {slow&&<LoadingSpinner/>}
    {visible.length||newcomers.length ? <>
      {promoted.length>0&&<><div className={s.featuredHeading}><h2 className={s.listHeading}><Image className={s.featuredIcon} src="/brand/featured-creators-v1.png" width={22} height={22} alt="" aria-hidden="true"/><span>주목할 크리에이터</span><Badge tone="outline" label="광고">AD</Badge></h2><InfoTooltip label="주목할 크리에이터 안내" content="홍보성 프로모션이 적용된 크리에이터나 해당 광고 상품을 이용중인 크리에이터가 노출될 수 있습니다."/></div><div className={s.creatorGrid}>{promoted.map(creator=><CreatorCard key={creator.id} creator={creator} href={`${basePath}/creator/${creator.id}`} following={following.includes(creator.id)} onFollow={()=>toggleFollow(creator.id)}/>)}</div></>}
      {newcomers.length>0&&<section className={s.newCreators} aria-labelledby="new-creators-title"><div className={s.featuredHeading}><h2 id="new-creators-title" className={s.listHeading}><Image className={s.featuredIcon} src="/brand/new-creators-sprout-v1.png" width={22} height={22} alt="" aria-hidden="true"/><span>신규 크리에이터</span></h2></div><div className={s.creatorGrid}>{newcomers.map(creator=><CreatorCard key={creator.id} creator={creator} href={`${basePath}/creator/${creator.id}`} following={following.includes(creator.id)} onFollow={()=>toggleFollow(creator.id)}/>)}</div></section>}
      {others.length>0&&<>{(promoted.length>0||newcomers.length>0)&&<h2 className={s.listHeading}>모든 크리에이터</h2>}<ul className={s.creatorList}>{others.map(creator=><li key={creator.id}><Link href={`${basePath}/creator/${creator.id}`} className={s.creatorRow}><Avatar creator={creator} size={36}/><span><strong><CreatorName person={creator}/></strong><small><MarqueeText text={`@${creator.handle}`}/></small></span></Link></li>)}</ul></>}
    </> : model.directory?.loading?null:creators.length||term||category!=='전체'?<Empty title="검색 결과가 없어요" description="다른 이름이나 카테고리로 찾아보세요." action={<Action variant="secondary" onClick={()=>{setQuery('');setCategory('전체');}}>전체 크리에이터 보기</Action>}/>:<Empty title="아직 크리에이터가 없어요" description="새로운 크리에이터를 기다려 주세요."/>}
    {model.directory?.hasMore&&<Action variant="secondary" disabled={model.directory.loading} onClick={()=>void model.directory?.loadMore()}>크리에이터 더 보기</Action>}
  </div>;
}

export function CreatorProfilePage({model,id,previewLogin}:{model:ServiceViewModel;id:string;previewLogin?:{label:string;onClick:()=>void}}){
  const router=useRouter();
  const {following,toggleFollow,basePath,subscriptions,data:{creators,posts}}=model;
  const plans=getCreatorPlans(model.data,id),onSale=plans.filter(plan=>plan.available!==false);
  const activePlanId=subscriptions.find(item=>item.creatorId===id&&item.status==='active')?.planId;
  const [tab,setTab]=useState('피드');
  const creator=creators.find(item=>item.id===id);
  if(!creator)return <Empty title="크리에이터를 찾을 수 없어요" description="다른 크리에이터를 둘러보세요." action={<TextLink href={`${basePath}/explore`}>크리에이터 둘러보기</TextLink>}/>;
  const ownPosts=posts.filter(post=>post.creatorId===id),mediaPosts=ownPosts.filter(post=>getPostMedia(post).length>0);
  const tabs:[string,number|null][]=[['피드',ownPosts.length],['미디어',mediaPosts.length],['소개',null]];
  const social=socialKeys.filter(key=>creator.links?.[key]).map(key=>[key,creator.links![key]!] as const);
  return <div className={s.profile}>
    <ProfileHeader cover={creator.cover??creator.image} coverPosition={creator.position} person={creator} handle={creator.handle} bio={creator.bio} tags={creator.tags} categoryIcons={model.data.categoryIcons} counts={[{label:'게시물',value:ownPosts.length},{label:'팔로워',private:creator.followersPublic===false,value:creator.followers,href:`${basePath}/followers?profile=${encodeURIComponent(creator.id)}`},{label:'팔로잉',private:creator.followingPublic===false||creator.followingCount===undefined,href:`${basePath}/following?profile=${encodeURIComponent(creator.id)}`,value:creator.followingCount!==undefined?creator.followingCount:<span className={s.lockedCount} role="img" aria-label="팔로잉 비공개" title="비공개"><Icon name="lock" width="16" height="16"/></span>}]} action={<FollowButton following={following.includes(id)} name={creator.name} onToggle={()=>toggleFollow(id)}/>}/>
    {model.mode==='mock'&&previewLogin&&<div className={s.profilePlans}><Action variant="secondary" className={s.previewLogin} onClick={previewLogin.onClick}>{previewLogin.label}</Action></div>}
    <TipButton creatorId={creator.id} name={creator.name} creator={creator} profile/>
    <section className={s.profilePlans} aria-labelledby="profile-plans"><h2 id="profile-plans">멤버십</h2>{onSale.length?<div className={s.planList}>{onSale.map(plan=><MembershipPlanCard key={plan.id} plan={plan} creator={creator} compact selected={plan.id===activePlanId} disabled={plan.id===activePlanId} actionLabel={plan.id===activePlanId?'가입 중':'가입하기'} onSelect={()=>router.push(`${basePath}/membership/${id}?plan=${plan.id}`)}/>)}</div>:<p className={s.noPlans}>판매 중인 멤버십이 없어요.</p>}</section>
    <div className={s.tabs} aria-label="프로필 내용">{tabs.map(([item,count])=><button key={item} type="button" aria-pressed={tab===item} onClick={()=>setTab(item)}>{item}{count!==null&&<span className={s.tabCount}>{count}</span>}</button>)}</div>
    {tab==='소개'?<section className={s.about}>{(creator.about||creator.bio)?<p>{creator.about||creator.bio}</p>:<p>아직 등록된 소개가 없습니다.</p>}{social.length>0&&<ul className={s.socialLinks} aria-label="SNS 링크">{social.map(([key,url])=><li key={key}><a href={url} target="_blank" rel="noopener noreferrer"><Icon name={key} width="16" height="16"/>{socialLabels[key]}</a></li>)}</ul>}</section>:tab==='피드'?(ownPosts.length?<div className={s.profileFeed}>{ownPosts.map(post=><PostCard key={post.id} post={post} model={model} context={ownPosts}/>)}{model.feedPaging?.hasMore?<Action variant="secondary" disabled={model.feedPaging.loading} onClick={()=>void model.feedPaging?.loadMore()}>더 보기<DelayedInlineSpinner loading={!!model.feedPaging.loading}/></Action>:<FeedEnd/>}</div>:<Empty title="아직 게시물이 없어요" description="팔로우하고 새로운 소식을 기다려 주세요."/>):<>{!mediaPosts.length?<Empty title={model.feedPaging?.hasMore?'불러온 게시물에 미디어가 없어요':'아직 미디어가 없어요'} description={model.feedPaging?.hasMore?'더 보기를 눌러 이전 게시물을 확인하세요.':'사진이나 동영상이 담긴 게시물이 올라오면 여기에 모여요.'}/>:<div className={s.postGrid}>{mediaPosts.map(post=><PostMediaTile key={post.id} post={post} model={model}/>)}</div>}{model.feedPaging?.hasMore&&<div className={s.profileFeed}><Action variant="secondary" disabled={model.feedPaging.loading} onClick={()=>void model.feedPaging?.loadMore()}>더 보기<DelayedInlineSpinner loading={model.feedPaging.loading}/></Action></div>}</>}
  </div>;
}

export function MembershipPage({model,id,initialPlanId}:{model:ServiceViewModel;id:string;initialPlanId?:string}){
  const router=useRouter();
  const {subscribe,basePath,data:{creators}}=model;
  const plans=getCreatorPlans(model.data,id).filter(plan=>plan.available!==false);
  const [selected,setSelected]=useState(initialPlanId||'');
  const [open,setOpen]=useState(false);
  const [agreed,setAgreed]=useState(false);
  const [shared,setShared]=useState(false);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const creator=creators.find(item=>item.id===id);
  const plan=plans.find(item=>item.id===selected)||plans.find(item=>item.recommended)||plans[0];
  const nextDate=model.nextRenewAt;
  useEffect(()=>{setAgreed(false);setShared(false);},[id,plan?.id,plan?.price,nextDate]);
  if(!creator)return <Empty title="멤버십을 찾을 수 없어요" action={<TextLink href={`${basePath}/explore`}>크리에이터 둘러보기</TextLink>}/>;
  if(!plan)return <Empty title="아직 멤버십이 없어요" description="이용 가능한 멤버십이 등록되지 않았습니다."/>;
  const selectPlan=(planId:string)=>{setSelected(planId);setAgreed(false);setShared(false);setError('');setOpen(true);};
  const confirmMembership=async()=>{
    if(pending||!agreed||!shared)return;
    setPending(true);setError('');
    try{
      const result=await subscribe(id,plan.id);
      if(!result.success){setError(result.errorMessage);return;}
      setOpen(false);router.push(result.data.nextPath||`${basePath}/subscriptions`);
    }finally{setPending(false);}
  };
  return <div className={s.membership}>
    <div className={s.membershipHeading}><div className={s.membershipCreator}><Avatar creator={creator} size={48}/><strong><CreatorName person={creator}/></strong></div><h1>멤버십에 가입하세요</h1><p>지금, 더 특별한 이야기가 기다리고 있어요.</p></div>
    <div className={s.planGrid}>{plans.map(item=><MembershipPlanCard key={item.id} plan={item} selected={item.id===plan.id} disabled={pending} onSelect={()=>selectPlan(item.id)}/>)}</div>
    <div className={s.selectionSummary}><strong><MarqueeText text={plan.name}/><span className={s.planLevel}>월 {money(plan.price)}</span></strong><span>매월 자동 갱신 · 결제 전 최종 확인</span></div>
    <section className={s.beforeSubscribe}><h2>구독 전 확인하세요</h2><div className={s.benefitGrid}><div><Icon name="card"/><h3>월간 멤버십</h3><p>선택한 혜택과 금액을 확인하세요.</p></div><div><Icon name="check"/><h3>결제 전 확인</h3><p>확인 화면에서 내용을 검토하세요.</p></div><div><Icon name="users"/><h3>함께하는 창작</h3><p>크리에이터의 이야기를 응원해요.</p></div></div></section>
    
    <Dialog open={open} onClose={()=>setOpen(false)} title="멤버십 선택 확인">
      <div className={s.dialogContent}><div className={s.dialogCreator}><Avatar creator={creator}/><div><strong><CreatorName person={creator}/></strong><MarqueeText text={plan.name}/></div></div>
        <dl className={s.summaryRows}><div><dt>월 이용 금액</dt><dd>{money(plan.price)}</dd></div><div><dt>다음 갱신일</dt><dd>{nextDate?date(nextDate):'결제 단계에서 확인'}</dd></div><div><dt>갱신 방식</dt><dd>매월 자동 갱신</dd></div></dl>
        <p className={s.helper}>갱신을 해지하면 다음 자동 갱신을 중단하고, 이용 기간 종료일까지 혜택을 유지합니다.</p>
        
        <Checkbox label="선택한 멤버십, 금액, 갱신 내용을 확인했습니다." checked={agreed} disabled={pending} onChange={setAgreed}/>
        <dl className={s.summaryRows} aria-label="크리에이터에게 제공하는 정보"><div><dt>받는 사람</dt><dd>{CREATOR_PROVISION.recipient}</dd></div><div><dt>제공 항목</dt><dd>{CREATOR_PROVISION.items}</dd></div><div><dt>목적</dt><dd>{CREATOR_PROVISION.purpose}</dd></div><div><dt>보유 기간</dt><dd>{CREATOR_PROVISION.retention}</dd></div></dl>
        <p className={s.helper}>{CREATOR_PROVISION.refusal}</p>
        <Checkbox label="(필수) 위 정보를 크리에이터에게 제공하는 데 동의합니다." checked={shared} disabled={pending} onChange={setShared}/>
        {error&&<p className={s.error} role="alert">{error}</p>}
        <DialogActions style={{marginTop:5}}><Action variant="secondary" disabled={pending} onClick={()=>setOpen(false)}>다시 선택</Action><Action variant="brand" disabled={!agreed||!shared||pending} aria-busy={pending} onClick={confirmMembership}>{pending?'확인 중…':'확인하고 계속'}</Action></DialogActions>
      </div>
    </Dialog>
  </div>;
}

export function SubscriptionsPage({model}:{model:ServiceViewModel}){
  const {subscriptions,cancelSubscription,resumeSubscription,basePath,data:{creators,paymentHistory}}=model;
  const searchParams=useSearchParams(),router=useRouter();
  const requestedTab=searchParams.get('tab')==='payments'?'결제 내역':'내 구독';
  const [tab,setTab]=useState(requestedTab);
  useEffect(()=>{setTab(requestedTab);},[requestedTab]);
  const [cancelling,setCancelling]=useState<Subscription|null>(null);
  const [resuming,setResuming]=useState<Subscription|null>(null);
  const [resumeAgreed,setResumeAgreed]=useState(false);
  const resumeLock=useRef(false);
  const [receipt,setReceipt]=useState<Subscription|null>(null);
  const [message,setMessage]=useSnackbarMessage();
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const active=subscriptions.filter(item=>item.status!=='expired'&&!item.renewalPending);
  const recovering=subscriptions.filter(item=>item.renewalPending);
  const expired=subscriptions.filter(item=>item.status==='expired'&&!item.renewalPending);
  const card=(subscription:Subscription,index:number)=>{
    const creator=creators.find(item=>item.id===subscription.creatorId);
    const plan=getSubscriptionPlan(model.data,subscription);
    if(!creator||!plan)return <Empty key={`${subscription.creatorId}-${subscription.planId}-${subscription.renewAt}-${index}`} title="멤버십 정보를 확인할 수 없어요" description="크리에이터 또는 멤버십 정보가 제공되지 않았습니다."/>;
    return <article key={`${subscription.creatorId}-${subscription.planId}-${subscription.renewAt}-${index}`} className={s.subscriptionCard}>
      <Link href={`${basePath}/creator/${creator.id}`} className={s.subscriptionIdentity}><MembershipThumb image={plan.image} name={plan.name} creator={creator} size={54}/><div><h3><CreatorName person={creator}/></h3><MarqueeText text={plan.name}/><p>{money(subscription.price)} /월</p><span>{subscription.status==='active'?'다음 갱신':subscription.status==='cancelled'?'이용 종료':'기간 종료'} {date(subscription.renewAt)}</span></div></Link>
      <div className={s.subscriptionEnd}>{subscription.status!=='cancelled'&&<span className={s.status} data-status={subscription.status}>{subscription.renewalPending?'갱신 결제 대기':statusLabels[subscription.status]}</span>}{subscription.status==='active'||subscription.renewalPending?<Action variant="secondary" disabled={pending} onClick={()=>{setError('');setCancelling(subscription);}}>갱신 해지</Action>:subscription.status==='cancelled'?<><Action variant="secondary" disabled={pending} onClick={()=>{setError('');setResumeAgreed(false);setResuming(subscription);}}>다시 이용할래요</Action><small>종료일까지 이용 가능</small></>:<TextLink href={`${basePath}/membership/${creator.id}`}>멤버십 보기</TextLink>}</div>
      {subscription.renewalPending&&<div className={s.billingIssue} role="status"><p>{subscription.billingIssue==='action_required'?'결제수단 변경이 필요합니다.':subscription.billingIssue==='retrying'?'정기결제에 실패해 다시 결제할 예정입니다.':'정기결제 결과를 확인하고 있습니다.'} 결제한 이용기간 이후에는 멤버십 콘텐츠를 볼 수 없습니다.</p>{subscription.retryAt&&<p>다음 시도: {new Date(subscription.retryAt).toLocaleString('ko-KR')}</p>}{subscription.billingIssue&&<><p>복구 기간 안에 새 카드를 기본으로 설정하면 갱신을 다시 시도합니다.</p><TextLink href={`${basePath}/payment-methods`}>결제수단 변경</TextLink></>}</div>}
    </article>;
  };
  const confirmCancellation=async()=>{
    if(!cancelling||pending)return;
    setPending(true);setError('');setMessage('');
    try{
      const result=await cancelSubscription(cancelling.creatorId);
      if(!result.success){setError(result.errorMessage);return;}
      setMessage(result.data.message);setCancelling(null);
    }finally{setPending(false);}
  };
  const confirmResumption=async()=>{
    if(!resuming||!resumeAgreed||pending||resumeLock.current)return;
    resumeLock.current=true;setPending(true);setError('');setMessage('');
    try{
      const result=await resumeSubscription(resuming,PAYMENT_TERMS.version);
      if(!result.success){setError(result.errorMessage);return;}
      setMessage(result.data.message);setResuming(null);setResumeAgreed(false);
    }finally{resumeLock.current=false;setPending(false);}
  };
  return <div className={s.subscriptions} data-pull-refresh-block={pending||undefined}>
    <PageTitle>{tab}</PageTitle>
    <div className={s.tabs} aria-label="구독과 결제">{['내 구독','결제 내역'].map(item=><button key={item} type="button" aria-pressed={tab===item} onClick={()=>{setTab(item);router.push(`${basePath}/subscriptions${item==='결제 내역'?'?tab=payments':''}`,{scroll:false});}}>{item}</button>)}</div>
    <Toast message={message} onClose={()=>setMessage('')}/>
    {tab==='내 구독'?<>
      <section className={s.subscriptionSection}><h2>현재 이용 중인 멤버십</h2>{active.length?active.map(card):<Empty title="이용 중인 멤버십이 없어요" action={<TextLink href={`${basePath}/explore`}>크리에이터 둘러보기</TextLink>}/>}</section>
      {recovering.length>0&&<section className={s.subscriptionSection}><h2>갱신 결제 대기</h2>{recovering.map(card)}</section>}
      <section className={s.subscriptionSection}><h2>구독 히스토리</h2>{expired.length?expired.map(card):<p className={s.helper}>종료된 구독이 없습니다.</p>}</section>
    </>:<section className={s.subscriptionSection}><h2>결제 내역</h2>{paymentHistory.length?<div className={s.receiptList}>{paymentHistory.map((item,index)=>{
      const creator=creators.find(c=>c.id===item.creatorId);
      const plan=getSubscriptionPlan(model.data,item);
      return <button type="button" key={`${item.creatorId}-${item.planId}-${item.renewAt}-${index}`} className={s.receiptRow} onClick={()=>{setReceipt(item);setError('');}}><span><strong><MarqueeText text={`${creator?.name||'크리에이터 정보 없음'} · ${plan?.name||'멤버십 정보 없음'}`}/></strong><small>{item.paidAt?`${date(item.paidAt)}${item.paymentStatus==='refunded'?' · 환불 완료':item.paymentStatus==='refunding'?' · 환불 확인 중':''}`:`결제 내역 ${index+1}`}</small></span><span><strong>{money(item.price)}</strong><small>상세 보기 <Icon name="chevron" width="12" height="12"/></small></span></button>;
    })}</div>:<Empty title="아직 결제 내역이 없어요"/>}</section>}
    <SubscriptionResumeDialog subscription={resuming} planName={resuming?getSubscriptionPlan(model.data,resuming)?.name||'멤버십':''} basePath={basePath} agreed={resumeAgreed} pending={pending} error={error} onAgree={setResumeAgreed} onClose={()=>setResuming(null)} onConfirm={confirmResumption}/>
    <Dialog open={!!cancelling} onClose={()=>setCancelling(null)} title="다음 갱신을 해지할까요?">
      {cancelling&&<div className={s.dialogContent}><p>{cancelling.renewalPending?'결제 대기 중인 갱신을 중단합니다. ' : ''}<MarqueeText text={`${creators.find(item=>item.id===cancelling.creatorId)?.name||'크리에이터'}님의 멤버십`}/> <strong>{date(cancelling.renewAt)}</strong>까지 이용할 수 있습니다.</p><p className={s.helper}>해지 후 다음 자동 갱신이 중단됩니다. 남은 이용 기간 동안 멤버십 콘텐츠 이용 권한은 유지됩니다.</p>{error&&<p className={s.error} role="alert">{error}</p>}<DialogActions style={{marginTop:5}}><Action variant="secondary" disabled={pending} onClick={()=>setCancelling(null)}>구독 유지</Action><Action variant="danger" disabled={pending} aria-busy={pending} onClick={confirmCancellation}>{pending?'해지 중…':'갱신 해지하기'}</Action></DialogActions></div>}
    </Dialog>
    <Dialog open={!!receipt} onClose={()=>{if(!pending)setReceipt(null);}} title="결제 상세">
      {receipt&&<div className={s.dialogContent}><dl className={s.summaryRows}><div><dt>판매자</dt><dd><MarqueeText text={creators.find(item=>item.id===receipt.creatorId)?.name||'정보 없음'}/></dd></div><div><dt>멤버십</dt><dd><MarqueeText text={getSubscriptionPlan(model.data,receipt)?.name||'정보 없음'}/></dd></div><div><dt>금액</dt><dd>{money(receipt.price)}</dd></div><div><dt>{receipt.paidAt?'결제일':'이용 기간 종료'}</dt><dd>{date(receipt.paidAt||receipt.renewAt)}</dd></div></dl>{/* 2026-11-07: 결제 상세(계약내용 서면)에도 판매자와 통신판매중개자 고지를 같은 글씨 크기(.dialogContent 14px 상속)로 표시. 시행규칙 제11조의2 */}<p>{intermediaryNotice}</p>{error&&<p className={s.error} role="alert">{error}</p>}<DialogActions><Action variant="secondary" disabled={pending} onClick={()=>setReceipt(null)}>닫기</Action>{receipt.paymentStatus==='refunding'&&<p role="status">환불 결과를 확인 중입니다.</p>}{receipt.paymentStatus==='refunded'&&<p role="status">환불 완료</p>}</DialogActions></div>}
    </Dialog>
  </div>;
}
