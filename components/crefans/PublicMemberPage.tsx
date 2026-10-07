'use client';
import {useState} from 'react';
import type {Creator,ServiceViewModel} from '@/types/crefans';
import {ProfileHeader} from './ProfileHeader';
import {FollowButton} from './FollowButton';
import {Empty} from './ServiceUI';
import Icon from './Icon';
import s from './creator.module.css';
export default function PublicMemberPage({profile,model}:{profile:Creator&{cover?:string};model:ServiceViewModel}){
 const [tab,setTab]=useState('피드');
 return <div className={s.profile}><ProfileHeader cover={profile.cover} person={profile} handle={profile.handle} bio={profile.bio} counts={[{label:'게시물',value:profile.postCount||0},{label:'팔로워',value:profile.followers},{label:'팔로잉',value:profile.followingCount??<Icon name="lock" aria-label="팔로잉 비공개"/>}]} action={<FollowButton following={model.following.includes(profile.id)} name={profile.name} onToggle={()=>model.toggleFollow(profile.id)}/>}/><div className={s.tabs}>{['피드','미디어','소개'].map(name=><button key={name} aria-pressed={tab===name} onClick={()=>setTab(name)}>{name}</button>)}</div>{tab==='소개'?<section className={s.about}><p>{profile.bio||'아직 등록된 소개가 없습니다.'}</p></section>:<Empty title={tab==='피드'?'아직 게시물이 없어요':'아직 미디어가 없어요'}/>}</div>;
}
