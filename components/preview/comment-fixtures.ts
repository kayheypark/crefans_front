import type {InboxContact,SocialComment,SocialReply} from '@/types/crefans-social';
import type {CommunityComment} from '@/types/crefans-community';

/** Deliberately messy, deterministic comment threads for mockups: long bodies, empty posts, 2-depth replies, mass mentions. */
export type MessyReply={id:string;author:InboxContact|null;body:string;time:string;mentions:InboxContact[]};
export type MessyThread={id:string;author:InboxContact;fromCreator:boolean;body:string;time:string;mentions:InboxContact[];replies:MessyReply[];hidden:boolean};
const creatorContact:InboxContact={id:'creator',name:'하늘',image:'/illustrations/redesign/hero-woman.png'};
const creatorComments=['오늘 사진 다들 좋게 봐주셔서 고마워요. 다음 편도 곧 올릴게요!','댓글 하나하나 다 읽고 있어요 😊','질문 주신 장소는 다음 게시물에서 정리해서 알려드릴게요.'];

const surnames=['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','전','홍'];
const given=['지민','서연','도윤','하은','시우','지우','수아','예준','하윤','지호','서준','채원','민준','유나','현우','다은','건우','소율','준서','나은','은우','아린','우진','지아'];
const avatars=['/illustrations/redesign/yerin.png','/illustrations/redesign/jiwoo.png','/illustrations/redesign/seoyeon.png','','/illustrations/redesign/minji.png',''];
const times=['방금','3분 전','40분 전','2시간 전','어제','3일 전','지난주','2주 전','2026.08.02','2026.07.19'];
const shortBodies=['ㅋㅋㅋㅋㅋ','오늘도 최고!!','헐','사진 진짜 예뻐요 😍😍😍','다음 편 언제 나와요?','ㅠㅠㅠㅠㅠㅠ','응원합니다','좋아요 누르고 갑니다','???','와 대박','🙏🙏🙏','저도요'];
const sentences=['오늘 올려주신 이야기 보고 하루 종일 기분이 좋았어요.','사실 요즘 일이 많아서 지쳐 있었는데 이렇게 소소한 일상을 나눠주셔서 정말 고마워요.','사진 속 장소는 어디인가요? 저도 꼭 한번 가보고 싶어요!!','지난번 라이브 때 말씀하셨던 촬영 비하인드도 궁금해요. 혹시 다음에 풀어주실 수 있나요?','댓글 처음 남겨보는데 떨리네요 ㅎㅎ','멤버십 가입한 지 6개월 됐는데 후회한 적이 한 번도 없어요.','근데 이번 사진 색감이 평소랑 조금 다른 것 같은데 새로운 카메라인가요? 아니면 보정 방식이 바뀐 건가요? 개인적으로는 이전 톤도 좋았지만 이번 것도 새로운 느낌이라 좋아요.','친구한테도 추천했어요. 곧 가입한대요.','ㅋㅋㅋㅋㅋ 고양이 표정 실화인가요','응원하는 마음 담아 오늘도 좋아요 꾹 누르고 갑니다.'];
const replyBodies=['맞아요 저도 그렇게 생각했어요','ㅋㅋㅋㅋ','저도 궁금해요!!','이거 완전 공감','헐 저는 몰랐네요','@ 태그된 분들 다 보세요 이거','저는 반대 의견이에요. 이전 톤이 더 좋았던 것 같아요. 물론 취향 차이겠지만요. 그래도 새로운 시도 자체는 응원합니다.','ㅠㅠ','다음 주에 오프라인 모임 하는 거 맞죠? 장소 다시 알려주실 수 있나요? 제가 공지 글을 놓쳐서요 죄송합니다'];
const creatorReplies=['고마워요! 다음 이야기도 곧 준비할게요 😊','그 장소는 다음 게시물에서 자세히 소개할게요!','네 맞아요, 새 카메라예요. 색감 피드백 정말 도움이 돼요.','ㅋㅋㅋ 저도 찍으면서 웃었어요','응원 감사합니다. 늘 힘이 돼요.'];

