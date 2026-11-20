'use client';
import {captureEvent,type LandingCtaPlace} from '@/lib/analytics/posthog';
// 2026-11-20 이탈 분석(랜딩 37개 중 24개가 체험으로 넘어가지 않음): PostHog masks click text, so the landing CTAs could not be told
// apart. Each fixed CTA reports its place only (no text, URL or ids); no-op without NEXT_PUBLIC_POSTHOG_KEY.
export function trackLandingCta(place:LandingCtaPlace){captureEvent('landing_cta_clicked',{place});}
