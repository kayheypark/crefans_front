'use client';

import {DialogActions} from '@/components/ui/DialogActions';
import {useId,useRef,useState,type FormEvent,type ReactNode} from 'react';
import Link from 'next/link';
import {TextLink} from '@/components/ui/TextLink';
import {SelectField} from '@/components/ui/SelectField';
import {AmountPresets} from '@/components/ui/AmountPresets';
import {PinField} from '@/components/ui/PinField';
import {krwAmountPresets} from '@/lib/design/amount-presets';
import type {SettlementAccount,StudioEarning,StudioFinanceModel,StudioSettlement,StudioWithdrawal,WithdrawalQuote} from '@/types/crefans-studio-finance';
import {Action,Empty,Notice,PageTitle} from '../ServiceUI';
import {Dialog,Field} from '@/components/ui/Primitives';
import Icon from '../Icon';
import s from './finance.module.css';

type Props={model:StudioFinanceModel;basePath:string};
const money=(value:number)=>`₩${value.toLocaleString('ko-KR')}`;
const date=(value:string)=>value.replaceAll('-','.');
const accountName=(account:SettlementAccount)=>`${account.bank} · •••• ${account.lastFour}`;
const withdrawalLabels={requested:'접수됨',processing:'처리 중',paid:'완료',rejected:'반려'};

function Policy({model}:{model:StudioFinanceModel}){return model.data.policyNotice?<p className={s.helper}>{model.data.policyNotice}</p>:null;}
export function AmountRows({gross,reversals,fees,net}:{gross:number;reversals:number;fees:number;net:number}){return <dl className={s.amountRows}><div><dt>총매출</dt><dd>{money(gross)}</dd></div><div><dt>취소·환불 차감</dt><dd>− {money(reversals)}</dd></div><div><dt>수수료 차감</dt><dd>− {money(fees)}</dd></div><div className={s.totalRow}><dt>순수익</dt><dd>{money(net)}</dd></div></dl>;}
export function LedgerRow({title,detail,amount,status,onClick}:{title:string;detail:string;amount:number|null;status?:ReactNode;onClick:()=>void}){return <button type="button" className={s.ledgerRow} onClick={onClick}><span><strong>{title}</strong><small>{detail}</small></span><span className={s.rowRight}><strong>{amount===null?'금액 정보 없음':money(amount)}</strong>{status}<Icon name="chevron" width="15" height="15"/></span></button>;}

export function EarningsPage({model,basePath}:Props){
  const [selected,setSelected]=useState<StudioEarning|null>(null);
  const {summary,earnings}=model.data;
  return <div className={s.page}><PageTitle action={<Link href={`${basePath}/withdraw`} className={s.brandLink}>출금 요청</Link>}>수익 현황</PageTitle>
    <p className={s.subtitle}>창작으로 쌓인 수익과 지금 이용할 수 있는 잔액을 확인하세요.</p>
    <div className={s.balanceGrid}><div className={s.available}><span>출금 가능</span><strong>{money(summary.available)}</strong><small>접수·처리 중인 요청과 지급 완료 금액 제외</small></div><div><span>정산 대기</span><strong>{money(summary.pending)}</strong><small>아직 출금할 수 없는 순수익</small></div><div><span>출금 요청 중</span><strong>{money(summary.requested)}</strong><small>접수됨 + 처리 중</small></div></div>
    <section className={s.section}><h2>수익 구성</h2><div className={s.summaryGrid}><div><span>총매출</span><strong>{money(summary.gross)}</strong></div><div><span>취소·환불 차감</span><strong>{money(summary.reversals)}</strong></div><div><span>수수료 차감</span><strong>{money(summary.fees)}</strong></div><div><span>순수익</span><strong>{money(summary.net)}</strong></div></div><p className={s.helper}>순수익 = 총매출 − 취소·환불 − 수수료 · 지급 완료 {money(summary.paid)}</p></section>
    <section className={s.section}><div className={s.sectionHeading}><h2>수익 내역</h2><TextLink href={`${basePath}/settlements`}>정산 내역 보기</TextLink></div>{earnings.length?earnings.map(item=><LedgerRow key={item.id} title={item.title} detail={date(item.date)} amount={item.net} onClick={()=>setSelected(item)}/>):<Empty title="아직 수익 내역이 없어요" description="수익이 발생하면 이곳에서 확인할 수 있습니다."/>}</section>
    <Policy model={model}/>
    <Dialog open={!!selected} onClose={()=>setSelected(null)} title="수익 상세">{selected&&<div className={s.dialogBody}><div><h3>{selected.title}</h3><p className={s.helper}>{date(selected.date)}</p></div><AmountRows {...selected}/><p className={s.helper}>정산 단위: {model.data.settlements.find(item=>item.id===selected.settlementId)?.period||'정보 없음'}</p><DialogActions><Action variant="secondary" onClick={()=>setSelected(null)}>닫기</Action></DialogActions></div>}</Dialog>
  </div>;
}

