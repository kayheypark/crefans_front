'use client';
import {useState,type FormEvent} from 'react';
import type {CommunityReply} from '@/types/crefans-community';
import type {SocialActionResult} from '@/types/crefans-social';
import {Dialog,TextAreaField} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import {Action,Avatar} from '../ServiceUI';
import {CreatorName} from '../CreatorName';
import {CommentMentions} from '../CommentMentions';
import s from './community.module.css';

type Props={reply:CommunityReply;onEdit:(body:string)=>Promise<SocialActionResult>;onDelete:()=>Promise<SocialActionResult>;onFeedback?:(message:string)=>void};
export function StudioCommentReply({reply,onEdit,onDelete,onFeedback}:Props){
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState(reply.body),[deleting,setDeleting]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState('');
 async function save(event:FormEvent){event.preventDefault();const body=draft.trim();if(pending||!body||body.length>1000||body===reply.body)return;setPending(true);setError('');try{const result=await onEdit(body);if(result.success){setEditing(false);onFeedback?.(result.data.message);}else setError(result.errorMessage);}catch{setError('답글을 수정하지 못했어요. 다시 시도해 주세요.');}finally{setPending(false);}}
 async function remove(){if(pending)return;setPending(true);setError('');try{const result=await onDelete();if(result.success){setDeleting(false);onFeedback?.(result.data.message);}else setError(result.errorMessage);}catch{setError('답글을 삭제하지 못했어요. 다시 시도해 주세요.');}finally{setPending(false);}}
 return <div className={s.reply} data-fan={!reply.fromCreator||undefined} role="group" aria-label={`${reply.author.name}의 답글`}>
  <div className={s.replyAuthor}><Avatar creator={reply.author} size={32}/><div className={s.replyIdentity}><strong><CreatorName person={reply.author}/></strong>{reply.fromCreator&&<span className={s.creatorBadge}>작성자</span>}<small>{reply.time}</small></div></div>
  <CommentMentions mentions={reply.mentions}/>
  {editing?<form className={s.replyForm} onSubmit={event=>void save(event)}><TextAreaField label="답글 수정" id={`edit-reply-${reply.id}`} value={draft} maxLength={1000} disabled={pending} onChange={event=>setDraft(event.target.value)}/><DialogActions><Action variant="secondary" disabled={pending} onClick={()=>{setEditing(false);setError('');}}>취소</Action><Action type="submit" disabled={pending||!draft.trim()||draft.trim().length>1000||draft.trim()===reply.body}>{pending?'저장 중...':'저장'}</Action></DialogActions></form>:<p>{reply.body}</p>}
  {reply.fromCreator&&!editing&&<div className={s.commentActions}><button type="button" disabled={pending} onClick={()=>{setDraft(reply.body);setEditing(true);setError('');}}>수정</button><button type="button" disabled={pending} onClick={()=>{setDeleting(true);setError('');}}>삭제</button></div>}
  {error&&!deleting&&<p className={s.error} role="alert">{error}</p>}
  <Dialog open={deleting} onClose={()=>{if(!pending){setDeleting(false);setError('');}}} title="답글을 삭제할까요?"><p>삭제한 답글은 복구할 수 없습니다.</p>{error&&<p className={s.error} role="alert">{error}</p>}<DialogActions style={{marginTop:22}}><Action variant="secondary" disabled={pending} onClick={()=>{setDeleting(false);setError('');}}>취소</Action><Action variant="danger" disabled={pending} onClick={()=>void remove()}>{pending?'삭제 중...':'삭제'}</Action></DialogActions></Dialog>
 </div>;
}
