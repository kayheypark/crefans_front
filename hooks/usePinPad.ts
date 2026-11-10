'use client';

import {useCallback,useEffect,useRef,useState} from 'react';

/** The parts of a DOM or React keyboard event the pad reads. */
export type PinKey={key:string;metaKey:boolean;ctrlKey:boolean;altKey:boolean;preventDefault:()=>void};

// Shuffled-keypad PIN entry state (2026-11-11). The digits are re-shuffled every time the pad is reset so the position of
// a key does not reveal the PIN to someone watching. The value lives only in this hook's state: it is never written to an
// input, form field or storage, and the caller clears it after each attempt.
export const PIN_LENGTH=6;
const DIGITS=['0','1','2','3','4','5','6','7','8','9'];

function randomIndex(max:number){
  const cryptoApi=globalThis.crypto;
  if(cryptoApi?.getRandomValues){const bucket=new Uint32Array(1),limit=Math.floor(0x100000000/max)*max;let value;do{cryptoApi.getRandomValues(bucket);value=bucket[0];}while(value>=limit);return value%max;}
  return Math.floor(Math.random()*max);
}
/** Fisher–Yates with an unbiased crypto source. */
export function shuffledDigits(next:(max:number)=>number=randomIndex){
  const digits=[...DIGITS];
  for(let i=digits.length-1;i>0;i--){const j=next(i+1);[digits[i],digits[j]]=[digits[j],digits[i]];}
  return digits;
}

export type PinPad={
  value:string;length:number;complete:boolean;disabled:boolean;
  /** Ten digits in keypad order; ordered until mounted so server and client markup match, then shuffled. */
  layout:string[];
  press:(digit:string)=>void;backspace:()=>void;clear:()=>void;
  /** Clears the entry and shuffles the keys again (use after every failed or cancelled attempt). */
  reset:()=>void;
  /** Physical keyboard on PC: digits, Backspace, Delete/Escape clears. */
  onKeyDown:(event:PinKey)=>void;
};

export function usePinPad({length=PIN_LENGTH,onComplete,disabled=false}:{length?:number;onComplete?:(pin:string)=>void;disabled?:boolean}={}):PinPad{
  const [value,setValue]=useState(''),[layout,setLayout]=useState(DIGITS);
  const current=useRef(''),complete=useRef(onComplete);complete.current=onComplete;
  useEffect(()=>{setLayout(shuffledDigits());},[]);
  const update=useCallback((next:string)=>{current.current=next;setValue(next);},[]);
  const press=useCallback((digit:string)=>{
    if(disabled||!/^\d$/.test(digit)||current.current.length>=length)return;
    const next=current.current+digit;update(next);
    if(next.length===length)complete.current?.(next);
  },[disabled,length,update]);
  const backspace=useCallback(()=>{if(!disabled)update(current.current.slice(0,-1));},[disabled,update]);
  const clear=useCallback(()=>{if(!disabled)update('');},[disabled,update]);
  const reset=useCallback(()=>{update('');setLayout(shuffledDigits());},[update]);
  const onKeyDown=useCallback((event:PinKey)=>{
    if(event.metaKey||event.ctrlKey||event.altKey)return;
    if(/^\d$/.test(event.key)){event.preventDefault();press(event.key);}
    else if(event.key==='Backspace'){event.preventDefault();backspace();}
    else if(event.key==='Delete'){event.preventDefault();clear();}
  },[press,backspace,clear]);
  return {value,length,complete:value.length===length,disabled,layout,press,backspace,clear,reset,onKeyDown};
}
