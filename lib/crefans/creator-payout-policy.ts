// Mirrors creator terms section 6 (server src/platform/legal-documents.ts) and server payout constants.
// The studio finance API resolves individual overrides against the current DB defaults (creatorTerms).
// Server beanPolicy.tipHoldDays: received beans wait this many days from the tip itself.
export const beanTipHoldDays=7;
export const creatorPayoutPolicy={feeRatePercent:20,settlementHoldDays:7,minimumWithdrawalKrw:100000,payoutWeekday:'수요일'} as const;

const {feeRatePercent,settlementHoldDays,minimumWithdrawalKrw,payoutWeekday}=creatorPayoutPolicy;
const won=(value:number)=>`${value.toLocaleString('ko-KR')}원`;
// 2026-10-31 user decision (server beta-policy payoutCutoff): Tuesday 23:59 KST cutoff, Wednesday payout, holiday → next business day.
// 2026-10-31 user decision (creator agreement annex A): withholding, when the law requires it, is borne by the company.
export const payoutTaxNote='법령상 원천징수가 필요한 경우 그 세액은 크레팬스가 부담해 신고·납부하며 정산금에서 떼지 않습니다. 본인의 소득세 신고와 사업자인 경우의 세무 증빙은 크리에이터가 합니다.';
export const payoutScheduleNote=`화요일 23:59(한국 시간)까지 신청한 출금은 그 주 ${payoutWeekday}에 지급하며, ${payoutWeekday}이 공휴일이면 다음 영업일에 지급합니다.`;

/** Effective terms from studio finance (signup-invites studioTerms); static defaults are only for general policy notes. */
export type CreatorTerms={platformFeeBps:number|null;settlementHoldDays:number|null;beanWithdrawalFeeBps:number|null;minimumWithdrawalKrw:number|null};
const pick=(t:CreatorTerms|null|undefined)=>({fee:t?.platformFeeBps!=null?t.platformFeeBps/100:feeRatePercent,hold:t?.settlementHoldDays??settlementHoldDays,beanFee:t?.beanWithdrawalFeeBps!=null?t.beanWithdrawalFeeBps/100:feeRatePercent,minimum:t?.minimumWithdrawalKrw??minimumWithdrawalKrw});

export function membershipPayoutNotesFor(terms?:CreatorTerms|null){const {fee,hold,minimum}=pick(terms);return [
  `멤버십 결제 시 총 공제율 ${fee}%(PG 비용·플랫폼 수수료 부가세 포함)를 차감한 금액이 수익으로 기록됩니다. ${payoutTaxNote}`,
  `결제 후 ${hold}일 보류가 끝나고 PG 실제 입금 대사가 완료된 수익부터 출금할 수 있습니다.`,
  `최소 ${won(minimum)}부터 신청할 수 있습니다. ${payoutScheduleNote} 출금할 때 추가 수수료는 없으며 이체 수수료는 플랫폼이 부담합니다.`,
  '출금은 확인된 본인 명의 정산 계좌로만 받을 수 있습니다.',
];}
export const membershipPayoutNotes=membershipPayoutNotesFor();

export function beanPayoutNotesFor(terms?:CreatorTerms|null){const {beanFee,minimum}=pick(terms);return [
  '후원받은 일반콩과 프로모션콩을 출금할 수 있습니다.',
  `후원받은 콩은 후원 후 ${beanTipHoldDays}일 보류가 끝나야 출금할 수 있습니다. 일반콩은 실제 입금 확인도 필요하고, 프로모션콩은 지급 출처를 확인합니다.`,
  '직접 충전한 콩과 운영자·이벤트·친구 초대 보상 등으로 무상 지급받은 프로모션콩은 출금할 수 없습니다.',
  `${Math.ceil(minimum/100).toLocaleString('ko-KR')}콩(총액 ${won(minimum)})부터 신청하며 수수료는 출금 시 ${beanFee}%입니다.`,
  payoutScheduleNote,
  payoutTaxNote,
];}
export const beanPayoutNotes=beanPayoutNotesFor();

export const minimumWithdrawalHintFor=(terms?:CreatorTerms|null)=>`최소 ${won(pick(terms).minimum)}부터 신청할 수 있습니다. 전액은 출금 가능 금액을 입력합니다.`;
export const minimumWithdrawalHint=minimumWithdrawalHintFor();

// Same rounding as the server ledger: fee is the floor of price × rate, the rest is creator revenue.
// A creator's own platform fee (terms) replaces the default rate, as the server does for new orders.
export function membershipRevenuePreview(price:number,terms?:CreatorTerms|null){
  const bps=terms?.platformFeeBps;
  if(!Number.isSafeInteger(price)||price<=0||bps==null||!Number.isInteger(bps)||bps<0||bps>10000)return null;
  const fee=Math.floor(price*bps/10000);
  return {fee,net:price-fee};
}

export function membershipPriceHint(price:number,terms?:CreatorTerms|null){
  const bps=terms?.platformFeeBps;
  if(bps==null||!Number.isInteger(bps)||bps<0||bps>10000)return '나의 공제율: 확인 필요';
  const base=`나의 공제율: ${bps/100}%`,preview=membershipRevenuePreview(price,terms);
  return preview?`${base} · 예상 수익: ${won(preview.net)} / 결제 1건`:base;
}
