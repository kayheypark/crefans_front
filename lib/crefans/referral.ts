// Friend invite links (2026-11-01): /service/signup?ref=<referral code>. The code is kept for the browser session so it survives
// the email verification step; the server decides whether it is valid and whether referrals are open (REFERRAL_ENABLED).
export const REFERRAL_KEY='crefans-referral-code';
const pattern=/^[0-9a-f-]{36}$/;
export function rememberReferral(code:string|null){if(!code||!pattern.test(code))return;try{sessionStorage.setItem(REFERRAL_KEY,code);}catch{}}
export function storedReferral(){try{const code=sessionStorage.getItem(REFERRAL_KEY);return code&&pattern.test(code)?code:undefined;}catch{return undefined;}}
export const referralLink=(origin:string,code:string)=>`${origin}/service/signup?ref=${encodeURIComponent(code)}`;
