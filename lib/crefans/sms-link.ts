// 2026-11-16: opening the messaging app with the code filled in. There is no single standard: Android apps read `sms:NUMBER?body=`,
// iOS 8+ Messages reads `sms:NUMBER&body=` (sources checked 2026-11-16: sms-href library constants, west-wind.com sms URI notes).
// iPadOS 13+ reports a Mac user agent, so a touch-capable 'Macintosh' is treated as iOS.
export type SmsPlatform='ios'|'android'|'desktop';
export function smsPlatform(userAgent:string,maxTouchPoints=0):SmsPlatform{
 if(/iPhone|iPad|iPod/i.test(userAgent)||(/Macintosh/i.test(userAgent)&&maxTouchPoints>1))return 'ios';
 if(/Android/i.test(userAgent))return 'android';
 return 'desktop';
}
export function smsHref(receiver:string,body:string,platform:SmsPlatform){
 const number=receiver.replace(/[^0-9+]/g,''),text=encodeURIComponent(body);
 return platform==='ios'?`sms:${number}&body=${text}`:`sms:${number}?body=${text}`;
}
