'use client';
import {useShopPayment} from '@/features/service/useShopPayment';
import {GuardPage} from '@/components/crefans/GuardPage';
import {Action,ActionLink,PageTitle} from '@/components/crefans/ServiceUI';
import {BankTransferInstructions} from '@/components/crefans/BankTransfer';
import s from './ShopPayment.module.css';

export function ShopPayment(){
 const m=useShopPayment(),o=m.order;
 if(o?.status==='paid')return <GuardPage
  title="구매가 완료됐어요"
  description={<>{o.benefit}가 지급되었어요.<br/>결제 금액 {o.amount.toLocaleString('ko-KR')}원 (VAT 포함)</>}
  primary={{href:'/service/studio/shop',label:'상점으로 이동'}}
  secondary={window.opener?{label:'편집 탭으로 돌아가기',onClick:()=>{window.opener?.focus();window.close();}}:undefined}
 />;
 const pending=o?.status==='pending'&&o.method!=='bank_transfer'&&m.cardAvailable;
 return <section className={s.page}>
  <PageTitle>이용권 결제</PageTitle>
  {m.transfer&&<BankTransferInstructions transfer={m.transfer}/>}
  {o&&<div className={s.summary}>
   <div className={s.heading}><h2>{o.name}</h2><span>{o.statusLabel}</span></div>
   <p>{o.benefit}</p>
   <div className={s.total}><span>결제 금액 <small>(VAT 포함)</small></span><strong>{o.amount.toLocaleString('ko-KR')}원</strong></div>
  </div>}
  {pending&&m.needsName&&<label className={s.field}>구매자 이름<input autoComplete="name" maxLength={50} value={m.buyerName} onChange={e=>m.setBuyerName(e.target.value)}/></label>}
  {pending&&m.needsPhone&&<label className={s.field}>휴대폰 번호<input type="tel" autoComplete="tel" maxLength={18} value={m.buyerPhone} onChange={e=>m.setBuyerPhone(e.target.value)}/></label>}
  {m.error&&<p className={s.feedback} role="alert">{m.error}</p>}
  {m.result==='fail'&&!m.error&&<p role="status">결제가 완료되지 않았어요. 같은 주문으로 다시 시도할 수 있어요.</p>}
  {m.busy&&<p role="status">결제 요청을 처리하고 있어요.</p>}
  {m.paymentKey?<Action disabled={m.busy} onClick={()=>void m.confirm()}>같은 주문 결제 확인</Action>:pending?
   m.prepared?<Action disabled={m.busy||!m.canPay} onClick={()=>void m.pay()}>{o.amount.toLocaleString('ko-KR')}원 카드 결제</Action>:
   m.error?<Action onClick={()=>void m.load()}>결제 정보 다시 불러오기</Action>:<p role="status">결제 정보를 불러오고 있어요.</p>:
   o&&<Action disabled={m.busy} onClick={()=>void m.load()}>구매 내역 확인</Action>}
  <ActionLink variant="secondary" href="/service/studio/shop">상점으로 이동</ActionLink>
 </section>;
}
