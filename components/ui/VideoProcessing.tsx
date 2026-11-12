import type {ReactNode} from 'react';
import s from './media-video.module.css';

/** The same server processing state, sized for media, upload tiles and studio rows. kind='image': a photo still being
 * watermarked after posting (2026-11-13), shown with the same placeholder instead of disappearing. */
export function VideoProcessing({variant='media',className='',label,kind='video',children}:{variant?:'media'|'upload'|'thumbnail'|'badge';className?:string;label?:string;kind?:'video'|'image';children?:ReactNode}){
 const image=kind==='image',state=image?'사진 처리 중':'영상 최적화 중';
 const icon=image?<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>:<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="13" height="14" rx="3"/><path d="m15 10 7-4v12l-7-4"/></svg>;
 const spinner=<span className={s.spinner} aria-hidden="true"/>;
 return <span className={`${s.processing} ${s[variant]} ${className}`} data-video-processing={variant} data-preview={children?true:undefined} role={variant==='thumbnail'?'img':'status'} aria-label={label?`${label} · ${state}`:variant==='upload'||variant==='thumbnail'?state:undefined}>
  {children?<span className={s.preview} aria-hidden="true">{children}</span>:variant!=='badge'&&<span className={s.symbol} aria-hidden="true">{icon}{variant==='media'&&spinner}</span>}
  {(variant==='badge'||variant==='upload')&&spinner}
  {variant==='media'&&<><strong className={s.title}>{state}</strong><span className={s.description}>{image?'완료되면 사진이 자동으로 나타나요.':'완료되면 영상을 볼 수 있어요.'}</span></>}
  {variant==='badge'&&<span>{image?'처리 중':'최적화 중'}</span>}
 </span>;
}