export function SettlementsPage({model,basePath}:Props){
  const [selected,setSelected]=useState<StudioSettlement|null>(null);
  const totals=(settlement:StudioSettlement)=>{
    const earnings=model.data.earnings.filter(item=>item.settlementId===settlement.id);
    if(!earnings.length)return null;
    return earnings.reduce((sum,item)=>({gross:sum.gross+item.gross,reversals:sum.reversals+item.reversals,fees:sum.fees+item.fees,net:sum.net+item.net}),{gross:0,reversals:0,fees:0,net:0});
  };
  const selectedAmounts=selected?totals(selected):null;
  return <div className={s.page}><PageTitle action={<TextLink href={`${basePath}/earnings`}>수익 현황</TextLink>}>정산 내역</PageTitle><p className={s.subtitle}>기간별 수익 정산과 출금 가능 전환 상태를 확인하세요.</p>
    {model.data.settlements.length?<div className={s.section}>{model.data.settlements.map(item=><LedgerRow key={item.id} title={`${item.period} 정산`} detail={`${item.status==='available'?'출금 가능 전환':'전환 예정'} ${date(item.availableAt)}`} amount={totals(item)?.net??null} status={<span className={s.badge} data-status={item.status}>{item.status==='available'?'전환 완료':'정산 대기'}</span>} onClick={()=>setSelected(item)}/>)}</div>:<Empty title="정산 내역이 없어요" description="정산 정보가 준비되면 안내해 드립니다."/>}
    <Notice>출금 가능 전환은 은행 지급 완료와 다릅니다. 현재 출금 가능한 잔액은 수익 현황에서 확인할 수 있습니다.</Notice><Policy model={model}/>
    <Dialog open={!!selected} onClose={()=>setSelected(null)} title="정산 상세">{selected&&<div className={s.dialogBody}><h3>{selected.period} 정산</h3><span className={s.badge} data-status={selected.status}>{selected.status==='available'?'출금 가능 전환 완료':'정산 대기'}</span>{selectedAmounts?<AmountRows {...selectedAmounts}/>:<Empty title="정산 상세 금액을 확인할 수 없어요" description="연결된 수익 내역이 제공되지 않았습니다."/>}<p className={s.helper}>{selected.status==='available'?'출금 가능 전환일':'출금 가능 전환 예정일'}: {date(selected.availableAt)}</p><DialogActions><Action variant="secondary" onClick={()=>setSelected(null)}>닫기</Action><Link href={`${basePath}/withdraw`} className={s.brandLink}>출금 가능 금액 확인</Link></DialogActions></div>}</Dialog>
  </div>;
}

