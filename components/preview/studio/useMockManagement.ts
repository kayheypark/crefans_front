'use client';

import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import type {ApiResult} from '@/types/crefans';
import type {StudioManagementModel,StudioContent,StudioContentStatus,StudioMembership,StudioSubscriber} from '@/types/crefans-studio-management';
import {managementContents,managementMemberships,managementSubscribers,managementNow} from './management-fixtures';
import {canDeleteMembership} from '@/lib/crefans/membership-plans';
import {mediaUploadMaxItems} from '@/lib/design/image-upload';
import {useLocalImages} from './useLocalImages';

const ok=<T,>(data:T):ApiResult<T>=>({success:true,data,errorMessage:null,errorCode:null});
const fail=<T,>(errorMessage:string):ApiResult<T>=>({success:false,data:null,errorMessage,errorCode:'VALIDATION_ERROR'});
const validMedia=(url:string)=>!url||/^\/(?!\/)/.test(url)||/^https?:\/\//i.test(url);

export function useMockManagement({getProtectedPlanIds=()=>[]}:{getProtectedPlanIds?:()=>string[]}={}):StudioManagementModel{
  const query=useSearchParams();
  const [contents,setContents]=useState<StudioContent[]>(()=>managementContents.map(item=>({...item})));
  const [memberships,setMemberships]=useState<StudioMembership[]>(()=>managementMemberships.map(item=>({...item,benefits:[...item.benefits]})));
  const [deletedIds,setDeletedIds]=useState<string[]>([]);
  const images=useLocalImages();
  const [subscribers]=useState<StudioSubscriber[]>(()=>managementSubscribers.map(item=>({...item,planSnapshot:{...item.planSnapshot,benefits:[...item.planSnapshot.benefits]}})));
  const requestedStatus=query.get('status');
  const selectedContentStatus=requestedStatus&&['draft','published','scheduled'].includes(requestedStatus)?requestedStatus as StudioContentStatus:undefined;
  const canDelete=(id:string)=>canDeleteMembership(id,subscribers,managementNow)&&!getProtectedPlanIds().includes(id);
  return {now:managementNow,contents,memberships:memberships.filter(item=>!deletedIds.includes(item.id)).map(item=>({...item,canDelete:canDelete(item.id)})),subscribers,selectedContentStatus,selectedSubscriberPlanId:query.get('plan')||undefined,selectedSubscriberId:query.get('member')||undefined,notice:'',actions:{
    saveContent:async input=>{
      if(input.id&&!contents.some(item=>item.id===input.id))return fail('게시물을 찾을 수 없습니다.');
      if(!input.title.trim())return fail('제목을 입력해주세요.');
      if(input.status!=='draft'&&!input.body.trim())return fail('게시할 내용을 입력해주세요.');
      const media=input.media.map(item=>({...item,url:item.url.trim()}));
      if(media.length>mediaUploadMaxItems)return fail(`미디어는 최대 ${mediaUploadMaxItems}개까지 추가할 수 있어요.`);
      if(media.some(item=>!item.url||(item.type!=='image'&&item.type!=='video')||(!validMedia(item.url)&&!images.owns(item.url))))return fail('미디어를 다시 선택해주세요.');
      if(input.accessPlanId&&!memberships.some(item=>item.id===input.accessPlanId))return fail('공개 범위의 멤버십을 다시 선택해주세요.');
      if(input.status==='scheduled'&&(!input.scheduledAt||!Number.isFinite(Date.parse(input.scheduledAt))||Date.parse(input.scheduledAt)<=Date.parse(managementNow)))return fail('예약 시각을 현재보다 미래로 선택해주세요.');
      const id=input.id||crypto.randomUUID();
      const next:StudioContent={...input,id,title:input.title.trim(),body:input.body.trim(),media,scheduledAt:input.status==='scheduled'?input.scheduledAt:null,updatedAt:managementNow};
      media.forEach(item=>images.retain(item.url));
      setContents(previous=>input.id?previous.map(item=>item.id===id?next:item):[next,...previous]);
      return ok({id,message:input.status==='draft'?'임시저장되었습니다.':input.status==='scheduled'?'게시 예약이 설정되었습니다.':'게시되었습니다.'});
    },
    deleteContent:async id=>{if(!contents.some(item=>item.id===id))return fail('게시물을 찾을 수 없습니다.');setContents(previous=>previous.filter(item=>item.id!==id));return ok({message:'게시물이 삭제되었습니다.'});},
    saveMembership:async input=>{
      if(input.id&&(!memberships.some(item=>item.id===input.id)||deletedIds.includes(input.id)))return fail('멤버십을 찾을 수 없습니다.');
      if(!input.name.trim())return fail('멤버십 이름을 입력해주세요.');
      if(!Number.isSafeInteger(input.price)||input.price<=0)return fail('월 구독료를 0보다 큰 정수로 입력해주세요.');
      const benefits=input.benefits.map(item=>item.trim()).filter(Boolean);if(!benefits.length)return fail('혜택을 하나 이상 입력해주세요.');
      const previous=memberships.find(item=>item.id===input.id),id=input.id||crypto.randomUUID();
      const image=input.image===undefined?previous?.image:input.image.trim();
      if(image&&!validMedia(image)&&!images.owns(image))return fail('이미지를 다시 선택해주세요.');
      const next:StudioMembership={id,name:input.name.trim(),price:input.price,benefits,image:image||undefined,active:previous?.active??true,version:(previous?.version||0)+1};
      images.retain(image);
      setMemberships(items=>input.id?items.map(item=>item.id===id?next:item):[...items,next]);
      return ok({id,message:previous?'신규 구독에 적용할 멤버십이 수정되었습니다. 기존 구독 조건은 유지됩니다.':'새 멤버십이 만들어졌습니다.'});
    },
    uploadMembershipImage:images.upload,
    discardMembershipImage:images.discard,
    uploadContentMedia:images.uploadMedia,
    discardContentMedia:images.discard,
    deleteMembership:async id=>{
      if(!memberships.some(item=>item.id===id)||deletedIds.includes(id))return fail('멤버십을 찾을 수 없습니다.');
      if(!canDelete(id))return fail('이용 중인 구독자가 있어 삭제할 수 없습니다. 멤버십 비활성화를 이용해 주세요.');
      setDeletedIds(previous=>[...previous,id]);
      return ok({message:'멤버십을 판매 목록에서 삭제했습니다. 기존 구독 기록과 가입 당시 조건은 유지됩니다.'});
    },
    setMembershipActive:async(id,active)=>{if(!memberships.some(item=>item.id===id)||deletedIds.includes(id))return fail('멤버십을 찾을 수 없습니다.');setMemberships(items=>items.map(item=>item.id===id?{...item,active}:item));return ok({message:active?'멤버십을 공개하고 신규 가입을 다시 받습니다.':'멤버십을 숨기고 신규 가입을 중단했습니다. 기존 구독자의 계약과 이용 권한은 유지됩니다.'});},
  }};
}
