import {ActionLink,Notice} from './ServiceUI';

// 2026-11-12 user decision (ask-me): only creators with a signed Crefans partnership contract (verified badge) can withdraw.
// The server refuses the request either way (PARTNER_CONTRACT_REQUIRED); this replaces the form so nobody fills it in vain.
// Accounts and the withdrawal PIN can still be set up beforehand.
export function PartnerPayoutNotice({supportHref}:{supportHref:string}){
  return <section aria-labelledby="partner-payout-title"><h2 id="partner-payout-title">파트너 계약 후 출금할 수 있어요</h2>
    <Notice>출금은 크레팬스와 파트너 계약을 맺은 크리에이터(인증 배지)만 신청할 수 있어요. 정산 계좌와 출금 PIN은 계약 전에도 미리 등록해 둘 수 있어요.</Notice>
    <ActionLink href={supportHref}>파트너 계약 문의하기</ActionLink></section>;
}
