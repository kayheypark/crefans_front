'use client';
import {useEffect,useRef} from 'react';
import {Dialog} from '@/components/ui/Primitives';
import {usePostShare} from '@/features/post-share/usePostShare';
import Icon from './Icon';
import Image from 'next/image';
import s from './post-share-dialog.module.css';

type ShareState=ReturnType<typeof usePostShare>;
/** Shared by the service, previews and the design-system's injected state examples. */
export function ShareDialog({open,onClose,title,state}:{open:boolean;onClose:()=>void;title:string;state:ShareState}){
 const link=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(open&&state.manualCopy){link.current?.focus();link.current?.select();}},[open,state.manualCopy]);
 return <Dialog open={open} onClose={onClose} title="게시물 공유" sheet>
  <div className={s.content}>
   <p className={s.title}>{title}</p>
   <div className={s.actions} aria-label="공유 방법">
    <button type="button" disabled={state.pending||!state.url} onClick={()=>void state.copy()}><span className={s.icon}><Icon name="copy"/></span><span>복사</span></button>
    <button type="button" disabled={state.pending||state.kakao!=='ready'} onClick={()=>void state.shareKakao()}><span className={s.icon}><Image src="/brand/kakaotalk-share-official.png" alt="" width={52} height={52} draggable={false}/></span><span>카카오톡</span></button>
    <button type="button" disabled={state.pending||!state.nativeSupported} onClick={()=>void state.shareMore()}><span className={s.icon}><Icon name="share"/></span><span>더보기</span></button>
   </div>
   {state.kakao==='unavailable'&&<p className={s.hint}>카카오톡 공유는 준비 중이에요.</p>}
   {state.kakao==='loading'&&<p className={s.hint} role="status">카카오톡 공유를 준비하고 있어요.</p>}
   {state.kakao==='error'&&<p className={s.hint} role="alert">카카오톡 공유를 불러오지 못했어요. 공유창을 다시 열어 주세요.</p>}
   {!state.nativeSupported&&<p className={s.hint}>이 브라우저는 기기 공유를 지원하지 않아요. 복사를 이용해 주세요.</p>}
   {state.message&&<p className={s.message} role="status">{state.message}</p>}
   {state.error&&<p className={s.error} role="alert">{state.error}</p>}
   {state.manualCopy&&<label className={s.manual}>공유 링크<input ref={link} readOnly value={state.url} onFocus={event=>event.currentTarget.select()}/></label>}
  </div>
 </Dialog>;
}

export function PostShareDialog({open,onClose,basePath,postId,title}:{open:boolean;onClose:()=>void;basePath:string;postId:string;title:string}){
 const state=usePostShare({open,basePath,postId,title});
 return <ShareDialog open={open} onClose={onClose} title={title} state={state}/>;
}
