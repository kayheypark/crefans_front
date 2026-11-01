import {beanChargeKrwPerBean} from '@/lib/crefans/bean-pricing';
import type {Post} from '@/types/crefans';
import type {BeanCharge,BeanTip,BeanWallet} from '@/types/crefans-beans';

const date=(daysAgo:number)=>new Date(Date.UTC(2026,9,26)-daysAgo*86400000).toISOString();
const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;

export function createMockBeanHistory(creators:{id:string;name:string;image?:string;handle?:string;isVerified?:boolean}[],posts:Post[]=[]){
 const paidQuantities=[1000,1000,1000,500,300,100,50,30,10,10];
 const charges:BeanCharge[]=paidQuantities.map((quantity,index)=>({id:id(index+1),quantity,amount:quantity*beanChargeKrwPerBean,status:'paid',environment:'test',createdAt:date(48-index+1/1440),paidAt:date(48-index)}));
 ['failed','cancelled','disputed','processing','pending','failed','cancelled','disputed','processing','pending'].forEach((status,index)=>{
  const quantity=[10,30,50,100,300][index%5];
  charges.push({id:id(index+11),quantity,amount:quantity*beanChargeKrwPerBean,status,environment:'test',createdAt:date(10-index+1/1440)});
 });
 const recipients=['moka','jiwoo','sion'].flatMap(key=>{const creator=creators.find(c=>c.id===key);return creator?[creator]:[];});
 const messages=[
  '새로운 작품도 기대할게요! 늘 응원합니다 💚',
  '여행 사진 덕분에 잠깐 쉬어가는 기분이었어요. 다음 캠핑 이야기도 기다릴게요.',
  '',
  '촬영 비하인드까지 정성스럽게 남겨주셔서 감사해요.\n의상과 소품을 준비하는 과정도 정말 재미있게 봤습니다. 오래 걸리더라도 편한 속도로 작업해주세요. 다음 작품도 함께 기다리고 응원할게요!',
  '오늘도 좋은 하루 보내세요!',
 ];
 const quantities=[...Array.from({length:24},(_,i)=>[10,30,50,100][i%4]),10,50,100,300];
 const tips:BeanTip[]=recipients.length?quantities.map((quantity,index)=>{
  const creator=recipients[index%recipients.length],promotion=index===27?100:0;
  const post=index%2===0?posts.find(p=>p.creatorId===creator.id):undefined;
  return {post_id:post?.id,sourceType:post?'post':'profile',postTitle:post?.title,postTitleSource:post?'snapshot':null,postAvailable:!!post,id:id(index+101),sender_id:'mock-fan',creator_id:creator.id,creatorName:creator.name,creatorAvatar:creator.image,creatorHandle:creator.handle,creatorIsVerified:creator.isVerified,quantity,paid_quantity:quantity-promotion,promotion_quantity:promotion,message:messages[index%messages.length],created_at:date(index+1)};
 }):[];
 // Opening balances already include this history: 4,000 charged - 1,500 paid tips;
 // 200 promotional - 100 promotional tips; 3,000 paid and 50 promotional earnings.
 const entries:BeanWallet['entries']=[
  {id:id(201),delta:'200',created_at:date(60),movement:{reason:'웰컴 프로모션콩 지급',kind:'promotion'}},
  {id:id(202),delta:'3000',created_at:date(5.5),movement:{reason:'일반콩 후원 수익 적립',kind:'tip'}},
  {id:id(203),delta:'50',created_at:date(4.5),movement:{reason:'프로모션콩 후원 수익 적립',kind:'tip'}},
 ];
 const received:BeanTip[]=[{id:id(301),sender_id:'mock-supporter-1',senderName:'봄날',creator_id:'haneul',quantity:2000,paid_quantity:2000,promotion_quantity:0,message:'사진 잘 봤어요!',created_at:date(5.5),post_id:'morning',sourceType:'post',postTitle:posts.find(p=>p.id==='morning')?.title||'오늘도 좋은 하루였어요',postTitleSource:'snapshot',postAvailable:true},{id:id(302),sender_id:'mock-supporter-2',senderName:'여름',creator_id:'haneul',quantity:1050,paid_quantity:1000,promotion_quantity:50,message:'늘 응원합니다',created_at:date(4.5),sourceType:'profile'}];
 return {charges,tips,entries:entries.map(e=>({...e,movement:e.movement?.kind==='tip'?{...e.movement,tip:e.id===id(202)?received[0]:received[1]}:e.movement})),received};
}
