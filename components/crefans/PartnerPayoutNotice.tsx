import {Action,ActionLink,Notice} from './ServiceUI';
import {usePartnerRequest} from '@/features/service/usePartnerRequest';

// 2026-11-12 user decision (ask-me): only creators with a signed Crefans partnership contract (verified badge) can withdraw.
// The server refuses the request either way (PARTNER_CONTRACT_REQUIRED); this replaces the form so nobody fills it in vain.
// Accounts and the withdrawal PIN can still be set up beforehand.
// 2026-11-15: the creator asks for the contract here; the operator sends it on Modusign and grants the badge after signing.
export function PartnerPayoutNotice({supportHref,mock=false}:{supportHref:string;mock?:boolean}){
  const partner=usePartnerRequest(mock);
  return <section aria-labelledby="partner-payout-title"><h2 id="partner-payout-title">파트너 계약 후 출금할 수 있어요</h2>
    <Notice>출금은 크레팬스와 파트너 계약을 맺은 크리에이터(인증 배지)만 신청할 수 있어요. 계약은 모두싸인 전자계약으로 진행되고, 서명이 끝나고 운영자가 확인하면 인증 배지가 붙어 출금할 수 있어요. 정산 계좌와 출금 PIN은 계약 전에도 미리 등록해 둘 수 있어요.</Notice>
    {partner.message?<p role="status">{partner.message}</p>:<Action variant="brand" disabled={partner.pending} onClick={()=>void partner.request()}>{partner.pending?'요청 중…':'파트너 계약 요청하기'}</Action>}
    {partner.error&&<p role="alert">{partner.error}</p>}
    <ActionLink variant="secondary" href={supportHref}>계약 문의하기</ActionLink></section>;
}