function seeded(seed:number){let state=seed>>>0;return()=>{state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
export const messyFanPool:InboxContact[]=Array.from({length:120},(_,index)=>({id:`fan-${index+1}`,name:index%17===0?`${surnames[index%surnames.length]}${given[(index*7)%given.length]}_${index+1}`:`${surnames[(index*3)%surnames.length]}${given[(index*5)%given.length]}`,image:avatars[index%avatars.length]}));

function longBody(random:()=>number,paragraphs:number){
  const lines:string[]=[];
  for(let paragraph=0;paragraph<paragraphs;paragraph++){const count=2+Math.floor(random()*5);lines.push(Array.from({length:count},()=>sentences[Math.floor(random()*sentences.length)]).join(' '));}
  return lines.join('\n\n').slice(0,1000);
}
function pickFans(random:()=>number,count:number,exclude:string){
  const chosen:InboxContact[]=[];const used=new Set([exclude]);
  while(chosen.length<count&&used.size<messyFanPool.length){const fan=messyFanPool[Math.floor(random()*messyFanPool.length)];if(used.has(fan.id))continue;used.add(fan.id);chosen.push(fan);}
  return chosen;
}
export function messyCommentThreads(postId:string,count:number,seed=7):MessyThread[]{
  const random=seeded(seed+postId.length*31);
  return Array.from({length:count},(_,index)=>{
    const fromCreator=index===2||index%13===10;
    const author=fromCreator?creatorContact:messyFanPool[Math.floor(random()*messyFanPool.length)];
    const roll=random();
    const body=fromCreator?creatorComments[index%creatorComments.length]:roll<0.35?shortBodies[Math.floor(random()*shortBodies.length)]:roll<0.75?sentences[Math.floor(random()*sentences.length)]:longBody(random,1+Math.floor(random()*4));
    const mentionRoll=random();
    const mentionCount=index===3?100:mentionRoll<0.7?0:mentionRoll<0.9?1+Math.floor(random()*5):6+Math.floor(random()*25);
    const replyCount=index===0?0:index===5?3:random()<0.4?0:1+Math.floor(random()*6);
    const replies:MessyReply[]=Array.from({length:replyCount},(__,replyIndex)=>{
      const fromCreator=random()<0.3;
      const replyMentions=index===5&&replyIndex===0?20:random()<0.25?1+Math.floor(random()*3):0;
      return {id:`${postId}-c${index+1}-r${replyIndex+1}`,author:fromCreator?null:messyFanPool[Math.floor(random()*messyFanPool.length)],body:fromCreator?creatorReplies[Math.floor(random()*creatorReplies.length)]:random()<0.15?longBody(random,1):replyBodies[Math.floor(random()*replyBodies.length)],time:times[Math.floor(random()*times.length)],mentions:pickFans(random,replyMentions,author.id)};
    });
    return {id:`${postId}-c${index+1}`,author,fromCreator,body,time:times[Math.floor(random()*times.length)],mentions:fromCreator?[]:pickFans(random,mentionCount,author.id),replies,hidden:!fromCreator&&random()<0.06};
  });
}
export const toSocialComments=(threads:MessyThread[]):SocialComment[]=>threads.map(thread=>({id:thread.id,author:{name:thread.author.name,image:thread.author.image},body:thread.body,time:thread.time,mentions:thread.mentions.map(fan=>({id:fan.id,name:fan.name})),fromCreator:thread.fromCreator||undefined,replyCount:thread.replies.length}));
/** Replies keyed by comment id; the mock serves them only when a fan opens "답글 보기". */
export const toSocialReplies=(threads:MessyThread[]):Record<string,SocialReply[]>=>Object.fromEntries(threads.filter(thread=>thread.replies.length).map(thread=>[thread.id,thread.replies.map(reply=>({id:reply.id,author:reply.author?{name:reply.author.name,image:reply.author.image}:{name:'하늘',image:'/illustrations/redesign/hero-woman.png'},body:reply.body,time:reply.time,mentions:reply.mentions.map(fan=>({id:fan.id,name:fan.name})),fromCreator:!reply.author||undefined}))]));
export const toCommunityComments=(postId:string,threads:MessyThread[]):CommunityComment[]=>threads.map(thread=>({id:thread.id,postId,author:thread.author,body:thread.body,time:thread.time,hidden:thread.hidden,mentions:thread.mentions,replies:thread.replies.map(reply=>({id:reply.id,author:reply.author||undefined,body:reply.body,time:reply.time,mentions:reply.mentions}))}));
