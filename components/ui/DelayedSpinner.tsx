'use client';
import {LoadingSpinner} from './LoadingSpinner';
import {useDelayedLoading} from './useDelayedLoading';

/** For a route/Suspense fallback or a screen with nothing to keep yet: blank for the first second, then the shared spinner (loading rule). */
export function DelayedSpinner(){return useDelayedLoading(true)?<LoadingSpinner/>:null;}
