import {MarqueeMotionControl} from '@/components/ui/MarqueeText';
import Link from 'next/link';
import {guideSiteUrl} from '@/lib/content/business';

// 2026-11-18 SEO fix: the AI photo landing gets a crawlable link from the feed sidebar and every service footer.
// A path starting with '/' is absolute (the AI landing exists only under /service, also when shown from /preview).
const links=[{path:'/service/landing-ai-image-generation',label:'AI 사진 편집'},{path:'support',label:'고객센터'},{path:'notices',label:'공지사항'},{path:'events',label:'이벤트 안내'},{path:'legal/terms',label:'이용약관'},{path:'legal/privacy',label:'개인정보처리방침'},{path:'legal/policy',label:'운영정책'},{path:'studio/shop',label:'상점'},{path:'studio',label:'크리에이터 스튜디오 ↗'}];

/** Shared destinations for the sidebar and the page footer (the footer omits the motion toggle, which stays in settings). */
export function ServiceLinks({basePath,motionControl=true}:{basePath:string;motionControl?:boolean}){
  return <>{links.map(({path,label})=><Link key={path} href={path.startsWith('/')?path:`${basePath}/${path}`}>{label}</Link>)}<a href={guideSiteUrl} target="_blank" rel="noopener noreferrer">크레팬스 가이드 ↗</a><a href={`${guideSiteUrl}downloads/crefans-service-introduction.pdf`} target="_blank" rel="noopener noreferrer">서비스 소개서 PDF ↗</a>{motionControl&&<MarqueeMotionControl/>}</>;
}
