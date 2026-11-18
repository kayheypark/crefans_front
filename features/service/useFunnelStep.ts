'use client';
import {useEffect} from 'react';
import {reportFunnelStep,type FunnelViewStep} from '@/lib/api/funnel';
// 2026-11-18 funnel count: report the step once (per tab session) when the screen is actually shown.
export function useFunnelStep(step:FunnelViewStep,shown=true){useEffect(()=>{if(shown)reportFunnelStep(step);},[step,shown]);}
