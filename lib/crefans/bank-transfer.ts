import type {BankTransferOrderInput,RefundAccount} from '@/types/crefans-payments';
// Same rules as server src/platform/bank-transfer.ts (depositorName, cashReceiptInput, refundAccountInput).
export type BankTransferForm={depositorName:string;cashReceipt:boolean;receiptType:'income'|'expense';receiptNumber:string};
export const emptyBankTransferForm:BankTransferForm={depositorName:'',cashReceipt:false,receiptType:'income',receiptNumber:''};
export const emptyRefundAccount:RefundAccount={bankName:'',accountNumber:'',holder:''};
const digits=(value:string)=>value.replace(/[^0-9]/g,'');
export function bankTransferFormErrors(form:BankTransferForm){
 const name=form.depositorName.trim(),number=digits(form.receiptNumber);
 return{
  depositorName:!name?'입금자명을 입력해 주세요.':name.length>20?'입금자명은 20자 이내로 입력해 주세요.':'',
  receiptNumber:!form.cashReceipt?'':form.receiptType==='income'?(/^01[016789][0-9]{7,8}$/.test(number)?'':'소득공제용 휴대폰 번호를 확인해 주세요.'):(/^[0-9]{10}$/.test(number)?'':'사업자번호 10자리를 확인해 주세요.'),
 };
}
export const bankTransferFormValid=(form:BankTransferForm)=>Object.values(bankTransferFormErrors(form)).every(error=>!error);
export function bankTransferInput(form:BankTransferForm):BankTransferOrderInput{
 return{method:'bank_transfer',depositorName:form.depositorName.trim(),...(form.cashReceipt?{cashReceipt:{type:form.receiptType,number:digits(form.receiptNumber)}}:{})};
}
export function refundAccountErrors(account:RefundAccount){
 const bank=account.bankName.trim(),holder=account.holder.trim(),number=account.accountNumber.trim();
 return{
  bankName:!bank?'은행을 입력해 주세요.':bank.length>20?'은행명은 20자 이내로 입력해 주세요.':'',
  accountNumber:/^[0-9-]+$/.test(number)&&/^[0-9]{6,20}$/.test(digits(number))?'':'계좌번호를 숫자 6~20자리로 입력해 주세요.',
  holder:!holder?'예금주를 입력해 주세요.':holder.length>20?'예금주는 20자 이내로 입력해 주세요.':'',
 };
}
export const refundAccountValid=(account:RefundAccount)=>Object.values(refundAccountErrors(account)).every(error=>!error);
export const refundAccountInput=(account:RefundAccount):RefundAccount=>({bankName:account.bankName.trim(),accountNumber:digits(account.accountNumber),holder:account.holder.trim()});
/** Exact deadline in Korea time, e.g. "2026. 11. 17. 오후 3:05 (한국 시간)". */
export const kstDateTime=(value:string)=>`${new Date(value).toLocaleString('ko-KR',{year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'Asia/Seoul'})} (한국 시간)`;
