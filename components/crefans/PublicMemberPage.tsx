'use client';
import {useState} from 'react';
import type {Creator,ServiceViewModel} from '@/types/crefans';
import {ProfileHeader} from './ProfileHeader';
import {FollowButton} from './FollowButton';
import {Empty} from './ServiceUI';
import Icon from './Icon';
import {ProfilePostsPanel} from './CreatorPages';
import {getPostMedia} from '@/lib/crefans/post-media';
import s from './creator.module.css';
export default function PublicMemberPage({profile,model}:{profile:Creator&{cover?:string};model:ServiceViewModel}){
 const [tab,setTab]=useState('피드');
 // 2026-11-15: members who are not creators may post, so their profile lists their public posts like a creator profile (no plans or tips).
 const posts=model.data.posts.filter(post=>post.creatorId===profile.id),media=posts.filter(post=>getPostMedia(post).length>0);
 return <div className={s.profile}><ProfileHeader cover={profile.cover} person={profile} handle={profile.handle} bio={profile.bio} counts={[{label:'게시물',value:profile.postCount||0},{label:'팔로워',private:profile.followersPublic===false,value:profile.followers,href:`${model.basePath}/followers?profile=${encodeURIComponent(profile.id)}`},{label:'팔로잉',private:profile.followingPublic===false||profile.followingCount==null,href:`${model.basePath}/following?profile=${encodeURIComponent(profile.id)}`,value:profile.followingCount??<Icon name="lock" aria-label="팔로잉 비공개"/>}]} action={<FollowButton following={model.following.includes(profile.id)} name={profile.name} onToggle={()=>model.toggleFollow(profile.id)}/>}/><div className={s.tabs} aria-label="프로필 내용">{([['피드',posts.length],['미디어',media.length],['소개',null]] as [string,number|null][]).map(([name,count])=><button key={name} type="button" aria-pressed={tab===name} onClick={()=>setTab(name)}>{name}{count!==null&&<span className={s.tabCount}>{count}</span>}</button>)}</div>{tab==='소개'?<section className={s.about}>{profile.bio?<p>{profile.bio}</p>:<Empty title="아직 등록된 소개가 없습니다."/>}</section>:<ProfilePostsPanel tab={tab} posts={posts} model={model}/>}</div>;
}
