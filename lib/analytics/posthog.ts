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
// 2026-11-18 user decision: public static artwork shipped with the app (/brand/…, /illustrations/…: preset thumbnails, landing
// examples of AI-made virtual models, icons, banners) stays visible so replays show which preset was picked. Member media is
// served from the API, blob: or data: URLs and never from these paths, so it stays blocked.
export const PUBLIC_REPLAY_IMAGE_PREFIXES=['/brand/','/illustrations/'];
// next/image serves the same public files as /_next/image?url=%2Fbrand%2F… (URL-encoded); those stay visible too.
const publicImage=PUBLIC_REPLAY_IMAGE_PREFIXES.flatMap(prefix=>[prefix,`/_next/image?url=${encodeURIComponent(prefix)}`]).map(prefix=>`:not([src^="${prefix}"])`).join('');
const publicBackground=PUBLIC_REPLAY_IMAGE_PREFIXES.map(prefix=>`:not([style*="url(${prefix}"]):not([style*="url('${prefix}"]):not([style*='url("${prefix}'])`).join('');
// 2026-11-19 user decision (처리방침 2026-11-19.guest-replay.1 17항): a signed-out visitor who recorded the replay consent is
// recorded unmasked on the trial screens only. The trial model sets this attribute on <html> while the trial page is open for such a
// visitor and removes it on leave; media and inputs inside are then recorded as shown. File/hidden inputs and passwords stay masked.
export const REPLAY_UNMASK_ATTR='data-ph-unmask';
const unlessUnmasked=`:not(html[${REPLAY_UNMASK_ATTR}] *)`;
export const REPLAY_BLOCK_SELECTOR=[`img${publicImage}`,'picture','video','audio','canvas','svg image','iframe',`[style*="url("]${publicBackground}`].map(part=>part+unlessUnmasked).concat('input[type="file"]','input[type="hidden"]').join(',');
// 2026-11-23 user request: the title and body a member types in the post editor are recorded as typed. Only those two fields carry
// this attribute; every other input (password, e-mail, phone, payment, verification codes) stays masked.
export const REPLAY_POST_TEXT_ATTR='data-ph-post-text';
/** Session-replay input masking: everything is masked unless the trial page unmasked it for a consenting visitor, or it is a member's
 * post title/body field (never passwords). */
