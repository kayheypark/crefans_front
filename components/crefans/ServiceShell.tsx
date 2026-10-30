'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {designVariables} from '@/lib/design/tokens';
import type {ServiceViewModel} from '@/types/crefans';
import {Brand} from './Brand';
import {UnreadBadge} from '@/components/ui/UnreadBadge';
import {Avatar} from './ServiceUI';
import {NavigationIcon,NavigationAvatar} from './NavigationIcon';
import {ServiceLinks} from './ServiceLinks';
import {BusinessInfo} from './BusinessInfo';
import {CommentDock,CommentDockProvider} from './CommentComposer';
import s from './service.module.css';
const menu=[{id:'feed',label:'홈',icon:'home'},{id:'explore',label:'탐색하기',icon:'explore'},{id:'messages',label:'메시지',icon:'message'},{id:'notifications',label:'알림',icon:'bell'},{id:'me',label:'내 프로필',icon:'user'}] as const;
export default function ServiceShell({model,active,children,auth=false,scrollKey=active}:{model:ServiceViewModel;active:string;children:ReactNode;auth?:boolean;scrollKey?:string}){
  const {read,viewer,basePath,data,signedIn}=model;
  const scrollRef=useRef<HTMLDivElement>(null),rootRef=useRef<HTMLDivElement>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  // React 19 treats inert as a boolean attribute (an empty string now means false), as in StudioShell.
  const interactionProps:Record<string,boolean>=ready?{}:{inert:true};
  useEffect(()=>{if(!auth&&window.matchMedia('(max-width:767px)').matches)scrollRef.current?.scrollTo(0,0);},[auth,scrollKey]);
  const messageUnread=signedIn?Object.values(model.messagesByCreator).flat().filter(message=>!message.mine&&message.unread).length:0;
  const unread=signedIn?data.notifications.filter(item=>!read.includes(item.id)).length:0;
  const counts:Record<string,number>={messages:messageUnread,notifications:unread};
  const menuLabel=(item:(typeof menu)[number])=>counts[item.id]>0?`${item.label}, 읽지 않은 ${counts[item.id]}개`:item.label;
  return <CommentDockProvider viewportRef={rootRef}><div ref={rootRef} className={s.root} data-mobile-shell={!auth||undefined} data-screen={active} style={designVariables as CSSProperties}><a href="#page-content" className={s.skip}>본문으로 이동</a>
    {<header className={s.header} data-auth={auth||undefined}><Brand href={`${basePath}/feed`}/><div className={s.headerActions}>{signedIn?<><Link aria-label={unread>0?`알림, 읽지 않은 ${unread}개`:'알림'} className={s.bell} href={`${basePath}/notifications`}><NavigationIcon name="bell" active={active==='notifications'} size={21}/><UnreadBadge count={unread}/></Link><Link aria-label={`${viewer.name} 내 프로필`} href={`${basePath}/me`}><Avatar creator={viewer} size={30}/></Link></>:<><Link className={s.authLink} href={`${basePath}/login`}>로그인</Link><Link className={`${s.authLink} ${s.authPrimary}`} href={`${basePath}/signup`}>회원가입</Link></>}</div></header>}
    <div ref={scrollRef} data-service-scroll className={`${s.body} ${auth?s.authLayout:''}`}>
      {!auth&&<aside className={s.sidebar}><nav aria-label="사이드 메뉴">{menu.map(item=><Link key={item.id} aria-current={active===item.id?'page':undefined} href={`${basePath}/${item.id}`} aria-label={menuLabel(item)}><span className={s.bell}><NavigationIcon name={item.icon} active={active===item.id} size={21}/><UnreadBadge count={counts[item.id]||0}/></span>{item.label}</Link>)}</nav><div className={s.sidebarBottom}><ServiceLinks basePath={basePath}/><BusinessInfo className={s.sidebarBusiness}/></div></aside>}
      <main id="page-content" {...interactionProps} aria-busy={!ready||undefined} className={`${s.main} ${auth?s.authMain:''} ${active==='creator'||active==='me'&&signedIn&&!model.account.route.profileTab?s.flushMain:''}`}>{children}</main>
    </div>
    {!auth&&<CommentDock/>}
    {!auth&&<nav className={s.bottomNav} aria-label="하단 메뉴">{menu.map(item=><Link key={item.id} aria-current={active===item.id?'page':undefined} href={`${basePath}/${item.id}`} aria-label={menuLabel(item)}>{item.id==='me'?<NavigationAvatar person={signedIn?viewer:undefined} active={active===item.id}/>:item.id==='notifications'||item.id==='messages'?<span className={s.bell}><NavigationIcon name={item.icon} active={active===item.id}/><UnreadBadge count={counts[item.id]}/></span>:<NavigationIcon name={item.icon} active={active===item.id}/>}</Link>)}</nav>}
  </div></CommentDockProvider>;
}
