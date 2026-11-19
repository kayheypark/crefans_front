import type {Metadata} from 'next';
import AiPhotoLanding from '@/components/service/AiPhotoLanding';
import {SITE_NAME,SITE_URL,absoluteUrl} from '@/lib/seo/site';
import {jsonLdText} from '@/lib/seo/service-metadata';
// AI photo editing landing page (2026-11-16 user request). The HTML is sent even when client scripts are delayed or blocked.
export const dynamic='force-dynamic';
const PATH='/service/landing-ai-image-generation';
const TITLE='AI 사진 편집 · 사진 한 장으로 코스튬 체인지 | 크레팬스';
const DESCRIPTION='원하는 코스튬·메이크업·포즈·배경을 고르면 AI가 사진을 새로 만들어요. 로그인 없이 이용권 3장으로 0원 체험해 보세요.';
// 2026-11-19 user request: the share image is the pink idol mirror-shot ad photo (fictional person, AI generated) in the
// 1200×630 landing layout (copy left, photo right) so the face is never cropped in link previews. Replaces og-modernia-v1.
const IMAGE={url:'/illustrations/landing/ai-photo/og-idol-mirror-v1.jpg',width:1200,height:630,alt:'크레팬스 AI 사진 편집, 핑크 아이돌 코스튬 거울 셀카 결과(가상 인물, AI 생성)'};
export const metadata:Metadata={title:TITLE,description:DESCRIPTION,keywords:['AI 사진 편집','AI 코스프레','AI 코스튬','AI 이미지 생성','사진 의상 변경','크레팬스'],alternates:{canonical:PATH},robots:{index:true,follow:true},
 // Page-level openGraph replaces the root one, so the site fields are repeated here.
 openGraph:{type:'website',siteName:SITE_NAME,locale:'ko_KR',url:PATH,title:'크레팬스 AI 사진 편집',description:'사진 한 장으로 오늘의 캐릭터가 되어 보세요. 로그인 없이 이용권 3장으로 0원 체험.',images:[IMAGE]},
 twitter:{card:'summary_large_image',title:'크레팬스 AI 사진 편집',description:'사진 한 장으로 오늘의 캐릭터가 되어 보세요. 로그인 없이 이용권 3장으로 0원 체험.',images:[IMAGE.url]}};
// Structured data states only what the page itself says: a web app with a free signed-out trial (10 uses per browser).
const jsonLd={'@context':'https://schema.org','@graph':[
 {'@type':'WebPage','@id':`${SITE_URL}${PATH}#webpage`,url:absoluteUrl(PATH),name:TITLE,description:DESCRIPTION,inLanguage:'ko-KR',isPartOf:{'@id':`${SITE_URL}/#website`},primaryImageOfPage:absoluteUrl(IMAGE.url),mainEntity:{'@id':`${SITE_URL}${PATH}#app`}},
 {'@type':'WebApplication','@id':`${SITE_URL}${PATH}#app`,name:'크레팬스 AI 사진 편집',url:absoluteUrl('/service/try'),applicationCategory:'MultimediaApplication',operatingSystem:'Web',inLanguage:'ko-KR',description:DESCRIPTION,image:absoluteUrl(IMAGE.url),publisher:{'@type':'Organization','@id':`${SITE_URL}/#organization`,name:SITE_NAME,url:SITE_URL},offers:{'@type':'Offer',price:0,priceCurrency:'KRW',description:'비회원 매일 체험 이용권 3장'}},
 {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:SITE_NAME,item:absoluteUrl('/service/feed')},{'@type':'ListItem',position:2,name:'AI 사진 편집',item:absoluteUrl(PATH)}]},
]};
export default function Page(){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLdText(jsonLd)}}/><AiPhotoLanding/></>;}
