// 2026-11-18 user decision: PostHog Cloud US (project 745445) for funnel drop-off analysis with cookie persistence and session replay.
// Loaded only on the /service app and only when NEXT_PUBLIC_POSTHOG_KEY is set at build time; without the key nothing is imported or sent.
// Privacy choices follow https://posthog.com/docs/session-replay/privacy and https://posthog.com/docs/libraries/js/config (확인일 2026-11-18)
// plus the posthog-js 1.445.1 type docs (@posthog/types posthog-config.d.ts). No identify(): events stay on the anonymous cookie id.
import type {PostHog,PostHogConfig,CaptureResult} from 'posthog-js';

export const POSTHOG_KEY=process.env.NEXT_PUBLIC_POSTHOG_KEY||'';
export const MEMBER_LIBRARY_REPLAY=process.env.NEXT_PUBLIC_POSTHOG_MEMBER_LIBRARY_REPLAY==='true';
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
// 2026-11-24 user decision (처리방침 2026-11-24.generic.5 9조 ④): a signed-in member is recorded like a consenting guest — photos/videos
// on screen (own uploads, AI results, public post media) and typed text — on the replay routes only. PostHogAnalytics sets this
// attribute while a member is on an allowed route. Sensitive inputs (sensitiveReplayInput) and file/hidden inputs stay masked.
// Another creator's membership-only (paid) media stays blocked: render sites put REPLAY_PAID_ATTR on it (replayBlocksPost) and the
// inliner refuses it (setReplayRestrictedMedia). Reason: that media is sold to subscribers only; copying it into an analytics
// recording would hand paid content to a third party (PostHog) and to operators outside the creator's sale, and the privacy policy
// names only the member's own photos and public media. Its private URL alone stays unreadable in the player (needs the viewer's login).
export const REPLAY_MEMBER_ATTR='data-ph-member';
/** Always blocked, also on unmasked screens: the element and everything inside it is an empty box in the replay. */
export const REPLAY_PAID_ATTR='data-ph-paid';
const REPLAY_LIBRARY_ATTR='data-ph-library-replay';
const PROFILE_LIBRARY_PATH=/^\/service\/me\/?$/;
const outsideLibrary=`html[${REPLAY_LIBRARY_ATTR}] body > :not([data-ph-library-root])`;
const unlessUnmasked=`:not(html[${REPLAY_UNMASK_ATTR}] *):not(html[${REPLAY_MEMBER_ATTR}] *)`+(MEMBER_LIBRARY_REPLAY?`:not(html[${REPLAY_LIBRARY_ATTR}] [data-ph-library-root] *)`:'');
export const REPLAY_BLOCK_SELECTOR=[`img${publicImage}`,'picture','video','audio','canvas','svg image','iframe',`[style*="url("]${publicBackground}`].map(part=>part+unlessUnmasked).concat('input[type="file"]','input[type="hidden"]',`[${REPLAY_PAID_ATTR}]`,...(MEMBER_LIBRARY_REPLAY?[outsideLibrary]:[])).join(',');
// 2026-11-23 user request: the title and body a member types in the post editor are recorded as typed. Only those two fields carry
// this attribute; every other input (password, e-mail, phone, payment, verification codes) stays masked.
export const REPLAY_POST_TEXT_ATTR='data-ph-post-text';
// 2026-11-24: inputs that stay masked even on unmasked screens — by type, autocomplete token, inputmode and name/id. Covers passwords,
// e-mail, phone, verification codes, card/payment, bank account, resident/identity numbers, real name, birth date and address.
const SENSITIVE_TYPES=new Set(['password','email','tel','file','hidden']);
const SENSITIVE_AUTOCOMPLETE=/(^|\s)(username|email|tel(-[a-z-]+)?|current-password|new-password|one-time-code|cc-[a-z-]+|transaction-[a-z-]+|name|given-name|family-name|additional-name|bday(-[a-z]+)?|street-address|address-line\d|address-level\d|postal-code)(\s|$)/i;
const SENSITIVE_INPUTMODE=new Set(['tel','email','numeric']);
const SENSITIVE_NAME=/pass|pwd|\bpw|pin|otp|code|verif|auth|token|secret|e-?mail|phone|mobile|\btel|card|\bcc|cvc|cvv|expir|account|bank|iban|routing|holder|depositor|rrn|resident|jumin|ssn|birth|identity|realname|real_name|address/i;
const attr=(element:HTMLElement,name:string)=>{const value=(element as any)[name];return typeof value==='string'?value:element.getAttribute?.(name)||'';};
export function sensitiveReplayInput(element:HTMLElement){
 if(SENSITIVE_TYPES.has(attr(element,'type').toLowerCase()))return true;
 if(SENSITIVE_AUTOCOMPLETE.test(element.getAttribute?.('autocomplete')||''))return true;
 if(SENSITIVE_INPUTMODE.has((element.getAttribute?.('inputmode')||'').toLowerCase()))return true;
 return SENSITIVE_NAME.test(`${attr(element,'name')} ${attr(element,'id')}`);
}
/** Session-replay input masking: everything is masked unless the screen is unmasked (consenting guest on the trial page, a signed-in
 * member on a replay route) or it is a member's post title/body field; sensitive inputs are always masked. */
