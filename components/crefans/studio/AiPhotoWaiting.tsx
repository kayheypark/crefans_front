'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import s from './ai-photo.module.css';

type Kind='heart'|'candy'|'moon';
type Piece={id:number;kind:Kind;lane:number;delay:number;duration:number;expires:number;burst:boolean};
const names:Record<Kind,string>={heart:'하트',candy:'별사탕',moon:'달'};
function Symbol({kind}:{kind:Kind}){return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">{kind==='heart'?<path d="M12 21s-9-5.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12Z"/>:kind==='moon'?<path d="M20.7 15.5A9 9 0 0 1 8.5 3.3 9.5 9.5 0 1 0 20.7 15.5Z"/>:<path d="m12 1 2.5 5.5 5.8-1-1 5.5 4.2 4-5.7 1.5L16 22l-4-3-4 3-1.8-5.5L.5 15l4.2-4-1-5.5 5.8 1Z"/>}</svg>;}
function newPiece(id:number,kind:Kind,delay=0,level=0):Piece{const duration=(kind==='heart'?5:3.2)/Math.pow(1.2,Math.min(level,5));return {id,kind,lane:(id-1)%5,delay,duration,expires:Date.now()+(duration+delay)*1000,burst:false};}

// Local amusement only: no generation input, network requests, rewards or saved score.
export function AiPhotoWaiting({elapsed,typical,score,onCollect}:{elapsed:number;typical?:number|null;score:number;onCollect:(delta:number)=>void}){
 const [pieces,setPieces]=useState<Piece[]>(()=>['heart','candy','heart','moon','heart'].map((kind,index)=>newPiece(index+1,kind as Kind,-index*.45)));
 const nextId=useRef(6),collected=useRef(new Set<number>()),caught=useRef(0),liveScore=useRef(score);
 const [finished,setFinished]=useState(score>=30);
 function changeScore(delta:number){if(liveScore.current>=30)return;const next=Math.max(0,Math.min(30,liveScore.current+delta));onCollect(next-liveScore.current);liveScore.current=next;if(next===30){setFinished(true);setPieces([]);}}
 useEffect(()=>{if(finished)return;const timer=setInterval(()=>{const id=nextId.current++,roll=Math.random(),piece=newPiece(id,roll<.7?'heart':roll<.85?'candy':'moon',0,Math.floor(caught.current/5));setPieces(previous=>[...previous.filter(item=>item.expires>Date.now()),piece]);},650);return()=>clearInterval(timer);},[finished]);
 function collect(piece:Piece){if(liveScore.current>=30||piece.expires<=Date.now()||piece.burst||collected.current.has(piece.id))return;collected.current.add(piece.id);if(piece.kind==='heart')caught.current++;changeScore(piece.kind==='heart'?1:-1);setPieces(previous=>previous.map(item=>item.id===piece.id?{...item,burst:true,expires:Date.now()+380}:item));}
 return <div className={s.waiting}>
  <p className={s.waitingSubtitle}>완성되면 바로 보여드릴게요</p>
  <div className={s.waitingDots} aria-hidden="true"><i/><i/><i/></div>
  <section className={s.heartGame} aria-label="기다리는 동안 하트 모으기">
   <div className={s.heartGameHeading}><h4>기다리는 동안 <span>하트 모으기</span></h4><output aria-label="모은 하트" aria-live="polite"><Symbol kind="heart"/>{score}</output></div>
   <div className={s.heartPlayfield} onClick={()=>changeScore(-1)}>
    {/* eslint-disable-next-line @next/next/no-img-element -- existing generated mascot, decorative */}
    <img className={s.heartMascot} src="/brand/ai-photo/pose-mascot/pose-01-v1.webp" alt="" draggable={false}/>
    {finished?<p className={s.heartFinished} role="status">하트 30개를 모았어요!<br/>사진이 완성될 때까지 잠시 기다려 주세요.</p>:pieces.map(piece=><button key={piece.id} type="button" className={s.collectHeart} data-kind={piece.kind} data-burst={piece.burst||undefined} aria-label={`${names[piece.kind]} ${piece.id}${piece.kind==='heart'?' 모으기':' 피하기 · 하트 1개 차감'}`} disabled={piece.burst} style={{top:`${6+piece.lane*18}%`,animationDelay:`${piece.delay}s`,animationDuration:`${piece.duration}s`,'--rest-left':`${8+piece.id%3*27}%`} as CSSProperties} onClick={event=>{event?.stopPropagation();collect(piece);}}>
     {piece.burst?<span className={s.heartBurst} aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 2v8m0 28v8M2 24h8m28 0h8M8 8l6 6m20 20 6 6M8 40l6-6m20-20 6-6"/></svg><b>{piece.kind==='heart'?'+1':'−1'}</b></span>:<Symbol kind={piece.kind}/>}
    </button>)}
   </div>
   <p className={s.heartGameHint}>하트 +1 · 별사탕·달·빈 공간 −1 · 최대 30개</p>
  </section>
  <p className={s.waitingNote}>게임은 사진 결과에 영향을 주지 않아요</p>
  <div className={s.waitingTime}><span aria-hidden="true">{elapsed}초 지남</span><p>{typical?`보통 약 ${typical}초 걸려요.`:'걸리는 시간을 재는 중이에요.'}</p></div>
  <p className={s.waitingNote}>잠시만 화면을 유지해 주세요</p>
 </div>;
}
