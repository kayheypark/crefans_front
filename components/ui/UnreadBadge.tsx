import s from './unread-badge.module.css';

/** The containing navigation link announces the full unread count. */
export function UnreadBadge({count}:{count:number}){
  if(count<=0)return null;
  return <span className={s.badge} aria-hidden="true">{count>99?'99+':count}</span>;
}
