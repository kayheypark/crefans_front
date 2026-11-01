'use client';
import {useEffect,useRef,useState,useSyncExternalStore,type CSSProperties} from 'react';
import {Toggle} from './Toggle';
import s from './marquee-text.module.css';

const preferenceKey='crefans:text-motion',changeEvent='crefans:text-motion-change';
let paused=false;
function subscribe(listener:()=>void){
  if(typeof window==='undefined')return ()=>{};
  try{paused=localStorage.getItem(preferenceKey)==='off';}catch{}
  const update=()=>{try{paused=localStorage.getItem(preferenceKey)==='off';}catch{}listener();};
  window.addEventListener('storage',update);window.addEventListener(changeEvent,listener);
  return()=>{window.removeEventListener('storage',update);window.removeEventListener(changeEvent,listener);};
}
const snapshot=()=>paused,serverSnapshot=()=>false;
function useTextMotionPaused(){return useSyncExternalStore(subscribe,snapshot,serverSnapshot);}

/** Full text exists once for assistive technology; only overflowing labels move. */
export function MarqueeText({text,className=''}:{text:string;className?:string}){
  const viewport=useRef<HTMLSpanElement>(null),track=useRef<HTMLSpanElement>(null);
  const [distance,setDistance]=useState(0),stopped=useTextMotionPaused();
  useEffect(()=>{
    const box=viewport.current,line=track.current;if(!box||!line)return;
    let frame=0,live=true;
    const measure=()=>{if(!live)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(live)setDistance(Math.max(0,line.scrollWidth-box.clientWidth));});};
    const observer=new ResizeObserver(measure);observer.observe(box);observer.observe(line);
    measure();void document.fonts?.ready.then(measure);
    return()=>{live=false;cancelAnimationFrame(frame);observer.disconnect();};
  },[text,stopped]);
  return <span ref={viewport} className={`${s.viewport} ${className}`} data-marquee data-overflow={distance>1} data-paused={stopped} title={text} style={{'--marquee-end':`${-distance}px`,'--marquee-duration':`${Math.max(6,distance/26+2.4)}s`} as CSSProperties}><span ref={track} className={s.track}>{text}</span></span>;
}

/** Device preference shared across pages; stopping reveals full labels without motion. */
export function MarqueeMotionControl(){
  const stopped=useTextMotionPaused();
  function setEnabled(enabled:boolean){paused=!enabled;try{localStorage.setItem(preferenceKey,paused?'off':'on');}catch{}window.dispatchEvent(new Event(changeEvent));}
  return <Toggle label="텍스트 움직임" checked={!stopped} onChange={setEnabled}/>;
}

