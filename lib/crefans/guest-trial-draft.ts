import type {StudioMedia} from '@/types/crefans-studio-management';
// 2026-11-20 user request: visitors who leave the trial editor (back to the feed to check their post, then forward again) lost the
// attached photos, AI results, title and body. The draft is kept in this browser for 24 hours and restored on return. It holds only
// media ids/URLs (the files stay behind the trial cookie on the server), the 'AI 생성' marks, the title and the body.
const KEY='crefans:guest-trial-draft',TTL=24*3600000,MAX_MEDIA=10;
export type GuestTrialDraft={media:StudioMedia[];title:string;body:string};
const cleanMedia=(item:any):StudioMedia|null=>{
 if(!item||typeof item.id!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(item.id)||(item.type!=='image'&&item.type!=='video')||typeof item.url!=='string'||!item.url.startsWith('/')||item.url.length>500)return null;
 return {id:item.id,type:item.type,url:item.url,...(item.aiGenerated?{aiGenerated:true}:{}),...(item.franchiseCostume?{franchiseCostume:true}:{})};
};
export function loadGuestTrialDraft(now=Date.now()):GuestTrialDraft|null{
 try{const raw=localStorage.getItem(KEY);if(!raw)return null;const data=JSON.parse(raw);
  if(!data||typeof data.at!=='number'||now-data.at>TTL||!Array.isArray(data.media)){localStorage.removeItem(KEY);return null;}
  const media=data.media.map(cleanMedia).filter(Boolean).slice(0,MAX_MEDIA) as StudioMedia[];
  const title=typeof data.title==='string'?data.title.slice(0,120):'',body=typeof data.body==='string'?data.body.slice(0,5000):'';
  return media.length||title||body?{media,title,body}:null;}
 catch{return null;}
}
/** Photos still uploading or failed are not kept; an empty draft removes the stored one. */
export function saveGuestTrialDraft(draft:GuestTrialDraft,now=Date.now()){
 try{const media=draft.media.filter(item=>!item.processing&&!item.failed).map(cleanMedia).filter(Boolean).slice(0,MAX_MEDIA);
  if(!media.length&&!draft.title.trim()&&!draft.body.trim()){localStorage.removeItem(KEY);return;}
  localStorage.setItem(KEY,JSON.stringify({at:now,media,title:draft.title,body:draft.body}));}
 catch{/* storage may be blocked */}
}
export function clearGuestTrialDraft(){try{localStorage.removeItem(KEY);}catch{/* storage may be blocked */}}
