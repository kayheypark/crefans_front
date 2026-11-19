'use client';
import {useEffect} from 'react';
import {reportFunnelStep,type FunnelViewStep} from '@/lib/api/funnel';
import {reportAiResultShareVisit} from '@/lib/api/ai-result-share';
import {captureEvent} from '@/lib/analytics/posthog';
// 2026-11-18 funnel count: report the step once (per tab session) when the screen is actually shown.
// PostHog gets the same step as a custom event (no-op without NEXT_PUBLIC_POSTHOG_KEY); the server count is unchanged.
export function useFunnelStep(step:FunnelViewStep,shown=true){useEffect(()=>{if(shown){reportFunnelStep(step);captureEvent(step);if(step==='landing_view')void reportAiResultShareVisit();}},[step,shown]);}
