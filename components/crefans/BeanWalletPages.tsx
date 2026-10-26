'use client';
import Link from 'next/link';
import {BeanTipSource} from './BeanAttribution';
import {beanOrderNumber,beanHistoryQuery,emptyBeanHistoryFilters,type BeanHistoryFilters} from '@/lib/crefans/bean-history';
import {SelectField} from '@/components/ui/SelectField';
import {ChipRow} from '@/components/ui/ChipRow';
import {Chip} from '@/components/ui/Primitives';
import {CreatorSearch} from './CreatorSearch';
import {useEffect,useRef,useState} from 'react';
import {InfoTooltip} from '@/components/ui/InfoTooltip';
import {beanPriceNotice} from '@/lib/crefans/bean-pricing';
import type {BeanCharge,BeanModel,BeanWallet} from '@/types/crefans-beans';
import {useBeans} from './BeanContext';
import {BeanBalanceSummary} from './BeanBalanceSummary';
import {CreatorName} from './CreatorName';
import {BackButton} from './BackButton';
import {Action,Empty,PageTitle} from './ServiceUI';
import {SignInPrompt} from './SignInPrompt';
import Icon from './Icon';
import s from './beans.module.css';

export type BeanHistoryKind='charges'|'history'|'tips';
const titles={charges:'충전 주문',history:'콩 이동 내역',tips:'보낸 후원'};
const statusNames:Record<string,string>={pending:'결제 대기',processing:'확인 중',paid:'충전 완료',failed:'결제 실패',cancelled:'취소',disputed:'확인 필요'};
const beans=(n:number|string)=>Number(n).toLocaleString('ko-KR')+'콩';
const won=(n:number)=>n.toLocaleString('ko-KR')+'원';
const date=(value:string)=>new Date(value).toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Seoul'});

export function BeanChargeLink({basePath}:{basePath:string}){
 return <Link className={s.walletCharge} href={`${basePath}/beans/charge`}><img src="/brand/beans/soft3d-v2/10.png" alt="" width={36} height={36}/><span>콩 충전</span></Link>;
}
export function BeanWalletOverview({basePath,wallet,loading,error}:{basePath:string;wallet:BeanWallet|null;loading:boolean;error:string}){
 return <section className={`${s.page} ${s.walletPage}`}>
  <PageTitle back={<BackButton href={`${basePath}/me`} label="내 프로필로 돌아가기"/>} action={<InfoTooltip label="콩 단위 안내" content={beanPriceNotice}/>}>지갑</PageTitle>
  {error&&<p role="alert">{error}</p>}
  <BeanBalanceSummary wallet={wallet} loading={loading} action={<BeanChargeLink basePath={basePath}/>}/>
  <nav className={s.walletLinks} aria-label="지갑 내역">
   {(['charges','history','tips'] as const).map(kind=><Link key={kind} href={`${basePath}/beans/${kind}`}><Icon name={kind==='charges'?'card':kind==='history'?'arrow':'heart'} width={26} height={26}/><span>{titles[kind]}</span><Icon name="chevron" width={16} height={16}/></Link>)}
  </nav>
 </section>;
}
export function BeanWalletPage(){
 const model=useBeans();
 if(!model?.enabled)return <p>콩 후원을 준비 중입니다.</p>;
 if(!model.signedIn)return <SignInPrompt basePath={model.basePath}/>;
 return <BeanWalletOverview basePath={model.basePath} wallet={model.wallet} loading={model.loading} error={model.error}/>;
}

