import Image from 'next/image';
import Link from 'next/link';
import s from './guest-cosplay-banner.module.css';

export function GuestCosplayBanner({href}:{href:string}){
 return <Link className={s.banner} href={href}>
  <span className={s.copy}><span className={s.eyebrow}>로그인 없이 AI 사진 체험</span><strong className={s.title}>나도 <em>코스어</em></strong><span className={s.description}>내 사진에 원하는 의상을 입혀 보세요.</span><span className={s.action}>코스어 모드 체험하기 <span aria-hidden="true">→</span></span></span>
  <span className={s.cards} aria-hidden="true">{['mage','idol','cyber'].map(name=><span className={s.card} key={name}><Image src={`/brand/ai-photo/costumes/${name}-v2.webp`} alt="" fill sizes="(max-width: 480px) 80px, 120px"/></span>)}</span>
 </Link>;
}
