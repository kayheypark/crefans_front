// Mirrors creator terms section 6 (server src/platform/legal-documents.ts) and server payout constants.
// Change together with the terms version. The studio finance API returns only a creator's own overrides (creatorTerms).
// Server beanPolicy.tipHoldDays: received beans wait this many days from the tip itself.
export const beanTipHoldDays=7;
export const creatorPayoutPolicy={feeRatePercent:20,settlementHoldDays:7,minimumWithdrawalKrw:100000,payoutWeekday:'수요일'} as const;

const {feeRatePercent,settlementHoldDays,minimumWithdrawalKrw,payoutWeekday}=creatorPayoutPolicy;
const won=(value:number)=>`${value.toLocaleString('ko-KR')}원`;

/** A creator's own terms from the studio finance API (server signup-invites studioTerms); null fields use the defaults above. */
export type CreatorTerms={platformFeeBps:number|null;settlementHoldDays:number|null;beanWithdrawalFeeBps:number|null;minimumWithdrawalKrw:number|null};
const pick=(t:CreatorTerms|null|undefined)=>({fee:t?.platformFeeBps!=null?t.platformFeeBps/100:feeRatePercent,hold:t?.settlementHoldDays??settlementHoldDays,beanFee:t?.beanWithdrawalFeeBps!=null?t.beanWithdrawalFeeBps/100:feeRatePercent,minimum:t?.minimumWithdrawalKrw??minimumWithdrawalKrw});

export function membershipPayoutNotesFor(terms?:CreatorTerms|null){const {fee,hold,minimum}=pick(terms);return [
  `멤버십 결제 시 총 공제율 ${fee}%(PG 비용·플랫폼 수수료 부가세 포함)를 차감한 금액이 수익으로 기록됩니다. 세금 처리 방식(원천징수 여부 포함)은 정식 정산 전에 안내합니다.`,
  `결제 후 ${hold}일 보류가 끝나고 PG 실제 입금 대사가 완료된 수익부터 출금할 수 있습니다.`,
  `최소 ${won(minimum)}부터 신청할 수 있으며 매주 ${payoutWeekday} 지급을 기준으로 합니다. 출금할 때 추가 수수료는 없으며 이체 수수료는 플랫폼이 부담합니다.`,
  '출금은 확인된 본인 명의 정산 계좌로만 받을 수 있습니다.',
];}
export const membershipPayoutNotes=membershipPayoutNotesFor();

export function beanPayoutNotesFor(terms?:CreatorTerms|null){const {beanFee,minimum}=pick(terms);return [
  '후원받은 일반콩과 프로모션콩을 출금할 수 있습니다.',
  `후원받은 콩은 후원 후 ${beanTipHoldDays}일 보류가 끝나야 출금할 수 있습니다. 일반콩은 실제 입금 확인도 필요하고, 프로모션콩은 지급 출처를 확인합니다.`,
  '직접 충전한 콩과 운영자가 지급한 프로모션콩은 출금할 수 없습니다.',
  `${Math.ceil(minimum/100).toLocaleString('ko-KR')}콩(총액 ${won(minimum)})부터 신청하며 수수료는 출금 시 ${beanFee}%입니다.`,
  `매주 ${payoutWeekday} 지급을 기준으로 합니다.`,
];}
export const beanPayoutNotes=beanPayoutNotesFor();

export const minimumWithdrawalHintFor=(terms?:CreatorTerms|null)=>`최소 ${won(pick(terms).minimum)}부터 신청할 수 있습니다. 전액은 출금 가능 금액을 입력합니다.`;
export const minimumWithdrawalHint=minimumWithdrawalHintFor();

// Same rounding as the server ledger: fee is the floor of price × rate, the rest is creator revenue.
// A creator's own platform fee (terms) replaces the default rate, as the server does for new orders.
export function membershipRevenuePreview(price:number,terms?:CreatorTerms|null){
  if(!Number.isSafeInteger(price)||price<=0)return null;
  const fee=Math.floor(price*(terms?.platformFeeBps??feeRatePercent*100)/10000);
  return {fee,net:price-fee};
}

export function membershipPriceHint(price:number,terms?:CreatorTerms|null){
  const preview=membershipRevenuePreview(price,terms);
  const base=`결제 시 총 공제율 ${pick(terms).fee}%가 차감되어 수익으로 기록됩니다. 세금 처리는 정식 정산 전에 안내합니다.`;
  return preview?`${base} 예상 수익 ${won(preview.net)} (수수료 ${won(preview.fee)})`:base;
}
