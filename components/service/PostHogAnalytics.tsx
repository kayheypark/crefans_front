'use client';
import {useEffect,useLayoutEffect} from 'react';
import {usePathname} from 'next/navigation';
import {xEvent} from '@/lib/analytics/x-pixel';
import {POSTHOG_KEY,loadPostHog,replayAllowed,replayBlocksPost,setMemberReplay,setReplayRestrictedMedia,syncReplay} from '@/lib/analytics/posthog';
import {useOptionalService} from './ServiceProvider';

// 2026-11-18: PostHog for the /service app only (lib/analytics/posthog.ts). Without NEXT_PUBLIC_POSTHOG_KEY nothing loads.
// The layout effect stops replay in the same commit that renders a page outside the replay allowlist, before its DOM is recorded.
export function PostHogAnalytics(){
 const pathname=usePathname()||'';
 const model=useOptionalService()?.model,member=POSTHOG_KEY!==''&&!!model?.signedIn&&replayAllowed(pathname);
 useEffect(()=>{if(POSTHOG_KEY)void loadPostHog();},[]);
 useLayoutEffect(()=>{if(POSTHOG_KEY)syncReplay(pathname);},[pathname]);
 // 2026-11-24 user decision (처리방침 generic.5 9조 ④): a signed-in member's replay shows photos/videos and typed text like a
 // consenting guest's, except other creators' membership-only media (restricted below) and sensitive inputs.
 useLayoutEffect(()=>{if(!member)return;setMemberReplay(true);return()=>setMemberReplay(false);},[member]);
 const posts=model?.data.posts,ownCreatorIds=model?.ownCreatorIds,viewerId=model?.viewerId;
 useEffect(()=>{if(!member||!posts)return;setReplayRestrictedMedia(posts.filter(post=>replayBlocksPost(post,{ownCreatorIds,viewerId})).flatMap(post=>[...(post.media||[]).map(item=>item.url),post.image].filter(Boolean)));},[member,posts,ownCreatorIds,viewerId]);
 // 2026-11-22: X pixel page views for client-side navigation too (the base code in app/layout.tsx only sees the first load).
 useEffect(()=>{xEvent('page_view');},[pathname]);
 return null;
}
