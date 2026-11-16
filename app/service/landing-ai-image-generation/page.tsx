import type {Metadata} from 'next';
import AiPhotoLanding from '@/components/service/AiPhotoLanding';
// AI photo editing landing page (2026-11-16 user request). The HTML is sent even when client scripts are delayed or blocked.
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'AI 사진 편집 · 사진 한 장으로 코스튬 체인지 | 크레팬스',description:'원하는 코스튬·메이크업·포즈·배경을 고르면 AI가 사진을 새로 만들어요. 로그인 없이 10회 무료로 체험해 보세요.',alternates:{canonical:'/service/landing-ai-image-generation'},openGraph:{title:'크레팬스 AI 사진 편집',description:'사진 한 장으로 오늘의 캐릭터가 되어 보세요. 로그인 없이 10회 무료 체험.',images:[{url:'/illustrations/landing/ai-photo/cos1-v1.webp',width:720,height:900,alt:'AI 사진 편집 결과 예시(가상 인물, AI 생성)'}]}};
export default function Page(){return <AiPhotoLanding/>;}
