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

// 2026-11-16 user decision: only partner creators can open a new membership (server MEMBERSHIP_PARTNER_REQUIRED). Existing
// memberships stay on sale and can be edited or paused; reopening a paused one also needs the contract.
export function MembershipPartnerNotice({mock=false}:{mock?:boolean}){
  const partner=usePartnerRequest(mock);
  return <section aria-labelledby="membership-partner-title"><h2 id="membership-partner-title">파트너 계약 후 멤버십을 열 수 있어요</h2>
    <Notice>새 멤버십은 크레팬스와 파트너 계약을 맺은 크리에이터(인증 배지)만 만들 수 있어요. 이미 연 멤버십은 계속 판매하고 수정·중지할 수 있지만, 중지한 멤버십을 다시 여는 것도 계약 후에 할 수 있어요. 후원은 계약 전에도 받을 수 있어요.</Notice>
    {partner.message?<p role="status">{partner.message}</p>:<Action variant="brand" disabled={partner.pending} onClick={()=>void partner.request()}>{partner.pending?'요청 중…':'파트너 계약 요청하기'}</Action>}
    {partner.error&&<p role="alert">{partner.error}</p>}</section>;
}
