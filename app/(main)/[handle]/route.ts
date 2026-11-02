import {NextResponse} from 'next/server';
import {publicApi} from '@/lib/seo/site';

// Watermarks print https://crefans.com/{handle} (2026-11-01). The address opens the service profile; a handle the member has
// since changed is resolved by the server to the current one, so old watermarks keep leading to the creator (2026-11-02).
// A route handler, not a page: the root layout streams, so a page redirect would answer 200 with a meta refresh instead of 308.
const missing=()=>new NextResponse('<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>크레팬스</title><p>프로필을 찾을 수 없습니다. <a href="/service/feed">크레팬스로 이동</a></p>',{status:404,headers:{'content-type':'text/html; charset=utf-8'}});
export async function GET(_request:Request,{params}:{params:Promise<{handle:string}>}){
 let handle:string;try{handle=decodeURIComponent((await params).handle).toLowerCase();}catch{return missing();}
 if(!/^[a-z0-9_]{3,24}$/.test(handle))return missing();
 const {data}=await publicApi<{handle?:string;isCreator?:boolean}>(`/profiles/${handle}`);
 if(!data?.handle)return missing();
 // Relative location: behind the proxy request.url carries the internal host (Next answered localhost in dev).
 return new NextResponse(null,{status:308,headers:{location:`/service/${data.isCreator?'creator':'member'}/${encodeURIComponent(data.handle)}`}});
}
export const HEAD=GET;
