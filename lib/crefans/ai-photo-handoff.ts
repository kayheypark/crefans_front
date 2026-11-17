import type {AiPhotoPresetSelection} from './ai-photo';
// 2026-11-17 user request: presets picked on the AI photo landing carry over to the trial editor. Stored only in this browser
// (localStorage, 1 hour), read once when the AI photo editor opens, then removed. Contains preset texts only — no person data.
const KEY='crefans:ai-photo-handoff',TTL=3600000;
export function saveAiPhotoHandoff(presets:AiPhotoPresetSelection[]){try{if(presets.length)localStorage.setItem(KEY,JSON.stringify({at:Date.now(),presets}));else localStorage.removeItem(KEY);}catch{/* storage may be blocked */}}
export function takeAiPhotoHandoff():AiPhotoPresetSelection[]{
 try{const raw=localStorage.getItem(KEY);localStorage.removeItem(KEY);if(!raw)return [];const data=JSON.parse(raw);
  if(!data||typeof data.at!=='number'||Date.now()-data.at>TTL||!Array.isArray(data.presets))return [];
  return data.presets.filter((item:any)=>typeof item?.kind==='string'&&typeof item?.prompt==='string'&&item.prompt.length<=2000).slice(0,20);}
 catch{return [];}
}
