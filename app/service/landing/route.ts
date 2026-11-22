import {NextResponse} from 'next/server';
// 2026-11-22 user decision: the basic service landing (crefans introduction page) is removed. Old links (business card, past
// posts) go straight to the AI photo landing with an HTTP redirect, keeping utm_* and other query values.
// Relative location like app/s: behind the proxy request.url carries the internal host. 302 so it is never cached.
export async function GET(request:Request){
 const query=new URL(request.url).search;
 return new NextResponse(null,{status:302,headers:{location:'/service/landing-ai-image-generation'+query,'Cache-Control':'no-store'}});
}
export const HEAD=GET;
