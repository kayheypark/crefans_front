'use client';
import Link from 'next/link';
import {useEffect,useId,useState,type CSSProperties,type ReactNode} from 'react';
import {designTokens,designVariables} from '@/lib/design/tokens';
import {Brand} from '../Brand';
import {Avatar,NavIcon} from '../ServiceUI';
import type {StudioProfile} from '@/types/crefans-studio';
import s from './studio.module.css';
export const studioNavGroups=[
 {id:'content',label:'콘텐츠',icon:'pencil',items:[{label:'게시물',path:'content'},{label:'댓글',path:'comments'}]},
 {id:'membership',label:'멤버십',icon:'membership',items:[{label:'멤버십',path:'memberships'}]},
 {id:'community',label:'구독자 관리',icon:'user',items:[{label:'구독자',path:'subscribers'},{label:'메시지',path:'messages'}]},
 {id:'reports',label:'리포트',icon:'chart',items:[{label:'통계 요약',path:'analytics'},{label:'순수익 리포트',path:'reports/revenue'},{label:'구독자 리포트',path:'reports/subscribers'},{label:'팔로워 리포트',path:'reports/followers'}]},
 {id:'finance',label:'수익,정산,출금 관리',icon:'coin',items:[{label:'수익 현황',path:'earnings'},{label:'정산 내역',path:'settlements'},{label:'출금 신청',path:'withdraw'},{label:'출금 내역',path:'withdrawals'}]},
 {id:'settings',label:'설정',icon:'settings',items:[{label:'정산 계좌',path:'accounts'},{label:'출금 PIN 설정',path:'security'},{label:'크리에이터 설정',path:'settings'}]},
] as const;
export const studioNav=[{label:'대시보드',path:''},...studioNavGroups.flatMap<{label:string;path:string}>(group=>group.items)];
const matches=(active:string,path:string)=>active===path||!!path&&active.startsWith(`${path}/`);
// React 18 serializes inert as a string HTML attribute.
const inertWhen=(closed:boolean):Record<string,string>=>closed?{inert:''}:{};

export default function StudioShell({active,basePath,fanPath,profile,children}:{active:string;basePath:string;fanPath:string;profile:StudioProfile;mock?:boolean;children:ReactNode}){
 const navId=useId();
 const activeGroup=studioNavGroups.find(group=>group.items.some(item=>matches(active,item.path)));
 const [openGroups,setOpenGroups]=useState<Record<string,boolean>>(()=>activeGroup?{[activeGroup.id]:true}:{}),[isMobile,setIsMobile]=useState(false);
 useEffect(()=>{if(activeGroup)setOpenGroups(previous=>({...previous,[activeGroup.id]:true}));},[active,activeGroup?.id]);
 useEffect(()=>{
  if(typeof window==='undefined'||!window.matchMedia)return;
  const media=window.matchMedia(`(max-width: ${designTokens.breakpoint.tablet-1}px)`),update=()=>setIsMobile(media.matches);
  update();media.addEventListener('change',update);
  return()=>media.removeEventListener('change',update);
 },[]);
 const href=(path:string)=>`${basePath}${path?`/${path}`:''}`;
 return <div className={s.root} style={designVariables as CSSProperties}>
  <a href="#studio-content" className={s.skip}>본문으로 이동</a>
  <header className={s.header}><Brand href={`${fanPath}/feed`}/><span className={s.studioLabel}>크리에이터 스튜디오</span><div><Link href={`${fanPath}/feed`}>팬 화면으로</Link><Avatar creator={{name:profile.name,image:profile.avatar,position:profile.avatarPosition}} size={32}/></div></header>
  {isMobile?<main id="studio-content" className={s.unsupported}><h1>모바일에서는 지원하지 않습니다</h1><p>크리에이터 스튜디오는 PC 브라우저에서 이용해 주세요.</p><Link href={`${fanPath}/feed`}>팬 화면으로 이동</Link></main>
  :<div className={s.layout}>
   <aside className={s.sidebar}>
    <div className={s.identity}><Avatar creator={{name:profile.name,image:profile.avatar,position:profile.avatarPosition}} size={44}/><div><strong>{profile.name}</strong><small>@{profile.handle}</small></div></div>
    <nav aria-label="스튜디오 메뉴">
     <Link className={s.dashboardLink} href={href('')} aria-current={active===''?'page':undefined}><NavIcon name="home"/>대시보드</Link>
     {studioNavGroups.map(group=>{const open=!!openGroups[group.id],groupId=`${navId}-${group.id}`;return <div className={s.navGroup} key={group.id}>
      <button type="button" id={`${groupId}-toggle`} className={s.groupToggle} aria-expanded={open} aria-controls={groupId} data-active={activeGroup?.id===group.id||undefined} onClick={()=>setOpenGroups(previous=>({...previous,[group.id]:!previous[group.id]}))}><NavIcon name={group.icon}/><span>{group.label}</span><svg className={s.chevron} viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div id={groupId} className={s.groupPanel} data-open={open} role="group" aria-labelledby={`${groupId}-toggle`} aria-hidden={!open||undefined} {...inertWhen(!open)}><div className={s.groupPanelInner}><div className={s.groupItems}>{group.items.map(item=><Link key={item.path} href={href(item.path)} aria-current={matches(active,item.path)?'page':undefined}>{item.label}</Link>)}</div></div></div>
     </div>;})}
    </nav>
    <Link className={s.onboardingLink} href={href('start')} aria-current={active==='start'?'page':undefined}>크리에이터 시작 안내 ↗</Link>
    <footer className={s.sidebarFooter}><Link href={`${fanPath}/landing`}>서비스 소개</Link></footer>
   </aside>
   <main id="studio-content" className={s.main}>{children}</main>
  </div>}
 </div>;
}
