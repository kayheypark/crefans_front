'use client';
import {useState} from 'react';
import Link from 'next/link';
import {MarqueeText} from '@/components/ui/MarqueeText';
import {MediaVideo} from '@/components/ui/MediaVideo';
import {MediaTypeIcon} from '@/components/ui/MediaTypeIcon';
import {VideoProcessing} from '@/components/ui/VideoProcessing';
import {getPostMedia} from '@/lib/crefans/post-media';
import {getPostMembershipOffer} from '@/lib/crefans/membership-plans';
import type {Post,ServiceViewModel} from '@/types/crefans';
import {MediaSummary} from './MediaSummary';
import Icon from './Icon';
import s from './creator.module.css';

export function PostMediaTile({post,model}:{post:Post;model:Pick<ServiceViewModel,'data'|'basePath'|'canAccess'>}){
  const [failedUrl,setFailedUrl]=useState<string|null>(null);
  const media=getPostMedia(post),first=media[0];
  if(!first)return null;
  const accessible=post.canAccess??model.canAccess(post.creatorId,post.requiredRank,post.requiredPlanId);
  const planLabel=getPostMembershipOffer(model.data,post).label;
  const images=media.filter(item=>item.type==='image').length,videos=media.length-images;
  const label=`${post.title} · 사진 ${images}장, 동영상 ${videos}개${accessible?'':` · ${planLabel?`${planLabel} 멤버에게 공개`:'멤버십 전용 콘텐츠'}`}`;
  return <Link className={s.postTile} href={`${model.basePath}/post/${post.id}`} aria-label={label}>
    {!accessible?<div className={s.lockedTile}><Icon name="lock"/><MarqueeText text={planLabel||'멤버 전용'}/></div>:first.processing?<VideoProcessing variant="thumbnail" className={s.tilePreview} label={post.title}/>:failedUrl===first.url?<div className={s.tileFallback}><MediaTypeIcon type={first.type} size={26}/><span>미리보기 없음</span></div>:first.type==='video'?<MediaVideo className={s.tilePreview} src={first.url} firstFrame muted playsInline preload="metadata" controls={false} tabIndex={-1} aria-hidden="true" onError={()=>setFailedUrl(first.url)}/>:<img className={s.tilePreview} src={first.url} style={{objectPosition:post.position}} alt="" loading="lazy" onError={()=>setFailedUrl(first.url)}/>}
    {post.requiredRank>0&&accessible&&<span className={s.memberLabel}>멤버 전용</span>}
    <MediaSummary media={media} className={s.tileCounts}/>
  </Link>;
}
