import {platformRequest} from './platform';

const landing='/service/landing-ai-image-generation';
const fragment='result-share';
const tokenPattern=/^[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{1,200}$/;

export function aiResultShareUrl(token?:string){
 const url=new URL(landing,window.location.origin);
 url.search=new URLSearchParams({utm_source:'crefans_share',utm_medium:'share',utm_campaign:'ai_photo',utm_content:'result'}).toString();
 // The opaque reward token stays out of HTTP URLs and referral analytics.
 if(token)url.hash=new URLSearchParams({[fragment]:token}).toString();
 return url.href;
}

export async function reportAiResultShareVisit(){
 const token=new URLSearchParams(window.location.hash.slice(1)).get(fragment);
 if(token&&tokenPattern.test(token))await platformRequest('/guest/ai-photo/share-visit',{token});
}
