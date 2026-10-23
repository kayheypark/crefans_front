import type {SettlementAccount,StudioEarning,StudioSettlement,StudioWithdrawal} from '@/types/crefans-studio-finance';

export type MockFinanceState={earnings:StudioEarning[];settlements:StudioSettlement[];withdrawals:StudioWithdrawal[];accounts:SettlementAccount[];sequence:number};
export const FINANCE_SAMPLE_DATE='2026-09-12';
export function createInitialFinanceState():MockFinanceState{
  return {
    sequence:3,
    earnings:[
      {id:'earning-membership',settlementId:'settlement-august',date:'2026-08-31',title:'8월 멤버십 수익',gross:1490000,reversals:99000,fees:139100,net:1251900},
      {id:'earning-content',settlementId:'settlement-august',date:'2026-08-31',title:'8월 콘텐츠 수익',gross:500000,reversals:0,fees:50000,net:450000},
      {id:'earning-september',settlementId:'settlement-september',date:'2026-09-11',title:'9월 멤버십 수익',gross:490000,reversals:0,fees:49000,net:441000},
    ],
    settlements:[
      {id:'settlement-august',period:'2026.08',status:'available',availableAt:'2026-09-05'},
      {id:'settlement-september',period:'2026.09',status:'pending',availableAt:'2026-10-05'},
    ],
    accounts:[
      {id:'account-verified',bank:'신한은행',holderAlias:'하늘',lastFour:'4821',verified:true,isDefault:true},
      {id:'account-unverified',bank:'카카오뱅크',holderAlias:'하늘',lastFour:'7314',verified:false,isDefault:false},
    ],
    withdrawals:[
      {id:'withdrawal-paid',requestId:'previous-paid',accountId:'account-verified',accountLabel:'신한은행 · •••• 4821',amount:350000,requestedAt:'2026-09-06',status:'paid',statusNote:'수령 계좌로 지급이 완료되었습니다.'},
      {id:'withdrawal-processing',requestId:'previous-processing',accountId:'account-verified',accountLabel:'신한은행 · •••• 4821',amount:200000,requestedAt:'2026-09-10',status:'processing',statusNote:'수령 계좌로 지급을 처리하고 있습니다.'},
      {id:'withdrawal-rejected',requestId:'previous-rejected',accountId:'account-verified',accountLabel:'신한은행 · •••• 4821',amount:50000,requestedAt:'2026-09-04',status:'rejected',statusNote:'반려된 요청 금액은 출금 가능 잔액에 포함됩니다.'},
    ],
  };
}
