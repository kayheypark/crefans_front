'use client';

import {createMockPhotoLibrary} from '@/components/preview/studio/photo-library-fixtures';
import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import type {ApiResult} from '@/types/crefans';
import type {StudioManagementModel,StudioContent,StudioContentStatus,StudioMembership,StudioSubscriber} from '@/types/crefans-studio-management';
import {managementContents,managementMemberships,managementSubscribers,managementNow} from './management-fixtures';
import {creatorPayoutPolicy,type CreatorTerms} from '@/lib/crefans/creator-payout-policy';
import {canDeleteMembership} from '@/lib/crefans/membership-plans';
import {mediaUploadMaxItems} from '@/lib/design/image-upload';
import {useLocalImages} from './useLocalImages';
import {mockAiPhotoCrop,mockAiPhotoEdit} from './ai-photo-fixtures';
import {AI_PHOTO_DAILY_LIMIT} from '@/lib/crefans/ai-photo';

const ok=<T,>(data:T):ApiResult<T>=>({success:true,data,errorMessage:null,errorCode:null});
const fail=<T,>(errorMessage:string):ApiResult<T>=>({success:false,data:null,errorMessage,errorCode:'VALIDATION_ERROR'});
const validMedia=(url:string)=>!url||/^\/(?!\/)/.test(url)||/^https?:\/\//i.test(url);

