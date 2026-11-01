import Link from 'next/link';
import Image from 'next/image';
import type {BeanTipAttribution,BeanPayoutSources,BeanPayoutFunding} from '@/types/crefans-beans';
import s from './beans.module.css';
export function BeanTipKind({tip}:{tip:BeanTipAttribution}){return <strong className={s.tipKind}><Image src="/brand/post-actions/support-coin-flat-v1.png" width={18} height={18} sizes="18px" alt="" aria-hidden="true" draggable={false}/>{tip.sourceType==='post'||!!tip.post_id?'게시물 후원':'프로필 후원'}</strong>;}
export function BeanTipSource({tip,basePath,showKind=true}:{tip:BeanTipAttribution;basePath:string;showKind?:boolean}){
 const post=tip.sourceType==='post'||!!tip.post_id;
 if(!showKind&&!post)return null;
 return <span className={s.tipSource}>{showKind&&<BeanTipKind tip={tip}/>}{post&&<span>
  {tip.postAvailable&&tip.post_id?<Link href={`${basePath}/post/${encodeURIComponent(tip.post_id)}`}>{tip.postTitle||'제목 없는 게시물'}</Link>:tip.postTitle||'게시물 정보 없음'}
  {tip.postTitleSource==='current'&&<small>현재 제목 · 후원 당시 제목 미기록</small>}
  {tip.postAvailable===false&&tip.postTitle&&<small>현재 열 수 없는 게시물</small>}
 </span>}</span>;
}
export function BeanPayoutSource({sources,funding}:{sources?:BeanPayoutSources;funding?:BeanPayoutFunding}){
 return <><small>후원 출처: {sources?<>게시물 {sources.postQuantity.toLocaleString('ko-KR')}콩 · 프로필 {sources.profileQuantity.toLocaleString('ko-KR')}콩{sources.unattributedQuantity>0&&<> · 확인 필요 {sources.unattributedQuantity.toLocaleString('ko-KR')}콩</>}</>:'확인 필요'}</small>{funding&&<small>콩 종류: 일반 {funding.paidQuantity.toLocaleString('ko-KR')}콩 · 프로모션 {funding.promotionQuantity.toLocaleString('ko-KR')}콩{funding.unknownQuantity>0&&<> · 확인 필요 {funding.unknownQuantity.toLocaleString('ko-KR')}콩</>}</small>}</>;
}