export function WithdrawalPage({model,basePath}:Props){
  const operationId=useId();
  const attempt=useRef(0);
  const {summary,accounts}=model.data;
  const [amount,setAmount]=useState('');
  const requestedAmount=Number(amount);
  const remainingAmount=Number.isSafeInteger(requestedAmount)&&requestedAmount>=0&&requestedAmount<=summary.available?summary.available-requestedAmount:null;
  const [accountId,setAccountId]=useState(()=>accounts.find(account=>account.verified&&account.isDefault)?.id||accounts.find(account=>account.verified)?.id||'');
  const [quote,setQuote]=useState<WithdrawalQuote|null>(null);
  const [result,setResult]=useState<{withdrawal:StudioWithdrawal;message:string}|null>(null);
  const [pending,setPending]=useState(false);
  const busy=useRef(false);
  const [error,setError]=useState('');
  const [pinOpen,setPinOpen]=useState(false),[pin,setPin]=useState(''),[pinError,setPinError]=useState(''),[retryRequest,setRetryRequest]=useState(false);
  const authorization=useRef<string|null>(null);
  const review=async(event:FormEvent)=>{
    event.preventDefault();if(busy.current||!model.pinConfigured)return;busy.current=true;setPending(true);setError('');authorization.current=null;
    try{const response=await model.reviewWithdrawal({amount:Number(amount),accountId});if(!response.success){setError(response.errorMessage);return;}setQuote(response.data);}finally{busy.current=false;setPending(false);}
  };
  const closePin=()=>{if(busy.current)return;setPin('');setPinError('');setPinOpen(false);if(!retryRequest)authorization.current=null;};
  const submit=async(event:FormEvent)=>{
    event.preventDefault();if(busy.current||!quote||!model.pinConfigured)return;setPinError('');
    if(!authorization.current&&!/^\d{6}$/.test(pin)){setPinError('숫자 6자리 PIN을 입력해 주세요.');setPin('');return;}
    busy.current=true;setPending(true);
    try{
      if(!authorization.current){
        const verified=await model.verifyWithdrawalPin(pin,{amount:quote.amount,accountId:quote.account.id});
        setPin('');
        if(!verified.success){setPinError(verified.errorMessage);return;}
        authorization.current=verified.data.authorizationId;
      }
      const response=await model.requestWithdrawal({amount:quote.amount,accountId:quote.account.id,requestId:`${operationId}-${attempt.current}`,authorizationId:authorization.current});
      if(!response.success){authorization.current=null;setRetryRequest(false);setPinError(response.errorMessage);return;}
      authorization.current=null;setRetryRequest(false);setResult(response.data);setQuote(null);setPinOpen(false);
    }catch{
      if(authorization.current){setRetryRequest(true);setPinError('접수 결과를 확인하지 못했어요. 같은 요청 번호로 다시 확인해 주세요.');}
      else setPinError('PIN을 확인하지 못했어요. 다시 시도해 주세요.');
    }finally{setPin('');busy.current=false;setPending(false);}
  };
  return <div className={`${s.page} ${s.narrow}`}><PageTitle action={<TextLink href={`${basePath}/withdrawals`}>출금 내역</TextLink>}>출금 신청</PageTitle>
    <ol className={s.steps}><li aria-current={!quote&&!result?'step':undefined}>1. 금액·계좌</li><li aria-current={quote?'step':undefined}>2. 요청 확인</li><li aria-current={result?'step':undefined}>3. 접수 결과</li></ol>
    {!model.pinConfigured?<section className={s.pinRequired}><span className={s.resultIcon}><Icon name="lock"/></span><h2>먼저 출금 PIN을 설정해 주세요</h2><p className={s.helper}>출금 요청을 확인할 때 숫자 6자리 PIN이 필요합니다.</p><Link className={s.brandLink} href={`${basePath}/security`}>출금 PIN 설정하기</Link></section>:result?<section className={s.result} aria-live="polite"><span className={s.resultIcon}><Icon name="check"/></span><h2>출금 요청을 확인해 주세요</h2><p>{result.message}</p><strong>{money(result.withdrawal.amount)}</strong><span className={s.badge} data-status={result.withdrawal.status}>{withdrawalLabels[result.withdrawal.status]}</span><p className={s.helper}>{result.withdrawal.statusNote}</p><dl className={s.amountRows}><div><dt>수령 계좌</dt><dd>{result.withdrawal.accountLabel}</dd></div><div><dt>요청일</dt><dd>{date(result.withdrawal.requestedAt)}</dd></div><div><dt>요청 번호</dt><dd>{result.withdrawal.id}</dd></div></dl><Link className={s.brandLink} href={`${basePath}/withdrawals`}>출금 내역 보기</Link><Action variant="secondary" onClick={()=>{attempt.current++;setResult(null);setAmount('');setError('');}}>새 출금 요청</Action></section>:quote?<section className={s.confirm}><h2>이 내용으로 요청할까요?</h2><dl className={s.amountRows}><div><dt>요청 금액</dt><dd>{money(quote.amount)}</dd></div><div><dt>수령 계좌</dt><dd>{accountName(quote.account)}</dd></div><div><dt>예금주 별칭</dt><dd>{quote.account.holderAlias}</dd></div><div className={s.totalRow}><dt>요청 후 출금 가능</dt><dd>{money(quote.availableAfterRequest)}</dd></div></dl><Notice>요청이 접수되면 해당 금액은 출금 가능 잔액에서 제외되고, 출금 요청 중 금액으로 표시됩니다. 접수는 은행 이체 완료를 의미하지 않습니다.</Notice>{retryRequest&&<p className={s.helper}>아직 접수 결과를 확인하지 못했어요. 같은 요청 번호로 다시 확인해 주세요.</p>}{error&&<p className={s.error} role="alert">{error}</p>}<div className={s.actions}><Action variant="secondary" disabled={pending||retryRequest} onClick={()=>{setQuote(null);setError('');setPin('');authorization.current=null;}}>다시 입력</Action><Action variant="brand" disabled={pending} onClick={()=>{setPin('');setPinError('');setPinOpen(true);}}>{retryRequest?'접수 결과 다시 확인':'출금 요청하기'}</Action></div></section>:<>
      <div className={s.withdrawalBalances}><div><span>출금 가능 금액</span><strong>{money(summary.available)}</strong></div><div><span>출금 후 금액</span><strong aria-live="polite" data-invalid={remainingAmount===null}>{remainingAmount===null?'금액을 확인해 주세요':money(remainingAmount)}</strong></div></div>
      {accounts.some(account=>account.verified)?<form onSubmit={review} noValidate className={s.form}><div className={s.amountInput}><Field label="출금 금액" value={amount} onChange={event=>{setAmount(event.target.value);setError('');}} type="number" inputMode="numeric" min="1" step="1" max={summary.available} required disabled={pending} placeholder="원 단위로 입력" suffix="원"/><AmountPresets value={amount} onChange={value=>{setAmount(value);setError('');}} availableAmount={summary.available} presets={krwAmountPresets} disabled={pending} hint="전액을 누르면 출금 가능 금액을 모두 입력합니다."/></div><SelectField label="수령 계좌" value={accountId} onChange={setAccountId} options={accounts.map(account=>({value:account.id,label:`${accountName(account)}${account.isDefault?' · 기본':''}${!account.verified?' · 확인 필요':''}`,disabled:!account.verified}))} placeholder="계좌를 선택해 주세요" disabled={pending} required searchable/><TextLink className={s.textLink} href={`${basePath}/accounts`}>정산 계좌 관리</TextLink>{error&&<p className={s.error} role="alert">{error}</p>}<Action type="submit" variant="brand" disabled={pending||!accountId||!Number.isSafeInteger(requestedAmount)||requestedAmount<=0||requestedAmount>summary.available} aria-busy={pending}>{pending?'확인 중…':'신청 내용 확인'}</Action></form>:<Empty title="확인된 수령 계좌가 필요해요" description="계좌를 등록하고 확인한 뒤 출금을 요청할 수 있습니다." action={<Link href={`${basePath}/accounts`} className={s.brandLink}>정산 계좌 관리</Link>}/>}
    </>}
    <Policy model={model}/>
    <Dialog open={pinOpen&&!!quote&&model.pinConfigured} onClose={closePin} title="출금 PIN 확인">{quote&&<form className={s.form} noValidate onSubmit={submit}><dl className={s.amountRows}><div><dt>요청 금액</dt><dd>{money(quote.amount)}</dd></div><div><dt>수령 계좌</dt><dd>{accountName(quote.account)}</dd></div></dl>{retryRequest?<p className={s.helper}>추가 출금 요청을 만들지 않고 이전 요청의 접수 결과를 확인합니다.</p>:<PinField label="출금 PIN" value={pin} onChange={value=>{setPin(value);setPinError('');}} required disabled={pending} autoFocus hint="설정한 숫자 6자리를 입력해 주세요."/>}{pinError&&<p className={s.error} role="alert">{pinError}</p>}<DialogActions><Action type="button" variant="secondary" disabled={pending} onClick={closePin}>닫기</Action><Action type="submit" variant="brand" disabled={pending||(!retryRequest&&!/^\d{6}$/.test(pin))} aria-busy={pending}>{pending?'확인 중…':retryRequest?'접수 결과 다시 확인':'PIN 확인 후 출금 요청'}</Action></DialogActions></form>}</Dialog>
  </div>;
}

