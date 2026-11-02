'use client';
import Image from 'next/image';
import {useCurrentLoginHref} from './useCurrentLoginHref';
import {ActionLink} from './ServiceUI';
import {ServiceFooter} from './ServiceFooter';
import s from './account.module.css';
export function SignInPrompt({basePath,description='로그인하면 내 프로필, 구독, 저장한 게시물을 볼 수 있어요.',variant='page'}:{basePath:string;description?:string;variant?:'page'|'dialog'}){
  const loginHref=useCurrentLoginHref(basePath);
  const Heading=variant==='dialog'?'h3':'h1';
  return <section className={`${s.signInPrompt}${variant==='dialog'?` ${s.signInDialog}`:''}`}><div className={s.signInContent}><Image className={s.signInIcon} src="/brand/signin-lock-3d-transparent-v1.png" width={88} height={88} sizes="88px" alt="" priority/><Heading className={s.signInTitle}>로그인이 필요해요</Heading><p>{description}</p><div className={s.signInActions}><ActionLink className={s.signInPrimary} href={loginHref}>로그인</ActionLink><ActionLink variant="secondary" href={`${basePath}/signup`}>회원가입</ActionLink></div></div>{variant==='page'&&<ServiceFooter basePath={basePath}/>}</section>;
}

