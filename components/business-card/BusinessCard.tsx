'use client';
import {useEffect,useRef,useState} from 'react';
import styles from './business-card.module.css';

const introduction='https://beta.crefans.com/service/landing';
const totalDuration=7500;
export default function BusinessCard(){
 const card=useRef<HTMLImageElement>(null),back=useRef<HTMLImageElement>(null),elapsedRef=useRef(0);
 const [elapsed,setElapsed]=useState(0),[paused,setPaused]=useState(false),[replay,setReplay]=useState(0);
 const [frontLoaded,setFrontLoaded]=useState(false),[backLoaded,setBackLoaded]=useState(false),[failed,setFailed]=useState(false);
 const ready=frontLoaded&&backLoaded;
 useEffect(()=>{
  if(card.current?.complete&&card.current.naturalWidth>0)setFrontLoaded(true);
  if(back.current?.complete&&back.current.naturalWidth>0)setBackLoaded(true);
 },[]);
 useEffect(()=>{
  if(!ready||paused||failed)return;
  let previous=window.performance.now(),frame=0;
  const pageDocument=typeof document==='undefined'?null:document;
  const resetClock=()=>{previous=window.performance.now();};
  pageDocument?.addEventListener('visibilitychange',resetClock);
  const tick=()=>{
   const now=window.performance.now();
   const delta=now-previous;previous=now;
   // Hidden or stalled frames are not time the visitor spent seeing the card.
   if(pageDocument?.visibilityState!=='hidden')elapsedRef.current=Math.min(totalDuration,elapsedRef.current+Math.min(delta,100));
   setElapsed(elapsedRef.current);
   if(elapsedRef.current<totalDuration)frame=window.requestAnimationFrame(tick);
  };
  frame=window.requestAnimationFrame(tick);
  return ()=>{window.cancelAnimationFrame(frame);pageDocument?.removeEventListener('visibilitychange',resetClock);};
 },[ready,paused,failed,replay]);
 useEffect(()=>{if(elapsed>=totalDuration&&!paused&&!failed)window.location.replace(introduction);},[elapsed,paused,failed]);
 const phase=failed?'front':!ready?'loading':elapsed<800?'entering':elapsed<1800?'back':elapsed<2500?'flipping':'front';
 const rise=1-Math.pow(1-Math.min(1,elapsed/800),3),flip=Math.max(0,Math.min(1,(elapsed-1800)/700));
 const rotation=180*(1-flip*flip*(3-2*flip)),progress=Math.max(0,Math.min(1,(elapsed-2500)/5000));
 const imageError=()=>{setFailed(true);setPaused(true);};
 const restart=()=>{elapsedRef.current=0;setElapsed(0);setPaused(false);setReplay(value=>value+1);};
 return <main className={`${styles.page} ${paused?styles.paused:''}`}>
  <section className={styles.content} aria-label="박경호 대표 명함">
   <h1 key={replay} className={styles.heading}>안녕하세요, 만나서 반갑습니다.</h1>
   <div className={styles.scene} data-phase={phase}>
    <div className={styles.entrance} style={{opacity:failed?1:ready?rise:undefined,transform:ready?`translateY(${(1-rise)*90}px) rotateX(${(1-rise)*65}deg) rotateZ(${(1-rise)*-5}deg)`:undefined}}>
     <div className={styles.card} style={{transform:ready||failed?`rotateY(${failed?0:rotation}deg)`:undefined}}>
      <div className={styles.face}>
       <img ref={card} src="/brand/business-cards/khpark-front.png?v=charcoal-20261029" width="1364" height="756" alt="크레팬스 박경호 대표, Gyeongho Park. 전화 010-3211-3164, 이메일 khpark@crefans.com, 웹사이트 crefans.com. 주소 08706 서울특별시 관악구 관천로24길 43, 301호." onLoad={()=>setFrontLoaded(true)} onError={imageError}/>
      </div>
      <div className={`${styles.face} ${styles.back}`}>
       <img ref={back} src="/brand/business-cards/khpark-back.png?v=charcoal-20261029" width="1364" height="756" alt="크레팬스 명함 뒷면" aria-hidden="true" onLoad={()=>setBackLoaded(true)} onError={imageError}/>
      </div>
     </div>
    </div>
   </div>
   <div className={styles.playback}>
    <div className={styles.progress} role="progressbar" aria-label="서비스 소개 자동 입장" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress*100)}>
     <span className={styles.progressFill} style={{transform:`scaleX(${progress})`}}/>
    </div>
    <div className={styles.controls} role="group" aria-label="명함 재생 제어">
     <button type="button" aria-label="중지" title="중지" disabled={!ready||paused||failed} onClick={()=>setPaused(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg></button>
     <button type="button" aria-label="재생" title="재생" disabled={!ready||!paused||failed} onClick={()=>setPaused(false)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg></button>
     <button type="button" aria-label="다시보기" title="다시보기" disabled={!ready||failed} onClick={restart}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/></svg></button>
    </div>
   </div>
  </section>
 </main>;
}
