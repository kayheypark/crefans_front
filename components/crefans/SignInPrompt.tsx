import Link from 'next/link';
import {Empty} from './ServiceUI';
import s from './account.module.css';
export function SignInPrompt({basePath,description='로그인하면 내 프로필, 구독, 저장한 게시물을 볼 수 있어요.'}:{basePath:string;description?:string}){
  return <section className={s.signInPrompt}><Empty title="로그인이 필요해요" description={description} action={<div className={s.signInActions}><Link className={s.signInPrimary} href={`${basePath}/login`}>로그인</Link><Link href={`${basePath}/signup`}>회원가입</Link></div>}/></section>;
}

