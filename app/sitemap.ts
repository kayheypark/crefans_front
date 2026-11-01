import type {MetadataRoute} from 'next';
import {serviceEvents} from '@/lib/content/events';
import {SITE_URL,publicApi} from '@/lib/seo/site';

// Built per request (the API is not reachable while the image builds); creator rows are cached by publicApi for 5 minutes.
export const dynamic='force-dynamic';
type Directory={creators:{id:string;isCreator?:boolean;searchable?:boolean}[];nextCursor:string|null};

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const url=(path:string)=>`${SITE_URL}${path}`,now=new Date();
 const fixed:MetadataRoute.Sitemap=[
  {url:url('/service/feed'),changeFrequency:'daily',priority:1,lastModified:now},
  {url:url('/service/explore'),changeFrequency:'daily',priority:0.9,lastModified:now},
  ...['fan','creator'].map(id=>({url:url(`/service/guide/${id}`),changeFrequency:'monthly' as const,priority:0.6})),
  {url:url('/service/events'),changeFrequency:'weekly',priority:0.6},
  ...serviceEvents.map(event=>({url:url(`/service/events/${event.id}`),changeFrequency:'weekly' as const,priority:0.5})),
  {url:url('/service/notices'),changeFrequency:'weekly',priority:0.5},
  {url:url('/service/support'),changeFrequency:'monthly',priority:0.4},
  ...['terms','privacy','policy'].map(id=>({url:url(`/service/legal/${id}`),changeFrequency:'monthly' as const,priority:0.3})),
 ];
 const creators:MetadataRoute.Sitemap=[],seen=new Set<string>();let cursor:string|null='';
 // Only creators who allow search; capped so a slow API cannot hold the response.
 for(let page=0;page<50&&cursor!==null;page++){
  const {data}:{data:Directory|null}=await publicApi<Directory>(`/creators${cursor?`?cursor=${encodeURIComponent(cursor)}`:''}`);if(!data)break;
  for(const c of data.creators)if(c.isCreator!==false&&c.searchable!==false&&!seen.has(c.id)){seen.add(c.id);creators.push({url:url(`/service/creator/${encodeURIComponent(c.id)}`),changeFrequency:'weekly',priority:0.8});}
  cursor=data.nextCursor||null;
 }
 return[...fixed,...creators];
}
