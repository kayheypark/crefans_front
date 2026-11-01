'use client';
import {LoadingSpinner} from './LoadingSpinner';
import {useDelayedLoading} from './useDelayedLoading';

/** For a route/Suspense fallback or a screen with nothing to keep yet: blank for the first second, then the shared spinner (loading rule). */
export function DelayedSpinner(){return useDelayedLoading(true)?<LoadingSpinner/>:null;}
/** For a load-more button: its label stays as is; only a request still pending after 1s adds the small spinner (2026-11-01). */
export function DelayedInlineSpinner({loading}:{loading:boolean}){return useDelayedLoading(loading)?<LoadingSpinner inline/>:null;}
