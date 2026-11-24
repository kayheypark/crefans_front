import s from './ai-photo.module.css';

export function AiSwipeHint({crop=false,onDone}:{crop?:boolean;onDone:()=>void}){
 return <span className={s.swipeOverlay} aria-hidden="true" onAnimationEnd={event=>{if(event.target===event.currentTarget)onDone();}}>
  {/* eslint-disable-next-line @next/next/no-img-element -- existing decorative swipe hand */}
  <img className={crop?`${s.swipeHand} ${s.cropHand}`:s.swipeHand} src="/brand/ai-photo/swipe-hand-v2.webp" alt="" width={64} height={64}/>
  <span>{crop?'상하좌우로 밀어 사진 위치를 조절해 보세요':'좌우로 밀어서 넘겨 보세요'}</span>
 </span>;
}
