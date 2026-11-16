import type {BankTransfer,BankTransferKind,PaymentMethods} from '@/types/crefans-payments';
import {platformRequest} from './platform';
export const getPaymentMethods=()=>platformRequest<PaymentMethods>('/payments/methods');
export const getBankTransfer=(kind:BankTransferKind,orderId:string)=>platformRequest<BankTransfer>(`/payments/bank-transfer/${kind}/${encodeURIComponent(orderId)}`);
