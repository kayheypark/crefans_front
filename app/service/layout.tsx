import {BrowserErrors} from '@/components/service/BrowserErrors';
import {BetaClosedNotice} from '@/components/service/BetaClosedNotice';
import {Suspense} from 'react';
import {DelayedSpinner} from '@/components/ui/DelayedSpinner';
import {ServiceProvider} from '@/components/service/ServiceProvider';
import {PostHogAnalytics} from '@/components/service/PostHogAnalytics';
// 2026-11-18 replay fix: on Safari/WebKit the PostHog recorder (posthog-js 1.445.1, rrweb fork) leaves an untracked hidden iframe
// (iframe[__rrwebUntaintedPrototype]) at the end of <body>. A page root inserted directly before it on client navigation has an
// unresolvable next sibling and is dropped from the replay ("[rrweb] dropped N node(s) with unresolved parent at emit"), so the
// replay stays white. This wrapper is rendered by the server and stays mounted across /service navigations, so page roots are
// inserted inside it, never next to that iframe. display:contents keeps the layout identical (no box of its own).
export default function ServiceLayout({children}:{children:React.ReactNode}){return <div data-service-root="" style={{display:'contents'}}><Suspense fallback={<DelayedSpinner/>}><ServiceProvider><BrowserErrors/><PostHogAnalytics/><BetaClosedNotice/>{children}</ServiceProvider></Suspense></div>;}
