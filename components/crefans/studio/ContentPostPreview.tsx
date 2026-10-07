'use client';

import {useState} from 'react';
import type {Plan,Post} from '@/types/crefans';
import type {StudioContent,StudioMembership} from '@/types/crefans-studio-management';
import {SelectField} from '@/components/ui/SelectField';
import {postCommentsAllowed} from '@/lib/crefans/comments';
import {PostDetailPage,type PostDetailModel} from '../SocialPages';
import {Empty,Notice} from '../ServiceUI';
import {PhoneFrame} from './PhoneFrame';
import s from './content-post-preview.module.css';

type Props={content:StudioContent;memberships:StudioMembership[];model?:PostDetailModel;creatorId?:string;commentsGloballyEnabled?:boolean};

export function draftPostModel({content,memberships,model,creatorId,commentsGloballyEnabled=true}:Props):PostDetailModel|null{
  if(!model)return null;
  const source=model.data.posts.find(post=>post.id===content.id&&(!creatorId||post.creatorId===creatorId));
  const creator=model.data.creators.find(item=>item.id===(creatorId||source?.creatorId));
  const selected=content.accessPlanId?memberships.find(plan=>plan.id===content.accessPlanId):undefined;
  if(!creator||content.accessPlanId&&!selected)return null;
  const priorPlan=(model.data.creatorPlans?.[creator.id]||model.data.plans).find(plan=>plan.id===selected?.id);
  const cover=content.media.find(item=>item.type==='image')?.url||'';
  const plans:Plan[]=selected?[{...selected,rank:priorPlan?.rank||1,available:selected.active,entitlementMode:priorPlan?.entitlementMode||(priorPlan?'tier':'exact')}]:[];
  const post:Post={
    id:content.id||'draft-preview',creatorId:creator.id,title:content.title,body:content.body,image:cover,media:content.media.map(item=>({type:item.type,url:item.url})),
    position:source?.image===cover?source.position:'center',likes:source?.likes??0,comments:source?.comments??0,
    requiredRank:plans[0]?.rank||0,requiredPlanId:selected?.id,commentsEnabled:postCommentsAllowed(commentsGloballyEnabled,content.commentsEnabled),time:source?.time||new Date(content.updatedAt).toLocaleString('ko-KR',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}),
  };
  return {...model,data:{creators:[creator],posts:[post],plans,creatorPlans:{[creator.id]:plans}},canAccess:()=>true,
    liked:source?model.liked:[],saved:source?model.saved:[],likeCounts:source?model.likeCounts:{},commentCounts:source?model.commentCounts:{},commentsByPost:source?model.commentsByPost:{},
  };
}

export function ContentPostPreview(props:Props){
  const [audience,setAudience]=useState('eligible');
  const model=draftPostModel(props),membersOnly=!!props.content.accessPlanId;
  if(!model)return <Empty title="미리보기 정보를 확인할 수 없어요" description="작성자와 선택한 멤버십 정보를 확인한 뒤 다시 열어 주세요."/>;
  return <div className={s.preview}>
    <div className={s.controls}>{membersOnly?<SelectField label="보는 사람" value={audience} onChange={setAudience} options={[{value:'eligible',label:'멤버십 이용 가능 팬'},{value:'locked',label:'해당 멤버십 미가입 팬'}]}/>:<p className={s.access}>전체 공개 · 모든 팬에게 본문과 미디어가 표시됩니다.</p>}</div>
    <PhoneFrame><PostDetailPage id={model.data.posts[0].id} model={model} readOnly forceLocked={membersOnly&&audience==='locked'}/></PhoneFrame>
    <Notice>좋아요·저장·댓글 작성과 페이지 이동은 미리보기에서 동작하지 않습니다.</Notice>
  </div>;
}