export function WithdrawalsPage({model,basePath}:Props){
  const [filter,setFilter]=useState('all');
  const [selected,setSelected]=useState<StudioWithdrawal|null>(null);
  const visible=model.data.withdrawals.filter(item=>filter==='all'||item.status===filter);
  return <div className={s.page}><PageTitle action={<Link href={`${basePath}/withdraw`} className={s.brandLink}>출금 요청</Link>}>출금 내역</PageTitle><p className={s.subtitle}>접수부터 지급 완료까지 요청별 상태를 확인하세요.</p><div className={s.filters} aria-label="출금 상태"><button type="button" aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>전체</button>{Object.entries(withdrawalLabels).map(([value,label])=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}</div>
    {visible.length?<div className={s.section}>{visible.map(item=><LedgerRow key={item.id} title={item.accountLabel} detail={`${date(item.requestedAt)} · ${item.id}`} amount={item.amount} status={<span className={s.badge} data-status={item.status}>{withdrawalLabels[item.status]}</span>} onClick={()=>setSelected(item)}/>)}</div>:<Empty title="해당 출금 내역이 없어요" description="출금 요청 후 이곳에서 처리 상태를 확인할 수 있습니다."/>}<Policy model={model}/>
    <Dialog open={!!selected} onClose={()=>setSelected(null)} title="출금 요청 상세">{selected&&<div className={s.dialogBody}><span className={s.badge} data-status={selected.status}>{withdrawalLabels[selected.status]}</span><dl className={s.amountRows}><div><dt>요청 금액</dt><dd>{money(selected.amount)}</dd></div><div><dt>수령 계좌</dt><dd>{selected.accountLabel}</dd></div><div><dt>요청일</dt><dd>{date(selected.requestedAt)}</dd></div><div><dt>요청 번호</dt><dd>{selected.id}</dd></div></dl><p>{selected.statusNote}</p><DialogActions><Action variant="secondary" onClick={()=>setSelected(null)}>닫기</Action></DialogActions></div>}</Dialog>
  </div>;
}

export function SettlementAccountsPage({model,basePath}:Props){
  const [formOpen,setFormOpen]=useState(false);
  const [editing,setEditing]=useState<string|undefined>();
  const [bank,setBank]=useState('');
  const [holderAlias,setHolderAlias]=useState('');
  const [lastFour,setLastFour]=useState('');
  const [accountNumber,setAccountNumber]=useState('');
  const [pending,setPending]=useState(false);
  const busy=useRef(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const edit=(account?:SettlementAccount)=>{setEditing(account?.id);setBank(account?.bank||'');setHolderAlias(account?.holderAlias||'');setLastFour(account?.lastFour||'');setAccountNumber('');setError('');setFormOpen(true);};
  const save=async(event:FormEvent)=>{
    event.preventDefault();if(busy.current)return;busy.current=true;setPending(true);setError('');setMessage('');
    try{const response=await model.saveAccount({bank,holderAlias,lastFour,...(model.mode==='live'?{accountNumber}:{})},editing);if(!response.success){setError(response.errorMessage);return;}setMessage(response.data.message);setFormOpen(false);}finally{busy.current=false;setPending(false);}
  };
  const accountAction=async(kind:'verify'|'default',id:string)=>{
    if(busy.current)return;busy.current=true;setPending(true);setError('');setMessage('');
    try{const response=await(kind==='verify'?model.verifyAccount(id):model.setDefaultAccount(id));if(!response.success){setError(response.errorMessage);return;}setMessage(response.data.message);}finally{busy.current=false;setPending(false);}
  };
  return <div className={s.page}><PageTitle action={<Action variant="brand" disabled={pending} onClick={()=>edit()}>계좌 추가</Action>}>정산 계좌</PageTitle><p className={s.subtitle}>확인이 완료된 계좌를 출금 수령 계좌로 사용할 수 있습니다.</p><div role="status" aria-live="polite">{message&&<Notice>{message}</Notice>}</div>{error&&!formOpen&&<p className={s.error} role="alert">{error}</p>}
    {model.data.accounts.length?<div className={s.accountList}>{model.data.accounts.map(account=><article key={account.id} className={s.accountCard}><div className={s.accountIcon}><Icon name="card"/></div><div className={s.accountInfo}><h2>{accountName(account)}</h2><p>{account.holderAlias}</p><div className={s.inlineBadges}>{account.isDefault&&<span className={s.badge}>기본 계좌</span>}<span className={s.badge} data-status={account.verified?'available':'pending'}>{account.verified?'확인 완료':'확인 필요'}</span></div></div><div className={s.accountActions}>{!account.verified?<Action variant="brand" disabled={pending} onClick={()=>accountAction('verify',account.id)}>계좌 확인</Action>:!account.isDefault?<Action variant="secondary" disabled={pending} onClick={()=>accountAction('default',account.id)}>기본 계좌로 설정</Action>:null}<Action variant="secondary" disabled={pending} onClick={()=>edit(account)}>변경</Action></div></article>)}</div>:<Empty title="등록한 계좌가 없어요" description="수익을 받을 계좌를 등록해 주세요." action={<Action variant="brand" onClick={()=>edit()}>계좌 추가</Action>}/>}
    <TextLink href={`${basePath}/withdraw`} className={s.textLink}>출금 요청으로 이동</TextLink><Policy model={model}/>
    <Dialog open={formOpen} onClose={()=>setFormOpen(false)} title={editing?'계좌 정보 변경':'정산 계좌 추가'}><form onSubmit={save} noValidate className={s.form}><Field label="은행" value={bank} onChange={event=>setBank(event.target.value)} disabled={pending} required maxLength={40}/><Field label="예금주 별칭" value={holderAlias} onChange={event=>setHolderAlias(event.target.value)} disabled={pending} required maxLength={40}/>{model.mode==='live'?<Field label="계좌번호" value={accountNumber} onChange={event=>setAccountNumber(event.target.value.replace(/\D/g,''))} disabled={pending} required maxLength={30} inputMode="numeric"/>:<Field label="계좌 끝 4자리" value={lastFour} onChange={event=>setLastFour(event.target.value)} disabled={pending} required maxLength={4} inputMode="numeric" pattern="[0-9]{4}" hint="전체 계좌번호는 입력하지 않습니다."/>}{editing&&<p className={s.helper}>정보를 변경하면 기존 확인과 기본 계좌 설정이 해제됩니다. 다시 확인한 뒤 출금 계좌로 사용할 수 있습니다.</p>}{error&&<p className={s.error} role="alert">{error}</p>}<DialogActions><Action type="button" variant="secondary" disabled={pending} onClick={()=>setFormOpen(false)}>취소</Action><Action type="submit" variant="brand" disabled={pending||!bank.trim()||!holderAlias.trim()||!(model.mode==='live'?/^\d{8,30}$/.test(accountNumber):/^\d{4}$/.test(lastFour))} aria-busy={pending}>{pending?'저장 중…':'저장'}</Action></DialogActions></form></Dialog>
  </div>;
}
