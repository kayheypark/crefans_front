'use client';

import {useState} from 'react';
import type {ApiResult,ServiceData,ServiceViewModel,Viewer} from '@/types/crefans';
import type {SocialActionResult,SocialComment,SocialMessage,SocialModel,SocialReply} from '@/types/crefans-social';

type Options={data:ServiceData;viewer:Viewer;canAccess:ServiceViewModel['canAccess'];today:string;liked?:string[];initialComments?:Record<string,SocialComment[]>;initialReplies?:Record<string,SocialReply[]>;replyDelay?:number};
const success=(message:string):SocialActionResult=>({success:true,data:{message},errorMessage:null,errorCode:null});
const failure=(errorMessage:string,errorCode:string):SocialActionResult=>({success:false,data:null,errorMessage,errorCode});

/** Mock adapter only. Real adapters supply the same state/actions to the shared views. */
export function useMockSocial({data,viewer,canAccess,today,liked=[],initialComments={},initialReplies={},replyDelay=400}:Options):SocialModel{
  const [commentsByPost,setComments]=useState(initialComments);
  const [commentCounts,setCommentCounts]=useState<Record<string,number>>(()=>Object.fromEntries(data.posts.map(post=>[post.id,post.comments])));
  const [messagesByCreator,setMessages]=useState<Record<string,SocialMessage[]>>(()=>Object.fromEntries(Object.entries(data.messages).map(([id,messages])=>[id,messages.map(message=>({...message,statusLabel:message.mine?'전송됨':undefined}))])));
  const [blockedCreatorIds,setBlocked]=useState<string[]>([]),[read,setRead]=useState<string[]>([]);
  const markRead=(ids:string[])=>{const valid=ids.filter(id=>data.notifications.some(item=>item.id===id));setRead(previous=>Array.from(new Set([...previous,...valid])));};
  const addComment=async(postId:string,body:string):Promise<SocialActionResult>=>{
    const post=data.posts.find(item=>item.id===postId),text=body.trim();
    if(!post)return failure('게시물을 찾을 수 없어요.','POST_NOT_FOUND');
    if(!canAccess(post.creatorId,post.requiredRank,post.requiredPlanId))return failure('댓글을 작성할 수 있는 멤버십을 확인해 주세요.','ACCESS_DENIED');
    if(!text||text.length>1000)return failure('댓글은 1자 이상 1,000자 이하로 입력해 주세요.','INVALID_COMMENT');
    const comment:SocialComment={id:`comment-${Date.now()}`,author:{name:viewer.name,image:viewer.image},body:text,time:'방금'};
    setComments(previous=>({...previous,[postId]:[...(previous[postId]||[]),comment]}));
    setCommentCounts(previous=>({...previous,[postId]:(previous[postId]??post.comments)+1}));
    return success('댓글을 등록했어요.');
  };
  /** Replies are loaded per comment, like a paged API, so the list never ships every depth at once. */
  const loadReplies=async(postId:string,commentId:string):Promise<ApiResult<SocialReply[]>>=>{
    const comment=(commentsByPost[postId]||[]).find(item=>item.id===commentId);
    if(!comment)return {success:false,data:null,errorMessage:'댓글을 찾을 수 없어요.',errorCode:'COMMENT_NOT_FOUND'};
    await new Promise(resolve=>setTimeout(resolve,replyDelay));
    return {success:true,data:initialReplies[commentId]||[],errorMessage:null,errorCode:null};
  };
  const sendMessage=async(creatorId:string,body:string):Promise<SocialActionResult>=>{
    if(!data.creators.some(item=>item.id===creatorId))return failure('대화 상대를 찾을 수 없어요.','CREATOR_NOT_FOUND');
    if(blockedCreatorIds.includes(creatorId))return failure('차단한 사용자에게 메시지를 보낼 수 없어요.','CREATOR_BLOCKED');
    const text=body.trim();
    if(!text||text.length>2000)return failure('메시지는 1자 이상 2,000자 이하로 입력해 주세요.','INVALID_MESSAGE');
    const message:SocialMessage={id:Date.now(),body:text,mine:true,time:new Date().toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit'}),statusLabel:'전송됨'};
    setMessages(previous=>({...previous,[creatorId]:[...(previous[creatorId]||[]),message]}));
    return success('메시지를 보냈어요.');
  };
  const setConversationBlocked=async(creatorId:string,blocked:boolean):Promise<SocialActionResult>=>{
    const creator=data.creators.find(item=>item.id===creatorId);
    if(!creator)return failure('대화 상대를 찾을 수 없어요.','CREATOR_NOT_FOUND');
    setBlocked(previous=>blocked?Array.from(new Set([...previous,creatorId])):previous.filter(id=>id!==creatorId));
    return success(blocked?`${creator.name}님을 차단했어요.`:'차단을 해제했어요.');
  };
  const reportPost=async(postId:string):Promise<SocialActionResult>=>data.posts.some(item=>item.id===postId)?success('신고를 접수했어요. 검토 후 안내드릴게요.'):failure('게시물을 찾을 수 없어요.','POST_NOT_FOUND');
  const reportConversation=async(creatorId:string):Promise<SocialActionResult>=>data.creators.some(item=>item.id===creatorId)?success('신고를 접수했어요.'):failure('대화 상대를 찾을 수 없어요.','CREATOR_NOT_FOUND');
  return {commentsByPost,commentCounts,reportPost,loadReplies,likeCounts:Object.fromEntries(data.posts.map(post=>[post.id,post.likes+(liked.includes(post.id)?1:0)])),messagesByCreator,blockedCreatorIds,read,markRead,addComment,sendMessage,setConversationBlocked,reportConversation,
    conversationLabels:Object.fromEntries(Object.keys(messagesByCreator).map(id=>[id,today.replaceAll('-','.')])),
    socialCopy:{reportDescription:'이 대화를 신고할까요?',blockDescription:'차단하면 이 대화에서 새 메시지를 보낼 수 없어요. 대화 옵션에서 언제든 해제할 수 있습니다.'}};
}
