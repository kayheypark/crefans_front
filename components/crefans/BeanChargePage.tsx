'use client';

import {bindTipCharge} from '@/lib/crefans/bean-tip-return';
import Link from 'next/link';
import {useId,useRef,useState} from 'react';
import {Radio} from '@/components/ui/Choice';
import {InfoTooltip} from '@/components/ui/InfoTooltip';
import {beanChargeKrwPerBean,beanChargeLimitNote,beanPriceNotice,beanRefundNotes} from '@/lib/crefans/bean-pricing';
import {PolicyNotes} from './PolicyNotes';
import type {BeanCharge} from '@/types/crefans-beans';
import {useBeans} from './BeanContext';
import {Action,PageTitle} from './ServiceUI';
import {SignInPrompt} from './SignInPrompt';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {useDelayedLoading} from '@/components/ui/useDelayedLoading';
import {BackButton} from './BackButton';
import {PaymentTerms} from './PaymentTerms';
import {PAYMENT_TERMS} from '@/lib/crefans/payment-terms';
import {BankTransferFields,BankTransferInstructions,PaymentMethodChoice,PaymentPreparing,defaultPaymentMethod} from './BankTransfer';
import {bankTransferFormValid,bankTransferInput,emptyBankTransferForm} from '@/lib/crefans/bank-transfer';
import type {BankTransfer} from '@/types/crefans-payments';
import s from './beans.module.css';

// 2026-11-14: one charge is at most 900콩 (99,000원) and 200,000원 a day (server beanPolicy, KG이니시스 카드사 사이버머니 기준).
// Larger bundles were removed; the existing artwork is reused in the same ascending order.
const quantities=[10,30,50,100,200,300,500,700,900] as const;
const images={10:'soft3d-v6/10',30:'soft3d-v5/50',50:'soft3d-v6/30',100:'soft3d-v7/100',200:'soft3d-v5/300',300:'soft3d-v7/500',500:'soft3d-v7/1000',700:'soft3d-v5/5000',900:'soft3d-v7/10000'} as const;
const beans=(n:number)=>n.toLocaleString('ko-KR')+'콩';
const won=(n:number)=>n.toLocaleString('ko-KR')+'원';
// 2026-11-09: the server answers these when an order would pass the KST daily/monthly charge total; its message carries the remaining amount.
const chargeLimitCodes=['BEAN_DAILY_LIMIT','BEAN_MONTHLY_LIMIT'];

