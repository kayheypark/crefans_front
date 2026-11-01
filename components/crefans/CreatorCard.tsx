'use client';
import {MarqueeText} from '@/components/ui/MarqueeText';

import {CreatorName} from './CreatorName';

import Link from 'next/link';
import type {Creator} from '@/types/crefans';
import {FollowButton} from './FollowButton';
import {Avatar} from './ServiceUI';
import s from './creator.module.css';
import p from './profile-photo.module.css';

export function CreatorCard({creator,href,following,onFollow}:{creator:Creator;href:string;following:boolean;onFollow:()=>void}){
  return <article className={s.creatorCard}>
    {/* Top shows the profile background like the profile page; without one, the same light gray with the white logo (2026-11-01). */}
    <Link href={href} className={`${s.portraitLink} ${creator.cover?'':p.emptyCover}`} aria-label={`${creator.name} 프로필`}>{creator.cover?<img src={creator.cover} alt=""/>:<img className={p.emptyLogo} src="/brand/crefans-logo-inverse.svg" alt="" aria-hidden="true" width={844} height={150}/>}</Link>
    <div className={s.creatorInfo}><Link href={href} className={s.creatorHead}><Avatar creator={creator} size={40}/><span><span className={s.creatorName}><CreatorName person={creator}/></span><span className={s.handle}><MarqueeText text={`@${creator.handle}`}/></span></span></Link><p>{creator.bio}</p>{creator.tags.length>0&&<div className={s.tags} aria-label="카테고리">{creator.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>}<FollowButton following={following} name={creator.name} onToggle={onFollow}/></div>
  </article>;
}
