'use client';

import {DialogActions} from '@/components/ui/DialogActions';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {TextLink} from '@/components/ui/TextLink';
import {Checkbox} from '@/components/ui/Choice';
import {getCreatorPlans,getSubscriptionPlan} from '@/lib/crefans/membership-plans';
import {useRouter,useSearchParams} from 'next/navigation';
import {Chip,Dialog} from '@/components/ui/Primitives';
import {ChipRow} from '@/components/ui/ChipRow';
import Icon from './Icon';
import {CreatorCard} from './CreatorCard';
import {MembershipPlanCard} from './MembershipPlanCard';
import {FollowButton} from './FollowButton';
import {ProfileHeader} from './ProfileHeader';
import {FeedEnd,PostCard} from './SocialPages';
import {Action,Avatar,Empty,Notice,PageTitle} from './ServiceUI';
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
  const visible=creators.filter(creator=>creator.isCreator!==false&&creator.searchable!==false&&(category==='전체'||creator.tags.includes(category))&&`${creator.name} ${creator.handle} ${creator.tags.join(' ')} ${creator.bio}`.toLocaleLowerCase().includes(term));
  /** Paid placements get the full card; everyone else is a one-line row so the page stays light as the roster grows. */
  const promoted=visible.filter(creator=>creator.promoted),others=visible.filter(creator=>!creator.promoted);
  return <div className={s.explore}>
    <h1 className={s.srOnly}>탐색하기</h1>
    <label className={s.search}><Icon name="search"/><span className={s.srOnly}>크리에이터 검색</span><input value={query} onChange={event=>setQuery(event.target.value)} type="search" placeholder="크리에이터, 태그, 키워드로 검색해보세요"/></label>
    <ChipRow className={s.filters} label="크리에이터 카테고리">{['전체',...categories.filter(item=>item!=='전체')].map(item=><Chip key={item} selected={category===item} onClick={()=>setCategory(item)}>{item}</Chip>)}</ChipRow>
    {model.directory?.loading&&<p role="status">크리에이터를 불러오는 중…</p>}
    {visible.length ? <>
      {promoted.length>0&&<><h2 className={`${s.listHeading} ${s.featuredHeading}`}>주목할 크리에이터</h2><div className={s.creatorGrid}>{promoted.map(creator=><CreatorCard key={creator.id} creator={creator} href={`${basePath}/creator/${creator.id}`} following={following.includes(creator.id)} onFollow={()=>toggleFollow(creator.id)}/>)}</div></>}
      {others.length>0&&<>{promoted.length>0&&<h2 className={s.listHeading}>모든 크리에이터</h2>}<ul className={s.creatorList}>{others.map(creator=><li key={creator.id}><Link href={`${basePath}/creator/${creator.id}`} className={s.creatorRow}><Avatar creator={creator} size={36}/><span><strong>{creator.name}</strong><small>@{creator.handle}</small></span></Link></li>)}</ul></>}
    </> : model.directory?.loading?null:creators.length||term||category!=='전체'?<Empty title="검색 결과가 없어요" description="다른 이름이나 카테고리로 찾아보세요." action={<Action variant="secondary" onClick={()=>{setQuery('');setCategory('전체');}}>전체 크리에이터 보기</Action>}/>:<Empty title="아직 크리에이터가 없어요" description="새로운 크리에이터를 기다려 주세요."/>}
    {model.directory?.hasMore&&<Action variant="secondary" disabled={model.directory.loading} onClick={()=>void model.directory?.loadMore()}>크리에이터 더 보기</Action>}
  </div>;
}

