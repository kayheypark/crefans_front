'use client';
import {useEffect,useState} from 'react';
import {loginHref,signupHref} from '@/lib/crefans/login-return';
/** Login link that brings the member back to the current screen after signing in. Read from the address after mount,
 *  so presentation components need no router state (the first render links to plain login). */
export function useCurrentLoginHref(basePath:string){
  const [href,setHref]=useState(`${basePath}/login`);
  useEffect(()=>{if(typeof location!=="undefined")setHref(loginHref(basePath,location.pathname+location.search));});
  return href;
}
/** Signup link with the same return path (2026-11-18: signup signs the member in, then '계속하기' returns here). */
export function useCurrentSignupHref(basePath:string){
  const [href,setHref]=useState(`${basePath}/signup`);
  useEffect(()=>{if(typeof location!=="undefined")setHref(signupHref(basePath,location.pathname+location.search));});
  return href;
}
