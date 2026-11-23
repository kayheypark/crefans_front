'use client';
import {useEffect,useLayoutEffect} from 'react';
import {usePathname} from 'next/navigation';
import {xEvent} from '@/lib/analytics/x-pixel';
import {POSTHOG_KEY,loadPostHog,syncReplay} from '@/lib/analytics/posthog';

// 2026-11-18: PostHog for the /service app only (lib/analytics/posthog.ts). Without NEXT_PUBLIC_POSTHOG_KEY nothing loads.
// The layout effect stops replay in the same commit that renders a page outside the replay allowlist, before its DOM is recorded.
export function PostHogAnalytics(){
 const pathname=usePathname()||'';
 useEffect(()=>{if(POSTHOG_KEY)void loadPostHog();},[]);
 useLayoutEffect(()=>{if(POSTHOG_KEY)syncReplay(pathname);},[pathname]);
 // 2026-11-22: X pixel page views for client-side navigation too (the base code in app/layout.tsx only sees the first load).
 useEffect(()=>{xEvent('page_view');},[pathname]);
 return null;
}
