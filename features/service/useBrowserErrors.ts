'use client';
import {useEffect} from 'react';
import {reportBrowserError} from '@/lib/api/browser-errors';
export function useBrowserErrors(){useEffect(()=>{const error=(event:ErrorEvent)=>reportBrowserError(event.error),rejection=(event:PromiseRejectionEvent)=>reportBrowserError(event.reason);window.addEventListener('error',error);window.addEventListener('unhandledrejection',rejection);return()=>{window.removeEventListener('error',error);window.removeEventListener('unhandledrejection',rejection);};},[]);}

export function useReportBrowserError(error:Error){useEffect(()=>reportBrowserError(error),[error]);}
