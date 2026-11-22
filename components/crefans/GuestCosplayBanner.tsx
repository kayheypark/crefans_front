import Image from 'next/image';
import Link from 'next/link';
import s from './guest-cosplay-banner.module.css';

// 2026-11-18 SEO fix: aboutHref adds a small text link under the banner to the AI photo landing.
// 2026-11-22 user request: on the feed both the banner and the text link go to the AI photo landing; the action reads '로그인 없이 0원 체험'.
export function GuestCosplayBanner({href,aboutHref}:{href:string;aboutHref?:string}){
 return <><Link className={s.banner} href={href}>
  <span className={s.copy}><strong className={s.title}>내가 <em>코스어</em>가 된다면?</strong><span className={s.action}>로그인 없이 0원 체험 <span aria-hidden="true">→</span></span></span>
  <span className={s.cards} aria-hidden="true">{['mage','idol','cyber'].map(name=><span className={s.card} key={name}><Image src={`/brand/ai-photo/costumes/${name}-v2.webp`} alt="" fill sizes="(max-width: 480px) 80px, 120px"/></span>)}</span>
 </Link>{aboutHref&&<Link className={s.about} href={aboutHref}>AI 사진 편집 더 알아보기 <span aria-hidden="true">→</span></Link>}</>;
}
