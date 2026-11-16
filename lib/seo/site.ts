import type {Metadata} from 'next';

// Search and share metadata (2026-11-01 user decisions): only public pages are indexed; creator profiles get their own
// preview; public posts may use their text and image, while locked/adult/hidden posts show only the creator.
export const SITE_URL=(process.env.NEXT_PUBLIC_SITE_URL||'https://crefans.com').replace(/\/$/,'');
export const SITE_NAME='크레팬스(Crefans)';
export const SITE_TITLE=SITE_NAME;
// 2026-11-16 user decision: the service is introduced first as AI photo editing; posting and creator features are secondary.
export const SITE_DESCRIPTION='사진 한 장으로 의상·메이크업·포즈·배경을 바꾸는 AI 사진 편집 서비스, 크레팬스';
export const SITE_KEYWORDS=['크레팬스','crefans','AI 사진 편집','AI 사진','사진 의상 변경','AI 코스튬','AI 코스프레','AI 이미지 생성','사진 배경 변경','코스프레','크리에이터'];
export const DEFAULT_OG_IMAGE={url:'/og/crefans-og-simple-v1.png',width:1730,height:909,alt:'크레팬스 — 사진 한 장으로 만드는 AI 사진 편집'};

export type ShareInput={title:string;description:string;path:string;image?:string|null;index:boolean;type?:'website'|'article'|'profile'};
export const clip=(text:string,max=160)=>{const t=text.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();return t.length>max?t.slice(0,max-1).trimEnd()+'…':t;};

/** One place builds title, description, canonical, Open Graph, Twitter card and robots so pages cannot drift apart. */
export function shareMetadata({title,description,path,image,index,type='website'}:ShareInput):Metadata{
 const images=image?[{url:image,alt:title}]:[DEFAULT_OG_IMAGE];
 return{title,description,alternates:{canonical:path},
  openGraph:{type,siteName:SITE_NAME,locale:'ko_KR',url:path,title,description,images},
  twitter:{card:'summary_large_image',title,description,images:images.map(i=>i.url)},
  robots:index?{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1}}:{index:false,follow:false}};
}

/** Anonymous server-side read of the public API (no cookies), so previews never contain member-only content. */
export async function publicApi<T>(path:string):Promise<{status:number;data:T|null}>{
 const origin=process.env.PLATFORM_API_ORIGIN||'http://127.0.0.1:3001';
 try{
  const response=await fetch(new URL(`/api/v1${path}`,origin),{headers:{accept:'application/json'},next:{revalidate:300},signal:AbortSignal.timeout(3000)});
  const body=await response.json().catch(()=>null);
  return{status:response.status,data:response.ok&&body?.success?body.data as T:null};
 }catch{return{status:0,data:null};}
}

export const absoluteUrl=(path:string)=>new URL(path,SITE_URL).toString();
