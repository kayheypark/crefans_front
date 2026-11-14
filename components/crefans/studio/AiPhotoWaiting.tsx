'use client';
import {useState} from 'react';
import s from './ai-photo.module.css';

const heartPositions=[[[10,12],[16,18]],[[48,3],[42,9]],[[27,39],[21,45]],[[46,33],[40,27]],[[5,66],[11,60]]] as const;
function Heart(){return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-9-5.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12Z"/></svg>;}

// Local amusement only: no generation input, network requests, rewards or saved score.
export function AiPhotoWaiting({elapsed,typical}:{elapsed:number;typical?:number|null}){
 const [hits,setHits]=useState([0,0,0,0,0]),score=hits.reduce((sum,value)=>sum+value,0);
 return <div className={s.waiting}>
  <p className={s.waitingSubtitle}>완성되면 바로 보여드릴게요</p>
  <div className={s.waitingDots} aria-hidden="true"><i/><i/><i/></div>
  <section className={s.heartGame} aria-label="기다리는 동안 하트 모으기">
   <div className={s.heartGameHeading}><h4>기다리는 동안 <span>하트 모으기</span></h4><output aria-label="모은 하트" aria-live="polite"><Heart/>{score}</output></div>
   <div className={s.heartPlayfield}>
    {/* eslint-disable-next-line @next/next/no-img-element -- existing generated mascot, decorative */}
    <img className={s.heartMascot} src="/brand/ai-photo/pose-mascot/pose-01-v1.webp" alt="" draggable={false}/>
    {heartPositions.map((positions,index)=>{const [left,top]=positions[hits[index]%2];return <button key={index} type="button" className={s.collectHeart} aria-label={`하트 ${index+1} 모으기`} style={{left:`${left}%`,top:`${top}%`}} onClick={()=>setHits(previous=>previous.map((value,i)=>i===index?value+1:value))}><span style={{animationDelay:`${index*-.6}s`}}><Heart/></span></button>;})}
   </div>
   <p className={s.heartGameHint}>하트를 톡톡 눌러보세요</p>
  </section>
  <p className={s.waitingNote}>게임은 사진 결과에 영향을 주지 않아요</p>
  <div className={s.waitingTime}><span aria-hidden="true">{elapsed}초 지남</span><p>{typical?`보통 약 ${typical}초 걸려요.`:'걸리는 시간을 재는 중이에요.'}</p></div>
  <p className={s.waitingNote}>잠시만 화면을 유지해 주세요</p>
 </div>;
}
