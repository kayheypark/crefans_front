import {requestPayment} from '@portone/browser-sdk/v2';

export interface PortOneCardWindow {
  provider: 'portone';
  customer: {fullName:string; email:string; phoneNumber?:string};
  storeId: string;
  channelKey: string;
  orderId: string;
  orderName: string;
  amount: number;
}

export async function openPortOneCardWindow(order: PortOneCardWindow, returnUrl: URL) {
  const result = await requestPayment({
    storeId: order.storeId,
    channelKey: order.channelKey,
    paymentId: order.orderId,
    orderName: order.orderName,
    totalAmount: order.amount,
    currency: 'CURRENCY_KRW',
    payMethod: 'CARD',
    windowType: {mobile:'REDIRECTION'},
    customer: order.customer,
    redirectUrl: returnUrl.toString(),
  });
  if (result?.code) {
    const cancelled = /CANCEL/i.test(result.code);
    return cancelled ? '결제를 취소했어요.' : '결제사가 요청을 처리하지 못했어요. 결제 정보를 확인한 뒤 다시 시도해 주세요.';
  }
  if (result?.paymentId === order.orderId) location.assign(returnUrl.toString());
}
