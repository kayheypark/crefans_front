// 2026-11-18 user decision ("방법 1 서버 집계"): report that this tab reached a funnel view step. The server keeps only a
// per-day count per step — nothing about the visitor. Each step is sent at most once per tab session (sessionStorage), so the
// numbers are approximate: a new tab, a blocked storage or another device counts again.
export type FunnelViewStep='landing_view'|'guest_consent_view'|'signup_view';
const FLAG='crefans-funnel:';
// 2026-11-18 user decision (랜딩 방문 텔레그램 알림): the landing view also names where the visit came from — only the external
// referrer's host name (never the full URL, path or query) and the utm_source value. The server validates and may drop both.
// 2026-11-18 user decision (당근 캠페인): utm_medium and utm_campaign are sent the same way so the alert shows the campaign.
// 2026-11-18 (당근 광고 3개): utm_content tells the ads apart and is sent the same way.
const UTM_FIELDS=[['utm_source','utmSource'],['utm_medium','utmMedium'],['utm_campaign','utmCampaign'],['utm_content','utmContent']] as const;
function landingSource(){
 const source:{referrerHost?:string;utmSource?:string;utmMedium?:string;utmCampaign?:string;utmContent?:string}={};
 try{const ref=document.referrer?new URL(document.referrer):null;if(ref&&/^https?:$/.test(ref.protocol)&&ref.hostname!==window.location.hostname)source.referrerHost=ref.hostname.toLowerCase();}catch{}
 try{const query=new URLSearchParams(window.location.search);for(const [param,key] of UTM_FIELDS){const utm=query.get(param);if(utm&&/^[A-Za-z0-9_.-]{1,40}$/.test(utm))source[key]=utm;}}catch{}
 return source;
}
// 2026-11-20 user request (AI 사진 체험 관리 유입 경로): the first page of this tab's visit and where it came from, kept for the tab
// (sessionStorage) and sent once with the trial consent. Same fields and rules as the landing alert, plus the first page's path.
const ENTRY='crefans-entry-source';
export type EntrySource=ReturnType<typeof landingSource>&{landingPath?:string};
export function rememberEntrySource():EntrySource{
 try{const saved=window.sessionStorage.getItem(ENTRY);if(saved)return JSON.parse(saved) as EntrySource;}catch{}
 const source:EntrySource={...landingSource(),landingPath:window.location.pathname.slice(0,120)};
 try{window.sessionStorage.setItem(ENTRY,JSON.stringify(source));}catch{}
 return source;
}
export function reportFunnelStep(step:FunnelViewStep){
 rememberEntrySource();
 try{if(window.sessionStorage.getItem(FLAG+step)==='1')return;window.sessionStorage.setItem(FLAG+step,'1');}catch{}
 const body=step==='landing_view'?{step,...landingSource()}:{step};
 void fetch('/api/v1/telemetry/funnel',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true}).catch(()=>{});
}
