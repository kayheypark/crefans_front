'use client';
import type {ReactNode} from 'react';
import {Avatar} from './ServiceUI';
import s from './creator.module.css';

export type ProfileCount={label:string;value:ReactNode};
/** One header for creator profiles and the fan's own profile: cover with a corner action, overlapping avatar, name, handle, tagline, tags, counts. */
export function ProfileHeader({cover,coverPosition,person,handle,bio,tags=[],counts,action}:{cover?:string;coverPosition?:string;person:{name:string;image?:string;position?:string};handle:string;bio:string;tags?:string[];counts:ProfileCount[];action?:ReactNode}){
  return <>
    <div className={s.cover}>{cover&&<img src={cover} style={{objectPosition:coverPosition}} alt="" />}{action&&<div className={s.coverAction}>{action}</div>}</div>
    <div className={s.profileIntro}>
      <div className={s.identity}><div className={s.overlapAvatar}><Avatar creator={person} size={92}/></div><div><h1>{person.name}</h1><span className={s.handle}>@{handle}</span></div></div>
      <p className={s.bio}>{bio}</p>
      {tags.length>0&&<div className={s.tags}>{tags.map(tag=><span key={tag}>#{tag}</span>)}</div>}
      <dl className={s.counts}>{counts.map(count=><div key={count.label}><dt>{count.label}</dt><dd>{count.value}</dd></div>)}</dl>
    </div>
  </>;
}
