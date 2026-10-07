import type {Creator} from '@/types/crefans';
import type {LandingContent} from '@/types/crefans-landing';

export const landingCreators:Creator[] = [
  {id:'haneul',promoted:true,name:'하늘',handle:'haneul',tags:['사진','일상'],image:'/illustrations/redesign/hero-woman.png',position:'67% center',bio:'일상의 특별한 순간을 함께해요',about:'서울에서 사진과 일상을 기록하는 하늘입니다.\n\n필름 카메라로 시작해 지금은 디지털과 필름을 오가며 찍고 있어요. 멤버십에서는 촬영 비하인드와 보정 과정, 그리고 가끔은 그냥 수다도 나눕니다.\n\n편하게 인사 남겨주세요. 댓글은 다 읽고 있어요.',links:{youtube:'https://youtube.com/@haneul',instagram:'https://instagram.com/haneul',facebook:'https://facebook.com/haneul.photo'},followers:'12.4K',followerCount:12400,followingCount:2},
  {id:'jiwoo',promoted:true,name:'지우',handle:'jiwoo',tags:['여행','브이로그'],image:'/illustrations/redesign/variety/jiwoo-terrace-v3.png',position:'50% 32%',bio:'여행하는 모든 순간, 너와 함께',about:'여행하는 모든 순간을 기록해요. 다음 목적지는 멤버십에서 먼저 공개합니다.',links:{instagram:'https://instagram.com/jiwoo.travel'},followers:'8.2K'},
  {id:'seoyeon',promoted:true,name:'서연',handle:'seoyeon',tags:['음악','커버'],image:'/illustrations/redesign/variety/seoyeon-music-v3.png',position:'54% 35%',bio:'좋은 음악을 더 가까이',followers:'6.8K'},
  {id:'minji',name:'민지',handle:'minji',tags:['소통','라이브'],image:'/illustrations/redesign/variety/minji-gallery-v3.png',position:'55% 30%',bio:'오늘도, 너와 이야기하고 싶어',followers:'5.1K'},
  {id:'yerin',name:'예린',handle:'yerin',tags:['피트니스','라이프스타일'],image:'/illustrations/redesign/variety/yerin-wellness-v3.png',position:'55% 35%',bio:'더 건강하고, 더 아름답게',followers:'9.3K'},
  {id:'sua',name:'수아',handle:'sua',tags:['일상','사진'],image:'/illustrations/redesign/minji.png',position:'center',bio:'작은 행복을 기록해요',followers:'3.6K'},
];

export const landingAssetContent:LandingContent={
  hero:{title:['좋아하는 크리에이터를','더 가까이, 더 특별하게'],description:['크리에이터의 진짜 이야기를 가장 가까운 곳에서.','지금, 특별한 멤버십으로 함께해보세요.'],image:'/illustrations/redesign/hero-woman.png',imageAlt:'흰 니트를 입고 편안한 실내에서 카메라를 바라보는 크리에이터'},
  creators:landingCreators.slice(0,5),
  collage:[landingCreators[2],landingCreators[0],landingCreators[4],landingCreators[3]],
  steps:[
    {icon:'search',title:'1. 크리에이터 찾기',description:['관심 있는 크리에이터를','검색하고 팔로우하세요.']},
    {icon:'card',title:'2. 멤버십 가입하기',description:['원하는 멤버십을 선택하고','지금 바로 함께하세요.']},
    {icon:'heart',title:'3. 특별한 콘텐츠 즐기기',description:['멤버십 전용 콘텐츠와','크리에이터의 일상을 만나보세요.']},
  ],
  notice:'공지사항 화면은 준비 중입니다.',
};
