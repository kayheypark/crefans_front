'use client';
import Link from 'next/link';
import {MarqueeText} from '@/components/ui/MarqueeText';
import {displayTime} from '@/lib/crefans/display-time';
import type {StudioMetric,StudioOverviewModel} from '@/types/crefans-studio';
import {ActionLink,Avatar,Empty,NavIcon,PageTitle} from '../ServiceUI';
import s from './dashboard.module.css';

const reportLabels:Record<string,string>={revenue:'순수익 리포트',subscribers:'구독자 리포트',followers:'팔로워 리포트'};
const activityLabels:Record<string,string>={content:'게시물',comments:'댓글',subscribers:'구독자',settlements:'정산 내역',messages:'메시지'};
function Chevron(){return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>;}
function metricValue(metric:StudioMetric){
 const unit=metric.id==='revenue'?'원':['subscribers','followers'].includes(metric.id)?'명':'';
 return unit&&/^-?[\d,]+$/.test(metric.value)?`${metric.value.replaceAll(',','').replace(/\B(?=(\d{3})+(?!\d))/g,',')}${unit}`:metric.value;
}
function ActivityRow({activity,basePath}:{activity:StudioOverviewModel['activities'][number];basePath:string}){
 const destination=activity.path?.split(/[/?]/)[0],label=destination?activityLabels[destination]:undefined;
 const icon=destination==='comments'||destination==='messages'?'message':destination==='settlements'?'coin':destination==='subscribers'?'user':'pencil';
 const content=<><span className={s.activityIcon}><NavIcon name={icon}/></span><div className={s.activityText}><strong>{activity.title}</strong>{activity.description&&<p>{activity.description}</p>}<small>{displayTime(activity.time)}</small></div>{activity.path&&<span className={s.activityDestination}>{label}<Chevron/></span>}</>;
 return activity.path?<Link className={s.activity} href={`${basePath}/${activity.path}`}>{content}</Link>:<article className={s.activity}>{content}</article>;
}

export function DashboardPage({model,basePath}:{model:StudioOverviewModel;basePath:string}){
 const draft=model.tasks.find(task=>task.id==='draft'),tasks=model.tasks.filter(task=>task.id!=='draft'&&task.path!=='withdraw');
 const shortcuts=[{label:'게시물',path:'content',icon:'grid' as const},{label:'댓글',path:'comments',icon:'message' as const},{label:'광고 상품',path:'advertising',icon:'chart' as const},{label:'출금 신청',path:'withdraw',icon:'membership' as const},{label:'콩 후원·출금',path:'beans',icon:'coin' as const},{label:'크리에이터 설정',path:'settings',icon:'settings' as const}];
 return <div className={s.dashboard}>
  <PageTitle>대시보드</PageTitle>
  <h2 className={s.greeting}><Avatar creator={{name:model.profile.name,image:model.profile.avatar,position:model.profile.avatarPosition}} size={48}/><MarqueeText text={`${model.profile.name}님, 반가워요`}/></h2>
  <div className={s.overview}>
   <section className={s.actions} aria-label="빠른 작업">
    <ActionLink href={`${basePath}/content/new`} className={s.compose}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>새 게시물 작성</ActionLink>
    <nav className={s.shortcuts} aria-label="빠른 작업 바로가기">{shortcuts.map(shortcut=><Link className={s.shortcut} href={`${basePath}/${shortcut.path}`} key={shortcut.path}><span className={s.shortcutIcon}><NavIcon name={shortcut.icon}/></span><strong>{shortcut.label}</strong><Chevron/></Link>)}</nav>
    {draft&&<Link className={s.draft} href={`${basePath}/${draft.path}`}><span>{draft.title}</span><Chevron/></Link>}
    {tasks.map(task=><Link className={s.task} key={task.id} href={`${basePath}/${task.path}`}><span><strong>{task.title}</strong>{task.description&&<small>{task.description}</small>}</span><Chevron/></Link>)}
   </section>
   {model.metrics.length>0&&<section className={s.summary} aria-label="주요 지표">{model.metrics.map(metric=><article key={metric.id} className={s.metric} data-wide={metric.id==='revenue'||undefined}><div className={s.metricLabel}><span>{metric.id==='subscribers'?'구독자':metric.label}</span>{reportLabels[metric.id]&&<Link href={`${basePath}/reports/${metric.id}`} className={s.reportLink}>{reportLabels[metric.id]}<Chevron/></Link>}</div><strong className={s.metricValue}>{metricValue(metric)}</strong>{metric.description&&metric.description!=='원'&&<small>{metric.description.replace(/ · 원$/,'')}</small>}</article>)}</section>}
  </div>
  <div className={s.details}>
   <section aria-labelledby="dashboard-activity"><div className={s.sectionHeading}><h2 id="dashboard-activity">최근 활동</h2></div><div className={s.activityList}>{model.activities.length?model.activities.map(activity=><ActivityRow key={activity.id} activity={activity} basePath={basePath}/>):<Empty title="아직 활동이 없어요"/>}</div></section>
   <section aria-labelledby="dashboard-performance"><div className={s.sectionHeading}><h2 id="dashboard-performance">게시물 성과</h2><Link href={`${basePath}/analytics`} className={s.reportLink}>통계 요약<Chevron/></Link></div><div className={s.performanceList}>{model.contentPerformance.length?model.contentPerformance.map(post=><Link className={s.performanceRow} href={`${basePath}/content/${post.id}/edit`} key={post.id}>{post.image?<img src={post.image} alt="" loading="lazy"/>:<span className={s.textThumbnail} aria-label="텍스트 게시물">Aa</span>}<div className={s.postText}><strong>{post.title}</strong><small>좋아요 {post.likes.toLocaleString()} · 댓글 {post.comments.toLocaleString()}</small></div><span className={s.views}>조회<b>{post.views.toLocaleString()}</b></span></Link>):<Empty title="아직 게시물이 없어요"/>}</div></section>
  </div>
 </div>;
}
