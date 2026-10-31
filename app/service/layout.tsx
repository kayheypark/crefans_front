import {BrowserErrors} from '@/components/service/BrowserErrors';
import {BetaClosedNotice} from '@/components/service/BetaClosedNotice';
import {Suspense} from 'react';
import {ServiceProvider} from '@/components/service/ServiceProvider';
export default function ServiceLayout({children}:{children:React.ReactNode}){return <Suspense fallback={<p role="status">화면을 준비하고 있어요.</p>}><ServiceProvider><BrowserErrors/><BetaClosedNotice/>{children}</ServiceProvider></Suspense>;}