export function maskReplayInput(text:string,element?:HTMLElement){
 const unmasked=!!(element?.closest?.(`html[${REPLAY_UNMASK_ATTR}]`)||element?.closest?.(`[${REPLAY_POST_TEXT_ATTR}]`))&&(element as HTMLInputElement).type!=='password';
 return unmasked?text:'*'.repeat(text.length);
}
/** Called by the guest trial model only: on for a visitor with a recorded replay consent while the trial page is open. */
export function setReplayUnmasked(on:boolean){
 if(typeof document==='undefined')return;
 if(on)document.documentElement.setAttribute(REPLAY_UNMASK_ATTR,'');else document.documentElement.removeAttribute(REPLAY_UNMASK_ATTR);
}
// 2026-11-20 user report: in replays of a consenting guest's trial page the AI result photo showed as a broken image — the
// recording keeps only its private URL (/api/v1/media/:id/file), which the replay player cannot open without the visitor's session.
// While unmasking is on, private photos on the page are swapped for a downscaled copy (JPEG, longest side 720px) so the replay
// carries the image itself. Privacy 17항 (guest-replay) already lists the uploaded thumbnails and AI photos sent to PostHog.
const PRIVATE_MEDIA=/\/api\/v1\/media\/[^/?#]+\/file|\/_next\/image\?url=%2Fapi%2Fv1%2Fmedia%2F/;
const REPLAY_IMAGE_MAX=720;
let inlineObserver:MutationObserver|null=null;
const inlined=new WeakMap<HTMLImageElement,string>();
export async function inlineReplayImage(img:HTMLImageElement){
 const src=img.getAttribute('src')||'';
 if(!PRIVATE_MEDIA.test(src)||inlined.get(img)===src)return false;
 inlined.set(img,src);
 try{
  const response=await fetch(src,{credentials:'include'});if(!response.ok)return false;
  const bitmap=await createImageBitmap(await response.blob());
  const scale=Math.min(1,REPLAY_IMAGE_MAX/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  canvas.getContext('2d')?.drawImage(bitmap,0,0,canvas.width,canvas.height);
  // Unmasking may have ended (left the trial page) or the image may show another photo by now.
  if(!document.documentElement.hasAttribute(REPLAY_UNMASK_ATTR)||img.getAttribute('src')!==src)return false;
  const data=canvas.toDataURL('image/jpeg',.82);inlined.set(img,data);img.removeAttribute('srcset');img.setAttribute('src',data);return true;
 }catch{return false;}
}
export function setReplayInlineImages(on:boolean){
 if(typeof document==='undefined'||typeof MutationObserver==='undefined')return;
 if(!on){inlineObserver?.disconnect();inlineObserver=null;return;}
 if(inlineObserver)return;
 const scan=(root:ParentNode)=>root.querySelectorAll('img').forEach(img=>void inlineReplayImage(img));
 scan(document);
 inlineObserver=new MutationObserver(records=>{for(const record of records){
  if(record.type==='attributes'&&record.target instanceof HTMLImageElement)void inlineReplayImage(record.target);
  record.addedNodes.forEach(node=>{if(node instanceof HTMLImageElement)void inlineReplayImage(node);else if(node instanceof Element)scan(node);});
 }});
 inlineObserver.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
}

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
// 2026-11-19 (처리방침 2026-11-19.posthog.2 9조 ④ 화면 오류 정보): exception messages may embed URLs, e-mails or numbers typed by
// the visitor. Inside every string of an $exception event: URLs lose query/hash, e-mails and digit runs of 6+ are replaced, length ≤ 500.
const URL_IN_TEXT=/https?:\/\/[^\s'"<>)]+/g,EMAIL=/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,DIGITS=/\d{6,}/g;
export function scrubErrorText(value:string){return value.replace(URL_IN_TEXT,url=>stripUrl(url)).replace(EMAIL,'<email>').replace(DIGITS,'<number>').slice(0,500);}
function scrubError(value:unknown):unknown{
 if(typeof value==='string')return scrubErrorText(value);
 if(Array.isArray(value))return value.map(scrubError);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,scrubError(item)]));
 return value;
}
/** before_send: every absolute URL in properties/$set/$set_once loses its query and hash ($current_url, $referrer, $session_entry_url…). */
export function beforeSend(event:CaptureResult|null):CaptureResult|null{
 if(!event||event.event==='$snapshot')return event; // replay URLs are cleaned by maskCapturedNetworkRequestFn below
 const properties=event.event==='$exception'?scrubError(scrub(event.properties)):scrub(event.properties);
 return{...event,properties:properties as CaptureResult['properties'],...(event.$set?{$set:scrub(event.$set) as CaptureResult['$set']}:{}),...(event.$set_once?{$set_once:scrub(event.$set_once) as CaptureResult['$set_once']}:{})};
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
  // 2026-11-19 user decision (이탈 분석): dead clicks (a click with no page reaction) are on — they are clicks, already in the privacy
  // policy's PostHog item; text/attributes stay masked. 2026-11-19 posthog.2: exceptions on too (screen error information, scrubbed below).
  capture_dead_clicks:true,capture_heatmaps:false,capture_exceptions:true,capture_performance:false,disable_surveys:true,
  enable_recording_console_log:false,
  disable_session_recording:!replayAllowed(pathname),
  session_recording:{
   maskAllInputs:true,
   maskInputOptions:{password:true,email:true,text:true,textarea:true,tel:true,number:true,search:true,url:true,select:true,date:true},
   maskInputFn:maskReplayInput,
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
/** The PostHog session (replay) ID of this tab, or null without PostHog (no key, e.g. the dev server). 2026-11-20: the console
 * trial history links to the replay; only this random UUID is sent to our server, never replay content. */
export async function replaySessionId(){try{const posthog=await loadPostHog();const id=posthog?.get_session_id?.();return typeof id==='string'&&/^[0-9a-f-]{36}$/i.test(id)?id:null;}catch{return null;}}
/** 2026-11-22: the PostHog visitor number (anonymous distinct_id, a random UUID) so the console can also find the trial by it. */
export async function replayVisitorId(){try{const posthog=await loadPostHog();const id=posthog?.get_distinct_id?.();return typeof id==='string'&&/^[0-9a-f-]{36}$/i.test(id)?id:null;}catch{return null;}}
/** Route change: stop replay before a page outside the allowlist is recorded, resume on allowed pages. */
export function syncReplay(pathname:string){
 if(!client)return;
 if(replayAllowed(pathname)){if(!client.sessionRecordingStarted())client.startSessionRecording();}
 else if(client.sessionRecordingStarted())client.stopSessionRecording();
}

export type AnalyticsEvent='landing_view'|'guest_consent_view'|'guest_consent_agreed'|'ai_editor_opened'|'ai_generation_started'|'ai_generation_succeeded'|'ai_generation_failed'|'photo_decided'|'ai_result_share_clicked'|'ai_result_shared'|'costume_shop_clicked'|'ai_result_closed'|'ai_result_original'|'ai_result_continue'|'landing_cta_clicked'|'caption_written'|'caption_failed'|'post_published'|'post_publish_failed'|'signup_view'|'signup_completed';
/** 2026-11-20 이탈 분석: which fixed landing CTA was clicked (PostHog masks click text, so the button cannot be told apart otherwise). */
export type LandingCtaPlace='header'|'hero'|'look_detail'|'preset'|'preset_dialog'|'final';
export function aiProps(actor:'guest'|'member',input:{mode?:string;kind:string;presetKeys?:{kind:string}[]}):AnalyticsProps{return{actor,mode:input.mode||'general',kind:input.kind,preset_kinds:Array.from(new Set((input.presetKeys||[]).map(preset=>preset.kind))).sort()};}
/** Non-personal properties only: actor type, mode and catalog/category keys, error codes. Never names, e-mail, ids or text. */
export type AnalyticsProps={actor?:'guest'|'member';mode?:string;kind?:string;preset_kinds?:string[];error_code?:string;place?:LandingCtaPlace};
export function captureEvent(name:AnalyticsEvent,props:AnalyticsProps={}){
 // Shared components also render in /preview and the design system: only the /service app reports.
 if(!POSTHOG_KEY||typeof window==='undefined'||!window.location.pathname.startsWith('/service'))return;
 try{if(client)client.capture(name,props);else if(pending.length<20)pending.push([name,props]);}catch{}
}
