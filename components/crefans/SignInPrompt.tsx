'use client';
import {useCurrentLoginHref} from './useCurrentLoginHref';
import {ActionLink} from './ServiceUI';
import {ServiceFooter} from './ServiceFooter';
import {PromptLayout,promptPrimary} from './PromptLayout';
/** `hideTitle`: inside a Dialog whose own title already says 로그인이 필요해요. `onNavigate`: close that Dialog when a link is used. */
export function SignInPrompt({basePath,description='로그인하면 내 프로필, 구독, 저장한 게시물을 볼 수 있어요.',variant='page',hideTitle=false,onNavigate}:{basePath:string;description?:string;variant?:'page'|'dialog';hideTitle?:boolean;onNavigate?:()=>void}){
  const loginHref=useCurrentLoginHref(basePath);
  return <PromptLayout icon="/brand/signin-lock-3d-transparent-v1.png" title={hideTitle?undefined:'로그인이 필요해요'} description={description} variant={variant}
    actions={<><ActionLink className={promptPrimary} href={loginHref} onClick={onNavigate}>로그인</ActionLink><ActionLink variant="secondary" href={`${basePath}/signup`} onClick={onNavigate}>회원가입</ActionLink></>}
    footer={variant==='page'?<ServiceFooter basePath={basePath}/>:undefined}/>;
}
