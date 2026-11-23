import type {StudioMedia} from '@/types/crefans-studio-management';
// 2026-11-20 user request: visitors who leave the trial editor (back to the feed to check their post, then forward again) lost the
// attached photos, AI results, title and body. The draft is kept in this browser for 24 hours and restored on return. It holds only
// media ids/URLs (the files stay behind the trial cookie on the server), the 'AI 생성' marks, the title and the body.
// It also holds the trial's author id: a draft is restored only for the same trial (after the cookie changes — signup moved the trial, cookies
// cleared, another person on the browser — its photos would no longer open and publishing would be refused, so it is dropped).
const KEY='crefans:guest-trial-draft',TTL=24*3600000,MAX_MEDIA=10;
export type GuestTrialDraft={media:StudioMedia[];title:string;body:string};
const cleanMedia=(item:any):StudioMedia|null=>{
 if(!item||typeof item.id!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(item.id)||(item.type!=='image'&&item.type!=='video')||typeof item.url!=='string'||!item.url.startsWith('/')||item.url.length>500)return null;
 return {id:item.id,type:item.type,url:item.url,...(item.aiGenerated?{aiGenerated:true}:{}),...(item.franchiseCostume?{franchiseCostume:true}:{})};
};
/** dropOther=false (member editor): a draft of someone else is left in place instead of removed. */
export function loadGuestTrialDraft(owner:string|undefined,now=Date.now(),dropOther=true):GuestTrialDraft|null{
 try{const raw=localStorage.getItem(KEY);if(!raw)return null;const data=JSON.parse(raw);
  if(!dropOther&&data?.owner!==owner)return null;
  if(!data||typeof data.at!=='number'||now-data.at>TTL||!Array.isArray(data.media)||!owner||data.owner!==owner){localStorage.removeItem(KEY);return null;}
  const media=data.media.map(cleanMedia).filter(Boolean).slice(0,MAX_MEDIA) as StudioMedia[];
  const title=typeof data.title==='string'?data.title.slice(0,120):'',body=typeof data.body==='string'?data.body.slice(0,5000):'';
  return media.length||title||body?{media,title,body}:null;}
 catch{return null;}
}
/** Photos still uploading or failed are not kept; an empty draft removes the stored one. */
export function saveGuestTrialDraft(owner:string|undefined,draft:GuestTrialDraft,now=Date.now()){
 try{if(!owner)return;const media=draft.media.filter(item=>!item.processing&&!item.failed).map(cleanMedia).filter(Boolean).slice(0,MAX_MEDIA);
  if(!media.length&&!draft.title.trim()&&!draft.body.trim()){localStorage.removeItem(KEY);return;}
  localStorage.setItem(KEY,JSON.stringify({at:now,owner,media,title:draft.title,body:draft.body}));}
 catch{/* storage may be blocked */}
}
export function clearGuestTrialDraft(){try{localStorage.removeItem(KEY);}catch{/* storage may be blocked */}}
// 2026-11-23 user request (C 테스트): a visitor who signs up in the middle of the trial keeps what they were writing. After sign-up the
// browser asks to link the trial (POST /guest/claim moves its photos to the account); then the draft is handed to the member's editor.
const trialOwner=(data:any)=>typeof data?.owner==='string'&&data.owner.startsWith('guest:');
/** The trial draft still waiting in this browser (photos kept, whether text was written), or null. */
export function guestTrialDraftSummary(now=Date.now()):{photos:number;text:boolean}|null{
 try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(!trialOwner(data)||typeof data.at!=='number'||now-data.at>TTL||!Array.isArray(data.media))return null;
  const photos=data.media.map(cleanMedia).filter(Boolean).length,text=!!(String(data.title||'').trim()||String(data.body||'').trim());return photos||text?{photos,text}:null;}
 catch{return null;}
}
/** The owner key of a draft handed to a member's editor. */
export const memberDraftOwner=(member:string|undefined)=>member?`member:${member}`:undefined;
/** After the trial was linked to the account: the same draft now opens in this member's post editor (24 hours from now). */
export function adoptGuestTrialDraft(member:string|undefined,now=Date.now()){
 try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(!member||!trialOwner(data))return false;localStorage.setItem(KEY,JSON.stringify({...data,at:now,owner:memberDraftOwner(member)}));return true;}
 catch{return false;}
}