const periods=[['all','전체 기간'],['1','최근 1개월'],['3','최근 3개월'],['6','최근 6개월'],['12','최근 1년']];
function HistoryFilters({kind,value,onChange,disabled}:{kind:BeanHistoryKind;value:BeanHistoryFilters;onChange:(value:BeanHistoryFilters)=>void;disabled:boolean}){
 const [search,setSearch]=useState(value.search);
 useEffect(()=>setSearch(value.search),[value.search,kind]);
 const active=value.period!=='all'||value.status!=='all'||value.direction!=='all'||!!value.search;
 return <div className={s.historyFilters}>
  {kind==='tips'&&<form className={s.historySearch} onSubmit={event=>{event.preventDefault();if(!disabled&&search.trim().length<=100)onChange({...value,search:search.trim()});}}><CreatorSearch label="후원 검색" maxLength={100} placeholder="크리에이터, 게시물, 메시지 검색" value={search} onChange={setSearch} disabled={disabled}/><Action type="submit" variant="secondary" disabled={disabled||search.trim().length>100}>검색</Action></form>}
  <fieldset className={s.historyFilterGroup} disabled={disabled}><legend className={s.srOnly}>조회 기간</legend><ChipRow label="조회 기간" className={s.historyPeriods}>{periods.map(([key,label])=><Chip key={key} selected={value.period===key} onClick={()=>onChange({...value,period:key})}>{label}</Chip>)}</ChipRow></fieldset>
  <div className={s.historyFilterBottom}>
   {kind==='charges'&&<SelectField label="결제 상태" hideLabel value={value.status} onChange={status=>onChange({...value,status})} disabled={disabled} options={[{value:'all',label:'모든 상태'},...Object.entries(statusNames).map(([value,label])=>({value,label}))]}/>}
   {kind==='history'&&<SelectField label="이동 유형" hideLabel value={value.direction} onChange={direction=>onChange({...value,direction})} disabled={disabled} options={[{value:'all',label:'모든 내역'},{value:'in',label:'적립'},{value:'out',label:'사용'}]}/>}
   {active&&<button type="button" className={s.historyReset} disabled={disabled} onClick={()=>onChange({...emptyBeanHistoryFilters})}>초기화</button>}
  </div>
 </div>;
}
type HistoryModel=Pick<BeanModel,'basePath'|'wallet'|'sent'|'sentTotal'|'loading'|'error'>;
export function BeanHistoryView({kind,model,error='',notice='',pending=false,filters=emptyBeanHistoryFilters,onFiltersChange=()=>{},onPay,onPage}:{kind:BeanHistoryKind;model:HistoryModel;error?:string;notice?:string;pending?:boolean;filters?:BeanHistoryFilters;onFiltersChange?:(filters:BeanHistoryFilters)=>void;onPay:(charge:BeanCharge)=>void;onPage:(page:number)=>void}){
 const wallet=model.wallet,page=wallet?.page||1,items=kind==='charges'?wallet?.charges:kind==='history'?wallet?.entries:model.sent;
 const issue=error||model.error,total=kind==='charges'?wallet?.chargesTotal:kind==='history'?wallet?.entriesTotal:model.sentTotal;
 const filtered=filters.period!=='all'||filters.status!=='all'||filters.direction!=='all'||!!filters.search;
 return <section className={`${s.page} ${s.walletPage}`}>
  <PageTitle back={<BackButton href={`${model.basePath}/beans`} label="지갑으로 돌아가기"/>}>{titles[kind]}</PageTitle>
  <HistoryFilters kind={kind} value={filters} onChange={onFiltersChange} disabled={pending}/>
  {!model.loading&&!model.error&&total!==undefined&&<p className={s.historyCount} role="status">총 {total.toLocaleString('ko-KR')}건</p>}
  {issue&&<p role="alert" className={s.historyMessage}>{issue}</p>}
  {model.error&&<Action variant="secondary" disabled={model.loading||pending} onClick={()=>onPage(page)}>다시 불러오기</Action>}
  {notice&&<p role="status" className={s.historyMessage}>{notice}</p>}
  {model.loading?<p role="status" className={s.historyMessage}>내역을 불러오는 중…</p>:model.error?null:!items?.length?<Empty title={filtered?'조건에 맞는 내역이 없습니다.':`${titles[kind]}이 없습니다.`}/>:<ul className={s.historyList} aria-label={titles[kind]}>
   {kind==='charges'&&(wallet?.charges||[]).map(order=><li key={order.id} className={s.historyItem}>
    {order.createdAt&&<time className={s.historyOrderDate} dateTime={order.createdAt}>{date(order.createdAt)}</time>}
    <div className={s.historyTop}><strong>{beans(order.quantity)}</strong><span className={s.chargeStatus} data-status={order.status}>{statusNames[order.status]||order.status}</span></div>
    <p className={s.historyAmount}>{won(order.amount)} <small>VAT 포함</small></p>
    <p className={s.historyMeta}>주문번호 {beanOrderNumber(order.createdAt)}</p>
    <div className={s.historyActions}>
     {order.status==='pending'&&<Action variant="secondary" disabled={pending} onClick={()=>onPay(order)}>{pending?'결제 준비 중…':'결제 계속'}</Action>}
     {order.status==='processing'&&<Action variant="secondary" disabled={pending} onClick={()=>onPage(1)}>결과 다시 조회</Action>}
     {order.status==='paid'&&<Link href={`${model.basePath}/beans/success?id=${encodeURIComponent(order.id)}`}>충전 상세 보기 <Icon name="chevron" width={16} height={16}/></Link>}
    </div>
   </li>)}
   {kind==='history'&&wallet?.entries.map(entry=><li key={entry.id} className={s.historyItem}>
    <div className={s.historyTop}><strong>{entry.movement?.tip?<BeanTipSource tip={entry.movement.tip} basePath={model.basePath}/>:entry.movement?.reason||'콩 이동'}</strong><span className={s.historyDelta} data-positive={Number(entry.delta)>0}>{Number(entry.delta)>0?'+':''}{beans(entry.delta)}</span></div>
    <time className={s.historyMeta} dateTime={entry.created_at}>{date(entry.created_at)}</time>
   </li>)}
   {kind==='tips'&&model.sent.map(tip=><li key={tip.id} className={s.historyItem}>
    <div className={s.historyTop}><Link className={s.historyCreator} href={`${model.basePath}/creator/${encodeURIComponent(tip.creator_id)}`}><CreatorName person={{name:tip.creatorName||'크리에이터'}}/></Link><strong className={s.historyDelta}>{beans(tip.quantity)}</strong></div>
    <BeanTipSource tip={tip} basePath={model.basePath}/>
    {tip.message&&<p className={s.tipMessage}>{tip.message}</p>}
    <time className={s.historyMeta} dateTime={tip.created_at}>{date(tip.created_at)}</time>
   </li>)}
  </ul>}
  {(page>1||(total!==undefined?total>20:(items?.length||0)>=20))&&<nav className={s.historyPagination} aria-label="내역 페이지"><Action variant="secondary" disabled={model.loading||pending||page<=1} onClick={()=>onPage(page-1)}>이전 내역</Action><span>{page}페이지</span><Action variant="secondary" disabled={model.loading||pending||!!model.error||(total!==undefined?page*20>=total:(items?.length||0)<20)} onClick={()=>onPage(page+1)}>다음 내역</Action></nav>}
 </section>;
}
export function BeanHistoryPage({kind}:{kind:BeanHistoryKind}){
 const model=useBeans(),[error,setError]=useState(''),[notice,setNotice]=useState(''),[pending,setPending]=useState(false),[selection,setSelection]=useState({kind,filters:{...emptyBeanHistoryFilters}}),busy=useRef(false),current=useRef(model);
 current.current=model;
 const filters=selection.kind===kind?selection.filters:emptyBeanHistoryFilters;
 useEffect(()=>{setError('');setNotice('');if(current.current?.enabled&&current.current.signedIn)void current.current.refresh(false,1,beanHistoryQuery(filters));},[kind,filters,model?.enabled,model?.signedIn]);
 if(!model?.enabled)return <p>콩 후원을 준비 중입니다.</p>;
 if(!model.signedIn)return <SignInPrompt basePath={model.basePath}/>;
 async function pay(order:BeanCharge){
  if(busy.current||!model)return;
  busy.current=true;setPending(true);setError('');setNotice('');
  try{const result=await model.payCharge(order.id);if(!result.success)setError(result.errorMessage);else{setNotice(result.data.message);await model.refresh(false,1,beanHistoryQuery(filters));}}
  catch{setError('결제 결과를 확인하지 못했습니다. 같은 주문으로 다시 확인해주세요.');}
  finally{busy.current=false;setPending(false);}
 }
 return <BeanHistoryView kind={kind} model={model} error={error} notice={notice} pending={pending} filters={filters} onFiltersChange={filters=>setSelection({kind,filters})} onPay={order=>void pay(order)} onPage={page=>void model.refresh(false,page,beanHistoryQuery(filters))}/>;
}
