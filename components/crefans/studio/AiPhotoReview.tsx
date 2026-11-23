'use client';
import {useState} from 'react';
import Image from 'next/image';
import {Action} from '@/components/crefans/ServiceUI';
import {Dialog} from '@/components/ui/Primitives';
import s from './ai-photo.module.css';
import type {AiReviewReward} from '@/types/crefans-studio-management';

// 2026-11-21 user request: on a repeat generation the waiting game is replaced by a short review — 1–5 whole stars,
// 좋아요/별로예요/잘 모르겠어요, optional words (500). Shown while waiting and, if not sent yet, on the result screen.
export type AiReviewSentiment='good'|'bad'|'unsure';
const sentiments:{value:AiReviewSentiment;label:string}[]=[
 {value:'bad',label:'별로예요'},
 {value:'unsure',label:'잘 모르겠어요'},
 {value:'good',label:'좋아요'},
];
const reviewArt='/brand/ai-photo/review';

// 2026-11-23 user decision: starts at 5 stars + 좋아요; `touched` tells the server whether the defaults were sent unchanged.
export type AiReviewDraft={rating:number;sentiment:AiReviewSentiment|'';comment:string;touched?:boolean};
export const defaultReviewDraft:AiReviewDraft={rating:5,sentiment:'good',comment:'',touched:false};
/** The draft lives in the editor so it survives the move from the waiting screen to the result screen. */
export function AiPhotoReview({done,reward,draft,onDraft,onSubmit}:{done?:string;reward?:AiReviewReward;draft:AiReviewDraft;onDraft:(next:AiReviewDraft)=>void;onSubmit:(input:{rating:number;sentiment:AiReviewSentiment;comment?:string;defaultsKept:boolean})=>Promise<string|{invalidComment:string}>}){
 const {rating,sentiment,comment}=draft,[busy,setBusy]=useState(false),[error,setError]=useState(''),[invalidComment,setInvalidComment]=useState('');
 const setRating=(v:number)=>onDraft({...draft,rating:v,touched:true}),setSentiment=(v:AiReviewSentiment)=>onDraft({...draft,sentiment:v,touched:true}),setComment=(v:string)=>onDraft({...draft,comment:v});
 if(done)return <section className={s.review} aria-label="AI 사진 리뷰"><p className={s.reviewDone} role="status"><span aria-hidden="true">✓</span> 고마워요! {done}</p></section>;
 async function send(){if(!rating||!sentiment||busy)return;setBusy(true);setError('');try{const message=await onSubmit({rating,sentiment,...(comment.trim()?{comment:comment.trim()}:{}),defaultsKept:!draft.touched});if(typeof message==='string')setError(message);else setInvalidComment(message.invalidComment);}catch{setError('리뷰를 저장하지 못했어요. 다시 시도해 주세요.');}finally{setBusy(false);}}
 return <><section className={s.review} aria-label="AI 사진 리뷰">
  <div className={s.reviewHeading}>
   <h4>이 서비스, 괜찮아 보이나요?</h4>
   <Image src={`${reviewArt}/ticket.webp`} width={61} height={61} alt="" unoptimized/>
  </div>
  {reward&&<dl className={s.reviewReward} aria-label="리뷰 보상">
   <div><dt>별점만 남기면</dt><dd>{reward.unit==='hearts'?`하트 ${reward.rating}개`:`체험 이용권 ${reward.rating}장`}</dd></div>
   <div><dt>한마디까지 쓰면</dt><dd>{reward.unit==='hearts'?`하트 ${reward.comment}개`:`체험 이용권 ${reward.comment}장`}</dd></div>
  </dl>}
  <div>
   <p className={s.reviewFieldLabel}>별점</p>
   <div className={s.reviewStars} role="radiogroup" aria-label="별점" aria-required="true">
    {[1,2,3,4,5].map(n=><button key={n} type="button" role="radio" aria-checked={rating===n} aria-label={`별 ${n}개`} data-on={n<=rating||undefined} onClick={()=>setRating(n)}>
     <svg width="40" height="40" aria-hidden="true" viewBox="0 0 24 24"><path d="M11.45 3.15Q12.00 2.00 12.55 3.15L14.33 6.89Q14.88 8.04 16.14 8.20L20.25 8.74Q21.51 8.91 20.59 9.78L17.58 12.64Q16.66 13.51 16.89 14.76L17.65 18.84Q17.88 20.09 16.76 19.48L13.12 17.51Q12.00 16.90 10.88 17.51L7.24 19.48Q6.12 20.09 6.35 18.84L7.11 14.76Q7.34 13.51 6.42 12.64L3.41 9.78Q2.49 8.91 3.75 8.74L7.86 8.20Q9.12 8.04 9.67 6.89Z"/></svg>
    </button>)}
   </div>
  </div>
  <div>
   <p className={s.reviewFieldLabel}>한 줄 평가</p>
   <div className={s.reviewChoices} role="radiogroup" aria-label="한 줄 평가" aria-required="true">
    {sentiments.map(item=><button key={item.value} type="button" role="radio" aria-checked={sentiment===item.value} onClick={()=>setSentiment(item.value)}>
     <Image src={`${reviewArt}/${item.value}-v2.webp`} width={34} height={34} alt="" unoptimized/>
     <span>{item.label}</span>
    </button>)}
   </div>
  </div>
  {rating===1&&!!reward?.detailedOneStarTickets&&<aside className={s.reviewDetailReward} aria-label="상세 피드백 보상">
   <div className={s.reviewDetailHeading}>
    <h5>어떤 점이 아쉬웠나요?</h5>
    <strong>{reward.unit==='tickets'?'체험 ':''}이용권 {reward.detailedOneStarTickets}장</strong>
   </div>
   <p>자세히 알려주시면 서비스 개선에 도움이 돼요. AI가 구체적인 이유를 확인하면 보상을 드려요.</p>
   <p className={s.reviewDetailNote}>이 의견은 공개되지 않아요.{reward.unit==='tickets'&&' 비회원은 같은 네트워크에서 하루 한 번 받을 수 있어요.'}</p>
  </aside>}
  <label>
   <span className={s.reviewFieldLabel}>응원메시지 <span className={s.reviewOptional}>선택</span></span>
   <textarea className={s.reviewText} placeholder="좋은 점, 아쉬운 점, 응원메시지 모두!" maxLength={500} rows={2} value={comment} onChange={e=>setComment(e.target.value)}/>
   <span className={s.reviewOptional}>의견 확인을 위해 OpenAI(해외)로 보내요. 개인정보는 쓰지 마세요.</span>
  </label>
  {error&&<p className={s.reviewError} role="alert">{error}</p>}
  <button type="button" className={s.reviewSubmit} disabled={!rating||!sentiment||busy} onClick={()=>void send()}>{busy?'보내는 중…':'리뷰 보내기'}</button>
 </section>
  <Dialog open={!!invalidComment} onClose={()=>setInvalidComment('')} title="한마디를 확인해 주세요">
   <div className={s.errorMessage}>
    <p>{invalidComment}</p>
    <Action type="button" onClick={()=>setInvalidComment('')}>확인</Action>
   </div>
  </Dialog>
 </>;
}
