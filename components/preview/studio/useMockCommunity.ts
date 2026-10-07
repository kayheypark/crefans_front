'use client';

import {useState} from 'react';
import type {StudioCommunityModel,CommunityComment,CommunityPost} from '@/types/crefans-community';
import type {InboxContact,SocialActionResult,SocialMessage} from '@/types/crefans-social';
import {messyCommentThreads,toCommunityComments} from '../comment-fixtures';

const sampleFans:InboxContact[]=[{id:'fan-jimin',name:'팬지민',image:'/illustrations/redesign/yerin.png'},{id:'fan-minseo',name:'민서',image:'/illustrations/redesign/jiwoo.png'},{id:'fan-yuna',name:'유나',image:'/illustrations/redesign/seoyeon.png'}];
const samplePosts:CommunityPost[]=[{id:'morning',title:'오늘도 좋은 하루였어요'},{id:'behind',title:'우리만의 비하인드 이야기'}];
const ok=(message:string):SocialActionResult=>({success:true,data:{message},errorMessage:null,errorCode:null});
const fail=(errorMessage:string,errorCode='VALIDATION_ERROR'):SocialActionResult=>({success:false,data:null,errorMessage,errorCode});

type Options={today?:string;creatorName?:string;creatorImage?:string;posts?:CommunityPost[];fans?:InboxContact[]};
export function useMockCommunity({today='2026-09-12',posts=samplePosts,fans=sampleFans}:Options={}):StudioCommunityModel{
  const [messages,setMessages]=useState<Record<string,SocialMessage[]>>(()=>Object.fromEntries(fans.map((fan,index)=>[fan.id,[{id:index+1,mine:false,body:index===0?'새로운 게시물 잘 봤어요. 다음 이야기도 기다릴게요!':'오늘도 좋은 하루 보내세요!',time:'오후 2:30'}]])));
  const [blocked,setBlocked]=useState<string[]>([]);
  // First post gets a messy 37-thread pile (paging, long bodies, replies, mass mentions); the rest stay empty on purpose.
  const [comments,setComments]=useState<CommunityComment[]>(()=>posts.flatMap((post,index)=>index===0?toCommunityComments(post.id,messyCommentThreads(post.id,37)):[]));
  const sendMessage=async(id:string,body:string)=>{if(!fans.some(fan=>fan.id===id))return fail('대화 상대를 찾을 수 없어요.','NOT_FOUND');if(blocked.includes(id))return fail('차단된 대화입니다.','BLOCKED');if(!body.trim()||body.trim().length>2000)return fail('메시지를 1자 이상 2,000자 이하로 입력해 주세요.');setMessages(previous=>({...previous,[id]:[...(previous[id]||[]),{id:Date.now(),mine:true,body:body.trim(),time:'방금',statusLabel:'전송됨'}]}));return ok('메시지를 전송했습니다.');};
  const setConversationBlocked=async(id:string,value:boolean)=>{if(!fans.some(fan=>fan.id===id))return fail('대화 상대를 찾을 수 없어요.','NOT_FOUND');setBlocked(previous=>value?Array.from(new Set([...previous,id])):previous.filter(item=>item!==id));return ok(value?'대화를 차단했습니다.':'차단을 해제했습니다.');};
  return {
    inbox:{data:{creators:fans},messagesByCreator:messages,blockedCreatorIds:blocked,conversationLabels:Object.fromEntries(fans.map(fan=>[fan.id,today.replaceAll('-','.')])),contactRoleLabel:'팬',socialCopy:{reportDescription:'이 대화를 신고할까요?',blockDescription:'이 팬에게 메시지를 보내지 못하도록 대화를 차단합니다. 언제든 차단을 해제할 수 있습니다.'},sendMessage,setConversationBlocked,reportConversation:async id=>fans.some(fan=>fan.id===id)?ok('신고가 접수되었습니다.'):fail('대화 상대를 찾을 수 없어요.','NOT_FOUND')},
    posts,comments,visibilityGuidance:'',
    replyToComment:async(id,body)=>{if(!comments.some(comment=>comment.id===id))return fail('댓글을 찾을 수 없어요.','NOT_FOUND');if(!body.trim()||body.trim().length>1000)return fail('답글을 1자 이상 1,000자 이하로 입력해 주세요.');setComments(previous=>previous.map(comment=>comment.id===id?{...comment,replies:[...comment.replies,{id:crypto.randomUUID(),body:body.trim(),time:'방금'}]}:comment));return ok('답글이 등록되었습니다.');},
    setCommentHidden:async(id,hidden)=>{if(!comments.some(comment=>comment.id===id))return fail('댓글을 찾을 수 없어요.','NOT_FOUND');setComments(previous=>previous.map(comment=>comment.id===id?{...comment,hidden}:comment));return ok(hidden?'댓글을 숨겼습니다.':'댓글 숨김을 해제했습니다.');},
  };
}
