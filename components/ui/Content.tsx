"use client";
import { Badge, Button } from './Primitives';
import {Avatar} from './Avatar';
import s from './ui.module.css';

export type Creator = {name:string;category:string;image:string};
export function CreatorCard({creator,following,onFollow}:{creator:Creator;following:boolean;onFollow:()=>void}) {
  return <article className={s.creator}><img src={creator.image} alt={`${creator.name}의 예시 사진`}/><div><small>{creator.category}</small><h3>{creator.name}</h3><Button tone={following?'secondary':'brand'} onClick={onFollow} aria-pressed={following}>{following?'팔로잉':'팔로우'}</Button></div></article>;
}
export function PostCard({creator,caption,locked,onOpen}:{creator:Creator;caption:string;locked:boolean;onOpen:()=>void}) {
  return <article className={s.post}><header><Avatar src={creator.image} name={creator.name}/><div><strong>{creator.name}</strong><small>예시 콘텐츠 · 방금 전</small></div><Badge>{locked?'멤버 전용':'공개'}</Badge></header><div className={s.media}><img src={creator.image} alt={locked?'멤버 전용 콘텐츠 미리보기':caption} style={{filter:locked?'blur(14px)':undefined}}/>{locked && <div className={s.lock}><strong>조금 더 가까운 이야기</strong><p>멤버십으로 전용 콘텐츠를 만나보세요.</p><Button onClick={onOpen}>멤버십 보기</Button></div>}</div><p>{caption}</p></article>;
}
export function MembershipCard({name,price,benefits,selected,onSelect}:{name:string;price:number;benefits:string[];selected:boolean;onSelect:()=>void}) {
  return <article className={s.membership} data-selected={selected}><Badge>멤버십 예시</Badge><h3>{name}</h3><p className={s.price}>₩{price.toLocaleString('ko-KR')}<small> / 월</small></p><ul>{benefits.map(x=><li key={x}>{x}</li>)}</ul><Button tone={selected?'secondary':'brand'} onClick={onSelect} aria-pressed={selected}>{selected?'선택됨':'이 멤버십 선택'}</Button></article>;
}
export function TransactionItem({title,amount,status}:{title:string;amount:number;status:'pending'|'complete'}) {return <div className={s.transaction}><div><strong>{title}</strong><small>예시 내역</small></div><div><strong>₩{amount.toLocaleString('ko-KR')}</strong><Badge tone={status==='complete'?'success':'brand'}>{status==='complete'?'처리 완료':'접수됨'}</Badge></div></div>;}