export function maskReplayInput(text:string,element?:HTMLElement){
 const unmasked=!!element&&!sensitiveReplayInput(element)&&!!(element.closest?.(`html[${REPLAY_UNMASK_ATTR}]`)||element.closest?.(`html[${REPLAY_MEMBER_ATTR}]`)||element.closest?.(`[${REPLAY_POST_TEXT_ATTR}]`)||element.closest?.(`html[${REPLAY_LIBRARY_ATTR}] [data-ph-library-root]`));
 return unmasked?text:'*'.repeat(text.length);
}
/** True when this post's media must stay out of replays for this viewer: membership-only and not the viewer's own (see REPLAY_MEMBER_ATTR). */
export function replayBlocksPost(post:{creatorId:string;requiredRank:number;requiredPlanId?:string},viewer:{ownCreatorIds?:string[];viewerId?:string|null}){
 const paid=post.requiredRank>0||!!post.requiredPlanId,own=!!viewer.ownCreatorIds?.includes(post.creatorId)||(!!viewer.viewerId&&post.creatorId===viewer.viewerId);
 return paid&&!own;
}
const MEDIA_ID=/\/api\/v1\/media\/([^/?#&]+)\/(?:file|library-file|thumbnail)(?:[?#&]|$)/;
const LIBRARY_ASSET=/\/api\/v1\/media\/[^/?#&]+\/(?:library-file|thumbnail)(?:[?#&]|$)/;
function mediaIdOf(src:string){try{return MEDIA_ID.exec(decodeURIComponent(src))?.[1]||null;}catch{return MEDIA_ID.exec(src)?.[1]||null;}}
let restrictedMedia=new Set<string>();
/** Media ids of other creators' membership-only posts on screen (PostHogAnalytics, from the loaded posts): never embedded in a replay. */
export function setReplayRestrictedMedia(urls:Iterable<string>){restrictedMedia=new Set(Array.from(urls,mediaIdOf).filter((id):id is string=>!!id));}
/** Called by the guest trial model only: on for a visitor with a recorded replay consent while the trial page is open. */
export function setReplayUnmasked(on:boolean){
 if(typeof document==='undefined')return;
 if(on)document.documentElement.setAttribute(REPLAY_UNMASK_ATTR,'');else document.documentElement.removeAttribute(REPLAY_UNMASK_ATTR);
}
// 2026-11-20 user report: in replays of a consenting guest's trial page the AI result photo showed as a broken image — the
// recording keeps only its private URL (/api/v1/media/:id/file), which the replay player cannot open without the visitor's session.
// While unmasking is on, private photos on the page are swapped for a downscaled copy (JPEG, longest side 720px) so the replay
// carries the image itself. Privacy 17항 (guest-replay) already lists the uploaded thumbnails and AI photos sent to PostHog.
// 2026-11-24: members too (REPLAY_MEMBER_ATTR), and local previews (blob:) of photos being uploaded in the post editor. A member's
// copy is 1080px on the longest side: the swap also changes what the member sees on feed/post pages, where 720px looked soft.
const PRIVATE_MEDIA=/\/api\/v1\/media\/[^/?#]+\/file|\/_next\/image\?url=%2Fapi%2Fv1%2Fmedia%2F|^blob:/;
const REPLAY_IMAGE_MAX=720,MEMBER_REPLAY_IMAGE_MAX=1080;
let inlineObserver:MutationObserver|null=null;
const inlineOwners=new Set<string>();
const inlined=new WeakMap<HTMLImageElement|HTMLVideoElement,string>();
const profileLibraryRecording=()=>typeof document!=='undefined'&&document.documentElement.hasAttribute(REPLAY_LIBRARY_ATTR);
const replayUnmasked=()=>document.documentElement.hasAttribute(REPLAY_UNMASK_ATTR)||document.documentElement.hasAttribute(REPLAY_MEMBER_ATTR)||profileLibraryRecording();
function mayInline(src:string){
 let decoded=src;
 try{decoded=decodeURIComponent(src);}catch{}
 if(LIBRARY_ASSET.test(decoded)){
  const member=document.documentElement.hasAttribute(REPLAY_MEMBER_ATTR)||profileLibraryRecording();
  return MEMBER_LIBRARY_REPLAY&&member&&src.startsWith('/api/v1/media/');
 }
 return PRIVATE_MEDIA.test(src);
}
const replayImageMax=()=>document.documentElement.hasAttribute(REPLAY_UNMASK_ATTR)?REPLAY_IMAGE_MAX:MEMBER_REPLAY_IMAGE_MAX;
/** Media that must not be embedded: inside a blocked element (another creator's paid post) or a restricted media id. */
function replayRestricted(element:Element,src:string){const id=mediaIdOf(src);return !!element.closest?.(`.${REPLAY_BLOCK_CLASS},[${REPLAY_PAID_ATTR}]`)||!!element.closest?.(outsideLibrary)||(!!id&&restrictedMedia.has(id));}
function downscale(source:CanvasImageSource,width:number,height:number){
 const scale=Math.min(1,replayImageMax()/Math.max(width,height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
 canvas.getContext('2d')?.drawImage(source,0,0,canvas.width,canvas.height);
 return canvas.toDataURL('image/jpeg',.82);
}
async function fetchReplayImage(src:string){
 const response=await fetch(src,{credentials:'include'});
 if(!response.ok)return null;
 const bitmap=await createImageBitmap(await response.blob());
 try{return downscale(bitmap,bitmap.width,bitmap.height);}
 finally{bitmap.close?.();}
}
export async function inlineReplayImage(img:HTMLImageElement){
 const src=img.getAttribute('src')||'';
 if(!replayUnmasked()||!mayInline(src)||inlined.get(img)===src||replayRestricted(img,src))return false;
 inlined.set(img,src);
 try{
  const data=await fetchReplayImage(src);
  // Unmasking may have ended (left the page or signed out) or the image may show another photo by now.
  if(!data||!replayUnmasked()||img.getAttribute('src')!==src||replayRestricted(img,src))return false;
  inlined.set(img,data);img.removeAttribute('srcset');img.setAttribute('src',data);return true;
 }catch{return false;}
}
/** Private/local videos get a downscaled first-frame poster, which the replay shows (the player cannot open the private file). */
export function inlineReplayVideo(video:HTMLVideoElement){
 const src=video.getAttribute('src')||'';
 const poster=video.getAttribute('poster');
 if(!replayUnmasked()||inlined.get(video)===src||replayRestricted(video,src))return false;
 if(poster){
  if(!MEMBER_LIBRARY_REPLAY||!LIBRARY_ASSET.test(poster)||!mayInline(poster)||replayRestricted(video,poster))return false;
  inlined.set(video,src);
  void fetchReplayImage(poster).then(data=>{
   if(data&&replayUnmasked()&&(video.getAttribute('src')||'')===src&&video.getAttribute('poster')===poster&&!replayRestricted(video,poster)&&!replayRestricted(video,src))video.setAttribute('poster',data);
  }).catch(()=>{});
  return true;
 }
 if(!mayInline(src))return false;
 inlined.set(video,src);
 const capture=()=>{try{
  if(!replayUnmasked()||video.getAttribute('src')!==src||replayRestricted(video,src)||!video.videoWidth)return;
  video.setAttribute('poster',downscale(video,video.videoWidth,video.videoHeight));
 }catch{}};
 if(video.readyState>=2)capture();else video.addEventListener('loadeddata',capture,{once:true});
 return true;
}
function inlineReplayMedia(element:Element){
 if(element instanceof HTMLImageElement)void inlineReplayImage(element);
 else if(typeof HTMLVideoElement!=='undefined'&&element instanceof HTMLVideoElement)inlineReplayVideo(element);
}
/** `owner` lets the guest trial model and the member mode switch embedding independently; it stops when neither wants it. */
export function setReplayInlineImages(on:boolean,owner='guest'){
 if(typeof document==='undefined'||typeof MutationObserver==='undefined')return;
 if(on)inlineOwners.add(owner);else inlineOwners.delete(owner);
 if(!inlineOwners.size){inlineObserver?.disconnect();inlineObserver=null;return;}
 if(inlineObserver)return;
 const scan=(root:ParentNode)=>root.querySelectorAll('img,video').forEach(inlineReplayMedia);
 scan(document);
 inlineObserver=new MutationObserver(records=>{for(const record of records){
  if(record.type==='attributes'&&record.target instanceof Element)inlineReplayMedia(record.target);
  record.addedNodes.forEach(node=>{if(node instanceof Element){inlineReplayMedia(node);scan(node);}});
 }});
 inlineObserver.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
}
/** Called by PostHogAnalytics only: on while a signed-in member is on a replay route (REPLAY_MEMBER_ATTR). */
export function setMemberReplay(on:boolean){
 if(typeof document==='undefined')return;
 if(on)document.documentElement.setAttribute(REPLAY_MEMBER_ATTR,'');else document.documentElement.removeAttribute(REPLAY_MEMBER_ATTR);
 setReplayInlineImages(on,'member');
}

// Replay is opt-in per route (allowlist): payment, wallet/beans, payouts, account settings, login/signup, messages and every
// studio page except post writing stay unrecorded, including routes added later. Events are still captured on every /service page.
const REPLAY_ROUTES=[/^\/service\/landing(-ai-image-generation)?\/?$/,/^\/service\/try(\/done)?\/?$/,/^\/service\/(feed|explore)\/?$/,/^\/service\/(post|creator)\/[^/]+\/?$/,/^\/service\/(events|notices)(\/[^/]+)?\/?$/,/^\/service\/studio\/content(\/new|\/[^/]+\/edit)?\/?$/];
export function replayAllowed(pathname:string){
 return REPLAY_ROUTES.some(route=>route.test(pathname))||(MEMBER_LIBRARY_REPLAY&&PROFILE_LIBRARY_PATH.test(pathname)&&profileLibraryRecording());
}
/** Only the portalled library dialog is captured on the member profile page. */
export function setProfileLibraryReplay(on:boolean){
 if(!MEMBER_LIBRARY_REPLAY||typeof window==='undefined'||typeof document==='undefined'||!POSTHOG_KEY)return;
 const pathname=window.location.pathname;
 if(on&&!PROFILE_LIBRARY_PATH.test(pathname))return;
 if(on){
  document.documentElement.setAttribute(REPLAY_LIBRARY_ATTR,'');
  setReplayInlineImages(true,'profile-library');
  syncReplay(pathname);
  captureEvent('library_replay_opened',{actor:'member'});
 }else{
  if(PROFILE_LIBRARY_PATH.test(pathname)&&client?.sessionRecordingStarted())client.stopSessionRecording();
  document.documentElement.removeAttribute(REPLAY_LIBRARY_ATTR);
  setReplayInlineImages(false,'profile-library');
 }
}

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

export type AnalyticsEvent='shared_result_view'|'shared_result_create'|'library_replay_opened'|'landing_view'|'guest_consent_view'|'guest_consent_agreed'|'ai_editor_opened'|'ai_generation_started'|'ai_generation_succeeded'|'ai_generation_failed'|'photo_decided'|'ai_result_share_clicked'|'ai_result_shared'|'costume_shop_clicked'|'ai_result_closed'|'ai_result_original'|'ai_result_continue'|'landing_cta_clicked'|'caption_written'|'caption_failed'|'post_published'|'post_publish_failed'|'signup_view'|'signup_completed'|'ai_generation_blocked'|'guest_editor_back';
/** 2026-11-20 이탈 분석: which fixed landing CTA was clicked (PostHog masks click text, so the button cannot be told apart otherwise). */
export type LandingCtaPlace='header'|'hero'|'look_detail'|'preset'|'preset_dialog'|'final';
export function aiProps(actor:'guest'|'member',input:{mode?:string;kind:string;presetKeys?:{kind:string}[]}):AnalyticsProps{return{actor,mode:input.mode||'general',kind:input.kind,preset_kinds:Array.from(new Set((input.presetKeys||[]).map(preset=>preset.kind))).sort()};}
/** Non-personal properties only: actor type, mode and catalog/category keys, error codes. Never names, e-mail, ids or text. */
export type AnalyticsProps={actor?:'guest'|'member';mode?:string;kind?:string;preset_kinds?:string[];error_code?:string;place?:LandingCtaPlace;/** Fixed pre-check code (AiPhotoBlockReason), never user text. */reason?:string};
export function captureEvent(name:AnalyticsEvent,props:AnalyticsProps={}){
 // Shared components also render in /preview and the design system: only the /service app reports.
 if(!POSTHOG_KEY||typeof window==='undefined'||!window.location.pathname.startsWith('/service'))return;
 try{if(client)client.capture(name,props);else if(pending.length<20)pending.push([name,props]);}catch{}
}
