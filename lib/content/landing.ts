import type {Creator} from '@/types/crefans';
import type {LandingContent} from '@/types/crefans-landing';

export const landingCreators:Creator[] = [
  {id:'moka',isVerified:true,name:'모카의 분홍빛 코스프레와 일상이야기',handle:'moka_cosplay_story_daily',tags:['코스프레','아트'],image:'/illustrations/creators/moka/avatar-v1.png',cover:'/illustrations/creators/moka/cover-v1.png',position:'center 30%',bio:'분홍빛 상상을 코스프레로 만들어요.',about:'안녕하세요, 코스프레 크리에이터 모카예요. 좋아하는 색과 작은 소품으로 나만의 캐릭터를 만들고 있어요.\n\n완성된 화보부터 리본을 고르고 촬영을 준비하는 순간까지, 작업의 여러 모습을 이곳에 기록합니다.',followers:'1.2K',followerCount:1240,followingCount:38,postCount:3,promoted:true,isCreator:true},
  {id:'sion',followersPublic:false,followingPublic:false,isVerified:true,name:'시온',handle:'sion.noir',tags:['코스프레','아트'],image:'/illustrations/creators/sion/avatar-v1.png',cover:'/illustrations/creators/sion/portrait-v1.png',position:'center top',bio:'코스프레로 완성하는 또 다른 나.',about:'안녕하세요, 코스프레 크리에이터 시온입니다.\n\n차가운 북부대공부터 무대 위의 새로운 캐릭터까지, 의상과 표정으로 여러 이야기를 만들어가고 있어요. 완성된 화보와 촬영을 준비하는 과정, 의상에 담은 작은 디테일을 함께 나눕니다.',followers:'860',followerCount:860,followingCount:24,postCount:2,promoted:true,isCreator:true},
  {id:'haneul',isVerified:true,promoted:true,name:'하늘',handle:'haneul',tags:['사진','일상'],image:'/illustrations/redesign/hero-woman.png',position:'67% center',bio:'일상의 특별한 순간을 함께해요',about:'서울에서 사진과 일상을 기록하는 하늘입니다.\n\n필름 카메라로 시작해 지금은 디지털과 필름을 오가며 찍고 있어요. 멤버십에서는 촬영 비하인드와 보정 과정, 그리고 가끔은 그냥 수다도 나눕니다.\n\n편하게 인사 남겨주세요. 댓글은 다 읽고 있어요.',links:{youtube:'https://youtube.com/@haneul',instagram:'https://instagram.com/haneul',facebook:'https://facebook.com/haneul.photo'},followers:'12.4K',followerCount:12400,followingCount:2},
  {id:'jiwoo',isVerified:true,promoted:true,name:'지우',handle:'jiwoo',tags:['여행','캠핑','브이로그'],image:'/illustrations/creators/jiwoo/avatar-trail-v2.png',cover:'/illustrations/creators/jiwoo/cover-lakeside-v2.png',position:'center',bio:'바닷길 산책부터 숲속의 하룻밤까지.',about:'안녕하세요, 여행과 캠핑을 기록하는 지우예요.\n\n멀리 떠나는 날도, 가까운 숲에서 하루를 보내는 날도 좋아해요. 길에서 만난 풍경과 텐트 앞에서 마시는 아침 커피, 천천히 걷다 발견한 순간들을 나눕니다.\n\n멤버십에는 캠핑 준비 과정과 여행 노트를 조금 더 자세히 남겨요. 다음에는 어디로 떠나면 좋을지 편하게 이야기해 주세요.',links:{instagram:'https://instagram.com/jiwoo.travel'},followers:'8.2K'},
  {id:'seoyeon',promoted:true,name:'서연',handle:'seoyeon',tags:['음악','커버'],image:'/illustrations/redesign/variety/seoyeon-music-v3.png',position:'54% 35%',bio:'좋은 음악을 더 가까이',followers:'6.8K'},
  {id:'minji',name:'민지',handle:'minji',tags:['소통','라이브'],image:'/illustrations/redesign/variety/minji-gallery-v3.png',position:'55% 30%',bio:'오늘도, 너와 이야기하고 싶어',followers:'5.1K'},
  {id:'yerin',name:'예린',handle:'yerin',tags:['피트니스','라이프스타일'],image:'/illustrations/redesign/variety/yerin-wellness-v3.png',position:'55% 35%',bio:'더 건강하고, 더 아름답게',followers:'9.3K'},
  {id:'sua',name:'수아',handle:'sua',tags:['일상','사진'],image:'/illustrations/redesign/minji.png',position:'center',bio:'작은 행복을 기록해요',followers:'3.6K'},
];

export const landingAssetContent:LandingContent={
  hero:{title:['좋아하는 크리에이터를','더 가까이, 더 특별하게'],description:['크리에이터의 진짜 이야기를 가장 가까운 곳에서.','지금, 특별한 멤버십으로 함께해보세요.'],image:'/illustrations/creators/moka/cover-v1.png',imageAlt:'분홍 머리와 리본으로 코스프레 촬영을 하는 가상 크리에이터 모카',position:'center top'},
  creators:landingCreators.slice(0,5),
  collage:[landingCreators[0],landingCreators[2],landingCreators[6],landingCreators[5]],
  steps:[
    {icon:'search',title:'1. 크리에이터 찾기',description:['관심 있는 크리에이터를','검색하고 팔로우하세요.']},
    {icon:'card',title:'2. 멤버십 가입하기',description:['원하는 멤버십을 선택하고','지금 바로 함께하세요.']},
    {icon:'heart',title:'3. 특별한 콘텐츠 즐기기',description:['멤버십 전용 콘텐츠와','크리에이터의 일상을 만나보세요.']},
  ],
  notice:'공지사항 화면은 준비 중입니다.',
};
