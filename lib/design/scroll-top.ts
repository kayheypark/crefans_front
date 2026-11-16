'use client';
import {useEffect,useRef} from 'react';

/** Scrolls the page to the top: the window (desktop, studio) and the mobile service shell body ([data-service-scroll]). */
export function scrollPageToTop(){if(typeof window==='undefined')return;window.scrollTo?.(0,0);document.querySelector<HTMLElement>('[data-service-scroll]')?.scrollTo(0,0);}

/** For flows that swap the whole screen on the same route (step 1 → 2, form → result): start the new step from the top.
 * Skips the first render so entering the page keeps the router's own scroll handling. */
export function useScrollTopOnChange(key:string){
 const first=useRef(true);
 useEffect(()=>{if(first.current){first.current=false;return;}scrollPageToTop();},[key]);
}
