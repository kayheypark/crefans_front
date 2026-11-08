import type {ReactNode} from 'react';
import {BusinessInfo} from './BusinessInfo';
import {ServiceLinks} from './ServiceLinks';
import s from './service-footer.module.css';

/** Service links and operator details under page content on mobile, where there is no sidebar. `always` keeps the links on PC too (empty home feed); operator details stay mobile-only unless `business` (landing, 2026-11-08). */
export function ServiceFooter({basePath,always=false,business=false,children}:{basePath:string;always?:boolean;business?:boolean;children?:ReactNode}){
  // `children` sits below everything else in the footer (2026-11-07: settings puts 로그아웃 there; other pages pass nothing).
  return <footer className={s.footer} data-always={always||undefined} data-business={business||undefined}><nav aria-label="서비스 안내"><ServiceLinks basePath={basePath} motionControl={false}/></nav><BusinessInfo className={s.business}/>{children&&<div className={s.bottom}>{children}</div>}</footer>;
}
