'use client';
import {useState} from 'react';
import type {CSSProperties} from 'react';
import s from './avatar.module.css';

type AvatarProps = {src?:string|null;name?:string;size?:number;position?:string};

/** A shared profile image: data changes reset a previous image-loading failure. */
export function Avatar({src,...props}:AvatarProps){
  const imageSrc=src?.trim()||undefined;
  return <AvatarContent key={imageSrc||''} {...props} src={imageSrc}/>;
}

function AvatarContent({src,name,size=40,position='center'}:AvatarProps){
  const [failed,setFailed]=useState(false);
  const hasImage=Boolean(src&&!failed);
  const label=name?`${name} 프로필 사진`:'프로필 사진';
  return <span className={s.avatar} data-avatar={hasImage?'image':'fallback'} role="img" aria-label={hasImage?label:`${label} 없음 · 기본 아바타`} style={{'--avatar-size':`${size}px`} as CSSProperties}>
    {hasImage?<img src={src!} alt="" aria-hidden="true" style={{objectPosition:position}} onError={()=>setFailed(true)}/>:<svg viewBox="0 0 40 40" fill="currentColor" aria-hidden="true" focusable="false"><circle cx="20" cy="14" r="6.5"/><path d="M7 34a13 13 0 0 1 26 0v6H7Z"/></svg>}
  </span>;
}
