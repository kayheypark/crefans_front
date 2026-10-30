import type {SocialComment} from '@/types/crefans-social';
import {messyCommentThreads,messyFanPool,toSocialComments,toSocialReplies} from '../comment-fixtures';
import {betaFaqs} from '@/lib/crefans/support';
import {landingCreators} from '@/lib/content/landing';
import {foundingCreatorIds} from '../founding-members';
const creators=landingCreators.map(person=>({...person,isFoundingMember:foundingCreatorIds.includes(person.id)}));
import type {Plan} from '@/types/crefans';
const mokaImages='/illustrations/creators/moka';
const sionImages='/illustrations/creators/sion';
const jiwooImages='/illustrations/creators/jiwoo';
export {creators};
export type {Creator} from '@/types/crefans';
export const plans=[
  {id:'basic',name:'베이직',price:9900,rank:1,description:'크리에이터의 일상을 더 가까이',benefits:['멤버십 전용 게시물','비하인드 스토리','멤버 커뮤니티 참여']},
  {id:'standard',name:'스탠다드',price:19900,rank:2,description:'더 많은 특별한 콘텐츠',recommended:true,benefits:['베이직 혜택 포함','미공개 사진과 영상','라이브 스트리밍 소식','크리에이터와 메시지']},
  {id:'premium',name:'프리미엄',price:49900,rank:3,description:'가장 가까운 특별한 경험',benefits:['스탠다드 혜택 포함','프리미엄 전용 콘텐츠','이벤트 우선 안내']},
];
export const creatorPlans:Record<string,Plan[]>={moka:[
  {id:'moka-backstage',name:'모카의 분홍빛 코스프레 촬영 준비와 비하인드 멤버십',price:9900,rank:1,entitlementMode:'tier',image:`${mokaImages}/backstage-v1.png`,description:'촬영 준비와 작업 일상을 함께해요.',benefits:['촬영 비하인드 게시물','의상·소품 제작 기록']},
  {id:'moka-photo-club',name:'모카와 함께 보는 특별한 코스프레 화보 컬렉션 멤버십',price:19900,rank:2,entitlementMode:'tier',recommended:true,image:`${mokaImages}/cover-v1.png`,description:'완성된 화보를 가장 가까이에서.',benefits:['백스테이지 혜택 모두 포함','포토 클럽 전용 화보','다음 촬영 콘셉트 소식']},
],sion:[
  {id:'sion-noir-club',name:'노아르 클럽',price:9900,rank:1,entitlementMode:'tier',image:`${sionImages}/avatar-v1.png`,description:'화보 뒤의 이야기를 함께해요.',benefits:['멤버십 전용 촬영 노트','의상·소품 준비 과정','다음 촬영 콘셉트 소식']},
]};
export const posts=[
  {id:'moka-first-shoot',views:1842,creatorId:'moka',title:'분홍빛 첫 인사',body:'안녕하세요, 모카예요! 직접 고른 리본과 작은 별 소품으로 첫 촬영을 했어요. 같은 의상도 포즈와 빛에 따라 느낌이 달라져서 즐거웠어요. 앞으로의 작업도 함께 봐주세요.',image:`${mokaImages}/editorial-v1.png`,position:'center top',likes:84,comments:0,requiredRank:0,time:'30분 전',media:[{type:'image' as const,url:`${mokaImages}/editorial-v1.png`},{type:'image' as const,url:'/illustrations/creators/cosplay-anime-v3.png'}]},
  {id:'sion-first-shoot',views:1234,creatorId:'sion',title:'북부에서 온 첫 인사',body:'안녕하세요, 시온입니다. 첫 화보는 검은 코트와 은빛 자수로 완성한 북부대공 콘셉트예요. 밝은 스튜디오에서 의상의 질감과 차가운 표정을 담았습니다. 앞으로 이곳에서 새로운 캐릭터와 촬영 이야기를 보여드릴게요.',image:`${sionImages}/portrait-v1.png`,position:'center top',likes:63,comments:0,requiredRank:0,time:'1시간 전',media:[{type:'image' as const,url:`${sionImages}/portrait-v1.png`},{type:'image' as const,url:`${sionImages}/avatar-v1.png`}]},
  {id:'sion-shoot-notes',views:320,creatorId:'sion',title:'검은 코트 한 벌의 촬영 노트',body:'이번 촬영에서는 검은 의상이 배경에 묻히지 않도록 밝은 회색 배경을 골랐어요. 코트의 은빛 자수와 셔츠의 주름이 자연스럽게 보이도록 조명을 부드럽게 맞췄습니다.\n\n표정은 힘을 주기보다 시선을 잠깐 멈추는 느낌으로 잡았어요. 다음에는 같은 캐릭터를 조금 더 편안한 모습으로 담아보려고 합니다.',image:'',position:'center',likes:28,comments:0,requiredRank:1,time:'1일 전'},
  {id:'moka-backstage',views:518,creatorId:'moka',title:'촬영 전, 마지막 리본 하나',body:'촬영 시작 전에는 늘 소품을 한 번 더 확인해요. 오늘은 리본의 길이와 매듭 모양을 여러 번 바꿔봤어요. 완성된 사진 뒤에 있는 작은 준비의 순간을 남깁니다.',image:`${mokaImages}/backstage-v1.png`,position:'center 30%',likes:42,comments:0,requiredRank:1,time:'1일 전',media:[{type:'image' as const,url:`${mokaImages}/backstage-v1.png`}]},
  {id:'moka-pink-portrait',views:432,creatorId:'moka',title:'빛이 가장 예뻤던 순간',body:'커튼 사이로 들어오는 빛을 기다렸다가 찍은 포트레이트예요. 부드러운 분홍빛 배경과 리본의 색을 맞춰봤어요. 가까운 표정과 조금 더 넓은 구도를 함께 골랐습니다.',image:`${mokaImages}/cover-v1.png`,position:'center 30%',likes:36,comments:0,requiredRank:2,time:'2일 전',media:[{type:'image' as const,url:`${mokaImages}/cover-v1.png`},{type:'image' as const,url:`${mokaImages}/avatar-v1.png`}]},
  {id:'morning',views:24831,creatorId:'haneul',title:'오늘도 좋은 하루였어요',body:'오늘은 조금 더 특별한 이야기를 찾아왔어요. 항상 곁에 있어줘서 고마워요.',image:'/illustrations/redesign/variety/haneul-courtyard-v3.png',position:'65% 35%',likes:1200,comments:234,requiredRank:0,time:'2시간 전',media:[{type:'image' as const,url:'/illustrations/redesign/variety/haneul-courtyard-v3.png'},{type:'video' as const,url:'/video_1.mp4'},{type:'image' as const,url:'/illustrations/redesign/variety/haneul-bookshop-v3.png'},{type:'image' as const,url:'/illustrations/redesign/daily-cat.png'},{type:'video' as const,url:'/video_1.mp4'},{type:'image' as const,url:'/illustrations/redesign/beach-day.png'},{type:'image' as const,url:'/illustrations/redesign/hero-woman.png'}]},
  {id:'behind',views:18426,creatorId:'haneul',title:'우리만의 비하인드 이야기',body:'촬영이 끝난 뒤의 작은 일상을 담았어요. 함께해주셔서 감사합니다.',image:'/illustrations/redesign/variety/haneul-bookshop-v3.png',position:'52% 30%',likes:892,comments:120,requiredRank:2,time:'3일 전'},
  {id:'cat-day',views:4250,creatorId:'haneul',title:'느긋한 오후의 친구',body:'햇살이 드는 자리에서 한참을 쉬었어요. 가끔은 이렇게 아무것도 하지 않는 시간이 좋아요.',image:'/illustrations/redesign/daily-cat.png',position:'center',likes:326,comments:24,requiredRank:0,time:'4일 전'},
  {id:'beach-day',views:6870,creatorId:'haneul',title:'바다를 보러 떠난 날',body:'파도 소리를 듣고 돌아왔어요. 이 평온한 순간을 함께 나누고 싶었어요.',image:'/illustrations/redesign/beach-day.png',position:'center',likes:468,comments:42,requiredRank:0,time:'5일 전'},
  {id:'quiet-day',views:1620,creatorId:'haneul',commentsEnabled:false,title:'조용한 하루의 기록',body:'분주한 하루 속에서도 나만의 속도를 찾고 있어요.',image:'/illustrations/redesign/hero-woman.png',position:'70% center',likes:213,comments:18,requiredRank:1,time:'6일 전'},
  {id:'special-letter',views:958,creatorId:'haneul',title:'가장 가까운 당신에게',body:'늘 함께해 주는 분들께 작은 편지를 남겨요. 오늘도 고맙습니다.',image:'/illustrations/redesign/variety/haneul-bookshop-v3.png',position:'52% 30%',likes:174,comments:12,requiredRank:3,time:'1주 전'},
  {id:'travel',views:8632,creatorId:'jiwoo',title:'바닷길을 따라 천천히',body:'오늘은 목적지를 정하지 않고 바다 옆 길을 걸었어요. 소나무 사이로 파란 바다가 보일 때마다 자꾸 발걸음이 느려지더라고요.\n\n가벼운 가방 하나만 메고 나왔는데, 돌아갈 때는 사진이 한가득. 여러분은 바다와 숲 중 어디로 떠나고 싶나요?',image:`${jiwooImages}/coastal-walk-v2.png`,position:'center 30%',likes:420,comments:32,requiredRank:0,time:'1일 전',media:[{type:'image' as const,url:`${jiwooImages}/coastal-walk-v2.png`}]},
  {id:'jiwoo-camp-morning',views:3942,creatorId:'jiwoo',title:'텐트 밖으로 나온 첫 번째 아침',body:'알람 대신 새소리에 눈을 떴어요. 따뜻한 옷을 하나 걸치고 의자에 앉으니 호수 위로 빛이 번지고 있었어요.\n\n아무 일정도 없는 아침이라 커피 한 잔을 오래 마셨습니다. 두 번째 사진에는 어제부터 머물렀던 작은 자리를 담았어요.',image:`${jiwooImages}/camp-morning-v2.png`,position:'center 35%',likes:238,comments:0,requiredRank:0,time:'2일 전',media:[{type:'image' as const,url:`${jiwooImages}/camp-morning-v2.png`},{type:'image' as const,url:`${jiwooImages}/cover-lakeside-v2.png`}]},
  {id:'jiwoo-camp-coffee',views:1820,creatorId:'jiwoo',title:'작은 캠핑 테이블의 아침 기록',body:'이번에는 짐을 조금 줄여봤어요. 작은 주전자와 머그, 드리퍼만 챙겨도 아침 준비가 꽤 즐거웠어요.\n\n밤에는 컵과 커피 도구를 텐트 안에 넣어두고, 아침에 테이블부터 닦아 자리를 만들었습니다. 다음 여행에는 꼭 필요한 것만 챙길 수 있도록 이번 준비 기록도 차근차근 남겨둘게요.',image:`${jiwooImages}/camp-coffee-v2.png`,position:'center',likes:96,comments:0,requiredRank:1,time:'3일 전',media:[{type:'image' as const,url:`${jiwooImages}/camp-coffee-v2.png`}]},
  {id:'song',views:3294,creatorId:'seoyeon',title:'새로운 커버를 준비하고 있어요',body:'가장 좋아하는 부분을 먼저 들려드리고 싶었어요. 곧 다시 만나요.',image:'/illustrations/redesign/variety/seoyeon-music-v3.png',position:'54% 35%',likes:286,comments:18,requiredRank:1,time:'어제'},
];
export type {Post} from '@/types/crefans';
import type {Follower,Subscription} from '@/types/crefans';
/** 56 followers to match `account.stats.followers`; handles derive from the fan pool ids. */
// Badges vary across the mock list: verified only, founding member only, both, and most with none.
export const followers:Follower[]=messyFanPool.slice(0,56).map((fan,i)=>({id:fan.id,name:fan.name,handle:fan.id.replace('-',''),image:fan.image,...(i%6===1||i%10===3?{isVerified:true}:{}),...(i%4===2||i%10===3?{isFoundingMember:true}:{})}));
export type {Subscription} from '@/types/crefans';
export const initialSubscriptions:Subscription[]=[
  {creatorId:'moka',planId:'moka-photo-club',status:'expired',renewAt:'2026-09-01',price:19900},
  {creatorId:'haneul',planId:'standard',status:'active',renewAt:'2026-10-12',price:19900},
  {creatorId:'jiwoo',planId:'basic',status:'cancelled',renewAt:'2026-10-05',price:9900},
  {creatorId:'seoyeon',planId:'standard',status:'expired',renewAt:'2026-09-01',price:19900},
];
export const notifications=[
  {id:'n-moka',creatorId:'moka',type:'멤버십',text:`${creators.find(creator=>creator.id==='moka')!.name}님이 새 게시물을 올렸어요.`,time:'30분 전',href:'/preview/post/moka-first-shoot'},
  {id:'n1',creatorId:'haneul',type:'멤버십',text:'하늘님이 새 게시물을 올렸어요.',time:'2시간 전',href:'/preview/post/morning'},
  {id:'n2',creatorId:'jiwoo',type:'댓글',text:'지우님이 회원님의 댓글에 답글을 남겼어요.',time:'5시간 전',href:'/preview/post/travel'},
  {id:'n3',creatorId:'seoyeon',type:'라이브',text:'서연님의 새로운 소식이 도착했어요.',time:'어제',href:'/preview/creator/seoyeon'},
  {id:'n4',creatorId:'minji',type:'좋아요',text:'민지님이 회원님의 응원을 좋아합니다.',time:'1일 전',href:'/preview/creator/minji'},
  {id:'n5',creatorId:null,type:'시스템',text:'계정과 구독 정보를 확인해 주세요.',time:'2일 전',href:'/preview/subscriptions'},
];

