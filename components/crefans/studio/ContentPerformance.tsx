'use client';

import {useId,useState} from 'react';
import type {StudioOverviewModel} from '@/types/crefans-studio';
import {InfoTooltip} from '@/components/ui/InfoTooltip';
import {Empty} from '../ServiceUI';
import s from './content-performance.module.css';

type Post=StudioOverviewModel['contentPerformance'][number];
const measurement='세부 통계는 기능 적용 이후 누적입니다. 조회수는 50% 이상·1초 이상 열람 시 집계하며, 같은 방문자의 30분 내 피드·상세 열람은 한 번만 셉니다. 본인 열람은 제외합니다. 방문수는 30분 기준이며 실제 사람 수와 다릅니다. 공유 유입은 상세 조회에 포함됩니다.';
function Chevron({open}:{open:boolean}){return <svg className={s.chevron} data-open={open} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>;}
const compact=new Intl.NumberFormat('ko-KR',{notation:'compact',maximumFractionDigits:1});
function Count({value}:{value:number}){const exact=value.toLocaleString('ko-KR');return <span role="img" aria-label={exact} title={exact}>{value<10000?exact:compact.format(value)}</span>;}
function Metric({label,value}:{label:string;value:number}){return <div><dt>{label}</dt><dd><Count value={value}/></dd></div>;}
function PerformanceRow({post,initiallyOpen}:{post:Post;initiallyOpen:boolean}){
 const [open,setOpen]=useState(initiallyOpen),id=useId(),analytics=post.analytics;
 return <article className={s.row}>
  <h3 className={s.postHeading}><button type="button" className={s.summary} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(value=>!value)}>
   {post.image?<img className={s.thumbnail} src={post.image} alt="" loading="lazy"/>:<span className={`${s.thumbnail} ${s.textThumbnail}`} aria-hidden="true">Aa</span>}
   <span className={s.title}>{post.title}</span><span className={s.views}><span>조회</span><b><Count value={post.views}/></b></span><Chevron open={open}/>
  </button></h3>
  <div id={id} hidden={!open} className={s.details}>
   {analytics?<>
    <dl className={s.metrics} aria-label="열람 통계"><Metric label="피드 노출" value={analytics.feed}/><Metric label="상세 조회" value={analytics.detail}/><Metric label="방문수 (30분)" value={analytics.visits}/><Metric label="공유·외부 유입" value={analytics.shared}/><Metric label="영상 재생" value={analytics.video}/></dl>
    <h4 className={s.sourceTitle}>유입 경로</h4><dl className={s.sources} aria-label="유입 경로"><Metric label="카카오" value={analytics.kakao}/><Metric label="복사 링크" value={analytics.copy}/><Metric label="기기 공유" value={analytics.native}/><Metric label="외부 링크" value={analytics.external}/></dl>
   </>:<Empty title="세부 통계가 아직 없어요."/>}
   <dl className={s.reactions} aria-label="게시물 반응"><Metric label="좋아요" value={post.likes}/><Metric label="댓글" value={post.comments}/></dl>
  </div>
 </article>;
}
export function ContentPerformance({posts}:{posts:Post[]}){
 const id=useId();
 return <section className={s.performance} aria-labelledby={id}>
  <div className={s.heading}><h2 id={id}>콘텐츠 성과</h2><InfoTooltip label="콘텐츠 성과 집계 기준" content={measurement}/></div>
  <p className={s.caption}>기능 적용 이후 누적 · 본인 열람 제외</p>
  {posts.length?<div className={s.list}>{posts.map((post,index)=><PerformanceRow key={post.id} post={post} initiallyOpen={index===0}/>)}</div>:<Empty title="아직 게시물이 없어요" description="게시물을 올리면 이곳에서 성과를 확인할 수 있어요."/>}
 </section>;
}
