/** 2026-11-16 무통장입금 (server feat/bank-transfer). Card stays hidden on bean/AI pass/ad checkouts unless `card` is true. */
export type PaymentMethods={bankTransfer:boolean;card:boolean;deadlineHours:number;refundBusinessDays:number};
export type BankTransferKind='bean'|'ai-shop'|'ad';
export type BankAccount={bankName:string;accountNumber:string;holder:string};
export type BankTransfer={id:string;kind:BankTransferKind;orderId:string;amount:number;status:'awaiting'|'confirmed'|'expired'|'cancelled';statusLabel:string;depositorName:string;account:BankAccount;expiresAt:string;confirmedAt:string|null;cashReceipt:{type:'income'|'expense';issued:boolean}|null};
/** income = 소득공제 (휴대폰 번호), expense = 지출증빙 (사업자번호 10자리). */
export type CashReceiptRequest={type:'income'|'expense';number:string};
export type BankTransferOrderInput={method:'bank_transfer';depositorName:string;cashReceipt?:CashReceiptRequest};
/** Account the operator sends a bank-transfer refund to. */
export type RefundAccount=BankAccount;
