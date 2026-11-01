import type {ReactNode} from 'react';
import s from './media-video.module.css';

/** The same server processing state, sized for media, upload tiles and studio rows. */
export function VideoProcessing({variant='media',className='',label,children}:{variant?:'media'|'upload'|'thumbnail'|'badge';className?:string;label?:string;children?:ReactNode}){
 const icon=<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="13" height="14" rx="3"/><path d="m15 10 7-4v12l-7-4"/></svg>;
 const spinner=<span className={s.spinner} aria-hidden="true"/>;
 return <span className={`${s.processing} ${s[variant]} ${className}`} data-video-processing={variant} data-preview={children?true:undefined} role={variant==='thumbnail'?'img':'status'} aria-label={label?`${label} · 영상 최적화 중`:variant==='upload'||variant==='thumbnail'?'영상 최적화 중':undefined}>
  {children?<span className={s.preview} aria-hidden="true">{children}</span>:variant!=='badge'&&<span className={s.symbol} aria-hidden="true">{icon}{variant==='media'&&spinner}</span>}
  {(variant==='badge'||variant==='upload')&&spinner}
  {variant==='media'&&<><strong className={s.title}>영상 최적화 중</strong><span className={s.description}>완료되면 영상을 볼 수 있어요.</span></>}
  {variant==='badge'&&<span>최적화 중</span>}
 </span>;
}
