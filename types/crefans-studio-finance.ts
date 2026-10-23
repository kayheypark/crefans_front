import type {ApiResult} from './crefans';

export type StudioEarning={id:string;settlementId:string;date:string;title:string;gross:number;reversals:number;fees:number;net:number};
export type StudioSettlement={id:string;period:string;status:'pending'|'available';availableAt:string};
export type SettlementAccount={id:string;bank:string;holderAlias:string;lastFour:string;verified:boolean;isDefault:boolean};
export type SettlementAccountInput=Pick<SettlementAccount,'bank'|'holderAlias'|'lastFour'>&{accountNumber?:string};
export type StudioWithdrawal={id:string;requestId:string;accountId:string;accountLabel:string;amount:number;requestedAt:string;status:'requested'|'processing'|'paid'|'rejected';statusNote:string};
export type FinanceSummary={gross:number;reversals:number;fees:number;net:number;pending:number;available:number;requested:number;paid:number};
export type WithdrawalInput={amount:number;accountId:string};
export type WithdrawalRequest=WithdrawalInput&{requestId:string;authorizationId:string};
export type WithdrawalQuote={amount:number;account:SettlementAccount;availableAfterRequest:number};
export type StudioFinanceData={summary:FinanceSummary;earnings:StudioEarning[];settlements:StudioSettlement[];withdrawals:StudioWithdrawal[];accounts:SettlementAccount[];policyNotice?:string};
/** All amounts are whole KRW. Request acceptance does not imply bank transfer. */
export type StudioFinanceModel={
  mode:'mock'|'live';today:string;data:StudioFinanceData;pinConfigured:boolean;
  setupWithdrawalPin:(pin:string)=>Promise<ApiResult<{message:string}>>;
  verifyWithdrawalPin:(pin:string,input:WithdrawalInput)=>Promise<ApiResult<{authorizationId:string}>>;
  reviewWithdrawal:(input:WithdrawalInput)=>Promise<ApiResult<WithdrawalQuote>>;
  requestWithdrawal:(input:WithdrawalRequest)=>Promise<ApiResult<{withdrawal:StudioWithdrawal;message:string}>>;
  saveAccount:(input:SettlementAccountInput,accountId?:string)=>Promise<ApiResult<{account:SettlementAccount;message:string}>>;
  verifyAccount:(accountId:string)=>Promise<ApiResult<{message:string}>>;
  setDefaultAccount:(accountId:string)=>Promise<ApiResult<{message:string}>>;
};
