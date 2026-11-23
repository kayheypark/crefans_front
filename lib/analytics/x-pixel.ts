// 2026-11-22 user decisions (/ask-me): send X funnel events with the pixel already loaded in app/layout.tsx (rjls2) — notice and
// refusal in the privacy policy 9조 ⑤·10조 (2026-11-22.x-ads.1), no consent UI ("약관에 추가하고 UI변경금지"). Events were created in the
// ads account 18ce55ypb1x on 2026-11-22 (website_tag_id → event id tw-rjls2-<id>). Event name only: no ids, text, presets or amounts.
const X_EVENTS={page_view:'tw-rjls2-rjror',trial_start:'tw-rjls2-rjroo',ai_photo:'tw-rjls2-rjrop',checkout_start:'tw-rjls2-rjroq'} as const;
export type XEvent=keyof typeof X_EVENTS;
export function xEvent(name:XEvent){
 try{if(typeof window==='undefined')return;const twq=(window as {twq?:(...args:unknown[])=>void}).twq;if(typeof twq==='function')twq('event',X_EVENTS[name],{});}catch{}
}
