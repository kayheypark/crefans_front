'use client';
import {useShopPayment} from '@/features/service/useShopPayment';
import {Action,PageTitle} from '@/components/crefans/ServiceUI';
export function ShopPayment(){const {order,error,busy,result,paymentKey,load,confirm,pay}=useShopPayment();
 return <section><PageTitle>이용권 결제</PageTitle>{order&&<><h2>{order.name}</h2><p>{order.benefit} · {order.amount.toLocaleString('ko-KR')}원 (VAT 포함)</p><p>{order.statusLabel}</p></>}{busy&&<p role="status">결제 결과를 확인하고 있어요.</p>}{error&&<p role="alert">{error}</p>}{result==='fail'&&<p>결제가 완료되지 않았어요. 구매 내역을 확인하거나 다시 결제할 수 있어요.</p>}{order?.status==='paid'?<><p>횟수권이 지급되었어요. 기존 편집 탭으로 돌아가 계속 만들어 보세요.</p><Action onClick={()=>{window.opener?.focus();window.close();}}>편집 탭으로 돌아가기</Action></>:paymentKey?<Action disabled={busy} onClick={()=>void confirm()}>같은 주문 결제 확인</Action>:order?.status==='pending'?<Action disabled={busy} onClick={()=>void pay()}>카드로 결제하기</Action>:<Action disabled={busy} onClick={()=>void load()}>구매 내역 확인</Action>}<p><a href="/service/studio/shop">상점으로 이동</a></p></section>;
}
