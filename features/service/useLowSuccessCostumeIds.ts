import {useEffect,useState} from 'react';
import {AI_PHOTO_LOW_SUCCESS_COSTUME_IDS} from '@/lib/crefans/ai-photo-costumes';
import {requestLowSuccessCostumeIds} from '@/lib/api/ai-costume-low-success';

/** 2026-11-23: the server's daily "성공률 낮음" list when it answers; the built-in list until then or when it fails. */
export function useLowSuccessCostumeIds():readonly string[]{
 const [ids,setIds]=useState<readonly string[]>(AI_PHOTO_LOW_SUCCESS_COSTUME_IDS);
 useEffect(()=>{let live=true;void requestLowSuccessCostumeIds().then(next=>{if(live&&next)setIds(next);});return()=>{live=false;};},[]);
 return ids;
}
