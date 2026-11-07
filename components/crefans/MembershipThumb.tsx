'use client';
import {useState,type CSSProperties} from 'react';
import {Avatar} from '@/components/ui/Avatar';
import s from './membership-thumb.module.css';

type Seller={name?:string;image?:string|null;position?:string};

/**
 * Membership identity used wherever a membership is listed (profile cards, my subscriptions, checkout).
 * 2026-11-07 user decision: a rounded-square membership photo with the creator (seller) avatar as a small badge.
 * Without a usable photo (none uploaded, or the file is no longer served) the creator avatar fills the square instead.
 */
export function MembershipThumb({image,name,creator,size=56}:{image?:string|null;name:string;creator?:Seller;size?:number}){
  const src=image?.trim()||'';
  const [failed,setFailed]=useState('');
  const photo=Boolean(src&&failed!==src);
  const badge=Math.max(18,Math.round(size*.42));
  return <span className={s.thumb} data-membership-thumb={photo?'photo':'creator'} style={{'--thumb-size':`${size}px`} as CSSProperties}>
    <span className={s.frame}>{photo
      ?<img src={src} alt={`${name} 멤버십`} onError={()=>setFailed(src)}/>
      :<span className={s.creatorFill}><Avatar src={creator?.image} name={creator?.name} position={creator?.position} size={size}/></span>}</span>
    {photo&&creator&&<span className={s.badge} data-membership-seller><Avatar src={creator.image} name={creator.name} position={creator.position} size={badge}/></span>}
  </span>;
}
