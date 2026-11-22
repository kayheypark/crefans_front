'use client';
import {useCallback,useEffect,useState} from 'react';
import {platformRequest as api} from '@/lib/api/platform';
import {imageUploadMaxBytes,imageUploadMaxLabel} from '@/lib/design/image-upload';
import {optimizeImage} from '@/lib/design/image-optimize';
import {aiPhotoEditBody} from './useStudioModel';
import {aiProps,captureEvent,replaySessionId,replayVisitorId,setReplayInlineImages,setReplayUnmasked} from '@/lib/analytics/posthog';
import {rememberEntrySource} from '@/lib/api/funnel';
import {reportShare} from '@/lib/api/share-report';
import type {AiPhotoFunnelStep} from '@/types/crefans-studio-management';
import type {AiHeartInput,AiHeartResult,AiPhotoEditInput,AiPhotoEditResult,AiReviewInput,AiReviewResult,AiReviewStatus,StudioMedia} from '@/types/crefans-studio-management';

// Signed-out AI photo trial (2026-11-15). The server identifies the visitor by an httpOnly cookie set after consent
// (POST /guest/session); this model never sees the token. Limits and the 24-hour public window are enforced by the server.
export const GUEST_CONSENT_VERSION='2026-11-16.guest.5';
// A non-secret local flag: this browser started a trial, so ask the server to link its posts after sign-in. The guest token itself
// stays in the httpOnly cookie. Storage can be blocked; then the link simply happens on a later visit with storage.
const TRIAL_FLAG='crefans-guest-trial';
export function hasGuestTrial(){try{return typeof window!=='undefined'&&window.localStorage.getItem(TRIAL_FLAG)==='1';}catch{return false;}}
export function clearGuestTrial(){try{window.localStorage.removeItem(TRIAL_FLAG);}catch{}}
// 2026-11-20 user request: link the trial to its PostHog replay in the console (AI 사진 체험 관리). Each session ID is sent once per tab;
// PostHog may start a new session after 30 idle minutes, so the editor reports again before each AI generation and post.
const reportedReplays=new Set<string>();
async function reportReplaySession(){const id=await replaySessionId();if(!id||reportedReplays.has(id))return;reportedReplays.add(id);const distinctId=await replayVisitorId();const r=await api<{recorded:boolean}>('/guest/replay-session',{sessionId:id,...(distinctId?{distinctId}:{})});if(!r.success)reportedReplays.delete(id);}
function markGuestTrial(){try{window.localStorage.setItem(TRIAL_FLAG,'1');}catch{}}
export type GuestCaption={title:string;body:string;source:'ai'|'template'};
export type GuestSession={active:boolean;authorId?:string;consentVersion:string;limit:number;postHours:number;remaining:number;postRewardClaimed?:boolean;shareRewardClaimed?:boolean;shopRewardClaimed?:boolean;shopReward?:number;heartReward?:number;heartRewardMax?:number;postReward?:number;replayConsentVersion?:string;replayConsented?:boolean};
export function useGuestTrialModel(enabled:boolean){
 const [session,setSession]=useState<GuestSession|null>(null),[error,setError]=useState('');
 const refresh=useCallback(async()=>{const r=await api<GuestSession>('/guest/session');if(r.success)setSession(r.data);else setError(r.errorMessage||'체험 정보를 불러오지 못했어요.');},[]);
 useEffect(()=>{if(enabled)void refresh();},[enabled,refresh]);
 // An existing trial session (cookie) also keeps the flag, e.g. after storage was cleared.
 useEffect(()=>{if(session?.active)markGuestTrial();},[session?.active]);
 // 2026-11-19 user decision (처리방침 17항): unmask session replay on the trial screens only for a visitor whose replay consent is recorded.
 useEffect(()=>{if(!enabled||!session?.active||!session.replayConsented)return;setReplayUnmasked(true);setReplayInlineImages(true);return()=>{setReplayInlineImages(false);setReplayUnmasked(false);};},[enabled,session?.active,session?.replayConsented]);
 useEffect(()=>{if(enabled&&session?.active&&session.replayConsented)void reportReplaySession();},[enabled,session?.active,session?.replayConsented]);
 const start=async(replayAgreed=false)=>{const replayVersion=replayAgreed?session?.replayConsentVersion:undefined;const r=await api<{active:boolean}>('/guest/session',{consent:true,version:GUEST_CONSENT_VERSION,source:rememberEntrySource(),...(replayVersion?{replayConsent:{agreed:true,version:replayVersion}}:{})});if(r.success){markGuestTrial();captureEvent('guest_consent_agreed',{actor:'guest'});await refresh();}return r;};
 const upload=async(original:File)=>{
  if(!original.type.startsWith('image/'))return {success:false as const,data:null,errorMessage:'체험에서는 사진만 올릴 수 있어요.',errorCode:'GUEST_IMAGE_ONLY'};
  if(original.size>imageUploadMaxBytes)return {success:false as const,data:null,errorMessage:`사진은 한 장에 ${imageUploadMaxLabel}까지 올릴 수 있어요.`,errorCode:'INVALID_IMAGE_SIZE'};
  const body=new FormData();body.append('file',await optimizeImage(original));return api<StudioMedia>('/media/guest',body);
 };
 // 2026-11-19 이탈 분석: publish/caption failures were not measured (only successes were sent). A failure now sends its error code
 // only — never the title, body, server message or ids.
 const failed=(r:{success:boolean;errorCode?:string|null})=>({actor:'guest' as const,error_code:r.errorCode||'UNKNOWN'});
 const save=async(input:unknown)=>{if(session?.replayConsented)void reportReplaySession();const r=await api<{id?:string;message?:string}>('/guest/content',input);if(r.success)captureEvent('post_published',{actor:'guest'});else captureEvent('post_publish_failed',failed(r));return r;};
 // 'AI로 내용 작성' writes the title/body from the chosen item names and request text (2026-11-16); the visitor edits before posting.
 const caption=async(input:{items:string[];prompt:string})=>{const r=await api<GuestCaption>('/guest/content/caption',input);if(r.success)captureEvent('caption_written',{actor:'guest'});else captureEvent('caption_failed',failed(r));return r;};
 // 2026-11-21 이탈 분석: any failed generation re-reads the server balance. A NETWORK_ERROR may still have been charged on the server,
 // and only refreshing on GUEST_AI_LIMIT left a stale balance that made the next try hit the limit at once.
 const aiEdit=async(input:AiPhotoEditInput)=>{if(session?.replayConsented)void reportReplaySession();const props=aiProps('guest',input);captureEvent('ai_generation_started',props);const result=await api<AiPhotoEditResult>('/guest/ai-photo/edit',aiPhotoEditBody(input));captureEvent(result.success?'ai_generation_succeeded':'ai_generation_failed',result.success?props:{...props,error_code:result.errorCode||'UNKNOWN'});if(result.success)setSession(previous=>previous&&{...previous,remaining:result.data.remaining});else await refresh();return result;};
 const track=(step:AiPhotoFunnelStep,props:{mode:string;kind?:string})=>captureEvent(step,{actor:'guest',mode:props.mode,...(props.kind?{kind:props.kind}:{})});
 // 2026-11-20 user decision: the share reward is paid when the result is shared (share sheet finished or link copied).
 const shopClick=async()=>{const r=await api<{granted:boolean}>('/guest/ai-photo/shop-click',{});if(r.success)await refresh();return r.success&&r.data.granted;};
 const shareDone=async(mediaId:string)=>{const r=await api<{granted:boolean}>('/guest/ai-photo/share-done',{mediaId});if(r.success)await refresh();return r.success&&r.data.granted;};
 // 2026-11-21: the server-verified waiting game for visitors (30 hearts → 0.5 credit, 3 a day per browser and network).
 const heartGame=(input:AiHeartInput)=>api<AiHeartResult>('/guest/ai-photo/hearts',input);
 // 2026-11-21: review instead of the game once a day after a first success (0.5 credit, same daily limit as the game).
 const review={status:()=>api<AiReviewStatus>('/guest/ai-photo/review'),submit:async(input:AiReviewInput)=>{const r=await api<AiReviewResult>('/guest/ai-photo/review',input);if(r.success)await refresh();return r;}};
 return{session,error,start,upload,save,aiEdit,refresh,caption,share:reportShare,track,shareDone,shopClick,heartGame,review};
}
