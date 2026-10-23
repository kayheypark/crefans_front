import type { Metadata } from 'next';
import LandingPreview from '@/components/preview/LandingPreview';
export const metadata: Metadata = {title:'crefans · 새로운 창작의 시작',robots:{index:false,follow:false}};
export default function Page(){return <LandingPreview/>;}
