import s from './loading-spinner.module.css';

/** `overlay` dims an existing list from above (the parent must be position:relative); `inline` is a small spinner inside a button or label; otherwise it sits in the flow below the table head. */
export function LoadingSpinner({overlay=false,inline=false}:{overlay?:boolean;inline?:boolean}){
  if(inline)return <span className={s.inline} role="status" aria-live="polite"><span className={`${s.spinner} ${s.small}`} aria-hidden="true"/><span className={s.label}>불러오는 중</span></span>;
  return <div className={overlay?s.overlay:s.block} role="status" aria-live="polite"><span className={s.spinner} aria-hidden="true"/><span className={s.label}>불러오는 중</span></div>;
}