export const faqs=betaFaqs;

export const initialMessages:Record<string,import('@/types/crefans').Message[]>={
  moka:[{id:'moka-message',mine:false,body:'새로운 촬영 이야기를 준비하고 있어요.',time:'오전 9:30',unread:true}],
  haneul:[{id:1,body:'안녕하세요! 항상 응원해주셔서 정말 고마워요.',mine:false,time:'오후 2:28'},{id:2,body:'너무 좋아요! 다음 콘텐츠도 기대할게요!',mine:true,time:'오후 2:29'},{id:3,body:'곧 업로드할게요! 조금만 기다려주세요.',mine:false,unread:true,time:'오후 2:30'}],
  jiwoo:[{id:1,body:'새로운 여행 사진을 올렸어요!',mine:false,unread:true,time:'오전 11:20'}],
  seoyeon:[{id:1,body:'다음 라이브에서 만나요.',mine:false,time:'어제'}],
  minji:[{id:1,body:'늘 함께해 줘서 감사합니다.',mine:false,time:'어제'}],
};

export const categories=['전체','라이프스타일','뷰티','코스프레','피트니스','음악','여행','게임','아트','일상'];
export const mockServiceResponse:import('@/types/crefans').ApiResult<import('@/types/crefans').ServiceData>={success:true,data:{creators,plans,creatorPlans,posts,notifications,followers,paymentHistory:initialSubscriptions,messages:initialMessages,faqs,categories},errorMessage:null,errorCode:null};

/** Messy on purpose: 37 threads with replies and mass mentions on `morning`, a handful on `cat-day`, none on `behind`. */
const commentThreads={morning:messyCommentThreads('morning',37),'cat-day':messyCommentThreads('cat-day',4)};
// Show every comment state in the mock: the viewer's own comment (edit/delete), edited comments, and a deleted one kept for its replies.
const withCommentStates=(list:SocialComment[])=>{const removed=list.findIndex((c,i)=>i>2&&(c.replyCount||0)>0&&!c.own);return list.map((c,i)=>i===removed?{...c,deleted:true,body:'',author:{name:'',image:''},mentions:[],fromCreator:undefined}:i===0||i===4?{...c,edited:true}:c);};
export const initialComments={morning:withCommentStates(toSocialComments(commentThreads.morning)),'cat-day':toSocialComments(commentThreads['cat-day']),behind:[]};
export const initialReplies={...toSocialReplies(commentThreads.morning),...toSocialReplies(commentThreads['cat-day'])};
