"use client";
import {useEffect,useRef,useState} from 'react';
import type {SocialReply} from '@/types/crefans-social';
import type {CommentContextValue} from './CommentMention';
import Icon from './Icon';
import s from './social.module.css';

export function CommentLikeButton({comment,readOnly=false,onLike}:{comment:SocialReply;readOnly?:boolean;onLike?:CommentContextValue['onLike']}){
 const [value,setValue]=useState({liked:!!comment.liked,likes:comment.likes||0}),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const pending=useRef(false);
 useEffect(()=>{setValue({liked:!!comment.liked,likes:comment.likes||0});},[comment.id,comment.liked,comment.likes]);
 async function toggle(){
  if(!onLike||readOnly||pending.current)return;pending.current=true;setBusy(true);setError('');
  try{const result=await onLike(comment.id,!value.liked);if(result.success)setValue(result.data);else setError(result.errorMessage);}
  catch{setError('좋아요를 저장하지 못했어요. 다시 시도해주세요.');}
  finally{pending.current=false;setBusy(false);}
 }
 return <span className={s.commentLikeWrap}><button type="button" className={`${s.commentLike} ${value.liked?s.liked:''}`} aria-label={value.liked?'댓글 좋아요 취소':'댓글 좋아요'} aria-pressed={value.liked} disabled={readOnly||!onLike||busy} aria-busy={busy} onClick={()=>void toggle()}><Icon name="heart" width="15" height="15"/><span>{value.likes.toLocaleString()}</span></button>{error&&<span role="alert" className={s.commentLikeError}>{error}</span>}</span>;
}
