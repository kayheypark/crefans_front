// 2026-11-18 user decision: PostHog Cloud US (project 745445) for funnel drop-off analysis with cookie persistence and session replay.
// Loaded only on the /service app and only when NEXT_PUBLIC_POSTHOG_KEY is set at build time; without the key nothing is imported or sent.
// Privacy choices follow https://posthog.com/docs/session-replay/privacy and https://posthog.com/docs/libraries/js/config (확인일 2026-11-18)
// plus the posthog-js 1.445.1 type docs (@posthog/types posthog-config.d.ts). No identify(): events stay on the anonymous cookie id.
import type {PostHog,PostHogConfig,CaptureResult} from 'posthog-js';

export const POSTHOG_KEY=process.env.NEXT_PUBLIC_POSTHOG_KEY||'';
export const POSTHOG_HOST=process.env.NEXT_PUBLIC_POSTHOG_HOST||'https://us.i.posthog.com';
/** PostHog's default block class: the element is replaced by an empty box of the same size in replay and ignored by autocapture. */
export const REPLAY_BLOCK_CLASS='ph-no-capture';
// Every picture/video/canvas is blocked, so uploaded originals, AI results, library photos, post media, avatars and paid media
// never reach a replay whichever component renders them. File/hidden inputs are blocked because replay records their values.
export const REPLAY_BLOCK_SELECTOR='img,picture,video,audio,canvas,svg image,iframe,[style*="url("],input[type="file"],input[type="hidden"]';

// Replay is opt-in per route (allowlist): payment, wallet/beans, payouts, account settings, login/signup, messages and every
// studio page except post writing stay unrecorded, including routes added later. Events are still captured on every /service page.
const REPLAY_ROUTES=[/^\/service\/landing(-ai-image-generation)?\/?$/,/^\/service\/try(\/done)?\/?$/,/^\/service\/(feed|explore)\/?$/,/^\/service\/(post|creator)\/[^/]+\/?$/,/^\/service\/(events|notices)(\/[^/]+)?\/?$/,/^\/service\/studio\/content(\/new|\/[^/]+\/edit)?\/?$/];
export function replayAllowed(pathname:string){return REPLAY_ROUTES.some(route=>route.test(pathname));}

/** Drops the query string and hash, which may carry tokens, codes or e-mail addresses. */
export function stripUrl(value:string){return value.replace(/[?#][\s\S]*$/,'');}
const ABSOLUTE_URL=/^https?:\/\//i;
function scrub(value:unknown):unknown{
 if(typeof value==='string')return ABSOLUTE_URL.test(value)?stripUrl(value):value;
 if(Array.isArray(value))return value.map(scrub);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,scrub(item)]));
 return value;
}
/** before_send: every absolute URL in properties/$set/$set_once loses its query and hash ($current_url, $referrer, $session_entry_url…). */
export function beforeSend(event:CaptureResult|null):CaptureResult|null{
 if(!event||event.event==='$snapshot')return event; // replay URLs are cleaned by maskCapturedNetworkRequestFn below
 return{...event,properties:scrub(event.properties) as CaptureResult['properties'],...(event.$set?{$set:scrub(event.$set) as CaptureResult['$set']}:{}),...(event.$set_once?{$set_once:scrub(event.$set_once) as CaptureResult['$set_once']}:{})};
}

export function posthogConfig(pathname:string):Partial<PostHogConfig>{
 return{
  api_host:POSTHOG_HOST,ui_host:'https://us.posthog.com',
  persistence:'cookie',secure_cookie:true,person_profiles:'identified_only',
  // Browser 'Do Not Track' opts out (the privacy-policy draft names it as a way to refuse; best-effort per PostHog docs).
  respect_dnt:true,
  capture_pageview:'history_change',capture_pageleave:true,
  // Clicks on links/buttons only, without element text or attributes (names, hrefs with ids); inputs/changes/submits are never autocaptured.
  autocapture:{dom_event_allowlist:['click'],element_allowlist:['a','button']},mask_all_text:true,mask_all_element_attributes:true,
  capture_dead_clicks:false,capture_heatmaps:false,capture_exceptions:false,capture_performance:false,disable_surveys:true,
  enable_recording_console_log:false,
  disable_session_recording:!replayAllowed(pathname),
  session_recording:{
   maskAllInputs:true,
   maskInputOptions:{password:true,email:true,text:true,textarea:true,tel:true,number:true,search:true,url:true,select:true,date:true},
   blockClass:REPLAY_BLOCK_CLASS,blockSelector:REPLAY_BLOCK_SELECTOR,
   recordHeaders:false,recordBody:false,
   // Also applied by the recorder to the page URL stored with each replay (meta href).
   maskCapturedNetworkRequestFn:request=>({...request,name:stripUrl(request.name)}),
  },
  before_send:beforeSend,
 };
}

let client:PostHog|null=null,loading:Promise<PostHog|null>|null=null;
const pending:[string,Record<string,unknown>][]=[];
export function loadPostHog(){
 if(!POSTHOG_KEY||typeof window==='undefined')return Promise.resolve(null);
 loading??=import('posthog-js').then(({default:posthog})=>{posthog.init(POSTHOG_KEY,posthogConfig(window.location.pathname));client=posthog;for(const [name,props] of pending.splice(0))posthog.capture(name,props);return posthog;}).catch(()=>null);
 return loading;
}
/** Route change: stop replay before a page outside the allowlist is recorded, resume on allowed pages. */
export function syncReplay(pathname:string){
 if(!client)return;
 if(replayAllowed(pathname)){if(!client.sessionRecordingStarted())client.startSessionRecording();}
 else if(client.sessionRecordingStarted())client.stopSessionRecording();
}

export type AnalyticsEvent='landing_view'|'guest_consent_view'|'guest_consent_agreed'|'ai_generation_started'|'ai_generation_succeeded'|'ai_generation_failed'|'caption_written'|'post_published'|'signup_view'|'signup_completed';
export function aiProps(actor:'guest'|'member',input:{mode?:string;kind:string;presetKeys?:{kind:string}[]}):AnalyticsProps{return{actor,mode:input.mode||'general',kind:input.kind,preset_kinds:Array.from(new Set((input.presetKeys||[]).map(preset=>preset.kind))).sort()};}
/** Non-personal properties only: actor type, mode and catalog/category keys, error codes. Never names, e-mail, ids or text. */
export type AnalyticsProps={actor?:'guest'|'member';mode?:string;kind?:string;preset_kinds?:string[];error_code?:string};
export function captureEvent(name:AnalyticsEvent,props:AnalyticsProps={}){
 // Shared components also render in /preview and the design system: only the /service app reports.
 if(!POSTHOG_KEY||typeof window==='undefined'||!window.location.pathname.startsWith('/service'))return;
 try{if(client)client.capture(name,props);else if(pending.length<20)pending.push([name,props]);}catch{}
}
