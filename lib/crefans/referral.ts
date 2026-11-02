// Friend invite links (2026-11-01): /service/signup?ref=<referral code>. The code is kept for the browser session so it survives
// the email verification step; the server decides whether it is valid and whether referrals are open (REFERRAL_ENABLED).
export const REFERRAL_KEY='crefans-referral-code';
const pattern=/^[0-9a-f-]{36}$/;
export function rememberReferral(code:string|null){if(!code||!pattern.test(code))return;try{sessionStorage.setItem(REFERRAL_KEY,code);}catch{}}
export function storedReferral(){try{const code=sessionStorage.getItem(REFERRAL_KEY);return code&&pattern.test(code)?code:undefined;}catch{return undefined;}}
export const referralLink=(origin:string,code:string)=>`${origin}/service/signup?ref=${encodeURIComponent(code)}`;
// Signing up through a referral link shows the referrer a masked email (2026-11-02 user decision); the invitee agrees here.
export const REFERRAL_DISCLOSURE_LABEL='초대한 회원에게 내 이메일 일부(예: ab***@n***.com)와 가입·보상 진행 상태가 표시되는 것에 동의합니다 (필수)';
