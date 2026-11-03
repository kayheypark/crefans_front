'use client';
import {useEffect,useState} from 'react';
import {FieldIcon} from '@/components/ui/Field';
import s from './post-views.module.css';

const compact=new Intl.NumberFormat('ko-KR',{notation:'compact',maximumFractionDigits:1});
/** A missing count is unknown, not zero. The count is supplied by the API or preview model. */
export function PostViews({count:initial,postId}:{count?:number;postId?:string}){
  const [latest,setLatest]=useState<{id:string;count:number}|null>(null);
  useEffect(()=>{if(typeof window==='undefined'||!postId||!window.addEventListener)return;const receive=(event:Event)=>{const detail=(event as CustomEvent).detail;if(detail?.id===postId&&Number.isSafeInteger(detail.views))setLatest({id:postId!,count:detail.views});};window.addEventListener('crefans:post-views',receive);return()=>window.removeEventListener('crefans:post-views',receive);},[postId]);
  const count=latest&&latest.id===postId?Math.max(initial||0,latest.count):initial;
  if(count===undefined||!Number.isSafeInteger(count)||count<0)return null;
  const label=`조회수 ${count.toLocaleString('ko-KR')}회`;
  return <span className={s.views} data-post-views={count} role="img" aria-label={label} title={label}>
    <FieldIcon name="show"/>
    <span aria-hidden="true">{count<10000?count.toLocaleString('ko-KR'):compact.format(count)}</span>
  </span>;
}
