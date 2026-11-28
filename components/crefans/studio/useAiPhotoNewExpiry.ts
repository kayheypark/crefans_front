import {useEffect,useState} from 'react';
import {aiPhotoPresetReleases} from '@/lib/crefans/ai-photo-releases';
import {AI_PHOTO_NEW_MS} from '@/lib/crefans/ai-photo-new';

// Expire visible badges even if the editor stays open across the seven-day boundary.
export function useAiPhotoNewExpiry(){
 const [revision,refresh]=useState(0);
 useEffect(()=>{
  if(typeof window==='undefined')return;
  const now=Date.now();
  const next=aiPhotoPresetReleases.flatMap(item=>{
   const added=Date.parse(item.addedAt||'');
   return [added,added+AI_PHOTO_NEW_MS].filter(time=>time>now);
  }).sort((a,b)=>a-b)[0];
  const update=()=>refresh(value=>value+1);
  const timer=next?setTimeout(update,Math.min(next-now+1,2147483647)):undefined;
  window.addEventListener('focus',update);
  return()=>{clearTimeout(timer);window.removeEventListener('focus',update);};
 },[revision]);
}