export function BeanChargePage(){
  const model=useBeans(),group=useId();
  const [quantity,setQuantity]=useState(0),[order,setOrder]=useState<BeanCharge|null>(null);
  const [pending,setPending]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[agreed,setAgreed]=useState(false);
  // 2026-11-16 무통장입금: bank transfer when the company account is set; card (Toss) only while the server reports card:true.
  const [chosen,setChosen]=useState<'bank_transfer'|'card'|null>(null),[bankForm,setBankForm]=useState(emptyBankTransferForm),[transfer,setTransfer]=useState<BankTransfer|null>(null);
  const key=useRef(''),busy=useRef(false);
  // Loading rule: the balance stays (blank before the first response); a small spinner only after 1s.
  const slow=useDelayedLoading(!!model&&(model.loading||(!model.wallet&&!model.error)));
  if(!model?.enabled)return <p>콩 후원을 준비 중입니다.</p>;
  if(!model.signedIn)return <SignInPrompt basePath={model.basePath}/>;
  const ready=quantities.some(value=>value===quantity),methods=model.paymentMethods;
  const method=chosen&&(chosen==='card'?methods?.card:methods?.bankTransfer)?chosen:defaultPaymentMethod(methods),bank=method==='bank_transfer';
  const complete=ready&&agreed&&!!method&&(!bank||!!order||bankTransferFormValid(bankForm));
  const limits=model.wallet?.chargeLimits;
  const available=model.wallet?.spendableBeans??(model.wallet?.accounts||[]).filter(a=>['purchased','promotion'].includes(a.bucket)).reduce((sum,a)=>sum+Number(a.balance),0);
  async function pay(){
    if(busy.current||!model||!complete)return;
    busy.current=true;setPending(true);setError('');setNotice('');
    try{
      let current=order;
      if(!current){
        key.current ||=crypto.randomUUID();
        const result=await model.createCharge(quantity,key.current,bank?bankTransferInput(bankForm):undefined);
        if(!result.success){
          setError(result.errorMessage);
          // A refused order was never created: the next try is a new request, and the remaining amount is refreshed.
          if(chargeLimitCodes.includes(result.errorCode)){key.current='';await model.refresh();}
          if(result.errorCode==='BANK_TRANSFER_UNAVAILABLE'){key.current='';await model.refreshPaymentMethods?.();}
          if(['INVALID_DEPOSITOR_NAME','INVALID_CASH_RECEIPT'].includes(result.errorCode))key.current='';
          return;
        }
        current=result.data;setOrder(current);
      }
      bindTipCharge(model.basePath,current.id);
      if(current.method==='bank_transfer'){
        // No payment window: the order waits for the deposit, which the operator confirms.
        const instructions=await model.bankTransfer?.(current.id);
        if(instructions?.success)setTransfer(instructions.data);
        else setError(`충전 주문은 접수되었어요. 입금 안내를 불러오지 못했어요. 충전 내역에서 다시 확인해 주세요.${instructions?.errorMessage?` (${instructions.errorMessage})`:''}`);
        await model.refresh();
        return;
      }
      const result=await model.payCharge(current.id,PAYMENT_TERMS.version);
      if(!result.success)setError(result.errorMessage);
      else{
        setNotice(result.data.message);await model.refresh();
      }
    }catch{setError('결제 결과를 확인하지 못했습니다. 같은 주문으로 다시 확인해주세요.');}
    finally{busy.current=false;setPending(false);}
  }
  return <section className={`${s.page} ${s.chargePage}`}>
    <PageTitle back={<BackButton href={`${model.basePath}/beans`} label="지갑으로 돌아가기"/>} action={<InfoTooltip label="콩 단위 안내" content={beanPriceNotice}/>}>콩 충전</PageTitle>
    <div className={s.chargeBalance}><span>사용 가능한 콩</span><strong>{model.wallet?beans(available):model.error?'확인할 수 없습니다':null}{slow&&<LoadingSpinner inline/>}</strong></div>
    {limits?.dailyRemainingKrw!=null&&<div className={s.chargeBalance}><span>오늘 충전 가능 금액</span><strong>{won(limits.dailyRemainingKrw)}</strong></div>}
    {limits?.monthlyRemainingKrw!=null&&<div className={s.chargeBalance}><span>이번 달 충전 가능 금액</span><strong>{won(limits.monthlyRemainingKrw)}</strong></div>}
    {transfer?<div className={s.chargeForm}><BankTransferInstructions transfer={transfer} onReportDeposit={model.reportDeposit?()=>model.reportDeposit!((transfer).orderId):undefined}/><Link href={`${model.basePath}/beans/charges`}>충전 내역 보기</Link></div>:methods!==undefined&&!method?<PaymentPreparing error={methods===null?'결제 방법을 확인하지 못했어요.':undefined} onRetry={()=>void model.refreshPaymentMethods?.()}/>:<form className={s.chargeForm} onSubmit={event=>{event.preventDefault();void pay();}}>
      <fieldset className={s.chargeOptions} disabled={pending||!!order}>
        <legend>충전할 콩 선택</legend>
        <div className={s.chargeGrid}>{quantities.map(value=><Radio key={value} name={group} className={s.chargeOption} label={<><span className={s.chargeArtwork} aria-hidden="true"><img className={s.chargeImage} src={`/brand/beans/${images[value]}.png`} width={112} height={112} alt=""/></span><strong>{beans(value)}</strong></>} description={<>{won(value*beanChargeKrwPerBean)}<span className={s.chargeVat}>VAT 포함 가격</span></>} aria-label={`${beans(value)} · ${won(value*beanChargeKrwPerBean)} · VAT 포함 가격`} value={value} checked={quantity===value} onChange={checked=>{if(checked&&!pending&&!order){setQuantity(value);key.current='';setError('');setNotice('');}}}/>)}</div>
      </fieldset>
      <dl className={s.chargeSummary}><div><dt>충전 수량</dt><dd>{ready?beans(quantity):'선택해주세요'}</dd></div><div><dt>결제 금액 (VAT 포함)</dt><dd>{won(order?.amount??quantity*beanChargeKrwPerBean)}</dd></div></dl>
      {methods&&method&&<PaymentMethodChoice methods={methods} value={method} disabled={pending||!!order} onChange={next=>{setChosen(next);key.current='';setError('');}}/>}
      {bank&&!order&&<BankTransferFields value={bankForm} onChange={setBankForm} disabled={pending} deadlineHours={methods?.deadlineHours}/>}
      {(error||model.error)&&<p role="alert">{error||model.error}</p>}
      {notice&&<p role="status">{notice} <Link href={`${model.basePath}/beans`}>내 콩 지갑 보기</Link></p>}
      {ready&&<PaymentTerms basePath={model.basePath} agreed={agreed} onAgree={setAgreed} disabled={pending} items={[{label:'상품',value:`${beans(order?.quantity??quantity)} 충전`},{label:'결제 금액',value:`${won(order?.amount??quantity*beanChargeKrwPerBean)} (VAT 포함)`},...(bank?[{label:'결제 방법',value:`무통장입금 · 주문 후 ${methods?.deadlineHours??24}시간 안에 입금하지 않으면 자동 취소`}]:[]),{label:'사용처',value:'크리에이터 후원에만 쓸 수 있으며 멤버십·콘텐츠 이용권이 아닙니다.'},{label:'환불',value:`${beanRefundNotes[0]} ${beanRefundNotes[1]} ${beanRefundNotes[2]}`},{label:'충전 한도',value:beanChargeLimitNote},{label:'유효기간',value:beanRefundNotes[3]}]}/>}
      <Action className={s.chargeSubmit} type="submit" disabled={pending||!complete}>{pending?(bank?'주문 접수 중…':'결제 준비 중…'):bank?(order?'입금 안내 다시 보기':'무통장입금으로 주문하기'):order?'같은 충전 주문 다시 결제':'충전 결제하기'}</Action>
    </form>}
    <PolicyNotes title="환불·유효기간" notes={beanRefundNotes}/>
  </section>;
}
