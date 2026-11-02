// Friend invite links (2026-11-01): /service/signup?ref=<referral code>. The code is kept for the browser session so it survives
// the email verification step; the server decides whether it is valid and whether referrals are open (REFERRAL_ENABLED).
export const REFERRAL_KEY='crefans-referral-code';
const pattern=/^[0-9a-f-]{36}$/;
export function rememberReferral(code:string|null){if(!code||!pattern.test(code))return;try{sessionStorage.setItem(REFERRAL_KEY,code);}catch{}}
export function storedReferral(){try{const code=sessionStorage.getItem(REFERRAL_KEY);return code&&pattern.test(code)?code:undefined;}catch{return undefined;}}
export const referralLink=(origin:string,code:string)=>`${origin}/service/signup?ref=${encodeURIComponent(code)}`;
// Signing up through a referral link shows the referrer a masked email (2026-11-02 user decision); the invitee agrees here.
export const REFERRAL_DISCLOSURE_LABEL='나를 초대한 회원에게 개인정보 제공 동의 (필수)';
// The five items of a third-party provision consent (2026-11-02.2); the server records the same text (referrals.ts REFERRAL_DISCLOSURE).
export const REFERRAL_DISCLOSURE_NOTICE='제공받는 자: 나를 초대한 회원 · 목적: 친구 초대 보상 진행 확인 · 항목: 이메일 일부(예: ab***@n***.com), 가입일, 보상 진행 상태·확정 예정일·지급일 · 보유·이용 기간: 내가 탈퇴할 때까지 · 동의를 거부할 수 있으며, 거부하면 초대 링크로는 가입할 수 없습니다.';
