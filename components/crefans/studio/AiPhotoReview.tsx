'use client';
import {useState} from 'react';
import Image from 'next/image';
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
/** 2026-11-23: the reward depends on writing a comment, not on the score. */
export function reviewRewardText(reward?:AiReviewReward){
 if(!reward)return '';
 return reward.unit==='tickets'?`별점만 체험 이용권 ${reward.rating}장 · 한마디까지 쓰면 ${reward.comment}장`:`별점만 하트 ${reward.rating} · 한마디까지 쓰면 하트 ${reward.comment}`;
}
/** The draft lives in the editor so it survives the move from the waiting screen to the result screen. */
export function AiPhotoReview({done,reward,draft,onDraft,onSubmit}:{done?:string;reward?:AiReviewReward;draft:AiReviewDraft;onDraft:(next:AiReviewDraft)=>void;onSubmit:(input:{rating:number;sentiment:AiReviewSentiment;comment?:string;defaultsKept:boolean})=>Promise<string>}){
 const {rating,sentiment,comment}=draft,[busy,setBusy]=useState(false),[error,setError]=useState('');
 const setRating=(v:number)=>onDraft({...draft,rating:v,touched:true}),setSentiment=(v:AiReviewSentiment)=>onDraft({...draft,sentiment:v,touched:true}),setComment=(v:string)=>onDraft({...draft,comment:v});
 if(done)return <section className={s.review} aria-label="AI 사진 리뷰"><p className={s.reviewDone} role="status"><span aria-hidden="true">✓</span> 고마워요! {done}</p></section>;
 async function send(){if(!rating||!sentiment||busy)return;setBusy(true);setError('');try{const message=await onSubmit({rating,sentiment,...(comment.trim()?{comment:comment.trim()}:{}),defaultsKept:!draft.touched});if(message)setError(message);}catch{setError('리뷰를 저장하지 못했어요. 다시 시도해 주세요.');}finally{setBusy(false);}}
 return <section className={s.review} aria-label="AI 사진 리뷰">
  <div className={s.reviewHeading}>
   <h4>이번 AI 사진, 어땠어요?</h4>
   <Image src={`${reviewArt}/ticket.webp`} width={61} height={61} alt="" unoptimized/>
  </div>
  {reward&&<p className={s.reviewReward}>{reviewRewardText(reward)}</p>}
  <div>
   <p className={s.reviewFieldLabel}>별점</p>
   <div className={s.reviewStars} role="radiogroup" aria-label="별점" aria-required="true">
    {[1,2,3,4,5].map(n=><button key={n} type="button" role="radio" aria-checked={rating===n} aria-label={`별 ${n}개`} data-on={n<=rating||undefined} onClick={()=>setRating(n)}>
     <svg width="27" height="27" aria-hidden="true" viewBox="0 0 24 24"><path d="M11.45 3.15Q12.00 2.00 12.55 3.15L14.33 6.89Q14.88 8.04 16.14 8.20L20.25 8.74Q21.51 8.91 20.59 9.78L17.58 12.64Q16.66 13.51 16.89 14.76L17.65 18.84Q17.88 20.09 16.76 19.48L13.12 17.51Q12.00 16.90 10.88 17.51L7.24 19.48Q6.12 20.09 6.35 18.84L7.11 14.76Q7.34 13.51 6.42 12.64L3.41 9.78Q2.49 8.91 3.75 8.74L7.86 8.20Q9.12 8.04 9.67 6.89Z"/></svg>
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
  <label>
   <span className={s.reviewFieldLabel}>한마디 <span className={s.reviewOptional}>선택</span></span>
   <textarea className={s.reviewText} placeholder="어떤 점이 좋았거나 아쉬웠나요? 한국어로 구체적으로 써 주세요." maxLength={500} rows={2} value={comment} onChange={e=>setComment(e.target.value)}/>
   <span className={s.reviewOptional}>한마디는 의견인지 확인하려고 OpenAI(해외)로 보내요. 이름·연락처 같은 개인정보는 쓰지 마세요.</span>
  </label>
  {error&&<p className={s.reviewError} role="alert">{error}</p>}
  <button type="button" className={s.reviewSubmit} disabled={!rating||!sentiment||busy} onClick={()=>void send()}>{busy?'보내는 중…':'리뷰 보내기'}</button>
 </section>;
}
