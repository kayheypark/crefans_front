import {landingCreators as creators} from '@/lib/content/landing';
import type {Plan} from '@/types/crefans';
const mokaImages='/illustrations/creators/moka';
const sionImages='/illustrations/creators/sion';
export {creators};
export type {Creator} from '@/types/crefans';
export const plans=[
  {id:'basic',name:'베이직',price:9900,rank:1,description:'크리에이터의 일상을 더 가까이',benefits:['멤버십 전용 게시물','비하인드 스토리','멤버 커뮤니티 참여']},
  {id:'standard',name:'스탠다드',price:19900,rank:2,description:'더 많은 특별한 콘텐츠',recommended:true,benefits:['베이직 혜택 포함','미공개 사진과 영상','라이브 스트리밍 소식','크리에이터와 메시지']},
  {id:'premium',name:'프리미엄',price:49900,rank:3,description:'가장 가까운 특별한 경험',benefits:['스탠다드 혜택 포함','프리미엄 전용 콘텐츠','이벤트 우선 안내']},
];
export const creatorPlans:Record<string,Plan[]>={moka:[
  {id:'moka-backstage',name:'백스테이지',price:9900,rank:1,entitlementMode:'tier',image:`${mokaImages}/backstage-v1.png`,description:'촬영 준비와 작업 일상을 함께해요.',benefits:['촬영 비하인드 게시물','의상·소품 제작 기록']},
  {id:'moka-photo-club',name:'포토 클럽',price:19900,rank:2,entitlementMode:'tier',recommended:true,image:`${mokaImages}/cover-v1.png`,description:'완성된 화보를 가장 가까이에서.',benefits:['백스테이지 혜택 모두 포함','포토 클럽 전용 화보','다음 촬영 콘셉트 소식']},
],sion:[
  {id:'sion-noir-club',name:'노아르 클럽',price:9900,rank:1,entitlementMode:'tier',image:`${sionImages}/avatar-v1.png`,description:'화보 뒤의 이야기를 함께해요.',benefits:['멤버십 전용 촬영 노트','의상·소품 준비 과정','다음 촬영 콘셉트 소식']},
]};
export const posts=[
  {id:'moka-first-shoot',creatorId:'moka',title:'분홍빛 첫 인사',body:'안녕하세요, 모카예요! 직접 고른 리본과 작은 별 소품으로 첫 촬영을 했어요. 같은 의상도 포즈와 빛에 따라 느낌이 달라져서 즐거웠어요. 앞으로의 작업도 함께 봐주세요.',image:`${mokaImages}/editorial-v1.png`,position:'center top',likes:84,comments:0,requiredRank:0,time:'30분 전',media:[{type:'image' as const,url:`${mokaImages}/editorial-v1.png`},{type:'image' as const,url:'/illustrations/creators/cosplay-anime-v3.png'}]},
  {id:'sion-first-shoot',creatorId:'sion',title:'북부에서 온 첫 인사',body:'안녕하세요, 시온입니다. 첫 화보는 검은 코트와 은빛 자수로 완성한 북부대공 콘셉트예요. 밝은 스튜디오에서 의상의 질감과 차가운 표정을 담았습니다. 앞으로 이곳에서 새로운 캐릭터와 촬영 이야기를 보여드릴게요.',image:`${sionImages}/portrait-v1.png`,position:'center top',likes:63,comments:0,requiredRank:0,time:'1시간 전',media:[{type:'image' as const,url:`${sionImages}/portrait-v1.png`},{type:'image' as const,url:`${sionImages}/avatar-v1.png`}]},
  {id:'sion-shoot-notes',creatorId:'sion',title:'검은 코트 한 벌의 촬영 노트',body:'이번 촬영에서는 검은 의상이 배경에 묻히지 않도록 밝은 회색 배경을 골랐어요. 코트의 은빛 자수와 셔츠의 주름이 자연스럽게 보이도록 조명을 부드럽게 맞췄습니다.\n\n표정은 힘을 주기보다 시선을 잠깐 멈추는 느낌으로 잡았어요. 다음에는 같은 캐릭터를 조금 더 편안한 모습으로 담아보려고 합니다.',image:'',position:'center',likes:28,comments:0,requiredRank:1,time:'1일 전'},
  {id:'moka-backstage',creatorId:'moka',title:'촬영 전, 마지막 리본 하나',body:'촬영 시작 전에는 늘 소품을 한 번 더 확인해요. 오늘은 리본의 길이와 매듭 모양을 여러 번 바꿔봤어요. 완성된 사진 뒤에 있는 작은 준비의 순간을 남깁니다.',image:`${mokaImages}/backstage-v1.png`,position:'center 30%',likes:42,comments:0,requiredRank:1,time:'1일 전',media:[{type:'image' as const,url:`${mokaImages}/backstage-v1.png`}]},
  {id:'moka-pink-portrait',creatorId:'moka',title:'빛이 가장 예뻤던 순간',body:'커튼 사이로 들어오는 빛을 기다렸다가 찍은 포트레이트예요. 부드러운 분홍빛 배경과 리본의 색을 맞춰봤어요. 가까운 표정과 조금 더 넓은 구도를 함께 골랐습니다.',image:`${mokaImages}/cover-v1.png`,position:'center 30%',likes:36,comments:0,requiredRank:2,time:'2일 전',media:[{type:'image' as const,url:`${mokaImages}/cover-v1.png`},{type:'image' as const,url:`${mokaImages}/avatar-v1.png`}]},
  {id:'morning',creatorId:'haneul',title:'오늘도 좋은 하루였어요',body:'오늘은 조금 더 특별한 이야기를 찾아왔어요. 항상 곁에 있어줘서 고마워요.',image:'/illustrations/redesign/variety/haneul-courtyard-v3.png',position:'65% 35%',likes:1200,comments:234,requiredRank:0,time:'2시간 전',media:[{type:'image' as const,url:'/illustrations/redesign/variety/haneul-courtyard-v3.png'},{type:'video' as const,url:'/video_1.mp4'},{type:'image' as const,url:'/illustrations/redesign/variety/haneul-bookshop-v3.png'},{type:'image' as const,url:'/illustrations/redesign/daily-cat.png'},{type:'video' as const,url:'/video_1.mp4'},{type:'image' as const,url:'/illustrations/redesign/beach-day.png'},{type:'image' as const,url:'/illustrations/redesign/hero-woman.png'}]},
  {id:'behind',creatorId:'haneul',title:'우리만의 비하인드 이야기',body:'촬영이 끝난 뒤의 작은 일상을 담았어요. 함께해주셔서 감사합니다.',image:'/illustrations/redesign/variety/haneul-bookshop-v3.png',position:'52% 30%',likes:892,comments:120,requiredRank:2,time:'3일 전'},
  {id:'cat-day',creatorId:'haneul',title:'느긋한 오후의 친구',body:'햇살이 드는 자리에서 한참을 쉬었어요. 가끔은 이렇게 아무것도 하지 않는 시간이 좋아요.',image:'/illustrations/redesign/daily-cat.png',position:'center',likes:326,comments:24,requiredRank:0,time:'4일 전'},
  {id:'beach-day',creatorId:'haneul',title:'바다를 보러 떠난 날',body:'파도 소리를 듣고 돌아왔어요. 이 평온한 순간을 함께 나누고 싶었어요.',image:'/illustrations/redesign/beach-day.png',position:'center',likes:468,comments:42,requiredRank:0,time:'5일 전'},
  {id:'quiet-day',creatorId:'haneul',commentsEnabled:false,title:'조용한 하루의 기록',body:'분주한 하루 속에서도 나만의 속도를 찾고 있어요.',image:'/illustrations/redesign/hero-woman.png',position:'70% center',likes:213,comments:18,requiredRank:1,time:'6일 전'},
  {id:'special-letter',creatorId:'haneul',title:'가장 가까운 당신에게',body:'늘 함께해 주는 분들께 작은 편지를 남겨요. 오늘도 고맙습니다.',image:'/illustrations/redesign/variety/haneul-bookshop-v3.png',position:'52% 30%',likes:174,comments:12,requiredRank:3,time:'1주 전'},
  {id:'travel',creatorId:'jiwoo',title:'여행은 언제나 옳다',body:'익숙한 일상을 잠시 벗어나 새로운 풍경을 만났어요. 여러분은 어디로 떠나고 싶나요?',image:'/illustrations/redesign/variety/jiwoo-terrace-v3.png',position:'50% 32%',likes:420,comments:32,requiredRank:0,time:'1일 전'},
  {id:'song',creatorId:'seoyeon',title:'새로운 커버를 준비하고 있어요',body:'가장 좋아하는 부분을 먼저 들려드리고 싶었어요. 곧 다시 만나요.',image:'/illustrations/redesign/variety/seoyeon-music-v3.png',position:'54% 35%',likes:286,comments:18,requiredRank:1,time:'어제'},
];
export type {Post} from '@/types/crefans';
import type {Follower,Subscription} from '@/types/crefans';
/** 56 followers to match `account.stats.followers`; handles derive from the fan pool ids. */
export const followers:Follower[]=messyFanPool.slice(0,56).map(fan=>({id:fan.id,name:fan.name,handle:fan.id.replace('-',''),image:fan.image}));
export type {Subscription} from '@/types/crefans';
export const initialSubscriptions:Subscription[]=[
  {creatorId:'haneul',planId:'standard',status:'active',renewAt:'2026-10-12',price:19900},
  {creatorId:'jiwoo',planId:'basic',status:'cancelled',renewAt:'2026-10-05',price:9900},
  {creatorId:'seoyeon',planId:'standard',status:'expired',renewAt:'2026-09-01',price:19900},
];
export const notifications=[
  {id:'n1',creatorId:'haneul',type:'멤버십',text:'하늘님이 새 게시물을 올렸어요.',time:'2시간 전',href:'/preview/post/morning'},
  {id:'n2',creatorId:'jiwoo',type:'댓글',text:'지우님이 회원님의 댓글에 답글을 남겼어요.',time:'5시간 전',href:'/preview/post/travel'},
  {id:'n3',creatorId:'seoyeon',type:'라이브',text:'서연님의 새로운 소식이 도착했어요.',time:'어제',href:'/preview/creator/seoyeon'},
  {id:'n4',creatorId:'minji',type:'좋아요',text:'민지님이 회원님의 응원을 좋아합니다.',time:'1일 전',href:'/preview/creator/minji'},
  {id:'n5',creatorId:null,type:'시스템',text:'계정과 구독 정보를 확인해 주세요.',time:'2일 전',href:'/preview/subscriptions'},
];

