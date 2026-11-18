// 2026-11-18 user decision ("방법 1 서버 집계"): report that this tab reached a funnel view step. The server keeps only a
// per-day count per step — nothing about the visitor. Each step is sent at most once per tab session (sessionStorage), so the
// numbers are approximate: a new tab, a blocked storage or another device counts again.
export type FunnelViewStep='landing_view'|'guest_consent_view'|'signup_view';
const FLAG='crefans-funnel:';
export function reportFunnelStep(step:FunnelViewStep){
 try{if(window.sessionStorage.getItem(FLAG+step)==='1')return;window.sessionStorage.setItem(FLAG+step,'1');}catch{}
 void fetch('/api/v1/telemetry/funnel',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({step}),keepalive:true}).catch(()=>{});
}
