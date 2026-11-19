import {platformRequest} from './platform';

const fragment='result-share';
// 2026-11-19 user request: short links (/s/<8-character code>, see app/s/[[...code]]/route.ts). Long encrypted tokens from
// links shared before then stay accepted until they expire (7 days).
const tokenPattern=/^(?:[A-Za-z0-9]{8}|[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{1,200})$/;

export function aiResultShareUrl(token?:string){
 return new URL(token&&/^[A-Za-z0-9]{8}$/.test(token)?`/s/${token}`:'/s',window.location.origin).href;
}

export async function reportAiResultShareVisit(){
 const token=new URLSearchParams(window.location.hash.slice(1)).get(fragment);
 if(token&&tokenPattern.test(token))await platformRequest('/guest/ai-photo/share-visit',{token});
}
