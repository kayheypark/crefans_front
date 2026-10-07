import type {ReactNode} from 'react';
import {Brand} from '../crefans/Brand';
import s from './shell.module.css';
export type NavItem={id:string;label:string;icon:ReactNode};
export function AppShell({children,items,active,onNavigate,homeHref='/'}:{children:ReactNode;items:NavItem[];active:string;onNavigate:(id:string)=>void;homeHref?:string}) {
  return <div className={s.shell}><header className={s.header}><Brand href={homeHref}/><span>새로운 디자인 라이브러리</span><a href={homeHref}>서비스 보기 ↗</a></header><nav className={s.navigation} aria-label="디자인 라이브러리 탐색">{items.map(item=><button key={item.id} type="button" onClick={()=>onNavigate(item.id)} aria-current={active===item.id?'page':undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}</nav><main className={s.main}>{children}</main></div>;
}