export function CreatorProfilePage({model,id}:{model:ServiceViewModel;id:string}){
  const router=useRouter();
  const {following,toggleFollow,canAccess,basePath,subscriptions,data:{creators,posts}}=model;
  const plans=getCreatorPlans(model.data,id),onSale=plans.filter(plan=>plan.available!==false);
  const activePlanId=subscriptions.find(item=>item.creatorId===id&&item.status==='active')?.planId;
  const [tab,setTab]=useState('피드');
  const creator=creators.find(item=>item.id===id);
  if(!creator)return <Empty title="크리에이터를 찾을 수 없어요" description="다른 크리에이터를 둘러보세요." action={<TextLink href={`${basePath}/explore`}>크리에이터 둘러보기</TextLink>}/>;
  const ownPosts=posts.filter(post=>post.creatorId===id),mediaPosts=ownPosts.filter(post=>post.image||post.media?.length);
  const tabs:[string,number|null][]=[['피드',ownPosts.length],['미디어',mediaPosts.length],['소개',null]];
  const social=socialKeys.filter(key=>creator.links?.[key]).map(key=>[key,creator.links![key]!] as const);
  return <div className={s.profile}>
    <ProfileHeader cover={creator.cover??creator.image} coverPosition={creator.position} person={creator} handle={creator.handle} bio={creator.bio} tags={creator.tags} counts={[{label:'게시물',value:ownPosts.length},{label:'팔로워',value:creator.followers},{label:'팔로잉',value:creator.followingCount!==undefined?creator.followingCount:<span className={s.lockedCount} role="img" aria-label="팔로잉 비공개" title="비공개"><Icon name="lock" width="16" height="16"/></span>}]} action={<FollowButton following={following.includes(id)} name={creator.name} onToggle={()=>toggleFollow(id)}/>}/>
    <section className={s.profilePlans} aria-labelledby="profile-plans"><h2 id="profile-plans">멤버십</h2>{onSale.length?<div className={s.planList}>{onSale.map(plan=><MembershipPlanCard key={plan.id} plan={plan} compact selected={plan.id===activePlanId} disabled={plan.id===activePlanId} actionLabel={plan.id===activePlanId?'가입 중':'가입하기'} onSelect={()=>router.push(`${basePath}/membership/${id}?plan=${plan.id}`)}/>)}</div>:<p className={s.noPlans}>판매 중인 멤버십이 없어요.</p>}</section>
    <div className={s.tabs} aria-label="프로필 내용">{tabs.map(([item,count])=><button key={item} type="button" aria-pressed={tab===item} onClick={()=>setTab(item)}>{item}{count!==null&&<span className={s.tabCount}>{count}</span>}</button>)}</div>
    {tab==='소개'?<section className={s.about}>{(creator.about||creator.bio)?<p>{creator.about||creator.bio}</p>:<p>아직 등록된 소개가 없습니다.</p>}{social.length>0&&<ul className={s.socialLinks} aria-label="SNS 링크">{social.map(([key,url])=><li key={key}><a href={url} target="_blank" rel="noopener noreferrer"><Icon name={key} width="16" height="16"/>{socialLabels[key]}</a></li>)}</ul>}</section>:tab==='피드'?(ownPosts.length?<div className={s.profileFeed}>{ownPosts.map(post=><PostCard key={post.id} post={post} model={model} context={ownPosts}/>)}{model.feedPaging?.hasMore?<Action variant="secondary" disabled={model.feedPaging.loading} onClick={()=>void model.feedPaging?.loadMore()}>{model.feedPaging.loading?'불러오는 중…':'더 보기'}</Action>:<FeedEnd/>}</div>:<Empty title="아직 게시물이 없어요" description="팔로우하고 새로운 소식을 기다려 주세요."/>):!mediaPosts.length?<Empty title="아직 미디어가 없어요" description="사진이나 동영상이 담긴 게시물이 올라오면 여기에 모여요."/>:<div className={s.postGrid}>{mediaPosts.map(post=>{
      const accessible=post.canAccess??canAccess(id,post.requiredRank,post.requiredPlanId);
      const requiredPlan=plans.find(plan=>post.requiredPlanId?plan.id===post.requiredPlanId:plan.rank===post.requiredRank);
      const planLabel=requiredPlan?`${requiredPlan.name}${post.requiredPlanId?'':' 이상'}`:undefined;
      const accessLabel=planLabel?`${planLabel} 멤버에게 공개`:'멤버십 전용 콘텐츠';
      return <Link className={s.postTile} key={post.id} href={`${basePath}/post/${post.id}`} aria-label={`${post.title}${accessible?'':` · ${accessLabel}`}`}>
        {accessible?(post.image?<img src={post.image} style={{objectPosition:post.position}} alt={post.title}/>:<div className={s.lockedTile}><Icon name="card"/><span>텍스트 게시물</span></div>):<div className={s.lockedTile}><Icon name="lock"/><span>{planLabel||'멤버 전용'}</span></div>}
        {post.requiredRank>0&&accessible&&<span className={s.memberLabel}>멤버 전용</span>}
      </Link>;
    })}</div>}
  </div>;
}

