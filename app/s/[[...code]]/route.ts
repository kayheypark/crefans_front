import {NextResponse} from 'next/server';

// 2026-11-19 user request: short AI result share links. /s/<8-character code> opens the AI photo landing with the share
// campaign tags and the code in the fragment (kept out of HTTP logs and referrers); /s alone opens it without a code.
// Relative location: behind the proxy request.url carries the internal host. 302 so a changed landing is never cached.
const LANDING='/service/landing-ai-image-generation';
const UTM=new URLSearchParams({utm_source:'crefans_share',utm_medium:'share',utm_campaign:'ai_photo',utm_content:'result'}).toString();
export async function GET(_request:Request,{params}:{params:Promise<{code?:string[]}>}){
 const parts=(await params).code||[],code=parts.length===1&&/^[A-Za-z0-9]{8}$/.test(parts[0])?parts[0]:'';
 return new NextResponse(null,{status:302,headers:{location:`${LANDING}?${UTM}${code?`#result-share=${code}`:''}`,'X-Robots-Tag':'noindex','Cache-Control':'no-store'}});
}
export const HEAD=GET;
