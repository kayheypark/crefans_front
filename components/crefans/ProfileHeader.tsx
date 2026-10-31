'use client';
import Link from 'next/link';
import Icon from './Icon';
import {MarqueeText} from '@/components/ui/MarqueeText';

import {CreatorName} from './CreatorName';
import {CategoryIcon} from './CategoryChip';
import {useState,type ReactNode} from 'react';
import {usePresence} from '@/components/ui/usePresence';
import {designTokens} from '@/lib/design/tokens';
import {MediaOverlay} from './MediaOverlay';
import {Avatar} from './ServiceUI';
import s from './creator.module.css';
import {CameraIcon} from './ProfilePhotoDialog';
import p from './profile-photo.module.css';

export type ProfileCount={label:string;value:ReactNode;href?:string;private?:boolean};
/** One header for creator profiles and the fan's own profile: cover with a corner action, overlapping avatar, name, handle, tagline, tags, counts. */
export function ProfileHeader({cover,coverPosition,person,handle,bio,tags=[],counts,action,onEditPhotos}:{cover?:string;coverPosition?:string;person:{name:string;image?:string;position?:string;isVerified?:boolean;isFoundingMember?:boolean};handle:string;bio:string;tags?:string[];counts:ProfileCount[];action?:ReactNode;onEditPhotos?:()=>void}){
  const [photo,setPhoto]=useState<{url:string;label:string}|null>(null),[open,setOpen]=useState(false);
  const [failedAvatar,setFailedAvatar]=useState(''),[failedCover,setFailedCover]=useState('');
  const present=usePresence(open,designTokens.motion.fast);
  const avatar=person.image?.trim(),background=cover?.trim();
  const hasAvatar=!!avatar&&failedAvatar!==avatar,hasCover=!!background&&failedCover!==background;
  const show=(url:string,label:string,trigger:HTMLButtonElement)=>{trigger.focus({preventScroll:true});setPhoto({url,label});setOpen(true);};
  return <>
    <div className={`${s.cover} ${hasCover?'':p.emptyCover}`}>{!hasCover&&<img className={p.emptyLogo} src="/brand/crefans-logo-inverse.svg" alt="" width={844} height={150}/>}{hasCover&&<button type="button" className={s.coverPhoto} aria-label={`${person.name} 배경사진 크게 보기`} onClick={event=>show(background,`${person.name} 배경사진`,event.currentTarget)}><img src={background} style={{objectPosition:coverPosition}} alt="" onError={()=>setFailedCover(background)}/></button>}{action&&<div className={s.coverAction}>{action}</div>}{onEditPhotos&&<button type="button" className={p.coverEdit} onClick={onEditPhotos}><CameraIcon/>배경 사진 변경</button>}</div>
    <div className={s.profileIntro}>
      <div className={s.identity}><div className={p.avatarWrap}><div className={s.overlapAvatar}>{hasAvatar?<button type="button" className={s.avatarPhoto} aria-label={`${person.name} 프로필 사진 크게 보기`} onClick={event=>show(avatar,`${person.name} 프로필 사진`,event.currentTarget)} onErrorCapture={()=>setFailedAvatar(avatar)}><Avatar creator={person} size={92}/></button>:<Avatar creator={{...person,image:undefined}} size={92}/>}</div>{onEditPhotos&&<button type="button" className={p.avatarEdit} aria-label="프로필 사진 변경" onClick={onEditPhotos}><CameraIcon size={16}/></button>}</div><div><h1><CreatorName person={person} explain/></h1><span className={s.handle}><MarqueeText text={`@${handle}`}/></span></div></div>
      <p className={s.bio}>{bio}</p>
      {tags.length>0&&<div className={s.tags} aria-label="크리에이터 카테고리">{tags.map(tag=><span key={tag}><CategoryIcon label={tag}/>{tag}</span>)}</div>}
      <dl className={s.counts}>{counts.map(count=><div key={count.label}><dt>{count.label}</dt><dd>{count.private?<span className={s.lockedCount} role="img" aria-label={`${count.label} 비공개`} title="비공개"><Icon name="lock" width="16" height="16"/></span>:count.href?<Link className={s.countLink} href={count.href} aria-label={`${count.label} 목록 보기`}>{count.value}</Link>:count.value}</dd></div>)}</dl>
    </div>
    {present&&photo&&<MediaOverlay media={[{type:'image',url:photo.url}]} title={photo.label} alt={photo.label} index={0} onIndexChange={()=>{}} open={open} onClose={()=>setOpen(false)}/>}
  </>;
}
