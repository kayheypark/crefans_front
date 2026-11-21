'use client';
import {useState} from 'react';
import s from './ai-photo.module.css';

// 2026-11-21 user request: on a repeat generation the waiting game is replaced by a short review — 1–5 whole stars,
// 좋아요/별로예요/잘 모르겠어요, optional words (500). Shown while waiting and, if not sent yet, on the result screen.
export type AiReviewSentiment='good'|'bad'|'unsure';
/** 을/를 for the reward phrase (장 → 을, 개 → 를). */
const objectParticle=(word:string)=>{const c=word.charCodeAt(word.length-1)-0xac00;return c>=0&&c<11172&&c%28?'을':'를';};
const sentiments:{value:AiReviewSentiment;label:string}[]=[{value:'good',label:'좋아요'},{value:'bad',label:'별로예요'},{value:'unsure',label:'잘 모르겠어요'}];

export type AiReviewDraft={rating:number;sentiment:AiReviewSentiment|'';comment:string};
export const emptyReviewDraft:AiReviewDraft={rating:0,sentiment:'',comment:''};
/** The draft lives in the editor so it survives the move from the waiting screen to the result screen. */
export function AiPhotoReview({reward,done,draft,onDraft,onSubmit}:{reward:string;done?:string;draft:AiReviewDraft;onDraft:(next:AiReviewDraft)=>void;onSubmit:(input:{rating:number;sentiment:AiReviewSentiment;comment?:string})=>Promise<string>}){
 const {rating,sentiment,comment}=draft,[busy,setBusy]=useState(false),[error,setError]=useState('');
 const setRating=(v:number)=>onDraft({...draft,rating:v}),setSentiment=(v:AiReviewSentiment)=>onDraft({...draft,sentiment:v}),setComment=(v:string)=>onDraft({...draft,comment:v});
 if(done)return <section className={s.review} aria-label="AI 사진 리뷰"><p className={s.reviewDone} role="status"><span aria-hidden="true">✓</span> 고마워요! {done}</p></section>;
 async function send(){if(!rating||!sentiment||busy)return;setBusy(true);setError('');try{const message=await onSubmit({rating,sentiment,...(comment.trim()?{comment:comment.trim()}:{})});if(message)setError(message);}catch{setError('리뷰를 저장하지 못했어요. 다시 시도해 주세요.');}finally{setBusy(false);}}
 return <section className={s.review} aria-label="AI 사진 리뷰">
  <div className={s.reviewHeading}><h4>이번 AI 사진, 어땠어요?</h4><p>리뷰를 남기면 <strong>{reward}</strong>{objectParticle(reward)} 드려요</p></div>
  <div className={s.reviewStars} role="radiogroup" aria-label="별점">{[1,2,3,4,5].map(n=><button key={n} type="button" role="radio" aria-checked={rating===n} aria-label={`별 ${n}개`} data-on={n<=rating||undefined} onClick={()=>setRating(n)}>★</button>)}</div>
  <div className={s.reviewChoices} role="radiogroup" aria-label="한 줄 평가">{sentiments.map(item=><button key={item.value} type="button" role="radio" aria-checked={sentiment===item.value} onClick={()=>setSentiment(item.value)}>{item.label}</button>)}</div>
  <textarea className={s.reviewText} aria-label="하고 싶은 말" placeholder="하고 싶은 말이 있으면 적어 주세요 (선택)" maxLength={500} rows={2} value={comment} onChange={e=>setComment(e.target.value)}/>
  {error&&<p className={s.reviewError} role="alert">{error}</p>}
  <button type="button" className={s.reviewSubmit} disabled={!rating||!sentiment||busy} onClick={()=>void send()}>{busy?'보내는 중…':'리뷰 보내기'}</button>
 </section>;
}
