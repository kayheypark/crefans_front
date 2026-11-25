import type {BankTransfer,BankTransferKind,PaymentMethods} from '@/types/crefans-payments';
import {platformRequest} from './platform';
export const getPaymentMethods=(kind?:'bean')=>platformRequest<PaymentMethods>(kind?'/payments/methods?kind=bean':'/payments/methods');
// 2026-11-17: the buyer tells operators the deposit was sent (one Telegram alert per order).
export const reportBankTransferDeposit=(kind:BankTransferKind,orderId:string)=>platformRequest<{reported:boolean;message:string}>(`/payments/bank-transfer/${kind}/${encodeURIComponent(orderId)}/deposited`,{method:'POST'});
export const getBankTransfer=(kind:BankTransferKind,orderId:string)=>platformRequest<BankTransfer>(`/payments/bank-transfer/${kind}/${encodeURIComponent(orderId)}`);
