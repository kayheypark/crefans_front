'use client';
import {useState,type ReactNode} from 'react';
import s from './optional-image.module.css';

export function OptionalImage({src,alt,fallback=null,className=''}:{src?:string;alt:string;fallback?:ReactNode;className?:string}){
  const [failed,setFailed]=useState<string|null>(null);
  return !src||failed===src?<>{fallback}</>:<img className={`${s.image} ${className}`} src={src} alt={alt} onError={()=>setFailed(src)}/>;
}
