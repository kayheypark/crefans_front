import {redirect} from 'next/navigation';
// 2026-11-22 user decision: the basic service landing (crefans introduction page) is removed. Old links (business card, past
// posts) go to the AI photo landing, keeping utm_* and other query values so campaign tracking still works.
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=new URLSearchParams();for(const [k,v] of Object.entries(await searchParams))for(const one of Array.isArray(v)?v:v===undefined?[]:[v])query.append(k,one);
 const q=query.toString();redirect('/service/landing-ai-image-generation'+(q?'?'+q:''));
}