export function useMockManagement({getProtectedPlanIds=()=>[],initialContents=managementContents,initialMemberships=managementMemberships,initialSubscribers=managementSubscribers}:{getProtectedPlanIds?:()=>string[];initialContents?:StudioContent[];initialMemberships?:StudioMembership[];initialSubscribers?:StudioSubscriber[]}={}):StudioManagementModel{
  const query=useSearchParams();
  const [contents,setContents]=useState<StudioContent[]>(()=>initialContents.map(item=>({...item})));
  const [memberships,setMemberships]=useState<StudioMembership[]>(()=>initialMemberships.map(item=>({...item,benefits:[...item.benefits]})));
  const [deletedIds,setDeletedIds]=useState<string[]>([]);
  const images=useLocalImages();
  const [photoLibrary]=useState(createMockPhotoLibrary);
  const [aiRemaining,setAiRemaining]=useState(AI_PHOTO_DAILY_LIMIT);
  const [aiTypical,setAiTypical]=useState<number|null>(null);
  // Mock storable reset tickets (2026-11-13): spending one refills today's count; expiry 30 days out.
  const [aiTickets,setAiTickets]=useState(2),[ticketExpiry]=useState(()=>new Date(Date.now()+30*86400000).toISOString());
  const [aiEditPhoto]=useState(()=>{const edit=mockAiPhotoEdit({onRemaining:setAiRemaining});return async(input:Parameters<typeof edit>[0])=>{const begun=Date.now(),result=await edit(input);if(result.success)setAiTypical(Math.max(1,Math.round((Date.now()-begun)/1000)));return result;};});
  const [subscribers]=useState<StudioSubscriber[]>(()=>initialSubscribers.map(item=>({...item,planSnapshot:{...item.planSnapshot,benefits:[...item.planSnapshot.benefits]}})));
  const requestedStatus=query.get('status');
  const selectedContentStatus=requestedStatus&&['draft','published','scheduled'].includes(requestedStatus)?requestedStatus as StudioContentStatus:undefined;
  const canDelete=(id:string)=>canDeleteMembership(id,subscribers,managementNow)&&!getProtectedPlanIds().includes(id);
  return {photoLibrary,now:managementNow,aiPhotoQuota:{remaining:aiRemaining,limit:AI_PHOTO_DAILY_LIMIT,typicalSeconds:aiTypical,resetTickets:{count:aiTickets,nextExpiresAt:aiTickets?ticketExpiry:null}},creatorTerms:{platformFeeBps:creatorPayoutPolicy.feeRatePercent*100,settlementHoldDays:creatorPayoutPolicy.settlementHoldDays,beanWithdrawalFeeBps:creatorPayoutPolicy.feeRatePercent*100,minimumWithdrawalKrw:creatorPayoutPolicy.minimumWithdrawalKrw} satisfies CreatorTerms,contents,memberships:memberships.filter(item=>!deletedIds.includes(item.id)).map(item=>({...item,canDelete:canDelete(item.id)})),subscribers,selectedContentStatus,selectedSubscriberPlanId:query.get('plan')||undefined,selectedSubscriberId:query.get('member')||undefined,notice:'',actions:{
    saveContent:async input=>{
      if(input.id&&!contents.some(item=>item.id===input.id))return fail('게시물을 찾을 수 없습니다.');
      if(!input.title.trim())return fail('제목을 입력해주세요.');
      if(input.status!=='draft'&&!input.body.trim())return fail('게시할 내용을 입력해주세요.');
      const media=input.media.map(item=>({...item,url:item.url.trim()}));
      if(media.length>mediaUploadMaxItems)return fail(`미디어는 최대 ${mediaUploadMaxItems}개까지 추가할 수 있어요.`);
      if(media.some(item=>!item.url||(item.type!=='image'&&item.type!=='video')||(!validMedia(item.url)&&!images.owns(item.url))))return fail('미디어를 다시 선택해주세요.');
      if(input.accessPlanId&&!memberships.some(item=>item.id===input.accessPlanId))return fail('공개 범위의 멤버십을 다시 선택해주세요.');
      if(input.status==='scheduled'&&(!input.scheduledAt||!Number.isFinite(Date.parse(input.scheduledAt))||Date.parse(input.scheduledAt)<=Date.parse(managementNow)))return fail('예약 시각을 현재보다 미래로 선택해주세요.');
      if(input.accessLevel!=null&&(!Number.isSafeInteger(input.accessLevel)||input.accessLevel<1||input.accessLevel>100||input.accessPlanId))return fail('공개할 최소 레벨을 확인해주세요.');
      const id=input.id||crypto.randomUUID();
      // Saving never changes visibility; that is its own switch (setContentPublic).
      const unpublished=contents.find(item=>item.id===input.id)?.unpublished;
      const next:StudioContent={...input,...(unpublished?{unpublished}:{}),id,title:input.title.trim(),body:input.body.trim(),media,scheduledAt:input.status==='scheduled'?input.scheduledAt:null,updatedAt:managementNow};
      media.forEach(item=>images.retain(item.url));
      setContents(previous=>input.id?previous.map(item=>item.id===id?next:item):[next,...previous]);
      return ok({id,message:input.status==='draft'?'임시저장되었습니다.':input.status==='scheduled'?'게시 예약이 설정되었습니다.':'게시되었습니다.'});
    },
    setContentPublic:async(id,isPublic)=>{const current=contents.find(item=>item.id===id);if(!current)return fail('게시물을 찾을 수 없습니다.');if(!current.unpublished===isPublic)return ok({message:isPublic?'이미 공개된 게시물입니다.':'이미 미공개인 게시물입니다.'});setContents(previous=>previous.map(item=>item.id===id?{...item,unpublished:!isPublic||undefined}:item));return ok({message:isPublic?(current.hiddenByOperator?'공개로 바꿨지만 운영 정책에 따라 숨겨진 게시물이라 아직 다른 회원에게 보이지 않습니다.':'게시물을 다시 공개했습니다.'):'게시물을 미공개로 바꿨습니다. 작성자에게만 보입니다.'});},
    deleteContent:async(id,confirmation)=>{const current=contents.find(item=>item.id===id);if(!current)return fail('게시물을 찾을 수 없습니다.');if(confirmation!==current.title)return fail('게시물 제목을 정확히 입력해주세요.');setContents(previous=>previous.filter(item=>item.id!==id));return ok({message:'게시물이 삭제되었습니다.'});},
    saveMembership:async input=>{
      if(input.id&&(!memberships.some(item=>item.id===input.id)||deletedIds.includes(input.id)))return fail('멤버십을 찾을 수 없습니다.');
      if(!input.name.trim())return fail('멤버십 이름을 입력해주세요.');
      if(!Number.isSafeInteger(input.price)||input.price<=0)return fail('월 구독료를 0보다 큰 정수로 입력해주세요.');
      const benefits=input.benefits.map(item=>item.trim()).filter(Boolean);if(!benefits.length)return fail('혜택을 하나 이상 입력해주세요.');
      const previous=memberships.find(item=>item.id===input.id),id=input.id||crypto.randomUUID();
      const image=input.image===undefined?previous?.image:input.image.trim();
      if(image&&!validMedia(image)&&!images.owns(image))return fail('이미지를 다시 선택해주세요.');
      const rank=input.rank??previous?.rank??1;if(!Number.isSafeInteger(rank)||rank<1||rank>100)return fail('멤버십 레벨은 1~100의 정수입니다.');
      const next:StudioMembership={id,rank,name:input.name.trim(),price:input.price,benefits,image:image||undefined,active:previous?.active??true,version:(previous?.version||0)+1};
      images.retain(image);
      setMemberships(items=>input.id?items.map(item=>item.id===id?next:item):[...items,next]);
      return ok({id,message:previous?'신규 구독에 적용할 멤버십이 수정되었습니다. 기존 구독 조건은 유지됩니다.':'새 멤버십이 만들어졌습니다.'});
    },
    uploadMembershipImage:images.upload,
    discardMembershipImage:images.discard,
    uploadContentMedia:images.uploadMedia,
    aiEditPhoto,aiCropPhoto:mockAiPhotoCrop,
    useAiPhotoTicket:async()=>{if(aiTickets<=0)return {success:false as const,data:null,errorMessage:'사용할 수 있는 리셋권이 없어요.',errorCode:'NO_TICKET'} as const;if(aiRemaining>=AI_PHOTO_DAILY_LIMIT)return {success:false as const,data:null,errorMessage:'오늘은 아직 사용한 횟수가 없어 리셋권을 쓸 필요가 없어요.',errorCode:'NOTHING_TO_RESET'} as const;const left=aiTickets-1;setAiTickets(left);setAiRemaining(AI_PHOTO_DAILY_LIMIT);return {success:true as const,data:{remaining:AI_PHOTO_DAILY_LIMIT,limit:AI_PHOTO_DAILY_LIMIT,resetTickets:{count:left,nextExpiresAt:left?ticketExpiry:null},message:`리셋권 1장을 사용했어요. 오늘 ${AI_PHOTO_DAILY_LIMIT}회를 다시 만들 수 있어요.`},errorMessage:null,errorCode:null};},
    discardContentMedia:images.discard,
    deleteMembership:async(id,confirmation)=>{
      if(!memberships.some(item=>item.id===id)||deletedIds.includes(id))return fail('멤버십을 찾을 수 없습니다.');
      if(confirmation!==memberships.find(item=>item.id===id)?.name)return fail('멤버십 이름을 정확히 입력해주세요.');
      if(!canDelete(id))return fail('이용 중인 구독자가 있어 삭제할 수 없습니다. 멤버십 비활성화를 이용해 주세요.');
      setDeletedIds(previous=>[...previous,id]);
      return ok({message:'멤버십을 판매 목록에서 삭제했습니다. 기존 구독 기록과 가입 당시 조건은 유지됩니다.'});
    },
    setMembershipActive:async(id,active)=>{if(!memberships.some(item=>item.id===id)||deletedIds.includes(id))return fail('멤버십을 찾을 수 없습니다.');setMemberships(items=>items.map(item=>item.id===id?{...item,active}:item));return ok({message:active?'멤버십을 공개하고 신규 가입을 다시 받습니다.':'멤버십을 숨기고 신규 가입을 중단했습니다. 기존 구독자의 계약과 이용 권한은 유지됩니다.'});},
  }};
}