export const faqs=[
  {question:'멤버십 구독은 어떻게 하나요?',answer:'크리에이터 프로필의 구독하기에서 멤버십 혜택과 금액을 확인한 뒤 가입할 수 있어요.'},
  {question:'결제 수단은 어떤 것이 있나요?',answer:'결제 단계에서 이용 가능한 결제수단을 확인하고 선택할 수 있어요.'},
  {question:'구독을 해지하고 싶어요.',answer:'내 구독 관리에서 해당 멤버십의 자동 갱신을 해지할 수 있어요. 이미 결제한 이용기간과 해지 적용일을 확인한 뒤 진행해주세요.'},
  {question:'환불 규정이 어떻게 되나요?',answer:'환불 가능 여부는 결제 시점과 콘텐츠 이용 여부 등 조건에 따라 달라질 수 있어요. 문의하기에서 결제 내역과 함께 문의해주세요.'},
  {question:'크리에이터에게 메시지를 보낼 수 있나요?',answer:'크리에이터의 멤버십 혜택에 메시지 기능이 포함되어 있는지 먼저 확인해주세요. 이용 가능한 멤버십일 때 대화방에서 메시지를 보낼 수 있어요.'},
  {question:'계정 정보를 변경하고 싶어요.',answer:'설정의 계정 정보에서 닉네임을 변경할 수 있어요. 비밀번호와 이메일 주소는 각각의 설정 메뉴에서 변경해주세요.'},
  {question:'비밀번호를 잊어버렸어요.',answer:'로그인 화면에서 비밀번호 찾기를 선택하고 가입한 이메일 주소를 입력해주세요.'},
  {question:'기타 문의는 어떻게 하나요?',answer:'문의하기 탭에서 문의 유형과 내용을 남겨주세요. 접수한 문의와 답변은 내 문의 내역에서 확인할 수 있어요.'},
];

