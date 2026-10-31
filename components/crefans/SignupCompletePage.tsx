'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {SIGNUP_COMPLETE_KEY} from '@/lib/crefans/login-return';
import Icon from './Icon';
import s from './signup-complete.module.css';

/** Dedicated page after a successful signup (2026-10-31, replaces the completion dialog). Live mode shows it only after a
 *  signup in this tab; opening the address directly goes back to the signup form. Preview always shows it. */
export function SignupCompletePage({basePath,live,leave}:{basePath:string;live:boolean;leave?:(path:string)=>void}){
  const [ready,setReady]=useState(!live);
  const title=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{if(!live)return;let done=false;try{done=!!sessionStorage.getItem(SIGNUP_COMPLETE_KEY);}catch{}if(done)setReady(true);else leave?.(`${basePath}/signup`);},[live,basePath,leave]);
  // After a client navigation the new screen is attached before it is shown, so focus waits (up to ~1s) until the heading is visible.
  useEffect(()=>{if(!ready)return;let n=0,frame=0;const tick=()=>{const el=title.current;if(el&&el.getClientRects().length){el.focus();if(document.activeElement===el)return;}if(++n<60)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[ready]);
  if(!ready)return null;
  return <section className={s.page}>
    <span className={s.check}><Icon name="check" width={50} height={50} strokeWidth={2.6}/></span>
    <h1 ref={title} tabIndex={-1}>회원가입이 완료됐어요</h1>
    <div className={s.content}>
      <p>크레팬스에 오신 것을 환영해요.<br/>로그인하고 새로운 이야기를 만나보세요.</p>
      <Link href={`${basePath}/login`} className={s.login}>로그인하러 가기</Link>
    </div>
  </section>;
}
