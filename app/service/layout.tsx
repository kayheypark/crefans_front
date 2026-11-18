import {BrowserErrors} from '@/components/service/BrowserErrors';
import {BetaClosedNotice} from '@/components/service/BetaClosedNotice';
import {Suspense} from 'react';
import {DelayedSpinner} from '@/components/ui/DelayedSpinner';
import {ServiceProvider} from '@/components/service/ServiceProvider';
import {PostHogAnalytics} from '@/components/service/PostHogAnalytics';
export default function ServiceLayout({children}:{children:React.ReactNode}){return <Suspense fallback={<DelayedSpinner/>}><ServiceProvider><BrowserErrors/><PostHogAnalytics/><BetaClosedNotice/>{children}</ServiceProvider></Suspense>;}
