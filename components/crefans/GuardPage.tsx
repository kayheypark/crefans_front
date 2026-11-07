'use client';
import Link from 'next/link';
import type {ReactNode} from 'react';
import {useEffect,useRef} from 'react';
import Icon from './Icon';
import s from './signup-complete.module.css';

export type GuardImage={src:string;alt?:string};
type GuardLink={href:string;label:string};

/** Centered notice page shared by the signup-complete page and access guards (2026-11-07): image (default: the blue check),
 *  heading (focused when shown), description, primary and optional secondary link. Content comes from the caller. */
export function GuardPage({image,title,description,primary,secondary}:{image?:GuardImage;title:string;description:ReactNode;primary:GuardLink;secondary?:GuardLink}){
  const heading=useRef<HTMLHeadingElement>(null);
  // After a client navigation the new screen is attached before it is shown, so focus waits (up to ~1s) until the heading is visible.
  useEffect(()=>{let n=0,frame=0;const tick=()=>{const el=heading.current;if(el&&el.getClientRects().length){el.focus();if(document.activeElement===el)return;}if(++n<60)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[]);
  return <section className={s.page}>
    {image?<img className={s.image} src={image.src} alt={image.alt||''} width={88} height={88}/>:<span className={s.check}><Icon name="check" width={50} height={50} strokeWidth={2.6}/></span>}
    <h1 ref={heading} tabIndex={-1}>{title}</h1>
    <div className={s.content}>
      <p>{description}</p>
      <Link href={primary.href} className={s.login}>{primary.label}</Link>
      {secondary&&<Link href={secondary.href} className={s.secondary}>{secondary.label}</Link>}
    </div>
  </section>;
}

/** User-selected creator onboarding artwork; signup-complete retains the default check. */
export const creatorGuardImage:GuardImage={src:'/brand/guards/creator-pencil-v1.png',alt:''};

/** Members who have not switched to creator see this on studio screens instead of being sent to the start form (2026-11-07). */
export function CreatorGuardPage({studioPath,fanPath}:{studioPath:string;fanPath:string}){
  return <GuardPage image={creatorGuardImage} title="크리에이터 전환이 필요해요" description={<>스튜디오는 크리에이터만 이용할 수 있어요.<br/>활동명과 분야를 정하고 바로 시작해 보세요.</>} primary={{href:`${studioPath}/start`,label:'크리에이터 시작하기'}} secondary={{href:fanPath,label:'팬 화면으로'}}/>;
}
