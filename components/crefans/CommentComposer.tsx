'use client';
import {createContext,useCallback,useContext,useEffect,useId,useRef,useState,type FormEvent,type ReactNode,type RefObject} from 'react';
import {createPortal} from 'react-dom';
import Icon from './Icon';
import {TextAreaField} from '@/components/ui/Primitives';
import {Action} from './ServiceUI';
import s from './social.module.css';

type Dock={host:HTMLDivElement|null;active?:string;select:(id:string)=>void;remove:(id:string)=>void;setHost:(host:HTMLDivElement|null)=>void};
const CommentDockContext=createContext<Dock|null>(null);

/** The shell and gallery each own one dock, outside their scrolling content. */
export function CommentDockProvider({children,viewportRef}:{children:ReactNode;viewportRef:RefObject<HTMLDivElement>}){
  const [host,setHost]=useState<HTMLDivElement|null>(null),[ids,setIds]=useState<string[]>([]);
  const select=useCallback((id:string)=>setIds(current=>current.at(-1)===id?current:[...current.filter(item=>item!==id),id]),[]);
  const remove=useCallback((id:string)=>setIds(current=>current.filter(item=>item!==id)),[]);
  useEffect(()=>{
    if(typeof window==='undefined')return;
    const root=viewportRef.current,viewport=window.visualViewport;
    if(!root||!host||!viewport)return;
    let frame=0;
    const reset=()=>{root.style.removeProperty('--comment-visible-height');root.removeAttribute('data-comment-keyboard');};
    const update=()=>{
      // A software keyboard can shrink only the visual viewport on iOS.
      const focused=host.contains(document.activeElement);
      if(!focused||!window.matchMedia('(max-width:767px)').matches||viewport.scale!==1||window.innerHeight-viewport.height<80){reset();return;}
      root.style.setProperty('--comment-visible-height',`${Math.max(0,viewport.height+viewport.offsetTop-root.getBoundingClientRect().top)}px`);
      root.setAttribute('data-comment-keyboard','true');
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
    viewport.addEventListener('resize',schedule);viewport.addEventListener('scroll',schedule);
    window.addEventListener('resize',schedule);document.addEventListener('focusin',schedule);document.addEventListener('focusout',schedule);
    return()=>{cancelAnimationFrame(frame);reset();viewport.removeEventListener('resize',schedule);viewport.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('focusin',schedule);document.removeEventListener('focusout',schedule);};
  },[host,viewportRef]);
  return <CommentDockContext.Provider value={{host,active:ids.at(-1),select,remove,setHost}}>{children}</CommentDockContext.Provider>;
}

export function CommentDock({gallery=false}:{gallery?:boolean}){
  const dock=useContext(CommentDockContext);
  return <div ref={dock?.setHost} className={s.commentDock} data-comment-dock data-gallery={gallery||undefined}/>;
}

/** Desktop keeps the textarea; mobile moves the same draft/actions into its dock. */
export function CommentComposer({postId,title,value,error,pending,readOnly,onChange,onSubmit,onClose}:{postId:string;title:string;value:string;error:string;pending:boolean;readOnly:boolean;onChange:(value:string)=>void;onSubmit:(event:FormEvent)=>void;onClose?:()=>void}){
  const dock=useContext(CommentDockContext),id=useId(),input=useRef<HTMLInputElement>(null),composing=useRef(false);
  const select=dock?.select,remove=dock?.remove;
  useEffect(()=>{
    if(readOnly||!select||!remove)return;
    select(id);return()=>remove(id);
  },[id,postId,readOnly,select,remove]);
  const available=!!dock?.host&&!readOnly,active=available&&dock.active===id;
  return <>
    <div className={available?s.desktopCommentComposer:undefined}><form onSubmit={onSubmit} className={s.commentForm}><TextAreaField label="댓글 남기기" id={`post-comment-${id}`} value={value} onChange={event=>{if(!readOnly)onChange(event.target.value);}} placeholder="따뜻한 이야기를 남겨주세요" maxLength={1000} readOnly={readOnly} disabled={pending} error={error||undefined}/><Action type="submit" disabled={pending||readOnly||!value.trim()}>{pending?'등록 중...':'등록'}</Action></form></div>
    {available&&<button type="button" className={s.commentWrite} onClick={()=>{select?.(id);requestAnimationFrame(()=>input.current?.focus());}}>댓글 쓰기</button>}
    {active&&createPortal(<form className={s.mobileCommentForm} data-closable={onClose?true:undefined} data-comment-post={postId} aria-label={`${title} 댓글 입력`} onSubmit={event=>{if(composing.current){event.preventDefault();return;}onSubmit(event);}}>
      {error&&<p id={`${id}-error`} className={s.error} role="alert">{error}</p>}
      <div className={s.commentInputRow}>
        {onClose&&<button type="button" className={s.commentClose} aria-label="댓글 닫기" aria-controls={`comments-${postId}`} onClick={()=>{input.current?.blur();onClose();}}><Icon name="close"/></button>}
        <input ref={input} type="text" aria-label="댓글 남기기" placeholder="댓글 남기기…" value={value} maxLength={1000} readOnly={pending} aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined} enterKeyHint="send" onChange={event=>onChange(event.target.value)} onCompositionStart={()=>{composing.current=true;}} onCompositionEnd={()=>{composing.current=false;}} onKeyDown={event=>{if(event.key==='Enter'&&(composing.current||event.nativeEvent.isComposing||event.keyCode===229))event.preventDefault();}}/>
        <button type="submit" aria-label={pending?'댓글 등록 중':'댓글 등록'} disabled={pending||!value.trim()}><Icon name="arrowUp"/></button>
      </div>
    </form>,dock.host!)}
  </>;
}
