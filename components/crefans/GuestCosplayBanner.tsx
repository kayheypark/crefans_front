import Image from 'next/image';
import Link from 'next/link';
import s from './guest-cosplay-banner.module.css';

export function GuestCosplayBanner({href}:{href:string}){
 return <Link className={s.banner} href={href}>
  <span className={s.copy}><strong className={s.title}>내가 <em>코스어</em>가 된다면?</strong><span className={s.action}>로그인 없이 무료 체험 <span aria-hidden="true">→</span></span></span>
  <span className={s.cards} aria-hidden="true">{['mage','idol','cyber'].map(name=><span className={s.card} key={name}><Image src={`/brand/ai-photo/costumes/${name}-v2.webp`} alt="" fill sizes="(max-width: 480px) 80px, 120px"/></span>)}</span>
 </Link>;
}
