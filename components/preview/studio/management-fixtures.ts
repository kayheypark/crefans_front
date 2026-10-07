import type {StudioContent,StudioMembership,StudioSubscriber} from '@/types/crefans-studio-management';

export const managementNow='2026-09-12T09:00:00.000Z';
export const managementMemberships:StudioMembership[]=[
  {id:'basic',name:'베이직',price:9900,benefits:['멤버십 전용 게시물','비하인드 스토리'],active:true,version:1},
  {id:'standard',name:'스탠다드',price:19900,benefits:['베이직 혜택 포함','미공개 사진과 영상','크리에이터와 메시지'],active:true,version:1},
  {id:'premium',name:'프리미엄',price:49900,benefits:['스탠다드 혜택 포함','프리미엄 전용 콘텐츠','이벤트 우선 안내'],active:true,version:1},
];
export const managementContents:StudioContent[]=[
  {id:'morning',title:'오늘도 좋은 하루였어요',body:'오늘의 작은 순간을 함께 나눠요. 항상 곁에 있어줘서 고마워요.',media:[{id:'morning-1',type:'image',url:'/illustrations/redesign/variety/haneul-courtyard-v3.png'},{id:'morning-2',type:'image',url:'/illustrations/redesign/daily-cat.png'}],commentsEnabled:true,accessPlanId:null,status:'published',scheduledAt:null,updatedAt:'2026-09-12T05:00:00.000Z'},
  {id:'behind',title:'우리만의 비하인드 이야기',body:'촬영이 끝난 뒤의 작은 일상을 담았어요.',media:[{id:'behind-1',type:'image',url:'/illustrations/redesign/variety/haneul-bookshop-v3.png'}],commentsEnabled:true,accessPlanId:'standard',status:'published',scheduledAt:null,updatedAt:'2026-09-09T05:00:00.000Z'},
  {id:'weekend',title:'주말에 만나요',body:'주말에 전할 소식을 준비하고 있어요.',media:[],commentsEnabled:false,accessPlanId:'basic',status:'scheduled',scheduledAt:'2026-09-15T10:00:00.000Z',updatedAt:'2026-09-12T07:00:00.000Z'},
  {id:'draft-note',title:'다음 촬영 아이디어',body:'팬 여러분에게 보여드리고 싶은 것들을 적어두었어요.',media:[],commentsEnabled:true,accessPlanId:null,status:'draft',scheduledAt:null,updatedAt:'2026-09-12T08:00:00.000Z'},
];
export const managementSubscribers:StudioSubscriber[]=[
  {id:'fan-jimin',name:'팬지민',handle:'fanjimin',image:'/illustrations/redesign/yerin.png',planId:'standard',planSnapshot:{name:'스탠다드',price:19900,benefits:['베이직 혜택 포함','미공개 사진과 영상','크리에이터와 메시지'],version:1},status:'active',joinedAt:'2026-08-12',renewAt:'2026-10-12'},
  {id:'fan-dahae',name:'다해',handle:'dahae',image:'/illustrations/redesign/jiwoo.png',planId:'basic',planSnapshot:{name:'베이직',price:9900,benefits:['멤버십 전용 게시물','비하인드 스토리'],version:1},status:'cancelled',joinedAt:'2026-08-05',renewAt:'2026-10-05'},
  {id:'fan-jun',name:'준',handle:'jun',planId:'premium',planSnapshot:{name:'프리미엄',price:49900,benefits:['스탠다드 혜택 포함','프리미엄 전용 콘텐츠','이벤트 우선 안내'],version:1},status:'expired',joinedAt:'2026-07-01',renewAt:'2026-09-01'},
];
