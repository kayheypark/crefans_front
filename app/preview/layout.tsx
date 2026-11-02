import type {Metadata} from 'next';
import {Suspense,type CSSProperties} from 'react';
import {designVariables} from '@/lib/design/tokens';
import s from './preview.module.css';
import {StudioProvider} from '@/components/preview/studio/StudioProvider';
import {PreviewProvider} from '@/components/preview/service/PreviewProvider';
export const metadata:Metadata={robots:{index:false,follow:false}};
export default function PreviewLayout({children}:{children:React.ReactNode}){return <div className={s.frame}><aside className={s.banner} style={designVariables as CSSProperties} aria-label="미리보기 안내">목업 페이지입니다</aside><Suspense fallback={<p role="status">화면을 준비하고 있어요.</p>}><PreviewProvider><StudioProvider>{children}</StudioProvider></PreviewProvider></Suspense></div>;}
