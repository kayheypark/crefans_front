import Link from 'next/link';
import s from './guest-cosplay-banner.module.css';

export function MemberFeedBanner({kind,basePath}:{kind:'edit'|'library';basePath:string}){
 const library=kind==='library';
 return <Link className={s.memberBanner} data-kind={kind} href={basePath+(library?'/me#library':'/studio/content/new#ai-photo')}>
  <span className={s.memberCopy}>
   <strong>{library?'내 보관함에서':'사진 한 장,'}<br/>{library?'다시 시작해요':'새로운 분위기'}</strong>
   <span className={s.action}>{library?'내 보관함 열기':'AI 사진 편집'} <span aria-hidden="true">→</span></span>
  </span>
 </Link>;
}
