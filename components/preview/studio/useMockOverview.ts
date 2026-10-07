'use client';
import {useState} from 'react';
import type {ApiResult,Creator,CreatorLinks} from '@/types/crefans';
import type {StudioOverviewModel,StudioProfile} from '@/types/crefans-studio';
const ok=(message:string):ApiResult<{message:string}>=>({success:true,data:{message},errorMessage:null,errorCode:null});
const error=(message:string):ApiResult<{message:string}>=>({success:false,data:null,errorMessage:message,errorCode:'INVALID_PROFILE'});
export function useMockOverview(creator:Creator|undefined,onProfileChange:(id:string,patch:Partial<Creator>)=>void):StudioOverviewModel{
 const [profile,setProfile]=useState<StudioProfile>({name:creator?.name||'',handle:creator?.handle||'',bio:creator?.bio||'',about:creator?.about||'',links:{...creator?.links},avatar:creator?.image||'',avatarPosition:creator?.position,cover:creator?.image||'',category:'라이프스타일',active:true,commentsEnabled:true});
 const [started,setStarted]=useState(true);
 const categories=['라이프스타일','사진','음악','피트니스','게임','코스프레','성우','아트'];
 const update=async(input:Pick<StudioProfile,'name'|'handle'|'bio'|'category'|'about'|'links'>)=>{
  if(!input.name.trim()||!/^[a-z0-9_]{3,24}$/.test(input.handle)||!categories.includes(input.category))return error('활동명, 영문 소문자·숫자·밑줄 3~24자의 주소, 분야를 확인해주세요.');
  const links:CreatorLinks={};
  for(const key of ['youtube','instagram','facebook'] as const){const url=(input.links?.[key]||'').trim();if(url)links[key]=url;}
  if(Object.values(links).some(url=>!/^https?:\/\//.test(url)))return error('SNS 링크는 http:// 또는 https://로 시작하는 주소만 저장할 수 있어요.');
  const about=(input.about||'').trim();
  setProfile(previous=>({...previous,...input,name:input.name.trim(),bio:input.bio.trim(),about,links}));
  if(creator)onProfileChange(creator.id,{name:input.name.trim(),handle:input.handle,bio:input.bio.trim(),about,links,tags:[input.category]});
  return ok('공개 프로필을 저장했습니다.');
 };
 return{profile,started,categories,period:'2026년 9월 1일 — 9월 12일',
  metrics:[
   {id:'revenue',label:'이번 달 순수익',value:'1,284,600',description:'환불과 수수료를 반영한 금액',points:[18,26,21,38,32,49,55]},
   {id:'subscribers',label:'함께하는 구독자',value:'128',description:'현재 유효한 멤버십',points:[12,21,24,33,30,38,44]},
   {id:'followers',label:'팔로워',value:`${(creator?.followerCount??0).toLocaleString('ko-KR')}명`,description:'새로운 이야기를 기다리는 팬',points:[20,30,24,43,46,40,58]},
  ],
  tasks:[{id:'account',title:'정산 계좌를 확인해 주세요',description:'출금 신청 전에 수령 계좌 상태를 확인하세요.',path:'accounts'},{id:'draft',title:'이야기를 이어가 볼까요?',description:'작성 중인 콘텐츠를 확인하고 발행하세요.',path:'content?status=draft'}],
  activities:[{id:'a1',title:'새로운 팬이 함께하기 시작했어요',description:'스탠다드 멤버십 가입',time:'12분 전',path:'subscribers'},{id:'a2',title:'비하인드 게시물에 새 댓글이 있어요',description:'팬의 이야기에 답해 주세요.',time:'1시간 전',path:'comments'},{id:'a3',title:'지난 정산이 완료되었어요',description:'정산 내역에서 자세히 확인할 수 있어요.',time:'어제',path:'settlements'}],
  series:[{label:'9/1',subscribers:112,followers:12100,revenue:153000},{label:'9/3',subscribers:117,followers:12160,revenue:214000},{label:'9/5',subscribers:119,followers:12240,revenue:173000},{label:'9/7',subscribers:124,followers:12290,revenue:254000},{label:'9/9',subscribers:125,followers:12350,revenue:217000},{label:'9/12',subscribers:128,followers:12400,revenue:273600}],
  contentPerformance:[{id:'morning',title:'오늘도 좋은 하루였어요',image:'/illustrations/redesign/variety/haneul-courtyard-v3.png',views:2840,likes:1200,comments:234},{id:'behind',title:'우리만의 비하인드 이야기',image:'/illustrations/redesign/variety/haneul-bookshop-v3.png',views:1640,likes:892,comments:120},{id:'cat-day',title:'느긋한 오후의 친구',image:'/illustrations/redesign/daily-cat.png',views:986,likes:326,comments:24}],
  guidance:'',
  updateProfile:update,
  completeOnboarding:async input=>{const result=await update({...input,about:profile.about,links:profile.links});if(result.success)setStarted(true);return result.success?ok('크리에이터 스튜디오 설정을 완료했습니다.'):result;},
  setCommentsEnabled:async enabled=>{setProfile(previous=>({...previous,commentsEnabled:enabled}));return ok(enabled?'댓글 기능을 켰습니다. 게시물별 댓글 허용 설정이 다시 적용됩니다.':'댓글 기능을 껐습니다. 모든 게시물의 댓글이 닫힙니다.');},
  setActivity:async active=>{setProfile(previous=>({...previous,active}));return ok(active?'계정을 활성화했습니다. 프로필과 게시물이 다시 공개됩니다.':'계정을 비활성화했습니다. 기존 멤버십과 이용 권한은 유지됩니다.');},
 };
}
