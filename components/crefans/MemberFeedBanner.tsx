import {GuestCosplayBanner} from './GuestCosplayBanner';
import Link from 'next/link';
import s from './guest-cosplay-banner.module.css';

export function MemberFeedBanner({kind,basePath}:{kind:'edit'|'library';basePath:string}){
 if(kind==='edit')return <GuestCosplayBanner member href={basePath+'/studio/content/new'}/>;
 return <Link className={s.memberBanner} data-kind="library" href={basePath+'/me#library'}>
  <span className={s.memberCopy}>
   <strong>내 보관함에서<br/>다시 시작해요</strong>
   <span className={s.action}>내 보관함 열기 <span aria-hidden="true">→</span></span>
  </span>
 </Link>;
}
