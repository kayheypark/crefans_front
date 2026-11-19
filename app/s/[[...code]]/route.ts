import {NextResponse} from 'next/server';

// 2026-11-19 user request: short AI result share link. /s opens the AI photo landing with the share campaign tags.
// 2026-11-20: the share reward is paid at the share itself, so links carry no code; old /s/<code> links still land here.
// Relative location: behind the proxy request.url carries the internal host. 302 so a changed landing is never cached.
const LANDING='/service/landing-ai-image-generation';
const UTM=new URLSearchParams({utm_source:'crefans_share',utm_medium:'share',utm_campaign:'ai_photo',utm_content:'result'}).toString();
export async function GET(){
 return new NextResponse(null,{status:302,headers:{location:`${LANDING}?${UTM}`,'X-Robots-Tag':'noindex','Cache-Control':'no-store'}});
}
export const HEAD=GET;
