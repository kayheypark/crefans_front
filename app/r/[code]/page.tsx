import type {Metadata} from 'next';
import {cookies,headers} from 'next/headers';
import {notFound} from 'next/navigation';
import {cache} from 'react';
import {sharedCatalog,shareTitle,shareDescription} from '@/lib/crefans/shared-result';
import SharedResult from './shared-result';

export const dynamic='force-dynamic';
type Props={params:Promise<{code:string}>};
const read=cache(async(code:string)=>{
 if(!/^[a-f0-9]{32}$/.test(code))notFound();
 const response=await fetch(new URL('/api/v1/media/result-shares/'+code,process.env.PLATFORM_API_ORIGIN||'http://127.0.0.1:3001'),{cache:'no-store'});
 if(response.status===404)notFound();
 if(!response.ok)throw Error('공유 결과를 불러오지 못했어요.');
 return (await response.json()).data as {presets:string[];campaign:string|null};
});
const image=(code:string)=>'/api/v1/media/result-shares/'+code+'/image';
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {code}=await params;await read(code);
 const host=(await headers()).get('host')?.split(':')[0];
 const origin=host==='www-dev.crefans.com'?'https://www-dev.crefans.com':'https://crefans.com';
 const url=origin+'/r/'+code,src=origin+'/api/v1/media/result-shares/'+code+'/preview.jpg';
 return{title:shareTitle,description:shareDescription,robots:{index:false,follow:false},referrer:'no-referrer',alternates:{canonical:url},
 openGraph:{type:'website',locale:'ko_KR',siteName:'크레팬스',title:'내 사진으로 AI 필터 써봤어. 어때? | 크레팬스',description:shareDescription,url,images:[{url:src,width:1200,height:630,type:'image/jpeg',alt:'공유된 AI 결과 사진'}]},
 twitter:{card:'summary_large_image',title:shareTitle,description:shareDescription,images:[src]}};
}
export default async function Page({params}:Props){
 const {code}=await params,result=await read(code),catalog=sharedCatalog();
 const presets=result.presets.flatMap(src=>{const item=catalog.find(entry=>entry.image===src);return item?[item]:[];});
 const jar=await cookies();
 return <SharedResult hasSessionCookie={jar.has('access_token')||jar.has('refresh_token')} image={image(code)} presets={presets} campaign={result.campaign||'ai_photo'}/>;
}
