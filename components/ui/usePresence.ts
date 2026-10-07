'use client';
import {useEffect,useState} from 'react';

/** Keep an outgoing surface mounted until its exit animation finishes. */
export function usePresence(visible:boolean,duration:number){
  const [present,setPresent]=useState(visible);
  useEffect(()=>{
    if(visible){setPresent(true);return;}
    const reduced=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if(reduced){setPresent(false);return;}
    const timer=setTimeout(()=>setPresent(false),duration);
    return()=>clearTimeout(timer);
  },[visible,duration]);
  return visible||present;
}