export function MembershipPage({model,id,initialPlanId}:{model:ServiceViewModel;id:string;initialPlanId?:string}){
  const router=useRouter();
  const {subscribe,basePath,data:{creators}}=model;
  const plans=getCreatorPlans(model.data,id).filter(plan=>plan.available!==false);
  const [selected,setSelected]=useState(initialPlanId||'');
  const [open,setOpen]=useState(false);
  const [agreed,setAgreed]=useState(false);
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const creator=creators.find(item=>item.id===id);
  const plan=plans.find(item=>item.id===selected)||plans.find(item=>item.recommended)||plans[0];
  const nextDate=model.nextRenewAt;
  useEffect(()=>{setAgreed(false);},[id,plan?.id,plan?.price,nextDate]);
  if(!creator)return <Empty title="멤버십을 찾을 수 없어요" action={<TextLink href={`${basePath}/explore`}>크리에이터 둘러보기</TextLink>}/>;
  if(!plan)return <Empty title="아직 멤버십이 없어요" description="이용 가능한 멤버십이 등록되지 않았습니다." action={<TextLink href={`${basePath}/creator/${id}`}>{creator.name}의 프로필 보기</TextLink>}/>;
  const selectPlan=(planId:string)=>{setSelected(planId);setAgreed(false);setError('');setOpen(true);};
  const confirmMembership=async()=>{
    if(pending||!agreed)return;
    setPending(true);setError('');
    try{
      const result=await subscribe(id,plan.id);
      if(!result.success){setError(result.errorMessage);return;}
      setOpen(false);router.push(result.data.nextPath||`${basePath}/subscriptions`);
    }finally{setPending(false);}
  };
  return <div className={s.membership}>
    <div className={s.membershipHeading}><TextLink href={`${basePath}/creator/${id}`} className={s.backLink}>{creator.name}의 프로필</TextLink><h1>{creator.name}의 멤버십에 가입하세요</h1><p>지금, 더 특별한 이야기가 기다리고 있어요.</p></div>
    <div className={s.planGrid}>{plans.map(item=><MembershipPlanCard key={item.id} plan={item} selected={item.id===plan.id} disabled={pending} onSelect={()=>selectPlan(item.id)}/>)}</div>
    <div className={s.selectionSummary}><strong>{plan.name} · 월 {money(plan.price)}</strong><span>매월 자동 갱신 · 결제 전 최종 확인</span></div>
    <section className={s.beforeSubscribe}><h2>구독 전 확인하세요</h2><div className={s.benefitGrid}><div><Icon name="card"/><h3>월간 멤버십</h3><p>선택한 혜택과 금액을 확인하세요.</p></div><div><Icon name="check"/><h3>결제 전 확인</h3><p>확인 화면에서 내용을 검토하세요.</p></div><div><Icon name="users"/><h3>함께하는 창작</h3><p>크리에이터의 이야기를 응원해요.</p></div></div></section>
    
    <Dialog open={open} onClose={()=>setOpen(false)} title="멤버십 선택 확인">
      <div className={s.dialogContent}><div className={s.dialogCreator}><Avatar creator={creator}/><div><strong>{creator.name}</strong><span>{plan.name} 멤버십</span></div></div>
        <dl className={s.summaryRows}><div><dt>월 이용 금액</dt><dd>{money(plan.price)}</dd></div><div><dt>다음 갱신일</dt><dd>{nextDate?date(nextDate):'결제 단계에서 확인'}</dd></div><div><dt>갱신 방식</dt><dd>매월 자동 갱신</dd></div></dl>
        <p className={s.helper}>갱신을 해지하면 다음 자동 갱신을 중단하고, 이용 기간 종료일까지 혜택을 유지합니다.</p>
        
        <Checkbox label="선택한 멤버십, 금액, 갱신 내용을 확인했습니다." checked={agreed} disabled={pending} onChange={setAgreed}/>
        {error&&<p className={s.error} role="alert">{error}</p>}
        <DialogActions style={{marginTop:5}}><Action variant="secondary" disabled={pending} onClick={()=>setOpen(false)}>다시 선택</Action><Action variant="brand" disabled={!agreed||pending} aria-busy={pending} onClick={confirmMembership}>{pending?'확인 중…':'확인하고 계속'}</Action></DialogActions>
      </div>
    </Dialog>
  </div>;
}

