'use client';
import {useCallback,useEffect,useState} from 'react';
import {platformRequest as api} from '@/lib/api/platform';
import {imageUploadMaxBytes,imageUploadMaxLabel} from '@/lib/design/image-upload';
import {optimizeImage} from '@/lib/design/image-optimize';
import {aiPhotoEditBody} from './useStudioModel';
import type {AiPhotoEditInput,AiPhotoEditResult,StudioMedia} from '@/types/crefans-studio-management';

// Signed-out AI photo trial (2026-11-15). The server identifies the visitor by an httpOnly cookie set after consent
// (POST /guest/session); this model never sees the token. Limits and the 24-hour public window are enforced by the server.
export const GUEST_CONSENT_VERSION='2026-11-16.guest.3';
// A non-secret local flag: this browser started a trial, so ask the server to link its posts after sign-in. The guest token itself
// stays in the httpOnly cookie. Storage can be blocked; then the link simply happens on a later visit with storage.
const TRIAL_FLAG='crefans-guest-trial';
export function hasGuestTrial(){try{return typeof window!=='undefined'&&window.localStorage.getItem(TRIAL_FLAG)==='1';}catch{return false;}}
export function clearGuestTrial(){try{window.localStorage.removeItem(TRIAL_FLAG);}catch{}}
function markGuestTrial(){try{window.localStorage.setItem(TRIAL_FLAG,'1');}catch{}}
export type GuestCaption={title:string;body:string;source:'ai'|'template'};
export type GuestSession={active:boolean;consentVersion:string;limit:number;postHours:number;remaining:number};
export function useGuestTrialModel(enabled:boolean){
 const [session,setSession]=useState<GuestSession|null>(null),[error,setError]=useState('');
 const refresh=useCallback(async()=>{const r=await api<GuestSession>('/guest/session');if(r.success)setSession(r.data);else setError(r.errorMessage||'체험 정보를 불러오지 못했어요.');},[]);
 useEffect(()=>{if(enabled)void refresh();},[enabled,refresh]);
 // An existing trial session (cookie) also keeps the flag, e.g. after storage was cleared.
 useEffect(()=>{if(session?.active)markGuestTrial();},[session?.active]);
 const start=async()=>{const r=await api<{active:boolean}>('/guest/session',{consent:true,version:GUEST_CONSENT_VERSION});if(r.success){markGuestTrial();await refresh();}return r;};
 const upload=async(original:File)=>{
  if(!original.type.startsWith('image/'))return {success:false as const,data:null,errorMessage:'체험에서는 사진만 올릴 수 있어요.',errorCode:'GUEST_IMAGE_ONLY'};
  if(original.size>imageUploadMaxBytes)return {success:false as const,data:null,errorMessage:`사진은 한 장에 ${imageUploadMaxLabel}까지 올릴 수 있어요.`,errorCode:'INVALID_IMAGE_SIZE'};
  const body=new FormData();body.append('file',await optimizeImage(original));return api<StudioMedia>('/media/guest',body);
 };
 const save=(input:unknown)=>api<{id?:string;message?:string}>('/guest/content',input);
 // Empty title/body are written at publish time from the chosen item names and request text (2026-11-16); the visitor confirms first.
 const caption=(input:{items:string[];prompt:string})=>api<GuestCaption>('/guest/content/caption',input);
 const aiEdit=async(input:AiPhotoEditInput)=>{const result=await api<AiPhotoEditResult>('/guest/ai-photo/edit',aiPhotoEditBody(input));if(result.success)setSession(previous=>previous&&{...previous,remaining:result.data.remaining});return result;};
 return{session,error,start,upload,save,aiEdit,refresh,caption};
}
