'use client';
import {useEffect,useRef,useState} from 'react';
import {kakaoJavaScriptKey,postShareData,prepareKakaoShare,shareToKakao} from '@/lib/browser/post-share';

export function usePostShare({open,basePath,postId,title}:{open:boolean;basePath:string;postId:string;title:string}){
 const [url,setUrl]=useState(''),[nativeSupported,setNativeSupported]=useState(false),[kakao,setKakao]=useState<'unavailable'|'loading'|'ready'|'error'>('unavailable');
 const [pending,setPending]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[manualCopy,setManualCopy]=useState(false),busy=useRef(false),generation=useRef(0);
 useEffect(()=>{
  const token=++generation.current;busy.current=false;setPending(false);setMessage('');setError('');setManualCopy(false);
  if(!open)return;
  const data=postShareData(window.location.origin,basePath,postId,title);setUrl(data.url);
  setNativeSupported(typeof navigator.share==='function'&&(!navigator.canShare||navigator.canShare(data)));
  if(!kakaoJavaScriptKey){setKakao('unavailable');return;}
  setKakao('loading');prepareKakaoShare().then(()=>{if(token===generation.current)setKakao('ready');},()=>{if(token===generation.current)setKakao('error');});
  return()=>{generation.current++;};
 },[open,basePath,postId,title]);
 async function perform(kind:'copy'|'kakao'|'more'){
  if(!open||busy.current||!url||kind==='kakao'&&kakao!=='ready'||kind==='more'&&!nativeSupported)return;
  const token=generation.current;busy.current=true;setPending(true);setMessage('');setError('');setManualCopy(false);
  const data=postShareData(window.location.origin,basePath,postId,title);
  try{
   // No asynchronous work before these calls: clipboard, native share and Kakao need the click's activation.
   if(kind==='copy')await navigator.clipboard.writeText(data.url);
   else if(kind==='more')await navigator.share(data);
   else await shareToKakao(data);
   if(token===generation.current)setMessage(kind==='copy'?'링크를 복사했어요.':kind==='kakao'?'카카오톡에서 공유 대상을 선택해 주세요.':'');
  }catch(cause){
   if(token!==generation.current)return;
   if(kind==='more'&&(cause as {name?:string})?.name==='AbortError')return;
   setError(kind==='copy'?'링크를 복사하지 못했어요. 아래 주소를 직접 복사해 주세요.':kind==='kakao'?'카카오톡 공유를 열지 못했어요. 잠시 후 다시 시도해 주세요.':'기기 공유창을 열지 못했어요. 복사를 이용해 주세요.');
   if(kind==='copy')setManualCopy(true);
  }finally{if(token===generation.current){busy.current=false;setPending(false);}}
 }
 return{url,nativeSupported,kakao,pending,message,error,manualCopy,dismissMessage:()=>setMessage(''),copy:()=>perform('copy'),shareKakao:()=>perform('kakao'),shareMore:()=>perform('more')};
}
