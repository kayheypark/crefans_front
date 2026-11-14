'use client';
import {useBeans} from '../BeanContext';
import {MarqueeText,MarqueeMotionControl} from '@/components/ui/MarqueeText';

import Link from 'next/link';
import {useEffect,useId,useRef,useState,type CSSProperties,type ReactNode} from 'react';
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
 {id:'finance',label:'수익,정산,출금 관리',icon:'coin',items:[{label:'콩 후원·출금',path:'beans'},{label:'수익 현황',path:'earnings'},{label:'정산 내역',path:'settlements'},{label:'출금 신청',path:'withdraw'},{label:'출금 내역',path:'withdrawals'}]},
 {id:'advertising',label:'상점·홍보',icon:'chart',items:[{label:'상점',path:'shop'},{label:'광고상품',path:'advertising'}]},
 {id:'settings',label:'설정',icon:'settings',items:[{label:'정산 계좌',path:'accounts'},{label:'출금 PIN 설정',path:'security'},{label:'크리에이터 설정',path:'settings'}]},
] as const;
export const studioNav=[{label:'대시보드',path:''},...studioNavGroups.flatMap<{label:string;path:string}>(group=>group.items)];
const matches=(active:string,path:string)=>active===path||!!path&&active.startsWith(`${path}/`);
// React 19 treats inert as a boolean attribute; an empty string would drop it.
const inertWhen=(closed:boolean):Record<string,boolean>=>closed?{inert:true}:{};

export default function StudioShell({active,basePath,fanPath,profile,children}:{active:string;basePath:string;fanPath:string;profile:StudioProfile;mock?:boolean;children:ReactNode}){
 const navId=useId(),beansEnabled=useBeans()?.enabled;
 const activeGroup=studioNavGroups.find(group=>group.items.some(item=>matches(active,item.path)));
 const [openGroups,setOpenGroups]=useState<Record<string,boolean>>(()=>activeGroup?{[activeGroup.id]:true}:{}),[isMobile,setIsMobile]=useState(false),[menuOpen,setMenuOpen]=useState(false),[menuTop,setMenuTop]=useState(0),headerRef=useRef<HTMLElement>(null);
 useEffect(()=>{if(activeGroup)setOpenGroups(previous=>({...previous,[activeGroup.id]:true}));},[active,activeGroup?.id]);
 useEffect(()=>{setMenuOpen(false);},[active]);
 useEffect(()=>{if(!menuOpen)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenuOpen(false);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[menuOpen]);
 useEffect(()=>{if(!isMobile)setMenuOpen(false);},[isMobile]);
 useEffect(()=>{
  if(!menuOpen||typeof document==='undefined')return;
  setMenuTop(Math.max(0,Math.round(headerRef.current?.getBoundingClientRect().bottom??0)));
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=previous;};
 },[menuOpen]);
 useEffect(()=>{
  if(typeof window==='undefined'||!window.matchMedia)return;
  const media=window.matchMedia(`(max-width: ${designTokens.breakpoint.tablet-1}px)`),update=()=>setIsMobile(media.matches);
  update();media.addEventListener('change',update);
  return()=>media.removeEventListener('change',update);
 },[]);
 const href=(path:string)=>`${basePath}${path?`/${path}`:''}`;
 return <div className={s.root} style={{...designVariables,'--studio-menu-top':`${menuTop}px`} as CSSProperties}>
  <a href="#studio-content" className={s.skip}>본문으로 이동</a>
  <header ref={headerRef} className={s.header}>{isMobile&&<button type="button" className={s.menuButton} aria-expanded={menuOpen} aria-controls={`${navId}-sidebar`} aria-label={menuOpen?'스튜디오 메뉴 닫기':'스튜디오 메뉴 열기'} onClick={()=>setMenuOpen(open=>!open)}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">{menuOpen?<path d="M6 6l12 12M18 6 6 18"/>:<path d="M4 7h16M4 12h16M4 17h16"/>}</svg></button>}<Brand href={basePath} logoSrc="/brand/studio-logo-v1.png" name="크레팬스 스튜디오" className={s.studioBrand}/><div><Link className={s.serviceButton} href={`${fanPath}/feed`}>팬 화면</Link><Link className={s.profileLink} href={`${fanPath}/me`} aria-label="마이페이지로 이동"><Avatar creator={{name:profile.name,image:profile.avatar,position:profile.avatarPosition}} size={32}/></Link></div></header>
  <div className={s.layout}>
   {isMobile&&menuOpen&&<div className={s.menuBackdrop} aria-hidden="true" onClick={()=>setMenuOpen(false)}/>}
   <aside id={`${navId}-sidebar`} className={s.sidebar} data-open={!isMobile||menuOpen} data-mobile={isMobile||undefined} aria-hidden={isMobile&&!menuOpen||undefined} {...inertWhen(isMobile&&!menuOpen)}>
    <div className={s.identity}><Avatar creator={{name:profile.name,image:profile.avatar,position:profile.avatarPosition}} size={44}/><div><strong><MarqueeText text={profile.name}/></strong><small><MarqueeText text={`@${profile.handle}`}/></small></div></div>
    <nav aria-label="스튜디오 메뉴">
     <Link className={s.dashboardLink} href={href('')} aria-current={active===''?'page':undefined}><NavIcon name="home"/>대시보드</Link>
     {studioNavGroups.map(group=>{const open=!!openGroups[group.id],groupId=`${navId}-${group.id}`;return <div className={s.navGroup} key={group.id}>
      <button type="button" id={`${groupId}-toggle`} className={s.groupToggle} aria-expanded={open} aria-controls={groupId} data-active={activeGroup?.id===group.id||undefined} onClick={()=>setOpenGroups(previous=>({...previous,[group.id]:!previous[group.id]}))}><NavIcon name={group.icon}/><span>{group.label}</span><svg className={s.chevron} viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      <div id={groupId} className={s.groupPanel} data-open={open} role="group" aria-labelledby={`${groupId}-toggle`} aria-hidden={!open||undefined} {...inertWhen(!open)}><div className={s.groupPanelInner}><div className={s.groupItems}>{group.items.filter(item=>item.path!=='beans'||beansEnabled).map(item=><Link key={item.path} href={href(item.path)} aria-current={matches(active,item.path)?'page':undefined}>{item.label}</Link>)}</div></div></div>
     </div>;})}
    </nav>
    <Link className={s.onboardingLink} href={href('start')} aria-current={active==='start'?'page':undefined}>크리에이터 시작 안내 ↗</Link>
    <footer className={s.sidebarFooter}><Link href={`${fanPath}/landing`}>서비스 소개</Link><MarqueeMotionControl/></footer>
   </aside>
   <main id="studio-content" className={s.main}>{children}</main>
  </div>
 </div>;
}
