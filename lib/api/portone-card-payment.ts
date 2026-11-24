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
    customer: order.customer,
    redirectUrl: returnUrl.toString(),
  });
  if (result?.code) throw new Error('Payment window did not complete');
  if (result?.paymentId === order.orderId) location.assign(returnUrl.toString());
}