export function SubscriptionsPage({model}:{model:ServiceViewModel}){
  const {subscriptions,cancelSubscription,basePath,data:{creators,paymentHistory}}=model;
  const searchParams=useSearchParams(),router=useRouter();
  const requestedTab=searchParams.get('tab')==='payments'?'결제 내역':'내 구독';
  const [tab,setTab]=useState(requestedTab);
  useEffect(()=>{setTab(requestedTab);},[requestedTab]);
  const [cancelling,setCancelling]=useState<Subscription|null>(null);
  const [receipt,setReceipt]=useState<Subscription|null>(null);
  const [message,setMessage]=useState('');
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const active=subscriptions.filter(item=>item.status!=='expired');
  const expired=subscriptions.filter(item=>item.status==='expired');
  const card=(subscription:Subscription,index:number)=>{
    const creator=creators.find(item=>item.id===subscription.creatorId);
    const plan=getSubscriptionPlan(model.data,subscription);
    if(!creator||!plan)return <Empty key={`${subscription.creatorId}-${subscription.planId}-${subscription.renewAt}-${index}`} title="멤버십 정보를 확인할 수 없어요" description="크리에이터 또는 멤버십 정보가 제공되지 않았습니다."/>;
    return <article key={`${subscription.creatorId}-${subscription.planId}-${subscription.renewAt}-${index}`} className={s.subscriptionCard}>
      <Link href={`${basePath}/creator/${creator.id}`} className={s.subscriptionIdentity}><Avatar creator={creator} size={54}/><div><h3>{creator.name} · {plan.name}</h3><p>{money(subscription.price)} /월</p><span>{subscription.status==='active'?'다음 갱신':subscription.status==='cancelled'?'이용 종료':'기간 종료'} {date(subscription.renewAt)}</span></div></Link>
      <div className={s.subscriptionEnd}><span className={s.status} data-status={subscription.status}>{statusLabels[subscription.status]}</span>{subscription.status==='active'?<Action variant="secondary" disabled={pending} onClick={()=>{setError('');setCancelling(subscription);}}>갱신 해지</Action>:subscription.status==='cancelled'?<small>종료일까지 이용 가능</small>:<TextLink href={`${basePath}/membership/${creator.id}`}>멤버십 보기</TextLink>}</div>
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
  return <div className={s.subscriptions}>
    <PageTitle>{tab}</PageTitle>
    <div className={s.tabs} aria-label="구독과 결제">{['내 구독','결제 내역'].map(item=><button key={item} type="button" aria-pressed={tab===item} onClick={()=>{setTab(item);router.push(`${basePath}/subscriptions${item==='결제 내역'?'?tab=payments':''}`,{scroll:false});}}>{item}</button>)}</div>
    <div role="status" aria-live="polite">{message&&<Notice>{message}</Notice>}</div>
    {tab==='내 구독'?<>
      <section className={s.subscriptionSection}><h2>현재 이용 중인 멤버십</h2>{active.length?active.map(card):<Empty title="이용 중인 멤버십이 없어요" action={<TextLink href={`${basePath}/explore`}>크리에이터 둘러보기</TextLink>}/>}</section>
      <section className={s.subscriptionSection}><h2>구독 히스토리</h2>{expired.length?expired.map(card):<p className={s.helper}>종료된 구독이 없습니다.</p>}</section>
    </>:<section className={s.subscriptionSection}><h2>결제 내역</h2>{paymentHistory.length?<div className={s.receiptList}>{paymentHistory.map((item,index)=>{
      const creator=creators.find(c=>c.id===item.creatorId);
      const plan=getSubscriptionPlan(model.data,item);
      return <button type="button" key={`${item.creatorId}-${item.planId}-${item.renewAt}-${index}`} className={s.receiptRow} onClick={()=>{setReceipt(item);setError('');}}><span><strong>{creator?.name||'크리에이터 정보 없음'} · {plan?.name||'멤버십 정보 없음'}</strong><small>{item.paidAt?`${date(item.paidAt)}${item.paymentStatus==='refunded'?' · 환불 완료':item.paymentStatus==='refunding'?' · 환불 확인 중':''}`:`결제 내역 ${index+1}`}</small></span><span><strong>{money(item.price)}</strong><small>상세 보기 <Icon name="chevron" width="12" height="12"/></small></span></button>;
    })}</div>:<Empty title="아직 결제 내역이 없어요"/>}</section>}
    <Dialog open={!!cancelling} onClose={()=>setCancelling(null)} title="다음 갱신을 해지할까요?">
      {cancelling&&<div className={s.dialogContent}><p>{creators.find(item=>item.id===cancelling.creatorId)?.name}의 멤버십은 <strong>{date(cancelling.renewAt)}</strong>까지 이용할 수 있습니다.</p><p className={s.helper}>해지 후 다음 자동 갱신이 중단됩니다. 남은 이용 기간 동안 멤버십 콘텐츠 이용 권한은 유지됩니다.</p>{error&&<p className={s.error} role="alert">{error}</p>}<DialogActions style={{marginTop:5}}><Action variant="secondary" disabled={pending} onClick={()=>setCancelling(null)}>구독 유지</Action><Action variant="danger" disabled={pending} aria-busy={pending} onClick={confirmCancellation}>{pending?'해지 중…':'갱신 해지하기'}</Action></DialogActions></div>}
    </Dialog>
    <Dialog open={!!receipt} onClose={()=>{if(!pending)setReceipt(null);}} title="결제 상세">
      {receipt&&<div className={s.dialogContent}><dl className={s.summaryRows}><div><dt>크리에이터</dt><dd>{creators.find(item=>item.id===receipt.creatorId)?.name||'정보 없음'}</dd></div><div><dt>멤버십</dt><dd>{getSubscriptionPlan(model.data,receipt)?.name||'정보 없음'}</dd></div><div><dt>금액</dt><dd>{money(receipt.price)}</dd></div><div><dt>{receipt.paidAt?'결제일':'이용 기간 종료'}</dt><dd>{date(receipt.paidAt||receipt.renewAt)}</dd></div></dl>{error&&<p className={s.error} role="alert">{error}</p>}<DialogActions><Action variant="secondary" disabled={pending} onClick={()=>setReceipt(null)}>닫기</Action>{receipt.paymentStatus==='refunding'&&<p role="status">환불 결과를 확인 중입니다.</p>}{receipt.paymentStatus==='refunded'&&<p role="status">환불 완료</p>}</DialogActions></div>}
    </Dialog>
  </div>;
}
