'use client';
import Link from 'next/link';
import type {CSSProperties,ReactNode} from 'react';
import {designVariables} from '@/lib/design/tokens';
import type {ServiceViewModel} from '@/types/crefans';
import {Brand} from './Brand';
import {NavIcon,Avatar} from './ServiceUI';
import s from './service.module.css';
const menu=[{id:'feed',label:'홈',icon:'home'},{id:'explore',label:'탐색하기',icon:'explore'},{id:'messages',label:'메시지',icon:'message'},{id:'notifications',label:'알림',icon:'bell'},{id:'me',label:'내 프로필',icon:'user'}] as const;
export default function ServiceShell({model,active,children,auth=false}:{model:ServiceViewModel;active:string;children:ReactNode;auth?:boolean}){
  const {read,viewer,basePath,data,signedIn}=model;
  const unread=data.notifications.filter(item=>!read.includes(item.id)).length;
  return <div className={s.root} style={designVariables as CSSProperties}><a href="#page-content" className={s.skip}>본문으로 이동</a>
    {<header className={s.header} data-auth={auth||undefined}><Brand href={`${basePath}/feed`}/><div className={s.headerActions}>{signedIn?<><Link aria-label={`알림 ${unread}개`} className={s.bell} href={`${basePath}/notifications`}><NavIcon name="bell"/>{unread>0&&<i/>}</Link><Link aria-label={`${viewer.name} 내 프로필`} href={`${basePath}/me`}><Avatar creator={viewer} size={30}/></Link></>:<><Link className={s.authLink} href={`${basePath}/login`}>로그인</Link><Link className={`${s.authLink} ${s.authPrimary}`} href={`${basePath}/signup`}>회원가입</Link></>}</div></header>}
    <div className={`${s.body} ${auth?s.authLayout:''}`}>
      {!auth&&<aside className={s.sidebar}><nav aria-label="사이드 메뉴">{menu.map(item=><Link key={item.id} aria-current={active===item.id?'page':undefined} href={`${basePath}/${item.id}`}><NavIcon name={item.icon}/>{item.label}</Link>)}</nav><div className={s.sidebarBottom}><Link href={`${basePath}/landing`}>서비스 소개</Link><Link href={`${basePath}/support`}>고객센터</Link><Link href={`${basePath}/notices`}>공지사항</Link><Link href={`${basePath}/studio`}>크리에이터 스튜디오 ↗</Link></div></aside>}
      <main id="page-content" className={`${s.main} ${auth?s.authMain:''} ${active==='creator'||active==='me'&&!model.account.route.profileTab?s.flushMain:''}`}>{children}</main>
    </div>
    {!auth&&<nav className={s.bottomNav} aria-label="하단 메뉴">{menu.map(item=><Link key={item.id} aria-current={active===item.id?'page':undefined} href={`${basePath}/${item.id}`} aria-label={item.id==='notifications'&&unread>0?`알림 ${unread}개`:undefined}>{item.id==='me'?<Avatar creator={signedIn?viewer:undefined} size={24}/>:item.id==='notifications'?<span className={s.bell}><NavIcon name={item.icon}/>{unread>0&&<i/>}</span>:<NavIcon name={item.icon}/>}<span>{item.id==='explore'?'탐색':item.id==='me'?'마이':item.label}</span></Link>)}</nav>}
  </div>;
}
