'use client';

import Link from 'next/link';
import type {Creator} from '@/types/crefans';
import {FollowButton} from './FollowButton';
import {Avatar} from './ServiceUI';
import s from './creator.module.css';

export function CreatorCard({creator,href,following,onFollow}:{creator:Creator;href:string;following:boolean;onFollow:()=>void}){
  return <article className={s.creatorCard}>
    <Link href={href} className={s.portraitLink}>{creator.image&&<img src={creator.image} style={{objectPosition:creator.position}} alt={`${creator.name} 크리에이터`}/>}</Link>
    <div className={s.creatorInfo}><Link href={href} className={s.creatorHead}><Avatar creator={creator} size={40}/><span><span className={s.creatorName}>{creator.name}</span><span className={s.handle}>@{creator.handle}</span></span></Link><p>{creator.bio}</p>{creator.tags.length>0&&<div className={s.tags} aria-label="카테고리">{creator.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>}<FollowButton following={following} name={creator.name} onToggle={onFollow}/></div>
  </article>;
}
