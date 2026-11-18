'use client';
import {useEffect,useState} from 'react';
import {SIGNUP_COMPLETE_KEY,loginHref,loginTarget} from '@/lib/crefans/login-return';
import {GuardPage} from './GuardPage';

/** Dedicated page after a successful signup (2026-10-31, replaces the completion dialog). Live mode shows it only after a
 *  signup in this tab; opening the address directly goes back to the signup form. Preview always shows it.
 *  2026-11-18: signup signs the member in, so a signed-in member gets 계속하기 to the screen the signup started from (`next`,
 *  checked like the login return path, otherwise the feed). If that sign-in did not happen the page still offers login. */
export function SignupCompletePage({basePath,live,leave,next=null,signedIn}:{basePath:string;live:boolean;leave?:(path:string)=>void;next?:string|null;signedIn?:boolean}){
  const [ready,setReady]=useState(!live);
  useEffect(()=>{if(!live)return;let done=false;try{done=!!sessionStorage.getItem(SIGNUP_COMPLETE_KEY);}catch{}if(done)setReady(true);else leave?.(`${basePath}/signup`);},[live,basePath,leave]);
  // Live mode waits for the session check so the button does not switch from 로그인 to 계속하기 after it is shown.
  if(!ready||(live&&signedIn===undefined))return null;
  const target=loginTarget(basePath,next);
  if(signedIn)return <GuardPage title="회원가입이 완료됐어요" description={<>크레팬스에 오신 것을 환영해요.<br/>로그인도 함께 완료됐어요.</>} primary={{href:target,label:'계속하기'}}/>;
  return <GuardPage title="회원가입이 완료됐어요" description={<>크레팬스에 오신 것을 환영해요.<br/>로그인하고 새로운 이야기를 만나보세요.</>} primary={{href:next?loginHref(basePath,target):`${basePath}/login`,label:'로그인하러 가기'}}/>;
}
