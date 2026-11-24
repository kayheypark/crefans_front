import {GuestCosplayBanner} from './GuestCosplayBanner';
import {useState} from 'react';
import {SignupOfferDialog} from './SignupOfferDialog';
import {useCurrentSignupHref} from './useCurrentLoginHref';
import Link from 'next/link';
import s from './guest-cosplay-banner.module.css';

export function MemberFeedBanner({kind,basePath,guest=false}:{guest?:boolean;kind:'edit'|'library'|'shop';basePath:string}){
 if(kind==='edit')return <GuestCosplayBanner member href={basePath+'/studio/content/new'}/>;
 if(kind==='shop')return <Link className={s.memberBanner} data-kind="shop" href={basePath+'/studio/shop'}>
  <span className={s.memberCopy}>
   <strong>AI 사진 편집<br/>이용권</strong>
   <span className={s.action}>상점으로 가기 <span aria-hidden="true">→</span></span>
  </span>
 </Link>;
 const copy=
  <span className={s.memberCopy}>
   <strong>내 보관함에서<br/>다시 시작해요</strong>
   <span className={s.action}>내 보관함 열기 <span aria-hidden="true">→</span></span>
  </span>;
 if(guest)return <GuestLibraryBanner basePath={basePath} copy={copy}/>;
 return <Link className={s.memberBanner} data-kind="library" href={basePath+'/me#library'}>{copy}</Link>;
}

function GuestLibraryBanner({basePath,copy}:{basePath:string;copy:React.ReactNode}){
 const [open,setOpen]=useState(false);
 const signupHref=useCurrentSignupHref(basePath);
 return <><button type="button" className={s.memberBanner} data-kind="library" aria-haspopup="dialog" onClick={()=>setOpen(true)}>{copy}</button>
  {open&&<SignupOfferDialog open onClose={()=>setOpen(false)} title="내 보관함을 만들어 보세요" art="/brand/feed/member-library-seedream.webp" signupHref={signupHref}>
   사진과 동영상을 모아 두고<br/>게시글을 쓸 때 다시 꺼내 쓸 수 있어요.
  </SignupOfferDialog>}</>;
}
