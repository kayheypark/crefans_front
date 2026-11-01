'use client';
import {useEffect,useState} from 'react';

/** Fixed by the loading rule: for the first second after a request the screen does not change. Do not make this configurable. */
export const LOADING_SPINNER_DELAY_MS=1000;

/** True only while `pending` has lasted at least one second. Callers keep the previous list (or nothing on a first load) until then. */
export function useDelayedLoading(pending:boolean){
  const [late,setLate]=useState(false);
  useEffect(()=>{
    if(!pending){setLate(false);return;}
    const timer=setTimeout(()=>setLate(true),LOADING_SPINNER_DELAY_MS);
    return()=>clearTimeout(timer);
  },[pending]);
  return pending&&late;
}
