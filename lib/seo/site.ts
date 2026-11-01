import type {Metadata} from 'next';

// Search and share metadata (2026-11-01 user decisions): only public pages are indexed; creator profiles get their own
// preview; public posts may use their text and image, while locked/adult/hidden posts show only the creator.
export const SITE_URL=(process.env.NEXT_PUBLIC_SITE_URL||'https://crefans.com').replace(/\/$/,'');
export const SITE_NAME='크레팬스';
export const SITE_TITLE='크레팬스 crefans - 크리에이터 멤버십·후원 플랫폼';
export const SITE_DESCRIPTION='좋아하는 크리에이터를 멤버십으로 구독하고 콩으로 후원하세요. 크리에이터는 팬과 함께 창작 수익을 만듭니다.';
export const SITE_KEYWORDS=['크레팬스','crefans','크리에이터','멤버십','구독','후원','팬덤','창작자','크리에이터 후원','팬 커뮤니티','유료 구독','코스프레','일러스트','아트'];
export const DEFAULT_OG_IMAGE={url:'/og/crefans-og.png',width:1200,height:630,alt:'크레팬스 - 크리에이터 멤버십·후원 플랫폼'};

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
