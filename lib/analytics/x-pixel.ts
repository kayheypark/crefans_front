// 2026-11-22 user decisions (/ask-me): send X funnel events with the pixel already loaded in app/layout.tsx (rjls2) — notice and
// refusal in the privacy policy 9조 ⑤·10조 (2026-11-22.x-ads.1), no consent UI ("약관에 추가하고 UI변경금지"). Events were created in the
// ads account 18ce55ypb1x on 2026-11-22 (website_tag_id → event id tw-rjls2-<id>). Event name only: no ids, text, presets or amounts.
// 2026-11-23 user decision (/ask-me "주소 정리 + Purchase 추가"): Purchase carries value·currency·conversion_id only, after the server approved the payment.
// Purchase = '이용권 결제' (Define with code, 2026-11-21), the same id the server Conversion API sends (crefans_server src/platform/x-conversions.ts
// X_EVENT_PURCHASE). conversion_id dedups pixel and API: the AI shop uses 'shop-'+order id like the server; null here turns Purchase off.
const X_PURCHASE_EVENT_ID:string|null='tw-rjls2-rjoi0';
const X_EVENTS={page_view:'tw-rjls2-rjror',trial_start:'tw-rjls2-rjroo',ai_photo:'tw-rjls2-rjrop',checkout_start:'tw-rjls2-rjroq',purchase:X_PURCHASE_EVENT_ID} as const;
export type XEvent=Exclude<keyof typeof X_EVENTS,'purchase'>;
// uwt.js sends location.href and document.referrer with the config call and every event (tw_document_href / tw_document_referrer).
// Toss success/fail and card-registration returns carry these keys, so the pixel is neither loaded nor fed while they are in the address.
const BLOCKED_QUERY='[?&](paymentKey|orderId|amount|paymentType|authKey|customerKey|code|message|state|registrationId)=';
export function xPixelBlocked(w:{location?:{search?:string;origin?:string};document?:{referrer?:string}}):boolean{
 const re=new RegExp(BLOCKED_QUERY,'i'),ref=w.document?.referrer||'',origin=w.location?.origin;
 return re.test(w.location?.search||'')||(!!origin&&ref.startsWith(origin+'/')&&re.test(ref));
}
// Base code (official snippet) with the uwt.js load deferred until the address is clean; xEvent retries the load.
export const X_PIXEL_BASE_CODE=`!function(e,t,n,s){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],e.__xPixelLoad=function(){var r=new RegExp(${JSON.stringify(BLOCKED_QUERY)},'i'),f=t.referrer||'',u,a;
if(e.__xPixelLoaded||r.test(e.location.search)||(f.indexOf(e.location.origin+'/')===0&&r.test(f)))return;e.__xPixelLoaded=1;
u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a)})}(window,document,'script');
twq('config','rjls2');window.__xPixelLoad();`;
function send(id:string,params:Record<string,string|number>){
 try{if(typeof window==='undefined'||xPixelBlocked(window))return;const w=window as {twq?:(...args:unknown[])=>void;__xPixelLoad?:()=>void};w.__xPixelLoad?.();if(typeof w.twq==='function')w.twq('event',id,params);}catch{}
}
export function xEvent(name:XEvent){send(X_EVENTS[name],{});}
/** Internal order id only (never paymentKey, card or member data). null when the input is not a real paid amount. */
export function purchaseParams(value:number,conversionId:string){return Number.isFinite(value)&&value>0&&conversionId?{value,currency:'KRW',conversion_id:conversionId}:null;}
/** Call only after the server confirmed the payment as paid in this visit. */
export function xPurchase(value:number,conversionId:string){const p=purchaseParams(value,conversionId);if(X_EVENTS.purchase&&p)send(X_EVENTS.purchase,p);}