export const initialMessages:Record<string,import('@/types/crefans').Message[]>={
  haneul:[{id:1,body:'안녕하세요! 항상 응원해주셔서 정말 고마워요.',mine:false,time:'오후 2:28'},{id:2,body:'너무 좋아요! 다음 콘텐츠도 기대할게요!',mine:true,time:'오후 2:29'},{id:3,body:'곧 업로드할게요! 조금만 기다려주세요.',mine:false,time:'오후 2:30'}],
  jiwoo:[{id:1,body:'새로운 여행 사진을 올렸어요!',mine:false,time:'오전 11:20'}],
  seoyeon:[{id:1,body:'다음 라이브에서 만나요.',mine:false,time:'어제'}],
  minji:[{id:1,body:'늘 함께해 줘서 감사합니다.',mine:false,time:'어제'}],
};

export const categories=['전체','라이프스타일','뷰티','코스프레','피트니스','음악','여행','게임','아트','일상'];
export const mockServiceResponse:import('@/types/crefans').ApiResult<import('@/types/crefans').ServiceData>={success:true,data:{creators,plans,creatorPlans,posts,notifications,followers,paymentHistory:initialSubscriptions,messages:initialMessages,faqs,categories},errorMessage:null,errorCode:null};

import {messyCommentThreads,messyFanPool,toSocialComments,toSocialReplies} from '../comment-fixtures';
/** Messy on purpose: 37 threads with replies and mass mentions on `morning`, a handful on `cat-day`, none on `behind`. */
const commentThreads={morning:messyCommentThreads('morning',37),'cat-day':messyCommentThreads('cat-day',4)};
export const initialComments={morning:toSocialComments(commentThreads.morning),'cat-day':toSocialComments(commentThreads['cat-day']),behind:[]};
export const initialReplies={...toSocialReplies(commentThreads.morning),...toSocialReplies(commentThreads['cat-day'])};
