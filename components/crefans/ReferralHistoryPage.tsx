'use client';
import {useEffect,useRef,useState} from 'react';
import {Chip} from '@/components/ui/Primitives';
import {ChipRow} from '@/components/ui/ChipRow';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {useDelayedLoading} from '@/components/ui/useDelayedLoading';
import type {ReferralHistory,ReferralHistoryStatus} from '@/types/crefans-beans';
import {useBeans} from './BeanContext';
import {BackButton} from './BackButton';
import {Action,Empty,PageTitle} from './ServiceUI';
import {SignInPrompt} from './SignInPrompt';
import s from './referral-history.module.css';

// Invite history, design A (user choice 2026-11-01): three totals, status chips, one row per invitee.
// Names arrive already masked by the server (first three characters + ten stars).
const filters:[ReferralHistoryStatus|'',string][]=[['','전체'],['joined','가입'],['waiting','확정 대기'],['rewarded','보상']];
const badges:Record<string,string>={joined:'첫 결제 전',waiting:'확정 대기',clawed:'회수',capped:'월 상한 초과',forfeited:'소멸'};
const day=(value:string)=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit'}).format(new Date(value)).replace(/\.\s?/g,'.').replace(/\.$/,'');

export function ReferralHistoryPage(){
  const model=useBeans(),load=model?.referralHistory;
  const [status,setStatus]=useState<ReferralHistoryStatus|''>(''),[page,setPage]=useState(1);
  const [data,setData]=useState<ReferralHistory|null>(null),[error,setError]=useState(''),[pending,setPending]=useState(false),request=useRef(0);
  // Loading rule: keep the previous list (nothing on first load) for 1s, then a spinner; only the last request is applied.
  const slow=useDelayedLoading(pending);
  useEffect(()=>{
    if(!load||!model?.signedIn)return;const token=++request.current;setPending(true);
    void load({status:status||undefined,page}).then(result=>{if(token!==request.current)return;setPending(false);if(result.success){setData(result.data);setError('');}else setError(result.errorMessage||'초대 내역을 불러오지 못했어요.');});
  },[load,model?.signedIn,status,page]);
  if(!model?.enabled)return <p>콩 후원을 준비 중입니다.</p>;
  if(!model.signedIn)return <SignInPrompt basePath={model.basePath}/>;
  const pages=data?Math.max(1,Math.ceil(data.total/data.pageSize)):1,firstLoad=!data&&!error;
  return <section className={s.page}>
    <PageTitle back={<BackButton href={`${model.basePath}/beans/referral`} label="친구 초대로 돌아가기"/>}>초대 내역</PageTitle>
    <dl className={s.summary}>
      <div><dt>초대로 가입</dt><dd>{data?data.summary.invited.toLocaleString('ko-KR'):''}</dd></div>
      <div><dt>확정 대기</dt><dd>{data?data.summary.waiting.toLocaleString('ko-KR'):''}</dd></div>
      <div><dt>받은 보상</dt><dd>{data?`${data.summary.rewardBeans.toLocaleString('ko-KR')}콩`:''}</dd></div>
    </dl>
    <ChipRow label="초대 상태">{filters.map(([value,label])=><Chip key={label} selected={status===value} onClick={()=>{setStatus(value);setPage(1);}}>{label}</Chip>)}</ChipRow>
    {error&&<p role="alert" className={s.error}>{error}</p>}
    {firstLoad||(!data?.items.length&&pending)?(slow&&<LoadingSpinner/>):data&&!data.items.length?<Empty title={status?'해당하는 초대가 없어요':'아직 초대로 가입한 친구가 없어요'} description="친구가 내 초대 링크로 가입하면 이곳에서 확인할 수 있어요."/>:data&&<div className={s.listWrap}>{slow&&<LoadingSpinner overlay/>}<ul className={s.list} aria-label="초대 내역">
      {data.items.map(item=><li key={item.id}><div><strong>{item.name}</strong><small>{day(item.joinedAt)} 가입{item.status==='waiting'&&item.dueAt?` · ${day(item.dueAt)} 확정 예정`:item.status==='rewarded'&&item.rewardedAt?` · ${day(item.rewardedAt)} 지급`:''}</small></div><span className={s.badge} data-status={item.status}>{item.status==='rewarded'?`+${item.rewardBeans.toLocaleString('ko-KR')}콩`:badges[item.status]}</span></li>)}
    </ul></div>}
    {data&&pages>1&&<nav className={s.pager} aria-label="초대 내역 페이지"><Action variant="secondary" disabled={page<=1} onClick={()=>setPage(page-1)}>이전</Action><span>{page} / {pages}</span><Action variant="secondary" disabled={page>=pages} onClick={()=>setPage(page+1)}>다음</Action></nav>}
    <p className={s.note}>친구 이름은 앞 세 글자만 보여요. 첫 결제 후 {model.referral?.holdDays??7}일 동안 환불이 없으면 후원에 쓸 수 있는 프로모션콩이 지급되고, 이후 일부라도 환불되면 회수돼요.</p>
  </section>;
}
