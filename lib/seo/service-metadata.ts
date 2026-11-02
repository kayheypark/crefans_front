import type {Metadata} from 'next';
import {serviceEvents} from '@/lib/content/events';
import {SITE_DESCRIPTION,SITE_NAME,SITE_TITLE,SITE_URL,absoluteUrl,clip,publicApi,shareMetadata} from './site';

type Profile={id:string;name:string;handle?:string;bio?:string;about?:string;image?:string;cover?:string;isCreator?:boolean;searchable?:boolean;tags?:string[]};
type PostDetail={post:{id:string;title?:string;body?:string;image?:string;canAccess?:boolean;time?:string};creator:Profile};
export type ServiceSeo={metadata:Metadata;jsonLd:object[]};

const guides:Record<string,string>={fan:'팬 이용안내',creator:'크리에이터 이용안내'};
const legal:Record<string,string>={terms:'이용약관',privacy:'개인정보처리방침',policy:'운영정책'};
const suffix=(text:string)=>`${text} | ${SITE_NAME}`;
const org={'@type':'Organization','@id':`${SITE_URL}/#organization`,name:SITE_NAME,alternateName:'Crefans',url:SITE_URL,logo:absoluteUrl('/brand/crefans-mark.svg')};
const site={'@context':'https://schema.org','@graph':[org,{'@type':'WebSite','@id':`${SITE_URL}/#website`,name:SITE_NAME,alternateName:'Crefans',url:SITE_URL,inLanguage:'ko-KR',publisher:{'@id':`${SITE_URL}/#organization`},potentialAction:{'@type':'SearchAction',target:`${SITE_URL}/service/explore?q={search_term_string}`,'query-input':'required name=search_term_string'}}]};
const name=(p:Profile)=>p.handle?`${p.name}(@${p.handle})`:p.name;
const about=(p:Profile)=>clip(p.bio||p.about||`${p.name}님의 크레팬스 프로필입니다. 멤버십 구독과 후원으로 응원해 보세요.`);
/** Creators who opted out of search, fan profiles and missing profiles are never indexed. */
const indexable=(p:Profile)=>p.isCreator!==false&&p.searchable!==false;

function profileLd(p:Profile,path:string){
 return{'@context':'https://schema.org','@type':'ProfilePage',url:absoluteUrl(path),name:suffix(name(p)),inLanguage:'ko-KR',isPartOf:{'@id':`${SITE_URL}/#website`},
  mainEntity:{'@type':'Person',name:p.name,...(p.handle?{alternateName:`@${p.handle}`}:{}),description:about(p),...(p.image||p.cover?{image:absoluteUrl((p.image||p.cover)!)}:{}),url:absoluteUrl(path),...(p.tags?.length?{knowsAbout:p.tags}:{})}};
}

/** Metadata for /service/<screen>/<id>. Private screens keep their plain title and stay out of search. */
export async function serviceSeo(screen:string,id:string|undefined,fallbackTitle:string):Promise<ServiceSeo>{
 const path=`/service/${screen}${id?`/${encodeURIComponent(id)}`:''}`;
 const page=(title:string,description:string,extra:Partial<Parameters<typeof shareMetadata>[0]>={},jsonLd:object[]=[]):ServiceSeo=>({metadata:shareMetadata({title,description,path,index:true,...extra}),jsonLd});
 switch(screen){
  case 'feed':return page(SITE_TITLE,SITE_DESCRIPTION,{},[site]);
  case 'explore':return page(suffix('크리에이터 탐색'),'코스프레·아트·일상 등 다양한 분야의 크리에이터를 찾아보세요. 마음에 드는 크리에이터를 팔로우하고 멤버십으로 응원할 수 있습니다.',{},[site]);
  case 'notices':return page(suffix('공지사항'),'크레팬스 서비스 공지사항입니다.');
  case 'support':return page(suffix('고객센터'),'크레팬스 이용 중 궁금한 점은 자주 묻는 질문과 1:1 문의로 해결하세요.');
  case 'guide':return page(suffix(guides[id||'']||'이용안내'),`크레팬스 ${guides[id||'']||'이용안내'}입니다. 가입부터 멤버십·콩 후원·출금까지 단계별로 안내합니다.`);
  case 'legal':return page(suffix(legal[id||'']||'서비스 정책'),`크레팬스 ${legal[id||'']||'서비스 정책'} 전문입니다.`);
  case 'events':{const event=id?serviceEvents.find(e=>e.id===id):null;return event?page(suffix(event.title),clip(event.summary)):page(suffix('이벤트'),'크레팬스에서 진행 중인 이벤트를 확인하세요.');}
  case 'creator':case 'membership':{
   if(!id)break;const {status,data}=await publicApi<Profile>(`/profiles/${encodeURIComponent(id)}`);
   if(!data)return{metadata:{title:fallbackTitle,robots:status===0?undefined:{index:false,follow:false}},jsonLd:[]};
   const title=suffix(screen==='membership'?`${data.name} 멤버십`:name(data));
   const description=screen==='membership'?clip(`${data.name}님의 멤버십을 구독하고 멤버 전용 게시물을 만나보세요. ${data.bio||''}`):about(data);
   return page(title,description,{image:data.cover||data.image||null,type:'profile',index:indexable(data)},screen==='creator'&&indexable(data)?[profileLd(data,path)]:[]);
  }
  case 'post':{
   if(!id)break;const {status,data}=await publicApi<PostDetail>(`/posts/${encodeURIComponent(id)}`);
   if(!data)return{metadata:{title:fallbackTitle,robots:status===0?undefined:{index:false,follow:false}},jsonLd:[]};
   const {post,creator}=data,open=post.canAccess===true;
   // Anonymous access decides: locked, adult or hidden posts expose only the creator, never their text or media.
   if(!open)return page(suffix(`${creator.name}님의 멤버십 게시물`),clip(`멤버십 구독자에게 공개된 게시물입니다. ${creator.bio||''}`),{image:creator.cover||creator.image||null,index:false});
   const title=suffix(clip(post.title||`${creator.name}님의 게시물`,60));
   return page(title,clip(post.body||creator.bio||`${creator.name}님의 크레팬스 게시물입니다.`),{image:post.image||creator.cover||creator.image||null,type:'article',index:indexable(creator)},[{'@context':'https://schema.org','@type':'SocialMediaPosting',headline:clip(post.title||`${creator.name}님의 게시물`,110),url:absoluteUrl(path),...(post.time?{datePublished:post.time}:{}),author:{'@type':'Person',name:creator.name,url:absoluteUrl(`/service/creator/${encodeURIComponent(creator.id)}`)},...(post.image?{image:absoluteUrl(post.image)}:{})}]);
  }
 }
 return{metadata:{title:fallbackTitle,robots:{index:false,follow:false}},jsonLd:[]};
}

export const jsonLdText=(value:object)=>JSON.stringify(value).replace(/</g,'\\u003c');
