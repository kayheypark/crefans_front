'use client';
import {useEffect,useState} from 'react';
import {SIGNUP_COMPLETE_KEY} from '@/lib/crefans/login-return';
import {GuardPage} from './GuardPage';

/** Dedicated page after a successful signup (2026-10-31, replaces the completion dialog). Live mode shows it only after a
 *  signup in this tab; opening the address directly goes back to the signup form. Preview always shows it. */
export function SignupCompletePage({basePath,live,leave}:{basePath:string;live:boolean;leave?:(path:string)=>void}){
  const [ready,setReady]=useState(!live);
  useEffect(()=>{if(!live)return;let done=false;try{done=!!sessionStorage.getItem(SIGNUP_COMPLETE_KEY);}catch{}if(done)setReady(true);else leave?.(`${basePath}/signup`);},[live,basePath,leave]);
  if(!ready)return null;
  return <GuardPage title="회원가입이 완료됐어요" description={<>크레팬스에 오신 것을 환영해요.<br/>로그인하고 새로운 이야기를 만나보세요.</>} primary={{href:`${basePath}/login`,label:'로그인하러 가기'}}/>;
}
