import {BusinessInfo} from './BusinessInfo';
import {ServiceLinks} from './ServiceLinks';
import s from './service-footer.module.css';

/** Service links and operator details under page content on mobile, where there is no sidebar. `always` keeps the links on PC too (empty home feed); operator details stay mobile-only. */
export function ServiceFooter({basePath,always=false}:{basePath:string;always?:boolean}){
  return <footer className={s.footer} data-always={always||undefined}><nav aria-label="서비스 안내"><ServiceLinks basePath={basePath} motionControl={false}/></nav><BusinessInfo className={s.business}/></footer>;
}
