'use client';

import {useRef,useState} from 'react';
import type {ApiResult,ServiceData,ServiceViewModel,Viewer} from '@/types/crefans';
import type {MentionCandidate,SocialActionResult,SocialComment,SocialMessage,SocialModel,SocialReply} from '@/types/crefans-social';

type Options={signedIn?:boolean;data:ServiceData;viewer:Viewer;canAccess:ServiceViewModel['canAccess'];today:string;liked?:string[];initialComments?:Record<string,SocialComment[]>;initialReplies?:Record<string,SocialReply[]>;replyDelay?:number};
const success=(message:string):SocialActionResult=>({success:true,data:{message},errorMessage:null,errorCode:null});
const failure=(errorMessage:string,errorCode:string):SocialActionResult=>({success:false,data:null,errorMessage,errorCode});

/** Mock adapter only. Real adapters supply the same state/actions to the shared views. */
export function useMockSocial({signedIn=true,data,viewer,canAccess,today,liked=[],initialComments={},initialReplies={},replyDelay=400}:Options):SocialModel{
  const [commentsByPost,setComments]=useState(initialComments);
  const [repliesByComment,setRepliesState]=useState(initialReplies);
  // loadReplies right after a reply/edit/delete must see the new list, not the render it was created in.
  const repliesRef=useRef(repliesByComment);
  const setReplies=(change:(previous:Record<string,SocialReply[]>)=>Record<string,SocialReply[]>)=>{repliesRef.current=change(repliesRef.current);setRepliesState(repliesRef.current);};
  const [commentCounts,setCommentCounts]=useState<Record<string,number>>(()=>Object.fromEntries(data.posts.map(post=>[post.id,post.comments])));
  const [messagesByCreator,setMessages]=useState<Record<string,SocialMessage[]>>(()=>Object.fromEntries(Object.entries(data.messages).map(([id,messages])=>[id,messages.map(message=>({...message,statusLabel:message.mine?'전송됨':undefined,...(message.mine?{read:true}:{})}))])));
  const [blockedCreatorIds,setBlocked]=useState<string[]>([]),[read,setRead]=useState<string[]>([]);
  const markRead=(ids:string[])=>{const valid=ids.filter(id=>data.notifications.some(item=>item.id===id));setRead(previous=>Array.from(new Set([...previous,...valid])));};
  const markConversationRead=async(id:string,ids:(string|number)[])=>{setMessages(previous=>({...previous,[id]:(previous[id]||[]).map(message=>!message.mine&&ids.includes(message.id)?{...message,unread:false}:message)}));return success('읽음 처리했습니다.');};
  const addComment=async(postId:string,body:string,parentId?:string):Promise<SocialActionResult>=>{
    const post=data.posts.find(item=>item.id===postId),text=body.trim();
    if(!post)return failure('게시물을 찾을 수 없어요.','POST_NOT_FOUND');
    if(!canAccess(post.creatorId,post.requiredRank,post.requiredPlanId))return failure('댓글을 작성할 수 있는 멤버십을 확인해 주세요.','ACCESS_DENIED');
    if(!text||text.length>1000)return failure('댓글은 1자 이상 1,000자 이하로 입력해 주세요.','INVALID_COMMENT');
    const tagged=(await mentionCandidates(postId)).filter(person=>text.includes('@'+person.name)).slice(0,10).map(person=>({id:data.creators.find(item=>item.name===person.name)?.id||person.name,name:person.name}));
    const comment:SocialComment={id:`comment-${Date.now()}`,author:{name:viewer.name,image:viewer.image,isVerified:viewer.isVerified,isFoundingMember:viewer.isFoundingMember},body:text,time:'방금',own:true,...(tagged.length?{mentions:tagged}:{})};
    // A reply goes under a live top-level comment only, like the API (INVALID_PARENT otherwise).
    if(parentId){
      const parent=(commentsByPost[postId]||[]).find(item=>item.id===parentId);
      if(!parent||parent.deleted)return failure('답글 대상이 올바르지 않습니다.','INVALID_PARENT');
      setReplies(previous=>({...previous,[parentId]:[...(previous[parentId]||[]),comment]}));
      setComments(previous=>({...previous,[postId]:(previous[postId]||[]).map(item=>item.id===parentId?{...item,replyCount:(item.replyCount||0)+1}:item)}));
    }else setComments(previous=>({...previous,[postId]:[...(previous[postId]||[]),comment]}));
    setCommentCounts(previous=>({...previous,[postId]:(previous[postId]??post.comments)+1}));
    return success('댓글을 등록했어요.');
  };
  /** Replies are loaded per comment, like a paged API, so the list never ships every depth at once. */
  const loadReplies=async(postId:string,commentId:string):Promise<ApiResult<SocialReply[]>>=>{
    const comment=(commentsByPost[postId]||[]).find(item=>item.id===commentId);
    if(!comment)return {success:false,data:null,errorMessage:'댓글을 찾을 수 없어요.',errorCode:'COMMENT_NOT_FOUND'};
    await new Promise(resolve=>setTimeout(resolve,replyDelay));
    return {success:true,data:repliesRef.current[commentId]||[],errorMessage:null,errorCode:null};
  };
  // Edit/delete only the viewer's own comment or reply, as the API does. A deleted comment with replies stays as a placeholder.
  const findOwn=(postId:string,commentId:string)=>{
    const top=(commentsByPost[postId]||[]).find(item=>item.id===commentId);
    if(top)return {item:top,parentId:null as string|null};
    const parentId=(commentsByPost[postId]||[]).find(item=>(repliesByComment[item.id]||[]).some(reply=>reply.id===commentId))?.id;
    return parentId?{item:repliesByComment[parentId].find(reply=>reply.id===commentId)!,parentId}:null;
  };
  const changeComment=(postId:string,commentId:string,parentId:string|null,change:(item:SocialReply)=>SocialReply|null)=>{
    if(parentId)setReplies(previous=>({...previous,[parentId]:(previous[parentId]||[]).flatMap(reply=>reply.id!==commentId?[reply]:change(reply)??[])}));
    else setComments(previous=>({...previous,[postId]:(previous[postId]||[]).flatMap(item=>item.id!==commentId?[item]:(change(item) as SocialComment|null)??[])}));
  };
  const editComment=async(postId:string,commentId:string,body:string):Promise<SocialActionResult>=>{
    const found=findOwn(postId,commentId),text=body.trim();
    if(!found||found.item.deleted)return failure('댓글을 찾을 수 없어요.','COMMENT_NOT_FOUND');
    if(!found.item.own)return failure('내가 쓴 댓글만 수정할 수 있어요.','NOT_COMMENT_AUTHOR');
    if(!text||text.length>1000)return failure('댓글은 1자 이상 1,000자 이하로 입력해 주세요.','INVALID_COMMENT');
    if(text!==found.item.body)changeComment(postId,commentId,found.parentId,item=>({...item,body:text,edited:true}));
    return success('댓글을 수정했어요.');
  };
  const deleteComment=async(postId:string,commentId:string):Promise<SocialActionResult>=>{
    const found=findOwn(postId,commentId);
    if(!found||found.item.deleted)return failure('댓글을 찾을 수 없어요.','COMMENT_NOT_FOUND');
    if(!found.item.own)return failure('내가 쓴 댓글만 삭제할 수 있어요.','NOT_COMMENT_AUTHOR');
    const keep=!found.parentId&&(repliesByComment[commentId]||[]).length>0;
    changeComment(postId,commentId,found.parentId,item=>keep?{...item,deleted:true,own:false,edited:false,body:'',author:{name:'',image:'',isVerified:false},mentions:[]}:null);
    if(found.parentId){const parentId=found.parentId;setComments(previous=>({...previous,[postId]:(previous[postId]||[]).map(item=>item.id===parentId?{...item,replyCount:Math.max(0,(item.replyCount||0)-1)}:item).filter(item=>!item.deleted||(item.replyCount||0)>0)}));}
    setCommentCounts(previous=>({...previous,[postId]:Math.max(0,(previous[postId]??0)-1)}));
    return success('댓글을 삭제했어요.');
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
  const reportPost=async(postId:string,_reason?:string):Promise<SocialActionResult>=>data.posts.some(item=>item.id===postId)?success('신고를 접수했어요. 검토 후 안내드릴게요.'):failure('게시물을 찾을 수 없어요.','POST_NOT_FOUND');
  const findComment=(commentId:string)=>[...Object.values(commentsByPost).flat(),...Object.values(repliesRef.current).flat()].find(item=>item.id===commentId&&!item.deleted);
  const reportComment=async(commentId:string,_reason?:string):Promise<SocialActionResult>=>findComment(commentId)?success('신고를 접수했어요. 검토 후 안내드릴게요.'):failure('댓글을 찾을 수 없어요.','NOT_FOUND');
  // Like the API: the post's creator and everyone with a visible comment on it, except the viewer.
  const mentionCandidates=async(postId:string):Promise<MentionCandidate[]>=>{
    const creator=data.creators.find(item=>item.id===data.posts.find(post=>post.id===postId)?.creatorId);
    const people=[...(creator?[creator]:[]),...(commentsByPost[postId]||[]).flatMap(comment=>[comment,...(repliesRef.current[comment.id]||[])]).filter(item=>!item.deleted).map(item=>item.author)];
    return people.filter((person,index)=>person.name!==viewer.name&&people.findIndex(other=>other.name===person.name)===index).map(person=>({name:person.name,image:person.image||''}));
  };
  const reportConversation=async(creatorId:string):Promise<SocialActionResult>=>data.creators.some(item=>item.id===creatorId)?success('신고를 접수했어요.'):failure('대화 상대를 찾을 수 없어요.','CREATOR_NOT_FOUND');
  const likeComment:NonNullable<SocialModel['likeComment']>=async(postId,commentId,enabled)=>{
    if(!signedIn)return{success:false,data:null,errorMessage:'로그인한 뒤 이용해주세요.',errorCode:'AUTH_REQUIRED'};
    const post=data.posts.find(item=>item.id===postId),parent=(commentsByPost[postId]||[]).find(c=>(repliesRef.current[c.id]||[]).some(reply=>reply.id===commentId));
    const comment=(commentsByPost[postId]||[]).find(c=>c.id===commentId)||(parent&&(repliesRef.current[parent.id]||[]).find(c=>c.id===commentId));
    if(!post||!canAccess(post.creatorId,post.requiredRank,post.requiredPlanId)||post.commentsEnabled===false)return{success:false,data:null,errorMessage:'게시물 이용 권한이 없습니다.',errorCode:'POST_ACCESS_DENIED'};
    if(!comment||comment.deleted)return{success:false,data:null,errorMessage:'댓글을 찾을 수 없어요.',errorCode:'COMMENT_NOT_FOUND'};
    const result={liked:enabled,likes:Math.max(0,(comment.likes||0)+(enabled===!!comment.liked?0:enabled?1:-1))};
    if(parent)setReplies(previous=>({...previous,[parent.id]:(previous[parent.id]||[]).map(c=>c.id===commentId?{...c,...result}:c)}));
    else setComments(previous=>({...previous,[postId]:(previous[postId]||[]).map(c=>c.id===commentId?{...c,...result}:c)}));
    return{success:true,data:result,errorMessage:null,errorCode:null};
  };
  return {likeComment,commentsByPost,commentCounts,reportPost,reportComment,mentionCandidates,loadReplies,likeCounts:Object.fromEntries(data.posts.map(post=>[post.id,post.likes+(liked.includes(post.id)?1:0)])),messagesByCreator,blockedCreatorIds,read,markRead,markConversationRead,addComment,editComment,deleteComment,sendMessage,setConversationBlocked,reportConversation,
    conversationLabels:Object.fromEntries(Object.keys(messagesByCreator).map(id=>[id,today.replaceAll('-','.')])),
    socialCopy:{reportDescription:'이 대화를 신고할까요?',blockDescription:'차단하면 이 대화에서 새 메시지를 보낼 수 없어요. 대화 옵션에서 언제든 해제할 수 있습니다.'}};
}
