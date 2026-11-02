import {SITE_NAME} from '@/lib/seo/site';
import type { Metadata } from 'next';
import LandingPreview from '@/components/preview/LandingPreview';
export const metadata: Metadata = {title:`새로운 창작의 시작 | ${SITE_NAME}`,robots:{index:false,follow:false}};
export default function Page(){return <LandingPreview/>;}
